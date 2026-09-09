import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { io } from 'socket.io-client';

import api from '../service/api';

import { UserContext } from './UserContext';

const ChatContext = createContext(null);

export const useChat = () => {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }

  return context;
};

export const ChatProvider = ({ children }) => {
  const { user } = useContext(UserContext);

  // =========================================================
  // STATE
  // =========================================================

  const [socket, setSocket] = useState(null);

  const [conversations, setConversations] = useState([]);

  const [currentConversation, setCurrentConversation] = useState(null);

  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(false);

  const [loadingConversations, setLoadingConversations] = useState(false);

  const [typingUsers, setTypingUsers] = useState({});

  const [unreadCount, setUnreadCount] = useState(0);

  const [onlineUsers, setOnlineUsers] = useState([]);

  const [error, setError] = useState(null);

  const [isConnected, setIsConnected] = useState(false);

  // =========================================================
  // REFS
  // =========================================================

  const socketRef = useRef(null);

  const currentConversationRef = useRef(null);

  const notificationSoundRef = useRef(null);

  const loadingConversationsRef = useRef(false);

  const messagesRequestRef = useRef(0);

  // =========================================================
  // MANTER CURRENT CONVERSATION ATUAL NO REF
  // =========================================================

  useEffect(() => {
    currentConversationRef.current = currentConversation;
  }, [currentConversation]);

  // =========================================================
  // HELPERS
  // =========================================================

  const getId = useCallback((value) => {
    if (!value) return null;

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'object') {
      if (value._id) {
        return value._id.toString();
      }

      if (value.id) {
        return value.id.toString();
      }

      if (value.toString) {
        return value.toString();
      }
    }

    return null;
  }, []);

  const isSameId = useCallback(
    (a, b) => {
      const idA = getId(a);
      const idB = getId(b);

      if (!idA || !idB) return false;

      return idA === idB;
    },
    [getId],
  );

  // =========================================================
  // SOM DE NOTIFICAÇÃO
  // =========================================================

  const playNotificationSound = useCallback(() => {
    try {
      if (!notificationSoundRef.current) {
        notificationSoundRef.current = new Audio('/notification.mp3');
      }

      notificationSoundRef.current.currentTime = 0;

      notificationSoundRef.current.play().catch(() => {});
    } catch {
      // Silencioso
    }
  }, []);

  // =========================================================
  // CARREGAR CONVERSAS
  // =========================================================

  const loadConversations = useCallback(async () => {
    if (!user?._id) return;

    // Evita várias requisições simultâneas
    if (loadingConversationsRef.current) {
      return;
    }

    try {
      loadingConversationsRef.current = true;

      setLoadingConversations(true);

      const response = await api.get('/api/chat/conversations');

      const conversationsData = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      setConversations(conversationsData);

      const total = conversationsData.reduce(
        (sum, conversation) => sum + Number(conversation?.unreadCount || 0),
        0,
      );

      setUnreadCount(total);

      // Entrar nas salas das conversas
      if (socketRef.current?.connected) {
        conversationsData.forEach((conversation) => {
          if (conversation?._id) {
            socketRef.current.emit('join_conversation', conversation._id);
          }
        });
      }

      return conversationsData;
    } catch (error) {
      console.error('❌ Erro ao carregar conversas:', error);

      setConversations([]);
      setUnreadCount(0);

      return [];
    } finally {
      loadingConversationsRef.current = false;

      setLoadingConversations(false);
    }
  }, [user?._id]);

  // =========================================================
  // CARREGAR MENSAGENS
  // =========================================================

  const loadMessages = useCallback(
    async (conversationId) => {
      if (!conversationId) {
        setError('ID da conversa não informado');
        return;
      }

      const requestId = ++messagesRequestRef.current;

      try {
        setLoading(true);

        setError(null);

        const response = await api.get(
          `/api/chat/conversations/${conversationId}/messages`,
        );

        // Se outra conversa foi carregada depois,
        // ignora essa resposta antiga.
        if (requestId !== messagesRequestRef.current) {
          return;
        }

        const messagesData = Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        // Sanitiza mensagens
        const validMessages = messagesData.filter(
          (message) =>
            message &&
            typeof message === 'object' &&
            message._id &&
            message.conversation,
        );

        setMessages(validMessages);

        // Marcar conversa como lida
        try {
          await api.post(`/api/chat/conversations/${conversationId}/read`);
        } catch (readError) {
          console.warn('⚠️ Erro ao marcar mensagens como lidas:', readError);
        }

        await loadConversations();
      } catch (error) {
        console.error('❌ Erro ao carregar mensagens:', error);

        if (requestId === messagesRequestRef.current) {
          setMessages([]);
          setError('Erro ao carregar mensagens');
        }
      } finally {
        if (requestId === messagesRequestRef.current) {
          setLoading(false);
        }
      }
    },
    [loadConversations],
  );

  // =========================================================
  // SOCKET.IO
  // =========================================================

  useEffect(() => {
    if (!user?._id) {
      return;
    }

    console.log('🔌 Inicializando Socket.IO para usuário:', user._id);

    const newSocket = io(
      import.meta.env.VITE_API_URL || 'http://localhost:3333',
      {
        auth: {
          userId: user._id,
        },

        transports: ['websocket'],

        reconnection: true,

        reconnectionAttempts: 5,

        reconnectionDelay: 1000,
      },
    );

    socketRef.current = newSocket;

    setSocket(newSocket);

    // =======================================================
    // CONNECT
    // =======================================================

    const handleConnect = () => {
      console.log('🔌 Conectado ao chat socket:', newSocket.id);

      setIsConnected(true);

      newSocket.emit('join_conversations');

      // Recarrega as conversas após conectar
      loadConversations();
    };

    // =======================================================
    // DISCONNECT
    // =======================================================

    const handleDisconnect = (reason) => {
      console.log('🔌 Desconectado do chat socket:', reason);

      setIsConnected(false);
    };

    // =======================================================
    // NOVA MENSAGEM
    // =======================================================

    const handleNewMessage = (message) => {
      // -----------------------------------------------------
      // VALIDAÇÃO
      // -----------------------------------------------------

      if (!message || typeof message !== 'object') {
        console.warn('⚠️ Mensagem inválida recebida via socket:', message);

        return;
      }

      if (!message._id) {
        console.warn('⚠️ Mensagem sem _id recebida via socket:', message);

        return;
      }

      if (!message.conversation) {
        console.warn(
          '⚠️ Mensagem sem conversation recebida via socket:',
          message,
        );

        return;
      }

      console.log('📩 Nova mensagem recebida via socket:', message);

      const conversationId = getId(message.conversation);

      if (!conversationId) {
        console.warn('⚠️ conversationId inválido na mensagem:', message);

        return;
      }

      const current = currentConversationRef.current;

      const currentConversationId = getId(current?._id);

      const isCurrentConversation = currentConversationId === conversationId;

      // -----------------------------------------------------
      // ADICIONAR MENSAGEM
      // -----------------------------------------------------

      if (isCurrentConversation) {
        setMessages((prev) => {
          // Evita duplicação
          const alreadyExists = prev.some((msg) =>
            isSameId(msg?._id, message._id),
          );

          if (alreadyExists) {
            return prev;
          }

          // Remove mensagem otimista correspondente
          const withoutOptimistic = prev.filter(
            (msg) =>
              !(
                msg?.isOptimistic &&
                msg?.content === message?.content &&
                isSameId(msg?.conversation, message?.conversation)
              ),
          );

          return [...withoutOptimistic, message];
        });

        // Mensagem da conversa atual:
        // marcar como lida automaticamente
        api
          .post(`/api/chat/conversations/${conversationId}/read`)
          .catch(() => {});
      }

      // -----------------------------------------------------
      // ATUALIZAR CONVERSAS
      // -----------------------------------------------------

      loadConversations();
    };

    // =======================================================
    // NOTIFICAÇÃO DE NOVA MENSAGEM
    // =======================================================

    const handleNewMessageNotification = (data) => {
      if (!data || typeof data !== 'object') {
        console.warn('⚠️ Notificação inválida recebida:', data);

        return;
      }

      const conversationId = getId(data.conversationId);

      if (!conversationId) {
        console.warn('⚠️ Notificação sem conversationId:', data);

        return;
      }

      const notificationMessage = data.message;

      console.log('🔔 Nova notificação de mensagem:', conversationId);

      const current = currentConversationRef.current;

      const currentConversationId = getId(current?._id);

      const isCurrentConversation = currentConversationId === conversationId;

      // -----------------------------------------------------
      // IMPORTANTE
      //
      // NÃO adicionamos a mensagem aqui.
      //
      // O evento "new_message" já faz isso.
      //
      // Aqui cuidamos apenas da notificação.
      // -----------------------------------------------------

      if (!isCurrentConversation) {
        playNotificationSound();
      }

      // Atualiza lista de conversas
      loadConversations();

      // Caso o backend envie uma notificação válida,
      // podemos atualizar a conversa sem duplicar mensagens.
      if (notificationMessage && typeof notificationMessage === 'object') {
        console.log(
          '🔔 Notificação associada à mensagem:',
          notificationMessage._id,
        );
      }
    };

    // =======================================================
    // DIGITANDO
    // =======================================================

    const handleUserTyping = ({ userId, isTyping }) => {
      if (!userId) return;

      setTypingUsers((prev) => ({
        ...prev,
        [getId(userId)]: Boolean(isTyping),
      }));
    };

    // =======================================================
    // USUÁRIO ONLINE
    // =======================================================

    const handleUserOnline = (userId) => {
      const id = getId(userId);

      if (!id) return;

      setOnlineUsers((prev) => {
        if (prev.includes(id)) {
          return prev;
        }

        return [...prev, id];
      });
    };

    // =======================================================
    // USUÁRIO OFFLINE
    // =======================================================

    const handleUserOffline = (userId) => {
      const id = getId(userId);

      if (!id) return;

      setOnlineUsers((prev) => prev.filter((existingId) => existingId !== id));
    };

    // =======================================================
    // REGISTRAR EVENTOS
    // =======================================================

    newSocket.on('connect', handleConnect);

    newSocket.on('disconnect', handleDisconnect);

    newSocket.on('new_message', handleNewMessage);

    newSocket.on('new_message_notification', handleNewMessageNotification);

    newSocket.on('user_typing', handleUserTyping);

    newSocket.on('user_online', handleUserOnline);

    newSocket.on('user_offline', handleUserOffline);

    // =======================================================
    // CLEANUP
    // =======================================================

    return () => {
      console.log('🧹 Limpando conexão Socket.IO');

      newSocket.off('connect', handleConnect);

      newSocket.off('disconnect', handleDisconnect);

      newSocket.off('new_message', handleNewMessage);

      newSocket.off('new_message_notification', handleNewMessageNotification);

      newSocket.off('user_typing', handleUserTyping);

      newSocket.off('user_online', handleUserOnline);

      newSocket.off('user_offline', handleUserOffline);

      newSocket.disconnect();

      if (socketRef.current === newSocket) {
        socketRef.current = null;
      }

      setSocket(null);

      setIsConnected(false);
    };
  }, [user?._id, getId, isSameId, loadConversations, playNotificationSound]);

  // =========================================================
  // ENVIAR MENSAGEM
  // =========================================================

  const sendMessage = useCallback(
    async (conversationId, content) => {
      if (!content?.trim() || !conversationId) {
        return;
      }

      const trimmedContent = content.trim();

      // -----------------------------------------------------
      // MENSAGEM OTIMISTA
      // -----------------------------------------------------

      const optimisticMessage = {
        _id: `temp_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,

        conversation: conversationId,

        content: trimmedContent,

        sender: {
          _id: user?._id,
          name: user?.name || 'Você',
          avatar: user?.avatar || null,
        },

        createdAt: new Date().toISOString(),

        status: 'sending',

        isOptimistic: true,
      };

      setMessages((prev) => [...prev, optimisticMessage]);

      try {
        console.log('📤 Enviando mensagem:', conversationId);

        const response = await api.post(
          `/api/chat/conversations/${conversationId}/messages`,
          {
            content: trimmedContent,
          },
        );

        const newMessage = response.data?.data;

        // ---------------------------------------------------
        // VALIDAR RESPOSTA DO BACKEND
        // ---------------------------------------------------

        if (!newMessage || typeof newMessage !== 'object' || !newMessage._id) {
          throw new Error('O servidor retornou uma mensagem inválida.');
        }

        console.log('✅ Mensagem criada:', newMessage);

        // ---------------------------------------------------
        // SUBSTITUIR MENSAGEM OTIMISTA
        // ---------------------------------------------------

        setMessages((prev) => {
          // Se o socket já adicionou a mensagem real,
          // remove a otimista e mantém a real.
          const hasRealMessage = prev.some(
            (msg) => !msg?.isOptimistic && isSameId(msg?._id, newMessage._id),
          );

          if (hasRealMessage) {
            return prev.filter((msg) => msg?._id !== optimisticMessage._id);
          }

          return prev.map((msg) =>
            msg?._id === optimisticMessage._id ? newMessage : msg,
          );
        });

        loadConversations();

        return newMessage;
      } catch (error) {
        console.error('❌ Erro ao enviar mensagem:', error);

        // Remove otimista
        setMessages((prev) =>
          prev.filter((msg) => msg?._id !== optimisticMessage._id),
        );

        setError(
          error?.response?.data?.message ||
            'Erro ao enviar mensagem. Tente novamente.',
        );

        throw error;
      }
    },
    [user?._id, user?.name, user?.avatar, isSameId, loadConversations],
  );

  // =========================================================
  // CRIAR CONVERSA
  // =========================================================

  const createConversation = useCallback(
    async (participants, type = 'direct', name = '') => {
      if (
        !participants ||
        !Array.isArray(participants) ||
        participants.length === 0
      ) {
        throw new Error('Selecione pelo menos um participante');
      }

      // Remove IDs duplicados
      const uniqueParticipants = [
        ...new Set(
          participants.map((participant) => getId(participant)).filter(Boolean),
        ),
      ];

      try {
        const response = await api.post('/api/chat/conversations', {
          participants: uniqueParticipants,
          type,
          name,
        });

        await loadConversations();

        return response.data?.data;
      } catch (error) {
        console.error('❌ Erro ao criar conversa:', error);

        throw error;
      }
    },
    [getId, loadConversations],
  );

  // =========================================================
  // CRIAR CANAL DOS CORRETORES
  // =========================================================

  const createBrokerChannel = useCallback(
    async (name) => {
      if (!name?.trim()) {
        throw new Error('Nome do canal é obrigatório');
      }

      try {
        const response = await api.post('/api/chat/broker-channel', {
          name: name.trim(),
        });

        await loadConversations();

        return response.data?.data;
      } catch (error) {
        console.error('❌ Erro ao criar canal:', error);

        throw error;
      }
    },
    [loadConversations],
  );

  // =========================================================
  // BUSCAR USUÁRIOS
  // =========================================================

  const searchUsers = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const response = await api.get('/api/chat/users/search', {
        params: {
          q: query.trim(),
        },
      });

      return Array.isArray(response.data?.data) ? response.data.data : [];
    } catch (error) {
      console.error('❌ Erro ao buscar usuários:', error);

      return [];
    }
  }, []);

  // =========================================================
  // SELECIONAR CONVERSA
  // =========================================================

  const selectConversation = useCallback(
    async (conversation) => {
      if (!conversation?._id) {
        return;
      }

      const conversationId = getId(conversation._id);

      if (!conversationId) {
        return;
      }

      // Atualiza imediatamente a conversa atual
      setCurrentConversation(conversation);

      currentConversationRef.current = conversation;

      // Invalida requisições anteriores
      messagesRequestRef.current += 1;

      // Limpa mensagens antigas enquanto carrega
      setMessages([]);

      // Entra na sala
      if (socketRef.current?.connected) {
        socketRef.current.emit('join_conversation', conversationId);
      }

      await loadMessages(conversationId);
    },
    [getId, loadMessages],
  );

  // =========================================================
  // DIGITANDO
  // =========================================================

  const sendTyping = useCallback((conversationId, isTyping) => {
    if (!socketRef.current?.connected || !conversationId) {
      return;
    }

    socketRef.current.emit('typing', {
      conversationId,
      isTyping,
    });
  }, []);

  // =========================================================
  // USUÁRIO ONLINE
  // =========================================================

  const isUserOnline = useCallback(
    (userId) => {
      const id = getId(userId);

      if (!id) return false;

      return onlineUsers.includes(id);
    },
    [getId, onlineUsers],
  );

  // =========================================================
  // NOME DA CONVERSA
  // =========================================================

  const getConversationName = useCallback(
    (conversation) => {
      if (!conversation) {
        return 'Conversa';
      }

      if (conversation.name) {
        return conversation.name;
      }

      if (conversation.type === 'direct') {
        const otherUser = conversation.participants?.find(
          (participant) => !isSameId(participant?._id, user?._id),
        );

        return otherUser?.name || 'Usuário';
      }

      return 'Conversa';
    },
    [isSameId, user?._id],
  );

  // =========================================================
  // AVATAR DA CONVERSA
  // =========================================================

  const getConversationAvatar = useCallback(
    (conversation) => {
      if (!conversation) {
        return null;
      }

      if (conversation.avatar) {
        return conversation.avatar;
      }

      if (conversation.type === 'direct') {
        const otherUser = conversation.participants?.find(
          (participant) => !isSameId(participant?._id, user?._id),
        );

        return otherUser?.avatar || null;
      }

      return null;
    },
    [isSameId, user?._id],
  );

  // =========================================================
  // OUTRO PARTICIPANTE
  // =========================================================

  const getOtherParticipant = useCallback(
    (conversation) => {
      if (!conversation || conversation.type !== 'direct') {
        return null;
      }

      return (
        conversation.participants?.find(
          (participant) => !isSameId(participant?._id, user?._id),
        ) || null
      );
    },
    [isSameId, user?._id],
  );

  // =========================================================
  // CARREGAR CONVERSAS QUANDO USUÁRIO ENTRA
  // =========================================================

  useEffect(() => {
    if (!user?._id) {
      return;
    }

    loadConversations();
  }, [user?._id, loadConversations]);

  // =========================================================
  // LIMPAR ESTADO AO DESLOGAR
  // =========================================================

  useEffect(() => {
    if (user) {
      return;
    }

    console.log('🧹 Limpando estado do ChatContext');

    setConversations([]);

    setCurrentConversation(null);

    currentConversationRef.current = null;

    setMessages([]);

    setUnreadCount(0);

    setOnlineUsers([]);

    setTypingUsers({});

    setError(null);

    setIsConnected(false);

    messagesRequestRef.current += 1;

    if (socketRef.current) {
      socketRef.current.disconnect();

      socketRef.current = null;
    }

    setSocket(null);
  }, [user]);

  // =========================================================
  // CONTEXT VALUE
  // =========================================================

  const value = {
    conversations,

    currentConversation,

    messages,

    loading,

    loadingConversations,

    typingUsers,

    unreadCount,

    onlineUsers,

    error,

    isConnected,

    socket,

    loadConversations,

    loadMessages,

    sendMessage,

    createConversation,

    createBrokerChannel,

    searchUsers,

    selectConversation,

    sendTyping,

    setCurrentConversation,

    isUserOnline,

    getConversationName,

    getConversationAvatar,

    getOtherParticipant,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatContext;

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

// =========================================================
// HELPERS DE SANITIZAÇÃO - GARANTEM RENDERIZAÇÃO SEGURA
// =========================================================

const safeString = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean')
    return String(value);

  if (typeof value === 'object') {
    if (typeof value.text === 'string') return value.text;
    if (typeof value.content === 'string') return value.content;
    if (typeof value.message === 'string') return value.message;
    return fallback;
  }

  return fallback;
};

const sanitizeMessage = (message) => {
  if (!message || typeof message !== 'object') return null;

  return {
    ...message,
    content: safeString(message.content, ''),
    lastMessage: safeString(message.lastMessage, ''),
  };
};

const sanitizeConversation = (conversation) => {
  if (!conversation || typeof conversation !== 'object') return null;

  let lastMessageText = '';
  let lastMessageObject = null;

  if (typeof conversation.lastMessage === 'string') {
    lastMessageText = conversation.lastMessage;
  } else if (
    conversation.lastMessage &&
    typeof conversation.lastMessage === 'object'
  ) {
    lastMessageText = safeString(conversation.lastMessage.content, '');
    lastMessageObject = conversation.lastMessage;
  }

  return {
    ...conversation,
    lastMessage: lastMessageText,
    lastMessageObject,
  };
};

// =========================================================
// NOTIFICAÇÕES DO NAVEGADOR (WEB PUSH API)
// =========================================================

const requestNotificationPermission = async () => {
  if (typeof window === 'undefined') return false;
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch {
    return false;
  }
};

const showBrowserNotification = ({ title, body, avatar, onClick }) => {
  if (typeof window === 'undefined') return;
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  // Não mostra se a aba estiver ativa
  if (document.visibilityState === 'visible') return;

  try {
    const notification = new Notification(title, {
      body,
      icon: avatar || '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'chat-message',
      requireInteraction: false,
    });

    notification.onclick = () => {
      window.focus();
      if (onClick) onClick();
      notification.close();
    };

    setTimeout(() => {
      try {
        notification.close();
      } catch {
        // Silencioso
      }
    }, 8000);
  } catch (err) {
    console.warn('Erro ao mostrar notificação do navegador:', err);
  }
};

// =========================================================
// CONTEXT
// =========================================================

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

  // ✅ NOVO: Estado de notificação global em tempo real
  const [lastNotification, setLastNotification] = useState(null);

  // =========================================================
  // REFS
  // =========================================================

  const socketRef = useRef(null);

  const currentConversationRef = useRef(null);

  const notificationSoundRef = useRef(null);

  const loadingConversationsRef = useRef(false);

  const messagesRequestRef = useRef(0);

  const processedNotificationIdsRef = useRef(new Map());

  const realtimeConversationVersionRef = useRef(0);

  // =========================================================
  // LIMPEZA AUTOMÁTICA DO CACHE DE NOTIFICAÇÕES
  // =========================================================

  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;

      processedNotificationIdsRef.current.forEach((timestamp, id) => {
        if (now - timestamp > fiveMinutes) {
          processedNotificationIdsRef.current.delete(id);
        }
      });
    }, 60000);

    return () => clearInterval(cleanupInterval);
  }, []);

  // =========================================================
  // MANTER CURRENT CONVERSATION ATUAL NO REF
  // =========================================================

  useEffect(() => {
    currentConversationRef.current = currentConversation;
  }, [currentConversation]);

  // =========================================================
  // HELPERS ESTABILIZADOS
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
    if (!user?._id) {
      return;
    }

    if (loadingConversationsRef.current) {
      return;
    }

    const requestRealtimeVersion = realtimeConversationVersionRef.current;

    try {
      loadingConversationsRef.current = true;

      setLoadingConversations(true);

      const response = await api.get('/api/chat/conversations');

      const conversationsData = Array.isArray(response.data?.data)
        ? response.data.data.map(sanitizeConversation).filter(Boolean)
        : [];

      if (requestRealtimeVersion !== realtimeConversationVersionRef.current) {
        console.log(
          '⚡ Ignorando resposta antiga de conversas após atualização do socket.',
        );

        return conversations;
      }

      setConversations(conversationsData);

      const total = conversationsData.reduce(
        (sum, conversation) => sum + Number(conversation?.unreadCount || 0),
        0,
      );

      setUnreadCount(total);

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

      if (requestRealtimeVersion === realtimeConversationVersionRef.current) {
        setConversations([]);

        setUnreadCount(0);
      }

      return [];
    } finally {
      loadingConversationsRef.current = false;

      setLoadingConversations(false);
    }
  }, [user?._id]);

  // =========================================================
  // ATUALIZAR CONVERSA A PARTIR DE UMA MENSAGEM
  // =========================================================

  const updateConversationFromMessage = useCallback(
    (message, conversationId, shouldIncrementUnread = false) => {
      if (!message || !conversationId) return;

      // ✅ Sanitiza a mensagem
      const sanitized = sanitizeMessage(message);
      if (!sanitized) return;

      realtimeConversationVersionRef.current += 1;

      setConversations((prev) => {
        const index = prev.findIndex((conversation) =>
          isSameId(conversation?._id, conversationId),
        );

        if (index === -1) return prev;

        const conversation = prev[index];
        const currentUnread = Number(conversation?.unreadCount || 0);

        const updatedConversation = {
          ...conversation,
          // ✅ Salva a mensagem completa como objeto
          lastMessageObject: sanitized,
          // ✅ E também como string para renderização
          lastMessage: safeString(sanitized.content, ''),
          lastMessageAt: sanitized.createdAt || new Date().toISOString(),
          updatedAt:
            sanitized.createdAt ||
            conversation?.updatedAt ||
            new Date().toISOString(),
          unreadCount: shouldIncrementUnread
            ? currentUnread + 1
            : currentUnread,
        };

        const newList = [...prev];
        newList[index] = updatedConversation;
        newList.splice(index, 1);
        newList.unshift(updatedConversation);

        return newList;
      });

      if (shouldIncrementUnread) {
        setUnreadCount((prev) => prev + 1);
      }
    },
    [isSameId],
  );

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

        if (requestId !== messagesRequestRef.current) {
          return;
        }

        const messagesData = Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        // ✅ CORRIGIDO: Sanitiza mensagens para garantir que content seja string
        const validMessages = messagesData
          .filter(
            (message) =>
              message &&
              typeof message === 'object' &&
              message._id &&
              message.conversation,
          )
          .map(sanitizeMessage)
          .filter(Boolean);

        setMessages(validMessages);

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
  // HANDLER UNIFICADO DE MENSAGENS RECEBIDAS - CORRIGIDO
  // =========================================================

  const handleMessageReceived = useCallback(
    (message) => {
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

      const messageId = getId(message._id);

      const alreadyProcessed =
        messageId && processedNotificationIdsRef.current.has(messageId);

      if (alreadyProcessed) {
        console.log('🔁 Mensagem ignorada (já processada):', messageId);
        return;
      }

      const sanitizedMessage = sanitizeMessage(message);

      if (!sanitizedMessage) {
        console.warn('⚠️ Mensagem inválida:', message);
        return;
      }

      const current = currentConversationRef.current;
      const currentConversationId = getId(current?._id);
      const isCurrentConversation = currentConversationId === conversationId;
      const isOwnMessage = isSameId(sanitizedMessage?.sender?._id, user?._id);

      // -----------------------------------------------------
      // ADICIONAR MENSAGEM AO HISTÓRICO
      // -----------------------------------------------------

      if (isCurrentConversation) {
        setMessages((prev) => {
          // Evita duplicação
          const alreadyExists = prev.some((msg) =>
            isSameId(msg?._id, sanitizedMessage._id),
          );
          if (alreadyExists) {
            return prev;
          }

          // Remove mensagem otimista correspondente
          const withoutOptimistic = prev.filter(
            (msg) =>
              !(
                msg?.isOptimistic &&
                msg?.content === sanitizedMessage?.content &&
                isSameId(msg?.conversation, sanitizedMessage?.conversation)
              ),
          );

          return [...withoutOptimistic, sanitizedMessage];
        });

        // Mensagem da conversa atual: marcar como lida automaticamente
        api
          .post(`/api/chat/conversations/${conversationId}/read`)
          .catch(() => {});
      }

      // -----------------------------------------------------
      // ATUALIZAR CONVERSA E BADGE
      // -----------------------------------------------------

      const shouldIncrementUnread = !isCurrentConversation && !isOwnMessage;

      updateConversationFromMessage(
        sanitizedMessage,
        conversationId,
        shouldIncrementUnread,
      );

      // -----------------------------------------------------
      // DEDUPLICAÇÃO
      // -----------------------------------------------------

      if (messageId) {
        processedNotificationIdsRef.current.set(messageId, Date.now());
      }

      // -----------------------------------------------------
      // ✅ NOTIFICAÇÕES EM TEMPO REAL
      // -----------------------------------------------------

      if (shouldIncrementUnread) {
        // 1. Dispara notificação global (toast)
        setLastNotification({
          id: `${messageId}_${Date.now()}`,
          messageId,
          conversationId,
          message: sanitizedMessage,
          senderName: sanitizedMessage.sender?.name || 'Nova mensagem',
          senderAvatar: sanitizedMessage.sender?.avatar || null,
          preview:
            safeString(sanitizedMessage.content).substring(0, 80) ||
            'Nova mensagem recebida',
          timestamp: Date.now(),
        });

        // 2. Toca som
        playNotificationSound();

        // 3. Notificação do navegador (se aba em background)
        showBrowserNotification({
          title: `💬 ${sanitizedMessage.sender?.name || 'Nova mensagem'}`,
          body:
            safeString(sanitizedMessage.content).substring(0, 100) ||
            'Nova mensagem recebida',
          avatar: sanitizedMessage.sender?.avatar,
        });
      }
    },
    [
      getId,
      isSameId,
      user?._id,
      updateConversationFromMessage,
      playNotificationSound,
    ],
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
          // ✅ CORRIGIDO: Força string para evitar problemas com ObjectId
          userId: String(user._id),
        },

        transports: ['websocket', 'polling'],

        reconnection: true,

        reconnectionAttempts: 10,

        reconnectionDelay: 1000,

        reconnectionDelayMax: 5000,

        timeout: 20000,

        forceNew: true,
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

      loadConversations();

      // ✅ Pede permissão de notificação do navegador
      requestNotificationPermission();
    };

    // =======================================================
    // DISCONNECT
    // =======================================================

    const handleDisconnect = (reason) => {
      console.log('🔌 Desconectado do chat socket:', reason);

      setIsConnected(false);
    };

    // =======================================================
    // EVENTOS DE MENSAGEM - UNIFICADO
    // =======================================================

    newSocket.on('new_message', handleMessageReceived);

    // =======================================================
    // DIGITANDO
    // =======================================================

    const handleUserTyping = ({ userId, isTyping }) => {
      if (!userId) {
        return;
      }

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

      if (!id) {
        return;
      }

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

      if (!id) {
        return;
      }

      setOnlineUsers((prev) => prev.filter((existingId) => existingId !== id));
    };

    // =======================================================
    // REGISTRAR EVENTOS
    // =======================================================

    newSocket.on('connect', handleConnect);

    newSocket.on('disconnect', handleDisconnect);

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

      newSocket.off('new_message', handleMessageReceived);

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
  }, [user?._id, getId, handleMessageReceived, loadConversations]);

  // =========================================================
  // ✅ BADGE NO TÍTULO DA ABA
  // =========================================================

  useEffect(() => {
    const baseTitle = 'Leads Na Mão';

    if (unreadCount > 0) {
      document.title = `(${unreadCount > 99 ? '99+' : unreadCount}) ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }
  }, [unreadCount]);

  // =========================================================
  // ENVIAR MENSAGEM - CORRIGIDO
  // =========================================================

  const sendMessage = useCallback(
    async (conversationId, content) => {
      if (!content?.trim() || !conversationId) {
        return;
      }

      const trimmedContent = content.trim();

      // ✅ CORRIGIDO: Mensagem otimista com content como string
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

        if (!newMessage || typeof newMessage !== 'object' || !newMessage._id) {
          throw new Error('O servidor retornou uma mensagem inválida.');
        }

        console.log('✅ Mensagem criada:', newMessage);

        // ✅ CORRIGIDO: Sanitizar a mensagem do backend
        const sanitizedMessage = sanitizeMessage(newMessage);

        if (!sanitizedMessage) {
          throw new Error('Mensagem inválida retornada pelo servidor.');
        }

        setMessages((prev) => {
          const hasRealMessage = prev.some(
            (msg) =>
              !msg?.isOptimistic && isSameId(msg?._id, sanitizedMessage._id),
          );

          if (hasRealMessage) {
            return prev.filter((msg) => msg?._id !== optimisticMessage._id);
          }

          return prev.map((msg) =>
            msg?._id === optimisticMessage._id ? sanitizedMessage : msg,
          );
        });

        updateConversationFromMessage(sanitizedMessage, conversationId, false);

        return sanitizedMessage;
      } catch (error) {
        console.error('❌ Erro ao enviar mensagem:', error);

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
    [
      user?._id,
      user?.name,
      user?.avatar,
      isSameId,
      updateConversationFromMessage,
    ],
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

      setCurrentConversation(conversation);

      currentConversationRef.current = conversation;

      messagesRequestRef.current += 1;

      setMessages([]);

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

      if (!id) {
        return false;
      }

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

    setLastNotification(null);

    messagesRequestRef.current += 1;

    realtimeConversationVersionRef.current = 0;

    processedNotificationIdsRef.current.clear();

    if (socketRef.current) {
      socketRef.current.disconnect();

      socketRef.current = null;
    }

    setSocket(null);

    document.title = 'Leads Na Mão';
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

    // ✅ NOVO: Notificações
    lastNotification,

    clearNotification: () => setLastNotification(null),

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

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
// HELPERS DE SANITIZAÇÃO
// =========================================================

const safeString = (value, fallback = '') => {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (typeof value === 'object') {
    if (typeof value.text === 'string') {
      return value.text;
    }

    if (typeof value.content === 'string') {
      return value.content;
    }

    if (typeof value.message === 'string') {
      return value.message;
    }

    return fallback;
  }

  return fallback;
};

const getObjectId = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object') {
    if (value._id) {
      return String(value._id);
    }

    if (value.id) {
      return String(value.id);
    }

    if (value.$oid) {
      return String(value.$oid);
    }
  }

  return null;
};

const sanitizeMessage = (message) => {
  if (!message || typeof message !== 'object') {
    return null;
  }

  return {
    ...message,

    _id: getObjectId(message._id),

    conversation:
      typeof message.conversation === 'object'
        ? message.conversation
        : message.conversation
          ? String(message.conversation)
          : null,

    content: safeString(message.content, ''),

    lastMessage: safeString(message.lastMessage, ''),
  };
};

const sanitizeConversation = (conversation) => {
  if (!conversation || typeof conversation !== 'object') {
    return null;
  }

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

    _id: getObjectId(conversation._id),

    lastMessage: lastMessageText,

    lastMessageObject,
  };
};

// =========================================================
// NOTIFICAÇÕES DO NAVEGADOR
// =========================================================

const requestNotificationPermission = async () => {
  if (typeof window === 'undefined') {
    return false;
  }

  if (!('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();

    return permission === 'granted';
  } catch {
    return false;
  }
};

const showBrowserNotification = ({ title, body, avatar, onClick }) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!('Notification' in window)) {
    return;
  }

  if (Notification.permission !== 'granted') {
    return;
  }

  if (document.visibilityState === 'visible') {
    return;
  }

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

      if (onClick) {
        onClick();
      }

      notification.close();
    };

    setTimeout(() => {
      try {
        notification.close();
      } catch {
        // Silencioso
      }
    }, 8000);
  } catch (error) {
    console.warn('Erro ao mostrar notificação do navegador:', error);
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

// =========================================================
// PROVIDER
// =========================================================

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
  // LIMPEZA CACHE NOTIFICAÇÕES
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
  // CURRENT CONVERSATION REF
  // =========================================================

  useEffect(() => {
    currentConversationRef.current = currentConversation;
  }, [currentConversation]);

  // =========================================================
  // HELPERS
  // =========================================================

  const getId = useCallback((value) => {
    return getObjectId(value);
  }, []);

  const isSameId = useCallback(
    (a, b) => {
      const idA = getId(a);
      const idB = getId(b);

      if (!idA || !idB) {
        return false;
      }

      return idA === idB;
    },
    [getId],
  );

  // =========================================================
  // SOM
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
      return [];
    }

    if (loadingConversationsRef.current) {
      return [];
    }

    const requestRealtimeVersion = realtimeConversationVersionRef.current;

    try {
      loadingConversationsRef.current = true;

      setLoadingConversations(true);

      const response = await api.get('/api/chat/conversations');

      const rawData = response.data?.data;

      const conversationsData = Array.isArray(rawData)
        ? rawData.map(sanitizeConversation).filter(Boolean)
        : Array.isArray(rawData?.conversations)
          ? rawData.conversations.map(sanitizeConversation).filter(Boolean)
          : [];

      console.log('💬 Conversas carregadas:', conversationsData.length);

      if (requestRealtimeVersion !== realtimeConversationVersionRef.current) {
        console.log(
          '⚡ Ignorando resposta antiga de conversas após atualização do socket.',
        );

        return [];
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
            console.log(
              '📡 FRONTEND entrando na room:',
              conversation._id,
              conversation.channel,
            );

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
  // ATUALIZAR CONVERSA
  // =========================================================

  const updateConversationFromMessage = useCallback(
    (message, conversationId, shouldIncrementUnread = false) => {
      if (!message || !conversationId) {
        return;
      }

      const sanitized = sanitizeMessage(message);

      if (!sanitized) {
        return;
      }

      realtimeConversationVersionRef.current += 1;

      setConversations((prev) => {
        const index = prev.findIndex((conversation) =>
          isSameId(conversation?._id, conversationId),
        );

        if (index === -1) {
          console.log(
            '⚠️ Conversa não encontrada na lista para atualização:',
            conversationId,
          );

          return prev;
        }

        const conversation = prev[index];

        const currentUnread = Number(conversation?.unreadCount || 0);

        const updatedConversation = {
          ...conversation,

          lastMessageObject: sanitized,

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

        console.log('📥 Carregando mensagens:', conversationId);

        const response = await api.get(
          `/api/chat/conversations/${conversationId}/messages`,
        );

        console.log('📥 Resposta mensagens:', response.data);

        if (requestId !== messagesRequestRef.current) {
          return;
        }

        const rawData = response.data?.data;

        let messagesData = [];

        if (Array.isArray(rawData)) {
          messagesData = rawData;
        } else if (Array.isArray(rawData?.messages)) {
          messagesData = rawData.messages;
        } else if (Array.isArray(response.data?.messages)) {
          messagesData = response.data.messages;
        }

        const validMessages = messagesData
          .filter(
            (message) => message && typeof message === 'object' && message._id,
          )
          .map((message) => {
            const sanitized = sanitizeMessage(message);

            if (sanitized && !sanitized.conversation) {
              sanitized.conversation = conversationId;
            }

            return sanitized;
          })
          .filter(Boolean);

        console.log(
          `📥 ${validMessages.length} mensagens carregadas para ${conversationId}`,
        );

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

          setError(
            error?.response?.data?.message || 'Erro ao carregar mensagens',
          );
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
  // MENSAGEM RECEBIDA VIA SOCKET
  // =========================================================

  const handleMessageReceived = useCallback(
    (message) => {
      if (!message || typeof message !== 'object') {
        console.warn('⚠️ Mensagem inválida via socket:', message);

        return;
      }

      if (!message._id) {
        console.warn('⚠️ Mensagem sem _id via socket:', message);

        return;
      }

      console.log('📩 Nova mensagem recebida via socket:', message);

      const conversationId =
        getId(message.conversation) || getId(message.conversationId);

      if (!conversationId) {
        console.warn('⚠️ conversationId não encontrado:', message);

        return;
      }

      const messageId = getId(message._id);

      const alreadyProcessed =
        messageId && processedNotificationIdsRef.current.has(messageId);

      if (alreadyProcessed) {
        console.log('🔁 Mensagem já processada:', messageId);

        return;
      }

      const sanitizedMessage = sanitizeMessage(message);

      if (!sanitizedMessage) {
        return;
      }

      if (!sanitizedMessage.conversation) {
        sanitizedMessage.conversation = conversationId;
      }

      const current = currentConversationRef.current;

      const currentConversationId = getId(current?._id);

      const isCurrentConversation = currentConversationId === conversationId;

      const isOwnMessage = isSameId(sanitizedMessage?.sender?._id, user?._id);

      console.log('📊 Socket message analysis:', {
        messageId,
        conversationId,
        currentConversationId,
        isCurrentConversation,
        isOwnMessage,
        channel:
          current?.channel || sanitizedMessage?.conversation?.channel || null,
        direction: sanitizedMessage?.direction,
        senderType: sanitizedMessage?.senderType,
      });

      // -----------------------------------------------------
      // ADICIONAR AO HISTÓRICO
      // -----------------------------------------------------

      if (isCurrentConversation) {
        setMessages((prev) => {
          const alreadyExists = prev.some((msg) =>
            isSameId(msg?._id, sanitizedMessage._id),
          );

          if (alreadyExists) {
            console.log(
              '🔁 Mensagem já existe no histórico:',
              sanitizedMessage._id,
            );

            return prev;
          }

          const withoutOptimistic = prev.filter(
            (msg) =>
              !(
                msg?.isOptimistic && msg?.content === sanitizedMessage?.content
              ),
          );

          console.log(
            '➕ Adicionando mensagem em tempo real ao histórico:',
            sanitizedMessage._id,
          );

          return [...withoutOptimistic, sanitizedMessage];
        });

        api
          .post(`/api/chat/conversations/${conversationId}/read`)
          .catch(() => {});
      }

      // -----------------------------------------------------
      // CONVERSA / UNREAD
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
      // NOTIFICAÇÃO
      // -----------------------------------------------------

      if (shouldIncrementUnread) {
        setLastNotification({
          id: `${messageId}_${Date.now()}`,

          messageId,

          conversationId,

          message: sanitizedMessage,

          senderName:
            sanitizedMessage.sender?.name ||
            sanitizedMessage.whatsappContact?.name ||
            'Nova mensagem',

          senderAvatar: sanitizedMessage.sender?.avatar || null,

          preview:
            safeString(sanitizedMessage.content).substring(0, 80) ||
            'Nova mensagem recebida',

          timestamp: Date.now(),
        });

        playNotificationSound();

        showBrowserNotification({
          title: `💬 ${
            sanitizedMessage.sender?.name ||
            sanitizedMessage.whatsappContact?.name ||
            'Nova mensagem'
          }`,

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
  // NOTIFICAÇÃO DE NOVA MENSAGEM VIA SOCKET
  // =========================================================

  const handleMessageNotification = useCallback(
    (payload) => {
      console.log('🔔 Nova mensagem recebida via notificação socket:', payload);

      if (!payload) {
        return;
      }

      const message = payload.message;

      if (!message || typeof message !== 'object') {
        console.warn('⚠️ Payload de notificação sem mensagem:', payload);

        return;
      }

      const conversationId =
        getId(payload.conversationId) ||
        getId(message.conversationId) ||
        getId(message.conversation);

      if (!conversationId) {
        console.warn(
          '⚠️ ConversationId não encontrado na notificação:',
          payload,
        );

        return;
      }

      handleMessageReceived({
        ...message,

        conversation: message.conversation || conversationId,

        conversationId,
      });
    },
    [getId, handleMessageReceived],
  );

  // =========================================================
  // SOCKET.IO
  // =========================================================

  useEffect(() => {
    if (!user?._id) {
      return;
    }

    console.log('🔌 Inicializando Socket.IO para usuário:', user._id);

    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333';

    console.log('🌐 Socket.IO URL:', socketUrl);

    const newSocket = io(socketUrl, {
      auth: {
        userId: String(user._id),
      },

      transports: ['websocket', 'polling'],

      reconnection: true,

      reconnectionAttempts: 10,

      reconnectionDelay: 1000,

      reconnectionDelayMax: 5000,

      timeout: 20000,

      forceNew: true,
    });

    socketRef.current = newSocket;

    setSocket(newSocket);

    // =======================================================
    // CONNECT
    // =======================================================

    const handleConnect = () => {
      console.log('🔌 Conectado ao chat socket:', newSocket.id);

      console.log('👤 Socket conectado para usuário:', user._id);

      setIsConnected(true);

      console.log('📡 Solicitando entrada nas conversas...');

      newSocket.emit('join_conversations');

      loadConversations();

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
    // CONNECT ERROR
    // =======================================================

    const handleConnectError = (error) => {
      console.error('❌ Erro de conexão Socket.IO:', error);

      setIsConnected(false);
    };

    // =======================================================
    // NOVA MENSAGEM
    // =======================================================

    newSocket.on('new_message', (message) => {
      console.log('📨 NEW_MESSAGE RECEBIDO PELO FRONTEND:', message);

      handleMessageReceived(message);
    });

    // =======================================================
    // NOTIFICAÇÃO DIRECIONADA AO USUÁRIO
    // =======================================================

    newSocket.on('new_message_notification', (payload) => {
      console.log(
        '🔔 NEW_MESSAGE_NOTIFICATION RECEBIDO PELO FRONTEND:',
        payload,
      );

      handleMessageNotification(payload);
    });

    // =======================================================
    // COMPATIBILIDADE COM SOCKET LEGADO
    // =======================================================

    newSocket.on('newMessage', handleMessageReceived);

    // =======================================================
    // DIGITANDO
    // =======================================================

    const handleUserTyping = ({ userId, isTyping }) => {
      if (!userId) {
        return;
      }

      const id = getId(userId);

      if (!id) {
        return;
      }

      setTypingUsers((prev) => ({
        ...prev,

        [id]: Boolean(isTyping),
      }));
    };

    // =======================================================
    // ONLINE
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
    // OFFLINE
    // =======================================================

    const handleUserOffline = (userId) => {
      const id = getId(userId);

      if (!id) {
        return;
      }

      setOnlineUsers((prev) => prev.filter((existingId) => existingId !== id));
    };

    // =======================================================
    // EVENTOS
    // =======================================================

    newSocket.on('connect', handleConnect);

    newSocket.on('disconnect', handleDisconnect);

    newSocket.on('connect_error', handleConnectError);

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

      newSocket.off('connect_error', handleConnectError);

      newSocket.off('new_message');

      newSocket.off('new_message_notification');

      newSocket.off('newMessage', handleMessageReceived);

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
  }, [
    user?._id,
    getId,
    handleMessageReceived,
    handleMessageNotification,
    loadConversations,
  ]);

  // =========================================================
  // TÍTULO DA ABA
  // =========================================================

  useEffect(() => {
    const baseTitle = 'Leads Na Mão';

    if (unreadCount > 0) {
      document.title = `(${
        unreadCount > 99 ? '99+' : unreadCount
      }) ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }
  }, [unreadCount]);

  // =========================================================
  // ENVIAR MENSAGEM
  // =========================================================

  const sendMessage = useCallback(
    async (conversationId, content) => {
      if (!content?.trim() || !conversationId) {
        return;
      }

      const trimmedContent = content.trim();

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
  // CANAL DOS CORRETORES
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

      console.log(
        '💬 Selecionando conversa:',
        conversationId,
        conversation.channel,
      );

      setCurrentConversation(conversation);

      currentConversationRef.current = conversation;

      messagesRequestRef.current += 1;

      setMessages([]);

      if (socketRef.current?.connected) {
        console.log('📡 Entrando na room:', conversationId);

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
  // ONLINE
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
  // NOME
  // =========================================================

  const getConversationName = useCallback(
    (conversation) => {
      if (!conversation) {
        return 'Conversa';
      }

      if (conversation.name) {
        return conversation.name;
      }

      if (conversation.channel === 'whatsapp') {
        return (
          conversation.whatsappContact?.name ||
          conversation.lead?.name ||
          'WhatsApp'
        );
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
  // AVATAR
  // =========================================================

  const getConversationAvatar = useCallback(
    (conversation) => {
      if (!conversation) {
        return null;
      }

      if (conversation.avatar) {
        return conversation.avatar;
      }

      if (conversation.channel === 'whatsapp') {
        return conversation.whatsappContact?.avatar || null;
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
  // PARTICIPANTES
  // =========================================================

  const getConversationParticipants = useCallback((conversation) => {
    if (!conversation?.participants) {
      return [];
    }

    if (!Array.isArray(conversation.participants)) {
      return [];
    }

    return conversation.participants.filter(Boolean);
  }, []);

  // =========================================================
  // ONLINE PARTICIPANTES
  // =========================================================

  const getOnlineParticipants = useCallback(
    (conversation) => {
      const participants = getConversationParticipants(conversation);

      return participants.filter((participant) =>
        isUserOnline(participant?._id),
      );
    },
    [getConversationParticipants, isUserOnline],
  );

  // =========================================================
  // CONTAGEM
  // =========================================================

  const getParticipantCount = useCallback(
    (conversation) => {
      return getConversationParticipants(conversation).length;
    },
    [getConversationParticipants],
  );

  const getOnlineParticipantCount = useCallback(
    (conversation) => {
      return getOnlineParticipants(conversation).length;
    },
    [getOnlineParticipants],
  );

  // =========================================================
  // SUBTÍTULO
  // =========================================================

  const getConversationSubtitle = useCallback(
    (conversation) => {
      if (!conversation) {
        return '';
      }

      if (conversation.channel === 'whatsapp') {
        return (
          conversation.whatsappContact?.phone ||
          conversation.lead?.phone ||
          'WhatsApp'
        );
      }

      if (conversation.type === 'direct') {
        const participant = getOtherParticipant(conversation);

        if (!participant) {
          return '';
        }

        return isUserOnline(participant._id) ? 'Online' : 'Offline';
      }

      const participantCount = getParticipantCount(conversation);

      const onlineCount = getOnlineParticipantCount(conversation);

      if (participantCount === 0) {
        return 'Nenhum participante';
      }

      if (onlineCount > 0) {
        return `${participantCount} ${
          participantCount === 1 ? 'participante' : 'participantes'
        } · ${onlineCount} online`;
      }

      return `${participantCount} ${
        participantCount === 1 ? 'participante' : 'participantes'
      }`;
    },
    [
      getOtherParticipant,
      getParticipantCount,
      getOnlineParticipantCount,
      isUserOnline,
    ],
  );

  // =========================================================
  // CARREGAR CONVERSAS AO ENTRAR
  // =========================================================

  useEffect(() => {
    if (!user?._id) {
      return;
    }

    loadConversations();
  }, [user?._id, loadConversations]);

  // =========================================================
  // LIMPAR AO DESLOGAR
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

    getConversationParticipants,

    getOnlineParticipants,

    getParticipantCount,

    getOnlineParticipantCount,

    getConversationSubtitle,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatContext;

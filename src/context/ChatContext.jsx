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
  if (value === null || value === undefined) return fallback;

  if (typeof value === 'string') return value;

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (typeof value === 'object') {
    if (typeof value.text === 'string') return value.text;

    if (typeof value.content === 'string') return value.content;

    if (typeof value.message === 'string') return value.message;
  }

  return fallback;
};

const getObjectId = (value) => {
  if (!value) return null;

  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (typeof value === 'object') {
    if (value._id) return String(value._id);

    if (value.id) return String(value.id);

    if (value.$oid) return String(value.$oid);
  }

  return null;
};

// Retorna o ID de um lead, seja ele um ID simples ou um objeto.

const getRelatedId = (value) => getObjectId(value);

// Identifica o lead associado a uma conversa WhatsApp.

const getConversationLeadId = (conversation) => {
  if (!conversation) return null;

  // Mantém a identificação compatível com os diferentes formatos
  // que podem ser retornados pela API de conversas do WhatsApp.
  const candidates = [
    conversation.lead,
    conversation.leadId,
    conversation.relatedLead,
    conversation.relatedLeadId,
    conversation.contactLead,
    conversation.whatsappContact?.lead,
    conversation.whatsappContact?.leadId,
    conversation.contact?.lead,
    conversation.contact?.leadId,
  ];

  for (const candidate of candidates) {
    const id = getRelatedId(candidate);
    if (id) return id;
  }

  return null;
};

const sanitizeMessage = (message) => {
  if (!message || typeof message !== 'object') return null;

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

    _id: getObjectId(conversation._id),

    lastMessage: lastMessageText,

    lastMessageObject,
  };
};

const extractConversations = (response) => {
  const rawData = response?.data?.data;

  if (Array.isArray(rawData)) {
    return rawData.map(sanitizeConversation).filter(Boolean);
  }

  if (Array.isArray(rawData?.conversations)) {
    return rawData.conversations.map(sanitizeConversation).filter(Boolean);
  }

  return [];
};

// =========================================================

// NOTIFICAÇÕES DO NAVEGADOR

// =========================================================

const requestNotificationPermission = async () => {
  if (typeof window === 'undefined') return false;

  if (!('Notification' in window)) return false;

  if (Notification.permission === 'granted') return true;

  if (Notification.permission === 'denied') return false;

  try {
    return (await Notification.requestPermission()) === 'granted';
  } catch {
    return false;
  }
};

const showBrowserNotification = ({ title, body, avatar, onClick }) => {
  if (typeof window === 'undefined') return;

  if (!('Notification' in window)) return;

  if (Notification.permission !== 'granted') return;

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

      onClick?.();

      notification.close();
    };

    setTimeout(() => {
      try {
        notification.close();
      } catch {
        // Ignora erros ao fechar a notificação.
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

  // STATE

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

  // REFS

  const socketRef = useRef(null);

  const currentConversationRef = useRef(null);

  const notificationSoundRef = useRef(null);

  const loadingConversationsRef = useRef(false);

  const conversationsRef = useRef([]);

  const messagesRequestRef = useRef(0);

  const processedNotificationIdsRef = useRef(new Map());

  const realtimeConversationVersionRef = useRef(0);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

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

  useEffect(() => {
    currentConversationRef.current = currentConversation;
  }, [currentConversation]);

  // HELPERS

  const getId = useCallback((value) => getObjectId(value), []);

  const isSameId = useCallback(
    (a, b) => {
      const idA = getId(a);

      const idB = getId(b);

      return Boolean(idA && idB && idA === idB);
    },

    [getId],
  );

  // SOM DE NOTIFICAÇÃO

  const playNotificationSound = useCallback(() => {
    try {
      if (!notificationSoundRef.current) {
        notificationSoundRef.current = new Audio('/notification.mp3');
      }

      notificationSoundRef.current.currentTime = 0;

      notificationSoundRef.current.play().catch(() => {});
    } catch {
      // Ignora erros de áudio.
    }
  }, []);

  // =========================================================

  // CARREGAR CONVERSAS

  // =========================================================

  const loadConversations = useCallback(async () => {
    if (!user?._id) return [];

    // Evita uma segunda requisição concorrente retornar uma lista vazia

    // e sobrescrever uma lista já carregada.

    if (loadingConversationsRef.current) {
      return conversationsRef.current;
    }

    const requestRealtimeVersion = realtimeConversationVersionRef.current;

    try {
      loadingConversationsRef.current = true;

      setLoadingConversations(true);

      const response = await api.get('/api/chat/conversations');

      const conversationsData = extractConversations(response);

      console.log('💬 Conversas carregadas:', conversationsData.length);

      if (requestRealtimeVersion !== realtimeConversationVersionRef.current) {
        console.log('⚡ Resposta antiga de conversas ignorada.');

        return conversationsRef.current;
      }

      conversationsRef.current = conversationsData;

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
        conversationsRef.current = [];

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

      const sanitized = sanitizeMessage(message);

      if (!sanitized) return;

      realtimeConversationVersionRef.current += 1;

      setConversations((prev) => {
        const index = prev.findIndex((conversation) =>
          isSameId(conversation?._id, conversationId),
        );

        if (index === -1) {
          console.log('⚠️ Conversa não encontrada na lista:', conversationId);

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

        newList.splice(index, 1);

        newList.unshift(updatedConversation);

        conversationsRef.current = newList;

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
        setError('ID da conversa não informado.');

        return;
      }

      const requestId = ++messagesRequestRef.current;

      try {
        setLoading(true);

        setError(null);

        const response = await api.get(
          `/api/chat/conversations/${conversationId}/messages`,
        );

        if (requestId !== messagesRequestRef.current) return;

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
            error?.response?.data?.message || 'Erro ao carregar mensagens.',
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
      if (!message || typeof message !== 'object' || !message._id) {
        console.warn('⚠️ Mensagem inválida via socket:', message);

        return;
      }

      const conversationId =
        getId(message.conversation) || getId(message.conversationId);

      if (!conversationId) {
        console.warn('⚠️ conversationId não encontrado:', message);

        return;
      }

      const messageId = getId(message._id);

      if (messageId && processedNotificationIdsRef.current.has(messageId)) {
        return;
      }

      const sanitizedMessage = sanitizeMessage(message);

      if (!sanitizedMessage) return;

      if (!sanitizedMessage.conversation) {
        sanitizedMessage.conversation = conversationId;
      }

      const current = currentConversationRef.current;

      const currentConversationId = getId(current?._id);

      const isCurrentConversation = currentConversationId === conversationId;

      const isOwnMessage = isSameId(sanitizedMessage?.sender?._id, user?._id);

      if (isCurrentConversation) {
        setMessages((prev) => {
          const alreadyExists = prev.some((msg) =>
            isSameId(msg?._id, sanitizedMessage._id),
          );

          if (alreadyExists) return prev;

          const withoutOptimistic = prev.filter(
            (msg) =>
              !(
                msg?.isOptimistic && msg?.content === sanitizedMessage?.content
              ),
          );

          return [...withoutOptimistic, sanitizedMessage];
        });

        api

          .post(`/api/chat/conversations/${conversationId}/read`)

          .catch(() => {});
      }

      const shouldIncrementUnread = !isCurrentConversation && !isOwnMessage;

      updateConversationFromMessage(
        sanitizedMessage,

        conversationId,

        shouldIncrementUnread,
      );

      if (messageId) {
        processedNotificationIdsRef.current.set(messageId, Date.now());
      }

      if (shouldIncrementUnread) {
        const senderName =
          sanitizedMessage.sender?.name ||
          sanitizedMessage.whatsappContact?.name ||
          'Nova mensagem';

        setLastNotification({
          id: `${messageId}_${Date.now()}`,

          messageId,

          conversationId,

          message: sanitizedMessage,

          senderName,

          senderAvatar: sanitizedMessage.sender?.avatar || null,

          preview:
            safeString(sanitizedMessage.content).substring(0, 80) ||
            'Nova mensagem recebida',

          timestamp: Date.now(),
        });

        playNotificationSound();

        showBrowserNotification({
          title: `💬 ${senderName}`,

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

  const handleMessageNotification = useCallback(
    (payload) => {
      if (!payload) return;

      const message = payload.message;

      if (!message || typeof message !== 'object') return;

      const conversationId =
        getId(payload.conversationId) ||
        getId(message.conversationId) ||
        getId(message.conversation);

      if (!conversationId) return;

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
    if (!user?._id) return undefined;

    const socketUrl =
      import.meta.env.VITE_API_URL || 'https\://leadsnamao.onrender.com';

    const newSocket = io(socketUrl, {
      auth: { userId: String(user._id) },

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

    const handleConnect = () => {
      console.log('🔌 Conectado ao chat socket:', newSocket.id);

      setIsConnected(true);

      newSocket.emit('join_conversations');

      loadConversations();

      requestNotificationPermission();
    };

    const handleDisconnect = (reason) => {
      console.log('🔌 Desconectado do chat socket:', reason);

      setIsConnected(false);
    };

    const handleConnectError = (error) => {
      console.error('❌ Erro de conexão Socket.IO:', error);

      setIsConnected(false);
    };

    const handleNewMessage = (payload) => {
      const message = payload?.message
        ? {
            ...payload.message,

            conversation: payload.conversationId,

            conversationId: payload.conversationId,
          }
        : payload;

      handleMessageReceived(message);
    };

    const handleUserTyping = ({ userId, isTyping }) => {
      if (!userId) return;

      const id = getId(userId);

      if (!id) return;

      setTypingUsers((prev) => ({
        ...prev,

        [id]: Boolean(isTyping),
      }));
    };

    const handleUserOnline = (userId) => {
      const id = getId(userId);

      if (!id) return;

      setOnlineUsers((prev) => (prev.includes(id) ? prev : [...prev, id]));
    };

    const handleUserOffline = (userId) => {
      const id = getId(userId);

      if (!id) return;

      setOnlineUsers((prev) => prev.filter((existingId) => existingId !== id));
    };

    newSocket.on('new_message', handleNewMessage);

    newSocket.on('new_message_notification', handleMessageNotification);

    newSocket.on('newMessage', handleMessageReceived);

    newSocket.on('connect', handleConnect);

    newSocket.on('disconnect', handleDisconnect);

    newSocket.on('connect_error', handleConnectError);

    newSocket.on('user_typing', handleUserTyping);

    newSocket.on('user_online', handleUserOnline);

    newSocket.on('user_offline', handleUserOffline);

    return () => {
      newSocket.off('new_message', handleNewMessage);

      newSocket.off('new_message_notification', handleMessageNotification);

      newSocket.off('newMessage', handleMessageReceived);

      newSocket.off('connect', handleConnect);

      newSocket.off('disconnect', handleDisconnect);

      newSocket.off('connect_error', handleConnectError);

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
    const baseTitle = 'CRM NODUS';

    document.title =
      unreadCount > 0
        ? `(${unreadCount > 99 ? '99+' : unreadCount}) ${baseTitle}`
        : baseTitle;
  }, [unreadCount]);

  // =========================================================
  // UPLOAD DE MÍDIA DO CHAT
  // Envia o arquivo ao backend e retorna os metadados do anexo.
  // O backend precisa disponibilizar POST /api/chat/media.
  // =========================================================

  const uploadChatMedia = useCallback(async (file) => {
    if (!file) {
      throw new Error('Selecione um arquivo para enviar.');
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/api/chat/media', formData);
      const data = response.data?.data ?? response.data;

      if (!data?.url) {
        throw new Error('O servidor não retornou a URL da mídia enviada.');
      }

      return {
        url: data.url,
        name: data.name || file.name,
        size: data.size ?? file.size,
        mimeType: data.mimeType || file.type || 'application/octet-stream',
        format: data.format || '',
      };
    } catch (error) {
      console.error('❌ Erro ao enviar mídia do chat:', error);
      throw new Error(
        error?.response?.data?.message ||
          error?.message ||
          'Não foi possível enviar o arquivo. Tente novamente.',
      );
    }
  }, []);

  // =========================================================

  // ENVIAR MENSAGEM: TEXTO, IMAGEM, GIF E ARQUIVO

  // =========================================================

  const sendMessage = useCallback(
    async (conversationId, input) => {
      if (!conversationId || !input) return;

      const payload =
        typeof input === 'string'
          ? { content: input, type: 'text', attachment: null }
          : input && typeof input === 'object'
            ? {
                content: input.content ?? '',

                type: input.type || 'text',

                attachment: input.attachment || null,
              }
            : null;

      if (!payload) {
        throw new Error('Formato de mensagem inválido.');
      }

      const type = String(payload.type).toLowerCase();

      const content = String(payload.content || '').trim();

      const attachment = payload.attachment;

      if (!['text', 'image', 'audio', 'video', 'file'].includes(type)) {
        throw new Error('Tipo de mensagem não suportado.');
      }

      if (type === 'text' && !content) return;

      if (type !== 'text' && !attachment?.url) {
        throw new Error('O arquivo ou GIF não possui uma URL válida.');
      }

      const optimisticId = `temp_${Date.now()}_${Math.random()

        .toString(36)

        .substring(2, 8)}`;

      const optimisticMessage = {
        _id: optimisticId,

        conversation: conversationId,

        content,

        type,

        attachment,

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
        const response = await api.post(
          `/api/chat/conversations/${conversationId}/messages`,

          { content, type, attachment },
        );

        const newMessage = response.data?.data;

        if (!newMessage || typeof newMessage !== 'object' || !newMessage._id) {
          throw new Error('O servidor retornou uma mensagem inválida.');
        }

        const sanitizedMessage = sanitizeMessage(newMessage);

        if (!sanitizedMessage) {
          throw new Error('Mensagem inválida retornada pelo servidor.');
        }

        setMessages((prev) => {
          const withoutOptimistic = prev.filter(
            (message) => message._id !== optimisticId,
          );

          const alreadyExists = withoutOptimistic.some((message) =>
            isSameId(message._id, sanitizedMessage._id),
          );

          return alreadyExists
            ? withoutOptimistic
            : [...withoutOptimistic, sanitizedMessage];
        });

        updateConversationFromMessage(sanitizedMessage, conversationId, false);

        return sanitizedMessage;
      } catch (error) {
        console.error('❌ Erro ao enviar mensagem:', error);

        setMessages((prev) =>
          prev.filter((message) => message._id !== optimisticId),
        );

        setError(
          error?.response?.data?.message ||
            error?.message ||
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

  // CRIAR CONVERSA INTERNA

  // =========================================================

  const createConversation = useCallback(
    async (participants, type = 'direct', name = '') => {
      if (!Array.isArray(participants) || participants.length === 0) {
        throw new Error('Selecione pelo menos um participante.');
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
        throw new Error('Nome do canal é obrigatório.');
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
    if (!query || query.trim().length < 2) return [];

    try {
      const response = await api.get('/api/chat/users/search', {
        params: { q: query.trim() },
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
      if (!conversation?._id) return;

      const conversationId = getId(conversation._id);

      if (!conversationId) return;

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
        socketRef.current.emit('join_conversation', conversationId);
      }

      await loadMessages(conversationId);
    },

    [getId, loadMessages],
  );

  // =========================================================

  // NOVO: ABRIR CONVERSA WHATSAPP A PARTIR DE UM LEAD

  // =========================================================

  const openLeadConversation = useCallback(
    async (leadOrId) => {
      const leadId = getRelatedId(
        typeof leadOrId === 'object' ? leadOrId?._id || leadOrId?.id : leadOrId,
      );

      if (!leadId) {
        throw new Error('Não foi possível identificar o lead.');
      }

      const findLeadConversation = (items) =>
        items.find(
          (item) =>
            item?.channel === 'whatsapp' &&
            getConversationLeadId(item) === leadId,
        );

      let conversation = findLeadConversation(conversationsRef.current);

      // Primeiro, atualiza a lista para verificar se a conversa

      // já foi criada por um webhook ou por outra ação.

      if (!conversation) {
        const response = await api.get('/api/chat/conversations');

        const refreshedConversations = extractConversations(response);

        conversationsRef.current = refreshedConversations;

        setConversations(refreshedConversations);

        setUnreadCount(
          refreshedConversations.reduce(
            (sum, item) => sum + Number(item?.unreadCount || 0),

            0,
          ),
        );

        if (socketRef.current?.connected) {
          refreshedConversations.forEach((item) => {
            if (item?._id) {
              socketRef.current.emit('join_conversation', item._id);
            }
          });
        }

        conversation = findLeadConversation(refreshedConversations);
      }

      // Se não existe, pede ao backend para preparar o contato

      // e criar ou recuperar a conversa WhatsApp do lead.

      if (!conversation) {
        await api.post(
          `/api/whatsapp/leads/${encodeURIComponent(leadId)}/conversation`,
        );

        // Atualiza a lista usando o endpoint oficial do chat,

        // que já aplica as regras de acesso do usuário.

        const response = await api.get('/api/chat/conversations');

        const refreshedConversations = extractConversations(response);

        conversationsRef.current = refreshedConversations;

        setConversations(refreshedConversations);

        setUnreadCount(
          refreshedConversations.reduce(
            (sum, item) => sum + Number(item?.unreadCount || 0),

            0,
          ),
        );

        if (socketRef.current?.connected) {
          refreshedConversations.forEach((item) => {
            if (item?._id) {
              socketRef.current.emit('join_conversation', item._id);
            }
          });
        }

        conversation = findLeadConversation(refreshedConversations);
      }

      if (!conversation) {
        throw new Error(
          'A conversa foi preparada, mas não apareceu na lista do chat. ' +
            'Verifique se o backend inclui essa conversa no retorno de /api/chat/conversations.',
        );
      }

      await selectConversation(conversation);

      return conversation;
    },

    [selectConversation],
  );

  // =========================================================

  // DIGITANDO

  // =========================================================

  const sendTyping = useCallback((conversationId, isTyping) => {
    if (!socketRef.current?.connected || !conversationId) return;

    socketRef.current.emit('typing', {
      conversationId,

      isTyping,
    });
  }, []);

  // =========================================================

  // STATUS ONLINE

  // =========================================================

  const isUserOnline = useCallback(
    (userId) => {
      const id = getId(userId);

      return Boolean(id && onlineUsers.includes(id));
    },

    [getId, onlineUsers],
  );

  // =========================================================

  // NOME DA CONVERSA

  // =========================================================

  const getConversationName = useCallback(
    (conversation) => {
      if (!conversation) return 'Conversa';

      if (conversation.name) return conversation.name;

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

  // AVATAR DA CONVERSA

  // =========================================================

  const getConversationAvatar = useCallback(
    (conversation) => {
      if (!conversation) return null;

      if (conversation.avatar) return conversation.avatar;

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
    if (!Array.isArray(conversation?.participants)) return [];

    return conversation.participants.filter(Boolean);
  }, []);

  const getOnlineParticipants = useCallback(
    (conversation) =>
      getConversationParticipants(conversation).filter((participant) =>
        isUserOnline(participant?._id),
      ),

    [getConversationParticipants, isUserOnline],
  );

  const getParticipantCount = useCallback(
    (conversation) => getConversationParticipants(conversation).length,

    [getConversationParticipants],
  );

  const getOnlineParticipantCount = useCallback(
    (conversation) => getOnlineParticipants(conversation).length,

    [getOnlineParticipants],
  );

  // =========================================================

  // SUBTÍTULO

  // =========================================================

  const getConversationSubtitle = useCallback(
    (conversation) => {
      if (!conversation) return '';

      if (conversation.channel === 'whatsapp') {
        return (
          conversation.whatsappContact?.phone ||
          conversation.lead?.phone ||
          'WhatsApp'
        );
      }

      if (conversation.type === 'direct') {
        const participant = getOtherParticipant(conversation);

        if (!participant) return '';

        return isUserOnline(participant._id) ? 'Online' : 'Offline';
      }

      const participantCount = getParticipantCount(conversation);

      const onlineCount = getOnlineParticipantCount(conversation);

      if (participantCount === 0) return 'Nenhum participante';

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
    if (user?._id) {
      loadConversations();
    }
  }, [user?._id, loadConversations]);

  // =========================================================

  // LIMPAR AO DESLOGAR

  // =========================================================

  useEffect(() => {
    if (user) return;

    console.log('🧹 Limpando estado do ChatContext');

    conversationsRef.current = [];

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

    document.title = 'CRM NODUS';
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
    uploadChatMedia,

    createConversation,

    createBrokerChannel,

    searchUsers,

    selectConversation,

    // Nova função disponível para as páginas do CRM.

    openLeadConversation,

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

import { useState, useEffect, useRef, useContext, useMemo } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';

import {
  FaUsers,
  FaSearch,
  FaPlus,
  FaChevronLeft,
  FaUser,
  FaCircle,
  FaPaperPlane,
  FaTimes,
  FaCheck,
  FaCheckDouble,
  FaComments,
  FaPaperclip,
  FaEllipsisV,
  FaInfoCircle,
  FaWhatsapp,
  FaClock,
  FaSmile,
  FaArrowDown,
  FaCheckCircle,
  FaLink,
  FaCalendarAlt,
  FaRegComments,
  FaMicrophone,
  FaStop,
} from 'react-icons/fa';

import { GifPicker } from 'gif-picker-react';
import { Klipy } from 'gif-picker-react/providers/klipy';

import { useChat } from '../context/ChatContext';
import { UserContext } from '../context/UserContext';
import api from '../service/api';

const EMOJIS = [
  '😀',
  '😃',
  '😄',
  '😁',
  '😆',
  '😅',
  '😂',
  '🤣',
  '😊',
  '😇',
  '🙂',
  '😉',
  '😍',
  '🥰',
  '😘',
  '😋',
  '😎',
  '🤩',
  '🥳',
  '🤔',
  '🤗',
  '🤭',
  '😴',
  '😭',
  '😢',
  '😡',
  '🤯',
  '🥹',
  '👍',
  '👎',
  '👏',
  '🙌',
  '🙏',
  '🤝',
  '💪',
  '❤️',
  '💙',
  '💚',
  '💯',
  '🔥',
  '🎉',
  '🎊',
  '✨',
  '⭐',
  '✅',
  '❌',
  '💰',
  '🏠',
  '👋',
  '💬',
  '📞',
  '📌',
  '🚀',
  '💡',
  '🤝',
  '💎',
];

export default function ChatPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(UserContext);

  const {
    conversations = [],
    currentConversation,
    messages = [],
    loading,
    loadingConversations,
    typingUsers,
    unreadCount,
    loadConversations,
    sendMessage,
    searchUsers,
    selectConversation,
    sendTyping,
    setCurrentConversation,
    isUserOnline,
    getConversationName,
    getConversationAvatar,
    getConversationSubtitle,
    getOtherParticipant,
    createConversation,
    createBrokerChannel,
  } = useChat();

  const [activeTab, setActiveTab] = useState('internal');
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatMode, setNewChatMode] = useState('direct');
  const [channelName, setChannelName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showConversationDetails, setShowConversationDetails] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [sending, setSending] = useState(false);
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [mediaError, setMediaError] = useState('');

  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const gifPickerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const initialScrollConversationRef = useRef(null);
  const previousMessagesCountRef = useRef(0);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingStreamRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const autoSendRequestRef = useRef(null);

  // ============================================================
  // FORMATADORES E HELPERS
  // ============================================================

  const getInitials = (name = '') => {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);

    if (!parts.length) return 'U';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  const getRoleLabel = (role) => {
    const roles = {
      admin: 'Administrador',
      broker: 'Corretor',
      manager: 'Gerente',
      supervisor: 'Supervisor',
      user: 'Usuário',
    };

    return roles[role] || role || 'Usuário';
  };

  const getSafeConversationName = (conversation) =>
    getConversationName?.(conversation) || 'Conversa';

  const getSafeConversationSubtitle = (conversation) =>
    getConversationSubtitle?.(conversation) || '';

  const getConversationIsWhatsApp = (conversation) =>
    conversation?.channel === 'whatsapp';

  // ============================================================
  // NAVEGAÇÃO PARA DETALHES DE LEAD E CORRETOR
  // ============================================================

  const normalizeEntityId = (value) => {
    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }

    if (value && typeof value === 'object') {
      const id = value._id ?? value.id ?? value.leadId ?? value.userId;
      return id ? String(id) : '';
    }

    return '';
  };

  const getConversationLeadId = (conversation) => {
    const possibleLeadReferences = [
      conversation?.leadId,
      conversation?.lead,
      conversation?.whatsappContact?.leadId,
      conversation?.whatsappContact?.lead,
      conversation?.contact?.leadId,
      conversation?.contact?.lead,
      conversation?.metadata?.leadId,
    ];

    return possibleLeadReferences.map(normalizeEntityId).find(Boolean) || null;
  };

  const handleOpenLeadDetails = (conversation) => {
    const leadId = getConversationLeadId(conversation);
    if (!leadId) return;

    navigate(`/lead-detail/${leadId}`);
  };

  const getParticipantId = (participant) =>
    normalizeEntityId(participant?._id ?? participant?.id ?? participant);

  const isBrokerParticipant = (participant) => {
    const role = String(participant?.role || '').toLowerCase();

    return (
      role === 'broker' || role === 'corretor' || participant?.isBroker === true
    );
  };

  const handleOpenBrokerDetails = (participant) => {
    const brokerId = getParticipantId(participant);
    if (!brokerId) return;

    navigate(`/broker-details/${brokerId}`);
  };

  const isHttpUrl = (value) => {
    if (typeof value !== 'string' || !value.trim()) return false;

    try {
      const url = new URL(value.trim());
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Converte URLs no texto em links clicáveis sem usar dangerouslySetInnerHTML.
  const renderMessageWithLinks = (text) => {
    const urlPattern = /((?:https?:\/\/|www\.)[^\s<>]+[^\s<>.,;:!?)\]"'])/gi;
    const parts = String(text || '').split(urlPattern);

    return parts.map((part, index) => {
      if (!part) return null;

      const isUrl = /^(?:https?:\/\/|www\.)/i.test(part);
      if (!isUrl) return part;

      const href = /^www\./i.test(part) ? `https://${part}` : part;
      if (!isHttpUrl(href)) return part;

      return (
        <a
          key={`url-${index}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer nofollow"
          onClick={(event) => event.stopPropagation()}
          className="break-all font-medium underline decoration-current/40 underline-offset-2 transition hover:decoration-current"
          title={`Abrir ${part} em nova aba`}
        >
          {part}
        </a>
      );
    });
  };

  const getConversationCreatedAt = (conversation) =>
    conversation?.createdAt ||
    conversation?.created_at ||
    conversation?.startedAt ||
    null;

  const getConversationLastActivity = (conversation) =>
    conversation?.lastMessageAt ||
    conversation?.updatedAt ||
    conversation?.lastMessage?.createdAt ||
    null;

  const getLastMessage = (conversation) => {
    const lastMessage = conversation?.lastMessage;

    if (typeof lastMessage === 'string') {
      return lastMessage.trim() || 'Nenhuma mensagem';
    }

    if (lastMessage && typeof lastMessage === 'object') {
      if (typeof lastMessage.content === 'string') {
        return lastMessage.content.trim() || 'Nenhuma mensagem';
      }
    }

    if (typeof conversation?.lastMessageObject?.content === 'string') {
      return conversation.lastMessageObject.content;
    }

    return 'Nenhuma mensagem';
  };

  const getMessageContent = (message) =>
    typeof message?.content === 'string' ? message.content : '';

  const formatTime = (date) => {
    if (!date) return '';

    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '';

    const now = new Date();
    const diff = now.getTime() - d.getTime();

    if (diff >= 0 && diff < 60000) return 'Agora';

    if (diff >= 0 && diff < 3600000) {
      return `${Math.floor(diff / 60000)}min`;
    }

    if (diff >= 0 && diff < 86400000) {
      return d.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    if (diff >= 0 && diff < 604800000) {
      return d.toLocaleDateString('pt-BR', { weekday: 'short' });
    }

    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const formatMessageTime = (date) => {
    if (!date) return '';

    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '';

    return d.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date) => {
    if (!date) return '';

    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '';

    const today = new Date();

    if (d.toDateString() === today.toDateString()) return 'Hoje';

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === yesterday.toDateString()) return 'Ontem';

    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getParticipants = (conversation) =>
    Array.isArray(conversation?.participants)
      ? conversation.participants.filter(Boolean)
      : [];

  const getOnlineParticipants = (conversation) =>
    getParticipants(conversation).filter((participant) =>
      isUserOnline(participant?._id),
    );

  const getParticipantCount = (conversation) =>
    getParticipants(conversation).length;

  const getOnlineParticipantCount = (conversation) =>
    getOnlineParticipants(conversation).length;

  const currentParticipants = getParticipants(currentConversation);
  const currentParticipantCount = getParticipantCount(currentConversation);
  const currentOnlineParticipantCount =
    getOnlineParticipantCount(currentConversation);

  const isWhatsAppConversation = currentConversation?.channel === 'whatsapp';

  const isCurrentChannel = currentConversation?.type === 'broker_channel';

  const isTypingUser =
    !isWhatsAppConversation &&
    currentParticipants.some((participant) => {
      const participantId = participant?._id?.toString();
      const currentUserId = user?._id?.toString();

      return (
        participantId &&
        participantId !== currentUserId &&
        Boolean(typingUsers?.[participantId])
      );
    });

  // ============================================================
  // CONTAGEM E FILTROS
  // ============================================================

  const internalUnreadCount = useMemo(
    () =>
      conversations
        .filter((conversation) => conversation?.channel !== 'whatsapp')
        .reduce(
          (total, conversation) =>
            total + Math.max(0, Number(conversation?.unreadCount || 0)),
          0,
        ),
    [conversations],
  );

  const whatsappUnreadCount = useMemo(
    () =>
      conversations
        .filter((conversation) => conversation?.channel === 'whatsapp')
        .reduce(
          (total, conversation) =>
            total + Math.max(0, Number(conversation?.unreadCount || 0)),
          0,
        ),
    [conversations],
  );

  const filteredConversations = useMemo(() => {
    const term = search.trim().toLowerCase();

    const tabConversations = conversations.filter((conversation) =>
      activeTab === 'whatsapp'
        ? conversation?.channel === 'whatsapp'
        : conversation?.channel !== 'whatsapp',
    );

    if (!term) return tabConversations;

    return tabConversations.filter((conversation) => {
      const name = String(getSafeConversationName(conversation)).toLowerCase();
      const subtitle = String(
        getSafeConversationSubtitle(conversation),
      ).toLowerCase();
      const lastMessage = getLastMessage(conversation).toLowerCase();

      return (
        name.includes(term) ||
        subtitle.includes(term) ||
        lastMessage.includes(term)
      );
    });
  }, [
    conversations,
    activeTab,
    search,
    getConversationName,
    getConversationSubtitle,
  ]);

  // ============================================================
  // RESPONSIVIDADE E CARREGAMENTO
  // ============================================================

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (typeof loadConversations === 'function') {
      loadConversations();
    }
  }, [loadConversations]);

  // ============================================================
  // SELETOR DE EMOJIS
  // ============================================================

  const insertEmoji = (emoji) => {
    const input = inputRef.current;

    if (!input) {
      setInputMessage((previous) => previous + emoji);
      setShowEmojiPicker(false);
      return;
    }

    const start = input.selectionStart ?? inputMessage.length;
    const end = input.selectionEnd ?? inputMessage.length;

    const nextMessage =
      inputMessage.slice(0, start) + emoji + inputMessage.slice(end);

    setInputMessage(nextMessage);
    setShowEmojiPicker(false);

    requestAnimationFrame(() => {
      if (!inputRef.current) return;

      inputRef.current.focus();

      const cursorPosition = start + emoji.length;
      inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
    });
  };

  // ============================================================
  // FECHAR PICKERS AO CLICAR FORA OU ESC
  // ============================================================

  useEffect(() => {
    if (!showEmojiPicker && !showGifPicker) return undefined;

    const handleOutsideClick = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }

      if (
        gifPickerRef.current &&
        !gifPickerRef.current.contains(event.target)
      ) {
        setShowGifPicker(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowEmojiPicker(false);
        setShowGifPicker(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showEmojiPicker, showGifPicker]);

  // ============================================================
  // SCROLL DAS MENSAGENS
  // ============================================================

  const scrollToBottom = (behavior = 'smooth') => {
    const container = messagesContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });

    setShowScrollButton(false);
  };

  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;

    setShowScrollButton(distanceFromBottom > 180);
  };

  useEffect(() => {
    initialScrollConversationRef.current = null;
    previousMessagesCountRef.current = 0;
    setShowScrollButton(false);
    setInputMessage('');
    setIsTyping(false);
    setShowEmojiPicker(false);
    setShowGifPicker(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [currentConversation?._id]);

  useEffect(() => {
    const conversationId = currentConversation?._id?.toString();

    if (!conversationId || loading) return undefined;

    if (initialScrollConversationRef.current === conversationId) {
      return undefined;
    }

    let firstFrame;
    let secondFrame;

    firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        const currentId = currentConversation?._id?.toString();
        const container = messagesContainerRef.current;

        if (!container || currentId !== conversationId) return;

        container.scrollTop = container.scrollHeight;
        initialScrollConversationRef.current = conversationId;
        previousMessagesCountRef.current = messages.length;

        setShowScrollButton(false);
      });
    });

    return () => {
      cancelAnimationFrame(firstFrame);

      if (secondFrame !== undefined) {
        cancelAnimationFrame(secondFrame);
      }
    };
  }, [currentConversation?._id, messages.length, loading]);

  useEffect(() => {
    const conversationId = currentConversation?._id?.toString();
    const container = messagesContainerRef.current;

    if (!conversationId || !container || loading) return;

    if (initialScrollConversationRef.current !== conversationId) return;

    const previousCount = previousMessagesCountRef.current;
    const currentCount = messages.length;

    if (currentCount > previousCount) {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;

      if (distanceFromBottom <= 180) {
        requestAnimationFrame(() => {
          const currentId = currentConversation?._id?.toString();
          const currentContainer = messagesContainerRef.current;

          if (currentContainer && currentId === conversationId) {
            currentContainer.scrollTo({
              top: currentContainer.scrollHeight,
              behavior: 'smooth',
            });

            setShowScrollButton(false);
          }
        });
      }
    }

    previousMessagesCountRef.current = currentCount;
  }, [messages.length, currentConversation?._id, loading]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // ============================================================
  // BUSCA DE USUÁRIOS
  // ============================================================

  useEffect(() => {
    let cancelled = false;
    const term = search.trim();

    if (!showNewChat || newChatMode !== 'direct' || term.length < 2) {
      setSearchResults([]);
      setSearching(false);
      return undefined;
    }

    const timeout = setTimeout(async () => {
      setSearching(true);

      try {
        const results = await searchUsers(term);
        const currentUserId = user?._id?.toString();

        if (!cancelled) {
          setSearchResults(
            (Array.isArray(results) ? results : []).filter(
              (item) => item?._id?.toString() !== currentUserId,
            ),
          );
        }
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);

        if (!cancelled) setSearchResults([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [search, showNewChat, newChatMode, user?._id, searchUsers]);

  // ============================================================
  // NOVA CONVERSA
  // ============================================================

  const handleChangeTab = (tab) => {
    if (tab === activeTab) return;

    setActiveTab(tab);
    setSearch('');
    setShowNewChat(false);
    setSearchResults([]);
    setShowParticipants(false);
    setShowConversationDetails(false);
    setShowEmojiPicker(false);
    setShowGifPicker(false);
    setInputMessage('');
    setIsTyping(false);
    initialScrollConversationRef.current = null;
    previousMessagesCountRef.current = 0;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    setCurrentConversation(null);
  };

  const resetNewChat = () => {
    setShowNewChat(false);
    setSearch('');
    setSearchResults([]);
    setSelectedUsers([]);
    setChannelName('');
    setNewChatMode('direct');
    setCreatingConversation(false);
  };

  const toggleUser = (userId) => {
    const normalizedId = userId?.toString();

    setSelectedUsers((previous) =>
      previous.some((id) => id?.toString() === normalizedId)
        ? previous.filter((id) => id?.toString() !== normalizedId)
        : [...previous, userId],
    );
  };

  const handleCreateConversation = async () => {
    if (creatingConversation) return;
    if (newChatMode === 'channel' && !channelName.trim()) return;

    if (newChatMode === 'direct' && selectedUsers.length === 0) return;

    setCreatingConversation(true);

    try {
      if (newChatMode === 'channel') {
        await createBrokerChannel(channelName.trim());
      } else {
        await createConversation(selectedUsers);
      }

      resetNewChat();
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
    } finally {
      setCreatingConversation(false);
    }
  };

  // ============================================================
  // DIGITAÇÃO E ENVIO
  // ============================================================

  const handleTyping = (event) => {
    const value = event.target.value;
    setInputMessage(value);

    if (!currentConversation) return;
    if (currentConversation.channel === 'whatsapp') return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (value.trim() && !isTyping) {
      setIsTyping(true);
      sendTyping(currentConversation._id, true);
    }

    if (!value.trim() && isTyping) {
      setIsTyping(false);
      sendTyping(currentConversation._id, false);
    }

    if (value.trim()) {
      const conversationId = currentConversation._id;

      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        sendTyping(conversationId, false);
      }, 2000);
    }
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();

    const content = inputMessage.trim();

    if (!content || !currentConversation || sending) return;

    const conversationId = currentConversation._id;
    const isWhatsApp = currentConversation.channel === 'whatsapp';

    setSending(true);

    try {
      await sendMessage(conversationId, content);

      setInputMessage('');
      setIsTyping(false);
      setShowEmojiPicker(false);
      setShowGifPicker(false);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      if (!isWhatsApp) {
        sendTyping(conversationId, false);
      }

      requestAnimationFrame(() => inputRef.current?.focus());
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setSending(false);
    }
  };

  // ============================================================
  // ENVIO AUTOMÁTICO DO LINK DA PROPOSTA PELO WHATSAPP
  // O LeadDetails envia a solicitação via location.state.
  // Esta é a tela de chat usada pelo CRM, então o envio precisa
  // ser tratado aqui (e não apenas no componente ChatArea).
  // ============================================================

  useEffect(() => {
    const request = location.state?.crmWhatsAppSend;
    const messageText = String(request?.message || '').trim();
    const requestId = request?.requestId;
    const targetConversationId = request?.conversationId
      ? String(request.conversationId)
      : null;

    if (!messageText || !requestId || !currentConversation?._id) return;

    const currentConversationId = String(currentConversation._id);

    // Evita enviar para outra conversa, mesmo que esteja selecionada.
    if (
      targetConversationId &&
      currentConversationId !== targetConversationId
    ) {
      return;
    }

    if (currentConversation.channel !== 'whatsapp') {
      setMediaError(
        'A conversa selecionada não é uma conversa do WhatsApp. O link não foi enviado.',
      );
      return;
    }

    // Impede envio duplicado em re-renderizações e no React Strict Mode.
    if (autoSendRequestRef.current === requestId) return;
    autoSendRequestRef.current = requestId;

    const sendProposalLink = async () => {
      setSending(true);
      setMediaError('');

      try {
        await sendMessage(currentConversationId, messageText);

        setInputMessage('');
        setShowEmojiPicker(false);
        setShowGifPicker(false);

        // Remove o pedido da navegação depois da confirmação da API.
        navigate(location.pathname, { replace: true, state: null });
      } catch (error) {
        console.error(
          'Erro ao enviar link da proposta pelo WhatsApp do CRM:',
          error,
        );

        // Deixa a mensagem no campo para permitir uma tentativa manual.
        setInputMessage(messageText);
        setMediaError(
          error?.response?.data?.message ||
            error?.message ||
            'Não foi possível enviar o link. A mensagem ficou no campo para você tentar novamente.',
        );

        // Limpa a solicitação automática para não repetir o envio em loop.
        navigate(location.pathname, { replace: true, state: null });
        autoSendRequestRef.current = null;
      } finally {
        setSending(false);
      }
    };

    sendProposalLink();
  }, [
    location.state,
    location.pathname,
    currentConversation?._id,
    currentConversation?.channel,
    sendMessage,
    navigate,
  ]);

  // ============================================================
  // UPLOAD DE ARQUIVOS, IMAGENS, ÁUDIO E VÍDEO
  // O backend recebe o arquivo em POST /api/chat/media.
  // Áudios são convertidos para OGG/Opus no backend.
  // ============================================================

  const formatFileSize = (bytes = 0) => {
    if (!Number(bytes)) return '0 KB';
    const units = ['B', 'KB', 'MB', 'GB'];
    const index = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1,
    );
    return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
  };

  const uploadAndSendMedia = async (file) => {
    if (!file || !currentConversation?._id || sending || uploadingMedia) return;
    setMediaError('');

    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      setMediaError('O arquivo ultrapassa o limite de 50 MB.');
      return;
    }

    const originalMime = String(
      file.type || 'application/octet-stream',
    ).toLowerCase();
    const inferredMime = originalMime || 'application/octet-stream';
    const mediaKind = inferredMime.startsWith('audio/')
      ? 'audio'
      : inferredMime.startsWith('video/')
        ? 'video'
        : inferredMime.startsWith('image/')
          ? 'image'
          : 'file';
    const conversationId = currentConversation._id;
    const isWhatsApp = currentConversation.channel === 'whatsapp';

    const formData = new FormData();
    formData.append('file', file, file.name || `${mediaKind}-${Date.now()}`);

    try {
      setUploadingMedia(true);
      const response = await api.post('/api/chat/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,
      });
      const uploaded = response?.data?.data || response?.data;
      const url = uploaded?.url;
      if (!url)
        throw new Error('O servidor não retornou o endereço do arquivo.');

      const finalMime = String(uploaded.mimeType || inferredMime).toLowerCase();
      const finalType = finalMime.startsWith('audio/')
        ? 'audio'
        : finalMime.startsWith('video/')
          ? 'video'
          : finalMime.startsWith('image/')
            ? 'image'
            : 'file';
      const name = uploaded.name || file.name || `${finalType}-${Date.now()}`;
      const label =
        finalType === 'audio'
          ? 'Áudio'
          : finalType === 'video'
            ? 'Vídeo'
            : finalType === 'image'
              ? 'Imagem'
              : 'Arquivo';

      await sendMessage(conversationId, {
        content: `${label}: ${name}`,
        type: finalType,
        attachment: {
          url,
          name,
          mimeType: finalMime,
          size: Number(uploaded.size || file.size || 0),
          format: uploaded.format || finalType,
        },
      });

      setShowEmojiPicker(false);
      setShowGifPicker(false);
      if (!isWhatsApp) sendTyping(conversationId, false);
    } catch (error) {
      console.error('Erro ao enviar mídia no chat:', error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Não foi possível enviar o arquivo.';
      setMediaError(message);
    } finally {
      setUploadingMedia(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleMediaSelected = async (event) => {
    const file = event.target.files?.[0];
    if (file) await uploadAndSendMedia(file);
  };

  const stopAudioRecording = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') recorder.stop();
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    // O stream é liberado no evento onstop, após coletar o último bloco de áudio.
    setIsRecordingAudio(false);
  };

  const startAudioRecording = async () => {
    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === 'undefined'
    ) {
      setMediaError('Seu navegador não oferece suporte à gravação de áudio.');
      return;
    }
    if (
      !currentConversation?._id ||
      sending ||
      uploadingMedia ||
      isRecordingAudio
    )
      return;
    setMediaError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingStreamRef.current = stream;
      audioChunksRef.current = [];
      const preferredMime = [
        'audio/webm;codecs=opus',
        'audio/ogg;codecs=opus',
        'audio/webm',
      ].find((mime) => MediaRecorder.isTypeSupported?.(mime));
      const recorder = preferredMime
        ? new MediaRecorder(stream, { mimeType: preferredMime })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data?.size) audioChunksRef.current.push(event.data);
      };
      recorder.onerror = (event) => {
        console.error('Erro no MediaRecorder:', event.error);
        setMediaError('Ocorreu um erro durante a gravação do áudio.');
      };
      recorder.onstop = async () => {
        const blobType =
          recorder.mimeType || audioChunksRef.current[0]?.type || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: blobType });
        audioChunksRef.current = [];
        if (blob.size) {
          const extension = blobType.includes('ogg') ? 'ogg' : 'webm';
          await uploadAndSendMedia(
            new File([blob], `audio-${Date.now()}.${extension}`, {
              type: blobType,
            }),
          );
        }
        stream.getTracks().forEach((track) => track.stop());
        recordingStreamRef.current = null;
      };
      recorder.start(250);
      setRecordingSeconds(0);
      setIsRecordingAudio(true);
      recordingTimerRef.current = setInterval(
        () => setRecordingSeconds((value) => value + 1),
        1000,
      );
    } catch (error) {
      console.error('Não foi possível iniciar a gravação:', error);
      setMediaError(
        error?.name === 'NotAllowedError'
          ? 'Permita o acesso ao microfone para gravar um áudio.'
          : 'Não foi possível iniciar a gravação de áudio.',
      );
      recordingStreamRef.current
        ?.getTracks?.()
        .forEach((track) => track.stop());
      recordingStreamRef.current = null;
      setIsRecordingAudio(false);
    }
  };

  const formatRecordingTime = (seconds) =>
    `${Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

  useEffect(
    () => () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state !== 'inactive') recorder.stop();
      recordingStreamRef.current
        ?.getTracks?.()
        .forEach((track) => track.stop());
    },
    [],
  );

  /*
  ============================================================
  ENVIAR GIF COMO IMAGEM
  ============================================================
  */

  const handleGifSelected = async (gif) => {
    const gifUrl = gif?.imageUrl;

    if (!gifUrl || sending || !currentConversation?._id) {
      console.error('GIF inválido ou conversa não selecionada:', gif);
      return;
    }

    // Fecha o seletor imediatamente
    setShowGifPicker(false);
    setShowEmojiPicker(false);

    const conversationId = currentConversation._id;
    const isWhatsApp = currentConversation.channel === 'whatsapp';

    try {
      setSending(true);

      await sendMessage(conversationId, {
        content: gifUrl,
        type: 'image',
        attachment: {
          url: gifUrl,
          name: 'gif.gif',
          mimeType: 'image/gif',
        },
      });

      setInputMessage('');
      setIsTyping(false);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      if (!isWhatsApp) {
        sendTyping(conversationId, false);
      }

      requestAnimationFrame(() => inputRef.current?.focus());
    } catch (error) {
      console.error('Erro ao enviar GIF:', error);
    } finally {
      setSending(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setShowParticipants(false);
    setShowConversationDetails(false);
    setShowEmojiPicker(false);
    setShowGifPicker(false);
    setIsTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    initialScrollConversationRef.current = null;
    previousMessagesCountRef.current = 0;

    selectConversation(conversation);

    if (isMobile) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setShowParticipants(false);
    setShowConversationDetails(false);
    setShowEmojiPicker(false);
    setShowGifPicker(false);
    setIsTyping(false);
    setInputMessage('');

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    setCurrentConversation(null);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="chat-scroll min-h-screen bg-[#080a10] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-20 top-0 h-[420px] w-[420px] rounded-full bg-blue-600/[0.06] blur-[130px]" />
        <div className="absolute -right-20 bottom-0 h-[420px] w-[420px] rounded-full bg-emerald-600/[0.035] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-[1600px] px-3 py-4 sm:px-5 lg:px-8 lg:py-6">
        {/* CABEÇALHO */}

        <header className="mb-5 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-gray-400 transition hover:border-white/15 hover:bg-white/[0.07] hover:text-white"
              aria-label="Voltar"
            >
              <FaChevronLeft size={13} />
            </button>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/20 to-blue-700/5 shadow-lg shadow-blue-950/20">
              <FaComments className="text-blue-300" size={18} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-bold tracking-tight sm:text-2xl">
                  Mensagens
                </h1>

                {(activeTab === 'whatsapp'
                  ? whatsappUnreadCount
                  : internalUnreadCount) > 0 && (
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                      activeTab === 'whatsapp'
                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                        : 'border-blue-500/20 bg-blue-500/10 text-blue-300'
                    }`}
                  >
                    {activeTab === 'whatsapp'
                      ? whatsappUnreadCount
                      : internalUnreadCount}{' '}
                    não lidas
                  </span>
                )}
              </div>

              <p className="mt-0.5 hidden text-xs text-gray-500 sm:block">
                Comunicação da equipe e atendimento aos leads
              </p>
            </div>
          </div>

          {activeTab === 'internal' && (
            <button
              type="button"
              onClick={() => setShowNewChat(true)}
              className="flex h-10 shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-3 text-xs font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-500 active:scale-[0.98] sm:px-4 sm:text-sm"
            >
              <FaPlus size={11} />
              <span className="hidden sm:inline">Nova conversa</span>
              <span className="sm:hidden">Nova</span>
            </button>
          )}
        </header>

        {/* ABAS */}

        <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl border border-white/[0.07] bg-[#0d1018]/90 p-1.5 shadow-lg shadow-black/10 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => handleChangeTab('internal')}
            aria-pressed={activeTab === 'internal'}
            className={`flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-3 text-xs font-semibold transition sm:text-sm ${
              activeTab === 'internal'
                ? 'border border-blue-400/15 bg-gradient-to-r from-blue-600/20 to-blue-500/[0.06] text-blue-200 shadow-inner'
                : 'text-gray-500 hover:bg-white/[0.035] hover:text-gray-200'
            }`}
          >
            <FaComments size={14} />
            <span>Chat interno</span>

            {internalUnreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-bold text-white">
                {internalUnreadCount > 99 ? '99+' : internalUnreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleChangeTab('whatsapp')}
            aria-pressed={activeTab === 'whatsapp'}
            className={`flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-3 text-xs font-semibold transition sm:text-sm ${
              activeTab === 'whatsapp'
                ? 'border border-emerald-400/15 bg-gradient-to-r from-emerald-600/20 to-emerald-500/[0.06] text-emerald-200 shadow-inner'
                : 'text-gray-500 hover:bg-white/[0.035] hover:text-gray-200'
            }`}
          >
            <FaWhatsapp size={16} />
            <span>WhatsApp</span>

            {whatsappUnreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-[10px] font-bold text-white">
                {whatsappUnreadCount > 99 ? '99+' : whatsappUnreadCount}
              </span>
            )}
          </button>
        </div>

        {/* APLICAÇÃO PRINCIPAL */}

        <div className="flex h-[calc(100dvh-250px)] min-h-[520px] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0c0f16] shadow-2xl shadow-black/30 ring-1 ring-white/[0.02]">
          <div className="flex h-full w-full min-w-0">
            {/* LISTA DE CONVERSAS */}

            <aside
              className={`${
                currentConversation && isMobile ? 'hidden' : 'flex'
              } w-full shrink-0 flex-col border-r border-white/[0.07] bg-[#0b0e15] lg:flex lg:w-[340px] xl:w-[380px]`}
            >
              <div className="border-b border-white/[0.06] p-4">
                <div className="group relative">
                  <FaSearch
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 transition group-focus-within:text-blue-400"
                    size={12}
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar conversa..."
                    className="h-10 w-full rounded-xl border border-white/[0.07] bg-[#080b11] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/[0.06]"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white"
                      aria-label="Limpar busca"
                    >
                      <FaTimes size={11} />
                    </button>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between px-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-600">
                    {activeTab === 'whatsapp'
                      ? 'Atendimentos'
                      : 'Suas conversas'}
                  </span>

                  <span className="rounded-md border border-white/[0.06] bg-white/[0.025] px-2 py-0.5 text-[10px] tabular-nums text-gray-500">
                    {filteredConversations.length}
                  </span>
                </div>
              </div>

              <div className="scrollbar-thin scrollbar-thumb-gray-800 flex-1 overflow-y-auto">
                {loadingConversations ? (
                  <div className="flex h-48 flex-col items-center justify-center">
                    <div className="h-7 w-7 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                    <span className="mt-3 text-xs text-gray-600">
                      Carregando conversas...
                    </span>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center px-7 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025]">
                      {activeTab === 'whatsapp' ? (
                        <FaWhatsapp size={23} className="text-emerald-500/70" />
                      ) : (
                        <FaComments size={23} className="text-gray-600" />
                      )}
                    </div>

                    <p className="text-sm font-semibold text-gray-300">
                      {search
                        ? 'Nenhuma conversa encontrada'
                        : activeTab === 'whatsapp'
                          ? 'Nenhum atendimento ainda'
                          : 'Tudo começa com uma conversa'}
                    </p>

                    <p className="mt-1.5 max-w-[240px] text-xs leading-relaxed text-gray-600">
                      {search
                        ? 'Experimente outro nome ou termo de busca.'
                        : activeTab === 'whatsapp'
                          ? 'As conversas dos seus leads aparecerão aqui.'
                          : 'Inicie uma conversa com alguém da sua equipe.'}
                    </p>

                    {activeTab === 'internal' && (
                      <button
                        type="button"
                        onClick={() => setShowNewChat(true)}
                        className="mt-5 inline-flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2.5 text-xs font-semibold text-blue-300 transition hover:bg-blue-500/15"
                      >
                        <FaPlus size={10} />
                        Iniciar conversa
                      </button>
                    )}
                  </div>
                ) : (
                  filteredConversations.map((conversation) => {
                    const conversationId = conversation?._id?.toString();
                    const isActive =
                      currentConversation?._id?.toString() === conversationId;
                    const isWhatsApp = getConversationIsWhatsApp(conversation);
                    const isChannel = conversation?.type === 'broker_channel';

                    const otherUser =
                      !isWhatsApp && !isChannel
                        ? getOtherParticipant(conversation)
                        : null;

                    const online = otherUser
                      ? isUserOnline(otherUser._id)
                      : false;

                    const unread = Number(conversation?.unreadCount || 0);
                    const avatar = getConversationAvatar(conversation);
                    const name = getSafeConversationName(conversation);
                    const subtitle = getSafeConversationSubtitle(conversation);
                    const participantCount = getParticipantCount(conversation);
                    const onlineCount = getOnlineParticipantCount(conversation);

                    return (
                      <button
                        key={conversationId}
                        type="button"
                        onClick={() => handleSelectConversation(conversation)}
                        className={`group relative w-full border-b border-white/[0.035] p-3.5 text-left transition ${
                          isActive
                            ? 'bg-white/[0.035]'
                            : 'hover:bg-white/[0.025]'
                        }`}
                      >
                        {isActive && (
                          <span
                            className={`absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full ${
                              isWhatsApp ? 'bg-emerald-400' : 'bg-blue-400'
                            }`}
                          />
                        )}

                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <div
                              className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border shadow-sm ${
                                isWhatsApp
                                  ? 'border-emerald-500/20 bg-emerald-500/[0.06]'
                                  : 'border-white/[0.07] bg-[#171c27]'
                              }`}
                            >
                              {avatar ? (
                                <img
                                  src={avatar}
                                  alt={name}
                                  className="h-full w-full object-cover"
                                  onError={(event) => {
                                    event.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : isWhatsApp ? (
                                <FaWhatsapp
                                  size={20}
                                  className="text-emerald-400"
                                />
                              ) : isChannel ? (
                                <FaUsers size={18} className="text-blue-300" />
                              ) : (
                                <span className="text-xs font-bold text-gray-400">
                                  {getInitials(name)}
                                </span>
                              )}
                            </div>

                            {!isWhatsApp && !isChannel && (
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0b0e15] ${
                                  online ? 'bg-emerald-400' : 'bg-gray-700'
                                }`}
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex min-w-0 items-center gap-1.5">
                                <p
                                  className={`truncate text-[13px] ${
                                    unread > 0
                                      ? 'font-bold text-white'
                                      : 'font-semibold text-gray-300'
                                  }`}
                                >
                                  {name}
                                </p>

                                {isWhatsApp && (
                                  <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-emerald-500/15 bg-emerald-500/[0.08] px-1.5 py-0.5 text-[8px] font-bold uppercase text-emerald-300">
                                    <FaWhatsapp size={8} />
                                    WA
                                  </span>
                                )}

                                {isChannel && (
                                  <span className="shrink-0 rounded-md border border-blue-500/15 bg-blue-500/[0.08] px-1.5 py-0.5 text-[8px] font-bold uppercase text-blue-300">
                                    Equipe
                                  </span>
                                )}
                              </div>

                              <span
                                className={`shrink-0 text-[10px] ${
                                  unread > 0
                                    ? isWhatsApp
                                      ? 'text-emerald-300'
                                      : 'text-blue-300'
                                    : 'text-gray-600'
                                }`}
                              >
                                {formatTime(conversation.lastMessageAt)}
                              </span>
                            </div>

                            {isWhatsApp && subtitle && (
                              <p className="mt-0.5 truncate text-[10px] text-gray-600">
                                {subtitle}
                              </p>
                            )}

                            <div className="mt-1.5 flex items-center justify-between gap-2">
                              <p
                                className={`truncate text-xs ${
                                  unread > 0 ? 'text-gray-300' : 'text-gray-500'
                                }`}
                              >
                                {isChannel
                                  ? `${participantCount} participantes${
                                      onlineCount
                                        ? ` · ${onlineCount} online`
                                        : ''
                                    }`
                                  : getLastMessage(conversation)}
                              </p>

                              {unread > 0 && (
                                <span
                                  className={`flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white ${
                                    isWhatsApp
                                      ? 'bg-emerald-600'
                                      : 'bg-blue-600'
                                  }`}
                                >
                                  {unread > 99 ? '99+' : unread}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* USUÁRIO LOGADO */}

              <div className="border-t border-white/[0.06] bg-[#090c12] px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/[0.07] bg-[#171c27]">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FaUser size={12} className="text-gray-500" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-gray-200">
                        {user?.name || 'Usuário'}
                      </p>
                      <p className="mt-0.5 text-[10px] text-gray-600">
                        {getRoleLabel(user?.role)}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/10 bg-emerald-500/[0.04] px-2 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[9px] text-emerald-300/80">
                      Conectado
                    </span>
                  </div>
                </div>
              </div>
            </aside>

            {/* ÁREA DA CONVERSA */}

            <main
              className={`${
                !currentConversation && isMobile ? 'hidden' : 'flex'
              } min-w-0 flex-1 flex-col bg-[#0c0f16]`}
            >
              {!currentConversation ? (
                <div className="relative flex flex-1 items-center justify-center overflow-hidden px-6">
                  <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/[0.045] blur-[90px]" />

                  <div className="relative max-w-sm text-center">
                    <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[28px] border border-white/[0.08] bg-gradient-to-br from-[#171d29] to-[#0d1119] shadow-2xl shadow-black/20">
                      <div className="absolute inset-2 rounded-[21px] border border-white/[0.035]" />
                      <FaComments size={32} className="text-blue-300/80" />
                    </div>

                    <h2 className="text-xl font-bold tracking-tight text-gray-200">
                      Suas mensagens
                    </h2>

                    <p className="mx-auto mt-2 max-w-[300px] text-sm leading-relaxed text-gray-500">
                      {activeTab === 'whatsapp'
                        ? 'Selecione uma conversa do WhatsApp para atender seus leads.'
                        : 'Selecione uma conversa para trocar mensagens com sua equipe.'}
                    </p>

                    <div className="mx-auto mt-5 flex w-fit items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.025] px-3 py-1.5 text-[10px] text-gray-500">
                      <FaCircle size={5} className="text-emerald-400" />
                      Comunicação em um só lugar
                    </div>

                    {activeTab === 'internal' && (
                      <button
                        type="button"
                        onClick={() => setShowNewChat(true)}
                        className="mx-auto mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-500 active:scale-[0.98]"
                      >
                        <FaPlus size={11} />
                        Nova conversa
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* CABEÇALHO DA CONVERSA */}

                  <div
                    className={`flex min-h-[76px] shrink-0 items-center justify-between gap-3 border-b border-white/[0.07] px-3 sm:px-5 ${
                      isWhatsAppConversation ? 'bg-[#0e1715]' : 'bg-[#10141d]'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-500 transition hover:bg-white/[0.06] hover:text-white lg:hidden"
                        aria-label="Voltar para conversas"
                      >
                        <FaChevronLeft size={14} />
                      </button>

                      <div className="relative shrink-0">
                        <div
                          className={`flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border ${
                            isWhatsAppConversation
                              ? 'border-emerald-500/20 bg-emerald-500/[0.06]'
                              : 'border-white/[0.08] bg-[#1a202c]'
                          }`}
                        >
                          {getConversationAvatar(currentConversation) ? (
                            <img
                              src={getConversationAvatar(currentConversation)}
                              alt={getSafeConversationName(currentConversation)}
                              className="h-full w-full object-cover"
                            />
                          ) : isWhatsAppConversation ? (
                            <FaWhatsapp
                              size={20}
                              className="text-emerald-400"
                            />
                          ) : isCurrentChannel ? (
                            <FaUsers size={18} className="text-blue-300" />
                          ) : (
                            <span className="text-xs font-bold text-gray-300">
                              {getInitials(
                                getSafeConversationName(currentConversation),
                              )}
                            </span>
                          )}
                        </div>

                        {!isWhatsAppConversation &&
                          !isCurrentChannel &&
                          getOtherParticipant(currentConversation) && (
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#10141d] ${
                                isUserOnline(
                                  getOtherParticipant(currentConversation)?._id,
                                )
                                  ? 'bg-emerald-400'
                                  : 'bg-gray-700'
                              }`}
                            />
                          )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex min-w-0 flex-wrap items-center gap-1.5 sm:gap-2">
                          {isWhatsAppConversation &&
                          getConversationLeadId(currentConversation) ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenLeadDetails(currentConversation)
                              }
                              className="group inline-flex min-w-0 max-w-full items-center gap-1.5 text-left"
                              title="Abrir detalhes do lead"
                              aria-label={`Abrir detalhes do lead: ${getSafeConversationName(
                                currentConversation,
                              )}`}
                            >
                              <span className="truncate text-sm font-bold text-white transition-colors group-hover:text-blue-300">
                                {getSafeConversationName(currentConversation)}
                              </span>
                              <FaInfoCircle
                                size={11}
                                className="shrink-0 text-gray-600 transition-colors group-hover:text-blue-300"
                              />
                            </button>
                          ) : !isWhatsAppConversation &&
                            !isCurrentChannel &&
                            isBrokerParticipant(
                              getOtherParticipant(currentConversation),
                            ) &&
                            getParticipantId(
                              getOtherParticipant(currentConversation),
                            ) ? (
                            <button
                              type="button"
                              onClick={() =>
                                handleOpenBrokerDetails(
                                  getOtherParticipant(currentConversation),
                                )
                              }
                              className="group inline-flex min-w-0 max-w-full items-center gap-1.5 text-left"
                              title="Abrir detalhes do corretor"
                              aria-label={`Abrir detalhes do corretor: ${getSafeConversationName(
                                currentConversation,
                              )}`}
                            >
                              <span className="truncate text-sm font-bold text-white transition-colors group-hover:text-blue-300">
                                {getSafeConversationName(currentConversation)}
                              </span>
                              <FaInfoCircle
                                size={11}
                                className="shrink-0 text-gray-600 transition-colors group-hover:text-blue-300"
                              />
                            </button>
                          ) : (
                            <p className="max-w-full truncate text-sm font-bold text-white">
                              {getSafeConversationName(currentConversation)}
                            </p>
                          )}

                          {isWhatsAppConversation && (
                            <span className="hidden shrink-0 items-center gap-1 rounded-md border border-emerald-500/15 bg-emerald-500/[0.08] px-1.5 py-0.5 text-[9px] font-bold text-emerald-300 sm:inline-flex">
                              <FaWhatsapp size={9} />
                              WHATSAPP
                            </span>
                          )}

                          {isCurrentChannel && (
                            <span className="hidden shrink-0 items-center gap-1 rounded-md border border-blue-500/15 bg-blue-500/[0.08] px-1.5 py-0.5 text-[9px] font-bold text-blue-300 sm:inline-flex">
                              <FaUsers size={9} />
                              EQUIPE
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex min-w-0 items-center gap-1.5">
                          {isWhatsAppConversation ? (
                            <>
                              <FaWhatsapp
                                size={9}
                                className="shrink-0 text-emerald-400"
                              />
                              <span className="truncate text-[10px] text-gray-500">
                                {getSafeConversationSubtitle(
                                  currentConversation,
                                ) || 'WhatsApp'}
                              </span>
                            </>
                          ) : isCurrentChannel ? (
                            <>
                              <FaUsers size={9} className="text-gray-500" />
                              <span className="text-[10px] text-gray-500">
                                {currentParticipantCount} participantes
                              </span>

                              {currentOnlineParticipantCount > 0 && (
                                <span className="text-[10px] text-emerald-400/80">
                                  · {currentOnlineParticipantCount} online
                                </span>
                              )}
                            </>
                          ) : (
                            <>
                              <FaCircle
                                size={6}
                                className={
                                  getOtherParticipant(currentConversation) &&
                                  isUserOnline(
                                    getOtherParticipant(currentConversation)
                                      ?._id,
                                  )
                                    ? 'text-emerald-400'
                                    : 'text-gray-700'
                                }
                              />
                              <span className="text-[10px] text-gray-500">
                                {getOtherParticipant(currentConversation) &&
                                isUserOnline(
                                  getOtherParticipant(currentConversation)?._id,
                                )
                                  ? 'Online agora'
                                  : 'Offline'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowConversationDetails((previous) => !previous);
                          setShowParticipants(false);
                        }}
                        className={`flex h-9 items-center justify-center gap-2 rounded-xl border px-2.5 text-[11px] font-semibold transition sm:px-3 ${
                          showConversationDetails
                            ? isWhatsAppConversation
                              ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200'
                              : 'border-blue-500/25 bg-blue-500/10 text-blue-200'
                            : 'border-white/[0.07] bg-white/[0.025] text-gray-400 hover:bg-white/[0.06] hover:text-white'
                        }`}
                        aria-label="Dados da conversa"
                        aria-expanded={showConversationDetails}
                        title="Dados da conversa"
                      >
                        <FaInfoCircle size={13} />
                        <span className="hidden sm:inline">
                          Dados da conversa
                        </span>
                      </button>

                      {isCurrentChannel && !isWhatsAppConversation && (
                        <button
                          type="button"
                          onClick={() => setShowParticipants(true)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition hover:bg-white/[0.06] hover:text-white"
                          aria-label="Ver participantes"
                          title="Participantes"
                        >
                          <FaUsers size={14} />
                        </button>
                      )}

                      {!isWhatsAppConversation && (
                        <button
                          type="button"
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition hover:bg-white/[0.06] hover:text-white"
                          aria-label="Mais opções"
                          title="Mais opções"
                        >
                          <FaEllipsisV size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* LISTA DE MENSAGENS */}

                  <div
                    ref={messagesContainerRef}
                    onScroll={handleMessagesScroll}
                    className="relative flex-1 space-y-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.012),transparent_65%)] px-3 py-5 scrollbar-thin scrollbar-thumb-gray-800 sm:px-5 lg:px-6"
                  >
                    {loading ? (
                      <div className="flex h-full flex-col items-center justify-center">
                        <div
                          className={`h-7 w-7 animate-spin rounded-full border-2 border-t-transparent ${
                            isWhatsAppConversation
                              ? 'border-emerald-500'
                              : 'border-blue-500'
                          }`}
                        />
                        <span className="mt-3 text-xs text-gray-600">
                          Carregando mensagens...
                        </span>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center text-center">
                        <div
                          className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border ${
                            isWhatsAppConversation
                              ? 'border-emerald-500/15 bg-emerald-500/[0.06]'
                              : 'border-white/[0.07] bg-white/[0.025]'
                          }`}
                        >
                          {isWhatsAppConversation ? (
                            <FaWhatsapp
                              size={23}
                              className="text-emerald-400"
                            />
                          ) : (
                            <FaComments size={23} className="text-gray-500" />
                          )}
                        </div>

                        <p className="text-sm font-semibold text-gray-300">
                          {isWhatsAppConversation
                            ? 'Início da conversa no WhatsApp'
                            : 'Início da conversa'}
                        </p>

                        <p className="mt-1 text-xs text-gray-600">
                          Envie uma mensagem para começar.
                        </p>
                      </div>
                    ) : (
                      messages.map((message, index) => {
                        if (!message?._id) return null;

                        const isWhatsAppMessage =
                          isWhatsAppConversation &&
                          message.senderType === 'whatsapp_contact';

                        const senderId = (
                          message.sender?._id || message.sender
                        )?.toString();

                        const isOwn = isWhatsAppConversation
                          ? message.direction === 'outbound' ||
                            (message.senderType === 'user' &&
                              senderId === user?._id?.toString())
                          : senderId === user?._id?.toString();

                        const previousMessage = messages[index - 1];

                        const showDateHeader =
                          index === 0 ||
                          formatDate(previousMessage?.createdAt) !==
                            formatDate(message.createdAt);

                        const contact =
                          message.whatsappContact ||
                          currentConversation?.whatsappContact ||
                          {};

                        const senderName = isWhatsAppMessage
                          ? contact.name ||
                            getSafeConversationName(currentConversation) ||
                            'Contato WhatsApp'
                          : message.sender?.name || 'Membro';

                        const senderAvatar = isWhatsAppMessage
                          ? contact.avatar || null
                          : message.sender?.avatar || null;

                        /*
                        ====================================================
                        DETECTAR IMAGENS, GIFS E ARQUIVOS
                        ====================================================
                        */

                        const messageContent = String(
                          message?.content || '',
                        ).trim();

                        const attachmentMimeType = String(
                          message?.attachment?.mimeType || '',
                        ).toLowerCase();

                        const contentLooksLikeImage =
                          /\.(gif|jpe?g|png|webp|bmp|svg)(?:[?#].*)?$/i.test(
                            messageContent,
                          ) || /(?:klipy|giphy|tenor)/i.test(messageContent);

                        const attachmentUrl =
                          message?.attachment?.url ||
                          (message?.type === 'image' &&
                          isHttpUrl(messageContent)
                            ? messageContent
                            : '') ||
                          (isHttpUrl(messageContent) && contentLooksLikeImage
                            ? messageContent
                            : '');

                        const isImageMessage =
                          message?.type === 'image' ||
                          attachmentMimeType.startsWith('image/') ||
                          Boolean(attachmentUrl && contentLooksLikeImage);

                        const isAudioMessage =
                          message?.type === 'audio' ||
                          attachmentMimeType.startsWith('audio/');
                        const isVideoMessage =
                          message?.type === 'video' ||
                          attachmentMimeType.startsWith('video/');
                        const isFileMessage = message?.type === 'file';

                        const placeholderContents = [
                          'Imagem',
                          'Imagem recebida',
                          'Arquivo',
                          'Arquivo recebido',
                          'GIF',
                          'GIF enviado',
                          message?.attachment?.name,
                          `Áudio: ${message?.attachment?.name || ''}`,
                          `Vídeo: ${message?.attachment?.name || ''}`,
                          `Imagem: ${message?.attachment?.name || ''}`,
                          `Arquivo: ${message?.attachment?.name || ''}`,
                        ]
                          .filter(Boolean)
                          .map((value) => String(value).trim());

                        const shouldShowText =
                          Boolean(messageContent) &&
                          messageContent !== attachmentUrl &&
                          !placeholderContents.includes(messageContent) &&
                          !(
                            (isImageMessage ||
                              isAudioMessage ||
                              isVideoMessage ||
                              isFileMessage) &&
                            (isHttpUrl(messageContent) ||
                              /^(Áudio|Vídeo|Imagem|Arquivo):\s/i.test(
                                messageContent,
                              ))
                          );

                        return (
                          <div key={message._id}>
                            {showDateHeader && (
                              <div className="my-5 flex items-center justify-center gap-3">
                                <span className="h-px w-8 bg-white/[0.06]" />
                                <span className="rounded-full border border-white/[0.07] bg-[#151923] px-3 py-1 text-[10px] font-medium text-gray-500">
                                  {formatDate(message.createdAt)}
                                </span>
                                <span className="h-px w-8 bg-white/[0.06]" />
                              </div>
                            )}

                            <div
                              className={`mb-3 flex ${
                                isOwn ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <div
                                className={`flex max-w-[94%] items-end gap-2 sm:max-w-[76%] ${
                                  isOwn ? 'flex-row-reverse' : 'flex-row'
                                }`}
                              >
                                {!isOwn && (
                                  <div
                                    className={`mb-1 flex h-8 w-8 shrink-0 items-center justify-center self-end overflow-hidden rounded-xl border shadow-sm ${
                                      isWhatsAppMessage
                                        ? 'border-emerald-500/20 bg-emerald-500/[0.08]'
                                        : 'border-white/[0.09] bg-gradient-to-br from-[#202838] to-[#141a25]'
                                    }`}
                                    title={senderName}
                                  >
                                    {senderAvatar ? (
                                      <img
                                        src={senderAvatar}
                                        alt={senderName}
                                        loading="lazy"
                                        className="h-full w-full object-cover"
                                        onError={(event) => {
                                          event.currentTarget.style.display =
                                            'none';
                                        }}
                                      />
                                    ) : isWhatsAppMessage ? (
                                      <FaWhatsapp
                                        size={14}
                                        className="text-emerald-400"
                                      />
                                    ) : (
                                      <span className="text-[10px] font-bold tracking-wide text-gray-300">
                                        {getInitials(senderName)}
                                      </span>
                                    )}
                                  </div>
                                )}

                                <div
                                  className={`min-w-0 rounded-2xl px-3.5 py-3 shadow-lg sm:px-4 ${
                                    isOwn
                                      ? isWhatsAppConversation
                                        ? 'rounded-br-md border border-emerald-400/10 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-emerald-950/10'
                                        : 'rounded-br-md border border-blue-400/10 bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-blue-950/10'
                                      : 'rounded-bl-md border border-white/[0.07] bg-[#171c27] text-gray-100 shadow-black/10'
                                  }`}
                                >
                                  {!isOwn &&
                                    (isCurrentChannel || isWhatsAppMessage) && (
                                      <p
                                        className={`mb-1.5 text-[11px] font-semibold ${
                                          isWhatsAppMessage
                                            ? 'text-emerald-300'
                                            : 'text-blue-300'
                                        }`}
                                      >
                                        {senderName}
                                      </p>
                                    )}

                                  {/* IMAGEM OU GIF */}

                                  {isImageMessage && attachmentUrl && (
                                    <a
                                      href={attachmentUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="mb-1 block w-fit max-w-full overflow-hidden rounded-xl border border-white/[0.06] bg-black/20"
                                      title="Abrir imagem em tamanho original"
                                    >
                                      <img
                                        src={attachmentUrl}
                                        alt={
                                          attachmentMimeType === 'image/gif'
                                            ? 'GIF enviado'
                                            : 'Imagem enviada'
                                        }
                                        loading="lazy"
                                        className="block h-auto max-h-[190px] max-w-[240px] rounded-xl object-contain transition-opacity duration-200 hover:opacity-90 sm:max-h-[210px] sm:max-w-[280px]"
                                        onError={(event) => {
                                          event.currentTarget.style.display =
                                            'none';
                                        }}
                                      />
                                    </a>
                                  )}

                                  {/* ÁUDIO */}

                                  {isAudioMessage && attachmentUrl && (
                                    <div className="mb-1 min-w-[220px] max-w-full rounded-xl border border-white/[0.08] bg-black/15 p-2.5 sm:min-w-[280px]">
                                      <div className="mb-2 flex items-center gap-2 text-xs font-semibold">
                                        <FaMicrophone size={12} />
                                        <span className="truncate">
                                          {message?.attachment?.name ||
                                            'Mensagem de áudio'}
                                        </span>
                                      </div>
                                      <audio
                                        controls
                                        preload="metadata"
                                        className="h-9 w-full max-w-[320px]"
                                        src={attachmentUrl}
                                      >
                                        Seu navegador não suporta reprodução de
                                        áudio.
                                      </audio>
                                      {message?.attachment?.size ? (
                                        <p className="mt-1 text-[10px] opacity-70">
                                          {formatFileSize(
                                            message.attachment.size,
                                          )}
                                        </p>
                                      ) : null}
                                    </div>
                                  )}

                                  {/* VÍDEO */}

                                  {isVideoMessage && attachmentUrl && (
                                    <div className="mb-1 max-w-full overflow-hidden rounded-xl border border-white/[0.08] bg-black/20">
                                      <video
                                        controls
                                        preload="metadata"
                                        playsInline
                                        className="max-h-[320px] w-full max-w-[360px] rounded-xl"
                                        src={attachmentUrl}
                                      >
                                        Seu navegador não suporta reprodução de
                                        vídeo.
                                      </video>
                                      <a
                                        href={attachmentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block truncate px-3 py-2 text-xs underline underline-offset-2"
                                      >
                                        {message?.attachment?.name ||
                                          'Abrir vídeo'}
                                      </a>
                                    </div>
                                  )}

                                  {/* ARQUIVO */}

                                  {isFileMessage && attachmentUrl && (
                                    <a
                                      href={attachmentUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="mb-1 flex items-center gap-2 rounded-xl border border-white/[0.07] bg-black/15 px-3 py-2.5 text-xs text-blue-300 transition hover:border-blue-400/20 hover:bg-black/25"
                                    >
                                      <FaPaperclip size={12} />

                                      <span className="max-w-[220px] break-all">
                                        {message?.attachment?.name ||
                                          'Abrir arquivo'}
                                      </span>
                                    </a>
                                  )}

                                  {/* TEXTO */}

                                  {shouldShowText && (
                                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                                      {renderMessageWithLinks(messageContent)}
                                    </p>
                                  )}

                                  <div
                                    className={`mt-2 flex items-center justify-end gap-1.5 text-[10px] ${
                                      isOwn
                                        ? isWhatsAppConversation
                                          ? 'text-emerald-100/80'
                                          : 'text-blue-100/80'
                                        : 'text-gray-500'
                                    }`}
                                  >
                                    <span>
                                      {formatMessageTime(message.createdAt)}
                                    </span>

                                    {isOwn &&
                                      !isWhatsAppConversation &&
                                      (message.read ? (
                                        <FaCheckDouble
                                          size={10}
                                          className="text-blue-200"
                                        />
                                      ) : (
                                        <FaCheck
                                          size={10}
                                          className="text-blue-200/70"
                                        />
                                      ))}

                                    {isOwn && isWhatsAppConversation && (
                                      <>
                                        {message.status === 'read' ? (
                                          <FaCheckDouble
                                            size={11}
                                            className="text-sky-200"
                                          />
                                        ) : message.status === 'delivered' ? (
                                          <FaCheckDouble
                                            size={11}
                                            className="text-emerald-100"
                                          />
                                        ) : message.status === 'sent' ? (
                                          <FaCheck
                                            size={10}
                                            className="text-emerald-100"
                                          />
                                        ) : (
                                          <FaClock
                                            size={10}
                                            className="text-emerald-100/60"
                                          />
                                        )}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}

                    {isTypingUser && (
                      <div className="mb-3 flex justify-start">
                        <div className="rounded-2xl rounded-bl-md border border-white/[0.07] bg-[#171c27] px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {[0, 150, 300].map((delay) => (
                              <span
                                key={delay}
                                className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                                style={{ animationDelay: `${delay}ms` }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {showScrollButton && (
                      <button
                        type="button"
                        onClick={() => scrollToBottom('smooth')}
                        className="absolute bottom-5 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#202633] text-gray-200 shadow-xl transition hover:border-white/20 hover:bg-[#2a3242] sm:right-6"
                        title="Ir para a última mensagem"
                        aria-label="Ir para a última mensagem"
                      >
                        <FaArrowDown size={13} />
                      </button>
                    )}
                  </div>

                  {/* CAMPO DE ENVIO COM EMOJIS E GIFS */}

                  <form
                    onSubmit={handleSendMessage}
                    className={`relative z-30 flex shrink-0 items-end gap-2 border-t border-white/[0.07] p-3 sm:gap-3 sm:p-4 ${
                      isWhatsAppConversation ? 'bg-[#0e1715]' : 'bg-[#10141d]'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.zip,.rar"
                      className="hidden"
                      onChange={handleMediaSelected}
                    />

                    {/* ANEXAR ARQUIVO */}
                    <button
                      type="button"
                      disabled={sending || uploadingMedia || isRecordingAudio}
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-[#171c27] text-gray-400 transition hover:border-white/15 hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
                      title="Anexar imagem, vídeo, áudio ou documento"
                      aria-label="Anexar arquivo"
                    >
                      {uploadingMedia ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <FaPaperclip size={15} />
                      )}
                    </button>

                    {/* GRAVAR ÁUDIO */}
                    <button
                      type="button"
                      disabled={sending || uploadingMedia}
                      onClick={
                        isRecordingAudio
                          ? stopAudioRecording
                          : startAudioRecording
                      }
                      className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition disabled:opacity-40 ${isRecordingAudio ? 'border-red-500/40 bg-red-500/15 text-red-300' : 'border-white/[0.07] bg-[#171c27] text-gray-400 hover:border-white/15 hover:bg-white/[0.06] hover:text-white'}`}
                      title={
                        isRecordingAudio
                          ? `Parar gravação (${formatRecordingTime(recordingSeconds)})`
                          : 'Gravar áudio'
                      }
                      aria-label={
                        isRecordingAudio
                          ? 'Parar gravação de áudio'
                          : 'Gravar áudio'
                      }
                    >
                      {isRecordingAudio ? (
                        <FaStop size={12} />
                      ) : (
                        <FaMicrophone size={15} />
                      )}
                    </button>

                    {/* SELETOR DE EMOJIS */}

                    <div ref={emojiPickerRef} className="relative shrink-0">
                      {showEmojiPicker && (
                        <div className="absolute bottom-[calc(100%+12px)] left-0 z-[70] w-[min(320px,calc(100vw-28px))] overflow-hidden rounded-2xl border border-white/10 bg-[#101116] shadow-2xl shadow-black/60 animate-in fade-in slide-in-from-bottom-2 duration-150">
                          <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
                            <div>
                              <p className="text-sm font-semibold text-white">
                                Emojis
                              </p>
                              <p className="mt-0.5 text-[11px] text-gray-500">
                                Reaja e deixe suas mensagens mais expressivas
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => setShowEmojiPicker(false)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white/[0.07] hover:text-white"
                              aria-label="Fechar seletor de emojis"
                            >
                              <FaTimes size={12} />
                            </button>
                          </div>

                          <div className="grid max-h-56 grid-cols-8 gap-1 overflow-y-auto p-3">
                            {EMOJIS.map((emoji, index) => (
                              <button
                                key={`${emoji}-${index}`}
                                type="button"
                                onClick={() => insertEmoji(emoji)}
                                className="flex aspect-square items-center justify-center rounded-lg text-xl transition hover:scale-110 hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                aria-label={`Inserir emoji ${emoji}`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>

                          <div className="border-t border-white/[0.07] px-3 py-2">
                            <p className="text-center text-[10px] text-gray-600">
                              Selecione um emoji para inserir na mensagem
                            </p>
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setShowEmojiPicker((previous) => !previous);
                          setShowGifPicker(false);
                        }}
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition ${
                          showEmojiPicker
                            ? isWhatsAppConversation
                              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                              : 'border-blue-500/30 bg-blue-500/10 text-blue-300'
                            : 'border-white/[0.07] bg-[#171c27] text-gray-400 hover:border-white/15 hover:bg-white/[0.06] hover:text-white'
                        }`}
                        aria-label="Inserir emoji"
                        aria-expanded={showEmojiPicker}
                        title="Inserir emoji"
                      >
                        <FaSmile size={17} />
                      </button>
                    </div>

                    {/* SELETOR DE GIFS */}

                    <div ref={gifPickerRef} className="relative shrink-0">
                      {showGifPicker && (
                        <div className="absolute bottom-[calc(100%+12px)] left-0 z-[70] w-[min(310px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-white/[0.1] bg-[#101116] shadow-2xl shadow-black/60 animate-in fade-in slide-in-from-bottom-2 duration-150">
                          {/* Cabeçalho próprio do seletor */}

                          <div className="flex items-center justify-between border-b border-white/[0.07] bg-gradient-to-r from-[#15171e] to-[#101116] px-4 py-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-500/[0.12]">
                                <span className="text-[11px] font-black tracking-wide text-indigo-300">
                                  GIF
                                </span>
                              </div>

                              <div className="min-w-0">
                                <h3 className="text-xs font-semibold text-gray-100">
                                  Escolha um GIF
                                </h3>
                                <p className="mt-0.5 text-[9px] text-gray-500">
                                  Encontre a reação perfeita
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setShowGifPicker(false)}
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-transparent text-gray-500 transition hover:border-white/[0.06] hover:bg-white/[0.06] hover:text-gray-200 active:scale-95"
                              title="Fechar seletor de GIFs"
                              aria-label="Fechar seletor de GIFs"
                            >
                              <FaTimes size={12} />
                            </button>
                          </div>

                          {/* Biblioteca de GIFs */}

                          <div className="gif-picker-dark-surface bg-[#101116] p-1.5">
                            <GifPicker
                              provider={Klipy(
                                'H9jbrsVDruuiPMCdinhGLHKgvl1aUsoRnmT5o4MTtmuDLZRMZQXLeZ8s3Jcp5kA6',
                              )}
                              onGifClick={handleGifSelected}
                              width="100%"
                              height={250}
                              theme="dark"
                            />
                          </div>

                          <div className="flex items-center justify-between border-t border-white/[0.06] px-3 py-2">
                            <span className="text-[9px] text-gray-500">
                              Selecione um GIF para enviar
                            </span>

                            <span className="rounded-md border border-white/[0.07] bg-white/[0.03] px-1.5 py-1 text-[8px] font-medium text-gray-500">
                              KLIPY
                            </span>
                          </div>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setShowGifPicker((previous) => !previous);
                          setShowEmojiPicker(false);
                        }}
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-[10px] font-extrabold tracking-wide transition ${
                          showGifPicker
                            ? 'border-indigo-400/25 bg-indigo-500/[0.12] text-indigo-300 shadow-sm shadow-indigo-950/30'
                            : 'border-white/[0.07] bg-[#171c27] text-gray-400 hover:border-white/15 hover:bg-white/[0.06] hover:text-white'
                        }`}
                        title="Enviar GIF"
                        aria-label="Enviar GIF"
                        aria-expanded={showGifPicker}
                      >
                        GIF
                      </button>
                    </div>

                    {/* STATUS DE UPLOAD / GRAVAÇÃO */}
                    {(mediaError || isRecordingAudio || uploadingMedia) && (
                      <div className="absolute bottom-full left-3 right-3 mb-2 rounded-xl border border-white/[0.08] bg-[#171c27] px-3 py-2 text-[11px] shadow-xl sm:left-4 sm:right-4">
                        {mediaError ? (
                          <div className="flex items-center justify-between gap-2 text-red-300">
                            <span>{mediaError}</span>
                            <button
                              type="button"
                              onClick={() => setMediaError('')}
                              aria-label="Fechar aviso"
                            >
                              <FaTimes size={11} />
                            </button>
                          </div>
                        ) : uploadingMedia ? (
                          <span className="text-blue-200">
                            Enviando mídia… aguarde.
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-red-300">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />{' '}
                            Gravando áudio{' '}
                            {formatRecordingTime(recordingSeconds)} · clique em
                            parar para enviar
                          </span>
                        )}
                      </div>
                    )}

                    {/* INPUT */}

                    <div className="min-w-0 flex-1">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputMessage}
                        onChange={handleTyping}
                        onKeyDown={(event) => {
                          if (event.key === 'Escape') {
                            setShowEmojiPicker(false);
                            setShowGifPicker(false);
                          }
                        }}
                        placeholder={
                          isWhatsAppConversation
                            ? 'Digite uma mensagem para o WhatsApp...'
                            : 'Digite sua mensagem...'
                        }
                        className={`h-11 w-full rounded-xl border border-white/[0.07] bg-[#080b11] px-3.5 text-sm text-white outline-none transition placeholder:text-gray-600 focus:ring-4 sm:px-4 ${
                          isWhatsAppConversation
                            ? 'focus:border-emerald-500/40 focus:ring-emerald-500/[0.06]'
                            : 'focus:border-blue-500/40 focus:ring-blue-500/[0.06]'
                        }`}
                      />
                    </div>

                    {/* ENVIAR */}

                    <button
                      type="submit"
                      disabled={
                        !inputMessage.trim() ||
                        sending ||
                        uploadingMedia ||
                        isRecordingAudio
                      }
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-lg transition active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-35 ${
                        isWhatsAppConversation
                          ? 'bg-emerald-600 shadow-emerald-950/20 hover:bg-emerald-500'
                          : 'bg-blue-600 shadow-blue-950/20 hover:bg-blue-500'
                      }`}
                      aria-label="Enviar mensagem"
                    >
                      {sending ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <FaPaperPlane size={14} />
                      )}
                    </button>
                  </form>
                </>
              )}
            </main>
          </div>
        </div>

        {/* PAINEL DE DADOS DA CONVERSA */}

        {showConversationDetails && currentConversation && (
          <div className="fixed inset-0 z-[60] flex">
            <button
              type="button"
              aria-label="Fechar dados da conversa"
              onClick={() => setShowConversationDetails(false)}
              className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            />

            <aside className="relative ml-auto flex h-full w-[380px] max-w-[94vw] flex-col border-l border-white/[0.08] bg-[#0c1017] shadow-2xl">
              <div className="flex min-h-[76px] shrink-0 items-center justify-between border-b border-white/[0.07] px-5">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                      isWhatsAppConversation
                        ? 'border-emerald-500/20 bg-emerald-500/[0.08] text-emerald-300'
                        : 'border-blue-500/20 bg-blue-500/[0.08] text-blue-300'
                    }`}
                  >
                    {isWhatsAppConversation ? (
                      <FaWhatsapp size={17} />
                    ) : (
                      <FaRegComments size={17} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Dados da conversa
                    </h3>
                    <p className="mt-1 text-[10px] text-gray-500">
                      Informações e participantes
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConversationDetails(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition hover:bg-white/[0.06] hover:text-white"
                  aria-label="Fechar dados da conversa"
                >
                  <FaTimes size={13} />
                </button>
              </div>

              <div className="scrollbar-thin scrollbar-thumb-gray-800 flex-1 space-y-5 overflow-y-auto p-5">
                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border ${
                        isWhatsAppConversation
                          ? 'border-emerald-500/20 bg-emerald-500/[0.08]'
                          : 'border-blue-500/20 bg-blue-500/[0.08]'
                      }`}
                    >
                      {getConversationAvatar(currentConversation) ? (
                        <img
                          src={getConversationAvatar(currentConversation)}
                          alt={getSafeConversationName(currentConversation)}
                          className="h-full w-full object-cover"
                        />
                      ) : isWhatsAppConversation ? (
                        <FaWhatsapp size={20} className="text-emerald-300" />
                      ) : isCurrentChannel ? (
                        <FaUsers size={18} className="text-blue-300" />
                      ) : (
                        <span className="text-sm font-bold text-blue-200">
                          {getInitials(
                            getSafeConversationName(currentConversation),
                          )}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="break-words text-sm font-bold text-white">
                        {getSafeConversationName(currentConversation)}
                      </p>
                      <span
                        className={`mt-1 inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[9px] font-bold uppercase ${
                          isWhatsAppConversation
                            ? 'border-emerald-500/15 bg-emerald-500/[0.07] text-emerald-300'
                            : 'border-blue-500/15 bg-blue-500/[0.07] text-blue-300'
                        }`}
                      >
                        {isWhatsAppConversation ? (
                          <FaWhatsapp size={9} />
                        ) : isCurrentChannel ? (
                          <FaUsers size={9} />
                        ) : (
                          <FaComments size={9} />
                        )}
                        {isWhatsAppConversation
                          ? 'WhatsApp'
                          : isCurrentChannel
                            ? 'Canal da equipe'
                            : 'Chat interno'}
                      </span>
                    </div>
                  </div>
                  {getSafeConversationSubtitle(currentConversation) && (
                    <p className="mt-3 break-words text-xs leading-relaxed text-gray-400">
                      {getSafeConversationSubtitle(currentConversation)}
                    </p>
                  )}
                  {getConversationLeadId(currentConversation) &&
                    isWhatsAppConversation && (
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenLeadDetails(currentConversation)
                        }
                        className="mt-3 inline-flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/[0.08] px-3 py-2 text-xs font-semibold text-blue-200 transition hover:bg-blue-500/[0.14]"
                      >
                        <FaInfoCircle size={11} />
                        Abrir cadastro do lead
                      </button>
                    )}
                </div>

                <div className="space-y-2">
                  <p className="px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">
                    Atividade
                  </p>
                  <div className="rounded-xl border border-white/[0.06] bg-[#090c12] p-3.5">
                    <div className="flex items-start gap-3">
                      <FaCalendarAlt
                        className="mt-0.5 text-gray-500"
                        size={13}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] text-gray-500">Criada em</p>
                        <p className="mt-1 text-xs font-medium text-gray-200">
                          {getConversationCreatedAt(currentConversation)
                            ? new Date(
                                getConversationCreatedAt(currentConversation),
                              ).toLocaleString('pt-BR', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })
                            : 'Data não disponível'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-[#090c12] p-3.5">
                    <div className="flex items-start gap-3">
                      <FaClock className="mt-0.5 text-gray-500" size={13} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] text-gray-500">
                          Última atividade
                        </p>
                        <p className="mt-1 text-xs font-medium text-gray-200">
                          {getConversationLastActivity(currentConversation)
                            ? new Date(
                                getConversationLastActivity(
                                  currentConversation,
                                ),
                              ).toLocaleString('pt-BR', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })
                            : 'Nenhuma atividade registrada'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-[#090c12] p-3.5">
                    <div className="flex items-start gap-3">
                      <FaRegComments
                        className="mt-0.5 text-gray-500"
                        size={13}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] text-gray-500">
                          Mensagens carregadas
                        </p>
                        <p className="mt-1 text-xs font-medium text-gray-200">
                          {messages.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {!isWhatsAppConversation && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-500">
                        Participantes
                      </p>
                      <span className="text-[10px] text-gray-500">
                        {currentParticipantCount}
                      </span>
                    </div>
                    {currentParticipants.length ? (
                      currentParticipants.map((participant) => {
                        const participantId = getParticipantId(participant);
                        const participantName = participant?.name || 'Usuário';
                        const online = isUserOnline(participantId);
                        return (
                          <div
                            key={participantId || participantName}
                            className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#090c12] p-3"
                          >
                            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/[0.07] bg-[#171c27]">
                              {participant?.avatar ? (
                                <img
                                  src={participant.avatar}
                                  alt={participantName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-[10px] font-bold text-gray-300">
                                  {getInitials(participantName)}
                                </span>
                              )}
                              <span
                                className={`absolute bottom-0.5 right-0.5 h-2 w-2 rounded-full border border-[#090c12] ${online ? 'bg-emerald-400' : 'bg-gray-700'}`}
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-semibold text-gray-200">
                                {participantName}
                                {participantId === user?._id?.toString()
                                  ? ' (Você)'
                                  : ''}
                              </p>
                              <p className="mt-1 text-[10px] text-gray-500">
                                {getRoleLabel(participant?.role)} ·{' '}
                                {online ? 'Online' : 'Offline'}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="rounded-xl border border-white/[0.06] bg-[#090c12] p-4 text-xs text-gray-500">
                        Nenhum participante encontrado.
                      </p>
                    )}
                  </div>
                )}

                <div className="rounded-xl border border-blue-500/10 bg-blue-500/[0.04] p-3">
                  <div className="flex items-center gap-2 text-blue-200">
                    <FaLink size={12} />
                    <span className="text-[11px] font-semibold">
                      Links nas mensagens
                    </span>
                  </div>
                  <p className="mt-1.5 text-[10px] leading-relaxed text-gray-400">
                    Endereços HTTP, HTTPS e links iniciados por www. são
                    reconhecidos automaticamente e abertos em uma nova aba.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* PAINEL DE PARTICIPANTES */}

        {showParticipants && isCurrentChannel && !isWhatsAppConversation && (
          <div className="fixed inset-0 z-[60] flex">
            <button
              type="button"
              aria-label="Fechar participantes"
              onClick={() => setShowParticipants(false)}
              className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            />

            <aside className="relative ml-auto flex h-full w-[360px] max-w-[92vw] flex-col border-l border-white/[0.08] bg-[#0c1017] shadow-2xl">
              <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-white/[0.07] px-5">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Participantes
                  </h3>
                  <p className="mt-1 text-[10px] text-gray-500">
                    {currentParticipantCount} participantes
                    {currentOnlineParticipantCount > 0
                      ? ` · ${currentOnlineParticipantCount} online`
                      : ''}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowParticipants(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition hover:bg-white/[0.06] hover:text-white"
                  aria-label="Fechar"
                >
                  <FaTimes size={13} />
                </button>
              </div>

              <div className="scrollbar-thin scrollbar-thumb-gray-800 flex-1 overflow-y-auto p-3">
                {currentParticipants.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-xs text-gray-600">
                    Nenhum participante encontrado.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {currentParticipants.map((participant) => {
                      const id = participant?._id?.toString();
                      const online = isUserOnline(participant?._id);
                      const isCurrentUser = id === user?._id?.toString();
                      const name = participant?.name || 'Usuário';

                      return (
                        <div
                          key={id}
                          className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 transition hover:border-white/[0.04] hover:bg-white/[0.025]"
                        >
                          <div className="relative shrink-0">
                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/[0.07] bg-[#171c27]">
                              {participant?.avatar ? (
                                <img
                                  src={participant.avatar}
                                  alt={name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-[10px] font-bold text-gray-400">
                                  {getInitials(name)}
                                </span>
                              )}
                            </div>

                            <span
                              className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0c1017] ${
                                online ? 'bg-emerald-400' : 'bg-gray-700'
                              }`}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              {isBrokerParticipant(participant) && id ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleOpenBrokerDetails(participant)
                                  }
                                  className="group inline-flex max-w-full items-center gap-1.5 text-left"
                                  title="Abrir detalhes do corretor"
                                  aria-label={`Abrir detalhes do corretor: ${name}`}
                                >
                                  <span className="truncate text-xs font-semibold text-gray-200 transition-colors group-hover:text-blue-300">
                                    {name}
                                  </span>
                                  <FaInfoCircle
                                    size={10}
                                    className="shrink-0 text-gray-600 transition-colors group-hover:text-blue-300"
                                  />
                                </button>
                              ) : (
                                <p className="truncate text-xs font-semibold text-gray-200">
                                  {name}
                                </p>
                              )}

                              {isCurrentUser && (
                                <span className="rounded-md border border-blue-500/15 bg-blue-500/[0.08] px-1.5 py-0.5 text-[8px] font-semibold text-blue-300">
                                  Você
                                </span>
                              )}
                            </div>

                            <p
                              className={`mt-1 text-[10px] ${
                                online ? 'text-emerald-400/80' : 'text-gray-600'
                              }`}
                            >
                              {online ? 'Online' : 'Offline'}
                              {participant?.role
                                ? ` · ${getRoleLabel(participant.role)}`
                                : ''}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}

        {/* MODAL DE NOVA CONVERSA */}

        {showNewChat && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-3 backdrop-blur-md sm:p-5">
            <button
              type="button"
              aria-label="Fechar nova conversa"
              onClick={resetNewChat}
              className="absolute inset-0 cursor-default"
            />

            <div className="relative flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/[0.09] bg-[#0d1018] shadow-2xl shadow-black/50 ring-1 ring-white/[0.025]">
              <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/15 bg-blue-500/[0.08]">
                    <FaComments size={16} className="text-blue-300" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Nova conversa
                    </h3>
                    <p className="mt-0.5 text-[10px] text-gray-500">
                      Conecte-se com sua equipe
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetNewChat}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition hover:bg-white/[0.06] hover:text-white"
                  aria-label="Fechar"
                >
                  <FaTimes size={13} />
                </button>
              </div>

              <div className="border-b border-white/[0.06] bg-[#090c12] p-4 sm:px-6">
                <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/[0.06] bg-[#080b11] p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setNewChatMode('direct');
                      setChannelName('');
                      setSelectedUsers([]);
                    }}
                    className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition ${
                      newChatMode === 'direct'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/20'
                        : 'text-gray-500 hover:bg-white/[0.035] hover:text-gray-200'
                    }`}
                  >
                    <FaUser size={11} />
                    Conversa direta
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewChatMode('channel');
                      setSearch('');
                      setSearchResults([]);
                      setSelectedUsers([]);
                    }}
                    className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition ${
                      newChatMode === 'channel'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/20'
                        : 'text-gray-500 hover:bg-white/[0.035] hover:text-gray-200'
                    }`}
                  >
                    <FaUsers size={12} />
                    Canal da equipe
                  </button>
                </div>
              </div>

              <div className="scrollbar-thin scrollbar-thumb-gray-800 flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
                {newChatMode === 'channel' ? (
                  <div className="space-y-3">
                    <label
                      htmlFor="channel-name"
                      className="block text-xs font-semibold text-gray-300"
                    >
                      Nome do canal
                    </label>

                    <input
                      id="channel-name"
                      type="text"
                      value={channelName}
                      onChange={(event) => setChannelName(event.target.value)}
                      maxLength={80}
                      placeholder="Ex.: Corretores Centro"
                      className="h-11 w-full rounded-xl border border-white/[0.07] bg-[#080b11] px-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/[0.05]"
                    />

                    <div className="rounded-xl border border-blue-500/10 bg-blue-500/[0.04] p-3">
                      <p className="text-[11px] leading-relaxed text-gray-400">
                        Crie um espaço para compartilhar informações sobre
                        negócios, clientes e oportunidades com a equipe.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label
                      htmlFor="user-search"
                      className="block text-xs font-semibold text-gray-300"
                    >
                      Buscar membro
                    </label>

                    <div className="group relative">
                      <FaSearch
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 transition group-focus-within:text-blue-400"
                        size={12}
                      />

                      <input
                        id="user-search"
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Digite o nome do usuário..."
                        className="h-11 w-full rounded-xl border border-white/[0.07] bg-[#080b11] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/[0.05]"
                      />
                    </div>

                    {selectedUsers.length > 0 && (
                      <div className="flex items-center gap-2 rounded-xl border border-blue-500/15 bg-blue-500/[0.06] px-3 py-2">
                        <FaCheckCircle size={12} className="text-blue-300" />
                        <p className="text-[11px] font-medium text-blue-200">
                          {selectedUsers.length} usuário(s) selecionado(s)
                        </p>
                      </div>
                    )}

                    <div className="max-h-64 space-y-2 overflow-y-auto pt-1">
                      {searching ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                        </div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((item) => {
                          const selected = selectedUsers.some(
                            (id) => id?.toString() === item?._id?.toString(),
                          );

                          return (
                            <button
                              key={item._id}
                              type="button"
                              onClick={() => toggleUser(item._id)}
                              className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${
                                selected
                                  ? 'border-blue-500/30 bg-blue-500/[0.07]'
                                  : 'border-white/[0.06] bg-[#090c12] hover:border-white/[0.12] hover:bg-white/[0.025]'
                              }`}
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/[0.06] bg-[#171c27]">
                                  {item.avatar ? (
                                    <img
                                      src={item.avatar}
                                      alt={item.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-[10px] font-bold text-gray-400">
                                      {getInitials(item.name)}
                                    </span>
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-xs font-semibold text-gray-200">
                                    {item.name}
                                  </p>
                                  <p className="mt-1 truncate text-[10px] text-gray-500">
                                    {getRoleLabel(item.role)}
                                  </p>
                                </div>
                              </div>

                              <span
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                                  selected
                                    ? 'border-blue-500 bg-blue-600 text-white'
                                    : 'border-white/10 bg-white/[0.025] text-transparent'
                                }`}
                              >
                                <FaCheck size={9} />
                              </span>
                            </button>
                          );
                        })
                      ) : search.trim().length >= 2 ? (
                        <p className="py-6 text-center text-xs text-gray-500">
                          Nenhum usuário encontrado.
                        </p>
                      ) : (
                        <div className="py-6 text-center">
                          <FaSearch
                            className="mx-auto mb-2 text-gray-700"
                            size={18}
                          />
                          <p className="text-xs text-gray-500">
                            Digite ao menos 2 caracteres para buscar.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-white/[0.07] bg-[#090c12] px-5 py-4 sm:px-6">
                <button
                  type="button"
                  onClick={resetNewChat}
                  disabled={creatingConversation}
                  className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-xs font-semibold text-gray-400 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleCreateConversation}
                  disabled={
                    creatingConversation ||
                    (newChatMode === 'channel'
                      ? !channelName.trim()
                      : selectedUsers.length === 0)
                  }
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-950/20 transition hover:bg-blue-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {creatingConversation && (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  )}
                  {creatingConversation ? 'Criando...' : 'Criar conversa'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

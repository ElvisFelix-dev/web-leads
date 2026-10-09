import { useState, useEffect, useRef, useContext, useMemo } from 'react';

import { useNavigate } from 'react-router-dom';

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
} from 'react-icons/fa';

import { useChat } from '../context/ChatContext';
import { UserContext } from '../context/UserContext';

export default function ChatPage() {
  const navigate = useNavigate();
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
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [sending, setSending] = useState(false);
  const [creatingConversation, setCreatingConversation] = useState(false);

  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const initialScrollConversationRef = useRef(null);
  const previousMessagesCountRef = useRef(0);

  /*
  ============================================================
  RESPONSIVIDADE
  ============================================================
  */

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();

    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  /*
  ============================================================
  CARREGAR CONVERSAS
  ============================================================
  */

  useEffect(() => {
    if (typeof loadConversations === 'function') {
      loadConversations();
    }
  }, [loadConversations]);

  /*
  ============================================================
  SCROLL DAS MENSAGENS
  ============================================================
  */

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

  /*
   * Reinicia o controle ao trocar de conversa.
   */
  useEffect(() => {
    initialScrollConversationRef.current = null;
    previousMessagesCountRef.current = 0;
    setShowScrollButton(false);
    setInputMessage('');
    setIsTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [currentConversation?._id]);

  /*
   * Posicionamento inicial depois que as mensagens carregarem.
   */
  useEffect(() => {
    const conversationId = currentConversation?._id?.toString();

    if (!conversationId || loading) return;

    if (initialScrollConversationRef.current === conversationId) {
      return;
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

  /*
   * Novas mensagens: acompanha o final apenas quando o usuário
   * já estava próximo dele.
   */
  useEffect(() => {
    const conversationId = currentConversation?._id?.toString();
    const container = messagesContainerRef.current;

    if (!conversationId || !container || loading) return;

    if (initialScrollConversationRef.current !== conversationId) {
      return;
    }

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

  /*
  ============================================================
  LIMPEZA
  ============================================================
  */

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  /*
  ============================================================
  BUSCA DE USUÁRIOS
  ============================================================
  */

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

        if (!cancelled) {
          setSearchResults([]);
        }
      } finally {
        if (!cancelled) {
          setSearching(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [search, showNewChat, newChatMode, user?._id, searchUsers]);

  /*
  ============================================================
  FORMATADORES
  ============================================================
  */

  const formatTime = (date) => {
    if (!date) return '';

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) return '';

    const now = new Date();
    const diff = now.getTime() - d.getTime();

    if (diff < 60000 && diff >= 0) return 'Agora';

    if (diff < 3600000 && diff >= 0) {
      return `${Math.floor(diff / 60000)}min`;
    }

    if (diff < 86400000 && diff >= 0) {
      return d.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    if (diff < 604800000 && diff >= 0) {
      return d.toLocaleDateString('pt-BR', {
        weekday: 'short',
      });
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

    if (d.toDateString() === today.toDateString()) {
      return 'Hoje';
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    }

    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getInitials = (name = '') => {
    const parts = String(name).trim().split(/\s+/).filter(Boolean);

    if (!parts.length) return 'U';

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

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

  /*
  ============================================================
  PARTICIPANTES
  ============================================================
  */

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

  /*
  ============================================================
  CONVERSAS FILTRADAS
  ============================================================
  */

  const filteredConversations = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term || showNewChat) return conversations;

    return conversations.filter((conversation) => {
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
    search,
    showNewChat,
    getConversationName,
    getConversationSubtitle,
  ]);

  /*
  ============================================================
  NOVA CONVERSA
  ============================================================
  */

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

    if (newChatMode === 'direct' && selectedUsers.length === 0) {
      return;
    }

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

  /*
  ============================================================
  TYPING
  ============================================================
  */

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

  /*
  ============================================================
  ENVIAR MENSAGEM
  ============================================================
  */

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

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      if (!isWhatsApp) {
        sendTyping(conversationId, false);
      }

      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setSending(false);
    }
  };

  /*
  ============================================================
  SELEÇÃO DE CONVERSA
  ============================================================
  */

  const handleSelectConversation = (conversation) => {
    setShowParticipants(false);
    setIsTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    initialScrollConversationRef.current = null;
    previousMessagesCountRef.current = 0;

    selectConversation(conversation);

    if (isMobile) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  const handleBack = () => {
    setShowParticipants(false);
    setIsTyping(false);
    setInputMessage('');

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    setCurrentConversation(null);
  };

  /*
  ============================================================
  ESTADO DA CONVERSA ATUAL
  ============================================================
  */

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

  /*
  ============================================================
  RENDER
  ============================================================
  */

  return (
    <div className="chat-scroll min-h-screen bg-[#080b11] text-white">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-blue-600/[0.035] blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-emerald-600/[0.025] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        {/* HEADER */}

        <header className="mb-5 flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-800 bg-[#0d1119] text-gray-500 transition hover:bg-gray-800 hover:text-white"
              aria-label="Voltar"
            >
              <FaChevronLeft size={15} />
            </button>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/10 bg-blue-600/10">
              <FaComments className="text-blue-400" size={17} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-xl font-bold lg:text-2xl">
                  Mensagens
                </h1>

                {unreadCount > 0 && (
                  <span className="shrink-0 rounded-full border border-blue-500/20 bg-blue-600/15 px-2 py-0.5 text-[10px] font-bold text-blue-400">
                    {unreadCount} novas
                  </span>
                )}
              </div>

              <p className="mt-0.5 text-xs text-gray-500 lg:text-sm">
                Comunicação interna e WhatsApp da equipe
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowNewChat(true)}
            className="flex h-10 shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-3 text-xs font-semibold text-white shadow-lg shadow-blue-600/10 transition hover:bg-blue-500 lg:h-11 lg:px-4 lg:text-sm"
          >
            <FaPlus size={12} />
            <span className="hidden sm:inline">Nova conversa</span>
          </button>
        </header>

        {/* CHAT PRINCIPAL */}

        <div className="flex h-[calc(100dvh-205px)] min-h-[520px] overflow-hidden rounded-2xl border border-gray-800/80 bg-[#0d1119] shadow-2xl shadow-black/20">
          <div className="flex h-full w-full">
            {/* SIDEBAR */}

            <aside
              className={`${
                currentConversation && isMobile ? 'hidden' : 'flex'
              } w-full shrink-0 flex-col border-r border-gray-800/80 bg-[#0b0f16] lg:flex lg:w-[360px] xl:w-[390px]`}
            >
              <div className="border-b border-gray-800/80 p-4">
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
                    className="h-10 w-full rounded-xl border border-gray-800 bg-[#080b11] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/5"
                  />
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
                  <div className="flex h-full flex-col items-center justify-center px-8 text-center">
                    <FaComments className="mb-4 text-gray-600" size={28} />

                    <p className="text-sm font-semibold text-gray-400">
                      {search
                        ? 'Nenhuma conversa encontrada'
                        : 'Nenhuma conversa'}
                    </p>

                    <p className="mt-1.5 text-xs leading-relaxed text-gray-600">
                      {search
                        ? 'Tente buscar outro nome ou mensagem.'
                        : 'Comece uma nova conversa com sua equipe.'}
                    </p>

                    <button
                      type="button"
                      onClick={() => setShowNewChat(true)}
                      className="mt-5 rounded-lg border border-blue-500/20 bg-blue-600/10 px-3.5 py-2 text-xs font-semibold text-blue-400 transition hover:bg-blue-600/15"
                    >
                      Iniciar conversa
                    </button>
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
                        className={`group relative w-full border-b border-gray-800/50 p-3.5 text-left transition ${
                          isActive
                            ? isWhatsApp
                              ? 'bg-emerald-600/[0.06]'
                              : 'bg-blue-600/[0.07]'
                            : 'hover:bg-gray-800/25'
                        }`}
                      >
                        {isActive && (
                          <span
                            className={`absolute bottom-2 left-0 top-2 w-0.5 rounded-r-full ${
                              isWhatsApp ? 'bg-emerald-500' : 'bg-blue-500'
                            }`}
                          />
                        )}

                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <div
                              className={`flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border ${
                                isWhatsApp
                                  ? 'border-emerald-500/20 bg-emerald-500/5'
                                  : 'border-gray-700/70 bg-gray-800/70'
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
                                  className="text-emerald-400"
                                  size={19}
                                />
                              ) : isChannel ? (
                                <FaUsers className="text-blue-400" size={17} />
                              ) : (
                                <span className="text-xs font-bold text-gray-500">
                                  {getInitials(name)}
                                </span>
                              )}
                            </div>

                            {!isWhatsApp && !isChannel && (
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0b0f16] ${
                                  online ? 'bg-emerald-400' : 'bg-gray-700'
                                }`}
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex min-w-0 items-center gap-1.5">
                                <p
                                  className={`truncate text-sm ${
                                    unread > 0
                                      ? 'font-bold text-white'
                                      : 'font-semibold text-gray-200'
                                  }`}
                                >
                                  {name}
                                </p>

                                {isWhatsApp && (
                                  <span className="inline-flex shrink-0 items-center gap-1 rounded border border-emerald-500/10 bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-semibold uppercase text-emerald-400">
                                    <FaWhatsapp size={8} />
                                    WA
                                  </span>
                                )}

                                {isChannel && (
                                  <span className="shrink-0 rounded border border-blue-500/10 bg-blue-600/10 px-1.5 py-0.5 text-[8px] font-semibold uppercase text-blue-400">
                                    Canal
                                  </span>
                                )}
                              </div>

                              <span
                                className={`shrink-0 text-[10px] ${
                                  unread > 0
                                    ? isWhatsApp
                                      ? 'text-emerald-400'
                                      : 'text-blue-400'
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

                            <div className="mt-1 flex items-center justify-between gap-2">
                              <p
                                className={`truncate text-xs ${
                                  unread > 0 ? 'text-gray-300' : 'text-gray-600'
                                }`}
                              >
                                {isChannel
                                  ? `${participantCount} participantes${onlineCount ? ` · ${onlineCount} online` : ''}`
                                  : getLastMessage(conversation)}
                              </p>

                              {unread > 0 && (
                                <span
                                  className={`flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white ${
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

              <div className="border-t border-gray-800/80 bg-[#090d13] px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-800">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FaUser size={11} className="text-gray-500" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-semibold text-gray-300">
                        {user?.name || 'Usuário'}
                      </p>

                      <p className="text-[9px] text-gray-600">
                        {getRoleLabel(user?.role)}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[9px] text-gray-600">Conectado</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* ÁREA DO CHAT */}

            <main
              className={`${
                !currentConversation && isMobile ? 'hidden' : 'flex'
              } min-w-0 flex-1 flex-col bg-[#0d1119]`}
            >
              {!currentConversation ? (
                <div className="flex flex-1 items-center justify-center px-6">
                  <div className="max-w-sm text-center">
                    <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-gray-800 bg-[#111722]">
                      <FaComments size={30} className="text-gray-600" />
                    </div>

                    <h2 className="text-lg font-semibold text-gray-300">
                      Suas mensagens
                    </h2>

                    <p className="mt-2 text-sm leading-relaxed text-gray-600">
                      Selecione uma conversa para visualizar as mensagens
                      internas ou do WhatsApp.
                    </p>

                    <button
                      type="button"
                      onClick={() => setShowNewChat(true)}
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-500"
                    >
                      <FaPlus size={11} />
                      Nova conversa
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* CABEÇALHO DA CONVERSA */}

                  <div
                    className={`flex h-[72px] shrink-0 items-center justify-between gap-3 border-b border-gray-800/80 px-3 sm:px-5 ${
                      isWhatsAppConversation
                        ? 'bg-[#101a18]/90'
                        : 'bg-[#10151e]/90'
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-800 hover:text-white lg:hidden"
                        aria-label="Voltar para conversas"
                      >
                        <FaChevronLeft size={15} />
                      </button>

                      <div className="relative shrink-0">
                        <div
                          className={`flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border ${
                            isWhatsAppConversation
                              ? 'border-emerald-500/20 bg-emerald-500/5'
                              : 'border-gray-700 bg-gray-800'
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
                              className="text-emerald-400"
                              size={20}
                            />
                          ) : isCurrentChannel ? (
                            <FaUsers className="text-blue-400" size={18} />
                          ) : (
                            <span className="text-xs font-bold text-gray-500">
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
                              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#10151e] ${
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
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-bold text-white">
                            {getSafeConversationName(currentConversation)}
                          </p>

                          {isWhatsAppConversation && (
                            <span className="hidden shrink-0 items-center gap-1 rounded-md border border-emerald-500/10 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400 sm:inline-flex">
                              <FaWhatsapp size={8} />
                              WHATSAPP
                            </span>
                          )}

                          {isCurrentChannel && (
                            <span className="hidden shrink-0 items-center gap-1 rounded-md border border-blue-500/10 bg-blue-600/10 px-1.5 py-0.5 text-[9px] font-semibold text-blue-400 sm:inline-flex">
                              <FaUsers size={8} />
                              EQUIPE
                            </span>
                          )}
                        </div>

                        <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
                          {isWhatsAppConversation ? (
                            <>
                              <FaWhatsapp
                                size={8}
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
                              <FaUsers size={8} className="text-gray-600" />
                              <span className="text-[10px] text-gray-600">
                                {currentParticipantCount} participantes
                              </span>

                              {currentOnlineParticipantCount > 0 && (
                                <span className="text-[10px] text-emerald-400/70">
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

                              <span className="text-[10px] text-gray-600">
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
                      {isCurrentChannel && !isWhatsAppConversation && (
                        <button
                          type="button"
                          onClick={() => setShowParticipants(true)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-800 hover:text-white"
                          aria-label="Ver participantes"
                          title="Participantes"
                        >
                          <FaUsers size={14} />
                        </button>
                      )}

                      {!isWhatsAppConversation && (
                        <button
                          type="button"
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-800 hover:text-white"
                          aria-label="Mais opções"
                          title="Mais opções"
                        >
                          <FaEllipsisV size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* MENSAGENS */}

                  <div
                    ref={messagesContainerRef}
                    onScroll={handleMessagesScroll}
                    className="relative flex-1 space-y-1 overflow-y-auto px-3 py-5 scrollbar-thin scrollbar-thumb-gray-800 sm:px-5 lg:px-6"
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
                          className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border ${
                            isWhatsAppConversation
                              ? 'border-emerald-500/10 bg-emerald-500/5'
                              : 'border-gray-800 bg-gray-800/40'
                          }`}
                        >
                          {isWhatsAppConversation ? (
                            <FaWhatsapp
                              size={20}
                              className="text-emerald-400"
                            />
                          ) : (
                            <FaComments size={20} className="text-gray-600" />
                          )}
                        </div>

                        <p className="text-sm font-semibold text-gray-400">
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

                        return (
                          <div key={message._id}>
                            {showDateHeader && (
                              <div className="my-4 flex items-center justify-center">
                                <span className="rounded-full border border-gray-800 bg-gray-800/50 px-3 py-1 text-[10px] font-medium text-gray-500">
                                  {formatDate(message.createdAt)}
                                </span>
                              </div>
                            )}

                            <div
                              className={`mb-3 flex ${
                                isOwn ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              <div
                                className={`flex max-w-[90%] items-end gap-2 sm:max-w-[75%] ${
                                  isOwn ? 'flex-row-reverse' : 'flex-row'
                                }`}
                              >
                                {!isOwn && isWhatsAppMessage && (
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-emerald-500/20 bg-emerald-500/5">
                                    {senderAvatar ? (
                                      <img
                                        src={senderAvatar}
                                        alt={senderName}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <FaWhatsapp
                                        size={14}
                                        className="text-emerald-400"
                                      />
                                    )}
                                  </div>
                                )}

                                <div
                                  className={`rounded-2xl px-4 py-3 shadow-md ${
                                    isOwn
                                      ? isWhatsAppConversation
                                        ? 'rounded-br-sm bg-emerald-600 text-white'
                                        : 'rounded-br-sm bg-blue-600 text-white'
                                      : 'rounded-bl-sm border border-gray-800 bg-[#141a25] text-gray-100'
                                  }`}
                                >
                                  {!isOwn &&
                                    (isCurrentChannel || isWhatsAppMessage) && (
                                      <p
                                        className={`mb-1 text-[11px] font-semibold ${
                                          isWhatsAppMessage
                                            ? 'text-emerald-400'
                                            : 'text-blue-400'
                                        }`}
                                      >
                                        {senderName}
                                      </p>
                                    )}

                                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                                    {getMessageContent(message)}
                                  </p>

                                  <div
                                    className={`mt-1 flex items-center justify-end gap-1.5 text-[10px] ${
                                      isOwn
                                        ? isWhatsAppConversation
                                          ? 'text-emerald-100'
                                          : 'text-blue-200'
                                        : 'text-gray-500'
                                    }`}
                                  >
                                    <span>
                                      {formatMessageTime(message.createdAt)}
                                    </span>

                                    {isOwn && !isWhatsAppConversation && (
                                      <FaCheck
                                        size={10}
                                        className={
                                          message.read
                                            ? 'text-blue-200'
                                            : 'text-blue-300/60'
                                        }
                                      />
                                    )}

                                    {isOwn && isWhatsAppConversation && (
                                      <>
                                        {message.status === 'read' ? (
                                          <FaCheckDouble
                                            size={11}
                                            className="text-blue-300"
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
                        <div className="rounded-2xl rounded-bl-sm border border-gray-800 bg-[#141a25] px-4 py-3">
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
                        className="absolute bottom-5 right-4 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-gray-700 bg-[#151c28] text-gray-300 shadow-xl transition hover:bg-gray-800 hover:text-white sm:right-6"
                        title="Ir para a última mensagem"
                        aria-label="Ir para a última mensagem"
                      >
                        <FaChevronLeft size={13} className="-rotate-90" />
                      </button>
                    )}
                  </div>

                  {/* CAMPO DE ENVIO */}

                  <form
                    onSubmit={handleSendMessage}
                    className={`flex shrink-0 items-center gap-2 border-t border-gray-800/80 p-3 sm:gap-3 sm:p-4 ${
                      isWhatsAppConversation
                        ? 'bg-[#101a18]/90'
                        : 'bg-[#10151e]/90'
                    }`}
                  >
                    <button
                      type="button"
                      disabled
                      className="flex h-10 w-10 shrink-0 cursor-not-allowed items-center justify-center rounded-xl border border-gray-800 bg-gray-800/50 text-gray-600 opacity-60"
                      aria-label="Anexos em breve"
                      title="Anexos em breve"
                    >
                      <FaPaperclip size={14} />
                    </button>

                    <div className="min-w-0 flex-1">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputMessage}
                        onChange={handleTyping}
                        placeholder={
                          isWhatsAppConversation
                            ? 'Digite uma mensagem para o WhatsApp...'
                            : 'Digite sua mensagem...'
                        }
                        className={`h-11 w-full rounded-xl border border-gray-800 bg-[#080b11] px-4 text-sm text-white outline-none transition placeholder:text-gray-600 ${
                          isWhatsAppConversation
                            ? 'focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/5'
                            : 'focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/5'
                        }`}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!inputMessage.trim() || sending}
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-lg transition disabled:cursor-not-allowed disabled:opacity-40 ${
                        isWhatsAppConversation
                          ? 'bg-emerald-600 shadow-emerald-600/10 hover:bg-emerald-500'
                          : 'bg-blue-600 shadow-blue-600/10 hover:bg-blue-500'
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

        {/* PAINEL DE PARTICIPANTES */}

        {showParticipants && isCurrentChannel && !isWhatsAppConversation && (
          <div className="fixed inset-0 z-[60] flex">
            <button
              type="button"
              aria-label="Fechar participantes"
              onClick={() => setShowParticipants(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            />

            <aside className="relative ml-auto flex h-full w-[340px] max-w-[90vw] flex-col border-l border-gray-800 bg-[#0c1017] shadow-2xl">
              <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-gray-800 px-5">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Participantes
                  </h3>

                  <p className="mt-1 text-[10px] text-gray-600">
                    {currentParticipantCount} participantes
                    {currentOnlineParticipantCount > 0
                      ? ` · ${currentOnlineParticipantCount} online`
                      : ''}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowParticipants(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-800 hover:text-white"
                  aria-label="Fechar"
                >
                  <FaTimes size={14} />
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
                          className="flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-gray-800/30"
                        >
                          <div className="relative shrink-0">
                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-gray-700 bg-gray-800">
                              {participant?.avatar ? (
                                <img
                                  src={participant.avatar}
                                  alt={name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-[10px] font-bold text-gray-500">
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
                              <p className="truncate text-xs font-semibold text-gray-300">
                                {name}
                              </p>

                              {isCurrentUser && (
                                <span className="shrink-0 rounded-md border border-blue-500/10 bg-blue-600/10 px-1.5 py-0.5 text-[8px] font-semibold text-blue-400">
                                  Você
                                </span>
                              )}
                            </div>

                            <p
                              className={`mt-0.5 text-[9px] ${
                                online ? 'text-emerald-400/70' : 'text-gray-600'
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-gray-800 bg-[#0d1119] shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
                <h3 className="text-base font-bold text-white">
                  Nova conversa
                </h3>

                <button
                  type="button"
                  onClick={resetNewChat}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-800 hover:text-white"
                  aria-label="Fechar"
                >
                  <FaTimes size={14} />
                </button>
              </div>

              <div className="border-b border-gray-800 bg-[#090d13] p-4">
                <div className="grid grid-cols-2 gap-2 rounded-xl border border-gray-800 bg-[#080b11] p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setNewChatMode('direct');
                      setChannelName('');
                      setSelectedUsers([]);
                    }}
                    className={`rounded-lg py-2 text-xs font-semibold transition ${
                      newChatMode === 'direct'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
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
                    className={`rounded-lg py-2 text-xs font-semibold transition ${
                      newChatMode === 'channel'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Canal da equipe
                  </button>
                </div>
              </div>

              <div className="scrollbar-thin scrollbar-thumb-gray-800 flex-1 space-y-4 overflow-y-auto p-5">
                {newChatMode === 'channel' ? (
                  <div className="space-y-3">
                    <label
                      htmlFor="channel-name"
                      className="block text-xs font-semibold text-gray-400"
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
                      className="h-11 w-full rounded-xl border border-gray-800 bg-[#080b11] px-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500/50"
                    />

                    <p className="text-[11px] leading-relaxed text-gray-600">
                      Crie um canal para a equipe compartilhar informações sobre
                      negócios e clientes.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label
                      htmlFor="user-search"
                      className="block text-xs font-semibold text-gray-400"
                    >
                      Buscar membro
                    </label>

                    <div className="relative">
                      <FaSearch
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600"
                        size={12}
                      />

                      <input
                        id="user-search"
                        type="text"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Digite o nome do usuário..."
                        className="h-11 w-full rounded-xl border border-gray-800 bg-[#080b11] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500/50"
                      />
                    </div>

                    {selectedUsers.length > 0 && (
                      <p className="text-[11px] text-blue-400">
                        {selectedUsers.length} usuário(s) selecionado(s)
                      </p>
                    )}

                    <div className="max-h-60 space-y-2 overflow-y-auto pt-2">
                      {searching ? (
                        <div className="flex items-center justify-center py-6">
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
                              className={`flex w-full items-center justify-between rounded-xl border p-2.5 transition ${
                                selected
                                  ? 'border-blue-500/40 bg-blue-600/10 text-white'
                                  : 'border-gray-800 bg-[#080b11] text-gray-300 hover:border-gray-700'
                              }`}
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-800">
                                  {item.avatar ? (
                                    <img
                                      src={item.avatar}
                                      alt={item.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-[10px] font-bold text-gray-500">
                                      {getInitials(item.name)}
                                    </span>
                                  )}
                                </div>

                                <div className="min-w-0 text-left">
                                  <p className="truncate text-xs font-semibold">
                                    {item.name}
                                  </p>

                                  <p className="truncate text-[10px] text-gray-500">
                                    {getRoleLabel(item.role)}
                                  </p>
                                </div>
                              </div>

                              <span
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                                  selected
                                    ? 'border-blue-500 bg-blue-600 text-white'
                                    : 'border-gray-700 bg-gray-800/40'
                                }`}
                              >
                                {selected && <FaCheck size={10} />}
                              </span>
                            </button>
                          );
                        })
                      ) : search.trim().length >= 2 ? (
                        <p className="py-4 text-center text-xs text-gray-600">
                          Nenhum usuário encontrado.
                        </p>
                      ) : (
                        <p className="py-4 text-center text-xs text-gray-600">
                          Digite ao menos 2 caracteres para buscar.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-gray-800 bg-[#090d13] px-5 py-4">
                <button
                  type="button"
                  onClick={resetNewChat}
                  disabled={creatingConversation}
                  className="rounded-xl border border-gray-800 px-4 py-2 text-xs font-semibold text-gray-400 transition hover:text-white disabled:opacity-50"
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
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-600/10 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {creatingConversation && (
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
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

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

  /*
  ============================================================
  REFS
  ============================================================
  */

  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  /*
   * Guarda qual conversa já teve o scroll inicial executado.
   *
   * Isso evita que cada atualização das mensagens jogue
   * novamente o usuário para o final.
   */
  const initialScrollConversationRef = useRef(null);

  /*
   * Quantidade anterior de mensagens.
   *
   * Usado para identificar quando uma nova mensagem chegou.
   */
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
  CONVERSAS
  ============================================================
  */

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  /*
  ============================================================
  SCROLL DAS MENSAGENS
  ============================================================
  */

  /*
   * Volta o scroll para o final da conversa.
   */
  const scrollToBottom = (behavior = 'smooth') => {
    const container = messagesContainerRef.current;

    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  };

  /*
   * Ao trocar de conversa, resetamos os controles de scroll.
   *
   * O scroll inicial será executado somente quando as mensagens
   * realmente estiverem disponíveis.
   */
  useEffect(() => {
    const conversationId = currentConversation?._id?.toString();

    if (!conversationId) {
      initialScrollConversationRef.current = null;
      previousMessagesCountRef.current = 0;
      return;
    }

    previousMessagesCountRef.current = 0;
  }, [currentConversation?._id]);

  /*
   * Scroll inicial da conversa.
   *
   * Importante:
   * usamos messages.length como dependência porque a conversa
   * pode ser selecionada antes de as mensagens terminarem de
   * carregar.
   */
  useEffect(() => {
    const conversationId = currentConversation?._id?.toString();

    if (!conversationId || messages.length === 0) {
      return;
    }

    /*
     * Essa conversa já foi posicionada no final.
     */
    if (initialScrollConversationRef.current === conversationId) {
      return;
    }

    /*
     * Esperamos dois frames para garantir que o DOM já tenha
     * calculado o scrollHeight depois da renderização das mensagens.
     */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        /*
         * A conversa pode ter mudado durante os frames.
         */
        if (currentConversation?._id?.toString() !== conversationId) {
          return;
        }

        const container = messagesContainerRef.current;

        if (!container) {
          return;
        }

        container.scrollTop = container.scrollHeight;

        initialScrollConversationRef.current = conversationId;

        previousMessagesCountRef.current = messages.length;
      });
    });
  }, [currentConversation?._id, messages.length]);

  /*
   * Novas mensagens.
   *
   * Se o usuário estiver próximo do final, acompanhamos a nova
   * mensagem.
   *
   * Se estiver lendo mensagens antigas, NÃO mexemos no scroll.
   */
  useEffect(() => {
    const conversationId = currentConversation?._id?.toString();

    const container = messagesContainerRef.current;

    if (!conversationId || !container || messages.length === 0) {
      return;
    }

    /*
     * Ainda estamos aguardando o scroll inicial.
     */
    if (initialScrollConversationRef.current !== conversationId) {
      return;
    }

    const previousCount = previousMessagesCountRef.current;
    const currentCount = messages.length;

    /*
     * Só fazemos alguma coisa quando uma nova mensagem entrou.
     */
    if (currentCount > previousCount) {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;

      /*
       * Consideramos "perto do final" até 150px.
       */
      const isNearBottom = distanceFromBottom <= 150;

      if (isNearBottom) {
        requestAnimationFrame(() => {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth',
          });
        });
      }
    }

    previousMessagesCountRef.current = currentCount;
  }, [messages.length, currentConversation?._id]);

  /*
  ============================================================
  LIMPEZA DO TYPING
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
    const delayDebounce = setTimeout(async () => {
      if (search.length >= 2 && showNewChat && newChatMode === 'direct') {
        setSearching(true);

        try {
          const results = await searchUsers(search);

          const currentUserId = user?._id?.toString();

          setSearchResults(
            results.filter((u) => u?._id?.toString() !== currentUserId),
          );
        } catch (error) {
          console.error('Erro ao buscar usuários:', error);

          setSearchResults([]);
        } finally {
          setSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, showNewChat, newChatMode, user, searchUsers]);

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

    const diff = now - d;

    if (diff < 0) {
      return d.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    if (diff < 60000) return 'Agora';

    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}min`;
    }

    if (diff < 86400000) {
      return d.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    if (diff < 604800000) {
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
    const today = new Date();

    if (Number.isNaN(d.getTime())) return '';

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

  /*
  ============================================================
  PARTICIPANTES
  ============================================================
  */

  const getParticipants = (conversation) => {
    if (!conversation?.participants) {
      return [];
    }

    if (!Array.isArray(conversation.participants)) {
      return [];
    }

    return conversation.participants.filter(Boolean);
  };

  const getOnlineParticipants = (conversation) => {
    const participants = getParticipants(conversation);

    return participants.filter((participant) => isUserOnline(participant?._id));
  };

  const getParticipantCount = (conversation) => {
    return getParticipants(conversation).length;
  };

  const getOnlineParticipantCount = (conversation) => {
    return getOnlineParticipants(conversation).length;
  };

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
  };

  const toggleUser = (userId) => {
    const normalizedId = userId?.toString();

    setSelectedUsers((prev) =>
      prev.some((id) => id?.toString() === normalizedId)
        ? prev.filter((id) => id?.toString() !== normalizedId)
        : [...prev, userId],
    );
  };

  const handleCreateConversation = async () => {
    try {
      if (newChatMode === 'channel') {
        if (!channelName.trim()) return;

        await createBrokerChannel(channelName.trim());
      } else {
        if (selectedUsers.length === 0) return;

        await createConversation(selectedUsers);
      }

      resetNewChat();
    } catch (error) {
      console.error('Erro ao criar conversa:', error);
    }
  };

  /*
  ============================================================
  MENSAGENS
  ============================================================
  */

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || !currentConversation) {
      return;
    }

    try {
      await sendMessage(currentConversation._id, inputMessage.trim());

      setInputMessage('');
      setIsTyping(false);

      if (currentConversation.channel !== 'whatsapp') {
        sendTyping(currentConversation._id, false);
      }

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const handleTyping = (e) => {
    const value = e.target.value;

    setInputMessage(value);

    if (!currentConversation) return;

    /*
     * WhatsApp não utiliza o typing interno do Socket.IO.
     */
    if (currentConversation.channel === 'whatsapp') {
      return;
    }

    if (value.length > 0 && !isTyping) {
      setIsTyping(true);

      sendTyping(currentConversation._id, true);
    }

    if (value.length === 0 && isTyping) {
      setIsTyping(false);

      sendTyping(currentConversation._id, false);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);

      if (currentConversation) {
        sendTyping(currentConversation._id, false);
      }
    }, 2000);
  };

  /*
  ============================================================
  CONVERSA
  ============================================================
  */

  const handleSelectConversation = (conversation) => {
    setShowParticipants(false);
    setIsTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    /*
     * Resetamos o controle de scroll antes de trocar de conversa.
     */
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

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    setCurrentConversation(null);
  };

  /*
  ============================================================
  HELPERS
  ============================================================
  */

  const isWhatsAppConversation = currentConversation?.channel === 'whatsapp';

  const isCurrentChannel = currentConversation?.type === 'broker_channel';

  const getConversationIsWhatsApp = (conversation) => {
    return conversation?.channel === 'whatsapp';
  };

  const getSafeConversationName = (conversation) => {
    return getConversationName?.(conversation) || 'Conversa';
  };

  const getSafeConversationSubtitle = (conversation) => {
    return getConversationSubtitle?.(conversation) || '';
  };

  const getInitials = (name = '') => {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) return 'U';

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  const getLastMessage = (conversation) => {
    if (typeof conversation?.lastMessage === 'string') {
      return conversation.lastMessage.trim() || 'Nenhuma mensagem';
    }

    if (
      conversation?.lastMessage &&
      typeof conversation.lastMessage === 'object'
    ) {
      const content = conversation.lastMessage.content;

      if (typeof content === 'string') {
        return content.trim() || 'Nenhuma mensagem';
      }
    }

    if (conversation?.lastMessageObject?.content) {
      return conversation.lastMessageObject.content;
    }

    return 'Nenhuma mensagem';
  };

  const getMessageContent = (message) => {
    if (typeof message?.content === 'string') {
      return message.content;
    }

    return '';
  };

  /*
  ============================================================
  CONVERSAS FILTRADAS
  ============================================================
  */

  const filteredConversations = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return conversations;
    }

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
  }, [conversations, search, getConversationName, getConversationSubtitle]);

  /*
  ============================================================
  CURRENT PARTICIPANTS
  ============================================================
  */

  const currentParticipants = getParticipants(currentConversation);

  const currentParticipantCount = getParticipantCount(currentConversation);

  const currentOnlineParticipantCount =
    getOnlineParticipantCount(currentConversation);

  /*
  ============================================================
  TYPING
  ============================================================
  */

  const isTypingUser =
    !isWhatsAppConversation &&
    currentConversation?.participants?.some((participant) => {
      const participantId = participant?._id?.toString();

      const currentUserId = user?._id?.toString();

      return (
        participantId &&
        participantId !== currentUserId &&
        typingUsers?.[participantId]
      );
    });

  /*
  ============================================================
  ROLE
  ============================================================
  */

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

  /*
  ============================================================
  RENDER
  ============================================================
  */

  return (
    <div className="chat-scroll min-h-screen bg-[#080b11] text-white">
      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/[0.035] rounded-full blur-[120px]" />

        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/[0.025] rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-7">
        {/* ====================================================
            HEADER PRINCIPAL
        ===================================================== */}

        <header className="mb-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="
                  w-10
                  h-10
                  shrink-0
                  rounded-xl
                  border
                  border-gray-800
                  bg-[#0d1119]
                  flex
                  items-center
                  justify-center
                  text-gray-500
                  hover:text-white
                  hover:bg-gray-800
                  transition
                "
                aria-label="Voltar"
              >
                <FaChevronLeft size={15} />
              </button>

              <div className="w-10 h-10 shrink-0 rounded-xl bg-blue-600/10 border border-blue-500/10 flex items-center justify-center">
                <FaComments className="text-blue-400" size={17} />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl lg:text-2xl font-bold text-white truncate">
                    Mensagens
                  </h1>

                  {unreadCount > 0 && (
                    <span className="shrink-0 px-2 py-0.5 rounded-full bg-blue-600/15 border border-blue-500/20 text-blue-400 text-[10px] font-bold">
                      {unreadCount} novas
                    </span>
                  )}
                </div>

                <p className="text-xs lg:text-sm text-gray-500 mt-0.5">
                  Comunicação interna e WhatsApp da equipe
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowNewChat(true)}
              className="
                shrink-0
                h-10
                lg:h-11
                px-3
                lg:px-4
                rounded-xl
                bg-blue-600
                hover:bg-blue-500
                active:bg-blue-700
                text-white
                text-xs
                lg:text-sm
                font-semibold
                transition
                flex
                items-center
                gap-2
                shadow-lg
                shadow-blue-600/10
              "
            >
              <FaPlus size={12} />

              <span className="hidden sm:inline">Nova conversa</span>
            </button>
          </div>
        </header>

        {/* ====================================================
            CHAT CONTAINER
        ===================================================== */}

        <div className="bg-[#0d1119] border border-gray-800/80 rounded-2xl overflow-hidden h-[calc(100vh-205px)] min-h-[520px] shadow-2xl shadow-black/20">
          <div className="flex h-full">
            {/* =================================================
                SIDEBAR
            ================================================== */}

            <div
              className={`${
                currentConversation && isMobile ? 'hidden' : 'flex'
              } w-full lg:w-[360px] xl:w-[390px] shrink-0 flex-col border-r border-gray-800/80 bg-[#0b0f16]`}
            >
              {/* Search */}

              <div className="p-4 border-b border-gray-800/80">
                <div className="relative group">
                  <FaSearch
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-blue-400 transition"
                    size={12}
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar nome, telefone ou mensagem..."
                    className="
                      w-full
                      h-10
                      bg-[#080b11]
                      border
                      border-gray-800
                      rounded-xl
                      pl-10
                      pr-4
                      text-sm
                      text-white
                      placeholder:text-gray-600
                      outline-none
                      focus:border-blue-500/50
                      focus:ring-2
                      focus:ring-blue-500/5
                      transition
                    "
                  />
                </div>
              </div>

              {/* Conversation list */}

              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800">
                {loadingConversations ? (
                  <div className="flex flex-col items-center justify-center h-48">
                    <div className="w-7 h-7 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />

                    <span className="text-xs text-gray-600 mt-3">
                      Carregando conversas...
                    </span>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full px-8 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gray-800/40 border border-gray-800 flex items-center justify-center mb-4">
                      <FaComments size={22} className="text-gray-600" />
                    </div>

                    <p className="text-sm font-semibold text-gray-400">
                      {search
                        ? 'Nenhuma conversa encontrada'
                        : 'Nenhuma conversa'}
                    </p>

                    <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                      {search
                        ? 'Tente outro nome, telefone ou mensagem.'
                        : 'Comece uma nova conversa com alguém da sua equipe.'}
                    </p>

                    {!search && (
                      <button
                        type="button"
                        onClick={() => setShowNewChat(true)}
                        className="mt-5 px-3.5 py-2 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-semibold hover:bg-blue-600/15 transition"
                      >
                        Iniciar conversa
                      </button>
                    )}
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const isActive =
                      currentConversation?._id?.toString() ===
                      conv?._id?.toString();

                    const isWhatsApp = getConversationIsWhatsApp(conv);

                    const otherUser = !isWhatsApp && getOtherParticipant(conv);

                    const online =
                      !isWhatsApp && otherUser
                        ? isUserOnline(otherUser._id)
                        : false;

                    const unread = Number(conv.unreadCount || 0);

                    const avatar = getConversationAvatar(conv);

                    const name = getSafeConversationName(conv);

                    const subtitle = getSafeConversationSubtitle(conv);

                    const isChannel = conv.type === 'broker_channel';

                    const participantCount = getParticipantCount(conv);

                    const onlineParticipantCount =
                      getOnlineParticipantCount(conv);

                    return (
                      <button
                        key={conv._id}
                        type="button"
                        onClick={() => handleSelectConversation(conv)}
                        className={`
                          relative
                          w-full
                          p-3.5
                          text-left
                          border-b
                          border-gray-800/50
                          transition
                          group
                          ${
                            isActive
                              ? isWhatsApp
                                ? 'bg-emerald-600/[0.06]'
                                : 'bg-blue-600/[0.07]'
                              : 'hover:bg-gray-800/25'
                          }
                        `}
                      >
                        {isActive && (
                          <div
                            className={`
                              absolute
                              left-0
                              top-2
                              bottom-2
                              w-0.5
                              rounded-r-full
                              ${isWhatsApp ? 'bg-emerald-500' : 'bg-blue-500'}
                            `}
                          />
                        )}

                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <div
                              className={`
                                w-11
                                h-11
                                rounded-xl
                                border
                                flex
                                items-center
                                justify-center
                                overflow-hidden
                                ${
                                  isWhatsApp
                                    ? 'bg-emerald-500/5 border-emerald-500/20'
                                    : 'bg-gray-800/70 border-gray-700/70'
                                }
                              `}
                            >
                              {avatar ? (
                                <img
                                  src={avatar}
                                  alt={name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
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
                                className={`
                                  absolute
                                  -bottom-0.5
                                  -right-0.5
                                  w-3
                                  h-3
                                  rounded-full
                                  border-2
                                  border-[#0b0f16]
                                  ${online ? 'bg-emerald-400' : 'bg-gray-700'}
                                `}
                              />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <p
                                  className={`
                                    text-sm
                                    truncate
                                    ${
                                      unread > 0
                                        ? 'font-bold text-white'
                                        : 'font-semibold text-gray-200'
                                    }
                                  `}
                                >
                                  {name}
                                </p>

                                {isWhatsApp && (
                                  <span
                                    className="
                                      shrink-0
                                      inline-flex
                                      items-center
                                      gap-1
                                      px-1.5
                                      py-0.5
                                      rounded
                                      bg-emerald-500/10
                                      border
                                      border-emerald-500/10
                                      text-emerald-400
                                      text-[8px]
                                      font-semibold
                                      uppercase
                                    "
                                  >
                                    <FaWhatsapp size={8} />
                                    WA
                                  </span>
                                )}

                                {isChannel && !isWhatsApp && (
                                  <span
                                    className="
                                      shrink-0
                                      px-1.5
                                      py-0.5
                                      rounded
                                      bg-blue-600/10
                                      border
                                      border-blue-500/10
                                      text-blue-400
                                      text-[8px]
                                      font-semibold
                                      uppercase
                                    "
                                  >
                                    Canal
                                  </span>
                                )}
                              </div>

                              <span
                                className={`
                                  shrink-0
                                  text-[10px]
                                  ${
                                    unread > 0
                                      ? isWhatsApp
                                        ? 'text-emerald-400'
                                        : 'text-blue-400'
                                      : 'text-gray-600'
                                  }
                                `}
                              >
                                {formatTime(conv.lastMessageAt)}
                              </span>
                            </div>

                            {isWhatsApp && subtitle && (
                              <p className="mt-0.5 text-[10px] text-gray-600 truncate">
                                {subtitle}
                              </p>
                            )}

                            {isChannel && !isWhatsApp ? (
                              <div className="flex items-center justify-between gap-2 mt-1">
                                <div className="min-w-0 flex items-center gap-1.5">
                                  <FaUsers
                                    size={8}
                                    className="shrink-0 text-gray-600"
                                  />

                                  <p className="text-[10px] text-gray-600 truncate">
                                    {participantCount}{' '}
                                    {participantCount === 1
                                      ? 'participante'
                                      : 'participantes'}
                                  </p>

                                  {onlineParticipantCount > 0 && (
                                    <>
                                      <span className="text-gray-800">•</span>

                                      <p className="text-[10px] text-emerald-400/70 truncate">
                                        {onlineParticipantCount} online
                                      </p>
                                    </>
                                  )}
                                </div>

                                {unread > 0 && (
                                  <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                                    {unread > 99 ? '99+' : unread}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center justify-between gap-2 mt-1">
                                <p
                                  className={`
                                    text-xs
                                    truncate
                                    ${
                                      unread > 0
                                        ? 'text-gray-300'
                                        : 'text-gray-600'
                                    }
                                  `}
                                >
                                  {getLastMessage(conv)}
                                </p>

                                {unread > 0 && (
                                  <span
                                    className={`
                                      shrink-0
                                      min-w-[20px]
                                      h-5
                                      px-1.5
                                      rounded-full
                                      text-white
                                      text-[10px]
                                      font-bold
                                      flex
                                      items-center
                                      justify-center
                                      ${
                                        isWhatsApp
                                          ? 'bg-emerald-600'
                                          : 'bg-blue-600'
                                      }
                                    `}
                                  >
                                    {unread > 99 ? '99+' : unread}
                                  </span>
                                )}
                              </div>
                            )}

                            {isChannel && !isWhatsApp && conv.lastMessage && (
                              <p className="mt-1 text-[10px] text-gray-700 truncate">
                                {getLastMessage(conv)}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Sidebar footer */}

              <div className="px-4 py-3 border-t border-gray-800/80 bg-[#090d13]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center overflow-hidden">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FaUser size={11} className="text-gray-500" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-gray-300 truncate">
                        {user?.name || 'Usuário'}
                      </p>

                      <p className="text-[9px] text-gray-600">
                        {getRoleLabel(user?.role)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />

                    <span className="text-[9px] text-gray-600">Conectado</span>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                CHAT AREA
            ================================================== */}

            <div
              className={`${
                !currentConversation && isMobile ? 'hidden' : 'flex'
              } flex-1 min-w-0 flex-col bg-[#0d1119]`}
            >
              {!currentConversation ? (
                <div className="flex-1 flex items-center justify-center px-6">
                  <div className="text-center max-w-sm">
                    <div className="relative mx-auto w-20 h-20 mb-5">
                      <div className="absolute inset-0 rounded-3xl bg-blue-600/5 blur-xl" />

                      <div className="relative w-20 h-20 rounded-3xl bg-[#111722] border border-gray-800 flex items-center justify-center">
                        <FaComments size={30} className="text-gray-600" />
                      </div>
                    </div>

                    <h2 className="text-lg font-semibold text-gray-300">
                      Suas mensagens
                    </h2>

                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      Selecione uma conversa para visualizar as mensagens
                      internas ou WhatsApp.
                    </p>

                    <button
                      type="button"
                      onClick={() => setShowNewChat(true)}
                      className="
                        mt-6
                        inline-flex
                        items-center
                        gap-2
                        px-4
                        py-2.5
                        rounded-xl
                        bg-blue-600
                        hover:bg-blue-500
                        text-white
                        text-xs
                        font-semibold
                        transition
                        shadow-lg
                        shadow-blue-600/10
                      "
                    >
                      <FaPlus size={11} />
                      Nova conversa
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* =========================================
                      CHAT HEADER
                  ========================================== */}

                  <div
                    className={`
                      h-[72px]
                      shrink-0
                      px-4
                      lg:px-5
                      border-b
                      border-gray-800/80
                      flex
                      items-center
                      justify-between
                      ${
                        isWhatsAppConversation
                          ? 'bg-[#101a18]/90'
                          : 'bg-[#10151e]/90'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="
                          lg:hidden
                          w-9
                          h-9
                          rounded-lg
                          flex
                          items-center
                          justify-center
                          text-gray-500
                          hover:text-white
                          hover:bg-gray-800
                          transition
                        "
                        aria-label="Voltar para conversas"
                      >
                        <FaChevronLeft size={15} />
                      </button>

                      <div className="relative shrink-0">
                        <div
                          className={`
                            w-11
                            h-11
                            rounded-xl
                            border
                            flex
                            items-center
                            justify-center
                            overflow-hidden
                            ${
                              isWhatsAppConversation
                                ? 'bg-emerald-500/5 border-emerald-500/20'
                                : 'bg-gray-800 border-gray-700'
                            }
                          `}
                        >
                          {getConversationAvatar(currentConversation) ? (
                            <img
                              src={getConversationAvatar(currentConversation)}
                              alt={getConversationName(currentConversation)}
                              className="w-full h-full object-cover"
                            />
                          ) : isWhatsAppConversation ? (
                            <FaWhatsapp
                              className="text-emerald-400"
                              size={20}
                            />
                          ) : currentConversation.type === 'broker_channel' ? (
                            <FaUsers className="text-blue-400" size={18} />
                          ) : (
                            <span className="text-xs font-bold text-gray-500">
                              {getInitials(
                                getConversationName(currentConversation),
                              )}
                            </span>
                          )}
                        </div>

                        {!isWhatsAppConversation &&
                          currentConversation.type !== 'broker_channel' &&
                          getOtherParticipant(currentConversation) && (
                            <span
                              className={`
                                absolute
                                -bottom-0.5
                                -right-0.5
                                w-3
                                h-3
                                rounded-full
                                border-2
                                border-[#10151e]
                                ${
                                  isUserOnline(
                                    getOtherParticipant(currentConversation)
                                      ?._id,
                                  )
                                    ? 'bg-emerald-400'
                                    : 'bg-gray-700'
                                }
                              `}
                            />
                          )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white truncate">
                            {getConversationName(currentConversation)}
                          </p>

                          {isWhatsAppConversation && (
                            <span
                              className="
                                hidden
                                sm:inline-flex
                                items-center
                                gap-1
                                px-1.5
                                py-0.5
                                rounded-md
                                bg-emerald-500/10
                                border
                                border-emerald-500/10
                                text-emerald-400
                                text-[9px]
                                font-semibold
                              "
                            >
                              <FaWhatsapp size={8} />
                              WHATSAPP
                            </span>
                          )}

                          {!isWhatsAppConversation &&
                            currentConversation.type === 'broker_channel' && (
                              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-600/10 border border-blue-500/10 text-blue-400 text-[9px] font-semibold">
                                <FaUsers size={8} />
                                EQUIPE
                              </span>
                            )}

                          {!isWhatsAppConversation &&
                            currentConversation.type !== 'broker_channel' && (
                              <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-600/10 border border-blue-500/10 text-blue-400 text-[9px] font-semibold">
                                <FaCircle size={5} />
                                INTERNO
                              </span>
                            )}
                        </div>

                        <div className="mt-0.5 flex items-center gap-1.5 min-w-0">
                          {isWhatsAppConversation ? (
                            <>
                              <FaWhatsapp
                                size={8}
                                className="text-emerald-400 shrink-0"
                              />

                              <span className="text-[10px] text-gray-500 truncate">
                                {getConversationSubtitle(currentConversation) ||
                                  'WhatsApp'}
                              </span>
                            </>
                          ) : currentConversation.type === 'broker_channel' ? (
                            <>
                              <FaUsers size={8} className="text-gray-600" />

                              <span className="text-[10px] text-gray-600">
                                {currentParticipantCount}{' '}
                                {currentParticipantCount === 1
                                  ? 'participante'
                                  : 'participantes'}
                              </span>

                              {currentOnlineParticipantCount > 0 && (
                                <>
                                  <span className="text-gray-800">•</span>

                                  <span className="text-[10px] text-emerald-400/70">
                                    {currentOnlineParticipantCount} online
                                  </span>
                                </>
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

                    <div className="flex items-center gap-1">
                      {!isWhatsAppConversation &&
                        currentConversation.type === 'broker_channel' && (
                          <button
                            type="button"
                            onClick={() => setShowParticipants(true)}
                            className="
                              w-9
                              h-9
                              rounded-lg
                              flex
                              items-center
                              justify-center
                              text-gray-600
                              hover:text-white
                              hover:bg-gray-800
                              transition
                            "
                            aria-label="Ver participantes"
                            title="Ver participantes"
                          >
                            <FaUsers size={14} />
                          </button>
                        )}

                      {!isWhatsAppConversation &&
                        currentConversation.type === 'broker_channel' && (
                          <button
                            type="button"
                            onClick={() => setShowParticipants(true)}
                            className="
                              w-9
                              h-9
                              rounded-lg
                              flex
                              items-center
                              justify-center
                              text-gray-600
                              hover:text-white
                              hover:bg-gray-800
                              transition
                            "
                            aria-label="Informações"
                            title="Participantes"
                          >
                            <FaInfoCircle size={13} />
                          </button>
                        )}

                      {!isWhatsAppConversation && (
                        <button
                          type="button"
                          className="
                            w-9
                            h-9
                            rounded-lg
                            flex
                            items-center
                            justify-center
                            text-gray-600
                            hover:text-white
                            hover:bg-gray-800
                            transition
                          "
                          aria-label="Mais opções"
                        >
                          <FaEllipsisV size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* =========================================
                      MESSAGES
                  ========================================== */}

                  <div
                    ref={messagesContainerRef}
                    className="relative flex-1 overflow-y-auto px-4 lg:px-6 py-5 space-y-1 scrollbar-thin scrollbar-thumb-gray-800"
                  >
                    {loading ? (
                      <div className="flex flex-col items-center justify-center h-full">
                        <div
                          className={`
                            w-7
                            h-7
                            rounded-full
                            border-2
                            border-t-transparent
                            animate-spin
                            ${
                              isWhatsAppConversation
                                ? 'border-emerald-500'
                                : 'border-blue-500'
                            }
                          `}
                        />

                        <span className="text-xs text-gray-600 mt-3">
                          Carregando mensagens...
                        </span>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <div
                          className={`
                            w-14
                            h-14
                            rounded-2xl
                            border
                            flex
                            items-center
                            justify-center
                            mb-4
                            ${
                              isWhatsAppConversation
                                ? 'bg-emerald-500/5 border-emerald-500/10'
                                : 'bg-gray-800/40 border-gray-800'
                            }
                          `}
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

                        <p className="text-xs text-gray-600 mt-1">
                          {isWhatsAppConversation
                            ? 'Envie uma mensagem para continuar o atendimento.'
                            : 'Envie uma mensagem para começar.'}
                        </p>
                      </div>
                    ) : (
                      messages.map((msg, index) => {
                        if (!msg || !msg._id) {
                          return null;
                        }

                        const isWhatsAppMessage =
                          isWhatsAppConversation &&
                          msg.senderType === 'whatsapp_contact';

                        const isOwn = isWhatsAppConversation
                          ? msg.direction === 'outbound' ||
                            (msg.senderType === 'user' &&
                              (msg.sender?._id || msg.sender)?.toString() ===
                                user?._id?.toString())
                          : (msg.sender?._id || msg.sender)?.toString() ===
                            user?._id?.toString();

                        const showDateHeader =
                          index === 0 ||
                          formatDate(messages[index - 1]?.createdAt) !==
                            formatDate(msg.createdAt);

                        const messageContact =
                          msg.whatsappContact ||
                          currentConversation?.whatsappContact ||
                          {};

                        const senderName = isWhatsAppMessage
                          ? messageContact?.name ||
                            getConversationName(currentConversation) ||
                            'Contato WhatsApp'
                          : msg.sender?.name || 'Membro';

                        const senderAvatar = isWhatsAppMessage
                          ? messageContact?.avatar || null
                          : msg.sender?.avatar || null;

                        return (
                          <div key={msg._id}>
                            {showDateHeader && (
                              <div className="flex items-center justify-center my-4">
                                <span className="px-3 py-1 rounded-full bg-gray-800/50 border border-gray-800 text-[10px] text-gray-500 font-medium">
                                  {formatDate(msg.createdAt)}
                                </span>
                              </div>
                            )}

                            <div
                              className={`flex ${
                                isOwn ? 'justify-end' : 'justify-start'
                              } mb-3`}
                            >
                              <div
                                className={`
                                  flex
                                  items-end
                                  gap-2
                                  max-w-[75%]
                                  sm:max-w-[65%]
                                  ${isOwn ? 'flex-row-reverse' : 'flex-row'}
                                `}
                              >
                                {!isOwn && isWhatsAppMessage && (
                                  <div className="w-8 h-8 shrink-0 rounded-full overflow-hidden border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-center">
                                    {senderAvatar ? (
                                      <img
                                        src={senderAvatar}
                                        alt={senderName}
                                        className="w-full h-full object-cover"
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
                                  className={`
                                    rounded-2xl
                                    px-4
                                    py-3
                                    shadow-md
                                    ${
                                      isOwn
                                        ? isWhatsAppConversation
                                          ? 'bg-emerald-600 text-white rounded-br-sm'
                                          : 'bg-blue-600 text-white rounded-br-sm'
                                        : 'bg-[#141a25] text-gray-100 border border-gray-800 rounded-bl-sm'
                                    }
                                  `}
                                >
                                  {!isOwn &&
                                    (currentConversation.type ===
                                      'broker_channel' ||
                                      isWhatsAppMessage) && (
                                      <p
                                        className={`
                                          text-[11px]
                                          font-semibold
                                          mb-1
                                          ${
                                            isWhatsAppMessage
                                              ? 'text-emerald-400'
                                              : 'text-blue-400'
                                          }
                                        `}
                                      >
                                        {senderName}
                                      </p>
                                    )}

                                  <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                                    {getMessageContent(msg)}
                                  </p>

                                  <div
                                    className={`
                                      flex
                                      items-center
                                      justify-end
                                      gap-1.5
                                      mt-1
                                      text-[10px]
                                      ${
                                        isOwn
                                          ? isWhatsAppConversation
                                            ? 'text-emerald-100'
                                            : 'text-blue-200'
                                          : 'text-gray-500'
                                      }
                                    `}
                                  >
                                    <span>
                                      {formatMessageTime(msg.createdAt)}
                                    </span>

                                    {isOwn && !isWhatsAppConversation && (
                                      <FaCheck
                                        size={10}
                                        className={
                                          msg.read
                                            ? 'text-blue-200'
                                            : 'text-blue-300/60'
                                        }
                                      />
                                    )}

                                    {isOwn && isWhatsAppConversation && (
                                      <>
                                        {msg.status === 'read' ? (
                                          <FaCheckDouble
                                            size={11}
                                            className="text-blue-300"
                                          />
                                        ) : msg.status === 'delivered' ? (
                                          <FaCheckDouble
                                            size={11}
                                            className="text-emerald-100"
                                          />
                                        ) : msg.status === 'sent' ? (
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
                      <div className="flex justify-start mb-3">
                        <div className="bg-[#141a25] border border-gray-800 rounded-2xl rounded-bl-sm px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                              style={{
                                animationDelay: '0ms',
                              }}
                            />

                            <span
                              className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                              style={{
                                animationDelay: '150ms',
                              }}
                            />

                            <span
                              className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                              style={{
                                animationDelay: '300ms',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />

                    {/* =========================================
                        SCROLL TO BOTTOM
                    ========================================== */}

                    <button
                      type="button"
                      onClick={() => scrollToBottom('smooth')}
                      className="
                        absolute
                        bottom-5
                        right-5
                        lg:right-6
                        z-30
                        w-10
                        h-10
                        rounded-full
                        bg-[#151c28]
                        border
                        border-gray-700
                        text-gray-300
                        shadow-xl
                        shadow-black/30
                        flex
                        items-center
                        justify-center
                        transition-all
                        duration-200
                        hover:bg-gray-800
                        hover:text-white
                        hover:border-gray-600
                        active:scale-95
                        group
                      "
                      title="Ir para a última mensagem"
                      aria-label="Ir para a última mensagem"
                    >
                      <FaChevronLeft
                        size={13}
                        className="rotate-[-90deg] transition-transform group-hover:translate-y-0.5"
                      />
                    </button>
                  </div>

                  {/* =========================================
                      CHAT INPUT
                  ========================================== */}

                  <form
                    onSubmit={handleSendMessage}
                    className={`
                      p-4
                      border-t
                      border-gray-800/80
                      flex
                      items-center
                      gap-3
                      ${
                        isWhatsAppConversation
                          ? 'bg-[#101a18]/90'
                          : 'bg-[#10151e]/90'
                      }
                    `}
                  >
                    <button
                      type="button"
                      disabled
                      className="
                        w-10
                        h-10
                        shrink-0
                        rounded-xl
                        bg-gray-800/50
                        border
                        border-gray-800
                        flex
                        items-center
                        justify-center
                        text-gray-600
                        opacity-60
                        cursor-not-allowed
                      "
                      aria-label="Anexos em breve"
                      title="Anexos em breve"
                    >
                      <FaPaperclip size={14} />
                    </button>

                    <div className="flex-1 relative">
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
                        className={`
                          w-full
                          h-11
                          bg-[#080b11]
                          border
                          border-gray-800
                          rounded-xl
                          px-4
                          text-sm
                          text-white
                          placeholder:text-gray-600
                          outline-none
                          transition
                          ${
                            isWhatsAppConversation
                              ? 'focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/5'
                              : 'focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/5'
                          }
                        `}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!inputMessage.trim()}
                      className={`
                        w-11
                        h-11
                        shrink-0
                        rounded-xl
                        text-white
                        flex
                        items-center
                        justify-center
                        transition
                        shadow-lg
                        disabled:opacity-40
                        ${
                          isWhatsAppConversation
                            ? 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 shadow-emerald-600/10 disabled:hover:bg-emerald-600'
                            : 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 shadow-blue-600/10 disabled:hover:bg-blue-600'
                        }
                      `}
                      aria-label="Enviar mensagem"
                    >
                      <FaPaperPlane size={14} />
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ====================================================
            PARTICIPANTS PANEL
        ===================================================== */}

        {showParticipants &&
          currentConversation?.type === 'broker_channel' &&
          !isWhatsAppConversation && (
            <div className="fixed inset-0 z-[60] flex">
              <button
                type="button"
                aria-label="Fechar participantes"
                onClick={() => setShowParticipants(false)}
                className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-[2px]"
              />

              <aside className="relative ml-auto flex h-full w-[340px] max-w-[90vw] flex-col border-l border-gray-800 bg-[#0c1017] shadow-2xl">
                <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-gray-800 px-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/10 bg-blue-500/[0.06]">
                      <FaUsers size={15} className="text-blue-400" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white">
                        Participantes
                      </h3>

                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-600">
                          {currentParticipantCount}{' '}
                          {currentParticipantCount === 1
                            ? 'participante'
                            : 'participantes'}
                        </span>

                        {currentOnlineParticipantCount > 0 && (
                          <>
                            <span className="text-gray-800">•</span>

                            <span className="text-[10px] text-emerald-400/70">
                              {currentOnlineParticipantCount} online
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowParticipants(false)}
                    className="
                      w-9
                      h-9
                      rounded-lg
                      flex
                      items-center
                      justify-center
                      text-gray-600
                      hover:text-white
                      hover:bg-gray-800
                      transition
                    "
                    aria-label="Fechar"
                  >
                    <FaTimes size={14} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-gray-800">
                  {currentParticipants.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                      <div className="w-12 h-12 rounded-xl bg-gray-800/40 border border-gray-800 flex items-center justify-center mb-3">
                        <FaUsers size={17} className="text-gray-600" />
                      </div>

                      <p className="text-xs font-semibold text-gray-500">
                        Nenhum participante
                      </p>

                      <p className="text-[10px] text-gray-700 mt-1">
                        Não foi possível carregar os participantes.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {currentParticipants.map((participant) => {
                        const participantOnline = isUserOnline(
                          participant?._id,
                        );

                        const isCurrentUser =
                          participant?._id?.toString() ===
                          user?._id?.toString();

                        const participantName = participant?.name || 'Usuário';

                        return (
                          <div
                            key={participant?._id}
                            className="
                              flex
                              items-center
                              gap-3
                              rounded-xl
                              px-3
                              py-3
                              transition
                              hover:bg-gray-800/30
                            "
                          >
                            <div className="relative shrink-0">
                              <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden">
                                {participant?.avatar ? (
                                  <img
                                    src={participant.avatar}
                                    alt={participantName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-[10px] font-bold text-gray-500">
                                    {getInitials(participantName)}
                                  </span>
                                )}
                              </div>

                              <span
                                className={`
                                  absolute
                                  -bottom-0.5
                                  -right-0.5
                                  w-2.5
                                  h-2.5
                                  rounded-full
                                  border-2
                                  border-[#0c1017]
                                  ${
                                    participantOnline
                                      ? 'bg-emerald-400'
                                      : 'bg-gray-700'
                                  }
                                `}
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-semibold text-gray-300 truncate">
                                  {participantName}
                                </p>

                                {isCurrentUser && (
                                  <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-blue-600/10 border border-blue-500/10 text-blue-400 text-[8px] font-semibold">
                                    Você
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span
                                  className={`
                                    text-[9px]
                                    ${
                                      participantOnline
                                        ? 'text-emerald-400/70'
                                        : 'text-gray-600'
                                    }
                                  `}
                                >
                                  {participantOnline ? 'Online' : 'Offline'}
                                </span>

                                {participant?.role && (
                                  <>
                                    <span className="text-gray-800">•</span>

                                    <span className="text-[9px] text-gray-600 truncate">
                                      {getRoleLabel(participant.role)}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            {participantOnline && (
                              <FaCircle
                                size={5}
                                className="shrink-0 text-emerald-400/70"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </aside>
            </div>
          )}

        {/* ====================================================
            MODAL: NOVA CONVERSA
        ===================================================== */}

        {showNewChat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#0d1119] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-base font-bold text-white">
                  Nova Conversa
                </h3>

                <button
                  type="button"
                  onClick={resetNewChat}
                  className="
                    w-8
                    h-8
                    rounded-lg
                    flex
                    items-center
                    justify-center
                    text-gray-500
                    hover:text-white
                    hover:bg-gray-800
                    transition
                  "
                >
                  <FaTimes size={14} />
                </button>
              </div>

              <div className="p-4 border-b border-gray-800 bg-[#090d13]">
                <div className="grid grid-cols-2 gap-2 bg-[#080b11] p-1 rounded-xl border border-gray-800">
                  <button
                    type="button"
                    onClick={() => {
                      setNewChatMode('direct');
                      setChannelName('');
                      setSelectedUsers([]);
                    }}
                    className={`
                      py-2
                      rounded-lg
                      text-xs
                      font-semibold
                      transition
                      ${
                        newChatMode === 'direct'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-400 hover:text-white'
                      }
                    `}
                  >
                    Conversa Direta
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewChatMode('channel');
                      setSearch('');
                      setSearchResults([]);
                      setSelectedUsers([]);
                    }}
                    className={`
                      py-2
                      rounded-lg
                      text-xs
                      font-semibold
                      transition
                      ${
                        newChatMode === 'channel'
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-gray-400 hover:text-white'
                      }
                    `}
                  >
                    Canal da Equipe
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {newChatMode === 'channel' ? (
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-gray-400">
                      Nome do Canal
                    </label>

                    <input
                      type="text"
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value)}
                      placeholder="Ex: Corretores Centro"
                      className="
                        w-full
                        h-11
                        bg-[#080b11]
                        border
                        border-gray-800
                        rounded-xl
                        px-4
                        text-sm
                        text-white
                        placeholder:text-gray-600
                        outline-none
                        focus:border-blue-500/50
                        focus:ring-2
                        focus:ring-blue-500/5
                        transition
                      "
                    />

                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      Crie um canal de comunicação para múltiplos membros da
                      equipe discutirem negócios e clientes.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="block text-xs font-semibold text-gray-400">
                      Buscar Membro
                    </label>

                    <div className="relative">
                      <FaSearch
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600"
                        size={12}
                      />

                      <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Digite o nome do usuário..."
                        className="
                          w-full
                          h-11
                          bg-[#080b11]
                          border
                          border-gray-800
                          rounded-xl
                          pl-10
                          pr-4
                          text-sm
                          text-white
                          placeholder:text-gray-600
                          outline-none
                          focus:border-blue-500/50
                          focus:ring-2
                          focus:ring-blue-500/5
                          transition
                        "
                      />
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pt-2">
                      {searching ? (
                        <div className="flex items-center justify-center py-6">
                          <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                        </div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((u) => {
                          const isSelected = selectedUsers.some(
                            (id) => id?.toString() === u?._id?.toString(),
                          );

                          return (
                            <button
                              key={u._id}
                              type="button"
                              onClick={() => toggleUser(u._id)}
                              className={`
                                w-full
                                p-2.5
                                rounded-xl
                                border
                                flex
                                items-center
                                justify-between
                                transition
                                ${
                                  isSelected
                                    ? 'bg-blue-600/10 border-blue-500/40 text-white'
                                    : 'bg-[#080b11] border-gray-800 text-gray-300 hover:border-gray-700'
                                }
                              `}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center shrink-0 overflow-hidden">
                                  {u.avatar ? (
                                    <img
                                      src={u.avatar}
                                      alt={u.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-[10px] font-bold text-gray-500">
                                      {getInitials(u.name)}
                                    </span>
                                  )}
                                </div>

                                <div className="min-w-0 text-left">
                                  <p className="text-xs font-semibold truncate">
                                    {u.name}
                                  </p>

                                  <p className="text-[10px] text-gray-500 truncate">
                                    {getRoleLabel(u.role)}
                                  </p>
                                </div>
                              </div>

                              <div
                                className={`
                                  w-5
                                  h-5
                                  rounded-md
                                  border
                                  flex
                                  items-center
                                  justify-center
                                  ${
                                    isSelected
                                      ? 'bg-blue-600 border-blue-500 text-white'
                                      : 'border-gray-700 bg-gray-800/40'
                                  }
                                `}
                              >
                                {isSelected && <FaCheck size={10} />}
                              </div>
                            </button>
                          );
                        })
                      ) : search.length >= 2 ? (
                        <p className="text-center text-xs text-gray-600 py-4">
                          Nenhum usuário encontrado.
                        </p>
                      ) : (
                        <p className="text-center text-xs text-gray-600 py-4">
                          Digite ao menos 2 caracteres para buscar.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-5 py-4 border-t border-gray-800 flex items-center justify-end gap-3 bg-[#090d13]">
                <button
                  type="button"
                  onClick={resetNewChat}
                  className="
                    px-4
                    py-2
                    rounded-xl
                    border
                    border-gray-800
                    text-gray-400
                    hover:text-white
                    text-xs
                    font-semibold
                    transition
                  "
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleCreateConversation}
                  disabled={
                    newChatMode === 'channel'
                      ? !channelName.trim()
                      : selectedUsers.length === 0
                  }
                  className="
                    px-4
                    py-2
                    rounded-xl
                    bg-blue-600
                    hover:bg-blue-500
                    active:bg-blue-700
                    disabled:opacity-40
                    disabled:hover:bg-blue-600
                    text-white
                    text-xs
                    font-semibold
                    transition
                    shadow-lg
                    shadow-blue-600/10
                  "
                >
                  Criar Conversa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

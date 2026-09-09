import { useState, useEffect, useRef, useContext } from 'react';
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
  FaComments,
  FaUserPlus,
  FaBuilding,
  FaRegClock,
  FaSmile,
  FaPaperclip,
  FaEllipsisV,
} from 'react-icons/fa';

import { useChat } from '../context/ChatContext';
import { UserContext } from '../context/UserContext';

export default function ChatPage() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const {
    conversations,
    currentConversation,
    messages,
    loading,
    loadingConversations,
    typingUsers,
    unreadCount,
    onlineUsers,
    loadConversations,
    sendMessage,
    searchUsers,
    selectConversation,
    sendTyping,
    setCurrentConversation,
    isUserOnline,
    getConversationName,
    getConversationAvatar,
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

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  /*
   * ------------------------------------------------------------
   * RESPONSIVIDADE
   * ------------------------------------------------------------
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
   * ------------------------------------------------------------
   * CONVERSAS
   * ------------------------------------------------------------
   */

  useEffect(() => {
    loadConversations();
  }, []);

  /*
   * ------------------------------------------------------------
   * AUTO SCROLL
   * ------------------------------------------------------------
   */

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }, [messages]);

  /*
   * ------------------------------------------------------------
   * BUSCA DE USUÁRIOS
   * ------------------------------------------------------------
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
  }, [search, showNewChat, newChatMode, user]);

  /*
   * ------------------------------------------------------------
   * FORMATADORES
   * ------------------------------------------------------------
   */

  const formatTime = (date) => {
    if (!date) return '';

    const d = new Date(date);
    const now = new Date();
    const diff = now - d;

    if (Number.isNaN(d.getTime())) return '';

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
   * ------------------------------------------------------------
   * NOVA CONVERSA
   * ------------------------------------------------------------
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
   * ------------------------------------------------------------
   * MENSAGENS
   * ------------------------------------------------------------
   */

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || !currentConversation) return;

    try {
      await sendMessage(currentConversation._id, inputMessage.trim());

      setInputMessage('');

      setIsTyping(false);

      sendTyping(currentConversation._id, false);

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
   * ------------------------------------------------------------
   * CONVERSA
   * ------------------------------------------------------------
   */

  const handleSelectConversation = (conversation) => {
    selectConversation(conversation);

    if (isMobile) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  const handleBack = () => {
    setCurrentConversation(null);
  };

  /*
   * ------------------------------------------------------------
   * HELPERS
   * ------------------------------------------------------------
   */

  const isTypingUser = currentConversation?.participants?.some(
    (participant) => {
      const participantId = participant?._id?.toString();

      const currentUserId = user?._id?.toString();

      return (
        participantId &&
        participantId !== currentUserId &&
        typingUsers?.[participantId]
      );
    },
  );

  const getRoleLabel = (role) => {
    const roles = {
      admin: 'Administrador',
      broker: 'Corretor',
      manager: 'Gerente',
      user: 'Usuário',
    };

    return roles[role] || role || 'Usuário';
  };

  const getInitials = (name = '') => {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) return 'U';

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  /*
   * ------------------------------------------------------------
   * RENDER
   * ------------------------------------------------------------
   */

  return (
    <div className="min-h-screen bg-[#080b11] text-white">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/[0.035] rounded-full blur-[120px]" />

        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/[0.025] rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-7">
        {/* =====================================================
            HEADER PRINCIPAL
        ====================================================== */}

        <header className="mb-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-10 h-10 shrink-0 rounded-xl border border-gray-800 bg-[#0d1119] flex items-center justify-center text-gray-500 hover:text-white hover:bg-gray-800 transition"
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
                    Chat Interno
                  </h1>

                  {unreadCount > 0 && (
                    <span className="shrink-0 px-2 py-0.5 rounded-full bg-blue-600/15 border border-blue-500/20 text-blue-400 text-[10px] font-bold">
                      {unreadCount} novas
                    </span>
                  )}
                </div>

                <p className="text-xs lg:text-sm text-gray-500 mt-0.5">
                  Comunicação interna da equipe
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowNewChat(true)}
              className="shrink-0 h-10 lg:h-11 px-3 lg:px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs lg:text-sm font-semibold transition flex items-center gap-2 shadow-lg shadow-blue-600/10"
            >
              <FaPlus size={12} />

              <span className="hidden sm:inline">Nova conversa</span>
            </button>
          </div>
        </header>

        {/* =====================================================
            CHAT CONTAINER
        ====================================================== */}

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
                    placeholder="Buscar conversas..."
                    className="w-full h-10 bg-[#080b11] border border-gray-800 rounded-xl pl-10 pr-4 text-sm text-white placeholder:text-gray-600 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/5 transition"
                  />
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800">
                {loadingConversations ? (
                  <div className="flex flex-col items-center justify-center h-48">
                    <div className="w-7 h-7 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />

                    <span className="text-xs text-gray-600 mt-3">
                      Carregando conversas...
                    </span>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full px-8 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gray-800/40 border border-gray-800 flex items-center justify-center mb-4">
                      <FaComments size={22} className="text-gray-600" />
                    </div>

                    <p className="text-sm font-semibold text-gray-400">
                      Nenhuma conversa
                    </p>

                    <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                      Comece uma nova conversa com alguém da sua equipe.
                    </p>

                    <button
                      type="button"
                      onClick={() => setShowNewChat(true)}
                      className="mt-5 px-3.5 py-2 rounded-lg bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-semibold hover:bg-blue-600/15 transition"
                    >
                      Iniciar conversa
                    </button>
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const isActive =
                      currentConversation?._id?.toString() ===
                      conv?._id?.toString();

                    const otherUser = getOtherParticipant(conv);

                    const online = otherUser
                      ? isUserOnline(otherUser._id)
                      : false;

                    const unread = conv.unreadCount || 0;

                    const avatar = getConversationAvatar(conv);

                    const name = getConversationName(conv);

                    return (
                      <button
                        key={conv._id}
                        type="button"
                        onClick={() => handleSelectConversation(conv)}
                        className={`relative w-full p-3.5 text-left border-b border-gray-800/50 transition group ${
                          isActive
                            ? 'bg-blue-600/[0.07]'
                            : 'hover:bg-gray-800/25'
                        }`}
                      >
                        {/* Active indicator */}
                        {isActive && (
                          <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full bg-blue-500" />
                        )}

                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="relative shrink-0">
                            <div className="w-11 h-11 rounded-xl bg-gray-800/70 border border-gray-700/70 flex items-center justify-center overflow-hidden">
                              {avatar ? (
                                <img
                                  src={avatar}
                                  alt={name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              ) : conv.type === 'broker_channel' ? (
                                <FaUsers className="text-blue-400" size={17} />
                              ) : (
                                <span className="text-xs font-bold text-gray-500">
                                  {getInitials(name)}
                                </span>
                              )}
                            </div>

                            {conv.type !== 'broker_channel' && (
                              <span
                                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0b0f16] ${
                                  online ? 'bg-emerald-400' : 'bg-gray-700'
                                }`}
                              />
                            )}
                          </div>

                          {/* Conversation info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p
                                className={`text-sm truncate ${
                                  unread > 0
                                    ? 'font-bold text-white'
                                    : 'font-semibold text-gray-200'
                                }`}
                              >
                                {name}
                              </p>

                              <span
                                className={`shrink-0 text-[10px] ${
                                  unread > 0 ? 'text-blue-400' : 'text-gray-600'
                                }`}
                              >
                                {formatTime(conv.lastMessageAt)}
                              </span>
                            </div>

                            <div className="flex items-center justify-between gap-2 mt-1">
                              <p
                                className={`text-xs truncate ${
                                  unread > 0 ? 'text-gray-300' : 'text-gray-600'
                                }`}
                              >
                                {conv.lastMessage || 'Nenhuma mensagem ainda'}
                              </p>

                              {unread > 0 && (
                                <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
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
                /* =============================================
                   EMPTY CHAT
                ============================================== */

                <div className="flex-1 flex items-center justify-center px-6">
                  <div className="text-center max-w-sm">
                    <div className="relative mx-auto w-20 h-20 mb-5">
                      <div className="absolute inset-0 rounded-3xl bg-blue-600/5 blur-xl" />

                      <div className="relative w-20 h-20 rounded-3xl bg-[#111722] border border-gray-800 flex items-center justify-center">
                        <FaComments size={30} className="text-gray-600" />
                      </div>
                    </div>

                    <h2 className="text-lg font-semibold text-gray-300">
                      Suas conversas
                    </h2>

                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                      Selecione uma conversa para visualizar as mensagens ou
                      inicie uma nova conversa com sua equipe.
                    </p>

                    <button
                      type="button"
                      onClick={() => setShowNewChat(true)}
                      className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-lg shadow-blue-600/10"
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

                  <div className="h-[72px] shrink-0 px-4 lg:px-5 border-b border-gray-800/80 bg-[#10151e]/90 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Mobile back */}
                      <button
                        type="button"
                        onClick={handleBack}
                        className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-gray-800 transition"
                        aria-label="Voltar para conversas"
                      >
                        <FaChevronLeft size={15} />
                      </button>

                      {/* Avatar */}
                      <div className="relative shrink-0">
                        <div className="w-11 h-11 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden">
                          {getConversationAvatar(currentConversation) ? (
                            <img
                              src={getConversationAvatar(currentConversation)}
                              alt={getConversationName(currentConversation)}
                              className="w-full h-full object-cover"
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

                        {currentConversation.type !== 'broker_channel' &&
                          getOtherParticipant(currentConversation) && (
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#10151e] ${
                                isUserOnline(
                                  getOtherParticipant(currentConversation)?._id,
                                )
                                  ? 'bg-emerald-400'
                                  : 'bg-gray-700'
                              }`}
                            />
                          )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-white truncate">
                            {getConversationName(currentConversation)}
                          </p>

                          {currentConversation.type === 'broker_channel' && (
                            <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-blue-600/10 border border-blue-500/10 text-blue-400 text-[9px] font-semibold">
                              <FaUsers size={8} />
                              EQUIPE
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-gray-600 mt-0.5">
                          {currentConversation.type === 'broker_channel'
                            ? `${
                                currentConversation.participants?.length || 0
                              } participantes`
                            : getOtherParticipant(currentConversation)
                              ? isUserOnline(
                                  getOtherParticipant(currentConversation)?._id,
                                )
                                ? 'Online agora'
                                : 'Offline'
                              : 'Conversa'}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <button
                      type="button"
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-600 hover:text-white hover:bg-gray-800 transition"
                      aria-label="Mais opções"
                    >
                      <FaEllipsisV size={13} />
                    </button>
                  </div>

                  {/* =========================================
                      MESSAGES
                  ========================================== */}

                  <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-5 space-y-1 scrollbar-thin scrollbar-thumb-gray-800">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="w-7 h-7 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />

                        <span className="text-xs text-gray-600 mt-3">
                          Carregando mensagens...
                        </span>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-14 h-14 rounded-2xl bg-gray-800/40 border border-gray-800 flex items-center justify-center mb-4">
                          <FaComments size={20} className="text-gray-600" />
                        </div>

                        <p className="text-sm font-semibold text-gray-400">
                          Início da conversa
                        </p>

                        <p className="text-xs text-gray-600 mt-1">
                          Envie uma mensagem para começar.
                        </p>
                      </div>
                    ) : (
                      messages.map((msg, index) => {
                        if (!msg || !msg._id) return null;

                        const senderId = msg.sender?._id || msg.sender;

                        const isOwn =
                          senderId?.toString() === user?._id?.toString();

                        const showDateHeader =
                          index === 0 ||
                          formatDate(messages[index - 1]?.createdAt) !==
                            formatDate(msg.createdAt);

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
                                className={`max-w-[75%] sm:max-w-[65%] rounded-2xl px-4 py-3 shadow-md ${
                                  isOwn
                                    ? 'bg-blue-600 text-white rounded-br-sm'
                                    : 'bg-[#141a25] text-gray-100 border border-gray-800 rounded-bl-sm'
                                }`}
                              >
                                {!isOwn &&
                                  currentConversation.type ===
                                    'broker_channel' && (
                                    <p className="text-[11px] font-semibold text-blue-400 mb-1">
                                      {msg.sender?.name || 'Membro'}
                                    </p>
                                  )}

                                <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                                  {msg.content}
                                </p>

                                <div
                                  className={`flex items-center justify-end gap-1.5 mt-1 text-[10px] ${
                                    isOwn ? 'text-blue-200' : 'text-gray-500'
                                  }`}
                                >
                                  <span>
                                    {formatMessageTime(msg.createdAt)}
                                  </span>
                                  {isOwn && (
                                    <FaCheck
                                      size={10}
                                      className={
                                        msg.read
                                          ? 'text-blue-200'
                                          : 'text-blue-300/60'
                                      }
                                    />
                                  )}
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
                              style={{ animationDelay: '0ms' }}
                            />
                            <span
                              className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: '150ms' }}
                            />
                            <span
                              className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: '300ms' }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* =========================================
                      CHAT INPUT
                  ========================================== */}

                  <form
                    onSubmit={handleSendMessage}
                    className="p-4 border-t border-gray-800/80 bg-[#10151e]/90 flex items-center gap-3"
                  >
                    <button
                      type="button"
                      className="w-10 h-10 shrink-0 rounded-xl bg-gray-800/50 border border-gray-800 flex items-center justify-center text-gray-500 hover:text-white hover:bg-gray-800 transition"
                      aria-label="Anexar arquivo"
                    >
                      <FaPaperclip size={14} />
                    </button>

                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputMessage}
                        onChange={handleTyping}
                        placeholder="Digite sua mensagem..."
                        className="w-full h-11 bg-[#080b11] border border-gray-800 rounded-xl px-4 text-sm text-white placeholder:text-gray-600 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/5 transition"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!inputMessage.trim()}
                      className="w-11 h-11 shrink-0 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white flex items-center justify-center transition shadow-lg shadow-blue-600/10"
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

        {/* =====================================================
            MODAL: NOVA CONVERSA
        ====================================================== */}

        {showNewChat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-md bg-[#0d1119] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Modal header */}
              <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="text-base font-bold text-white">
                  Nova Conversa
                </h3>

                <button
                  type="button"
                  onClick={resetNewChat}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-gray-800 transition"
                >
                  <FaTimes size={14} />
                </button>
              </div>

              {/* Mode switch */}
              <div className="p-4 border-b border-gray-800 bg-[#090d13]">
                <div className="grid grid-cols-2 gap-2 bg-[#080b11] p-1 rounded-xl border border-gray-800">
                  <button
                    type="button"
                    onClick={() => {
                      setNewChatMode('direct');
                      setChannelName('');
                      setSelectedUsers([]);
                    }}
                    className={`py-2 rounded-lg text-xs font-semibold transition ${
                      newChatMode === 'direct'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
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
                    className={`py-2 rounded-lg text-xs font-semibold transition ${
                      newChatMode === 'channel'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Canal da Equipe
                  </button>
                </div>
              </div>

              {/* Modal body */}
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
                      className="w-full h-11 bg-[#080b11] border border-gray-800 rounded-xl px-4 text-sm text-white placeholder:text-gray-600 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/5 transition"
                    />

                    <p className="text-[11px] text-gray-600">
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
                        className="w-full h-11 bg-[#080b11] border border-gray-800 rounded-xl pl-10 pr-4 text-sm text-white placeholder:text-gray-600 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/5 transition"
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
                              className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition ${
                                isSelected
                                  ? 'bg-blue-600/10 border-blue-500/40 text-white'
                                  : 'bg-[#080b11] border-gray-800 text-gray-300 hover:border-gray-700'
                              }`}
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
                                className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                                  isSelected
                                    ? 'bg-blue-600 border-blue-500 text-white'
                                    : 'border-gray-700 bg-gray-800/40'
                                }`}
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

              {/* Modal footer */}
              <div className="px-5 py-4 border-t border-gray-800 flex items-center justify-end gap-3 bg-[#090d13]">
                <button
                  type="button"
                  onClick={resetNewChat}
                  className="px-4 py-2 rounded-xl border border-gray-800 text-gray-400 hover:text-white text-xs font-semibold transition"
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
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 text-white text-xs font-semibold transition shadow-lg shadow-blue-600/10"
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

import { useEffect, useRef, useState, useContext } from 'react';
import {
  FaPaperPlane,
  FaUser,
  FaUsers,
  FaCircle,
  FaChevronLeft,
  FaTimes,
  FaCheck,
  FaRegClock,
  FaSmile,
  FaPaperclip,
  FaEllipsisV,
  FaInfoCircle,
} from 'react-icons/fa';

import { useChat } from '../../context/ChatContext';
import { UserContext } from '../../context/UserContext';

export default function ChatArea({ onBack }) {
  const { user } = useContext(UserContext);

  const {
    currentConversation,
    messages,
    loading,
    typingUsers,
    sendMessage,
    sendTyping,
    isUserOnline,
    getConversationName,
    getConversationAvatar,
    getOtherParticipant,
  } = useChat();

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const otherUser = currentConversation
    ? getOtherParticipant(currentConversation)
    : null;

  const online = otherUser ? isUserOnline(otherUser._id) : false;

  // =========================================================
  // HELPERS
  // =========================================================

  const getInitials = (name = '') => {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (!parts.length) return '?';

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  const isSameUser = (id1, id2) => {
    if (!id1 || !id2) return false;

    return id1.toString() === id2.toString();
  };

  const formatTime = (date) => {
    if (!date) return '';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    return parsedDate.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date) => {
    if (!date) return '';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '';
    }

    const today = new Date();

    if (parsedDate.toDateString() === today.toDateString()) {
      return 'Hoje';
    }

    const yesterday = new Date(today);

    yesterday.setDate(yesterday.getDate() - 1);

    if (parsedDate.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    }

    return parsedDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getRoleLabel = (role) => {
    const roles = {
      admin: 'Administrador',
      broker: 'Corretor',
      manager: 'Gestor',
      user: 'Usuário',
    };

    return roles[role] || 'Usuário';
  };

  // =========================================================
  // SCROLL
  // =========================================================

  useEffect(() => {
    if (!messagesEndRef.current) return;

    messagesEndRef.current.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages, typingUsers]);

  // =========================================================
  // FOCUS
  // =========================================================

  useEffect(() => {
    if (!inputRef.current || !currentConversation) return;

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 120);

    return () => clearTimeout(timer);
  }, [currentConversation]);

  // =========================================================
  // CLEANUP TYPING
  // =========================================================

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // =========================================================
  // SEND
  // =========================================================

  const handleSend = async (event) => {
    event.preventDefault();

    const content = inputMessage.trim();

    if (!content || !currentConversation || sending) {
      return;
    }

    try {
      setSending(true);

      await sendMessage(currentConversation._id, content);

      setInputMessage('');
      setIsTyping(false);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      sendTyping(currentConversation._id, false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setSending(false);
    }
  };

  // =========================================================
  // TYPING
  // =========================================================

  const handleTyping = (event) => {
    const value = event.target.value;

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
      sendTyping(currentConversation._id, false);
    }, 2000);
  };

  // =========================================================
  // ENTER / SHIFT + ENTER
  // =========================================================

  const handleInputKeyDown = (event) => {
    if (event.key !== 'Enter') return;

    if (event.shiftKey) {
      return;
    }

    event.preventDefault();

    if (inputMessage.trim()) {
      handleSend(event);
    }
  };

  // =========================================================
  // NO CONVERSATION
  // =========================================================

  if (!currentConversation) {
    return (
      <div className="relative flex h-full flex-1 items-center justify-center overflow-hidden bg-[#0d1119]">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/[0.025] blur-3xl" />
        </div>

        <div className="relative px-6 text-center">
          <div
            className="
              mx-auto
              mb-5
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              border
              border-white/[0.06]
              bg-white/[0.025]
              text-gray-600
              shadow-2xl
            "
          >
            <FaUsers size={24} />
          </div>

          <h3 className="text-sm font-semibold text-gray-300">
            Selecione uma conversa
          </h3>

          <p className="mx-auto mt-1.5 max-w-xs text-xs leading-relaxed text-gray-600">
            Escolha uma conversa na sua lista ou inicie uma nova para começar a
            trocar mensagens.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // CONVERSATION DATA
  // =========================================================

  const conversationName =
    getConversationName(currentConversation) || 'Conversa';

  const conversationAvatar = getConversationAvatar(currentConversation);

  const isChannel = currentConversation.type === 'broker_channel';

  const participantCount = currentConversation.participants?.length || 0;

  const isTypingUser = otherUser && typingUsers?.[otherUser._id];

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="relative flex h-full flex-1 flex-col overflow-hidden bg-[#0d1119]">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <header
        className="
          relative
          z-10
          flex
          min-h-[70px]
          shrink-0
          items-center
          justify-between
          border-b
          border-white/[0.06]
          bg-[#11151f]/95
          px-4
          backdrop-blur-xl
          sm:px-5
        "
      >
        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          {/* Mobile back */}
          <button
            type="button"
            onClick={onBack}
            aria-label="Voltar"
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              text-gray-500
              transition
              hover:bg-white/[0.05]
              hover:text-white
              lg:hidden
            "
          >
            <FaChevronLeft size={14} />
          </button>

          {/* Avatar */}
          <div className="relative shrink-0">
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                overflow-hidden
                rounded-xl
                border
                border-white/[0.07]
                bg-gray-800
                sm:h-11
                sm:w-11
              "
            >
              {conversationAvatar ? (
                <img
                  src={conversationAvatar}
                  alt={conversationName}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              ) : isChannel ? (
                <FaUsers className="text-blue-400" size={17} />
              ) : otherUser?.name ? (
                <span className="text-xs font-bold text-gray-400">
                  {getInitials(otherUser.name)}
                </span>
              ) : (
                <FaUser className="text-gray-600" size={16} />
              )}
            </div>

            {/* Online indicator */}
            {!isChannel && online && (
              <span
                className="
                  absolute
                  -bottom-0.5
                  -right-0.5
                  flex
                  h-3
                  w-3
                  items-center
                  justify-center
                  rounded-full
                  bg-[#11151f]
                "
              >
                <FaCircle className="text-emerald-400" size={7} />
              </span>
            )}
          </div>

          {/* Conversation info */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate text-[13px] font-bold text-white sm:text-sm">
                {conversationName}
              </h2>

              {isChannel && (
                <span
                  className="
                    hidden
                    rounded-md
                    border
                    border-blue-500/15
                    bg-blue-500/[0.08]
                    px-1.5
                    py-0.5
                    text-[8px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-blue-400
                    sm:inline-flex
                  "
                >
                  Canal
                </span>
              )}
            </div>

            <div className="mt-0.5 flex items-center gap-1.5">
              {isChannel ? (
                <>
                  <FaUsers size={8} className="text-gray-600" />
                  <span className="text-[10px] text-gray-600">
                    {participantCount}{' '}
                    {participantCount === 1 ? 'participante' : 'participantes'}
                  </span>
                </>
              ) : (
                <>
                  <span
                    className={`
                      h-1.5
                      w-1.5
                      rounded-full
                      ${online ? 'bg-emerald-400' : 'bg-gray-700'}
                    `}
                  />

                  <span
                    className={`
                      text-[10px]
                      ${online ? 'text-emerald-400/80' : 'text-gray-600'}
                    `}
                  >
                    {online ? 'Online' : 'Offline'}
                  </span>

                  {otherUser?.role && (
                    <>
                      <span className="text-gray-800">•</span>
                      <span className="hidden text-[10px] text-gray-700 sm:inline">
                        {getRoleLabel(otherUser.role)}
                      </span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Informações da conversa"
            className="
              hidden
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              text-gray-600
              transition
              hover:bg-white/[0.05]
              hover:text-gray-300
              sm:flex
            "
          >
            <FaInfoCircle size={14} />
          </button>

          <button
            type="button"
            aria-label="Mais opções"
            className="
              hidden
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              text-gray-600
              transition
              hover:bg-white/[0.05]
              hover:text-gray-300
              sm:flex
            "
          >
            <FaEllipsisV size={13} />
          </button>

          <button
            type="button"
            onClick={onBack}
            aria-label="Fechar conversa"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              text-gray-600
              transition
              hover:bg-white/[0.05]
              hover:text-white
              lg:hidden
            "
          >
            <FaTimes size={15} />
          </button>
        </div>
      </header>

      {/* =====================================================
          MESSAGES
      ====================================================== */}
      <div
        className="
          relative
          flex-1
          overflow-y-auto
          px-3
          py-4
          sm:px-5
          sm:py-5
        "
      >
        {/* Subtle background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 top-20 h-72 w-72 rounded-full bg-blue-600/[0.015] blur-3xl" />
          <div className="absolute -left-40 bottom-20 h-72 w-72 rounded-full bg-indigo-600/[0.012] blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-4xl">
          {/* Loading */}
          {loading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-blue-500/10
                  bg-blue-500/[0.05]
                "
              >
                <div
                  className="
                    h-5
                    w-5
                    animate-spin
                    rounded-full
                    border-2
                    border-blue-500
                    border-t-transparent
                  "
                />
              </div>

              <p className="mt-3 text-[11px] text-gray-600">
                Carregando mensagens...
              </p>
            </div>
          ) : messages.length === 0 ? (
            /* =================================================
               EMPTY
            ================================================== */
            <div className="flex min-h-[350px] items-center justify-center">
              <div className="max-w-xs px-5 text-center">
                <div
                  className="
                    mx-auto
                    mb-4
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-white/[0.06]
                    bg-white/[0.025]
                    text-gray-600
                  "
                >
                  {isChannel ? <FaUsers size={20} /> : <FaUser size={19} />}
                </div>

                <h3 className="text-sm font-semibold text-gray-400">
                  Nenhuma mensagem ainda
                </h3>

                <p className="mt-1.5 text-[11px] leading-relaxed text-gray-600">
                  Esta conversa ainda não possui mensagens. Envie uma mensagem
                  para começar.
                </p>
              </div>
            </div>
          ) : (
            /* =================================================
               MESSAGE LIST
            ================================================== */
            <div className="space-y-1">
              {messages.map((msg, index) => {
                // Safety
                if (!msg || !msg._id) {
                  return null;
                }

                const senderId = msg.sender?._id || msg.sender;
                const isOwn = isSameUser(senderId, user?._id);
                const senderName = msg.sender?.name || 'Usuário';
                const senderAvatar = msg.sender?.avatar;
                const isOptimistic = msg.isOptimistic || false;
                const isSending = msg.status === 'sending' || isOptimistic;
                const isFailed =
                  msg.status === 'failed' || msg.status === 'error';

                const previousMessage = messages[index - 1];
                const currentDate = msg.createdAt
                  ? new Date(msg.createdAt)
                  : null;
                const previousDate = previousMessage?.createdAt
                  ? new Date(previousMessage.createdAt)
                  : null;

                const showDate =
                  index === 0 ||
                  !previousDate ||
                  !currentDate ||
                  currentDate.toDateString() !== previousDate.toDateString();

                const sameSenderAsPrevious =
                  previousMessage &&
                  isSameUser(
                    previousMessage.sender?._id || previousMessage.sender,
                    senderId,
                  ) &&
                  !showDate;

                return (
                  <div
                    key={msg._id}
                    className={`
                      message-enter
                      ${isSending ? 'message-sending' : ''}
                    `}
                  >
                    {/* Date separator */}
                    {showDate && (
                      <div className="flex items-center gap-3 py-5">
                        <div className="h-px flex-1 bg-white/[0.04]" />

                        <span
                          className="
                            shrink-0
                            rounded-full
                            border
                            border-white/[0.05]
                            bg-[#11151f]
                            px-3
                            py-1
                            text-[9px]
                            font-semibold
                            text-gray-600
                          "
                        >
                          {formatDate(msg.createdAt)}
                        </span>

                        <div className="h-px flex-1 bg-white/[0.04]" />
                      </div>
                    )}

                    {/* Message row */}
                    <div
                      className={`
                        group
                        flex
                        items-end
                        gap-2
                        ${isOwn ? 'justify-end' : 'justify-start'}
                        ${sameSenderAsPrevious ? 'mt-0.5' : 'mt-2.5'}
                      `}
                    >
                      {/* Received avatar */}
                      {!isOwn && (
                        <div className="w-7 shrink-0">
                          {!sameSenderAsPrevious && (
                            <div
                              className="
                                flex
                                h-7
                                w-7
                                items-center
                                justify-center
                                overflow-hidden
                                rounded-lg
                                border
                                border-white/[0.06]
                                bg-gray-800
                              "
                            >
                              {senderAvatar ? (
                                <img
                                  src={senderAvatar}
                                  alt={senderName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-[8px] font-bold text-gray-400">
                                  {getInitials(senderName)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Bubble */}
                      <div
                        className={`
                          relative
                          max-w-[88%]
                          sm:max-w-[72%]
                          ${isOwn ? 'items-end' : 'items-start'}
                          flex
                          flex-col
                        `}
                      >
                        {/* Sender name */}
                        {!isOwn && !sameSenderAsPrevious && (
                          <div className="mb-1 ml-1 flex items-center gap-2">
                            <span className="text-[9px] font-semibold text-blue-400">
                              {senderName}
                            </span>

                            {msg.sender?.role && (
                              <span className="text-[8px] text-gray-700">
                                {getRoleLabel(msg.sender.role)}
                              </span>
                            )}
                          </div>
                        )}

                        <div
                          className={`
                            relative
                            rounded-2xl
                            px-3.5
                            py-2.5
                            shadow-sm
                            transition
                            ${
                              isOwn
                                ? `
                                  rounded-br-md
                                  bg-blue-600
                                  text-white
                                  shadow-blue-900/10
                                `
                                : `
                                  rounded-bl-md
                                  border
                                  border-white/[0.045]
                                  bg-[#171d28]
                                  text-gray-200
                                `
                            }
                            ${isSending ? 'opacity-65' : ''}
                            ${isFailed ? 'border-red-500/30 bg-red-500/10' : ''}
                          `}
                        >
                          {/* Content */}
                          <p
                            className="
                              whitespace-pre-wrap
                              break-words
                              text-[13px]
                              leading-relaxed
                            "
                          >
                            {msg.content || ''}
                          </p>

                          {/* Metadata */}
                          <div
                            className={`
                              mt-1
                              flex
                              items-center
                              justify-end
                              gap-1.5
                              ${isOwn ? 'text-blue-200/60' : 'text-gray-600'}
                            `}
                          >
                            <span className="text-[8px]">
                              {formatTime(msg.createdAt)}
                            </span>

                            {isOwn && (
                              <>
                                {isFailed ? (
                                  <span className="text-[8px] text-red-300">
                                    Falha
                                  </span>
                                ) : isSending ? (
                                  <FaRegClock
                                    size={8}
                                    className="animate-pulse"
                                  />
                                ) : (
                                  <FaCheck size={8} />
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* =================================================
                  TYPING
              ================================================== */}
              {isTypingUser && (
                <div className="mt-3 flex items-end gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/[0.06] bg-gray-800">
                    {otherUser?.avatar ? (
                      <img
                        src={otherUser.avatar}
                        alt={otherUser.name || 'Usuário'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-[8px] font-bold text-gray-400">
                        {getInitials(otherUser?.name || 'Usuário')}
                      </span>
                    )}
                  </div>

                  <div>
                    <div
                      className="
                        flex
                        items-center
                        gap-1
                        rounded-2xl
                        rounded-bl-md
                        border
                        border-white/[0.045]
                        bg-[#171d28]
                        px-3.5
                        py-3
                      "
                    >
                      <span
                        className="
                          h-1.5
                          w-1.5
                          animate-bounce
                          rounded-full
                          bg-gray-500
                        "
                        style={{
                          animationDelay: '0ms',
                        }}
                      />

                      <span
                        className="
                          h-1.5
                          w-1.5
                          animate-bounce
                          rounded-full
                          bg-gray-500
                        "
                        style={{
                          animationDelay: '150ms',
                        }}
                      />

                      <span
                        className="
                          h-1.5
                          w-1.5
                          animate-bounce
                          rounded-full
                          bg-gray-500
                        "
                        style={{
                          animationDelay: '300ms',
                        }}
                      />
                    </div>

                    <p className="ml-1 mt-1 text-[8px] text-gray-700">
                      {otherUser?.name || 'Usuário'} está digitando...
                    </p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} className="h-1" />
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          INPUT AREA
      ====================================================== */}
      <div
        className="
          relative
          z-10
          border-t
          border-white/[0.06]
          bg-[#11151f]/95
          p-3
          backdrop-blur-xl
          sm:p-4
        "
      >
        <form
          onSubmit={handleSend}
          className="relative mx-auto flex w-full max-w-4xl items-center gap-2"
        >
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Anexar arquivo"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                text-gray-500
                transition
                hover:bg-white/[0.05]
                hover:text-gray-300
              "
            >
              <FaPaperclip size={15} />
            </button>
          </div>

          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={handleTyping}
              onKeyDown={handleInputKeyDown}
              placeholder="Digite uma mensagem..."
              rows={1}
              className="
                w-full
                resize-none
                rounded-xl
                border
                border-white/[0.07]
                bg-[#171d28]
                px-4
                py-2.5
                text-[13px]
                text-white
                placeholder-gray-500
                focus:border-blue-500/50
                focus:outline-none
                focus:ring-1
                focus:ring-blue-500/50
              "
            />
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Emojis"
              className="
                hidden
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                text-gray-500
                transition
                hover:bg-white/[0.05]
                hover:text-gray-300
                sm:flex
              "
            >
              <FaSmile size={16} />
            </button>

            <button
              type="submit"
              disabled={!inputMessage.trim() || sending}
              aria-label="Enviar mensagem"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-blue-600
                text-white
                transition
                hover:bg-blue-500
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <FaPaperPlane size={13} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

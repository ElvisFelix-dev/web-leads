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

  const { user } = useContext(UserContext);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);

  /*
  ====================================================
  EMOJIS
  ====================================================
  */

  const emojiCategories = {
    recentes: ['😀', '😂', '😍', '😊', '👍', '❤️', '🔥', '👏'],
    pessoas: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣'],
    gestos: ['👍', '👎', '👌', '✌️', '🤞', '👏', '🙌', '🙏'],
    objetos: ['🔥', '⭐', '💡', '🎯', '🚀', '💼', '📌', '📅'],
  };

  /*
  ====================================================
  HELPERS
  ====================================================
  */

  const getInitials = (name = '') => {
    if (!name) return '?';

    const parts = name.trim().split(' ').filter(Boolean);

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  const isSameUser = (userA, userB) => {
    if (!userA || !userB) return false;

    const idA = typeof userA === 'object' ? userA._id || userA.id : userA;

    const idB = typeof userB === 'object' ? userB._id || userB.id : userB;

    if (!idA || !idB) return false;

    return String(idA) === String(idB);
  };

  const formatTime = (date) => {
    if (!date) return '';

    try {
      return new Date(date).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const formatDate = (date) => {
    if (!date) return '';

    try {
      const messageDate = new Date(date);
      const today = new Date();

      const isToday =
        messageDate.getDate() === today.getDate() &&
        messageDate.getMonth() === today.getMonth() &&
        messageDate.getFullYear() === today.getFullYear();

      if (isToday) {
        return 'Hoje';
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const isYesterday =
        messageDate.getDate() === yesterday.getDate() &&
        messageDate.getMonth() === yesterday.getMonth() &&
        messageDate.getFullYear() === yesterday.getFullYear();

      if (isYesterday) {
        return 'Ontem';
      }

      return messageDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const getRoleLabel = (role) => {
    const roles = {
      admin: 'Administrador',
      broker: 'Corretor',
      manager: 'Gestor',
      supervisor: 'Supervisor',
      user: 'Usuário',
    };

    return roles[role] || 'Usuário';
  };

  /*
  ====================================================
  CONVERSA
  ====================================================
  */

  const otherUser = currentConversation
    ? getOtherParticipant(currentConversation)
    : null;

  const online = otherUser ? isUserOnline(otherUser._id) : false;

  /*
  ====================================================
  PARTICIPANTES
  ====================================================
  */

  const participants =
    currentConversation && Array.isArray(currentConversation.participants)
      ? currentConversation.participants.filter(Boolean)
      : [];

  const participantCount = participants.length;

  const onlineParticipants = participants.filter((participant) =>
    isUserOnline(participant?._id),
  );

  const onlineParticipantCount = onlineParticipants.length;

  /*
  ====================================================
  TYPING
  ====================================================
  */

  const isTypingUser = otherUser && typingUsers?.[otherUser._id];

  /*
  ====================================================
  EMOJI PICKER
  ====================================================
  */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const insertEmoji = (emoji) => {
    setInputMessage((prev) => `${prev}${emoji}`);

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  /*
  ====================================================
  SCROLL
  ====================================================
  */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  /*
  ====================================================
  FOCUS
  ====================================================
  */

  useEffect(() => {
    if (!loading && currentConversation) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [currentConversation, loading]);

  /*
  ====================================================
  CLEANUP TYPING
  ====================================================
  */

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  /*
  ====================================================
  ENVIAR MENSAGEM
  ====================================================
  */

  const handleSendMessage = async () => {
    const content = inputMessage.trim();

    if (!content || sending || !currentConversation) {
      return;
    }

    try {
      setSending(true);

      await sendMessage(currentConversation._id, content);

      setInputMessage('');
      setShowEmojiPicker(false);
      setIsTyping(false);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      textareaRef.current?.focus();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setSending(false);
    }
  };

  /*
  ====================================================
  DIGITAÇÃO
  ====================================================
  */

  const handleTyping = (value) => {
    setInputMessage(value);

    if (!currentConversation) {
      return;
    }

    if (!isTyping) {
      setIsTyping(true);
      sendTyping(currentConversation._id, true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTyping(currentConversation._id, false);
    }, 1200);
  };

  /*
  ====================================================
  ENTER
  ====================================================
  */

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  /*
  ====================================================
  ESTADO VAZIO
  ====================================================
  */

  if (!currentConversation) {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center bg-[#08090c]">
        <div className="flex max-w-sm flex-col items-center px-6 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.025]">
            <FaUsers className="text-xl text-gray-600" />
          </div>

          <h3 className="text-sm font-semibold text-gray-300">
            Selecione uma conversa
          </h3>

          <p className="mt-2 text-xs leading-5 text-gray-600">
            Escolha uma conversa na lista para começar a trocar mensagens.
          </p>
        </div>
      </div>
    );
  }

  /*
  ====================================================
  DADOS DA CONVERSA
  ====================================================
  */

  const conversationName =
    getConversationName(currentConversation) || 'Conversa';

  const conversationAvatar = getConversationAvatar(currentConversation);

  const isChannel = currentConversation.type === 'broker_channel';

  /*
  ====================================================
  RENDER
  ====================================================
  */

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#08090c]">
      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="relative z-20 flex h-[68px] shrink-0 items-center border-b border-white/[0.05] bg-[#0b0d11]/95 px-4 backdrop-blur-xl">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mr-2 flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition hover:bg-white/[0.05] hover:text-gray-200"
            title="Voltar"
          >
            <FaChevronLeft size={13} />
          </button>
        )}

        {/* Avatar */}

        <div className="relative mr-3 shrink-0">
          {conversationAvatar ? (
            <img
              src={conversationAvatar}
              alt={conversationName}
              className="h-10 w-10 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04]">
              {isChannel ? (
                <FaUsers className="text-sm text-gray-400" />
              ) : (
                <FaUser className="text-sm text-gray-400" />
              )}
            </div>
          )}

          {!isChannel && (
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0b0d11] ${
                online ? 'bg-emerald-400' : 'bg-gray-600'
              }`}
            />
          )}
        </div>

        {/* Nome / informações */}

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate text-sm font-semibold text-gray-200">
              {conversationName}
            </h2>

            {isChannel && (
              <span className="shrink-0 rounded-md border border-indigo-400/10 bg-indigo-400/[0.06] px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-indigo-300/70">
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

                {onlineParticipantCount > 0 && (
                  <>
                    <span className="text-gray-800">•</span>

                    <span className="text-[10px] text-emerald-400/70">
                      {onlineParticipantCount} online
                    </span>
                  </>
                )}
              </>
            ) : (
              <>
                <FaCircle
                  size={6}
                  className={online ? 'text-emerald-400' : 'text-gray-600'}
                />

                <span
                  className={`text-[10px] ${
                    online ? 'text-emerald-400/70' : 'text-gray-600'
                  }`}
                >
                  {online ? 'Online' : 'Offline'}
                </span>

                {otherUser?.role && (
                  <>
                    <span className="text-gray-800">•</span>

                    <span className="truncate text-[10px] text-gray-600">
                      {getRoleLabel(otherUser.role)}
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Ações */}

        <div className="ml-3 flex items-center gap-1">
          {isChannel && (
            <button
              type="button"
              onClick={() => setShowParticipants(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition hover:bg-white/[0.05] hover:text-gray-200"
              title="Ver participantes"
            >
              <FaUsers size={14} />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (isChannel) {
                setShowParticipants(true);
              }
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition hover:bg-white/[0.05] hover:text-gray-200"
            title={
              isChannel ? 'Informações do canal' : 'Informações da conversa'
            }
          >
            <FaInfoCircle size={14} />
          </button>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition hover:bg-white/[0.05] hover:text-gray-200"
            title="Mais opções"
          >
            <FaEllipsisV size={13} />
          </button>
        </div>
      </header>

      {/* ==================================================
          PARTICIPANTS PANEL
      ================================================== */}

      {showParticipants && isChannel && (
        <div className="absolute inset-0 z-50 flex">
          {/* Overlay */}

          <button
            type="button"
            aria-label="Fechar participantes"
            onClick={() => setShowParticipants(false)}
            className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-[2px]"
          />

          {/* Panel */}

          <aside className="relative ml-auto flex h-full w-[320px] max-w-[88vw] flex-col border-l border-white/[0.07] bg-[#0c0e12] shadow-2xl">
            {/* Panel header */}

            <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/[0.05] px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.035]">
                  <FaUsers className="text-sm text-gray-400" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-gray-200">
                    Participantes
                  </h3>

                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-600">
                      {participantCount}{' '}
                      {participantCount === 1
                        ? 'participante'
                        : 'participantes'}
                    </span>

                    {onlineParticipantCount > 0 && (
                      <>
                        <span className="text-gray-800">•</span>

                        <span className="text-[10px] text-emerald-400/70">
                          {onlineParticipantCount} online
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowParticipants(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition hover:bg-white/[0.05] hover:text-gray-300"
                title="Fechar"
              >
                <FaTimes size={13} />
              </button>
            </div>

            {/* Participants */}

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
              {participants.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <FaUsers className="mb-3 text-xl text-gray-700" />

                  <p className="text-xs text-gray-500">
                    Nenhum participante encontrado.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {participants.map((participant) => {
                    const participantOnline = isUserOnline(participant?._id);

                    const isCurrentUser = isSameUser(participant, user);

                    const participantName = participant?.name || 'Usuário';

                    return (
                      <div
                        key={participant?._id}
                        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white/[0.035]"
                      >
                        {/* Avatar */}

                        <div className="relative shrink-0">
                          {participant?.avatar ? (
                            <img
                              src={participant.avatar}
                              alt={participantName}
                              className="h-10 w-10 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04] text-[11px] font-semibold text-gray-400">
                              {getInitials(participantName)}
                            </div>
                          )}

                          <span
                            className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0c0e12] ${
                              participantOnline
                                ? 'bg-emerald-400'
                                : 'bg-gray-700'
                            }`}
                          />
                        </div>

                        {/* Info */}

                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <span className="truncate text-xs font-medium text-gray-300">
                              {participantName}
                            </span>

                            {isCurrentUser && (
                              <span className="shrink-0 rounded-md border border-indigo-400/10 bg-indigo-400/[0.07] px-1.5 py-0.5 text-[8px] font-semibold text-indigo-300/70">
                                Você
                              </span>
                            )}
                          </div>

                          <div className="mt-0.5 flex items-center gap-1.5">
                            <span
                              className={`text-[9px] ${
                                participantOnline
                                  ? 'text-emerald-400/70'
                                  : 'text-gray-600'
                              }`}
                            >
                              {participantOnline ? 'Online' : 'Offline'}
                            </span>

                            {participant?.role && (
                              <>
                                <span className="text-gray-800">•</span>

                                <span className="truncate text-[9px] text-gray-600">
                                  {getRoleLabel(participant.role)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Online indicator */}

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

      {/* ==================================================
          MESSAGES
      ================================================== */}

      <div className="relative min-h-0 flex-1 overflow-y-auto px-4 py-5">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-700 border-t-indigo-400" />

              <span className="text-[10px] text-gray-600">
                Carregando mensagens...
              </span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.025]">
              {isChannel ? (
                <FaUsers className="text-lg text-gray-600" />
              ) : (
                <FaUser className="text-lg text-gray-600" />
              )}
            </div>

            <h3 className="text-sm font-semibold text-gray-400">
              Nenhuma mensagem ainda
            </h3>

            <p className="mt-1 max-w-xs text-[11px] leading-5 text-gray-600">
              Envie uma mensagem para iniciar a conversa.
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-4xl space-y-4">
            {messages.map((message, index) => {
              const isOwnMessage = isSameUser(message.sender, user);

              const previousMessage = messages[index - 1];

              const showDate =
                !previousMessage ||
                formatDate(previousMessage.createdAt) !==
                  formatDate(message.createdAt);

              const sender = message.sender || {};

              return (
                <div key={message._id || index}>
                  {showDate && (
                    <div className="my-5 flex items-center justify-center">
                      <span className="rounded-full border border-white/[0.05] bg-white/[0.025] px-3 py-1 text-[9px] font-medium text-gray-600">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                  )}

                  <div
                    className={`flex gap-2.5 ${
                      isOwnMessage ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {!isOwnMessage && (
                      <div className="mt-5 shrink-0">
                        {sender.avatar ? (
                          <img
                            src={sender.avatar}
                            alt={sender.name || 'Usuário'}
                            className="h-8 w-8 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.05] bg-white/[0.035] text-[9px] font-semibold text-gray-500">
                            {getInitials(sender.name)}
                          </div>
                        )}
                      </div>
                    )}

                    <div
                      className={`max-w-[78%] sm:max-w-[68%] ${
                        isOwnMessage ? 'items-end' : 'items-start'
                      }`}
                    >
                      {!isOwnMessage && (
                        <div className="mb-1 ml-1 flex items-center gap-1.5">
                          <span className="text-[10px] font-medium text-gray-500">
                            {sender.name || 'Usuário'}
                          </span>

                          {sender.role && (
                            <span className="text-[8px] text-gray-700">
                              {getRoleLabel(sender.role)}
                            </span>
                          )}
                        </div>
                      )}

                      <div
                        className={`rounded-2xl px-3.5 py-2.5 ${
                          isOwnMessage
                            ? 'rounded-br-md bg-indigo-500/[0.13] text-gray-200'
                            : 'rounded-bl-md border border-white/[0.05] bg-white/[0.035] text-gray-300'
                        }`}
                      >
                        {message.replyTo && (
                          <div className="mb-2 rounded-lg border-l-2 border-indigo-400/40 bg-black/10 px-2.5 py-1.5">
                            <p className="mb-0.5 text-[8px] font-medium uppercase tracking-wider text-indigo-300/60">
                              Resposta
                            </p>

                            <p className="line-clamp-2 text-[10px] text-gray-600">
                              {message.replyTo.content}
                            </p>
                          </div>
                        )}

                        <p className="whitespace-pre-wrap break-words text-xs leading-5">
                          {message.content}
                        </p>

                        <div
                          className={`mt-1.5 flex items-center gap-1.5 ${
                            isOwnMessage ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <span className="text-[8px] text-gray-600">
                            {formatTime(message.createdAt)}
                          </span>

                          {isOwnMessage && (
                            <>
                              {message.status === 'read' ? (
                                <FaCheck size={8} className="text-indigo-400" />
                              ) : message.status === 'sent' ? (
                                <FaCheck size={8} className="text-gray-600" />
                              ) : (
                                <FaRegClock
                                  size={8}
                                  className="text-gray-700"
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
            })}

            {/* Typing */}

            {isTypingUser && (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.05] bg-white/[0.035]">
                  <FaUser size={10} className="text-gray-600" />
                </div>

                <div className="rounded-2xl rounded-bl-md border border-white/[0.05] bg-white/[0.035] px-3.5 py-2.5">
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-600 [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-600 [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-600" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* ==================================================
          FOOTER / INPUT
      ================================================== */}

      <div className="relative z-20 shrink-0 border-t border-white/[0.05] bg-[#0b0d11] px-3 py-3 sm:px-4">
        {/* Emoji picker */}

        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className="absolute bottom-[76px] left-3 z-30 w-[280px] overflow-hidden rounded-2xl border border-white/[0.07] bg-[#111318] shadow-2xl"
          >
            <div className="border-b border-white/[0.05] px-4 py-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                Emojis
              </span>
            </div>

            <div className="max-h-[230px] overflow-y-auto p-3">
              {Object.entries(emojiCategories).map(([category, emojis]) => (
                <div key={category} className="mb-3 last:mb-0">
                  <p className="mb-2 text-[8px] uppercase tracking-wider text-gray-700">
                    {category}
                  </p>

                  <div className="grid grid-cols-8 gap-1">
                    {emojis.map((emoji, index) => (
                      <button
                        key={`${emoji}-${index}`}
                        type="button"
                        onClick={() => insertEmoji(emoji)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-base transition hover:bg-white/[0.05]"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mx-auto flex max-w-4xl items-end gap-2">
          {/* Emoji */}

          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className={`mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
              showEmojiPicker
                ? 'bg-white/[0.07] text-gray-300'
                : 'text-gray-600 hover:bg-white/[0.04] hover:text-gray-400'
            }`}
            title="Emoji"
          >
            <FaSmile size={15} />
          </button>

          {/* Input */}

          <div className="relative flex min-h-[42px] flex-1 items-end rounded-2xl border border-white/[0.06] bg-white/[0.025] transition focus-within:border-indigo-400/20 focus-within:bg-white/[0.035]">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(event) => handleTyping(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite uma mensagem..."
              rows={1}
              disabled={sending}
              className="max-h-32 min-h-[42px] flex-1 resize-none bg-transparent px-3.5 py-3 pr-12 text-xs leading-5 text-gray-300 outline-none placeholder:text-gray-700 disabled:cursor-not-allowed"
            />

            <button
              type="button"
              className="absolute bottom-1.5 right-1.5 flex h-8 w-8 items-center justify-center rounded-xl text-gray-600 transition hover:bg-white/[0.05] hover:text-gray-400"
              title="Anexar arquivo"
            >
              <FaPaperclip size={13} />
            </button>
          </div>

          {/* Send */}

          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || sending}
            className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-white/[0.04] disabled:text-gray-700"
            title="Enviar mensagem"
          >
            {sending ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <FaPaperPlane size={13} />
            )}
          </button>
        </div>

        <div className="mx-auto mt-1.5 hidden max-w-4xl items-center justify-end sm:flex">
          <span className="text-[8px] text-gray-700">
            Enter para enviar · Shift + Enter para nova linha
          </span>
        </div>
      </div>
    </div>
  );
}

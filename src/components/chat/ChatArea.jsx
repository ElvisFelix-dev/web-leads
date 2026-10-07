import { useEffect, useRef, useState, useContext } from 'react';

import {
  FaPaperPlane,
  FaUser,
  FaUsers,
  FaWhatsapp,
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
    getConversationSubtitle,
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
      const parsedDate = new Date(date);

      if (Number.isNaN(parsedDate.getTime())) {
        return '';
      }

      return parsedDate.toLocaleTimeString('pt-BR', {
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

      if (Number.isNaN(messageDate.getTime())) {
        return '';
      }

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

  const isWhatsApp = currentConversation?.channel === 'whatsapp';

  const isChannel = currentConversation?.type === 'broker_channel';

  const otherUser = currentConversation
    ? getOtherParticipant?.(currentConversation)
    : null;

  /*
  ====================================================
  DADOS DO CONTATO WHATSAPP
  ====================================================
  */

  const whatsappContact = currentConversation?.whatsappContact || null;

  const whatsappPhone =
    whatsappContact?.phone || currentConversation?.lead?.phone || '';

  const whatsappContactAvatar = whatsappContact?.avatar || null;

  /*
  ====================================================
  ONLINE
  ====================================================
  */

  const online =
    !isWhatsApp && !isChannel && otherUser
      ? Boolean(isUserOnline?.(otherUser._id))
      : false;

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

  const onlineParticipants = participants.filter(
    (participant) => participant?._id && isUserOnline?.(participant._id),
  );

  const onlineParticipantCount = onlineParticipants.length;

  /*
  ====================================================
  TYPING
  ====================================================
  */

  const isTypingUser = !isWhatsApp && otherUser && typingUsers?.[otherUser._id];

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
  RESET AO TROCAR DE CONVERSA
  ====================================================
  */

  useEffect(() => {
    setInputMessage('');
    setShowEmojiPicker(false);
    setShowParticipants(false);
    setIsTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [currentConversation?._id]);

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

      /*
       * O endpoint do ChatContext é o mesmo.
       *
       * O backend identifica:
       *
       * channel === "whatsapp"
       *
       * e encaminha para o WA-AKG.
       */
      await sendMessage(currentConversation._id, content);

      setInputMessage('');
      setShowEmojiPicker(false);
      setIsTyping(false);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      /*
       * Typing só existe para chat interno.
       */
      if (!isWhatsApp) {
        sendTyping?.(currentConversation._id, false);
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

    /*
     * WhatsApp não depende do typing do Socket.IO
     * do CRM neste momento.
     */
    if (isWhatsApp) {
      return;
    }

    if (!currentConversation) {
      return;
    }

    if (!isTyping) {
      setIsTyping(true);

      sendTyping?.(currentConversation._id, true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);

      sendTyping?.(currentConversation._id, false);
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
    getConversationName?.(currentConversation) || 'Conversa';

  const conversationAvatar =
    getConversationAvatar?.(currentConversation) || null;

  const conversationSubtitle =
    getConversationSubtitle?.(currentConversation) || '';

  const headerAvatar = isWhatsApp
    ? whatsappContactAvatar || conversationAvatar
    : conversationAvatar;

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

      <header className="relative z-20 flex h-[68px] shrink-0 items-center border-b border-white/[0.05] bg-[#0b0d11]/95 px-3 backdrop-blur-xl sm:px-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="
              mr-2
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
              hover:text-gray-200
            "
            title="Voltar"
          >
            <FaChevronLeft size={13} />
          </button>
        )}

        {/* Avatar */}

        <div className="relative mr-3 shrink-0">
          {headerAvatar ? (
            <img
              src={headerAvatar}
              alt={conversationName}
              className="
                h-10
                w-10
                rounded-xl
                border
                border-white/[0.06]
                object-cover
              "
            />
          ) : (
            <div
              className={`
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                ${
                  isWhatsApp
                    ? 'border-emerald-500/20 bg-emerald-500/[0.06]'
                    : 'border-white/[0.06] bg-white/[0.04]'
                }
              `}
            >
              {isWhatsApp ? (
                <FaWhatsapp className="text-base text-emerald-400" />
              ) : isChannel ? (
                <FaUsers className="text-sm text-gray-400" />
              ) : (
                <FaUser className="text-sm text-gray-400" />
              )}
            </div>
          )}

          {/* Online somente interno */}

          {!isWhatsApp && !isChannel && (
            <span
              className={`
                absolute
                -bottom-0.5
                -right-0.5
                h-3
                w-3
                rounded-full
                border-2
                border-[#0b0d11]
                ${online ? 'bg-emerald-400' : 'bg-gray-600'}
              `}
            />
          )}
        </div>

        {/* Nome / informações */}

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate text-sm font-semibold text-gray-200">
              {conversationName}
            </h2>

            {isWhatsApp && (
              <span
                className="
                  inline-flex
                  shrink-0
                  items-center
                  gap-1
                  rounded-md
                  border
                  border-emerald-500/10
                  bg-emerald-500/[0.06]
                  px-1.5
                  py-0.5
                  text-[8px]
                  font-semibold
                  uppercase
                  tracking-[0.1em]
                  text-emerald-400/80
                "
              >
                <FaWhatsapp size={8} />
                WhatsApp
              </span>
            )}

            {isChannel && !isWhatsApp && (
              <span
                className="
                  shrink-0
                  rounded-md
                  border
                  border-indigo-400/10
                  bg-indigo-400/[0.06]
                  px-1.5
                  py-0.5
                  text-[8px]
                  font-semibold
                  uppercase
                  tracking-[0.12em]
                  text-indigo-300/70
                "
              >
                Canal
              </span>
            )}
          </div>

          <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
            {isWhatsApp ? (
              <>
                <FaWhatsapp size={8} className="shrink-0 text-emerald-400/60" />

                <span className="truncate text-[10px] text-gray-600">
                  {whatsappPhone || conversationSubtitle || 'Contato WhatsApp'}
                </span>
              </>
            ) : isChannel ? (
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
                  className={`
                    text-[10px]
                    ${online ? 'text-emerald-400/70' : 'text-gray-600'}
                  `}
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

        <div className="ml-2 flex shrink-0 items-center gap-1">
          {isChannel && (
            <button
              type="button"
              onClick={() => setShowParticipants(true)}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                text-gray-500
                transition
                hover:bg-white/[0.05]
                hover:text-gray-200
              "
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
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              text-gray-500
              transition
              hover:bg-white/[0.05]
              hover:text-gray-200
            "
            title={
              isChannel ? 'Informações do canal' : 'Informações da conversa'
            }
          >
            <FaInfoCircle size={14} />
          </button>

          <button
            type="button"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              text-gray-500
              transition
              hover:bg-white/[0.05]
              hover:text-gray-200
            "
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
          <button
            type="button"
            aria-label="Fechar participantes"
            onClick={() => setShowParticipants(false)}
            className="
              absolute
              inset-0
              cursor-default
              bg-black/50
              backdrop-blur-[2px]
            "
          />

          <aside
            className="
              relative
              ml-auto
              flex
              h-full
              w-[320px]
              max-w-[88vw]
              flex-col
              border-l
              border-white/[0.07]
              bg-[#0c0e12]
              shadow-2xl
            "
          >
            {/* Header */}

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
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  text-gray-600
                  transition
                  hover:bg-white/[0.05]
                  hover:text-gray-300
                "
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
                    const participantOnline = isUserOnline?.(participant?._id);

                    const isCurrentUser = isSameUser(participant, user);

                    const participantName = participant?.name || 'Usuário';

                    return (
                      <div
                        key={participant?._id}
                        className="
                            group
                            flex
                            items-center
                            gap-3
                            rounded-xl
                            px-3
                            py-2.5
                            transition
                            hover:bg-white/[0.035]
                          "
                      >
                        {/* Avatar */}

                        <div className="relative shrink-0">
                          {participant?.avatar ? (
                            <img
                              src={participant.avatar}
                              alt={participantName}
                              className="
                                  h-10
                                  w-10
                                  rounded-xl
                                  object-cover
                                "
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04] text-[11px] font-semibold text-gray-400">
                              {getInitials(participantName)}
                            </div>
                          )}

                          <span
                            className={`
                                absolute
                                -bottom-0.5
                                -right-0.5
                                h-2.5
                                w-2.5
                                rounded-full
                                border-2
                                border-[#0c0e12]
                                ${
                                  participantOnline
                                    ? 'bg-emerald-400'
                                    : 'bg-gray-700'
                                }
                              `}
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

                                <span className="truncate text-[9px] text-gray-600">
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

      {/* ==================================================
          MESSAGES
      ================================================== */}

      <div
        className="
          relative
          min-h-0
          flex-1
          overflow-y-auto
          px-3
          py-4
          sm:px-4
          sm:py-5
        "
      >
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div
                className={`
                  h-6
                  w-6
                  animate-spin
                  rounded-full
                  border-2
                  ${
                    isWhatsApp
                      ? 'border-emerald-500/20 border-t-emerald-400'
                      : 'border-gray-700 border-t-indigo-400'
                  }
                `}
              />

              <span className="text-[10px] text-gray-600">
                Carregando mensagens...
              </span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div
              className={`
                mb-4
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                border
                ${
                  isWhatsApp
                    ? 'border-emerald-500/10 bg-emerald-500/[0.04]'
                    : 'border-white/[0.06] bg-white/[0.025]'
                }
              `}
            >
              {isWhatsApp ? (
                <FaWhatsapp className="text-lg text-emerald-400/70" />
              ) : isChannel ? (
                <FaUsers className="text-lg text-gray-600" />
              ) : (
                <FaUser className="text-lg text-gray-600" />
              )}
            </div>

            <h3 className="text-sm font-semibold text-gray-400">
              {isWhatsApp ? 'Nenhuma mensagem ainda' : 'Nenhuma mensagem ainda'}
            </h3>

            <p className="mt-1 max-w-xs text-[11px] leading-5 text-gray-600">
              {isWhatsApp
                ? 'Envie uma mensagem pelo CRM para iniciar a conversa no WhatsApp.'
                : 'Envie uma mensagem para iniciar a conversa.'}
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-4xl space-y-3">
            {messages.map((message, index) => {
              /*
               * WhatsApp inbound:
               *
               * sender = null
               * senderType = whatsapp_contact
               * whatsappContact = contato
               *
               * WhatsApp outbound:
               *
               * sender = usuário atual
               * senderType = user
               */
              const messageIsWhatsAppContact =
                message?.senderType === 'whatsapp_contact';

              const isOwnMessage = isWhatsApp
                ? !messageIsWhatsAppContact && message?.senderType === 'user'
                : isSameUser(message?.sender, user);

              const previousMessage = messages[index - 1];

              const showDate =
                !previousMessage ||
                formatDate(previousMessage.createdAt) !==
                  formatDate(message.createdAt);

              const sender = message?.sender || {};

              const messageContact =
                message?.whatsappContact || whatsappContact || {};

              const senderName = messageIsWhatsAppContact
                ? messageContact?.name || conversationName || 'Contato WhatsApp'
                : sender?.name || 'Usuário';

              const senderAvatar = messageIsWhatsAppContact
                ? messageContact?.avatar || headerAvatar
                : sender?.avatar;

              return (
                <div key={message?._id || message?.externalMessageId || index}>
                  {/* Data */}

                  {showDate && (
                    <div className="my-5 flex items-center justify-center">
                      <span
                        className={`
                          rounded-full
                          border
                          px-3
                          py-1
                          text-[9px]
                          font-medium
                          ${
                            isWhatsApp
                              ? 'border-emerald-500/10 bg-emerald-500/[0.035] text-gray-600'
                              : 'border-white/[0.05] bg-white/[0.025] text-gray-600'
                          }
                        `}
                      >
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                  )}

                  <div
                    className={`
                      flex
                      gap-2
                      ${isOwnMessage ? 'justify-end' : 'justify-start'}
                    `}
                  >
                    {/* Avatar mensagem recebida */}

                    {!isOwnMessage && (
                      <div className="mt-5 shrink-0">
                        {senderAvatar ? (
                          <img
                            src={senderAvatar}
                            alt={senderName}
                            className="
                              h-8
                              w-8
                              rounded-lg
                              border
                              border-white/[0.05]
                              object-cover
                            "
                          />
                        ) : (
                          <div
                            className={`
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-lg
                              border
                              text-[9px]
                              font-semibold
                              ${
                                messageIsWhatsAppContact
                                  ? 'border-emerald-500/10 bg-emerald-500/[0.04] text-emerald-400/70'
                                  : 'border-white/[0.05] bg-white/[0.035] text-gray-500'
                              }
                            `}
                          >
                            {messageIsWhatsAppContact ? (
                              <FaWhatsapp size={12} />
                            ) : (
                              getInitials(senderName)
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Mensagem */}

                    <div
                      className={`
                        flex
                        max-w-[88%]
                        flex-col
                        sm:max-w-[72%]
                        ${isOwnMessage ? 'items-end' : 'items-start'}
                      `}
                    >
                      {/* Nome do remetente */}

                      {!isOwnMessage && (
                        <div className="mb-1 ml-1 flex max-w-full items-center gap-1.5">
                          <span
                            className={`
                              max-w-[220px]
                              truncate
                              text-[10px]
                              font-medium
                              ${
                                messageIsWhatsAppContact
                                  ? 'text-emerald-400/70'
                                  : 'text-gray-500'
                              }
                            `}
                          >
                            {senderName}
                          </span>

                          {messageIsWhatsAppContact && (
                            <FaWhatsapp
                              size={8}
                              className="shrink-0 text-emerald-400/50"
                            />
                          )}

                          {!messageIsWhatsAppContact && sender?.role && (
                            <span className="text-[8px] text-gray-700">
                              {getRoleLabel(sender.role)}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Bubble */}

                      <div
                        className={`
                          relative
                          rounded-2xl
                          px-3.5
                          py-2.5
                          ${
                            isOwnMessage
                              ? isWhatsApp
                                ? 'rounded-br-md bg-emerald-500/[0.13] text-gray-200'
                                : 'rounded-br-md bg-indigo-500/[0.13] text-gray-200'
                              : isWhatsApp
                                ? 'rounded-bl-md border border-emerald-500/[0.07] bg-white/[0.035] text-gray-300'
                                : 'rounded-bl-md border border-white/[0.05] bg-white/[0.035] text-gray-300'
                          }
                        `}
                      >
                        {/* Reply */}

                        {message.replyTo && (
                          <div
                            className={`
                              mb-2
                              rounded-lg
                              border-l-2
                              px-2.5
                              py-1.5
                              ${
                                isWhatsApp
                                  ? 'border-emerald-400/40 bg-black/10'
                                  : 'border-indigo-400/40 bg-black/10'
                              }
                            `}
                          >
                            <p
                              className={`
                                mb-0.5
                                text-[8px]
                                font-medium
                                uppercase
                                tracking-wider
                                ${
                                  isWhatsApp
                                    ? 'text-emerald-300/60'
                                    : 'text-indigo-300/60'
                                }
                              `}
                            >
                              Resposta
                            </p>

                            <p className="line-clamp-2 text-[10px] text-gray-600">
                              {message.replyTo.content}
                            </p>
                          </div>
                        )}

                        {/* Conteúdo */}

                        <p className="whitespace-pre-wrap break-words text-xs leading-5">
                          {message.content}
                        </p>

                        {/* Meta */}

                        <div
                          className={`
                            mt-1.5
                            flex
                            items-center
                            gap-1.5
                            ${isOwnMessage ? 'justify-end' : 'justify-start'}
                          `}
                        >
                          <span className="text-[8px] text-gray-600">
                            {formatTime(message.createdAt)}
                          </span>

                          {isOwnMessage && (
                            <>
                              {message.status === 'read' ? (
                                <FaCheck
                                  size={8}
                                  className={
                                    isWhatsApp
                                      ? 'text-emerald-400'
                                      : 'text-indigo-400'
                                  }
                                />
                              ) : message.status === 'delivered' ? (
                                <span className="flex items-center">
                                  <FaCheck
                                    size={8}
                                    className={
                                      isWhatsApp
                                        ? 'text-emerald-400/70'
                                        : 'text-indigo-400/70'
                                    }
                                  />

                                  <FaCheck size={8} className="-ml-1.5" />
                                </span>
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

            {/* Typing — somente interno */}

            {isTypingUser && !isWhatsApp && (
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
            className="
              absolute
              bottom-[76px]
              left-3
              z-30
              w-[280px]
              overflow-hidden
              rounded-2xl
              border
              border-white/[0.07]
              bg-[#111318]
              shadow-2xl
            "
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
                        className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-lg
                            text-base
                            transition
                            hover:bg-white/[0.05]
                          "
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
            className={`
              mb-1
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              transition
              ${
                showEmojiPicker
                  ? isWhatsApp
                    ? 'bg-emerald-500/[0.08] text-emerald-400'
                    : 'bg-white/[0.07] text-gray-300'
                  : 'text-gray-600 hover:bg-white/[0.04] hover:text-gray-400'
              }
            `}
            title="Emoji"
          >
            <FaSmile size={15} />
          </button>

          {/* Input */}

          <div
            className={`
              relative
              flex
              min-h-[42px]
              flex-1
              items-end
              rounded-2xl
              border
              bg-white/[0.025]
              transition
              focus-within:bg-white/[0.035]
              ${
                isWhatsApp
                  ? 'border-emerald-500/[0.08] focus-within:border-emerald-400/20'
                  : 'border-white/[0.06] focus-within:border-indigo-400/20'
              }
            `}
          >
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(event) => handleTyping(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isWhatsApp
                  ? 'Digite uma mensagem para o WhatsApp...'
                  : 'Digite uma mensagem...'
              }
              rows={1}
              disabled={sending}
              className="
                max-h-32
                min-h-[42px]
                flex-1
                resize-none
                bg-transparent
                px-3.5
                py-3
                pr-12
                text-xs
                leading-5
                text-gray-300
                outline-none
                placeholder:text-gray-700
                disabled:cursor-not-allowed
              "
            />

            <button
              type="button"
              className="
                absolute
                bottom-1.5
                right-1.5
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-xl
                text-gray-600
                transition
                hover:bg-white/[0.05]
                hover:text-gray-400
              "
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
            className={`
              mb-0.5
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              text-white
              transition
              disabled:cursor-not-allowed
              disabled:bg-white/[0.04]
              disabled:text-gray-700
              ${
                isWhatsApp
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-indigo-500 hover:bg-indigo-400'
              }
            `}
            title="Enviar mensagem"
          >
            {sending ? (
              <div
                className={`
                  h-3.5
                  w-3.5
                  animate-spin
                  rounded-full
                  border-2
                  border-white/30
                  ${isWhatsApp ? 'border-t-emerald-100' : 'border-t-white'}
                `}
              />
            ) : (
              <FaPaperPlane size={13} />
            )}
          </button>
        </div>

        <div className="mx-auto mt-1.5 hidden max-w-4xl items-center justify-between sm:flex">
          <span className="text-[8px] text-gray-700">
            {isWhatsApp
              ? 'Mensagem enviada pelo WhatsApp'
              : 'Enter para enviar · Shift + Enter para nova linha'}
          </span>

          {isWhatsApp && (
            <div className="flex items-center gap-1.5">
              <FaWhatsapp size={8} className="text-emerald-400/50" />

              <span className="text-[8px] text-gray-700">WA-AKG</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

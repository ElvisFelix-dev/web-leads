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

import { GifPicker } from 'gif-picker-react';
import { Klipy } from 'gif-picker-react/providers/klipy';

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
  const [showGifPicker, setShowGifPicker] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const gifPickerRef = useRef(null);

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

      if (Number.isNaN(parsedDate.getTime())) return '';

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

      if (Number.isNaN(messageDate.getTime())) return '';

      const today = new Date();

      const isToday =
        messageDate.getDate() === today.getDate() &&
        messageDate.getMonth() === today.getMonth() &&
        messageDate.getFullYear() === today.getFullYear();

      if (isToday) return 'Hoje';

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const isYesterday =
        messageDate.getDate() === yesterday.getDate() &&
        messageDate.getMonth() === yesterday.getMonth() &&
        messageDate.getFullYear() === yesterday.getFullYear();

      if (isYesterday) return 'Ontem';

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

  const isHttpUrl = (value) => {
    if (typeof value !== 'string' || !value.trim()) return false;

    try {
      const url = new URL(value.trim());

      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
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
  CONTATO WHATSAPP
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
  DIGITAÇÃO
  ====================================================
  */

  const isTypingUser = !isWhatsApp && otherUser && typingUsers?.[otherUser._id];

  /*
  ====================================================
  FECHAR PICKERS AO CLICAR FORA
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

      if (
        gifPickerRef.current &&
        !gifPickerRef.current.contains(event.target)
      ) {
        setShowGifPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /*
  ====================================================
  INSERIR EMOJI
  ====================================================
  */

  const insertEmoji = (emoji) => {
    setInputMessage((prev) => `${prev}${emoji}`);

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  };

  /*
  ====================================================
  SCROLL AUTOMÁTICO
  ====================================================
  */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [messages]);

  /*
  ====================================================
  FOCUS
  ====================================================
  */

  useEffect(() => {
    if (!loading && currentConversation) {
      const timeout = setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);

      return () => clearTimeout(timeout);
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
    setShowGifPicker(false);

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
  ENVIAR MENSAGEM DE TEXTO
  ====================================================
  */

  const handleSendMessage = async () => {
    const content = inputMessage.trim();

    if (!content || sending || !currentConversation?._id) return;

    try {
      setSending(true);

      await sendMessage(currentConversation._id, content);

      setInputMessage('');
      setShowEmojiPicker(false);
      setShowGifPicker(false);
      setIsTyping(false);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

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
  ENVIAR GIF COMO IMAGEM
  ====================================================
  */

  const handleGifSelected = async (gif) => {
    const gifUrl = gif?.imageUrl;

    if (!gifUrl || sending || !currentConversation?._id) {
      console.error('GIF inválido ou conversa não selecionada:', gif);
      return;
    }

    // Fecha o seletor imediatamente após selecionar o GIF.
    // Não precisa esperar o envio terminar.
    setShowGifPicker(false);
    setShowEmojiPicker(false);

    try {
      setSending(true);

      await sendMessage(currentConversation._id, {
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
        sendTyping?.(currentConversation._id, false);
      }

      textareaRef.current?.focus();
    } catch (error) {
      console.error('Erro ao enviar GIF:', error);
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

    if (isWhatsApp) return;
    if (!currentConversation?._id) return;

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
  ENTER PARA ENVIAR
  ====================================================
  */

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }

    if (event.key === 'Escape') {
      setShowEmojiPicker(false);
      setShowGifPicker(false);
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
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.06] to-white/[0.015] shadow-xl shadow-black/20">
            <FaUsers className="text-xl text-gray-500" />
          </div>

          <h3 className="text-sm font-semibold tracking-tight text-gray-200">
            Selecione uma conversa
          </h3>

          <p className="mt-2 text-xs leading-5 text-gray-500">
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
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#08090c] text-gray-200">
      {/* HEADER */}

      <header className="relative z-20 flex h-[68px] shrink-0 items-center border-b border-white/[0.06] bg-[#0b0d11]/95 px-3 backdrop-blur-xl sm:px-5">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-transparent text-gray-500 transition-all duration-200 hover:border-white/[0.06] hover:bg-white/[0.05] hover:text-gray-200 active:scale-95"
            title="Voltar"
          >
            <FaChevronLeft size={13} />
          </button>
        )}

        <div className="relative mr-3 shrink-0">
          {headerAvatar ? (
            <img
              src={headerAvatar}
              alt={conversationName}
              className="h-10 w-10 rounded-xl border border-white/[0.08] object-cover shadow-lg shadow-black/20"
            />
          ) : (
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
                isWhatsApp
                  ? 'border-emerald-500/20 bg-emerald-500/[0.08]'
                  : 'border-white/[0.07] bg-gradient-to-br from-white/[0.06] to-white/[0.02]'
              }`}
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

          {!isWhatsApp && !isChannel && (
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0b0d11] ${
                online ? 'bg-emerald-400' : 'bg-gray-600'
              }`}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate text-sm font-semibold tracking-tight text-gray-100">
              {conversationName}
            </h2>

            {isWhatsApp && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-emerald-500/15 bg-emerald-500/[0.07] px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.1em] text-emerald-400">
                <FaWhatsapp size={8} />
                WhatsApp
              </span>
            )}

            {isChannel && !isWhatsApp && (
              <span className="shrink-0 rounded-md border border-indigo-400/15 bg-indigo-400/[0.07] px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-indigo-300">
                Canal
              </span>
            )}
          </div>

          <div className="mt-1 flex min-w-0 items-center gap-1.5">
            {isWhatsApp ? (
              <>
                <FaWhatsapp size={8} className="shrink-0 text-emerald-400/70" />
                <span className="truncate text-[10px] text-gray-500">
                  {whatsappPhone || conversationSubtitle || 'Contato WhatsApp'}
                </span>
              </>
            ) : isChannel ? (
              <>
                <FaUsers size={8} className="text-gray-500" />
                <span className="text-[10px] text-gray-500">
                  {participantCount}{' '}
                  {participantCount === 1 ? 'participante' : 'participantes'}
                </span>

                {onlineParticipantCount > 0 && (
                  <>
                    <span className="text-gray-700">·</span>
                    <span className="text-[10px] text-emerald-400/80">
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
                    online ? 'text-emerald-400/80' : 'text-gray-500'
                  }`}
                >
                  {online ? 'Online' : 'Offline'}
                </span>

                {otherUser?.role && (
                  <>
                    <span className="text-gray-700">·</span>
                    <span className="truncate text-[10px] text-gray-500">
                      {getRoleLabel(otherUser.role)}
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div className="ml-2 flex shrink-0 items-center gap-1">
          {isChannel && (
            <button
              type="button"
              onClick={() => setShowParticipants(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-all duration-200 hover:bg-white/[0.06] hover:text-gray-200 active:scale-95"
              title="Ver participantes"
            >
              <FaUsers size={14} />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (isChannel) setShowParticipants(true);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-all duration-200 hover:bg-white/[0.06] hover:text-gray-200 active:scale-95"
            title={
              isChannel ? 'Informações do canal' : 'Informações da conversa'
            }
          >
            <FaInfoCircle size={14} />
          </button>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-all duration-200 hover:bg-white/[0.06] hover:text-gray-200 active:scale-95"
            title="Mais opções"
          >
            <FaEllipsisV size={13} />
          </button>
        </div>
      </header>

      {/* PAINEL DE PARTICIPANTES */}

      {showParticipants && isChannel && (
        <div className="absolute inset-0 z-50 flex">
          <button
            type="button"
            aria-label="Fechar participantes"
            onClick={() => setShowParticipants(false)}
            className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
          />

          <aside className="relative ml-auto flex h-full w-[320px] max-w-[88vw] flex-col border-l border-white/[0.08] bg-[#0c0e12] shadow-2xl shadow-black/40">
            <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/[0.06] px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.04]">
                  <FaUsers className="text-sm text-gray-400" />
                </div>

                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-gray-100">
                    Participantes
                  </h3>

                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-500">
                      {participantCount}{' '}
                      {participantCount === 1
                        ? 'participante'
                        : 'participantes'}
                    </span>

                    {onlineParticipantCount > 0 && (
                      <>
                        <span className="text-gray-700">·</span>
                        <span className="text-[10px] text-emerald-400/80">
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
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white/[0.06] hover:text-gray-200"
                title="Fechar"
              >
                <FaTimes size={13} />
              </button>
            </div>

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
                        className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 transition hover:border-white/[0.04] hover:bg-white/[0.035]"
                      >
                        <div className="relative shrink-0">
                          {participant?.avatar ? (
                            <img
                              src={participant.avatar}
                              alt={participantName}
                              className="h-10 w-10 rounded-xl border border-white/[0.06] object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.04] text-[11px] font-semibold text-gray-400">
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

                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <span className="truncate text-xs font-medium text-gray-200">
                              {participantName}
                            </span>

                            {isCurrentUser && (
                              <span className="shrink-0 rounded-md border border-indigo-400/15 bg-indigo-400/[0.07] px-1.5 py-0.5 text-[8px] font-semibold text-indigo-300">
                                Você
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex items-center gap-1.5">
                            <span
                              className={`text-[9px] ${
                                participantOnline
                                  ? 'text-emerald-400/80'
                                  : 'text-gray-500'
                              }`}
                            >
                              {participantOnline ? 'Online' : 'Offline'}
                            </span>

                            {participant?.role && (
                              <>
                                <span className="text-gray-700">·</span>
                                <span className="truncate text-[9px] text-gray-500">
                                  {getRoleLabel(participant.role)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {participantOnline && (
                          <FaCircle
                            size={5}
                            className="shrink-0 text-emerald-400/80"
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

      {/* MENSAGENS */}

      <div className="relative min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5 sm:py-5">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div
                className={`h-6 w-6 animate-spin rounded-full border-2 ${
                  isWhatsApp
                    ? 'border-emerald-500/20 border-t-emerald-400'
                    : 'border-gray-700 border-t-indigo-400'
                }`}
              />

              <span className="text-[10px] text-gray-500">
                Carregando mensagens...
              </span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div
              className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border shadow-lg shadow-black/10 ${
                isWhatsApp
                  ? 'border-emerald-500/15 bg-emerald-500/[0.05]'
                  : 'border-white/[0.07] bg-gradient-to-br from-white/[0.05] to-white/[0.015]'
              }`}
            >
              {isWhatsApp ? (
                <FaWhatsapp className="text-lg text-emerald-400/80" />
              ) : isChannel ? (
                <FaUsers className="text-lg text-gray-500" />
              ) : (
                <FaUser className="text-lg text-gray-500" />
              )}
            </div>

            <h3 className="text-sm font-semibold text-gray-300">
              Nenhuma mensagem ainda
            </h3>

            <p className="mt-2 max-w-xs text-[11px] leading-5 text-gray-500">
              {isWhatsApp
                ? 'Envie uma mensagem pelo CRM para iniciar a conversa no WhatsApp.'
                : 'Envie uma mensagem para iniciar a conversa.'}
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-4xl space-y-3">
            {messages.map((message, index) => {
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
                : sender?.avatar || sender?.profileImage || null;

              /*
              ====================================================
              DETECTAR IMAGENS, GIFS E ARQUIVOS
              ====================================================
              */

              const messageContent = String(message?.content || '').trim();

              const attachmentMimeType = String(
                message?.attachment?.mimeType || '',
              ).toLowerCase();

              const contentLooksLikeImage =
                /\.(gif|jpe?g|png|webp|bmp|svg)(?:[?#].*)?$/i.test(
                  messageContent,
                ) || /(?:klipy|giphy|tenor)/i.test(messageContent);

              const attachmentUrl =
                message?.attachment?.url ||
                (message?.type === 'image' && isHttpUrl(messageContent)
                  ? messageContent
                  : '') ||
                (isHttpUrl(messageContent) && contentLooksLikeImage
                  ? messageContent
                  : '');

              const isImageMessage =
                message?.type === 'image' ||
                attachmentMimeType.startsWith('image/') ||
                Boolean(attachmentUrl && contentLooksLikeImage);

              const isFileMessage = message?.type === 'file';

              const placeholderContents = [
                'Imagem',
                'Imagem recebida',
                'Arquivo',
                'Arquivo recebido',
                'GIF',
                'GIF enviado',
                message?.attachment?.name,
              ]
                .filter(Boolean)
                .map((value) => String(value).trim());

              const shouldShowText =
                Boolean(messageContent) &&
                messageContent !== attachmentUrl &&
                !placeholderContents.includes(messageContent) &&
                !(isImageMessage && isHttpUrl(messageContent));

              return (
                <div key={message?._id || message?.externalMessageId || index}>
                  {/* DATA */}

                  {showDate && (
                    <div className="my-5 flex items-center justify-center">
                      <span
                        className={`rounded-full border px-3 py-1 text-[9px] font-medium shadow-sm ${
                          isWhatsApp
                            ? 'border-emerald-500/[0.12] bg-emerald-500/[0.035] text-gray-500'
                            : 'border-white/[0.06] bg-white/[0.025] text-gray-500'
                        }`}
                      >
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                  )}

                  <div
                    className={`flex gap-2.5 ${
                      isOwnMessage ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {/* AVATAR DA MENSAGEM RECEBIDA */}

                    {!isOwnMessage && (
                      <div className="mt-5 shrink-0">
                        {senderAvatar ? (
                          <img
                            src={senderAvatar}
                            alt={senderName}
                            className="h-8 w-8 rounded-lg border border-white/[0.06] object-cover"
                          />
                        ) : (
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-lg border text-[9px] font-semibold ${
                              messageIsWhatsAppContact
                                ? 'border-emerald-500/15 bg-emerald-500/[0.05] text-emerald-400'
                                : 'border-white/[0.06] bg-white/[0.035] text-gray-400'
                            }`}
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

                    {/* CORPO DA MENSAGEM */}

                    <div
                      className={`flex max-w-[88%] flex-col sm:max-w-[72%] ${
                        isOwnMessage ? 'items-end' : 'items-start'
                      }`}
                    >
                      {/* NOME DO REMETENTE */}

                      {!isOwnMessage && (
                        <div className="mb-1.5 ml-1 flex max-w-full items-center gap-1.5">
                          <span
                            className={`max-w-[220px] truncate text-[10px] font-medium ${
                              messageIsWhatsAppContact
                                ? 'text-emerald-400/80'
                                : 'text-gray-400'
                            }`}
                          >
                            {senderName}
                          </span>

                          {messageIsWhatsAppContact && (
                            <FaWhatsapp
                              size={8}
                              className="shrink-0 text-emerald-400/60"
                            />
                          )}

                          {!messageIsWhatsAppContact && sender?.role && (
                            <span className="text-[8px] text-gray-600">
                              {getRoleLabel(sender.role)}
                            </span>
                          )}
                        </div>
                      )}

                      {/* BALÃO */}

                      <div
                        className={`relative max-w-full rounded-2xl border px-3.5 py-2.5 shadow-sm ${
                          isOwnMessage
                            ? isWhatsApp
                              ? 'rounded-br-md border-emerald-400/[0.12] bg-gradient-to-br from-emerald-500/[0.14] to-emerald-500/[0.07] text-gray-100'
                              : 'rounded-br-md border-indigo-400/[0.14] bg-gradient-to-br from-indigo-500/[0.15] to-indigo-500/[0.07] text-gray-100'
                            : isWhatsApp
                              ? 'rounded-bl-md border-emerald-500/[0.08] bg-[#101410] text-gray-300'
                              : 'rounded-bl-md border-white/[0.06] bg-[#111318] text-gray-300'
                        }`}
                      >
                        {/* RESPOSTA */}

                        {message.replyTo && (
                          <div
                            className={`mb-2 rounded-lg border-l-2 px-2.5 py-1.5 ${
                              isWhatsApp
                                ? 'border-emerald-400/50 bg-black/15'
                                : 'border-indigo-400/50 bg-black/15'
                            }`}
                          >
                            <p
                              className={`mb-1 text-[8px] font-semibold uppercase tracking-wider ${
                                isWhatsApp
                                  ? 'text-emerald-300/80'
                                  : 'text-indigo-300/80'
                              }`}
                            >
                              Resposta
                            </p>

                            <p className="line-clamp-2 text-[10px] leading-4 text-gray-400">
                              {message.replyTo.content}
                            </p>
                          </div>
                        )}

                        {/* IMAGEM OU GIF */}

                        {isImageMessage && attachmentUrl && (
                          <a
                            href={attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mb-1 block max-w-full overflow-hidden rounded-xl"
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
                              className="block h-auto max-h-[320px] max-w-full rounded-xl object-contain transition-opacity duration-200 hover:opacity-90"
                              onError={(event) => {
                                event.currentTarget.style.display = 'none';
                              }}
                            />
                          </a>
                        )}

                        {/* ARQUIVO */}

                        {isFileMessage && attachmentUrl && (
                          <a
                            href={attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mb-1 flex items-center gap-2 rounded-xl border border-white/[0.07] bg-black/15 px-3 py-2.5 text-xs text-indigo-300 transition hover:border-indigo-400/20 hover:bg-black/25"
                          >
                            <FaPaperclip size={12} />

                            <span className="max-w-[220px] break-all">
                              {message?.attachment?.name || 'Abrir arquivo'}
                            </span>
                          </a>
                        )}

                        {/* TEXTO */}

                        {shouldShowText && (
                          <p className="whitespace-pre-wrap break-words text-xs leading-5">
                            {messageContent}
                          </p>
                        )}

                        {/* HORÁRIO E STATUS */}

                        <div
                          className={`mt-1.5 flex items-center gap-1.5 ${
                            isOwnMessage ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <span className="text-[8px] tabular-nums text-gray-500">
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
                                        ? 'text-emerald-400/80'
                                        : 'text-indigo-400/80'
                                    }
                                  />
                                  <FaCheck size={8} className="-ml-1.5" />
                                </span>
                              ) : message.status === 'sent' ? (
                                <FaCheck size={8} className="text-gray-500" />
                              ) : (
                                <FaRegClock
                                  size={8}
                                  className="text-gray-500"
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

            {/* DIGITANDO — SOMENTE CHAT INTERNO */}

            {isTypingUser && !isWhatsApp && (
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.035]">
                  <FaUser size={10} className="text-gray-500" />
                </div>

                <div className="rounded-2xl rounded-bl-md border border-white/[0.06] bg-[#111318] px-3.5 py-2.5">
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-500" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* FOOTER / INPUT */}

      <div className="relative z-30 shrink-0 border-t border-white/[0.06] bg-[#0b0d11] px-3 py-3 sm:px-5">
        {/* SELETOR DE EMOJIS */}

        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className="absolute bottom-[82px] left-3 z-40 w-[280px] overflow-hidden rounded-2xl border border-white/[0.09] bg-[#111318] shadow-2xl shadow-black/50 animate-in fade-in slide-in-from-bottom-2 duration-150"
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
              <div>
                <span className="block text-xs font-semibold text-gray-200">
                  Emojis
                </span>
                <span className="mt-0.5 block text-[9px] text-gray-500">
                  Escolha uma reação
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowEmojiPicker(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 transition hover:bg-white/[0.06] hover:text-gray-200"
                title="Fechar emojis"
              >
                <FaTimes size={11} />
              </button>
            </div>

            <div className="max-h-[230px] overflow-y-auto p-3">
              {Object.entries(emojiCategories).map(([category, emojis]) => (
                <div key={category} className="mb-3 last:mb-0">
                  <p className="mb-2 text-[8px] font-semibold uppercase tracking-wider text-gray-500">
                    {category}
                  </p>

                  <div className="grid grid-cols-8 gap-1">
                    {emojis.map((emoji, index) => (
                      <button
                        key={`${emoji}-${index}`}
                        type="button"
                        onClick={() => insertEmoji(emoji)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-base transition hover:bg-white/[0.07] active:scale-90"
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

        {/* SELETOR DE GIFS — DARK PREMIUM */}

        {showGifPicker && (
          <div
            ref={gifPickerRef}
            className="absolute bottom-[82px] left-3 z-40 w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-white/[0.1] bg-[#101116] shadow-2xl shadow-black/60 animate-in fade-in slide-in-from-bottom-2 duration-150"
          >
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

            <div className="gif-picker-dark-surface bg-[#101116] p-2">
              <GifPicker
                provider={Klipy(
                  'H9jbrsVDruuiPMCdinhGLHKgvl1aUsoRnmT5o4MTtmuDLZRMZQXLeZ8s3Jcp5kA6',
                )}
                onGifClick={handleGifSelected}
                width="100%"
                height={350}
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

        <div className="mx-auto flex max-w-4xl items-end gap-2">
          {/* EMOJI */}

          <button
            type="button"
            onClick={() => {
              setShowEmojiPicker((prev) => !prev);
              setShowGifPicker(false);
            }}
            className={`mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 active:scale-95 ${
              showEmojiPicker
                ? isWhatsApp
                  ? 'border-emerald-500/20 bg-emerald-500/[0.1] text-emerald-400'
                  : 'border-indigo-400/20 bg-indigo-500/[0.1] text-indigo-300'
                : 'border-transparent text-gray-500 hover:border-white/[0.06] hover:bg-white/[0.04] hover:text-gray-300'
            }`}
            title="Inserir emoji"
            aria-label="Inserir emoji"
            aria-expanded={showEmojiPicker}
          >
            <FaSmile size={16} />
          </button>

          {/* BOTÃO GIF */}

          <button
            type="button"
            onClick={() => {
              setShowGifPicker((prev) => !prev);
              setShowEmojiPicker(false);
            }}
            className={`mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-[10px] font-extrabold tracking-wide transition-all duration-200 active:scale-95 ${
              showGifPicker
                ? 'border-indigo-400/25 bg-indigo-500/[0.12] text-indigo-300 shadow-sm shadow-indigo-950/30'
                : 'border-transparent text-gray-500 hover:border-white/[0.06] hover:bg-white/[0.04] hover:text-gray-300'
            }`}
            title="Enviar GIF"
            aria-label="Enviar GIF"
            aria-expanded={showGifPicker}
          >
            GIF
          </button>

          {/* CAMPO DE TEXTO */}

          <div
            className={`relative flex min-h-[44px] flex-1 items-end rounded-2xl border bg-[#101116] transition-all duration-200 focus-within:bg-[#12141a] ${
              isWhatsApp
                ? 'border-white/[0.07] focus-within:border-emerald-400/30 focus-within:shadow-[0_0_0_3px_rgba(16,185,129,0.04)]'
                : 'border-white/[0.07] focus-within:border-indigo-400/30 focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.05)]'
            }`}
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
              className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-3.5 py-3 pr-12 text-xs leading-5 text-gray-200 outline-none placeholder:text-gray-600 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <button
              type="button"
              className="absolute bottom-1.5 right-1.5 flex h-8 w-8 items-center justify-center rounded-xl text-gray-500 transition-all duration-200 hover:bg-white/[0.06] hover:text-gray-300 active:scale-95"
              title="Anexar arquivo"
              aria-label="Anexar arquivo"
              onClick={() => {
                console.info(
                  'O envio de arquivos ainda precisa ser conectado ao serviço de upload.',
                );
              }}
            >
              <FaPaperclip size={13} />
            </button>
          </div>

          {/* ENVIAR */}

          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || sending}
            className={`mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-lg transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:bg-white/[0.04] disabled:text-gray-600 disabled:shadow-none ${
              isWhatsApp
                ? 'bg-emerald-600 shadow-emerald-950/20 hover:bg-emerald-500'
                : 'bg-indigo-500 shadow-indigo-950/20 hover:bg-indigo-400'
            }`}
            title="Enviar mensagem"
            aria-label="Enviar mensagem"
          >
            {sending ? (
              <div
                className={`h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 ${
                  isWhatsApp ? 'border-t-emerald-100' : 'border-t-white'
                }`}
              />
            ) : (
              <FaPaperPlane size={13} />
            )}
          </button>
        </div>

        <div className="mx-auto mt-2 hidden max-w-4xl items-center justify-between sm:flex">
          <span className="text-[9px] text-gray-600">
            {isWhatsApp
              ? 'Mensagem enviada pelo WhatsApp'
              : 'Enter para enviar · Shift + Enter para nova linha'}
          </span>

          {isWhatsApp && (
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
              <FaWhatsapp size={9} className="text-emerald-400/60" />
              <span className="text-[9px] text-gray-500">WA-AKG</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

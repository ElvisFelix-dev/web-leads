import { useEffect, useMemo, useState } from 'react';

import {
  FaComments,
  FaTimes,
  FaChevronLeft,
  FaUsers,
  FaCircle,
  FaWhatsapp,
  FaComments as FaChatBubble,
} from 'react-icons/fa';

import { useChat } from '../../context/ChatContext';

import ConversationList from './ConversationList';
import ChatArea from './ChatArea';
import NewConversationModal from './NewConversationModal';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState('internal');

  const {
    conversations = [],
    unreadCount = 0,
    currentConversation,
    selectConversation,
    loadConversations,
    getConversationName,
    getConversationSubtitle,
  } = useChat();

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

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isOpen && typeof loadConversations === 'function') {
      loadConversations();
    }
  }, [isOpen, loadConversations]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;

      if (showNewChat) {
        setShowNewChat(false);
        return;
      }

      handleClose();
    };

    const previousOverflow = document.body.style.overflow;

    if (isMobile) {
      document.body.style.overflow = 'hidden';
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (isMobile) {
        document.body.style.overflow = previousOverflow;
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, showNewChat, isMobile]);

  const handleClose = () => {
    setIsOpen(false);
    setShowNewChat(false);
  };

  const handleSelectConversation = (conversation) => {
    if (conversation?.channel === 'whatsapp') {
      setActiveTab('whatsapp');
    } else if (conversation) {
      setActiveTab('internal');
    }

    selectConversation(conversation);
  };

  const handleChangeTab = (tab) => {
    if (tab === activeTab) return;

    setActiveTab(tab);
    setShowNewChat(false);
    selectConversation(null);
  };

  const handleBack = () => {
    if (!isMobile) return;
    selectConversation(null);
  };

  const isWhatsAppConversation = currentConversation?.channel === 'whatsapp';
  const isInternalChannel = currentConversation?.type === 'broker_channel';

  const conversationName = currentConversation
    ? getConversationName?.(currentConversation) || 'Conversa'
    : '';

  const conversationSubtitle = currentConversation
    ? getConversationSubtitle?.(currentConversation) || ''
    : '';

  const participantCount = currentConversation?.participants?.length || 0;

  const activeUnreadCount =
    activeTab === 'whatsapp' ? whatsappUnreadCount : internalUnreadCount;

  // ============================================================
  // ESTADO FECHADO — BOTÃO FLUTUANTE (APENAS ÍCONE)
  // ============================================================

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir mensagens"
        className="group fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center text-gray-400 transition-all duration-300 hover:text-white active:scale-95 sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
      >
        <span className="relative flex items-center justify-center">
          <FaComments
            size={26}
            className="drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
          />

          {unreadCount > 0 && (
            <span className="absolute -right-2.5 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-extrabold text-white shadow-lg shadow-rose-950/50">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </span>
      </button>
    );
  }

  // ============================================================
  // ESTADO ABERTO — JANELA DO CHAT
  // ============================================================

  return (
    <>
      <div
        className={`${
          isMobile
            ? 'fixed inset-0 z-50 flex animate-[fadeIn_180ms_ease-out] items-center justify-center bg-black/75 p-0 backdrop-blur-md'
            : 'pointer-events-none fixed bottom-24 right-6 z-50 flex items-end justify-end bg-transparent p-0'
        }`}
      >
        <div
          className={`${
            isMobile
              ? 'relative flex h-full w-full animate-[chatOpen_220ms_ease-out] flex-col overflow-hidden border-0 bg-[#0b0f17] shadow-2xl shadow-black/60'
              : 'pointer-events-auto relative flex h-[min(700px,calc(100dvh-120px))] w-[min(980px,calc(100vw-48px))] animate-[chatOpen_220ms_ease-out] flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0b0f17] shadow-2xl shadow-black/60 ring-1 ring-white/[0.02]'
          }`}
        >
          {/* HEADER */}

          <header className="relative z-20 flex h-[68px] shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#0e1219]/95 px-4 backdrop-blur-xl sm:px-5 lg:px-6">
            <div className="flex min-w-0 items-center">
              {isMobile && currentConversation && (
                <button
                  type="button"
                  onClick={handleBack}
                  aria-label="Voltar para conversas"
                  className="mr-2 flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition hover:bg-white/[0.05] hover:text-white"
                >
                  <FaChevronLeft size={14} />
                </button>
              )}

              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                  isWhatsAppConversation
                    ? 'border-emerald-500/15 bg-emerald-500/[0.06] text-emerald-400'
                    : 'border-white/[0.07] bg-white/[0.035] text-gray-300'
                }`}
              >
                {isWhatsAppConversation ? (
                  <FaWhatsapp size={18} />
                ) : currentConversation ? (
                  <FaChatBubble size={16} />
                ) : (
                  <FaUsers size={16} />
                )}
              </div>

              <div className="ml-3 min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <h2 className="truncate text-sm font-semibold tracking-tight text-gray-100 sm:text-[15px]">
                    {currentConversation
                      ? isWhatsAppConversation
                        ? conversationName
                        : 'Mensagens'
                      : activeTab === 'whatsapp'
                        ? 'WhatsApp'
                        : 'Chat interno'}
                  </h2>

                  {isWhatsAppConversation && (
                    <span className="hidden items-center gap-1.5 rounded-full border border-emerald-500/15 bg-emerald-500/[0.07] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-400 sm:inline-flex">
                      <FaWhatsapp size={8} />
                      WhatsApp
                    </span>
                  )}

                  {isInternalChannel && !isWhatsAppConversation && (
                    <span className="hidden items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-gray-400 sm:inline-flex">
                      <FaUsers size={8} />
                      Canal
                    </span>
                  )}

                  {currentConversation &&
                    !isWhatsAppConversation &&
                    !isInternalChannel && (
                      <span className="hidden items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-gray-400 sm:inline-flex">
                        <FaCircle size={5} className="text-emerald-400" />
                        Interno
                      </span>
                    )}
                </div>

                <p className="mt-0.5 max-w-[260px] truncate text-[10px] text-gray-500 sm:max-w-[400px] sm:text-[11px]">
                  {currentConversation
                    ? isWhatsAppConversation
                      ? conversationSubtitle || 'WhatsApp'
                      : `${participantCount} ${
                          participantCount === 1
                            ? 'participante'
                            : 'participantes'
                        }`
                    : activeUnreadCount > 0
                      ? `${activeUnreadCount} ${
                          activeUnreadCount === 1
                            ? 'mensagem não lida'
                            : 'mensagens não lidas'
                        }`
                      : activeTab === 'whatsapp'
                        ? 'Suas conversas com leads pelo WhatsApp'
                        : 'Conversas diretas e canais da equipe'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!currentConversation && activeUnreadCount > 0 && (
                <div className="hidden items-center gap-2 rounded-xl border border-rose-500/15 bg-rose-500/[0.06] px-3 py-1.5 sm:flex">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />
                  <span className="text-[10px] font-semibold text-rose-300">
                    {activeUnreadCount > 99 ? '99+' : activeUnreadCount}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={handleClose}
                aria-label="Fechar chat"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-all duration-200 hover:bg-white/[0.06] hover:text-gray-200"
              >
                <FaTimes size={15} />
              </button>
            </div>
          </header>

          {/* CONTEÚDO */}

          <div className="flex min-h-0 flex-1 overflow-hidden">
            <aside
              className={`${
                currentConversation && isMobile ? 'hidden' : 'flex'
              } w-full shrink-0 flex-col border-r border-white/[0.06] bg-[#0c1016] lg:w-[360px] xl:w-[390px]`}
            >
              {/* TABS NEUTRAS */}

              <div className="grid grid-cols-2 gap-1 border-b border-white/[0.06] bg-[#0c1016] p-3">
                <button
                  type="button"
                  onClick={() => handleChangeTab('internal')}
                  aria-pressed={activeTab === 'internal'}
                  className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-2 text-xs font-semibold transition sm:text-sm ${
                    activeTab === 'internal'
                      ? 'border-white/[0.09] bg-white/[0.05] text-gray-100 shadow-inner shadow-black/20'
                      : 'border-transparent text-gray-500 hover:bg-white/[0.035] hover:text-gray-300'
                  }`}
                >
                  <FaChatBubble size={13} />
                  Chat interno
                  {internalUnreadCount > 0 && (
                    <span className="rounded-full bg-white/[0.09] px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-gray-200">
                      {internalUnreadCount > 99 ? '99+' : internalUnreadCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleChangeTab('whatsapp')}
                  aria-pressed={activeTab === 'whatsapp'}
                  className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-2 text-xs font-semibold transition sm:text-sm ${
                    activeTab === 'whatsapp'
                      ? 'border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-300 shadow-inner shadow-black/20'
                      : 'border-transparent text-gray-500 hover:bg-white/[0.035] hover:text-gray-300'
                  }`}
                >
                  <FaWhatsapp size={14} />
                  WhatsApp
                  {whatsappUnreadCount > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                        activeTab === 'whatsapp'
                          ? 'bg-emerald-500/20 text-emerald-200'
                          : 'bg-white/[0.09] text-gray-200'
                      }`}
                    >
                      {whatsappUnreadCount > 99 ? '99+' : whatsappUnreadCount}
                    </span>
                  )}
                </button>
              </div>

              <ConversationList
                onSelect={handleSelectConversation}
                onNewChat={() => setShowNewChat(true)}
                channelFilter={
                  activeTab === 'whatsapp' ? 'whatsapp' : 'internal'
                }
              />
            </aside>

            <main
              className={`${
                !currentConversation && isMobile ? 'hidden' : 'flex'
              } min-h-0 min-w-0 flex-1 flex-col bg-[#0b0f17]`}
            >
              <ChatArea onBack={handleBack} />
            </main>
          </div>

          {/* LINHA INFERIOR SUTIL */}

          <div
            className={`pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${
              isWhatsAppConversation ? 'via-emerald-500/25' : 'via-white/[0.08]'
            } to-transparent`}
          />
        </div>
      </div>

      <NewConversationModal
        isOpen={showNewChat && activeTab === 'internal'}
        onClose={() => setShowNewChat(false)}
      />

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes chatOpen {
            from {
              opacity: 0;
              transform: scale(0.97) translateY(8px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
        `}
      </style>
    </>
  );
}

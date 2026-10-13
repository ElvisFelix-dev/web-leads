import { useEffect, useMemo, useState } from 'react';

import {
  FaComments,
  FaTimes,
  FaChevronLeft,
  FaUsers,
  FaCircle,
  FaWhatsapp,
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
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, showNewChat]);

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

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir mensagens"
        className="group fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/30 bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-2xl shadow-blue-900/40 transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-blue-900/60 active:scale-95 sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
      >
        <span className="absolute inset-0 rounded-2xl bg-blue-400/20 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
        <span className="relative flex items-center justify-center">
          <FaComments
            size={23}
            className="transition-transform duration-300 group-hover:scale-110"
          />
          {unreadCount > 0 && (
            <span className="absolute -right-3 -top-3 flex h-[21px] min-w-[21px] items-center justify-center rounded-full border-2 border-[#0d1119] bg-red-500 px-1 text-[10px] font-extrabold text-white shadow-lg shadow-red-900/40">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </span>
      </button>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex animate-[fadeIn_180ms_ease-out] items-center justify-center bg-black/75 p-0 backdrop-blur-md sm:p-4 lg:p-6">
        <div className="relative flex h-full w-full animate-[chatOpen_220ms_ease-out] flex-col overflow-hidden border-0 bg-[#0b0f17] shadow-2xl shadow-black/60 sm:h-[92vh] sm:max-h-[900px] sm:rounded-2xl sm:border sm:border-white/[0.06] lg:max-w-[1280px]">
          <header className="relative z-20 flex h-[68px] shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#10151f]/95 px-4 backdrop-blur-xl sm:px-5 lg:px-6">
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
                    ? 'border-emerald-500/10 bg-emerald-500/10'
                    : 'border-blue-500/10 bg-blue-500/10'
                }`}
              >
                {isWhatsAppConversation ? (
                  <FaWhatsapp size={18} className="text-emerald-400" />
                ) : currentConversation ? (
                  <FaComments size={17} className="text-blue-400" />
                ) : (
                  <FaUsers size={17} className="text-blue-400" />
                )}
              </div>

              <div className="ml-3 min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <h2 className="truncate text-sm font-bold text-white sm:text-[15px]">
                    {currentConversation
                      ? isWhatsAppConversation
                        ? conversationName
                        : 'Mensagens'
                      : activeTab === 'whatsapp'
                        ? 'WhatsApp'
                        : 'Chat interno'}
                  </h2>

                  {isWhatsAppConversation && (
                    <span className="hidden items-center gap-1.5 rounded-full border border-emerald-500/10 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-semibold text-emerald-400 sm:inline-flex">
                      <FaWhatsapp size={8} />
                      WhatsApp
                    </span>
                  )}

                  {isInternalChannel && !isWhatsAppConversation && (
                    <span className="hidden items-center gap-1.5 rounded-full border border-blue-500/10 bg-blue-500/10 px-2 py-0.5 text-[9px] font-semibold text-blue-400 sm:inline-flex">
                      <FaUsers size={8} />
                      Canal
                    </span>
                  )}

                  {currentConversation &&
                    !isWhatsAppConversation &&
                    !isInternalChannel && (
                      <span className="hidden items-center gap-1.5 rounded-full border border-blue-500/10 bg-blue-500/10 px-2 py-0.5 text-[9px] font-semibold text-blue-400 sm:inline-flex">
                        <FaCircle size={5} />
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
                <div className="hidden items-center gap-2 rounded-xl border border-red-500/10 bg-red-500/10 px-3 py-1.5 sm:flex">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-400" />
                  <span className="text-[10px] font-semibold text-red-400">
                    {activeUnreadCount > 99 ? '99+' : activeUnreadCount}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={handleClose}
                aria-label="Fechar chat"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition-all duration-200 hover:bg-white/[0.06] hover:text-white"
              >
                <FaTimes size={16} />
              </button>
            </div>
          </header>

          <div className="flex min-h-0 flex-1 overflow-hidden">
            <aside
              className={`${
                currentConversation && isMobile ? 'hidden' : 'flex'
              } w-full shrink-0 flex-col border-r border-white/[0.06] bg-[#0d121b] lg:w-[360px] xl:w-[390px]`}
            >
              <div className="grid grid-cols-2 gap-1 border-b border-white/[0.06] bg-[#0d121b] p-3">
                <button
                  type="button"
                  onClick={() => handleChangeTab('internal')}
                  aria-pressed={activeTab === 'internal'}
                  className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-2 text-xs font-semibold transition sm:text-sm ${
                    activeTab === 'internal'
                      ? 'border-blue-400/20 bg-blue-500/15 text-blue-300 shadow-lg shadow-blue-950/20'
                      : 'border-transparent text-gray-500 hover:bg-white/[0.04] hover:text-gray-200'
                  }`}
                >
                  <FaComments size={14} />
                  Chat interno
                  {internalUnreadCount > 0 && (
                    <span className="rounded-full bg-blue-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
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
                      ? 'border-emerald-400/20 bg-emerald-500/15 text-emerald-300 shadow-lg shadow-emerald-950/20'
                      : 'border-transparent text-gray-500 hover:bg-white/[0.04] hover:text-gray-200'
                  }`}
                >
                  <FaWhatsapp size={15} />
                  WhatsApp
                  {whatsappUnreadCount > 0 && (
                    <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
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

          <div
            className={`pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent ${
              isWhatsAppConversation ? 'via-emerald-500/20' : 'via-blue-500/20'
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

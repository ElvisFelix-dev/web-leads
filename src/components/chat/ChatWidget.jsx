import { useEffect, useState } from 'react';
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

  const {
    unreadCount,
    currentConversation,
    selectConversation,
    loadConversations,
    getConversationName,
    getConversationSubtitle,
  } = useChat();

  /*
   * ============================================================
   * RESPONSIVIDADE
   * ============================================================
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
   * ============================================================
   * CARREGAR CONVERSAS
   * ============================================================
   */

  useEffect(() => {
    if (!isOpen) return;

    loadConversations();
  }, [isOpen, loadConversations]);

  /*
   * ============================================================
   * ESC + BLOQUEIO DO SCROLL
   * ============================================================
   */

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (showNewChat) {
          setShowNewChat(false);
          return;
        }

        setIsOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, showNewChat]);

  /*
   * ============================================================
   * FECHAR CHAT
   * ============================================================
   */

  const handleClose = () => {
    setIsOpen(false);
    setShowNewChat(false);
  };

  /*
   * ============================================================
   * SELECIONAR CONVERSA
   * ============================================================
   */

  const handleSelectConversation = (conversation) => {
    selectConversation(conversation);
  };

  /*
   * ============================================================
   * VOLTAR PARA LISTA NO MOBILE
   * ============================================================
   */

  const handleBack = () => {
    if (!isMobile) return;

    selectConversation(null);
  };

  /*
   * ============================================================
   * IDENTIFICAÇÃO DO CANAL
   * ============================================================
   */

  const isWhatsAppConversation = currentConversation?.channel === 'whatsapp';

  const isInternalChannel = currentConversation?.type === 'broker_channel';

  const conversationName = currentConversation
    ? getConversationName?.(currentConversation) || 'Conversa'
    : '';

  const conversationSubtitle = currentConversation
    ? getConversationSubtitle?.(currentConversation) || ''
    : '';

  const participantCount = currentConversation?.participants?.length || 0;

  /*
   * ============================================================
   * BOTÃO FLUTUANTE
   * ============================================================
   */

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir mensagens"
        className="
          fixed
          right-5
          bottom-5
          sm:right-6
          sm:bottom-6
          z-[60]

          group

          w-14
          h-14
          sm:w-16
          sm:h-16

          rounded-2xl

          bg-gradient-to-br
          from-blue-500
          to-blue-700

          border
          border-blue-400/30

          text-white

          shadow-2xl
          shadow-blue-900/40

          flex
          items-center
          justify-center

          transition-all
          duration-300

          hover:scale-105
          hover:-translate-y-1
          hover:shadow-blue-900/60

          active:scale-95
        "
      >
        {/* Glow */}
        <span
          className="
            absolute
            inset-0
            rounded-2xl
            bg-blue-400/20
            blur-xl
            opacity-0
            group-hover:opacity-100
            transition-opacity
            duration-300
          "
        />

        <span className="relative flex items-center justify-center">
          <FaComments
            size={23}
            className="
              transition-transform
              duration-300
              group-hover:scale-110
            "
          />

          {unreadCount > 0 && (
            <span
              className="
                absolute
                -top-3
                -right-3

                min-w-[21px]
                h-[21px]

                px-1

                rounded-full

                bg-red-500
                border-2
                border-[#0d1119]

                text-[10px]
                font-extrabold
                text-white

                flex
                items-center
                justify-center

                shadow-lg
                shadow-red-900/40

                animate-pulse
              "
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </span>
      </button>
    );
  }

  /*
   * ============================================================
   * CHAT ABERTO
   * ============================================================
   */

  return (
    <>
      {/* ========================================================
          OVERLAY
      ======================================================== */}
      <div
        className="
          fixed
          inset-0
          z-50

          bg-black/75
          backdrop-blur-md

          flex
          items-center
          justify-center

          p-0
          sm:p-4
          lg:p-6

          animate-[fadeIn_180ms_ease-out]
        "
      >
        {/* ======================================================
            CONTAINER PRINCIPAL
        ====================================================== */}
        <div
          className="
            relative

            w-full
            h-full

            sm:h-[92vh]
            sm:max-h-[900px]

            lg:max-w-[1280px]

            bg-[#0b0f17]

            sm:rounded-2xl

            border-0
            sm:border
            border-white/[0.06]

            shadow-2xl
            shadow-black/60

            overflow-hidden

            flex
            flex-col

            animate-[chatOpen_220ms_ease-out]
          "
        >
          {/* ====================================================
              HEADER PRINCIPAL
          ==================================================== */}
          <header
            className="
              shrink-0

              h-[68px]

              px-4
              sm:px-5
              lg:px-6

              border-b
              border-white/[0.06]

              bg-[#10151f]/95
              backdrop-blur-xl

              flex
              items-center
              justify-between

              relative
              z-20
            "
          >
            {/* Left */}
            <div className="flex items-center min-w-0">
              {/* Mobile back */}
              {isMobile && currentConversation && (
                <button
                  type="button"
                  onClick={handleBack}
                  aria-label="Voltar para conversas"
                  className="
                    mr-2

                    w-9
                    h-9

                    rounded-xl

                    text-gray-500
                    hover:text-white

                    hover:bg-white/[0.05]

                    flex
                    items-center
                    justify-center

                    transition
                  "
                >
                  <FaChevronLeft size={14} />
                </button>
              )}

              {/* Ícone */}
              <div
                className={`
                  w-10
                  h-10

                  rounded-xl

                  flex
                  items-center
                  justify-center

                  shrink-0

                  border

                  ${
                    isWhatsAppConversation
                      ? 'bg-emerald-500/10 border-emerald-500/10'
                      : 'bg-blue-500/10 border-blue-500/10'
                  }
                `}
              >
                {isWhatsAppConversation ? (
                  <FaWhatsapp size={18} className="text-emerald-400" />
                ) : currentConversation ? (
                  <FaComments size={17} className="text-blue-400" />
                ) : (
                  <FaUsers size={17} className="text-blue-400" />
                )}
              </div>

              {/* Title */}
              <div className="ml-3 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <h2
                    className="
                      text-sm
                      sm:text-[15px]
                      font-bold
                      text-white
                      truncate
                    "
                  >
                    {currentConversation
                      ? isWhatsAppConversation
                        ? conversationName
                        : 'Mensagens'
                      : 'Conversas'}
                  </h2>

                  {/* Badge WhatsApp */}
                  {isWhatsAppConversation && (
                    <span
                      className="
                        hidden
                        sm:inline-flex

                        items-center
                        gap-1.5

                        px-2
                        py-0.5

                        rounded-full

                        bg-emerald-500/10
                        border
                        border-emerald-500/10

                        text-[9px]
                        font-semibold
                        text-emerald-400
                      "
                    >
                      <FaWhatsapp size={8} />
                      WhatsApp
                    </span>
                  )}

                  {/* Badge canal interno */}
                  {isInternalChannel && !isWhatsAppConversation && (
                    <span
                      className="
                        hidden
                        sm:inline-flex

                        items-center
                        gap-1.5

                        px-2
                        py-0.5

                        rounded-full

                        bg-blue-500/10
                        border
                        border-blue-500/10

                        text-[9px]
                        font-semibold
                        text-blue-400
                      "
                    >
                      <FaUsers size={8} />
                      Canal
                    </span>
                  )}

                  {/* Badge chat interno */}
                  {currentConversation &&
                    !isWhatsAppConversation &&
                    !isInternalChannel && (
                      <span
                        className="
                          hidden
                          sm:inline-flex

                          items-center
                          gap-1.5

                          px-2
                          py-0.5

                          rounded-full

                          bg-blue-500/10
                          border
                          border-blue-500/10

                          text-[9px]
                          font-semibold
                          text-blue-400
                        "
                      >
                        <FaCircle size={5} />
                        Interno
                      </span>
                    )}
                </div>

                {/* Subtítulo */}
                <p
                  className="
                    text-[10px]
                    sm:text-[11px]
                    text-gray-500
                    mt-0.5
                    truncate
                    max-w-[260px]
                    sm:max-w-[400px]
                  "
                >
                  {currentConversation
                    ? isWhatsAppConversation
                      ? conversationSubtitle || 'WhatsApp'
                      : isInternalChannel
                        ? `${participantCount} ${
                            participantCount === 1
                              ? 'participante'
                              : 'participantes'
                          }`
                        : `${participantCount} ${
                            participantCount === 1
                              ? 'participante'
                              : 'participantes'
                          }`
                    : unreadCount > 0
                      ? `${unreadCount} ${
                          unreadCount === 1
                            ? 'mensagem não lida'
                            : 'mensagens não lidas'
                        }`
                      : 'Nenhuma mensagem não lida'}
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              {/* Indicador geral de não lidas */}
              {!currentConversation && unreadCount > 0 && (
                <div
                  className="
                    hidden
                    sm:flex

                    items-center
                    gap-2

                    px-3
                    py-1.5

                    rounded-xl

                    bg-red-500/10
                    border
                    border-red-500/10
                  "
                >
                  <span
                    className="
                      w-1.5
                      h-1.5
                      rounded-full
                      bg-red-400
                      animate-pulse
                    "
                  />

                  <span className="text-[10px] font-semibold text-red-400">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                </div>
              )}

              {/* Fechar */}
              <button
                type="button"
                onClick={handleClose}
                aria-label="Fechar chat"
                className="
                  w-9
                  h-9

                  rounded-xl

                  text-gray-500

                  hover:text-white
                  hover:bg-white/[0.06]

                  flex
                  items-center
                  justify-center

                  transition-all
                  duration-200
                "
              >
                <FaTimes size={16} />
              </button>
            </div>
          </header>

          {/* ====================================================
              BODY
          ==================================================== */}
          <div className="flex-1 min-h-0 flex overflow-hidden">
            {/* ==================================================
                CONVERSATION LIST
            ================================================== */}
            <aside
              className={`
                ${currentConversation && isMobile ? 'hidden' : 'flex'}

                w-full
                lg:w-[360px]
                xl:w-[390px]

                shrink-0

                flex-col

                border-r
                border-white/[0.06]

                bg-[#0d121b]
              `}
            >
              <ConversationList
                onSelect={handleSelectConversation}
                onNewChat={() => setShowNewChat(true)}
              />
            </aside>

            {/* ==================================================
                CHAT AREA
            ================================================== */}
            <main
              className={`
                ${!currentConversation && isMobile ? 'hidden' : 'flex'}

                flex-1
                min-w-0
                min-h-0

                flex-col

                bg-[#0b0f17]
              `}
            >
              <ChatArea onBack={handleBack} />
            </main>
          </div>

          {/* ====================================================
              BOTTOM DECORATIVE LINE
          ==================================================== */}
          <div
            className={`
              absolute
              bottom-0
              left-0
              right-0

              h-px

              bg-gradient-to-r
              from-transparent
              ${
                isWhatsAppConversation
                  ? 'via-emerald-500/20'
                  : 'via-blue-500/20'
              }
              to-transparent

              pointer-events-none
            `}
          />
        </div>
      </div>

      {/* ========================================================
          NOVA CONVERSA
      ======================================================== */}
      <NewConversationModal
        isOpen={showNewChat}
        onClose={() => setShowNewChat(false)}
      />

      {/* ========================================================
          ANIMAÇÕES
      ======================================================== */}
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }

            to {
              opacity: 1;
            }
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

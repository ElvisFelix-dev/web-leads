import { useEffect, useState, useRef } from 'react';
import { FaComments, FaTimes } from 'react-icons/fa';
import { useChat } from '../../context/ChatContext';

export default function ChatNotificationToast() {
  const {
    lastNotification,
    clearNotification,
    selectConversation,
    conversations,
  } = useChat();

  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!lastNotification) return;

    setVisible(true);

    // ✅ Auto-fecha após 6 segundos
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(clearNotification, 300); // Aguarda animação
    }, 6000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [lastNotification, clearNotification]);

  // ✅ Toca som (se o usuário permitir)
  useEffect(() => {
    if (!lastNotification) return;

    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Silencioso - navegador bloqueou autoplay
      });
    } catch {
      // Ignora erros
    }
  }, [lastNotification]);

  const handleClick = () => {
    // Tenta encontrar a conversa e abrir
    const conversation = conversations.find(
      (c) => c._id === lastNotification.conversationId,
    );

    if (conversation) {
      selectConversation(conversation);
    }

    setVisible(false);
    setTimeout(clearNotification, 300);
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setVisible(false);
    setTimeout(clearNotification, 300);
  };

  if (!lastNotification || !visible) return null;

  return (
    <div
      className={`
        fixed
        top-5
        right-5
        z-[9999]

        max-w-sm
        w-full
        sm:w-auto
        sm:min-w-[320px]

        bg-[#0d1119]
        border
        border-blue-500/30

        rounded-2xl

        shadow-2xl
        shadow-blue-900/40

        overflow-hidden

        cursor-pointer

        transition-all
        duration-300

        ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
      `}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      {/* Barra azul superior */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-600" />

      <div className="p-4 flex items-start gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          {lastNotification.senderAvatar ? (
            <img
              src={lastNotification.senderAvatar}
              alt={lastNotification.senderName}
              className="w-12 h-12 rounded-xl object-cover border-2 border-blue-500/30"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm border-2 border-blue-400/30">
              {lastNotification.senderName.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Ícone de mensagem */}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-500 border-2 border-[#0d1119] flex items-center justify-center">
            <FaComments size={8} className="text-white" />
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-white truncate">
              {lastNotification.senderName}
            </p>
            <span className="text-[10px] text-blue-400 shrink-0 font-semibold">
              agora
            </span>
          </div>

          <p className="text-xs text-gray-300 line-clamp-2 mt-1">
            {lastNotification.preview || 'Nova mensagem recebida'}
          </p>

          <p className="text-[10px] text-blue-400 mt-2 font-semibold flex items-center gap-1">
            Clique para abrir a conversa →
          </p>
        </div>

        {/* Fechar */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Fechar notificação"
          className="
            shrink-0

            w-7
            h-7

            rounded-lg

            text-gray-500
            hover:text-white
            hover:bg-white/[0.06]

            flex
            items-center
            justify-center

            transition
          "
        >
          <FaTimes size={11} />
        </button>
      </div>

      {/* Barra de progresso (auto-close) */}
      <div className="h-0.5 bg-blue-500/10 overflow-hidden">
        <div
          className="h-full bg-blue-500"
          style={{
            animation: 'chatNotificationProgress 6s linear forwards',
          }}
        />
      </div>

      {/* Animação */}
      <style>
        {`
          @keyframes chatNotificationProgress {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}
      </style>
    </div>
  );
}

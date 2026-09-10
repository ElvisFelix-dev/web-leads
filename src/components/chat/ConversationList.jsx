import { useMemo, useState } from 'react';
import {
  FaSearch,
  FaUsers,
  FaUser,
  FaChevronRight,
  FaPlus,
  FaComments,
} from 'react-icons/fa';

import { useChat } from '../../context/ChatContext';

export default function ConversationList({ onSelect, onNewChat }) {
  const {
    conversations = [],
    loadingConversations,
    unreadCount = 0,
    isUserOnline,
    getConversationName,
    getConversationAvatar,
    getOtherParticipant,
    currentConversation,
  } = useChat();

  const [search, setSearch] = useState('');
  const [brokenAvatars, setBrokenAvatars] = useState({});

  /**
   * Marca um avatar como inválido.
   * Assim conseguimos mostrar o fallback sem quebrar o layout.
   */
  const handleAvatarError = (conversationId) => {
    setBrokenAvatars((prev) => ({
      ...prev,
      [conversationId]: true,
    }));
  };

  /**
   * Filtra as conversas.
   */
  const filteredConversations = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const name = String(
        getConversationName?.(conversation) || '',
      ).toLowerCase();

      const lastMessage = String(conversation?.lastMessage || '').toLowerCase();

      return name.includes(term) || lastMessage.includes(term);
    });
  }, [conversations, search, getConversationName]);

  /**
   * Formata a data da última mensagem.
   */
  const formatTime = (date) => {
    if (!date) return '';

    const messageDate = new Date(date);

    if (Number.isNaN(messageDate.getTime())) {
      return '';
    }

    const now = new Date();
    const diff = now.getTime() - messageDate.getTime();

    // Caso a data esteja no futuro por alguma diferença de relógio.
    if (diff < 0) {
      return messageDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    if (diff < 60 * 1000) {
      return 'Agora';
    }

    if (diff < 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 1000))}min`;
    }

    if (diff < 24 * 60 * 60 * 1000) {
      return messageDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return messageDate.toLocaleDateString('pt-BR', {
        weekday: 'short',
      });
    }

    return messageDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  /**
   * Retorna nome seguro da conversa.
   */
  const getSafeConversationName = (conversation) => {
    return getConversationName?.(conversation) || 'Conversa';
  };

  /**
   * Retorna avatar seguro.
   */
  const getSafeConversationAvatar = (conversation) => {
    if (brokenAvatars[conversation?._id]) {
      return null;
    }

    return getConversationAvatar?.(conversation) || null;
  };

  /**
   * Limita o tamanho da mensagem exibida.
   */
  const getLastMessage = (conversation) => {
    // ✅ Tenta pegar a string diretamente
    if (typeof conversation?.lastMessage === 'string') {
      const msg = conversation.lastMessage.trim();
      return msg || 'Nenhuma mensagem';
    }

    // ✅ Se for objeto, tenta extrair o content
    if (
      conversation?.lastMessage &&
      typeof conversation.lastMessage === 'object'
    ) {
      const content = conversation.lastMessage.content;
      if (typeof content === 'string') {
        return content.trim() || 'Nenhuma mensagem';
      }
    }

    // ✅ Fallback para o objeto completo
    if (conversation?.lastMessageObject?.content) {
      const content = conversation.lastMessageObject.content;
      if (typeof content === 'string') {
        return content.trim() || 'Nenhuma mensagem';
      }
    }

    return 'Nenhuma mensagem';
  };

  /**
   * Estado de carregamento.
   */
  if (loadingConversations) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0d1119]">
        <div className="flex flex-col items-center gap-3">
          <div
            className="
              animate-spin
              rounded-full
              h-8
              w-8
              border-2
              border-blue-500
              border-t-transparent
            "
          />

          <span className="text-xs text-gray-600">Carregando conversas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#0d1119]">
      {/* =========================================================
          HEADER
      ========================================================= */}
      <div className="p-4 border-b border-gray-800 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-600/10">
              <FaComments size={13} className="text-blue-400" />
            </div>

            <h3 className="text-sm font-bold text-white">Conversas</h3>

            {conversations.length > 0 && (
              <span className="text-[10px] text-gray-600">
                {conversations.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Contador geral de não lidas */}
            {unreadCount > 0 && (
              <span
                className="
                  min-w-[22px]
                  h-[22px]
                  flex
                  items-center
                  justify-center
                  text-[10px]
                  font-bold
                  bg-blue-600
                  text-white
                  px-1.5
                  rounded-full
                "
                title={`${unreadCount} mensagem(ns) não lida(s)`}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}

            {/* Nova conversa */}
            <button
              type="button"
              onClick={onNewChat}
              aria-label="Nova conversa"
              title="Nova conversa"
              className="
                p-2
                rounded-lg
                text-gray-500
                hover:text-white
                hover:bg-gray-800
                active:bg-gray-700
                transition
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500/50
              "
            >
              <FaPlus size={14} />
            </button>
          </div>
        </div>

        {/* =======================================================
            BUSCA
        ======================================================= */}
        <div className="relative">
          <FaSearch
            size={12}
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-gray-600
              pointer-events-none
            "
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar conversas..."
            aria-label="Buscar conversas"
            className="
              w-full
              h-10
              bg-gray-950
              border
              border-gray-800
              rounded-xl
              pl-9
              pr-9
              text-sm
              text-white
              placeholder:text-gray-700
              outline-none
              transition
              focus:border-blue-500/70
              focus:ring-1
              focus:ring-blue-500/20
            "
          />

          {/* Limpar pesquisa */}
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Limpar pesquisa"
              className="
                absolute
                right-3
                top-1/2
                -translate-y-1/2
                text-gray-600
                hover:text-gray-300
                transition
              "
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* =========================================================
          LISTA
      ========================================================= */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-56 px-6 text-center">
            <div
              className="
                w-14
                h-14
                rounded-2xl
                bg-gray-900
                border
                border-gray-800
                flex
                items-center
                justify-center
                mb-4
              "
            >
              {search ? (
                <FaSearch size={20} className="text-gray-700" />
              ) : (
                <FaUsers size={20} className="text-gray-700" />
              )}
            </div>

            <p className="text-sm font-medium text-gray-500">
              {search
                ? 'Nenhuma conversa encontrada'
                : 'Nenhuma conversa ainda'}
            </p>

            <p className="text-xs text-gray-700 mt-1">
              {search
                ? 'Tente buscar por outro nome ou mensagem'
                : 'Inicie uma nova conversa para começar'}
            </p>

            {!search && onNewChat && (
              <button
                type="button"
                onClick={onNewChat}
                className="
                  mt-4
                  inline-flex
                  items-center
                  gap-2
                  px-3
                  py-2
                  rounded-lg
                  bg-blue-600/10
                  border
                  border-blue-500/20
                  text-xs
                  font-medium
                  text-blue-400
                  hover:bg-blue-600/20
                  hover:border-blue-500/30
                  transition
                "
              >
                <FaPlus size={10} />
                Nova conversa
              </button>
            )}
          </div>
        ) : (
          <div>
            {filteredConversations.map((conversation) => {
              const conversationId = conversation?._id;

              const isActive = currentConversation?._id === conversationId;

              const otherUser = getOtherParticipant?.(conversation);

              const otherUserId = otherUser?._id || otherUser?.id;

              const online = Boolean(
                otherUserId && isUserOnline?.(otherUserId),
              );

              const name = getSafeConversationName(conversation);

              const avatar = getSafeConversationAvatar(conversation);

              const lastMessage = getLastMessage(conversation);

              const unread = Number(conversation?.unreadCount || 0);

              const isChannel = conversation?.type === 'broker_channel';

              return (
                <button
                  key={conversationId}
                  type="button"
                  onClick={() => onSelect?.(conversation)}
                  aria-label={`Abrir conversa com ${name}`}
                  aria-current={isActive ? 'true' : undefined}
                  className={`
                    group
                    w-full
                    p-3.5
                    text-left
                    border-b
                    border-gray-800/50
                    transition
                    focus:outline-none
                    focus:bg-gray-800/40
                    ${isActive ? 'bg-gray-800/50' : 'hover:bg-gray-800/30'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    {/* =================================================
                        AVATAR
                    ================================================_ */}
                    <div className="relative shrink-0">
                      <div
                        className={`
                          w-11
                          h-11
                          rounded-full
                          flex
                          items-center
                          justify-center
                          overflow-hidden
                          border
                          ${
                            isActive
                              ? 'border-blue-500/40 bg-blue-500/10'
                              : 'border-gray-800 bg-gray-900'
                          }
                        `}
                      >
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={() => handleAvatarError(conversationId)}
                          />
                        ) : isChannel ? (
                          <FaUsers size={17} className="text-blue-400" />
                        ) : (
                          <FaUser size={16} className="text-gray-600" />
                        )}
                      </div>

                      {/* Indicador online */}
                      {online && (
                        <span
                          className="
                            absolute
                            -bottom-0.5
                            -right-0.5
                            w-3
                            h-3
                            rounded-full
                            bg-emerald-400
                            border-2
                            border-[#0d1119]
                          "
                          title="Online"
                        />
                      )}
                    </div>

                    {/* =================================================
                        INFORMAÇÕES
                    ================================================= */}
                    <div className="flex-1 min-w-0">
                      {/* Nome + horário */}
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

                          {isChannel && (
                            <span
                              className="
                                shrink-0
                                text-[8px]
                                uppercase
                                tracking-wide
                                font-semibold
                                text-blue-400
                                bg-blue-500/10
                                px-1.5
                                py-0.5
                                rounded
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
                            ${unread > 0 ? 'text-blue-400' : 'text-gray-600'}
                          `}
                        >
                          {formatTime(conversation?.lastMessageAt)}
                        </span>
                      </div>

                      {/* Última mensagem + contador */}
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <p
                          className={`
                            text-xs
                            truncate
                            ${
                              unread > 0
                                ? 'text-gray-300 font-medium'
                                : 'text-gray-500'
                            }
                          `}
                        >
                          {lastMessage}
                        </p>

                        {unread > 0 && (
                          <span
                            className="
                              shrink-0
                              min-w-[20px]
                              h-[20px]
                              flex
                              items-center
                              justify-center
                              bg-blue-600
                              text-white
                              text-[9px]
                              font-bold
                              px-1.5
                              rounded-full
                            "
                          >
                            {unread > 99 ? '99+' : unread}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* =================================================
                        SETA
                    ================================================= */}
                    <FaChevronRight
                      size={10}
                      className={`
                        shrink-0
                        transition-all
                        ${
                          isActive
                            ? 'text-blue-400 translate-x-0.5'
                            : 'text-gray-700 group-hover:text-gray-500'
                        }
                      `}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================
          FOOTER / RESULTADO DA BUSCA
      ========================================================= */}
      {search && filteredConversations.length > 0 && (
        <div
          className="
            shrink-0
            px-4
            py-2
            border-t
            border-gray-800
            bg-[#0b0f16]
          "
        >
          <p className="text-[10px] text-gray-700 text-center">
            {filteredConversations.length}{' '}
            {filteredConversations.length === 1
              ? 'conversa encontrada'
              : 'conversas encontradas'}
          </p>
        </div>
      )}
    </div>
  );
}

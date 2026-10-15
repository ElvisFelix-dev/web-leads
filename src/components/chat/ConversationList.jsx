import { useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  FaSearch,
  FaUsers,
  FaUser,
  FaChevronRight,
  FaPlus,
  FaComments,
  FaWhatsapp,
  FaExternalLinkAlt,
} from 'react-icons/fa';

import { useChat } from '../../context/ChatContext';

export default function ConversationList({
  onSelect,
  onNewChat,
  channelFilter = 'internal',
}) {
  const {
    conversations = [],
    loadingConversations,
    unreadCount = 0,
    isUserOnline,
    getConversationName,
    getConversationAvatar,
    getConversationSubtitle,
    getOtherParticipant,
    currentConversation,
  } = useChat();

  const [search, setSearch] = useState('');
  const [brokenAvatars, setBrokenAvatars] = useState({});
  const navigate = useNavigate();

  /**
   * Normaliza o canal.
   * Evita diferenças de maiúsculas/minúsculas.
   */
  const normalizeChannel = useCallback((conversation) => {
    const channel = String(conversation?.channel || '')
      .trim()
      .toLowerCase();

    return channel === 'whatsapp' ? 'whatsapp' : 'internal';
  }, []);

  const isWhatsAppConversation = useCallback(
    (conversation) => normalizeChannel(conversation) === 'whatsapp',
    [normalizeChannel],
  );

  /**
   * Identificador consistente da conversa.
   */
  const getConversationId = (conversation) =>
    conversation?._id || conversation?.id;

  const getProfileTarget = (conversation) => {
    if (!conversation) return null;

    if (isWhatsAppConversation(conversation)) {
      const lead =
        conversation?.lead ||
        conversation?.relatedLead ||
        conversation?.contactLead;
      const leadId = lead?._id || lead?.id || conversation?.leadId;
      return leadId
        ? { path: `/lead-detail/${leadId}`, label: 'Abrir detalhes do lead' }
        : null;
    }

    if (conversation?.type === 'broker_channel') return null;

    const person = getOtherParticipant?.(conversation);
    const personId = person?._id || person?.id;
    const role = String(person?.role || '').toLowerCase();

    if (personId && ['broker', 'corretor'].includes(role)) {
      return {
        path: `/broker-details/${personId}`,
        label: 'Abrir detalhes do corretor',
      };
    }

    const lead = conversation?.lead || conversation?.relatedLead;
    const leadId = lead?._id || lead?.id || conversation?.leadId;
    return leadId
      ? { path: `/lead-detail/${leadId}`, label: 'Abrir detalhes do lead' }
      : null;
  };

  const handleOpenProfile = (event, conversation) => {
    event.stopPropagation();
    const target = getProfileTarget(conversation);
    if (target) navigate(target.path);
  };

  /**
   * Filtra primeiro pelo canal e depois pelo texto pesquisado.
   *
   * Chat interno:
   *   conversas que não são do WhatsApp.
   *
   * WhatsApp:
   *   somente conversas identificadas como WhatsApp.
   */
  const filteredConversations = useMemo(() => {
    const normalizedFilter =
      channelFilter === 'whatsapp' ? 'whatsapp' : 'internal';

    const channelConversations = conversations.filter((conversation) => {
      return normalizeChannel(conversation) === normalizedFilter;
    });

    const term = search.trim().toLowerCase();

    if (!term) {
      return channelConversations;
    }

    return channelConversations.filter((conversation) => {
      const name = String(
        getConversationName?.(conversation) || '',
      ).toLowerCase();

      const subtitle = String(
        getConversationSubtitle?.(conversation) || '',
      ).toLowerCase();

      const lastMessageValue = conversation?.lastMessage;

      const lastMessage =
        typeof lastMessageValue === 'string'
          ? lastMessageValue
          : String(
              lastMessageValue?.content ||
                conversation?.lastMessageObject?.content ||
                '',
            );

      return (
        name.includes(term) ||
        subtitle.includes(term) ||
        lastMessage.toLowerCase().includes(term)
      );
    });
  }, [
    conversations,
    channelFilter,
    search,
    normalizeChannel,
    getConversationName,
    getConversationSubtitle,
  ]);

  /**
   * Soma as mensagens não lidas somente do canal atual.
   */
  const activeUnreadCount = useMemo(() => {
    return conversations
      .filter(
        (conversation) => normalizeChannel(conversation) === channelFilter,
      )
      .reduce(
        (total, conversation) =>
          total + Math.max(0, Number(conversation?.unreadCount) || 0),
        0,
      );
  }, [conversations, channelFilter, normalizeChannel]);

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
   * Nome seguro da conversa.
   */
  const getSafeConversationName = (conversation) => {
    return getConversationName?.(conversation) || 'Conversa';
  };

  /**
   * Avatar seguro.
   */
  const getSafeConversationAvatar = (conversation) => {
    const id = getConversationId(conversation);

    if (brokenAvatars[id]) {
      return null;
    }

    return getConversationAvatar?.(conversation) || null;
  };

  /**
   * Subtítulo seguro.
   */
  const getSafeConversationSubtitle = (conversation) => {
    return getConversationSubtitle?.(conversation) || '';
  };

  /**
   * Última mensagem.
   */
  const getLastMessage = (conversation) => {
    const lastMessage = conversation?.lastMessage;

    if (typeof lastMessage === 'string' && lastMessage.trim()) {
      return lastMessage.trim();
    }

    if (
      lastMessage &&
      typeof lastMessage === 'object' &&
      typeof lastMessage.content === 'string' &&
      lastMessage.content.trim()
    ) {
      return lastMessage.content.trim();
    }

    const fallback = conversation?.lastMessageObject?.content;

    if (typeof fallback === 'string' && fallback.trim()) {
      return fallback.trim();
    }

    return 'Nenhuma mensagem';
  };

  /**
   * Tratamento de avatar inválido.
   */
  const handleAvatarError = (conversationId) => {
    setBrokenAvatars((previous) => ({
      ...previous,
      [conversationId]: true,
    }));
  };

  /**
   * Estado de carregamento.
   */
  if (loadingConversations) {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#0d1119]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />

          <span className="text-xs text-gray-600">Carregando conversas...</span>
        </div>
      </div>
    );
  }

  const isWhatsAppTab = channelFilter === 'whatsapp';

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#0d1119]">
      {/* CABEÇALHO */}
      <div className="shrink-0 border-b border-gray-800 p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                isWhatsAppTab ? 'bg-emerald-500/10' : 'bg-blue-600/10'
              }`}
            >
              {isWhatsAppTab ? (
                <FaWhatsapp size={14} className="text-emerald-400" />
              ) : (
                <FaComments size={13} className="text-blue-400" />
              )}
            </div>

            <h3 className="text-sm font-bold text-white">
              {isWhatsAppTab ? 'Conversas WhatsApp' : 'Conversas internas'}
            </h3>

            <span className="text-[10px] text-gray-600">
              {filteredConversations.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {activeUnreadCount > 0 && (
              <span
                className={`flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold text-white ${
                  isWhatsAppTab ? 'bg-emerald-600' : 'bg-blue-600'
                }`}
                title={`${activeUnreadCount} mensagem(ns) não lida(s) neste canal`}
              >
                {activeUnreadCount > 99 ? '99+' : activeUnreadCount}
              </span>
            )}

            {!isWhatsAppTab && (
              <button
                type="button"
                onClick={onNewChat}
                aria-label="Nova conversa interna"
                title="Nova conversa interna"
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <FaPlus size={14} />
              </button>
            )}
          </div>
        </div>

        {/* PESQUISA */}
        <div className="relative">
          <FaSearch
            size={12}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={
              isWhatsAppTab
                ? 'Buscar contato, telefone ou mensagem...'
                : 'Buscar conversa ou participante...'
            }
            aria-label="Buscar conversas"
            className="h-10 w-full rounded-xl border border-gray-800 bg-gray-950 pl-9 pr-9 text-sm text-white outline-none transition placeholder:text-gray-700 focus:border-blue-500/70 focus:ring-1 focus:ring-blue-500/20"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Limpar pesquisa"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 transition hover:text-gray-300"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* LISTA FILTRADA */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex h-56 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-800 bg-gray-900">
              {isWhatsAppTab ? (
                <FaWhatsapp size={22} className="text-emerald-500/60" />
              ) : search ? (
                <FaSearch size={20} className="text-gray-700" />
              ) : (
                <FaUsers size={20} className="text-gray-700" />
              )}
            </div>

            <p className="text-sm font-medium text-gray-500">
              {search
                ? 'Nenhuma conversa encontrada'
                : isWhatsAppTab
                  ? 'Nenhuma conversa no WhatsApp'
                  : 'Nenhuma conversa interna'}
            </p>

            <p className="mt-1 text-xs text-gray-700">
              {search
                ? 'Tente outro nome, telefone ou mensagem.'
                : isWhatsAppTab
                  ? 'As conversas do WhatsApp aparecerão aqui.'
                  : 'Inicie uma conversa com alguém da equipe.'}
            </p>

            {!search && !isWhatsAppTab && onNewChat && (
              <button
                type="button"
                onClick={onNewChat}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-600/10 px-3 py-2 text-xs font-medium text-blue-400 transition hover:border-blue-500/30 hover:bg-blue-600/20"
              >
                <FaPlus size={10} />
                Nova conversa
              </button>
            )}
          </div>
        ) : (
          <div>
            {filteredConversations.map((conversation) => {
              const conversationId = getConversationId(conversation);

              const currentId = getConversationId(currentConversation);

              const isActive =
                Boolean(conversationId) && conversationId === currentId;

              const isWhatsApp = isWhatsAppConversation(conversation);

              const isChannel = conversation?.type === 'broker_channel';

              const otherUser = getOtherParticipant?.(conversation);

              const otherUserId = otherUser?._id || otherUser?.id;

              const online =
                !isWhatsApp &&
                Boolean(otherUserId && isUserOnline?.(otherUserId));

              const name = getSafeConversationName(conversation);

              const avatar = getSafeConversationAvatar(conversation);

              const subtitle = getSafeConversationSubtitle(conversation);

              const lastMessage = getLastMessage(conversation);

              const unread = Math.max(
                0,
                Number(conversation?.unreadCount) || 0,
              );

              return (
                <div
                  key={conversationId}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect?.(conversation)}
                  onKeyDown={(event) => {
                    if (event.target !== event.currentTarget) return;
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelect?.(conversation);
                    }
                  }}
                  aria-label={`Abrir conversa com ${name}`}
                  aria-current={isActive ? 'true' : undefined}
                  className={`group w-full cursor-pointer border-b border-gray-800/50 p-3.5 text-left transition focus:outline-none focus:bg-gray-800/40 ${
                    isActive ? 'bg-gray-800/50' : 'hover:bg-gray-800/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* AVATAR */}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        disabled={!getProfileTarget(conversation)}
                        onClick={(event) =>
                          handleOpenProfile(event, conversation)
                        }
                        aria-label={
                          getProfileTarget(conversation)?.label ||
                          `Avatar de ${name}`
                        }
                        title={
                          getProfileTarget(conversation)?.label ||
                          'Detalhes indisponíveis'
                        }
                        className={`relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 ${
                          isActive
                            ? isWhatsApp
                              ? 'border-emerald-500/40 bg-emerald-500/10'
                              : 'border-blue-500/40 bg-blue-500/10'
                            : isWhatsApp
                              ? 'border-emerald-500/20 bg-emerald-500/5'
                              : 'border-gray-800 bg-gray-900'
                        } ${getProfileTarget(conversation) ? 'cursor-pointer hover:scale-[1.04] hover:border-sky-400/50' : 'cursor-default'}`}
                      >
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            onError={() => handleAvatarError(conversationId)}
                          />
                        ) : isWhatsApp ? (
                          <FaWhatsapp size={20} className="text-emerald-400" />
                        ) : isChannel ? (
                          <FaUsers size={17} className="text-blue-400" />
                        ) : (
                          <FaUser size={16} className="text-gray-600" />
                        )}
                        {getProfileTarget(conversation) && (
                          <span className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-tl-md bg-sky-500 text-white">
                            <FaExternalLinkAlt size={7} />
                          </span>
                        )}
                      </button>

                      {online && (
                        <span
                          className="pointer-events-none absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#0d1119] bg-emerald-400"
                          title="Online"
                        />
                      )}
                    </div>

                    {/* INFORMAÇÕES DA CONVERSA */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <p
                            className={`truncate text-sm ${
                              unread > 0
                                ? 'font-bold text-white'
                                : 'font-semibold text-gray-200'
                            }`}
                          >
                            {name}
                          </p>

                          {isWhatsApp && (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded border border-emerald-500/10 bg-emerald-500/10 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-emerald-400">
                              <FaWhatsapp size={8} />
                              WhatsApp
                            </span>
                          )}

                          {isChannel && !isWhatsApp && (
                            <span className="shrink-0 rounded bg-blue-500/10 px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-blue-400">
                              Canal
                            </span>
                          )}
                        </div>

                        <span
                          className={`shrink-0 text-[10px] ${
                            unread > 0
                              ? isWhatsApp
                                ? 'text-emerald-400'
                                : 'text-blue-400'
                              : 'text-gray-600'
                          }`}
                        >
                          {formatTime(
                            conversation?.lastMessageAt ||
                              conversation?.updatedAt,
                          )}
                        </span>
                      </div>

                      {subtitle && (
                        <p className="mt-0.5 truncate text-[10px] text-gray-600">
                          {subtitle}
                        </p>
                      )}

                      <div className="mt-1 flex items-center justify-between gap-2">
                        <p
                          className={`truncate text-xs ${
                            unread > 0
                              ? 'font-medium text-gray-300'
                              : 'text-gray-500'
                          }`}
                        >
                          {lastMessage}
                        </p>

                        {unread > 0 && (
                          <span
                            className={`flex h-[20px] min-w-[20px] shrink-0 items-center justify-center rounded-full px-1.5 text-[9px] font-bold text-white ${
                              isWhatsApp ? 'bg-emerald-600' : 'bg-blue-600'
                            }`}
                          >
                            {unread > 99 ? '99+' : unread}
                          </span>
                        )}
                      </div>
                    </div>

                    <FaChevronRight
                      size={10}
                      className={`shrink-0 transition-all ${
                        isActive
                          ? isWhatsApp
                            ? 'translate-x-0.5 text-emerald-400'
                            : 'translate-x-0.5 text-blue-400'
                          : 'text-gray-700 group-hover:text-gray-500'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* RODAPÉ DA PESQUISA */}
      {search && filteredConversations.length > 0 && (
        <div className="shrink-0 border-t border-gray-800 bg-[#0b0f16] px-4 py-2">
          <p className="text-center text-[10px] text-gray-700">
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

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  MessageCircle,
  MessageSquare,
  RefreshCw,
  Clock3,
  ArrowDownLeft,
  ArrowUpRight,
  ExternalLink,
  AlertCircle,
  Inbox,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import api from '../../service/api';
import { useChat } from '../../context/ChatContext';

const getPayload = (response) => {
  const payload = response?.data;

  return (
    payload?.data?.conversations ||
    payload?.data?.messages ||
    payload?.conversations ||
    payload?.messages ||
    payload?.data?.items ||
    payload?.items ||
    payload?.data ||
    payload ||
    []
  );
};

const getId = (value) => {
  if (!value) return '';

  if (typeof value === 'object') {
    return String(value._id || value.id || '');
  }

  return String(value);
};

const getMessageText = (message) => {
  if (!message) return '';

  const content = message.content ?? message.text ?? message.body;

  if (typeof content === 'string') return content.trim();

  if (content && typeof content === 'object') {
    return String(content.text || content.caption || '').trim();
  }

  if (message.mediaType || message.type === 'image') return 'Imagem';
  if (message.type === 'video') return 'Vídeo';
  if (message.type === 'audio') return 'Áudio';
  if (message.type === 'document') return 'Documento';

  return '';
};

const getMessageDate = (message) =>
  message?.createdAt ||
  message?.timestamp ||
  message?.sentAt ||
  message?.date ||
  message?.updatedAt ||
  null;

const getTimestamp = (message) => {
  const value = getMessageDate(message);
  if (!value) return 0;

  const date = new Date(value).getTime();
  return Number.isNaN(date) ? 0 : date;
};

const formatDateTime = (value) => {
  if (!value) return 'Data não informada';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Data não informada';
  }

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getSenderName = (message) => {
  const sender =
    message?.sender ||
    message?.senderInfo ||
    message?.user ||
    message?.author ||
    null;

  if (typeof sender === 'string') return sender;

  return sender?.name || sender?.email || message?.senderName || '';
};

const isOutgoing = (message) =>
  message?.fromMe === true ||
  message?.fromMe === 'true' ||
  message?.direction === 'outgoing' ||
  message?.direction === 'out' ||
  message?.isOutgoing === true ||
  message?.isFromMe === true;

const belongsToLead = (conversation, leadId) => {
  const linkedLeadIds = [
    conversation?.lead,
    conversation?.leadId,
    conversation?.leadInfo,
    conversation?.whatsappContact?.lead,
    conversation?.whatsappContact?.leadId,
  ]
    .map(getId)
    .filter(Boolean);

  return linkedLeadIds.includes(String(leadId));
};

export default function LeadRecentMessages({ leadId }) {
  const navigate = useNavigate();
  const { openLeadConversation } = useChat();

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadMessages = useCallback(
    async (manualRefresh = false) => {
      if (!leadId) {
        setConversation(null);
        setMessages([]);
        setLoading(false);
        return;
      }

      try {
        if (manualRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError('');

        // Localiza uma conversa vinculada ao lead.
        const conversationsResponse = await api.get('/api/chat/conversations');

        const conversations = getPayload(conversationsResponse);

        if (!Array.isArray(conversations)) {
          throw new Error('Formato inesperado ao carregar as conversas.');
        }

        const matchingConversations = conversations
          .filter((item) => belongsToLead(item, leadId))
          .sort((a, b) => {
            const aDate = new Date(
              a?.lastMessageObject?.createdAt ||
                a?.lastMessageAt ||
                a?.updatedAt ||
                0,
            ).getTime();

            const bDate = new Date(
              b?.lastMessageObject?.createdAt ||
                b?.lastMessageAt ||
                b?.updatedAt ||
                0,
            ).getTime();

            return bDate - aDate;
          });

        const foundConversation = matchingConversations[0] || null;

        setConversation(foundConversation);

        if (!foundConversation?._id) {
          setMessages([]);
          return;
        }

        const messagesResponse = await api.get(
          `/api/chat/conversations/${foundConversation._id}/messages`,
        );

        const loadedMessages = getPayload(messagesResponse);

        if (!Array.isArray(loadedMessages)) {
          throw new Error('Formato inesperado ao carregar as mensagens.');
        }

        const orderedMessages = [...loadedMessages].sort(
          (a, b) => getTimestamp(a) - getTimestamp(b),
        );

        // Exibe apenas as 5 mensagens mais recentes.
        setMessages(orderedMessages.slice(-5));
      } catch (err) {
        console.error('Erro ao carregar mensagens do lead:', err);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Não foi possível carregar as mensagens.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [leadId],
  );

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const latestMessage = useMemo(() => {
    if (!messages.length) return null;

    return messages[messages.length - 1];
  }, [messages]);

  const handleOpenConversation = async () => {
    try {
      if (typeof openLeadConversation === 'function') {
        await openLeadConversation(leadId);
      } else if (conversation?._id) {
        navigate('/chat', {
          state: { conversationId: conversation._id },
        });
        return;
      } else {
        return;
      }

      navigate('/chat');
    } catch (err) {
      console.error('Erro ao abrir conversa:', err);

      // Se já localizamos a conversa, permite tentar abri-la
      // diretamente pela identificação da conversa.
      if (conversation?._id) {
        navigate('/chat', {
          state: { conversationId: conversation._id },
        });
      }
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <MessageSquare size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-white">Últimas mensagens</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Histórico recente deste lead
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => loadMessages(true)}
          disabled={loading || refreshing}
          title="Atualizar mensagens"
          aria-label="Atualizar mensagens"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-400 transition hover:border-blue-500/30 hover:text-blue-400 disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="p-5 sm:p-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-20 animate-pulse rounded-xl bg-slate-800/60"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={19} className="mt-0.5 shrink-0 text-red-400" />

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-red-300">
                  Não foi possível carregar o histórico
                </p>

                <p className="mt-1 break-words text-xs text-slate-400">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => loadMessages(true)}
                  className="mt-3 text-sm font-medium text-blue-400 hover:text-blue-300"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        ) : !conversation ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-700 bg-slate-950/30 px-5 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-slate-500">
              <Inbox size={22} />
            </div>

            <p className="mt-3 font-medium text-slate-300">
              Nenhuma conversa vinculada
            </p>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Ainda não foi encontrada uma conversa associada a este lead.
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/30 px-5 py-7 text-center">
            <MessageCircle size={22} className="mx-auto text-slate-500" />

            <p className="mt-3 text-sm text-slate-300">
              Conversa encontrada, mas sem mensagens disponíveis.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {latestMessage && (
              <div className="mb-5 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                    Última mensagem
                  </span>

                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock3 size={13} />
                    {formatDateTime(getMessageDate(latestMessage))}
                  </span>
                </div>

                <div className="mt-3 flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                      isOutgoing(latestMessage)
                        ? 'bg-blue-500/10 text-blue-400'
                        : 'bg-emerald-500/10 text-emerald-400'
                    }`}
                  >
                    {isOutgoing(latestMessage) ? (
                      <ArrowUpRight size={17} />
                    ) : (
                      <ArrowDownLeft size={17} />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-400">
                      {isOutgoing(latestMessage)
                        ? 'Mensagem enviada'
                        : 'Mensagem recebida'}
                      {getSenderName(latestMessage)
                        ? ` · ${getSenderName(latestMessage)}`
                        : ''}
                    </p>

                    <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-white">
                      {getMessageText(latestMessage) ||
                        'Mensagem sem texto ou conteúdo não disponível.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Mensagens anteriores
              </p>

              <span className="text-xs text-slate-600">
                {messages.length}{' '}
                {messages.length === 1 ? 'mensagem' : 'mensagens'}
              </span>
            </div>

            {messages
              .slice(0, -1)
              .reverse()
              .map((message, index) => (
                <div
                  key={
                    message._id ||
                    message.id ||
                    `${getTimestamp(message)}-${index}`
                  }
                  className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 transition hover:border-slate-700"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isOutgoing(message) ? (
                        <ArrowUpRight size={15} className="text-blue-400" />
                      ) : (
                        <ArrowDownLeft size={15} className="text-emerald-400" />
                      )}

                      <span className="text-xs font-medium text-slate-400">
                        {isOutgoing(message) ? 'Enviada' : 'Recebida'}
                      </span>
                    </div>

                    <span className="text-xs text-slate-500">
                      {formatDateTime(getMessageDate(message))}
                    </span>
                  </div>

                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-300">
                    {getMessageText(message) ||
                      'Mensagem sem texto ou conteúdo não disponível.'}
                  </p>
                </div>
              ))}

            <button
              type="button"
              onClick={handleOpenConversation}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              <MessageCircle size={17} />
              Abrir conversa completa
              <ExternalLink size={15} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

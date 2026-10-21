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
  CheckCheck,
  UserRound,
  Building2,
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
  if (typeof value === 'object') return String(value._id || value.id || '');
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
  if (Number.isNaN(date.getTime())) return 'Data não informada';

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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

function MessageDirection({ outgoing, compact = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${
        outgoing
          ? 'border-blue-400/20 bg-blue-400/10 text-blue-300'
          : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
      } ${compact ? '' : 'sm:text-[11px]'}`}
    >
      {outgoing ? <ArrowUpRight size={13} /> : <ArrowDownLeft size={13} />}
      {outgoing ? 'Corretor → Lead' : 'Lead → Corretor'}
    </span>
  );
}

function MessageCard({ message, featured = false }) {
  const outgoing = isOutgoing(message);
  const messageText = getMessageText(message);
  const date = formatDateTime(getMessageDate(message));

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border transition duration-200 ${
        outgoing
          ? 'border-blue-400/20 bg-gradient-to-br from-blue-500/[0.10] via-slate-950/70 to-indigo-500/[0.06] hover:border-blue-400/35'
          : 'border-emerald-400/20 bg-gradient-to-br from-emerald-500/[0.08] via-slate-950/70 to-teal-500/[0.04] hover:border-emerald-400/35'
      } ${featured ? 'p-5 sm:p-6' : 'p-4'}`}
    >
      <div
        className={`absolute inset-y-0 left-0 w-1 ${
          outgoing
            ? 'bg-gradient-to-b from-blue-400 to-indigo-500'
            : 'bg-gradient-to-b from-emerald-400 to-teal-500'
        }`}
      />

      <div className="pl-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                outgoing
                  ? 'border-blue-400/20 bg-blue-400/10 text-blue-300'
                  : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
              }`}
            >
              {outgoing ? <Building2 size={18} /> : <UserRound size={18} />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">
                {outgoing
                  ? 'Mensagem enviada pelo corretor'
                  : 'Mensagem recebida do lead'}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {outgoing
                  ? 'O lead recebeu esta mensagem'
                  : 'O corretor recebeu esta resposta'}
              </p>
            </div>
          </div>
          <MessageDirection outgoing={outgoing} />
        </div>

        <div
          className={`mt-4 rounded-xl border px-4 py-3 ${
            outgoing
              ? 'border-blue-400/10 bg-blue-950/30'
              : 'border-emerald-400/10 bg-emerald-950/20'
          }`}
        >
          <p
            className={`whitespace-pre-wrap break-words text-sm leading-7 ${
              featured ? 'text-slate-100' : 'text-slate-300'
            }`}
          >
            {messageText || 'Mensagem sem texto ou conteúdo não disponível.'}
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <Clock3 size={13} />
            {date}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-600">
            <CheckCheck size={13} />
            Histórico da conversa
          </span>
        </div>
      </div>
    </article>
  );
}

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
        if (manualRefresh) setRefreshing(true);
        else setLoading(true);

        setError('');

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

  const latestMessage = useMemo(
    () => (messages.length ? messages[messages.length - 1] : null),
    [messages],
  );

  const stats = useMemo(() => {
    const outgoing = messages.filter(isOutgoing).length;
    return {
      total: messages.length,
      outgoing,
      incoming: messages.length - outgoing,
    };
  }, [messages]);

  const handleOpenConversation = async () => {
    try {
      if (typeof openLeadConversation === 'function') {
        await openLeadConversation(leadId);
        navigate('/chat');
      } else if (conversation?._id) {
        navigate('/chat', { state: { conversationId: conversation._id } });
      }
    } catch (err) {
      console.error('Erro ao abrir conversa:', err);
      if (conversation?._id) {
        navigate('/chat', { state: { conversationId: conversation._id } });
      }
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-800/90 bg-[#080F1D] text-slate-100 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-blue-500/[0.07] blur-3xl" />

      <header className="relative flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/90 px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-400/20 bg-gradient-to-br from-blue-500/15 to-indigo-500/10 text-blue-300 shadow-lg shadow-blue-950/20">
            <MessageSquare size={20} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold tracking-tight text-white">
                Histórico de mensagens
              </h2>
              <span className="rounded-full border border-slate-700 bg-slate-800/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                WhatsApp
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Comunicação entre corretor e lead
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => loadMessages(true)}
          disabled={loading || refreshing}
          title="Atualizar mensagens"
          aria-label="Atualizar mensagens"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-700/90 bg-slate-900/80 px-3 text-xs font-semibold text-slate-300 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Atualizar</span>
        </button>
      </header>

      <div className="relative p-5 sm:p-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/70"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.06] p-5">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0 text-rose-300"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-rose-200">
                  Não foi possível carregar o histórico
                </p>
                <p className="mt-1 break-words text-xs leading-5 text-slate-400">
                  {error}
                </p>
                <button
                  type="button"
                  onClick={() => loadMessages(true)}
                  className="mt-3 rounded-lg text-sm font-semibold text-blue-300 transition hover:text-blue-200"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        ) : !conversation ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 px-5 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 text-slate-500">
              <Inbox size={24} />
            </div>
            <p className="mt-4 font-semibold text-slate-200">
              Nenhuma conversa vinculada
            </p>
            <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
              Ainda não encontramos uma conversa associada a este lead.
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 px-5 py-9 text-center">
            <MessageCircle size={24} className="mx-auto text-slate-500" />
            <p className="mt-3 text-sm font-medium text-slate-300">
              Conversa encontrada, mas sem mensagens disponíveis.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {latestMessage && (
              <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">
                      Atividade mais recente
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      A última interação registrada neste lead
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900 px-2.5 py-1 text-[10px] font-semibold text-slate-400">
                    <Clock3 size={12} />
                    Mais recente
                  </span>
                </div>
                <MessageCard message={latestMessage} featured />
              </div>
            )}

            <div className="rounded-2xl border border-slate-800 bg-slate-950/35 p-4">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">
                    Resumo da conversa
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Até 5 mensagens mais recentes
                  </p>
                </div>
                <span className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-300">
                  {stats.total} {stats.total === 1 ? 'mensagem' : 'mensagens'}
                </span>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-blue-400/15 bg-blue-500/[0.06] p-3">
                  <div className="flex items-center gap-2 text-blue-300">
                    <ArrowUpRight size={15} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Corretor → Lead
                    </span>
                  </div>
                  <p className="mt-2 text-xl font-bold text-white">
                    {stats.outgoing}
                  </p>
                  <p className="text-[11px] text-slate-500">Enviadas ao lead</p>
                </div>
                <div className="rounded-xl border border-emerald-400/15 bg-emerald-500/[0.05] p-3">
                  <div className="flex items-center gap-2 text-emerald-300">
                    <ArrowDownLeft size={15} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Lead → Corretor
                    </span>
                  </div>
                  <p className="mt-2 text-xl font-bold text-white">
                    {stats.incoming}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Respostas recebidas
                  </p>
                </div>
              </div>

              {messages
                .slice(0, -1)
                .reverse()
                .map((message, index) => (
                  <div
                    className="mb-3 last:mb-0"
                    key={
                      message._id ||
                      message.id ||
                      `${getTimestamp(message)}-${index}`
                    }
                  >
                    <MessageCard message={message} />
                  </div>
                ))}
            </div>

            <button
              type="button"
              onClick={handleOpenConversation}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition hover:-translate-y-0.5 hover:from-blue-500 hover:to-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080F1D]"
            >
              <MessageCircle size={17} />
              Abrir conversa completa
              <ExternalLink
                size={15}
                className="transition group-hover:translate-x-0.5"
              />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

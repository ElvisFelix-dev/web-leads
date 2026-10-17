import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
  BellRing,
  Check,
  CheckCheck,
  Clock3,
  FileCheck2,
  RefreshCw,
  Trash2,
  Users,
  Wallet,
  CalendarClock,
  ArrowUpRight,
  Inbox,
  AlertCircle,
  Sparkles,
  Zap,
  Layers,
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../service/api';
import { useNotifications } from '../context/NotificationContext';

const FILTERS = [
  { value: 'all', label: 'Todas', icon: Layers },
  { value: 'unread', label: 'Não lidas', icon: BellRing },
];

const getNotificationIcon = (type = '') => {
  const normalized = String(type).toLowerCase();

  if (normalized.includes('lead')) return Users;
  if (normalized.includes('proposal')) return FileCheck2;
  if (normalized.includes('sale')) return CheckCheck;
  if (normalized.includes('commission')) return Wallet;
  if (
    normalized.includes('visit') ||
    normalized.includes('task') ||
    normalized.includes('reminder')
  )
    return CalendarClock;
  return Bell;
};

const getTypeAccent = (type = '') => {
  const n = String(type).toLowerCase();
  if (n.includes('lead'))
    return 'from-blue-500/20 to-cyan-500/5 text-blue-300 border-blue-400/25';
  if (n.includes('proposal'))
    return 'from-violet-500/20 to-fuchsia-500/5 text-violet-300 border-violet-400/25';
  if (n.includes('sale'))
    return 'from-emerald-500/20 to-teal-500/5 text-emerald-300 border-emerald-400/25';
  if (n.includes('commission'))
    return 'from-amber-500/20 to-orange-500/5 text-amber-300 border-amber-400/25';
  if (n.includes('visit') || n.includes('task') || n.includes('reminder'))
    return 'from-pink-500/20 to-rose-500/5 text-pink-300 border-pink-400/25';
  return 'from-slate-500/20 to-slate-500/5 text-slate-300 border-slate-400/25';
};

const formatDate = (value) => {
  if (!value) return 'Agora';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Agora';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const normalizeNotificationLink = (link) => {
  if (!link || typeof link !== 'string') {
    return '/dashboard';
  }

  const leadMatch = link.match(/^\/leads\/([^/?#]+)\/?$/);

  if (leadMatch) {
    return `/lead-detail/${leadMatch[1]}`;
  }

  return link;
};

export default function NotificationCenter() {
  const navigate = useNavigate();
  const { unreadCount, latestNotification, refreshUnreadCount } =
    useNotifications();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate('/dashboard');
  };

  const [filter, setFilter] = useState('all');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const loadNotifications = useCallback(
    async ({ page = 1, showSpinner = true } = {}) => {
      if (showSpinner) setLoading(true);
      else setRefreshing(true);

      try {
        const response = await api.get('/api/notifications', {
          params: {
            page,
            limit: 20,
            unreadOnly: filter === 'unread' ? 'true' : 'false',
          },
        });

        const data = response?.data?.data || {};
        setItems(Array.isArray(data.items) ? data.items : []);
        setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
        await refreshUnreadCount();
      } catch (error) {
        console.error(
          '[NotificationCenter] Erro ao carregar notificações:',
          error,
        );
        toast.error(
          error?.response?.data?.message ||
            'Não foi possível carregar suas notificações.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filter, refreshUnreadCount],
  );

  useEffect(() => {
    loadNotifications({ page: 1 });
  }, [loadNotifications]);

  useEffect(() => {
    if (!latestNotification) return;
    loadNotifications({ page: 1, showSpinner: false });
  }, [latestNotification?._receivedAt, loadNotifications]);

  const markAsRead = useCallback(
    async (notification) => {
      if (!notification?._id || notification.isRead) return;

      try {
        const response = await api.patch(
          `/api/notifications/${notification._id}/read`,
        );
        const updated = response?.data?.data;
        setItems((previous) =>
          previous.map((item) =>
            item._id === notification._id
              ? { ...item, ...(updated || {}), isRead: true }
              : item,
          ),
        );
        await refreshUnreadCount();
      } catch (error) {
        console.error('[NotificationCenter] Erro ao marcar como lida:', error);
        toast.error('Não foi possível atualizar esta notificação.');
      }
    },
    [refreshUnreadCount],
  );

  const handleOpen = async (notification) => {
    await markAsRead(notification);
    const target = normalizeNotificationLink(notification?.link);
    navigate(target);
  };

  const markAllAsRead = async () => {
    if (!unreadCount) return;

    try {
      await api.patch('/api/notifications/read-all');
      setItems((previous) =>
        previous.map((item) => ({ ...item, isRead: true })),
      );
      await refreshUnreadCount();
      toast.success('Todas as notificações foram marcadas como lidas.');
    } catch (error) {
      console.error(
        '[NotificationCenter] Erro ao marcar todas como lidas:',
        error,
      );
      toast.error('Não foi possível marcar todas como lidas.');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/api/notifications/${notificationId}`);
      setItems((previous) =>
        previous.filter((item) => item._id !== notificationId),
      );
      await refreshUnreadCount();
    } catch (error) {
      console.error('[NotificationCenter] Erro ao excluir notificação:', error);
      toast.error('Não foi possível excluir a notificação.');
    }
  };

  const pageButtons = useMemo(() => {
    if (pagination.pages <= 1) return null;
    return (
      <div className="flex items-center justify-between border-t border-white/[0.06] bg-black/20 px-5 py-4">
        <p className="text-xs font-medium tracking-wide text-gray-500">
          Página <span className="text-gray-300">{pagination.page}</span> de{' '}
          <span className="text-gray-300">{pagination.pages}</span>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={pagination.page <= 1 || loading}
            onClick={() => loadNotifications({ page: pagination.page - 1 })}
            className="rounded-lg border border-white/10 bg-white/[0.02] px-3.5 py-2 text-sm text-gray-300 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            Anterior
          </button>
          <button
            type="button"
            disabled={pagination.page >= pagination.pages || loading}
            onClick={() => loadNotifications({ page: pagination.page + 1 })}
            className="rounded-lg border border-white/10 bg-white/[0.02] px-3.5 py-2 text-sm text-gray-300 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            Próxima
          </button>
        </div>
      </div>
    );
  }, [pagination, loading, loadNotifications]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#080a0f] px-4 py-6 text-white sm:px-6 lg:px-8">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute -bottom-40 right-1/4 h-96 w-96 rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_40%,rgba(0,0,0,0.4))]" />
      </div>

      <div className="relative mx-auto max-w-5xl space-y-6">
        {/* HEADER */}
        <header className="overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.04] to-white/[0.01] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3 sm:px-5">
            <button
              type="button"
              onClick={handleBack}
              className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm font-medium text-gray-300 transition-all hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <ArrowLeft
                size={16}
                className="transition-transform group-hover:-translate-x-0.5"
              />
              Voltar
            </button>

            <div className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.9)]" />
              </span>
              Leads Na Mão
              <span className="text-gray-700">/</span>
              <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                Notificações
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-5 p-5 sm:p-7 lg:flex-row lg:items-end">
            <div className="min-w-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/25 bg-gradient-to-r from-blue-500/15 to-cyan-500/10 px-3 py-1.5 text-xs font-medium text-blue-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <Sparkles size={13} className="text-blue-300" />
                Central de notificações
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[28px]">
                Acompanhe o que precisa da sua atenção
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
                Leads, propostas, vendas, comissões e compromissos — todos
                sincronizados em tempo real.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  loadNotifications({
                    page: pagination.page,
                    showSpinner: false,
                  })
                }
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-gray-300 transition-all hover:border-white/20 hover:bg-white/[0.07] hover:text-white disabled:opacity-50"
              >
                <RefreshCw
                  size={15}
                  className={refreshing ? 'animate-spin' : ''}
                />
                Atualizar
              </button>
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={!unreadCount}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(59,130,246,0.6)] transition-all hover:from-blue-500 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
              >
                <span className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.2),transparent)] opacity-0 transition-opacity group-hover:opacity-100" />
                <CheckCheck size={15} />
                Marcar todas como lidas
              </button>
            </div>
          </div>
        </header>

        {/* STATS */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="group relative overflow-hidden rounded-2xl border border-blue-400/15 bg-gradient-to-br from-blue-500/[0.08] via-blue-500/[0.03] to-transparent p-5 transition-all hover:border-blue-400/25">
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-500/20 blur-2xl transition-opacity group-hover:opacity-100 opacity-60" />
            <div className="relative flex items-center justify-between">
              <span className="text-sm font-medium text-gray-400">
                Não lidas
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-400/20 bg-blue-500/10 text-blue-300">
                <BellRing size={16} />
              </div>
            </div>
            <p className="relative mt-3 bg-gradient-to-br from-white to-blue-100 bg-clip-text text-3xl font-bold tabular-nums text-transparent">
              {unreadCount}
            </p>
            <p className="relative mt-1 text-xs text-gray-500">
              Precisam da sua atenção
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 transition-all hover:border-white/[0.14] hover:bg-white/[0.03]">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-400">
                No histórico
              </span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-gray-400">
                <Inbox size={16} />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold tabular-nums text-white">
              {pagination.total}
            </p>
            <p className="mt-1 text-xs text-gray-500">Nesta visualização</p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-emerald-400/15 bg-gradient-to-br from-emerald-500/[0.06] to-transparent p-5 transition-all hover:border-emerald-400/25">
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-emerald-500/20 blur-2xl opacity-60" />
            <div className="relative flex items-center justify-between">
              <span className="text-sm font-medium text-gray-400">Entrega</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-500/10 text-emerald-300">
                <Zap size={16} />
              </div>
            </div>
            <p className="relative mt-3 flex items-center gap-2 text-xl font-bold text-white">
              Tempo real
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
            </p>
            <p className="relative mt-1 text-xs text-gray-500">
              Push via socket + persistência
            </p>
          </div>
        </div>

        {/* LISTA */}
        <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-b from-white/[0.03] to-white/[0.01] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.6)] backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-4 sm:px-5">
            <div className="inline-flex items-center gap-1 rounded-xl border border-white/[0.06] bg-black/30 p-1">
              {FILTERS.map((item) => {
                const Icon = item.icon;
                const active = filter === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setFilter(item.value)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                      active
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_4px_14px_-4px_rgba(59,130,246,0.7)]'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Icon size={14} />
                    {item.label}
                  </button>
                );
              })}
            </div>
            <span className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1 text-[11px] font-medium tracking-wide text-gray-500">
              {pagination.total} registro(s)
            </span>
          </div>

          {loading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="relative h-24 overflow-hidden rounded-xl border border-white/[0.04] bg-white/[0.02]"
                >
                  <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-20 text-center">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02]">
                <div className="absolute inset-0 rounded-2xl bg-blue-500/10 blur-xl" />
                {filter === 'unread' ? (
                  <Check size={26} className="relative text-emerald-300" />
                ) : (
                  <Bell size={26} className="relative text-gray-500" />
                )}
              </div>
              <h2 className="mt-5 text-base font-semibold text-white">
                {filter === 'unread'
                  ? 'Tudo em dia por aqui'
                  : 'Nenhuma notificação ainda'}
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                {filter === 'unread'
                  ? 'Você não tem notificações pendentes de leitura.'
                  : 'Quando houver atualizações importantes no CRM, elas aparecerão nesta central.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {items.map((notification, index) => {
                const Icon = getNotificationIcon(notification.type);
                const unread = !notification.isRead;
                const highPriority = ['high', 'urgent'].includes(
                  notification.priority,
                );
                const accent = getTypeAccent(notification.type);

                return (
                  <article
                    key={notification._id}
                    style={{ animationDelay: `${index * 40}ms` }}
                    className={`group relative flex gap-3 px-4 py-4 transition-colors sm:gap-4 sm:px-5 animate-[fadeIn_0.4s_ease-out_both] ${
                      unread ? 'bg-blue-500/[0.03]' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    {unread && (
                      <span className="absolute left-0 top-1/2 h-8 w-0.5 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-blue-400 to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                    )}

                    <div
                      className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br ${accent}`}
                    >
                      <Icon size={19} />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpen(notification)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <h3
                          className={`text-sm ${unread ? 'font-semibold text-white' : 'font-medium text-gray-300'}`}
                        >
                          {notification.title || 'Notificação'}
                        </h3>
                        {unread && (
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-400" />
                          </span>
                        )}
                        {highPriority && (
                          <span className="rounded-md border border-amber-400/25 bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                            Prioridade
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 text-sm leading-6 text-gray-400">
                        {notification.message}
                      </p>
                      <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock3 size={12} />
                        {formatDate(notification.createdAt)}
                        <span className="mx-1 text-gray-700">·</span>
                        <span className="capitalize">
                          {String(notification.type || 'aviso').replace(
                            /[_-]/g,
                            ' ',
                          )}
                        </span>
                      </span>
                    </button>

                    <div className="flex shrink-0 items-start gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                      {unread && (
                        <button
                          type="button"
                          title="Marcar como lida"
                          onClick={() => markAsRead(notification)}
                          className="rounded-lg border border-transparent p-2 text-gray-500 transition-all hover:border-blue-400/20 hover:bg-blue-500/10 hover:text-blue-300"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        type="button"
                        title="Excluir notificação"
                        onClick={() => deleteNotification(notification._id)}
                        className="rounded-lg border border-transparent p-2 text-gray-500 transition-all hover:border-red-400/20 hover:bg-red-500/10 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        type="button"
                        title="Abrir"
                        onClick={() => handleOpen(notification)}
                        className="hidden rounded-lg border border-transparent p-2 text-gray-500 transition-all hover:border-white/10 hover:bg-white/[0.06] hover:text-white sm:block"
                      >
                        <ArrowUpRight size={16} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {pageButtons}
        </section>

        {/* FOOTER INFO */}
        <div className="relative overflow-hidden rounded-xl border border-blue-500/15 bg-gradient-to-r from-blue-500/[0.06] via-blue-500/[0.03] to-transparent p-4">
          <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-blue-500/20 blur-2xl" />
          <div className="relative flex items-start gap-3 text-sm text-gray-400">
            <AlertCircle size={17} className="mt-0.5 shrink-0 text-blue-300" />
            <p className="leading-6">
              As notificações exibidas dependem do seu perfil e das permissões
              configuradas no CRM. Os avisos de navegador também exigem que você
              tenha autorizado as notificações neste dispositivo.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

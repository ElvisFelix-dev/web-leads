import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Bell,
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
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../service/api';
import { useNotifications } from '../context/NotificationContext';

const FILTERS = [
  { value: 'all', label: 'Todas' },
  { value: 'unread', label: 'Não lidas' },
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

  // Corrige links antigos de detalhes do lead.
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
    // Se a página foi aberta diretamente, evita voltar para fora do CRM.
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
      <div className="flex items-center justify-between border-t border-white/10 px-5 py-4">
        <p className="text-xs text-gray-500">
          Página {pagination.page} de {pagination.pages}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={pagination.page <= 1 || loading}
            onClick={() => loadNotifications({ page: pagination.page - 1 })}
            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            type="button"
            disabled={pagination.page >= pagination.pages || loading}
            onClick={() => loadNotifications({ page: pagination.page + 1 })}
            className="rounded-lg border border-white/10 px-3 py-2 text-sm text-gray-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      </div>
    );
  }, [pagination, loading, loadNotifications]);

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="overflow-hidden rounded-2xl border border-white/[0.08] bg-gray-900/70 shadow-xl shadow-black/10">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-3 sm:px-5">
            <button
              type="button"
              onClick={handleBack}
              className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm font-medium text-gray-300 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              aria-label="Voltar para a página anterior"
            >
              <ArrowLeft
                size={16}
                className="transition-transform group-hover:-translate-x-0.5"
              />
              Voltar
            </button>

            <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-gray-500">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.65)]" />
              Leads Na Mão
              <span className="text-gray-700">/</span>
              <span className="text-blue-300">Notificações</span>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-5 p-5 sm:p-6 lg:flex-row lg:items-end">
            <div className="min-w-0">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300">
                <Bell size={14} />
                Central de notificações
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Acompanhe o que precisa da sua atenção
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400">
                Leads, propostas, vendas, comissões e compromissos em um só
                lugar.
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
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm text-gray-300 transition hover:bg-white/[0.07] disabled:opacity-50"
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
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CheckCheck size={15} />
                Marcar todas como lidas
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-blue-500/10 to-transparent p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Não lidas</span>
              <Bell size={17} className="text-blue-300" />
            </div>
            <p className="mt-3 text-3xl font-bold tabular-nums">
              {unreadCount}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Precisam da sua atenção
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">No histórico</span>
              <Inbox size={17} className="text-gray-400" />
            </div>
            <p className="mt-3 text-3xl font-bold tabular-nums">
              {pagination.total}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Notificações nesta visualização
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Entrega</span>
              <Clock3 size={17} className="text-gray-400" />
            </div>
            <p className="mt-3 text-xl font-bold">Em tempo real</p>
            <p className="mt-1 text-xs text-gray-500">
              Com atualização pelo CRM e push
            </p>
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-gray-900/70 shadow-2xl shadow-black/10">
          <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-4 sm:px-5">
            <div className="flex items-center gap-1 rounded-xl bg-black/20 p-1">
              {FILTERS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    filter === item.value
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <span className="text-xs text-gray-500">
              {pagination.total} registro(s)
            </span>
          </div>

          {loading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-24 animate-pulse rounded-xl bg-white/[0.04]"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                {filter === 'unread' ? (
                  <Check size={24} className="text-emerald-300" />
                ) : (
                  <Bell size={24} className="text-gray-500" />
                )}
              </div>
              <h2 className="mt-4 text-base font-semibold">
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
            <div className="divide-y divide-white/[0.06]">
              {items.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const unread = !notification.isRead;
                const highPriority = ['high', 'urgent'].includes(
                  notification.priority,
                );

                return (
                  <article
                    key={notification._id}
                    className={`group flex gap-3 px-4 py-4 transition sm:gap-4 sm:px-5 ${
                      unread ? 'bg-blue-500/[0.035]' : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <div
                      className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                        unread
                          ? 'border-blue-400/20 bg-blue-500/10 text-blue-300'
                          : 'border-white/[0.08] bg-white/[0.03] text-gray-400'
                      }`}
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
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                        )}
                        {highPriority && (
                          <span className="rounded-md border border-amber-400/20 bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-300">
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
                        <span className="mx-1">·</span>
                        <span className="capitalize">
                          {String(notification.type || 'aviso').replace(
                            /[_-]/g,
                            ' ',
                          )}
                        </span>
                      </span>
                    </button>

                    <div className="flex shrink-0 items-start gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                      {unread && (
                        <button
                          type="button"
                          title="Marcar como lida"
                          onClick={() => markAsRead(notification)}
                          className="rounded-lg p-2 text-gray-500 transition hover:bg-white/[0.06] hover:text-blue-300"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        type="button"
                        title="Excluir notificação"
                        onClick={() => deleteNotification(notification._id)}
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-red-500/10 hover:text-red-300"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        type="button"
                        title="Abrir"
                        onClick={() => handleOpen(notification)}
                        className="hidden rounded-lg p-2 text-gray-500 transition hover:bg-white/[0.06] hover:text-white sm:block"
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

        <div className="flex items-start gap-3 rounded-xl border border-blue-500/15 bg-blue-500/[0.045] p-4 text-sm text-gray-400">
          <AlertCircle size={17} className="mt-0.5 shrink-0 text-blue-300" />
          <p className="leading-6">
            As notificações exibidas dependem do seu perfil e das permissões
            configuradas no CRM. Os avisos de navegador também exigem que você
            tenha autorizado as notificações neste dispositivo.
          </p>
        </div>
      </div>
    </div>
  );
}

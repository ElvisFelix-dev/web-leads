import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';

import {
  AlertCircle,
  BarChart3,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  DollarSign,
  Edit3,
  Eye,
  FileText,
  Filter,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Send,
  TrendingUp,
  User,
  X,
  XCircle,
  Zap,
} from 'lucide-react';

import api from '../service/api';
import { approveProposal } from '../service/orchestratorService';

/* ==========================================================================
   CONFIGURAÇÕES
========================================================================== */

const STATUS_CONFIG = {
  draft: {
    label: 'Rascunho',
    className: 'border-slate-500/20 bg-slate-500/10 text-slate-300',
  },
  pending: {
    label: 'Pendente',
    className: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
  },
  accepted: {
    label: 'Aceita',
    className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
  },
  rejected: {
    label: 'Rejeitada',
    className: 'border-red-500/20 bg-red-500/10 text-red-300',
  },
  cancelled: {
    label: 'Cancelada',
    className: 'border-slate-500/20 bg-slate-500/10 text-slate-400',
  },
  expired: {
    label: 'Expirada',
    className: 'border-orange-500/20 bg-orange-500/10 text-orange-300',
  },
};

const SORT_OPTIONS = [
  { value: '-createdAt', label: 'Mais recentes' },
  { value: 'createdAt', label: 'Mais antigas' },
  { value: '-updatedAt', label: 'Atualizadas recentemente' },
  { value: '-submittedAt', label: 'Enviadas recentemente' },
  { value: '-approvedAt', label: 'Aprovadas recentemente' },
];

/* ==========================================================================
   HELPERS
========================================================================== */

function getId(value) {
  if (!value) return '';

  if (typeof value === 'string') return value;

  return value._id || value.id || '';
}

function getName(value, fallback = '-') {
  if (!value) return fallback;

  if (typeof value === 'string') return value;

  return value.name || value.fullName || value.title || value.email || fallback;
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  let normalized = String(value).replace(/\s/g, '');

  if (normalized.includes(',')) {
    normalized = normalized.replace(/\./g, '').replace(',', '.');
  }

  const number = Number(normalized);

  return Number.isFinite(number) ? number : 0;
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(toNumber(value));
}

function formatNumber(value) {
  return new Intl.NumberFormat('pt-BR').format(toNumber(value));
}

function formatPercent(value) {
  return `${toNumber(value).toFixed(2)}%`;
}

function formatDate(value) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function formatDateTime(value) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/* ==========================================================================
   FOTOS: CORRETOR E IMÓVEL
========================================================================== */

function getImageUrl(value) {
  if (!value) return '';

  if (typeof value === 'string') return value;

  if (Array.isArray(value)) {
    const cover = value.find((item) => item?.isCover);

    return getImageUrl(cover || value[0]);
  }

  if (typeof value !== 'object') return '';

  return (
    value.url ||
    value.secure_url ||
    value.avatarUrl ||
    value.profileImage ||
    value.photoURL ||
    value.photoUrl ||
    value.imageUrl ||
    value.src ||
    ''
  );
}

function getBrokerAvatar(broker) {
  if (!broker || typeof broker !== 'object') return '';

  return (
    getImageUrl(broker.avatar) ||
    getImageUrl(broker.avatarUrl) ||
    getImageUrl(broker.profileImage) ||
    getImageUrl(broker.photoURL) ||
    getImageUrl(broker.photoUrl) ||
    getImageUrl(broker.imageUrl) ||
    getImageUrl(broker.image) ||
    getImageUrl(broker.photo) ||
    getImageUrl(broker.picture) ||
    getImageUrl(broker.profile?.avatar) ||
    ''
  );
}

function getPropertyThumbnail(property) {
  if (!property || typeof property !== 'object') return '';

  const cover = getImageUrl(property.coverImage);

  if (cover) return cover;

  const images = Array.isArray(property.images) ? property.images : [];

  const coverImage = images.find((image) => image?.isCover);

  return (
    getImageUrl(coverImage) ||
    getImageUrl(images[0]) ||
    getImageUrl(property.image) ||
    getImageUrl(property.thumbnail) ||
    ''
  );
}

/* ==========================================================================
   NORMALIZAÇÃO DAS RESPOSTAS
========================================================================== */

function normalizeListResponse(response) {
  const data = response?.data;
  const payload = data?.data || data?.result || data;

  const proposals =
    payload?.proposals ||
    payload?.data ||
    payload?.results ||
    (Array.isArray(payload) ? payload : []);

  const pagination = payload?.pagination || data?.pagination || {};

  return {
    proposals: Array.isArray(proposals) ? proposals : [],
    pagination: {
      page: Number(pagination.page) || 1,
      limit: Number(pagination.limit) || 20,
      total: Number(pagination.total) || 0,
      pages: Number(pagination.pages) || 0,
      hasNextPage: Boolean(pagination.hasNextPage),
      hasPreviousPage: Boolean(pagination.hasPreviousPage),
    },
  };
}

function normalizeMetricsResponse(response) {
  const data = response?.data;
  const metrics = data?.data || data?.result || data || {};

  return {
    summary: {
      total: toNumber(metrics?.summary?.total),
      draft: toNumber(metrics?.summary?.draft),
      pending: toNumber(metrics?.summary?.pending),
      accepted: toNumber(metrics?.summary?.accepted),
      rejected: toNumber(metrics?.summary?.rejected),
      cancelled: toNumber(metrics?.summary?.cancelled),
      expired: toNumber(metrics?.summary?.expired),
    },
    values: {
      totalProposalValue: toNumber(metrics?.values?.totalProposalValue),
      averageProposalValue: toNumber(metrics?.values?.averageProposalValue),
      totalPropertyValue: toNumber(metrics?.values?.totalPropertyValue),
      acceptedProposalValue: toNumber(metrics?.values?.acceptedProposalValue),
      approvalRate: toNumber(metrics?.values?.approvalRate),
      conversionRate: toNumber(metrics?.values?.conversionRate),
    },
    statusValues: metrics?.statusValues || {},
    byBroker: Array.isArray(metrics?.byBroker) ? metrics.byBroker : [],
    byProperty: Array.isArray(metrics?.byProperty) ? metrics.byProperty : [],
    daily: Array.isArray(metrics?.daily) ? metrics.daily : [],
  };
}

/* ==========================================================================
   COMPONENTE PRINCIPAL
========================================================================== */

export default function Proposals() {
  const navigate = useNavigate();

  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [metrics, setMetrics] = useState(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [showFilters, setShowFilters] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [actionLoading, setActionLoading] = useState(null);
  const [actionError, setActionError] = useState('');

  const [modal, setModal] = useState({
    isOpen: false,
    type: '',
    proposal: null,
    isLoading: false,
  });

  /* ------------------------------------------------------------------------
     CARREGAR PROPOSTAS
  ------------------------------------------------------------------------ */

  const loadProposals = useCallback(
    async ({ silent = false, requestedPage = page } = {}) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError('');

        const params = {
          page: requestedPage,
          limit,
          sort,
        };

        if (search.trim()) params.search = search.trim();
        if (status) params.status = status;
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;

        const response = await api.get('/api/proposals', { params });
        const result = normalizeListResponse(response);

        setProposals(result.proposals);
        setPagination(result.pagination);
      } catch (err) {
        console.error('Erro ao carregar propostas:', err);

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            'Não foi possível carregar as propostas.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, limit, sort, search, status, startDate, endDate],
  );

  /* ------------------------------------------------------------------------
     CARREGAR MÉTRICAS
  ------------------------------------------------------------------------ */

  const loadMetrics = useCallback(async () => {
    try {
      setLoadingMetrics(true);

      const params = {};

      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get('/api/proposals/metrics', { params });

      setMetrics(normalizeMetricsResponse(response));
    } catch (err) {
      console.error('Erro ao carregar métricas:', err);
      setMetrics(null);
    } finally {
      setLoadingMetrics(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadProposals();
  }, [loadProposals]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  /* ------------------------------------------------------------------------
     MODAIS
  ------------------------------------------------------------------------ */

  const openModal = (type, proposal) => {
    setActionError('');

    setModal({
      isOpen: true,
      type,
      proposal,
      isLoading: false,
    });
  };

  const closeModal = () => {
    setModal((previous) => {
      if (previous.isLoading) return previous;

      return {
        isOpen: false,
        type: '',
        proposal: null,
        isLoading: false,
      };
    });
  };

  /* ------------------------------------------------------------------------
     EXECUTAR AÇÕES
  ------------------------------------------------------------------------ */

  const executeAction = async (proposal, action, customComment = '') => {
    const proposalId = getId(proposal);

    if (!proposalId) return;

    const loadingKey = `${action}-${proposalId}`;

    try {
      setActionLoading(loadingKey);
      setModal((previous) => ({ ...previous, isLoading: true }));
      setActionError('');
      setSuccessMessage('');

      let response;

      if (action === 'approve') {
        response = await approveProposal(proposalId, customComment);
      } else if (action === 'reject') {
        await api.patch(`/api/proposals/${proposalId}/reject`, {
          comment: customComment,
        });
      } else if (action === 'cancel') {
        await api.patch(`/api/proposals/${proposalId}/cancel`, {
          comment: customComment,
        });
      }

      await Promise.all([
        loadProposals({ silent: true, requestedPage: page }),
        loadMetrics(),
      ]);

      let message =
        action === 'approve'
          ? 'Proposta aprovada com sucesso!'
          : action === 'reject'
            ? 'Proposta rejeitada com sucesso.'
            : 'Proposta cancelada com sucesso.';

      if (action === 'approve' && response?.data) {
        const { sale, commission } = response.data;

        if (sale?.saleNumber) {
          message += ` Venda ${sale.saleNumber} criada.`;
        }

        if (commission?.totalAmount) {
          message += ` Comissão de ${formatCurrency(
            commission.totalAmount,
          )} gerada.`;
        }
      }

      setSuccessMessage(message);

      setModal({
        isOpen: false,
        type: '',
        proposal: null,
        isLoading: false,
      });
    } catch (err) {
      console.error(`Erro ao executar ação ${action}:`, err);

      setActionError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Não foi possível executar esta ação.',
      );

      setModal((previous) => ({
        ...previous,
        isLoading: false,
      }));
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = (proposal) => openModal('approve', proposal);
  const handleReject = (proposal) => openModal('reject', proposal);
  const handleCancel = (proposal) => openModal('cancel', proposal);

  const handleModalConfirm = (comment) => {
    const { proposal, type } = modal;

    if (proposal) {
      executeAction(proposal, type, comment);
    }
  };

  /* ------------------------------------------------------------------------
     FILTROS
  ------------------------------------------------------------------------ */

  const handleStatusChange = (value) => {
    setStatus(value);
    setPage(1);
  };

  const handleSortChange = (value) => {
    setSort(value);
    setPage(1);
  };

  const handleStartDateChange = (value) => {
    setStartDate(value);
    setPage(1);
  };

  const handleEndDateChange = (value) => {
    setEndDate(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setStartDate('');
    setEndDate('');
    setSort('-createdAt');
    setPage(1);
  };

  const hasFilters = Boolean(
    search || status || startDate || endDate || sort !== '-createdAt',
  );

  /* ------------------------------------------------------------------------
     PAGINAÇÃO
  ------------------------------------------------------------------------ */

  const goToPage = (nextPage) => {
    if (nextPage < 1 || (pagination.pages && nextPage > pagination.pages)) {
      return;
    }

    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pageNumbers = useMemo(() => {
    const pages = pagination.pages || 1;
    const current = pagination.page || page;
    const result = [];

    const start = Math.max(1, current - 2);
    const end = Math.min(pages, current + 2);

    for (let index = start; index <= end; index += 1) {
      result.push(index);
    }

    return result;
  }, [pagination.pages, pagination.page, page]);

  /* ------------------------------------------------------------------------
     INTERFACE
  ------------------------------------------------------------------------ */

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-white md:p-6">
      <div className="mx-auto max-w-[1700px] space-y-6">
        {/* CABEÇALHO */}

        <header className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/15 to-indigo-500/10 shadow-lg shadow-blue-950/20">
              <FileText size={23} className="text-blue-400" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Propostas
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Gerencie suas negociações em um só lugar.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                Promise.all([
                  loadProposals({ silent: true, requestedPage: page }),
                  loadMetrics(),
                ])
              }
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={refreshing ? 'animate-spin' : ''}
              />
              Atualizar
            </button>

            <button
              type="button"
              onClick={() => navigate('/proposals/create')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/20 transition hover:bg-blue-500 active:scale-[0.98]"
            >
              <Plus size={18} />
              Nova proposta
            </button>
          </div>
        </header>

        {/* NOTIFICAÇÕES */}

        {error && (
          <AlertBox type="error" message={error} onClose={() => setError('')} />
        )}

        {actionError && (
          <AlertBox
            type="error"
            message={actionError}
            onClose={() => setActionError('')}
          />
        )}

        {successMessage && (
          <AlertBox
            type="success"
            message={successMessage}
            onClose={() => setSuccessMessage('')}
          />
        )}

        {/* MÉTRICAS */}

        <MetricsGrid metrics={metrics} loading={loadingMetrics} />

        {/* BUSCA E FILTROS */}

        <section className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-4 shadow-xl shadow-black/5 md:p-5">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar cliente, proposta ou imóvel..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/10"
              />
            </div>

            <select
              value={status}
              onChange={(event) => handleStatusChange(event.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-blue-500/70"
            >
              <option value="">Todos os status</option>

              {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setShowFilters((current) => !current)}
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                showFilters
                  ? 'border-blue-500/30 bg-blue-500/10 text-blue-300'
                  : 'border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Filter size={17} />
              Filtros
              {hasFilters && (
                <span className="h-2 w-2 rounded-full bg-blue-400" />
              )}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 grid gap-4 border-t border-slate-800 pt-4 md:grid-cols-2 xl:grid-cols-4">
              <FilterInput
                label="Data inicial"
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
              />

              <FilterInput
                label="Data final"
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
              />

              <FilterInput
                label="Ordenação"
                type="select"
                value={sort}
                onChange={handleSortChange}
                options={SORT_OPTIONS}
              />

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="w-full rounded-xl border border-slate-700 px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-800"
                >
                  Limpar filtros
                </button>
              </div>
            </div>
          )}
        </section>

        {/* RESUMO DOS RESULTADOS */}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-400">
            {pagination.total
              ? `${formatNumber(pagination.total)} proposta${
                  pagination.total !== 1 ? 's' : ''
                } encontrada${pagination.total !== 1 ? 's' : ''}`
              : 'Nenhuma proposta encontrada'}
          </p>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Exibir</span>

            <select
              value={limit}
              onChange={(event) => {
                setLimit(Number(event.target.value));
                setPage(1);
              }}
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500/70"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>

            <span className="text-xs text-slate-500">por página</span>
          </div>
        </div>

        {/* CONTEÚDO */}

        {loading ? (
          <LoadingState />
        ) : proposals.length === 0 ? (
          <EmptyState
            hasFilters={hasFilters}
            onClear={clearFilters}
            onCreate={() => navigate('/proposals/create')}
          />
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900 shadow-xl shadow-black/5 lg:block">
              <ProposalTable
                proposals={proposals}
                actionLoading={actionLoading}
                onApprove={handleApprove}
                onReject={handleReject}
                onCancel={handleCancel}
              />
            </div>

            <div className="space-y-4 lg:hidden">
              {proposals.map((proposal) => (
                <ProposalCard
                  key={getId(proposal)}
                  proposal={proposal}
                  actionLoading={actionLoading}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onCancel={handleCancel}
                />
              ))}
            </div>

            <Pagination
              pagination={pagination}
              pageNumbers={pageNumbers}
              onPageChange={goToPage}
            />
          </>
        )}
      </div>

      {/* MODAL DE AÇÃO */}

      {modal.isOpen && (
        <ActionModal
          type={modal.type}
          proposal={modal.proposal}
          isLoading={modal.isLoading}
          onConfirm={handleModalConfirm}
          onCancel={closeModal}
        />
      )}
    </div>
  );
}

/* ==========================================================================
   MODAL DE AÇÃO
========================================================================== */

function ActionModal({ type, proposal, isLoading, onConfirm, onCancel }) {
  const [comment, setComment] = useState('');

  const configs = {
    approve: {
      title: 'Aprovar proposta',
      icon: <Zap size={22} className="text-emerald-400" />,
      description: (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-sm font-medium text-emerald-300">Esta ação irá:</p>

          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            {[
              'Aprovar a proposta comercial',
              'Criar a venda automaticamente',
              'Gerar a comissão correspondente',
              'Atualizar a oportunidade para WON',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2
                  size={16}
                  className="mt-0.5 shrink-0 text-emerald-400"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ),
      confirmLabel: 'Aprovar proposta',
      confirmClass: 'bg-emerald-600 hover:bg-emerald-500',
      showComment: false,
    },

    reject: {
      title: 'Rejeitar proposta',
      icon: <X size={22} className="text-red-400" />,
      description: (
        <p className="text-sm leading-6 text-slate-300">
          Confirme a rejeição desta proposta. Se desejar, informe o motivo para
          manter um registro da decisão.
        </p>
      ),
      confirmLabel: 'Rejeitar proposta',
      confirmClass: 'bg-red-600 hover:bg-red-500',
      showComment: true,
    },

    cancel: {
      title: 'Cancelar proposta',
      icon: <XCircle size={22} className="text-orange-400" />,
      description: (
        <p className="text-sm leading-6 text-slate-300">
          Você está prestes a cancelar esta proposta. Informe um motivo opcional
          para registrar a decisão.
        </p>
      ),
      confirmLabel: 'Cancelar proposta',
      confirmClass: 'bg-orange-600 hover:bg-orange-500',
      showComment: true,
    },
  };

  const config = configs[type] || configs.approve;

  const lead = proposal?.lead || proposal?.leadSnapshot;
  const property = proposal?.property || proposal?.propertySnapshot;
  const broker = proposal?.broker || proposal?.brokerSnapshot;

  const proposalId = getId(proposal);

  const proposalPrice =
    proposal?.values?.proposalPrice || proposal?.proposalPrice || 0;

  const handleSubmit = (event) => {
    event.preventDefault();
    onConfirm(comment);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-md"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isLoading) {
          onCancel();
        }
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900 shadow-2xl shadow-black/50"
      >
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 bg-slate-800">
              {config.icon}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white">
                {config.title}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Proposta #{String(proposalId).slice(-6)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            aria-label="Fechar modal"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
            <div className="grid grid-cols-2 gap-4 p-4">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Cliente
                </p>
                <p className="mt-1 truncate text-sm font-medium text-slate-200">
                  {getName(lead, 'Não informado')}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Valor
                </p>
                <p className="mt-1 text-sm font-bold text-emerald-400">
                  {formatCurrency(proposalPrice)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-slate-800 p-4">
              <PropertyThumbnail
                src={getPropertyThumbnail(property)}
                name={getName(property, 'Imóvel')}
              />

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Imóvel
                </p>
                <p className="mt-1 truncate text-sm font-medium text-slate-200">
                  {getName(property, 'Imóvel não informado')}
                </p>
                {property?.code && (
                  <p className="mt-1 text-xs text-slate-500">
                    Código {property.code}
                  </p>
                )}
              </div>
            </div>

            {broker && (
              <div className="flex items-center gap-3 border-t border-slate-800 p-4">
                <BrokerAvatar
                  name={getName(broker, 'Corretor')}
                  src={getBrokerAvatar(broker)}
                />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Corretor responsável
                  </p>
                  <p className="mt-1 truncate text-sm text-slate-200">
                    {getName(broker, 'Não atribuído')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {config.description}

          {config.showComment && (
            <div>
              <label
                htmlFor="proposal-action-comment"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Motivo{' '}
                <span className="font-normal text-slate-500">(opcional)</span>
              </label>

              <textarea
                id="proposal-action-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Descreva o motivo desta ação..."
                rows={3}
                disabled={isLoading}
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/10 disabled:opacity-60"
              />
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-800 bg-slate-950/30 p-5 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
          >
            Voltar
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${config.confirmClass}`}
          >
            {isLoading && <Loader2 size={17} className="animate-spin" />}
            {isLoading ? 'Processando...' : config.confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ==========================================================================
   MÉTRICAS
========================================================================== */

function MetricsGrid({ metrics, loading }) {
  const summary = metrics?.summary || {};
  const values = metrics?.values || {};

  const cards = [
    {
      label: 'Total',
      value: formatNumber(summary.total),
      icon: FileText,
      description: 'Todas as propostas',
    },
    {
      label: 'Pendentes',
      value: formatNumber(summary.pending),
      icon: Clock3,
      description: 'Aguardando aprovação',
    },
    {
      label: 'Aceitas',
      value: formatNumber(summary.accepted),
      icon: CheckCircle2,
      description: 'Propostas aprovadas',
    },
    {
      label: 'Rascunhos',
      value: formatNumber(summary.draft),
      icon: Edit3,
      description: 'Ainda não enviadas',
    },
    {
      label: 'Valor total',
      value: formatCurrency(values.totalProposalValue),
      icon: DollarSign,
      description: 'Valor das propostas',
    },
    {
      label: 'Valor médio',
      value: formatCurrency(values.averageProposalValue),
      icon: BarChart3,
      description: 'Ticket médio',
    },
    {
      label: 'Taxa de aprovação',
      value: formatPercent(values.approvalRate),
      icon: TrendingUp,
      description: 'Aprovadas entre enviadas',
    },
    {
      label: 'Conversão',
      value: formatPercent(values.conversionRate),
      icon: Check,
      description: 'Aceitas sobre o total',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="group rounded-2xl border border-slate-800/80 bg-slate-900 p-4 transition duration-200 hover:border-slate-700 hover:bg-slate-900/90 md:p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 md:text-xs">
                  {card.label}
                </p>

                {loading ? (
                  <div className="mt-3 h-7 w-24 animate-pulse rounded-lg bg-slate-800" />
                ) : (
                  <p className="mt-2 break-words text-lg font-bold tracking-tight text-white md:text-xl">
                    {card.value}
                  </p>
                )}

                <p className="mt-2 text-[11px] text-slate-500 md:text-xs">
                  {card.description}
                </p>
              </div>

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 transition group-hover:bg-blue-500/15 md:h-10 md:w-10">
                <Icon size={18} className="text-blue-400" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ==========================================================================
   TABELA DE PROPOSTAS
========================================================================== */

function ProposalTable({
  proposals,
  actionLoading,
  onApprove,
  onReject,
  onCancel,
}) {
  const headers = [
    'Proposta',
    'Cliente',
    'Imóvel',
    'Corretor',
    'Valor',
    'Status',
    'Criada em',
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1320px] border-separate border-spacing-0">
        <thead>
          <tr>
            {headers.map((label) => (
              <th
                key={label}
                className="border-b border-slate-800 bg-slate-900 px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500"
              >
                {label}
              </th>
            ))}

            <th className="sticky right-0 z-[2] w-[76px] border-b border-slate-800 bg-slate-900 px-4 py-4 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Ações
            </th>
          </tr>
        </thead>

        <tbody>
          {proposals.map((proposal) => (
            <ProposalRow
              key={getId(proposal)}
              proposal={proposal}
              actionLoading={actionLoading}
              onApprove={onApprove}
              onReject={onReject}
              onCancel={onCancel}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ==========================================================================
   LINHA DA TABELA
========================================================================== */

function ProposalRow({
  proposal,
  actionLoading,
  onApprove,
  onReject,
  onCancel,
}) {
  const proposalId = getId(proposal);
  const lead = proposal.lead || proposal.leadSnapshot;
  const property = proposal.property || proposal.propertySnapshot;
  const broker = proposal.broker || proposal.brokerSnapshot;

  const proposalPrice =
    proposal.values?.proposalPrice || proposal.proposalPrice || 0;

  const status = proposal.status || 'draft';

  return (
    <tr className="group transition-colors duration-200 hover:bg-blue-500/[0.035]">
      <td className="whitespace-nowrap border-b border-slate-800/70 px-5 py-4 align-middle">
        <Link
          to={`/proposals/${proposalId}`}
          className="text-sm font-semibold text-slate-100 transition hover:text-blue-400"
        >
          #{String(proposalId).slice(-6)}
        </Link>

        <p className="mt-1.5 text-xs text-slate-500">
          Atualizada {formatDateTime(proposal.updatedAt || proposal.createdAt)}
        </p>
      </td>

      <td className="border-b border-slate-800/70 px-5 py-4 align-middle">
        <div className="flex min-w-[175px] items-center gap-3">
          <Avatar name={getName(lead)} />

          <div className="min-w-0">
            <p className="max-w-[180px] truncate text-sm font-medium text-slate-200">
              {getName(lead, 'Cliente não informado')}
            </p>

            {lead?.phone && (
              <p className="mt-1 text-xs text-slate-500">{lead.phone}</p>
            )}

            {lead?.email && (
              <p className="mt-1 max-w-[180px] truncate text-xs text-slate-600">
                {lead.email}
              </p>
            )}
          </div>
        </div>
      </td>

      <td className="border-b border-slate-800/70 px-5 py-4 align-middle">
        <div className="flex min-w-[240px] max-w-[290px] items-center gap-3">
          <PropertyThumbnail
            src={getPropertyThumbnail(property)}
            name={getName(property, 'Imóvel')}
          />

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-200">
              {getName(property, 'Imóvel não informado')}
            </p>

            {property?.code && (
              <p className="mt-1 text-xs text-slate-500">
                Código <span className="text-slate-400">{property.code}</span>
              </p>
            )}

            {(property?.location?.district || property?.district) && (
              <p className="mt-1 truncate text-xs text-slate-500">
                {property?.location?.district || property?.district}
                {property?.location?.city ? `, ${property.location.city}` : ''}
              </p>
            )}
          </div>
        </div>
      </td>

      <td className="border-b border-slate-800/70 px-5 py-4 align-middle">
        <div className="flex min-w-[170px] items-center gap-2.5">
          <BrokerAvatar
            name={getName(broker, 'Não atribuído')}
            src={getBrokerAvatar(broker)}
          />

          <div className="min-w-0">
            <p className="max-w-[150px] truncate text-sm font-medium text-slate-200">
              {getName(broker, 'Não atribuído')}
            </p>

            {broker?.email && (
              <p className="mt-1 max-w-[150px] truncate text-xs text-slate-500">
                {broker.email}
              </p>
            )}
          </div>
        </div>
      </td>

      <td className="whitespace-nowrap border-b border-slate-800/70 px-5 py-4 align-middle">
        <p className="text-sm font-semibold tabular-nums text-emerald-400">
          {formatCurrency(proposalPrice)}
        </p>
        <p className="mt-1 text-[11px] text-slate-500">Valor proposto</p>
      </td>

      <td className="whitespace-nowrap border-b border-slate-800/70 px-5 py-4 align-middle">
        <StatusBadge status={status} />
      </td>

      <td className="whitespace-nowrap border-b border-slate-800/70 px-5 py-4 align-middle">
        <p className="text-sm text-slate-300">
          {formatDate(proposal.createdAt)}
        </p>
        <p className="mt-1 text-xs text-slate-600">
          {proposal.updatedAt
            ? 'Atualizada ' + formatDate(proposal.updatedAt)
            : 'Sem atualizações'}
        </p>
      </td>

      <td className="sticky right-0 z-[1] w-[76px] border-b border-slate-800/70 bg-slate-900 px-4 py-4 text-center align-middle transition-colors group-hover:bg-[#101c30]">
        <div className="flex items-center justify-center">
          <ProposalActionsDropdown
            proposal={proposal}
            actionLoading={actionLoading}
            onApprove={onApprove}
            onReject={onReject}
            onCancel={onCancel}
          />
        </div>
      </td>
    </tr>
  );
}

/* ==========================================================================
   DROPDOWN DE AÇÕES
   Portal + medição real + alinhamento pela borda direita do botão.
========================================================================== */

function ProposalActionsDropdown({
  proposal,
  actionLoading,
  onApprove,
  onReject,
  onCancel,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState(null);

  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const proposalId = getId(proposal);
  const status = proposal?.status || 'draft';

  const canApprove = status === 'pending';
  const canReject = status === 'pending';
  const canCancel = ['draft', 'pending'].includes(status);
  const canEdit = status === 'draft';

  const isProcessing = Boolean(
    actionLoading &&
    ['approve', 'reject', 'cancel'].some(
      (action) => actionLoading === `${action}-${proposalId}`,
    ),
  );

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;

    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();

    const padding = 12;
    const gap = 8;
    const menu = menuRef.current;

    const menuWidth = Math.min(
      menu?.offsetWidth || 248,
      window.innerWidth - padding * 2,
    );

    const menuHeight = menu?.offsetHeight || 280;

    let left = rect.right - menuWidth;

    left = Math.max(
      padding,
      Math.min(left, window.innerWidth - menuWidth - padding),
    );

    const spaceBelow = window.innerHeight - rect.bottom - padding;
    const spaceAbove = rect.top - padding;

    const openAbove =
      spaceBelow < Math.min(menuHeight, 280) + gap && spaceAbove > spaceBelow;

    const availableHeight = openAbove ? spaceAbove : spaceBelow;
    const maxHeight = Math.max(120, availableHeight - gap);

    const visibleHeight = Math.min(menuHeight, maxHeight);

    let top = openAbove ? rect.top - visibleHeight - gap : rect.bottom + gap;

    top = Math.max(
      padding,
      Math.min(top, window.innerHeight - padding - visibleHeight),
    );

    setPosition({
      top,
      left,
      maxHeight,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const frame = requestAnimationFrame(() => {
      updatePosition();
    });

    const handlePointerDown = (event) => {
      const clickedTrigger = triggerRef.current?.contains(event.target);
      const clickedMenu = menuRef.current?.contains(event.target);

      if (!clickedTrigger && !clickedMenu) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handleViewportChange = () => updatePosition();

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
      cancelAnimationFrame(frame);

      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('scroll', handleViewportChange, true);
    };
  }, [isOpen, updatePosition]);

  const toggleMenu = () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setPosition(null);
    setIsOpen(true);
  };

  const handleAction = (callback) => {
    setIsOpen(false);
    callback(proposal);
  };

  const menuItemClass =
    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left ' +
    'text-sm text-slate-300 transition-colors hover:bg-slate-800 ' +
    'hover:text-white disabled:cursor-not-allowed disabled:opacity-50';

  const menu = isOpen && (
    <div
      ref={menuRef}
      role="menu"
      aria-label={`Ações da proposta ${String(proposalId).slice(-6)}`}
      style={{
        position: 'fixed',
        top: position?.top ?? -1000,
        left: position?.left ?? -1000,
        width: 'min(248px, calc(100vw - 24px))',
        maxHeight: position?.maxHeight ?? 'min(420px, 70vh)',
        visibility: position ? 'visible' : 'hidden',
        zIndex: 9999,
      }}
      className="overflow-y-auto overscroll-contain rounded-2xl border border-slate-700/80 bg-slate-900/95 p-1.5 shadow-2xl shadow-black/50 ring-1 ring-white/[0.06] backdrop-blur-xl"
    >
      <div className="border-b border-slate-800/90 px-3 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Gerenciar proposta
        </p>
        <p className="mt-1 text-sm font-semibold text-white">
          #{String(proposalId).slice(-6)}
        </p>
      </div>

      <div className="space-y-0.5 py-1.5">
        <Link
          to={`/proposals/${proposalId}`}
          role="menuitem"
          onClick={() => setIsOpen(false)}
          className={menuItemClass}
        >
          <Eye size={16} className="shrink-0 text-slate-400" />
          <span>Visualizar detalhes</span>
        </Link>

        {canEdit && (
          <Link
            to={`/proposals/${proposalId}/edit`}
            role="menuitem"
            onClick={() => setIsOpen(false)}
            className={menuItemClass}
          >
            <Edit3 size={16} className="shrink-0 text-blue-400" />
            <span>Editar proposta</span>
          </Link>
        )}
      </div>

      {(canApprove || canReject || canCancel) && (
        <>
          <div className="mx-2 border-t border-slate-800" />

          <div className="space-y-0.5 py-1.5">
            {canApprove && (
              <button
                type="button"
                role="menuitem"
                disabled={isProcessing}
                onClick={() => handleAction(onApprove)}
                className={`${menuItemClass} text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300`}
              >
                <CheckCircle2 size={16} className="shrink-0" />
                <span>Aprovar proposta</span>
              </button>
            )}

            {canReject && (
              <button
                type="button"
                role="menuitem"
                disabled={isProcessing}
                onClick={() => handleAction(onReject)}
                className={`${menuItemClass} text-red-400 hover:bg-red-500/10 hover:text-red-300`}
              >
                <X size={16} className="shrink-0" />
                <span>Rejeitar proposta</span>
              </button>
            )}

            {canCancel && (
              <button
                type="button"
                role="menuitem"
                disabled={isProcessing}
                onClick={() => handleAction(onCancel)}
                className={`${menuItemClass} text-orange-400 hover:bg-orange-500/10 hover:text-orange-300`}
              >
                <XCircle size={16} className="shrink-0" />
                <span>Cancelar proposta</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Abrir ações da proposta ${String(proposalId).slice(-6)}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={toggleMenu}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
          isOpen
            ? 'border-blue-500/40 bg-blue-500/10 text-blue-300'
            : 'border-transparent text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-white'
        }`}
      >
        {isProcessing ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <MoreHorizontal size={20} />
        )}
      </button>

      {typeof document !== 'undefined' &&
        menu &&
        createPortal(menu, document.body)}
    </>
  );
}

/* ==========================================================================
   CARD MOBILE
========================================================================== */

function ProposalCard({
  proposal,
  actionLoading,
  onApprove,
  onReject,
  onCancel,
}) {
  const proposalId = getId(proposal);
  const lead = proposal.lead || proposal.leadSnapshot;
  const property = proposal.property || proposal.propertySnapshot;
  const broker = proposal.broker || proposal.brokerSnapshot;

  const proposalPrice =
    proposal.values?.proposalPrice || proposal.proposalPrice || 0;

  const status = proposal.status || 'draft';

  const canApprove = status === 'pending';
  const canReject = status === 'pending';
  const canCancel = ['draft', 'pending'].includes(status);
  const canEdit = status === 'draft';

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900 shadow-lg shadow-black/5">
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={getName(lead)} />

          <div className="min-w-0">
            <Link
              to={`/proposals/${proposalId}`}
              className="block truncate text-sm font-semibold text-white transition hover:text-blue-400"
            >
              {getName(lead, 'Cliente não informado')}
            </Link>

            <p className="mt-1 text-xs text-slate-500">
              Proposta #{String(proposalId).slice(-6)}
            </p>
          </div>
        </div>

        <StatusBadge status={status} />
      </div>

      {/* IMÓVEL */}

      <div className="mx-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Imóvel da proposta
        </p>

        <div className="flex items-center gap-3">
          <PropertyThumbnail
            src={getPropertyThumbnail(property)}
            name={getName(property, 'Imóvel')}
          />

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-100">
              {getName(property, 'Imóvel não informado')}
            </p>

            {property?.code && (
              <p className="mt-1 text-xs text-slate-500">
                Código {property.code}
              </p>
            )}

            {(property?.location?.district || property?.district) && (
              <p className="mt-1 truncate text-xs text-slate-500">
                {property?.location?.district || property?.district}
                {property?.location?.city ? `, ${property.location.city}` : ''}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* CORRETOR */}

      {broker && (
        <div className="mx-4 mt-3 flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <BrokerAvatar
            name={getName(broker, 'Corretor')}
            src={getBrokerAvatar(broker)}
          />

          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-slate-500">
              Corretor responsável
            </p>
            <p className="mt-0.5 truncate text-sm font-medium text-slate-300">
              {getName(broker, 'Não atribuído')}
            </p>
          </div>
        </div>
      )}

      {/* VALOR E DATA */}

      <div className="grid grid-cols-2 gap-4 p-4">
        <div>
          <p className="text-xs text-slate-500">Valor proposto</p>
          <p className="mt-1 text-sm font-bold text-emerald-400">
            {formatCurrency(proposalPrice)}
          </p>
        </div>

        <div>
          <p className="text-xs text-slate-500">Criada em</p>
          <p className="mt-1 text-sm text-slate-300">
            {formatDate(proposal.createdAt)}
          </p>
        </div>
      </div>

      {/* AÇÕES */}

      <div className="flex flex-wrap gap-2 border-t border-slate-800 bg-slate-950/30 p-4">
        <Link
          to={`/proposals/${proposalId}`}
          className="inline-flex min-w-[90px] flex-1 items-center justify-center gap-2 rounded-xl bg-slate-800 px-3 py-2.5 text-sm text-slate-200 transition hover:bg-slate-700"
        >
          <Eye size={16} />
          Ver
        </Link>

        {canEdit && (
          <Link
            to={`/proposals/${proposalId}/edit`}
            className="inline-flex min-w-[90px] flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 px-3 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            <Edit3 size={16} />
            Editar
          </Link>
        )}

        {canApprove && (
          <ActionButton
            title="Aprovar proposta"
            loading={actionLoading === `approve-${proposalId}`}
            onClick={() => onApprove(proposal)}
            icon={<Zap size={16} />}
            className="min-w-[90px] flex-1 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
          />
        )}

        {canReject && (
          <ActionButton
            title="Rejeitar proposta"
            loading={actionLoading === `reject-${proposalId}`}
            onClick={() => onReject(proposal)}
            icon={<X size={16} />}
            className="min-w-[90px] flex-1 border border-red-500/20 text-red-400 hover:bg-red-500/10"
          />
        )}

        {canCancel && (
          <ActionButton
            title="Cancelar proposta"
            loading={actionLoading === `cancel-${proposalId}`}
            onClick={() => onCancel(proposal)}
            icon={<XCircle size={16} />}
            className="min-w-[90px] flex-1 border border-orange-500/20 text-orange-400 hover:bg-orange-500/10"
          />
        )}
      </div>
    </article>
  );
}

/* ==========================================================================
   MINIATURA DO IMÓVEL
========================================================================== */

function PropertyThumbnail({ src, name }) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [src]);

  return (
    <div className="relative h-[58px] w-[76px] shrink-0 overflow-hidden rounded-xl border border-slate-700/80 bg-slate-800 shadow-sm">
      {src && !imageError ? (
        <img
          src={src}
          alt={name}
          loading="lazy"
          onError={() => setImageError(true)}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
          <Building2 size={23} className="text-slate-500" />
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />
    </div>
  );
}

/* ==========================================================================
   AVATAR DO CORRETOR
========================================================================== */

function BrokerAvatar({ name, src }) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [src]);

  if (!src || imageError) {
    return <Avatar name={name} />;
  }

  return (
    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-slate-700 bg-slate-800 ring-2 ring-slate-800">
      <img
        src={src}
        alt={`Foto de ${name}`}
        loading="lazy"
        onError={() => setImageError(true)}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

/* ==========================================================================
   STATUS
========================================================================== */

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-xs font-medium ${config.className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}

/* ==========================================================================
   AVATAR COM INICIAIS
========================================================================== */

function Avatar({ name, src }) {
  const [imageError, setImageError] = useState(false);

  const initials = String(name || 'U')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

  useEffect(() => {
    setImageError(false);
  }, [src]);

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/15 to-indigo-500/10">
      {src && !imageError ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          loading="lazy"
          onError={() => setImageError(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="text-xs font-bold tracking-wide text-blue-300">
          {initials || 'U'}
        </span>
      )}
    </div>
  );
}

/* ==========================================================================
   BOTÃO DE AÇÃO MOBILE
========================================================================== */

function ActionButton({ title, icon, loading, onClick, className = '' }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={loading}
      className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3 transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
    </button>
  );
}

/* ==========================================================================
   INPUTS DE FILTRO
========================================================================== */

function FilterInput({ label, type = 'text', value, onChange, options = [] }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-slate-400">
        {label}
      </label>

      {type === 'select' ? (
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500/70"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <div className="relative">
          <CalendarDays
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type={type}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-blue-500/70"
          />
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   PAGINAÇÃO
========================================================================== */

function Pagination({ pagination, pageNumbers, onPageChange }) {
  if (!pagination.pages || pagination.pages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Página{' '}
        <span className="font-medium text-slate-300">{pagination.page}</span> de{' '}
        <span className="font-medium text-slate-300">{pagination.pages}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Página anterior"
          disabled={!pagination.hasPreviousPage}
          onClick={() => onPageChange(pagination.page - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft size={17} />
        </button>

        {pageNumbers.map((number) => (
          <button
            key={number}
            type="button"
            aria-current={number === pagination.page ? 'page' : undefined}
            onClick={() => onPageChange(number)}
            className={`h-9 w-9 rounded-xl text-sm font-medium transition ${
              number === pagination.page
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/20'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {number}
          </button>
        ))}

        <button
          type="button"
          aria-label="Próxima página"
          disabled={!pagination.hasNextPage}
          onClick={() => onPageChange(pagination.page + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   LOADING
========================================================================== */

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-16">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
        <Loader2 size={27} className="animate-spin text-blue-400" />
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-slate-200">
          Carregando propostas
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Estamos atualizando suas informações.
        </p>
      </div>
    </div>
  );
}

/* ==========================================================================
   ESTADO VAZIO
========================================================================== */

function EmptyState({ hasFilters, onClear, onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center md:p-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800/80">
        <FileText size={27} className="text-slate-500" />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-white">
        Nenhuma proposta encontrada
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasFilters
          ? 'Tente ajustar ou limpar os filtros para encontrar outras propostas.'
          : 'Ainda não existem propostas cadastradas.'}
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            Limpar filtros
          </button>
        )}

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          <Plus size={17} />
          Nova proposta
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   ALERTAS E NOTIFICAÇÕES
========================================================================== */

function AlertBox({ type = 'error', message, onClose }) {
  const isError = type === 'error';
  const isSuccess = type === 'success';

  const Icon = isError ? AlertCircle : isSuccess ? CheckCircle2 : Send;

  const styles = isError
    ? 'border-red-500/20 bg-red-500/5 text-red-300'
    : isSuccess
      ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300'
      : 'border-blue-500/20 bg-blue-500/5 text-blue-300';

  return (
    <div
      role={isError ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-xl border p-4 ${styles}`}
    >
      <Icon size={19} className="mt-0.5 shrink-0" />

      <p className="flex-1 text-sm leading-6">{message}</p>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar aviso"
          className="text-current opacity-60 transition hover:opacity-100"
        >
          <X size={17} />
        </button>
      )}
    </div>
  );
}

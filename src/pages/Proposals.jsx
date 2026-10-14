// src/pages/Proposals.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';

import {
  AlertCircle,
  BarChart3,
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
   STATUS
========================================================================== */

const STATUS_CONFIG = {
  draft: {
    label: 'Rascunho',
    className: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  },
  pending: {
    label: 'Pendente',
    className: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  },
  accepted: {
    label: 'Aceita',
    className: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
  },
  rejected: {
    label: 'Rejeitada',
    className: 'bg-red-500/10 text-red-300 border-red-500/20',
  },
  cancelled: {
    label: 'Cancelada',
    className: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  },
  expired: {
    label: 'Expirada',
    className: 'bg-orange-500/10 text-orange-300 border-orange-500/20',
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
  if (value === null || value === undefined || value === '') return 0;
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
   RESPONSE NORMALIZATION
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
   MAIN COMPONENT
========================================================================== */

export default function Proposals() {
  const navigate = useNavigate();

  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

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

  /* LOAD PROPOSALS */

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

  /* LOAD METRICS */

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

  /* INITIAL LOAD / FILTER LOAD */

  useEffect(() => {
    loadProposals();
  }, [loadProposals]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  /* SEARCH DEBOUNCE */

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  /* MODAL HANDLERS */

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

  /* ACTION HANDLER */

  const executeAction = async (proposal, action, customComment = '') => {
    const proposalId = getId(proposal);
    if (!proposalId) return;

    const loadingKey = `${action}-${proposalId}`;

    try {
      setActionLoading(loadingKey);
      setModal((previous) => ({ ...previous, isLoading: true }));
      setActionError('');

      let response;

      if (action === 'approve') {
        response = await approveProposal(proposalId, customComment);
        console.log('Proposta aprovada com sucesso:', response);
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

      if (action === 'approve' && response?.data) {
        const { sale, commission } = response.data;

        let message = 'Proposta aprovada com sucesso!';

        if (sale?.saleNumber) {
          message += ` Venda ${sale.saleNumber} criada.`;
        }

        if (commission?.totalAmount) {
          message += ` Comissão de ${formatCurrency(
            commission.totalAmount,
          )} gerada.`;
        }

        window.alert(message);
      }

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

      setModal((previous) => ({ ...previous, isLoading: false }));
    } finally {
      setActionLoading(null);
    }
  };

  /* ACTIONS */

  const handleApprove = (proposal) => openModal('approve', proposal);
  const handleReject = (proposal) => openModal('reject', proposal);
  const handleCancel = (proposal) => openModal('cancel', proposal);

  const handleModalConfirm = (comment) => {
    const { proposal, type } = modal;

    if (proposal) {
      executeAction(proposal, type, comment);
    }
  };

  /* FILTER HELPERS */

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

  /* PAGE NAVIGATION */

  const goToPage = (nextPage) => {
    if (nextPage < 1 || (pagination.pages && nextPage > pagination.pages)) {
      return;
    }

    setPage(nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* PAGE NUMBERS */

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

  /* RENDER */

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-white md:p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* HEADER */}

        <header className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                <FileText size={24} className="text-blue-400" />
              </div>

              <div>
                <h1 className="text-2xl font-bold md:text-3xl">Propostas</h1>
                <p className="mt-1 text-sm text-slate-400">
                  Gerencie todas as propostas comerciais.
                </p>
              </div>
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
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-slate-200 transition hover:bg-slate-800 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={refreshing ? 'animate-spin' : ''}
              />
              Atualizar
            </button>

            <button
              type="button"
              onClick={() => navigate('/proposals/create')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-semibold text-white transition hover:bg-blue-500"
            >
              <Plus size={18} />
              Nova proposta
            </button>
          </div>
        </header>

        {/* ERRORS */}

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

        {/* METRICS */}

        <MetricsGrid metrics={metrics} loading={loadingMetrics} />

        {/* SEARCH + FILTERS */}

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 md:p-5">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por cliente, proposta ou imóvel..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-white outline-none placeholder:text-slate-600 focus:border-blue-500"
              />
            </div>

            <select
              value={status}
              onChange={(event) => handleStatusChange(event.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
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
              className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 transition ${
                showFilters
                  ? 'border-blue-500/30 bg-blue-500/10 text-blue-300'
                  : 'border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800'
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
                  className="w-full rounded-xl border border-slate-700 px-4 py-3 text-slate-300 transition hover:bg-slate-800"
                >
                  Limpar filtros
                </button>
              </div>
            </div>
          )}
        </section>

        {/* RESULT SUMMARY */}

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
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 outline-none"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>

            <span className="text-xs text-slate-500">por página</span>
          </div>
        </div>

        {/* CONTENT */}

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
            <div className="hidden overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 lg:block">
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

      {/* ACTION MODAL */}

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
   ACTION MODAL
========================================================================== */

function ActionModal({ type, proposal, isLoading, onConfirm, onCancel }) {
  const [comment, setComment] = useState('');

  const configs = {
    approve: {
      title: 'Aprovar Proposta',
      icon: <Zap size={24} className="text-emerald-400" />,
      description: (
        <>
          <p className="text-slate-300">
            Você está prestes a{' '}
            <strong className="text-emerald-400">aprovar</strong> esta proposta.
          </p>

          <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3">
            <p className="text-sm text-emerald-300">Esta ação irá:</p>

            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-slate-300">
              <li>Aprovar a proposta</li>
              <li>Criar a venda automaticamente</li>
              <li>Gerar a comissão</li>
              <li>Atualizar a oportunidade para WON</li>
            </ul>
          </div>
        </>
      ),
      confirmLabel: 'Aprovar',
      confirmClass: 'bg-emerald-600 hover:bg-emerald-500',
      showComment: false,
    },

    reject: {
      title: 'Rejeitar Proposta',
      icon: <X size={24} className="text-red-400" />,
      description: (
        <p className="text-slate-300">
          Você está prestes a <strong className="text-red-400">rejeitar</strong>{' '}
          esta proposta. Esta ação não pode ser desfeita.
        </p>
      ),
      confirmLabel: 'Rejeitar',
      confirmClass: 'bg-red-600 hover:bg-red-500',
      showComment: true,
    },

    cancel: {
      title: 'Cancelar Proposta',
      icon: <XCircle size={24} className="text-orange-400" />,
      description: (
        <p className="text-slate-300">
          Você está prestes a{' '}
          <strong className="text-orange-400">cancelar</strong> esta proposta.
          Esta ação não pode ser desfeita.
        </p>
      ),
      confirmLabel: 'Cancelar',
      confirmClass: 'bg-orange-600 hover:bg-orange-500',
      showComment: true,
    },
  };

  const config = configs[type] || configs.approve;
  const proposalId = getId(proposal);
  const lead = proposal?.lead || proposal?.leadSnapshot;
  const property = proposal?.property || proposal?.propertySnapshot;
  const proposalPrice =
    proposal?.values?.proposalPrice || proposal?.proposalPrice || 0;

  const handleSubmit = (event) => {
    event.preventDefault();
    onConfirm(comment);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isLoading) {
          onCancel();
        }
      }}
    >
      <div className="my-auto w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800">
              {config.icon}
            </div>

            <h3 className="text-lg font-semibold text-white">{config.title}</h3>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            aria-label="Fechar modal"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}

        <div className="space-y-4 p-5">
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs uppercase text-slate-500">Cliente</p>
                <p className="mt-1 text-sm font-medium text-slate-200">
                  {getName(lead)}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase text-slate-500">Valor</p>
                <p className="mt-1 text-sm font-bold text-emerald-400">
                  {formatCurrency(proposalPrice)}
                </p>
              </div>

              <div className="col-span-2">
                <p className="text-xs uppercase text-slate-500">Imóvel</p>
                <p className="mt-1 text-sm font-medium text-slate-200">
                  {getName(property, 'Imóvel não informado')}
                </p>
              </div>

              <div className="col-span-2">
                <p className="text-xs uppercase text-slate-500">Proposta</p>
                <p className="mt-1 text-sm text-slate-400">
                  #{String(proposalId).slice(-6)}
                </p>
              </div>
            </div>
          </div>

          {config.description}

          {config.showComment && (
            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Motivo <span className="text-slate-600">(opcional)</span>
              </label>

              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Descreva o motivo desta ação..."
                rows={3}
                disabled={isLoading}
                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-blue-500 disabled:opacity-60"
              />
            </div>
          )}
        </div>

        {/* FOOTER */}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-800 p-5 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-xl border border-slate-700 px-4 py-2.5 text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
          >
            Voltar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${config.confirmClass}`}
          >
            {isLoading && <Loader2 size={18} className="animate-spin" />}
            {isLoading ? 'Processando...' : config.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   METRICS GRID
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
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-4 md:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {card.label}
                </p>

                {loading ? (
                  <div className="mt-2 h-7 w-24 animate-pulse rounded-lg bg-slate-800" />
                ) : (
                  <p className="mt-1 text-lg font-bold text-white md:text-xl">
                    {card.value}
                  </p>
                )}

                <p className="mt-1 text-xs text-slate-500">
                  {card.description}
                </p>
              </div>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
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
   TABLE
========================================================================== */

function ProposalTable({
  proposals,
  actionLoading,
  onApprove,
  onReject,
  onCancel,
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1100px]">
        <thead>
          <tr className="border-b border-slate-800 text-left">
            {[
              'Proposta',
              'Cliente',
              'Imóvel',
              'Corretor',
              'Valor',
              'Status',
              'Criada em',
            ].map((label) => (
              <th
                key={label}
                className="px-5 py-4 text-xs font-semibold uppercase text-slate-500"
              >
                {label}
              </th>
            ))}

            <th className="px-5 py-4 text-right text-xs font-semibold uppercase text-slate-500">
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
   TABLE ROW
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
  const broker = proposal.broker;
  const proposalPrice =
    proposal.values?.proposalPrice || proposal.proposalPrice || 0;
  const status = proposal.status || 'draft';

  return (
    <tr className="border-b border-slate-800/80 transition hover:bg-slate-800/30">
      <td className="px-5 py-4">
        <div>
          <Link
            to={`/proposals/${proposalId}`}
            className="text-sm font-semibold text-white transition hover:text-blue-400"
          >
            Proposta #{String(proposalId).slice(-6)}
          </Link>

          <p className="mt-1 text-xs text-slate-500">
            Atualizada {formatDateTime(proposal.updatedAt)}
          </p>
        </div>
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <Avatar name={getName(lead)} />

          <div className="min-w-0">
            <p className="max-w-[180px] truncate text-sm font-medium text-slate-200">
              {getName(lead)}
            </p>

            {lead?.phone && (
              <p className="mt-1 text-xs text-slate-500">{lead.phone}</p>
            )}
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <div className="max-w-[210px]">
          <p className="truncate text-sm font-medium text-slate-200">
            {getName(property, 'Imóvel')}
          </p>

          {property?.code && (
            <p className="mt-1 text-xs text-slate-500">
              Código: {property.code}
            </p>
          )}
        </div>
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <User size={15} className="text-slate-500" />
          <span className="text-sm text-slate-300">
            {getName(broker, 'Não atribuído')}
          </span>
        </div>
      </td>

      <td className="px-5 py-4">
        <p className="text-sm font-semibold text-emerald-400">
          {formatCurrency(proposalPrice)}
        </p>
      </td>

      <td className="px-5 py-4">
        <StatusBadge status={status} />
      </td>

      <td className="px-5 py-4">
        <p className="text-sm text-slate-300">
          {formatDate(proposal.createdAt)}
        </p>
      </td>

      {/* MENU DE AÇÕES */}

      <td className="px-5 py-4">
        <div className="flex justify-end">
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
   PROPOSAL ACTIONS DROPDOWN
   Renderizado em portal para evitar cortes pelo overflow da tabela.
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

    const menuWidth = 240;
    const estimatedMenuHeight = 300;
    const spacing = 8;
    const viewportPadding = 8;

    const right = Math.max(viewportPadding, window.innerWidth - rect.right);

    const spaceBelow = window.innerHeight - rect.bottom;
    const shouldOpenAbove =
      spaceBelow < estimatedMenuHeight + spacing &&
      rect.top > estimatedMenuHeight;

    let top = shouldOpenAbove
      ? rect.top - estimatedMenuHeight - spacing
      : rect.bottom + spacing;

    top = Math.max(
      viewportPadding,
      Math.min(top, window.innerHeight - estimatedMenuHeight - viewportPadding),
    );

    setPosition({
      top,
      right: Math.min(right, window.innerWidth - menuWidth - viewportPadding),
      maxHeight: Math.max(140, window.innerHeight - top - viewportPadding),
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    updatePosition();

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

    const handleViewportChange = () => {
      updatePosition();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleViewportChange);
    window.addEventListener('scroll', handleViewportChange, true);

    return () => {
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

    updatePosition();
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

  const menu = isOpen && position && (
    <div
      ref={menuRef}
      role="menu"
      aria-label={`Ações da proposta ${String(proposalId).slice(-6)}`}
      style={{
        position: 'fixed',
        top: position.top,
        right: position.right,
        maxHeight: position.maxHeight,
        width: 240,
        zIndex: 9999,
      }}
      className="overflow-y-auto rounded-xl border border-slate-700/80 bg-slate-900 p-1.5 shadow-2xl shadow-black/40 ring-1 ring-white/5"
    >
      <div className="border-b border-slate-800 px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Proposta #{String(proposalId).slice(-6)}
        </p>
      </div>

      {/* NAVEGAÇÃO */}

      <div className="py-1">
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

      {/* AÇÕES DE STATUS */}

      {(canApprove || canReject || canCancel) && (
        <>
          <div className="mx-2 border-t border-slate-800" />

          <div className="py-1">
            {canApprove && (
              <button
                type="button"
                role="menuitem"
                disabled={isProcessing}
                onClick={() => handleAction(onApprove)}
                className={`${menuItemClass} text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300`}
              >
                <Zap size={16} className="shrink-0" />
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
        className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 ${
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
   MOBILE CARD
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
  const proposalPrice =
    proposal.values?.proposalPrice || proposal.proposalPrice || 0;
  const status = proposal.status || 'draft';

  const canApprove = status === 'pending';
  const canReject = status === 'pending';
  const canCancel = ['draft', 'pending'].includes(status);
  const canEdit = status === 'draft';

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={getName(lead)} />

          <div className="min-w-0">
            <Link
              to={`/proposals/${proposalId}`}
              className="text-sm font-semibold text-white hover:text-blue-400"
            >
              {getName(lead, 'Cliente')}
            </Link>

            <p className="mt-1 text-xs text-slate-500">
              Proposta #{String(proposalId).slice(-6)}
            </p>
          </div>
        </div>

        <StatusBadge status={status} />
      </div>

      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-3">
        <p className="text-xs uppercase text-slate-500">Imóvel</p>

        <p className="mt-1 text-sm font-medium text-slate-200">
          {getName(property, 'Imóvel')}
        </p>

        {property?.code && (
          <p className="mt-1 text-xs text-slate-500">Código: {property.code}</p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-500">Valor</p>
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

      <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-800 pt-4">
        <Link
          to={`/proposals/${proposalId}`}
          className="inline-flex min-w-[100px] flex-1 items-center justify-center gap-2 rounded-xl bg-slate-800 px-3 py-2.5 text-sm text-slate-200 transition hover:bg-slate-700"
        >
          <Eye size={16} />
          Ver
        </Link>

        {canEdit && (
          <Link
            to={`/proposals/${proposalId}/edit`}
            className="inline-flex min-w-[100px] flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 px-3 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            <Edit3 size={16} />
            Editar
          </Link>
        )}

        {canApprove && (
          <ActionButton
            title="Aprovar (gera venda e comissão)"
            loading={actionLoading === `approve-${proposalId}`}
            onClick={() => onApprove(proposal)}
            icon={<Zap size={16} />}
            className="min-w-[100px] flex-1 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10"
          />
        )}

        {canReject && (
          <ActionButton
            title="Rejeitar"
            loading={actionLoading === `reject-${proposalId}`}
            onClick={() => onReject(proposal)}
            icon={<X size={16} />}
            className="min-w-[100px] flex-1 border border-red-500/20 text-red-400 hover:bg-red-500/10"
          />
        )}

        {canCancel && (
          <ActionButton
            title="Cancelar"
            loading={actionLoading === `cancel-${proposalId}`}
            onClick={() => onCancel(proposal)}
            icon={<XCircle size={16} />}
            className="min-w-[100px] flex-1 border border-orange-500/20 text-orange-400 hover:bg-orange-500/10"
          />
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   STATUS BADGE
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
   AVATAR
========================================================================== */

function Avatar({ name }) {
  const initials = String(name || 'U')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
      <span className="text-xs font-bold text-blue-300">{initials}</span>
    </div>
  );
}

/* ==========================================================================
   ACTION BUTTON
========================================================================== */

function ActionButton({ title, icon, loading, onClick, className = '' }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={loading}
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3 transition disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
    </button>
  );
}

/* ==========================================================================
   FILTER INPUT
========================================================================== */

function FilterInput({ label, type = 'text', value, onChange, options = [] }) {
  return (
    <div>
      <label className="mb-2 block text-xs text-slate-500">{label}</label>

      {type === 'select' ? (
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
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
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-blue-500"
          />
        </div>
      )}
    </div>
  );
}

/* ==========================================================================
   PAGINATION
========================================================================== */

function Pagination({ pagination, pageNumbers, onPageChange }) {
  if (!pagination.pages || pagination.pages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Página <span className="text-slate-300">{pagination.page}</span> de{' '}
        <span className="text-slate-300">{pagination.pages}</span>
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Página anterior"
          disabled={!pagination.hasPreviousPage}
          onClick={() => onPageChange(pagination.page - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft size={17} />
        </button>

        {pageNumbers.map((number) => (
          <button
            key={number}
            type="button"
            aria-current={number === pagination.page ? 'page' : undefined}
            onClick={() => onPageChange(number)}
            className={`h-9 w-9 rounded-lg text-sm font-medium transition ${
              number === pagination.page
                ? 'bg-blue-600 text-white'
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
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
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
      <Loader2 size={32} className="animate-spin text-blue-500" />
      <p className="text-sm text-slate-500">Carregando propostas...</p>
    </div>
  );
}

/* ==========================================================================
   EMPTY
========================================================================== */

function EmptyState({ hasFilters, onClear, onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center md:p-16">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800">
        <FileText size={28} className="text-slate-500" />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-white">
        Nenhuma proposta encontrada
      </h3>

      <p className="mt-2 max-w-md text-sm text-slate-500">
        {hasFilters
          ? 'Tente ajustar ou limpar os filtros para encontrar outras propostas.'
          : 'Ainda não existem propostas cadastradas.'}
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-slate-700 px-4 py-2.5 text-slate-300 transition hover:bg-slate-800"
          >
            Limpar filtros
          </button>
        )}

        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-500"
        >
          <Plus size={17} />
          Nova proposta
        </button>
      </div>
    </div>
  );
}

/* ==========================================================================
   ALERT
========================================================================== */

function AlertBox({ type = 'error', message, onClose }) {
  const isError = type === 'error';

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border p-4 ${
        isError
          ? 'border-red-500/20 bg-red-500/10 text-red-300'
          : 'border-blue-500/20 bg-blue-500/10 text-blue-300'
      }`}
    >
      {isError ? (
        <AlertCircle size={20} className="mt-0.5 shrink-0" />
      ) : (
        <Send size={20} className="mt-0.5 shrink-0" />
      )}

      <p className="flex-1 text-sm">{message}</p>

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

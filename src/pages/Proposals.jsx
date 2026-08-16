import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
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
} from 'lucide-react';

import api from '../service/api';

/*
|--------------------------------------------------------------------------
| STATUS
|--------------------------------------------------------------------------
*/

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
  {
    value: '-createdAt',
    label: 'Mais recentes',
  },
  {
    value: 'createdAt',
    label: 'Mais antigas',
  },
  {
    value: '-updatedAt',
    label: 'Atualizadas recentemente',
  },
  {
    value: '-submittedAt',
    label: 'Enviadas recentemente',
  },
  {
    value: '-approvedAt',
    label: 'Aprovadas recentemente',
  },
];

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function getId(value) {
  if (!value) return '';

  if (typeof value === 'string') {
    return value;
  }

  return value._id || value.id || '';
}

function getName(value, fallback = '-') {
  if (!value) return fallback;

  if (typeof value === 'string') {
    return value;
  }

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

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function formatDateTime(value) {
  if (!value) return '-';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/*
|--------------------------------------------------------------------------
| RESPONSE NORMALIZATION
|--------------------------------------------------------------------------
*/

function normalizeListResponse(response) {
  const data = response?.data;

  /*
   * Backend atual:
   *
   * {
   *   success: true,
   *   data: {
   *     proposals: [],
   *     pagination: {}
   *   }
   * }
   */

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

/*
|--------------------------------------------------------------------------
| MAIN COMPONENT
|--------------------------------------------------------------------------
*/

export default function Proposals() {
  const navigate = useNavigate();

  /*
  |--------------------------------------------------------------------------
  | LIST STATE
  |--------------------------------------------------------------------------
  */

  const [proposals, setProposals] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState('');

  /*
  |--------------------------------------------------------------------------
  | METRICS
  |--------------------------------------------------------------------------
  */

  const [metrics, setMetrics] = useState(null);

  const [loadingMetrics, setLoadingMetrics] = useState(true);

  /*
  |--------------------------------------------------------------------------
  | FILTERS
  |--------------------------------------------------------------------------
  */

  const [search, setSearch] = useState('');

  const [status, setStatus] = useState('');

  const [startDate, setStartDate] = useState('');

  const [endDate, setEndDate] = useState('');

  const [sort, setSort] = useState('-createdAt');

  const [showFilters, setShowFilters] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | PAGINATION
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | ACTION STATE
  |--------------------------------------------------------------------------
  */

  const [actionLoading, setActionLoading] = useState(null);

  const [actionError, setActionError] = useState('');

  /*
  |--------------------------------------------------------------------------
  | LOAD PROPOSALS
  |--------------------------------------------------------------------------
  */

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

        if (search.trim()) {
          params.search = search.trim();
        }

        if (status) {
          params.status = status;
        }

        if (startDate) {
          params.startDate = startDate;
        }

        if (endDate) {
          params.endDate = endDate;
        }

        const response = await api.get('/api/proposals', {
          params,
        });

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

  /*
  |--------------------------------------------------------------------------
  | LOAD METRICS
  |--------------------------------------------------------------------------
  */

  const loadMetrics = useCallback(async () => {
    try {
      setLoadingMetrics(true);

      const params = {};

      if (startDate) {
        params.startDate = startDate;
      }

      if (endDate) {
        params.endDate = endDate;
      }

      const response = await api.get('/api/proposals/metrics', {
        params,
      });

      setMetrics(normalizeMetricsResponse(response));
    } catch (err) {
      console.error('Erro ao carregar métricas:', err);

      setMetrics(null);
    } finally {
      setLoadingMetrics(false);
    }
  }, [startDate, endDate]);

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD / FILTER LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadProposals();
  }, [loadProposals]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  /*
  |--------------------------------------------------------------------------
  | SEARCH DEBOUNCE
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  /*
  |--------------------------------------------------------------------------
  | ACTION HANDLER
  |--------------------------------------------------------------------------
  */

  const executeAction = async (proposal, action, confirmMessage) => {
    const proposalId = getId(proposal);

    if (!proposalId) {
      return;
    }

    if (confirmMessage && !window.confirm(confirmMessage)) {
      return;
    }

    try {
      setActionLoading(`${action}-${proposalId}`);

      setActionError('');

      await api.patch(`/api/proposals/${proposalId}/${action}`);

      await Promise.all([
        loadProposals({
          silent: true,
          requestedPage: page,
        }),

        loadMetrics(),
      ]);
    } catch (err) {
      console.error(`Erro ao executar ação ${action}:`, err);

      setActionError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Não foi possível executar esta ação.',
      );
    } finally {
      setActionLoading(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | ACTIONS
  |--------------------------------------------------------------------------
  */

  const handleApprove = (proposal) => {
    executeAction(
      proposal,
      'approve',
      'Deseja realmente aprovar esta proposta?',
    );
  };

  const handleReject = (proposal) => {
    executeAction(
      proposal,
      'reject',
      'Deseja realmente rejeitar esta proposta?',
    );
  };

  const handleCancel = (proposal) => {
    executeAction(
      proposal,
      'cancel',
      'Deseja realmente cancelar esta proposta?',
    );
  };

  /*
  |--------------------------------------------------------------------------
  | FILTER HELPERS
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | PAGE NAVIGATION
  |--------------------------------------------------------------------------
  */

  const goToPage = (nextPage) => {
    if (nextPage < 1 || (pagination.pages && nextPage > pagination.pages)) {
      return;
    }

    setPage(nextPage);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  /*
  |--------------------------------------------------------------------------
  | PAGE NUMBERS
  |--------------------------------------------------------------------------
  */

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

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* ==========================================================
            HEADER
        ========================================================== */}

        <header className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
          <div>
            <div className="flex items-center gap-3">
              <div
                className="
                w-12
                h-12
                rounded-xl
                bg-blue-500/10
                border
                border-blue-500/20
                flex
                items-center
                justify-center
              "
              >
                <FileText size={24} className="text-blue-400" />
              </div>

              <div>
                <h1
                  className="
                  text-2xl
                  md:text-3xl
                  font-bold
                "
                >
                  Propostas
                </h1>

                <p
                  className="
                  text-sm
                  text-slate-400
                  mt-1
                "
                >
                  Gerencie todas as propostas comerciais.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                loadProposals({
                  silent: true,
                  requestedPage: page,
                })
              }
              disabled={refreshing}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                px-4
                py-2.5
                rounded-xl
                border
                border-slate-700
                bg-slate-900
                text-slate-200
                hover:bg-slate-800
                transition
                disabled:opacity-50
              "
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
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                px-5
                py-2.5
                rounded-xl
                bg-blue-600
                hover:bg-blue-500
                text-white
                font-semibold
                transition
              "
            >
              <Plus size={18} />
              Nova proposta
            </button>
          </div>
        </header>

        {/* ==========================================================
            ERROR
        ========================================================== */}

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

        {/* ==========================================================
            METRICS
        ========================================================== */}

        <MetricsGrid metrics={metrics} loading={loadingMetrics} />

        {/* ==========================================================
            SEARCH + FILTERS
        ========================================================== */}

        <section
          className="
          bg-slate-900
          border
          border-slate-800
          rounded-2xl
          p-4
          md:p-5
        "
        >
          <div
            className="
            flex
            flex-col
            lg:flex-row
            gap-3
          "
          >
            {/* SEARCH */}

            <div className="relative flex-1">
              <Search
                size={18}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-slate-500
                "
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="
                  Buscar por cliente, proposta ou imóvel...
                "
                className="
                  w-full
                  bg-slate-950
                  border
                  border-slate-700
                  rounded-xl
                  pl-11
                  pr-4
                  py-3
                  text-white
                  placeholder:text-slate-600
                  outline-none
                  focus:border-blue-500
                "
              />
            </div>

            {/* STATUS */}

            <select
              value={status}
              onChange={(event) => handleStatusChange(event.target.value)}
              className="
                bg-slate-950
                border
                border-slate-700
                rounded-xl
                px-4
                py-3
                text-white
                outline-none
                focus:border-blue-500
              "
            >
              <option value="">Todos os status</option>

              {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </select>

            {/* FILTER BUTTON */}

            <button
              type="button"
              onClick={() => setShowFilters((current) => !current)}
              className={`
                inline-flex
                items-center
                justify-center
                gap-2
                px-4
                py-3
                rounded-xl
                border
                transition
                ${
                  showFilters
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                    : 'bg-slate-950 border-slate-700 text-slate-300 hover:bg-slate-800'
                }
              `}
            >
              <Filter size={17} />
              Filtros
              {hasFilters && (
                <span
                  className="
                  w-2
                  h-2
                  rounded-full
                  bg-blue-400
                "
                />
              )}
            </button>
          </div>

          {/* ADVANCED FILTERS */}

          {showFilters && (
            <div
              className="
              grid
              md:grid-cols-2
              xl:grid-cols-4
              gap-4
              mt-4
              pt-4
              border-t
              border-slate-800
            "
            >
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

              <div
                className="
                flex
                items-end
              "
              >
                <button
                  type="button"
                  onClick={clearFilters}
                  className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    border
                    border-slate-700
                    text-slate-300
                    hover:bg-slate-800
                    transition
                  "
                >
                  Limpar filtros
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ==========================================================
            RESULT SUMMARY
        ========================================================== */}

        <div
          className="
          flex
          flex-col
          sm:flex-row
          sm:items-center
          sm:justify-between
          gap-3
        "
        >
          <div>
            <p className="text-sm text-slate-400">
              {pagination.total
                ? `${formatNumber(pagination.total)} proposta${
                    pagination.total !== 1 ? 's' : ''
                  } encontrada${pagination.total !== 1 ? 's' : ''}`
                : 'Nenhuma proposta encontrada'}
            </p>
          </div>

          <div
            className="
            flex
            items-center
            gap-2
          "
          >
            <span className="text-xs text-slate-500">Exibir</span>

            <select
              value={limit}
              onChange={(event) => {
                setLimit(Number(event.target.value));

                setPage(1);
              }}
              className="
                bg-slate-900
                border
                border-slate-700
                rounded-lg
                px-3
                py-2
                text-sm
                text-slate-200
                outline-none
              "
            >
              <option value={10}>10</option>

              <option value={20}>20</option>

              <option value={50}>50</option>

              <option value={100}>100</option>
            </select>

            <span className="text-xs text-slate-500">por página</span>
          </div>
        </div>

        {/* ==========================================================
            CONTENT
        ========================================================== */}

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
            {/* DESKTOP */}

            <div
              className="
              hidden
              lg:block
              bg-slate-900
              border
              border-slate-800
              rounded-2xl
              overflow-hidden
            "
            >
              <ProposalTable
                proposals={proposals}
                actionLoading={actionLoading}
                onApprove={handleApprove}
                onReject={handleReject}
                onCancel={handleCancel}
              />
            </div>

            {/* MOBILE */}

            <div
              className="
              lg:hidden
              space-y-4
            "
            >
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

            {/* PAGINATION */}

            <Pagination
              pagination={pagination}
              pageNumbers={pageNumbers}
              onPageChange={goToPage}
            />
          </>
        )}
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| METRICS GRID
|--------------------------------------------------------------------------
*/

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
    <div
      className="
      grid
      grid-cols-2
      lg:grid-cols-4
      gap-4
    "
    >
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="
                bg-slate-900
                border
                border-slate-800
                rounded-2xl
                p-4
                md:p-5
              "
          >
            <div
              className="
                flex
                items-start
                justify-between
                gap-3
              "
            >
              <div>
                <p
                  className="
                    text-xs
                    text-slate-500
                    uppercase
                    tracking-wide
                  "
                >
                  {card.label}
                </p>

                {loading ? (
                  <div
                    className="
                      h-7
                      w-24
                      bg-slate-800
                      rounded-lg
                      animate-pulse
                      mt-2
                    "
                  ></div>
                ) : (
                  <p
                    className="
                      text-lg
                      md:text-xl
                      font-bold
                      text-white
                      mt-1
                    "
                  >
                    {card.value}
                  </p>
                )}

                <p
                  className="
                    text-xs
                    text-slate-500
                    mt-1
                  "
                >
                  {card.description}
                </p>
              </div>

              <div
                className="
                  w-10
                  h-10
                  rounded-xl
                  bg-blue-500/10
                  border
                  border-blue-500/20
                  flex
                  items-center
                  justify-center
                  shrink-0
                "
              >
                <Icon size={18} className="text-blue-400" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| TABLE
|--------------------------------------------------------------------------
*/

function ProposalTable({
  proposals,
  actionLoading,
  onApprove,
  onReject,
  onCancel,
}) {
  return (
    <div className="overflow-x-auto">
      <table
        className="
        w-full
        min-w-[1100px]
      "
      >
        <thead>
          <tr
            className="
            border-b
            border-slate-800
            text-left
          "
          >
            <th
              className="
              px-5
              py-4
              text-xs
              font-semibold
              text-slate-500
              uppercase
            "
            >
              Proposta
            </th>

            <th
              className="
              px-5
              py-4
              text-xs
              font-semibold
              text-slate-500
              uppercase
            "
            >
              Cliente
            </th>

            <th
              className="
              px-5
              py-4
              text-xs
              font-semibold
              text-slate-500
              uppercase
            "
            >
              Imóvel
            </th>

            <th
              className="
              px-5
              py-4
              text-xs
              font-semibold
              text-slate-500
              uppercase
            "
            >
              Corretor
            </th>

            <th
              className="
              px-5
              py-4
              text-xs
              font-semibold
              text-slate-500
              uppercase
            "
            >
              Valor
            </th>

            <th
              className="
              px-5
              py-4
              text-xs
              font-semibold
              text-slate-500
              uppercase
            "
            >
              Status
            </th>

            <th
              className="
              px-5
              py-4
              text-xs
              font-semibold
              text-slate-500
              uppercase
            "
            >
              Criada em
            </th>

            <th
              className="
              px-5
              py-4
              text-xs
              font-semibold
              text-slate-500
              uppercase
              text-right
            "
            >
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

/*
|--------------------------------------------------------------------------
| TABLE ROW
|--------------------------------------------------------------------------
*/

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

  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;

  const canApprove = status === 'pending';

  const canReject = status === 'pending';

  const canCancel = ['draft', 'pending'].includes(status);

  const canEdit = status === 'draft';

  return (
    <tr
      className="
      border-b
      border-slate-800/80
      hover:bg-slate-800/30
      transition
    "
    >
      {/* PROPOSAL */}

      <td
        className="
        px-5
        py-4
      "
      >
        <div>
          <Link
            to={`/proposals/${proposalId}`}
            className="
              text-sm
              font-semibold
              text-white
              hover:text-blue-400
              transition
            "
          >
            Proposta #{String(proposalId).slice(-6)}
          </Link>

          <p
            className="
            text-xs
            text-slate-500
            mt-1
          "
          >
            Atualizada {formatDateTime(proposal.updatedAt)}
          </p>
        </div>
      </td>

      {/* CLIENT */}

      <td
        className="
        px-5
        py-4
      "
      >
        <div
          className="
          flex
          items-center
          gap-3
        "
        >
          <Avatar name={getName(lead)} />

          <div className="min-w-0">
            <p
              className="
              text-sm
              text-slate-200
              font-medium
              truncate
              max-w-[180px]
            "
            >
              {getName(lead)}
            </p>

            {lead?.phone && (
              <p
                className="
                text-xs
                text-slate-500
                mt-1
              "
              >
                {lead.phone}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* PROPERTY */}

      <td
        className="
        px-5
        py-4
      "
      >
        <div className="max-w-[210px]">
          <p
            className="
            text-sm
            text-slate-200
            font-medium
            truncate
          "
          >
            {getName(property, 'Imóvel')}
          </p>

          {property?.code && (
            <p
              className="
              text-xs
              text-slate-500
              mt-1
            "
            >
              Código: {property.code}
            </p>
          )}
        </div>
      </td>

      {/* BROKER */}

      <td
        className="
        px-5
        py-4
      "
      >
        <div
          className="
          flex
          items-center
          gap-2
        "
        >
          <User size={15} className="text-slate-500" />

          <span
            className="
            text-sm
            text-slate-300
          "
          >
            {getName(broker, 'Não atribuído')}
          </span>
        </div>
      </td>

      {/* VALUE */}

      <td
        className="
        px-5
        py-4
      "
      >
        <p
          className="
          text-sm
          font-semibold
          text-emerald-400
        "
        >
          {formatCurrency(proposalPrice)}
        </p>
      </td>

      {/* STATUS */}

      <td
        className="
        px-5
        py-4
      "
      >
        <StatusBadge status={status} />
      </td>

      {/* DATE */}

      <td
        className="
        px-5
        py-4
      "
      >
        <p
          className="
          text-sm
          text-slate-300
        "
        >
          {formatDate(proposal.createdAt)}
        </p>
      </td>

      {/* ACTIONS */}

      <td
        className="
        px-5
        py-4
      "
      >
        <div
          className="
          flex
          items-center
          justify-end
          gap-1
        "
        >
          <IconButton
            title="Visualizar"
            to={`/proposals/${proposalId}`}
            icon={<Eye size={17} />}
          />

          {canEdit && (
            <IconButton
              title="Editar"
              to={`/proposals/${proposalId}/edit`}
              icon={<Edit3 size={17} />}
            />
          )}

          {canApprove && (
            <ActionButton
              title="Aprovar"
              loading={actionLoading === `approve-${proposalId}`}
              onClick={() => onApprove(proposal)}
              icon={<Check size={17} />}
              className="
                text-emerald-400
                hover:bg-emerald-500/10
              "
            />
          )}

          {canReject && (
            <ActionButton
              title="Rejeitar"
              loading={actionLoading === `reject-${proposalId}`}
              onClick={() => onReject(proposal)}
              icon={<X size={17} />}
              className="
                text-red-400
                hover:bg-red-500/10
              "
            />
          )}

          {canCancel && (
            <ActionButton
              title="Cancelar"
              loading={actionLoading === `cancel-${proposalId}`}
              onClick={() => onCancel(proposal)}
              icon={<XCircle size={17} />}
              className="
                text-orange-400
                hover:bg-orange-500/10
              "
            />
          )}

          <Link
            to={`/proposals/${proposalId}`}
            className="
              w-9
              h-9
              rounded-lg
              flex
              items-center
              justify-center
              text-slate-500
              hover:text-white
              hover:bg-slate-800
              transition
            "
            title="Detalhes"
          >
            <MoreHorizontal size={18} />
          </Link>
        </div>
      </td>
    </tr>
  );
}

/*
|--------------------------------------------------------------------------
| MOBILE CARD
|--------------------------------------------------------------------------
*/

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
    <div
      className="
      bg-slate-900
      border
      border-slate-800
      rounded-2xl
      p-4
    "
    >
      <div
        className="
        flex
        items-start
        justify-between
        gap-3
      "
      >
        <div
          className="
          flex
          items-center
          gap-3
          min-w-0
        "
        >
          <Avatar name={getName(lead)} />

          <div className="min-w-0">
            <Link
              to={`/proposals/${proposalId}`}
              className="
                text-sm
                font-semibold
                text-white
                hover:text-blue-400
              "
            >
              {getName(lead, 'Cliente')}
            </Link>

            <p
              className="
              text-xs
              text-slate-500
              mt-1
            "
            >
              Proposta #{String(proposalId).slice(-6)}
            </p>
          </div>
        </div>

        <StatusBadge status={status} />
      </div>

      <div
        className="
        mt-4
        p-3
        rounded-xl
        bg-slate-950
        border
        border-slate-800
      "
      >
        <p
          className="
          text-xs
          text-slate-500
          uppercase
        "
        >
          Imóvel
        </p>

        <p
          className="
          text-sm
          text-slate-200
          font-medium
          mt-1
        "
        >
          {getName(property, 'Imóvel')}
        </p>

        {property?.code && (
          <p
            className="
            text-xs
            text-slate-500
            mt-1
          "
          >
            Código: {property.code}
          </p>
        )}
      </div>

      <div
        className="
        grid
        grid-cols-2
        gap-4
        mt-4
      "
      >
        <div>
          <p
            className="
            text-xs
            text-slate-500
          "
          >
            Valor
          </p>

          <p
            className="
            text-sm
            font-bold
            text-emerald-400
            mt-1
          "
          >
            {formatCurrency(proposalPrice)}
          </p>
        </div>

        <div>
          <p
            className="
            text-xs
            text-slate-500
          "
          >
            Criada em
          </p>

          <p
            className="
            text-sm
            text-slate-300
            mt-1
          "
          >
            {formatDate(proposal.createdAt)}
          </p>
        </div>
      </div>

      <div
        className="
        flex
        flex-wrap
        gap-2
        mt-4
        pt-4
        border-t
        border-slate-800
      "
      >
        <Link
          to={`/proposals/${proposalId}`}
          className="
            flex-1
            min-w-[100px]
            inline-flex
            items-center
            justify-center
            gap-2
            px-3
            py-2.5
            rounded-xl
            bg-slate-800
            text-slate-200
            text-sm
            hover:bg-slate-700
            transition
          "
        >
          <Eye size={16} />
          Ver
        </Link>

        {canEdit && (
          <Link
            to={`/proposals/${proposalId}/edit`}
            className="
              flex-1
              min-w-[100px]
              inline-flex
              items-center
              justify-center
              gap-2
              px-3
              py-2.5
              rounded-xl
              border
              border-slate-700
              text-slate-300
              text-sm
              hover:bg-slate-800
              transition
            "
          >
            <Edit3 size={16} />
            Editar
          </Link>
        )}

        {canApprove && (
          <ActionButton
            title="Aprovar"
            loading={actionLoading === `approve-${proposalId}`}
            onClick={() => onApprove(proposal)}
            icon={<Check size={16} />}
            className="
              flex-1
              min-w-[100px]
              text-emerald-400
              border
              border-emerald-500/20
              hover:bg-emerald-500/10
            "
          />
        )}

        {canReject && (
          <ActionButton
            title="Rejeitar"
            loading={actionLoading === `reject-${proposalId}`}
            onClick={() => onReject(proposal)}
            icon={<X size={16} />}
            className="
              flex-1
              min-w-[100px]
              text-red-400
              border
              border-red-500/20
              hover:bg-red-500/10
            "
          />
        )}

        {canCancel && (
          <ActionButton
            title="Cancelar"
            loading={actionLoading === `cancel-${proposalId}`}
            onClick={() => onCancel(proposal)}
            icon={<XCircle size={16} />}
            className="
              flex-1
              min-w-[100px]
              text-orange-400
              border
              border-orange-500/20
              hover:bg-orange-500/10
            "
          />
        )}
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| STATUS BADGE
|--------------------------------------------------------------------------
*/

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;

  return (
    <span
      className={`
      inline-flex
      items-center
      gap-1.5
      px-2.5
      py-1.5
      rounded-lg
      border
      text-xs
      font-medium
      whitespace-nowrap
      ${config.className}
    `}
    >
      <span
        className="
        w-1.5
        h-1.5
        rounded-full
        bg-current
      "
      />

      {config.label}
    </span>
  );
}

/*
|--------------------------------------------------------------------------
| AVATAR
|--------------------------------------------------------------------------
*/

function Avatar({ name }) {
  const initials = String(name || 'U')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

  return (
    <div
      className="
      w-9
      h-9
      rounded-xl
      bg-blue-500/10
      border
      border-blue-500/20
      flex
      items-center
      justify-center
      shrink-0
    "
    >
      <span
        className="
        text-xs
        font-bold
        text-blue-300
      "
      >
        {initials}
      </span>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| ACTION BUTTON
|--------------------------------------------------------------------------
*/

function ActionButton({ title, icon, loading, onClick, className = '' }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={loading}
      className={`
        w-9
        h-9
        rounded-lg
        inline-flex
        items-center
        justify-center
        transition
        disabled:opacity-50
        disabled:cursor-not-allowed
        ${className}
      `}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : icon}
    </button>
  );
}

/*
|--------------------------------------------------------------------------
| ICON LINK BUTTON
|--------------------------------------------------------------------------
*/

function IconButton({ title, icon, to }) {
  return (
    <Link
      to={to}
      title={title}
      className="
        w-9
        h-9
        rounded-lg
        inline-flex
        items-center
        justify-center
        text-slate-400
        hover:text-white
        hover:bg-slate-800
        transition
      "
    >
      {icon}
    </Link>
  );
}

/*
|--------------------------------------------------------------------------
| FILTER INPUT
|--------------------------------------------------------------------------
*/

function FilterInput({ label, type = 'text', value, onChange, options = [] }) {
  return (
    <div>
      <label
        className="
        block
        text-xs
        text-slate-500
        mb-2
      "
      >
        {label}
      </label>

      {type === 'select' ? (
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="
            w-full
            bg-slate-950
            border
            border-slate-700
            rounded-xl
            px-4
            py-3
            text-sm
            text-white
            outline-none
            focus:border-blue-500
          "
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
            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-slate-500
            "
          />

          <input
            type={type}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="
              w-full
              bg-slate-950
              border
              border-slate-700
              rounded-xl
              pl-11
              pr-4
              py-3
              text-sm
              text-white
              outline-none
              focus:border-blue-500
            "
          />
        </div>
      )}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| PAGINATION
|--------------------------------------------------------------------------
*/

function Pagination({ pagination, pageNumbers, onPageChange }) {
  if (!pagination.pages || pagination.pages <= 1) {
    return null;
  }

  return (
    <div
      className="
      flex
      flex-col
      sm:flex-row
      sm:items-center
      sm:justify-between
      gap-4
      pt-2
    "
    >
      <p
        className="
        text-sm
        text-slate-500
      "
      >
        Página <span className="text-slate-300">{pagination.page}</span> de{' '}
        <span className="text-slate-300">{pagination.pages}</span>
      </p>

      <div
        className="
        flex
        items-center
        gap-1
      "
      >
        <button
          type="button"
          disabled={!pagination.hasPreviousPage}
          onClick={() => onPageChange(pagination.page - 1)}
          className="
            w-9
            h-9
            rounded-lg
            border
            border-slate-700
            flex
            items-center
            justify-center
            text-slate-400
            hover:bg-slate-800
            hover:text-white
            disabled:opacity-30
            disabled:cursor-not-allowed
            transition
          "
        >
          <ChevronLeft size={17} />
        </button>

        {pageNumbers.map((number) => (
          <button
            key={number}
            type="button"
            onClick={() => onPageChange(number)}
            className={`
                w-9
                h-9
                rounded-lg
                text-sm
                font-medium
                transition
                ${
                  number === pagination.page
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }
              `}
          >
            {number}
          </button>
        ))}

        <button
          type="button"
          disabled={!pagination.hasNextPage}
          onClick={() => onPageChange(pagination.page + 1)}
          className="
            w-9
            h-9
            rounded-lg
            border
            border-slate-700
            flex
            items-center
            justify-center
            text-slate-400
            hover:bg-slate-800
            hover:text-white
            disabled:opacity-30
            disabled:cursor-not-allowed
            transition
          "
        >
          <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| LOADING
|--------------------------------------------------------------------------
*/

function LoadingState() {
  return (
    <div
      className="
      bg-slate-900
      border
      border-slate-800
      rounded-2xl
      p-16
      flex
      flex-col
      items-center
      justify-center
      gap-4
    "
    >
      <Loader2
        size={32}
        className="
          animate-spin
          text-blue-500
        "
      />

      <p
        className="
        text-sm
        text-slate-500
      "
      >
        Carregando propostas...
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| EMPTY
|--------------------------------------------------------------------------
*/

function EmptyState({ hasFilters, onClear, onCreate }) {
  return (
    <div
      className="
      bg-slate-900
      border
      border-slate-800
      rounded-2xl
      p-12
      md:p-16
      flex
      flex-col
      items-center
      justify-center
      text-center
    "
    >
      <div
        className="
        w-16
        h-16
        rounded-2xl
        bg-slate-800
        flex
        items-center
        justify-center
      "
      >
        <FileText size={28} className="text-slate-500" />
      </div>

      <h3
        className="
        text-lg
        font-semibold
        text-white
        mt-5
      "
      >
        Nenhuma proposta encontrada
      </h3>

      <p
        className="
        text-sm
        text-slate-500
        max-w-md
        mt-2
      "
      >
        {hasFilters
          ? 'Tente ajustar ou limpar os filtros para encontrar outras propostas.'
          : 'Ainda não existem propostas cadastradas.'}
      </p>

      <div
        className="
        flex
        flex-wrap
        justify-center
        gap-3
        mt-6
      "
      >
        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="
              px-4
              py-2.5
              rounded-xl
              border
              border-slate-700
              text-slate-300
              hover:bg-slate-800
              transition
            "
          >
            Limpar filtros
          </button>
        )}

        <button
          type="button"
          onClick={onCreate}
          className="
            inline-flex
            items-center
            gap-2
            px-5
            py-2.5
            rounded-xl
            bg-blue-600
            hover:bg-blue-500
            text-white
            font-medium
            transition
          "
        >
          <Plus size={17} />
          Nova proposta
        </button>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| ALERT
|--------------------------------------------------------------------------
*/

function AlertBox({ type = 'error', message, onClose }) {
  const isError = type === 'error';

  return (
    <div
      className={`
      flex
      items-start
      gap-3
      rounded-xl
      border
      p-4
      ${
        isError
          ? 'bg-red-500/10 border-red-500/20 text-red-300'
          : 'bg-blue-500/10 border-blue-500/20 text-blue-300'
      }
    `}
    >
      {isError ? (
        <AlertCircle size={20} className="shrink-0 mt-0.5" />
      ) : (
        <Send size={20} className="shrink-0 mt-0.5" />
      )}

      <p className="text-sm flex-1">{message}</p>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="
            text-current
            opacity-60
            hover:opacity-100
          "
        >
          <X size={17} />
        </button>
      )}
    </div>
  );
}

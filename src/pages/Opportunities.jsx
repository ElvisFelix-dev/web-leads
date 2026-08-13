import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  Activity,
  ArrowDown,
  ArrowUp,
  Building2,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  DollarSign,
  Flame,
  List,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Target,
  TrendingUp,
  User,
  Users,
  X,
  Zap,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import { getOpportunities } from '../service/opportunityService';

/**
 * =========================================================
 * CONSTANTS
 * =========================================================
 */

const STAGES = [
  {
    value: 'nova',
    label: 'Nova',
    shortLabel: 'Nova',
  },
  {
    value: 'qualificacao',
    label: 'Qualificação',
    shortLabel: 'Qualificação',
  },
  {
    value: 'imovel_definido',
    label: 'Imóvel definido',
    shortLabel: 'Imóvel definido',
  },
  {
    value: 'visita_realizada',
    label: 'Visita realizada',
    shortLabel: 'Visita',
  },
  {
    value: 'interesse_confirmado',
    label: 'Interesse confirmado',
    shortLabel: 'Interesse',
  },
  {
    value: 'proposta_solicitada',
    label: 'Proposta solicitada',
    shortLabel: 'Proposta',
  },
  {
    value: 'proposta_enviada',
    label: 'Proposta enviada',
    shortLabel: 'Proposta enviada',
  },
  {
    value: 'negociacao',
    label: 'Negociação',
    shortLabel: 'Negociação',
  },
  {
    value: 'ganha',
    label: 'Ganha',
    shortLabel: 'Ganha',
  },
  {
    value: 'perdida',
    label: 'Perdida',
    shortLabel: 'Perdida',
  },
];

const STATUS = [
  {
    value: 'aberta',
    label: 'Aberta',
  },
  {
    value: 'ganha',
    label: 'Ganha',
  },
  {
    value: 'perdida',
    label: 'Perdida',
  },
];

const TEMPERATURES = [
  {
    value: 'quente',
    label: 'Quente',
    icon: '🔥',
  },
  {
    value: 'morno',
    label: 'Morno',
    icon: '🟡',
  },
  {
    value: 'frio',
    label: 'Frio',
    icon: '🔵',
  },
];

const PRIORITIES = [
  {
    value: 'baixa',
    label: 'Baixa',
  },
  {
    value: 'media',
    label: 'Média',
  },
  {
    value: 'alta',
    label: 'Alta',
  },
  {
    value: 'urgente',
    label: 'Urgente',
  },
];

const PAGE_LIMIT = 12;

/**
 * =========================================================
 * PAGE
 * =========================================================
 */

export default function Opportunities() {
  const navigate = useNavigate();

  /**
   * =======================================================
   * STATE
   * =======================================================
   */

  const [opportunities, setOpportunities] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState('');

  const [viewMode, setViewMode] = useState('list');

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    total: 0,
    pages: 0,
  });

  const [filters, setFilters] = useState({
    search: '',
    stage: '',
    status: '',
    temperature: '',
    priority: '',
    type: '',
  });

  const [searchInput, setSearchInput] = useState('');

  const [sortBy, setSortBy] = useState('createdAt');

  const [sortDirection, setSortDirection] = useState('desc');

  /**
   * =======================================================
   * FETCH
   * =======================================================
   */

  const fetchOpportunities = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError('');

        const response = await getOpportunities({
          ...filters,
          page,
          limit: PAGE_LIMIT,
        });

        console.log('📦 Resposta oportunidades:', response);

        const data =
          response?.opportunities ||
          response?.data?.opportunities ||
          response?.data ||
          response ||
          [];

        const safeData = Array.isArray(data) ? data : [];

        setOpportunities(safeData);

        if (response?.pagination) {
          setPagination(response.pagination);
        } else {
          setPagination({
            page,
            limit: PAGE_LIMIT,
            total: safeData.length,
            pages: safeData.length > 0 ? 1 : 0,
          });
        }
      } catch (err) {
        console.error('Erro ao buscar oportunidades:', err);

        setError(
          err?.response?.data?.message ||
            'Não foi possível carregar as oportunidades.',
        );

        setOpportunities([]);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filters, page],
  );

  /**
   * =======================================================
   * SEARCH DEBOUNCE
   * =======================================================
   */

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchInput,
      }));

      setPage(1);
    }, 350);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  /**
   * =======================================================
   * FETCH EFFECT
   * =======================================================
   */

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  /**
   * =======================================================
   * SUMMARY
   * =======================================================
   */

  const summary = useMemo(() => {
    const open = opportunities.filter((item) => item.status === 'aberta');

    const won = opportunities.filter(
      (item) => item.status === 'ganha' || item.stage === 'ganha',
    );

    const lost = opportunities.filter(
      (item) => item.status === 'perdida' || item.stage === 'perdida',
    );

    const totalValue = open.reduce(
      (total, opportunity) => total + getOpportunityValue(opportunity),
      0,
    );

    const weightedValue = open.reduce(
      (total, opportunity) => total + getWeightedValue(opportunity),
      0,
    );

    const averageProbability =
      open.length > 0
        ? open.reduce(
            (total, opportunity) =>
              total + Number(opportunity.probability || 0),
            0,
          ) / open.length
        : 0;

    const hot = open.filter((item) => item.temperature === 'quente');

    const highPriority = open.filter(
      (item) => item.priority === 'alta' || item.priority === 'urgente',
    );

    const upcomingActions = open.filter((item) => item.nextActionAt);

    return {
      total: pagination.total || opportunities.length,
      visible: opportunities.length,
      open: open.length,
      won: won.length,
      lost: lost.length,
      totalValue,
      weightedValue,
      averageProbability,
      hot: hot.length,
      highPriority: highPriority.length,
      upcomingActions: upcomingActions.length,
    };
  }, [opportunities, pagination.total]);

  /**
   * =======================================================
   * PIPELINE
   * =======================================================
   */

  const pipeline = useMemo(() => {
    return STAGES.map((stage) => {
      const items = opportunities.filter(
        (opportunity) => opportunity.stage === stage.value,
      );

      const value = items.reduce(
        (total, opportunity) => total + getOpportunityValue(opportunity),
        0,
      );

      return {
        ...stage,
        items,
        count: items.length,
        value,
      };
    });
  }, [opportunities]);

  /**
   * =======================================================
   * SORT
   * =======================================================
   */

  const sortedOpportunities = useMemo(() => {
    const result = [...opportunities];

    result.sort((a, b) => {
      let valueA;
      let valueB;

      if (sortBy === 'value') {
        valueA = getOpportunityValue(a);
        valueB = getOpportunityValue(b);
      } else if (sortBy === 'probability') {
        valueA = Number(a.probability || 0);
        valueB = Number(b.probability || 0);
      } else if (sortBy === 'closingDate') {
        valueA = new Date(a.expectedClosingDate || 0).getTime();

        valueB = new Date(b.expectedClosingDate || 0).getTime();
      } else {
        valueA = new Date(a.createdAt || 0).getTime();

        valueB = new Date(b.createdAt || 0).getTime();
      }

      if (sortDirection === 'asc') {
        return valueA - valueB;
      }

      return valueB - valueA;
    });

    return result;
  }, [opportunities, sortBy, sortDirection]);

  /**
   * =======================================================
   * FILTERS
   * =======================================================
   */

  const updateFilter = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));

    setPage(1);
  };

  const clearFilters = () => {
    setSearchInput('');

    setFilters({
      search: '',
      stage: '',
      status: '',
      temperature: '',
      priority: '',
      type: '',
    });

    setPage(1);
  };

  const hasFilters =
    Object.values(filters).some(Boolean) || Boolean(searchInput);

  /**
   * =======================================================
   * SORT
   * =======================================================
   */

  const handleSort = (value) => {
    if (sortBy === value) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));

      return;
    }

    setSortBy(value);
    setSortDirection('desc');
  };

  /**
   * =======================================================
   * NAVIGATION
   * =======================================================
   */

  const handleCreateOpportunity = () => {
    navigate('/opportunities/new');
  };

  const handleOpenOpportunity = (id) => {
    if (!id) return;

    navigate(`/opportunities/${id}`);
  };

  /**
   * =======================================================
   * PAGINATION
   * =======================================================
   */

  const handlePreviousPage = () => {
    if (page <= 1) return;

    setPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (pagination.pages && page >= pagination.pages) {
      return;
    }

    setPage((prev) => prev + 1);
  };

  /**
   * =======================================================
   * RENDER
   * =======================================================
   */

  return (
    <div className="min-h-screen bg-[#07090d] text-white">
      {/* ================================================= */}
      {/* BACKGROUND */}
      {/* ================================================= */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <header className="mb-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-500/10 shadow-lg shadow-indigo-500/5">
                  <Target className="h-5 w-5 text-indigo-400" />
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-400">
                    Gestão comercial
                  </p>

                  <h1 className="mt-0.5 text-2xl font-bold tracking-tight sm:text-3xl">
                    Oportunidades
                  </h1>
                </div>
              </div>

              <p className="max-w-2xl text-sm leading-6 text-gray-500">
                Acompanhe seus negócios, priorize oportunidades e mantenha o
                pipeline sempre em movimento.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  fetchOpportunities({
                    silent: true,
                  })
                }
                disabled={loading || refreshing}
                className="
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.03]
                  px-3.5
                  text-sm
                  font-medium
                  text-gray-300
                  transition
                  hover:border-white/15
                  hover:bg-white/[0.06]
                  hover:text-white
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
                />
                Atualizar
              </button>

              <button
                type="button"
                onClick={handleCreateOpportunity}
                className="
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-indigo-500
                  px-4
                  text-sm
                  font-semibold
                  text-white
                  shadow-xl
                  shadow-indigo-500/20
                  transition
                  hover:bg-indigo-400
                  hover:shadow-indigo-500/30
                "
              >
                <Plus className="h-4 w-4" />
                Nova oportunidade
              </button>
            </div>
          </div>
        </header>

        {/* ================================================= */}
        {/* KPI */}
        {/* ================================================= */}

        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <PremiumKpi
            icon={<DollarSign className="h-5 w-5" />}
            label="Pipeline aberto"
            value={formatCurrency(summary.totalValue)}
            description={`${summary.open} oportunidades em aberto`}
            trend={
              summary.averageProbability
                ? `${Math.round(
                    summary.averageProbability,
                  )}% probabilidade média`
                : 'Sem dados'
            }
            iconClass="bg-emerald-500/10 text-emerald-400"
          />

          <PremiumKpi
            icon={<TrendingUp className="h-5 w-5" />}
            label="Valor ponderado"
            value={formatCurrency(summary.weightedValue)}
            description="Previsão baseada na probabilidade"
            trend={`${Math.round(summary.averageProbability)}% médio`}
            iconClass="bg-indigo-500/10 text-indigo-400"
          />

          <PremiumKpi
            icon={<Flame className="h-5 w-5" />}
            label="Oportunidades quentes"
            value={summary.hot}
            description="Alta intenção comercial"
            trend={summary.hot > 0 ? 'Priorize agora' : 'Nenhuma quente'}
            iconClass="bg-orange-500/10 text-orange-400"
          />

          <PremiumKpi
            icon={<Zap className="h-5 w-5" />}
            label="Alta prioridade"
            value={summary.highPriority}
            description="Alta ou urgente"
            trend={`${summary.upcomingActions} com próxima ação`}
            iconClass="bg-amber-500/10 text-amber-400"
          />
        </div>

        {/* ================================================= */}
        {/* SECONDARY METRICS */}
        {/* ================================================= */}

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <MiniMetric
            icon={<Target className="h-4 w-4" />}
            label="Total"
            value={summary.total}
          />

          <MiniMetric
            icon={<CheckCircle2 className="h-4 w-4" />}
            label="Ganhas"
            value={summary.won}
          />

          <MiniMetric
            icon={<Activity className="h-4 w-4" />}
            label="Perdidas"
            value={summary.lost}
          />
        </div>

        {/* ================================================= */}
        {/* PIPELINE OVERVIEW */}
        {/* ================================================= */}

        {!loading && opportunities.length > 0 && (
          <PipelineOverview pipeline={pipeline} />
        )}

        {/* ================================================= */}
        {/* TOOLBAR */}
        {/* ================================================= */}

        <div className="mb-5 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] shadow-2xl shadow-black/10">
          <div className="flex flex-col gap-4 p-4 xl:flex-row xl:items-center xl:justify-between">
            {/* SEARCH */}

            <div className="relative min-w-0 flex-1 xl:max-w-xl">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-600" />

              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Buscar por título, descrição ou observação..."
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-white/[0.08]
                  bg-black/20
                  pl-10
                  pr-10
                  text-sm
                  text-white
                  outline-none
                  transition
                  placeholder:text-gray-600
                  focus:border-indigo-500/40
                  focus:bg-black/30
                  focus:ring-2
                  focus:ring-indigo-500/10
                "
              />

              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 transition hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* VIEW */}

            <div className="flex items-center gap-2">
              <div className="flex rounded-xl border border-white/[0.08] bg-black/20 p-1">
                <ViewButton
                  active={viewMode === 'list'}
                  icon={<List className="h-4 w-4" />}
                  label="Lista"
                  onClick={() => setViewMode('list')}
                />

                <ViewButton
                  active={viewMode === 'pipeline'}
                  icon={<Activity className="h-4 w-4" />}
                  label="Pipeline"
                  onClick={() => setViewMode('pipeline')}
                />
              </div>

              <div className="hidden h-7 w-px bg-white/10 sm:block" />

              <select
                value={`${sortBy}:${sortDirection}`}
                onChange={(event) => {
                  const [nextSort, nextDirection] =
                    event.target.value.split(':');

                  setSortBy(nextSort);
                  setSortDirection(nextDirection);
                }}
                className="
                  h-10
                  rounded-xl
                  border
                  border-white/[0.08]
                  bg-black/20
                  px-3
                  text-xs
                  text-gray-300
                  outline-none
                  focus:border-indigo-500/40
                "
              >
                <option value="createdAt:desc">Mais recentes</option>

                <option value="createdAt:asc">Mais antigas</option>

                <option value="value:desc">Maior valor</option>

                <option value="value:asc">Menor valor</option>

                <option value="probability:desc">Maior probabilidade</option>

                <option value="closingDate:asc">Fechamento próximo</option>
              </select>
            </div>
          </div>

          {/* FILTERS */}

          <div className="border-t border-white/[0.06] px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <FilterSelect
                value={filters.stage}
                onChange={(value) => updateFilter('stage', value)}
                placeholder="Estágio"
                options={STAGES}
              />

              <FilterSelect
                value={filters.status}
                onChange={(value) => updateFilter('status', value)}
                placeholder="Status"
                options={STATUS}
              />

              <FilterSelect
                value={filters.temperature}
                onChange={(value) => updateFilter('temperature', value)}
                placeholder="Temperatura"
                options={TEMPERATURES}
              />

              <FilterSelect
                value={filters.priority}
                onChange={(value) => updateFilter('priority', value)}
                placeholder="Prioridade"
                options={PRIORITIES}
              />

              <select
                value={filters.type}
                onChange={(event) => updateFilter('type', event.target.value)}
                className="
                  h-9
                  rounded-lg
                  border
                  border-white/[0.08]
                  bg-black/20
                  px-3
                  text-xs
                  text-gray-400
                  outline-none
                  transition
                  hover:border-white/15
                  focus:border-indigo-500/40
                "
              >
                <option value="">Tipo</option>

                <option value="venda">Venda</option>

                <option value="locacao">Locação</option>
              </select>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="
                    inline-flex
                    h-9
                    items-center
                    gap-1.5
                    rounded-lg
                    px-2.5
                    text-xs
                    font-medium
                    text-gray-500
                    transition
                    hover:bg-white/[0.04]
                    hover:text-white
                  "
                >
                  <X className="h-3.5 w-3.5" />
                  Limpar filtros
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <ErrorState message={error} onRetry={() => fetchOpportunities()} />
        )}

        {/* ================================================= */}
        {/* CONTENT */}
        {/* ================================================= */}

        {loading ? (
          <PremiumLoading />
        ) : opportunities.length === 0 ? (
          <EmptyState
            hasFilters={hasFilters}
            onCreate={handleCreateOpportunity}
            onClear={clearFilters}
          />
        ) : viewMode === 'pipeline' ? (
          <PipelineView pipeline={pipeline} onOpen={handleOpenOpportunity} />
        ) : (
          <>
            {/* RESULT HEADER */}

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-white">
                    Oportunidades
                  </h2>

                  <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-gray-400">
                    {pagination.total || opportunities.length}
                  </span>
                </div>

                <p className="mt-1 text-xs text-gray-600">
                  Mostrando {opportunities.length} oportunidades nesta página.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>
                  Página {page}
                  {pagination.pages ? ` de ${pagination.pages}` : ''}
                </span>
              </div>
            </div>

            {/* LIST */}

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {sortedOpportunities.map((opportunity) => (
                <OpportunityCard
                  key={opportunity._id}
                  opportunity={opportunity}
                  onClick={() => handleOpenOpportunity(opportunity._id)}
                />
              ))}
            </div>

            {/* PAGINATION */}

            {pagination.pages > 1 && (
              <Pagination
                page={page}
                pages={pagination.pages}
                total={pagination.total}
                onPrevious={handlePreviousPage}
                onNext={handleNextPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * =========================================================
 * KPI
 * =========================================================
 */

function PremiumKpi({ icon, label, value, description, trend, iconClass }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition hover:border-white/[0.12] hover:bg-white/[0.035]">
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-indigo-500/[0.03] blur-2xl transition group-hover:bg-indigo-500/[0.06]" />

      <div className="relative">
        <div className="mb-5 flex items-start justify-between">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
          >
            {icon}
          </div>

          <MoreHorizontal className="h-4 w-4 text-gray-700" />
        </div>

        <p className="text-xs font-medium text-gray-500">{label}</p>

        <p className="mt-1 text-2xl font-bold tracking-tight text-white">
          {value}
        </p>

        <div className="mt-3 flex flex-col gap-1">
          <p className="text-[11px] text-gray-600">{description}</p>

          <p className="text-[11px] font-medium text-indigo-400/80">{trend}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * =========================================================
 * MINI METRIC
 * =========================================================
 */

function MiniMetric({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.04] text-gray-500">
        {icon}
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-wider text-gray-600">
          {label}
        </p>

        <p className="mt-0.5 text-sm font-semibold text-gray-300">{value}</p>
      </div>
    </div>
  );
}

/**
 * =========================================================
 * PIPELINE OVERVIEW
 * =========================================================
 */

function PipelineOverview({ pipeline }) {
  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]">
      <div className="border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Pipeline</p>

            <p className="mt-0.5 text-xs text-gray-600">
              Distribuição das oportunidades por estágio.
            </p>
          </div>

          <TrendingUp className="h-4 w-4 text-gray-600" />
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-white/[0.05] sm:grid-cols-5 xl:grid-cols-10">
        {pipeline.map((stage) => (
          <div
            key={stage.value}
            className="group min-w-0 px-3 py-4 transition hover:bg-white/[0.025]"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="truncate text-[10px] font-medium uppercase tracking-wide text-gray-600">
                {stage.shortLabel}
              </span>

              <span className="text-[10px] font-semibold text-gray-500">
                {stage.count}
              </span>
            </div>

            <p className="truncate text-xs font-semibold text-gray-300">
              {formatCurrencyCompact(stage.value)}
            </p>

            <div className="mt-3 h-1 overflow-hidden rounded-full bg-gray-800">
              <div
                className="h-full rounded-full bg-indigo-500/70 transition-all group-hover:bg-indigo-400"
                style={{
                  width: `${Math.min(stage.count * 12, 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * =========================================================
 * VIEW BUTTON
 * =========================================================
 */

function ViewButton({ active, icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex
        h-8
        items-center
        gap-1.5
        rounded-lg
        px-3
        text-xs
        font-medium
        transition
        ${
          active
            ? 'bg-indigo-500/15 text-indigo-300 shadow-sm'
            : 'text-gray-600 hover:text-gray-300'
        }
      `}
    >
      {icon}

      {label}
    </button>
  );
}

/**
 * =========================================================
 * FILTER SELECT
 * =========================================================
 */

function FilterSelect({ value, onChange, placeholder, options }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="
        h-9
        max-w-[170px]
        rounded-lg
        border
        border-white/[0.08]
        bg-black/20
        px-3
        text-xs
        text-gray-400
        outline-none
        transition
        hover:border-white/15
        focus:border-indigo-500/40
      "
    >
      <option value="">{placeholder}</option>

      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.icon ? `${option.icon} ${option.label}` : option.label}
        </option>
      ))}
    </select>
  );
}

/**
 * =========================================================
 * OPPORTUNITY CARD
 * =========================================================
 */

function OpportunityCard({ opportunity, onClick }) {
  const value = getOpportunityValue(opportunity);

  const weightedValue = getWeightedValue(opportunity);

  const probability = Number(opportunity.probability || 0);

  const lead = normalizeObject(opportunity.lead);

  const property = normalizeObject(opportunity.property);

  const assignedTo = normalizeObject(opportunity.assignedTo);

  const stage = getStageConfig(opportunity.stage);

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        relative
        w-full
        overflow-hidden
        rounded-2xl
        border
        border-white/[0.07]
        bg-white/[0.025]
        p-5
        text-left
        shadow-lg
        shadow-black/10
        transition-all
        duration-200
        hover:-translate-y-1
        hover:border-indigo-500/25
        hover:bg-white/[0.035]
        hover:shadow-2xl
        hover:shadow-black/20
      "
    >
      {/* ACCENT */}

      <div
        className={`absolute left-0 top-0 h-full w-0.5 ${getStageAccent(
          opportunity.stage,
        )}`}
      />

      {/* HEADER */}

      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={opportunity.status} />

            <TemperatureBadge temperature={opportunity.temperature} />

            {opportunity.priority && (
              <PriorityBadge priority={opportunity.priority} />
            )}
          </div>

          <h3 className="truncate text-[15px] font-semibold text-white transition group-hover:text-indigo-100">
            {opportunity.title || 'Sem título'}
          </h3>

          <p className="mt-1 truncate text-xs text-gray-600">
            {formatOpportunityType(opportunity.type)}
          </p>
        </div>

        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-gray-700 transition group-hover:translate-x-0.5 group-hover:text-indigo-400" />
      </div>

      {/* VALUE */}

      <div className="mb-5 rounded-xl border border-white/[0.05] bg-black/20 p-3.5">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-gray-700">
              Valor esperado
            </p>

            <p className="mt-1 truncate text-xl font-bold tracking-tight text-white">
              {formatCurrency(value)}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-gray-700">
              Ponderado
            </p>

            <p className="mt-1 text-sm font-semibold text-indigo-400">
              {formatCurrency(weightedValue)}
            </p>
          </div>
        </div>
      </div>

      {/* LEAD */}

      {lead && (
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <User className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-700">
              Lead
            </p>

            <p className="truncate text-xs font-medium text-gray-300">
              {lead.name || 'Lead'}
            </p>
          </div>
        </div>
      )}

      {/* PROPERTY */}

      {property && (
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <Building2 className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-700">
              Imóvel
            </p>

            <p className="truncate text-xs font-medium text-gray-400">
              {property.name || property.title || 'Imóvel vinculado'}
            </p>
          </div>
        </div>
      )}

      {/* STAGE */}

      <div className="mb-5 rounded-xl border border-white/[0.05] bg-white/[0.015] p-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <div
              className={`h-2 w-2 shrink-0 rounded-full ${getStageDot(
                opportunity.stage,
              )}`}
            />

            <span className="truncate text-xs font-medium text-gray-400">
              {stage.label}
            </span>
          </div>

          <span className="shrink-0 text-xs font-semibold text-indigo-400">
            {probability}%
          </span>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{
              width: `${Math.min(Math.max(probability, 0), 100)}%`,
            }}
          />
        </div>
      </div>

      {/* FOOTER */}

      <div className="flex items-center justify-between gap-3 border-t border-white/[0.05] pt-4">
        <div className="min-w-0">
          {assignedTo ? (
            <div className="flex items-center gap-2">
              {assignedTo.avatar ? (
                <img
                  src={assignedTo.avatar}
                  alt={assignedTo.name || 'Corretor'}
                  className="h-7 w-7 rounded-full border border-white/10 object-cover"
                />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-800 text-[10px] font-bold text-gray-400">
                  {getInitials(assignedTo.name)}
                </div>
              )}

              <div className="min-w-0">
                <p className="truncate text-[10px] uppercase tracking-wider text-gray-700">
                  Responsável
                </p>

                <p className="truncate text-xs text-gray-400">
                  {assignedTo.name || 'Corretor'}
                </p>
              </div>
            </div>
          ) : (
            <span className="text-xs text-gray-700">Sem responsável</span>
          )}
        </div>

        {opportunity.expectedClosingDate && (
          <div className="flex shrink-0 items-center gap-1.5 text-gray-600">
            <CalendarDays className="h-3.5 w-3.5" />

            <span className="text-[10px]">
              {formatDate(opportunity.expectedClosingDate)}
            </span>
          </div>
        )}
      </div>

      {/* NEXT ACTION */}

      {opportunity.nextAction && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-indigo-500/10 bg-indigo-500/[0.04] px-3 py-2.5">
          <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-400" />

          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-indigo-400/60">
              Próxima ação
            </p>

            <p className="mt-0.5 truncate text-xs text-gray-400">
              {opportunity.nextAction}
            </p>
          </div>
        </div>
      )}
    </button>
  );
}

/**
 * =========================================================
 * STATUS
 * =========================================================
 */

function StatusBadge({ status }) {
  const config = {
    aberta: {
      label: 'Aberta',
      className: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
    },

    ganha: {
      label: 'Ganha',
      className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    },

    perdida: {
      label: 'Perdida',
      className: 'border-red-500/20 bg-red-500/10 text-red-400',
    },
  };

  const item = config[status] || config.aberta;

  return (
    <span
      className={`
        inline-flex
        rounded-full
        border
        px-2
        py-0.5
        text-[9px]
        font-semibold
        ${item.className}
      `}
    >
      {item.label}
    </span>
  );
}

/**
 * =========================================================
 * TEMPERATURE
 * =========================================================
 */

function TemperatureBadge({ temperature }) {
  const config = {
    quente: {
      label: 'Quente',
      icon: '🔥',
      className: 'border-orange-500/20 bg-orange-500/10 text-orange-400',
    },

    morno: {
      label: 'Morno',
      icon: '🟡',
      className: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400',
    },

    frio: {
      label: 'Frio',
      icon: '🔵',
      className: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
    },
  };

  const item = config[temperature] || config.morno;

  return (
    <span
      className={`
        inline-flex
        shrink-0
        items-center
        gap-1
        rounded-full
        border
        px-2
        py-0.5
        text-[9px]
        font-medium
        ${item.className}
      `}
    >
      <span>{item.icon}</span>

      {item.label}
    </span>
  );
}

/**
 * =========================================================
 * PRIORITY
 * =========================================================
 */

function PriorityBadge({ priority }) {
  const config = {
    baixa: {
      label: 'Baixa',
      className: 'border-white/10 bg-white/[0.03] text-gray-500',
    },

    media: {
      label: 'Média',
      className: 'border-yellow-500/10 bg-yellow-500/5 text-yellow-500/70',
    },

    alta: {
      label: 'Alta',
      className: 'border-orange-500/15 bg-orange-500/5 text-orange-400',
    },

    urgente: {
      label: 'Urgente',
      className: 'border-red-500/20 bg-red-500/10 text-red-400',
    },
  };

  const item = config[priority] || config.media;

  return (
    <span
      className={`
        hidden
        rounded-full
        border
        px-2
        py-0.5
        text-[9px]
        font-medium
        md:inline-flex
        ${item.className}
      `}
    >
      {item.label}
    </span>
  );
}

/**
 * =========================================================
 * PIPELINE VIEW
 * =========================================================
 */

function PipelineView({ pipeline, onOpen }) {
  return (
    <div className="-mx-1 overflow-x-auto pb-4">
      <div className="flex min-w-max gap-4 px-1">
        {pipeline.map((stage) => (
          <div
            key={stage.value}
            className="w-[290px] rounded-2xl border border-white/[0.07] bg-white/[0.02]"
          >
            {/* HEADER */}

            <div className="border-b border-white/[0.06] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${getStageDot(
                      stage.value,
                    )}`}
                  />

                  <h3 className="text-xs font-semibold text-gray-300">
                    {stage.label}
                  </h3>
                </div>

                <span className="rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                  {stage.count}
                </span>
              </div>

              <p className="mt-2 text-sm font-bold text-white">
                {formatCurrencyCompact(stage.value)}
              </p>
            </div>

            {/* CARDS */}

            <div className="space-y-2 p-3">
              {stage.items.length === 0 ? (
                <div className="flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-white/[0.06]">
                  <p className="text-[11px] text-gray-700">
                    Nenhuma oportunidade
                  </p>
                </div>
              ) : (
                stage.items.map((opportunity) => (
                  <PipelineCard
                    key={opportunity._id}
                    opportunity={opportunity}
                    onClick={() => onOpen(opportunity._id)}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * =========================================================
 * PIPELINE CARD
 * =========================================================
 */

function PipelineCard({ opportunity, onClick }) {
  const lead = normalizeObject(opportunity.lead);

  const value = getOpportunityValue(opportunity);

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        w-full
        rounded-xl
        border
        border-white/[0.06]
        bg-black/20
        p-3
        text-left
        transition
        hover:border-indigo-500/20
        hover:bg-white/[0.025]
      "
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="line-clamp-2 text-xs font-semibold text-gray-300">
          {opportunity.title || 'Sem título'}
        </p>

        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-700 group-hover:text-indigo-400" />
      </div>

      {lead && (
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
            <User className="h-3 w-3" />
          </div>

          <span className="truncate text-[10px] text-gray-600">
            {lead.name || 'Lead'}
          </span>
        </div>
      )}

      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-[9px] uppercase tracking-wider text-gray-700">
            Valor
          </p>

          <p className="mt-0.5 text-xs font-bold text-white">
            {formatCurrency(value)}
          </p>
        </div>

        <span className="text-[10px] font-semibold text-indigo-400">
          {Number(opportunity.probability || 0)}%
        </span>
      </div>
    </button>
  );
}

/**
 * =========================================================
 * EMPTY STATE
 * =========================================================
 */

function EmptyState({ hasFilters, onCreate, onClear }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] px-6 py-20 text-center">
      <div className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-indigo-500/5 blur-3xl" />

      <div className="relative">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-500/10 bg-indigo-500/5">
          <Target className="h-7 w-7 text-indigo-400" />
        </div>

        <h2 className="text-lg font-semibold text-white">
          {hasFilters
            ? 'Nenhuma oportunidade encontrada'
            : 'Seu pipeline está vazio'}
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">
          {hasFilters
            ? 'Não encontramos oportunidades com os filtros selecionados. Tente ajustar sua busca.'
            : 'Crie sua primeira oportunidade e comece a acompanhar seus negócios do primeiro contato até o fechamento.'}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {hasFilters && (
            <button
              type="button"
              onClick={onClear}
              className="
                inline-flex
                h-10
                items-center
                gap-2
                rounded-xl
                border
                border-white/10
                bg-white/[0.03]
                px-4
                text-sm
                font-medium
                text-gray-400
                transition
                hover:bg-white/[0.06]
                hover:text-white
              "
            >
              <X className="h-4 w-4" />
              Limpar filtros
            </button>
          )}

          <button
            type="button"
            onClick={onCreate}
            className="
              inline-flex
              h-10
              items-center
              gap-2
              rounded-xl
              bg-indigo-500
              px-4
              text-sm
              font-semibold
              text-white
              shadow-lg
              shadow-indigo-500/20
              transition
              hover:bg-indigo-400
            "
          >
            <Plus className="h-4 w-4" />
            Criar oportunidade
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * =========================================================
 * ERROR
 * =========================================================
 */

function ErrorState({ message, onRetry }) {
  return (
    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-red-500/15 bg-red-500/5 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-red-300">
          Não foi possível carregar as oportunidades.
        </p>

        <p className="mt-1 text-xs text-red-400/70">{message}</p>
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-red-500/10 px-3 text-xs font-semibold text-red-300 transition hover:bg-red-500/20"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Tentar novamente
      </button>
    </div>
  );
}

/**
 * =========================================================
 * LOADING
 * =========================================================
 */

function PremiumLoading() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({
        length: 6,
      }).map((_, index) => (
        <div
          key={index}
          className="h-[390px] animate-pulse rounded-2xl border border-white/[0.05] bg-white/[0.025]"
        />
      ))}
    </div>
  );
}

/**
 * =========================================================
 * PAGINATION
 * =========================================================
 */

function Pagination({ page, pages, total, onPrevious, onNext }) {
  return (
    <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-gray-600">{total} oportunidades no total</p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={onPrevious}
          className="
            inline-flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            border
            border-white/[0.08]
            bg-white/[0.02]
            text-gray-500
            transition
            hover:bg-white/[0.05]
            hover:text-white
            disabled:cursor-not-allowed
            disabled:opacity-30
          "
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-indigo-500/10 px-3 text-xs font-semibold text-indigo-300">
          {page}
        </div>

        <span className="text-xs text-gray-700">de {pages}</span>

        <button
          type="button"
          disabled={page >= pages}
          onClick={onNext}
          className="
            inline-flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            border
            border-white/[0.08]
            bg-white/[0.02]
            text-gray-500
            transition
            hover:bg-white/[0.05]
            hover:text-white
            disabled:cursor-not-allowed
            disabled:opacity-30
          "
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * =========================================================
 * HELPERS
 * =========================================================
 */

function normalizeObject(value) {
  if (!value) {
    return null;
  }

  if (typeof value === 'object') {
    return value;
  }

  return null;
}

function getOpportunityValue(opportunity) {
  return Number(
    opportunity?.expectedClosingValue || opportunity?.estimatedValue || 0,
  );
}

function getWeightedValue(opportunity) {
  const explicitValue = Number(opportunity?.weightedValue);

  if (Number.isFinite(explicitValue) && explicitValue > 0) {
    return explicitValue;
  }

  const value = getOpportunityValue(opportunity);

  const probability = Number(opportunity?.probability || 0);

  return (value * probability) / 100;
}

function getStageConfig(stage) {
  return (
    STAGES.find((item) => item.value === stage) || {
      value: stage,
      label: stage || 'Sem estágio',
      shortLabel: stage || 'Sem estágio',
    }
  );
}

function getStageDot(stage) {
  const dots = {
    nova: 'bg-slate-400',
    qualificacao: 'bg-blue-400',
    imovel_definido: 'bg-indigo-400',
    visita_realizada: 'bg-violet-400',
    interesse_confirmado: 'bg-purple-400',
    proposta_solicitada: 'bg-fuchsia-400',
    proposta_enviada: 'bg-pink-400',
    negociacao: 'bg-amber-400',
    ganha: 'bg-emerald-400',
    perdida: 'bg-red-400',
  };

  return dots[stage] || 'bg-gray-500';
}

function getStageAccent(stage) {
  const accents = {
    nova: 'bg-slate-500',
    qualificacao: 'bg-blue-500',
    imovel_definido: 'bg-indigo-500',
    visita_realizada: 'bg-violet-500',
    interesse_confirmado: 'bg-purple-500',
    proposta_solicitada: 'bg-fuchsia-500',
    proposta_enviada: 'bg-pink-500',
    negociacao: 'bg-amber-500',
    ganha: 'bg-emerald-500',
    perdida: 'bg-red-500',
  };

  return accents[stage] || 'bg-gray-500';
}

function formatOpportunityType(type) {
  if (type === 'locacao') {
    return 'Locação';
  }

  if (type === 'venda') {
    return 'Venda';
  }

  return type || 'Negócio';
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatCurrencyCompact(value) {
  const number = Number(value) || 0;

  if (number >= 1000000) {
    return `R$ ${(number / 1000000).toFixed(1).replace('.', ',')} mi`;
  }

  if (number >= 1000) {
    return `R$ ${(number / 1000).toFixed(0).replace('.', ',')} mil`;
  }

  return formatCurrency(number);
}

function formatDate(date) {
  if (!date) {
    return '—';
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return '—';
  }

  return parsedDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
}

function getInitials(name) {
  if (!name) {
    return 'U';
  }

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0])
    .join('')
    .toUpperCase();
}

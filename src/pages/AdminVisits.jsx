import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  CalendarDays,
  Clock3,
  Search,
  RefreshCw,
  MapPin,
  User,
  Building2,
  CheckCircle2,
  XCircle,
  CalendarCheck,
  Eye,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  BriefcaseBusiness,
  AlertCircle,
  ArrowUpRight,
  SlidersHorizontal,
  Sparkles,
  CalendarClock,
  CircleDot,
  Video,
  PhoneCall,
  Handshake,
  FileText,
  Settings2,
  MoreHorizontal,
  X,
} from 'lucide-react';

import {
  getVisits,
  confirmVisit,
  completeVisit,
  cancelVisit,
} from '../service/visitApi';

// ============================================================
// STATUS
// ============================================================

const VISIT_STATUS = {
  SCHEDULED: 'agendada',
  CONFIRMED: 'confirmada',
  COMPLETED: 'concluida',
  CANCELLED: 'cancelada',
};

const STATUS_CONFIG = {
  [VISIT_STATUS.SCHEDULED]: {
    label: 'Agendada',
    className: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
    dot: 'bg-blue-400',
    icon: CalendarDays,
  },

  [VISIT_STATUS.CONFIRMED]: {
    label: 'Confirmada',
    className: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
    dot: 'bg-amber-400',
    icon: CalendarCheck,
  },

  [VISIT_STATUS.COMPLETED]: {
    label: 'Concluída',
    className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    dot: 'bg-emerald-400',
    icon: CheckCircle2,
  },

  [VISIT_STATUS.CANCELLED]: {
    label: 'Cancelada',
    className: 'border-red-500/20 bg-red-500/10 text-red-400',
    dot: 'bg-red-400',
    icon: XCircle,
  },
};

// ============================================================
// CALENDAR TYPES
// Compatível com seu calendarService
// ============================================================

const CALENDAR_TYPES = {
  VISIT: 'visit',
  MEETING: 'meeting',
  CALL: 'call',
  ONLINE_MEETING: 'online_meeting',
  PROPOSAL: 'proposal',
  NEGOTIATION: 'negotiation',
  INTERNAL: 'internal',
  OTHER: 'other',
};

const TYPE_ALIASES = {
  visit: CALENDAR_TYPES.VISIT,
  visita: CALENDAR_TYPES.VISIT,

  meeting: CALENDAR_TYPES.MEETING,
  reuniao: CALENDAR_TYPES.MEETING,
  reunião: CALENDAR_TYPES.MEETING,

  call: CALENDAR_TYPES.CALL,
  ligação: CALENDAR_TYPES.CALL,
  ligacao: CALENDAR_TYPES.CALL,

  online_meeting: CALENDAR_TYPES.ONLINE_MEETING,
  'online-meeting': CALENDAR_TYPES.ONLINE_MEETING,
  online: CALENDAR_TYPES.ONLINE_MEETING,
  videoconferencia: CALENDAR_TYPES.ONLINE_MEETING,
  videoconferência: CALENDAR_TYPES.ONLINE_MEETING,

  proposal: CALENDAR_TYPES.PROPOSAL,
  proposta: CALENDAR_TYPES.PROPOSAL,

  negotiation: CALENDAR_TYPES.NEGOTIATION,
  negociacao: CALENDAR_TYPES.NEGOTIATION,
  negociação: CALENDAR_TYPES.NEGOTIATION,

  internal: CALENDAR_TYPES.INTERNAL,
  interno: CALENDAR_TYPES.INTERNAL,

  other: CALENDAR_TYPES.OTHER,
  outro: CALENDAR_TYPES.OTHER,
};

// ============================================================
// TYPE CONFIG
// ============================================================

const TYPE_CONFIG = {
  [CALENDAR_TYPES.VISIT]: {
    label: 'Visita',
    plural: 'Visitas',
    description: 'Visitas a imóveis',
    icon: CalendarDays,
    className: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
    dot: 'bg-blue-400',
    glow: 'bg-blue-500/10',
  },

  [CALENDAR_TYPES.MEETING]: {
    label: 'Reunião',
    plural: 'Reuniões',
    description: 'Reuniões presenciais',
    icon: Handshake,
    className: 'border-violet-500/20 bg-violet-500/10 text-violet-400',
    dot: 'bg-violet-400',
    glow: 'bg-violet-500/10',
  },

  [CALENDAR_TYPES.CALL]: {
    label: 'Ligação',
    plural: 'Ligações',
    description: 'Ligações e contatos',
    icon: PhoneCall,
    className: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400',
    dot: 'bg-cyan-400',
    glow: 'bg-cyan-500/10',
  },

  [CALENDAR_TYPES.ONLINE_MEETING]: {
    label: 'Reunião online',
    plural: 'Reuniões online',
    description: 'Videoconferências',
    icon: Video,
    className: 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400',
    dot: 'bg-indigo-400',
    glow: 'bg-indigo-500/10',
  },

  [CALENDAR_TYPES.PROPOSAL]: {
    label: 'Proposta',
    plural: 'Propostas',
    description: 'Compromissos de proposta',
    icon: FileText,
    className: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
    dot: 'bg-amber-400',
    glow: 'bg-amber-500/10',
  },

  [CALENDAR_TYPES.NEGOTIATION]: {
    label: 'Negociação',
    plural: 'Negociações',
    description: 'Negociações comerciais',
    icon: Handshake,
    className: 'border-orange-500/20 bg-orange-500/10 text-orange-400',
    dot: 'bg-orange-400',
    glow: 'bg-orange-500/10',
  },

  [CALENDAR_TYPES.INTERNAL]: {
    label: 'Interno',
    plural: 'Internos',
    description: 'Compromissos internos',
    icon: Settings2,
    className: 'border-slate-500/20 bg-slate-500/10 text-slate-400',
    dot: 'bg-slate-400',
    glow: 'bg-slate-500/10',
  },

  [CALENDAR_TYPES.OTHER]: {
    label: 'Outro',
    plural: 'Outros',
    description: 'Outros compromissos',
    icon: MoreHorizontal,
    className: 'border-pink-500/20 bg-pink-500/10 text-pink-400',
    dot: 'bg-pink-400',
    glow: 'bg-pink-500/10',
  },
};

// ============================================================
// COMPONENT
// ============================================================

export default function VisitsAdmin() {
  const navigate = useNavigate();

  const [visits, setVisits] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState('');

  // ==========================================================
  // FILTERS
  // ==========================================================

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  });

  // ==========================================================
  // ACTION
  // ==========================================================

  const [processingId, setProcessingId] = useState(null);

  // ==========================================================
  // ACTIVE FILTERS
  // ==========================================================

  const hasFilters = Boolean(search || status || type || startDate || endDate);

  // ==========================================================
  // LOAD
  // ==========================================================

  const loadVisits = async ({
    showRefresh = false,
    currentPage = page,
  } = {}) => {
    try {
      setError('');

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getVisits({
        page: currentPage,
        limit,

        search: search.trim(),

        status,

        // IMPORTANTE:
        // envia o tipo para o backend
        type,

        startDate,
        endDate,

        sortBy: 'date',
        order: 'asc',
      });

      const data = response?.data || response;

      setVisits(data?.visits || []);

      setPagination(
        data?.pagination || {
          total: 0,
          page: currentPage,
          limit,
          pages: 1,
        },
      );
    } catch (err) {
      console.error('ERRO AO BUSCAR AGENDA:', err);

      setError(
        err?.response?.data?.message ||
          'Não foi possível carregar os compromissos.',
      );

      setVisits([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==========================================================
  // LOAD WHEN FILTERS / PAGE CHANGE
  // ==========================================================

  useEffect(() => {
    loadVisits({
      currentPage: page,
    });
  }, [page, status, type, startDate, endDate]);

  // ==========================================================
  // SEARCH DEBOUNCE
  // ==========================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) {
        setPage(1);
        return;
      }

      loadVisits({
        currentPage: 1,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh = () => {
    loadVisits({
      showRefresh: true,
      currentPage: page,
    });
  };

  // ==========================================================
  // DETAILS
  // ==========================================================

  const handleDetails = (visit) => {
    if (!visit?._id) return;

    navigate(`/visit-details/${visit._id}`);
  };

  // ==========================================================
  // ACTIONS
  // ==========================================================

  const handleConfirm = async (visit) => {
    try {
      setProcessingId(visit._id);

      await confirmVisit(visit._id);

      await loadVisits({
        currentPage: page,
      });
    } catch (err) {
      console.error('ERRO AO CONFIRMAR:', err);

      alert(
        err?.response?.data?.message ||
          'Não foi possível confirmar o compromisso.',
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleComplete = async (visit) => {
    try {
      setProcessingId(visit._id);

      await completeVisit(visit._id);

      await loadVisits({
        currentPage: page,
      });
    } catch (err) {
      console.error('ERRO AO CONCLUIR:', err);

      alert(
        err?.response?.data?.message ||
          'Não foi possível concluir o compromisso.',
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (visit) => {
    const reason = window.prompt('Digite o motivo do cancelamento:');

    if (reason === null) return;

    try {
      setProcessingId(visit._id);

      await cancelVisit(visit._id, reason);

      await loadVisits({
        currentPage: page,
      });
    } catch (err) {
      console.error('ERRO AO CANCELAR:', err);

      alert(
        err?.response?.data?.message ||
          'Não foi possível cancelar o compromisso.',
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ==========================================================
  // NORMALIZED TYPE
  // ==========================================================

  const getVisitType = (visit) => {
    return normalizeType(
      visit?.type ||
        visit?.eventType ||
        visit?.calendarType ||
        visit?.appointmentType ||
        (visit?.property ? CALENDAR_TYPES.VISIT : CALENDAR_TYPES.OTHER),
    );
  };

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const summary = useMemo(() => {
    const result = {
      total: pagination.total || 0,

      scheduled: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,

      visits: 0,
      meetings: 0,
      calls: 0,
      online: 0,
      proposals: 0,
      negotiations: 0,
      internal: 0,
      other: 0,
    };

    visits.forEach((item) => {
      if (item.status === VISIT_STATUS.SCHEDULED) {
        result.scheduled += 1;
      }

      if (item.status === VISIT_STATUS.CONFIRMED) {
        result.confirmed += 1;
      }

      if (item.status === VISIT_STATUS.COMPLETED) {
        result.completed += 1;
      }

      if (item.status === VISIT_STATUS.CANCELLED) {
        result.cancelled += 1;
      }

      const itemType = getVisitType(item);

      if (itemType === CALENDAR_TYPES.VISIT) result.visits += 1;
      if (itemType === CALENDAR_TYPES.MEETING) result.meetings += 1;
      if (itemType === CALENDAR_TYPES.CALL) result.calls += 1;
      if (itemType === CALENDAR_TYPES.ONLINE_MEETING) result.online += 1;
      if (itemType === CALENDAR_TYPES.PROPOSAL) result.proposals += 1;
      if (itemType === CALENDAR_TYPES.NEGOTIATION) {
        result.negotiations += 1;
      }
      if (itemType === CALENDAR_TYPES.INTERNAL) result.internal += 1;
      if (itemType === CALENDAR_TYPES.OTHER) result.other += 1;
    });

    return result;
  }, [visits, pagination.total]);

  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setType('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  // ==========================================================
  // CURRENT TYPE
  // ==========================================================

  const currentTypeConfig = TYPE_CONFIG[type] || {
    label: 'Agenda',
    plural: 'Compromissos',
    description: 'Todos os compromissos',
    icon: CalendarDays,
    className: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
    dot: 'bg-blue-400',
    glow: 'bg-blue-500/10',
  };

  const CurrentTypeIcon = currentTypeConfig.icon;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      {/* ======================================================
          AMBIENT BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-indigo-600/5 blur-3xl" />

        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-violet-600/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="mb-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/15 bg-blue-500/[0.07] px-3 py-1.5 text-xs font-medium text-blue-400">
                <Sparkles size={13} />
                Gestão de agenda
              </div>

              <div className="flex items-start gap-4">
                <div
                  className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border ${currentTypeConfig.className}`}
                >
                  <CurrentTypeIcon size={26} />

                  <span
                    className={`absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#070b14] ${currentTypeConfig.dot}`}
                  />
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {type ? currentTypeConfig.plural : 'Agenda da plataforma'}
                  </h1>

                  <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-400">
                    Gerencie visitas, reuniões, ligações, propostas, negociações
                    e todos os outros compromissos da plataforma.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden rounded-xl border border-slate-800/80 bg-slate-900/40 px-4 py-2.5 text-right sm:block">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600">
                  Registros
                </p>

                <p className="mt-0.5 text-sm font-semibold text-slate-300">
                  {summary.total}
                </p>
              </div>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="
                  group
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-800
                  bg-slate-900/80
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-slate-200
                  shadow-lg
                  shadow-black/10
                  backdrop-blur
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:border-slate-700
                  hover:bg-slate-800
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <RefreshCw
                  size={16}
                  className={
                    refreshing
                      ? 'animate-spin'
                      : 'transition-transform group-hover:rotate-180'
                  }
                />
                Atualizar
              </button>
            </div>
          </div>
        </header>

        {/* ==================================================
            TYPE QUICK FILTERS
        ================================================== */}

        <section className="mb-7">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-200">
                Tipo de compromisso
              </p>

              <p className="mt-0.5 text-xs text-slate-600">
                Visualize somente o que precisa acompanhar
              </p>
            </div>

            {type && (
              <button
                type="button"
                onClick={() => {
                  setType('');
                  setPage(1);
                }}
                className="text-xs font-medium text-slate-500 transition hover:text-white"
              >
                Ver todos
              </button>
            )}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <TypeFilterButton
              active={!type}
              label="Todos"
              count={summary.total}
              icon={<CalendarDays size={15} />}
              onClick={() => {
                setType('');
                setPage(1);
              }}
            />

            {Object.entries(TYPE_CONFIG).map(([value, config]) => {
              const Icon = config.icon;

              return (
                <TypeFilterButton
                  key={value}
                  active={type === value}
                  label={config.label}
                  count={getTypeCount(summary, value)}
                  icon={<Icon size={15} />}
                  onClick={() => {
                    setType(value);
                    setPage(1);
                  }}
                  accent={value}
                />
              );
            })}
          </div>
        </section>

        {/* ==================================================
            SUMMARY
        ================================================== */}

        <section className="mb-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          <SummaryCard
            label="Total"
            value={summary.total}
            icon={<CalendarDays size={19} />}
            accent="blue"
            description="Compromissos"
          />

          <SummaryCard
            label="Visitas"
            value={summary.visits}
            icon={<CalendarDays size={19} />}
            accent="blue"
            description="Imóveis"
          />

          <SummaryCard
            label="Reuniões"
            value={summary.meetings}
            icon={<Handshake size={19} />}
            accent="violet"
            description="Presenciais"
          />

          <SummaryCard
            label="Ligações"
            value={summary.calls}
            icon={<PhoneCall size={19} />}
            accent="cyan"
            description="Contatos"
          />

          <SummaryCard
            label="Online"
            value={summary.online}
            icon={<Video size={19} />}
            accent="indigo"
            description="Videoconferências"
          />

          <SummaryCard
            label="Propostas"
            value={summary.proposals}
            icon={<FileText size={19} />}
            accent="amber"
            description="Compromissos"
          />

          <SummaryCard
            label="Negociações"
            value={summary.negotiations}
            icon={<Handshake size={19} />}
            accent="orange"
            description="Comerciais"
          />

          <SummaryCard
            label="Outros"
            value={summary.other + summary.internal}
            icon={<MoreHorizontal size={19} />}
            accent="slate"
            description="Diversos"
          />
        </section>

        {/* ==================================================
            STATUS SUMMARY
        ================================================== */}

        <section className="mb-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MiniSummary
            label="Agendados"
            value={summary.scheduled}
            icon={<Clock3 size={15} />}
            accent="blue"
          />

          <MiniSummary
            label="Confirmados"
            value={summary.confirmed}
            icon={<CalendarCheck size={15} />}
            accent="amber"
          />

          <MiniSummary
            label="Concluídos"
            value={summary.completed}
            icon={<CheckCircle2 size={15} />}
            accent="emerald"
          />

          <MiniSummary
            label="Cancelados"
            value={summary.cancelled}
            icon={<XCircle size={15} />}
            accent="red"
          />
        </section>

        {/* ==================================================
            FILTERS
        ================================================== */}

        <section className="mb-7 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/50 shadow-2xl shadow-black/10 backdrop-blur-xl">
          <div className="border-b border-slate-800/70 px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-800/70">
                  <SlidersHorizontal size={16} className="text-slate-300" />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Filtros avançados
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Refine sua agenda rapidamente
                  </p>
                </div>
              </div>

              {hasFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    self-start
                    rounded-lg
                    px-2.5
                    py-1.5
                    text-xs
                    font-medium
                    text-slate-400
                    transition
                    hover:bg-slate-800
                    hover:text-white
                    sm:self-auto
                  "
                >
                  <X size={13} />
                  Limpar filtros
                </button>
              )}
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
              {/* SEARCH */}

              <div className="group relative lg:col-span-2">
                <Search
                  size={17}
                  className="
                    absolute
                    left-3.5
                    top-1/2
                    -translate-y-1/2
                    text-slate-600
                    transition
                    group-focus-within:text-blue-400
                  "
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por cliente, lead, imóvel..."
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-slate-800
                    bg-[#070b14]/80
                    pl-10
                    pr-10
                    text-sm
                    text-white
                    outline-none
                    transition-all
                    placeholder:text-slate-600
                    hover:border-slate-700
                    focus:border-blue-500/50
                    focus:ring-4
                    focus:ring-blue-500/5
                  "
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-600 transition hover:bg-slate-800 hover:text-white"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* TYPE */}

              <FilterSelect
                value={type}
                onChange={(value) => {
                  setType(value);
                  setPage(1);
                }}
                icon={<CalendarClock size={15} />}
                label="Tipo de compromisso"
              >
                <option value="">Todos os tipos</option>

                {Object.entries(TYPE_CONFIG).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </FilterSelect>

              {/* STATUS */}

              <FilterSelect
                value={status}
                onChange={(value) => {
                  setStatus(value);
                  setPage(1);
                }}
                icon={<CircleDot size={15} />}
                label="Status"
              >
                <option value="">Todos os status</option>

                <option value={VISIT_STATUS.SCHEDULED}>Agendadas</option>

                <option value={VISIT_STATUS.CONFIRMED}>Confirmadas</option>

                <option value={VISIT_STATUS.COMPLETED}>Concluídas</option>

                <option value={VISIT_STATUS.CANCELLED}>Canceladas</option>
              </FilterSelect>

              {/* START */}

              <DateFilter
                value={startDate}
                onChange={(value) => {
                  setStartDate(value);
                  setPage(1);
                }}
                label="Data inicial"
              />

              {/* END */}

              <DateFilter
                value={endDate}
                onChange={(value) => {
                  setEndDate(value);
                  setPage(1);
                }}
                label="Data final"
              />
            </div>

            {/* ACTIVE FILTERS */}

            {hasFilters && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-medium uppercase tracking-wider text-slate-600">
                  Filtros ativos:
                </span>

                {search && (
                  <FilterBadge
                    label={`Busca: ${search}`}
                    onRemove={() => setSearch('')}
                  />
                )}

                {type && (
                  <FilterBadge
                    label={`Tipo: ${TYPE_CONFIG[type]?.label || type}`}
                    onRemove={() => {
                      setType('');
                      setPage(1);
                    }}
                  />
                )}

                {status && (
                  <FilterBadge
                    label={`Status: ${STATUS_CONFIG[status]?.label || status}`}
                    onRemove={() => {
                      setStatus('');
                      setPage(1);
                    }}
                  />
                )}

                {startDate && (
                  <FilterBadge
                    label={`De: ${formatInputDate(startDate)}`}
                    onRemove={() => {
                      setStartDate('');
                      setPage(1);
                    }}
                  />
                )}

                {endDate && (
                  <FilterBadge
                    label={`Até: ${formatInputDate(endDate)}`}
                    onRemove={() => {
                      setEndDate('');
                      setPage(1);
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </section>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-red-500/20 bg-red-500/[0.06] shadow-lg shadow-red-950/10">
            <div className="flex items-start gap-3 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                <AlertCircle size={18} />
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-red-300">
                  Não foi possível carregar a agenda
                </p>

                <p className="mt-1 text-sm text-red-300/70">{error}</p>

                <button
                  type="button"
                  onClick={handleRefresh}
                  className="mt-3 text-xs font-semibold text-red-300 transition hover:text-white"
                >
                  Tentar novamente →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================
            CONTENT HEADER
        ================================================== */}

        {!loading && visits.length > 0 && (
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-200">
                  {type ? currentTypeConfig.plural : 'Compromissos'}
                </p>

                {type && (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[10px] font-semibold ${currentTypeConfig.className}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${currentTypeConfig.dot}`}
                    />

                    {currentTypeConfig.label}
                  </span>
                )}
              </div>

              <p className="mt-0.5 text-xs text-slate-600">
                {pagination.total} compromisso
                {pagination.total !== 1 ? 's' : ''} encontrado
                {pagination.total !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="hidden items-center gap-2 text-xs text-slate-600 sm:flex">
              <CalendarClock size={14} />
              Ordenado por data
            </div>
          </div>
        )}

        {/* ==================================================
            CONTENT
        ================================================== */}

        {loading ? (
          <LoadingState />
        ) : visits.length === 0 ? (
          <EmptyState
            hasFilters={hasFilters}
            selectedType={type}
            onClear={handleClearFilters}
          />
        ) : (
          <>
            <div className="space-y-4">
              {visits.map((visit) => (
                <VisitCard
                  key={visit._id}
                  visit={visit}
                  type={getVisitType(visit)}
                  processing={processingId === visit._id}
                  onConfirm={handleConfirm}
                  onComplete={handleComplete}
                  onCancel={handleCancel}
                  onDetails={handleDetails}
                />
              ))}
            </div>

            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// TYPE FILTER BUTTON
// ============================================================

function TypeFilterButton({ active, label, count, icon, onClick, accent }) {
  const config = TYPE_CONFIG[accent];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        group
        inline-flex
        shrink-0
        items-center
        gap-2
        rounded-xl
        border
        px-3.5
        py-2.5
        text-xs
        font-semibold
        transition-all
        duration-200
        ${
          active
            ? config
              ? `${config.className} shadow-lg`
              : 'border-blue-500/30 bg-blue-500/10 text-blue-400'
            : 'border-slate-800 bg-slate-900/60 text-slate-500 hover:border-slate-700 hover:bg-slate-800 hover:text-slate-200'
        }
      `}
    >
      {icon}

      <span>{label}</span>

      <span
        className={`
          rounded-md
          px-1.5
          py-0.5
          text-[10px]
          ${active ? 'bg-black/10 text-current' : 'bg-slate-800 text-slate-600'}
        `}
      >
        {count}
      </span>
    </button>
  );
}

// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({ label, value, icon, accent, description }) {
  const accents = {
    blue: {
      icon: 'border-blue-500/15 bg-blue-500/10 text-blue-400',
      glow: 'bg-blue-500/10',
    },

    violet: {
      icon: 'border-violet-500/15 bg-violet-500/10 text-violet-400',
      glow: 'bg-violet-500/10',
    },

    cyan: {
      icon: 'border-cyan-500/15 bg-cyan-500/10 text-cyan-400',
      glow: 'bg-cyan-500/10',
    },

    indigo: {
      icon: 'border-indigo-500/15 bg-indigo-500/10 text-indigo-400',
      glow: 'bg-indigo-500/10',
    },

    amber: {
      icon: 'border-amber-500/15 bg-amber-500/10 text-amber-400',
      glow: 'bg-amber-500/10',
    },

    orange: {
      icon: 'border-orange-500/15 bg-orange-500/10 text-orange-400',
      glow: 'bg-orange-500/10',
    },

    emerald: {
      icon: 'border-emerald-500/15 bg-emerald-500/10 text-emerald-400',
      glow: 'bg-emerald-500/10',
    },

    red: {
      icon: 'border-red-500/15 bg-red-500/10 text-red-400',
      glow: 'bg-red-500/10',
    },

    slate: {
      icon: 'border-slate-500/15 bg-slate-500/10 text-slate-400',
      glow: 'bg-slate-500/10',
    },
  };

  const config = accents[accent] || accents.blue;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4 shadow-xl shadow-black/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-700">
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl ${config.glow}`}
      />

      <div className="relative flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold tracking-tight text-white">
            {value}
          </p>

          <p className="mt-1 truncate text-[11px] text-slate-600">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${config.icon}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MINI SUMMARY
// ============================================================

function MiniSummary({ label, value, icon, accent }) {
  const config = {
    blue: 'text-blue-400 border-blue-500/15 bg-blue-500/[0.05]',
    amber: 'text-amber-400 border-amber-500/15 bg-amber-500/[0.05]',
    emerald: 'text-emerald-400 border-emerald-500/15 bg-emerald-500/[0.05]',
    red: 'text-red-400 border-red-500/15 bg-red-500/[0.05]',
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/40 px-4 py-3">
      <div className="flex items-center gap-2.5">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
            config[accent]
          }`}
        >
          {icon}
        </div>

        <span className="text-xs font-medium text-slate-500">{label}</span>
      </div>

      <span className="text-lg font-bold text-slate-200">{value}</span>
    </div>
  );
}

// ============================================================
// FILTER SELECT
// ============================================================

function FilterSelect({ value, onChange, children, icon, label }) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-slate-600">
        {icon}
      </div>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="
          h-11
          w-full
          appearance-none
          rounded-xl
          border
          border-slate-800
          bg-[#070b14]/80
          px-10
          pr-8
          text-sm
          text-slate-300
          outline-none
          transition
          hover:border-slate-700
          focus:border-blue-500/50
          focus:ring-4
          focus:ring-blue-500/5
        "
      >
        {children}
      </select>

      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-600">
        <ChevronRight size={14} className="rotate-90" />
      </div>
    </div>
  );
}

// ============================================================
// DATE FILTER
// ============================================================

function DateFilter({ value, onChange, label }) {
  return (
    <div className="relative">
      <CalendarDays
        size={15}
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
      />

      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        title={label}
        className="
          h-11
          w-full
          rounded-xl
          border
          border-slate-800
          bg-[#070b14]/80
          px-10
          text-sm
          text-slate-300
          outline-none
          transition
          hover:border-slate-700
          focus:border-blue-500/50
          focus:ring-4
          focus:ring-blue-500/5
        "
      />
    </div>
  );
}

// ============================================================
// FILTER BADGE
// ============================================================

function FilterBadge({ label, onRemove }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="
        group
        inline-flex
        items-center
        gap-1.5
        rounded-lg
        border
        border-blue-500/15
        bg-blue-500/[0.06]
        px-2.5
        py-1.5
        text-[11px]
        font-medium
        text-blue-300
        transition
        hover:border-blue-500/30
        hover:bg-blue-500/10
      "
    >
      {label}

      <X
        size={12}
        className="text-blue-400/60 transition group-hover:text-blue-300"
      />
    </button>
  );
}

// ============================================================
// VISIT / EVENT CARD
// ============================================================

function VisitCard({
  visit,
  type,
  processing,
  onConfirm,
  onComplete,
  onCancel,
  onDetails,
}) {
  const property = visit.propertyInfo || visit.property || null;

  const lead = visit.leadInfo || visit.lead || null;

  const broker = visit.brokerInfo || visit.broker || null;

  const typeConfig = TYPE_CONFIG[type] || TYPE_CONFIG[CALENDAR_TYPES.OTHER];

  const TypeIcon = typeConfig.icon;

  const propertyName =
    property?.name || property?.title || 'Imóvel não informado';

  const propertyImage =
    property?.image ||
    property?.coverImage ||
    property?.mainImage ||
    property?.images?.find((image) => image?.isCover)?.url ||
    property?.images?.[0]?.url ||
    '';

  const propertyAddress =
    property?.address ||
    property?.fullAddress ||
    buildPropertyAddress(property);

  const visitDate = formatDate(
    visit.date || visit.scheduledAt || visit.startDate,
  );

  const statusConfig = STATUS_CONFIG[visit.status] || {
    label: visit.status || 'Desconhecido',
    className: 'border-slate-500/20 bg-slate-500/10 text-slate-400',
    icon: Clock3,
    dot: 'bg-slate-400',
  };

  const StatusIcon = statusConfig.icon;

  const isVisit = type === CALENDAR_TYPES.VISIT;

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/50 shadow-xl shadow-black/10 backdrop-blur-xl transition-all duration-300 hover:border-slate-700 hover:shadow-2xl hover:shadow-black/20">
      <div className="flex flex-col xl:flex-row">
        {/* ==================================================
            IMAGE
        ================================================== */}

        <div className="relative h-56 w-full shrink-0 overflow-hidden bg-[#050812] xl:min-h-[320px] xl:h-auto xl:w-72">
          {propertyImage ? (
            <img
              src={propertyImage}
              alt={propertyName}
              className="
                h-full
                min-h-56
                w-full
                object-cover
                transition
                duration-700
                group-hover:scale-105
              "
            />
          ) : (
            <div className="flex h-full min-h-56 items-center justify-center">
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-3xl border ${typeConfig.className}`}
              >
                <TypeIcon size={38} strokeWidth={1.3} />
              </div>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/20" />

          {/* STATUS */}

          <div className="absolute left-4 top-4">
            <span
              className={`
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                px-3
                py-2
                text-xs
                font-semibold
                shadow-lg
                backdrop-blur-xl
                ${statusConfig.className}
              `}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`}
              />

              <StatusIcon size={13} />

              {statusConfig.label}
            </span>
          </div>

          {/* TYPE */}

          <div className="absolute bottom-4 left-4">
            <span
              className={`
                inline-flex
                items-center
                gap-1.5
                rounded-lg
                border
                px-2.5
                py-1.5
                text-[10px]
                font-semibold
                uppercase
                tracking-wider
                backdrop-blur-md
                ${typeConfig.className}
              `}
            >
              <TypeIcon size={12} />

              {typeConfig.label}
            </span>
          </div>
        </div>

        {/* ==================================================
            CONTENT
        ================================================== */}

        <div className="min-w-0 flex-1 p-5 sm:p-6">
          {/* TOP */}

          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-lg font-bold tracking-tight text-white sm:text-xl">
                  {visit.title || (isVisit ? propertyName : typeConfig.label)}
                </h3>

                {property?.code && (
                  <span className="rounded-md border border-slate-800 bg-slate-950 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    {property.code}
                  </span>
                )}
              </div>

              {visit.title && propertyName && isVisit && (
                <p className="mt-1 text-xs text-slate-600">{propertyName}</p>
              )}

              {propertyAddress && (
                <div className="mt-2.5 flex items-start gap-2 text-sm text-slate-500">
                  <MapPin
                    size={15}
                    className="mt-0.5 shrink-0 text-slate-600"
                  />

                  <span className="line-clamp-2">{propertyAddress}</span>
                </div>
              )}
            </div>

            {/* DATE BLOCK */}

            <div
              className={`relative shrink-0 overflow-hidden rounded-2xl border px-4 py-3.5 ${typeConfig.className}`}
            >
              <div
                className={`pointer-events-none absolute -right-5 -top-5 h-14 w-14 rounded-full blur-xl ${typeConfig.glow}`}
              />

              <div className="relative">
                <div className="flex items-center gap-2">
                  <CalendarDays size={16} />

                  <span className="text-sm font-bold">{visitDate.date}</span>
                </div>

                <div className="mt-1.5 flex items-center gap-2 text-xs font-medium opacity-70">
                  <Clock3 size={13} />

                  <span>{visitDate.time}</span>
                </div>

                {visit.endDate && (
                  <div className="mt-1 text-[10px] opacity-50">
                    até {formatTime(visit.endDate)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* DIVIDER */}

          <div className="my-5 border-t border-slate-800/80" />

          {/* DETAILS */}

          <div className="grid gap-3 md:grid-cols-3">
            {/* LEAD */}

            <InfoPanel icon={<User size={14} />} label="Lead">
              <p className="truncate text-sm font-semibold text-slate-200">
                {lead?.name || 'Lead não informado'}
              </p>

              {lead?.phone && (
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <Phone size={12} />

                  <span>{lead.phone}</span>
                </div>
              )}

              {lead?.email && (
                <div className="mt-1.5 flex min-w-0 items-center gap-2 text-xs text-slate-500">
                  <Mail size={12} />

                  <span className="truncate">{lead.email}</span>
                </div>
              )}
            </InfoPanel>

            {/* BROKER */}

            <InfoPanel icon={<BriefcaseBusiness size={14} />} label="Corretor">
              <div className="flex items-center gap-3">
                {broker?.avatar ? (
                  <img
                    src={broker.avatar}
                    alt={broker.name || 'Corretor'}
                    className="h-9 w-9 shrink-0 rounded-full border border-slate-700 object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-500">
                    <User size={16} />
                  </div>
                )}

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-200">
                    {broker?.name || 'Corretor não informado'}
                  </p>

                  {broker?.email && (
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {broker.email}
                    </p>
                  )}
                </div>
              </div>
            </InfoPanel>

            {/* NOTES */}

            <InfoPanel
              icon={<CalendarCheck size={14} />}
              label={isVisit ? 'Observações' : 'Detalhes'}
            >
              <p className="line-clamp-3 text-sm leading-5 text-slate-400">
                {visit.notes || visit.description || 'Sem observações'}
              </p>

              {visit.address && (
                <div className="mt-2 flex items-start gap-2 text-xs text-slate-600">
                  <MapPin size={12} className="mt-0.5 shrink-0" />

                  <span className="line-clamp-2">{visit.address}</span>
                </div>
              )}

              {visit.location && !visit.address && (
                <div className="mt-2 text-xs text-slate-600">
                  {visit.location}
                </div>
              )}
            </InfoPanel>
          </div>

          {/* ACTIONS */}

          <div className="mt-5 flex flex-col gap-4 border-t border-slate-800/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-[11px] text-slate-600">
              <CalendarDays size={13} />
              Criado em {formatSimpleDate(visit.createdAt)}
            </div>

            <div className="flex flex-wrap gap-2">
              {/* VISIT ACTIONS */}

              {isVisit && visit.status === VISIT_STATUS.SCHEDULED && (
                <ActionButton
                  icon={<CalendarCheck size={14} />}
                  label="Confirmar"
                  disabled={processing}
                  onClick={() => onConfirm(visit)}
                  variant="amber"
                />
              )}

              {isVisit &&
                (visit.status === VISIT_STATUS.SCHEDULED ||
                  visit.status === VISIT_STATUS.CONFIRMED) && (
                  <ActionButton
                    icon={<CheckCircle2 size={14} />}
                    label="Concluir"
                    disabled={processing}
                    onClick={() => onComplete(visit)}
                    variant="emerald"
                  />
                )}

              {isVisit &&
                (visit.status === VISIT_STATUS.SCHEDULED ||
                  visit.status === VISIT_STATUS.CONFIRMED) && (
                  <ActionButton
                    icon={<XCircle size={14} />}
                    label="Cancelar"
                    disabled={processing}
                    onClick={() => onCancel(visit)}
                    variant="red"
                  />
                )}

              <ActionButton
                icon={<Eye size={14} />}
                label="Detalhes"
                disabled={false}
                onClick={() => onDetails(visit)}
                variant="slate"
                primary
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

// ============================================================
// INFO PANEL
// ============================================================

function InfoPanel({ icon, label, children }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-800/70 bg-[#070b14]/50 p-4 transition hover:border-slate-700/80 hover:bg-[#070b14]/80">
      <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
        {icon}

        {label}
      </div>

      {children}
    </div>
  );
}

// ============================================================
// ACTION BUTTON
// ============================================================

function ActionButton({
  icon,
  label,
  disabled,
  onClick,
  variant,
  primary = false,
}) {
  const variants = {
    amber:
      'border-amber-500/15 bg-amber-500/[0.06] text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/10',

    emerald:
      'border-emerald-500/15 bg-emerald-500/[0.06] text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10',

    red: 'border-red-500/15 bg-red-500/[0.06] text-red-400 hover:border-red-500/30 hover:bg-red-500/10',

    slate:
      'border-slate-700 bg-slate-800/70 text-slate-300 hover:border-slate-600 hover:bg-slate-700',
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`
        inline-flex
        items-center
        gap-2
        rounded-xl
        border
        px-3.5
        py-2.5
        text-xs
        font-semibold
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        disabled:cursor-not-allowed
        disabled:opacity-40
        ${variants[variant] || variants.slate}
        ${primary ? 'shadow-lg shadow-black/10' : ''}
      `}
    >
      {processingIcon(icon, disabled)}

      {label}

      {primary && <ArrowUpRight size={13} className="opacity-50" />}
    </button>
  );
}

function processingIcon(icon, disabled) {
  if (!disabled) return icon;

  return (
    <span className="relative flex items-center justify-center">
      <span className="absolute h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-60" />

      <span className="opacity-0">{icon}</span>
    </span>
  );
}

// ============================================================
// PAGINATION
// ============================================================

function Pagination({ pagination, onPageChange }) {
  const currentPage = pagination?.page || 1;

  const totalPages = pagination?.pages || 1;

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500">
          Página{' '}
          <span className="font-semibold text-slate-300">{currentPage}</span> de{' '}
          <span className="font-semibold text-slate-300">{totalPages}</span>
        </p>

        <p className="mt-1 text-[11px] text-slate-700">
          {pagination.total || 0} registros no total
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            border-slate-800
            bg-slate-950
            text-slate-500
            transition
            hover:border-slate-700
            hover:bg-slate-800
            hover:text-white
            disabled:cursor-not-allowed
            disabled:opacity-30
          "
        >
          <ChevronLeft size={17} />
        </button>

        <div className="flex h-10 min-w-10 items-center justify-center rounded-xl border border-blue-500/15 bg-blue-500/[0.06] px-3 text-xs font-bold text-blue-400">
          {currentPage}
        </div>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            border-slate-800
            bg-slate-950
            text-slate-500
            transition
            hover:border-slate-700
            hover:bg-slate-800
            hover:text-white
            disabled:cursor-not-allowed
            disabled:opacity-30
          "
        >
          <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
}

// ============================================================
// LOADING
// ============================================================

function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/50"
        >
          <div className="flex flex-col xl:flex-row">
            <div className="h-56 w-full animate-pulse bg-slate-900 xl:h-80 xl:w-72" />

            <div className="flex-1 p-6">
              <div className="flex justify-between gap-5">
                <div className="flex-1">
                  <div className="h-5 w-64 animate-pulse rounded-lg bg-slate-800" />

                  <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded-lg bg-slate-800/70" />
                </div>

                <div className="h-16 w-32 animate-pulse rounded-xl bg-slate-800/70" />
              </div>

              <div className="my-5 border-t border-slate-800/60" />

              <div className="grid gap-3 md:grid-cols-3">
                {[1, 2, 3].map((block) => (
                  <div
                    key={block}
                    className="h-28 animate-pulse rounded-xl bg-slate-800/50"
                  />
                ))}
              </div>

              <div className="mt-5 border-t border-slate-800/60 pt-4">
                <div className="flex justify-end gap-2">
                  <div className="h-9 w-24 animate-pulse rounded-xl bg-slate-800" />

                  <div className="h-9 w-24 animate-pulse rounded-xl bg-slate-800" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// EMPTY
// ============================================================

function EmptyState({ hasFilters, selectedType, onClear }) {
  const typeConfig = TYPE_CONFIG[selectedType];

  const Icon = typeConfig?.icon || CalendarDays;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/40 px-6 py-20 text-center shadow-2xl shadow-black/10">
      <div className="pointer-events-none absolute left-1/2 top-0 h-40 w-80 -translate-x-1/2 rounded-full bg-blue-500/5 blur-3xl" />

      <div className="relative mx-auto flex max-w-md flex-col items-center">
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-950 text-slate-600 shadow-xl">
          <Icon size={27} strokeWidth={1.5} />

          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-slate-950 bg-blue-400/70" />
        </div>

        <h3 className="mt-6 text-lg font-bold text-slate-200">
          {selectedType
            ? `Nenhum compromisso do tipo "${typeConfig?.label}"`
            : 'Nenhum compromisso encontrado'}
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          {hasFilters
            ? 'Não encontramos compromissos para os filtros selecionados. Tente ajustar sua pesquisa.'
            : 'Ainda não existem compromissos cadastrados na plataforma.'}
        </p>

        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="
              mt-6
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-slate-700
              bg-slate-900
              px-4
              py-2.5
              text-sm
              font-semibold
              text-slate-300
              transition
              hover:border-slate-600
              hover:bg-slate-800
              hover:text-white
            "
          >
            <RefreshCw size={14} />
            Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// HELPERS
// ============================================================

function normalizeType(type) {
  if (!type) {
    return CALENDAR_TYPES.OTHER;
  }

  const normalized = String(type).trim().toLowerCase().replace(/\s+/g, '_');

  return TYPE_ALIASES[normalized] || normalized;
}

function getTypeCount(summary, type) {
  switch (type) {
    case CALENDAR_TYPES.VISIT:
      return summary.visits;

    case CALENDAR_TYPES.MEETING:
      return summary.meetings;

    case CALENDAR_TYPES.CALL:
      return summary.calls;

    case CALENDAR_TYPES.ONLINE_MEETING:
      return summary.online;

    case CALENDAR_TYPES.PROPOSAL:
      return summary.proposals;

    case CALENDAR_TYPES.NEGOTIATION:
      return summary.negotiations;

    case CALENDAR_TYPES.INTERNAL:
      return summary.internal;

    case CALENDAR_TYPES.OTHER:
      return summary.other;

    default:
      return 0;
  }
}

function formatDate(date) {
  if (!date) {
    return {
      date: '-',
      time: '-',
    };
  }

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return {
      date: '-',
      time: '-',
    };
  }

  return {
    date: value.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),

    time: value.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

function formatTime(date) {
  if (!date) return '-';

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return '-';
  }

  return value.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatSimpleDate(date) {
  if (!date) {
    return '-';
  }

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return '-';
  }

  return value.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatInputDate(date) {
  if (!date) return '';

  const [year, month, day] = date.split('-');

  if (!year || !month || !day) {
    return date;
  }

  return `${day}/${month}/${year}`;
}

function buildPropertyAddress(property) {
  if (!property) {
    return '';
  }

  if (property.fullAddress) {
    return property.fullAddress;
  }

  const location = property.location;

  if (!location) {
    return '';
  }

  return [
    location.street,
    location.number,
    location.complement,
    location.district,
    location.city,
    location.state,
  ]
    .filter(Boolean)
    .join(', ');
}

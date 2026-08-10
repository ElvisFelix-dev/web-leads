import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  CalendarDays,
  Clock3,
  Search,
  Filter,
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
} from 'lucide-react';

import {
  getVisits,
  confirmVisit,
  completeVisit,
  cancelVisit,
} from '../service/visitApi';

// ============================================================
// CONSTANTS
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
    className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    icon: CalendarDays,
  },

  [VISIT_STATUS.CONFIRMED]: {
    label: 'Confirmada',
    className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    icon: CalendarCheck,
  },

  [VISIT_STATUS.COMPLETED]: {
    label: 'Concluída',
    className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: CheckCircle2,
  },

  [VISIT_STATUS.CANCELLED]: {
    label: 'Cancelada',
    className: 'bg-red-500/10 text-red-400 border-red-500/20',
    icon: XCircle,
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
  // ACTION STATE
  // ==========================================================

  const [processingId, setProcessingId] = useState(null);

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
      console.error('ERRO AO BUSCAR VISITAS:', err);

      setError(
        err?.response?.data?.message || 'Não foi possível carregar as visitas.',
      );

      setVisits([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadVisits({
      currentPage: page,
    });
  }, [page, status, startDate, endDate]);

  // ==========================================================
  // SEARCH
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
    if (!visit?._id) {
      return;
    }

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
      console.error('ERRO AO CONFIRMAR VISITA:', err);

      alert(
        err?.response?.data?.message || 'Não foi possível confirmar a visita.',
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
      console.error('ERRO AO CONCLUIR VISITA:', err);

      alert(
        err?.response?.data?.message || 'Não foi possível concluir a visita.',
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (visit) => {
    const reason = window.prompt('Digite o motivo do cancelamento:');

    if (reason === null) {
      return;
    }

    try {
      setProcessingId(visit._id);

      await cancelVisit(visit._id, reason);

      await loadVisits({
        currentPage: page,
      });
    } catch (err) {
      console.error('ERRO AO CANCELAR VISITA:', err);

      alert(
        err?.response?.data?.message || 'Não foi possível cancelar a visita.',
      );
    } finally {
      setProcessingId(null);
    }
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
    };

    visits.forEach((visit) => {
      if (visit.status === VISIT_STATUS.SCHEDULED) {
        result.scheduled += 1;
      }

      if (visit.status === VISIT_STATUS.CONFIRMED) {
        result.confirmed += 1;
      }

      if (visit.status === VISIT_STATUS.COMPLETED) {
        result.completed += 1;
      }

      if (visit.status === VISIT_STATUS.CANCELLED) {
        result.cancelled += 1;
      }
    });

    return result;
  }, [visits, pagination.total]);

  // ==========================================================
  // CLEAR FILTERS
  // ==========================================================

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <CalendarDays size={23} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Todas as visitas
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  Acompanhe as visitas de toda a plataforma.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-800
              bg-slate-900
              px-4
              py-2.5
              text-sm
              font-medium
              text-slate-200
              transition
              hover:border-slate-700
              hover:bg-slate-800
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>

        {/* ==================================================
            SUMMARY
        ================================================== */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <SummaryCard
            label="Total"
            value={summary.total}
            icon={<CalendarDays size={20} />}
            iconClass="bg-blue-500/10 text-blue-400"
          />

          <SummaryCard
            label="Agendadas"
            value={summary.scheduled}
            icon={<Clock3 size={20} />}
            iconClass="bg-blue-500/10 text-blue-400"
          />

          <SummaryCard
            label="Confirmadas"
            value={summary.confirmed}
            icon={<CalendarCheck size={20} />}
            iconClass="bg-amber-500/10 text-amber-400"
          />

          <SummaryCard
            label="Concluídas"
            value={summary.completed}
            icon={<CheckCircle2 size={20} />}
            iconClass="bg-emerald-500/10 text-emerald-400"
          />

          <SummaryCard
            label="Canceladas"
            value={summary.cancelled}
            icon={<XCircle size={20} />}
            iconClass="bg-red-500/10 text-red-400"
          />
        </div>

        {/* ==================================================
            FILTERS
        ================================================== */}

        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <div className="mb-4 flex items-center gap-2">
            <Filter size={17} className="text-slate-400" />

            <h2 className="text-sm font-semibold text-slate-200">Filtros</h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            {/* SEARCH */}

            <div className="relative lg:col-span-2">
              <Search
                size={17}
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-500
                "
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar lead..."
                className="
                  h-11
                  w-full
                  rounded-xl
                  border
                  border-slate-800
                  bg-slate-950
                  pl-10
                  pr-4
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-slate-600
                  focus:border-blue-500/50
                  focus:ring-1
                  focus:ring-blue-500/20
                "
              />
            </div>

            {/* STATUS */}

            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="
                h-11
                rounded-xl
                border
                border-slate-800
                bg-slate-950
                px-3
                text-sm
                text-slate-300
                outline-none
                focus:border-blue-500/50
              "
            >
              <option value="">Todos os status</option>

              <option value="agendada">Agendadas</option>

              <option value="confirmada">Confirmadas</option>

              <option value="concluida">Concluídas</option>

              <option value="cancelada">Canceladas</option>
            </select>

            {/* START DATE */}

            <input
              type="date"
              value={startDate}
              onChange={(event) => {
                setStartDate(event.target.value);
                setPage(1);
              }}
              className="
                h-11
                rounded-xl
                border
                border-slate-800
                bg-slate-950
                px-3
                text-sm
                text-slate-300
                outline-none
                focus:border-blue-500/50
              "
            />

            {/* END DATE */}

            <input
              type="date"
              value={endDate}
              onChange={(event) => {
                setEndDate(event.target.value);
                setPage(1);
              }}
              className="
                h-11
                rounded-xl
                border
                border-slate-800
                bg-slate-950
                px-3
                text-sm
                text-slate-300
                outline-none
                focus:border-blue-500/50
              "
            />
          </div>

          {(search || status || startDate || endDate) && (
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={handleClearFilters}
                className="
                  text-xs
                  font-medium
                  text-slate-400
                  transition
                  hover:text-white
                "
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />

            <div>
              <p className="font-medium">
                Não foi possível carregar as visitas.
              </p>

              <p className="mt-1 text-sm text-red-300/80">{error}</p>
            </div>
          </div>
        )}

        {/* ==================================================
            LOADING / EMPTY / VISITS
        ================================================== */}

        {loading ? (
          <LoadingState />
        ) : visits.length === 0 ? (
          <EmptyState
            hasFilters={Boolean(search || status || startDate || endDate)}
            onClear={handleClearFilters}
          />
        ) : (
          <>
            <div className="space-y-4">
              {visits.map((visit) => (
                <VisitCard
                  key={visit._id}
                  visit={visit}
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
// SUMMARY CARD
// ============================================================

function SummaryCard({ label, value, icon, iconClass }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold text-white">{value}</p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// VISIT CARD
// ============================================================

function VisitCard({
  visit,
  processing,
  onConfirm,
  onComplete,
  onCancel,
  onDetails,
}) {
  const property = visit.propertyInfo || visit.property || null;

  const lead = visit.leadInfo || visit.lead || null;

  const broker = visit.brokerInfo || visit.broker || null;

  const propertyName = property?.name || 'Imóvel não informado';

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

  const visitDate = formatDate(visit.date || visit.scheduledAt);

  const statusConfig = STATUS_CONFIG[visit.status] || {
    label: visit.status || 'Desconhecido',
    className: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    icon: Clock3,
  };

  const StatusIcon = statusConfig.icon;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 transition hover:border-slate-700">
      <div className="flex flex-col xl:flex-row">
        {/* ==================================================
            PROPERTY IMAGE
        ================================================== */}

        <div className="relative h-52 w-full shrink-0 overflow-hidden bg-slate-950 xl:h-auto xl:w-64">
          {propertyImage ? (
            <img
              src={propertyImage}
              alt={propertyName}
              className="h-full min-h-52 w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-52 items-center justify-center text-slate-700">
              <Building2 size={48} />
            </div>
          )}

          <div className="absolute left-3 top-3">
            <span
              className={`
                inline-flex
                items-center
                gap-1.5
                rounded-lg
                border
                px-2.5
                py-1.5
                text-xs
                font-semibold
                backdrop-blur
                ${statusConfig.className}
              `}
            >
              <StatusIcon size={13} />

              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* ==================================================
            CONTENT
        ================================================== */}

        <div className="min-w-0 flex-1 p-5">
          {/* TOP */}

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-white">
                  {propertyName}
                </h3>

                {property?.code && (
                  <span className="rounded-md bg-slate-800 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {property.code}
                  </span>
                )}
              </div>

              {propertyAddress && (
                <div className="mt-2 flex items-start gap-2 text-sm text-slate-400">
                  <MapPin
                    size={15}
                    className="mt-0.5 shrink-0 text-slate-500"
                  />

                  <span>{propertyAddress}</span>
                </div>
              )}
            </div>

            {/* DATE */}

            <div className="shrink-0 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
              <div className="flex items-center gap-2 text-blue-400">
                <CalendarDays size={16} />

                <span className="text-sm font-semibold">{visitDate.date}</span>
              </div>

              <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                <Clock3 size={13} />

                <span>{visitDate.time}</span>
              </div>
            </div>
          </div>

          {/* DIVIDER */}

          <div className="my-5 border-t border-slate-800" />

          {/* DETAILS */}

          <div className="grid gap-5 md:grid-cols-3">
            {/* LEAD */}

            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                <User size={14} />
                Lead
              </div>

              <p className="font-medium text-slate-200">
                {lead?.name || 'Lead não informado'}
              </p>

              {lead?.phone && (
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  <Phone size={12} />

                  {lead.phone}
                </div>
              )}

              {lead?.email && (
                <div className="mt-1 flex items-center gap-2 truncate text-xs text-slate-500">
                  <Mail size={12} />

                  <span className="truncate">{lead.email}</span>
                </div>
              )}
            </div>

            {/* BROKER */}

            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                <BriefcaseBusiness size={14} />
                Corretor
              </div>

              <div className="flex items-center gap-3">
                {broker?.avatar ? (
                  <img
                    src={broker.avatar}
                    alt={broker.name || 'Corretor'}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-500">
                    <User size={16} />
                  </div>
                )}

                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-200">
                    {broker?.name || 'Corretor não informado'}
                  </p>

                  {broker?.email && (
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {broker.email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* VISIT */}

            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                <CalendarCheck size={14} />
                Visita
              </div>

              <p className="text-sm text-slate-300">
                {visit.notes || 'Sem observações'}
              </p>

              {visit.address && (
                <div className="mt-2 flex items-start gap-2 text-xs text-slate-500">
                  <MapPin size={12} className="mt-0.5 shrink-0" />

                  <span>{visit.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* ACTIONS */}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <CalendarDays size={13} />
              Criada em {formatSimpleDate(visit.createdAt)}
            </div>

            <div className="flex flex-wrap gap-2">
              {/* CONFIRM */}

              {visit.status === VISIT_STATUS.SCHEDULED && (
                <ActionButton
                  icon={<CalendarCheck size={15} />}
                  label="Confirmar"
                  disabled={processing}
                  onClick={() => onConfirm(visit)}
                  className="
                    border-amber-500/20
                    bg-amber-500/10
                    text-amber-400
                    hover:bg-amber-500/20
                  "
                />
              )}

              {/* COMPLETE */}

              {(visit.status === VISIT_STATUS.SCHEDULED ||
                visit.status === VISIT_STATUS.CONFIRMED) && (
                <ActionButton
                  icon={<CheckCircle2 size={15} />}
                  label="Concluir"
                  disabled={processing}
                  onClick={() => onComplete(visit)}
                  className="
                    border-emerald-500/20
                    bg-emerald-500/10
                    text-emerald-400
                    hover:bg-emerald-500/20
                  "
                />
              )}

              {/* CANCEL */}

              {(visit.status === VISIT_STATUS.SCHEDULED ||
                visit.status === VISIT_STATUS.CONFIRMED) && (
                <ActionButton
                  icon={<XCircle size={15} />}
                  label="Cancelar"
                  disabled={processing}
                  onClick={() => onCancel(visit)}
                  className="
                    border-red-500/20
                    bg-red-500/10
                    text-red-400
                    hover:bg-red-500/20
                  "
                />
              )}

              {/* DETAILS */}

              <ActionButton
                icon={<Eye size={15} />}
                label="Detalhes"
                disabled={false}
                onClick={() => onDetails(visit)}
                className="
                  border-slate-700
                  bg-slate-800
                  text-slate-300
                  hover:bg-slate-700
                "
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ACTION BUTTON
// ============================================================

function ActionButton({ icon, label, disabled, onClick, className }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`
        inline-flex
        items-center
        gap-2
        rounded-lg
        border
        px-3
        py-2
        text-xs
        font-medium
        transition
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${className}
      `}
    >
      {icon}

      {label}
    </button>
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
    <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-5">
      <p className="text-sm text-slate-500">
        Página {currentPage} de {totalPages}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            border
            border-slate-800
            bg-slate-950
            text-slate-400
            transition
            hover:bg-slate-800
            hover:text-white
            disabled:cursor-not-allowed
            disabled:opacity-30
          "
        >
          <ChevronLeft size={16} />
        </button>

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            border
            border-slate-800
            bg-slate-950
            text-slate-400
            transition
            hover:bg-slate-800
            hover:text-white
            disabled:cursor-not-allowed
            disabled:opacity-30
          "
        >
          <ChevronRight size={16} />
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
          className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60"
        >
          <div className="flex flex-col xl:flex-row">
            <div className="h-52 w-full shrink-0 animate-pulse bg-slate-900 xl:h-64 xl:w-64" />

            <div className="flex-1 p-5">
              <div className="h-5 w-64 animate-pulse rounded bg-slate-800" />

              <div className="mt-3 h-4 w-80 animate-pulse rounded bg-slate-800/70" />

              <div className="mt-8 grid gap-5 md:grid-cols-3">
                <div className="h-16 animate-pulse rounded bg-slate-800/60" />

                <div className="h-16 animate-pulse rounded bg-slate-800/60" />

                <div className="h-16 animate-pulse rounded bg-slate-800/60" />
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

function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/50 px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-slate-500">
        <CalendarDays size={25} />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-slate-300">
        Nenhuma visita encontrada
      </h3>

      <p className="mt-2 max-w-md text-sm text-slate-500">
        {hasFilters
          ? 'Não encontramos visitas para os filtros selecionados.'
          : 'Ainda não existem visitas cadastradas na plataforma.'}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="
            mt-5
            rounded-lg
            border
            border-slate-700
            bg-slate-900
            px-4
            py-2
            text-sm
            font-medium
            text-slate-300
            transition
            hover:bg-slate-800
            hover:text-white
          "
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}

// ============================================================
// HELPERS
// ============================================================

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
      month: '2-digit',
      year: 'numeric',
    }),

    time: value.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
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

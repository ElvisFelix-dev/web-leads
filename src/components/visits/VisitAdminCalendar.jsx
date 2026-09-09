import { useMemo, useState } from 'react';

import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';

import {
  format,
  parse,
  startOfWeek,
  getDay,
  isSameDay,
  isToday,
} from 'date-fns';

import { ptBR } from 'date-fns/locale';

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  BriefcaseBusiness,
  Video,
  PhoneCall,
  Handshake,
  FileText,
  Settings2,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  CalendarCheck,
  CircleDot,
  List,
  LayoutGrid,
  CalendarRange,
} from 'lucide-react';

import 'react-big-calendar/lib/css/react-big-calendar.css';

// ============================================================
// LOCALE
// ============================================================

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () =>
    startOfWeek(new Date(), {
      weekStartsOn: 1,
    }),
  getDay,
  locales,
});

// ============================================================
// TYPE CONFIG
// ============================================================

const TYPE_CONFIG = {
  visit: {
    label: 'Visita',
    color: '#3b82f6',
    soft: 'rgba(59, 130, 246, 0.12)',
    border: 'rgba(59, 130, 246, 0.30)',
    icon: CalendarDays,
  },

  meeting: {
    label: 'Reunião',
    color: '#8b5cf6',
    soft: 'rgba(139, 92, 246, 0.12)',
    border: 'rgba(139, 92, 246, 0.30)',
    icon: Handshake,
  },

  call: {
    label: 'Ligação',
    color: '#06b6d4',
    soft: 'rgba(6, 182, 212, 0.12)',
    border: 'rgba(6, 182, 212, 0.30)',
    icon: PhoneCall,
  },

  online_meeting: {
    label: 'Reunião online',
    color: '#6366f1',
    soft: 'rgba(99, 102, 241, 0.12)',
    border: 'rgba(99, 102, 241, 0.30)',
    icon: Video,
  },

  proposal: {
    label: 'Proposta',
    color: '#f59e0b',
    soft: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.30)',
    icon: FileText,
  },

  negotiation: {
    label: 'Negociação',
    color: '#f97316',
    soft: 'rgba(249, 115, 22, 0.12)',
    border: 'rgba(249, 115, 22, 0.30)',
    icon: Handshake,
  },

  internal: {
    label: 'Interno',
    color: '#64748b',
    soft: 'rgba(100, 116, 139, 0.12)',
    border: 'rgba(100, 116, 139, 0.30)',
    icon: Settings2,
  },

  other: {
    label: 'Outro',
    color: '#ec4899',
    soft: 'rgba(236, 72, 153, 0.12)',
    border: 'rgba(236, 72, 153, 0.30)',
    icon: MoreHorizontal,
  },
};

// ============================================================
// STATUS CONFIG
// ============================================================

const STATUS_CONFIG = {
  agendada: {
    label: 'Agendada',
    color: '#3b82f6',
    icon: CalendarCheck,
  },

  confirmada: {
    label: 'Confirmada',
    color: '#f59e0b',
    icon: CheckCircle2,
  },

  concluida: {
    label: 'Concluída',
    color: '#10b981',
    icon: CheckCircle2,
  },

  cancelada: {
    label: 'Cancelada',
    color: '#ef4444',
    icon: XCircle,
  },
};

// ============================================================
// TYPE NORMALIZATION
// ============================================================

function normalizeType(type) {
  if (!type) return 'other';

  const normalized = String(type).trim().toLowerCase().replace(/\s+/g, '_');

  const aliases = {
    visita: 'visit',

    reuniao: 'meeting',
    reunião: 'meeting',

    ligacao: 'call',
    ligação: 'call',

    online: 'online_meeting',

    videoconferencia: 'online_meeting',
    videoconferência: 'online_meeting',

    proposta: 'proposal',

    negociacao: 'negotiation',
    negociação: 'negotiation',

    interno: 'internal',

    outro: 'other',
  };

  return aliases[normalized] || normalized;
}

// ============================================================
// DATE HELPERS
// ============================================================

function getStartDate(visit) {
  return (
    visit?.start ||
    visit?.startAt ||
    visit?.scheduledAt ||
    visit?.date ||
    visit?.startDate
  );
}

function getEndDate(visit) {
  return visit?.end || visit?.endAt || visit?.endDate;
}

function safeDate(value) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

// ============================================================
// EVENT NORMALIZATION
// ============================================================

function normalizeEvent(visit) {
  const start = safeDate(getStartDate(visit));

  if (!start) return null;

  let end = safeDate(getEndDate(visit));

  if (!end || end <= start) {
    end = new Date(start.getTime() + 60 * 60 * 1000);
  }

  const type = normalizeType(
    visit?.type ||
      visit?.eventType ||
      visit?.calendarType ||
      visit?.appointmentType ||
      (visit?.property ? 'visit' : 'other'),
  );

  const property = visit?.propertyInfo || visit?.property || null;

  const lead = visit?.leadInfo || visit?.lead || null;

  const broker = visit?.brokerInfo || visit?.broker || null;

  const typeConfig = TYPE_CONFIG[type] || TYPE_CONFIG.other;

  const title =
    visit?.title ||
    visit?.subject ||
    (type === 'visit'
      ? property?.name || property?.title || 'Visita ao imóvel'
      : typeConfig.label);

  return {
    id: visit?._id,

    title,

    start,

    end,

    resource: visit,

    type,

    typeConfig,

    property,

    lead,

    broker,

    status: visit?.status || 'agendada',
  };
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function VisitAdminCalendar({
  visits = [],
  onSelectEvent,
  onSelectSlot,
}) {
  const [view, setView] = useState(Views.MONTH);

  const [date, setDate] = useState(new Date());

  // ==========================================================
  // EVENTS
  // ==========================================================

  const events = useMemo(() => {
    return visits.map(normalizeEvent).filter(Boolean);
  }, [visits]);

  // ==========================================================
  // METRICS
  // ==========================================================

  const metrics = useMemo(() => {
    return {
      total: events.length,

      scheduled: events.filter((event) => event.status === 'agendada').length,

      confirmed: events.filter((event) => event.status === 'confirmada').length,

      completed: events.filter((event) => event.status === 'concluida').length,

      cancelled: events.filter((event) => event.status === 'cancelada').length,
    };
  }, [events]);

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const navigateCalendar = (direction) => {
    const nextDate = new Date(date);

    if (view === Views.MONTH) {
      nextDate.setMonth(nextDate.getMonth() + direction);
    } else if (view === Views.WEEK) {
      nextDate.setDate(nextDate.getDate() + direction * 7);
    } else {
      nextDate.setDate(nextDate.getDate() + direction);
    }

    setDate(nextDate);
  };

  const handleToday = () => {
    setDate(new Date());
  };

  // ==========================================================
  // EVENT CLICK
  // ==========================================================

  const handleSelectEvent = (event) => {
    if (!event?.resource) return;

    onSelectEvent?.(event.resource);
  };

  // ==========================================================
  // SLOT CLICK
  // ==========================================================

  const handleSelectSlot = ({ start, end }) => {
    onSelectSlot?.({
      start,
      end,
    });
  };

  // ==========================================================
  // EVENT STYLE
  // ==========================================================

  const eventPropGetter = (event) => {
    const color = event?.typeConfig?.color || '#3b82f6';

    const cancelled = event?.status === 'cancelada';

    return {
      className: cancelled ? 'calendar-event-cancelled' : '',

      style: {
        background: cancelled
          ? 'rgba(71, 85, 105, 0.55)'
          : `linear-gradient(
                135deg,
                ${color},
                ${color}dd
              )`,

        borderColor: cancelled ? 'rgba(148,163,184,0.25)' : color,

        color: '#fff',

        opacity: cancelled ? 0.55 : 1,

        borderRadius: '10px',

        borderWidth: '1px',

        borderStyle: 'solid',

        padding: '5px 8px',

        boxShadow: cancelled ? 'none' : `0 6px 20px ${color}25`,

        transition: 'all 180ms ease',

        overflow: 'hidden',
      },
    };
  };

  // ==========================================================
  // DAY STYLE
  // ==========================================================

  const dayPropGetter = (calendarDate) => {
    if (isSameDay(calendarDate, new Date())) {
      return {
        className: 'rbc-day-today-premium',
      };
    }

    return {};
  };

  // ==========================================================
  // HEADER TITLE
  // ==========================================================

  const calendarTitle = useMemo(() => {
    if (view === Views.MONTH) {
      return format(date, 'MMMM yyyy', {
        locale: ptBR,
      });
    }

    if (view === Views.WEEK) {
      return `Semana de ${format(date, 'dd/MM/yyyy', {
        locale: ptBR,
      })}`;
    }

    return format(date, "EEEE, dd 'de' MMMM", {
      locale: ptBR,
    });
  }, [date, view]);

  // ==========================================================
  // EVENT COMPONENT
  // ==========================================================

  const EventComponent = ({ event }) => {
    const Icon = event?.typeConfig?.icon || CalendarDays;

    const leadName =
      event?.lead?.name ||
      event?.lead?.fullName ||
      event?.lead?.full_name ||
      '';

    const propertyName = event?.property?.name || event?.property?.title || '';

    return (
      <div className="group min-w-0 overflow-hidden">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-md bg-white/10">
            <Icon size={10} />
          </span>

          <span className="truncate text-[10px] font-bold tracking-tight">
            {event.title}
          </span>
        </div>

        <div className="mt-1 flex items-center gap-1 truncate text-[9px] font-medium text-white/75">
          <Clock3 size={9} />

          {format(event.start, 'HH:mm')}

          <span className="opacity-40">→</span>

          {format(event.end, 'HH:mm')}
        </div>

        {leadName && (
          <div className="mt-0.5 flex min-w-0 items-center gap-1 truncate text-[9px] text-white/70">
            <User size={9} className="shrink-0" />

            <span className="truncate">{leadName}</span>
          </div>
        )}

        {propertyName && (
          <div className="mt-0.5 flex min-w-0 items-center gap-1 truncate text-[8px] text-white/55">
            <Building2 size={8} className="shrink-0" />

            <span className="truncate">{propertyName}</span>
          </div>
        )}
      </div>
    );
  };

  // ==========================================================
  // TOOLBAR
  // ==========================================================

  const CalendarToolbar = () => {
    return null;
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-800/80 bg-[#080d17] shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
      {/* =====================================================
          PREMIUM HEADER
      ====================================================== */}

      <div className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900">
        {/* Background glow */}

        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-violet-500/5 blur-3xl" />

        <div className="relative px-5 py-5 lg:px-6">
          {/* TOP */}

          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            {/* TITLE */}

            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 shadow-lg shadow-blue-500/10">
                  <CalendarDays size={22} className="text-blue-400" />
                </div>

                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-slate-950 bg-emerald-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-white" />
                </span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold tracking-tight text-white">
                    Agenda
                  </h2>

                  <span className="rounded-full border border-slate-700 bg-slate-800/70 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Admin
                  </span>
                </div>

                <p className="mt-0.5 text-xs text-slate-500">
                  Gestão de visitas e compromissos
                </p>
              </div>
            </div>

            {/* METRICS */}

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:flex">
              <MiniMetric
                icon={CalendarDays}
                label="Total"
                value={metrics.total}
              />

              <MiniMetric
                icon={CalendarCheck}
                label="Agendadas"
                value={metrics.scheduled}
              />

              <MiniMetric
                icon={CheckCircle2}
                label="Confirmadas"
                value={metrics.confirmed}
              />

              <MiniMetric
                icon={CheckCircle2}
                label="Concluídas"
                value={metrics.completed}
              />
            </div>
          </div>

          {/* NAVIGATION */}

          <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigateCalendar(-1)}
                aria-label="Período anterior"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-slate-800
                  bg-slate-900/80
                  text-slate-400
                  transition
                  hover:border-slate-700
                  hover:bg-slate-800
                  hover:text-white
                  active:scale-95
                "
              >
                <ChevronLeft size={17} />
              </button>

              <button
                type="button"
                onClick={() => navigateCalendar(1)}
                aria-label="Próximo período"
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-slate-800
                  bg-slate-900/80
                  text-slate-400
                  transition
                  hover:border-slate-700
                  hover:bg-slate-800
                  hover:text-white
                  active:scale-95
                "
              >
                <ChevronRight size={17} />
              </button>

              <button
                type="button"
                onClick={handleToday}
                className="
                  ml-1
                  flex
                  h-10
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-blue-500/20
                  bg-blue-500/10
                  px-4
                  text-xs
                  font-bold
                  text-blue-400
                  transition
                  hover:border-blue-500/30
                  hover:bg-blue-500/15
                  active:scale-95
                "
              >
                <CalendarCheck size={14} />
                Hoje
              </button>

              <div className="ml-2 border-l border-slate-800 pl-4">
                <p className="text-sm font-bold capitalize text-white">
                  {calendarTitle}
                </p>

                <p className="mt-0.5 text-[10px] text-slate-600">
                  {format(date, "dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </p>
              </div>
            </div>

            {/* VIEW SWITCHER */}

            <div className="flex items-center rounded-xl border border-slate-800 bg-slate-950/80 p-1">
              <CalendarViewButton
                active={view === Views.MONTH}
                icon={LayoutGrid}
                onClick={() => setView(Views.MONTH)}
              >
                Mês
              </CalendarViewButton>

              <CalendarViewButton
                active={view === Views.WEEK}
                icon={CalendarRange}
                onClick={() => setView(Views.WEEK)}
              >
                Semana
              </CalendarViewButton>

              <CalendarViewButton
                active={view === Views.DAY}
                icon={CalendarDays}
                onClick={() => setView(Views.DAY)}
              >
                Dia
              </CalendarViewButton>

              <CalendarViewButton
                active={view === Views.AGENDA}
                icon={List}
                onClick={() => setView(Views.AGENDA)}
              >
                Agenda
              </CalendarViewButton>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          CALENDAR
      ====================================================== */}

      <div className="admin-calendar-premium p-2 sm:p-4">
        <Calendar
          localizer={localizer}
          events={events}
          date={date}
          view={view}
          onNavigate={handleToday}
          onView={setView}
          views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
          selectable
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          eventPropGetter={eventPropGetter}
          dayPropGetter={dayPropGetter}
          components={{
            event: EventComponent,
            toolbar: CalendarToolbar,
          }}
          popup
          messages={{
            today: 'Hoje',
            previous: 'Anterior',
            next: 'Próximo',

            month: 'Mês',
            week: 'Semana',
            day: 'Dia',
            agenda: 'Agenda',

            date: 'Data',
            time: 'Hora',
            event: 'Compromisso',

            noEventsInRange: 'Nenhum compromisso neste período.',

            showMore: (total) => `+${total} compromissos`,
          }}
          formats={{
            weekdayFormat: (value) =>
              format(value, 'EEE', {
                locale: ptBR,
              }),

            monthHeaderFormat: (value) =>
              format(value, 'MMMM yyyy', {
                locale: ptBR,
              }),

            dayHeaderFormat: (value) =>
              format(value, "EEEE, dd 'de' MMMM", {
                locale: ptBR,
              }),

            agendaDateFormat: (value) =>
              format(value, 'dd/MM/yyyy', {
                locale: ptBR,
              }),

            agendaTimeFormat: (value) =>
              format(value, 'HH:mm', {
                locale: ptBR,
              }),

            timeGutterFormat: (value) => format(value, 'HH:mm'),

            eventTimeRangeFormat: ({ start, end }) =>
              `${format(start, 'HH:mm')} – ${format(end, 'HH:mm')}`,
          }}
          min={new Date(1970, 0, 1, 6, 0)}
          max={new Date(1970, 0, 1, 22, 0)}
          step={30}
          timeslots={2}
        />
      </div>

      {/* =====================================================
          LEGEND
      ====================================================== */}

      <div className="border-t border-slate-800/80 bg-slate-950/60 px-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* TYPES */}

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {Object.entries(TYPE_CONFIG).map(([key, config]) => {
              const Icon = config.icon;

              return (
                <div key={key} className="flex items-center gap-2">
                  <span
                    className="flex h-6 w-6 items-center justify-center rounded-lg"
                    style={{
                      backgroundColor: config.soft,
                      color: config.color,
                      border: `1px solid ${config.border}`,
                    }}
                  >
                    <Icon size={11} />
                  </span>

                  <span className="text-[10px] font-medium text-slate-500">
                    {config.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* STATUS */}

          <div className="flex items-center gap-4 border-t border-slate-800 pt-3 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: config.color,
                    boxShadow: `0 0 8px ${config.color}66`,
                  }}
                />

                <span className="text-[9px] font-medium text-slate-600">
                  {config.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =====================================================
          PREMIUM CALENDAR CSS
      ====================================================== */}

      <style>{`

        .admin-calendar-premium {
          background:
            radial-gradient(
              circle at top right,
              rgba(59,130,246,0.035),
              transparent 35%
            ),
            #080d17;
        }

        .admin-calendar-premium
        .rbc-calendar {
          min-height: 700px;
          color: #cbd5e1;
          font-family: inherit;
        }

        /* TOOLBAR */

        .admin-calendar-premium
        .rbc-toolbar {
          display: none;
        }

        /* HEADER */

        .admin-calendar-premium
        .rbc-header {
          padding: 13px 8px;
          border-bottom:
            1px solid
            rgba(51,65,85,0.65);

          border-left:
            1px solid
            rgba(51,65,85,0.35);

          background:
            rgba(15,23,42,0.65);

          color: #64748b;

          font-size: 10px;

          font-weight: 800;

          letter-spacing:
            0.08em;

          text-transform:
            uppercase;
        }

        /* MONTH */

        .admin-calendar-premium
        .rbc-month-view {
          overflow: hidden;

          border:
            1px solid
            rgba(51,65,85,0.55);

          border-radius:
            18px;

          background:
            rgba(15,23,42,0.45);
        }

        .admin-calendar-premium
        .rbc-month-row {
          min-height: 125px;

          border-top:
            1px solid
            rgba(51,65,85,0.45);
        }

        .admin-calendar-premium
        .rbc-month-row:first-child {
          border-top: none;
        }

        .admin-calendar-premium
        .rbc-day-bg {
          border-left:
            1px solid
            rgba(51,65,85,0.35);

          background:
            rgba(2,6,23,0.12);

          transition:
            background 180ms ease;
        }

        .admin-calendar-premium
        .rbc-day-bg:hover {
          background:
            rgba(30,41,59,0.28);
        }

        /* DATE */

        .admin-calendar-premium
        .rbc-date-cell {
          padding:
            9px 10px 4px;

          text-align: right;

          font-size: 11px;

          font-weight: 700;

          color: #64748b;
        }

        .admin-calendar-premium
        .rbc-off-range {
          color: #334155;
        }

        .admin-calendar-premium
        .rbc-off-range-bg {
          background:
            rgba(2,6,23,0.22);
        }

        /* TODAY */

        .admin-calendar-premium
        .rbc-today-premium {
          background:
            linear-gradient(
              180deg,
              rgba(59,130,246,0.08),
              rgba(59,130,246,0.025)
            ) !important;

          box-shadow:
            inset 0 0 0 1px
            rgba(59,130,246,0.18);
        }

        .admin-calendar-premium
        .rbc-today-premium
        + .rbc-row-content
        .rbc-date-cell {
          color: #60a5fa;
        }

        /* EVENTS */

        .admin-calendar-premium
        .rbc-event {
          margin:
            2px 3px;

          min-height:
            48px;

          cursor:
            pointer;

          transition:
            transform 150ms ease,
            filter 150ms ease,
            box-shadow 150ms ease;
        }

        .admin-calendar-premium
        .rbc-event:hover {
          z-index: 20;

          transform:
            translateY(-1px)
            scale(1.01);

          filter:
            brightness(1.08);

          box-shadow:
            0 10px 28px
            rgba(0,0,0,0.35) !important;
        }

        .admin-calendar-premium
        .rbc-event-content {
          overflow:
            hidden;
        }

        /* CURRENT TIME */

        .admin-calendar-premium
        .rbc-current-time-indicator {
          height: 2px;

          background:
            linear-gradient(
              90deg,
              transparent,
              #3b82f6,
              transparent
            );

          box-shadow:
            0 0 10px
            rgba(59,130,246,0.6);
        }

        /* WEEK / DAY */

        .admin-calendar-premium
        .rbc-time-view {
          overflow: hidden;

          border:
            1px solid
            rgba(51,65,85,0.55);

          border-radius:
            18px;

          background:
            rgba(15,23,42,0.45);
        }

        .admin-calendar-premium
        .rbc-time-header {
          border-bottom:
            1px solid
            rgba(51,65,85,0.55);
        }

        .admin-calendar-premium
        .rbc-time-content {
          border-top: none;
        }

        .admin-calendar-premium
        .rbc-timeslot-group {
          min-height:
            64px;

          border-bottom:
            1px solid
            rgba(51,65,85,0.25);
        }

        .admin-calendar-premium
        .rbc-time-slot {
          border-top:
            1px solid
            rgba(51,65,85,0.18);

          color:
            #475569;
        }

        .admin-calendar-premium
        .rbc-time-gutter
        .rbc-time-slot {
          padding-right:
            10px;

          font-size:
            10px;

          font-weight:
            600;
        }

        /* AGENDA */

        .admin-calendar-premium
        .rbc-agenda-view {
          border:
            1px solid
            rgba(51,65,85,0.55);

          border-radius:
            18px;

          overflow:
            hidden;

          background:
            rgba(15,23,42,0.45);
        }

        .admin-calendar-premium
        .rbc-agenda-table {
          border:
            none;
        }

        .admin-calendar-premium
        .rbc-agenda-table thead th {
          padding:
            13px;

          border:
            none;

          border-bottom:
            1px solid
            rgba(51,65,85,0.5);

          background:
            rgba(15,23,42,0.8);

          color:
            #64748b;

          font-size:
            10px;

          text-transform:
            uppercase;

          letter-spacing:
            0.08em;
        }

        .admin-calendar-premium
        .rbc-agenda-table tbody td {
          padding:
            14px;

          border:
            none;

          border-bottom:
            1px solid
            rgba(51,65,85,0.25);

          color:
            #94a3b8;

          font-size:
            11px;
        }

        .admin-calendar-premium
        .rbc-agenda-table tbody tr:hover {
          background:
            rgba(30,41,59,0.25);
        }

        /* SHOW MORE */

        .admin-calendar-premium
        .rbc-show-more {
          margin-left:
            7px;

          color:
            #60a5fa;

          font-size:
            9px;

          font-weight:
            800;

          background:
            transparent;
        }

        /* SELECTED */

        .admin-calendar-premium
        .rbc-selected {
          box-shadow:
            0 0 0 2px
            rgba(255,255,255,0.35);
        }

        /* SLOT */

        .admin-calendar-premium
        .rbc-slot-selection {
          background:
            rgba(59,130,246,0.15);

          border:
            1px solid
            rgba(59,130,246,0.35);

          color:
            #93c5fd;
        }

        /* SCROLLBAR */

        .admin-calendar-premium
        .rbc-time-content::-webkit-scrollbar {
          width: 7px;
        }

        .admin-calendar-premium
        .rbc-time-content::-webkit-scrollbar-track {
          background:
            rgba(2,6,23,0.4);
        }

        .admin-calendar-premium
        .rbc-time-content::-webkit-scrollbar-thumb {
          background:
            rgba(71,85,105,0.45);

          border-radius:
            999px;
        }

        /* MOBILE */

        @media (max-width: 768px) {

          .admin-calendar-premium
          .rbc-calendar {
            min-height: 620px;
          }

          .admin-calendar-premium
          .rbc-month-row {
            min-height: 95px;
          }

          .admin-calendar-premium
          .rbc-event {
            min-height: 32px;

            padding:
              3px 5px;
          }

          .admin-calendar-premium
          .rbc-date-cell {
            padding:
              6px;

            font-size:
              9px;
          }

          .admin-calendar-premium
          .rbc-header {
            padding:
              9px 4px;

            font-size:
              8px;
          }
        }

      `}</style>
    </div>
  );
}

// ============================================================
// MINI METRIC
// ============================================================

function MiniMetric({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-[100px] items-center gap-2.5 rounded-xl border border-slate-800/80 bg-slate-900/60 px-3 py-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800/70 text-slate-400">
        <Icon size={13} />
      </div>

      <div>
        <p className="text-[8px] font-bold uppercase tracking-wider text-slate-600">
          {label}
        </p>

        <p className="mt-0.5 text-sm font-black text-white">{value}</p>
      </div>
    </div>
  );
}

// ============================================================
// VIEW BUTTON
// ============================================================

function CalendarViewButton({ active, onClick, children, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        items-center
        gap-1.5
        rounded-lg
        px-3
        py-2
        text-[10px]
        font-bold
        transition-all
        duration-200

        ${
          active
            ? `
              bg-blue-500/15
              text-blue-400
              shadow-sm
              shadow-blue-500/10
            `
            : `
              text-slate-500
              hover:bg-slate-800/50
              hover:text-slate-200
            `
        }
      `}
    >
      {Icon && <Icon size={12} />}

      {children}
    </button>
  );
}

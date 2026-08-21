import { useMemo, useState } from 'react';

import {
  FaChevronLeft,
  FaChevronRight,
  FaCalendarDay,
  FaClock,
  FaMapMarkerAlt,
  FaUser,
  FaBuilding,
  FaPhone,
  FaVideo,
  FaHandshake,
  FaFileSignature,
  FaTimes,
} from 'react-icons/fa';

// ============================================================
// STATUS
// ============================================================

const statusConfig = {
  agendada: {
    label: 'Agendada',
    dot: 'bg-blue-400',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },

  confirmada: {
    label: 'Confirmada',
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },

  realizada: {
    label: 'Realizada',
    dot: 'bg-purple-400',
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },

  cancelada: {
    label: 'Cancelada',
    dot: 'bg-red-400',
    badge: 'bg-red-500/10 text-red-400 border-red-500/20',
  },

  nao_compareceu: {
    label: 'Não compareceu',
    dot: 'bg-yellow-400',
    badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
};

// ============================================================
// TIPOS
// ============================================================

const typeConfig = {
  visit: {
    label: 'Visita',
    icon: FaMapMarkerAlt,
    color: 'text-blue-400',
  },

  meeting: {
    label: 'Reunião',
    icon: FaHandshake,
    color: 'text-purple-400',
  },

  call: {
    label: 'Ligação',
    icon: FaPhone,
    color: 'text-emerald-400',
  },

  online_meeting: {
    label: 'Reunião online',
    icon: FaVideo,
    color: 'text-cyan-400',
  },

  proposal: {
    label: 'Proposta',
    icon: FaFileSignature,
    color: 'text-orange-400',
  },

  negotiation: {
    label: 'Negociação',
    icon: FaHandshake,
    color: 'text-pink-400',
  },

  internal: {
    label: 'Interno',
    icon: FaCalendarDay,
    color: 'text-gray-400',
  },

  other: {
    label: 'Outro',
    icon: FaCalendarDay,
    color: 'text-gray-400',
  },
};

// ============================================================
// COMPONENT
// ============================================================

export default function VisitCalendar({
  visits = [],
  onSelectDate,
  onSelectVisit,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const [selectedDate, setSelectedDate] = useState(new Date());

  // ============================================================
  // DATA ATUAL
  // ============================================================

  const month = currentDate.getMonth();

  const year = currentDate.getFullYear();

  const firstDay = new Date(year, month, 1);

  const lastDay = new Date(year, month + 1, 0);

  const daysInMonth = lastDay.getDate();

  const startWeekDay = firstDay.getDay();

  // ============================================================
  // AGRUPAR AGENDAMENTOS
  // ============================================================

  const visitsByDay = useMemo(() => {
    const map = {};

    visits.forEach((visit) => {
      const dateValue = visit.date || visit.scheduledAt;

      if (!dateValue) {
        return;
      }

      const date = new Date(dateValue);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const key = getDateKey(date);

      if (!map[key]) {
        map[key] = [];
      }

      map[key].push(visit);
    });

    // Ordenar compromissos por horário
    Object.keys(map).forEach((key) => {
      map[key].sort((a, b) => {
        const dateA = new Date(a.date || a.scheduledAt);
        const dateB = new Date(b.date || b.scheduledAt);

        return dateA.getTime() - dateB.getTime();
      });
    });

    return map;
  }, [visits]);

  // ============================================================
  // COMPROMISSOS DO DIA SELECIONADO
  // ============================================================

  const selectedDayVisits = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    return visitsByDay[getDateKey(selectedDate)] || [];
  }, [selectedDate, visitsByDay]);

  // ============================================================
  // TOTAL DO MÊS
  // ============================================================

  const monthVisits = useMemo(() => {
    return visits.filter((visit) => {
      const value = visit.date || visit.scheduledAt;

      if (!value) {
        return false;
      }

      const date = new Date(value);

      return date.getMonth() === month && date.getFullYear() === year;
    });
  }, [visits, month, year]);

  // ============================================================
  // MUDAR MÊS
  // ============================================================

  const changeMonth = (direction) => {
    setCurrentDate(new Date(year, month + direction, 1));
  };

  // ============================================================
  // IR PARA HOJE
  // ============================================================

  const goToday = () => {
    const today = new Date();

    setCurrentDate(today);

    setSelectedDate(today);

    onSelectDate?.(today);
  };

  // ============================================================
  // SELECIONAR DIA
  // ============================================================

  const handleSelectDate = (date) => {
    setSelectedDate(date);

    onSelectDate?.(date);
  };

  // ============================================================
  // NOME DO MÊS
  // ============================================================

  const monthName = currentDate.toLocaleString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  // ============================================================
  // DIAS DA SEMANA
  // ============================================================

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // ============================================================
  // CÉLULAS DO CALENDÁRIO
  // ============================================================

  const cells = [];

  for (let i = 0; i < startWeekDay; i++) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day));
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">
      {/* ======================================================
          HEADER DO CALENDÁRIO
      ====================================================== */}

      <div
        className="
          flex
          flex-col
          gap-4
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        <div>
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-blue-500/10
                text-blue-400
              "
            >
              <FaCalendarDay />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">
                {capitalize(monthName)}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {monthVisits.length}{' '}
                {monthVisits.length === 1 ? 'compromisso' : 'compromissos'}{' '}
                neste mês
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-gray-800
              bg-gray-900
              text-gray-400
              transition
              hover:border-gray-700
              hover:bg-gray-800
              hover:text-white
            "
          >
            <FaChevronLeft />
          </button>

          <button
            type="button"
            onClick={goToday}
            className="
              flex
              items-center
              gap-2
              rounded-xl
              border
              border-gray-800
              bg-gray-900
              px-4
              py-2.5
              text-sm
              font-medium
              text-gray-300
              transition
              hover:bg-gray-800
              hover:text-white
            "
          >
            <FaCalendarDay />
            Hoje
          </button>

          <button
            type="button"
            onClick={() => changeMonth(1)}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-gray-800
              bg-gray-900
              text-gray-400
              transition
              hover:border-gray-700
              hover:bg-gray-800
              hover:text-white
            "
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      {/* ======================================================
          CALENDÁRIO
      ====================================================== */}

      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          border-gray-800
          bg-gray-950
        "
      >
        {/* DIAS DA SEMANA */}

        <div
          className="
            grid
            grid-cols-7
            border-b
            border-gray-800
            bg-gray-900/80
          "
        >
          {weekDays.map((day) => (
            <div
              key={day}
              className="
                border-r
                border-gray-800
                px-2
                py-3
                text-center
                text-[11px]
                font-semibold
                uppercase
                tracking-wider
                text-gray-500
                last:border-r-0
              "
            >
              {day}
            </div>
          ))}
        </div>

        {/* CÉLULAS */}

        <div className="grid grid-cols-7">
          {cells.map((date, index) => {
            if (!date) {
              return (
                <div
                  key={`empty-${index}`}
                  className="
                    min-h-[145px]
                    border-b
                    border-r
                    border-gray-800
                    bg-gray-950/40
                  "
                />
              );
            }

            const key = getDateKey(date);

            const dayVisits = visitsByDay[key] || [];

            const isToday = key === getDateKey(new Date());

            const isSelected = selectedDate && getDateKey(selectedDate) === key;

            return (
              <div
                key={key}
                className={`
                  group
                  relative
                  min-h-[145px]
                  border-b
                  border-r
                  border-gray-800
                  p-2
                  transition
                  ${isSelected ? 'bg-blue-500/[0.04]' : 'bg-gray-950'}
                  hover:bg-gray-900
                `}
              >
                {/* DIA */}

                <button
                  type="button"
                  onClick={() => handleSelectDate(date)}
                  className="
                    mb-2
                    flex
                    items-center
                    gap-2
                    text-left
                  "
                >
                  <span
                    className={`
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-lg
                      text-sm
                      font-semibold
                      transition

                      ${
                        isToday
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                          : isSelected
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'text-gray-400 group-hover:text-white'
                      }
                    `}
                  >
                    {date.getDate()}
                  </span>

                  {dayVisits.length > 0 && (
                    <span className="text-[10px] font-medium text-gray-600">
                      {dayVisits.length}
                    </span>
                  )}
                </button>

                {/* COMPROMISSOS */}

                <div className="space-y-1.5">
                  {dayVisits.slice(0, 4).map((visit) => (
                    <CalendarEvent
                      key={visit._id}
                      visit={visit}
                      onClick={() => onSelectVisit?.(visit)}
                    />
                  ))}

                  {dayVisits.length > 4 && (
                    <button
                      type="button"
                      onClick={() => handleSelectDate(date)}
                      className="
                        w-full
                        rounded-lg
                        px-2
                        py-1
                        text-left
                        text-[11px]
                        font-medium
                        text-blue-400
                        transition
                        hover:bg-blue-500/10
                      "
                    >
                      + {dayVisits.length - 4} compromissos
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================
          COMPROMISSOS DO DIA
      ====================================================== */}

      <SelectedDayPanel
        date={selectedDate}
        visits={selectedDayVisits}
        onSelectVisit={onSelectVisit}
      />

      {/* ======================================================
          LEGENDA
      ====================================================== */}

      <div
        className="
          flex
          flex-wrap
          items-center
          gap-x-5
          gap-y-3
          border-t
          border-gray-800
          pt-5
        "
      >
        {Object.entries(statusConfig).map(([status, config]) => (
          <div
            key={status}
            className="
                flex
                items-center
                gap-2
                text-xs
                text-gray-500
              "
          >
            <span
              className={`
                  h-2.5
                  w-2.5
                  rounded-full
                  ${config.dot}
                `}
            />

            {config.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// EVENTO DO CALENDÁRIO
// ============================================================

function CalendarEvent({ visit, onClick }) {
  const status = statusConfig[visit.status] || statusConfig.agendada;

  const type = typeConfig[visit.type] || typeConfig.visit;

  const TypeIcon = type.icon;

  const date = new Date(visit.date || visit.scheduledAt);

  const time = Number.isNaN(date.getTime())
    ? '--:--'
    : date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });

  const leadName = visit.lead?.name || visit.leadName || 'Compromisso';

  return (
    <button
      type="button"
      onClick={onClick}
      title={visit.title || leadName}
      className="
        w-full
        overflow-hidden
        rounded-lg
        border
        border-gray-800
        bg-gray-900
        p-2
        text-left
        transition
        hover:border-gray-700
        hover:bg-gray-800
      "
    >
      <div className="flex items-center gap-2">
        <span
          className={`
            h-2
            w-2
            shrink-0
            rounded-full
            ${status.dot}
          `}
        />

        <span className="text-[10px] font-semibold text-gray-500">{time}</span>
      </div>

      <div className="mt-1 flex items-center gap-1.5">
        <TypeIcon className={`shrink-0 text-[10px] ${type.color}`} />

        <span className="truncate text-[11px] font-medium text-gray-200">
          {visit.title || leadName}
        </span>
      </div>

      {visit.property?.name && (
        <div className="mt-1 flex items-center gap-1.5">
          <FaBuilding className="shrink-0 text-[9px] text-gray-600" />

          <span className="truncate text-[10px] text-gray-600">
            {visit.property.name}
          </span>
        </div>
      )}
    </button>
  );
}

// ============================================================
// PAINEL DO DIA
// ============================================================

function SelectedDayPanel({ date, visits, onSelectVisit }) {
  if (!date) {
    return null;
  }

  const readableDate = date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-gray-800
        bg-gray-900
      "
    >
      {/* HEADER */}

      <div
        className="
          flex
          flex-col
          gap-3
          border-b
          border-gray-800
          p-5
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            Agenda do dia
          </p>

          <h3 className="mt-1 text-lg font-semibold capitalize text-white">
            {readableDate}
          </h3>
        </div>

        <div
          className="
            rounded-lg
            bg-gray-800
            px-3
            py-2
            text-xs
            font-medium
            text-gray-400
          "
        >
          {visits.length} {visits.length === 1 ? 'compromisso' : 'compromissos'}
        </div>
      </div>

      {/* LISTA */}

      {visits.length === 0 ? (
        <div className="p-10 text-center">
          <div
            className="
              mx-auto
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-xl
              bg-gray-800
              text-gray-600
            "
          >
            <FaCalendarDay />
          </div>

          <p className="mt-3 text-sm font-medium text-gray-400">
            Nenhum compromisso agendado
          </p>

          <p className="mt-1 text-xs text-gray-600">
            Este dia está livre na sua agenda.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-800">
          {visits.map((visit) => (
            <DayEvent
              key={visit._id}
              visit={visit}
              onClick={() => onSelectVisit?.(visit)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// EVENTO DO PAINEL
// ============================================================

function DayEvent({ visit, onClick }) {
  const status = statusConfig[visit.status] || statusConfig.agendada;

  const type = typeConfig[visit.type] || typeConfig.visit;

  const TypeIcon = type.icon;

  const date = new Date(visit.date || visit.scheduledAt);

  const startTime = !Number.isNaN(date.getTime())
    ? date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '--:--';

  let endTime = null;

  if (visit.endDate) {
    const endDate = new Date(visit.endDate);

    if (!Number.isNaN(endDate.getTime())) {
      endTime = endDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex
        w-full
        gap-4
        p-5
        text-left
        transition
        hover:bg-gray-800/60
      "
    >
      {/* HORÁRIO */}

      <div className="w-16 shrink-0">
        <p className="text-sm font-semibold text-white">{startTime}</p>

        {endTime && (
          <p className="mt-1 text-[11px] text-gray-600">até {endTime}</p>
        )}
      </div>

      {/* INDICADOR */}

      <div className="flex flex-col items-center">
        <span
          className={`
            mt-1
            h-3
            w-3
            rounded-full
            ${status.dot}
          `}
        />

        <span className="mt-1 h-full w-px bg-gray-800" />
      </div>

      {/* CONTEÚDO */}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <TypeIcon className={`text-sm ${type.color}`} />

          <h4 className="font-semibold text-gray-200">
            {visit.title || visit.lead?.name || 'Compromisso'}
          </h4>

          <span
            className={`
              rounded-md
              border
              px-2
              py-0.5
              text-[10px]
              font-semibold
              ${status.badge}
            `}
          >
            {status.label}
          </span>
        </div>

        {/* LEAD */}

        {visit.lead?.name && (
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <FaUser />

            <span>{visit.lead.name}</span>

            {visit.lead.phone && (
              <>
                <span className="text-gray-700">•</span>

                <span>{visit.lead.phone}</span>
              </>
            )}
          </div>
        )}

        {/* IMÓVEL */}

        {visit.property?.name && (
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
            <FaBuilding />

            <span className="truncate">{visit.property.name}</span>
          </div>
        )}

        {/* ENDEREÇO */}

        {visit.address && (
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-600">
            <FaMapMarkerAlt />

            <span className="truncate">{visit.address}</span>
          </div>
        )}

        {/* OBSERVAÇÃO */}

        {visit.notes && (
          <p className="mt-3 line-clamp-2 text-xs leading-5 text-gray-600">
            {visit.notes}
          </p>
        )}
      </div>
    </button>
  );
}

// ============================================================
// HELPERS
// ============================================================

function getDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function capitalize(value) {
  if (!value) {
    return '';
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

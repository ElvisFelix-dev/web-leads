import {
  FaCalendarAlt,
  FaClock,
  FaHome,
  FaMapMarkerAlt,
  FaStickyNote,
  FaUser,
  FaChevronRight,
  FaExternalLinkAlt,
  FaVideo,
  FaPhone,
  FaUsers,
  FaFileSignature,
  FaHandshake,
  FaBuilding,
  FaUserClock,
  FaCoffee,
  FaBriefcase,
  FaCircle,
} from 'react-icons/fa';

import VisitStatusBadge from './VisitStatusBadge';
import VisitActions from './VisitActions';

export default function VisitCard({ visit, onRefresh }) {
  // ============================================================
  // DATE
  // ============================================================

  const date = visit?.date ? new Date(visit.date) : null;

  const endDate = visit?.endDate ? new Date(visit.endDate) : null;

  const validDate = date && !Number.isNaN(date.getTime());

  const validEndDate = endDate && !Number.isNaN(endDate.getTime());

  const formattedDate = validDate
    ? date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'Data não informada';

  const formattedTime = validDate
    ? date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '--:--';

  const formattedEndTime = validEndDate
    ? endDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  // ============================================================
  // DURATION
  // ============================================================

  const durationMinutes =
    validDate && validEndDate
      ? Math.max(0, Math.round((endDate.getTime() - date.getTime()) / 60000))
      : null;

  const durationLabel = durationMinutes
    ? durationMinutes >= 60
      ? `${Math.floor(durationMinutes / 60)}h${
          durationMinutes % 60 ? ` ${durationMinutes % 60}min` : ''
        }`
      : `${durationMinutes}min`
    : null;

  // ============================================================
  // PERSONAL / COMMERCIAL
  // ============================================================

  /**
   * Para não quebrar seu backend atual:
   *
   * - isPersonal === true
   * - category === "personal"
   * - type === "personal"
   *
   * qualquer um desses caracteriza compromisso pessoal.
   *
   * Se posteriormente você adicionar "category" no model,
   * o componente já estará preparado.
   */

  const isPersonal =
    visit?.isPersonal === true ||
    visit?.category === 'personal' ||
    visit?.type === 'personal';

  const isCommercial = !isPersonal;

  // ============================================================
  // TYPE CONFIG
  // ============================================================

  const commercialTypes = {
    visit: {
      label: 'Visita',
      icon: FaHome,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      accent: 'bg-blue-500',
    },

    meeting: {
      label: 'Reunião',
      icon: FaUsers,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/20',
      accent: 'bg-violet-500',
    },

    call: {
      label: 'Ligação',
      icon: FaPhone,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      accent: 'bg-emerald-500',
    },

    online_meeting: {
      label: 'Reunião online',
      icon: FaVideo,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
      accent: 'bg-cyan-500',
    },

    proposal: {
      label: 'Proposta',
      icon: FaFileSignature,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      accent: 'bg-amber-500',
    },

    negotiation: {
      label: 'Negociação',
      icon: FaHandshake,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/20',
      accent: 'bg-orange-500',
    },
  };

  const personalTypes = {
    personal: {
      label: 'Pessoal',
      icon: FaUserClock,
      color: 'text-pink-400',
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/20',
      accent: 'bg-pink-500',
    },

    internal: {
      label: 'Interno',
      icon: FaBuilding,
      color: 'text-gray-300',
      bg: 'bg-gray-500/10',
      border: 'border-gray-500/20',
      accent: 'bg-gray-500',
    },

    coffee: {
      label: 'Pessoal',
      icon: FaCoffee,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      accent: 'bg-rose-500',
    },

    other: {
      label: 'Outro',
      icon: FaCalendarAlt,
      color: 'text-sky-400',
      bg: 'bg-sky-500/10',
      border: 'border-sky-500/20',
      accent: 'bg-sky-500',
    },
  };

  const config = isPersonal
    ? personalTypes[visit?.type] || personalTypes.personal
    : commercialTypes[visit?.type] || commercialTypes.meeting;

  const TypeIcon = config.icon;

  // ============================================================
  // DATA
  // ============================================================

  const leadName = visit?.lead?.name || visit?.lead?.fullName || null;

  const propertyName =
    visit?.property?.name ||
    visit?.property?.title ||
    visit?.property?.reference ||
    null;

  const location = visit?.location || visit?.address || null;

  const brokerName = visit?.broker?.name || visit?.broker?.fullName || null;

  const meetingUrl = visit?.meetingUrl || null;

  const participantsCount = Array.isArray(visit?.participants)
    ? visit.participants.length
    : 0;

  // ============================================================
  // DATE STATE
  // ============================================================

  const now = new Date();

  const isToday = validDate && date.toDateString() === now.toDateString();

  const isUpcoming =
    validDate &&
    date.getTime() > now.getTime() &&
    !['cancelada', 'cancelled', 'realizada', 'completed'].includes(
      visit?.status,
    );

  // ============================================================
  // PERSONAL CARD
  // ============================================================

  if (isPersonal) {
    return (
      <article
        className="
          group
          relative
          overflow-hidden
          rounded-[26px]
          border
          border-pink-500/10
          bg-gradient-to-br
          from-gray-900
          via-gray-900
          to-pink-950/10
          shadow-xl
          shadow-black/20
          transition-all
          duration-300
          hover:-translate-y-1
          hover:border-pink-500/25
          hover:shadow-2xl
        "
      >
        {/* ACCENT */}

        <div
          className="
            absolute
            inset-y-0
            left-0
            w-1
            bg-gradient-to-b
            from-pink-400
            via-rose-500
            to-transparent
          "
        />

        <div className="p-6 pl-7">
          {/* HEADER */}

          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div
                className="
                  flex
                  h-14
                  w-14
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-pink-500/20
                  bg-pink-500/10
                  text-pink-400
                  shadow-lg
                  shadow-pink-500/5
                "
              >
                <TypeIcon size={21} />
              </div>

              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.16em]
                      text-pink-400
                    "
                  >
                    Agenda pessoal
                  </span>

                  {isToday && (
                    <span
                      className="
                        rounded-full
                        bg-emerald-500/10
                        px-2
                        py-0.5
                        text-[9px]
                        font-bold
                        uppercase
                        text-emerald-400
                      "
                    >
                      Hoje
                    </span>
                  )}
                </div>

                <h3
                  className="
                    truncate
                    text-lg
                    font-bold
                    text-white
                  "
                >
                  {visit?.title || 'Compromisso pessoal'}
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Compromisso particular
                </p>
              </div>
            </div>

            <VisitStatusBadge status={visit?.status} />
          </div>

          {/* DATE */}

          <div
            className="
              mt-6
              flex
              items-center
              gap-4
              rounded-2xl
              border
              border-gray-800
              bg-gray-950/50
              p-4
            "
          >
            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                flex-col
                items-center
                justify-center
                rounded-xl
                bg-pink-500/10
                text-pink-400
              "
            >
              <span className="text-[9px] font-bold uppercase">
                {validDate
                  ? date
                      .toLocaleDateString('pt-BR', { month: 'short' })
                      .replace('.', '')
                  : '--'}
              </span>

              <strong className="text-xl leading-none text-white">
                {validDate ? date.getDate() : '--'}
              </strong>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs capitalize text-gray-500">
                {formattedDate}
              </p>

              <div className="mt-1 flex items-center gap-2">
                <FaClock size={11} className="text-pink-400" />

                <strong className="text-base text-white">
                  {formattedTime}
                </strong>

                {formattedEndTime && (
                  <>
                    <FaChevronRight size={8} className="text-gray-600" />

                    <span className="text-sm text-gray-400">
                      {formattedEndTime}
                    </span>
                  </>
                )}

                {durationLabel && (
                  <span
                    className="
                      rounded-full
                      border
                      border-gray-800
                      px-2
                      py-1
                      text-[9px]
                      font-bold
                      text-gray-500
                    "
                  >
                    {durationLabel}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* LOCATION */}

          {location && (
            <div
              className="
                mt-3
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-gray-800
                bg-gray-950/30
                px-4
                py-3
              "
            >
              <FaMapMarkerAlt className="text-pink-400" size={13} />

              <span className="truncate text-sm text-gray-400">{location}</span>
            </div>
          )}

          {/* NOTES */}

          {visit?.notes && (
            <div
              className="
                mt-3
                rounded-xl
                border
                border-gray-800
                bg-gray-950/30
                p-4
              "
            >
              <div className="flex gap-3">
                <FaStickyNote
                  className="mt-1 shrink-0 text-gray-600"
                  size={13}
                />

                <p className="text-sm leading-6 text-gray-400">{visit.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* ACTIONS */}

        <div
          className="
            border-t
            border-gray-800
            bg-gray-950/40
            px-6
            py-4
          "
        >
          <VisitActions visit={visit} onRefresh={onRefresh} />
        </div>
      </article>
    );
  }

  // ============================================================
  // COMMERCIAL CARD
  // ============================================================

  return (
    <article
      className="
        group
        relative
        overflow-hidden
        rounded-[26px]
        border
        border-gray-800
        bg-gray-900
        shadow-xl
        shadow-black/20
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-blue-500/20
        hover:shadow-2xl
      "
    >
      {/* ACCENT */}

      <div
        className={`
          absolute
          inset-y-0
          left-0
          w-1
          ${config.accent}
        `}
      />

      <div className="p-6 pl-7">
        {/* HEADER */}

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span
                className={`
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  px-3
                  py-1.5
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wider
                  ${config.bg}
                  ${config.border}
                  ${config.color}
                `}
              >
                <TypeIcon size={10} />

                {config.label}
              </span>

              {isToday && (
                <span
                  className="
                    rounded-full
                    bg-emerald-500/10
                    px-3
                    py-1.5
                    text-[10px]
                    font-bold
                    uppercase
                    text-emerald-400
                  "
                >
                  Hoje
                </span>
              )}

              {isUpcoming && !isToday && (
                <span
                  className="
                    rounded-full
                    bg-blue-500/10
                    px-3
                    py-1.5
                    text-[10px]
                    font-bold
                    uppercase
                    text-blue-400
                  "
                >
                  Próximo
                </span>
              )}
            </div>

            <h3 className="truncate text-xl font-bold text-white">
              {visit?.title || config.label}
            </h3>

            <p className="mt-1 text-sm text-gray-500">Compromisso comercial</p>
          </div>

          <VisitStatusBadge status={visit?.status} />
        </div>

        {/* LEAD + PROPERTY */}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {leadName && (
            <div
              className="
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-gray-800
                bg-gray-950/50
                p-3
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-500/10
                  text-blue-400
                "
              >
                <FaUser size={13} />
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-600">
                  Lead
                </p>

                <p className="truncate text-sm font-semibold text-gray-200">
                  {leadName}
                </p>
              </div>
            </div>
          )}

          {propertyName && (
            <div
              className="
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-gray-800
                bg-gray-950/50
                p-3
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-indigo-500/10
                  text-indigo-400
                "
              >
                <FaHome size={13} />
              </div>

              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-600">
                  Imóvel
                </p>

                <p className="truncate text-sm font-semibold text-gray-200">
                  {propertyName}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* DATE */}

        <div
          className="
            mt-4
            rounded-2xl
            border
            border-gray-800
            bg-gradient-to-br
            from-blue-500/[0.06]
            to-gray-950
            p-4
          "
        >
          <div className="flex items-center gap-4">
            <div
              className={`
                flex
                h-14
                w-14
                shrink-0
                flex-col
                items-center
                justify-center
                rounded-2xl
                ${config.bg}
                ${config.color}
              `}
            >
              <span className="text-[9px] font-bold uppercase">
                {validDate
                  ? date
                      .toLocaleDateString('pt-BR', { month: 'short' })
                      .replace('.', '')
                  : '--'}
              </span>

              <span className="text-2xl font-bold leading-none text-white">
                {validDate ? date.getDate() : '--'}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs capitalize text-gray-500">
                {formattedDate}
              </p>

              <div className="mt-1 flex items-center gap-2">
                <FaClock className={config.color} size={12} />

                <strong className="text-lg text-white">{formattedTime}</strong>

                {formattedEndTime && (
                  <>
                    <FaChevronRight size={8} className="text-gray-600" />

                    <span className="text-sm text-gray-400">
                      {formattedEndTime}
                    </span>
                  </>
                )}
              </div>
            </div>

            {durationLabel && (
              <div className="hidden text-right sm:block">
                <p className="text-[9px] font-bold uppercase tracking-wider text-gray-600">
                  Duração
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-300">
                  {durationLabel}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* LOCATION */}

        {location && (
          <div className="mt-3 flex items-center gap-3">
            <FaMapMarkerAlt size={12} className="shrink-0 text-red-400" />

            <span className="truncate text-sm text-gray-400">{location}</span>
          </div>
        )}

        {/* ONLINE */}

        {meetingUrl && (
          <a
            href={meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="
              mt-3
              flex
              items-center
              justify-between
              rounded-xl
              border
              border-cyan-500/20
              bg-cyan-500/5
              px-4
              py-3
              text-sm
              text-cyan-400
              transition
              hover:bg-cyan-500/10
            "
          >
            <span className="flex items-center gap-2">
              <FaVideo size={12} />
              Entrar na reunião online
            </span>

            <FaExternalLinkAlt size={11} />
          </a>
        )}

        {/* NOTES */}

        {visit?.notes && (
          <div
            className="
              mt-4
              flex
              gap-3
              rounded-xl
              border
              border-gray-800
              bg-gray-950/30
              p-4
            "
          >
            <FaStickyNote className="mt-1 shrink-0 text-amber-400" size={13} />

            <p className="whitespace-pre-wrap text-sm leading-6 text-gray-400">
              {visit.notes}
            </p>
          </div>
        )}
      </div>

      {/* ACTIONS */}

      <div
        className="
          border-t
          border-gray-800
          bg-gray-950/40
          px-6
          py-4
        "
      >
        <VisitActions visit={visit} onRefresh={onRefresh} />
      </div>
    </article>
  );
}

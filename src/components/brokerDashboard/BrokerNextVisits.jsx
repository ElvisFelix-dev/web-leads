import { useNavigate } from 'react-router-dom';

import {
  FaCalendarAlt,
  FaUser,
  FaHome,
  FaPhone,
  FaClock,
  FaMapMarkerAlt,
  FaWhatsapp,
  FaStickyNote,
  FaChevronRight,
} from 'react-icons/fa';

export default function BrokerNextVisits({ visits = [] }) {
  const navigate = useNavigate();

  const statusConfig = {
    agendada: {
      label: 'Agendada',
      style: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    },

    confirmada: {
      label: 'Confirmada',
      style: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },

    realizada: {
      label: 'Realizada',
      style: 'bg-green-500/10 text-green-400 border-green-500/20',
    },

    cancelada: {
      label: 'Cancelada',
      style: 'bg-red-500/10 text-red-400 border-red-500/20',
    },

    pendente: {
      label: 'Pendente',
      style: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    },
  };

  /*
   * ---------------------------------------------------------
   * HELPERS
   * ---------------------------------------------------------
   */

  const getDate = (date) => {
    if (!date) return null;

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed;
  };

  const formatDate = (date) => {
    const parsed = getDate(date);

    if (!parsed) {
      return 'Data não informada';
    }

    return parsed.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (date) => {
    const parsed = getDate(date);

    if (!parsed) {
      return '--:--';
    }

    return parsed.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatShortDate = (date) => {
    const parsed = getDate(date);

    if (!parsed) {
      return '--/--';
    }

    return parsed.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  const isToday = (date) => {
    const parsed = getDate(date);

    if (!parsed) return false;

    const now = new Date();

    return (
      parsed.getDate() === now.getDate() &&
      parsed.getMonth() === now.getMonth() &&
      parsed.getFullYear() === now.getFullYear()
    );
  };

  const isTomorrow = (date) => {
    const parsed = getDate(date);

    if (!parsed) return false;

    const tomorrow = new Date();

    tomorrow.setDate(tomorrow.getDate() + 1);

    return (
      parsed.getDate() === tomorrow.getDate() &&
      parsed.getMonth() === tomorrow.getMonth() &&
      parsed.getFullYear() === tomorrow.getFullYear()
    );
  };

  const getDateLabel = (date) => {
    if (isToday(date)) {
      return 'Hoje';
    }

    if (isTomorrow(date)) {
      return 'Amanhã';
    }

    return formatShortDate(date);
  };

  const getClientName = (visit) => {
    return (
      visit.name ||
      visit.client?.name ||
      visit.lead?.name ||
      visit.lead?.fullName ||
      'Cliente não informado'
    );
  };

  const getClientPhone = (visit) => {
    return (
      visit.phone ||
      visit.client?.phone ||
      visit.lead?.phone ||
      visit.lead?.whatsapp ||
      ''
    );
  };

  const getPropertyName = (visit) => {
    if (typeof visit.property === 'string') {
      return visit.property;
    }

    return (
      visit.property?.title ||
      visit.property?.name ||
      visit.property?.reference ||
      'Imóvel não informado'
    );
  };

  const getPropertyAddress = (visit) => {
    if (!visit.property || typeof visit.property === 'string') {
      return visit.address || visit.propertyAddress || '';
    }

    if (typeof visit.property.address === 'string') {
      return visit.property.address;
    }

    if (visit.property.address) {
      const address = visit.property.address;

      return [
        address.street,
        address.number,
        address.neighborhood,
        address.city,
      ]
        .filter(Boolean)
        .join(', ');
    }

    return '';
  };

  const getNotes = (visit) => {
    return (
      visit.notes ||
      visit.observation ||
      visit.observations ||
      visit.description ||
      ''
    );
  };

  const getVisitType = (visit) => {
    return visit.type || visit.visitType || visit.locationType || '';
  };

  const getDuration = (visit) => {
    if (visit.duration) {
      return `${visit.duration} min`;
    }

    if (visit.durationMinutes) {
      return `${visit.durationMinutes} min`;
    }

    return '';
  };

  const getStatus = (visit) => {
    const status = visit.status || 'agendada';

    return (
      statusConfig[status] || {
        label: status,
        style: 'bg-gray-700/50 text-gray-300 border-gray-600',
      }
    );
  };

  const normalizePhone = (phone) => {
    if (!phone) return '';

    return phone.replace(/\D/g, '');
  };

  /*
   * ---------------------------------------------------------
   * VISITAS
   * ---------------------------------------------------------
   */

  const activeStatuses = ['agendada', 'confirmada', 'pendente'];

  const orderedVisits = [...visits]
    .filter((visit) => {
      if (!visit?.visitDate) return false;

      if (visit.status && !activeStatuses.includes(visit.status)) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      return new Date(a.visitDate) - new Date(b.visitDate);
    })
    .slice(0, 3);

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <div
      className="
        bg-gray-900
        rounded-2xl
        border
        border-gray-800
        p-6
        shadow-xl
      "
    >
      {/* HEADER */}

      <div
        className="
          flex
          items-center
          justify-between
          mb-6
        "
      >
        <div>
          <div className="flex items-center gap-3">
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
              "
            >
              <FaCalendarAlt className="text-blue-400" />
            </div>

            <div>
              <h2
                className="
                  text-xl
                  font-semibold
                  text-white
                "
              >
                Próximas visitas
              </h2>

              <p
                className="
                  text-sm
                  text-gray-400
                  mt-0.5
                "
              >
                Agenda comercial
              </p>
            </div>
          </div>
        </div>

        <div
          className="
            min-w-[36px]
            h-9
            px-3
            rounded-full
            bg-blue-500/10
            text-blue-400
            text-sm
            font-semibold
            border
            border-blue-500/20
            flex
            items-center
            justify-center
          "
        >
          {orderedVisits.length}
        </div>
      </div>

      {/* EMPTY STATE */}

      {orderedVisits.length === 0 ? (
        <div
          className="
            py-12
            px-6
            text-center
            border
            border-dashed
            border-gray-800
            rounded-2xl
            bg-gray-950/30
          "
        >
          <div
            className="
              w-14
              h-14
              mx-auto
              rounded-2xl
              bg-gray-800
              flex
              items-center
              justify-center
              mb-4
            "
          >
            <FaCalendarAlt className="text-gray-500 text-xl" />
          </div>

          <h3
            className="
              text-sm
              font-medium
              text-gray-300
            "
          >
            Nenhuma visita agendada
          </h3>

          <p
            className="
              text-xs
              text-gray-500
              mt-2
            "
          >
            As próximas visitas aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orderedVisits.map((visit) => {
            const status = getStatus(visit);

            const clientName = getClientName(visit);
            const clientPhone = getClientPhone(visit);
            const propertyName = getPropertyName(visit);
            const propertyAddress = getPropertyAddress(visit);
            const notes = getNotes(visit);
            const visitType = getVisitType(visit);
            const duration = getDuration(visit);

            const normalizedPhone = normalizePhone(clientPhone);

            const dateLabel = getDateLabel(visit.visitDate);

            return (
              <div
                key={visit._id || visit.id}
                className="
                  group
                  relative
                  bg-gray-800/50
                  rounded-2xl
                  border
                  border-gray-700
                  hover:border-blue-500/40
                  transition-all
                  duration-300
                  hover:shadow-lg
                  overflow-hidden
                "
              >
                {/* TOP DATE BAR */}

                <div
                  className="
                    px-5
                    py-3
                    border-b
                    border-gray-700
                    bg-gray-800/70
                    flex
                    items-center
                    justify-between
                    gap-4
                  "
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`
                        w-10
                        h-10
                        rounded-xl
                        flex
                        flex-col
                        items-center
                        justify-center
                        border
                        ${
                          isToday(visit.visitDate)
                            ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                            : 'bg-gray-700/50 border-gray-600 text-gray-300'
                        }
                      `}
                    >
                      <span
                        className="
                          text-[10px]
                          uppercase
                          font-semibold
                        "
                      >
                        {dateLabel}
                      </span>
                    </div>

                    <div>
                      <p
                        className="
                          text-sm
                          font-medium
                          text-white
                        "
                      >
                        {formatDate(visit.visitDate)}
                      </p>

                      <div
                        className="
                          flex
                          items-center
                          gap-2
                          mt-1
                          text-xs
                          text-gray-400
                        "
                      >
                        <FaClock />

                        <span>{formatTime(visit.visitDate)}</span>

                        {duration && (
                          <>
                            <span className="text-gray-600">|</span>

                            <span>{duration}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`
                      px-3
                      py-1.5
                      rounded-full
                      text-[11px]
                      font-medium
                      border
                      whitespace-nowrap
                      ${status.style}
                    `}
                  >
                    {status.label}
                  </span>
                </div>

                {/* CONTENT */}

                <div className="p-5">
                  {/* CLIENT */}

                  <div
                    className="
                      flex
                      items-start
                      justify-between
                      gap-4
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
                      <div
                        className="
                          w-11
                          h-11
                          flex-shrink-0
                          rounded-full
                          bg-blue-500/10
                          border
                          border-blue-500/20
                          flex
                          items-center
                          justify-center
                        "
                      >
                        <FaUser className="text-blue-400" />
                      </div>

                      <div className="min-w-0">
                        <h3
                          className="
                            text-sm
                            font-semibold
                            text-white
                            truncate
                          "
                        >
                          {clientName}
                        </h3>

                        <p
                          className="
                            text-xs
                            text-gray-500
                            mt-1
                          "
                        >
                          Cliente
                        </p>
                      </div>
                    </div>

                    {/* CONTACT ACTIONS */}

                    {normalizedPhone && (
                      <div
                        className="
                          flex
                          items-center
                          gap-2
                          flex-shrink-0
                        "
                      >
                        <a
                          href={`tel:${normalizedPhone}`}
                          title="Ligar para o cliente"
                          className="
                            w-9
                            h-9
                            rounded-xl
                            bg-gray-700/70
                            border
                            border-gray-600
                            flex
                            items-center
                            justify-center
                            text-gray-400
                            hover:text-white
                            hover:bg-gray-700
                            transition
                          "
                        >
                          <FaPhone className="text-xs" />
                        </a>

                        <a
                          href={`https://wa.me/${normalizedPhone}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Enviar WhatsApp"
                          className="
                            w-9
                            h-9
                            rounded-xl
                            bg-green-500/10
                            border
                            border-green-500/20
                            flex
                            items-center
                            justify-center
                            text-green-400
                            hover:bg-green-500/20
                            transition
                          "
                        >
                          <FaWhatsapp className="text-sm" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* PHONE */}

                  {clientPhone && (
                    <div
                      className="
                        mt-4
                        flex
                        items-center
                        gap-3
                        text-xs
                        text-gray-400
                      "
                    >
                      <FaPhone className="text-gray-600" />

                      <span>{clientPhone}</span>
                    </div>
                  )}

                  {/* PROPERTY */}

                  <div
                    className="
                      mt-4
                      p-4
                      rounded-xl
                      bg-gray-900/60
                      border
                      border-gray-700/70
                    "
                  >
                    <div
                      className="
                        flex
                        items-start
                        gap-3
                      "
                    >
                      <div
                        className="
                          w-9
                          h-9
                          rounded-lg
                          bg-gray-800
                          flex
                          items-center
                          justify-center
                          flex-shrink-0
                        "
                      >
                        <FaHome className="text-gray-400 text-sm" />
                      </div>

                      <div className="min-w-0">
                        <p
                          className="
                            text-[10px]
                            uppercase
                            tracking-wider
                            text-gray-500
                            font-semibold
                          "
                        >
                          Imóvel
                        </p>

                        <p
                          className="
                            text-sm
                            text-gray-200
                            font-medium
                            mt-1
                          "
                        >
                          {propertyName}
                        </p>

                        {propertyAddress && (
                          <div
                            className="
                              flex
                              items-start
                              gap-2
                              mt-2
                              text-xs
                              text-gray-500
                            "
                          >
                            <FaMapMarkerAlt className="mt-0.5 flex-shrink-0" />

                            <span>{propertyAddress}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* VISIT TYPE */}

                  {visitType && (
                    <div
                      className="
                        mt-3
                        flex
                        items-center
                        gap-3
                        text-xs
                        text-gray-400
                      "
                    >
                      <FaMapMarkerAlt className="text-gray-600" />

                      <span>Local/Tipo:</span>

                      <span className="text-gray-300">{visitType}</span>
                    </div>
                  )}

                  {/* NOTES */}

                  {notes && (
                    <div
                      className="
                        mt-4
                        pt-4
                        border-t
                        border-gray-700
                      "
                    >
                      <div
                        className="
                          flex
                          items-start
                          gap-3
                        "
                      >
                        <FaStickyNote
                          className="
                            text-gray-600
                            mt-0.5
                            flex-shrink-0
                          "
                        />

                        <div>
                          <p
                            className="
                              text-[10px]
                              uppercase
                              tracking-wider
                              text-gray-500
                              font-semibold
                            "
                          >
                            Observações
                          </p>

                          <p
                            className="
                              text-xs
                              text-gray-400
                              leading-relaxed
                              mt-1
                            "
                          >
                            {notes}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* FOOTER */}

                <div
                  className="
                    px-5
                    py-3
                    border-t
                    border-gray-700
                    bg-gray-900/30
                    flex
                    items-center
                    justify-between
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      text-xs
                      text-gray-500
                    "
                  >
                    <FaClock />

                    <span>{formatTime(visit.visitDate)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate(`/visit-details/${visit._id}`)}
                    className="
    flex
    items-center
    gap-2
    text-xs
    text-blue-400
    hover:text-blue-300
    transition
    group/details
  "
                  >
                    Ver detalhes
                    <FaChevronRight
                      className="
      text-[10px]
      transition-transform
      duration-200
      group-hover/details:translate-x-0.5
    "
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

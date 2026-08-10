import {
  FaCalendarAlt,
  FaClock,
  FaHome,
  FaMapMarkerAlt,
  FaStickyNote,
  FaUser,
} from 'react-icons/fa'

import VisitStatusBadge from './VisitStatusBadge'
import VisitActions from './VisitActions'

export default function VisitCard({
  visit,
  onRefresh,
}) {
  const formattedDate = visit.date
    ? new Date(visit.date).toLocaleDateString(
        'pt-BR',
        {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }
      )
    : 'Data não informada'

  const formattedHour = visit.date
    ? new Date(visit.date).toLocaleTimeString(
        'pt-BR',
        {
          hour: '2-digit',
          minute: '2-digit',
        }
      )
    : '--:--'

  return (
    <div
      className="
        bg-gray-900
        border
        border-gray-800
        rounded-2xl
        shadow-lg
        overflow-hidden
        transition
        hover:border-blue-500/40
        hover:shadow-blue-500/10
      "
    >
      {/* HEADER */}

      <div
        className="
          flex
          justify-between
          items-start
          gap-4
          p-6
          border-b
          border-gray-800
        "
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div
              className="
                w-10
                h-10
                rounded-full
                bg-blue-600/20
                flex
                items-center
                justify-center
              "
            >
              <FaUser className="text-blue-400" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white">
                {visit.lead?.name || 'Lead não informado'}
              </h3>

              <p className="text-sm text-gray-400">
                Cliente da visita
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-400">
            <FaHome className="text-indigo-400" />

            <span>
              {visit.property?.name ||
                'Imóvel não informado'}
            </span>
          </div>
        </div>

        <VisitStatusBadge
          status={visit.status}
        />
      </div>

      {/* CONTEÚDO */}

      <div className="p-6 space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          <div
            className="
              bg-gray-800/50
              rounded-xl
              p-4
            "
          >
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <FaCalendarAlt />

              <span className="text-sm font-medium">
                Data
              </span>
            </div>

            <div className="text-white capitalize">
              {formattedDate}
            </div>
          </div>

          <div
            className="
              bg-gray-800/50
              rounded-xl
              p-4
            "
          >
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <FaClock />

              <span className="text-sm font-medium">
                Horário
              </span>
            </div>

            <div className="text-white">
              {formattedHour}
            </div>
          </div>
        </div>

        {visit.address && (
          <div
            className="
              bg-gray-800/50
              rounded-xl
              p-4
            "
          >
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <FaMapMarkerAlt />

              <span className="text-sm font-medium">
                Endereço
              </span>
            </div>

            <div className="text-gray-300">
              {visit.address}
            </div>
          </div>
        )}

        {visit.notes && (
          <div
            className="
              bg-blue-500/5
              border
              border-blue-500/20
              rounded-xl
              p-4
            "
          >
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <FaStickyNote />

              <span className="text-sm font-medium">
                Observações
              </span>
            </div>

            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
              {visit.notes}
            </p>
          </div>
        )}
      </div>

      {/* AÇÕES */}

      <div
        className="
          px-6
          py-5
          border-t
          border-gray-800
          bg-gray-900/60
        "
      >
        <VisitActions
          visit={visit}
          onRefresh={onRefresh}
        />
      </div>
    </div>
  )
}

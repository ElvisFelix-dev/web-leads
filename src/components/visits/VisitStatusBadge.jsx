import {
  FaCalendarAlt,
  FaCheckCircle,
  FaFlagCheckered,
  FaTimesCircle,
  FaClock,
} from 'react-icons/fa'

const statusMap = {
  agendada: {
    label: 'Agendada',
    icon: FaCalendarAlt,
    className:
      'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  },

  confirmada: {
    label: 'Confirmada',
    icon: FaCheckCircle,
    className:
      'bg-green-500/15 text-green-400 border border-green-500/30',
  },

  realizada: {
    label: 'Realizada',
    icon: FaFlagCheckered,
    className:
      'bg-purple-500/15 text-purple-400 border border-purple-500/30',
  },

  cancelada: {
    label: 'Cancelada',
    icon: FaTimesCircle,
    className:
      'bg-red-500/15 text-red-400 border border-red-500/30',
  },

  nao_compareceu: {
    label: 'Não compareceu',
    icon: FaClock,
    className:
      'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30',
  },
}

export default function VisitStatusBadge({ status }) {
  const current =
    statusMap[status] || statusMap.agendada

  const Icon = current.icon

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-2
        px-3
        py-1
        rounded-full
        text-xs
        font-semibold
        ${current.className}
      `}
    >
      <Icon size={12} />

      {current.label}
    </span>
  )
}

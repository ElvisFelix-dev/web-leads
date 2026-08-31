const statusConfig = {
  pending: {
    label: 'Pendente',
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  },
  contract: {
    label: 'Em Contrato',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  completed: {
    label: 'Concluída',
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
  },
  cancelled: {
    label: 'Cancelada',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
  },
};

export default function SaleStatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}
    >
      {config.label}
    </span>
  );
}

import VisitCard from './VisitCard'

export default function VisitList({
  visits = [],
  loading,
  onRefresh,
}) {
  if (loading) {
    return (
      <div className="text-center py-20">
        Carregando...
      </div>
    )
  }

  if (!visits.length) {
    return (
      <div className="bg-gray-900 rounded-xl p-10 text-center">

        Nenhuma visita cadastrada.

      </div>
    )
  }

  return (
    <div className="grid gap-4">

      {visits.map((visit) => (
        <VisitCard
          key={visit._id}
          visit={visit}
          onRefresh={onRefresh}
        />
      ))}

    </div>
  )
}

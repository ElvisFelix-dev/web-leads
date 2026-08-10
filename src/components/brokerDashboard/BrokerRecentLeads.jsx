import {
  FaUser,
  FaPhone,
  FaCircle,
} from "react-icons/fa";

const stageColors = {
  novo: "bg-blue-500",
  contato: "bg-yellow-500",
  qualificado: "bg-purple-500",
  visita_agendada: "bg-green-500",
  proposta_enviada: "bg-cyan-500",
  negociacao: "bg-orange-500",
  ganho: "bg-emerald-500",
  perdido: "bg-red-500",
};

export default function BrokerRecentLeads({
  leads = [],
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">

      <div className="flex items-center justify-between mb-6">

        <h2 className="text-xl font-semibold">
          Últimos Leads
        </h2>

        <span className="text-sm text-gray-400">
          {leads.length} registro{leads.length !== 1 ? "s" : ""}
        </span>

      </div>

      {leads.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          Nenhum lead encontrado.
        </div>
      ) : (
        <div className="space-y-3">

          {leads.map((lead) => (

            <div
              key={lead._id}
              className="
                bg-gray-800/70
                border
                border-gray-700
                rounded-xl
                p-4
                hover:border-blue-500
                transition
              "
            >

              <div className="flex justify-between items-start">

                <div>

                  <div className="flex items-center gap-2">

                    <FaUser className="text-blue-400" />

                    <h3 className="font-semibold">
                      {lead.name}
                    </h3>

                  </div>

                  <div className="flex items-center gap-2 text-gray-400 text-sm mt-2">

                    <FaPhone />

                    {lead.phone || "Telefone não informado"}

                  </div>

                </div>

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    px-3
                    py-1
                    rounded-full
                    bg-gray-700
                    text-sm
                  "
                >

                  <FaCircle
                    size={8}
                    className={
                      stageColors[lead.stage] || "text-gray-400"
                    }
                  />

                  <span className="capitalize">

                    {(lead.stage || "Novo").replaceAll("_", " ")}

                  </span>

                </div>

              </div>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}

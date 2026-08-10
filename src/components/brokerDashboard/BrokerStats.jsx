import {
  FaUsers,
  FaHome,
  FaHandshake,
  FaMoneyBillWave,
  FaChartLine,
  FaCalendarAlt,
} from "react-icons/fa";

export default function BrokerStats({ stats = {} }) {
  const cards = [
    {
      label: "Leads",
      icon: FaUsers,
      value: stats.leads ?? 0,
      subtitle: "Leads cadastrados",
      color: "from-blue-600 to-blue-800",
    },
    {
      label: "Visitas",
      icon: FaCalendarAlt,
      value: stats.visitas ?? 0,
      subtitle: "Visitas agendadas",
      color: "from-purple-600 to-purple-800",
    },
    {
      label: "Propostas",
      icon: FaHandshake,
      value: stats.propostas ?? 0,
      subtitle: "Propostas enviadas",
      color: "from-green-600 to-green-800",
    },
    {
      label: "Vendas",
      icon: FaHome,
      value: stats.vendas ?? 0,
      subtitle: "Negócios fechados",
      color: "from-orange-600 to-orange-800",
    },
    {
      label: "Conversão",
      icon: FaChartLine,
      value: `${stats.conversion ?? 0}%`,
      subtitle: "Taxa de conversão",
      color: "from-pink-600 to-pink-800",
    },
    {
      label: "Comissão",
      icon: FaMoneyBillWave,
      value: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(stats.commission ?? 0),
      subtitle: "Comissão acumulada",
      color: "from-emerald-600 to-emerald-800",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className={`
              relative
              overflow-hidden
              rounded-2xl
              bg-gradient-to-br
              ${card.color}
              p-6
              shadow-xl
              hover:shadow-2xl
              hover:-translate-y-1
              transition-all
              duration-300
            `}
          >
            {/* brilho */}
            <div
              className="
                absolute
                -top-8
                -right-8
                w-32
                h-32
                rounded-full
                bg-white/10
              "
            />

            <div className="relative flex justify-between items-start">
              <div>
                <p className="text-sm text-white/80">
                  {card.label}
                </p>

                <h2 className="text-4xl font-bold mt-3 text-white">
                  {card.value}
                </h2>

                <p className="text-xs text-white/70 mt-2">
                  {card.subtitle}
                </p>
              </div>

              <div
                className="
                  w-14
                  h-14
                  rounded-2xl
                  bg-white/20
                  flex
                  items-center
                  justify-center
                  backdrop-blur-sm
                "
              >
                <Icon
                  size={28}
                  className="text-white"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

import {
  FaUsers,
  FaHome,
  FaHandshake,
  FaMoneyBillWave,
  FaChartLine,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaHourglassHalf,
} from 'react-icons/fa';

export default function BrokerStats({ stats = {} }) {
  // Formatação de moeda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value ?? 0);
  };

  // Cards principais
  const mainCards = [
    {
      label: 'Leads',
      icon: FaUsers,
      value: stats.leads ?? 0,
      subtitle: 'Leads cadastrados',
      color: 'from-blue-600 to-blue-800',
    },
    {
      label: 'Visitas',
      icon: FaCalendarAlt,
      value: stats.visitas ?? 0,
      subtitle: 'Visitas agendadas',
      color: 'from-purple-600 to-purple-800',
    },
    {
      label: 'Propostas',
      icon: FaHandshake,
      value: stats.propostas ?? 0,
      subtitle: 'Propostas enviadas',
      color: 'from-green-600 to-green-800',
    },
    {
      label: 'Vendas',
      icon: FaHome,
      value: stats.vendas ?? 0,
      subtitle: 'Negócios fechados',
      color: 'from-orange-600 to-orange-800',
    },
    {
      label: 'Conversão',
      icon: FaChartLine,
      value: `${stats.conversion ?? 0}%`,
      subtitle: 'Taxa de conversão',
      color: 'from-pink-600 to-pink-800',
    },
  ];

  // 🔥 Cards de Comissão (detalhados)
  const commissionCards = [
    {
      label: 'Comissão Total',
      icon: FaMoneyBillWave,
      value: formatCurrency(stats.comissaoTotal ?? 0),
      subtitle: 'Valor total de comissões',
      color: 'from-emerald-600 to-emerald-800',
      detail: `💰 ${formatCurrency(stats.comissaoTotal ?? 0)}`,
    },
    {
      label: 'Comissão Pendente',
      icon: FaHourglassHalf,
      value: formatCurrency(stats.comissaoPendente ?? 0),
      subtitle: 'Aguardando pagamento',
      color: 'from-yellow-500 to-yellow-700',
      detail: `⏳ ${formatCurrency(stats.comissaoPendente ?? 0)}`,
    },
    {
      label: 'Comissão Aprovada',
      icon: FaCheckCircle,
      value: formatCurrency(stats.comissaoAprovada ?? 0),
      subtitle: 'Aprovada, aguardando pagamento',
      color: 'from-blue-500 to-blue-700',
      detail: `✅ ${formatCurrency(stats.comissaoAprovada ?? 0)}`,
    },
    {
      label: 'Comissão Paga',
      icon: FaClock,
      value: formatCurrency(stats.comissaoPaga ?? 0),
      subtitle: 'Já recebidas',
      color: 'from-teal-600 to-teal-800',
      detail: `💵 ${formatCurrency(stats.comissaoPaga ?? 0)}`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Cards principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        {mainCards.map((card) => {
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
                  <p className="text-sm text-white/80">{card.label}</p>

                  <h2 className="text-3xl font-bold mt-3 text-white">
                    {card.value}
                  </h2>

                  <p className="text-xs text-white/70 mt-2">{card.subtitle}</p>
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
                  <Icon size={28} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 🔥 Cards de Comissão (detalhados) */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <FaMoneyBillWave className="text-emerald-400 text-2xl" />
          <h3 className="text-lg font-semibold text-white">
            Detalhamento de Comissões
          </h3>
          <div className="flex-1 h-px bg-gray-700" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {commissionCards.map((card) => {
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
                    <p className="text-sm text-white/80">{card.label}</p>

                    <h2 className="text-2xl font-bold mt-3 text-white">
                      {card.value}
                    </h2>

                    <p className="text-xs text-white/70 mt-2">
                      {card.subtitle}
                    </p>

                    {/* 🔥 Detalhe adicional */}
                    <p className="text-xs text-white/50 mt-1 font-mono">
                      {card.detail}
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
                    <Icon size={28} className="text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 🔥 Resumo rápido de comissões */}
        <div className="mt-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="font-medium text-white">Resumo:</span>
              <span>
                Total:{' '}
                <span className="text-emerald-400 font-semibold">
                  {formatCurrency(stats.comissaoTotal ?? 0)}
                </span>
              </span>
              <span className="text-gray-600">|</span>
              <span>
                Pendente:{' '}
                <span className="text-yellow-400 font-semibold">
                  {formatCurrency(stats.comissaoPendente ?? 0)}
                </span>
              </span>
              <span className="text-gray-600">|</span>
              <span>
                Aprovada:{' '}
                <span className="text-blue-400 font-semibold">
                  {formatCurrency(stats.comissaoAprovada ?? 0)}
                </span>
              </span>
              <span className="text-gray-600">|</span>
              <span>
                Paga:{' '}
                <span className="text-teal-400 font-semibold">
                  {formatCurrency(stats.comissaoPaga ?? 0)}
                </span>
              </span>
            </div>

            {/* Progresso de pagamento */}
            {stats.comissaoTotal > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">
                  {Math.round(
                    ((stats.comissaoPaga ?? 0) / (stats.comissaoTotal ?? 1)) *
                      100,
                  )}
                  % pago
                </span>
                <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        ((stats.comissaoPaga ?? 0) /
                          (stats.comissaoTotal ?? 1)) *
                          100,
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

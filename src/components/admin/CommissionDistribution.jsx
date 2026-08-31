import {
  FaUser,
  FaUserPlus,
  FaBuilding,
  FaChartPie,
  FaArrowUp,
} from 'react-icons/fa';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value) || 0);
};

const formatPercentage = (value) => {
  const number = Number(value) || 0;

  return number % 1 === 0
    ? `${number}%`
    : `${number.toFixed(2).replace('.', ',')}%`;
};

export default function CommissionDistribution({
  distribution,
  totalAmount,
  hasCapturer = false,
}) {
  const sellerAmount = Number(distribution?.seller?.amount) || 0;
  const capturerAmount = Number(distribution?.capturer?.amount) || 0;
  const companyAmount = Number(distribution?.company?.amount) || 0;

  const sellerPercentage = Number(distribution?.seller?.percentage) || 0;

  const capturerPercentage = Number(distribution?.capturer?.percentage) || 0;

  const companyPercentage = Number(distribution?.company?.percentage) || 0;

  const hasCapturerValue = hasCapturer && capturerAmount > 0;

  const items = [
    {
      key: 'seller',
      label: 'Corretor vendedor',
      shortLabel: 'Vendedor',
      description: 'Responsável pela venda',
      icon: FaUser,
      percentage: sellerPercentage,
      amount: sellerAmount,
      iconClass: 'bg-blue-500/10 border-blue-500/10 text-blue-400',
      badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/10',
      barClass: 'bg-blue-500',
    },

    ...(hasCapturerValue
      ? [
          {
            key: 'capturer',
            label: 'Corretor captador',
            shortLabel: 'Captador',
            description: 'Origem do imóvel',
            icon: FaUserPlus,
            percentage: capturerPercentage,
            amount: capturerAmount,
            iconClass: 'bg-purple-500/10 border-purple-500/10 text-purple-400',
            badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/10',
            barClass: 'bg-purple-500',
          },
        ]
      : []),

    {
      key: 'company',
      label: 'Imobiliária',
      shortLabel: 'Imobiliária',
      description: 'Participação da empresa',
      icon: FaBuilding,
      percentage: companyPercentage,
      amount: companyAmount,
      iconClass: 'bg-emerald-500/10 border-emerald-500/10 text-emerald-400',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10',
      barClass: 'bg-emerald-500',
    },
  ];

  const calculatedTotal = items.reduce((sum, item) => sum + item.amount, 0);

  const total = Number(totalAmount) || calculatedTotal;

  const distributedPercentage =
    total > 0
      ? (items.reduce((sum, item) => sum + item.amount, 0) / total) * 100
      : 0;

  if (!distribution || items.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-6 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-800 flex items-center justify-center">
          <FaChartPie className="text-gray-600" />
        </div>

        <p className="text-sm font-medium text-gray-400">
          Nenhuma distribuição configurada
        </p>

        <p className="text-xs text-gray-600 mt-1">
          A comissão ainda não possui uma distribuição financeira.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* =====================================================
          RESUMO
      ====================================================== */}

      <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

        <div className="relative flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center">
              <FaChartPie className="text-emerald-400 text-sm" />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.14em] text-gray-600 font-semibold">
                Distribuição
              </p>

              <p className="text-sm font-semibold text-gray-200 mt-0.5">
                Comissão da venda
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <p className="text-[10px] uppercase tracking-wider text-gray-600">
              Total
            </p>

            <p className="text-sm font-bold text-emerald-400 mt-0.5">
              {formatCurrency(total)}
            </p>
          </div>
        </div>

        {/* Barra geral */}
        <div className="mt-4">
          <div className="h-2 rounded-full overflow-hidden flex bg-gray-800">
            {items.map((item) => {
              const percent = total > 0 ? (item.amount / total) * 100 : 0;

              if (percent <= 0) return null;

              return (
                <div
                  key={item.key}
                  className={`${item.barClass} transition-all duration-500`}
                  style={{
                    width: `${percent}%`,
                  }}
                  title={`${item.label}: ${percent.toFixed(1)}%`}
                />
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-gray-600">
              Distribuição financeira
            </span>

            <span className="text-[10px] font-semibold text-gray-500">
              {distributedPercentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* =====================================================
          PARTICIPANTES
      ====================================================== */}

      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon;

          const share = total > 0 ? (item.amount / total) * 100 : 0;

          return (
            <div
              key={item.key}
              className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/60 hover:bg-gray-800/60 hover:border-gray-700 transition-all duration-300"
            >
              {/* Linha lateral */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-0.5 ${item.barClass}`}
              />

              <div className="p-4">
                <div className="flex items-center gap-3">
                  {/* Ícone */}
                  <div
                    className={`w-11 h-11 shrink-0 rounded-xl border flex items-center justify-center ${item.iconClass}`}
                  >
                    <Icon className="text-base" />
                  </div>

                  {/* Informações */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="text-sm font-semibold text-gray-200 truncate">
                        {item.label}
                      </p>

                      <span
                        className={`hidden sm:inline-flex px-2 py-0.5 rounded-md border text-[9px] font-semibold uppercase tracking-wider ${item.badgeClass}`}
                      >
                        {formatPercentage(item.percentage)}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-600 mt-0.5 truncate">
                      {item.description}
                    </p>
                  </div>

                  {/* Valor */}
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-white">
                      {formatCurrency(item.amount)}
                    </p>

                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <FaArrowUp
                        size={7}
                        className={item.iconClass
                          .split(' ')
                          .find((className) => className.startsWith('text-'))}
                      />

                      <span className="text-[10px] text-gray-600">
                        {share.toFixed(1)}% do total
                      </span>
                    </div>
                  </div>
                </div>

                {/* Barra individual */}
                <div className="mt-3">
                  <div className="h-1.5 rounded-full bg-gray-800 overflow-hidden">
                    <div
                      className={`h-full ${item.barClass} rounded-full transition-all duration-500`}
                      style={{
                        width: `${Math.min(share, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* =====================================================
          RESUMO FINAL
      ====================================================== */}

      <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-600">
              Total distribuído
            </p>

            <p className="text-sm font-semibold text-gray-300 mt-1">
              {formatCurrency(
                items.reduce((sum, item) => sum + item.amount, 0),
              )}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider text-gray-600">
              Participantes
            </p>

            <p className="text-sm font-bold text-white mt-1">{items.length}</p>
          </div>
        </div>

        {/* Captador */}
        {!hasCapturerValue && (
          <div className="mt-3 pt-3 border-t border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gray-800 flex items-center justify-center">
                <FaUserPlus className="text-gray-600 text-[10px]" />
              </div>

              <p className="text-[11px] text-gray-600">
                Nenhum captador vinculado a este imóvel.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

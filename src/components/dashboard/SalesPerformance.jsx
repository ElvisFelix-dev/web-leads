import {
  TrendingUp,
  Handshake,
  XCircle,
  Target,
  CalendarCheck,
  FileText,
  Users,
  Trophy,
} from 'lucide-react';

export default function SalesPerformance({ stats = {} }) {
  const leads = stats.leads || 0;

  const visitas = stats.visitas || 0;

  const propostas = stats.propostas || 0;

  const fechados = stats.fechados || 0;

  const perdidos = stats.perdidos || 0;

  const goal = 50;

  const conversion = leads > 0 ? ((fechados / leads) * 100).toFixed(1) : 0;

  const lostRate = leads > 0 ? ((perdidos / leads) * 100).toFixed(1) : 0;

  const goalPercent = Math.min((fechados / goal) * 100, 100);

  const cards = [
    {
      title: 'Leads',
      value: leads,
      icon: Users,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
    },

    {
      title: 'Visitas',
      value: visitas,
      icon: CalendarCheck,
      color: 'text-orange-400',
      bg: 'bg-orange-500/10',
    },

    {
      title: 'Propostas',
      value: propostas,
      icon: FileText,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
    },

    {
      title: 'Fechamentos',
      value: fechados,
      icon: Handshake,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },

    {
      title: 'Perdidos',
      value: perdidos,
      icon: XCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/10',
    },

    {
      title: 'Conversão',
      value: `${conversion}%`,
      icon: TrendingUp,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
    },
  ];

  return (
    <div
      className="
      bg-slate-900
      border
      border-slate-800
      rounded-2xl
      shadow-xl
      p-6
      "
    >
      {/* HEADER */}

      <div className="flex items-center gap-3 mb-8">
        <div
          className="
          w-12
          h-12
          rounded-xl
          bg-green-500/10
          flex
          items-center
          justify-center
          "
        >
          <TrendingUp className="text-green-400" size={24} />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">
            Performance Comercial
          </h2>

          <p className="text-slate-400 text-sm">
            Indicadores de conversão do funil de vendas
          </p>
        </div>
      </div>

      {/* META */}

      <div
        className="
        mb-8
        bg-slate-800/60
        border
        border-slate-700
        rounded-xl
        p-5
        "
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Target size={20} className="text-yellow-400" />

            <span className="text-white font-semibold">Meta Comercial</span>
          </div>

          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-yellow-400" />

            <span className="text-white font-bold">
              {fechados}/{goal}
            </span>
          </div>
        </div>

        <div className="mt-4 h-3 rounded-full bg-slate-700 overflow-hidden">
          <div
            className="
            h-full
            rounded-full
            bg-gradient-to-r
            from-yellow-400
            via-green-400
            to-emerald-500
            transition-all
            duration-700
            "
            style={{
              width: `${goalPercent}%`,
            }}
          />
        </div>

        <div className="flex justify-between mt-2 text-sm">
          <span className="text-slate-400">Progresso</span>

          <span className="text-green-400 font-semibold">
            {goalPercent.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* KPIs */}

      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="
              bg-slate-800/50
              border
              border-slate-700
              rounded-xl
              p-5
              hover:border-blue-500/40
              hover:-translate-y-1
              transition-all
              duration-300
              "
            >
              <div className="flex justify-between items-center">
                <div
                  className={`
                  ${card.bg}
                  w-11
                  h-11
                  rounded-xl
                  flex
                  items-center
                  justify-center
                  `}
                >
                  <Icon size={22} className={card.color} />
                </div>

                <span className="text-xs text-slate-500 uppercase tracking-wide">
                  KPI
                </span>
              </div>

              <h3 className="mt-5 text-3xl font-bold text-white">
                {card.value}
              </h3>

              <p className="mt-1 text-slate-400 text-sm">{card.title}</p>
            </div>
          );
        })}
      </div>

      {/* RODAPÉ */}

      <div
        className="
        mt-8
        pt-6
        border-t
        border-slate-800
        grid
        grid-cols-2
        gap-4
        "
      >
        <div>
          <p className="text-slate-500 text-sm">Taxa de Conversão</p>

          <h3 className="text-2xl font-bold text-green-400">{conversion}%</h3>
        </div>

        <div>
          <p className="text-slate-500 text-sm">Taxa de Perdas</p>

          <h3 className="text-2xl font-bold text-red-400">{lostRate}%</h3>
        </div>
      </div>
    </div>
  );
}

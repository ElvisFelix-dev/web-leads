import {
  Users,
  Home,
  UserRound,
  TrendingUp,
  CalendarCheck,
  Handshake,
  FileText,
  XCircle,
  UserCheck,
  UserX,
} from 'lucide-react';

export default function AdminStats({ stats = {} }) {
  const leadsDistribuidos =
    stats?.leadsDistribuidos ?? stats?.distribuidos ?? 0;

  const leadsPendentes =
    stats?.leadsPendentes ??
    Math.max((stats?.leads || 0) - leadsDistribuidos, 0);

  const cards = [
    {
      title: 'Leads',

      value: stats.leads || 0,

      icon: Users,

      color: 'from-blue-600/20 to-blue-900/20',

      iconColor: 'text-blue-400',
    },

    {
      title: 'Imóveis',

      value: stats.imoveis || 0,

      icon: Home,

      color: 'from-green-600/20 to-green-900/20',

      iconColor: 'text-green-400',
    },

    {
      title: 'Corretores',

      value: stats.corretores || 0,

      icon: UserRound,

      color: 'from-yellow-600/20 to-yellow-900/20',

      iconColor: 'text-yellow-400',
    },

    {
      title: 'Usuários',

      value: stats.usuarios || 0,

      icon: UserCheck,

      color: 'from-cyan-600/20 to-cyan-900/20',

      iconColor: 'text-cyan-400',
    },

    {
      title: 'Leads Distribuídos',

      value: leadsDistribuidos,

      icon: TrendingUp,

      color: 'from-indigo-600/20 to-indigo-900/20',

      iconColor: 'text-indigo-400',
    },

    {
      title: 'Leads Pendentes',

      value: leadsPendentes,

      icon: UserX,

      color: 'from-orange-600/20 to-orange-900/20',

      iconColor: 'text-orange-400',
    },

    {
      title: 'Visitas',

      value: stats.visitas || 0,

      icon: CalendarCheck,

      color: 'from-purple-600/20 to-purple-900/20',

      iconColor: 'text-purple-400',
    },

    {
      title: 'Propostas',

      value: stats.propostas || 0,

      icon: FileText,

      color: 'from-pink-600/20 to-pink-900/20',

      iconColor: 'text-pink-400',
    },

    {
      title: 'Fechados',

      value: stats.fechados || 0,

      icon: Handshake,

      color: 'from-emerald-600/20 to-emerald-900/20',

      iconColor: 'text-emerald-400',
    },

    {
      title: 'Perdidos',

      value: stats.perdidos || 0,

      icon: XCircle,

      color: 'from-red-600/20 to-red-900/20',

      iconColor: 'text-red-400',
    },
  ];

  return (
    <div
      className="
      grid
      grid-cols-1
      sm:grid-cols-2
      lg:grid-cols-3
      xl:grid-cols-5
      gap-5
      "
    >
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}

            className={`
              group
              relative
              overflow-hidden
              bg-gradient-to-br
              ${card.color}
              bg-slate-900
              border
              border-slate-800
              rounded-2xl
              p-5
              shadow-xl
              hover:-translate-y-1
              hover:border-slate-600
              transition-all
              duration-300
            `}
          >
            {/* efeito de brilho */}

            <div
              className="
              absolute
              -right-8
              -top-8
              w-32
              h-32
              rounded-full
              bg-white/5
              group-hover:scale-125
              transition
              "
            />

            <div
              className="
              relative
              flex
              justify-between
              items-center
              "
            >
              <div>
                <p
                  className="
                  text-sm
                  text-slate-400
                  "
                >
                  {card.title}
                </p>

                <h2
                  className="
                  mt-2
                  text-3xl
                  font-bold
                  text-white
                  "
                >
                  {card.value}
                </h2>
              </div>

              <div
                className={`
                  p-3
                  rounded-xl
                  bg-slate-950/50
                  ${card.iconColor}
                  group-hover:scale-110
                  transition
                `}
              >
                <Icon size={28} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

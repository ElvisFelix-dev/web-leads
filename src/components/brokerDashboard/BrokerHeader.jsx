import {
  FaTrophy,
  FaStar,
  FaCalendarCheck,
  FaUsers,
} from 'react-icons/fa'

export default function BrokerHeader({
  broker = {},
  stats = {},
  rank = 0,
  points = 0,
}) {
  const hour = new Date().getHours()

  const greeting =
    hour < 12
      ? 'Bom dia'
      : hour < 18
        ? 'Boa tarde'
        : 'Boa noite'

  const today = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  const rankingInfo =
  rank === 1
    ? {
        text: '🥇 Líder da equipe',
        color:
          'from-yellow-500 to-amber-400',
      }
    : rank === 2
      ? {
          text: '🥈 Vice-líder',
          color:
            'from-gray-300 to-gray-500',
        }
      : rank === 3
        ? {
            text: '🥉 Top 3',
            color:
              'from-orange-500 to-amber-700',
          }
        : {
            text: 'Continue evoluindo',
            color:
              'from-blue-500 to-cyan-500',
          }

  const goalProgress = Math.min(
    Math.round(((stats.leads || 0) / 50) * 100),
    100,
  )

  return (
    <div
      className="
        relative
        overflow-hidden
        rounded-3xl
        border
        border-blue-500/20
        bg-gradient-to-br
        from-slate-900
        via-gray-900
        to-blue-950
        p-8
        shadow-2xl
        mb-8
      "
    >
      {/* Glow */}

      <div
        className="
          absolute
          -right-24
          -top-24
          h-72
          w-72
          rounded-full
          bg-blue-500/10
          blur-3xl
        "
      />

      <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-8">
        {/* ESQUERDA */}

        <div className="flex items-center gap-5">
          <div
            className="
              h-20
              w-20
              rounded-full
              overflow-hidden
              border-4
              border-blue-500/40
              bg-gray-800
              flex
              items-center
              justify-center
            "
          >
            {broker.avatar ? (
              <img
                src={broker.avatar}
                alt={broker.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-blue-400">
                {broker.name?.charAt(0)?.toUpperCase() || 'C'}
              </span>
            )}
          </div>

          <div>
            <p className="text-gray-400">
              {greeting},
            </p>

            <h1 className="text-3xl font-bold text-white">
              {broker.name || 'Corretor'}
            </h1>

            <p className="text-gray-400 mt-1">
              {broker.email}
            </p>

            <p className="text-sm text-blue-300 mt-2 capitalize">
              {today}
            </p>
          </div>
        </div>

        {/* DIREITA */}

        <div className="flex flex-col justify-between lg:items-end">
          <div className="flex flex-wrap gap-3">
            <div
              className="
                flex
                items-center
                gap-2
                rounded-xl
                bg-yellow-500/15
                border
                border-yellow-500/30
                px-4
                py-2
              "
            >
              <FaTrophy className="text-yellow-400" />

              <span className="font-medium">
                Ranking #{rank}
              </span>
            </div>

            <div
              className="
                flex
                items-center
                gap-2
                rounded-xl
                bg-blue-500/15
                border
                border-blue-500/30
                px-4
                py-2
              "
            >
              <FaStar className="text-blue-400" />

              <span>
                {points} pts
              </span>
            </div>
          </div>

          <div className="mt-6 w-full lg:w-80">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Meta do mês</span>

              <span>{goalProgress}%</span>
            </div>

            <div className="h-3 rounded-full bg-gray-800 overflow-hidden">
              <div
                style={{
                  width: `${goalProgress}%`,
                }}
                className="
                  h-full
                  rounded-full
                  bg-gradient-to-r
                  from-blue-500
                  to-cyan-400
                  transition-all
                  duration-700
                "
              />
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé */}

      <div
        className="
          relative
          z-10
          mt-8
          grid
          md:grid-cols-2
          gap-4
        "
      >
        <div
          className="
            rounded-2xl
            bg-white/5
            border
            border-white/10
            p-4
            flex
            items-center
            gap-4
          "
        >
          <FaCalendarCheck
            className="text-green-400"
            size={26}
          />

          <div>
            <p className="text-gray-400 text-sm">
              Visitas
            </p>

            <h3 className="text-2xl font-bold">
              {stats.visitas || 0}
            </h3>
          </div>
        </div>

        <div
          className="
            rounded-2xl
            bg-white/5
            border
            border-white/10
            p-4
            flex
            items-center
            gap-4
          "
        >
          <FaUsers
            className="text-blue-400"
            size={26}
          />

          <div>
            <p className="text-gray-400 text-sm">
              Leads
            </p>

            <h3 className="text-2xl font-bold">
              {stats.leads || 0}
            </h3>
          </div>
        </div>
      </div>
    </div>
  )
}

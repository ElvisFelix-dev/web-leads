import {
  FaUsers,
  FaCalendarCheck,
  FaHandshake,
  FaChartLine,
  FaDollarSign,
  FaTrophy,
} from 'react-icons/fa';

export default function ProfileStats({ user }) {
  console.log(user);
  const leads = user?.stats?.leads ?? 0;
  const visits = user?.stats?.visits ?? 0;
  const deals = user?.stats?.deals ?? 0;
  const revenue = user?.stats?.revenue ?? 0;

  const conversion = leads > 0 ? Math.round((deals / leads) * 100) : 0;

  const points = user?.performance?.points ?? 0;

  const level = user?.performance?.level ?? 1;

  const stats = [
    {
      title: 'Leads',
      value: leads,
      subtitle: 'Leads cadastrados',
      icon: <FaUsers className="text-3xl text-blue-400" />,
      color: 'from-blue-600 to-cyan-500',
    },

    {
      title: 'Visitas',
      value: visits,
      subtitle: 'Visitas realizadas',
      icon: <FaCalendarCheck className="text-3xl text-green-400" />,
      color: 'from-green-600 to-emerald-500',
    },

    {
      title: 'Negócios',
      value: deals,
      subtitle: 'Contratos fechados',
      icon: <FaHandshake className="text-3xl text-purple-400" />,
      color: 'from-purple-600 to-fuchsia-500',
    },

    {
      title: 'Conversão',
      value: `${conversion}%`,
      subtitle: 'Taxa de conversão',
      icon: <FaChartLine className="text-3xl text-amber-400" />,
      color: 'from-amber-500 to-orange-500',
    },

    {
      title: 'Receita',
      value: revenue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
      subtitle: 'Valor negociado',
      icon: <FaDollarSign className="text-3xl text-emerald-400" />,
      color: 'from-emerald-600 to-lime-500',
    },

    {
      title: 'Nível',
      value: level,
      subtitle: `${points.toLocaleString('pt-BR')} pontos`,
      icon: <FaTrophy className="text-3xl text-yellow-400" />,
      color: 'from-yellow-500 to-orange-500',
    },
  ];

  return (
    <section
      className="
        rounded-3xl
        border
        border-gray-800
        bg-gray-900
        p-8
        shadow-xl
      "
    >
      {/* Cabeçalho */}

      <div className="mb-8">
        <h2
          className="
            text-3xl
            font-bold
            text-white
          "
        >
          Estatísticas
        </h2>

        <p
          className="
            mt-2
            text-gray-400
          "
        >
          Acompanhe o desempenho geral do corretor.
        </p>
      </div>

      {/* Cards */}

      <div
        className="
          grid
          gap-6
          sm:grid-cols-2
          xl:grid-cols-3
        "
      >
        {stats.map((item) => (
          <div
            key={item.title}
            className="
              group
              relative
              overflow-hidden
              rounded-3xl
              border
              border-gray-800
              bg-gray-950
              transition-all
              duration-300
              hover:-translate-y-2
              hover:border-cyan-500/40
              hover:shadow-2xl
              hover:shadow-cyan-500/10
            "
          >
            {/* Barra superior */}

            <div
              className={`
                h-1.5
                bg-gradient-to-r
                ${item.color}
              `}
            />

            {/* Glow */}

            <div
              className={`
                absolute
                -right-10
                -top-10
                h-40
                w-40
                rounded-full
                bg-gradient-to-br
                ${item.color}
                opacity-5
                blur-3xl
                transition
                group-hover:opacity-20
              `}
            />

            <div className="relative p-7">
              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >
                <div>{item.icon}</div>

                <span
                  className="
                    text-xs
                    uppercase
                    tracking-[0.25em]
                    text-gray-500
                  "
                >
                  {item.title}
                </span>
              </div>

              <h3
                className="
                  mt-8
                  text-4xl
                  font-bold
                  text-white
                "
              >
                {item.value}
              </h3>

              <p
                className="
                  mt-2
                  text-sm
                  text-gray-400
                "
              >
                {item.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

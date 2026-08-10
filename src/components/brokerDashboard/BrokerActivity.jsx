import {
  formatDistanceToNow,
} from "date-fns";

import {
  ptBR,
} from "date-fns/locale";

import {
  FaCalendarCheck,
  FaUserPlus,
  FaHandshake,
  FaCheckCircle,
  FaUser,
} from "react-icons/fa";

const activityConfig = {
  lead: {
    icon: <FaUserPlus />,
    badge: "LEAD",
    iconBg: "bg-blue-500/15",
    iconColor: "text-blue-400",
    badgeClass:
      "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  },

  visit: {
    icon: <FaCalendarCheck />,
    badge: "VISITA",
    iconBg: "bg-purple-500/15",
    iconColor: "text-purple-400",
    badgeClass:
      "bg-purple-500/15 text-purple-400 border border-purple-500/30",
  },

  proposal: {
    icon: <FaHandshake />,
    badge: "PROPOSTA",
    iconBg: "bg-orange-500/15",
    iconColor: "text-orange-400",
    badgeClass:
      "bg-orange-500/15 text-orange-400 border border-orange-500/30",
  },

  sale: {
    icon: <FaCheckCircle />,
    badge: "VENDA",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-400",
    badgeClass:
      "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  },
};

export default function BrokerActivity({
  activities = [],
}) {
  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">

      <div className="flex items-center justify-between mb-6">

        <div>

          <h2 className="text-xl font-semibold text-white">
            Atividades Recentes
          </h2>

          <p className="text-sm text-gray-400 mt-1">
            Últimas movimentações do seu funil
          </p>

        </div>

        <span className="px-3 py-1 rounded-full bg-gray-800 text-gray-300 text-sm border border-gray-700">
          {activities.length} atividades
        </span>

      </div>

      {activities.length === 0 ? (

        <div className="text-center py-12 text-gray-500">
          Nenhuma atividade encontrada.
        </div>

      ) : (

        <div className="relative">

          <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-800" />

          <div className="space-y-5">

            {activities.map((item) => {

              const config =
                activityConfig[item.type] ||
                activityConfig.lead;

              return (

                <div
                  key={item.id}
                  className="
                    relative
                    flex
                    gap-4
                  "
                >

                  {/* Ícone */}

                  <div
                    className={`
                      relative
                      z-10
                      w-12
                      h-12
                      rounded-full
                      flex
                      items-center
                      justify-center
                      ${config.iconBg}
                    `}
                  >

                    <div className={`text-lg ${config.iconColor}`}>
                      {config.icon}
                    </div>

                  </div>

                  {/* Card */}

                  <div
                    className="
                      flex-1
                      rounded-xl
                      border
                      border-gray-800
                      bg-gray-800/60
                      p-4
                      hover:border-blue-500/40
                      hover:bg-gray-800
                      transition-all
                    "
                  >

                    <div className="flex justify-between items-start gap-3">

                      <div>

                        <p className="text-white font-semibold">
                          {item.title}
                        </p>

                        {item.client && (

                          <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">

                            <FaUser className="text-gray-500" />

                            <span>
                              {item.client}
                            </span>

                          </div>

                        )}

                        <p className="text-xs text-gray-500 mt-3">

                          {formatDistanceToNow(
                            new Date(item.date),
                            {
                              addSuffix: true,
                              locale: ptBR,
                            }
                          )}

                        </p>

                      </div>

                      <span
                        className={`
                          px-3
                          py-1
                          rounded-full
                          text-xs
                          font-semibold
                          uppercase
                          tracking-wider
                          whitespace-nowrap
                          ${config.badgeClass}
                        `}
                      >
                        {config.badge}
                      </span>

                    </div>

                  </div>

                </div>

              );

            })}

          </div>

        </div>

      )}

    </div>
  );
}

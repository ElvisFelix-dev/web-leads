import { Users, TrendingUp } from 'lucide-react';

export default function LeadsByBroker({ data = [] }) {
  if (!data.length) {
    return (
      <div
        className="
        bg-slate-900
        border
        border-slate-800
        rounded-2xl
        p-8
        text-center
        text-slate-400
        "
      >
        Nenhum dado de corretores disponível.
      </div>
    );
  }

  const maxLeads = Math.max(...data.map((broker) => broker.total || 0), 1);

  return (
    <div
      className="
      bg-slate-900
      border
      border-slate-800
      rounded-2xl
      p-6
      shadow-xl
      "
    >
      {/* HEADER */}

      <div
        className="
        flex
        items-center
        gap-3
        mb-6
        "
      >
        <div
          className="
          w-10
          h-10
          rounded-xl
          bg-blue-500/10
          flex
          items-center
          justify-center
          "
        >
          <Users
            size={22}
            className="
            text-blue-400
            "
          />
        </div>

        <div>
          <h2
            className="
            text-xl
            font-bold
            text-white
            "
          >
            Leads por Corretor
          </h2>

          <p
            className="
            text-sm
            text-slate-400
            "
          >
            Distribuição de oportunidades
          </p>
        </div>
      </div>

      {/* LISTA */}

      <div
        className="
        space-y-6
        "
      >
        {data.map((broker) => {
          const percentage = ((broker.total || 0) / maxLeads) * 100;

          return (
            <div
              key={broker.id}

              className="
              space-y-3
              "
            >
              {/* CORRETOR */}

              <div
                className="
                flex
                justify-between
                items-center
                "
              >
                <div
                  className="
                  flex
                  items-center
                  gap-3
                  "
                >
                  <img
                    src={
                      broker.avatar ||
                      `https://ui-avatars.com/api/?name=${broker.name}`
                    }

                    alt={broker.name}

                    className="
                    w-12
                    h-12
                    rounded-full
                    object-cover
                    border
                    border-slate-700
                    "
                  />

                  <div>
                    <h3
                      className="
                      text-white
                      font-semibold
                      "
                    >
                      {broker.name}
                    </h3>

                    <p
                      className="
                      text-xs
                      text-slate-500
                      "
                    >
                      {broker.position || 'Corretor'}
                    </p>

                    <div
                      className="
                      flex
                      items-center
                      gap-1
                      text-xs
                      text-blue-400
                      mt-1
                      "
                    >
                      <TrendingUp size={13} />
                      Performance
                    </div>
                  </div>
                </div>

                <div
                  className="
                  text-right
                  "
                >
                  <strong
                    className="
                    text-2xl
                    font-bold
                    text-white
                    "
                  >
                    {broker.total}
                  </strong>

                  <p
                    className="
                    text-xs
                    text-slate-500
                    "
                  >
                    leads
                  </p>
                </div>
              </div>

              {/* BARRA */}

              <div
                className="
                h-3
                bg-slate-800
                rounded-full
                overflow-hidden
                "
              >
                <div
                  className="
                  h-full
                  bg-gradient-to-r
                  from-blue-500
                  to-indigo-500
                  rounded-full
                  transition-all
                  duration-700
                  "

                  style={{
                    width: `${percentage}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

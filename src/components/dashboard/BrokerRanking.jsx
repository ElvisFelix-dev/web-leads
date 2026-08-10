import { Trophy, Medal, TrendingUp, Users } from 'lucide-react';

export default function BrokerRanking({ ranking = [] }) {
  if (!ranking.length) {
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
        Nenhum corretor no ranking.
      </div>
    );
  }

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
          bg-yellow-500/10
          flex
          items-center
          justify-center
          "
        >
          <Trophy size={22} className="text-yellow-400" />
        </div>

        <div>
          <h2
            className="
            text-xl
            font-bold
            text-white
            "
          >
            Ranking de Corretores
          </h2>

          <p
            className="
            text-sm
            text-slate-400
            "
          >
            Performance comercial
          </p>
        </div>
      </div>

      {/* LISTA */}

      <div
        className="
        space-y-4
        "
      >
        {ranking.map((broker, index) => {
          const position = index + 1;

          return (
            <div
              key={broker.id}

              className={`
              flex
              items-center
              justify-between
              p-4
              rounded-xl
              border
              transition

              ${
                position === 1
                  ? 'bg-yellow-500/10 border-yellow-500/30'
                  : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
              }

              `}
            >
              {/* POSIÇÃO */}

              <div
                className="
                flex
                items-center
                gap-4
                "
              >
                <div
                  className="
                  w-10
                  h-10
                  rounded-full
                  flex
                  items-center
                  justify-center
                  font-bold
                  text-white
                  bg-slate-700
                  "
                >
                  {position === 1 ? <Trophy size={20} /> : position}
                </div>

                {/* AVATAR */}

                <img
                  src={
                    broker.avatar ||
                    'https://ui-avatars.com/api/?name=' + broker.name
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

                  <div
                    className="
                    flex
                    items-center
                    gap-2
                    text-sm
                    text-slate-400
                    "
                  >
                    <Users size={14} />
                    {broker.leads || 0} leads
                  </div>
                </div>
              </div>

              {/* PONTOS */}

              <div
                className="
                text-right
                "
              >
                <div
                  className="
                  flex
                  items-center
                  gap-2
                  justify-end
                  text-green-400
                  "
                >
                  <TrendingUp size={16} />

                  <span
                    className="
                    font-bold
                    text-lg
                    "
                  >
                    {broker.points}
                  </span>
                </div>

                <p
                  className="
                  text-xs
                  text-slate-500
                  "
                >
                  pontos
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

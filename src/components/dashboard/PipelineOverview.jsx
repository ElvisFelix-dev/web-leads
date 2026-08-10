import {
  Inbox,
  UserCheck,
  CalendarCheck,
  FileText,
  Handshake,
  XCircle,
  TrendingUp,
} from 'lucide-react';

export default function PipelineOverview({ pipeline = [] }) {
  const stages = [
    {
      key: 'novo_lead',
      label: 'Novos',
      icon: Inbox,
    },

    {
      key: 'qualificado',
      label: 'Qualificados',
      icon: UserCheck,
    },

    {
      key: 'visita_agendada',
      label: 'Visitas',
      icon: CalendarCheck,
    },

    {
      key: 'proposta_enviada',
      label: 'Propostas',
      icon: FileText,
    },

    {
      key: 'fechado',
      label: 'Fechados',
      icon: Handshake,
    },

    {
      key: 'perdido',
      label: 'Perdidos',
      icon: XCircle,
    },

    {
      key: 'negociacao',
      label: 'Negociação',
      icon: TrendingUp,
    },
  ];

  /*
  ======================================
  CONVERTE ARRAY DA API
  PARA OBJETO
  ======================================
  */

  const pipelineData = pipeline.reduce((acc, item) => {
    if (item._id) {
      acc[item._id] = item.total;
    }

    return acc;
  }, {});

  const total = Object.values(pipelineData).reduce(
    (acc, value) => acc + value,
    0,
  );

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
          bg-indigo-500/10
          flex
          items-center
          justify-center
          "
        >
          <TrendingUp
            size={22}
            className="
            text-indigo-400
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
            Pipeline Comercial
          </h2>

          <p
            className="
            text-sm
            text-slate-400
            "
          >
            Visão geral das oportunidades
          </p>
        </div>
      </div>

      {/* TOTAL */}

      <div
        className="
        mb-6
        bg-slate-800/50
        border
        border-slate-700
        rounded-xl
        p-4
        "
      >
        <p
          className="
          text-sm
          text-slate-400
          "
        >
          Total no Pipeline
        </p>

        <h3
          className="
          text-3xl
          font-bold
          text-white
          mt-1
          "
        >
          {total}
        </h3>
      </div>

      {/* ETAPAS */}

      <div
        className="
        grid
        grid-cols-1
        sm:grid-cols-2
        gap-4
        "
      >
        {stages.map((stage) => {
          const Icon = stage.icon;

          const value = pipelineData[stage.key] || 0;

          const percent = total ? ((value / total) * 100).toFixed(0) : 0;

          return (
            <div
              key={stage.key}

              className="
              bg-slate-800/50
              border
              border-slate-700
              rounded-xl
              p-4
              hover:border-indigo-500
              transition
              "
            >
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
                  <div
                    className="
                    w-9
                    h-9
                    rounded-lg
                    bg-slate-700
                    flex
                    items-center
                    justify-center
                    "
                  >
                    <Icon
                      size={18}
                      className="
                      text-white
                      "
                    />
                  </div>

                  <span
                    className="
                    text-slate-300
                    font-medium
                    "
                  >
                    {stage.label}
                  </span>
                </div>

                <strong
                  className="
                  text-white
                  text-xl
                  "
                >
                  {value}
                </strong>
              </div>

              <div
                className="
                mt-4
                h-2
                bg-slate-700
                rounded-full
                overflow-hidden
                "
              >
                <div
                  className="
                  h-full
                  bg-gradient-to-r
                  from-indigo-500
                  to-purple-500
                  rounded-full
                  transition-all
                  duration-500
                  "

                  style={{
                    width: `${percent}%`,
                  }}
                />
              </div>

              <p
                className="
                mt-2
                text-xs
                text-slate-500
                "
              >
                {percent}% do pipeline
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

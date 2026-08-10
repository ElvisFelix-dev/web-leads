import {
  RefreshCw,
  Plus,
  UserRound,
  Users,
  Target,
  CalendarDays,
  TrendingUp,
} from 'lucide-react';

const BrokerPipelineHeader = ({
  broker = {},

  stats = {},

  reload,

  loading = false,

  onCreateLead,
}) => {
  return (
    <div
      className="
        mb-6
        rounded-xl
        border
        border-slate-700
        bg-slate-900
        p-6
        shadow-xl
      "
    >
      <div
        className="
          flex
          flex-col
          gap-6
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        {/* PROFILE */}

        <div
          className="
            flex
            items-center
            gap-4
          "
        >
          <div
            className="
              flex
              h-16
              w-16
              items-center
              justify-center
              overflow-hidden
              rounded-full
              border
              border-slate-700
              bg-slate-800
            "
          >
            {broker?.avatar ? (
              <img
                src={broker.avatar}
                alt={broker.name}
                className="
                  h-full
                  w-full
                  object-cover
                "
              />
            ) : (
              <UserRound
                size={32}
                className="
                  text-slate-500
                "
              />
            )}
          </div>

          <div>
            <h1
              className="
                text-2xl
                font-bold
                text-white
              "
            >
              Olá, {broker?.name || 'Corretor'}
            </h1>

            <p
              className="
                mt-1
                text-sm
                text-slate-400
              "
            >
              Seu pipeline comercial de oportunidades.
            </p>
          </div>
        </div>

        {/* ACTIONS */}

        <div
          className="
            flex
            gap-3
          "
        >
          <button
            onClick={reload}

            disabled={loading}

            className="
              flex
              items-center
              gap-2
              rounded-lg
              border
              border-slate-700
              bg-slate-800
              px-4
              py-2
              text-sm
              text-slate-200
              transition
              hover:bg-slate-700
              disabled:opacity-50
            "
          >
            <RefreshCw
              size={18}

              className={loading ? 'animate-spin' : ''}
            />
            Atualizar
          </button>

          <button
            onClick={onCreateLead}

            className="
              flex
              items-center
              gap-2
              rounded-lg
              bg-blue-600
              px-4
              py-2
              text-sm
              font-medium
              text-white
              transition
              hover:bg-blue-500
            "
          >
            <Plus size={18} />
            Novo Lead
          </button>
        </div>
      </div>

      {/* METRICS */}

      <div
        className="
          mt-6
          grid
          gap-4
          sm:grid-cols-2
          lg:grid-cols-4
        "
      >
        <MetricCard
          icon={<Users size={20} />}

          label="Leads Ativos"

          value={stats.total || 0}

          color="
            text-blue-400
            bg-blue-500/10
            border-blue-500/20
          "
        />

        <MetricCard
          icon={<Target size={20} />}

          label="Novos Leads"

          value={stats.novos || 0}

          color="
            text-yellow-400
            bg-yellow-500/10
            border-yellow-500/20
          "
        />

        <MetricCard
          icon={<CalendarDays size={20} />}

          label="Visitas"

          value={stats.visitas || 0}

          color="
            text-purple-400
            bg-purple-500/10
            border-purple-500/20
          "
        />

        <MetricCard
          icon={<TrendingUp size={20} />}

          label="Convertidos"

          value={stats.convertidos || 0}

          color="
            text-emerald-400
            bg-emerald-500/10
            border-emerald-500/20
          "
        />
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value, color }) => {
  return (
    <div
      className={`
        flex
        items-center
        gap-3
        rounded-xl
        border
        p-4
        ${color}
      `}
    >
      <div>{icon}</div>

      <div>
        <p
          className="
            text-xs
            text-slate-400
          "
        >
          {label}
        </p>

        <strong
          className="
            text-xl
            text-white
          "
        >
          {value}
        </strong>
      </div>
    </div>
  );
};

export default BrokerPipelineHeader;

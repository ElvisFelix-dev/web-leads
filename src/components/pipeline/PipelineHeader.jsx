import {
  RefreshCw,
  Plus,
  Search,
  Users,
  TrendingUp,
  CheckCircle,
  XCircle,
  Percent,
} from 'lucide-react';

/*
=====================================
PIPELINE HEADER
=====================================
*/

const PipelineHeader = ({
  totalLeads = 0,

  metrics = {},

  reload,

  search = '',
  onSearch,

  onCreateLead,

  loading = false,
}) => {
  console.log('Pipeline metrics:', metrics);
  /*
  =====================================
  METRICS
  =====================================
  */

  const negociacao =
    metrics.negociacao ?? metrics.negociação ?? metrics.negotiation ?? 0;

  const fechados =
    metrics.fechado ??
    metrics.convertidos ??
    metrics.converted ??
    metrics.won ??
    0;

  const perdidos = metrics.perdido ?? metrics.lost ?? 0;

  const conversao =
    totalLeads > 0 ? ((fechados / totalLeads) * 100).toFixed(1) : '0.0';

  return (
    <div
      className="
        mb-6
        overflow-hidden
        rounded-2xl
        border
        border-slate-800
        bg-slate-900
        shadow-xl
      "
    >
      {/* HEADER */}

      <div
        className="
          border-b
          border-slate-800
          p-6
        "
      >
        <div
          className="
            flex
            flex-col
            gap-6
            xl:flex-row
            xl:items-start
            xl:justify-between
          "
        >
          {/* LEFT */}

          <div>
            <h1
              className="
                text-3xl
                font-bold
                tracking-tight
                text-white
              "
            >
              Pipeline Comercial
            </h1>

            <p
              className="
                mt-2
                text-sm
                text-slate-400
              "
            >
              Gerencie todas as oportunidades do funil de vendas em tempo real.
            </p>

            {/* METRIC CARDS */}

            <div
              className="
                mt-6
                grid
                grid-cols-2
                gap-4
                lg:grid-cols-5
              "
            >
              <MetricCard
                icon={<Users size={20} />}
                label="Leads"
                value={totalLeads}
                color="
                  border-blue-500/20
                  bg-blue-500/10
                  text-blue-400
                "
              />

              <MetricCard
                icon={<TrendingUp size={20} />}
                label="Negociação"
                value={negociacao}
                color="
                  border-orange-500/20
                  bg-orange-500/10
                  text-orange-400
                "
              />

              <MetricCard
                icon={<CheckCircle size={20} />}
                label="Fechados"
                value={fechados}
                color="
                  border-emerald-500/20
                  bg-emerald-500/10
                  text-emerald-400
                "
              />

              <MetricCard
                icon={<XCircle size={20} />}
                label="Perdidos"
                value={perdidos}
                color="
                  border-red-500/20
                  bg-red-500/10
                  text-red-400
                "
              />

              <MetricCard
                icon={<Percent size={20} />}
                label="Conversão"
                value={`${conversao}%`}
                color="
                  border-violet-500/20
                  bg-violet-500/10
                  text-violet-400
                "
              />
            </div>
          </div>
          {/* ACTIONS */}

          <div
            className="
              flex
              flex-col
              gap-3
              sm:flex-row
              xl:items-start
            "
          >
            <button
              type="button"
              onClick={reload}
              disabled={loading}
              className="
                flex
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-slate-700
                bg-slate-800
                px-5
                py-3
                text-sm
                font-medium
                text-slate-200
                transition-all
                hover:border-slate-600
                hover:bg-slate-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Atualizar
            </button>

            <button
              type="button"
              onClick={onCreateLead}
              className="
                flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-blue-600
                px-5
                py-3
                text-sm
                font-semibold
                text-white
                transition-all
                hover:bg-blue-500
                active:scale-[0.98]
              "
            >
              <Plus size={18} />
              Novo Lead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/*
=====================================
METRIC CARD
=====================================
*/

const MetricCard = ({ icon, label, value, color }) => {
  return (
    <div
      className={`
        rounded-xl
        border
        p-4
        transition-all
        hover:-translate-y-1
        hover:shadow-lg
        ${color}
      `}
    >
      <div className="flex items-center justify-between">
        <div>{icon}</div>

        <span
          className="
            text-2xl
            font-bold
          "
        >
          {value}
        </span>
      </div>

      <p
        className="
          mt-3
          text-xs
          font-medium
          uppercase
          tracking-wide
          text-slate-300
        "
      >
        {label}
      </p>
    </div>
  );
};

export default PipelineHeader;

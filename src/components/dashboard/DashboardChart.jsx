import {
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import { BarChart3, TrendingUp } from 'lucide-react';

export default function DashboardChart({ data = [] }) {
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
        Nenhum dado disponível para gráfico.
      </div>
    );
  }

  const totalLeads = data.reduce((acc, item) => acc + (item.leads || 0), 0);

  const totalImoveis = data.reduce((acc, item) => acc + (item.imoveis || 0), 0);

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
        justify-between
        items-center
        mb-6
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
            w-10
            h-10
            rounded-xl
            bg-blue-500/10
            flex
            items-center
            justify-center
            "
          >
            <BarChart3
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
              Evolução do Sistema
            </h2>

            <p
              className="
              text-sm
              text-slate-400
              "
            >
              Leads e imóveis cadastrados
            </p>
          </div>
        </div>

        {/* RESUMO */}

        <div
          className="
          hidden
          md:flex
          items-center
          gap-4
          "
        >
          <div
            className="
            text-right
            "
          >
            <p
              className="
              text-xs
              text-slate-500
              "
            >
              Leads
            </p>

            <strong
              className="
              text-blue-400
              "
            >
              {totalLeads}
            </strong>
          </div>

          <div
            className="
            text-right
            "
          >
            <p
              className="
              text-xs
              text-slate-500
              "
            >
              Imóveis
            </p>

            <strong
              className="
              text-green-400
              "
            >
              {totalImoveis}
            </strong>
          </div>
        </div>
      </div>

      {/* GRAFICO */}

      <ResponsiveContainer width="100%" height={360}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />

              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>

            <linearGradient id="propertyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.35} />

              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />

          <XAxis
            dataKey="day"

            stroke="#94a3b8"
          />

          <YAxis stroke="#94a3b8" />

          <Tooltip
            contentStyle={{
              background: '#020617',

              border: '1px solid #334155',

              borderRadius: '12px',

              color: '#fff',
            }}
          />

          <Legend />

          <Area
            type="monotone"

            dataKey="leads"

            name="Leads"

            stroke="#3b82f6"

            fill="url(#leadGradient)"

            strokeWidth={3}

            animationDuration={1200}
          />

          <Area
            type="monotone"

            dataKey="imoveis"

            name="Imóveis"

            stroke="#22c55e"

            fill="url(#propertyGradient)"

            strokeWidth={3}

            animationDuration={1200}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div
        className="
        mt-4
        flex
        items-center
        gap-2
        text-sm
        text-slate-400
        "
      >
        <TrendingUp
          size={16}
          className="
          text-blue-400
          "
        />
        Crescimento geral da plataforma
      </div>
    </div>
  );
}

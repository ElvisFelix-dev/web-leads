import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

const monthColors = [
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#F97316',
  '#10B981',
  '#06B6D4',
  '#EAB308',
  '#EF4444',
  '#14B8A6',
  '#A855F7',
  '#22C55E',
  '#6366F1',
];

export default function BrokerCharts({ chart = [] }) {
  const formattedChart = chart.map((item, index) => ({
    ...item,

    monthColor: monthColors[index % monthColors.length],
  }));

  if (!Array.isArray(chart) || chart.length === 0) {
    return (
      <div
        className="
        h-[420px]
        rounded-3xl
        border
        border-slate-800
        bg-slate-900
        p-6
        flex
        items-center
        justify-center
        "
      >
        <div
          className="
          text-center
          text-slate-400
          "
        >
          <p
            className="
            text-lg
            font-semibold
            text-white
            "
          >
            Nenhum dado disponível
          </p>

          <p
            className="
            mt-2
            text-sm
            "
          >
            O gráfico aparecerá conforme suas atividades comerciais.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
      h-[420px]
      rounded-3xl
      border
      border-slate-800
      bg-slate-900
      p-5
      "
    >
      <div
        className="
        mb-5
        flex
        items-center
        justify-between
        "
      >
        <div>
          <h2
            className="
            text-lg
            font-semibold
            text-white
            "
          >
            Performance Comercial
          </h2>

          <p
            className="
            mt-1
            text-sm
            text-slate-400
            "
          >
            Evolução dos resultados
          </p>
        </div>

        <div
          className="
          h-3
          w-3
          rounded-full
          bg-blue-500
          shadow-lg
          shadow-blue-500/40
          "
        />
      </div>

      <ResponsiveContainer width="100%" height={330}>
        <LineChart
          data={formattedChart}
          margin={{
            top: 10,
            right: 10,
            left: -15,
            bottom: 5,
          }}
        >
          <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />

          <XAxis
            dataKey="month"

            stroke="#94a3b8"

            tick={({ x, y, payload, index }) => (
              <text
                x={x}

                y={y + 15}

                textAnchor="middle"

                fill={monthColors[index % monthColors.length]}

                fontSize={12}

                fontWeight="600"
              >
                {payload.value}
              </text>
            )}
          />

          <YAxis
            stroke="#94a3b8"

            allowDecimals={false}
          />

          <Tooltip
            contentStyle={{
              background: '#020617',

              border: '1px solid #1e293b',

              borderRadius: '16px',

              color: '#fff',
            }}

            labelStyle={{
              color: '#60a5fa',

              fontWeight: '700',
            }}
          />

          <Legend />

          <Line
            type="monotone"

            dataKey="leads"

            name="Leads"

            stroke="#3B82F6"

            strokeWidth={3}

            dot={({ cx, cy, index }) => (
              <circle
                cx={cx}

                cy={cy}

                r={5}

                fill={monthColors[index % monthColors.length]}

                stroke="#0f172a"

                strokeWidth={2}
              />
            )}

            activeDot={{
              r: 8,
            }}

            animationDuration={1200}
          />

          <Line
            type="monotone"

            dataKey="visits"

            name="Visitas"

            stroke="#A855F7"

            strokeWidth={3}

            dot={{
              r: 4,
            }}

            activeDot={{
              r: 7,
            }}

            animationDuration={1200}
          />

          <Line
            type="monotone"

            dataKey="sales"

            name="Vendas"

            stroke="#10B981"

            strokeWidth={3}

            dot={{
              r: 4,
            }}

            activeDot={{
              r: 7,
            }}

            animationDuration={1200}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

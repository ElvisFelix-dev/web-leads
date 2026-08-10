import { useEffect, useState } from 'react';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import { TrendingUp } from 'lucide-react';

import api from '../../service/api';

export default function BrokerPerformanceChart({ brokerId }) {
  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!brokerId) return;

    fetchPerformance();
  }, [brokerId]);

  async function fetchPerformance() {
    try {
      const response = await api.get(
        `/api/users/brokers/${brokerId}/performance`,
      );

      console.log('Performance:', response.data);

      setData(response.data.data || []);
    } catch (error) {
      console.error('Erro performance:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div
        className="
        rounded-2xl
        border
        border-slate-800
        bg-slate-900
        p-6
        text-slate-400
        "
      >
        Carregando performance...
      </div>
    );
  }

  return (
    <div
      className="
      rounded-2xl
      border
      border-slate-800
      bg-slate-900
      p-6
      "
    >
      <div
        className="
        mb-6
        flex
        items-center
        gap-3
        "
      >
        <div
          className="
          rounded-xl
          bg-blue-500/10
          p-3
          text-blue-400
          "
        >
          <TrendingUp size={20} />
        </div>

        <div>
          <h3
            className="
            text-lg
            font-semibold
            text-white
            "
          >
            Evolução mensal
          </h3>

          <p
            className="
            text-sm
            text-slate-400
            "
          >
            Últimos 6 meses
          </p>
        </div>
      </div>

      <div
        className="
        h-[320px]
        "
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Line
              type="monotone"
              dataKey="leads"
              name="Leads"
              strokeWidth={3}
            />

            <Line
              type="monotone"
              dataKey="visits"
              name="Visitas"
              strokeWidth={3}
            />

            <Line
              type="monotone"
              dataKey="deals"
              name="Negócios"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  RefreshCw,
  Target,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';

import api from '../../service/api';

const METRICS = [
  {
    key: 'leads',
    label: 'Leads recebidos',
    description: 'Novas oportunidades',
    color: '#60a5fa',
    icon: Users,
    iconStyle: 'border-blue-500/20 bg-blue-500/10 text-blue-300',
  },
  {
    key: 'visits',
    label: 'Visitas realizadas',
    description: 'Atendimentos presenciais',
    color: '#a78bfa',
    icon: CalendarDays,
    iconStyle: 'border-violet-500/20 bg-violet-500/10 text-violet-300',
  },
  {
    key: 'deals',
    label: 'Negócios fechados',
    description: 'Conversões do período',
    color: '#34d399',
    icon: Target,
    iconStyle: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
  },
];

const numberFormatter = new Intl.NumberFormat('pt-BR');

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function normalizePerformance(payload) {
  if (!Array.isArray(payload)) return [];

  return payload.map((item, index) => ({
    ...item,
    month: item.month || `Período ${index + 1}`,
    leads: toNumber(item.leads),
    visits: toNumber(item.visits),
    deals: toNumber(item.deals),
  }));
}

function formatNumber(value) {
  return numberFormatter.format(toNumber(value));
}

function getVariation(current, previous) {
  if (previous === 0) {
    if (current === 0) return null;

    return {
      value: null,
      label: 'Novo resultado',
      direction: 'up',
    };
  }

  const variation = ((current - previous) / previous) * 100;

  return {
    value: Math.round(variation),
    label: `${Math.abs(Math.round(variation))}%`,
    direction: variation >= 0 ? 'up' : 'down',
  };
}

export default function BrokerPerformanceChart({ brokerId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchPerformance = useCallback(
    async ({ silent = false } = {}) => {
      if (!brokerId) {
        setData([]);
        setLoading(false);
        setError('');
        return;
      }

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      try {
        const response = await api.get(
          `/api/users/brokers/${brokerId}/performance`,
        );

        setData(normalizePerformance(response.data?.data));
      } catch (err) {
        console.error('Erro ao buscar performance do corretor:', err);

        setError('Não foi possível carregar os dados de performance.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [brokerId],
  );

  useEffect(() => {
    fetchPerformance();
  }, [fetchPerformance]);

  const totals = useMemo(() => {
    return data.reduce(
      (result, item) => {
        result.leads += item.leads;
        result.visits += item.visits;
        result.deals += item.deals;

        return result;
      },
      {
        leads: 0,
        visits: 0,
        deals: 0,
      },
    );
  }, [data]);

  const variations = useMemo(() => {
    if (data.length < 2) {
      return {
        leads: null,
        visits: null,
        deals: null,
      };
    }

    const current = data[data.length - 1];
    const previous = data[data.length - 2];

    return {
      leads: getVariation(current.leads, previous.leads),
      visits: getVariation(current.visits, previous.visits),
      deals: getVariation(current.deals, previous.deals),
    };
  }, [data]);

  const hasActivity = useMemo(
    () =>
      data.some((item) => item.leads > 0 || item.visits > 0 || item.deals > 0),
    [data],
  );

  if (loading) {
    return <PerformanceSkeleton />;
  }

  return (
    <section className="relative w-full overflow-hidden rounded-3xl border border-slate-800/80 bg-[#0b1120] shadow-[0_20px_70px_-35px_rgba(0,0,0,0.8)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

      <div className="p-5 sm:p-7 lg:p-8">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-300 shadow-inner shadow-blue-500/5">
              <TrendingUp size={22} strokeWidth={1.8} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                  Evolução de performance
                </h3>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
                  <Activity size={12} />
                  Indicadores
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-400">
                Acompanhe os resultados mensais do corretor.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchPerformance({ silent: true })}
            disabled={refreshing}
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>

        {/* Erro */}
        {error && (
          <div
            role="alert"
            className="mt-6 flex flex-col gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-sm text-rose-200">{error}</p>

            <button
              type="button"
              onClick={() => fetchPerformance()}
              className="inline-flex items-center gap-2 self-start text-sm font-semibold text-rose-300 transition hover:text-rose-200"
            >
              Tentar novamente
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Indicadores */}
        <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {METRICS.map((metric) => (
            <MetricCard
              key={metric.key}
              metric={metric}
              value={totals[metric.key]}
              variation={variations[metric.key]}
            />
          ))}
        </div>

        {/* Gráfico */}
        <div className="mt-7 overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/35">
          <div className="flex flex-col gap-3 border-b border-slate-800/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div>
              <h4 className="text-sm font-semibold text-slate-200">
                Histórico mensal
              </h4>

              <p className="mt-1 text-xs text-slate-500">
                Comparativo de leads, visitas e negócios.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2">
              <CalendarDays size={14} className="text-slate-500" />

              <span className="text-xs font-medium text-slate-400">
                {data.length
                  ? `${data.length} ${data.length === 1 ? 'período' : 'períodos'}`
                  : 'Sem períodos'}
              </span>
            </div>
          </div>

          {error && data.length === 0 ? (
            <div className="flex min-h-[300px] items-center justify-center px-5 text-center">
              <p className="max-w-sm text-sm text-slate-500">
                Os indicadores não estão disponíveis neste momento.
              </p>
            </div>
          ) : data.length === 0 || !hasActivity ? (
            <EmptyChart hasPeriods={data.length > 0} />
          ) : (
            <div className="px-2 pb-4 pt-5 sm:px-4 sm:pt-6">
              <div className="h-[290px] w-full sm:h-[330px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data}
                    margin={{
                      top: 10,
                      right: 12,
                      left: -15,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      stroke="#1e293b"
                      strokeDasharray="4 6"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: '#64748b',
                        fontSize: 11,
                      }}
                      tickMargin={14}
                      minTickGap={20}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                      tick={{
                        fill: '#64748b',
                        fontSize: 11,
                      }}
                      tickFormatter={(value) => numberFormatter.format(value)}
                      width={48}
                    />

                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{
                        stroke: '#475569',
                        strokeDasharray: '4 5',
                      }}
                    />

                    {METRICS.map((metric) => (
                      <Line
                        key={metric.key}
                        type="monotone"
                        dataKey={metric.key}
                        name={metric.label}
                        stroke={metric.color}
                        strokeWidth={2.5}
                        dot={{
                          r: 3,
                          fill: '#0b1120',
                          stroke: metric.color,
                          strokeWidth: 2,
                        }}
                        activeDot={{
                          r: 6,
                          fill: metric.color,
                          stroke: '#0b1120',
                          strokeWidth: 3,
                        }}
                        connectNulls
                        animationDuration={700}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Legenda personalizada */}
              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 border-t border-slate-800/70 px-3 pt-5">
                {METRICS.map((metric) => (
                  <div
                    key={metric.key}
                    className="inline-flex items-center gap-2"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: metric.color }}
                    />

                    <span className="text-xs text-slate-400">
                      {metric.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé */}
        <div className="mt-5 flex flex-col gap-2 border-t border-slate-800/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-500">
              <Activity size={14} />
            </span>

            <p className="text-xs text-slate-500">
              Totais calculados com base nos dados recebidos da API.
            </p>
          </div>

          {data.length > 0 && (
            <span className="text-xs text-slate-500">
              {data[0]?.month}
              {data.length > 1 && ` — ${data[data.length - 1]?.month}`}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   CARDS DE INDICADORES
========================================================= */

function MetricCard({ metric, value, variation }) {
  const Icon = metric.icon;
  const isDown = variation?.direction === 'down';
  const isUp = variation?.direction === 'up';

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/45 p-4 transition duration-200 hover:border-slate-700 hover:bg-slate-900/80 sm:p-5">
      <div
        className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-full opacity-[0.035] blur-2xl transition group-hover:opacity-[0.09]"
        style={{ backgroundColor: metric.color }}
      />

      <div className="relative flex items-center justify-between gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${metric.iconStyle}`}
        >
          <Icon size={18} strokeWidth={1.8} />
        </div>

        {variation && (
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold ${
              isDown
                ? 'border-rose-500/20 bg-rose-500/10 text-rose-300'
                : isUp
                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                  : 'border-slate-700 bg-slate-800 text-slate-400'
            }`}
            title="Variação em relação ao período anterior"
          >
            {isDown ? (
              <ArrowDownRight size={12} />
            ) : isUp ? (
              <ArrowUpRight size={12} />
            ) : null}

            {variation.label}
          </span>
        )}
      </div>

      <p className="mt-5 text-xs font-medium text-slate-400">{metric.label}</p>

      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight text-white tabular-nums">
          {formatNumber(value)}
        </span>
      </div>

      <p className="mt-2 text-[11px] text-slate-500">{metric.description}</p>
    </div>
  );
}

/* =========================================================
   TOOLTIP PERSONALIZADO
========================================================= */

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const entries = payload.filter(
    (entry) => entry.value !== null && entry.value !== undefined,
  );

  return (
    <div className="min-w-[190px] rounded-2xl border border-slate-700/90 bg-[#0b1120]/95 p-4 shadow-2xl backdrop-blur-xl">
      <p className="mb-3 border-b border-slate-800 pb-3 text-xs font-semibold text-white">
        {label}
      </p>

      <div className="space-y-3">
        {entries.map((entry) => {
          const metric = METRICS.find((item) => item.key === entry.dataKey);

          return (
            <div
              key={entry.dataKey}
              className="flex items-center justify-between gap-5"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: metric?.color || entry.color,
                  }}
                />

                <span className="text-xs text-slate-400">{entry.name}</span>
              </div>

              <span className="text-sm font-semibold tabular-nums text-white">
                {formatNumber(entry.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   ESTADO SEM DADOS
========================================================= */

function EmptyChart({ hasPeriods }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-5 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-500">
        <Wallet size={24} strokeWidth={1.5} />
      </div>

      <h4 className="mt-5 text-sm font-semibold text-slate-200">
        {hasPeriods
          ? 'Nenhuma atividade registrada'
          : 'Ainda não há dados de performance'}
      </h4>

      <p className="mt-2 max-w-sm text-xs leading-relaxed text-slate-500">
        {hasPeriods
          ? 'Os períodos foram encontrados, mas não há leads, visitas ou negócios registrados para exibir.'
          : 'Quando houver movimentações registradas, a evolução mensal será exibida neste gráfico.'}
      </p>
    </div>
  );
}

/* =========================================================
   SKELETON DE CARREGAMENTO
========================================================= */

function PerformanceSkeleton() {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-800/80 bg-[#0b1120] p-5 sm:p-7 lg:p-8">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 animate-pulse rounded-2xl bg-slate-800" />

        <div className="flex-1 space-y-2">
          <div className="h-4 w-48 max-w-full animate-pulse rounded bg-slate-800" />
          <div className="h-3 w-64 max-w-full animate-pulse rounded bg-slate-800/70" />
        </div>

        <div className="hidden h-10 w-24 animate-pulse rounded-xl bg-slate-800 sm:block" />
      </div>

      <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {METRICS.map((metric) => (
          <div
            key={metric.key}
            className="h-36 animate-pulse rounded-2xl border border-slate-800/80 bg-slate-900/50"
          />
        ))}
      </div>

      <div className="mt-7 overflow-hidden rounded-2xl border border-slate-800/80">
        <div className="border-b border-slate-800 p-5">
          <div className="h-4 w-36 animate-pulse rounded bg-slate-800" />
          <div className="mt-2 h-3 w-56 max-w-full animate-pulse rounded bg-slate-800/70" />
        </div>

        <div className="flex h-[300px] items-end gap-4 px-6 pb-8 pt-6">
          {[35, 55, 42, 72, 60, 85, 68, 94, 76, 100, 83, 90].map(
            (height, index) => (
              <div
                key={index}
                className="flex-1 animate-pulse rounded-t-md bg-slate-800/70"
                style={{ height: `${height}%` }}
              />
            ),
          )}
        </div>
      </div>
    </section>
  );
}

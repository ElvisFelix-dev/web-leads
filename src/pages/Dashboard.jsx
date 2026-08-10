import { useEffect, useState, useContext } from 'react';

import { BarChart3, RefreshCcw } from 'lucide-react';

import { toast } from 'react-toastify';

import api from '../service/api';

import { UserContext } from '../context/UserContext';

import AdminStats from '../components/dashboard/AdminStats';

import LatestLeads from '../components/dashboard/LatestLeads';

import BrokerRanking from '../components/dashboard/BrokerRanking';

import LeadsByBroker from '../components/dashboard/LeadsByBroker';

import PipelineOverview from '../components/dashboard/PipelineOverview';

import SalesPerformance from '../components/dashboard/SalesPerformance';

import DashboardChart from '../components/dashboard/DashboardChart';

import RecentActivities from '../components/dashboard/RecentActivities';

import EmptyState from '../components/dashboard/EmptyState';

export default function Dashboard() {
  const { user } = useContext(UserContext);

  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const { data } = await api.get('/api/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      setDashboard(data);
    } catch (error) {
      console.error('Erro dashboard:', error);

      toast.error('Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      loadDashboard();
    }
  }, [user]);

  if (loading) {
    return (
      <div
        className="
        min-h-screen
        bg-slate-950
        flex
        items-center
        justify-center
        text-slate-400
        "
      >
        Carregando dashboard...
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div
        className="
        min-h-screen
        bg-slate-950
        p-8
        "
      >
        <EmptyState
          title="Dashboard indisponível"

          description="
          Não foi possível carregar os dados administrativos.
          "
        />
      </div>
    );
  }

  const {
    totals = {},

    ranking = [],

    latestLeads = [],

    leadsByBroker = [],

    pipeline = [],

    salesPerformance = [],

    leadsDaily = [],

    imoveisDaily = [],

    activities = [],
  } = dashboard;

  /*
  ======================================
  PREPARA DADOS DO GRÁFICO
  ======================================
  */

  const chartData = leadsDaily.map((lead) => {
    const property = imoveisDaily.find((item) => item._id === lead._id);

    return {
      day: lead._id,

      leads: lead.count || 0,

      imoveis: property?.count || 0,
    };
  });

  return (
    <div
      className="
      min-h-screen
      bg-slate-950
      p-4
      sm:p-6
      lg:p-8
      space-y-8
      "
    >
      {/* HEADER */}

      <div
        className="
        flex
        flex-col
        md:flex-row
        md:items-center
        md:justify-between
        gap-4
        "
      >
        <div>
          <div
            className="
            flex
            items-center
            gap-3
            "
          >
            <div
              className="
              w-12
              h-12
              rounded-xl
              bg-blue-600/10
              flex
              items-center
              justify-center
              "
            >
              <BarChart3
                className="
                text-blue-400
                "

                size={28}
              />
            </div>

            <h1
              className="
              text-3xl
              font-bold
              text-white
              "
            >
              Dashboard Administrativo
            </h1>
          </div>

          <p
            className="
            text-slate-400
            mt-3
            "
          >
            Visão geral do desempenho do CRM.
          </p>
        </div>

        <button
          onClick={loadDashboard}

          className="
          flex
          items-center
          justify-center
          gap-2
          bg-slate-900
          border
          border-slate-800
          hover:bg-slate-800
          text-white
          px-4
          py-2
          rounded-xl
          transition
          "
        >
          <RefreshCcw size={18} />
          Atualizar
        </button>
      </div>

      {/* STATS */}

      <AdminStats stats={totals} />

      {/* LEADS + RANKING */}

      <div
        className="
        grid
        grid-cols-1
        xl:grid-cols-2
        gap-6
        "
      >
        <LatestLeads leads={latestLeads} />

        <BrokerRanking ranking={ranking} />
      </div>

      {/* DISTRIBUIÇÃO */}

      <div
        className="
        grid
        grid-cols-1
        xl:grid-cols-2
        gap-6
        "
      >
        <LeadsByBroker data={leadsByBroker} />

        <PipelineOverview pipeline={pipeline} />
      </div>

      {/* PERFORMANCE + GRAFICO */}

      <div
        className="
        grid
        grid-cols-1
        xl:grid-cols-2
        gap-6
        "
      >
        <SalesPerformance
          stats={{
            leads: totals.leads,
            visitas: totals.visitas,
            propostas: totals.propostas,
            fechados: totals.fechados,
            perdidos: totals.perdidos,
          }}
        />

        <DashboardChart data={chartData} />
      </div>

      {/* ATIVIDADES */}

      <RecentActivities activities={activities} />
    </div>
  );
}

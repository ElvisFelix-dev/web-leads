// src/pages/Dashboard.jsx
import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  BarChart3,
  RefreshCcw,
  AlertCircle,
  Loader2,
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  Calendar,
} from 'lucide-react';

import { toast } from 'react-toastify';

import api from '../service/api';
import { UserContext } from '../context/UserContext';

// Importando os componentes do dashboard
import AdminStats from '../components/dashboard/AdminStats';
import LatestLeads from '../components/dashboard/LatestLeads';
import BrokerRanking from '../components/dashboard/BrokerRanking';
import LeadsByBroker from '../components/dashboard/LeadsByBroker';
import PipelineOverview from '../components/dashboard/PipelineOverview';
import SalesPerformance from '../components/dashboard/SalesPerformance';
import DashboardChart from '../components/dashboard/DashboardChart';
import RecentActivities from '../components/dashboard/RecentActivities';
import TopProperties from '../components/dashboard/TopProperties';

export default function Dashboard() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadDashboard = async (showToast = false) => {
    try {
      if (showToast) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const { data } = await api.get('/api/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      console.log('📊 Dados do dashboard:', data);

      // Normaliza os dados
      const normalizedData = {
        totals: data?.totals || data?.data?.totals || {},
        ranking: data?.ranking || data?.data?.ranking || [],
        latestLeads: data?.latestLeads || data?.data?.latestLeads || [],
        leadsByBroker: data?.leadsByBroker || data?.data?.leadsByBroker || [],
        pipeline: data?.pipeline || data?.data?.pipeline || [],
        salesPerformance:
          data?.salesPerformance || data?.data?.salesPerformance || [],
        leadsDaily: data?.leadsDaily || data?.data?.leadsDaily || [],
        imoveisDaily: data?.imoveisDaily || data?.data?.imoveisDaily || [],
        activities: data?.activities || data?.data?.activities || [],
      };

      setDashboard(normalizedData);

      if (showToast) {
        toast.success('Dashboard atualizado!');
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dashboard:', error);
      setError(
        error.response?.data?.message || 'Erro ao carregar dados do dashboard',
      );

      if (!showToast) {
        toast.error('Erro ao carregar dashboard');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      loadDashboard();
    } else {
      setLoading(false);
      setError('Usuário não autenticado');
    }
  }, [user]);

  // Loading
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="text-slate-400">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-8">
        <AlertCircle size={48} className="text-red-400" />
        <h2 className="mt-4 text-2xl font-bold text-white">
          Erro ao carregar dashboard
        </h2>
        <p className="mt-2 text-slate-400">{error}</p>
        <button
          onClick={() => loadDashboard(true)}
          className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  // Sem dados
  if (!dashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-8">
        <div className="text-center">
          <BarChart3 size={48} className="mx-auto text-slate-600" />
          <h2 className="mt-4 text-2xl font-bold text-white">
            Dashboard indisponível
          </h2>
          <p className="mt-2 text-slate-400">
            Não foi possível carregar os dados administrativos.
          </p>
          <button
            onClick={() => loadDashboard(true)}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500"
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }

  // Dados do dashboard
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

  // Preparar dados do gráfico
  const chartData = leadsDaily.map((lead) => {
    const property = imoveisDaily.find((item) => item._id === lead._id);
    return {
      day: lead._id,
      leads: lead.count || 0,
      imoveis: property?.count || 0,
    };
  });

  // Verificar se há dados
  const hasData =
    totals?.leads > 0 || totals?.properties > 0 || ranking.length > 0;

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/10">
                <BarChart3 className="text-blue-400" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Dashboard Administrativo
                </h1>
                <p className="mt-1 text-sm text-slate-400">
                  Visão geral do desempenho do CRM
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => loadDashboard(true)}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
            >
              <RefreshCcw
                size={18}
                className={refreshing ? 'animate-spin' : ''}
              />
              {refreshing ? 'Atualizando...' : 'Atualizar'}
            </button>
          </div>
        </div>

        {/* STATS */}
        <AdminStats stats={totals} />
        <TopProperties />

        {/* LEADS + RANKING */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <LatestLeads leads={latestLeads} />
          <BrokerRanking ranking={ranking} />
        </div>

        {/* DISTRIBUIÇÃO */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <LeadsByBroker data={leadsByBroker} />
          <PipelineOverview pipeline={pipeline} />
        </div>

        {/* PERFORMANCE + GRÁFICO */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <SalesPerformance
            stats={{
              leads: totals.leads || 0,
              visitas: totals.visitas || 0,
              propostas: totals.propostas || 0,
              fechados: totals.fechados || 0,
              perdidos: totals.perdidos || 0,
            }}
          />
          <DashboardChart data={chartData} />
        </div>

        {/* ATIVIDADES */}
        <RecentActivities activities={activities} />

        {/* DICA PARA ADMIN */}
        {!hasData && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 text-center">
            <TrendingUp size={32} className="mx-auto text-amber-400" />
            <h3 className="mt-3 text-lg font-semibold text-white">
              Comece a usar o sistema
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              Cadastre seus primeiros imóveis, leads e corretores para ver as
              estatísticas aqui.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => navigate('/create-property')}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Cadastrar Imóvel
              </button>
              <button
                onClick={() => navigate('/leads')}
                className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500"
              >
                Gerenciar Leads
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

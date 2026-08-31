import { useEffect, useState } from 'react';

import { RefreshCw } from 'lucide-react';

import api from '../service/api';

import BrokerHeader from '../components/brokerDashboard/BrokerHeader';
import BrokerStats from '../components/brokerDashboard/BrokerStats';
import BrokerCharts from '../components/brokerDashboard/BrokerCharts';
import BrokerGoals from '../components/brokerDashboard/BrokerGoals';
import BrokerNextVisits from '../components/brokerDashboard/BrokerNextVisits';
import BrokerRecentLeads from '../components/brokerDashboard/BrokerRecentLeads';
import BrokerActivity from '../components/brokerDashboard/BrokerActivity';

export default function BrokerDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.get('/api/broker-dashboard');

      console.log('📊 RESPOSTA COMPLETA DA API:', response);

      // 🔥 FIX: Verifica se a resposta tem a estrutura esperada
      let dashboardData = response.data;

      // Se a resposta tiver { success: true, data: {...} }
      if (dashboardData?.success && dashboardData?.data) {
        dashboardData = dashboardData.data;
      }

      // Se a resposta tiver { data: {...} } (sem success)
      if (dashboardData?.data && !dashboardData?.success) {
        dashboardData = dashboardData.data;
      }

      console.log('📊 DADOS DO DASHBOARD:', dashboardData);

      // 🔥 FIX: Valida se os dados essenciais existem
      if (!dashboardData || typeof dashboardData !== 'object') {
        throw new Error('Dados do dashboard inválidos');
      }

      setDashboard(dashboardData);
    } catch (err) {
      console.error('❌ Erro dashboard:', err);

      // 🔥 FIX: Mensagem de erro mais detalhada
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Erro ao carregar dashboard';

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // ============================================
  // ESTADO DE LOADING
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="text-gray-400">Carregando dashboard...</span>
        </div>
      </div>
    );
  }

  // ============================================
  // ESTADO DE ERRO
  // ============================================
  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-6 text-white p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">
            Ops! Algo deu errado
          </h2>
          <p className="text-gray-400 max-w-md">{error}</p>
        </div>

        <button
          onClick={loadDashboard}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl transition-colors"
        >
          <RefreshCw size={18} />
          Tentar novamente
        </button>
      </div>
    );
  }

  // ============================================
  // 🔥 FIX: Verifica se o dashboard existe
  // ============================================
  if (!dashboard) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 text-white">
        <p className="text-gray-400">Nenhum dado disponível</p>
        <button
          onClick={loadDashboard}
          className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-xl"
        >
          <RefreshCw size={18} />
          Recarregar
        </button>
      </div>
    );
  }

  // ============================================
  // DADOS COM FALLBACKS
  // ============================================
  const stats = dashboard.stats || {};
  const broker = dashboard.broker || {};
  const chart = dashboard.chart || [];
  const goals = dashboard.goals || [];
  const nextVisits = dashboard.nextVisits || [];
  const recentLeads = dashboard.recentLeads || [];
  const activities = dashboard.activities || [];
  const rank = dashboard.rank || 0;
  const points = dashboard.points || 0;

  console.log('📊 DADOS RENDERIZADOS:', {
    stats,
    broker,
    chartLength: chart.length,
    goalsLength: goals.length,
    nextVisitsLength: nextVisits.length,
    recentLeadsLength: recentLeads.length,
    activitiesLength: activities.length,
  });

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Botão de atualizar */}
      <div className="flex justify-end mb-4">
        <button
          onClick={loadDashboard}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl transition-colors"
        >
          <RefreshCw size={18} />
          Atualizar
        </button>
      </div>

      {/* Header do corretor */}
      <BrokerHeader broker={broker} stats={stats} rank={rank} points={points} />

      {/* Cards de estatísticas */}
      <BrokerStats stats={stats} />

      {/* Grid: Gráficos + Metas */}
      <div className="grid lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          {/* 🔥 FIX: chart é um ARRAY */}
          <BrokerCharts chart={chart} />
        </div>
        <BrokerGoals goals={goals} />
      </div>

      {/* Grid: Próximas visitas + Leads recentes */}
      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <BrokerNextVisits visits={nextVisits} />
        <BrokerRecentLeads leads={recentLeads} />
      </div>

      {/* Atividades recentes */}
      <div className="mt-6">
        <BrokerActivity activities={activities} />
      </div>
    </div>
  );
}

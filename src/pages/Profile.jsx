import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import api from '../service/api';

import Loading from '../components/profile/Loading';

import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileStats from '../components/profile/ProfileStats';
import ProfilePersonal from '../components/profile/ProfilePersonal';
import ProfileProfessional from '../components/profile/ProfileProfessional';
import ProfileSocials from '../components/profile/ProfileSocials';

import useUser from '../hooks/useUser';

export default function Profile() {
  const { user, setUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  /*
  ==========================================
  BUSCAR DADOS DO DASHBOARD
  ==========================================
  */

  const fetchDashboardData = async () => {
    if (!user?._id) return;

    try {
      setStatsLoading(true);

      // Busca os dados do dashboard do corretor
      const response = await api.get('/api/broker-dashboard');

      console.log('📊 Dados do dashboard:', response.data);

      const data = response.data || {};

      // Extrai as estatísticas do dashboard
      setDashboardData({
        stats: {
          leads: data?.stats?.leads || 0,
          visits: data?.stats?.visitas || 0,
          deals: data?.stats?.vendas || 0,
          revenue: data?.stats?.valorVendas || 0,
          conversion: data?.stats?.conversion || 0,
        },
        performance: {
          points: data?.points || 0,
          level: data?.rank || 1,
          rank: data?.rank || 0,
        },
      });

      // Atualiza o user com os dados mais recentes (opcional)
      if (data?.broker) {
        setUser({
          ...user,
          ...data.broker,
          stats: {
            leads: data?.stats?.leads || 0,
            visits: data?.stats?.visitas || 0,
            deals: data?.stats?.vendas || 0,
            revenue: data?.stats?.valorVendas || 0,
          },
          performance: {
            points: data?.points || 0,
            level: data?.rank || 1,
          },
          token: user.token,
        });
      }
    } catch (error) {
      console.error('❌ Erro ao buscar dashboard:', error);

      // Fallback: usa os dados que já tem no user
      setDashboardData({
        stats: {
          leads: user?.stats?.leads || 0,
          visits: user?.stats?.visits || 0,
          deals: user?.stats?.deals || 0,
          revenue: user?.stats?.revenue || 0,
          conversion: user?.stats?.conversion || 0,
        },
        performance: user?.performance || {
          points: 0,
          level: 1,
        },
      });
    } finally {
      setStatsLoading(false);
    }
  };

  /*
  ==========================================
  CARREGAR DADOS INICIAIS
  ==========================================
  */

  useEffect(() => {
    if (user?._id) {
      fetchDashboardData();
    }
  }, [user?._id]);

  /*
  ==========================================
  ATUALIZAR PERFIL
  ==========================================
  */

  const updateProfile = async (updatedData) => {
    try {
      setLoading(true);

      const response = await api.put('/api/users/profile', updatedData);

      const updatedUser = {
        ...user,
        ...response.data.data,
        token: user.token,
      };

      setUser(updatedUser);

      toast.success('Perfil atualizado com sucesso!');

      // Recarrega os dados do dashboard
      await fetchDashboardData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Erro ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  /*
  ==========================================
  ATUALIZAR AVATAR
  ==========================================
  */

  const updateAvatar = (response) => {
    setUser({
      ...user,
      avatar: response.avatar,
    });
  };

  /*
  ==========================================
  ATUALIZAR CAPA
  ==========================================
  */

  const updateCover = (response) => {
    setUser({
      ...user,
      coverImage: response.coverImage,
    });
  };

  if (!user) {
    return <Loading message="Carregando usuário..." />;
  }

  // Combina os dados do usuário com os dados do dashboard
  const userData = {
    ...user,
    stats: {
      leads: dashboardData?.stats?.leads ?? user?.stats?.leads ?? 0,
      visits: dashboardData?.stats?.visits ?? user?.stats?.visits ?? 0,
      deals: dashboardData?.stats?.deals ?? user?.stats?.deals ?? 0,
      revenue: dashboardData?.stats?.revenue ?? user?.stats?.revenue ?? 0,
      conversion:
        dashboardData?.stats?.conversion ?? user?.stats?.conversion ?? 0,
    },
    performance: {
      points:
        dashboardData?.performance?.points ?? user?.performance?.points ?? 0,
      level: dashboardData?.performance?.level ?? user?.performance?.level ?? 1,
      rank: dashboardData?.performance?.rank ?? user?.performance?.rank ?? 0,
    },
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div
        className="
          mx-auto
          max-w-7xl
          space-y-8
          p-6
          md:p-8
        "
      >
        {/* Header */}

        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-gray-800
            bg-gray-900
          "
        >
          <div className="px-6 pb-6">
            <ProfileHeader
              user={userData}
              onAvatarUpdated={updateAvatar}
              onCoverUpdated={updateCover}
            />
          </div>
        </div>

        {/* Estatísticas */}

        <ProfileStats user={userData} statsLoading={statsLoading} />

        {/* Perfil Pessoal */}

        <ProfilePersonal user={userData} onSave={updateProfile} />

        {/* Perfil Profissional */}

        <ProfileProfessional user={userData} onSave={updateProfile} />

        {/* Redes Sociais */}

        <ProfileSocials user={userData} onSave={updateProfile} />
      </div>
    </div>
  );
}

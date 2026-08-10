import { toast } from 'react-toastify';

import api from '../service/api';

import Loading from '../components/profile/Loading';

import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileStats from '../components/profile/ProfileStats';
import ProfilePersonal from '../components/profile/ProfilePersonal';
import ProfileProfessional from '../components/profile/ProfileProfessional';
import ProfileSocials from '../components/profile/ProfileSocials';

import AvatarUpload from '../components/profile/AvatarUpload';
import CoverUpload from '../components/profile/CoverUpload';

import useUser from '../hooks/useUser';

export default function Profile() {
  const { user, setUser } = useUser();

  if (!user) {
    return <Loading message="Carregando usuário..." />;
  }

  /*
  ==========================================
  ATUALIZAR PERFIL
  ==========================================
  */

  const updateProfile = async (updatedData) => {
    try {
      const response = await api.put('/api/users/profile', updatedData);

      const updatedUser = {
        ...user,
        ...response.data.data,

        // mantém o token do login
        token: user.token,
      };

      setUser(updatedUser);

      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || 'Erro ao atualizar perfil.');
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
              user={user}
              onAvatarUpdated={updateAvatar}
              onCoverUpdated={updateCover}
            />
          </div>
        </div>

        {/* Estatísticas */}

        <ProfileStats user={user} />

        {/* Perfil Pessoal */}

        <ProfilePersonal user={user} onSave={updateProfile} />

        {/* Perfil Profissional */}

        <ProfileProfessional user={user} onSave={updateProfile} />

        {/* Redes Sociais */}

        <ProfileSocials user={user} onSave={updateProfile} />
      </div>
    </div>
  );
}

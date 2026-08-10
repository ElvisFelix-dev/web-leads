import {
  FaMapMarkerAlt,
  FaBuilding,
  FaCheckCircle,
  FaCrown,
  FaShareAlt,
  FaIdCard,
} from 'react-icons/fa';

import AvatarUpload from './AvatarUpload';
import CoverUpload from './CoverUpload';

export default function ProfileHeader({
  user,
  onAvatarUpdated,
  onCoverUpdated,
}) {
  const avatar = user?.avatar?.url || user?.avatar || '';

  const cover = user?.cover?.url || user?.coverImage || '';

  const availabilityColor = {
    Disponível: 'bg-green-500',
    'Em visita': 'bg-yellow-500',
    'Em reunião': 'bg-blue-500',
    Offline: 'bg-gray-500',
  };

  const availability = user?.availability || 'Disponível';

  return (
    <div
      className="
        overflow-hidden
        rounded-3xl
        border
        border-gray-800
        bg-gray-900
        shadow-2xl
      "
    >
      {/* =====================================================
          COVER
      ===================================================== */}

      <div
        className="
          relative
          h-56
          w-full
          overflow-hidden
          bg-gray-900
          sm:h-64
          md:h-72
          lg:h-80
        "
      >
        {cover ? (
          <img
            src={cover}
            alt="Cover"
            className="
              absolute
              inset-0
              h-full
              w-full
              object-cover
              object-center
              transition-transform
              duration-700
              hover:scale-105
            "
          />
        ) : (
          <div
            className="
              absolute
              inset-0
              bg-gradient-to-r
              from-slate-950
              via-blue-950
              to-cyan-900
            "
          />
        )}

        {/* Overlay */}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-b
            from-black/10
            via-black/20
            to-gray-900
          "
        />

        {/* Efeito de brilho */}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-r
            from-transparent
            via-white/5
            to-transparent
          "
        />

        {/* Upload da capa */}

        <div
          className="
            absolute
            right-4
            top-4
            z-20
          "
        >
          <CoverUpload cover={cover} onUploaded={onCoverUpdated} />
        </div>
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          relative
          px-5
          pb-8
          md:px-10
          md:pb-10
        "
      >
        <div
          className="
            -mt-20
            flex
            flex-col
            gap-8

            lg:-mt-24
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          {/* =====================================================
              AVATAR + DADOS
          ===================================================== */}

          <div
            className="
              flex
              flex-col
              items-center
              gap-6

              md:flex-row
              md:items-end
            "
          >
            {/* Avatar */}

            <div className="relative shrink-0">
              <AvatarUpload
                avatar={avatar}
                name={user?.name}
                onUploaded={onAvatarUpdated}
              />

              {/* Status Online */}

              <span
                className={`
                  absolute
                  bottom-5
                  right-4
                  h-5
                  w-5
                  rounded-full
                  border-4
                  border-gray-900
                  ${availabilityColor[availability] || 'bg-green-500'}
                `}
              />
            </div>

            {/* =====================================================
                DADOS DO USUÁRIO
            ===================================================== */}

            <div
              className="
                flex-1
                text-center
                md:text-left
              "
            >
              {/* Nome */}

              <div
                className="
                  flex
                  flex-col
                  gap-4

                  lg:flex-row
                  lg:flex-wrap
                  lg:items-center
                "
              >
                <h1
                  className="
                    text-3xl
                    font-bold
                    tracking-tight
                    text-white

                    md:text-4xl
                  "
                >
                  {user?.name}
                </h1>

                {/* Badge */}

                {user?.role === 'admin' ? (
                  <span
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-full
                      border
                      border-amber-400/20
                      bg-amber-500/10
                      px-4
                      py-2
                      text-sm
                      font-semibold
                      text-amber-300
                      backdrop-blur-sm
                    "
                  >
                    <FaCrown />
                    Administrador
                  </span>
                ) : (
                  <span
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-full
                      border
                      border-blue-500/20
                      bg-blue-500/10
                      px-4
                      py-2
                      text-sm
                      font-semibold
                      text-blue-300
                      backdrop-blur-sm
                    "
                  >
                    <FaCheckCircle />
                    Corretor
                  </span>
                )}

                {user?.creciActive && (
                  <span
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-full
                      border
                      border-green-500/20
                      bg-green-500/10
                      px-4
                      py-2
                      text-sm
                      font-semibold
                      text-green-300
                      backdrop-blur-sm
                    "
                  >
                    <FaIdCard />
                    CRECI Verificado
                  </span>
                )}
              </div>

              {/* Cargo */}

              <p
                className="
                  mt-4
                  text-lg
                  font-medium
                  text-gray-300

                  md:text-xl
                "
              >
                {user?.position || 'Consultor Imobiliário'}
              </p>

              {/* Bio */}

              {user?.bio && (
                <p
                  className="
                    mt-4
                    max-w-3xl
                    leading-relaxed
                    text-gray-400
                  "
                >
                  {user.bio}
                </p>
              )}

              {/* Informações */}

              <div
                className="
                  mt-6
                  flex
                  flex-wrap
                  justify-center
                  gap-5

                  md:justify-start
                "
              >
                {user?.company && (
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      rounded-full
                      bg-gray-800/70
                      px-4
                      py-2
                      text-gray-300
                      backdrop-blur-md
                    "
                  >
                    <FaBuilding className="text-cyan-400" />

                    <span>{user.company}</span>
                  </div>
                )}

                {user?.address?.city && (
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      rounded-full
                      bg-gray-800/70
                      px-4
                      py-2
                      text-gray-300
                      backdrop-blur-md
                    "
                  >
                    <FaMapMarkerAlt className="text-red-400" />

                    <span>{user.address.city}</span>
                  </div>
                )}

                {user?.creci && (
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      rounded-full
                      bg-gray-800/70
                      px-4
                      py-2
                      text-gray-300
                      backdrop-blur-md
                    "
                  >
                    <FaIdCard className="text-blue-400" />

                    <span>
                      CRECI
                      <strong className="ml-2 text-white">{user.creci}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* =====================================================
              BOTÕES
          ===================================================== */}

          <div
            className="
              flex
              w-full
              flex-col
              gap-3

              md:flex-row
              md:justify-end

              lg:w-auto
              lg:self-end
            "
          >
            <button
              type="button"
              className="
                rounded-xl
                border
                border-gray-700
                bg-gray-800/80
                px-6
                py-3
                font-semibold
                text-white
                backdrop-blur-md
                transition-all
                duration-300
                hover:border-blue-500
                hover:bg-gray-700
                hover:shadow-lg
                hover:shadow-blue-500/20
              "
            >
              Editar Perfil
            </button>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);

                if (window.Toastify) {
                  Toastify({
                    text: 'Link copiado com sucesso!',

                    duration: 2500,

                    gravity: 'top',

                    position: 'right',

                    style: {
                      background: 'linear-gradient(to right,#2563eb,#06b6d4)',
                    },
                  }).showToast();
                }
              }}
              className="
                flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-gradient-to-r
                from-blue-600
                to-cyan-500
                px-6
                py-3
                font-semibold
                text-white
                shadow-lg
                transition-all
                duration-300
                hover:scale-105
                hover:shadow-2xl
                hover:shadow-cyan-500/30
              "
            >
              <FaShareAlt />
              Compartilhar Perfil
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          MOBILE ACTIONS
      ===================================================== */}

      <div
        className="
          border-t
          border-gray-800
          bg-gray-900/70
          p-5
          backdrop-blur-xl
          lg:hidden
        "
      >
        <div
          className="
            grid
            gap-3
          "
        >
          <button
            type="button"
            className="
              rounded-xl
              border
              border-gray-700
              bg-gray-800
              py-3
              font-semibold
              text-white
              transition-all
              duration-300
              hover:bg-gray-700
            "
          >
            Editar Perfil
          </button>

          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);

              if (window.Toastify) {
                Toastify({
                  text: 'Perfil compartilhado!',

                  duration: 2500,

                  gravity: 'top',

                  position: 'right',

                  style: {
                    background: 'linear-gradient(to right,#2563eb,#06b6d4)',
                  },
                }).showToast();
              }
            }}
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-gradient-to-r
              from-blue-600
              to-cyan-500
              py-3
              font-semibold
              text-white
              shadow-lg
              transition-all
              duration-300
              hover:scale-[1.02]
            "
          >
            <FaShareAlt />
            Compartilhar Perfil
          </button>
        </div>
      </div>
    </div>
  );
}

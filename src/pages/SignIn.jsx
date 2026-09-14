import { useState, useContext } from 'react';

import { Link, useNavigate, useLocation } from 'react-router-dom';

import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';

import {
  FaChartLine,
  FaUsers,
  FaBuilding,
  FaCheckCircle,
} from 'react-icons/fa';

import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';

import * as yup from 'yup';

import { toast } from 'react-toastify';

import FormError from '../components/FormError';

import api from '../service/api';

import imgLogo from '../assets/logoImg.png';

import { UserContext } from '../context/UserContext';

// ======================================
// VALIDAÇÃO
// ======================================

const schema = yup.object().shape({
  email: yup.string().required('O email é obrigatório').email('Email inválido'),

  password: yup
    .string()
    .required('A senha é obrigatória')
    .min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

// ======================================
// COMPONENT
// ======================================

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const location = useLocation();

  const redirect = new URLSearchParams(location.search).get('redirect');

  const { setUser } = useContext(UserContext);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  async function onSubmit(data) {
    try {
      const response = await api.post('/api/users/login', data);

      const userData = response.data.user || response.data;

      console.log('USER DATA LOGIN:', userData);

      if (!userData.token) {
        toast.error('Token não recebido pelo servidor');

        return;
      }

      setUser(userData);

      localStorage.setItem('userInfo', JSON.stringify(userData));

      toast.success(`👋 Bem-vindo ${userData.name}!`);

      /*
      ==================================
      REDIRECIONAMENTO POR ROLE
      ==================================
      */

      if (userData.role === 'admin' || userData.isAdmin === true) {
        navigate('/dashboard');
      } else {
        navigate(redirect || '/dashboard');
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Erro ao realizar login');
    }
  }

  return (
    <section
      className="
      min-h-screen
      bg-gray-950
      flex
      items-center
      justify-center
      px-6
      py-10
      "
    >
      <div
        className="
        w-full
        max-w-6xl
        grid
        lg:grid-cols-2
        bg-gray-900
        rounded-3xl
        overflow-hidden
        border
        border-gray-800
        shadow-2xl
        "
      >
        {/* ==========================
            FORM LOGIN
        ========================== */}

        <div
          className="
          p-8
          sm:p-12
          "
        >
          <div
            className="
            flex
            justify-center
            mb-8
            "
          >
            <img
              src={imgLogo}

              alt="LeadsnaMão"

              className="
              w-24
              h-24
              rounded-full
              shadow-xl
              border
              border-gray-700
              hover:scale-105
              transition
              "
            />
          </div>

          <h1
            className="
            text-3xl
            font-bold
            text-white
            text-center
            "
          >
            Bem-vindo novamente
          </h1>

          <p
            className="
            text-gray-400
            text-center
            mt-3
            mb-8
            "
          >
            Entre na sua conta e continue gerenciando seus negócios.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}

            className="
            space-y-5
            "
          >
            <div>
              <input
                type="email"

                placeholder="Email"

                {...register('email')}

                className="
                w-full
                bg-gray-800
                border
                border-gray-700
                rounded-xl
                px-4
                py-3
                text-white
                outline-none
                focus:border-blue-500
                transition
                "
              />

              <FormError message={errors.email?.message} />
            </div>
            <div
              className="
              relative
              "
            >
              <input
                type={showPassword ? 'text' : 'password'}

                placeholder="Senha"

                {...register('password')}

                className="
                w-full
                bg-gray-800
                border
                border-gray-700
                rounded-xl
                px-4
                py-3
                pr-12
                text-white
                outline-none
                focus:border-blue-500
                transition
                "
              />

              <button
                type="button"

                onClick={() => setShowPassword(!showPassword)}

                className="
                absolute
                right-4
                top-3
                text-gray-400
                hover:text-white
                "
              >
                {showPassword ? (
                  <AiFillEyeInvisible size={22} />
                ) : (
                  <AiFillEye size={22} />
                )}
              </button>

              <FormError message={errors.password?.message} />
            </div>

            <div
              className="
              flex
              justify-between
              items-center
              text-sm
              "
            >
              <label
                className="
                flex
                gap-2
                items-center
                text-gray-400
                cursor-pointer
                "
              >
                <input
                  type="checkbox"

                  className="
                  rounded
                  bg-gray-800
                  border-gray-700
                  "
                />
                Lembrar acesso
              </label>

              <Link
                to="/forgot-password"

                className="
                text-blue-400
                hover:text-blue-300
                "
              >
                Esqueceu a senha?
              </Link>
            </div>

            <button
              type="submit"

              className="
              w-full
              py-3
              rounded-xl
              bg-gradient-to-r
              from-blue-600
              to-cyan-500
              text-white
              font-bold
              text-lg
              shadow-lg
              hover:scale-[1.02]
              transition
              "
            >
              Entrar
            </button>
          </form>
        </div>

        {/* ==========================
            LADO DIREITO
        ========================== */}

        <div
          className="
          hidden
          lg:flex
          flex-col
          justify-center
          relative
          overflow-hidden
          bg-gradient-to-br
          from-blue-950
          via-gray-900
          to-cyan-950
          p-12
          "
        >
          <div
            className="
            absolute
            w-72
            h-72
            bg-blue-500/20
            rounded-full
            blur-3xl
            top-10
            right-10
            "
          />

          <div
            className="
            relative
            z-10
            "
          >
            <h2
              className="
              text-4xl
              font-extrabold
              text-white
              leading-tight
              "
            >
              Transforme leads
              <br />
              em negócios
            </h2>

            <p
              className="
              text-gray-300
              mt-5
              text-lg
              leading-relaxed
              "
            >
              Uma plataforma completa para corretores gerenciarem clientes,
              imóveis e oportunidades em um único lugar.
            </p>

            <div
              className="
              mt-10
              space-y-4
              "
            >
              <div
                className="
                flex
                items-center
                gap-4
                bg-white/5
                border
                border-white/10
                rounded-2xl
                p-4
                "
              >
                <div
                  className="
                  bg-blue-500/20
                  p-3
                  rounded-xl
                  "
                >
                  <FaUsers
                    className="
                    text-blue-400
                    text-xl
                    "
                  />
                </div>

                <div>
                  <h3
                    className="
                    text-white
                    font-semibold
                    "
                  >
                    Gestão de Leads
                  </h3>

                  <p
                    className="
                    text-gray-400
                    text-sm
                    "
                  >
                    Organize seus clientes e oportunidades.
                  </p>
                </div>
              </div>

              <div
                className="
                flex
                items-center
                gap-4
                bg-white/5
                border
                border-white/10
                rounded-2xl
                p-4
                "
              >
                <div
                  className="
                  bg-cyan-500/20
                  p-3
                  rounded-xl
                  "
                >
                  <FaBuilding
                    className="
                    text-cyan-400
                    text-xl
                    "
                  />
                </div>

                <div>
                  <h3
                    className="
                    text-white
                    font-semibold
                    "
                  >
                    Gestão de Imóveis
                  </h3>

                  <p
                    className="
                    text-gray-400
                    text-sm
                    "
                  >
                    Controle anúncios e propriedades.
                  </p>
                </div>
              </div>

              <div
                className="
                flex
                items-center
                gap-4
                bg-white/5
                border
                border-white/10
                rounded-2xl
                p-4
                "
              >
                <div
                  className="
                  bg-green-500/20
                  p-3
                  rounded-xl
                  "
                >
                  <FaChartLine
                    className="
                    text-green-400
                    text-xl
                    "
                  />
                </div>

                <div>
                  <h3
                    className="
                    text-white
                    font-semibold
                    "
                  >
                    Dashboard Executivo
                  </h3>

                  <p
                    className="
                    text-gray-400
                    text-sm
                    "
                  >
                    Acompanhe resultados em tempo real.
                  </p>
                </div>
              </div>
            </div>

            <div
              className="
              mt-10
              flex
              items-center
              gap-2
              text-gray-300
              "
            >
              <FaCheckCircle
                className="
                text-green-400
                "
              />
              Ambiente seguro e profissional
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

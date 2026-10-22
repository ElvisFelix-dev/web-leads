import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';

import * as yup from 'yup';

import { toast } from 'react-toastify';

import {
  FaEnvelope,
  FaArrowLeft,
  FaShieldAlt,
  FaKey,
  FaUserLock,
} from 'react-icons/fa';

import FormError from '../components/FormError';

import api from '../service/api.jsx';

import imgLogo from '../assets/logoImg.png';

// ==================================
// VALIDAÇÃO
// ==================================

const schema = yup.object({
  email: yup
    .string()
    .required('O email é obrigatório')
    .email('Digite um email válido'),
});

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });

  // ==================================
  // ENVIAR EMAIL
  // ==================================

  async function onSubmit(data) {
    try {
      await api.post('/api/users/forgot-password', data);

      toast.success('Email de recuperação enviado!');

      reset();
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Erro ao enviar solicitação',
      );
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
        {/* =================================
            LADO ESQUERDO - FORM
        ================================= */}

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

              alt="CRM NODUS"

              className="
              w-24
              h-24
              rounded-full
              shadow-xl
              hover:scale-105
              transition
              duration-300
              "
            />
          </div>

          <h1
            className="
            text-3xl
            font-bold
            text-center
            text-white
            "
          >
            Recuperar senha
          </h1>

          <p
            className="
            text-center
            text-gray-400
            mt-3
            mb-8
            "
          >
            Informe seu email e enviaremos um link para criar uma nova senha.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}

            className="
            space-y-6
            "
          >
            <div>
              <div
                className="
                relative
                "
              >
                <FaEnvelope
                  className="
                  absolute
                  left-4
                  top-4
                  text-gray-500
                  "
                />

                <input
                  type="email"

                  {...register('email')}

                  placeholder="Digite seu email"

                  className="
                  w-full
                  bg-gray-800
                  border
                  border-gray-700
                  rounded-xl
                  py-3
                  pl-12
                  pr-4
                  text-white
                  placeholder-gray-500
                  outline-none
                  focus:border-blue-500
                  transition
                  "
                />
              </div>

              <FormError message={errors.email?.message} />
            </div>

            <button
              disabled={isSubmitting}

              className="
              w-full
              py-4
              rounded-xl
              bg-gradient-to-r
              from-blue-600
              to-cyan-500
              text-white
              font-bold
              shadow-lg
              hover:scale-[1.02]
              transition
              disabled:opacity-50
              "
            >
              {isSubmitting ? 'Enviando...' : 'Enviar link de recuperação'}
            </button>

            <div
              className="
              text-center
              "
            >
              <Link
                to="/"

                className="
                inline-flex
                items-center
                gap-2
                text-blue-400
                hover:text-blue-300
                "
              >
                <FaArrowLeft />
                Voltar para login
              </Link>
            </div>
          </form>
        </div>

        {/* =================================
            LADO DIREITO - BRANDING
        ================================= */}

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
          {/* EFEITOS DE FUNDO */}

          <div
            className="
            absolute
            w-72
            h-72
            bg-blue-600/20
            rounded-full
            blur-3xl
            -top-20
            -right-20
            "
          />

          <div
            className="
            absolute
            w-72
            h-72
            bg-cyan-500/20
            rounded-full
            blur-3xl
            bottom-0
            left-0
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
              font-bold
              text-white
              leading-tight
              "
            >
              Recupere seu acesso
              <br />
              de forma segura
            </h2>

            <p
              className="
              text-gray-300
              mt-5
              text-lg
              leading-relaxed
              "
            >
              Sua conta no CRM NODUS continua protegida. Enviaremos um link
              exclusivo para você redefinir sua senha rapidamente.
            </p>

            <div
              className="
              mt-10
              space-y-5
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
                backdrop-blur
                "
              >
                <div
                  className="
                  bg-blue-600/20
                  p-3
                  rounded-xl
                  "
                >
                  <FaShieldAlt
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
                    Segurança protegida
                  </h3>

                  <p
                    className="
                    text-gray-400
                    text-sm
                    "
                  >
                    Seu link possui validade limitada.
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
                backdrop-blur
                "
              >
                <div
                  className="
                  bg-cyan-600/20
                  p-3
                  rounded-xl
                  "
                >
                  <FaKey
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
                    Nova senha
                  </h3>

                  <p
                    className="
                    text-gray-400
                    text-sm
                    "
                  >
                    Escolha uma nova senha segura.
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
                backdrop-blur
                "
              >
                <div
                  className="
                  bg-purple-600/20
                  p-3
                  rounded-xl
                  "
                >
                  <FaUserLock
                    className="
                    text-purple-400
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
                    Continue seus negócios
                  </h3>

                  <p
                    className="
                    text-gray-400
                    text-sm
                    "
                  >
                    Seus leads e informações continuam seguros.
                  </p>
                </div>
              </div>
            </div>

            <div
              className="
              mt-12
              border-t
              border-white/10
              pt-6
              "
            >
              <p
                className="
                text-gray-400
                text-sm
                "
              >
                © {new Date().getFullYear()} CRM NODUS
                <br />
                Tudo conectado. Mais negocios.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

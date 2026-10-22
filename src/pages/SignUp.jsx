import { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';

import {
  FaArrowRight,
  FaChartLine,
  FaUsers,
  FaBuilding,
  FaRocket,
} from 'react-icons/fa';

import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';

import * as yup from 'yup';

import { toast } from 'react-toastify';

import FormError from '../components/FormError';

import api from '../service/api';

import imgLogo from '../assets/logoLead.jpg';

// =======================================
// VALIDAÇÃO
// =======================================

const schema = yup.object({
  name: yup.string().required('Nome obrigatório'),

  email: yup.string().email('Email inválido').required('Email obrigatório'),

  password: yup
    .string()
    .required('Senha obrigatória')
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .matches(
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,
      'Use letra maiúscula, número e caractere especial',
    ),
});

export default function SignUp() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const {
    register,

    handleSubmit,

    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // =======================================
  // CADASTRO
  // =======================================

  async function onSubmit(data) {
    try {
      setLoading(true);

      await api.post('/api/users/register', data);

      toast.success('Cadastro realizado com sucesso!');

      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao cadastrar usuário');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="
        min-h-screen
        bg-gray-950
        flex
        items-center
        justify-center
        p-6
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
        {/* ==============================
            LADO ESQUERDO FORM
        ============================== */}

        <div
          className="
            p-8
            md:p-12
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
              mb-8
            "
          >
            <img
              src={imgLogo}
              alt="CRM NODUS"
              className="
                w-14
                h-14
                rounded-2xl
                shadow-lg
              "
            />

            <div>
              <h1
                className="
                  text-white
                  text-2xl
                  font-bold
                "
              >
                CRM NODUS
              </h1>

              <p
                className="
                  text-gray-400
                  text-sm
                "
              >
                CRM Imobiliário
              </p>
            </div>
          </div>

          <h2
            className="
              text-3xl
              font-bold
              text-white
              mb-3
            "
          >
            Crie sua conta
          </h2>

          <p
            className="
              text-gray-400
              mb-8
            "
          >
            Comece a organizar seus leads, clientes e oportunidades.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="
              space-y-5
            "
          >
            <div>
              <input
                {...register('name')}
                placeholder="Nome completo"
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

              <FormError message={errors.name?.message} />
            </div>

            <div>
              <input
                {...register('email')}
                type="email"
                placeholder="Seu melhor email"
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
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                placeholder="Senha segura"
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
            {/* BOTÃO */}

            <button
              type="submit"
              disabled={loading}
              className="
                w-full
                flex
                items-center
                justify-center
                gap-3
                bg-gradient-to-r
                from-blue-600
                to-cyan-500
                hover:from-blue-500
                hover:to-cyan-400
                text-white
                font-bold
                py-4
                rounded-xl
                transition
                shadow-lg
                shadow-blue-600/20
                disabled:opacity-50
              "
            >
              {loading ? (
                'Criando conta...'
              ) : (
                <>
                  Criar minha conta
                  <FaArrowRight />
                </>
              )}
            </button>

            <p
              className="
                text-center
                text-gray-400
                text-sm
                pt-4
              "
            >
              Já possui uma conta?
              <Link
                to="/"
                className="
                  text-blue-400
                  hover:text-blue-300
                  font-semibold
                  ml-2
                "
              >
                Entrar
              </Link>
            </p>
          </form>
        </div>

        {/* ==============================
            LADO DIREITO APRESENTAÇÃO
        ============================== */}

        <div
          className="
            relative
            hidden
            lg:flex
            flex-col
            justify-center
            p-12
            bg-gradient-to-br
            from-blue-950
            via-gray-900
            to-cyan-950
            overflow-hidden
          "
        >
          {/* EFEITOS DE FUNDO */}

          <div
            className="
              absolute
              w-72
              h-72
              bg-blue-500/20
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
            <span
              className="
                inline-flex
                items-center
                gap-2
                bg-blue-500/20
                border
                border-blue-400/30
                text-blue-300
                px-4
                py-2
                rounded-full
                text-sm
                mb-6
              "
            >
              <FaRocket />
              Plataforma para corretores
            </span>

            <h2
              className="
                text-4xl
                font-bold
                text-white
                leading-tight
                mb-5
              "
            >
              Venda mais.
              <br />
              Organize melhor seus clientes.
            </h2>

            <p
              className="
                text-gray-300
                text-lg
                leading-relaxed
                mb-10
              "
            >
              Tenha controle completo dos seus leads, imóveis e oportunidades em
              um único lugar.
            </p>

            {/* CARDS BENEFÍCIOS */}

            <div
              className="
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
                  backdrop-blur
                "
              >
                <div
                  className="
                    bg-blue-500/20
                    p-3
                    rounded-xl
                    text-blue-400
                  "
                >
                  <FaUsers size={24} />
                </div>

                <div>
                  <h3
                    className="
                      text-white
                      font-bold
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
                    Organize clientes e oportunidades
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
                    bg-cyan-500/20
                    p-3
                    rounded-xl
                    text-cyan-400
                  "
                >
                  <FaChartLine size={24} />
                </div>

                <div>
                  <h3
                    className="
                      text-white
                      font-bold
                    "
                  >
                    Dashboard Inteligente
                  </h3>

                  <p
                    className="
                      text-gray-400
                      text-sm
                    "
                  >
                    Acompanhe sua performance
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
                    bg-purple-500/20
                    p-3
                    rounded-xl
                    text-purple-400
                  "
                >
                  <FaBuilding size={24} />
                </div>

                <div>
                  <h3
                    className="
                      text-white
                      font-bold
                    "
                  >
                    Gestão Imobiliária
                  </h3>

                  <p
                    className="
                      text-gray-400
                      text-sm
                    "
                  >
                    Imóveis, visitas e negócios
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

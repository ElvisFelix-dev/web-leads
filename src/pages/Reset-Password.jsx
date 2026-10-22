import { useState } from 'react';

import { useParams, useNavigate } from 'react-router-dom';

import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';

import * as yup from 'yup';

import { toast } from 'react-toastify';

import {
  AiFillEye,
  AiFillEyeInvisible,
  AiOutlineLock,
  AiOutlineSafety,
  AiOutlineCheckCircle,
} from 'react-icons/ai';

import FormError from '../components/FormError';

import api from '../service/api';

import imgLogo from '../assets/logoImg.png';

// =====================================
// VALIDAÇÃO
// =====================================

const schema = yup.object({
  password: yup
    .string()
    .required('A senha é obrigatória')
    .min(6, 'A senha deve ter pelo menos 6 caracteres')
    .matches(
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/,

      'A senha deve conter letra maiúscula, número e caractere especial',
    ),

  confirmPassword: yup
    .string()
    .required('Confirme sua senha')
    .oneOf([yup.ref('password')], 'As senhas não coincidem'),
});

export default function ResetPassword() {
  const { token } = useParams();

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const {
    register,

    handleSubmit,

    reset,

    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  async function onSubmit(data) {
    try {
      setLoading(true);

      await api.put(
        `/api/users/reset-password/${token}`,

        {
          password: data.password,
        },
      );

      toast.success('Senha redefinida com sucesso!');

      reset();

      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao redefinir senha');
    } finally {
      setLoading(false);
    }
  }

  const inputClass = `

    w-full

    bg-gray-800/70

    border

    border-gray-700

    text-white

    rounded-xl

    px-4

    py-3

    pr-12

    outline-none

    focus:border-blue-500

    transition

    placeholder:text-gray-500

  `;

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
            FORMULARIO
        =========================== */}

        <div
          className="
          p-8
          lg:p-12
          "
        >
          <div
            className="
            flex
            justify-center
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
              "
            />
          </div>

          <div
            className="
            mt-8
            text-center
            "
          >
            <h1
              className="
              text-3xl
              font-bold
              text-white
              "
            >
              Criar nova senha
            </h1>

            <p
              className="
              text-gray-400
              mt-3
              "
            >
              Digite uma nova senha segura para recuperar seu acesso.
            </p>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}

            className="
            mt-10
            space-y-6
            "
          >
            {/* NOVA SENHA */}

            <div
              className="
              relative
              "
            >
              <input
                type={showPassword ? 'text' : 'password'}

                placeholder="Nova senha"

                {...register('password')}

                className={inputClass}
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

            {/* CONFIRMAR SENHA */}

            <div
              className="
              relative
              "
            >
              <input
                type={showConfirmPassword ? 'text' : 'password'}

                placeholder="Confirmar nova senha"

                {...register('confirmPassword')}

                className={inputClass}
              />

              <button
                type="button"

                onClick={() => setShowConfirmPassword(!showConfirmPassword)}

                className="
                absolute
                right-4
                top-3
                text-gray-400
                hover:text-white
                "
              >
                {showConfirmPassword ? (
                  <AiFillEyeInvisible size={22} />
                ) : (
                  <AiFillEye size={22} />
                )}
              </button>

              <FormError message={errors.confirmPassword?.message} />
            </div>

            <button
              disabled={loading}

              type="submit"

              className="
              w-full
              py-4
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
              disabled:opacity-50
              "
            >
              {loading ? 'Alterando senha...' : 'Redefinir senha'}
            </button>
          </form>
        </div>

        {/* ==========================
             LADO DIREITO
        =========================== */}

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
            w-80
            h-80
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
              Segurança para sua conta
            </h2>

            <p
              className="
              mt-5
              text-gray-300
              text-lg
              leading-relaxed
              "
            >
              Sua senha é uma das principais proteções dos seus dados e dos seus
              clientes.
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
                p-5
                backdrop-blur
                "
              >
                <div
                  className="
                  bg-blue-500/20
                  p-3
                  rounded-xl
                  "
                >
                  <AiOutlineSafety
                    className="
                    text-blue-400
                    text-2xl
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
                    Proteção avançada
                  </h3>

                  <p
                    className="
                    text-gray-400
                    text-sm
                    "
                  >
                    Seus dados continuam seguros.
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
                p-5
                backdrop-blur
                "
              >
                <div
                  className="
                  bg-cyan-500/20
                  p-3
                  rounded-xl
                  "
                >
                  <AiOutlineLock
                    className="
                    text-cyan-400
                    text-2xl
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
                    Senha criptografada
                  </h3>

                  <p
                    className="
                    text-gray-400
                    text-sm
                    "
                  >
                    Utilize uma senha forte e única.
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
                p-5
                backdrop-blur
                "
              >
                <div
                  className="
                  bg-green-500/20
                  p-3
                  rounded-xl
                  "
                >
                  <AiOutlineCheckCircle
                    className="
                    text-green-400
                    text-2xl
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
                    Acesso restaurado
                  </h3>

                  <p
                    className="
                    text-gray-400
                    text-sm
                    "
                  >
                    Volte a gerenciar seus leads.
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

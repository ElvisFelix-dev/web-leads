import { useMemo, useState } from 'react';

import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import * as yup from 'yup';

import { toast } from 'react-toastify';

import {
  FaLock,
  FaShieldAlt,
  FaTrashAlt,
  FaDesktop,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaExclamationTriangle,
} from 'react-icons/fa';

import FormError from '../FormError';
import SaveButton from './SaveButton';

const schema = yup.object({
  currentPassword: yup.string().required('Informe sua senha atual'),

  newPassword: yup
    .string()
    .required('Informe a nova senha')
    .min(8, 'A senha deve possuir pelo menos 8 caracteres')
    .matches(/[A-Z]/, 'Inclua pelo menos uma letra maiúscula')
    .matches(/[a-z]/, 'Inclua pelo menos uma letra minúscula')
    .matches(/[0-9]/, 'Inclua pelo menos um número'),

  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'As senhas não coincidem')
    .required('Confirme sua nova senha'),
});

export default function ProfileSecurity({
  onChangePassword,
  onLogoutDevices,
  onDeleteAccount,
}) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [showCurrent, setShowCurrent] = useState(false);

  const [showNew, setShowNew] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);

  const password = watch('newPassword') || '';

  const strength = useMemo(() => {
    let score = 0;

    if (password.length >= 8) score++;

    if (/[A-Z]/.test(password)) score++;

    if (/[a-z]/.test(password)) score++;

    if (/[0-9]/.test(password)) score++;

    if (/[^A-Za-z0-9]/.test(password)) score++;

    return score;
  }, [password]);

  const strengthText = [
    'Muito Fraca',
    'Fraca',
    'Média',
    'Boa',
    'Forte',
    'Excelente',
  ][strength];

  const strengthColor = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-emerald-500',
  ][strength];

  async function handleSave(data) {
    try {
      await onChangePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      toast.success('Senha alterada com sucesso!');

      reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao alterar senha.');
    }
  }

  return (
    <section
      className="
overflow-hidden
rounded-3xl
border
border-gray-800
bg-gray-900
shadow-xl
"
    >
      <div
        className="
border-b
border-gray-800
px-8
py-6
"
      >
        <h2
          className="
flex
items-center
gap-3
text-2xl
font-bold
text-white
"
        >
          <FaShieldAlt className="text-blue-500" />
          Segurança da Conta
        </h2>

        <p className="mt-2 text-gray-400">
          Proteja sua conta alterando sua senha e gerenciando dispositivos
          conectados.
        </p>
      </div>

      <form onSubmit={handleSubmit(handleSave)} className="space-y-10 p-8">
        <div>
          <h3
            className="
mb-6
text-lg
font-semibold
text-white
"
          >
            Alterar Senha
          </h3>

          <div
            className="
grid
gap-6
lg:grid-cols-2
"
          >
            {/* Senha Atual */}

            <div className="relative">
              <label
                className="
block
mb-2
text-sm
font-medium
text-gray-300
"
              >
                Senha Atual
              </label>

              <input
                type={showCurrent ? 'text' : 'password'}
                {...register('currentPassword')}
                placeholder="Digite sua senha atual"
                className="
w-full
rounded-xl
border
border-gray-700
bg-gray-800
px-4
py-3
pr-12
text-white
outline-none
transition
focus:border-blue-500
"
              />

              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="
absolute
right-4
top-11
text-gray-400
hover:text-white
"
              >
                {showCurrent ? <FaEyeSlash /> : <FaEye />}
              </button>

              <FormError message={errors.currentPassword?.message} />
            </div>

            {/* Nova Senha */}

            <div className="relative">
              <label
                className="
block
mb-2
text-sm
font-medium
text-gray-300
"
              >
                Nova Senha
              </label>

              <input
                type={showNew ? 'text' : 'password'}
                {...register('newPassword')}
                placeholder="Digite sua nova senha"
                className="
w-full
rounded-xl
border
border-gray-700
bg-gray-800
px-4
py-3
pr-12
text-white
outline-none
transition
focus:border-blue-500
"
              />

              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="
absolute
right-4
top-11
text-gray-400
hover:text-white
"
              >
                {showNew ? <FaEyeSlash /> : <FaEye />}
              </button>

              <FormError message={errors.newPassword?.message} />
            </div>

            {/* Confirmar Senha */}

            <div className="relative lg:col-span-2">
              <label
                className="
block
mb-2
text-sm
font-medium
text-gray-300
"
              >
                Confirmar Nova Senha
              </label>

              <input
                type={showConfirm ? 'text' : 'password'}
                {...register('confirmPassword')}
                placeholder="Confirme sua nova senha"
                className="
w-full
rounded-xl
border
border-gray-700
bg-gray-800
px-4
py-3
pr-12
text-white
outline-none
transition
focus:border-blue-500
"
              />

              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="
absolute
right-4
top-11
text-gray-400
hover:text-white
"
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>

              <FormError message={errors.confirmPassword?.message} />
            </div>
          </div>

          {/* Barra de força */}

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">Força da senha</p>

              <span
                className="
text-sm
font-medium
text-white
"
              >
                {strengthText}
              </span>
            </div>

            <div
              className="
mt-3
h-2
overflow-hidden
rounded-full
bg-gray-800
"
            >
              <div
                className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
                style={{
                  width: `${(strength / 5) * 100}%`,
                }}
              />
            </div>

            <div
              className="
mt-5
grid
gap-3
md:grid-cols-2
"
            >
              <div className="flex items-center gap-2 text-sm">
                <FaCheckCircle
                  className={
                    password.length >= 8 ? 'text-green-500' : 'text-gray-600'
                  }
                />

                <span className="text-gray-300">Pelo menos 8 caracteres</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <FaCheckCircle
                  className={
                    /[A-Z]/.test(password) ? 'text-green-500' : 'text-gray-600'
                  }
                />

                <span className="text-gray-300">Uma letra maiúscula</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <FaCheckCircle
                  className={
                    /[a-z]/.test(password) ? 'text-green-500' : 'text-gray-600'
                  }
                />

                <span className="text-gray-300">Uma letra minúscula</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <FaCheckCircle
                  className={
                    /[0-9]/.test(password) ? 'text-green-500' : 'text-gray-600'
                  }
                />

                <span className="text-gray-300">Um número</span>
              </div>
            </div>
          </div>

          <div
            className="
mt-8
flex
justify-end
border-t
border-gray-800
pt-8
"
          >
            <SaveButton loading={isSubmitting} text="Atualizar Senha" />
          </div>
        </div>
      </form>
      {/* Sessões Ativas */}

      <div
        className="
border-t
border-gray-800
p-8
"
      >
        <h3
          className="
flex
items-center
gap-3
text-xl
font-semibold
text-white
"
        >
          <FaDesktop className="text-cyan-400" />
          Sessões Ativas
        </h3>

        <p className="mt-2 text-gray-400">
          Gerencie os dispositivos conectados à sua conta.
        </p>

        <div
          className="
mt-6
rounded-2xl
border
border-gray-800
bg-gray-800/40
p-6
"
        >
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-white">
                Windows • Google Chrome
              </h4>

              <p className="mt-2 text-sm text-gray-400">Sessão atual</p>

              <p className="mt-1 text-sm text-green-400">
                Último acesso: Agora
              </p>
            </div>

            <span
              className="
rounded-full
bg-green-500/20
px-3
py-1
text-xs
font-semibold
text-green-400
"
            >
              Ativo
            </span>
          </div>

          <button
            type="button"
            onClick={async () => {
              try {
                await onLogoutDevices();

                toast.success('Todas as outras sessões foram encerradas.');
              } catch (error) {
                toast.error(
                  error.response?.data?.message ||
                    'Não foi possível encerrar as sessões.',
                );
              }
            }}
            className="
mt-6
rounded-xl
bg-yellow-600
px-6
py-3
font-semibold
text-white
transition
hover:bg-yellow-500
hover:shadow-lg
hover:shadow-yellow-500/20
"
          >
            Encerrar Outras Sessões
          </button>
        </div>
      </div>

      {/* Zona de Perigo */}

      <div
        className="
border-t
border-red-900/30
bg-gradient-to-r
from-red-950/30
to-red-900/10
p-8
"
      >
        <h3
          className="
flex
items-center
gap-3
text-xl
font-bold
text-red-400
"
        >
          <FaTrashAlt />
          Zona de Perigo
        </h3>

        <div
          className="
mt-6
rounded-2xl
border
border-red-900/40
bg-red-950/20
p-6
"
        >
          <div className="flex items-start gap-4">
            <FaExclamationTriangle
              className="
mt-1
text-3xl
text-red-500
"
            />

            <div>
              <h4
                className="
font-semibold
text-white
"
              >
                Excluir permanentemente sua conta
              </h4>

              <p
                className="
mt-3
leading-relaxed
text-gray-300
"
              >
                Ao excluir sua conta, todos os seus dados serão removidos
                permanentemente, incluindo imóveis, leads, visitas, agenda,
                configurações, estatísticas e demais informações cadastradas.
                <br />
                <br />
                <strong className="text-red-400">
                  Esta ação é irreversível.
                </strong>
              </p>

              <button
                type="button"
                onClick={async () => {
                  const confirmDelete = window.confirm(
                    'Tem certeza que deseja excluir sua conta permanentemente?',
                  );

                  if (!confirmDelete) return;

                  try {
                    await onDeleteAccount();

                    toast.success('Conta excluída com sucesso.');
                  } catch (error) {
                    toast.error(
                      error.response?.data?.message || 'Erro ao excluir conta.',
                    );
                  }
                }}
                className="
mt-6
rounded-xl
bg-red-600
px-8
py-3
font-semibold
text-white
transition
hover:bg-red-500
hover:shadow-lg
hover:shadow-red-500/30
"
              >
                Excluir Minha Conta
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

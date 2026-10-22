import { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';
import {
  FaChartLine,
  FaUsers,
  FaBuilding,
  FaCheckCircle,
  FaArrowRight,
  FaShieldAlt,
  FaBolt,
  FaComments,
} from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import FormError from '../components/FormError';
import api from '../service/api';
import imgLogo from '../assets/logoImg.png';
import { UserContext } from '../context/UserContext';

const schema = yup.object({
  email: yup
    .string()
    .trim()
    .required('O e-mail é obrigatório')
    .email('Informe um e-mail válido'),
  password: yup
    .string()
    .required('A senha é obrigatória')
    .min(6, 'A senha deve ter pelo menos 6 caracteres'),
});

const highlights = [
  {
    icon: FaUsers,
    title: 'Gestão de leads',
    description: 'Organize contatos e acompanhe cada oportunidade.',
    tone: 'blue',
  },
  {
    icon: FaBuilding,
    title: 'Gestão de imóveis',
    description: 'Mantenha sua carteira imobiliária organizada.',
    tone: 'cyan',
  },
  {
    icon: FaChartLine,
    title: 'Visão estratégica',
    description: 'Acompanhe indicadores e evolução comercial.',
    tone: 'violet',
  },
];

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    mode: 'onBlur',
  });

  async function onSubmit(data) {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await api.post('/api/users/login', {
        email: data.email.trim(),
        password: data.password,
      });

      const userData = response.data.user || response.data;

      if (!userData?.token) {
        toast.error('Token não recebido pelo servidor');
        return;
      }

      setUser(userData);
      localStorage.setItem('userInfo', JSON.stringify(userData));
      toast.success(`Bem-vindo${userData.name ? `, ${userData.name}` : ''}!`);

      if (userData.role === 'admin' || userData.isAdmin === true) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate(redirect || '/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Erro ao realizar login:', error);
      toast.error(
        error.response?.data?.message ||
          'Não foi possível entrar. Verifique seus dados.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#050914] px-4 py-8 text-white sm:px-6 lg:px-8">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-32 top-[-8rem] h-96 w-96 rounded-full bg-blue-600/15 blur-[110px]" />
        <div className="absolute -right-24 bottom-[-8rem] h-[28rem] w-[28rem] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(96,165,250,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(96,165,250,0.035)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(to_bottom,black,transparent_90%)]" />
      </div>

      <section className="relative z-10 grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/[0.09] bg-[#080f1e]/90 shadow-[0_30px_120px_-35px_rgba(37,99,235,0.35)] backdrop-blur-2xl lg:min-h-[680px] lg:grid-cols-[0.92fr_1.08fr]">
        {/* Login form */}
        <div className="flex flex-col justify-center px-6 py-10 sm:px-10 sm:py-12 lg:px-14">
          <div className="mx-auto w-full max-w-md">
            <Link
              to="/"
              className="mb-9 inline-flex items-center gap-3 rounded-xl outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <img
                src={imgLogo}
                alt="CRM NODUS"
                className="h-12 w-12 rounded-2xl border border-white/10 bg-[#0c1730] object-contain p-1 shadow-lg shadow-blue-950/30"
              />
              <span className="text-sm font-semibold tracking-[0.24em] text-white">
                NODUS
              </span>
            </Link>

            <div className="mb-8">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/[0.08] px-3 py-1.5 text-xs font-medium text-blue-200">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.9)]" />
                Seu ambiente de trabalho
              </span>
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Bom ter você
                <span className="block bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                  de volta.
                </span>
              </h1>
              <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400 sm:text-base">
                Acesse sua conta e continue conectando leads, equipe e
                oportunidades em um só lugar.
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
              noValidate
            >
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  E-mail profissional
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@imobiliaria.com.br"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  {...register('email')}
                  className={`w-full rounded-xl border bg-[#0b1425] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:ring-4 focus:ring-blue-500/10 ${
                    errors.email
                      ? 'border-rose-400/70 focus:border-rose-400'
                      : 'border-white/10 focus:border-blue-400/70'
                  }`}
                />
                <div id="email-error">
                  <FormError message={errors.email?.message} />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-200"
                  >
                    Senha
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-blue-300 transition hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Digite sua senha"
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={
                      errors.password ? 'password-error' : undefined
                    }
                    {...register('password')}
                    className={`w-full rounded-xl border bg-[#0b1425] px-4 py-3.5 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:ring-4 focus:ring-blue-500/10 ${
                      errors.password
                        ? 'border-rose-400/70 focus:border-rose-400'
                        : 'border-white/10 focus:border-blue-400/70'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword ? 'Ocultar senha' : 'Mostrar senha'
                    }
                    aria-pressed={showPassword}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400"
                  >
                    {showPassword ? (
                      <AiFillEyeInvisible size={20} />
                    ) : (
                      <AiFillEye size={20} />
                    )}
                  </button>
                </div>
                <div id="password-error">
                  <FormError message={errors.password?.message} />
                </div>
              </div>

              <label className="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-slate-400">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-[#0b1425] text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                />
                Manter conectado neste dispositivo
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/40 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-900/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080f1e] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isSubmitting ? 'Entrando...' : 'Entrar na plataforma'}
                {!isSubmitting && (
                  <FaArrowRight className="transition-transform group-hover:translate-x-1" />
                )}
              </button>
            </form>

            <div className="mt-8 flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5">
              <FaShieldAlt className="mt-0.5 shrink-0 text-emerald-300" />
              <p className="text-xs leading-5 text-slate-400">
                Acesso protegido para sua operação. Nunca compartilhe sua senha
                com outras pessoas.
              </p>
            </div>

            <p className="mt-8 text-center text-xs text-slate-600">
              © {new Date().getFullYear()} CRM NODUS. Todos os direitos
              reservados.
            </p>
          </div>
        </div>

        {/* Brand panel */}
        <aside className="relative hidden overflow-hidden border-l border-white/[0.07] bg-[#070d1a] p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute right-[-5rem] top-[-4rem] h-80 w-80 rounded-full bg-blue-600/20 blur-[100px]" />
            <div className="absolute bottom-[-5rem] left-[-4rem] h-72 w-72 rounded-full bg-cyan-500/10 blur-[100px]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.13),transparent_48%)]" />
          </div>

          <div className="relative z-10">
            <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1.5 text-xs text-emerald-200">
              <FaCheckCircle />
              Gestão comercial conectada
            </div>
            <h2 className="max-w-lg text-4xl font-semibold leading-[1.12] tracking-tight text-white xl:text-5xl">
              Mais conexão.
              <span className="block bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-500 bg-clip-text pb-1 text-transparent">
                Mais clareza.
              </span>
              Mais oportunidades.
            </h2>
            <p className="mt-5 max-w-md text-base leading-7 text-slate-400">
              Tudo o que sua equipe precisa para acompanhar a jornada comercial
              imobiliária, do primeiro contato ao próximo passo.
            </p>
          </div>

          <div className="relative z-10 my-10 space-y-3">
            {highlights.map(({ icon: Icon, title, description, tone }) => {
              const toneClasses = {
                blue: 'bg-blue-400/10 text-blue-300 ring-blue-300/10',
                cyan: 'bg-cyan-400/10 text-cyan-300 ring-cyan-300/10',
                violet: 'bg-violet-400/10 text-violet-300 ring-violet-300/10',
              };

              return (
                <div
                  key={title}
                  className="group flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-blue-300/20 hover:bg-white/[0.055]"
                >
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${toneClasses[tone]}`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-white">
                      {title}
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      {description}
                    </p>
                  </div>
                  <FaArrowRight className="text-xs text-slate-600 transition group-hover:translate-x-1 group-hover:text-blue-300" />
                </div>
              );
            })}
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-white/[0.08] pt-5">
            <div>
              <p className="text-sm font-medium text-slate-200">CRM NODUS</p>
              <p className="mt-1 text-xs text-slate-500">
                Tudo conectado. Mais clareza para vender.
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-300/15 bg-blue-400/[0.08] text-blue-300">
              <FaBolt />
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

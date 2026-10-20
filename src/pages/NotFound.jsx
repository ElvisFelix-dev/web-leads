import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Home,
  SearchX,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

/**
 * Página 404 premium — Leads Na Mão.
 * Registre no App.jsx: <Route path="*" element={<NotFound />} />
 */
export default function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#050914] px-4 py-12 text-slate-100 sm:px-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute left-1/2 top-[-18rem] h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-blue-600/15 blur-[120px]" />
        <div className="absolute bottom-[-16rem] right-[-8rem] h-[32rem] w-[32rem] rounded-full bg-indigo-600/10 blur-[110px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.035)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]" />
      </div>

      <section className="w-full max-w-5xl">
        <header className="mb-10 flex items-center justify-center sm:mb-14">
          <Link
            to="/"
            className="group inline-flex items-center gap-3 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-400/25 bg-blue-500/10 shadow-[0_0_35px_rgba(59,130,246,0.14)] transition group-hover:border-blue-300/50">
              <span className="text-lg font-black tracking-tight text-blue-300">
                L
              </span>
            </span>
            <span className="text-left">
              <span className="block text-sm font-extrabold tracking-[0.18em] text-white">
                LEADS <span className="text-blue-400">NA MÃO</span>
              </span>
              <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.22em] text-slate-500">
                Gestão inteligente de leads
              </span>
            </span>
          </Link>
        </header>

        <div className="relative overflow-hidden rounded-[2rem] border border-slate-800/90 bg-slate-900/65 shadow-[0_30px_100px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
          <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />
          <div className="grid items-center gap-10 px-6 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:px-16 lg:py-16">
            <div className="relative flex min-h-[250px] flex-col items-center justify-center lg:min-h-[330px]">
              <div className="absolute h-56 w-56 rounded-full border border-blue-400/10 sm:h-72 sm:w-72" />
              <div className="absolute h-44 w-44 rounded-full border border-indigo-400/10 sm:h-56 sm:w-56" />
              <div className="absolute h-32 w-32 rounded-full bg-blue-500/10 blur-2xl" />
              <div className="relative">
                <div className="select-none bg-gradient-to-b from-white via-slate-200 to-slate-500 bg-clip-text text-[7.5rem] font-black leading-none tracking-[-0.09em] text-transparent drop-shadow-[0_12px_35px_rgba(37,99,235,0.18)] sm:text-[10rem]">
                  404
                </div>
                <div className="absolute -right-3 top-2 flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-300/25 bg-slate-900 text-blue-300 shadow-xl sm:-right-5 sm:h-12 sm:w-12">
                  <SearchX size={23} strokeWidth={1.8} />
                </div>
              </div>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/[0.07] px-3.5 py-2 text-xs font-semibold text-blue-200">
                <Sparkles size={14} />
                Página fora do radar
              </div>
            </div>

            <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
              <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-blue-300">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.8)]" />
                Erro 404
              </div>
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                Ops! Esse caminho
                <span className="block bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
                  não leva a lugar nenhum.
                </span>
              </h1>
              <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-slate-400 sm:text-base lg:mx-0">
                A página que você procura pode ter sido movida, removida ou o
                endereço pode estar incorreto. Vamos ajudar você a voltar para o
                caminho certo.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <Link
                  to="/"
                  className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/40 transition hover:-translate-y-0.5 hover:from-blue-500 hover:to-indigo-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                >
                  <Home size={17} />
                  Voltar ao início
                  <ArrowRight
                    size={16}
                    className="transition group-hover:translate-x-0.5"
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/70 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                >
                  <ArrowLeft size={17} />
                  Voltar à página anterior
                </button>
              </div>

              <div className="mt-8 flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-left">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/[0.07] text-emerald-300">
                  <ShieldCheck size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Seus dados continuam seguros
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Este erro afeta apenas o endereço acessado. Você pode
                    retornar ao sistema e continuar seu trabalho.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <footer className="flex flex-col items-center justify-between gap-2 border-t border-slate-800/80 px-6 py-4 text-center text-[11px] text-slate-600 sm:flex-row sm:px-10">
            <span>© {new Date().getFullYear()} Leads Na Mão</span>
            <span>Conectando oportunidades a novos negócios.</span>
          </footer>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Precisa de ajuda? Entre em contato com o administrador da sua
          plataforma.
        </p>
      </section>
    </main>
  );
}

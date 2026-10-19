import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  ArrowLeft,
  Award,
  CalendarCheck,
  Check,
  ChevronRight,
  Clock3,
  DollarSign,
  ExternalLink,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  RefreshCw,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
  Handshake,
  Percent,
  Building2,
  BriefcaseBusiness,
  Copy,
} from 'lucide-react';

import { toast } from 'react-toastify';

import BrokerPerformanceChart from '../components/brokerDashboard/BrokerPerformanceChart';
import BrokerLatestLeads from '../components/brokerDashboard/BrokerLatestLeads';
import BrokerStats from '../components/brokerDashboard/BrokerStats';

import api from '../service/api';

export default function BrokerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [broker, setBroker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  const fetchBroker = useCallback(
    async ({ silent = false } = {}) => {
      if (!id) {
        setBroker(null);
        setLoading(false);
        return;
      }

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const { data } = await api.get(`/api/users/brokers/${id}`);

        setBroker(data?.data || data?.broker || null);
        setAvatarFailed(false);
      } catch (error) {
        console.error('Erro ao carregar corretor:', error);

        if (!silent) {
          toast.error(
            error.response?.data?.message ||
              'Não foi possível carregar os dados do corretor.',
          );
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id],
  );

  useEffect(() => {
    fetchBroker();

    return () => {
      // Evita efeitos de requisições antigas ao trocar de corretor.
    };
  }, [fetchBroker]);

  const profile = broker?.profile || {};

  const stats = broker?.stats || {};
  const settings = broker?.settings || {};
  const performance = broker?.performance || {};
  const socials = broker?.socials || {};

  const brokerId = broker?.profile?.id || broker?._id || id;

  const name = profile.name || broker?.name || profile.fullName || 'Corretor';

  const phone = useMemo(
    () =>
      profile.phone ||
      broker?.phone ||
      profile.whatsapp ||
      broker?.whatsapp ||
      '',
    [profile.phone, broker?.phone, profile.whatsapp, broker?.whatsapp],
  );

  const email = profile.email || broker?.email || '';

  const avatar = profile.avatar || profile.avatarUrl || '';

  const initials = getInitials(name);

  const isAvailable = broker?.availability === 'Disponível';

  const hasWhatsApp = normalizePhone(phone).length >= 10;

  const handleWhatsApp = () => {
    const digits = normalizePhone(phone);

    if (digits.length < 10) {
      toast.warning('Este corretor ainda não possui um telefone válido.');
      return;
    }

    const internationalNumber = digits.startsWith('55')
      ? digits
      : `55${digits}`;

    const message = encodeURIComponent(
      `Olá, ${name}! Estou entrando em contato pelo Leads Na Mão CRM.`,
    );

    window.open(
      `https://wa.me/${internationalNumber}?text=${message}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const handleInternalChat = () => {
    // A rota /chat existe no CRM.
    // A seleção automática da conversa pode ser integrada posteriormente.
    navigate('/chat', {
      state: {
        brokerId: String(brokerId),
        brokerName: name,
        source: 'broker-details',
      },
    });
  };

  const handleCopy = async (value, label) => {
    if (!value) {
      toast.info(`${label} não informado.`);
      return;
    }

    try {
      await navigator.clipboard.writeText(String(value));
      toast.success(`${label} copiado!`);
    } catch {
      toast.error(
        'Não foi possível copiar. Verifique a permissão do navegador.',
      );
    }
  };

  if (loading) {
    return <BrokerDetailsSkeleton />;
  }

  if (!broker) {
    return (
      <div className="min-h-screen bg-[#080d18] px-5 py-10 text-white">
        <div className="mx-auto flex min-h-[65vh] max-w-xl flex-col items-center justify-center text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/[0.08] bg-white/[0.03] text-slate-500">
            <Users size={34} />
          </div>

          <h1 className="text-xl font-semibold text-white">
            Corretor não encontrado
          </h1>

          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
            Não foi possível localizar o perfil solicitado. Ele pode ter sido
            removido ou você pode não ter acesso a estes dados.
          </p>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08]"
          >
            <ArrowLeft size={16} />
            Voltar
          </button>

          <button
            type="button"
            onClick={() => fetchBroker()}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm text-blue-400 transition hover:text-blue-300"
          >
            <RefreshCw size={15} />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#080d18] px-4 py-5 text-slate-100 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-[1600px]">
        {/* NAVEGAÇÃO */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="group inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] transition group-hover:border-blue-500/30 group-hover:bg-blue-500/10">
                <ArrowLeft size={16} />
              </span>
              Voltar
            </button>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <span>Equipe</span>
              <ChevronRight size={13} />
              <span className="text-slate-300">Perfil do corretor</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fetchBroker({ silent: true })}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-white/15 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>

        {/* PERFIL PRINCIPAL */}
        <section className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0d1423] shadow-2xl shadow-black/20">
          {/* CAPA */}
          <div className="relative h-44 overflow-hidden sm:h-56 lg:h-64">
            {profile.coverImage ? (
              <img
                src={profile.coverImage}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-indigo-950 to-[#101a30]" />
            )}

            <div className="absolute inset-0 bg-gradient-to-r from-[#080d18]/85 via-[#080d18]/35 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d1423] via-transparent to-black/10" />

            <div className="absolute right-6 top-6 hidden items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-2 text-xs font-medium text-white/80 backdrop-blur-md sm:flex">
              <ShieldCheck size={15} className="text-blue-300" />
              Perfil profissional
            </div>
          </div>

          {/* IDENTIDADE */}
          <div className="relative px-5 pb-6 sm:px-8 sm:pb-8 lg:px-10">
            <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:gap-5">
                <div className="relative h-28 w-28 shrink-0 rounded-[28px] border-[5px] border-[#0d1423] bg-[#17243b] shadow-xl sm:h-32 sm:w-32">
                  {avatar && !avatarFailed ? (
                    <img
                      src={avatar}
                      alt={name}
                      onError={() => setAvatarFailed(true)}
                      className="h-full w-full rounded-[22px] object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-[22px] bg-gradient-to-br from-blue-600 to-indigo-700 text-3xl font-bold text-white">
                      {initials}
                    </div>
                  )}

                  <span
                    className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-[3px] border-[#0d1423] ${
                      isAvailable ? 'bg-emerald-400' : 'bg-slate-500'
                    }`}
                    title={isAvailable ? 'Disponível' : 'Indisponível'}
                  />
                </div>

                <div className="min-w-0 flex-1 pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="break-words text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-[34px]">
                      {name}
                    </h1>

                    {profile.creci && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-400/15 bg-blue-400/[0.08] px-2.5 py-1 text-[11px] font-semibold text-blue-300">
                        <Award size={13} />
                        CRECI {profile.creci}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-400">
                    <BriefcaseBusiness size={15} className="text-slate-500" />
                    {profile.position || 'Corretor imobiliário'}

                    {profile.company && (
                      <>
                        <span className="text-slate-700">/</span>
                        <Building2 size={14} />
                        {profile.company}
                      </>
                    )}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Status online={isAvailable} />

                    <Badge>
                      <ShieldCheck size={12} />
                      Equipe comercial
                    </Badge>

                    <Badge>
                      <Award size={12} />
                      Nível {performance.level || 1}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* AÇÕES DE CONTATO */}
              <div className="flex flex-col gap-2 sm:flex-row lg:pb-1">
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  disabled={!hasWhatsApp}
                  title={
                    hasWhatsApp
                      ? 'Abrir conversa no WhatsApp'
                      : 'Telefone não cadastrado'
                  }
                  className="group inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-950/25 transition hover:bg-emerald-400 hover:shadow-emerald-900/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-emerald-500"
                >
                  <MessageCircle size={18} />
                  WhatsApp
                  <ExternalLink
                    size={14}
                    className="opacity-70 transition group-hover:translate-x-0.5"
                  />
                </button>

                <button
                  type="button"
                  onClick={handleInternalChat}
                  className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-xl border border-blue-400/20 bg-blue-500/[0.10] px-5 py-3 text-sm font-semibold text-blue-200 transition hover:border-blue-400/40 hover:bg-blue-500/[0.18]"
                >
                  <MessageSquare size={18} />
                  Chat interno
                  <ChevronRight size={15} className="opacity-70" />
                </button>
              </div>
            </div>

            {/* CONTATO RÁPIDO */}
            <div className="mt-7 grid gap-3 border-t border-white/[0.07] pt-5 sm:grid-cols-2 xl:grid-cols-3">
              <ContactItem
                icon={<Mail size={17} />}
                label="E-mail profissional"
                value={email}
                onCopy={() => handleCopy(email, 'E-mail')}
              />

              <ContactItem
                icon={<Phone size={17} />}
                label="Telefone / WhatsApp"
                value={phone}
                onCopy={() => handleCopy(phone, 'Telefone')}
              />

              <ContactItem
                icon={<MapPin size={17} />}
                label="Regiões de atendimento"
                value={
                  Array.isArray(profile.regions) && profile.regions.length
                    ? profile.regions.join(', ')
                    : 'Regiões não cadastradas'
                }
              />
            </div>
          </div>
        </section>

        {/* INDICADORES */}
        <section className="mt-7">
          <SectionHeading
            eyebrow="Visão geral"
            title="Indicadores de desempenho"
            description="Acompanhe os principais resultados deste corretor."
          />

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              icon={<Users size={19} />}
              title="Leads recebidos"
              value={formatNumber(stats.leads ?? 0)}
              description="Volume de leads registrados"
              accent="blue"
            />

            <Metric
              icon={<CalendarCheck size={19} />}
              title="Visitas realizadas"
              value={formatNumber(stats.visits ?? 0)}
              description="Atividade comercial"
              accent="violet"
            />

            <Metric
              icon={<Handshake size={19} />}
              title="Negócios fechados"
              value={formatNumber(stats.deals ?? 0)}
              description="Vendas concluídas registradas no CRM"
              accent="emerald"
            />

            <Metric
              icon={<DollarSign size={19} />}
              title="Receita"
              value={formatMoney(stats.revenue ?? 0)}
              description="Valor total das vendas concluídas"
              accent="amber"
            />
          </div>
        </section>

        {/* GRÁFICO */}
        <section className="mt-8">
          <SectionHeading
            eyebrow="Análise comercial"
            title="Performance do corretor"
            description="Visualize a evolução dos resultados e os indicadores disponíveis."
          />

          <div className="premium-panel mt-4 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d1423] p-3 sm:p-5">
            <BrokerPerformanceChart brokerId={brokerId} />
          </div>
        </section>

        {/* LEADS RECENTES */}
        <section className="mt-8">
          <SectionHeading
            eyebrow="Relacionamento"
            title="Últimos leads"
            description="Consulte os leads associados a este corretor."
          />

          <div className="premium-panel mt-4 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d1423] p-3 sm:p-5">
            <BrokerLatestLeads brokerId={brokerId} />
          </div>
        </section>

        {/* INFORMAÇÕES COMPLEMENTARES */}
        <section className="mt-8">
          <SectionHeading
            eyebrow="Dados do perfil"
            title="Informações complementares"
            description="Dados comerciais, metas e canais profissionais."
          />

          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            <Section
              title="Performance comercial"
              subtitle="Metas e indicadores"
              icon={<TrendingUp size={18} />}
            >
              <Info
                icon={<Users size={17} />}
                label="Leads recebidos"
                value={formatNumber(stats.leads ?? 0)}
              />

              <Info
                icon={<CalendarCheck size={17} />}
                label="Visitas realizadas"
                value={formatNumber(stats.visits ?? 0)}
              />

              <Info
                icon={<Handshake size={17} />}
                label="Negócios fechados"
                value={formatNumber(stats.deals ?? 0)}
              />

              <Info
                icon={<DollarSign size={17} />}
                label="Receita gerada"
                value={formatCurrency(stats.revenue ?? 0)}
              />

              <Info
                icon={<Percent size={17} />}
                label="Taxa de conversão"
                value={`${formatNumber(stats.conversionRate ?? 0)}%`}
              />

              <div className="space-y-2 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Target size={17} />
                    <span className="text-xs">Meta mensal de negócios</span>
                  </div>
                  <span className="text-xs font-semibold text-white">
                    {formatNumber(stats.dealsThisMonth ?? 0)} /{' '}
                    {formatNumber(
                      stats.monthlyGoal ?? settings.monthlyGoal ?? 0,
                    )}
                  </span>
                </div>

                <div
                  className="h-2 overflow-hidden rounded-full bg-slate-800"
                  role="progressbar"
                  aria-label="Progresso da meta mensal de negócios"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.min(
                    100,
                    Math.max(0, Number(stats.goalProgress) || 0),
                  )}
                >
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(0, Number(stats.goalProgress) || 0))}%`,
                    }}
                  />
                </div>

                <p className="text-right text-xs text-slate-500">
                  {formatNumber(stats.goalProgress ?? 0)}% da meta atingida
                </p>
              </div>

              <Info
                icon={<Award size={17} />}
                label="Nível profissional"
                value={`Nível ${performance.level || 1}`}
              />

              <Info
                icon={<Clock3 size={17} />}
                label="Disponibilidade"
                value={isAvailable ? 'Disponível' : 'Indisponível'}
              />
            </Section>

            <Section
              title="Dados profissionais"
              subtitle="Identificação e atuação"
              icon={<BriefcaseBusiness size={18} />}
            >
              <Info icon={<UserIcon />} label="Nome completo" value={name} />

              <Info
                icon={<Building2 size={17} />}
                label="Imobiliária"
                value={profile.company || 'Não informada'}
              />

              <Info
                icon={<Award size={17} />}
                label="Registro CRECI"
                value={profile.creci || 'Não informado'}
              />

              <Info
                icon={<MapPin size={17} />}
                label="Regiões"
                value={
                  Array.isArray(profile.regions) && profile.regions.length
                    ? profile.regions.join(', ')
                    : 'Não informadas'
                }
              />
            </Section>

            <Section
              title="Redes sociais"
              subtitle="Canais públicos do corretor"
              icon={<ExternalLink size={18} />}
            >
              <SocialItem
                icon={<Instagram size={18} />}
                label="Instagram"
                value={socials.instagram}
                accent="pink"
              />

              <SocialItem
                icon={<Linkedin size={18} />}
                label="LinkedIn"
                value={socials.linkedin}
                accent="blue"
              />

              {!socials.instagram && !socials.linkedin && (
                <div className="rounded-xl border border-dashed border-white/[0.09] px-4 py-6 text-center">
                  <ExternalLink size={22} className="mx-auto text-slate-600" />
                  <p className="mt-3 text-sm text-slate-400">
                    Nenhuma rede social cadastrada.
                  </p>
                </div>
              )}
            </Section>
          </div>
        </section>

        {/* RODAPÉ */}
        <footer className="mt-8 flex flex-col justify-between gap-3 border-t border-white/[0.06] py-5 text-xs text-slate-600 sm:flex-row sm:items-center">
          <p>Leads Na Mão CRM · Gestão comercial imobiliária</p>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 self-start text-slate-400 transition hover:text-white sm:self-auto"
          >
            <ArrowLeft size={14} />
            Voltar para a tela anterior
          </button>
        </footer>
      </div>
    </main>
  );
}

/* =====================================================
   COMPONENTES AUXILIARES
===================================================== */

function BrokerDetailsSkeleton() {
  return (
    <main className="min-h-screen bg-[#080d18] px-4 py-6 text-white sm:px-6">
      <div className="mx-auto max-w-[1600px] animate-pulse">
        <div className="mb-6 h-9 w-28 rounded-xl bg-white/[0.05]" />

        <div className="overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#0d1423]">
          <div className="h-48 bg-gradient-to-r from-blue-950/60 to-indigo-950/30 sm:h-56" />

          <div className="p-6 sm:p-8">
            <div className="-mt-16 flex flex-col gap-5 sm:flex-row sm:items-end">
              <div className="h-28 w-28 shrink-0 rounded-[28px] border-4 border-[#0d1423] bg-slate-800" />

              <div className="flex-1 space-y-3 pb-2">
                <div className="h-7 w-56 max-w-full rounded-lg bg-white/[0.07]" />
                <div className="h-4 w-40 rounded bg-white/[0.05]" />
                <div className="h-7 w-48 rounded-full bg-white/[0.05]" />
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-20 rounded-xl border border-white/[0.04] bg-white/[0.02]"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-36 rounded-2xl border border-white/[0.05] bg-[#0d1423]"
            />
          ))}
        </div>

        <div className="mt-6 h-64 rounded-2xl border border-white/[0.05] bg-[#0d1423]" />
      </div>
    </main>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-400">
        {eyebrow}
      </p>

      <div className="mt-1.5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
          {title}
        </h2>

        <p className="max-w-xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function Metric({ icon, title, value, description, accent = 'blue' }) {
  const accents = {
    blue: {
      icon: 'border-blue-400/15 bg-blue-400/[0.09] text-blue-300',
      glow: 'from-blue-500/[0.08]',
    },
    violet: {
      icon: 'border-violet-400/15 bg-violet-400/[0.09] text-violet-300',
      glow: 'from-violet-500/[0.08]',
    },
    emerald: {
      icon: 'border-emerald-400/15 bg-emerald-400/[0.09] text-emerald-300',
      glow: 'from-emerald-500/[0.08]',
    },
    amber: {
      icon: 'border-amber-400/15 bg-amber-400/[0.09] text-amber-300',
      glow: 'from-amber-500/[0.08]',
    },
  };

  const style = accents[accent] || accents.blue;

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br ${style.glow} to-[#0d1423] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-white/[0.13] hover:shadow-xl hover:shadow-black/20 sm:p-6`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>

          <p className="mt-4 break-words text-2xl font-bold tracking-tight text-white sm:text-3xl">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${style.icon}`}
        >
          {icon}
        </div>
      </div>

      <div className="mt-5 border-t border-white/[0.06] pt-3">
        <p className="text-xs leading-5 text-slate-500">{description}</p>
      </div>
    </article>
  );
}

function Section({ title, subtitle, icon, children }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#0d1423] p-5 transition hover:border-white/[0.10] sm:p-6">
      <div className="mb-5 flex items-start gap-3 border-b border-white/[0.06] pb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-400/[0.07] text-blue-300">
          {icon}
        </div>

        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>

      <div className="space-y-4">{children}</div>
    </section>
  );
}

function ContactItem({ icon, label, value, onCopy }) {
  return (
    <div className="group flex min-w-0 items-center gap-3 rounded-xl border border-white/[0.055] bg-white/[0.018] p-3.5 transition hover:border-white/[0.10] hover:bg-white/[0.035]">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/10 bg-blue-400/[0.06] text-blue-300">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-slate-500">{label}</p>

        <p className="mt-1 break-words text-sm font-medium text-slate-200">
          {value || 'Não informado'}
        </p>
      </div>

      {onCopy && value && (
        <button
          type="button"
          onClick={onCopy}
          title={`Copiar ${label.toLowerCase()}`}
          aria-label={`Copiar ${label.toLowerCase()}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 opacity-100 transition hover:bg-white/[0.07] hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
        >
          <Copy size={14} />
        </button>
      )}
    </div>
  );
}

function Info({ icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="mt-0.5 shrink-0 text-slate-500">{icon}</span>

      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500">{label}</p>

        <p className="mt-1 break-words text-sm font-medium leading-6 text-slate-200">
          {value || 'Não informado'}
        </p>
      </div>
    </div>
  );
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.035] px-2.5 py-1.5 text-[11px] font-medium text-slate-300">
      {children}
    </span>
  );
}

function Status({ online }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
        online
          ? 'border-emerald-400/15 bg-emerald-400/[0.08] text-emerald-300'
          : 'border-slate-400/10 bg-slate-400/[0.06] text-slate-400'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          online ? 'bg-emerald-400' : 'bg-slate-500'
        }`}
      />

      {online ? 'Disponível' : 'Indisponível'}
    </span>
  );
}

function SocialItem({ icon, label, value, accent }) {
  const href = normalizeSocialUrl(value);

  const colors = {
    pink: 'border-pink-400/10 bg-pink-400/[0.06] text-pink-300',
    blue: 'border-blue-400/10 bg-blue-400/[0.06] text-blue-300',
  };

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.015] p-3">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
          colors[accent] || colors.blue
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 break-all text-sm font-medium text-slate-200">
          {value || 'Não informado'}
        </p>
      </div>

      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Abrir ${label}`}
          title={`Abrir ${label}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/[0.07] hover:text-white"
        >
          <ExternalLink size={15} />
        </a>
      )}
    </div>
  );
}

function UserIcon() {
  return <Users size={17} />;
}

/* =====================================================
   HELPERS
===================================================== */

function normalizePhone(value) {
  let digits = String(value || '').replace(/\D/g, '');

  // DDI do Brasil para telefones nacionais sem código do país.
  if (digits.length === 10 || digits.length === 11) {
    digits = `55${digits}`;
  }

  return digits;
}

function normalizeSocialUrl(value) {
  if (!value || typeof value !== 'string') {
    return '';
  }

  const cleanValue = value.trim();

  if (!cleanValue) {
    return '';
  }

  const url = /^https?:\/\//i.test(cleanValue)
    ? cleanValue
    : `https://${cleanValue}`;

  try {
    const parsed = new URL(url);

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }

    return parsed.href;
  } catch {
    return '';
  }
}

function getInitials(value) {
  return String(value || 'Corretor')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function formatNumber(value) {
  const number = Number(value);

  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 2,
  }).format(Number.isFinite(number) ? number : 0);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function formatMoney(value) {
  const number = Number(value);

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(Number.isFinite(number) ? number : 0);
}

import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  ArrowLeft,
  Award,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Globe2,
  Home,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
  Trophy,
  Users,
  TrendingUp,
  Building2,
} from 'lucide-react';

import api from '../../service/api';

import HotsiteNavbar from '../../components/hotsite/HotsiteNavbar';
import HotsiteFooter from '../../components/hotsite/HotsiteFooter';

const formatNumber = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return '0';
  }

  return new Intl.NumberFormat('pt-BR').format(number);
};

const formatCurrency = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 'R$ 0';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(number);
};

const getInitials = (name = '') => {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'CO'
  );
};

const getWhatsAppUrl = (value = '') => {
  const number = String(value).replace(/\D/g, '');

  if (!number) {
    return '';
  }

  const finalNumber = number.startsWith('55') ? number : `55${number}`;

  return `https://wa.me/${finalNumber}`;
};

const getPhone = (broker) => {
  return broker?.phone || broker?.socials?.whatsapp || '';
};

const getCompanyName = (broker) => {
  return broker?.company || 'Consultoria Imobiliária';
};

const getYearsExperience = (broker) => {
  return Number(broker?.experienceYears) || 0;
};

const getLocation = (broker) => {
  if (broker?.address) {
    const parts = [
      broker.address.district,
      broker.address.city,
      broker.address.state,
    ].filter(Boolean);

    if (parts.length) {
      return parts.join(' • ');
    }
  }

  const parts = [broker?.city, broker?.state].filter(Boolean);

  return parts.join(' • ') || 'São Paulo • SP';
};

const getWebsiteUrl = (website = '') => {
  if (!website) {
    return '';
  }

  if (/^https?:\/\//i.test(website)) {
    return website;
  }

  return `https://${website}`;
};

const getSocialUrl = (type, value = '') => {
  if (!value) {
    return '';
  }

  const cleanValue = String(value).trim();

  if (/^https?:\/\//i.test(cleanValue)) {
    return cleanValue;
  }

  const username = cleanValue.replace(/^@/, '');

  const urls = {
    instagram: `https://instagram.com/${username}`,
    linkedin: `https://linkedin.com/in/${username}`,
    facebook: `https://facebook.com/${username}`,
    youtube: `https://youtube.com/@${username}`,
    tiktok: `https://tiktok.com/@${username}`,
  };

  return urls[type] || '';
};

const normalizeLanguages = (languages) => {
  if (!Array.isArray(languages)) {
    return [];
  }

  return languages
    .map((language) => {
      if (typeof language === 'string') {
        return {
          name: language,
          level: '',
        };
      }

      if (language && typeof language === 'object') {
        return {
          name: language.name || language.language || '',
          level: language.level || '',
        };
      }

      return null;
    })
    .filter((language) => language?.name);
};

const getWorkingHours = (broker) => {
  const publicHours = broker?.workingHours;

  if (publicHours?.start || publicHours?.end) {
    return {
      start: publicHours.start || '09:00',
      end: publicHours.end || '18:00',
    };
  }

  const internalHours = broker?.brokerSettings?.workHours;

  return {
    start: internalHours?.start || '09:00',
    end: internalHours?.end || '18:00',
  };
};

const getAvailability = (broker) => {
  return broker?.availability || 'Disponível';
};

export default function BrokerAbout() {
  const { brokerSlug: brokerSlugParam, slug: slugParam } = useParams();

  const brokerSlug = brokerSlugParam || slugParam || '';

  const [broker, setBroker] = useState(null);

  const [stats, setStats] = useState({
    leads: 0,
    visits: 0,
    deals: 0,
    revenue: 0,
    conversion: 0,
  });

  const [performance, setPerformance] = useState({
    points: 0,
    level: 1,
    rank: 0,
    badges: [],
    achievements: [],
  });

  const [properties, setProperties] = useState([]);

  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState('');

  // =========================================================
  // BUSCAR DADOS DO HOTSITE
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const fetchBroker = async () => {
      if (!brokerSlug) {
        setError('Corretor não informado.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const response = await api.get(
          `/api/brokers/hotsite/${encodeURIComponent(brokerSlug)}`,
        );

        const data = response?.data?.data || response?.data || {};

        const brokerData = data?.broker || null;

        const propertiesData = Array.isArray(data?.properties)
          ? data.properties
          : [];

        if (!brokerData) {
          throw new Error('Corretor não encontrado.');
        }

        if (!mounted) {
          return;
        }

        setBroker(brokerData);
        setProperties(propertiesData);
      } catch (err) {
        console.error('❌ Erro ao buscar dados do corretor:', err);

        if (!mounted) {
          return;
        }

        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Não foi possível carregar o perfil do corretor.',
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchBroker();

    return () => {
      mounted = false;
    };
  }, [brokerSlug]);

  // =========================================================
  // BUSCAR STATS SEPARADAMENTE
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const fetchStats = async () => {
      if (!brokerSlug) {
        setStatsLoading(false);
        return;
      }

      try {
        setStatsLoading(true);

        const response = await api.get(
          `/api/brokers/hotsite/${encodeURIComponent(brokerSlug)}/stats`,
        );

        const data = response?.data?.data || response?.data || {};

        const statsData = data?.stats || {};

        const performanceData = data?.performance || {};

        if (!mounted) {
          return;
        }

        setStats({
          leads: Number(statsData?.leads) || 0,
          visits: Number(statsData?.visits ?? statsData?.visitas) || 0,
          deals: Number(statsData?.deals ?? statsData?.vendas) || 0,
          revenue: Number(statsData?.revenue ?? statsData?.valorVendas) || 0,
          conversion: Number(statsData?.conversion) || 0,
        });

        setPerformance({
          points: Number(performanceData?.points) || 0,
          level: Number(performanceData?.level) || 1,
          rank:
            Number(performanceData?.rank ?? performanceData?.position ?? 0) ||
            0,
          badges: Array.isArray(performanceData?.badges)
            ? performanceData.badges
            : [],
          achievements: Array.isArray(performanceData?.achievements)
            ? performanceData.achievements
            : [],
        });
      } catch (err) {
        console.error('⚠️ Erro ao buscar stats públicos:', err);

        // O Hotsite continua funcionando mesmo se a rota de Stats
        // ainda não estiver disponível.
        if (!mounted) {
          return;
        }

        setStats({
          leads: 0,
          visits: 0,
          deals: 0,
          revenue: 0,
          conversion: 0,
        });

        setPerformance({
          points: 0,
          level: 1,
          rank: 0,
          badges: [],
          achievements: [],
        });
      } finally {
        if (mounted) {
          setStatsLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      mounted = false;
    };
  }, [brokerSlug]);

  // =========================================================
  // DADOS DERIVADOS
  // =========================================================

  const normalizedBroker = useMemo(() => {
    if (!broker) {
      return null;
    }

    return {
      ...broker,
      phone: getPhone(broker),
      company: getCompanyName(broker),
      location: getLocation(broker),
      experienceYears: getYearsExperience(broker),
      availability: getAvailability(broker),
      languages: normalizeLanguages(broker.languages),
      workingHours: getWorkingHours(broker),
    };
  }, [broker]);

  const whatsappUrl = useMemo(() => {
    return getWhatsAppUrl(normalizedBroker?.phone);
  }, [normalizedBroker]);

  const websiteUrl = useMemo(() => {
    return getWebsiteUrl(normalizedBroker?.website);
  }, [normalizedBroker]);

  const instagramUrl = useMemo(() => {
    return getSocialUrl(
      'instagram',
      normalizedBroker?.socials?.instagram || normalizedBroker?.instagram,
    );
  }, [normalizedBroker]);

  const linkedinUrl = useMemo(() => {
    return getSocialUrl(
      'linkedin',
      normalizedBroker?.socials?.linkedin || normalizedBroker?.linkedin,
    );
  }, [normalizedBroker]);

  const facebookUrl = useMemo(() => {
    return getSocialUrl(
      'facebook',
      normalizedBroker?.socials?.facebook || normalizedBroker?.facebook,
    );
  }, [normalizedBroker]);

  const youtubeUrl = useMemo(() => {
    return getSocialUrl('youtube', normalizedBroker?.socials?.youtube);
  }, [normalizedBroker]);

  const tiktokUrl = useMemo(() => {
    return getSocialUrl('tiktok', normalizedBroker?.socials?.tiktok);
  }, [normalizedBroker]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />

            <p className="text-sm text-white/60">Carregando perfil...</p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERRO
  // =========================================================

  if (error || !normalizedBroker) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6">
          <div className="w-full rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
              <ShieldCheck size={30} />
            </div>

            <h1 className="text-2xl font-semibold">Perfil não encontrado</h1>

            <p className="mt-3 text-sm text-white/60">
              {error || 'Não foi possível carregar este perfil.'}
            </p>

            <Link
              to={`/broker/${brokerSlug || ''}`}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              <ArrowLeft size={16} />
              Voltar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const coverImage = normalizedBroker.coverImage;

  const avatar = normalizedBroker.avatar;

  const specialties = Array.isArray(normalizedBroker.specialties)
    ? normalizedBroker.specialties
    : [];

  const regions = Array.isArray(normalizedBroker.regions)
    ? normalizedBroker.regions
    : [];

  const highlights = Array.isArray(normalizedBroker.highlights)
    ? normalizedBroker.highlights
    : [];

  const languages = normalizedBroker.languages || [];

  const badges = Array.isArray(performance.badges) ? performance.badges : [];

  const achievements = Array.isArray(performance.achievements)
    ? performance.achievements
    : [];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <HotsiteNavbar broker={normalizedBroker} brokerSlug={brokerSlug} />

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          {coverImage ? (
            <img
              src={coverImage}
              alt={normalizedBroker.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950" />
          )}

          <div className="absolute inset-0 bg-slate-950/70" />

          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/40" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_380px]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {normalizedBroker.availability}
              </div>

              <div className="mb-5 flex flex-wrap items-center gap-3">
                {normalizedBroker.creci && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/70">
                    <ShieldCheck size={14} />
                    CRECI {normalizedBroker.creci}
                  </span>
                )}

                {normalizedBroker.creciActive && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
                    <CheckCircle2 size={14} />
                    CRECI ativo
                  </span>
                )}
              </div>

              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                {normalizedBroker.name}
              </h1>

              <p className="mt-5 text-xl text-white/70">
                {normalizedBroker.position}
              </p>

              {normalizedBroker.company && (
                <p className="mt-2 text-sm text-white/45">
                  {normalizedBroker.company}
                </p>
              )}

              {normalizedBroker.signature && (
                <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
                  {normalizedBroker.signature}
                </p>
              )}

              <div className="mt-8 flex flex-wrap gap-3">
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
                  >
                    <MessageCircle size={18} />
                    Falar no WhatsApp
                  </a>
                )}

                <Link
                  to={`/broker/${brokerSlug}/imoveis`}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  <Home size={18} />
                  Ver imóveis
                </Link>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <div className="absolute -inset-5 rounded-[2rem] bg-indigo-500/20 blur-2xl" />

                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-2 shadow-2xl backdrop-blur-xl">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={normalizedBroker.name}
                      className="h-80 w-72 rounded-[1.5rem] object-cover sm:h-96 sm:w-80"
                    />
                  ) : (
                    <div className="flex h-80 w-72 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-indigo-500 to-purple-600 text-6xl font-semibold sm:h-96 sm:w-80">
                      {getInitials(normalizedBroker.name)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          QUICK STATS
      ===================================================== */}

      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto grid max-w-7xl gap-px px-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          <div className="border-white/10 py-8 sm:border-r lg:border-r">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
                <CalendarDays size={21} />
              </div>

              <div>
                <p className="text-2xl font-semibold">
                  {normalizedBroker.experienceYears}+
                </p>

                <p className="text-xs text-white/45">anos de experiência</p>
              </div>
            </div>
          </div>

          <div className="border-white/10 py-8 sm:border-r lg:border-r">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300">
                <Trophy size={21} />
              </div>

              <div>
                <p className="text-2xl font-semibold">
                  {statsLoading ? '...' : formatNumber(performance.points)}
                </p>

                <p className="text-xs text-white/45">pontos de performance</p>
              </div>
            </div>
          </div>

          <div className="border-white/10 py-8 sm:border-r lg:border-r">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
                <CalendarDays size={21} />
              </div>

              <div>
                <p className="text-2xl font-semibold">
                  {statsLoading ? '...' : formatNumber(stats.visits)}
                </p>

                <p className="text-xs text-white/45">visitas realizadas</p>
              </div>
            </div>
          </div>

          <div className="py-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
                <TrendingUp size={21} />
              </div>

              <div>
                <p className="text-2xl font-semibold">
                  {statsLoading ? '...' : formatNumber(stats.deals)}
                </p>

                <p className="text-xs text-white/45">negócios realizados</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTEÚDO
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="space-y-10">
            {/* SOBRE */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 sm:p-9">
              <div className="mb-7 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
                  <Users size={21} />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-indigo-300">
                    Sobre
                  </p>

                  <h2 className="mt-1 text-2xl font-semibold">
                    Conheça meu trabalho
                  </h2>
                </div>
              </div>

              <p className="whitespace-pre-line text-base leading-8 text-white/65">
                {normalizedBroker.bio ||
                  'Atendimento personalizado para ajudar você a encontrar as melhores oportunidades no mercado imobiliário.'}
              </p>
            </section>

            {/* PERFORMANCE */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 sm:p-9">
              <div className="mb-8 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300">
                    <Trophy size={21} />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-300">
                      Performance
                    </p>

                    <h2 className="mt-1 text-2xl font-semibold">
                      Resultados profissionais
                    </h2>
                  </div>
                </div>

                {performance.rank > 0 && (
                  <div className="hidden items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-sm text-amber-300 sm:flex">
                    <Award size={16} />#{performance.rank}
                  </div>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <Trophy className="mb-4 text-amber-300" size={20} />

                  <p className="text-2xl font-semibold">
                    {statsLoading ? '...' : formatNumber(performance.points)}
                  </p>

                  <p className="mt-1 text-xs text-white/45">Pontos</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <Star className="mb-4 text-indigo-300" size={20} />

                  <p className="text-2xl font-semibold">
                    {statsLoading ? '...' : performance.level}
                  </p>

                  <p className="mt-1 text-xs text-white/45">Nível</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <CalendarDays className="mb-4 text-cyan-300" size={20} />

                  <p className="text-2xl font-semibold">
                    {statsLoading ? '...' : formatNumber(stats.visits)}
                  </p>

                  <p className="mt-1 text-xs text-white/45">Visitas</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <TrendingUp className="mb-4 text-emerald-300" size={20} />

                  <p className="text-2xl font-semibold">
                    {statsLoading ? '...' : `${stats.conversion}%`}
                  </p>

                  <p className="mt-1 text-xs text-white/45">Conversão</p>
                </div>
              </div>

              {stats.revenue > 0 && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-center gap-3">
                    <Building2 size={20} className="text-emerald-300" />

                    <div>
                      <p className="text-xs text-white/45">Volume de vendas</p>

                      <p className="mt-1 text-xl font-semibold">
                        {formatCurrency(stats.revenue)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {(badges.length > 0 || achievements.length > 0) && (
                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  {badges.length > 0 && (
                    <div>
                      <p className="mb-3 text-sm font-semibold text-white/80">
                        Conquistas
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {badges.map((badge, index) => (
                          <span
                            key={`${badge}-${index}`}
                            className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs text-amber-300"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {achievements.length > 0 && (
                    <div>
                      <p className="mb-3 text-sm font-semibold text-white/80">
                        Destaques
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {achievements.map((achievement, index) => (
                          <span
                            key={`${achievement}-${index}`}
                            className="rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5 text-xs text-indigo-300"
                          >
                            {achievement}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* ESPECIALIDADES */}
            {specialties.length > 0 && (
              <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 sm:p-9">
                <div className="mb-7 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
                    <BriefcaseBusiness size={21} />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-indigo-300">
                      Especialidades
                    </p>

                    <h2 className="mt-1 text-2xl font-semibold">
                      Áreas de atuação
                    </h2>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/75"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* REGIÕES */}
            {regions.length > 0 && (
              <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 sm:p-9">
                <div className="mb-7 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
                    <MapPin size={21} />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-300">
                      Regiões
                    </p>

                    <h2 className="mt-1 text-2xl font-semibold">Onde atuo</h2>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {regions.map((region) => (
                    <span
                      key={region}
                      className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/75"
                    >
                      {region}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* IDIOMAS */}
            {languages.length > 0 && (
              <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 sm:p-9">
                <div className="mb-7 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-300">
                    <Globe2 size={21} />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-purple-300">
                      Idiomas
                    </p>

                    <h2 className="mt-1 text-2xl font-semibold">Atendimento</h2>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {languages.map((language, index) => (
                    <div
                      key={`${language.name}-${index}`}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                    >
                      <span className="text-sm text-white/80">
                        {language.name}
                      </span>

                      {language.level && (
                        <span className="text-xs text-white/40">
                          {language.level}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* DESTAQUES */}
            {highlights.length > 0 && (
              <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-7 sm:p-9">
                <div className="mb-7 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300">
                    <Star size={21} />
                  </div>

                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-300">
                      Destaques
                    </p>

                    <h2 className="mt-1 text-2xl font-semibold">
                      Diferenciais
                    </h2>
                  </div>
                </div>

                <div className="space-y-3">
                  {highlights.map((highlight, index) => (
                    <div
                      key={`${highlight}-${index}`}
                      className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <CheckCircle2
                        size={18}
                        className="mt-0.5 shrink-0 text-emerald-300"
                      />

                      <span className="text-sm leading-6 text-white/70">
                        {highlight}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ===================================================
              SIDEBAR
          =================================================== */}

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* CONTATO */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-lg font-semibold">Fale comigo</h3>

              <p className="mt-2 text-sm leading-6 text-white/45">
                Entre em contato para encontrar o imóvel ideal para você.
              </p>

              <div className="mt-6 space-y-3">
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
                  >
                    <MessageCircle size={18} />
                    WhatsApp
                  </a>
                )}

                {normalizedBroker.phone && (
                  <a
                    href={`tel:${normalizedBroker.phone}`}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70 transition hover:bg-white/[0.06]"
                  >
                    <Phone size={18} />
                    {normalizedBroker.phone}
                  </a>
                )}

                {normalizedBroker.email && (
                  <a
                    href={`mailto:${normalizedBroker.email}`}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/70 transition hover:bg-white/[0.06]"
                  >
                    <Mail size={18} />
                    <span className="truncate">{normalizedBroker.email}</span>
                  </a>
                )}
              </div>
            </section>

            {/* INFORMAÇÕES PROFISSIONAIS */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-lg font-semibold">
                Informações profissionais
              </h3>

              <div className="mt-5 space-y-4">
                <div className="flex gap-3">
                  <BriefcaseBusiness
                    size={18}
                    className="mt-0.5 shrink-0 text-indigo-300"
                  />

                  <div>
                    <p className="text-xs text-white/40">Cargo</p>

                    <p className="mt-1 text-sm text-white/75">
                      {normalizedBroker.position || 'Corretor de Imóveis'}
                    </p>
                  </div>
                </div>

                {normalizedBroker.company && (
                  <div className="flex gap-3">
                    <Building2
                      size={18}
                      className="mt-0.5 shrink-0 text-indigo-300"
                    />

                    <div>
                      <p className="text-xs text-white/40">Empresa</p>

                      <p className="mt-1 text-sm text-white/75">
                        {normalizedBroker.company}
                      </p>
                    </div>
                  </div>
                )}

                {normalizedBroker.creci && (
                  <div className="flex gap-3">
                    <ShieldCheck
                      size={18}
                      className="mt-0.5 shrink-0 text-emerald-300"
                    />

                    <div>
                      <p className="text-xs text-white/40">CRECI</p>

                      <p className="mt-1 text-sm text-white/75">
                        {normalizedBroker.creci}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* HORÁRIOS */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-lg font-semibold">Atendimento</h3>

              <div className="mt-5 flex items-start gap-3">
                <Clock3 size={19} className="mt-0.5 text-cyan-300" />

                <div>
                  <p className="text-xs text-white/40">
                    Horário de atendimento
                  </p>

                  <p className="mt-1 text-sm text-white/75">
                    {normalizedBroker.workingHours.start} às{' '}
                    {normalizedBroker.workingHours.end}
                  </p>
                </div>
              </div>
            </section>

            {/* LOCALIZAÇÃO */}
            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h3 className="text-lg font-semibold">Localização</h3>

              <div className="mt-5 flex items-start gap-3">
                <MapPin size={19} className="mt-0.5 text-indigo-300" />

                <p className="text-sm leading-6 text-white/65">
                  {normalizedBroker.location}
                </p>
              </div>
            </section>

            {/* WEBSITE */}
            {websiteUrl && (
              <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <Globe2 size={19} className="text-indigo-300" />

                    <div>
                      <p className="text-xs text-white/40">Website</p>

                      <p className="mt-1 text-sm text-white/75">
                        {normalizedBroker.website}
                      </p>
                    </div>
                  </div>

                  <ExternalLink size={16} className="text-white/30" />
                </a>
              </section>
            )}

            {/* REDES SOCIAIS */}
            {(instagramUrl ||
              linkedinUrl ||
              facebookUrl ||
              youtubeUrl ||
              tiktokUrl) && (
              <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="text-lg font-semibold">Redes sociais</h3>

                <div className="mt-5 flex flex-wrap gap-3">
                  {instagramUrl && (
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/60 transition hover:bg-white/[0.06] hover:text-white"
                      aria-label="Instagram"
                    >
                      <Instagram size={19} />
                    </a>
                  )}

                  {linkedinUrl && (
                    <a
                      href={linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/60 transition hover:bg-white/[0.06] hover:text-white"
                      aria-label="LinkedIn"
                    >
                      <Linkedin size={19} />
                    </a>
                  )}

                  {facebookUrl && (
                    <a
                      href={facebookUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/60 transition hover:bg-white/[0.06] hover:text-white"
                      aria-label="Facebook"
                    >
                      <span className="text-sm font-bold">f</span>
                    </a>
                  )}

                  {youtubeUrl && (
                    <a
                      href={youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/60 transition hover:bg-white/[0.06] hover:text-white"
                      aria-label="YouTube"
                    >
                      <span className="text-xs font-bold">YT</span>
                    </a>
                  )}

                  {tiktokUrl && (
                    <a
                      href={tiktokUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/60 transition hover:bg-white/[0.06] hover:text-white"
                      aria-label="TikTok"
                    >
                      <span className="text-xs font-bold">TK</span>
                    </a>
                  )}
                </div>
              </section>
            )}
          </aside>
        </div>
      </main>

      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="border-t border-white/10 bg-gradient-to-b from-indigo-950/30 to-slate-950">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center lg:px-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300">
            <Home size={25} />
          </div>

          <h2 className="mt-6 text-3xl font-semibold sm:text-4xl">
            Encontre seu próximo imóvel
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/50">
            Veja os imóveis disponíveis e encontre uma oportunidade que combine
            com o que você procura.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to={`/broker/${brokerSlug}/imoveis`}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              <Home size={18} />
              Ver imóveis
            </Link>

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <MessageCircle size={18} />
                Falar com o corretor
              </a>
            )}
          </div>
        </div>
      </section>

      <HotsiteFooter broker={normalizedBroker} brokerSlug={brokerSlug} />
    </div>
  );
}

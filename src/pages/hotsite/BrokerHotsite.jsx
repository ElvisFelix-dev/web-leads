import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import {
  ArrowRight,
  BedDouble,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ExternalLink,
  Facebook,
  Home,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  Sparkles,
  Star,
  Users,
  X,
  Youtube,
} from 'lucide-react';

import api from '../../service/api';

export default function BrokerHotsite() {
  // ==========================================================
  // ROUTE PARAM
  // ==========================================================

  /*
   * Rota:
   *
   * /broker/:slug
   *
   * Exemplo:
   *
   * /broker/elvis-felix
   */

  const { slug: brokerSlug } = useParams();

  // ==========================================================
  // STATES
  // ==========================================================

  const [broker, setBroker] = useState(null);
  const [properties, setProperties] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [purposeFilter, setPurposeFilter] = useState('todos');
  const [propertyFilter, setPropertyFilter] = useState('todos');

  // ==========================================================
  // BUSCAR HOTSITE
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const fetchHotsite = async () => {
      if (!brokerSlug) {
        console.warn('BrokerHotsite: parâmetro "slug" não encontrado na URL.');

        if (mounted) {
          setError('Corretor não informado.');
          setLoading(false);
        }

        return;
      }

      try {
        setLoading(true);
        setError('');

        console.log('========================================');
        console.log('BROKER HOTSITE');
        console.log('========================================');
        console.log('Broker slug:', brokerSlug);
        console.log('Endpoint:', `/api/brokers/hotsite/${brokerSlug}`);
        console.log('========================================');

        const response = await api.get(
          `/api/brokers/hotsite/${encodeURIComponent(brokerSlug)}`,
        );

        console.log('RESPOSTA HOTSITE:', response?.data);

        /*
         * Esperamos:
         *
         * {
         *   success: true,
         *   data: {
         *     broker: {...},
         *     properties: [...]
         *   }
         * }
         */

        const data = response?.data?.data;

        if (!data?.broker) {
          throw new Error('Corretor não encontrado.');
        }

        if (!mounted) {
          return;
        }

        setBroker(data.broker);

        setProperties(Array.isArray(data.properties) ? data.properties : []);
      } catch (err) {
        console.error('========================================');
        console.error('ERRO HOTSITE');
        console.error('========================================');

        console.error('Erro:', err);
        console.error('Resposta API:', err?.response?.data);

        if (!mounted) {
          return;
        }

        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Não foi possível carregar o hotsite.',
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchHotsite();

    return () => {
      mounted = false;
    };
  }, [brokerSlug]);

  // ==========================================================
  // HELPERS
  // ==========================================================

  const formatCurrency = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === '' ||
      Number(value) <= 0
    ) {
      return null;
    }

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(Number(value));
  };

  const formatNumber = (value) => {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return '';
    }

    return new Intl.NumberFormat('pt-BR').format(number);
  };

  const normalizeArray = (value) => {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter(Boolean);
  };

  // ==========================================================
  // IMAGEM DO IMÓVEL
  // ==========================================================

  const getPropertyImage = (property) => {
    if (property?.coverImage) {
      return property.coverImage;
    }

    if (Array.isArray(property?.images) && property.images.length > 0) {
      const cover = property.images.find(
        (image) => image?.isCover && image?.url,
      );

      if (cover?.url) {
        return cover.url;
      }

      const first = [...property.images]
        .sort((a, b) => Number(a?.order || 0) - Number(b?.order || 0))
        .find((image) => image?.url);

      if (first?.url) {
        return first.url;
      }
    }

    if (Array.isArray(property?.image) && property.image.length > 0) {
      return property.image[0];
    }

    return property?.mainImage || null;
  };

  // ==========================================================
  // LOCALIZAÇÃO
  // ==========================================================

  const getPropertyLocation = (property) => {
    const location = property?.location;

    if (!location) {
      return '';
    }

    return [location.district, location.city, location.state]
      .filter(Boolean)
      .join(', ');
  };

  // ==========================================================
  // PREÇO
  // ==========================================================

  const getPropertyPrice = (property) => {
    const purpose = property?.purpose;

    if (purpose === 'aluguel') {
      return formatCurrency(property?.prices?.rentPrice);
    }

    if (purpose === 'venda_aluguel') {
      const sale = formatCurrency(property?.prices?.salePrice);

      const rent = formatCurrency(property?.prices?.rentPrice);

      if (sale && rent) {
        return `${sale} / ${rent}`;
      }

      return sale || rent;
    }

    return formatCurrency(property?.prices?.salePrice);
  };

  // ==========================================================
  // FINALIDADE
  // ==========================================================

  const getPurposeLabel = (purpose) => {
    const labels = {
      venda: 'Venda',
      aluguel: 'Aluguel',
      venda_aluguel: 'Venda e Aluguel',
    };

    return labels[purpose] || purpose || 'Imóvel';
  };

  // ==========================================================
  // TIPO
  // ==========================================================

  const getTypeLabel = (type) => {
    if (!type) {
      return 'Imóvel';
    }

    return String(type)
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  // ==========================================================
  // WHATSAPP
  // ==========================================================

  const getWhatsAppUrl = () => {
    const phone = broker?.phone || broker?.socials?.whatsapp;

    if (!phone) {
      return null;
    }

    let cleanPhone = String(phone).replace(/\D/g, '');

    if (!cleanPhone) {
      return null;
    }

    if (!cleanPhone.startsWith('55')) {
      cleanPhone = `55${cleanPhone}`;
    }

    return `https://wa.me/${cleanPhone}`;
  };

  // ==========================================================
  // TELEFONE
  // ==========================================================

  const getPhoneUrl = () => {
    if (!broker?.phone) {
      return null;
    }

    const phone = String(broker.phone).replace(/\D/g, '');

    if (!phone) {
      return null;
    }

    const cleanPhone = phone.startsWith('55') ? phone : `55${phone}`;

    return `tel:+${cleanPhone}`;
  };

  // ==========================================================
  // E-MAIL
  // ==========================================================

  const getMailUrl = () => {
    if (!broker?.email) {
      return null;
    }

    return `mailto:${broker.email}`;
  };

  // ==========================================================
  // FILTROS
  // ==========================================================

  const filteredProperties = useMemo(() => {
    const term = search.trim().toLowerCase();

    return properties.filter((property) => {
      const searchableContent = [
        property?.name,
        property?.code,
        property?.type,
        property?.category,
        property?.location?.district,
        property?.location?.city,
        property?.location?.state,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = !term || searchableContent.includes(term);

      const matchesPurpose =
        purposeFilter === 'todos' || property?.purpose === purposeFilter;

      const matchesType =
        propertyFilter === 'todos' || property?.type === propertyFilter;

      return matchesSearch && matchesPurpose && matchesType;
    });
  }, [properties, search, purposeFilter, propertyFilter]);

  // ==========================================================
  // TIPOS
  // ==========================================================

  const propertyTypes = useMemo(() => {
    return [
      ...new Set(properties.map((property) => property?.type).filter(Boolean)),
    ];
  }, [properties]);

  // ==========================================================
  // FILTROS ATIVOS
  // ==========================================================

  const hasFilters =
    Boolean(search.trim()) ||
    purposeFilter !== 'todos' ||
    propertyFilter !== 'todos';

  // ==========================================================
  // LIMPAR FILTROS
  // ==========================================================

  const clearFilters = () => {
    setSearch('');
    setPurposeFilter('todos');
    setPropertyFilter('todos');
  };

  // ==========================================================
  // SOCIAL
  // ==========================================================

  const socials = broker?.socials || {};

  const socialLinks = [
    {
      key: 'instagram',
      label: 'Instagram',
      value: socials.instagram || broker?.instagram,
      icon: Instagram,
    },
    {
      key: 'facebook',
      label: 'Facebook',
      value: socials.facebook || broker?.facebook,
      icon: Facebook,
    },
    {
      key: 'linkedin',
      label: 'LinkedIn',
      value: socials.linkedin || broker?.linkedin,
      icon: Linkedin,
    },
    {
      key: 'youtube',
      label: 'YouTube',
      value: socials.youtube || broker?.youtube,
      icon: Youtube,
    },
  ].filter((item) => item.value);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-6">
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-white" />

            <p className="text-sm font-medium text-white/70">
              Carregando seu hotsite...
            </p>

            <p className="mt-2 text-xs text-white/40">
              Estamos preparando sua página.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERRO
  // ==========================================================

  if (error || !broker) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 text-white">
        <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center">
          <div className="w-full rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
              <X size={28} />
            </div>

            <h1 className="text-2xl font-bold">Hotsite não encontrado</h1>

            <p className="mt-3 text-sm leading-6 text-white/60">
              {error || 'Não foi possível encontrar o corretor informado.'}
            </p>

            <Link
              to="/home"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white/90"
            >
              Voltar para o início
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================
  // CONTATOS
  // ==========================================================

  const whatsappUrl = getWhatsAppUrl();
  const phoneUrl = getPhoneUrl();
  const mailUrl = getMailUrl();

  // ==========================================================
  // EXPERIÊNCIA
  // ==========================================================

  const experience =
    Number(broker?.experienceYears) > 0
      ? `${formatNumber(broker.experienceYears)} ${
          Number(broker.experienceYears) === 1 ? 'ano' : 'anos'
        }`
      : null;

  // ==========================================================
  // LOCALIZAÇÃO DO CORRETOR
  // ==========================================================

  const location = [broker?.city, broker?.state].filter(Boolean).join(' / ');

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            {broker.avatar ? (
              <img
                src={broker.avatar}
                alt={broker.name}
                className="h-11 w-11 rounded-full object-cover ring-2 ring-slate-100"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                {broker.name?.charAt(0)?.toUpperCase()}
              </div>
            )}

            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">
                {broker.name}
              </p>

              <p className="truncate text-xs text-slate-500">
                {broker.position || 'Corretor de Imóveis'}
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <a
              href="#sobre"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Sobre
            </a>

            <a
              href="#imoveis"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Imóveis
            </a>

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </header>

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.20),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.14),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-xs font-semibold text-white/80">
                <Sparkles size={14} />
                Atendimento imobiliário personalizado
              </div>

              <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                Encontre o imóvel ideal com{' '}
                <span className="text-white/50">
                  {broker.name?.split(' ')[0]}
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-white/60 sm:text-lg">
                {broker.bio ||
                  'Conte com atendimento personalizado para encontrar as melhores oportunidades imobiliárias para você.'}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#imoveis"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-slate-900 shadow-xl transition hover:-translate-y-0.5 hover:bg-slate-100"
                >
                  Ver imóveis
                  <ArrowRight size={17} />
                </a>

                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.06] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    <MessageCircle size={17} />
                    Falar comigo
                  </a>
                )}
              </div>

              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 text-sm text-white/50">
                {location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    {location}
                  </div>
                )}

                {broker.creci && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    CRECI {broker.creci}
                  </div>
                )}

                {experience && (
                  <div className="flex items-center gap-2">
                    <Clock3 size={16} />
                    {experience} de experiência
                  </div>
                )}
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="absolute -inset-6 rounded-[3rem] bg-white/[0.03] blur-3xl" />

              <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-3 shadow-2xl">
                <div className="aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-slate-900">
                  {broker.avatar ? (
                    <img
                      src={broker.avatar}
                      alt={broker.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Users size={90} className="text-white/20" />
                    </div>
                  )}
                </div>

                <div className="absolute bottom-7 left-7 right-7 rounded-2xl border border-white/10 bg-slate-950/80 p-5 backdrop-blur-xl">
                  <p className="text-xs font-medium uppercase tracking-wider text-white/40">
                    Atendimento
                  </p>

                  <p className="mt-1 text-lg font-bold text-white">
                    {broker.name}
                  </p>

                  <p className="mt-1 text-sm text-white/50">
                    {broker.position || 'Corretor de Imóveis'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          STATS
      ====================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-slate-200 sm:grid-cols-4">
          <div className="px-5 py-7 text-center sm:px-8">
            <p className="text-3xl font-black text-slate-900">
              {properties.length}
            </p>

            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Imóveis
            </p>
          </div>

          <div className="px-5 py-7 text-center sm:px-8">
            <p className="text-3xl font-black text-slate-900">
              {experience || '—'}
            </p>

            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Experiência
            </p>
          </div>

          <div className="px-5 py-7 text-center sm:px-8">
            <p className="text-3xl font-black text-slate-900">
              {normalizeArray(broker.specialties).length || '—'}
            </p>

            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Especialidades
            </p>
          </div>

          <div className="px-5 py-7 text-center sm:px-8">
            <p className="text-3xl font-black text-slate-900">
              {normalizeArray(broker.regions).length || '—'}
            </p>

            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Regiões
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          SOBRE
      ====================================================== */}

      <section id="sobre" className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white">
                <Users size={13} />
                Sobre o corretor
              </div>

              <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Atendimento próximo e especializado
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-500">
                Conheça um pouco mais sobre {broker.name} e sua atuação no
                mercado imobiliário.
              </p>

              <div className="mt-8 flex items-center gap-4">
                {broker.avatar ? (
                  <img
                    src={broker.avatar}
                    alt={broker.name}
                    className="h-16 w-16 rounded-2xl object-cover shadow-lg"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-xl font-bold text-white">
                    {broker.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}

                <div>
                  <p className="font-bold text-slate-900">{broker.name}</p>

                  <p className="mt-1 text-sm text-slate-500">
                    {broker.position || 'Corretor de Imóveis'}
                  </p>

                  {broker.company && (
                    <p className="mt-1 text-xs text-slate-400">
                      {broker.company}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-9">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                    <Sparkles size={18} />
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">
                    Minha trajetória
                  </h3>
                </div>

                <p className="mt-5 whitespace-pre-line text-sm leading-7 text-slate-600">
                  {broker.bio ||
                    `${broker.name} atua como ${
                      broker.position || 'Corretor de Imóveis'
                    }, oferecendo atendimento personalizado para clientes que buscam comprar ou alugar um imóvel.`}
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                    <Clock3 size={19} />
                  </div>

                  <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Experiência
                  </p>

                  <p className="mt-2 text-xl font-black text-slate-900">
                    {experience || 'Em crescimento'}
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                    <CheckCircle2 size={19} />
                  </div>

                  <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    CRECI
                  </p>

                  <p className="mt-2 text-xl font-black text-slate-900">
                    {broker.creci || 'Não informado'}
                  </p>
                </div>
              </div>

              {normalizeArray(broker.specialties).length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                  <div className="flex items-center gap-3">
                    <Star size={18} />

                    <h3 className="font-bold text-slate-900">Especialidades</h3>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {normalizeArray(broker.specialties).map(
                      (specialty, index) => (
                        <span
                          key={`${specialty}-${index}`}
                          className="rounded-full bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700"
                        >
                          {specialty}
                        </span>
                      ),
                    )}
                  </div>
                </div>
              )}

              {normalizeArray(broker.regions).length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                  <div className="flex items-center gap-3">
                    <MapPin size={18} />

                    <h3 className="font-bold text-slate-900">
                      Regiões atendidas
                    </h3>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {normalizeArray(broker.regions).map((region, index) => (
                      <span
                        key={`${region}-${index}`}
                        className="rounded-full border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600"
                      >
                        {region}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {normalizeArray(broker.languages).length > 0 && (
                <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                  <div className="flex items-center gap-3">
                    <MessageCircle size={18} />

                    <h3 className="font-bold text-slate-900">Idiomas</h3>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {normalizeArray(broker.languages).map((language, index) => (
                      <span
                        key={`${language}-${index}`}
                        className="rounded-full bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700"
                      >
                        {language}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTATO
      ====================================================== */}

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] bg-slate-950 p-7 shadow-2xl sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-white/50">
                  <MessageCircle size={16} />
                  Atendimento personalizado
                </div>

                <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">
                  Vamos encontrar seu próximo imóvel?
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
                  Entre em contato com {broker.name} e receba ajuda para
                  encontrar uma oportunidade que combine com o que você procura.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
                  >
                    <MessageCircle size={17} />
                    WhatsApp
                  </a>
                )}

                {phoneUrl && (
                  <a
                    href={phoneUrl}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
                  >
                    <Phone size={17} />
                    Ligar
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          IMÓVEIS
      ====================================================== */}

      <section id="imoveis" className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-bold text-white">
                <Building2 size={13} />
                Portfólio
              </div>

              <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Imóveis disponíveis
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Confira as oportunidades disponíveis no portfólio de{' '}
                {broker.name}.
              </p>
            </div>

            <div className="text-sm font-semibold text-slate-400">
              {filteredProperties.length}{' '}
              {filteredProperties.length === 1
                ? 'imóvel encontrado'
                : 'imóveis encontrados'}
            </div>
          </div>

          {/* FILTROS */}

          <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_auto]">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar imóvel, cidade, bairro..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                />
              </div>

              <select
                value={purposeFilter}
                onChange={(event) => setPurposeFilter(event.target.value)}
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none focus:border-slate-400"
              >
                <option value="todos">Finalidade</option>

                <option value="venda">Venda</option>

                <option value="aluguel">Aluguel</option>

                <option value="venda_aluguel">Venda e aluguel</option>
              </select>

              <select
                value={propertyFilter}
                onChange={(event) => setPropertyFilter(event.target.value)}
                className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none focus:border-slate-400"
              >
                <option value="todos">Tipo de imóvel</option>

                {propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {getTypeLabel(type)}
                  </option>
                ))}
              </select>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                >
                  <X size={16} />
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* CARDS */}

          {filteredProperties.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProperties.map((property) => {
                const image = getPropertyImage(property);

                const price = getPropertyPrice(property);

                const propertyLocation = getPropertyLocation(property);

                /*
                 * IMPORTANTE
                 *
                 * O slug do corretor vem da rota:
                 *
                 * /broker/:slug
                 *
                 * O slug do imóvel vem do objeto:
                 *
                 * property.slug
                 *
                 * Resultado:
                 *
                 * /broker/elvis-felix/property/apartamento-na-zn
                 */

                const propertySlug = property?.slug || property?._id;

                const propertyUrl = `/broker/${encodeURIComponent(
                  brokerSlug,
                )}/property/${encodeURIComponent(propertySlug)}`;

                return (
                  <Link
                    key={property._id}
                    to={propertyUrl}
                    className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl"
                  >
                    {/* IMAGEM */}

                    <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                      {image ? (
                        <img
                          src={image}
                          alt={property.name || 'Imóvel'}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-300">
                          <Home size={48} />
                        </div>
                      )}

                      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
                        <span className="rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold text-slate-800 shadow-lg">
                          {getPurposeLabel(property.purpose)}
                        </span>

                        {property.featured && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/90 px-3 py-1.5 text-[11px] font-bold text-white shadow-lg">
                            <Star size={12} />
                            Destaque
                          </span>
                        )}
                      </div>

                      {property.exclusive && (
                        <div className="absolute bottom-4 left-4 rounded-full bg-slate-950/90 px-3 py-1.5 text-[11px] font-bold text-white">
                          Exclusivo
                        </div>
                      )}
                    </div>

                    {/* CONTEÚDO */}

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            {getTypeLabel(property.type)}
                          </p>

                          <h3 className="mt-2 line-clamp-2 text-lg font-black leading-6 text-slate-900">
                            {property.name}
                          </h3>
                        </div>

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-slate-900 group-hover:text-white">
                          <ChevronRight size={17} />
                        </div>
                      </div>

                      {/* LOCALIZAÇÃO */}

                      {propertyLocation && (
                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                          <MapPin size={14} className="shrink-0" />

                          <span className="truncate">{propertyLocation}</span>
                        </div>
                      )}

                      {/* CARACTERÍSTICAS */}

                      <div className="mt-5 grid grid-cols-3 gap-2 border-y border-slate-100 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <BedDouble size={15} />

                          <span>{formatNumber(property.bedrooms || 0)}</span>

                          <span className="hidden sm:inline">quartos</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Building2 size={15} />

                          <span>{formatNumber(property.bathrooms || 0)}</span>

                          <span className="hidden sm:inline">banheiros</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Home size={15} />

                          <span>
                            {formatNumber(property?.dimensions?.totalArea || 0)}
                          </span>

                          <span className="hidden sm:inline">m²</span>
                        </div>
                      </div>

                      {/* PREÇO */}

                      <div className="mt-5 flex items-end justify-between gap-4">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            A partir de
                          </p>

                          <p className="mt-1 text-xl font-black text-slate-900">
                            {price || 'Consulte'}
                          </p>
                        </div>

                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 transition group-hover:text-slate-900">
                          Ver imóvel
                          <ArrowRight size={14} />
                        </span>
                      </div>

                      {/* CÓDIGO */}

                      {property.code && (
                        <p className="mt-4 text-[11px] font-medium text-slate-400">
                          Código {property.code}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Search size={24} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                Nenhum imóvel encontrado
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Não encontramos imóveis com os filtros selecionados.
              </p>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          CONTATO FINAL
      ====================================================== */}

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Entre em contato
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
                Fale diretamente com {broker.name}
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
                Tire suas dúvidas, agende uma visita ou encontre outras
                oportunidades disponíveis.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  <MessageCircle size={17} />
                  WhatsApp
                </a>
              )}

              {phoneUrl && (
                <a
                  href={phoneUrl}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <Phone size={17} />
                  Telefone
                </a>
              )}

              {mailUrl && (
                <a
                  href={mailUrl}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <Mail size={17} />
                  E-mail
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-[1fr_auto]">
            <div>
              <div className="flex items-center gap-3">
                {broker.avatar ? (
                  <img
                    src={broker.avatar}
                    alt={broker.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 font-bold">
                    {broker.name?.charAt(0)?.toUpperCase()}
                  </div>
                )}

                <div>
                  <p className="font-bold">{broker.name}</p>

                  <p className="mt-1 text-xs text-white/40">
                    {broker.position || 'Corretor de Imóveis'}
                  </p>
                </div>
              </div>

              <p className="mt-5 max-w-lg text-sm leading-6 text-white/40">
                Atendimento imobiliário personalizado para ajudar você a
                encontrar as melhores oportunidades.
              </p>
            </div>

            <div className="flex flex-col gap-4 md:items-end">
              <div className="flex flex-wrap gap-2">
                {socialLinks.map((social) => {
                  const Icon = social.icon;

                  return (
                    <a
                      key={social.key}
                      href={social.value}
                      target="_blank"
                      rel="noreferrer"
                      title={social.label}
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/60 transition hover:bg-white/10 hover:text-white"
                    >
                      <Icon size={17} />
                    </a>
                  );
                })}

                {broker.website && (
                  <a
                    href={broker.website}
                    target="_blank"
                    rel="noreferrer"
                    title="Website"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/60 transition hover:bg-white/10 hover:text-white"
                  >
                    <ExternalLink size={17} />
                  </a>
                )}
              </div>

              {broker.email && (
                <div className="text-xs text-white/30">{broker.email}</div>
              )}
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-xs text-white/30">
            © {new Date().getFullYear()} {broker.name}. Todos os direitos
            reservados.
          </div>
        </div>
      </footer>

      {/* =====================================================
          WHATSAPP FLUTUANTE
      ====================================================== */}

      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Falar pelo WhatsApp"
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white shadow-2xl shadow-slate-900/30 transition hover:-translate-y-1 hover:bg-slate-800 sm:bottom-7 sm:right-7"
        >
          <MessageCircle size={24} />
        </a>
      )}
    </div>
  );
}

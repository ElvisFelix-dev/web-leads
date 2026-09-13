import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, MessageCircle, Phone, Mail, X } from 'lucide-react';

import api from '../../service/api';

import HotsiteNavbar from '../../components/hotsite/HotsiteNavbar';
import BrokerHero from '../../components/hotsite/BrokerHero';
import BrokerStats from '../../components/hotsite/BrokerStats';
import PropertyCard from '../../components/hotsite/PropertyCard';
import HotsiteFooter from '../../components/hotsite/HotsiteFooter';

export default function BrokerHotsite() {
  // ==========================================================
  // ROUTE PARAM
  // ==========================================================

  const { slug: brokerSlug } = useParams();

  // ==========================================================
  // STATES
  // ==========================================================

  const [broker, setBroker] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const getMailUrl = () => {
    if (!broker?.email) {
      return null;
    }

    return `mailto:${broker.email}`;
  };

  // ==========================================================
  // CONTATOS
  // ==========================================================

  const whatsappUrl = getWhatsAppUrl();
  const phoneUrl = getPhoneUrl();
  const mailUrl = getMailUrl();

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
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* ======================================================
          NAVBAR
      ======================================================= */}

      <HotsiteNavbar broker={broker} brokerSlug={brokerSlug} />

      {/* ======================================================
          HERO
      ======================================================= */}

      <BrokerHero broker={broker} brokerSlug={brokerSlug} />

      {/* ======================================================
          STATS
      ======================================================= */}

      <BrokerStats broker={broker} properties={properties} />

      {/* ======================================================
          INTRO / SOBRE
      ======================================================= */}

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Atendimento personalizado
              </p>

              <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Encontre um imóvel com quem entende o que você procura.
              </h2>

              <p className="mt-5 text-sm leading-7 text-slate-500 sm:text-base">
                {broker.bio ||
                  `Conte com ${broker.name} para encontrar oportunidades alinhadas ao seu perfil, sua região e seus objetivos.`}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                {broker.experienceYears > 0 && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold text-slate-400">
                      Experiência
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {broker.experienceYears}{' '}
                      {Number(broker.experienceYears) === 1 ? 'ano' : 'anos'}
                    </p>
                  </div>
                )}

                {broker.creci && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold text-slate-400">
                      CRECI
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {broker.creci}
                    </p>
                  </div>
                )}

                {broker.company && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs font-semibold text-slate-400">
                      Imobiliária
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {broker.company}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 lg:justify-end">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  <MessageCircle size={17} />
                  WhatsApp
                </a>
              )}

              {phoneUrl && (
                <a
                  href={phoneUrl}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <Phone size={17} />
                  Ligar
                </a>
              )}

              {mailUrl && (
                <a
                  href={mailUrl}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <Mail size={17} />
                  E-mail
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          IMÓVEIS EM DESTAQUE
      ======================================================= */}

      <section id="imoveis" className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                Portfólio
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
                Imóveis disponíveis
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                Confira algumas das oportunidades disponíveis no portfólio.
              </p>
            </div>

            <Link
              to={`/broker/${encodeURIComponent(brokerSlug)}/imoveis`}
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-900 transition hover:gap-3"
            >
              Ver todos os imóveis
              <ArrowRight size={16} />
            </Link>
          </div>

          {properties.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {properties.slice(0, 6).map((property) => (
                <PropertyCard
                  key={property._id || property.slug}
                  property={property}
                  brokerSlug={brokerSlug}
                />
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <p className="text-sm font-semibold text-slate-500">
                Nenhum imóvel disponível no momento.
              </p>

              <p className="mt-2 text-xs text-slate-400">
                Entre em contato para conhecer outras oportunidades.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ======================================================
          CTA FINAL
      ======================================================= */}

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="overflow-hidden rounded-[2rem] bg-slate-950 p-7 shadow-2xl sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
                  Atendimento personalizado
                </p>

                <h2 className="mt-3 text-2xl font-black text-white sm:text-3xl">
                  Vamos encontrar seu próximo imóvel?
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
                  Fale diretamente com {broker.name} e receba ajuda para
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

      {/* ======================================================
          FOOTER
      ======================================================= */}

      <HotsiteFooter broker={broker} brokerSlug={brokerSlug} />

      {/* ======================================================
          WHATSAPP FLUTUANTE
      ======================================================= */}

      {whatsappUrl && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Falar pelo WhatsApp"
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-slate-950 text-white shadow-2xl shadow-slate-900/30 transition hover:-translate-y-1 hover:bg-slate-800 sm:bottom-7 sm:right-7"
        >
          <MessageCircle size={24} />
        </a>
      )}
    </div>
  );
}

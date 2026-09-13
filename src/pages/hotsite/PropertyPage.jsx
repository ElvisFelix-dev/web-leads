import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import {
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Expand,
  ExternalLink,
  Home,
  Mail,
  MapPin,
  Maximize2,
  MessageCircle,
  ParkingSquare,
  Phone,
  Share2,
  Sparkles,
  Star,
  X,
} from 'lucide-react';

import { getPropertyBySlug } from '../../service/propertyApi';
import api from '../../service/api';

import HotsiteNavbar from '../../components/hotsite/HotsiteNavbar';
import HotsiteFooter from '../../components/hotsite/HotsiteFooter';

/**
 * ============================================================
 * PROPERTY PAGE
 * ============================================================
 *
 * Rota esperada:
 *
 * /broker/:brokerSlug/property/:propertySlug
 *
 * Exemplo:
 *
 * /broker/jhon-doe/property/apartamento-na-zn
 *
 * REGRA IMPORTANTE:
 *
 * O corretor responsável pelo lead é SEMPRE o corretor
 * dono do hotsite.
 *
 * NÃO usamos:
 *
 * property.broker
 * property.captation.broker
 *
 * para definir o responsável pelo lead.
 *
 * Esses campos representam o relacionamento do imóvel
 * dentro do CRM.
 */

/**
 * ============================================================
 * MAIN PAGE
 * ============================================================
 */

export default function PropertyPage() {
  const params = useParams();
  const { brokerSlug } = useParams();

  // ==========================================================
  // ROUTE PARAMS
  // ==========================================================

  const routePropertySlug =
    params?.propertySlug || params?.property || params?.slug || '';

  // ==========================================================
  // PROPERTY SLUG FALLBACK
  // ==========================================================

  const propertySlug = useMemo(() => {
    if (routePropertySlug) {
      return routePropertySlug;
    }

    if (typeof window === 'undefined') {
      return '';
    }

    const pathname = window.location.pathname;

    const match = pathname.match(/\/broker\/[^/]+\/property\/([^/?#]+)/i);

    return match?.[1] || '';
  }, [routePropertySlug]);

  // ==========================================================
  // DEBUG
  // ==========================================================

  useEffect(() => {
    console.log('====================================');
    console.log('🧭 PROPERTY PAGE');
    console.log('PARAMS:', params);
    console.log('BROKER SLUG:', brokerSlug);
    console.log('PROPERTY SLUG:', propertySlug);
    console.log(
      'CURRENT URL:',
      typeof window !== 'undefined' ? window.location.href : '',
    );
    console.log('====================================');
  }, [params, brokerSlug, propertySlug]);

  // ==========================================================
  // PROPERTY
  // ==========================================================

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ==========================================================
  // BROKER
  // ==========================================================

  const [broker, setBroker] = useState(null);
  const [brokerLoading, setBrokerLoading] = useState(true);
  const [brokerError, setBrokerError] = useState('');

  // ==========================================================
  // GALLERY
  // ==========================================================

  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // ==========================================================
  // FORM
  // ==========================================================

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // ==========================================================
  // TOAST
  // ==========================================================

  const [toast, setToast] = useState({
    visible: false,
    type: '',
    title: '',
    message: '',
  });

  // ==========================================================
  // SHARE
  // ==========================================================

  const [copied, setCopied] = useState(false);

  // ==========================================================
  // LOAD BROKER
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    const loadBroker = async () => {
      if (!brokerSlug) {
        console.warn('⚠️ Broker slug não encontrado na rota.');

        setBroker(null);
        setBrokerLoading(false);

        return;
      }

      try {
        setBrokerLoading(true);
        setBrokerError('');

        console.log('====================================');
        console.log('🔥 BUSCANDO CORRETOR DO HOTSITE');
        console.log('BROKER SLUG:', brokerSlug);
        console.log('ENDPOINT:', `/api/brokers/slug/${brokerSlug}`);
        console.log('====================================');

        const response = await api.get(
          `/api/brokers/slug/${encodeURIComponent(brokerSlug)}`,
        );

        console.log('====================================');
        console.log('🔥 RESPOSTA BROKER');
        console.log(response);
        console.log('====================================');

        const brokerData =
          response?.data?.data ||
          response?.data?.broker ||
          response?.data ||
          null;

        if (!brokerData) {
          throw new Error('Corretor não encontrado.');
        }

        if (cancelled) {
          return;
        }

        const normalizedBroker = {
          ...brokerData,

          id: brokerData?._id || brokerData?.id || null,

          _id: brokerData?._id || brokerData?.id || null,

          name: brokerData?.name || brokerData?.fullName || 'Corretor',

          avatar:
            brokerData?.avatar ||
            brokerData?.profileImage ||
            brokerData?.photo ||
            '',

          position: brokerData?.position || 'Corretor de Imóveis',

          phone: brokerData?.phone || '',

          email: brokerData?.email || '',

          website: brokerData?.website || '',

          slug: brokerData?.slug || brokerSlug,

          bio: brokerData?.bio || '',

          socialLinks: brokerData?.socialLinks || brokerData?.social || {},
        };

        console.log('====================================');
        console.log('🔥 BROKER NORMALIZADO');
        console.log(normalizedBroker);
        console.log('====================================');

        console.log('====================================');
        console.log('✅ CORRETOR DO HOTSITE CARREGADO');
        console.log('ID:', normalizedBroker.id);
        console.log('NOME:', normalizedBroker.name);
        console.log('SLUG:', normalizedBroker.slug);
        console.log('POSITION:', normalizedBroker.position);
        console.log('====================================');

        setBroker(normalizedBroker);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error('❌ Erro ao carregar corretor do hotsite:', err);

        setBroker(null);

        setBrokerError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            'Não foi possível carregar o corretor.',
        );
      } finally {
        if (!cancelled) {
          setBrokerLoading(false);
        }
      }
    };

    loadBroker();

    return () => {
      cancelled = true;
    };
  }, [brokerSlug]);

  // ==========================================================
  // LOAD PROPERTY
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    const loadProperty = async () => {
      if (!propertySlug) {
        console.error('❌ PROPERTY SLUG NÃO ENCONTRADO.');

        setProperty(null);
        setError('Não foi possível identificar o imóvel.');
        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setError('');

        console.log('====================================');
        console.log('🏠 BUSCANDO IMÓVEL');
        console.log('PROPERTY SLUG:', propertySlug);
        console.log('ENDPOINT:', `/api/properties/slug/${propertySlug}`);
        console.log('====================================');

        const data = await getPropertyBySlug(propertySlug);

        console.log('====================================');
        console.log('🏠 RESPOSTA PROPERTY');
        console.log(data);
        console.log('====================================');

        if (cancelled) {
          return;
        }

        if (!data) {
          throw new Error('Imóvel não encontrado.');
        }

        setProperty(data);
        setActiveImage(0);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error('❌ Erro ao carregar imóvel:', err);

        setProperty(null);

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            'Não foi possível carregar este imóvel.',
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProperty();

    return () => {
      cancelled = true;
    };
  }, [propertySlug]);

  // ==========================================================
  // NORMALIZE IMAGES
  // ==========================================================

  const images = useMemo(() => {
    if (!Array.isArray(property?.images)) {
      return [];
    }

    return property.images
      .map((image) => {
        if (typeof image === 'string') {
          return {
            url: image,
            isCover: false,
          };
        }

        return {
          url:
            image?.url ||
            image?.secure_url ||
            image?.secureUrl ||
            image?.src ||
            '',
          isCover: Boolean(image?.isCover || image?.cover),
        };
      })
      .filter((image) => image.url);
  }, [property]);

  // ==========================================================
  // PROPERTY DATA
  // ==========================================================

  const propertyName = property?.name || property?.title || 'Imóvel';

  const propertyType = property?.type || property?.category || 'Imóvel';

  const purpose = property?.purpose || property?.businessType || '';

  const propertyCode = property?.code || property?.propertyCode || '';

  const bedrooms = property?.bedrooms || 0;

  const suites = property?.suites || 0;

  const bathrooms = property?.bathrooms || 0;

  const parkingSpaces = property?.parkingSpaces || property?.parking || 0;

  const totalArea =
    property?.area?.total ||
    property?.area?.private ||
    property?.totalArea ||
    null;

  const usefulArea =
    property?.area?.useful ||
    property?.area?.built ||
    property?.usefulArea ||
    null;

  // ==========================================================
  // PRICE
  // ==========================================================

  const salePrice = property?.prices?.salePrice || property?.salePrice || null;

  const rentPrice = property?.prices?.rentPrice || property?.rentPrice || null;

  const condoFee =
    property?.prices?.condoFee ||
    property?.prices?.condominiumFee ||
    property?.condominiumFee ||
    null;

  const iptu = property?.prices?.iptu || property?.iptu || null;

  const normalizedPurpose = String(purpose).toLowerCase();

  const price = formatCurrency(
    normalizedPurpose === 'aluguel' || normalizedPurpose === 'locacao'
      ? rentPrice
      : salePrice || rentPrice,
  );

  // ==========================================================
  // LOCATION
  // ==========================================================

  const location = property?.location || {};

  const address = buildAddress(location, property?.address);

  const cityState = [location?.city, location?.state]
    .filter(Boolean)
    .join(' - ');

  // ==========================================================
  // FEATURES
  // ==========================================================

  const features = getFeatures(property);

  // ==========================================================
  // HOTSITE BROKER
  // ==========================================================

  const hotsiteBrokerId = broker?._id || broker?.id || null;

  // ==========================================================
  // PAGE URL
  // ==========================================================

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  // ==========================================================
  // WHATSAPP
  // ==========================================================

  const whatsappUrl = useMemo(() => {
    return buildWhatsAppUrl(
      broker?.phone,
      `Olá ${broker?.name || ''}! Vi o imóvel "${propertyName}" no seu hotsite e gostaria de mais informações.`,
    );
  }, [broker?.phone, broker?.name, propertyName]);

  // ==========================================================
  // SOCIAL LINKS
  // ==========================================================

  const socialLinks = useMemo(() => {
    return buildSocialLinks(broker);
  }, [broker]);

  // ==========================================================
  // TOAST
  // ==========================================================

  const showToast = useCallback((type, title, message) => {
    setToast({
      visible: true,
      type,
      title,
      message,
    });
  }, []);

  useEffect(() => {
    if (!toast.visible) {
      return;
    }

    const timer = window.setTimeout(() => {
      setToast((previous) => ({
        ...previous,
        visible: false,
      }));
    }, 4500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [toast.visible]);

  // ==========================================================
  // GALLERY
  // ==========================================================

  const nextImage = useCallback(() => {
    if (!images.length) {
      return;
    }

    setActiveImage((current) =>
      current >= images.length - 1 ? 0 : current + 1,
    );
  }, [images.length]);

  const previousImage = useCallback(() => {
    if (!images.length) {
      return;
    }

    setActiveImage((current) =>
      current <= 0 ? images.length - 1 : current - 1,
    );
  }, [images.length]);

  // ==========================================================
  // KEYBOARD GALLERY
  // ==========================================================

  useEffect(() => {
    if (!lightboxOpen) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setLightboxOpen(false);
      }

      if (event.key === 'ArrowRight') {
        nextImage();
      }

      if (event.key === 'ArrowLeft') {
        previousImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lightboxOpen, nextImage, previousImage]);

  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((previous) => ({
        ...previous,
        [name]: '',
      }));
    }

    if (formErrors.form) {
      setFormErrors((previous) => ({
        ...previous,
        form: '',
      }));
    }

    if (success) {
      setSuccess(false);
    }
  };

  // ==========================================================
  // PHONE
  // ==========================================================

  const handlePhoneChange = (event) => {
    const value = formatPhone(event.target.value);

    setForm((previous) => ({
      ...previous,
      phone: value,
    }));

    if (formErrors.phone) {
      setFormErrors((previous) => ({
        ...previous,
        phone: '',
      }));
    }
  };

  // ==========================================================
  // VALIDATE FORM
  // ==========================================================

  const validateForm = () => {
    const errors = {};

    const name = form.name.trim();

    const phone = form.phone.replace(/\D/g, '');

    const email = form.email.trim();

    if (!name) {
      errors.name = 'Informe seu nome.';
    } else if (name.length < 3) {
      errors.name = 'Informe seu nome completo.';
    }

    if (!phone) {
      errors.phone = 'Informe seu WhatsApp.';
    } else if (phone.length !== 10 && phone.length !== 11) {
      errors.phone = 'Informe um WhatsApp válido.';
    }

    if (!email) {
      errors.email = 'Informe seu e-mail.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Informe um e-mail válido.';
    }

    if (!hotsiteBrokerId) {
      errors.form =
        'Não foi possível identificar o corretor responsável pelo hotsite.';
    }

    if (!property?._id) {
      errors.form = 'Não foi possível identificar o imóvel.';
    }

    setFormErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // ==========================================================
  // SUBMIT LEAD
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    if (!validateForm()) {
      showToast(
        'error',
        'Confira seus dados',
        'Preencha corretamente os campos obrigatórios.',
      );

      return;
    }

    try {
      setSubmitting(true);

      const phone = form.phone.replace(/\D/g, '');

      const payload = {
        name: form.name.trim(),

        phone: `+55${phone}`,

        email: form.email.trim().toLowerCase(),

        message:
          form.message.trim() ||
          `Olá! Tenho interesse no imóvel ${propertyName}.`,

        property: property?._id,

        // ====================================================
        // IMPORTANTE:
        // O corretor do lead é o dono do HOTSITE.
        // ====================================================

        broker: hotsiteBrokerId,

        source: 'public',

        sourceType: 'broker_hotsite',

        sourceSite: brokerSlug || 'broker_hotsite',

        sourceUrl: pageUrl,

        landingPage: pageUrl,

        referrer:
          typeof document !== 'undefined' ? document.referrer || '' : '',

        campaign: {
          utmSource: getQueryParam('utm_source'),

          utmMedium: getQueryParam('utm_medium'),

          utmCampaign: getQueryParam('utm_campaign'),

          utmTerm: getQueryParam('utm_term'),

          utmContent: getQueryParam('utm_content'),
        },

        sessionId: getSessionId(),

        visitorId: getVisitorId(),
      };

      console.log('====================================');
      console.log('🔥 LEAD DO HOTSITE');
      console.log('BROKER HOTSITE:', broker);
      console.log('BROKER ID:', hotsiteBrokerId);
      console.log('PROPERTY ID:', property?._id);
      console.log('PAYLOAD:', payload);
      console.log('====================================');

      await api.post('/api/leads/hotsite', payload);

      setSuccess(true);

      setForm({
        name: '',
        phone: '',
        email: '',
        message: '',
      });

      setFormErrors({});

      showToast(
        'success',
        'Interesse enviado!',
        'Seus dados foram enviados. O corretor entrará em contato em breve.',
      );
    } catch (err) {
      console.error('❌ Erro ao enviar lead:', err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Não foi possível enviar seus dados. Tente novamente.';

      setFormErrors({
        form: message,
      });

      showToast('error', 'Não foi possível enviar', message);
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================
  // SHARE
  // ==========================================================

  const handleShare = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: propertyName,
          text: `Confira este imóvel: ${propertyName}`,
          url: pageUrl,
        });

        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(pageUrl);

        setCopied(true);

        showToast(
          'success',
          'Link copiado',
          'O link do imóvel foi copiado para sua área de transferência.',
        );

        window.setTimeout(() => {
          setCopied(false);
        }, 2000);

        return;
      }

      throw new Error('Compartilhamento não disponível.');
    } catch (shareError) {
      console.error('Erro ao compartilhar:', shareError);
    }
  };

  // ==========================================================
  // ACTIVE IMAGE
  // ==========================================================

  const activeImageUrl = images[activeImage]?.url || '';

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return <PropertyLoading broker={broker} brokerSlug={brokerSlug} />;
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error || !property) {
    return (
      <PropertyError
        broker={broker}
        brokerSlug={brokerSlug}
        brokerError={brokerError}
        brokerLoading={brokerLoading}
        error={error}
        propertySlug={propertySlug}
        whatsappUrl={whatsappUrl}
        socialLinks={socialLinks}
      />
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#07090d] text-white">
      <HotsiteNavbar broker={broker} brokerSlug={brokerSlug} />

      <main>
        {/* ==================================================
            HERO
        ================================================== */}

        <section className="border-b border-white/[0.06] bg-gradient-to-b from-white/[0.025] to-transparent">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 font-medium text-blue-300">
                    {propertyType}
                  </span>

                  {purpose && (
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                      {formatPurpose(purpose)}
                    </span>
                  )}

                  {propertyCode && (
                    <span className="px-2">Código {propertyCode}</span>
                  )}
                </div>

                <h1 className="mt-4 max-w-4xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {propertyName}
                </h1>

                {address && (
                  <div className="mt-4 flex items-start gap-2 text-sm text-gray-400">
                    <MapPin
                      size={18}
                      className="mt-0.5 shrink-0 text-blue-400"
                    />

                    <span>
                      {address}

                      {cityState && !address.includes(cityState) && (
                        <>
                          <span className="mx-2 text-gray-700">•</span>

                          {cityState}
                        </>
                      )}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-gray-300 transition hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
                >
                  {copied ? <Check size={17} /> : <Share2 size={17} />}

                  {copied ? 'Copiado' : 'Compartilhar'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            CONTENT
        ================================================== */}

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_400px]">
            {/* ==================================================
                LEFT
            ================================================== */}

            <div className="min-w-0">
              {/* ==================================================
                  GALLERY
              ================================================== */}

              <div className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-gray-900 shadow-2xl shadow-black/30">
                {activeImageUrl ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setLightboxOpen(true)}
                      className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-white backdrop-blur-xl transition hover:bg-black/60"
                      aria-label="Ampliar imagem"
                    >
                      <Expand size={18} />
                    </button>

                    <img
                      src={activeImageUrl}
                      alt={propertyName}
                      className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-[1.01]"
                    />

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 to-transparent" />

                    <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs font-medium text-white backdrop-blur-xl">
                      <Sparkles size={14} className="text-blue-300" />
                      {activeImage + 1} / {images.length}
                    </div>

                    {images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={previousImage}
                          className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white opacity-0 backdrop-blur-xl transition group-hover:opacity-100 hover:bg-black/60"
                          aria-label="Imagem anterior"
                        >
                          <ChevronLeft size={21} />
                        </button>

                        <button
                          type="button"
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white opacity-0 backdrop-blur-xl transition group-hover:opacity-100 hover:bg-black/60"
                          aria-label="Próxima imagem"
                        >
                          <ChevronRight size={21} />
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-gray-900 to-gray-950">
                    <div className="text-center text-gray-600">
                      <Building2 size={42} className="mx-auto" />

                      <p className="mt-3 text-sm">Imagens não disponíveis</p>
                    </div>
                  </div>
                )}
              </div>

              {/* ==================================================
                  THUMBNAILS
              ================================================== */}

              {images.length > 1 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={`${image.url}-${index}`}
                      type="button"
                      onClick={() => setActiveImage(index)}
                      className={`group relative h-20 w-28 shrink-0 overflow-hidden rounded-xl border transition ${
                        activeImage === index
                          ? 'border-blue-400 ring-2 ring-blue-400/20'
                          : 'border-white/10 opacity-60 hover:border-white/20 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`${propertyName} - foto ${index + 1}`}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />

                      {activeImage === index && (
                        <div className="absolute inset-0 bg-blue-500/10" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* ==================================================
                  PRICE
              ================================================== */}

              <div className="mt-8 flex flex-col gap-5 rounded-3xl border border-white/[0.07] bg-gradient-to-br from-white/[0.045] to-white/[0.015] p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500">
                    {normalizedPurpose === 'aluguel' ||
                    normalizedPurpose === 'locacao'
                      ? 'Valor do aluguel'
                      : 'Valor do imóvel'}
                  </p>

                  <p className="mt-2 text-3xl font-bold tracking-tight text-white">
                    {price || 'Consulte o valor'}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Star size={17} className="text-amber-400" />

                  <span>Informações atualizadas</span>
                </div>
              </div>

              {/* ==================================================
                  STATS
              ================================================== */}

              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <PropertyInfo
                  icon={BedDouble}
                  label="Quartos"
                  value={bedrooms}
                />

                <PropertyInfo icon={Home} label="Suítes" value={suites} />

                <PropertyInfo icon={Bath} label="Banheiros" value={bathrooms} />

                <PropertyInfo
                  icon={ParkingSquare}
                  label="Vagas"
                  value={parkingSpaces}
                />

                <PropertyInfo
                  icon={Maximize2}
                  label="Área total"
                  value={totalArea ? `${formatNumber(totalArea)} m²` : '-'}
                />

                {usefulArea && (
                  <PropertyInfo
                    icon={Maximize2}
                    label="Área útil"
                    value={`${formatNumber(usefulArea)} m²`}
                  />
                )}

                <PropertyInfo
                  icon={Building2}
                  label="Tipo"
                  value={propertyType}
                />

                <PropertyInfo
                  icon={CalendarDays}
                  label="Código"
                  value={propertyCode || '-'}
                />
              </div>

              {/* ==================================================
                  ABOUT
              ================================================== */}

              {property.description && (
                <section className="mt-12">
                  <SectionTitle>Sobre este imóvel</SectionTitle>

                  <div className="mt-5 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-7">
                    <p className="whitespace-pre-line text-sm leading-8 text-gray-400">
                      {property.description}
                    </p>
                  </div>
                </section>
              )}

              {/* ==================================================
                  FEATURES
              ================================================== */}

              {features.length > 0 && (
                <section className="mt-12">
                  <SectionTitle>Características</SectionTitle>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, index) => (
                      <div
                        key={`${feature}-${index}`}
                        className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] px-4 py-4"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                          <Check size={16} className="text-blue-400" />
                        </div>

                        <span className="text-sm text-gray-300">
                          {formatFeature(feature)}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* ==================================================
                  FINANCIAL
              ================================================== */}

              {(condoFee || iptu) && (
                <section className="mt-12">
                  <SectionTitle>Informações financeiras</SectionTitle>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {condoFee && (
                      <FinancialInfo
                        label="Condomínio"
                        value={formatCurrency(condoFee)}
                      />
                    )}

                    {iptu && (
                      <FinancialInfo
                        label="IPTU"
                        value={formatCurrency(iptu)}
                      />
                    )}
                  </div>
                </section>
              )}

              {/* ==================================================
                  LOCATION
              ================================================== */}

              {address && (
                <section className="mt-12">
                  <SectionTitle>Localização</SectionTitle>

                  <div className="mt-5 overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02]">
                    <div className="flex items-start gap-4 p-6">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                        <MapPin size={20} className="text-blue-400" />
                      </div>

                      <div>
                        <p className="font-medium text-white">
                          {cityState || 'Localização'}
                        </p>

                        <p className="mt-1 text-sm leading-6 text-gray-500">
                          {address}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* ==================================================
                RIGHT / LEAD
            ================================================== */}

            <aside>
              <div className="sticky top-24">
                <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#0c1018] shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
                  <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />

                  <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl" />

                  {/* HEADER */}

                  <div className="relative border-b border-white/[0.07] px-6 pb-6 pt-7">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />

                      <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-300">
                        Atendimento online
                      </span>
                    </div>

                    <h2 className="mt-4 text-2xl font-bold tracking-tight text-white">
                      Gostou deste imóvel?
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      Fale com {broker?.name || 'nosso especialista'} e descubra
                      todos os detalhes, condições e possibilidades de visita.
                    </p>

                    {/* PROPERTY MINI */}

                    <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3">
                      {activeImageUrl ? (
                        <img
                          src={activeImageUrl}
                          alt={propertyName}
                          className="h-14 w-16 shrink-0 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-16 shrink-0 items-center justify-center rounded-xl bg-white/[0.04]">
                          <Building2 size={18} className="text-gray-600" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {propertyName}
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {propertyType}
                          </span>

                          {price && (
                            <>
                              <span className="text-gray-700">•</span>

                              <span className="text-xs font-medium text-blue-300">
                                {price}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SUCCESS */}

                  {success ? (
                    <div className="relative p-6">
                      <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-emerald-500/[0.03] p-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">
                          <CheckCircle2
                            size={24}
                            className="text-emerald-400"
                          />
                        </div>

                        <h3 className="mt-5 text-lg font-bold text-white">
                          Interesse recebido!
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-gray-400">
                          Obrigado pelo contato. Recebemos suas informações e{' '}
                          {broker?.name ||
                            'o especialista responsável pelo atendimento'}{' '}
                          entrará em contato com você.
                        </p>

                        <div className="mt-5 flex items-center gap-2 text-xs text-emerald-400">
                          <Check size={14} />

                          <span>Solicitação enviada com sucesso</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSuccess(false);

                          setForm({
                            name: '',
                            phone: '',
                            email: '',
                            message: '',
                          });
                        }}
                        className="mt-4 w-full rounded-2xl border border-white/10 bg-white/[0.025] py-3.5 text-sm font-medium text-gray-300 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
                      >
                        Tenho outro interesse
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="relative p-6">
                      {/* FORM ERROR */}

                      {formErrors.form && (
                        <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/[0.07] p-4">
                          <div className="flex gap-3">
                            <X
                              size={17}
                              className="mt-0.5 shrink-0 text-red-400"
                            />

                            <p className="text-xs leading-5 text-red-300">
                              {formErrors.form}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="space-y-5">
                        {/* NAME */}

                        <FormField
                          label="Nome completo"
                          icon={UserIcon}
                          error={formErrors.name}
                        >
                          <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Digite seu nome"
                            autoComplete="name"
                            disabled={submitting}
                            className={inputClass(!!formErrors.name)}
                          />
                        </FormField>

                        {/* PHONE */}

                        <FormField
                          label="WhatsApp"
                          icon={Phone}
                          error={formErrors.phone}
                        >
                          <input
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handlePhoneChange}
                            placeholder="(11) 99999-9999"
                            autoComplete="tel"
                            disabled={submitting}
                            className={inputClass(!!formErrors.phone)}
                          />
                        </FormField>

                        {/* EMAIL */}

                        <FormField
                          label="E-mail"
                          icon={Mail}
                          error={formErrors.email}
                        >
                          <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="seu@email.com"
                            autoComplete="email"
                            disabled={submitting}
                            className={inputClass(!!formErrors.email)}
                          />
                        </FormField>

                        {/* MESSAGE */}

                        <div>
                          <label className="mb-2 block text-xs font-medium text-gray-400">
                            Como podemos ajudar?
                          </label>

                          <textarea
                            name="message"
                            rows={4}
                            value={form.message}
                            onChange={handleChange}
                            disabled={submitting}
                            placeholder={`Olá! Tenho interesse no imóvel ${propertyName}. Gostaria de receber mais informações.`}
                            className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3.5 text-sm leading-6 text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </div>

                        {/* BUTTON */}

                        <button
                          type="submit"
                          disabled={submitting || !hotsiteBrokerId}
                          className="group relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 px-5 text-sm font-bold text-white shadow-xl shadow-blue-950/40 transition duration-300 hover:-translate-y-0.5 hover:shadow-blue-900/50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <span className="absolute inset-0 bg-white/10 opacity-0 transition group-hover:opacity-100" />

                          <span className="relative flex items-center gap-2">
                            {submitting ? (
                              <>
                                <Spinner />
                                Enviando seus dados...
                              </>
                            ) : (
                              <>
                                Solicitar atendimento
                                <ArrowRight
                                  size={17}
                                  className="transition-transform duration-300 group-hover:translate-x-1"
                                />
                              </>
                            )}
                          </span>
                        </button>
                      </div>

                      {/* SECURITY */}

                      <div className="mt-5 flex items-start gap-2 rounded-xl border border-white/[0.05] bg-white/[0.015] px-3 py-3">
                        <Check
                          size={14}
                          className="mt-0.5 shrink-0 text-emerald-500"
                        />

                        <p className="text-[10px] leading-4 text-gray-600">
                          Seus dados são tratados com segurança e utilizados
                          exclusivamente para o atendimento relacionado a este
                          imóvel.
                        </p>
                      </div>
                    </form>
                  )}
                </div>

                {/* ==================================================
                    BROKER CARD
                ================================================== */}

                {broker && (
                  <div className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                    <div className="flex items-center gap-3">
                      {broker.avatar ? (
                        <img
                          src={broker.avatar}
                          alt={broker.name || 'Corretor'}
                          className="h-12 w-12 rounded-full object-cover ring-2 ring-white/10"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                          <UserIcon size={19} className="text-blue-400" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-gray-600">
                          Seu especialista
                        </p>

                        <p className="mt-1 truncate text-sm font-semibold text-white">
                          {broker.name}
                        </p>

                        {broker.position && (
                          <p className="mt-0.5 truncate text-xs text-gray-600">
                            {broker.position}
                          </p>
                        )}
                      </div>

                      <div className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      </div>
                    </div>

                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500/10 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/15"
                      >
                        <MessageCircle size={17} />
                        Falar no WhatsApp
                      </a>
                    )}
                  </div>
                )}

                {!broker && !brokerLoading && (
                  <div className="mt-4 rounded-2xl border border-red-500/10 bg-red-500/[0.03] p-4">
                    <p className="text-xs text-red-400">
                      {brokerError ||
                        'Não foi possível identificar o corretor deste hotsite.'}
                    </p>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </section>
      </main>

      <HotsiteFooter broker={broker} brokerSlug={brokerSlug} />

      {/* ======================================================
          TOAST
      ====================================================== */}

      <Toast
        visible={toast.visible}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() =>
          setToast((previous) => ({
            ...previous,
            visible: false,
          }))
        }
      />

      {/* ======================================================
          LIGHTBOX
      ====================================================== */}

      {lightboxOpen && activeImageUrl && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-xl"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-5 top-5 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white transition hover:bg-white/10"
            aria-label="Fechar"
          >
            <X size={20} />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  previousImage();
                }}
                className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-xl transition hover:bg-black/70 sm:left-8"
                aria-label="Imagem anterior"
              >
                <ChevronLeft size={24} />
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-xl transition hover:bg-black/70 sm:right-8"
                aria-label="Próxima imagem"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <div
            className="relative max-h-[90vh] max-w-6xl"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={activeImageUrl}
              alt={propertyName}
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/10 bg-black/60 px-4 py-2 text-xs text-white backdrop-blur-xl">
              {activeImage + 1} / {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ============================================================
 * HEADER
 * ============================================================
 */

function Header({ broker, whatsappUrl }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#07090d]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          {broker?.avatar ? (
            <img
              src={broker.avatar}
              alt={broker.name || 'Corretor'}
              className="h-11 w-11 rounded-full object-cover ring-2 ring-white/10"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-500/10 text-sm font-bold text-blue-400">
              {broker?.name?.charAt(0)?.toUpperCase() || 'C'}
            </div>
          )}

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">
              {broker?.name || 'Especialista imobiliário'}
            </p>

            <p className="truncate text-xs text-gray-500">
              {broker?.position || 'Corretor de Imóveis'}
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <a
            href="#sobre"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition hover:bg-white/[0.05] hover:text-white"
          >
            Sobre
          </a>

          <a
            href="#imoveis"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition hover:bg-white/[0.05] hover:text-white"
          >
            Imóveis
          </a>

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-950/20 transition hover:-translate-y-0.5 hover:bg-emerald-400"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

/**
 * ============================================================
 * PROPERTY ERROR
 * ============================================================
 */

function PropertyError({
  broker,
  brokerSlug,
  brokerError,
  brokerLoading,
  error,
  propertySlug,
  whatsappUrl,
  socialLinks,
}) {
  return (
    <div className="min-h-screen bg-[#07090d] text-white">
      <Header broker={broker} whatsappUrl={whatsappUrl} />

      <main className="flex min-h-[65vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
            <Home size={28} className="text-gray-500" />
          </div>

          <h1 className="mt-6 text-2xl font-bold">Imóvel não encontrado</h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            {error || 'O imóvel que você procura não está disponível.'}
          </p>

          <div className="mt-5 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 text-left">
            <p className="text-[10px] uppercase tracking-wider text-gray-600">
              Diagnóstico
            </p>

            <p className="mt-2 text-xs text-gray-400">Slug do imóvel:</p>

            <p className="mt-1 break-all text-sm font-medium text-white">
              {propertySlug || 'não identificado'}
            </p>

            {!brokerLoading && !broker && (
              <>
                <p className="mt-4 text-xs text-gray-400">Corretor:</p>

                <p className="mt-1 text-xs text-red-400">
                  {brokerError || 'Não foi possível carregar o corretor.'}
                </p>
              </>
            )}
          </div>
        </div>
      </main>

      <HotsiteFooter
        broker={broker}
        brokerSlug={brokerSlug}
        socialLinks={socialLinks}
      />
    </div>
  );
}

/**
 * ============================================================
 * PROPERTY LOADING
 * ============================================================
 */

function PropertyLoading({ broker, brokerSlug }) {
  return (
    <div className="min-h-screen bg-[#07090d] text-white">
      <Header broker={broker} />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-5 w-28 rounded bg-gray-800" />

          <div className="mt-5 h-12 w-3/4 rounded-xl bg-gray-800" />

          <div className="mt-3 h-5 w-1/2 rounded bg-gray-900" />

          <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_400px]">
            <div>
              <div className="aspect-[16/10] rounded-[28px] bg-gray-900" />

              <div className="mt-5 grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="h-20 rounded-xl bg-gray-900" />
                ))}
              </div>

              <div className="mt-8 h-36 rounded-3xl bg-gray-900" />

              <div className="mt-6 grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="h-28 rounded-2xl bg-gray-900" />
                ))}
              </div>
            </div>

            <div className="h-[650px] rounded-[28px] bg-gray-900" />
          </div>
        </div>
      </main>

      <HotsiteFooter broker={broker} brokerSlug={brokerSlug} />
    </div>
  );
}

/**
 * ============================================================
 * FORM FIELD
 * ============================================================
 */

function FormField({ label, icon: Icon, error, children }) {
  return (
    <div>
      <label className="mb-2 block text-xs font-medium text-gray-400">
        {label}
      </label>

      <div className="relative">
        <Icon
          size={17}
          className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-gray-600"
        />

        <div className="[&_input]:pl-11">{children}</div>
      </div>

      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}

/**
 * ============================================================
 * PROPERTY INFO
 * ============================================================
 */

function PropertyInfo({ icon: Icon, label, value }) {
  return (
    <div className="group rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 transition hover:border-white/10 hover:bg-white/[0.04]">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] transition group-hover:bg-blue-500/10">
          <Icon
            size={17}
            className="text-gray-500 transition group-hover:text-blue-400"
          />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.14em] text-gray-600">
            {label}
          </p>

          <p className="mt-1 truncate text-sm font-semibold text-white">
            {value || '-'}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * ============================================================
 * SECTION TITLE
 * ============================================================
 */

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-6 w-1 rounded-full bg-blue-500" />

      <h2 className="text-xl font-bold tracking-tight text-white">
        {children}
      </h2>
    </div>
  );
}

/**
 * ============================================================
 * FINANCIAL INFO
 * ============================================================
 */

function FinancialInfo({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5">
      <p className="text-xs uppercase tracking-wider text-gray-600">{label}</p>

      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

/**
 * ============================================================
 * TOAST
 * ============================================================
 */

function Toast({ visible, type, title, message, onClose }) {
  if (!visible) {
    return null;
  }

  const success = type === 'success';

  return (
    <div
      className="fixed right-4 top-4 z-[200] w-[calc(100%-2rem)] max-w-sm"
      role="alert"
    >
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#10141c]/95 shadow-2xl shadow-black/40 backdrop-blur-2xl">
        <div className="flex gap-3 p-4">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              success ? 'bg-emerald-500/10' : 'bg-red-500/10'
            }`}
          >
            {success ? (
              <CheckCircle2 size={20} className="text-emerald-400" />
            ) : (
              <X size={20} className="text-red-400" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">{title}</p>

            <p className="mt-1 text-xs leading-5 text-gray-500">{message}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-gray-600 transition hover:bg-white/[0.05] hover:text-white"
          >
            <X size={15} />
          </button>
        </div>

        <div className={`h-0.5 ${success ? 'bg-emerald-500' : 'bg-red-500'}`} />
      </div>
    </div>
  );
}

/**
 * ============================================================
 * SPINNER
 * ============================================================
 */

function Spinner() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
  );
}

/**
 * ============================================================
 * INPUT CLASS
 * ============================================================
 */

function inputClass(hasError = false) {
  return `
    h-12
    w-full
    rounded-2xl
    border
    ${
      hasError
        ? 'border-red-500/40 focus:border-red-500/60'
        : 'border-white/10 focus:border-blue-500/50'
    }
    bg-white/[0.035]
    px-4
    text-sm
    text-white
    outline-none
    transition
    placeholder:text-gray-600
    focus:bg-white/[0.05]
    focus:ring-1
    focus:ring-blue-500/20
    disabled:cursor-not-allowed
    disabled:opacity-50
  `;
}

/**
 * ============================================================
 * PHONE
 * ============================================================
 */

function formatPhone(value) {
  const numbers = String(value || '')
    .replace(/\D/g, '')
    .slice(0, 11);

  if (numbers.length <= 2) {
    return numbers;
  }

  if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  }

  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
}

/**
 * ============================================================
 * CURRENCY
 * ============================================================
 */

function formatCurrency(value) {
  if (
    value === null ||
    value === undefined ||
    value === '' ||
    Number(value) <= 0
  ) {
    return '';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(Number(value));
}

/**
 * ============================================================
 * NUMBER
 * ============================================================
 */

function formatNumber(value) {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  return new Intl.NumberFormat('pt-BR').format(Number(value));
}

/**
 * ============================================================
 * PURPOSE
 * ============================================================
 */

function formatPurpose(value) {
  const normalized = String(value || '').toLowerCase();

  const map = {
    venda: 'Venda',
    aluguel: 'Aluguel',
    locacao: 'Aluguel',
    temporada: 'Temporada',
  };

  return map[normalized] || value;
}

/**
 * ============================================================
 * ADDRESS
 * ============================================================
 */

function buildAddress(location, fallbackAddress) {
  if (typeof fallbackAddress === 'string' && fallbackAddress.trim()) {
    return fallbackAddress.trim();
  }

  if (fallbackAddress && typeof fallbackAddress === 'object') {
    return [
      fallbackAddress.street || fallbackAddress.logradouro,

      fallbackAddress.number || fallbackAddress.numero,

      fallbackAddress.complement || fallbackAddress.complemento,

      fallbackAddress.district || fallbackAddress.bairro,
    ]
      .filter(Boolean)
      .join(', ');
  }

  return [
    location?.street || location?.logradouro,

    location?.number || location?.numero,

    location?.complement || location?.complemento,

    location?.district || location?.bairro,
  ]
    .filter(Boolean)
    .join(', ');
}

/**
 * ============================================================
 * FEATURES
 * ============================================================
 */

function getFeatures(property) {
  const source = property?.features || property?.amenities || [];

  if (Array.isArray(source)) {
    return source.filter(Boolean);
  }

  if (source && typeof source === 'object') {
    return Object.entries(source)
      .filter(([, value]) => value === true || value === 'true')
      .map(([key]) => key);
  }

  return [];
}

/**
 * ============================================================
 * FEATURE LABEL
 * ============================================================
 */

function formatFeature(value) {
  if (!value) {
    return '';
  }

  return String(value)
    .replace(/([A-Z])/g, ' $1')
    .replace(/[\_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (letter) => letter.toUpperCase());
}

/**
 * ============================================================
 * QUERY PARAM
 * ============================================================
 */

function getQueryParam(name) {
  if (typeof window === 'undefined') {
    return '';
  }

  return new URLSearchParams(window.location.search).get(name) || '';
}

/**
 * ============================================================
 * SESSION ID
 * ============================================================
 */

function getSessionId() {
  if (typeof window === 'undefined') {
    return '';
  }

  const key = 'hotsite_session_id';

  let value = window.sessionStorage.getItem(key);

  if (!value) {
    value = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    window.sessionStorage.setItem(key, value);
  }

  return value;
}

/**
 * ============================================================
 * VISITOR ID
 * ============================================================
 */

function getVisitorId() {
  if (typeof window === 'undefined') {
    return '';
  }

  const key = 'hotsite_visitor_id';

  let value = window.localStorage.getItem(key);

  if (!value) {
    value = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    window.localStorage.setItem(key, value);
  }

  return value;
}

/**
 * ============================================================
 * WHATSAPP
 * ============================================================
 */

function buildWhatsAppUrl(phone, message = '') {
  if (!phone) {
    return '';
  }

  let cleanPhone = String(phone).replace(/\D/g, '');

  if (!cleanPhone) {
    return '';
  }

  if (cleanPhone.startsWith('55')) {
    // já possui código do Brasil
  } else if (cleanPhone.length === 10 || cleanPhone.length === 11) {
    cleanPhone = `55${cleanPhone}`;
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * ============================================================
 * SOCIAL LINKS
 * ============================================================
 */

function buildSocialLinks(broker) {
  if (!broker) {
    return [];
  }

  const social = broker?.socialLinks || broker?.social || {};

  const links = [];

  const instagram = social?.instagram || broker?.instagram;

  const facebook = social?.facebook || broker?.facebook;

  const linkedin = social?.linkedin || broker?.linkedin;

  const youtube = social?.youtube || broker?.youtube;

  const tiktok = social?.tiktok || broker?.tiktok;

  if (instagram) {
    links.push({
      key: 'instagram',
      label: 'Instagram',
      value: normalizeSocialUrl(instagram, 'https://instagram.com/'),
      icon: InstagramIcon,
    });
  }

  if (facebook) {
    links.push({
      key: 'facebook',
      label: 'Facebook',
      value: normalizeSocialUrl(facebook, 'https://facebook.com/'),
      icon: FacebookIcon,
    });
  }

  if (linkedin) {
    links.push({
      key: 'linkedin',
      label: 'LinkedIn',
      value: normalizeSocialUrl(linkedin, 'https://linkedin.com/in/'),
      icon: LinkedinIcon,
    });
  }

  if (youtube) {
    links.push({
      key: 'youtube',
      label: 'YouTube',
      value: normalizeSocialUrl(youtube, 'https://youtube.com/'),
      icon: YoutubeIcon,
    });
  }

  if (tiktok) {
    links.push({
      key: 'tiktok',
      label: 'TikTok',
      value: normalizeSocialUrl(tiktok, 'https://tiktok.com/@'),
      icon: TikTokIcon,
    });
  }

  return links.filter((item) => item.value);
}

/**
 * ============================================================
 * SOCIAL URL
 * ============================================================
 */

function normalizeSocialUrl(value, prefix) {
  if (!value) {
    return '';
  }

  const normalized = String(value).trim();

  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    return normalized;
  }

  return `${prefix}${normalized.replace(/^@/, '')}`;
}

/**
 * ============================================================
 * USER ICON
 * ============================================================
 */

function UserIcon(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 0 0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21a8 8 0 0 0-16 0" />

      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

/**
 * ============================================================
 * SOCIAL ICONS
 * ============================================================
 */

function InstagramIcon(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />

      <circle cx="12" cy="12" r="4" />

      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.6 1.7-1.6h1.8V3.8c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.5v3h2.8v8h3.2Z" />
    </svg>
  );
}

function LinkedinIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.5 8.2H3.2V21h3.3V8.2ZM4.8 3C3.7 3 3 3.7 3 4.7s.7 1.8 1.8 1.8 1.8-.7 1.8-1.8S5.9 3 4.8 3ZM21 13.7c0-3.9-2.1-5.7-4.9-5.7-2.3 0-3.3 1.3-3.9 2.1V8.2H9V21h3.3v-6.3c0-1.7.3-3.4 2.5-3.4 2.1 0 2.1 1.9 2.1 3.5V21H21v-7.3Z" />
    </svg>
  );
}

function YoutubeIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8ZM9.6 15.8V8.2l6.4 3.8-6.4 3.8Z" />
    </svg>
  );
}

function TikTokIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor">
      <path d="M14.7 3h3.1c.3 1.8 1.3 3.2 3.2 3.8v3.2c-1.2 0-2.5-.4-3.5-1.1v6.7c0 3.9-2.7 6.4-6.3 6.4-3.4 0-5.9-2.5-5.9-5.8 0-3.4 2.7-5.9 6.3-5.9.3 0 .7 0 1 .1v3.2c-.3-.1-.6-.2-1-.2-1.7 0-3 1.1-3 2.8 0 1.5 1.1 2.7 2.7 2.7 1.8 0 3.4-1.2 3.4-3.7V3Z" />
    </svg>
  );
}

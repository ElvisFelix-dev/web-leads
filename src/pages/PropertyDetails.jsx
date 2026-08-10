import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  Building2,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Maximize2,
  MessageCircle,
  Share2,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';

import api from '../service/api';

/* ============================================================
   HELPERS
============================================================ */

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') {
    return 'Consulte';
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return 'Consulte';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(number);
}

function formatArea(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return typeof value === 'string' ? value : null;
  }

  return `${new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 0,
  }).format(number)} m²`;
}

function getPropertyId(property) {
  return property?._id || property?.id || null;
}

/* ============================================================
   IMAGENS
============================================================ */

function getPropertyImages(property) {
  const images = [];

  if (property?.coverImage) {
    images.push(property.coverImage);
  }

  const appendImages = (collection) => {
    if (!Array.isArray(collection)) return;

    collection.forEach((image) => {
      const url =
        typeof image === 'string'
          ? image
          : image?.url || image?.secure_url || image?.src || image?.path;

      if (url && !images.includes(url)) {
        images.push(url);
      }
    });
  };

  appendImages(property?.images);
  appendImages(property?.photos);
  appendImages(property?.image);

  return images;
}

/* ============================================================
   TÍTULO / TIPO
============================================================ */

function getPropertyTitle(property) {
  return property?.title || property?.name || property?.headline || 'Imóvel';
}

function getPropertyType(property) {
  return (
    property?.propertyType ||
    property?.type ||
    property?.property_type ||
    property?.category ||
    'Imóvel'
  );
}

/* ============================================================
   ENDEREÇO
============================================================ */

function getAddressObject(property) {
  if (property?.location && typeof property.location === 'object') {
    return property.location;
  }

  if (property?.address && typeof property.address === 'object') {
    return property.address;
  }

  return null;
}

function getAddress(property) {
  const address = getAddressObject(property);

  if (!address) {
    if (typeof property?.address === 'string') {
      return property.address;
    }

    if (typeof property?.location === 'string') {
      return property.location;
    }

    return '';
  }

  const street = address?.street || '';
  const number = address?.number || '';

  const streetLine = [street, number].filter(Boolean).join(', ');

  const complement = address?.complement || '';

  const district = address?.district || address?.neighborhood || '';

  const city = address?.city || '';
  const state = address?.state || '';

  return [streetLine, complement, district, city, state]
    .filter(Boolean)
    .join(', ');
}

function getShortAddress(property) {
  const address = getAddressObject(property);

  if (!address) {
    return '';
  }

  return [address?.street, address?.number].filter(Boolean).join(', ');
}

function getNeighborhood(property) {
  const address = getAddressObject(property);

  if (address) {
    return address?.district || address?.neighborhood || '';
  }

  return property?.district || property?.neighborhood || '';
}

function getCityState(property) {
  const address = getAddressObject(property);

  if (address) {
    return [address?.city, address?.state].filter(Boolean).join(' - ');
  }

  return [property?.city, property?.state].filter(Boolean).join(' - ');
}

function getZipCode(property) {
  const address = getAddressObject(property);

  if (address) {
    return address?.zipCode || '';
  }

  return property?.zipCode || '';
}

function getRegion(property) {
  const address = getAddressObject(property);

  if (address) {
    return address?.region || '';
  }

  return property?.region || '';
}

/* ============================================================
   CARACTERÍSTICAS
============================================================ */

function getBedrooms(property) {
  return property?.bedrooms ?? property?.rooms ?? property?.dormitories ?? 0;
}

function getBathrooms(property) {
  return property?.bathrooms ?? property?.bathroomCount ?? 0;
}

function getParking(property) {
  return property?.parkingSpaces ?? property?.parking ?? property?.garage ?? 0;
}

function getArea(property) {
  if (property?.dimensions && typeof property.dimensions === 'object') {
    return (
      property.dimensions.totalArea ??
      property.dimensions.builtArea ??
      property.dimensions.landArea ??
      null
    );
  }

  if (property?.area && typeof property.area === 'object') {
    return (
      property.area.total ??
      property.area.useful ??
      property.area.built ??
      property.area.private ??
      null
    );
  }

  return (
    property?.area ??
    property?.totalArea ??
    property?.builtArea ??
    property?.usefulArea ??
    null
  );
}

function getBuiltArea(property) {
  if (property?.dimensions && typeof property.dimensions === 'object') {
    return property.dimensions.builtArea ?? null;
  }

  return property?.builtArea ?? null;
}

/* ============================================================
   PREÇOS
============================================================ */

function getSalePrice(property) {
  if (property?.prices && typeof property.prices === 'object') {
    return property.prices.salePrice ?? property.prices.sale ?? null;
  }

  return property?.salePrice ?? property?.price ?? null;
}

function getRentPrice(property) {
  if (property?.prices && typeof property.prices === 'object') {
    return property.prices.rentPrice ?? property.prices.rent ?? null;
  }

  return property?.rentPrice ?? null;
}

function getCondominiumFee(property) {
  if (property?.prices && typeof property.prices === 'object') {
    return (
      property.prices.condominiumFee ?? property.prices.condominium ?? null
    );
  }

  return null;
}

function getIptu(property) {
  if (property?.prices && typeof property.prices === 'object') {
    return property.prices.iptu ?? null;
  }

  return null;
}

/* ============================================================
   OUTROS DADOS
============================================================ */

function getDescription(property) {
  return (
    property?.description ||
    property?.shortDescription ||
    property?.details ||
    property?.notes ||
    'Este imóvel possui características que podem atender perfeitamente às suas necessidades. Entre em contato para receber mais informações.'
  );
}

function formatStatus(status) {
  if (!status) return '';

  const statusMap = {
    available: 'Disponível',
    active: 'Disponível',
    disponivel: 'Disponível',
    vendido: 'Vendido',
    sold: 'Vendido',
    rented: 'Alugado',
    alugado: 'Alugado',
    inactive: 'Inativo',
    inactive_listing: 'Inativo',
    indisponivel: 'Indisponível',
  };

  return statusMap[status] || status;
}

function formatPurpose(purpose) {
  if (!purpose) return '';

  const purposeMap = {
    venda: 'Venda',
    sale: 'Venda',
    aluguel: 'Locação',
    rent: 'Locação',
    locacao: 'Locação',
    ambos: 'Venda e locação',
  };

  return purposeMap[purpose] || purpose;
}

function formatConstructionStatus(status) {
  if (!status) return '';

  const statusMap = {
    pronto: 'Pronto',
    ready: 'Pronto',
    lancamento: 'Lançamento',
    lançamento: 'Lançamento',
    em_construcao: 'Em construção',
    'em construção': 'Em construção',
    construction: 'Em construção',
    usado: 'Usado',
    novo: 'Novo',
  };

  return statusMap[status] || status;
}

function getStatistics(property) {
  const statistics = property?.statistics || {};

  return {
    views: Number(statistics.views) || 0,
    favorites: Number(statistics.favorites) || 0,
    contacts: Number(statistics.contacts) || 0,
    visitsScheduled: Number(statistics.visitsScheduled) || 0,
    proposals: Number(statistics.proposals) || 0,
  };
}

function getFeatures(property) {
  if (Array.isArray(property?.features)) {
    return property.features.filter(Boolean);
  }

  const fallbackFeatures = [
    property?.furnished && 'Mobiliado',
    property?.hasBalcony && 'Varanda',
    property?.hasPool && 'Piscina',
    property?.hasElevator && 'Elevador',
    property?.hasGym && 'Academia',
    property?.hasSecurity && 'Segurança',
    property?.airConditioning && 'Ar-condicionado',
    property?.acceptsPets && 'Aceita pets',
    property?.petFriendly && 'Aceita pets',
    property?.solarEnergy && 'Energia solar',
  ];

  return fallbackFeatures.filter(Boolean);
}

/* ============================================================
   COMPONENTE
============================================================ */

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);

  const [property, setProperty] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeImage, setActiveImage] = useState(0);
  const [showGallery, setShowGallery] = useState(false);

  const [favorite, setFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const [showContactModal, setShowContactModal] = useState(false);

  const [contactLoading, setContactLoading] = useState(false);

  const [contactSuccess, setContactSuccess] = useState(false);

  const [shareMessage, setShareMessage] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const visitsScheduled = visits.filter(
    (visit) => visit.status === 'agendada' || visit.status === 'confirmada',
  ).length;

  /* ==========================================================
     BUSCAR IMÓVEL
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    async function loadProperty() {
      if (!id) {
        setError('Imóvel não informado.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const response = await api.get(`/api/properties/${id}`);

        const data =
          response.data?.data || response.data?.property || response.data;

        if (!mounted) return;

        setProperty(data);
        setActiveImage(0);
      } catch (err) {
        console.error('Erro ao buscar imóvel:', err);

        if (!mounted) return;

        setError(
          err.response?.data?.message ||
            'Não foi possível carregar este imóvel.',
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProperty();

    return () => {
      mounted = false;
    };
  }, [id]);

  /* ==========================================================
     IMAGENS
  ========================================================== */

  const images = useMemo(() => getPropertyImages(property), [property]);

  const fallbackImage =
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=85';

  const currentImage = images[activeImage] || fallbackImage;

  /* ==========================================================
     REGISTRAR VISUALIZAÇÃO
  ========================================================== */

  useEffect(() => {
    if (!id) return;

    async function registerPropertyView() {
      try {
        const sessionId =
          sessionStorage.getItem('propertySessionId') ||
          `${Date.now()}-${Math.random().toString(36).slice(2)}`;

        sessionStorage.setItem('propertySessionId', sessionId);

        await api.post(`/api/property-views/${id}/register`, {
          source: 'crm',
          sessionId,
          referrer: document.referrer || '',
        });
      } catch (err) {
        console.warn(
          'Erro ao registrar visualização:',
          err.response?.data || err.message,
        );
      }
    }

    registerPropertyView();
  }, [id]);

  /* ==========================================================
     FAVORITO
  ========================================================== */

  useEffect(() => {
    if (!id) return;

    async function checkFavorite() {
      try {
        const response = await api.get(`/api/property-favorite/${id}/check`);

        const data = response.data?.data || response.data;

        setFavorite(Boolean(data?.isFavorite ?? data?.favorite ?? false));
      } catch (err) {
        console.warn(
          'Não foi possível verificar favorito:',
          err.response?.data || err.message,
        );
      }
    }

    checkFavorite();
  }, [id]);

  async function handleFavorite() {
    if (!id || favoriteLoading) return;

    try {
      setFavoriteLoading(true);

      const response = await api.post(`/api/property-favorite/${id}/toggle`);

      const data = response.data?.data || response.data;

      let isNowFavorite;

      if (typeof data?.isFavorite === 'boolean') {
        isNowFavorite = data.isFavorite;

        setFavorite(data.isFavorite);
      } else if (typeof data?.favorite === 'boolean') {
        isNowFavorite = data.favorite;

        setFavorite(data.favorite);
      } else {
        isNowFavorite = !favorite;
        setFavorite((previous) => !previous);
      }

      setProperty((current) => {
        if (!current) return current;

        const currentFavorites = Number(current.statistics?.favorites) || 0;

        const nextFavorites = isNowFavorite
          ? currentFavorites + 1
          : Math.max(0, currentFavorites - 1);

        return {
          ...current,
          statistics: {
            ...(current.statistics || {}),
            favorites: nextFavorites,
          },
        };
      });
    } catch (err) {
      console.error(
        'Erro ao alterar favorito:',
        err.response?.data || err.message,
      );
    } finally {
      setFavoriteLoading(false);
    }
  }

  /* ==========================================================
     COMPARTILHAR
  ========================================================== */

  async function handleShare() {
    try {
      const url = window.location.href;

      if (navigator.share) {
        await navigator.share({
          title: getPropertyTitle(property),
          text: `${getPropertyTitle(property)} - ${getAddress(property)}`,
          url,
        });

        return;
      }

      await navigator.clipboard.writeText(url);

      setShareMessage('Link copiado!');

      setTimeout(() => {
        setShareMessage('');
      }, 2500);
    } catch (err) {
      console.warn('Compartilhamento cancelado:', err);
    }
  }

  /* ==========================================================
     GALERIA
  ========================================================== */

  function nextImage() {
    if (!images.length) return;

    setActiveImage((current) =>
      current >= images.length - 1 ? 0 : current + 1,
    );
  }

  function previousImage() {
    if (!images.length) return;

    setActiveImage((current) =>
      current <= 0 ? images.length - 1 : current - 1,
    );
  }

  /* ==========================================================
     FORMULÁRIO
  ========================================================== */

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleContactSubmit(event) {
    event.preventDefault();

    if (!id) return;

    try {
      setContactLoading(true);

      const response = await api.post(`/api/lead-capture/property/${id}`, {
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
        source: 'public',
        sourceType: 'company_site',
        propertyId: id,
        landingPage: window.location.href,
        referrer: document.referrer || '',
      });

      console.log('LEAD CAPTURADO:', response.data);

      setContactSuccess(true);

      setProperty((current) => {
        if (!current) return current;

        return {
          ...current,
          statistics: {
            ...(current.statistics || {}),
            contacts: (Number(current.statistics?.contacts) || 0) + 1,
          },
        };
      });
    } catch (err) {
      console.error(
        'Erro ao enviar contato:',
        err.response?.data || err.message,
      );

      alert(
        err.response?.data?.message ||
          'Não foi possível enviar sua solicitação. Tente novamente.',
      );
    } finally {
      setContactLoading(false);
    }
  }

  function closeContactModal() {
    if (contactLoading) return;

    setShowContactModal(false);

    setTimeout(() => {
      setContactSuccess(false);

      setForm({
        name: '',
        email: '',
        phone: '',
        message: '',
      });
    }, 200);
  }

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
          <div className="h-6 w-24 animate-pulse rounded bg-gray-800" />

          <div className="mt-6 grid gap-3 md:grid-cols-[2fr_1fr]">
            <div className="h-[420px] animate-pulse rounded-3xl bg-gray-900 md:h-[560px]" />

            <div className="hidden gap-3 md:grid">
              <div className="animate-pulse rounded-3xl bg-gray-900" />
              <div className="animate-pulse rounded-3xl bg-gray-900" />
            </div>
          </div>

          <div className="mt-8 h-10 w-3/4 animate-pulse rounded bg-gray-800" />

          <div className="mt-4 h-5 w-1/2 animate-pulse rounded bg-gray-800" />

          <div className="mt-8 grid gap-3 sm:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-2xl bg-gray-900"
              />
            ))}
          </div>

          <div className="mt-10 h-40 animate-pulse rounded-3xl bg-gray-900" />
        </div>
      </div>
    );
  }

  /* ==========================================================
     ERRO
  ========================================================== */

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>

          <h1 className="mt-8 text-2xl font-bold text-white">
            Imóvel não encontrado
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {error || 'Não conseguimos encontrar este imóvel.'}
          </p>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
        </div>
      </div>
    );
  }

  /* ==========================================================
     DADOS
  ========================================================== */

  const propertyId = getPropertyId(property);

  const title = getPropertyTitle(property);

  const type = getPropertyType(property);

  const address = getAddress(property);

  const shortAddress = getShortAddress(property);

  const neighborhood = getNeighborhood(property);

  const cityState = getCityState(property);

  const zipCode = getZipCode(property);

  const region = getRegion(property);

  const bedrooms = getBedrooms(property);

  const bathrooms = getBathrooms(property);

  const parking = getParking(property);

  const area = getArea(property);

  const builtArea = getBuiltArea(property);

  const salePrice = getSalePrice(property);

  const rentPrice = getRentPrice(property);

  const condominiumFee = getCondominiumFee(property);

  const iptu = getIptu(property);

  const description = getDescription(property);

  const displayPrice =
    salePrice || rentPrice || property?.prices?.price || null;

  const isForRent = !salePrice && Boolean(rentPrice);

  const status = formatStatus(property?.status);

  const purpose = formatPurpose(property?.purpose);

  const constructionStatus = formatConstructionStatus(
    property?.constructionStatus,
  );

  const features = getFeatures(property);

  const statistics = getStatistics(property);

  const views = statistics.views;

  const favoritesCount = statistics.favorites;

  const contacts = statistics.contacts;

  const proposals = statistics.proposals;

  const featuresMain = [
    {
      icon: BedDouble,
      label: 'Quartos',
      value: bedrooms,
    },
    {
      icon: Building2,
      label: 'Banheiros',
      value: bathrooms,
    },
    {
      icon: CarIcon,
      label: 'Vagas',
      value: parking,
    },
    {
      icon: Maximize2,
      label: 'Área',
      value: formatArea(area) || '—',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="sticky top-0 z-40 border-b border-white/10 bg-gray-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />

            <span className="hidden sm:inline">Voltar</span>
          </button>

          <div className="flex items-center gap-2">
            {shareMessage && (
              <div className="mr-2 hidden rounded-full border border-white/10 bg-gray-900 px-4 py-2 text-xs font-medium text-white shadow-xl sm:block">
                {shareMessage}
              </div>
            )}

            <button
              type="button"
              onClick={handleShare}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-gray-900 text-gray-300 transition hover:border-white/20 hover:bg-gray-800 hover:text-white"
              aria-label="Compartilhar imóvel"
            >
              <Share2 className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleFavorite}
              disabled={favoriteLoading}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition ${
                favorite
                  ? 'border-red-500/30 bg-red-500/10 text-red-400'
                  : 'border-white/10 bg-gray-900 text-gray-300 hover:border-white/20 hover:bg-gray-800 hover:text-white'
              }`}
              aria-label={
                favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'
              }
            >
              <Heart className={`h-5 w-5 ${favorite ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-32 pt-6 md:px-6 md:pb-16 md:pt-8">
        {/* ====================================================
            GALERIA
        ==================================================== */}

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-gray-900 shadow-2xl">
          <div className="grid gap-2 md:grid-cols-[2fr_1fr]">
            <button
              type="button"
              onClick={() => setShowGallery(true)}
              className="group relative h-[360px] overflow-hidden md:h-[560px]"
            >
              <img
                src={currentImage}
                alt={title}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                onError={(event) => {
                  event.currentTarget.src = fallbackImage;
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />

              <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                {type && (
                  <span className="rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-xs font-semibold capitalize text-white backdrop-blur-md">
                    {type}
                  </span>
                )}

                {status && (
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-500/90 px-3 py-1.5 text-xs font-semibold text-white">
                    {status}
                  </span>
                )}

                {property?.featured && (
                  <span className="rounded-full border border-amber-300/20 bg-amber-400 px-3 py-1.5 text-xs font-semibold text-gray-950">
                    Destaque
                  </span>
                )}

                {property?.exclusive && (
                  <span className="rounded-full border border-white/10 bg-gray-950/90 px-3 py-1.5 text-xs font-semibold text-white">
                    Exclusivo
                  </span>
                )}
              </div>

              <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
                <Maximize2 className="h-4 w-4" />

                {images.length > 0
                  ? `${images.length} ${images.length === 1 ? 'foto' : 'fotos'}`
                  : 'Ver fotos'}
              </div>

              {images.length > 1 && (
                <>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      previousImage();
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        event.stopPropagation();
                        previousImage();
                      }
                    }}
                    className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100"
                    aria-label="Foto anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </span>

                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      nextImage();
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        event.stopPropagation();
                        nextImage();
                      }
                    }}
                    className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100"
                    aria-label="Próxima foto"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </span>
                </>
              )}
            </button>

            <div className="hidden gap-2 md:grid">
              {[images[1], images[2]].map((image, index) => (
                <button
                  key={image || `secondary-${index}`}
                  type="button"
                  onClick={() => {
                    if (!image) return;

                    setActiveImage(index + 1);

                    setShowGallery(true);
                  }}
                  className="group relative overflow-hidden bg-gray-800"
                >
                  {image ? (
                    <>
                      <img
                        src={image}
                        alt={`${title} ${index + 2}`}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                      />

                      {index === 1 && images.length > 3 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <span className="rounded-full border border-white/10 bg-black/70 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md">
                            +{images.length - 3} fotos
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-600">
                      <Building2 className="h-10 w-10" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {shareMessage && (
          <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/10 bg-gray-900 px-5 py-3 text-sm font-medium text-white shadow-2xl sm:hidden">
            {shareMessage}
          </div>
        )}

        {/* ====================================================
            HEADER DO IMÓVEL
        ==================================================== */}

        <section className="mt-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {type && (
                  <span className="rounded-full border border-white/10 bg-gray-900 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-gray-300">
                    {type}
                  </span>
                )}

                {status && (
                  <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
                    {status}
                  </span>
                )}

                {purpose && (
                  <span className="rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-300">
                    {purpose}
                  </span>
                )}

                {region && (
                  <span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300">
                    {region}
                  </span>
                )}
              </div>

              <h1 className="max-w-4xl text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-[42px] lg:leading-[1.12]">
                {title}
              </h1>

              {(shortAddress || neighborhood || cityState) && (
                <div className="mt-5 flex items-start gap-3 text-gray-400">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-gray-900">
                    <MapPin className="h-4 w-4 text-blue-400" />
                  </div>

                  <div className="min-w-0">
                    {shortAddress && (
                      <p className="font-medium text-gray-200">
                        {shortAddress}
                      </p>
                    )}

                    {getAddressObject(property)?.complement && (
                      <p className="mt-1 text-sm text-gray-500">
                        {getAddressObject(property).complement}
                      </p>
                    )}

                    {neighborhood && (
                      <p className="mt-1 text-sm text-gray-500">
                        {neighborhood}
                      </p>
                    )}

                    {cityState && (
                      <p className="mt-0.5 text-sm text-gray-500">
                        {cityState}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {(views > 0 || favoritesCount > 0) && (
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-gray-900 px-3.5 py-2 text-xs font-medium text-gray-500">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-800">
                      <Users className="h-3.5 w-3.5 text-gray-400" />
                    </span>

                    <span>
                      {views} {views === 1 ? 'visualização' : 'visualizações'}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-gray-900 px-3.5 py-2 text-xs font-medium text-gray-500">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-800">
                      <Heart className="h-3.5 w-3.5 text-gray-400" />
                    </span>

                    <span>
                      {favoritesCount}{' '}
                      {favoritesCount === 1 ? 'favorito' : 'favoritos'}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                  {isForRent ? 'Aluguel' : 'Venda'}
                </p>

                <div className="mt-1 flex flex-wrap items-end gap-3">
                  <p className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                    {formatCurrency(displayPrice)}
                  </p>

                  {isForRent && (
                    <span className="mb-1 text-sm text-gray-500">/ mês</span>
                  )}
                </div>

                {isForRent && condominiumFee && (
                  <p className="mt-2 text-sm text-gray-500">
                    Condomínio: {formatCurrency(condominiumFee)}
                  </p>
                )}
              </div>

              {/* CARACTERÍSTICAS PRINCIPAIS */}

              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {featuresMain.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-gray-900 p-4 transition hover:border-white/20 hover:bg-gray-800"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-800">
                      <Icon className="h-4 w-4 text-blue-400" />
                    </div>

                    <p className="mt-4 text-lg font-bold text-white">
                      {value || '—'}
                    </p>

                    <p className="mt-0.5 text-xs text-gray-500">{label}</p>
                  </div>
                ))}
              </div>

              {(zipCode || getAddressObject(property)?.complement) && (
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">
                  {zipCode && (
                    <span>
                      CEP:{' '}
                      <strong className="font-medium text-gray-300">
                        {zipCode}
                      </strong>
                    </span>
                  )}

                  {getAddressObject(property)?.complement && (
                    <span>
                      Complemento:{' '}
                      <strong className="font-medium text-gray-300">
                        {getAddressObject(property).complement}
                      </strong>
                    </span>
                  )}
                </div>
              )}

              {/* ==================================================
                  DESEMPENHO
              ================================================== */}

              <section className="mt-8">
                <div className="rounded-3xl border border-white/10 bg-gray-900 p-5 shadow-xl">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        Desempenho do imóvel
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Interações registradas para este imóvel
                      </p>
                    </div>

                    <div className="rounded-full border border-white/10 bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-500">
                      Estatísticas
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl bg-gray-800 p-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900">
                        <Users className="h-4 w-4 text-blue-400" />
                      </div>

                      <p className="mt-3 text-xl font-bold text-white">
                        {views}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Visualizações
                      </p>
                    </div>

                    <div className="rounded-2xl bg-gray-800 p-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900">
                        <Heart className="h-4 w-4 text-red-400" />
                      </div>

                      <p className="mt-3 text-xl font-bold text-white">
                        {favoritesCount}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">Favoritos</p>
                    </div>

                    <div className="rounded-2xl bg-gray-800 p-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900">
                        <MessageCircle className="h-4 w-4 text-blue-400" />
                      </div>

                      <p className="mt-3 text-xl font-bold text-white">
                        {contacts}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">Contatos</p>
                    </div>

                    <div className="rounded-2xl bg-gray-800 p-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900">
                        <CalendarDays className="h-4 w-4 text-purple-400" />
                      </div>

                      <p className="mt-3 text-xl font-bold text-white">
                        {visitsScheduled}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">Visitas</p>
                    </div>
                  </div>

                  {proposals > 0 && (
                    <div className="mt-3 flex items-center justify-between rounded-2xl bg-gray-800 px-4 py-3">
                      <span className="text-sm text-gray-500">
                        Propostas recebidas
                      </span>

                      <span className="text-sm font-bold text-white">
                        {proposals}
                      </span>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* ==================================================
                CARD DE CONTATO
            ================================================== */}

            <aside className="hidden lg:block">
              <div className="sticky top-24 rounded-3xl border border-white/10 bg-gray-900 p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-bold text-white">
                      Gostou deste imóvel?
                    </p>

                    <p className="mt-1 text-sm leading-6 text-gray-500">
                      Fale com um especialista e receba mais informações sobre
                      este imóvel.
                    </p>
                  </div>

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                    <MessageCircle className="h-5 w-5 text-blue-400" />
                  </div>
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-gray-800 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {isForRent ? 'Aluguel' : 'Valor do imóvel'}
                  </p>

                  <p className="mt-1 text-xl font-bold text-white">
                    {formatCurrency(displayPrice)}
                  </p>

                  {isForRent && (
                    <p className="mt-0.5 text-xs text-gray-500">por mês</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setShowContactModal(true)}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-500 active:scale-[0.99]"
                >
                  <MessageCircle className="h-4 w-4" />
                  Tenho interesse
                </button>

                <div className="mt-6 space-y-3 border-t border-white/10 pt-5">
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    </div>

                    <span>Atendimento seguro</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10">
                      <Check className="h-4 w-4 text-emerald-400" />
                    </div>

                    <span>Sem compromisso</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10">
                      <Users className="h-4 w-4 text-blue-400" />
                    </div>

                    <span>Atendimento personalizado</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        {/* DIVISOR */}

        <div className="mt-12 border-t border-white/10" />

        {/* ====================================================
            DESCRIÇÃO
        ==================================================== */}

        <section className="pt-10">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              Sobre este imóvel
            </h2>

            <p className="mt-5 whitespace-pre-line text-base leading-8 text-gray-400">
              {description}
            </p>
          </div>
        </section>

        {/* ====================================================
            CARACTERÍSTICAS
        ==================================================== */}

        <section className="mt-12 border-t border-white/10 pt-10">
          <div className="max-w-5xl">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                  Características
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Comodidades e diferenciais deste imóvel.
                </p>
              </div>

              {features.length > 0 && (
                <span className="text-xs font-medium text-gray-600">
                  {features.length} {features.length === 1 ? 'item' : 'itens'}
                </span>
              )}
            </div>

            {features.length > 0 ? (
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, index) => (
                  <div
                    key={`${feature}-${index}`}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-gray-900 px-4 py-4 transition hover:border-white/20 hover:bg-gray-800"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                      <Check className="h-4 w-4 text-emerald-400" />
                    </div>

                    <span className="text-sm font-medium text-gray-300">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm leading-6 text-gray-500">
                Consulte um especialista para conhecer todas as características
                deste imóvel.
              </p>
            )}
          </div>
        </section>

        {/* ====================================================
            DETALHES
        ==================================================== */}

        <section className="mt-12 border-t border-white/10 pt-10">
          <div className="max-w-5xl">
            <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              Detalhes do imóvel
            </h2>

            <div className="mt-6 grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  label: 'Tipo',
                  value: type,
                },
                {
                  label: 'Finalidade',
                  value: purpose || '—',
                },
                {
                  label: 'Status',
                  value: status || '—',
                },
                {
                  label: 'Construção',
                  value: constructionStatus || '—',
                },
                {
                  label: 'Quartos',
                  value: bedrooms,
                },
                {
                  label: 'Banheiros',
                  value: bathrooms,
                },
                {
                  label: 'Vagas',
                  value: parking,
                },
                {
                  label: 'Área total',
                  value: formatArea(area) || '—',
                },
                {
                  label: 'Área construída',
                  value: formatArea(builtArea) || '—',
                },
                {
                  label: 'Andar',
                  value: property?.floor ?? '—',
                },
                {
                  label: 'Cidade',
                  value: cityState || '—',
                },
                {
                  label: 'Bairro',
                  value: neighborhood || '—',
                },
                {
                  label: 'Região',
                  value: region || '—',
                },
                {
                  label: 'Condomínio',
                  value: condominiumFee ? formatCurrency(condominiumFee) : '—',
                },
                {
                  label: 'IPTU',
                  value: iptu ? formatCurrency(iptu) : '—',
                },
                {
                  label: 'Financiamento',
                  value: property?.acceptsFinancing
                    ? 'Aceita'
                    : 'Não informado',
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 border-b border-white/10 pb-4"
                >
                  <span className="text-sm text-gray-500">{label}</span>

                  <span className="text-right text-sm font-semibold text-gray-200">
                    {value || '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====================================================
            LOCALIZAÇÃO
        ==================================================== */}

        <section className="mt-12 border-t border-white/10 pt-10">
          <div className="max-w-5xl">
            <h2 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              Localização
            </h2>

            <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-gray-900">
              <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900">
                <div className="absolute left-[15%] top-[20%] h-20 w-20 rounded-full bg-blue-500/10 blur-2xl" />

                <div className="absolute bottom-[15%] right-[20%] h-32 w-32 rounded-full bg-purple-500/10 blur-3xl" />

                <div className="relative z-10 px-6 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-blue-400/20 bg-blue-500/10">
                    <MapPin className="h-7 w-7 text-blue-400" />
                  </div>

                  {shortAddress && (
                    <p className="mt-5 text-lg font-bold text-white">
                      {shortAddress}
                    </p>
                  )}

                  {neighborhood && (
                    <p className="mt-1 text-sm font-medium text-gray-400">
                      {neighborhood}
                    </p>
                  )}

                  {cityState && (
                    <p className="mt-1 text-sm text-gray-500">{cityState}</p>
                  )}

                  {zipCode && (
                    <p className="mt-1 text-xs text-gray-600">CEP {zipCode}</p>
                  )}

                  {getAddressObject(property)?.complement && (
                    <p className="mt-2 text-xs text-gray-600">
                      {getAddressObject(property).complement}
                    </p>
                  )}

                  <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-gray-500">
                    Entre em contato para receber informações detalhadas sobre a
                    localização deste imóvel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            CTA FINAL
        ==================================================== */}

        <section className="mt-12 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-blue-600/20 via-gray-900 to-gray-950 px-6 py-10 text-white md:px-10 md:py-12">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-400">
                <Sparkles className="h-4 w-4" />
                Atendimento personalizado
              </div>

              <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
                Quer saber mais sobre este imóvel?
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400">
                Envie seus dados e nossa equipe entrará em contato para ajudar
                você a conhecer melhor esta oportunidade.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowContactModal(true)}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-500 active:scale-[0.99]"
            >
              Tenho interesse
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>

      {/* ======================================================
          MOBILE CTA
      ====================================================== */}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-gray-950/95 p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <button
            type="button"
            onClick={handleFavorite}
            disabled={favoriteLoading}
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition ${
              favorite
                ? 'border-red-500/30 bg-red-500/10 text-red-400'
                : 'border-white/10 bg-gray-900 text-gray-300'
            }`}
            aria-label="Favoritar imóvel"
          >
            <Heart className={`h-5 w-5 ${favorite ? 'fill-current' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setShowContactModal(true)}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            <MessageCircle className="h-4 w-4" />
            Tenho interesse
          </button>
        </div>
      </div>

      {/* ======================================================
          GALERIA COMPLETA
      ====================================================== */}

      {showGallery && (
        <div className="fixed inset-0 z-[100] bg-black">
          <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-4 md:px-8">
            <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur">
              {images.length
                ? `${activeImage + 1} / ${images.length}`
                : '1 / 1'}
            </div>

            <button
              type="button"
              onClick={() => setShowGallery(false)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
              aria-label="Fechar galeria"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex h-full items-center justify-center px-4 py-20">
            <img
              src={currentImage}
              alt={title}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={previousImage}
                className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 md:left-8"
                aria-label="Imagem anterior"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                type="button"
                onClick={nextImage}
                className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20 md:right-8"
                aria-label="Próxima imagem"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-5 left-1/2 z-20 flex max-w-[90vw] -translate-x-1/2 gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-black/50 p-2 backdrop-blur-xl">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    activeImage === index
                      ? 'border-blue-500'
                      : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${title} miniatura ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================
          MODAL DE CONTATO
      ====================================================== */}

      {showContactModal && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeContactModal();
            }
          }}
        >
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-gray-900 p-6 shadow-2xl md:p-8">
            <button
              type="button"
              onClick={closeContactModal}
              disabled={contactLoading}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition hover:bg-gray-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>

            {!contactSuccess ? (
              <>
                <div className="pr-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>

                  <h2 className="mt-5 text-2xl font-bold tracking-tight text-white">
                    Tenho interesse
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Preencha seus dados e nossa equipe entrará em contato com
                    você sobre este imóvel.
                  </p>
                </div>

                <form onSubmit={handleContactSubmit} className="mt-7 space-y-4">
                  <div>
                    <label
                      htmlFor="property-contact-name"
                      className="mb-1.5 block text-sm font-medium text-gray-300"
                    >
                      Nome
                    </label>

                    <input
                      id="property-contact-name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleFormChange}
                      required
                      autoComplete="name"
                      placeholder="Seu nome"
                      className="w-full rounded-xl border border-white/10 bg-gray-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="property-contact-email"
                      className="mb-1.5 block text-sm font-medium text-gray-300"
                    >
                      E-mail
                    </label>

                    <input
                      id="property-contact-email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleFormChange}
                      required
                      autoComplete="email"
                      placeholder="voce@email.com"
                      className="w-full rounded-xl border border-white/10 bg-gray-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="property-contact-phone"
                      className="mb-1.5 block text-sm font-medium text-gray-300"
                    >
                      WhatsApp / Telefone
                    </label>

                    <input
                      id="property-contact-phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleFormChange}
                      required
                      autoComplete="tel"
                      placeholder="(11) 99999-9999"
                      className="w-full rounded-xl border border-white/10 bg-gray-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="property-contact-message"
                      className="mb-1.5 block text-sm font-medium text-gray-300"
                    >
                      Mensagem
                    </label>

                    <textarea
                      id="property-contact-message"
                      name="message"
                      value={form.message}
                      onChange={handleFormChange}
                      rows={4}
                      placeholder={`Olá, tenho interesse no imóvel "${title}".`}
                      className="w-full resize-none rounded-xl border border-white/10 bg-gray-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-gray-800 p-4">
                    <div className="flex gap-3">
                      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />

                      <p className="text-xs leading-5 text-gray-500">
                        Seus dados serão utilizados apenas para entrarmos em
                        contato sobre este imóvel.
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={contactLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {contactLoading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="h-4 w-4" />
                        Enviar solicitação
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                  <Check className="h-8 w-8 text-emerald-400" />
                </div>

                <h2 className="mt-6 text-2xl font-bold text-white">
                  Solicitação enviada!
                </h2>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500">
                  Recebemos seu interesse neste imóvel. Nossa equipe entrará em
                  contato com você em breve.
                </p>

                <button
                  type="button"
                  onClick={closeContactModal}
                  className="mt-7 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ÍCONE DE CARRO
============================================================ */

function CarIcon(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6.5 17H5a2 2 0 0 1-2-2v-2.5a2 2 0 0 1 1.5-1.94l1.2-.3 1.1-3.3A2 2 0 0 1 8.7 5.6h6.6a2 2 0 0 1 1.9 1.36l1.1 3.3 1.2.3A2 2 0 0 1 21 12.5V15a2 2 0 0 1-2 2h-1.5" />
      <path d="M7 10h10" />
      <circle cx="7" cy="17" r="1.5" />
      <circle cx="17" cy="17" r="1.5" />
    </svg>
  );
}

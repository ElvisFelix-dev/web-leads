import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  DollarSign,
  FileText,
  Home,
  Image as ImageIcon,
  Info,
  Landmark,
  Mail,
  MapPin,
  Maximize2,
  Percent,
  Phone,
  Ruler,
  ShieldCheck,
  Tag,
  User,
  Users,
  X,
} from 'lucide-react';

import api from '../service/api';

/*
============================================================
HELPERS
============================================================
*/

function formatCurrency(value) {
  if (
    value === null ||
    value === undefined ||
    value === '' ||
    Number.isNaN(Number(value))
  ) {
    return '—';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value));
}

function formatNumber(value) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  return new Intl.NumberFormat('pt-BR').format(Number(value));
}

function formatArea(value) {
  if (value === null || value === undefined || value === '') {
    return '—';
  }

  const number = Number(String(value).replace(',', '.'));

  if (Number.isNaN(number)) {
    return value;
  }

  return `${new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 2,
  }).format(number)} m²`;
}

function formatDate(value) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function formatBoolean(value) {
  if (value === true) return 'Sim';
  if (value === false) return 'Não';
  return '—';
}

function formatStatus(status) {
  if (!status) return '—';

  const map = {
    available: 'Disponível',
    active: 'Disponível',
    disponivel: 'Disponível',
    vendido: 'Vendido',
    sold: 'Vendido',
    rented: 'Alugado',
    alugado: 'Alugado',
    indisponivel: 'Indisponível',
    inactive: 'Inativo',
    inactive_listing: 'Inativo',
  };

  return map[status] || status;
}

function formatPurpose(purpose) {
  if (!purpose) return '—';

  const map = {
    venda: 'Venda',
    sale: 'Venda',
    aluguel: 'Locação',
    rent: 'Locação',
    locacao: 'Locação',
    ambos: 'Venda e locação',
  };

  return map[purpose] || purpose;
}

function formatConstructionStatus(status) {
  if (!status) return '—';

  const map = {
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

  return map[status] || status;
}

function getPersonName(person) {
  if (!person) return '—';

  if (typeof person === 'string') {
    return person;
  }

  return (
    person.name ||
    person.fullName ||
    person.username ||
    person.email ||
    person._id ||
    '—'
  );
}

function getPersonPhone(person) {
  if (!person || typeof person === 'string') {
    return '';
  }

  return person.phone || '';
}

function getPersonEmail(person) {
  if (!person || typeof person === 'string') {
    return '';
  }

  return person.email || '';
}

function getPropertyImages(property) {
  if (!property) return [];

  const images = [];

  if (property.coverImage) {
    images.push(property.coverImage);
  }

  if (Array.isArray(property.images)) {
    property.images.forEach((item) => {
      const url = typeof item === 'string' ? item : item?.url;

      if (url && !images.includes(url)) {
        images.push(url);
      }
    });
  }

  if (Array.isArray(property.image)) {
    property.image.forEach((item) => {
      const url = typeof item === 'string' ? item : item?.url;

      if (url && !images.includes(url)) {
        images.push(url);
      }
    });
  }

  return images;
}

function getFeatures(property) {
  if (Array.isArray(property?.features) && property.features.length) {
    return property.features.filter(Boolean);
  }

  const fallback = [
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

  return fallback.filter(Boolean);
}

function getCoordinates(property) {
  const coordinates = property?.location?.coordinates;

  if (!coordinates) return null;

  if (Array.isArray(coordinates)) {
    return coordinates;
  }

  if (typeof coordinates === 'object') {
    return [
      coordinates.lng ?? coordinates.longitude ?? null,
      coordinates.lat ?? coordinates.latitude ?? null,
    ];
  }

  return null;
}

/*
============================================================
SMALL COMPONENTS
============================================================
*/

function Section({ icon: Icon, title, description, children, className = '' }) {
  return (
    <section
      className={`
        rounded-2xl
        border
        border-white/10
        bg-[#111827]
        p-6
        shadow-xl
        ${className}
      `}
    >
      <div className="mb-6 flex items-start gap-4">
        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-blue-500/10
            text-blue-400
          "
        >
          <Icon size={20} />
        </div>

        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-white">{title}</h2>

          {description && (
            <p className="mt-1 text-sm text-gray-400">{description}</p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}

function InfoItem({ label, value, icon: Icon, children }) {
  return (
    <div
      className="
        rounded-xl
        border
        border-white/5
        bg-white/[0.025]
        p-4
      "
    >
      <div className="flex items-center gap-2">
        {Icon && <Icon size={15} className="text-gray-500" />}

        <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </span>
      </div>

      {children || (
        <p className="mt-2 break-words text-sm font-medium text-gray-200">
          {value || '—'}
        </p>
      )}
    </div>
  );
}

function Badge({ children, className = '' }) {
  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        border
        border-white/10
        bg-white/5
        px-3
        py-1
        text-xs
        font-medium
        text-gray-300
        ${className}
      `}
    >
      {children}
    </span>
  );
}

function PersonCard({ title, person, accent = 'blue', children }) {
  const name = getPersonName(person);
  const phone = getPersonPhone(person);
  const email = getPersonEmail(person);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <div className="flex items-start gap-4">
        <div
          className={`
            flex
            h-12
            w-12
            shrink-0
            items-center
            justify-center
            rounded-full
            ${
              accent === 'green'
                ? 'bg-emerald-500/10 text-emerald-400'
                : accent === 'amber'
                  ? 'bg-amber-500/10 text-amber-400'
                  : 'bg-blue-500/10 text-blue-400'
            }
          `}
        >
          <User size={21} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {title}
          </p>

          <h3 className="mt-1 truncate text-base font-semibold text-white">
            {name}
          </h3>

          {phone && (
            <a
              href={`tel:${phone}`}
              className="mt-2 flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
            >
              <Phone size={14} />
              {phone}
            </a>
          )}

          {email && (
            <a
              href={`mailto:${email}`}
              className="mt-1 flex items-center gap-2 truncate text-sm text-gray-400 transition hover:text-white"
            >
              <Mail size={14} />
              {email}
            </a>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}

/*
============================================================
COMPONENT
============================================================
*/

export default function PropertyCRMDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [activeImage, setActiveImage] = useState(0);

  const [showGallery, setShowGallery] = useState(false);

  /*
  ==========================================================
  BUSCAR IMÓVEL
  ==========================================================
  */

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

        /*
        ------------------------------------------------------
        IMPORTANTE
        ------------------------------------------------------

        Neste primeiro momento usamos a rota existente.

        Depois podemos criar:

        GET /api/properties/:id/crm

        para garantir que owner, captation e notas internas
        nunca sejam enviados pela API pública.
        ------------------------------------------------------
        */

        const response = await api.get(`/api/properties/${id}/crm`);

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

  /*
  ==========================================================
  IMAGENS
  ==========================================================
  */

  const images = useMemo(() => getPropertyImages(property), [property]);

  const fallbackImage =
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=85';

  const currentImage = images[activeImage] || fallbackImage;

  /*
  ==========================================================
  DADOS
  ==========================================================
  */

  const location = property?.location || {};

  const prices = property?.prices || {};

  const owner = property?.owner || {};

  const captation = property?.captation || {};

  const statistics = property?.statistics || {};

  const condominium = property?.condominium || {};

  const documentation = property?.documentation || {};

  const features = getFeatures(property);

  const coordinates = getCoordinates(property);

  const broker = property?.broker;

  const createdBy = property?.createdBy;

  const responsible =
    property?.responsible ||
    property?.assignedTo ||
    property?.responsibleBroker;

  const propertyTitle = property?.name || property?.title || 'Imóvel';

  const propertyCode = property?.code || property?.formattedCode || '—';

  const shortAddress = [location.street, location.number]
    .filter(Boolean)
    .join(', ');

  const cityState = [location.city, location.state].filter(Boolean).join(' / ');

  /*
  ==========================================================
  ESTATÍSTICAS
  ==========================================================
  */

  const stats = [
    {
      label: 'Visualizações',
      value: Number(statistics.views) || 0,
    },
    {
      label: 'Favoritos',
      value: Number(statistics.favorites) || 0,
    },
    {
      label: 'Contatos',
      value: Number(statistics.contacts) || 0,
    },
    {
      label: 'Visitas',
      value: Number(statistics.visitsScheduled) || 0,
    },
    {
      label: 'Propostas',
      value: Number(statistics.proposals) || 0,
    },
  ];

  /*
  ==========================================================
  LOADING
  ==========================================================
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1120] px-4 py-8 text-white md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-40 rounded-lg bg-white/10" />

            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              <div className="h-[420px] rounded-2xl bg-white/5" />

              <div className="space-y-4">
                <div className="h-10 rounded-xl bg-white/5" />
                <div className="h-32 rounded-xl bg-white/5" />
                <div className="h-32 rounded-xl bg-white/5" />
              </div>
            </div>

            <div className="h-64 rounded-2xl bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  /*
  ==========================================================
  ERROR
  ==========================================================
  */

  if (error || !property) {
    return (
      <div className="min-h-screen bg-[#0b1120] px-4 py-16 text-white md:px-6">
        <div className="mx-auto max-w-4xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-white/10
              bg-white/5
              px-4
              py-2.5
              text-sm
              font-medium
              text-gray-300
              transition
              hover:bg-white/10
              hover:text-white
            "
          >
            <ArrowLeft size={17} />
            Voltar
          </button>

          <div className="mt-10 rounded-2xl border border-red-500/20 bg-red-500/5 p-8">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-red-500/10 p-3 text-red-400">
                <Info size={22} />
              </div>

              <div>
                <h1 className="text-xl font-semibold text-white">
                  Imóvel não encontrado
                </h1>

                <p className="mt-2 text-sm text-gray-400">
                  {error || 'Não conseguimos encontrar este imóvel.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1120] text-gray-200">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:py-8">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="
                mb-4
                inline-flex
                items-center
                gap-2
                text-sm
                font-medium
                text-gray-400
                transition
                hover:text-white
              "
            >
              <ArrowLeft size={17} />
              Voltar
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                {propertyTitle}
              </h1>

              <Badge>Código: {propertyCode}</Badge>

              <Badge>{formatStatus(property.status)}</Badge>
            </div>

            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-400">
              <MapPin size={15} />

              {shortAddress || 'Endereço não informado'}

              {cityState && (
                <>
                  <span className="text-gray-600">•</span>

                  {cityState}
                </>
              )}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {property.featured && (
              <Badge className="border-amber-500/20 bg-amber-500/10 text-amber-400">
                Destaque
              </Badge>
            )}

            {property.exclusive && (
              <Badge className="border-purple-500/20 bg-purple-500/10 text-purple-400">
                Exclusivo
              </Badge>
            )}

            {property.published && (
              <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                Publicado
              </Badge>
            )}
          </div>
        </div>

        {/* ==================================================
            GALERIA + RESUMO
        ================================================== */}

        <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
          {/* GALERIA */}

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827]">
            <div
              className="group relative aspect-[16/10] cursor-pointer overflow-hidden"
              onClick={() => images.length && setShowGallery(true)}
            >
              <img
                src={currentImage}
                alt={propertyTitle}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

              <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-lg bg-black/50 px-3 py-2 text-xs text-white backdrop-blur">
                <ImageIcon size={15} />
                {images.length || 0}{' '}
                {images.length === 1 ? 'imagem' : 'imagens'}
              </div>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();

                      setActiveImage((current) =>
                        current === 0 ? images.length - 1 : current - 1,
                      );
                    }}
                    className="
                      absolute
                      left-4
                      top-1/2
                      flex
                      h-10
                      w-10
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-full
                      bg-black/50
                      text-white
                      backdrop-blur
                      transition
                      hover:bg-black/70
                    "
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();

                      setActiveImage((current) =>
                        current === images.length - 1 ? 0 : current + 1,
                      );
                    }}
                    className="
                      absolute
                      right-4
                      top-1/2
                      flex
                      h-10
                      w-10
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-full
                      bg-black/50
                      text-white
                      backdrop-blur
                      transition
                      hover:bg-black/70
                    "
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-3">
                {images.map((image, index) => (
                  <button
                    type="button"
                    key={`${image}-${index}`}
                    onClick={() => setActiveImage(index)}
                    className={`
                        h-16
                        w-24
                        shrink-0
                        overflow-hidden
                        rounded-lg
                        border-2
                        transition
                        ${
                          activeImage === index
                            ? 'border-blue-500'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }
                      `}
                  >
                    <img
                      src={image}
                      alt={`${propertyTitle} ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RESUMO */}

          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#111827] p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
                  <DollarSign size={21} />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Valor de venda
                  </p>

                  <p className="mt-1 text-2xl font-bold text-white">
                    {formatCurrency(prices.salePrice)}
                  </p>
                </div>
              </div>

              {prices.rentPrice && (
                <div className="mt-5 border-t border-white/10 pt-5">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Valor de locação
                  </p>

                  <p className="mt-1 text-lg font-semibold text-white">
                    {formatCurrency(prices.rentPrice)}
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <InfoItem label="Tipo" value={property.type || '—'} icon={Home} />

              <InfoItem
                label="Finalidade"
                value={formatPurpose(property.purpose)}
                icon={Tag}
              />

              <InfoItem
                label="Quartos"
                value={property.bedrooms ?? '—'}
                icon={Building2}
              />

              <InfoItem
                label="Banheiros"
                value={property.bathrooms ?? '—'}
                icon={ShieldCheck}
              />

              <InfoItem
                label="Vagas"
                value={property.parkingSpaces ?? property.parking ?? '—'}
                icon={Car}
              />

              <InfoItem
                label="Área"
                value={formatArea(property.area)}
                icon={Maximize2}
              />
            </div>
          </div>
        </div>

        {/* ==================================================
            DADOS PRINCIPAIS
        ================================================== */}

        <div className="mt-6">
          <Section
            icon={Home}
            title="Informações do imóvel"
            description="Dados comerciais e características principais."
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem label="Nome" value={property.name} />

              <InfoItem label="Código" value={property.code} />

              <InfoItem label="Slug" value={property.slug} />

              <InfoItem label="Categoria" value={property.category} />

              <InfoItem label="Tipo" value={property.type} />

              <InfoItem
                label="Finalidade"
                value={formatPurpose(property.purpose)}
              />

              <InfoItem label="Status" value={formatStatus(property.status)} />

              <InfoItem
                label="Construção"
                value={formatConstructionStatus(property.constructionStatus)}
              />

              <InfoItem label="Quartos" value={property.bedrooms} />

              <InfoItem label="Suítes" value={property.suites} />

              <InfoItem label="Banheiros" value={property.bathrooms} />

              <InfoItem label="Lavabos" value={property.lavabos} />

              <InfoItem
                label="Vagas"
                value={property.parkingSpaces ?? property.parking}
              />

              <InfoItem label="Andar" value={property.floor} />

              <InfoItem label="Total de andares" value={property.totalFloors} />

              <InfoItem
                label="Mobiliado"
                value={formatBoolean(property.furnished)}
              />

              <InfoItem
                label="Aceita pets"
                value={formatBoolean(property.acceptsPets)}
              />
            </div>
          </Section>
        </div>

        {/* ==================================================
            ÁREAS
        ================================================== */}

        <div className="mt-6">
          <Section icon={Ruler} title="Áreas e dimensões">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem label="Área total" value={formatArea(property.area)} />

              <InfoItem
                label="Área construída"
                value={formatArea(property.builtArea)}
              />

              <InfoItem
                label="Área do terreno"
                value={formatArea(property.landArea)}
              />

              <InfoItem
                label="Área útil"
                value={formatArea(property.usableArea)}
              />

              <InfoItem label="Frente" value={formatArea(property.front)} />

              <InfoItem label="Fundo" value={formatArea(property.back)} />

              <InfoItem
                label="Lateral direita"
                value={formatArea(property.rightSide)}
              />

              <InfoItem
                label="Lateral esquerda"
                value={formatArea(property.leftSide)}
              />
            </div>
          </Section>
        </div>

        {/* ==================================================
            VALORES
        ================================================== */}

        <div className="mt-6">
          <Section
            icon={DollarSign}
            title="Informações financeiras"
            description="Valores cadastrados internamente para este imóvel."
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem
                label="Venda"
                value={formatCurrency(prices.salePrice)}
              />

              <InfoItem
                label="Locação"
                value={formatCurrency(prices.rentPrice)}
              />

              <InfoItem
                label="Condomínio"
                value={formatCurrency(
                  prices.condominiumFee ?? property.condominiumFee,
                )}
              />

              <InfoItem
                label="IPTU"
                value={formatCurrency(prices.iptu ?? property.iptu)}
              />

              <InfoItem
                label="Outras taxas"
                value={formatCurrency(prices.otherFees)}
              />

              <InfoItem
                label="Preço por m²"
                value={formatCurrency(prices.pricePerSquareMeter)}
              />

              <InfoItem
                label="Aceita financiamento"
                value={formatBoolean(property.acceptsFinancing)}
              />

              <InfoItem
                label="Aceita FGTS"
                value={formatBoolean(property.acceptsFGTS)}
              />
            </div>
          </Section>
        </div>

        {/* ==================================================
            LOCALIZAÇÃO COMPLETA
        ================================================== */}

        <div className="mt-6">
          <Section
            icon={MapPin}
            title="Localização completa"
            description="Informações completas do endereço, disponíveis apenas no CRM."
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoItem label="CEP" value={location.zipCode} />

              <InfoItem label="Estado" value={location.state} />

              <InfoItem label="Cidade" value={location.city} />

              <InfoItem label="Região" value={location.region} />

              <InfoItem label="Bairro" value={location.district} />

              <InfoItem label="Rua" value={location.street} />

              <InfoItem label="Número" value={location.number} />

              <InfoItem label="Complemento" value={location.complement} />

              <InfoItem
                label="Ponto de referência"
                value={location.reference}
              />
            </div>

            <div className="mt-4 rounded-xl border border-white/5 bg-black/10 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Endereço completo
              </p>

              <p className="mt-2 text-sm text-gray-200">
                {[
                  location.street,
                  location.number,
                  location.complement,
                  location.district,
                  location.city,
                  location.state,
                  location.zipCode,
                ]
                  .filter(Boolean)
                  .join(', ') || '—'}
              </p>
            </div>

            {coordinates && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InfoItem label="Longitude" value={coordinates[0] ?? '—'} />

                <InfoItem label="Latitude" value={coordinates[1] ?? '—'} />
              </div>
            )}
          </Section>
        </div>

        {/* ==================================================
            DESCRIÇÃO
        ================================================== */}

        <div className="mt-6">
          <Section icon={FileText} title="Descrição">
            <div className="space-y-5">
              {property.shortDescription && (
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                    Descrição curta
                  </p>

                  <p className="whitespace-pre-line text-sm leading-7 text-gray-300">
                    {property.shortDescription}
                  </p>
                </div>
              )}

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                  Descrição completa
                </p>

                <p className="whitespace-pre-line text-sm leading-7 text-gray-300">
                  {property.description || 'Nenhuma descrição cadastrada.'}
                </p>
              </div>
            </div>
          </Section>
        </div>

        {/* ==================================================
            CARACTERÍSTICAS
        ================================================== */}

        <div className="mt-6">
          <Section icon={Check} title="Características e diferenciais">
            {features.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {features.map((feature, index) => (
                  <Badge
                    key={`${feature}-${index}`}
                    className="border-emerald-500/10 bg-emerald-500/5 text-emerald-300"
                  >
                    <Check size={13} className="mr-2" />

                    {feature}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Nenhuma característica cadastrada.
              </p>
            )}

            {Array.isArray(property.highlights) &&
              property.highlights.length > 0 && (
                <div className="mt-6">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                    Destaques
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {property.highlights.map((highlight, index) => (
                      <Badge
                        key={`${highlight}-${index}`}
                        className="border-blue-500/10 bg-blue-500/5 text-blue-300"
                      >
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
          </Section>
        </div>

        {/* ==================================================
            PROPRIETÁRIO
        ================================================== */}

        <div className="mt-6">
          <Section
            icon={User}
            title="Proprietário"
            description="Informações internas. Não devem ser exibidas no site ou hotsite."
          >
            <div className="grid gap-4 lg:grid-cols-2">
              <PersonCard
                title="Proprietário do imóvel"
                person={owner}
                accent="amber"
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <InfoItem
                  label="Nome"
                  value={owner.name || owner.fullName}
                  icon={User}
                />

                <InfoItem label="Telefone" value={owner.phone} icon={Phone} />

                <InfoItem label="E-mail" value={owner.email} icon={Mail} />

                <InfoItem
                  label="Documento"
                  value={owner.document || owner.cpf || owner.cnpj}
                  icon={FileText}
                />
              </div>
            </div>
          </Section>
        </div>

        {/* ==================================================
            CAPTAÇÃO
        ================================================== */}

        <div className="mt-6">
          <Section
            icon={Percent}
            title="Captação do imóvel"
            description="Informações exclusivamente internas para controle da comissão de captação."
          >
            <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
              <PersonCard
                title="Corretor captador"
                person={captation.broker}
                accent="green"
              >
                {captation.broker && typeof captation.broker === 'object' && (
                  <>
                    {captation.broker.position && (
                      <p className="mt-2 text-xs text-gray-500">
                        {captation.broker.position}
                      </p>
                    )}

                    {captation.broker.creci && (
                      <p className="mt-1 text-xs text-gray-500">
                        CRECI: {captation.broker.creci}
                      </p>
                    )}
                  </>
                )}
              </PersonCard>

              <div className="min-w-[220px] rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-400/70">
                  Percentual de captação
                </p>

                <p className="mt-2 text-4xl font-bold text-emerald-400">
                  {Number(captation.percentage) || 0}%
                </p>

                <p className="mt-2 text-xs leading-5 text-gray-500">
                  Percentual destinado ao corretor captador quando a venda for
                  concluída.
                </p>
              </div>
            </div>
          </Section>
        </div>

        {/* ==================================================
            RESPONSÁVEIS
        ================================================== */}

        <div className="mt-6">
          <Section icon={Users} title="Responsáveis pelo imóvel">
            <div className="grid gap-4 md:grid-cols-3">
              <PersonCard title="Corretor responsável" person={broker} />

              <PersonCard
                title="Criado por"
                person={createdBy}
                accent="amber"
              />

              <PersonCard
                title="Responsável atual"
                person={responsible}
                accent="green"
              />
            </div>
          </Section>
        </div>

        {/* ==================================================
            CONDOMÍNIO
        ================================================== */}

        <div className="mt-6">
          <Section icon={Building2} title="Informações do condomínio">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem label="Nome" value={condominium.name} />

              <InfoItem label="Blocos" value={condominium.blocks} />

              <InfoItem label="Torres" value={condominium.towers} />

              <InfoItem label="Apartamentos" value={condominium.apartments} />

              <InfoItem
                label="Elevador"
                value={formatBoolean(condominium.hasElevator)}
              />

              <InfoItem label="Portaria" value={condominium.concierge} />

              <InfoItem
                label="Segurança"
                value={formatBoolean(condominium.security)}
              />

              <InfoItem label="Taxa" value={formatCurrency(condominium.fee)} />
            </div>
          </Section>
        </div>

        {/* ==================================================
            DOCUMENTAÇÃO
        ================================================== */}

        <div className="mt-6">
          <Section
            icon={ClipboardList}
            title="Documentação"
            description="Informações documentais disponíveis internamente."
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoItem
                label="Matrícula"
                value={
                  documentation.registration ||
                  documentation.registry ||
                  documentation.matricula
                }
              />

              <InfoItem
                label="Escritura"
                value={documentation.deed || documentation.escritura}
              />

              <InfoItem label="Registro" value={documentation.register} />

              <InfoItem
                label="Documentação completa"
                value={formatBoolean(documentation.complete)}
              />

              <InfoItem
                label="Financiável"
                value={formatBoolean(
                  documentation.financiable ?? property.acceptsFinancing,
                )}
              />

              <InfoItem
                label="FGTS"
                value={formatBoolean(
                  documentation.fgts ?? property.acceptsFGTS,
                )}
              />
            </div>

            {documentation.notes && (
              <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.025] p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Observações da documentação
                </p>

                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-300">
                  {documentation.notes}
                </p>
              </div>
            )}
          </Section>
        </div>

        {/* ==================================================
            ESTATÍSTICAS
        ================================================== */}

        <div className="mt-6">
          <Section
            icon={Info}
            title="Estatísticas do imóvel"
            description="Indicadores registrados pelo CRM e pelo site."
          >
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="
                      rounded-2xl
                      border
                      border-white/5
                      bg-white/[0.025]
                      p-5
                      text-center
                    "
                >
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(item.value)}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">{item.label}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>

        {/* ==================================================
            DATAS
        ================================================== */}

        <div className="mt-6">
          <Section icon={CalendarDays} title="Datas e atividade">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem
                label="Criado em"
                value={formatDate(property.createdAt)}
                icon={CalendarDays}
              />

              <InfoItem
                label="Atualizado em"
                value={formatDate(property.updatedAt)}
                icon={CalendarDays}
              />

              <InfoItem
                label="Publicado em"
                value={formatDate(property.publishedAt)}
                icon={CalendarDays}
              />

              <InfoItem
                label="Expira em"
                value={formatDate(property.expiresAt)}
                icon={CalendarDays}
              />

              <InfoItem
                label="Vendido em"
                value={formatDate(property.soldAt)}
                icon={CalendarDays}
              />

              <InfoItem
                label="Alugado em"
                value={formatDate(property.rentedAt)}
                icon={CalendarDays}
              />

              <InfoItem
                label="Último lead"
                value={formatDate(property.lastLeadAt)}
                icon={CalendarDays}
              />

              <InfoItem
                label="Última visita"
                value={formatDate(property.lastVisitAt)}
                icon={CalendarDays}
              />

              <InfoItem
                label="Última proposta"
                value={formatDate(property.lastProposalAt)}
                icon={CalendarDays}
              />
            </div>
          </Section>
        </div>

        {/* ==================================================
            TAGS / CONTROLE INTERNO
        ================================================== */}

        <div className="mt-6">
          <Section
            icon={Tag}
            title="Controle interno"
            description="Informações utilizadas pela equipe no CRM."
          >
            {Array.isArray(property.tags) && property.tags.length > 0 && (
              <div className="mb-5">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-500">
                  Tags
                </p>

                <div className="flex flex-wrap gap-2">
                  {property.tags.map((tag, index) => (
                    <Badge key={`${tag}-${index}`}>{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem label="Prioridade" value={property.priority} />

              <InfoItem label="Ordem" value={property.order} />

              <InfoItem label="Cor" value={property.color} />

              <InfoItem label="Ativo" value={formatBoolean(property.active)} />

              <InfoItem
                label="Publicado"
                value={formatBoolean(property.published)}
              />

              <InfoItem
                label="Destaque"
                value={formatBoolean(property.featured)}
              />

              <InfoItem
                label="Exclusivo"
                value={formatBoolean(property.exclusive)}
              />

              <InfoItem
                label="Excluído"
                value={formatBoolean(property.isDeleted)}
              />
            </div>
          </Section>
        </div>

        {/* ==================================================
            NOTAS INTERNAS
        ================================================== */}

        <div className="mt-6">
          <Section
            icon={FileText}
            title="Notas internas"
            description="Conteúdo exclusivo para a equipe do CRM."
          >
            <div className="space-y-4">
              {property.notes && (
                <div className="rounded-xl border border-white/5 bg-white/[0.025] p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Observações
                  </p>

                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-gray-300">
                    {property.notes}
                  </p>
                </div>
              )}

              {property.internalNotes && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-amber-400">
                    Notas internas
                  </p>

                  <p className="mt-2 whitespace-pre-line text-sm leading-7 text-gray-300">
                    {property.internalNotes}
                  </p>
                </div>
              )}

              {!property.notes && !property.internalNotes && (
                <p className="text-sm text-gray-500">
                  Nenhuma nota interna cadastrada.
                </p>
              )}
            </div>
          </Section>
        </div>

        {/* ==================================================
            MÍDIA
        ================================================== */}

        <div className="mt-6">
          <Section icon={ImageIcon} title="Mídias">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem label="Total de imagens" value={images.length} />

              <InfoItem
                label="Vídeo"
                value={property.video || property.videoUrl}
              />

              <InfoItem
                label="Tour virtual"
                value={property.virtualTour || property.virtualTourUrl}
              />

              <InfoItem
                label="Planta"
                value={property.floorPlan || property.floorPlanUrl}
              />
            </div>
          </Section>
        </div>

        {/* ==================================================
            RELACIONAMENTOS
        ================================================== */}

        <div className="mt-6">
          <Section
            icon={Landmark}
            title="Relacionamentos"
            description="Registros vinculados ao imóvel."
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem
                label="Leads"
                value={
                  Array.isArray(property.leads)
                    ? property.leads.length
                    : (property.leadsCount ?? '—')
                }
              />

              <InfoItem
                label="Propostas"
                value={
                  Array.isArray(property.proposals)
                    ? property.proposals.length
                    : (property.proposalsCount ?? '—')
                }
              />

              <InfoItem
                label="Visitas"
                value={
                  Array.isArray(property.visits)
                    ? property.visits.length
                    : (property.visitsCount ?? '—')
                }
              />

              <InfoItem label="ID do imóvel" value={property._id} />
            </div>
          </Section>
        </div>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
          <div className="text-xs text-gray-500">ID: {property._id}</div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-white/10
              bg-white/5
              px-5
              py-2.5
              text-sm
              font-medium
              text-gray-300
              transition
              hover:bg-white/10
              hover:text-white
            "
          >
            <ArrowLeft size={16} />
            Voltar
          </button>
        </div>
      </div>

      {/* ==================================================
          GALERIA FULLSCREEN
      ================================================== */}

      {showGallery && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/95
            p-4
          "
        >
          <button
            type="button"
            onClick={() => setShowGallery(false)}
            className="
              absolute
              right-5
              top-5
              z-10
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              bg-white/10
              text-white
              transition
              hover:bg-white/20
            "
          >
            <X size={22} />
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveImage((current) =>
                current === 0 ? images.length - 1 : current - 1,
              )
            }
            className="
              absolute
              left-4
              top-1/2
              z-10
              flex
              h-12
              w-12
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              bg-white/10
              text-white
              transition
              hover:bg-white/20
              md:left-8
            "
          >
            <ChevronLeft size={25} />
          </button>

          <img
            src={currentImage}
            alt={propertyTitle}
            className="
              max-h-[88vh]
              max-w-[90vw]
              rounded-xl
              object-contain
            "
          />

          <button
            type="button"
            onClick={() =>
              setActiveImage((current) =>
                current === images.length - 1 ? 0 : current + 1,
              )
            }
            className="
              absolute
              right-4
              top-1/2
              z-10
              flex
              h-12
              w-12
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              bg-white/10
              text-white
              transition
              hover:bg-white/20
              md:right-8
            "
          >
            <ChevronRight size={25} />
          </button>

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-2 text-xs text-white backdrop-blur">
            {activeImage + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
}

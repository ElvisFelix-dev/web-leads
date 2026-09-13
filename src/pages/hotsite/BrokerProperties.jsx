import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  Loader2,
  MessageCircle,
  Search,
} from 'lucide-react';

import api from '../../service/api';

import HotsiteNavbar from '../../components/hotsite/HotsiteNavbar';
import PropertyFilters from '../../components/hotsite/PropertyFilters';
import PropertyCard from '../../components/hotsite/PropertyCard';
import HotsiteFooter from '../../components/hotsite/HotsiteFooter';

const INITIAL_FILTERS = {
  search: '',
  purpose: 'todos',
  type: 'todos',
  bedrooms: 'todos',
  minPrice: '',
  maxPrice: '',
};

function normalizeArray(value) {
  if (Array.isArray(value)) return value;

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function getPropertyType(property) {
  return (
    property?.type ||
    property?.propertyType ||
    property?.category ||
    property?.propertyCategory ||
    ''
  );
}

function getPropertyPurpose(property) {
  return normalizeText(
    property?.purpose ||
      property?.transactionType ||
      property?.businessType ||
      '',
  );
}

function getBedrooms(property) {
  const value =
    property?.bedrooms ??
    property?.bedroomCount ??
    property?.rooms ??
    property?.dormitories ??
    0;

  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function getArea(property) {
  const value =
    property?.dimensions?.totalArea ??
    property?.totalArea ??
    property?.area ??
    property?.usefulArea ??
    0;

  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function getSalePrice(property) {
  const value =
    property?.prices?.salePrice ?? property?.salePrice ?? property?.price ?? 0;

  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function getRentPrice(property) {
  const value =
    property?.prices?.rentPrice ??
    property?.rentPrice ??
    property?.rentalPrice ??
    0;

  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
}

function getPropertyPrice(property) {
  const purpose = getPropertyPurpose(property);

  if (purpose === 'aluguel' || purpose === 'locacao' || purpose === 'rent') {
    return getRentPrice(property);
  }

  if (
    purpose === 'venda_aluguel' ||
    purpose === 'venda_e_aluguel' ||
    purpose === 'venda e aluguel' ||
    purpose === 'sale_rent'
  ) {
    return getSalePrice(property) || getRentPrice(property);
  }

  return getSalePrice(property);
}

function getPropertyLocation(property) {
  const location = property?.location || {};

  return [
    location?.district,
    location?.neighborhood,
    location?.city,
    location?.state,
  ]
    .filter(Boolean)
    .join(', ');
}

function getPropertySearchText(property) {
  const location = property?.location || {};

  return [
    property?.name,
    property?.title,
    property?.description,
    property?.code,
    getPropertyType(property),
    getPropertyPurpose(property),
    location?.district,
    location?.neighborhood,
    location?.city,
    location?.state,
  ]
    .filter(Boolean)
    .map(normalizeText)
    .join(' ');
}

function getPurposeMatches(property, selectedPurpose) {
  if (!selectedPurpose || selectedPurpose === 'todos') {
    return true;
  }

  const purpose = getPropertyPurpose(property);
  const selected = normalizeText(selectedPurpose);

  if (selected === 'venda') {
    return [
      'venda',
      'sale',
      'venda_aluguel',
      'venda_e_aluguel',
      'venda e aluguel',
      'sale_rent',
    ].includes(purpose);
  }

  if (selected === 'aluguel' || selected === 'locacao') {
    return [
      'aluguel',
      'locacao',
      'rent',
      'venda_aluguel',
      'venda_e_aluguel',
      'venda e aluguel',
      'sale_rent',
    ].includes(purpose);
  }

  return purpose === selected;
}

function getPriceRange(property) {
  const purpose = getPropertyPurpose(property);

  const salePrice = getSalePrice(property);
  const rentPrice = getRentPrice(property);

  if (purpose === 'aluguel' || purpose === 'locacao' || purpose === 'rent') {
    return rentPrice;
  }

  if (
    purpose === 'venda_aluguel' ||
    purpose === 'venda_e_aluguel' ||
    purpose === 'venda e aluguel' ||
    purpose === 'sale_rent'
  ) {
    return salePrice || rentPrice;
  }

  return salePrice;
}

function parsePrice(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value === 'number') {
    return value;
  }

  const normalized = String(value)
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.');

  const number = Number(normalized);

  return Number.isFinite(number) ? number : null;
}

function getWhatsAppUrl(phone) {
  const normalized = String(phone || '').replace(/\D/g, '');

  if (!normalized) return '';

  const number = normalized.startsWith('55') ? normalized : `55${normalized}`;

  return `https://wa.me/${number}`;
}

export default function BrokerProperties() {
  const { brokerSlug: brokerSlugParam, slug: slugParam } = useParams();

  const brokerSlug = brokerSlugParam || slugParam || '';

  const [broker, setBroker] = useState(null);
  const [properties, setProperties] = useState([]);

  const [filters, setFilters] = useState(INITIAL_FILTERS);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadHotsite() {
      if (!brokerSlug) {
        setError('Corretor não identificado.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        /*
         * IMPORTANTE:
         * Usamos o mesmo endpoint do BrokerHotsite.
         *
         * GET /api/brokers/hotsite/:slug
         *
         * Esperado:
         * {
         *   success: true,
         *   data: {
         *     broker: {...},
         *     properties: [...]
         *   }
         * }
         */
        const response = await api.get(
          `/api/brokers/hotsite/${encodeURIComponent(brokerSlug)}`,
        );

        if (!isMounted) return;

        const data = response?.data?.data || response?.data || {};

        const brokerData = data?.broker || null;

        /*
         * Alguns endpoints podem retornar:
         *
         * properties: [...]
         *
         * ou eventualmente:
         *
         * data: {
         *   broker: {...},
         *   properties: [...]
         * }
         */
        const propertiesData = Array.isArray(data?.properties)
          ? data.properties
          : [];

        setBroker(brokerData);
        setProperties(propertiesData);

        console.log('[HOT SITE] Corretor:', brokerData);

        console.log('[HOT SITE] Imóveis recebidos:', propertiesData);
      } catch (err) {
        if (!isMounted) return;

        console.error('Erro ao carregar imóveis do hotsite:', err);

        setBroker(null);
        setProperties([]);

        setError(
          err?.response?.data?.message ||
            'Não foi possível carregar os imóveis no momento.',
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadHotsite();

    return () => {
      isMounted = false;
    };
  }, [brokerSlug]);

  const propertyTypes = useMemo(() => {
    const types = properties
      .map((property) => getPropertyType(property))
      .filter(Boolean);

    return [...new Set(types)].sort((a, b) =>
      String(a).localeCompare(String(b), 'pt-BR'),
    );
  }, [properties]);

  const filteredProperties = useMemo(() => {
    const search = normalizeText(filters.search);

    const minPrice = parsePrice(filters.minPrice);
    const maxPrice = parsePrice(filters.maxPrice);

    return properties.filter((property) => {
      /*
       * BUSCA
       */
      if (search) {
        const searchText = getPropertySearchText(property);

        if (!searchText.includes(search)) {
          return false;
        }
      }

      /*
       * FINALIDADE
       */
      if (!getPurposeMatches(property, filters.purpose)) {
        return false;
      }

      /*
       * TIPO
       */
      if (filters.type && filters.type !== 'todos') {
        const propertyType = normalizeText(getPropertyType(property));

        const selectedType = normalizeText(filters.type);

        if (propertyType !== selectedType) {
          return false;
        }
      }

      /*
       * DORMITÓRIOS
       */
      if (filters.bedrooms && filters.bedrooms !== 'todos') {
        const bedrooms = getBedrooms(property);
        const selectedBedrooms = Number(filters.bedrooms);

        if (filters.bedrooms === '5+') {
          if (bedrooms < 5) {
            return false;
          }
        } else if (bedrooms < selectedBedrooms) {
          return false;
        }
      }

      /*
       * PREÇO MÍNIMO
       */
      if (minPrice !== null) {
        const propertyPrice = getPriceRange(property);

        if (!propertyPrice || propertyPrice < minPrice) {
          return false;
        }
      }

      /*
       * PREÇO MÁXIMO
       */
      if (maxPrice !== null) {
        const propertyPrice = getPriceRange(property);

        if (!propertyPrice || propertyPrice > maxPrice) {
          return false;
        }
      }

      return true;
    });
  }, [properties, filters]);

  const handleResetFilters = () => {
    setFilters({
      ...INITIAL_FILTERS,
    });
  };

  const whatsappUrl = getWhatsAppUrl(
    broker?.phone || broker?.whatsapp || broker?.whatsappNumber,
  );

  /*
   * LOADING
   */
  if (loading) {
    return (
      <div className="min-h-screen bg-white text-slate-900">
        <HotsiteNavbar broker={broker} brokerSlug={brokerSlug} />

        <main>
          <section className="border-b border-slate-200 bg-slate-50">
            <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
              <div className="animate-pulse space-y-5">
                <div className="h-4 w-32 rounded bg-slate-200" />

                <div className="h-12 max-w-2xl rounded bg-slate-200" />

                <div className="h-5 max-w-xl rounded bg-slate-200" />

                <div className="h-5 max-w-lg rounded bg-slate-200" />
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
            <div className="flex items-center justify-center py-24">
              <div className="flex items-center gap-3 text-slate-500">
                <Loader2 className="h-5 w-5 animate-spin" />

                <span>Carregando imóveis...</span>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  /*
   * ERROR
   */
  if (error) {
    return (
      <div className="min-h-screen bg-white text-slate-900">
        <HotsiteNavbar broker={broker} brokerSlug={brokerSlug} />

        <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-6 py-20">
          <div className="w-full rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Building2 className="h-7 w-7" />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              Não conseguimos carregar os imóveis
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
              {error}
            </p>

            <Link
              to={`/broker/${encodeURIComponent(brokerSlug || '')}`}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para o início
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <HotsiteNavbar broker={broker} brokerSlug={brokerSlug} />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-slate-200 bg-slate-950">
          <div className="absolute inset-0">
            <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />

            <div className="absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-indigo-600/15 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">
                <Building2 className="h-3.5 w-3.5" />
                Imóveis disponíveis
              </div>

              <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                Encontre o imóvel
                <span className="block text-blue-400">ideal para você.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Explore imóveis disponíveis e encontre uma opção que faça
                sentido para o seu momento, seja para morar, investir ou gerar
                renda.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                <span className="inline-flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-400" />
                  {properties.length}{' '}
                  {properties.length === 1
                    ? 'imóvel disponível'
                    : 'imóveis disponíveis'}
                </span>

                {broker?.name && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-slate-600" />

                    <span>Atendimento com {broker.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CONTEÚDO */}
        <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8 lg:py-14">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">
                <span>Catálogo</span>

                <ChevronRight className="h-3.5 w-3.5" />

                <span>Imóveis</span>
              </div>

              <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                Encontre seu próximo imóvel
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Use os filtros para encontrar imóveis de acordo com o que você
                está procurando.
              </p>
            </div>
          </div>

          <PropertyFilters
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
            propertyTypes={propertyTypes}
            resultCount={filteredProperties.length}
          />

          {/* RESULTADOS */}
          {filteredProperties.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property?._id || property?.id || property?.slug}
                  property={property}
                  brokerSlug={brokerSlug}
                />
              ))}
            </div>
          ) : (
            <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50">
              <div className="mx-auto max-w-xl px-6 py-20 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
                  <Search className="h-7 w-7" />
                </div>

                <h3 className="mt-6 text-xl font-semibold text-slate-950">
                  {properties.length === 0
                    ? 'Nenhum imóvel disponível'
                    : 'Nenhum imóvel encontrado'}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {properties.length === 0
                    ? 'No momento, não existem imóveis disponíveis para exibição neste hotsite.'
                    : 'Não encontramos imóveis com os filtros selecionados. Tente remover alguns filtros ou fazer uma nova busca.'}
                </p>

                {properties.length > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="mt-7 inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-12 shadow-xl sm:px-10 lg:px-14 lg:py-14">
              <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-600/20 blur-3xl" />

              <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-blue-300">
                    <MessageCircle className="h-5 w-5" />
                  </div>

                  <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    Não encontrou exatamente o que procura?
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
                    Fale diretamente com {broker?.name || 'nosso atendimento'}.
                    Podemos entender o que você procura e apresentar outras
                    oportunidades disponíveis.
                  </p>
                </div>

                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Falar pelo WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <HotsiteFooter broker={broker} brokerSlug={brokerSlug} />
    </div>
  );
}

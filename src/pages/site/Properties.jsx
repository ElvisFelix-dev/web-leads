import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownUp,
  Building2,
  CheckCircle2,
  Filter,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import Header from '../../components/site/Header';
import Footer from '../../components/site/Footer';
import PropertyCard from '../../components/site/PropertyCard';

import { getProperties } from '../../service/propertyApi';

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showFilters, setShowFilters] = useState(false);

  // ============================================================
  // FILTROS DA URL
  // ============================================================

  const purpose = searchParams.get('purpose') || '';
  const city = searchParams.get('city') || '';
  const type = searchParams.get('type') || '';
  const price = searchParams.get('price') || '';

  // ============================================================
  // ESTADOS DOS FILTROS
  // ============================================================

  const [filters, setFilters] = useState({
    purpose,
    city,
    type,
    price,
  });

  // ============================================================
  // SINCRONIZAR FILTROS COM URL
  // ============================================================

  useEffect(() => {
    setFilters({
      purpose,
      city,
      type,
      price,
    });
  }, [purpose, city, type, price]);

  // ============================================================
  // CARREGAR IMÓVEIS
  // ============================================================

  const loadProperties = async () => {
    try {
      setLoading(true);

      const response = await getProperties();

      let list = [];

      if (Array.isArray(response)) {
        list = response;
      } else if (Array.isArray(response?.properties)) {
        list = response.properties;
      } else if (Array.isArray(response?.data)) {
        list = response.data;
      }

      setProperties(list);
    } catch (error) {
      console.error('Erro ao carregar imóveis:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  // ============================================================
  // OPÇÕES DE CIDADE
  // ============================================================

  const cities = useMemo(() => {
    const values = properties
      .map((property) => {
        return (
          property?.city ||
          property?.address?.city ||
          property?.location?.city ||
          ''
        );
      })
      .filter(Boolean);

    return [...new Set(values)].sort();
  }, [properties]);

  // ============================================================
  // FILTRAR IMÓVEIS
  // ============================================================

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      // --------------------------------------------------------
      // PURPOSE
      // --------------------------------------------------------

      if (filters.purpose) {
        const propertyPurpose =
          property?.purpose ||
          property?.transactionType ||
          property?.status ||
          '';

        if (
          String(propertyPurpose).toLowerCase() !==
          String(filters.purpose).toLowerCase()
        ) {
          return false;
        }
      }

      // --------------------------------------------------------
      // CITY
      // --------------------------------------------------------

      if (filters.city) {
        const propertyCity =
          property?.city ||
          property?.address?.city ||
          property?.location?.city ||
          '';

        if (
          String(propertyCity).toLowerCase() !==
          String(filters.city).toLowerCase()
        ) {
          return false;
        }
      }

      // --------------------------------------------------------
      // TYPE
      // --------------------------------------------------------

      if (filters.type) {
        const propertyType = property?.type || property?.propertyType || '';

        if (
          String(propertyType).toLowerCase() !==
          String(filters.type).toLowerCase()
        ) {
          return false;
        }
      }

      // --------------------------------------------------------
      // PRICE
      // --------------------------------------------------------

      if (filters.price) {
        const propertyPrice = Number(
          property?.price || property?.salePrice || property?.rentPrice || 0,
        );

        if (filters.price === '0-300000') {
          if (propertyPrice > 300000) return false;
        }

        if (filters.price === '300000-600000') {
          if (propertyPrice < 300000 || propertyPrice > 600000) {
            return false;
          }
        }

        if (filters.price === '600000-1000000') {
          if (propertyPrice < 600000 || propertyPrice > 1000000) {
            return false;
          }
        }

        if (filters.price === '1000000+') {
          if (propertyPrice < 1000000) return false;
        }
      }

      return true;
    });
  }, [properties, filters]);

  // ============================================================
  // ATUALIZAR FILTRO
  // ============================================================

  const handleFilterChange = (field, value) => {
    const nextFilters = {
      ...filters,
      [field]: value,
    };

    setFilters(nextFilters);

    const params = new URLSearchParams();

    Object.entries(nextFilters).forEach(([key, val]) => {
      if (val) {
        params.set(key, val);
      }
    });

    setSearchParams(params);
  };

  // ============================================================
  // LIMPAR FILTROS
  // ============================================================

  const clearFilters = () => {
    setFilters({
      purpose: '',
      city: '',
      type: '',
      price: '',
    });

    setSearchParams({});
  };

  // ============================================================
  // TÍTULO
  // ============================================================

  const pageTitle = useMemo(() => {
    if (purpose === 'venda') {
      return 'Imóveis à venda';
    }

    if (purpose === 'aluguel') {
      return 'Imóveis para alugar';
    }

    return 'Todos os imóveis';
  }, [purpose]);

  // ============================================================
  // DESCRIÇÃO
  // ============================================================

  const pageDescription = useMemo(() => {
    if (purpose === 'venda') {
      return 'Encontre imóveis selecionados para comprar e encontre o lugar ideal para o seu próximo capítulo.';
    }

    if (purpose === 'aluguel') {
      return 'Explore imóveis disponíveis para aluguel e encontre uma opção que combine com o seu momento.';
    }

    return 'Explore nosso catálogo de imóveis e encontre oportunidades selecionadas para diferentes perfis e momentos.';
  }, [purpose]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />

      <main>
        {/* ======================================================
            HERO DA PÁGINA
        ======================================================= */}

        <section className="relative overflow-hidden bg-gray-950 pb-10 pt-10 sm:pb-12 sm:pt-12">
          {/* Background */}

          <div className="pointer-events-none absolute inset-0">
            <div
              className="
                absolute
                left-1/2
                top-[-180px]
                h-[500px]
                w-[800px]
                -translate-x-1/2
                rounded-full
                bg-blue-600/[0.07]
                blur-[130px]
              "
            />

            <div
              className="
                absolute
                inset-0
                opacity-[0.02]
                [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)]
                [background-size:64px_64px]
              "
            />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}

            <div className="mb-6 flex items-center gap-2 text-xs text-gray-500">
              <span>Início</span>

              <span>/</span>

              <span className="text-gray-300">Imóveis</span>

              {purpose && (
                <>
                  <span>/</span>

                  <span className="text-blue-400">
                    {purpose === 'venda' ? 'Venda' : 'Aluguel'}
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              {/* Título */}

              <div className="max-w-3xl">
                <div
                  className="
                    mb-4
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-blue-500/20
                    bg-blue-500/[0.08]
                    px-3.5
                    py-1.5
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.18em]
                    text-blue-400
                  "
                >
                  <Building2 size={13} />
                  Catálogo de imóveis
                </div>

                <h1
                  className="
                    text-3xl
                    font-bold
                    tracking-[-0.03em]
                    text-white
                    sm:text-4xl
                    lg:text-5xl
                  "
                >
                  {pageTitle}
                </h1>

                <p
                  className="
                    mt-4
                    max-w-2xl
                    text-sm
                    leading-6
                    text-gray-400
                    sm:text-base
                  "
                >
                  {pageDescription}
                </p>
              </div>

              {/* Contador */}

              <div
                className="
                  flex
                  shrink-0
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  border-white/[0.07]
                  bg-white/[0.025]
                  px-5
                  py-4
                "
              >
                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-500/10
                    text-blue-400
                  "
                >
                  <Building2 size={19} />
                </div>

                <div>
                  <div className="text-lg font-bold text-white">
                    {loading ? '—' : filteredProperties.length}
                  </div>

                  <div className="text-xs text-gray-500">
                    {filteredProperties.length === 1
                      ? 'imóvel encontrado'
                      : 'imóveis encontrados'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
            FILTROS
        ======================================================= */}

        <section className="relative bg-gray-950 pb-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div
              className="
                rounded-2xl
                border
                border-white/[0.08]
                bg-white/[0.025]
                p-3
                shadow-xl
                shadow-black/10
                backdrop-blur-xl
              "
            >
              {/* Mobile toggle */}

              <button
                type="button"
                onClick={() => setShowFilters((value) => !value)}
                className="
                  flex
                  w-full
                  items-center
                  justify-between
                  rounded-xl
                  px-3
                  py-3
                  text-sm
                  font-semibold
                  text-gray-200
                  lg:hidden
                "
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal size={17} className="text-blue-400" />
                  Filtros de busca
                </span>

                <ArrowDownUp
                  size={16}
                  className={`transition-transform ${
                    showFilters ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div
                className={`
                  ${showFilters ? 'grid' : 'hidden'}
                  gap-3
                  pt-2
                  lg:grid
                  lg:grid-cols-[1fr_1fr_1fr_1fr_auto]
                `}
              >
                {/* Finalidade */}

                <div>
                  <label className="mb-1.5 block px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                    Finalidade
                  </label>

                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400"
                    />

                    <select
                      value={filters.purpose}
                      onChange={(event) =>
                        handleFilterChange('purpose', event.target.value)
                      }
                      className="
                        h-12
                        w-full
                        appearance-none
                        rounded-xl
                        border
                        border-white/10
                        bg-gray-900
                        pl-10
                        pr-4
                        text-sm
                        text-white
                        outline-none
                        transition
                        focus:border-blue-500/50
                      "
                    >
                      <option value="">Comprar ou alugar</option>
                      <option value="venda">Comprar</option>
                      <option value="aluguel">Alugar</option>
                    </select>
                  </div>
                </div>

                {/* Cidade */}

                <div>
                  <label className="mb-1.5 block px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                    Localização
                  </label>

                  <div className="relative">
                    <MapPin
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400"
                    />

                    <select
                      value={filters.city}
                      onChange={(event) =>
                        handleFilterChange('city', event.target.value)
                      }
                      className="
                        h-12
                        w-full
                        appearance-none
                        rounded-xl
                        border
                        border-white/10
                        bg-gray-900
                        pl-10
                        pr-4
                        text-sm
                        text-white
                        outline-none
                        focus:border-blue-500/50
                      "
                    >
                      <option value="">Todas as cidades</option>

                      {cities.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tipo */}

                <div>
                  <label className="mb-1.5 block px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                    Tipo
                  </label>

                  <select
                    value={filters.type}
                    onChange={(event) =>
                      handleFilterChange('type', event.target.value)
                    }
                    className="
                      h-12
                      w-full
                      appearance-none
                      rounded-xl
                      border
                      border-white/10
                      bg-gray-900
                      px-4
                      text-sm
                      text-white
                      outline-none
                      focus:border-blue-500/50
                    "
                  >
                    <option value="">Todos os tipos</option>
                    <option value="casa">Casa</option>
                    <option value="apartamento">Apartamento</option>
                    <option value="terreno">Terreno</option>
                    <option value="comercial">Comercial</option>
                  </select>
                </div>

                {/* Preço */}

                <div>
                  <label className="mb-1.5 block px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                    Investimento
                  </label>

                  <select
                    value={filters.price}
                    onChange={(event) =>
                      handleFilterChange('price', event.target.value)
                    }
                    className="
                      h-12
                      w-full
                      appearance-none
                      rounded-xl
                      border
                      border-white/10
                      bg-gray-900
                      px-4
                      text-sm
                      text-white
                      outline-none
                      focus:border-blue-500/50
                    "
                  >
                    <option value="">Qualquer preço</option>
                    <option value="0-300000">Até R$ 300 mil</option>
                    <option value="300000-600000">
                      R$ 300 mil – R$ 600 mil
                    </option>
                    <option value="600000-1000000">
                      R$ 600 mil – R$ 1 milhão
                    </option>
                    <option value="1000000+">Acima de R$ 1 milhão</option>
                  </select>
                </div>

                {/* Limpar */}

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="
                      flex
                      h-12
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-white/10
                      bg-white/[0.03]
                      px-4
                      text-sm
                      font-semibold
                      text-gray-400
                      transition
                      hover:border-white/20
                      hover:bg-white/[0.06]
                      hover:text-white
                    "
                  >
                    <X size={16} />
                    Limpar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================
            LISTAGEM
        ======================================================= */}

        <section className="relative bg-gray-950 pb-16 pt-4 sm:pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Barra superior */}

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Filter size={15} className="text-blue-400" />

                {loading
                  ? 'Carregando imóveis...'
                  : `${filteredProperties.length} imóveis encontrados`}
              </div>

              {!loading && filteredProperties.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle2 size={14} className="text-blue-400" />
                  Seleção atualizada
                </div>
              )}
            </div>

            {/* Loading */}

            {loading && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div
                    key={item}
                    className="
                      overflow-hidden
                      rounded-3xl
                      border
                      border-white/[0.06]
                      bg-white/[0.025]
                    "
                  >
                    <div className="aspect-[4/3] animate-pulse bg-gray-900" />

                    <div className="space-y-4 p-5">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-800" />

                      <div className="h-6 w-3/4 animate-pulse rounded bg-gray-800" />

                      <div className="h-4 w-full animate-pulse rounded bg-gray-800" />

                      <div className="h-10 w-full animate-pulse rounded-xl bg-gray-800" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Resultado */}

            {!loading && filteredProperties.length > 0 && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProperties.map((property) => (
                  <div
                    key={property._id}
                    className="transition duration-300 hover:-translate-y-1"
                  >
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>
            )}

            {/* Empty */}

            {!loading && filteredProperties.length === 0 && (
              <div
                className="
                  relative
                  overflow-hidden
                  rounded-3xl
                  border
                  border-dashed
                  border-white/10
                  bg-white/[0.025]
                  px-6
                  py-20
                  text-center
                "
              >
                <div
                  className="
                    pointer-events-none
                    absolute
                    left-1/2
                    top-1/2
                    h-52
                    w-52
                    -translate-x-1/2
                    -translate-y-1/2
                    rounded-full
                    bg-blue-500/[0.05]
                    blur-3xl
                  "
                />

                <div className="relative">
                  <div
                    className="
                      mx-auto
                      flex
                      h-16
                      w-16
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-blue-500/15
                      bg-blue-500/10
                      text-blue-400
                    "
                  >
                    <Building2 size={28} />
                  </div>

                  <h2 className="mt-6 text-xl font-semibold text-white">
                    Nenhum imóvel encontrado
                  </h2>

                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500">
                    Não encontramos imóveis com os filtros selecionados.
                    Experimente alterar sua busca ou visualizar todo o catálogo.
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="
                      mt-7
                      inline-flex
                      items-center
                      gap-2
                      rounded-xl
                      bg-blue-600
                      px-5
                      py-3
                      text-sm
                      font-semibold
                      text-white
                      shadow-lg
                      shadow-blue-600/20
                      transition
                      hover:bg-blue-500
                    "
                  >
                    Ver todos os imóveis
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

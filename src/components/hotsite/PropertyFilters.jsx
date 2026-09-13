import { useMemo } from 'react';
import {
  BedDouble,
  Building2,
  ChevronDown,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';

function formatCurrencyInput(value) {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const numericValue = String(value).replace(/\D/g, '');

  if (!numericValue) {
    return '';
  }

  return new Intl.NumberFormat('pt-BR').format(Number(numericValue));
}

function getTypeLabel(type) {
  const labels = {
    apartamento: 'Apartamento',
    casa: 'Casa',
    cobertura: 'Cobertura',
    studio: 'Studio',
    sobrado: 'Sobrado',
    terreno: 'Terreno',
    comercial: 'Comercial',
    sala: 'Sala Comercial',
    loja: 'Loja',
    galpao: 'Galpão',
    chacara: 'Chácara',
    sitio: 'Sítio',
    fazenda: 'Fazenda',
  };

  return labels[type] || type;
}

export default function PropertyFilters({
  filters = {},
  onChange,
  onReset,
  propertyTypes = [],
  resultCount = 0,
}) {
  const {
    search = '',
    purpose = 'todos',
    type = 'todos',
    bedrooms = 'todos',
    minPrice = '',
    maxPrice = '',
  } = filters;

  const normalizedTypes = useMemo(() => {
    return propertyTypes
      .filter(Boolean)
      .map((item) => String(item).trim())
      .filter((item, index, array) => array.indexOf(item) === index);
  }, [propertyTypes]);

  const hasActiveFilters =
    search ||
    purpose !== 'todos' ||
    type !== 'todos' ||
    bedrooms !== 'todos' ||
    minPrice ||
    maxPrice;

  function handleChange(field, value) {
    onChange?.({
      ...filters,
      [field]: value,
    });
  }

  function handlePriceChange(field, value) {
    const numericValue = String(value).replace(/\D/g, '');

    handleChange(field, numericValue);
  }

  function clearSearch() {
    handleChange('search', '');
  }

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.06)] sm:p-5">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
            <SlidersHorizontal size={18} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-950">
              Encontre seu imóvel
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Use os filtros para refinar sua busca
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500">
            {resultCount}{' '}
            {resultCount === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <RotateCcw size={14} />
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={19}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          value={search}
          onChange={(event) => handleChange('search', event.target.value)}
          placeholder="Busque por bairro, cidade, código ou imóvel..."
          className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-11 text-sm text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
        />

        {search && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700"
            aria-label="Limpar busca"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Main filters */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Purpose */}
        <div>
          <label
            htmlFor="property-purpose"
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-400"
          >
            Negócio
          </label>

          <div className="relative">
            <select
              id="property-purpose"
              value={purpose}
              onChange={(event) => handleChange('purpose', event.target.value)}
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm font-medium text-slate-700 outline-none transition-all focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            >
              <option value="todos">Comprar ou alugar</option>
              <option value="venda">Comprar</option>
              <option value="locacao">Alugar</option>
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>

        {/* Type */}
        <div>
          <label
            htmlFor="property-type"
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-400"
          >
            Tipo
          </label>

          <div className="relative">
            <Building2
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              id="property-type"
              value={type}
              onChange={(event) => handleChange('type', event.target.value)}
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm font-medium text-slate-700 outline-none transition-all focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            >
              <option value="todos">Todos os tipos</option>

              {normalizedTypes.map((propertyType) => (
                <option key={propertyType} value={propertyType}>
                  {getTypeLabel(propertyType)}
                </option>
              ))}
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>

        {/* Bedrooms */}
        <div>
          <label
            htmlFor="property-bedrooms"
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-400"
          >
            Quartos
          </label>

          <div className="relative">
            <BedDouble
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <select
              id="property-bedrooms"
              value={bedrooms}
              onChange={(event) => handleChange('bedrooms', event.target.value)}
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm font-medium text-slate-700 outline-none transition-all focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
            >
              <option value="todos">Qualquer quantidade</option>
              <option value="1">1+ quarto</option>
              <option value="2">2+ quartos</option>
              <option value="3">3+ quartos</option>
              <option value="4">4+ quartos</option>
              <option value="5">5+ quartos</option>
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>

        {/* Price */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">
            Faixa de preço
          </label>

          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                R$
              </span>

              <input
                type="text"
                inputMode="numeric"
                value={formatCurrencyInput(minPrice)}
                onChange={(event) =>
                  handlePriceChange('minPrice', event.target.value)
                }
                placeholder="Mínimo"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-2 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              />
            </div>

            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                R$
              </span>

              <input
                type="text"
                inputMode="numeric"
                value={formatCurrencyInput(maxPrice)}
                onChange={(event) =>
                  handlePriceChange('maxPrice', event.target.value)
                }
                placeholder="Máximo"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-2 text-sm text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Active filters */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          <span className="mr-1 text-xs font-medium text-slate-400">
            Filtros ativos:
          </span>

          {search && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
              Busca: {search}
              <button
                type="button"
                onClick={clearSearch}
                className="text-slate-400 transition-colors hover:text-slate-900"
                aria-label="Remover busca"
              >
                <X size={13} />
              </button>
            </span>
          )}

          {purpose !== 'todos' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
              {purpose === 'venda' ? 'Comprar' : 'Alugar'}

              <button
                type="button"
                onClick={() => handleChange('purpose', 'todos')}
                className="text-slate-400 transition-colors hover:text-slate-900"
                aria-label="Remover filtro de negócio"
              >
                <X size={13} />
              </button>
            </span>
          )}

          {type !== 'todos' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
              {getTypeLabel(type)}

              <button
                type="button"
                onClick={() => handleChange('type', 'todos')}
                className="text-slate-400 transition-colors hover:text-slate-900"
                aria-label="Remover filtro de tipo"
              >
                <X size={13} />
              </button>
            </span>
          )}

          {bedrooms !== 'todos' && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
              {bedrooms}+ quartos
              <button
                type="button"
                onClick={() => handleChange('bedrooms', 'todos')}
                className="text-slate-400 transition-colors hover:text-slate-900"
                aria-label="Remover filtro de quartos"
              >
                <X size={13} />
              </button>
            </span>
          )}

          {minPrice && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
              A partir de R$ {formatCurrencyInput(minPrice)}
              <button
                type="button"
                onClick={() => handleChange('minPrice', '')}
                className="text-slate-400 transition-colors hover:text-slate-900"
                aria-label="Remover preço mínimo"
              >
                <X size={13} />
              </button>
            </span>
          )}

          {maxPrice && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
              Até R$ {formatCurrencyInput(maxPrice)}
              <button
                type="button"
                onClick={() => handleChange('maxPrice', '')}
                className="text-slate-400 transition-colors hover:text-slate-900"
                aria-label="Remover preço máximo"
              >
                <X size={13} />
              </button>
            </span>
          )}
        </div>
      )}
    </section>
  );
}

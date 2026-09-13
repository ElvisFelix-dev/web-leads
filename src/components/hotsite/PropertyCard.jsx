import {
  ArrowUpRight,
  Bath,
  BedDouble,
  Building2,
  Car,
  MapPin,
  Ruler,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

function formatCurrency(value) {
  const number = Number(value);

  if (!Number.isFinite(number) || number <= 0) {
    return null;
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(number);
}

function getPropertyImage(property) {
  return (
    property?.coverImage ||
    property?.images?.[0] ||
    property?.image ||
    property?.mainImage ||
    null
  );
}

function getLocation(property) {
  const location = property?.location || {};

  return [location.district, location.city, location.state]
    .filter(Boolean)
    .join(', ');
}

function getPropertyPrice(property) {
  const salePrice = Number(property?.prices?.salePrice);
  const rentPrice = Number(property?.prices?.rentPrice);

  if (salePrice > 0) {
    return {
      value: formatCurrency(salePrice),
      label: 'Venda',
    };
  }

  if (rentPrice > 0) {
    return {
      value: formatCurrency(rentPrice),
      label: 'Locação',
    };
  }

  return {
    value: 'Consulte',
    label: null,
  };
}

function getPurposeLabel(property) {
  const purpose = String(property?.purpose || '').toLowerCase();

  if (
    purpose.includes('rent') ||
    purpose.includes('alug') ||
    purpose === 'locacao' ||
    purpose === 'locação'
  ) {
    return 'Locação';
  }

  if (
    purpose.includes('sale') ||
    purpose.includes('vend') ||
    purpose === 'venda'
  ) {
    return 'Venda';
  }

  return null;
}

function getTypeLabel(property) {
  return property?.type || property?.category || 'Imóvel';
}

function getPropertySlug(property) {
  return property?.slug || property?._id || property?.id || '';
}

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export default function PropertyCard({
  property,
  brokerSlug,
  showBroker = false,
}) {
  if (!property) {
    return null;
  }

  const image = getPropertyImage(property);
  const location = getLocation(property);
  const price = getPropertyPrice(property);
  const purposeLabel = getPurposeLabel(property);
  const typeLabel = getTypeLabel(property);
  const propertySlug = getPropertySlug(property);

  const bedrooms = Number(property?.bedrooms);
  const bathrooms = Number(property?.bathrooms);

  const parkingSpaces =
    Number(property?.parkingSpaces) ||
    Number(property?.garageSpaces) ||
    Number(property?.garages) ||
    Number(property?.parking);

  const totalArea =
    Number(property?.dimensions?.totalArea) ||
    Number(property?.totalArea) ||
    Number(property?.area);

  const brokerName =
    property?.broker?.name ||
    property?.assignedTo?.name ||
    property?.captation?.broker?.name ||
    '';

  const brokerAvatar =
    property?.broker?.avatar ||
    property?.assignedTo?.avatar ||
    property?.captation?.broker?.avatar ||
    null;

  const href = brokerSlug
    ? `/broker/${brokerSlug}/property/${propertySlug}`
    : '#';

  return (
    <article className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
      {/* Image */}
      <Link
        to={href}
        className="relative block aspect-[4/3] overflow-hidden bg-slate-100"
      >
        {image ? (
          <img
            src={image}
            alt={property?.name || 'Imóvel'}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100">
            <Building2 size={52} strokeWidth={1.2} className="text-slate-400" />
          </div>
        )}

        {/* Image overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/10 opacity-70" />

        {/* Top badges */}
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {property?.featured && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-slate-950/75 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white backdrop-blur-md">
              <Sparkles size={12} />
              Destaque
            </span>
          )}

          {property?.exclusive && (
            <span className="rounded-full border border-white/20 bg-white/90 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-900 backdrop-blur-md">
              Exclusivo
            </span>
          )}
        </div>

        {/* Purpose */}
        {purposeLabel && (
          <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur-md">
            {purposeLabel}
          </span>
        )}

        {/* Arrow */}
        <div className="absolute bottom-4 right-4 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-white text-slate-900 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight size={18} />
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 sm:p-6">
        {/* Type + code */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
            {typeLabel}
          </span>

          {property?.code && (
            <span className="text-[11px] font-medium text-slate-400">
              Cód. {property.code}
            </span>
          )}
        </div>

        {/* Title */}
        <Link to={href}>
          <h3 className="line-clamp-2 min-h-[56px] text-lg font-semibold leading-7 text-slate-950 transition-colors group-hover:text-indigo-600">
            {property?.name || 'Imóvel disponível'}
          </h3>
        </Link>

        {/* Location */}
        {location && (
          <div className="mt-3 flex items-start gap-2 text-sm text-slate-500">
            <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />

            <span className="line-clamp-2">{location}</span>
          </div>
        )}

        {/* Features */}
        <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3 border-y border-slate-100 py-4">
          {Number.isFinite(bedrooms) && bedrooms > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <BedDouble
                size={17}
                strokeWidth={1.8}
                className="text-slate-400"
              />

              <span>
                {bedrooms} {bedrooms === 1 ? 'quarto' : 'quartos'}
              </span>
            </div>
          )}

          {Number.isFinite(bathrooms) && bathrooms > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <Bath size={17} strokeWidth={1.8} className="text-slate-400" />

              <span>
                {bathrooms} {bathrooms === 1 ? 'banho' : 'banhos'}
              </span>
            </div>
          )}

          {Number.isFinite(parkingSpaces) && parkingSpaces > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <Car size={17} strokeWidth={1.8} className="text-slate-400" />

              <span>
                {parkingSpaces} {parkingSpaces === 1 ? 'vaga' : 'vagas'}
              </span>
            </div>
          )}

          {Number.isFinite(totalArea) && totalArea > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <Ruler size={17} strokeWidth={1.8} className="text-slate-400" />

              <span>{totalArea} m²</span>
            </div>
          )}
        </div>

        {/* Price */}
        <div className="mt-5">
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-slate-400">
            {price.label || 'Valor'}
          </p>

          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            {price.value}
          </p>
        </div>

        {/* Broker */}
        {showBroker && brokerName && (
          <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-5">
            {brokerAvatar ? (
              <img
                src={brokerAvatar}
                alt={brokerName}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                {getInitials(brokerName)}
              </div>
            )}

            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                Atendimento
              </p>

              <p className="truncate text-sm font-semibold text-slate-700">
                {brokerName}
              </p>
            </div>
          </div>
        )}

        {/* CTA */}
        <Link
          to={href}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 hover:bg-slate-900 hover:text-white"
        >
          Ver detalhes
          <ArrowUpRight size={17} />
        </Link>
      </div>
    </article>
  );
}

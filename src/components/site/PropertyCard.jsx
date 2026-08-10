import {
  BedDouble,
  Bath,
  Car,
  MapPin,
  Heart,
  ArrowUpRight,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

export default function PropertyCard({ property, onFavorite }) {
  const navigate = useNavigate();

  if (!property) return null;

  const image =
    property.coverImage ||
    property.image ||
    property.images?.find((item) => item?.isCover)?.url ||
    property.images?.[0]?.url ||
    '';

  const location = property.location || {};

  const address = [location.district, location.city, location.state]
    .filter(Boolean)
    .join(', ');

  const price =
    property.prices?.salePrice ||
    property.prices?.rentPrice ||
    property.price ||
    0;

  const isRent = property.purpose === 'aluguel';

  const formattedPrice = price
    ? new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 0,
      }).format(price)
    : 'Consulte';

  // ==========================================
  // Navegar para detalhes
  // ==========================================

  const handleOpenProperty = () => {
    if (!property._id) return;

    navigate(`/properties/${property._id}`);
  };

  // ==========================================
  // Favorito
  // ==========================================

  const handleFavorite = (event) => {
    event.stopPropagation();

    onFavorite?.(property);
  };

  return (
    <article
      onClick={handleOpenProperty}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleOpenProperty();
        }
      }}
      className="
        group
        cursor-pointer
        overflow-hidden
        rounded-2xl
        border
        border-white/10
        bg-gray-900
        shadow-xl
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-blue-500/30
        hover:shadow-2xl
      "
    >
      {/* ==========================================
          IMAGE
      =========================================== */}

      <div className="relative h-64 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={property.name || 'Imóvel'}
            className="
              h-full
              w-full
              object-cover
              transition
              duration-700
              group-hover:scale-105
            "
          />
        ) : (
          <div
            className="
              flex
              h-full
              w-full
              items-center
              justify-center
              bg-gray-800
              text-sm
              text-gray-500
            "
          >
            Sem imagem
          </div>
        )}

        {/* Overlay */}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-t
            from-black/60
            via-transparent
            to-transparent
          "
        />

        {/* Purpose */}

        <div
          className="
            absolute
            left-4
            top-4
            rounded-lg
            border
            border-white/10
            bg-black/50
            px-3
            py-1.5
            text-xs
            font-semibold
            text-white
            backdrop-blur-md
          "
        >
          {isRent ? 'Para alugar' : 'À venda'}
        </div>

        {/* Favorite */}

        <button
          type="button"
          onClick={handleFavorite}
          className="
            absolute
            right-4
            top-4
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border
            border-white/10
            bg-black/40
            text-white
            backdrop-blur-md
            transition
            hover:bg-white
            hover:text-red-500
          "
          aria-label="Favoritar imóvel"
        >
          <Heart size={18} />
        </button>

        {/* Code */}

        {property.code && (
          <div
            className="
              absolute
              bottom-4
              left-4
              text-xs
              font-medium
              text-white/80
            "
          >
            Código {property.code}
          </div>
        )}
      </div>

      {/* ==========================================
          CONTENT
      =========================================== */}

      <div className="p-5">
        <div className="mb-2 flex items-start justify-between gap-4">
          <h3
            className="
              line-clamp-1
              text-lg
              font-semibold
              text-white
            "
          >
            {property.name}
          </h3>

          <ArrowUpRight
            size={18}
            className="
              shrink-0
              text-gray-500
              transition
              group-hover:text-blue-400
            "
          />
        </div>

        {/* Address */}

        {address && (
          <div
            className="
              mb-4
              flex
              items-center
              gap-2
              text-sm
              text-gray-400
            "
          >
            <MapPin size={15} className="shrink-0" />

            <span className="line-clamp-1">{address}</span>
          </div>
        )}

        {/* ==========================================
            FEATURES
        =========================================== */}

        <div
          className="
            flex
            items-center
            gap-4
            border-b
            border-white/10
            pb-4
            text-sm
            text-gray-400
          "
        >
          {property.bedrooms > 0 && (
            <div className="flex items-center gap-1.5">
              <BedDouble size={16} />
              {property.bedrooms}
            </div>
          )}

          {property.bathrooms > 0 && (
            <div className="flex items-center gap-1.5">
              <Bath size={16} />
              {property.bathrooms}
            </div>
          )}

          {property.parkingSpaces > 0 && (
            <div className="flex items-center gap-1.5">
              <Car size={16} />
              {property.parkingSpaces}
            </div>
          )}
        </div>

        {/* ==========================================
            PRICE
        =========================================== */}

        <div className="mt-4">
          <span className="text-xs text-gray-500">
            {isRent ? 'A partir de' : 'Valor'}
          </span>

          <div
            className="
              mt-1
              text-xl
              font-bold
              text-white
            "
          >
            {formattedPrice}

            {isRent && (
              <span
                className="
                  ml-1
                  text-sm
                  font-normal
                  text-gray-500
                "
              >
                /mês
              </span>
            )}
          </div>
        </div>

        {/* ==========================================
            CTA
        =========================================== */}

        <div
          className="
            mt-5
            flex
            items-center
            justify-between
            border-t
            border-white/10
            pt-4
          "
        >
          <span
            className="
              text-sm
              font-medium
              text-gray-400
              transition
              group-hover:text-blue-400
            "
          >
            Ver detalhes
          </span>

          <ArrowUpRight
            size={17}
            className="
              text-gray-500
              transition
              group-hover:translate-x-0.5
              group-hover:-translate-y-0.5
              group-hover:text-blue-400
            "
          />
        </div>
      </div>
    </article>
  );
}

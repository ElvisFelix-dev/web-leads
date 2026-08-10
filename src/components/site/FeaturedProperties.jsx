import { ArrowRight } from 'lucide-react';
import PropertyCard from './PropertyCard';

export default function FeaturedProperties({
  properties = [],
  loading = false,
  onFavorite,
  onViewAll,
}) {
  return (
    <section className="bg-gray-950 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className="
          mb-10
          flex
          flex-col
          gap-5
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
        >
          <div>
            <span
              className="
              text-xs
              font-semibold
              uppercase
              tracking-[0.2em]
              text-blue-500
            "
            >
              Seleção especial
            </span>

            <h2
              className="
              mt-3
              text-3xl
              font-bold
              tracking-tight
              text-white
              sm:text-4xl
            "
            >
              Imóveis em destaque
            </h2>

            <p
              className="
              mt-3
              max-w-2xl
              text-gray-400
            "
            >
              Uma seleção de imóveis que podem ser exatamente o que você está
              procurando.
            </p>
          </div>

          <button
            type="button"
            onClick={onViewAll}
            className="
              flex
              items-center
              gap-2
              self-start
              text-sm
              font-semibold
              text-blue-400
              transition
              hover:text-blue-300
              sm:self-auto
            "
          >
            Ver todos
            <ArrowRight size={17} />
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div
            className="
            grid
            gap-6
            sm:grid-cols-2
            lg:grid-cols-3
          "
          >
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="
                  aspect-[4/5]
                  animate-pulse
                  rounded-2xl
                  bg-gray-900
                "
              />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && properties.length === 0 && (
          <div
            className="
            rounded-2xl
            border
            border-dashed
            border-white/10
            bg-gray-900/50
            p-12
            text-center
          "
          >
            <p className="text-gray-400">
              Nenhum imóvel em destaque no momento.
            </p>
          </div>
        )}

        {/* Properties */}
        {!loading && properties.length > 0 && (
          <div
            className="
            grid
            gap-6
            sm:grid-cols-2
            lg:grid-cols-3
          "
          >
            {properties.slice(0, 6).map((property) => (
              <PropertyCard
                key={property._id}
                property={property}
                onFavorite={onFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

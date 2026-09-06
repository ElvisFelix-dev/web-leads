// src/components/site/FeaturedProperties.jsx
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, CheckCircle2, Sparkles } from 'lucide-react';

import PropertyCard from './PropertyCard';

export default function FeaturedProperties({
  properties = [],
  loading = false,
  onFavorite,
  onViewAll,
}) {
  const navigate = useNavigate();
  const visibleProperties = Array.isArray(properties)
    ? properties.slice(0, 6)
    : [];

  // 🔥 FILTRAR IMÓVEIS VENDIDOS
  const availableProperties = visibleProperties.filter((property) => {
    if (!property) return false;
    const status = property?.status?.toLowerCase() || '';
    return status !== 'vendido' && status !== 'sold';
  });

  return (
    <section className="relative overflow-hidden bg-gray-950 pb-8 pt-4 sm:pb-10 sm:pt-5 lg:pb-12 lg:pt-6">
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0">
        <div
          className="
            absolute
            inset-0
            opacity-[0.02]
            [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)]
            [background-size:64px_64px]
          "
        />

        <div
          className="
            absolute
            -left-40
            top-20
            h-[400px]
            w-[400px]
            rounded-full
            bg-blue-600/[0.07]
            blur-[130px]
          "
        />

        <div
          className="
            absolute
            -right-40
            bottom-20
            h-[400px]
            w-[400px]
            rounded-full
            bg-indigo-600/[0.06]
            blur-[130px]
          "
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* =====================================================
            SECTION HEADER
        ====================================================== */}

        <div
          className="
            mb-2
            flex
            flex-col
            gap-6
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <div className="max-w-2xl">
            <div
              className="
                mb-5
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-blue-500/20
                bg-blue-500/[0.08]
                px-4
                py-2
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.2em]
                text-blue-400
              "
            >
              <Sparkles size={14} />
              Seleção especial
            </div>

            <h2
              className="
                text-3xl
                font-bold
                leading-tight
                tracking-[-0.025em]
                text-white
                sm:text-4xl
                lg:text-5xl
              "
            >
              Imóveis escolhidos
              <span className="block text-blue-400">para você.</span>
            </h2>

            <p
              className="
                mt-5
                max-w-xl
                text-base
                leading-7
                text-gray-400
                sm:text-lg
              "
            >
              Explore uma seleção de oportunidades que combinam localização,
              qualidade e potencial para o seu próximo momento.
            </p>
          </div>

          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center lg:flex-col lg:items-end">
            {!loading && availableProperties.length > 0 && (
              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-xs
                  font-medium
                  text-gray-500
                "
              >
                <Building2 size={15} className="text-blue-400" />
                <span>
                  {availableProperties.length}
                  {availableProperties.length === 1
                    ? ' imóvel disponível'
                    : ' imóveis disponíveis'}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => navigate('/imoveis')}
              className="
                group
                inline-flex
                items-center
                gap-3
                rounded-xl
                border
                border-white/10
                bg-white/[0.03]
                px-5
                py-3
                text-sm
                font-semibold
                text-gray-200
                shadow-lg
                shadow-black/10
                backdrop-blur-xl
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:border-blue-500/30
                hover:bg-blue-500/[0.08]
                hover:text-white
              "
            >
              Ver todos os imóveis
              <ArrowRight
                size={17}
                className="
                  text-blue-400
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              />
            </button>
          </div>
        </div>

        <div
          className="
            mb-8
            h-px
            w-full
            bg-gradient-to-r
            from-blue-500/30
            via-white/[0.08]
            to-transparent
          "
        />

        {/* =====================================================
            LOADING
        ====================================================== */}

        {loading && (
          <div
            className="
              grid
              gap-6
              sm:grid-cols-2
              lg:grid-cols-3
            "
          >
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
                <div
                  className="
                    aspect-[4/3]
                    animate-pulse
                    bg-gray-900
                  "
                />

                <div className="space-y-4 p-5">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-800" />
                  <div className="h-6 w-3/4 animate-pulse rounded bg-gray-800" />
                  <div className="h-4 w-full animate-pulse rounded bg-gray-800" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-gray-800" />
                  <div className="pt-2">
                    <div className="h-10 w-full animate-pulse rounded-xl bg-gray-800" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* =====================================================
            EMPTY STATE
        ====================================================== */}

        {!loading && availableProperties.length === 0 && (
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
              py-16
              text-center
              sm:px-10
              sm:py-20
            "
          >
            <div
              className="
                pointer-events-none
                absolute
                left-1/2
                top-1/2
                h-48
                w-48
                -translate-x-1/2
                -translate-y-1/2
                rounded-full
                bg-blue-500/[0.06]
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

              <h3 className="mt-6 text-xl font-semibold text-white">
                Novas oportunidades estão chegando
              </h3>

              <p
                className="
                  mx-auto
                  mt-3
                  max-w-md
                  text-sm
                  leading-6
                  text-gray-500
                "
              >
                No momento não temos imóveis em destaque. Nossa equipe está
                sempre buscando novas oportunidades.
              </p>

              <button
                type="button"
                onClick={() => navigate('/imoveis')}
                className="
                  group
                  mt-7
                  inline-flex
                  items-center
                  gap-2
                  text-sm
                  font-semibold
                  text-blue-400
                  transition
                  hover:text-blue-300
                "
              >
                Explorar imóveis
                <ArrowRight
                  size={16}
                  className="
                    transition-transform
                    group-hover:translate-x-1
                  "
                />
              </button>
            </div>
          </div>
        )}

        {/* =====================================================
            PROPERTY GRID
        ====================================================== */}

        {!loading && availableProperties.length > 0 && (
          <>
            <div
              className="
                grid
                gap-6
                sm:grid-cols-2
                lg:grid-cols-3
              "
            >
              {availableProperties.map((property, index) => {
                // 🔥 VERIFICAÇÃO DE SEGURANÇA
                if (!property || !property._id) {
                  return null;
                }

                return (
                  <div
                    key={property._id}
                    className="
                      group
                      relative
                      transition-all
                      duration-500
                    "
                    style={{
                      animationDelay: `${index * 70}ms`,
                    }}
                  >
                    <PropertyCard property={property} onFavorite={onFavorite} />
                  </div>
                );
              })}
            </div>

            {/* =================================================
                BOTTOM TRUST BAR
            ================================================== */}

            <div
              className="
                mt-10
                flex
                flex-col
                gap-4
                rounded-2xl
                border
                border-white/[0.06]
                bg-white/[0.02]
                px-5
                py-5
                sm:flex-row
                sm:items-center
                sm:justify-between
                sm:px-6
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-blue-500/10
                    text-blue-400
                  "
                >
                  <CheckCircle2 size={18} />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-300">
                    Seleção atualizada
                  </p>

                  <p className="mt-0.5 text-xs text-gray-600">
                    Novas oportunidades podem entrar a qualquer momento.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/imoveis')}
                className="
                  group
                  inline-flex
                  items-center
                  gap-2
                  text-sm
                  font-semibold
                  text-blue-400
                  transition
                  hover:text-blue-300
                "
              >
                Explorar todo o catálogo
                <ArrowRight
                  size={16}
                  className="
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

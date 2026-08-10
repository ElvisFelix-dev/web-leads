import { ArrowRight, MessageCircle } from 'lucide-react';

export default function BrokersSection({ brokers = [], onViewAll, onContact }) {
  // =====================================================
  // Normalização
  // =====================================================

  const brokerList = Array.isArray(brokers)
    ? brokers
    : Array.isArray(brokers?.brokers)
      ? brokers.brokers
      : Array.isArray(brokers?.data)
        ? brokers.data
        : [];

  // =====================================================
  // Render
  // =====================================================

  return (
    <section className="bg-gray-950 py-20 sm:py-24">
      <div
        className="
          mx-auto
          max-w-7xl
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            mb-10
            flex
            flex-col
            justify-between
            gap-5
            sm:flex-row
            sm:items-end
          "
        >
          <div>
            <span
              className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.18em]
                text-blue-400
              "
            >
              Nosso time
            </span>

            <h2
              className="
                mt-3
                text-3xl
                font-bold
                text-white
                sm:text-4xl
              "
            >
              Fale com um especialista
            </h2>

            <p
              className="
                mt-3
                max-w-2xl
                text-gray-400
              "
            >
              Conte o que você procura e deixe nosso time ajudar a encontrar as
              melhores opções.
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

        {/* =================================================
            BROKERS
        ================================================= */}

        {brokerList.length === 0 ? (
          <div
            className="
              rounded-2xl
              border
              border-dashed
              border-white/10
              bg-gray-900
              p-10
              text-center
            "
          >
            <p className="text-gray-400">
              Nenhum especialista disponível no momento.
            </p>
          </div>
        ) : (
          <div
            className="
              grid
              gap-6
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >
            {brokerList.slice(0, 4).map((broker) => {
              const brokerName =
                broker?.name || broker?.fullName || 'Especialista';

              const firstName = brokerName.split(' ')[0];

              const avatar =
                broker?.avatar || broker?.profileImage || broker?.photo || '';

              const specialty =
                broker?.specialty ||
                broker?.role ||
                broker?.position ||
                'Especialista imobiliário';

              return (
                <article
                  key={broker?._id || broker?.id}
                  className="
                    group
                    overflow-hidden
                    rounded-2xl
                    border
                    border-white/10
                    bg-gray-900
                    shadow-xl
                    shadow-black/20
                    transition
                    duration-300
                    hover:-translate-y-1
                    hover:border-blue-500/30
                    hover:shadow-blue-950/20
                  "
                >
                  {/* =================================================
                      AVATAR
                  ================================================= */}

                  <div
                    className="
                      aspect-square
                      overflow-hidden
                      bg-gray-800
                    "
                  >
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={brokerName}
                        className="
                          h-full
                          w-full
                          object-cover
                          transition
                          duration-500
                          group-hover:scale-105
                        "
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                          event.currentTarget.nextElementSibling.style.display =
                            'flex';
                        }}
                      />
                    ) : null}

                    {/* Fallback */}

                    <div
                      className={`
                        ${avatar ? 'hidden' : 'flex'}
                        h-full
                        w-full
                        items-center
                        justify-center
                        bg-gradient-to-br
                        from-gray-800
                        to-gray-950
                        text-5xl
                        font-bold
                        text-gray-600
                      `}
                    >
                      {brokerName?.charAt(0)?.toUpperCase()}
                    </div>
                  </div>

                  {/* =================================================
                      CONTENT
                  ================================================= */}

                  <div className="p-5">
                    <h3
                      className="
                        text-lg
                        font-semibold
                        text-white
                      "
                    >
                      {brokerName}
                    </h3>

                    {broker.position && (
                      <p className="mt-1 text-sm text-gray-500">
                        {broker.position}
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => onContact?.(broker)}
                      className="
                        mt-5
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-white/10
                        bg-white/5
                        px-4
                        py-2.5
                        text-sm
                        font-semibold
                        text-gray-200
                        transition
                        hover:border-blue-500/30
                        hover:bg-blue-600
                        hover:text-white
                      "
                    >
                      <MessageCircle size={16} />
                      Falar com {firstName}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

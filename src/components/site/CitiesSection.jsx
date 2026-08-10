import { ArrowRight, MapPin } from 'lucide-react';

export default function CitiesSection({ cities = [], onSelect }) {
  const defaultCities = [
    {
      name: 'São Paulo',
      state: 'SP',
      properties: 0,
    },
    {
      name: 'Campinas',
      state: 'SP',
      properties: 0,
    },
    {
      name: 'Guarulhos',
      state: 'SP',
      properties: 0,
    },
    {
      name: 'Santo André',
      state: 'SP',
      properties: 0,
    },
  ];

  const items = cities.length > 0 ? cities : defaultCities;

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
        <div className="mb-10">
          <span
            className="
            text-xs
            font-semibold
            uppercase
            tracking-[0.2em]
            text-blue-500
          "
          >
            Onde estamos
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
            Encontre imóveis por região
          </h2>

          <p
            className="
            mt-3
            max-w-2xl
            text-gray-400
          "
          >
            Explore as cidades e regiões onde temos imóveis disponíveis.
          </p>
        </div>

        <div
          className="
          grid
          gap-4
          sm:grid-cols-2
          lg:grid-cols-4
        "
        >
          {items.slice(0, 8).map((city) => (
            <button
              key={`${city.name}-${city.state}`}
              type="button"
              onClick={() => onSelect?.(city)}
              className="
                group
                relative
                overflow-hidden
                rounded-2xl
                border
                border-white/10
                bg-gray-900
                p-6
                text-left
                transition
                hover:-translate-y-1
                hover:border-blue-500/30
                hover:bg-gray-900/80
              "
            >
              <div
                className="
                mb-5
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-blue-500/10
                text-blue-400
              "
              >
                <MapPin size={21} />
              </div>

              <h3
                className="
                text-lg
                font-semibold
                text-white
              "
              >
                {city.name}
              </h3>

              <p
                className="
                mt-1
                text-sm
                text-gray-500
              "
              >
                {city.state}
              </p>

              {city.properties > 0 && (
                <p
                  className="
                  mt-4
                  text-xs
                  text-gray-400
                "
                >
                  {city.properties} imóveis
                </p>
              )}

              <ArrowRight
                size={18}
                className="
                  absolute
                  bottom-6
                  right-6
                  text-gray-600
                  transition
                  group-hover:translate-x-1
                  group-hover:text-blue-400
                "
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

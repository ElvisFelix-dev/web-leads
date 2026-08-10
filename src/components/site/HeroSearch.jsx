import { Search, MapPin, Home, DollarSign } from 'lucide-react';

export default function HeroSearch({ onSearch, cities = [] }) {
  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const filters = {
      purpose: formData.get('purpose'),
      city: formData.get('city'),
      type: formData.get('type'),
      price: formData.get('price'),
    };

    onSearch?.(filters);
  };

  return (
    <section className="relative overflow-hidden bg-gray-950">
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="
          absolute
          left-1/2
          top-0
          h-[500px]
          w-[700px]
          -translate-x-1/2
          rounded-full
          bg-blue-600/10
          blur-[120px]
        "
        />

        <div
          className="
          absolute
          bottom-0
          right-0
          h-[300px]
          w-[400px]
          rounded-full
          bg-indigo-600/10
          blur-[100px]
        "
        />
      </div>

      <div
        className="
        relative
        mx-auto
        max-w-7xl
        px-4
        pb-20
        pt-16
        sm:px-6
        sm:pt-24
        lg:px-8
        lg:pb-28
        lg:pt-28
      "
      >
        {/* Text */}
        <div className="mx-auto max-w-3xl text-center">
          <div
            className="
            mb-5
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-blue-500/20
            bg-blue-500/10
            px-4
            py-2
            text-xs
            font-semibold
            uppercase
            tracking-[0.18em]
            text-blue-400
          "
          >
            <MapPin size={14} />
            Encontre seu próximo imóvel
          </div>

          <h1
            className="
            text-4xl
            font-bold
            leading-tight
            tracking-tight
            text-white
            sm:text-5xl
            lg:text-6xl
          "
          >
            O imóvel certo começa
            <span className="block text-blue-500">com a escolha certa.</span>
          </h1>

          <p
            className="
            mx-auto
            mt-6
            max-w-2xl
            text-base
            leading-7
            text-gray-400
            sm:text-lg
          "
          >
            Encontre imóveis selecionados e conte com atendimento personalizado
            para transformar sua busca em uma nova história.
          </p>
        </div>

        {/* Search Box */}
        <form
          onSubmit={handleSubmit}
          className="
            mx-auto
            mt-10
            max-w-5xl
            rounded-2xl
            border
            border-white/10
            bg-gray-900/90
            p-3
            shadow-2xl
            shadow-black/30
            backdrop-blur-xl
            sm:p-4
          "
        >
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            {/* Purpose */}
            <div className="relative">
              <label className="sr-only">Finalidade</label>

              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">
                <Home size={17} />
              </div>

              <select
                name="purpose"
                defaultValue=""
                className="
                  h-14
                  w-full
                  appearance-none
                  rounded-xl
                  border
                  border-white/10
                  bg-gray-800
                  pl-11
                  pr-4
                  text-sm
                  text-white
                  outline-none
                  transition
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-500/20
                "
              >
                <option value="">Comprar ou alugar</option>

                <option value="venda">Comprar</option>

                <option value="aluguel">Alugar</option>
              </select>
            </div>

            {/* City */}
            <div className="relative">
              <label className="sr-only">Cidade</label>

              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">
                <MapPin size={17} />
              </div>

              <select
                name="city"
                defaultValue=""
                className="
                  h-14
                  w-full
                  appearance-none
                  rounded-xl
                  border
                  border-white/10
                  bg-gray-800
                  pl-11
                  pr-4
                  text-sm
                  text-white
                  outline-none
                  transition
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-500/20
                "
              >
                <option value="">Todas as cidades</option>

                {cities.map((city) => (
                  <option key={city.value || city} value={city.value || city}>
                    {city.label || city}
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div className="relative">
              <label className="sr-only">Tipo de imóvel</label>

              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">
                <Home size={17} />
              </div>

              <select
                name="type"
                defaultValue=""
                className="
                  h-14
                  w-full
                  appearance-none
                  rounded-xl
                  border
                  border-white/10
                  bg-gray-800
                  pl-11
                  pr-4
                  text-sm
                  text-white
                  outline-none
                  transition
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-500/20
                "
              >
                <option value="">Tipo de imóvel</option>

                <option value="casa">Casa</option>

                <option value="apartamento">Apartamento</option>

                <option value="terreno">Terreno</option>

                <option value="comercial">Comercial</option>
              </select>
            </div>

            {/* Price */}
            <div className="relative">
              <label className="sr-only">Faixa de preço</label>

              <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-blue-400">
                <DollarSign size={17} />
              </div>

              <select
                name="price"
                defaultValue=""
                className="
                  h-14
                  w-full
                  appearance-none
                  rounded-xl
                  border
                  border-white/10
                  bg-gray-800
                  pl-11
                  pr-4
                  text-sm
                  text-white
                  outline-none
                  transition
                  focus:border-blue-500
                  focus:ring-2
                  focus:ring-blue-500/20
                "
              >
                <option value="">Faixa de preço</option>

                <option value="0-300000">Até R$ 300 mil</option>

                <option value="300000-600000">R$ 300 mil – R$ 600 mil</option>

                <option value="600000-1000000">R$ 600 mil – R$ 1 milhão</option>

                <option value="1000000+">Acima de R$ 1 milhão</option>
              </select>
            </div>

            {/* Button */}
            <button
              type="submit"
              className="
                flex
                h-14
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-blue-600
                px-6
                text-sm
                font-semibold
                text-white
                shadow-lg
                shadow-blue-600/20
                transition
                hover:bg-blue-500
                active:scale-[0.98]
              "
            >
              <Search size={18} />
              Buscar imóveis
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

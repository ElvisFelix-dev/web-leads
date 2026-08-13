import {
  Search,
  MapPin,
  Home,
  DollarSign,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

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
    <section className="relative isolate overflow-hidden bg-gray-950">
      {/* ============================================================
          BACKGROUND
      ============================================================ */}

      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Glow principal */}
        <div
          className="
            absolute
            left-1/2
            top-[-120px]
            h-[650px]
            w-[900px]
            -translate-x-1/2
            rounded-full
            bg-blue-600/10
            blur-[140px]
          "
        />

        {/* Glow lateral */}
        <div
          className="
            absolute
            right-[-180px]
            top-[25%]
            h-[450px]
            w-[450px]
            rounded-full
            bg-indigo-600/10
            blur-[130px]
          "
        />

        {/* Glow inferior */}
        <div
          className="
            absolute
            bottom-[-200px]
            left-[-150px]
            h-[450px]
            w-[450px]
            rounded-full
            bg-blue-500/5
            blur-[120px]
          "
        />

        {/* Grid sutil */}
        <div
          className="
            absolute
            inset-0
            opacity-[0.035]
          "
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        {/* Fade inferior */}
        <div
          className="
            absolute
            inset-x-0
            bottom-0
            h-40
            bg-gradient-to-t
            from-gray-950
            to-transparent
          "
        />
      </div>

      {/* ============================================================
          CONTAINER
      ============================================================ */}

      <div
        className="
          relative
          mx-auto
          max-w-7xl
          px-4
          pt-6
pb-16
sm:pt-8
sm:pb-20
lg:pt-10
lg:pb-24
        "
      >
        {/* ============================================================
            HERO CONTENT
        ============================================================ */}

        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div
            className="
              mb-7
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-blue-400/20
              bg-blue-500/10
              px-4
              py-2
              shadow-lg
              shadow-blue-500/5
              backdrop-blur-md
            "
          >
            <span
              className="
                flex
                h-5
                w-5
                items-center
                justify-center
                rounded-full
                bg-blue-500/15
              "
            >
              <Sparkles size={12} className="text-blue-400" />
            </span>

            <span
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.22em]
                text-blue-300
                sm:text-xs
              "
            >
              Inteligência imobiliária
            </span>
          </div>

          {/* Heading */}
          <h1
            className="
              text-4xl
              font-bold
              leading-[1.08]
              tracking-[-0.035em]
              text-white
              sm:text-5xl
              md:text-6xl
              lg:text-7xl
            "
          >
            Encontre um lugar
            <span
              className="
                block
                bg-gradient-to-r
                from-blue-400
                via-blue-500
                to-indigo-400
                bg-clip-text
                text-transparent
              "
            >
              para chamar de seu.
            </span>
          </h1>

          {/* Description */}
          <p
            className="
              mx-auto
              mt-7
              max-w-2xl
              text-base
              leading-7
              text-gray-400
              sm:text-lg
              sm:leading-8
            "
          >
            Imóveis selecionados, atendimento personalizado e uma experiência
            pensada para ajudar você a encontrar o imóvel certo para o seu
            próximo capítulo.
          </p>

          {/* Mini trust */}
          <div
            className="
              mt-7
              flex
              flex-wrap
              items-center
              justify-center
              gap-x-6
              gap-y-3
              text-xs
              text-gray-500
              sm:text-sm
            "
          >
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-blue-400" />

              <span>Atendimento especializado</span>
            </div>

            <div className="hidden h-1 w-1 rounded-full bg-gray-700 sm:block" />

            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-blue-400" />

              <span>Grande São Paulo</span>
            </div>
          </div>
        </div>

        {/* ============================================================
            SEARCH CARD
        ============================================================ */}

        <div className="mx-auto mt-12 max-w-6xl sm:mt-14">
          <form
            onSubmit={handleSubmit}
            className="
              relative
              overflow-hidden
              rounded-[28px]
              border
              border-white/[0.12]
              bg-white/[0.055]
              p-2
              shadow-[0_30px_100px_rgba(0,0,0,0.45)]
              backdrop-blur-2xl
              sm:p-3
            "
          >
            {/* Card glow */}
            <div
              className="
                pointer-events-none
                absolute
                inset-x-10
                top-0
                h-px
                bg-gradient-to-r
                from-transparent
                via-blue-400/60
                to-transparent
              "
            />

            <div
              className="
                rounded-[22px]
                border
                border-white/[0.06]
                bg-gray-900/80
                p-3
                sm:p-4
              "
            >
              {/* Search label */}
              <div className="mb-4 flex items-center justify-between px-1">
                <div>
                  <div className="text-sm font-semibold text-white">
                    Encontre seu imóvel
                  </div>

                  <div className="mt-0.5 text-xs text-gray-500">
                    Refine sua busca e encontre as melhores oportunidades
                  </div>
                </div>

                <div
                  className="
                    hidden
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-white/10
                    bg-white/[0.04]
                    px-3
                    py-1.5
                    text-[10px]
                    font-medium
                    text-gray-400
                    sm:flex
                  "
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Busca inteligente
                </div>
              </div>

              {/* Fields */}
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
                {/* ====================================================
                    PURPOSE
                ==================================================== */}

                <div className="group relative">
                  <label
                    htmlFor="hero-purpose"
                    className="
                      mb-1.5
                      block
                      px-1
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.14em]
                      text-gray-500
                    "
                  >
                    Finalidade
                  </label>

                  <div
                    className="
                      relative
                      overflow-hidden
                      rounded-2xl
                      border
                      border-white/10
                      bg-white/[0.045]
                      transition
                      duration-300
                      group-focus-within:border-blue-500/50
                      group-focus-within:bg-blue-500/[0.04]
                      group-focus-within:shadow-lg
                      group-focus-within:shadow-blue-500/5
                    "
                  >
                    <Home
                      size={17}
                      className="
                        pointer-events-none
                        absolute
                        left-4
                        top-1/2
                        z-10
                        -translate-y-1/2
                        text-blue-400
                      "
                    />

                    <ChevronDown
                      size={15}
                      className="
                        pointer-events-none
                        absolute
                        right-4
                        top-1/2
                        z-10
                        -translate-y-1/2
                        text-gray-500
                      "
                    />

                    <select
                      id="hero-purpose"
                      name="purpose"
                      defaultValue=""
                      className="
                        h-14
                        w-full
                        appearance-none
                        bg-transparent
                        pl-11
                        pr-10
                        text-sm
                        font-medium
                        text-white
                        outline-none
                      "
                    >
                      <option value="" className="bg-gray-900">
                        Comprar ou alugar
                      </option>

                      <option value="venda" className="bg-gray-900">
                        Comprar
                      </option>

                      <option value="aluguel" className="bg-gray-900">
                        Alugar
                      </option>
                    </select>
                  </div>
                </div>

                {/* ====================================================
                    CITY
                ==================================================== */}

                <div className="group relative">
                  <label
                    htmlFor="hero-city"
                    className="
                      mb-1.5
                      block
                      px-1
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.14em]
                      text-gray-500
                    "
                  >
                    Localização
                  </label>

                  <div
                    className="
                      relative
                      overflow-hidden
                      rounded-2xl
                      border
                      border-white/10
                      bg-white/[0.045]
                      transition
                      duration-300
                      group-focus-within:border-blue-500/50
                      group-focus-within:bg-blue-500/[0.04]
                    "
                  >
                    <MapPin
                      size={17}
                      className="
                        pointer-events-none
                        absolute
                        left-4
                        top-1/2
                        z-10
                        -translate-y-1/2
                        text-blue-400
                      "
                    />

                    <ChevronDown
                      size={15}
                      className="
                        pointer-events-none
                        absolute
                        right-4
                        top-1/2
                        z-10
                        -translate-y-1/2
                        text-gray-500
                      "
                    />

                    <select
                      id="hero-city"
                      name="city"
                      defaultValue=""
                      className="
                        h-14
                        w-full
                        appearance-none
                        bg-transparent
                        pl-11
                        pr-10
                        text-sm
                        font-medium
                        text-white
                        outline-none
                      "
                    >
                      <option value="" className="bg-gray-900">
                        Todas as cidades
                      </option>

                      {cities.map((city) => (
                        <option
                          key={city.value || city}
                          value={city.value || city}
                          className="bg-gray-900"
                        >
                          {city.label || city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ====================================================
                    TYPE
                ==================================================== */}

                <div className="group relative">
                  <label
                    htmlFor="hero-type"
                    className="
                      mb-1.5
                      block
                      px-1
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.14em]
                      text-gray-500
                    "
                  >
                    Tipo
                  </label>

                  <div
                    className="
                      relative
                      overflow-hidden
                      rounded-2xl
                      border
                      border-white/10
                      bg-white/[0.045]
                      transition
                      duration-300
                      group-focus-within:border-blue-500/50
                      group-focus-within:bg-blue-500/[0.04]
                    "
                  >
                    <Home
                      size={17}
                      className="
                        pointer-events-none
                        absolute
                        left-4
                        top-1/2
                        z-10
                        -translate-y-1/2
                        text-blue-400
                      "
                    />

                    <ChevronDown
                      size={15}
                      className="
                        pointer-events-none
                        absolute
                        right-4
                        top-1/2
                        z-10
                        -translate-y-1/2
                        text-gray-500
                      "
                    />

                    <select
                      id="hero-type"
                      name="type"
                      defaultValue=""
                      className="
                        h-14
                        w-full
                        appearance-none
                        bg-transparent
                        pl-11
                        pr-10
                        text-sm
                        font-medium
                        text-white
                        outline-none
                      "
                    >
                      <option value="" className="bg-gray-900">
                        Tipo de imóvel
                      </option>

                      <option value="casa" className="bg-gray-900">
                        Casa
                      </option>

                      <option value="apartamento" className="bg-gray-900">
                        Apartamento
                      </option>

                      <option value="terreno" className="bg-gray-900">
                        Terreno
                      </option>

                      <option value="comercial" className="bg-gray-900">
                        Comercial
                      </option>
                    </select>
                  </div>
                </div>

                {/* ====================================================
                    PRICE
                ==================================================== */}

                <div className="group relative">
                  <label
                    htmlFor="hero-price"
                    className="
                      mb-1.5
                      block
                      px-1
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.14em]
                      text-gray-500
                    "
                  >
                    Investimento
                  </label>

                  <div
                    className="
                      relative
                      overflow-hidden
                      rounded-2xl
                      border
                      border-white/10
                      bg-white/[0.045]
                      transition
                      duration-300
                      group-focus-within:border-blue-500/50
                      group-focus-within:bg-blue-500/[0.04]
                    "
                  >
                    <DollarSign
                      size={17}
                      className="
                        pointer-events-none
                        absolute
                        left-4
                        top-1/2
                        z-10
                        -translate-y-1/2
                        text-blue-400
                      "
                    />

                    <ChevronDown
                      size={15}
                      className="
                        pointer-events-none
                        absolute
                        right-4
                        top-1/2
                        z-10
                        -translate-y-1/2
                        text-gray-500
                      "
                    />

                    <select
                      id="hero-price"
                      name="price"
                      defaultValue=""
                      className="
                        h-14
                        w-full
                        appearance-none
                        bg-transparent
                        pl-11
                        pr-10
                        text-sm
                        font-medium
                        text-white
                        outline-none
                      "
                    >
                      <option value="" className="bg-gray-900">
                        Faixa de preço
                      </option>

                      <option value="0-300000" className="bg-gray-900">
                        Até R$ 300 mil
                      </option>

                      <option value="300000-600000" className="bg-gray-900">
                        R$ 300 mil – R$ 600 mil
                      </option>

                      <option value="600000-1000000" className="bg-gray-900">
                        R$ 600 mil – R$ 1 milhão
                      </option>

                      <option value="1000000+" className="bg-gray-900">
                        Acima de R$ 1 milhão
                      </option>
                    </select>
                  </div>
                </div>

                {/* ====================================================
                    BUTTON
                ==================================================== */}

                <div className="flex flex-col">
                  <div
                    className="
                      mb-1.5
                      hidden
                      px-1
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.14em]
                      text-transparent
                      lg:block
                    "
                  >
                    Buscar
                  </div>

                  <button
                    type="submit"
                    className="
                      group
                      relative
                      flex
                      h-14
                      w-full
                      items-center
                      justify-center
                      gap-2.5
                      overflow-hidden
                      rounded-2xl
                      bg-gradient-to-r
                      from-blue-600
                      to-blue-500
                      px-5
                      text-sm
                      font-bold
                      text-white
                      shadow-xl
                      shadow-blue-600/20
                      transition
                      duration-300
                      hover:-translate-y-0.5
                      hover:from-blue-500
                      hover:to-indigo-500
                      hover:shadow-2xl
                      hover:shadow-blue-600/30
                      active:translate-y-0
                      active:scale-[0.99]
                    "
                  >
                    {/* Shine */}
                    <span
                      className="
                        absolute
                        inset-y-0
                        -left-20
                        w-20
                        rotate-12
                        bg-white/20
                        blur-xl
                        transition-all
                        duration-700
                        group-hover:left-[120%]
                      "
                    />

                    <Search size={18} className="relative" />

                    <span className="relative">Buscar imóveis</span>

                    <ArrowRight
                      size={16}
                      className="
                        relative
                        transition-transform
                        duration-300
                        group-hover:translate-x-1
                      "
                    />
                  </button>
                </div>
              </div>

              {/* Footer do search */}
              <div
                className="
                  mt-4
                  flex
                  flex-col
                  gap-2
                  px-1
                  text-[11px]
                  text-gray-500
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <span>Encontre imóveis para comprar ou alugar.</span>

                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  Atendimento seguro e personalizado
                </span>
              </div>
            </div>
          </form>
        </div>

        {/* ============================================================
            BOTTOM HIGHLIGHTS
        ============================================================ */}

        <div
          className="
            mx-auto
            mt-10
            grid
            max-w-4xl
            grid-cols-1
            gap-3
            sm:grid-cols-3
          "
        >
          {[
            {
              value: 'Imóveis selecionados',
              label: 'Curadoria para diferentes perfis',
            },
            {
              value: 'Atendimento personalizado',
              label: 'Consultoria em cada etapa',
            },
            {
              value: 'Experiência imobiliária',
              label: 'Do primeiro contato à negociação',
            },
          ].map((item) => (
            <div
              key={item.value}
              className="
                rounded-2xl
                border
                border-white/[0.06]
                bg-white/[0.025]
                px-4
                py-4
                text-center
                backdrop-blur-sm
                transition
                duration-300
                hover:border-white/10
                hover:bg-white/[0.04]
              "
            >
              <div className="text-xs font-semibold text-gray-300">
                {item.value}
              </div>

              <div className="mt-1 text-[11px] text-gray-600">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

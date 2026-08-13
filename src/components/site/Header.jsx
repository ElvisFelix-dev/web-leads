import { useState } from 'react';

import {
  Menu,
  X,
  ChevronDown,
  Heart,
  UserRound,
  Building2,
  Users,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [propertiesOpen, setPropertiesOpen] = useState(false);

  const closeMobile = () => {
    setMobileOpen(false);
    setPropertiesOpen(false);
  };

  return (
    <header className="sticky top-0 z-50">
      {/* ============================================================
          BACKGROUND / GLASS
      ============================================================ */}

      <div className="absolute inset-0 border-b border-white/[0.08] bg-gray-950/90 backdrop-blur-2xl" />

      <div className="relative">
        {/* ============================================================
            TOP ACCENT
        ============================================================ */}

        <div className="h-px w-full bg-gradient-to-r from-transparent via-blue-500/70 to-transparent" />

        {/* ============================================================
            HEADER
        ============================================================ */}

        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* ============================================================
              LOGO
          ============================================================ */}

          <a
            href="/home"
            className="group flex items-center gap-3"
            aria-label="Página inicial"
          >
            {/* Logo Mark */}

            <div
              className="
                relative
                flex
                h-11
                w-11
                items-center
                justify-center
                overflow-hidden
                rounded-2xl
                border
                border-white/10
                bg-gradient-to-br
                from-blue-500
                via-blue-600
                to-indigo-700
                shadow-xl
                shadow-blue-600/20
                transition
                duration-300
                group-hover:scale-105
                group-hover:shadow-blue-500/30
              "
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 transition group-hover:opacity-100" />

              <span className="relative text-xl font-black tracking-tight text-white">
                I
              </span>
            </div>

            {/* Brand */}

            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="text-[17px] font-bold tracking-tight text-white">
                  Imobiliária
                </span>

                <Sparkles size={13} className="text-blue-400" />
              </div>

              <div className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.28em] text-gray-500">
                Imóveis & Negócios
              </div>
            </div>
          </a>

          {/* ============================================================
              DESKTOP NAVIGATION
          ============================================================ */}

          <nav className="hidden items-center gap-1 lg:flex">
            {/* Início */}

            <a
              href="/home"
              className="
                group
                relative
                rounded-xl
                px-4
                py-2.5
                text-sm
                font-medium
                text-white
                transition
                hover:bg-white/[0.05]
              "
            >
              Início
              <span
                className="
                  absolute
                  bottom-1.5
                  left-1/2
                  h-0.5
                  w-5
                  -translate-x-1/2
                  rounded-full
                  bg-blue-500
                "
              />
            </a>

            {/* ========================================================
                IMÓVEIS
            ======================================================== */}

            <div
              className="relative"
              onMouseEnter={() => setPropertiesOpen(true)}
              onMouseLeave={() => setPropertiesOpen(false)}
            >
              <a
                href="/imoveis"
                className="
                  flex
                  items-center
                  gap-1.5
                  rounded-xl
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-gray-300
                  transition
                  hover:bg-white/[0.05]
                  hover:text-white
                "
              >
                Imóveis
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    propertiesOpen ? 'rotate-180' : ''
                  }`}
                />
              </a>

              {/* Dropdown */}

              {propertiesOpen && (
                <div
                  className="
                    absolute
                    left-1/2
                    top-full
                    w-64
                    -translate-x-1/2
                    pt-3
                  "
                >
                  <div
                    className="
                      overflow-hidden
                      rounded-2xl
                      border
                      border-white/10
                      bg-gray-900/95
                      p-2
                      shadow-2xl
                      shadow-black/40
                      backdrop-blur-2xl
                    "
                  >
                    <a
                      href="/imoveis"
                      className="
                        group
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        p-3
                        transition
                        hover:bg-white/[0.06]
                      "
                    >
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-xl
                          bg-blue-500/10
                          text-blue-400
                        "
                      >
                        <Building2 size={17} />
                      </div>

                      <div>
                        <div className="text-sm font-semibold text-white">
                          Todos os imóveis
                        </div>

                        <div className="text-xs text-gray-500">
                          Encontre seu próximo imóvel
                        </div>
                      </div>

                      <ArrowUpRight
                        size={15}
                        className="ml-auto text-gray-600 transition group-hover:text-blue-400"
                      />
                    </a>

                    <a
                      href="/imoveis?purpose=venda"
                      className="
                        group
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        p-3
                        transition
                        hover:bg-white/[0.06]
                      "
                    >
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-xl
                          bg-emerald-500/10
                          text-emerald-400
                        "
                      >
                        <Building2 size={17} />
                      </div>

                      <div>
                        <div className="text-sm font-semibold text-white">
                          Comprar
                        </div>

                        <div className="text-xs text-gray-500">
                          Imóveis à venda
                        </div>
                      </div>
                    </a>

                    <a
                      href="/imoveis?purpose=aluguel"
                      className="
                        group
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        p-3
                        transition
                        hover:bg-white/[0.06]
                      "
                    >
                      <div
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-xl
                          bg-purple-500/10
                          text-purple-400
                        "
                      >
                        <Building2 size={17} />
                      </div>

                      <div>
                        <div className="text-sm font-semibold text-white">
                          Alugar
                        </div>

                        <div className="text-xs text-gray-500">
                          Imóveis para locação
                        </div>
                      </div>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Sobre */}

            <a
              href="/about-us"
              className="
                rounded-xl
                px-4
                py-2.5
                text-sm
                font-medium
                text-gray-300
                transition
                hover:bg-white/[0.05]
                hover:text-white
              "
            >
              Sobre nós
            </a>

            {/* Contato */}

            <a
              href="/contact"
              className="
                rounded-xl
                px-4
                py-2.5
                text-sm
                font-medium
                text-gray-300
                transition
                hover:bg-white/[0.05]
                hover:text-white
              "
            >
              Contato
            </a>
          </nav>

          {/* ============================================================
              DESKTOP ACTIONS
          ============================================================ */}

          <div className="hidden items-center gap-3 lg:flex">
            {/* Favorites */}

            <a
              href="/favoritos"
              aria-label="Meus favoritos"
              className="
                group
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                border
                border-white/10
                bg-white/[0.04]
                text-gray-400
                transition
                duration-300
                hover:border-white/20
                hover:bg-white/[0.08]
                hover:text-white
              "
            >
              <Heart size={18} className="transition group-hover:scale-110" />
            </a>

            {/* CTA */}

            <a
              href="/contact"
              className="
                group
                relative
                flex
                items-center
                gap-2
                overflow-hidden
                rounded-xl
                border
                border-blue-400/20
                bg-gradient-to-r
                from-blue-600
                to-indigo-600
                px-5
                py-2.5
                text-sm
                font-semibold
                text-white
                shadow-lg
                shadow-blue-600/20
                transition
                duration-300
                hover:-translate-y-0.5
                hover:shadow-blue-500/30
              "
            >
              <span
                className="
                  absolute
                  inset-0
                  -translate-x-full
                  bg-gradient-to-r
                  from-transparent
                  via-white/10
                  to-transparent
                  transition
                  duration-700
                  group-hover:translate-x-full
                "
              />

              <UserRound size={16} className="relative" />

              <span className="relative">Fale com um corretor</span>
            </a>
          </div>

          {/* ============================================================
              MOBILE BUTTON
          ============================================================ */}

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-white/10
              bg-white/[0.05]
              text-white
              transition
              hover:bg-white/[0.1]
              lg:hidden
            "
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        {/* ============================================================
            MOBILE MENU
        ============================================================ */}

        {mobileOpen && (
          <div className="border-t border-white/[0.08] bg-gray-950/98 backdrop-blur-2xl lg:hidden">
            <nav className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
              {/* Navigation */}

              <div className="space-y-1">
                <a
                  href="/"
                  onClick={closeMobile}
                  className="
                    flex
                    items-center
                    rounded-xl
                    bg-white/[0.05]
                    px-4
                    py-3.5
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  Início
                </a>

                <a
                  href="/imoveis"
                  onClick={closeMobile}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-4
                    py-3.5
                    text-sm
                    font-medium
                    text-gray-300
                    transition
                    hover:bg-white/[0.05]
                    hover:text-white
                  "
                >
                  <Building2 size={17} />
                  Imóveis
                </a>

                <a
                  href="/corretores"
                  onClick={closeMobile}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-4
                    py-3.5
                    text-sm
                    font-medium
                    text-gray-300
                    transition
                    hover:bg-white/[0.05]
                    hover:text-white
                  "
                >
                  <Users size={17} />
                  Corretores
                </a>

                <a
                  href="/favoritos"
                  onClick={closeMobile}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    px-4
                    py-3.5
                    text-sm
                    font-medium
                    text-gray-300
                    transition
                    hover:bg-white/[0.05]
                    hover:text-white
                  "
                >
                  <Heart size={17} />
                  Meus favoritos
                </a>

                <a
                  href="/about-us"
                  onClick={closeMobile}
                  className="
                    flex
                    items-center
                    rounded-xl
                    px-4
                    py-3.5
                    text-sm
                    font-medium
                    text-gray-300
                    transition
                    hover:bg-white/[0.05]
                    hover:text-white
                  "
                >
                  Sobre nós
                </a>

                <a
                  href="/contact"
                  onClick={closeMobile}
                  className="
                    flex
                    items-center
                    rounded-xl
                    px-4
                    py-3.5
                    text-sm
                    font-medium
                    text-gray-300
                    transition
                    hover:bg-white/[0.05]
                    hover:text-white
                  "
                >
                  Contato
                </a>
              </div>

              {/* ========================================================
                  MOBILE CTA
              ======================================================== */}

              <div className="mt-5 border-t border-white/[0.08] pt-5">
                <a
                  href="/contact"
                  onClick={closeMobile}
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-gradient-to-r
                    from-blue-600
                    to-indigo-600
                    px-5
                    py-3.5
                    text-sm
                    font-semibold
                    text-white
                    shadow-lg
                    shadow-blue-600/20
                  "
                >
                  <UserRound size={17} />
                  Fale com um corretor
                  <ArrowUpRight size={15} />
                </a>
              </div>

              {/* ========================================================
                  MOBILE TRUST
              ======================================================== */}

              <div className="mt-5 flex items-center justify-center gap-2 text-center text-[10px] uppercase tracking-[0.18em] text-gray-600">
                <Sparkles size={12} className="text-blue-500" />
                Atendimento personalizado
                <Sparkles size={12} className="text-blue-500" />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

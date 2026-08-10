import { useState } from 'react';
import { Menu, X, ChevronDown, Heart, UserRound } from 'lucide-react';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-gray-950/95 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3">
          <div
            className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            bg-blue-600
            shadow-lg
            shadow-blue-600/20
          "
          >
            <span className="text-xl font-bold text-white">I</span>
          </div>

          <div className="hidden sm:block">
            <div className="text-lg font-bold tracking-tight text-white">
              Imobiliária
            </div>

            <div className="text-[10px] uppercase tracking-[0.25em] text-gray-500">
              Imóveis & Negócios
            </div>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 lg:flex">
          <a
            href="/"
            className="text-sm font-medium text-white transition hover:text-blue-400"
          >
            Início
          </a>

          <a
            href="/imoveis"
            className="flex items-center gap-1 text-sm font-medium text-gray-300 transition hover:text-white"
          >
            Imóveis
            <ChevronDown size={15} />
          </a>

          <a
            href="/sobre"
            className="text-sm font-medium text-gray-300 transition hover:text-white"
          >
            Sobre nós
          </a>

          <a
            href="/contato"
            className="text-sm font-medium text-gray-300 transition hover:text-white"
          >
            Contato
          </a>
        </nav>

        {/* Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <button
            type="button"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-white/10
              bg-white/5
              text-gray-300
              transition
              hover:border-white/20
              hover:bg-white/10
              hover:text-white
            "
            aria-label="Favoritos"
          >
            <Heart size={18} />
          </button>

          <a
            href="/contato"
            className="
              flex
              items-center
              gap-2
              rounded-xl
              bg-blue-600
              px-5
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-lg
              shadow-blue-600/20
              transition
              hover:bg-blue-500
            "
          >
            <UserRound size={17} />
            Fale com um corretor
          </a>
        </div>

        {/* Mobile Button */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            border-white/10
            bg-white/5
            text-white
            lg:hidden
          "
          aria-label="Abrir menu"
        >
          {mobileOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-gray-950 lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-5 sm:px-6">
            <a
              href="/"
              onClick={() => setMobileOpen(false)}
              className="border-b border-white/5 py-4 text-sm font-medium text-white"
            >
              Início
            </a>

            <a
              href="/imoveis"
              onClick={() => setMobileOpen(false)}
              className="border-b border-white/5 py-4 text-sm font-medium text-gray-300"
            >
              Imóveis
            </a>

            <a
              href="/corretores"
              onClick={() => setMobileOpen(false)}
              className="border-b border-white/5 py-4 text-sm font-medium text-gray-300"
            >
              Corretores
            </a>

            <a
              href="/sobre"
              onClick={() => setMobileOpen(false)}
              className="border-b border-white/5 py-4 text-sm font-medium text-gray-300"
            >
              Sobre nós
            </a>

            <a
              href="/contato"
              onClick={() => setMobileOpen(false)}
              className="border-b border-white/5 py-4 text-sm font-medium text-gray-300"
            >
              Contato
            </a>

            <a
              href="/contato"
              onClick={() => setMobileOpen(false)}
              className="
                mt-5
                flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-blue-600
                px-5
                py-3
                text-sm
                font-semibold
                text-white
              "
            >
              <UserRound size={17} />
              Fale com um corretor
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

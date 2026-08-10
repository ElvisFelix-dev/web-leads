import {
  Instagram,
  Facebook,
  Linkedin,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-gray-950">
      <div
        className="
        mx-auto
        max-w-7xl
        px-4
        py-14
        sm:px-6
        lg:px-8
      "
      >
        <div
          className="
          grid
          gap-10
          md:grid-cols-2
          lg:grid-cols-4
        "
        >
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <div
                className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-blue-600
              "
              >
                <span className="font-bold text-white">I</span>
              </div>

              <div>
                <div className="font-bold text-white">Imobiliária</div>

                <div
                  className="
                  text-[9px]
                  uppercase
                  tracking-[0.2em]
                  text-gray-600
                "
                >
                  Imóveis & Negócios
                </div>
              </div>
            </div>

            <p
              className="
              mt-5
              max-w-xs
              text-sm
              leading-6
              text-gray-500
            "
            >
              Conectando pessoas aos imóveis certos através de atendimento
              personalizado.
            </p>

            <div
              className="
              mt-5
              flex
              items-center
              gap-2
            "
            >
              <a
                href="#"
                aria-label="Instagram"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-white/10
                  text-gray-400
                  transition
                  hover:bg-white/5
                  hover:text-white
                "
              >
                <Instagram size={17} />
              </a>

              <a
                href="#"
                aria-label="Facebook"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-white/10
                  text-gray-400
                  transition
                  hover:bg-white/5
                  hover:text-white
                "
              >
                <Facebook size={17} />
              </a>

              <a
                href="#"
                aria-label="LinkedIn"
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-white/10
                  text-gray-400
                  transition
                  hover:bg-white/5
                  hover:text-white
                "
              >
                <Linkedin size={17} />
              </a>
            </div>
          </div>

          {/* Navegação */}
          <div>
            <h3
              className="
              text-sm
              font-semibold
              text-white
            "
            >
              Navegação
            </h3>

            <ul
              className="
              mt-5
              space-y-3
            "
            >
              <li>
                <a
                  href="/"
                  className="text-sm text-gray-500 transition hover:text-white"
                >
                  Início
                </a>
              </li>

              <li>
                <a
                  href="/imoveis"
                  className="text-sm text-gray-500 transition hover:text-white"
                >
                  Imóveis
                </a>
              </li>

              <li>
                <a
                  href="/corretores"
                  className="text-sm text-gray-500 transition hover:text-white"
                >
                  Corretores
                </a>
              </li>

              <li>
                <a
                  href="/sobre"
                  className="text-sm text-gray-500 transition hover:text-white"
                >
                  Sobre nós
                </a>
              </li>
            </ul>
          </div>

          {/* Imóveis */}
          <div>
            <h3
              className="
              text-sm
              font-semibold
              text-white
            "
            >
              Encontre seu imóvel
            </h3>

            <ul
              className="
              mt-5
              space-y-3
            "
            >
              <li>
                <a
                  href="/imoveis?purpose=venda"
                  className="text-sm text-gray-500 transition hover:text-white"
                >
                  Comprar imóvel
                </a>
              </li>

              <li>
                <a
                  href="/imoveis?purpose=aluguel"
                  className="text-sm text-gray-500 transition hover:text-white"
                >
                  Alugar imóvel
                </a>
              </li>

              <li>
                <a
                  href="/imoveis?type=apartamento"
                  className="text-sm text-gray-500 transition hover:text-white"
                >
                  Apartamentos
                </a>
              </li>

              <li>
                <a
                  href="/imoveis?type=casa"
                  className="text-sm text-gray-500 transition hover:text-white"
                >
                  Casas
                </a>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h3
              className="
              text-sm
              font-semibold
              text-white
            "
            >
              Fale conosco
            </h3>

            <div
              className="
              mt-5
              space-y-4
            "
            >
              <div
                className="
                flex
                items-start
                gap-3
              "
              >
                <MapPin size={18} className="mt-0.5 shrink-0 text-blue-500" />

                <span
                  className="
                  text-sm
                  leading-6
                  text-gray-500
                "
                >
                  Atendimento em diversas cidades e regiões.
                </span>
              </div>

              <div
                className="
                flex
                items-center
                gap-3
              "
              >
                <Phone size={18} className="shrink-0 text-blue-500" />

                <span className="text-sm text-gray-500">(00) 00000-0000</span>
              </div>

              <div
                className="
                flex
                items-center
                gap-3
              "
              >
                <Mail size={18} className="shrink-0 text-blue-500" />

                <span className="text-sm text-gray-500">
                  contato@imobiliaria.com
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div
          className="
          mt-12
          flex
          flex-col
          gap-4
          border-t
          border-white/10
          pt-6
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
        >
          <p
            className="
            text-xs
            text-gray-600
          "
          >
            © {new Date().getFullYear()} Imobiliária. Todos os direitos
            reservados.
          </p>

          <div
            className="
            flex
            gap-5
          "
          >
            <a
              href="/privacidade"
              className="
                text-xs
                text-gray-600
                transition
                hover:text-gray-400
              "
            >
              Privacidade
            </a>

            <a
              href="/termos"
              className="
                text-xs
                text-gray-600
                transition
                hover:text-gray-400
              "
            >
              Termos de uso
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

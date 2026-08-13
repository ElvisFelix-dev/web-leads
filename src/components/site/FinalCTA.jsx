import { ArrowRight, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function FinalCTA({ onSearch }) {
  const navigate = useNavigate();

  const handleContact = () => {
    navigate('/contato');
  };

  return (
    <section className="relative overflow-hidden bg-gray-950 pb-8 pt-4 sm:pb-10 sm:pt-5 lg:pb-12 lg:pt-6">
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      {/* Glow principal */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-80
          w-80
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
          bg-blue-600/10
          blur-3xl
        "
      />

      {/* Glow secundário */}
      <div
        className="
          pointer-events-none
          absolute
          left-1/4
          top-0
          h-40
          w-40
          rounded-full
          bg-blue-500/5
          blur-3xl
        "
      />

      <div
        className="
          relative
          mx-auto
          max-w-5xl
          px-6
          text-center
          lg:px-8
        "
      >
        {/* =====================================================
            CARD
        ====================================================== */}

        <div
          className="
            relative
            overflow-hidden
            rounded-3xl
            border
            border-white/10
            bg-white/[0.03]
            px-6
            py-10
            shadow-2xl
            backdrop-blur-xl
            sm:px-10
            sm:py-12
          "
        >
          {/* Linha superior */}

          <div
            className="
              absolute
              inset-x-0
              top-0
              h-px
              bg-gradient-to-r
              from-transparent
              via-blue-500/60
              to-transparent
            "
          />

          {/* =================================================
              ÍCONE
          ================================================== */}

          <div
            className="
              mx-auto
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              border
              border-blue-400/20
              bg-blue-500/10
              text-blue-400
              shadow-lg
              shadow-blue-500/10
              sm:h-16
              sm:w-16
            "
          >
            <MessageCircle
              size={26}
              strokeWidth={1.8}
              className="sm:h-7 sm:w-7"
            />
          </div>

          {/* =================================================
              TÍTULO
          ================================================== */}

          <h2
            className="
              mx-auto
              mt-6
              max-w-3xl
              text-3xl
              font-bold
              leading-tight
              tracking-tight
              text-white
              sm:mt-7
              sm:text-4xl
              lg:text-5xl
            "
          >
            Ainda não encontrou o
            <span className="text-blue-400"> imóvel ideal?</span>
          </h2>

          {/* =================================================
              DESCRIÇÃO
          ================================================== */}

          <p
            className="
              mx-auto
              mt-4
              max-w-2xl
              text-base
              leading-7
              text-gray-400
              sm:mt-5
              sm:text-lg
            "
          >
            Fale com um de nossos especialistas. Nosso atendimento personalizado
            ajuda você a encontrar imóveis que realmente façam sentido para o
            seu momento.
          </p>

          {/* =================================================
              BOTÕES
          ================================================== */}

          <div
            className="
              mt-7
              flex
              flex-col
              items-center
              justify-center
              gap-3
              sm:mt-8
              sm:flex-row
            "
          >
            {/* Contato */}

            <button
              type="button"
              onClick={handleContact}
              className="
                group
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-blue-500/30
                bg-blue-600
                px-7
                py-3.5
                text-sm
                font-semibold
                text-white
                shadow-lg
                shadow-blue-600/20
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-blue-500
                hover:shadow-blue-500/30
                sm:w-auto
              "
            >
              Falar com um especialista
              <ArrowRight
                size={17}
                className="
                  transition-transform
                  duration-300
                  group-hover:translate-x-1
                "
              />
            </button>

            {/* Buscar imóveis */}

            <button
              type="button"
              onClick={onSearch}
              className="
                inline-flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-white/10
                bg-white/[0.04]
                px-7
                py-3.5
                text-sm
                font-semibold
                text-gray-200
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:border-white/20
                hover:bg-white/[0.08]
                hover:text-white
                sm:w-auto
              "
            >
              Continuar buscando
            </button>
          </div>

          {/* =================================================
              INDICADOR
          ================================================== */}

          <div
            className="
              mt-6
              flex
              items-center
              justify-center
              gap-2
              text-xs
              text-gray-500
              sm:mt-7
            "
          >
            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-blue-500
              "
            />
            Atendimento personalizado para você
          </div>
        </div>
      </div>
    </section>
  );
}

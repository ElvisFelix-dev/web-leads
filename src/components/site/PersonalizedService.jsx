import {
  ArrowRight,
  CheckCircle2,
  Headphones,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

export default function PersonalizedService() {
  const navigate = useNavigate();

  const benefits = [
    'Atendimento próximo e personalizado',
    'Corretores especializados',
    'Imóveis selecionados para cada perfil',
    'Acompanhamento em todas as etapas',
  ];

  const handleContact = () => {
    navigate('/contato');
  };

  return (
    <section className="relative overflow-hidden bg-gray-950 py-20 sm:py-24">
      {/* =========================================
          DECORATIVE GLOW
      ========================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-32
          top-20
          h-72
          w-72
          rounded-full
          bg-blue-600/10
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -right-32
          bottom-0
          h-72
          w-72
          rounded-full
          bg-blue-500/5
          blur-3xl
        "
      />

      <div
        className="
          relative
          mx-auto
          grid
          max-w-7xl
          gap-12
          px-4
          sm:px-6
          lg:grid-cols-2
          lg:items-center
          lg:px-8
        "
      >
        {/* =========================================
            LEFT
        ========================================== */}

        <div>
          {/* Badge */}

          <div
            className="
              mb-6
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
            <Sparkles size={14} />
            Atendimento personalizado
          </div>

          {/* Title */}

          <h2
            className="
              max-w-xl
              text-3xl
              font-bold
              leading-tight
              tracking-tight
              text-white
              sm:text-4xl
              lg:text-5xl
            "
          >
            Mais do que encontrar
            <span className="text-blue-400"> um imóvel.</span>
            <span className="block">Encontrar o lugar certo.</span>
          </h2>

          {/* Description */}

          <p
            className="
              mt-6
              max-w-xl
              text-base
              leading-7
              text-gray-400
              sm:text-lg
            "
          >
            Cada cliente tem uma história, uma necessidade e um momento
            diferente. Por isso, nosso atendimento é pensado para entender você
            antes de apresentar qualquer imóvel.
          </p>

          {/* Benefits */}

          <div className="mt-8 space-y-4">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="
                  group
                  flex
                  items-center
                  gap-3
                "
              >
                <div
                  className="
                    flex
                    h-7
                    w-7
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-blue-500/10
                    text-blue-400
                    transition
                    group-hover:bg-blue-500/20
                  "
                >
                  <CheckCircle2 size={17} />
                </div>

                <span className="text-sm text-gray-300">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA */}

          <button
            type="button"
            onClick={handleContact}
            className="
              group
              mt-9
              inline-flex
              items-center
              gap-2
              rounded-xl
              border
              border-blue-500/30
              bg-blue-600
              px-6
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
        </div>

        {/* =========================================
            RIGHT
        ========================================== */}

        <div
          className="
            grid
            gap-4
            sm:grid-cols-2
          "
        >
          {/* Atendimento */}

          <div
            className="
              group
              relative
              overflow-hidden
              rounded-2xl
              border
              border-white/10
              bg-white/[0.03]
              p-6
              shadow-xl
              backdrop-blur-xl
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-blue-500/20
              hover:bg-white/[0.05]
              sm:translate-y-8
            "
          >
            {/* Top line */}

            <div
              className="
                absolute
                inset-x-0
                top-0
                h-px
                bg-gradient-to-r
                from-transparent
                via-blue-500/40
                to-transparent
                opacity-0
                transition
                group-hover:opacity-100
              "
            />

            <div
              className="
                mb-5
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                border
                border-blue-500/10
                bg-blue-500/10
                text-blue-400
              "
            >
              <Headphones size={23} />
            </div>

            <h3 className="text-lg font-semibold text-white">
              Atendimento próximo
            </h3>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              Você não será apenas mais um atendimento. Nosso time acompanha
              cada etapa da sua jornada.
            </p>
          </div>

          {/* Segurança */}

          <div
            className="
              group
              relative
              overflow-hidden
              rounded-2xl
              border
              border-white/10
              bg-white/[0.03]
              p-6
              shadow-xl
              backdrop-blur-xl
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-blue-500/20
              hover:bg-white/[0.05]
            "
          >
            {/* Top line */}

            <div
              className="
                absolute
                inset-x-0
                top-0
                h-px
                bg-gradient-to-r
                from-transparent
                via-blue-500/40
                to-transparent
                opacity-0
                transition
                group-hover:opacity-100
              "
            />

            <div
              className="
                mb-5
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                border
                border-blue-500/10
                bg-blue-500/10
                text-blue-400
              "
            >
              <ShieldCheck size={23} />
            </div>

            <h3 className="text-lg font-semibold text-white">Segurança</h3>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              Informações claras e acompanhamento durante todo o processo
              imobiliário.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

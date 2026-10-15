import {
  ArrowRight,
  CheckCircle2,
  Headphones,
  ShieldCheck,
  Sparkles,
  Users,
  BadgeCheck,
  Clock3,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

export default function PersonalizedService() {
  const navigate = useNavigate();

  const benefits = [
    'Atendimento próximo e personalizado',
    'Corretores especializados por região',
    'Imóveis selecionados para o seu perfil',
    'Acompanhamento em todas as etapas',
  ];

  const stats = [
    {
      icon: Users,
      value: '100%',
      label: 'Atendimento personalizado',
    },
    {
      icon: BadgeCheck,
      value: '+',
      label: 'Imóveis selecionados',
    },
    {
      icon: Clock3,
      value: '24h',
      label: 'Acompanhamento',
    },
  ];

  const handleContact = () => {
    navigate('/contact');
  };

  return (
    <section className="relative overflow-hidden bg-gray-950 pb-8 pt-6 sm:pb-10 sm:pt-8 lg:pb-12 lg:pt-10">
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="pointer-events-none absolute inset-0">
        {/* Grid */}

        <div
          className="
            absolute
            inset-0
            opacity-[0.025]
            [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)]
            [background-size:64px_64px]
          "
        />

        {/* Glow esquerdo */}

        <div
          className="
            absolute
            -left-40
            top-1/4
            h-[420px]
            w-[420px]
            rounded-full
            bg-blue-600/10
            blur-[130px]
          "
        />

        {/* Glow direito */}

        <div
          className="
            absolute
            -right-40
            bottom-0
            h-[420px]
            w-[420px]
            rounded-full
            bg-indigo-600/10
            blur-[130px]
          "
        />

        {/* Glow central */}

        <div
          className="
            absolute
            left-1/2
            top-1/2
            h-[300px]
            w-[300px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-blue-500/[0.035]
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
          sm:px-6
          lg:px-8
        "
      >
        {/* =====================================================
            TOP INTRO
        ====================================================== */}

        <div className="mx-auto max-w-3xl text-center">
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
              bg-blue-500/[0.08]
              px-4
              py-2
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.2em]
              text-blue-400
              shadow-lg
              shadow-blue-950/20
            "
          >
            <Sparkles size={14} />
            Atendimento personalizado
          </div>

          {/* Heading */}

          <h2
            className="
              text-3xl
              font-bold
              leading-[1.08]
              tracking-[-0.03em]
              text-white
              sm:text-4xl
              lg:text-5xl
              xl:text-6xl
            "
          >
            Não procuramos apenas
            <span className="block text-blue-400">imóveis.</span>
            <span className="block">Encontramos possibilidades.</span>
          </h2>

          {/* Description */}

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
            Entendemos seu momento, seu perfil e seus objetivos para apresentar
            oportunidades que realmente façam sentido para você.
          </p>
        </div>

        {/* =====================================================
            MAIN GRID
        ====================================================== */}

        <div
          className="
            mt-12
            grid
            gap-8
            lg:grid-cols-[1.05fr_0.95fr]
            lg:items-center
            lg:gap-14
          "
        >
          {/* ===================================================
              LEFT CONTENT
          ==================================================== */}

          <div>
            {/* Small heading */}

            <div className="mb-7 flex items-center gap-3">
              <div className="h-px w-10 bg-blue-500" />

              <span
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-gray-500
                "
              >
                Uma experiência diferente
              </span>
            </div>

            {/* Benefits */}

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div
                  key={benefit}
                  className="
                    group
                    flex
                    items-center
                    gap-4
                    rounded-2xl
                    border
                    border-white/[0.06]
                    bg-white/[0.025]
                    p-4
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:border-blue-500/20
                    hover:bg-white/[0.045]
                  "
                >
                  {/* Number */}

                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      border
                      border-blue-500/10
                      bg-blue-500/[0.08]
                      text-sm
                      font-bold
                      text-blue-400
                      transition
                      group-hover:border-blue-500/20
                      group-hover:bg-blue-500/15
                    "
                  >
                    {String(index + 1).padStart(2, '0')}
                  </div>

                  {/* Check */}

                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <CheckCircle2
                      size={18}
                      className="
                        shrink-0
                        text-blue-400
                        transition
                        group-hover:scale-110
                      "
                    />

                    <span
                      className="
                        text-sm
                        font-medium
                        text-gray-300
                        sm:text-base
                      "
                    >
                      {benefit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}

            <button
              type="button"
              onClick={handleContact}
              className="
                group
                mt-8
                inline-flex
                items-center
                gap-3
                rounded-xl
                bg-blue-600
                px-6
                py-3.5
                text-sm
                font-semibold
                text-white
                shadow-xl
                shadow-blue-600/20
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:bg-blue-500
                hover:shadow-blue-500/30
                active:scale-[0.98]
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

          {/* ===================================================
              RIGHT CARDS
          ==================================================== */}

          <div className="relative">
            {/* Decorative frame */}

            <div
              className="
                absolute
                -inset-4
                rounded-[2rem]
                border
                border-blue-500/[0.05]
              "
            />

            <div
              className="
                relative
                grid
                gap-4
                sm:grid-cols-2
              "
            >
              {/* =============================================
                  CARD 1
              ============================================== */}

              <div
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-3xl
                  border
                  border-white/10
                  bg-gradient-to-br
                  from-white/[0.07]
                  to-white/[0.025]
                  p-7
                  shadow-2xl
                  shadow-black/20
                  backdrop-blur-xl
                  transition-all
                  duration-500
                  hover:-translate-y-1
                  hover:border-blue-500/20
                "
              >
                {/* Top glow */}

                <div
                  className="
                    absolute
                    inset-x-0
                    top-0
                    h-px
                    bg-gradient-to-r
                    from-transparent
                    via-blue-400/60
                    to-transparent
                  "
                />

                {/* Icon */}

                <div
                  className="
                    mb-6
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-blue-500/15
                    bg-blue-500/10
                    text-blue-400
                    shadow-lg
                    shadow-blue-950/20
                  "
                >
                  <Headphones size={25} />
                </div>

                <h3 className="text-xl font-semibold text-white">
                  Atendimento próximo
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-400">
                  Você não será apenas mais um atendimento. Nossa equipe
                  acompanha cada etapa da sua jornada.
                </p>

                <div className="mt-7 h-px bg-white/[0.06]" />

                <div className="mt-5 flex items-center gap-2 text-xs font-medium text-blue-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  Atendimento humano
                </div>
              </div>

              {/* =============================================
                  CARD 2
              ============================================== */}

              <div
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-3xl
                  border
                  border-white/10
                  bg-gradient-to-br
                  from-white/[0.07]
                  to-white/[0.025]
                  p-7
                  shadow-2xl
                  shadow-black/20
                  backdrop-blur-xl
                  transition-all
                  duration-500
                  hover:-translate-y-1
                  hover:border-blue-500/20
                  sm:translate-y-8
                "
              >
                {/* Top glow */}

                <div
                  className="
                    absolute
                    inset-x-0
                    top-0
                    h-px
                    bg-gradient-to-r
                    from-transparent
                    via-blue-400/60
                    to-transparent
                  "
                />

                {/* Icon */}

                <div
                  className="
                    mb-6
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-blue-500/15
                    bg-blue-500/10
                    text-blue-400
                    shadow-lg
                    shadow-blue-950/20
                  "
                >
                  <ShieldCheck size={25} />
                </div>

                <h3 className="text-xl font-semibold text-white">
                  Segurança em cada etapa
                </h3>

                <p className="mt-3 text-sm leading-6 text-gray-400">
                  Informações claras, transparência e acompanhamento durante
                  todo o processo imobiliário.
                </p>

                <div className="mt-7 h-px bg-white/[0.06]" />

                <div className="mt-5 flex items-center gap-2 text-xs font-medium text-blue-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                  Processo transparente
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            STATS
        ====================================================== */}

        <div
          className="
            mt-14
            grid
            overflow-hidden
            rounded-3xl
            border
            border-white/[0.08]
            bg-white/[0.025]
            backdrop-blur-xl
            sm:grid-cols-3
          "
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className={`
                  group
                  relative
                  flex
                  items-center
                  gap-4
                  px-6
                  py-6
                  transition
                  hover:bg-white/[0.03]
                  sm:px-8
                  sm:py-7
                  ${
                    index !== stats.length - 1
                      ? 'border-b border-white/[0.06] sm:border-b-0 sm:border-r'
                      : ''
                  }
                `}
              >
                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-500/10
                    text-blue-400
                    transition
                    group-hover:bg-blue-500/15
                  "
                >
                  <Icon size={20} />
                </div>

                <div>
                  <div className="text-xl font-bold text-white">
                    {stat.value}
                  </div>

                  <div className="mt-0.5 text-xs text-gray-500">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* =====================================================
            BOTTOM MICRO CTA
        ====================================================== */}

        <div className="mt-8 flex justify-center">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <CheckCircle2 size={14} className="text-blue-400" />

            <span>Seu próximo imóvel pode começar com uma conversa.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

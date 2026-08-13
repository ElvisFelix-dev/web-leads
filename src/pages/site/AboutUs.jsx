import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

import Header from '../../components/site/Header';
import Footer from '../../components/site/Footer';

export default function AboutUs() {
  const navigate = useNavigate();

  const highlights = [
    {
      icon: MapPin,
      title: 'Conhecimento local',
      description:
        'Conhecemos as regiões onde atuamos e entendemos o que cada localização pode oferecer.',
    },
    {
      icon: Users,
      title: 'Atendimento humano',
      description:
        'Cada cliente possui necessidades diferentes. Por isso, nosso atendimento começa pela escuta.',
    },
    {
      icon: ShieldCheck,
      title: 'Transparência',
      description:
        'Informações claras e acompanhamento próximo para que você tome decisões com segurança.',
    },
  ];

  const values = [
    'Relacionamento próximo com nossos clientes',
    'Curadoria de imóveis e oportunidades',
    'Atendimento personalizado em cada etapa',
    'Compromisso com transparência e confiança',
  ];

  const handleTeam = () => {
    navigate('/corretores');
  };

  const handleContact = () => {
    navigate('/contato');
  };

  return (
    <div>
      <Header />

      <section className="relative overflow-hidden bg-gray-950 pb-10 pt-6 sm:pb-12 sm:pt-8 lg:pb-16 lg:pt-10">
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
            -left-48
            top-1/4
            h-[420px]
            w-[420px]
            rounded-full
            bg-blue-600/[0.07]
            blur-[130px]
          "
          />

          {/* Glow direito */}

          <div
            className="
            absolute
            -right-48
            bottom-0
            h-[420px]
            w-[420px]
            rounded-full
            bg-indigo-600/[0.06]
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
            bg-blue-500/[0.025]
            blur-[110px]
          "
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* =====================================================
            HEADER
        ====================================================== */}

          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}

            <div
              className="
              mb-5
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
            "
            >
              <Sparkles size={14} />
              Sobre nós
            </div>

            {/* Title */}

            <h2
              className="
              text-3xl
              font-bold
              leading-[1.08]
              tracking-[-0.03em]
              text-white
              sm:text-4xl
              lg:text-5xl
            "
            >
              Mais do que encontrar imóveis,
              <span className="block text-blue-400">
                ajudamos você a encontrar o lugar certo.
              </span>
            </h2>

            {/* Description */}

            <p
              className="
              mx-auto
              mt-5
              max-w-2xl
              text-base
              leading-7
              text-gray-400
              sm:text-lg
            "
            >
              Somos uma equipe apaixonada pelo mercado imobiliário e, acima de
              tudo, por pessoas. Nosso trabalho é tornar cada etapa da busca por
              um imóvel mais simples, segura e personalizada.
            </p>
          </div>

          {/* =====================================================
            MAIN CONTENT
        ====================================================== */}

          <div
            className="
            mt-10
            grid
            gap-8
            lg:grid-cols-[0.95fr_1.05fr]
            lg:items-center
            lg:gap-14
          "
          >
            {/* ===================================================
              LEFT - INSTITUTIONAL CARD
          ==================================================== */}

            <div
              className="
              relative
              overflow-hidden
              rounded-[28px]
              border
              border-white/[0.08]
              bg-gradient-to-br
              from-white/[0.06]
              to-white/[0.02]
              p-6
              shadow-2xl
              shadow-black/20
              backdrop-blur-xl
              sm:p-8
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
                via-blue-400/60
                to-transparent
              "
              />

              {/* Icon */}

              <div
                className="
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
                <Building2 size={25} />
              </div>

              <h3 className="mt-6 text-2xl font-semibold text-white">
                Uma imobiliária feita para pessoas
              </h3>

              <p className="mt-4 text-sm leading-7 text-gray-400 sm:text-base">
                Acreditamos que comprar, vender ou alugar um imóvel é muito mais
                do que uma transação. É uma decisão que envolve planos, sonhos,
                mudanças e novos capítulos.
              </p>

              <p className="mt-4 text-sm leading-7 text-gray-400 sm:text-base">
                Por isso, buscamos unir tecnologia, conhecimento do mercado e
                atendimento próximo para oferecer uma experiência imobiliária
                mais tranquila e eficiente.
              </p>

              {/* Trust */}

              <div
                className="
                mt-7
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-white/[0.06]
                bg-white/[0.025]
                px-4
                py-3
              "
              >
                <div
                  className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-blue-500/10
                  text-blue-400
                "
                >
                  <BadgeCheck size={18} />
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-200">
                    Atendimento com propósito
                  </p>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Seu objetivo está no centro do nosso trabalho.
                  </p>
                </div>
              </div>
            </div>

            {/* ===================================================
              RIGHT - VALUES
          ==================================================== */}

            <div>
              {/* Small heading */}

              <div className="mb-6 flex items-center gap-3">
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
                  O que nos move
                </span>
              </div>

              {/* Values */}

              <div className="space-y-3">
                {values.map((value, index) => (
                  <div
                    key={value}
                    className="
                    group
                    flex
                    items-center
                    gap-4
                    rounded-2xl
                    border
                    border-white/[0.06]
                    bg-white/[0.02]
                    px-4
                    py-3.5
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:border-blue-500/20
                    hover:bg-white/[0.04]
                  "
                  >
                    <div
                      className="
                      flex
                      h-9
                      w-9
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-blue-500/10
                      text-xs
                      font-bold
                      text-blue-400
                    "
                    >
                      {String(index + 1).padStart(2, '0')}
                    </div>

                    <span className="text-sm font-medium text-gray-300 sm:text-base">
                      {value}
                    </span>

                    <CheckCircle2
                      size={17}
                      className="
                      ml-auto
                      shrink-0
                      text-gray-600
                      transition
                      group-hover:text-blue-400
                    "
                    />
                  </div>
                ))}
              </div>

              {/* Buttons */}

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleTeam}
                  className="
                  group
                  inline-flex
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
                  shadow-lg
                  shadow-blue-600/20
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:bg-blue-500
                  hover:shadow-blue-500/30
                "
                >
                  Conheça nossa equipe
                  <ArrowRight
                    size={16}
                    className="
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                  />
                </button>

                <button
                  type="button"
                  onClick={handleContact}
                  className="
                  inline-flex
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.03]
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-gray-300
                  transition-all
                  duration-300
                  hover:border-white/20
                  hover:bg-white/[0.06]
                  hover:text-white
                "
                >
                  Fale conosco
                </button>
              </div>
            </div>
          </div>

          {/* =====================================================
            HIGHLIGHTS
        ====================================================== */}

          <div
            className="
            mt-10
            grid
            gap-3
            md:grid-cols-3
          "
          >
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="
                  group
                  rounded-2xl
                  border
                  border-white/[0.06]
                  bg-white/[0.02]
                  p-5
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:border-blue-500/15
                  hover:bg-white/[0.035]
                "
                >
                  <div
                    className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-500/10
                    text-blue-400
                    transition
                    group-hover:bg-blue-500/15
                  "
                  >
                    <Icon size={19} />
                  </div>

                  <h4 className="mt-4 text-sm font-semibold text-white">
                    {item.title}
                  </h4>

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* =====================================================
            MICRO CTA
        ====================================================== */}

          <div className="mt-7 flex justify-center">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <CheckCircle2 size={14} className="text-blue-400" />

              <span>Uma experiência imobiliária pensada para você.</span>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

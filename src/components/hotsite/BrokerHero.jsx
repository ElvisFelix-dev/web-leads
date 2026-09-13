// src/components/hotsite/BrokerHero.jsx

import {
  ArrowRight,
  Building2,
  MapPin,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';

function getWhatsAppUrl(phone) {
  if (!phone) return '#';

  const normalizedPhone = String(phone).replace(/\D/g, '');

  if (!normalizedPhone) return '#';

  const finalPhone = normalizedPhone.startsWith('55')
    ? normalizedPhone
    : `55${normalizedPhone}`;

  return `https://wa.me/${finalPhone}`;
}

function getInitials(name) {
  if (!name) return 'LN';

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
}

function getLocation(broker) {
  const city = broker?.city || '';
  const state = broker?.state || '';

  if (city && state) {
    return `${city} - ${state}`;
  }

  return city || state || 'São Paulo';
}

export default function BrokerHero({ broker, brokerSlug }) {
  const name = broker?.name || 'Consultor Imobiliário';

  const position = broker?.position || 'Consultor imobiliário';

  const company = broker?.company || 'Consultoria Imobiliária';

  const bio =
    broker?.bio ||
    'Encontre o imóvel ideal para você com atendimento personalizado e acompanhamento em todas as etapas.';

  const avatar = broker?.avatar || broker?.photo || '';

  const phone = broker?.phone || broker?.whatsapp || '';

  const creci = broker?.creci || '';

  const experienceYears = Number(broker?.experienceYears) || 0;

  const specialties = Array.isArray(broker?.specialties)
    ? broker.specialties.filter(Boolean)
    : [];

  const location = getLocation(broker);

  const whatsappUrl = getWhatsAppUrl(phone);

  const handleWhatsAppClick = () => {
    if (!whatsappUrl || whatsappUrl === '#') return;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  const handlePropertiesClick = () => {
    const element = document.getElementById('imoveis');

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });

      return;
    }

    if (brokerSlug) {
      window.location.href = `/broker/${brokerSlug}/imoveis`;
    }
  };

  return (
    <section className="relative isolate overflow-hidden bg-slate-950 pt-[76px]">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="absolute -right-32 bottom-0 h-[500px] w-[500px] rounded-full bg-blue-500/10 blur-3xl" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_35%)]" />

        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,23,42,0),rgba(2,6,23,0.85))]" />
      </div>

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          {/* Content */}
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3.5 py-2 text-xs font-semibold text-white/75 backdrop-blur">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10">
                <Building2 size={12} />
              </span>

              <span>{company}</span>
            </div>

            {/* Heading */}
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Encontre um imóvel
              <span className="block text-white/60">que combine com você.</span>
            </h1>

            {/* Description */}
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
              Atendimento personalizado para ajudar você a encontrar o imóvel
              certo, com segurança, transparência e acompanhamento em cada
              etapa.
            </p>

            {/* Broker identity */}
            <div className="mt-8 flex items-center gap-4">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="h-14 w-14 rounded-full object-cover ring-2 ring-white/10"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white ring-2 ring-white/10">
                  {getInitials(name)}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-white">{name}</p>

                  {creci && (
                    <span className="hidden items-center gap-1 text-xs text-slate-400 sm:inline-flex">
                      <ShieldCheck size={13} />
                      CRECI {creci}
                    </span>
                  )}
                </div>

                <p className="mt-0.5 text-sm text-slate-400">{position}</p>
              </div>
            </div>

            {/* Location */}
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-400">
              <span className="inline-flex items-center gap-2">
                <MapPin size={15} />
                {location}
              </span>

              {experienceYears > 0 && (
                <span>
                  {experienceYears} {experienceYears === 1 ? 'ano' : 'anos'} de
                  experiência
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleWhatsAppClick}
                disabled={!phone}
                className={[
                  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-all',
                  phone
                    ? 'bg-white text-slate-950 shadow-xl shadow-black/10 hover:-translate-y-0.5 hover:bg-slate-100'
                    : 'cursor-not-allowed bg-slate-700 text-slate-400',
                ].join(' ')}
              >
                <MessageCircle size={18} />

                <span>
                  {phone ? 'Falar com o corretor' : 'WhatsApp não informado'}
                </span>
              </button>

              <button
                type="button"
                onClick={handlePropertiesClick}
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-white/[0.08]"
              >
                <span>Ver imóveis</span>

                <ArrowRight
                  size={17}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </button>
            </div>

            {/* Specialties */}
            {specialties.length > 0 && (
              <div className="mt-9">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Especialidades
                </p>

                <div className="flex flex-wrap gap-2">
                  {specialties.slice(0, 5).map((specialty, index) => (
                    <span
                      key={`${specialty}-${index}`}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Visual card */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute -inset-6 rounded-[2rem] bg-white/[0.03] blur-2xl" />

            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-3 shadow-2xl shadow-black/20 backdrop-blur-xl">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-slate-900">
                {avatar ? (
                  <img
                    src={avatar}
                    alt={name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
                    <div className="flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-white/5 text-3xl font-semibold text-white">
                      {getInitials(name)}
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

                {/* Bottom information */}
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/65 p-4 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white">
                        <Building2 size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">
                          {name}
                        </p>

                        <p className="truncate text-xs text-slate-400">
                          {position}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          Atendimento
                        </p>

                        <p className="mt-1 text-sm font-medium text-white">
                          Personalizado
                        </p>
                      </div>

                      {creci && (
                        <div className="text-right">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                            Registro
                          </p>

                          <p className="mt-1 text-sm font-medium text-white">
                            CRECI {creci}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-5 -left-4 hidden rounded-2xl border border-slate-200/10 bg-white p-4 shadow-2xl shadow-black/20 sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-900">
                  <ShieldCheck size={19} />
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-900">
                    Atendimento profissional
                  </p>

                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Do primeiro contato ao fechamento
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950 to-transparent" />
    </section>
  );
}

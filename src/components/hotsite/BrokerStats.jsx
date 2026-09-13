import { Award, Building2, MapPin, Sparkles } from 'lucide-react';

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export default function BrokerStats({ broker, properties = [] }) {
  const experienceYears = Number(broker?.experienceYears) || 0;

  const specialties = normalizeArray(broker?.specialties);

  const regions = normalizeArray(broker?.regions);

  const propertyCount = Array.isArray(properties) ? properties.length : 0;

  const stats = [
    {
      label: 'Imóveis disponíveis',
      value: propertyCount,
      suffix: '',
      icon: Building2,
      description:
        propertyCount === 1 ? 'imóvel no portfólio' : 'imóveis no portfólio',
    },
    {
      label: 'Experiência',
      value: experienceYears,
      suffix: experienceYears > 0 ? '+' : '',
      icon: Award,
      description:
        experienceYears === 1 ? 'ano de experiência' : 'anos de experiência',
    },
    {
      label: 'Especialidades',
      value: specialties.length,
      suffix: '',
      icon: Sparkles,
      description:
        specialties.length === 1 ? 'área de atuação' : 'áreas de atuação',
    },
    {
      label: 'Regiões atendidas',
      value: regions.length,
      suffix: '',
      icon: MapPin,
      description:
        regions.length === 1
          ? 'região de atendimento'
          : 'regiões de atendimento',
    },
  ];

  return (
    <section className="relative border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 divide-x divide-slate-200 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="group relative px-4 py-7 sm:px-6 sm:py-8 lg:px-8"
              >
                <div className="flex items-start gap-4">
                  <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-all duration-300 group-hover:bg-slate-900 group-hover:text-white sm:flex">
                    <Icon size={19} strokeWidth={1.8} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                      {stat.label}
                    </p>

                    <div className="mt-1 flex items-baseline gap-1">
                      <span className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                        {stat.value}
                      </span>

                      {stat.suffix && (
                        <span className="text-lg font-semibold text-slate-500">
                          {stat.suffix}
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-xs text-slate-500">
                      {stat.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CRECI / credentials */}
        {broker?.creci && (
          <div className="flex items-center justify-center border-t border-slate-100 py-3">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
              <Award size={14} className="text-slate-400" />

              <span>Corretor credenciado · CRECI {broker.creci}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

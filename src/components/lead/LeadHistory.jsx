import {
  Clock,
  Phone,
  Mail,
  MessageCircle,
  History,
  GitBranch,
  Globe,
  ExternalLink,
  Building2,
  MapPin,
  Tag,
  Home,
  UserRound,
  Megaphone,
  MousePointerClick,
  Heart,
} from 'lucide-react';

/* ============================================================
   HELPERS
============================================================ */

function formatDate(date) {
  if (!date) return '-';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return '-';
  }

  return parsedDate.toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const number = Number(value);

  if (Number.isNaN(number) || number <= 0) {
    return null;
  }

  return number.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/* ============================================================
   LABELS
============================================================ */

function getStageLabel(stage) {
  const labels = {
    novo_lead: 'Novo Lead',
    primeiro_contato: 'Primeiro Contato',
    qualificado: 'Qualificado',
    visita_agendada: 'Visita Agendada',
    proposta_enviada: 'Proposta Enviada',
    negociacao: 'Negociação',
    fechado: 'Fechado',
    perdido: 'Perdido',
  };

  return labels[stage] || stage || 'Etapa';
}

function getPropertyTypeLabel(type) {
  const labels = {
    apartamento: 'Apartamento',
    casa: 'Casa',
    sobrado: 'Sobrado',
    terreno: 'Terreno',
    comercial: 'Comercial',
    sala_comercial: 'Sala Comercial',
    galpao: 'Galpão',
    cobertura: 'Cobertura',
    chacara: 'Chácara',
    sitio: 'Sítio',
    fazenda: 'Fazenda',
  };

  return labels[type] || type || 'Imóvel';
}

function getPurposeLabel(purpose) {
  const labels = {
    venda: 'Venda',
    aluguel: 'Aluguel',
    temporada: 'Temporada',
  };

  return labels[purpose] || purpose || '';
}

/* ============================================================
   SOURCE
============================================================ */

function getLeadSourceInfo(lead) {
  const source = String(lead?.source || '').toLowerCase();
  const sourceType = String(lead?.sourceType || '').toLowerCase();
  const sourceSite = String(lead?.sourceSite || '').trim();
  const landingPage = String(lead?.landingPage || '').toLowerCase();

  /*
   * Hotsite
   *
   * Damos prioridade para source/sourceSite.
   */
  if (
    source === 'hotsite' ||
    sourceType === 'hotsite' ||
    sourceSite.toLowerCase().includes('hotsite') ||
    landingPage.includes('/hotsite/')
  ) {
    return {
      label: 'Hotsite',
      description: 'Lead originado através de um hotsite.',
      icon: <Globe size={18} />,
      color: 'purple',
    };
  }

  /*
   * Site público
   */
  if (
    source === 'public' ||
    source === 'site' ||
    sourceType === 'site' ||
    landingPage.includes('/properties/')
  ) {
    return {
      label: 'Site',
      description: 'Lead originado através do site público.',
      icon: <Globe size={18} />,
      color: 'blue',
    };
  }

  /*
   * Meta
   */
  if (source === 'meta' || sourceType === 'meta') {
    return {
      label: 'Meta',
      description: 'Lead originado através da Meta.',
      icon: <Megaphone size={18} />,
      color: 'indigo',
    };
  }

  /*
   * OLX
   */
  if (source === 'olx') {
    return {
      label: 'OLX',
      description: 'Lead originado através da OLX.',
      icon: <Globe size={18} />,
      color: 'orange',
    };
  }

  /*
   * ZAP
   */
  if (source === 'zap') {
    return {
      label: 'ZAP Imóveis',
      description: 'Lead originado através do ZAP Imóveis.',
      icon: <Globe size={18} />,
      color: 'green',
    };
  }

  /*
   * CSV
   */
  if (source === 'csv') {
    return {
      label: 'Importação CSV',
      description: 'Lead importado através de arquivo CSV.',
      icon: <MousePointerClick size={18} />,
      color: 'yellow',
    };
  }

  /*
   * Manual
   */
  if (sourceType === 'manual' || source === 'manual') {
    return {
      label: 'Cadastro Manual',
      description: 'Lead cadastrado manualmente.',
      icon: <UserRound size={18} />,
      color: 'slate',
    };
  }

  /*
   * Fallback
   */
  return {
    label: source || 'Não informado',
    description: 'Origem do lead não identificada.',
    icon: <Globe size={18} />,
    color: 'slate',
  };
}

/* ============================================================
   SOURCE BADGE COLORS
============================================================ */

const sourceColorClasses = {
  blue: {
    wrapper: 'bg-blue-500/10 border-blue-500/20',
    icon: 'bg-blue-500/10 text-blue-400',
    label: 'text-blue-400',
  },

  purple: {
    wrapper: 'bg-purple-500/10 border-purple-500/20',
    icon: 'bg-purple-500/10 text-purple-400',
    label: 'text-purple-400',
  },

  indigo: {
    wrapper: 'bg-indigo-500/10 border-indigo-500/20',
    icon: 'bg-indigo-500/10 text-indigo-400',
    label: 'text-indigo-400',
  },

  orange: {
    wrapper: 'bg-orange-500/10 border-orange-500/20',
    icon: 'bg-orange-500/10 text-orange-400',
    label: 'text-orange-400',
  },

  green: {
    wrapper: 'bg-green-500/10 border-green-500/20',
    icon: 'bg-green-500/10 text-green-400',
    label: 'text-green-400',
  },

  yellow: {
    wrapper: 'bg-yellow-500/10 border-yellow-500/20',
    icon: 'bg-yellow-500/10 text-yellow-400',
    label: 'text-yellow-400',
  },

  slate: {
    wrapper: 'bg-slate-500/10 border-slate-500/20',
    icon: 'bg-slate-500/10 text-slate-400',
    label: 'text-slate-300',
  },
};

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function LeadHistory({ lead }) {
  const stageHistory = lead?.stageHistory || [];
  const contactHistory = lead?.contactHistory || [];

  const property = lead?.property || null;

  const sourceInfo = getLeadSourceInfo(lead);

  const sourceColors =
    sourceColorClasses[sourceInfo.color] || sourceColorClasses.slate;

  const hasHistory = stageHistory.length > 0 || contactHistory.length > 0;

  /*
   * Dados do imóvel
   */
  const propertyName =
    property?.name || property?.title || 'Imóvel de interesse';

  const propertyCode = property?.code || property?.formattedCode || '';

  const propertyType = getPropertyTypeLabel(property?.type);

  const propertyPurpose = getPurposeLabel(property?.purpose);

  const propertyPrice = formatCurrency(
    property?.prices?.salePrice ||
      property?.prices?.rentPrice ||
      property?.price,
  );

  const propertyImage =
    property?.mainImage ||
    property?.coverImage ||
    property?.images?.find((image) => image?.isCover)?.url ||
    property?.images?.[0]?.url ||
    '';

  const propertyAddress =
    property?.fullAddress ||
    [
      property?.location?.street,
      property?.location?.number,
      property?.location?.district,
      property?.location?.city,
      property?.location?.state,
    ]
      .filter(Boolean)
      .join(', ');

  /*
   * URL de origem
   */
  const landingPage = lead?.landingPage || '';
  const referrer = lead?.referrer || '';

  return (
    <div className="space-y-8">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex items-center gap-3">
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
          "
        >
          <History size={20} />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white">
            Histórico do Lead
          </h2>

          <p className="text-sm text-slate-500">
            Origem, interesse e atividades do lead
          </p>
        </div>
      </div>

      {/* ======================================================
          ORIGEM DO LEAD
      ====================================================== */}

      <section
        className={`
          rounded-2xl
          border
          p-5
          ${sourceColors.wrapper}
        `}
      >
        <div className="flex items-start gap-4">
          <div
            className={`
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              ${sourceColors.icon}
            `}
          >
            {sourceInfo.icon}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Origem do Lead
              </span>

              <span
                className={`
                  rounded-full
                  px-2.5
                  py-1
                  text-xs
                  font-semibold
                  ${sourceColors.label}
                  bg-slate-950/40
                `}
              >
                {sourceInfo.label}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-300">
              {sourceInfo.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              {lead?.sourceType && (
                <SourceDetail label="Tipo" value={lead.sourceType} />
              )}

              {lead?.region && (
                <SourceDetail label="Região" value={lead.region} />
              )}

              {lead?.campaign?.utmSource && (
                <SourceDetail
                  label="UTM Source"
                  value={lead.campaign.utmSource}
                />
              )}

              {lead?.campaign?.utmCampaign && (
                <SourceDetail
                  label="Campanha"
                  value={lead.campaign.utmCampaign}
                />
              )}
            </div>

            {/* Landing Page */}

            {landingPage && (
              <div className="mt-4">
                <div className="mb-1 flex items-center gap-2 text-xs text-slate-500">
                  <ExternalLink size={13} />
                  Página de origem
                </div>

                <p
                  className="
                    max-w-full
                    overflow-hidden
                    text-ellipsis
                    whitespace-nowrap
                    text-sm
                    text-slate-400
                  "
                  title={lead.landingPage}
                >
                  {lead.landingPage}
                </p>
              </div>
            )}

            {/* Referrer */}

            {referrer && referrer !== landingPage && (
              <div className="mt-3">
                <div className="mb-1 flex items-center gap-2 text-xs text-slate-500">
                  <ExternalLink size={13} />
                  Referência
                </div>

                <p
                  className="
                    max-w-full
                    overflow-hidden
                    text-ellipsis
                    whitespace-nowrap
                    text-sm
                    text-slate-400
                  "
                  title={lead.referrer}
                >
                  {lead.referrer}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================
          IMÓVEL DE INTERESSE
      ====================================================== */}

      {property && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                bg-emerald-500/10
                text-emerald-400
              "
            >
              <Heart size={18} />
            </div>

            <div>
              <h3 className="font-semibold text-white">Imóvel de interesse</h3>

              <p className="text-xs text-slate-500">
                Imóvel relacionado a este lead
              </p>
            </div>
          </div>

          <div
            className="
              overflow-hidden
              rounded-2xl
              border
              border-slate-800
              bg-slate-900/60
              transition
              hover:border-slate-700
            "
          >
            <div className="flex flex-col sm:flex-row">
              {/* IMAGE */}

              <div
                className="
                  relative
                  h-52
                  w-full
                  shrink-0
                  overflow-hidden
                  bg-slate-950
                  sm:h-auto
                  sm:w-52
                "
              >
                {propertyImage ? (
                  <img
                    src={propertyImage}
                    alt={propertyName}
                    className="
                      h-full
                      w-full
                      object-cover
                    "
                  />
                ) : (
                  <div
                    className="
                      flex
                      h-full
                      min-h-52
                      w-full
                      items-center
                      justify-center
                      text-slate-600
                    "
                  >
                    <Building2 size={42} />
                  </div>
                )}

                <div
                  className="
                    absolute
                    left-3
                    top-3
                    rounded-lg
                    bg-slate-950/80
                    px-2.5
                    py-1.5
                    text-xs
                    font-medium
                    text-white
                    backdrop-blur
                  "
                >
                  {propertyPurpose || 'Imóvel'}
                </div>
              </div>

              {/* CONTENT */}

              <div className="flex min-w-0 flex-1 flex-col p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="truncate text-lg font-semibold text-white">
                      {propertyName}
                    </h4>

                    {propertyCode && (
                      <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                        Código {propertyCode}
                      </p>
                    )}
                  </div>

                  {propertyPrice && (
                    <span className="shrink-0 text-lg font-bold text-emerald-400">
                      {propertyPrice}
                    </span>
                  )}
                </div>

                {/* META */}

                <div className="mt-4 flex flex-wrap gap-2">
                  {propertyType && (
                    <PropertyMeta
                      icon={<Home size={14} />}
                      value={propertyType}
                    />
                  )}

                  {propertyPurpose && (
                    <PropertyMeta
                      icon={<Tag size={14} />}
                      value={propertyPurpose}
                    />
                  )}

                  {property?.bedrooms > 0 && (
                    <PropertyMeta
                      icon={<Building2 size={14} />}
                      value={`${property.bedrooms} quartos`}
                    />
                  )}
                </div>

                {/* ADDRESS */}

                {propertyAddress && (
                  <div
                    className="
                      mt-4
                      flex
                      items-start
                      gap-2
                      text-sm
                      text-slate-400
                    "
                  >
                    <MapPin
                      size={16}
                      className="mt-0.5 shrink-0 text-slate-500"
                    />

                    <span>{propertyAddress}</span>
                  </div>
                )}

                {/* PROPERTY URL */}

                {lead?.landingPage && (
                  <div className="mt-auto pt-5">
                    <a
                      href={lead.landingPage}
                      target="_blank"
                      rel="noreferrer"
                      className="
                        inline-flex
                        items-center
                        gap-2
                        text-sm
                        font-medium
                        text-blue-400
                        transition
                        hover:text-blue-300
                      "
                    >
                      Ver página do imóvel
                      <ExternalLink size={14} />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ======================================================
          HISTÓRICO
      ====================================================== */}

      {!hasHistory && (
        <div
          className="
            flex
            flex-col
            items-center
            justify-center
            rounded-2xl
            border
            border-slate-800
            bg-slate-900/40
            py-12
            text-slate-500
          "
        >
          <Clock size={34} className="mb-3" />

          <p>Nenhum histórico disponível.</p>
        </div>
      )}

      {/* ======================================================
          STAGE HISTORY
      ====================================================== */}

      {stageHistory.length > 0 && (
        <section>
          <div className="mb-5 flex items-center gap-2">
            <GitBranch size={18} className="text-blue-400" />

            <h3 className="font-semibold text-white">Histórico de etapas</h3>

            <span
              className="
                rounded-full
                bg-slate-800
                px-2
                py-0.5
                text-xs
                text-slate-400
              "
            >
              {stageHistory.length}
            </span>
          </div>

          <div className="space-y-0">
            {stageHistory.map((item, index) => (
              <TimelineItem
                key={`${item.changedAt || index}-${index}`}
                icon={<GitBranch size={16} />}
                color="blue"
                isLast={index === stageHistory.length - 1}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-slate-400">
                    Etapa alterada para
                  </span>

                  <span className="font-semibold text-blue-400">
                    {getStageLabel(item.stage)}
                  </span>
                </div>

                {item.changedBy && (
                  <div
                    className="
                      mt-3
                      flex
                      items-center
                      gap-2
                    "
                  >
                    {item.changedBy.avatar ? (
                      <img
                        src={item.changedBy.avatar}
                        alt={item.changedBy.name}
                        className="
                          h-6
                          w-6
                          rounded-full
                          object-cover
                        "
                      />
                    ) : (
                      <div
                        className="
                          flex
                          h-6
                          w-6
                          items-center
                          justify-center
                          rounded-full
                          bg-slate-800
                          text-slate-400
                        "
                      >
                        <UserRound size={12} />
                      </div>
                    )}

                    <p className="text-sm text-slate-400">
                      Alterado por
                      <span className="ml-1 text-slate-200">
                        {item.changedBy.name}
                      </span>
                    </p>
                  </div>
                )}

                <DateText>{formatDate(item.changedAt)}</DateText>
              </TimelineItem>
            ))}
          </div>
        </section>
      )}

      {/* ======================================================
          CONTACT HISTORY
      ====================================================== */}

      {contactHistory.length > 0 && (
        <section>
          <div className="mb-5 flex items-center gap-2">
            <Phone size={18} className="text-emerald-400" />

            <h3 className="font-semibold text-white">Contatos realizados</h3>

            <span
              className="
                rounded-full
                bg-slate-800
                px-2
                py-0.5
                text-xs
                text-slate-400
              "
            >
              {contactHistory.length}
            </span>
          </div>

          <div className="space-y-0">
            {contactHistory.map((item, index) => (
              <TimelineItem
                key={`${item.createdAt || index}-${index}`}
                icon={<ContactIcon type={item.type} />}
                color="green"
                isLast={index === contactHistory.length - 1}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-200">
                    {getContactLabel(item.type)}
                  </span>
                </div>

                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {item.description || 'Sem descrição'}
                </p>

                <DateText>{formatDate(item.createdAt)}</DateText>
              </TimelineItem>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ============================================================
   SOURCE DETAIL
============================================================ */

function SourceDetail({ label, value }) {
  return (
    <div
      className="
        rounded-lg
        border
        border-slate-800
        bg-slate-950/40
        px-3
        py-2
      "
    >
      <span className="mr-2 text-xs text-slate-500">{label}:</span>

      <span className="text-xs font-medium text-slate-300">{value}</span>
    </div>
  );
}

/* ============================================================
   PROPERTY META
============================================================ */

function PropertyMeta({ icon, value }) {
  return (
    <div
      className="
        inline-flex
        items-center
        gap-1.5
        rounded-lg
        border
        border-slate-800
        bg-slate-950/50
        px-2.5
        py-1.5
        text-xs
        text-slate-400
      "
    >
      <span className="text-slate-500">{icon}</span>

      {value}
    </div>
  );
}

/* ============================================================
   TIMELINE ITEM
============================================================ */

function TimelineItem({ icon, children, color = 'blue', isLast = false }) {
  const colors = {
    blue: {
      icon: 'bg-blue-500/10 text-blue-400',
      line: 'bg-blue-500/20',
    },

    green: {
      icon: 'bg-green-500/10 text-green-400',
      line: 'bg-green-500/20',
    },

    purple: {
      icon: 'bg-purple-500/10 text-purple-400',
      line: 'bg-purple-500/20',
    },

    slate: {
      icon: 'bg-slate-500/10 text-slate-400',
      line: 'bg-slate-500/20',
    },
  };

  const currentColors = colors[color] || colors.slate;

  return (
    <div className="flex gap-4">
      {/* TIMELINE */}

      <div className="flex w-9 shrink-0 flex-col items-center">
        <div
          className={`
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            ${currentColors.icon}
          `}
        >
          {icon}
        </div>

        {!isLast && (
          <div
            className={`
              mt-2
              min-h-10
              w-px
              flex-1
              ${currentColors.line}
            `}
          />
        )}
      </div>

      {/* CONTENT */}

      <div
        className={`
          min-w-0
          flex-1
          ${isLast ? 'pb-2' : 'pb-6'}
        `}
      >
        {children}
      </div>
    </div>
  );
}

/* ============================================================
   DATE
============================================================ */

function DateText({ children }) {
  return (
    <div
      className="
        mt-3
        flex
        items-center
        gap-1.5
        text-xs
        text-slate-600
      "
    >
      <Clock size={12} />

      {children}
    </div>
  );
}

/* ============================================================
   CONTACT LABEL
============================================================ */

function getContactLabel(type) {
  const labels = {
    phone: 'Ligação telefônica',
    email: 'E-mail',
    whatsapp: 'WhatsApp',
    message: 'Mensagem',
    meeting: 'Reunião',
  };

  return labels[type] || type || 'Contato';
}

/* ============================================================
   CONTACT ICON
============================================================ */

function ContactIcon({ type }) {
  if (type === 'phone') {
    return <Phone size={16} />;
  }

  if (type === 'email') {
    return <Mail size={16} />;
  }

  if (type === 'whatsapp') {
    return <MessageCircle size={16} />;
  }

  return <MessageCircle size={16} />;
}

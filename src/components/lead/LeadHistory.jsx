import { useEffect, useMemo, useState } from 'react';

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
  CalendarDays,
  Activity,
  Target,
  UserCheck,
  FileText,
  ArrowRight,
  Sparkles,
  Zap,
  Timer,
  Info,
  Hash,
  BedDouble,
  Bath,
  Car,
  Ruler,
  CheckCircle2,
} from 'lucide-react';

import api from '../../service/api';

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

function formatDateOnly(date) {
  if (!date) return '-';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return '-';
  }

  return parsedDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
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
    maximumFractionDigits: 0,
  });
}

function formatArea(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const number = Number(value);

  if (Number.isNaN(number) || number <= 0) {
    return null;
  }

  return `${number.toLocaleString('pt-BR')} m²`;
}

function getTimeAgo(date) {
  if (!date) return null;

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  const diff = Date.now() - parsedDate.getTime();

  if (diff < 0) return 'agora';

  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) {
    return 'agora';
  }

  if (minutes < 60) {
    return `há ${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `há ${hours}h`;
  }

  const days = Math.floor(hours / 24);

  if (days < 30) {
    return `há ${days}d`;
  }

  const months = Math.floor(days / 30);

  if (months < 12) {
    return `há ${months} ${months === 1 ? 'mês' : 'meses'}`;
  }

  const years = Math.floor(months / 12);

  return `há ${years} ${years === 1 ? 'ano' : 'anos'}`;
}

function getInitials(name) {
  if (!name) return '?';

  return String(name)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function getObjectId(value) {
  if (!value) return null;

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object') {
    return value._id || value.id || value.$oid || null;
  }

  return null;
}

function getDateValue(date) {
  if (!date) return 0;

  const parsed = new Date(date).getTime();

  return Number.isNaN(parsed) ? 0 : parsed;
}

/* ============================================================
   VISIT HELPERS
============================================================ */

function isCompletedVisit(visit) {
  const status = String(
    visit?.status || visit?.visitStatus || visit?.state || '',
  )
    .trim()
    .toLowerCase();

  return [
    'concluida',
    'concluído',
    'concluida',
    'completed',
    'realizada',
    'realizado',
    'finished',
  ].includes(status);
}

function getVisitDate(visit) {
  if (!visit) return null;

  return (
    visit.finishedAt ||
    visit.completedAt ||
    visit.realizedAt ||
    visit.realizedDate ||
    visit.date ||
    visit.startAt ||
    visit.startDate ||
    visit.createdAt ||
    null
  );
}

function getVisitDateValue(visit) {
  return getDateValue(getVisitDate(visit));
}

function extractVisitProperty(visit) {
  if (!visit) return null;

  const property =
    visit.propertyInfo ||
    visit.property ||
    visit.visitedProperty ||
    visit.propertyData ||
    null;

  if (!property) {
    return null;
  }

  const propertyId = getObjectId(
    property?._id || property?.id || visit?.propertyId || visit?.property,
  );

  if (!propertyId && !property?.name && !property?.title) {
    return null;
  }

  return {
    ...property,

    _id: property?._id || property?.id || propertyId || null,

    id: property?.id || property?._id || propertyId || null,

    name:
      property?.name ||
      property?.title ||
      property?.description ||
      'Imóvel visitado',

    title: property?.title || property?.name || 'Imóvel visitado',

    code: property?.code || property?.formattedCode || '',

    type: property?.type || property?.propertyType || null,

    purpose: property?.purpose || property?.transactionType || null,

    price:
      property?.price ??
      property?.prices?.salePrice ??
      property?.prices?.rentPrice ??
      null,

    image:
      property?.image ||
      property?.mainImage ||
      property?.coverImage ||
      property?.images?.find((image) => image?.isCover)?.url ||
      property?.images?.[0]?.url ||
      '',

    bedrooms: property?.bedrooms ?? property?.details?.bedrooms ?? null,

    bathrooms: property?.bathrooms ?? property?.details?.bathrooms ?? null,

    suites: property?.suites ?? property?.details?.suites ?? null,

    parkingSpaces:
      property?.parkingSpaces ??
      property?.garage ??
      property?.details?.parkingSpaces ??
      null,

    area:
      property?.area ??
      property?.builtArea ??
      property?.privateArea ??
      property?.details?.area ??
      null,

    address:
      property?.address || property?.fullAddress || property?.location || null,
  };
}

function getVisitLeadId(visit) {
  return getObjectId(
    visit?.leadInfo || visit?.lead || visit?.leadId || visit?.customer || null,
  );
}

function normalizeVisitsResponse(response) {
  const payload = response?.data;

  const candidates = [
    payload?.data?.visits,
    payload?.data?.items,
    payload?.visits,
    payload?.items,
    payload?.results,
    Array.isArray(payload?.data) ? payload.data : null,
    Array.isArray(payload) ? payload : null,
  ];

  const result = candidates.find(Array.isArray);

  return Array.isArray(result) ? result : [];
}

/* ============================================================
   RESPONSÁVEL DO EVENTO / LEAD
============================================================ */

function getEventResponsible(item, leadResponsible, lead) {
  return (
    item?.broker ||
    item?.assignedTo ||
    item?.responsibleBroker ||
    leadResponsible ||
    lead?.broker ||
    null
  );
}

/* ============================================================
   ATOR DO EVENTO
============================================================ */

function getEventActor(item) {
  return (
    item?.createdBy ||
    item?.user ||
    item?.performedBy ||
    item?.changedBy ||
    null
  );
}

/* ============================================================
   LABELS
============================================================ */

function getStageLabel(stage) {
  const normalized = String(stage || '')
    .trim()
    .toLowerCase();

  const labels = {
    novo: 'Novo',
    novo_lead: 'Novo Lead',

    em_contato: 'Em contato',
    primeiro_contato: 'Primeiro Contato',

    qualificado: 'Qualificado',

    visita_agendada: 'Visita Agendada',

    proposta: 'Proposta',
    proposta_enviada: 'Proposta Enviada',

    negociacao: 'Negociação',

    convertido: 'Convertido',
    fechado: 'Fechado',

    perdido: 'Perdido',
  };

  return labels[normalized] || stage || 'Etapa';
}

function getStatusLabel(status) {
  const normalized = String(status || '')
    .trim()
    .toLowerCase();

  const labels = {
    novo: 'Novo',
    em_andamento: 'Em andamento',
    'em andamento': 'Em andamento',
    in_progress: 'Em andamento',
    active: 'Ativo',
    inactive: 'Inativo',
    convertido: 'Convertido',
    perdido: 'Perdido',
  };

  return labels[normalized] || status || 'Não informado';
}

function getPriorityLabel(priority) {
  const normalized = String(priority || '')
    .trim()
    .toLowerCase();

  const labels = {
    low: 'Baixa',
    medium: 'Média',
    high: 'Alta',
    urgent: 'Urgente',

    baixa: 'Baixa',
    media: 'Média',
    média: 'Média',
    alta: 'Alta',
    urgente: 'Urgente',
  };

  return labels[normalized] || priority || 'Não definida';
}

function getPropertyTypeLabel(type) {
  const normalized = String(type || '')
    .trim()
    .toLowerCase();

  const labels = {
    apartamento: 'Apartamento',
    casa: 'Casa',
    sobrado: 'Sobrado',
    terreno: 'Terreno',
    comercial: 'Comercial',
    sala_comercial: 'Sala Comercial',
    sala: 'Sala Comercial',
    galpao: 'Galpão',
    galpão: 'Galpão',
    cobertura: 'Cobertura',
    chacara: 'Chácara',
    chácara: 'Chácara',
    sitio: 'Sítio',
    sítio: 'Sítio',
    fazenda: 'Fazenda',
  };

  return labels[normalized] || type || 'Imóvel';
}

function getPurposeLabel(purpose) {
  const normalized = String(purpose || '')
    .trim()
    .toLowerCase();

  const labels = {
    venda: 'Venda',
    aluguel: 'Aluguel',
    locacao: 'Aluguel',
    locação: 'Aluguel',
    temporada: 'Temporada',
  };

  return labels[normalized] || purpose || '';
}

function getContactLabel(type) {
  const normalized = String(type || '')
    .trim()
    .toLowerCase();

  const labels = {
    phone: 'Ligação telefônica',
    telefone: 'Ligação telefônica',

    email: 'E-mail',
    e_mail: 'E-mail',

    whatsapp: 'WhatsApp',

    message: 'Mensagem',
    mensagem: 'Mensagem',

    meeting: 'Reunião',
    reuniao: 'Reunião',
    reunião: 'Reunião',

    visit: 'Visita',
    visita: 'Visita',
  };

  return labels[normalized] || type || 'Contato';
}

function getProposalStatusLabel(status) {
  const normalized = String(status || '')
    .trim()
    .toLowerCase();

  const labels = {
    draft: 'Rascunho',
    pending: 'Pendente',
    submitted: 'Enviada',
    enviada: 'Enviada',
    aceita: 'Aceita',
    accepted: 'Aceita',
    rejected: 'Recusada',
    rejeitada: 'Recusada',
    cancelled: 'Cancelada',
    canceled: 'Cancelada',
    cancelada: 'Cancelada',
  };

  return labels[normalized] || status || 'Não informado';
}

/* ============================================================
   SOURCE
============================================================ */

function getLeadSourceInfo(lead) {
  const source = String(lead?.source || '').toLowerCase();
  const sourceType = String(lead?.sourceType || '').toLowerCase();
  const sourceSite = String(lead?.sourceSite || '').trim();
  const landingPage = String(lead?.landingPage || '').toLowerCase();

  if (
    source === 'hotsite' ||
    sourceType === 'hotsite' ||
    sourceType === 'broker_hotsite' ||
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

  if (source === 'meta' || sourceType === 'meta') {
    return {
      label: 'Meta',
      description: 'Lead originado através da Meta.',
      icon: <Megaphone size={18} />,
      color: 'indigo',
    };
  }

  if (source === 'olx') {
    return {
      label: 'OLX',
      description: 'Lead originado através da OLX.',
      icon: <Globe size={18} />,
      color: 'orange',
    };
  }

  if (source === 'zap') {
    return {
      label: 'ZAP Imóveis',
      description: 'Lead originado através do ZAP Imóveis.',
      icon: <Globe size={18} />,
      color: 'green',
    };
  }

  if (source === 'csv') {
    return {
      label: 'Importação CSV',
      description: 'Lead importado através de arquivo CSV.',
      icon: <MousePointerClick size={18} />,
      color: 'yellow',
    };
  }

  if (sourceType === 'manual' || source === 'manual') {
    return {
      label: 'Cadastro Manual',
      description: 'Lead cadastrado manualmente.',
      icon: <UserRound size={18} />,
      color: 'slate',
    };
  }

  return {
    label: source || 'Não informado',
    description: 'Origem do lead não identificada.',
    icon: <Globe size={18} />,
    color: 'slate',
  };
}

const sourceColorClasses = {
  blue: {
    wrapper: 'bg-blue-500/[0.06] border-blue-500/20',
    icon: 'bg-blue-500/10 text-blue-400',
    label: 'text-blue-400',
  },

  purple: {
    wrapper: 'bg-purple-500/[0.06] border-purple-500/20',
    icon: 'bg-purple-500/10 text-purple-400',
    label: 'text-purple-400',
  },

  indigo: {
    wrapper: 'bg-indigo-500/[0.06] border-indigo-500/20',
    icon: 'bg-indigo-500/10 text-indigo-400',
    label: 'text-indigo-400',
  },

  orange: {
    wrapper: 'bg-orange-500/[0.06] border-orange-500/20',
    icon: 'bg-orange-500/10 text-orange-400',
    label: 'text-orange-400',
  },

  green: {
    wrapper: 'bg-green-500/[0.06] border-green-500/20',
    icon: 'bg-green-500/10 text-green-400',
    label: 'text-green-400',
  },

  yellow: {
    wrapper: 'bg-yellow-500/[0.06] border-yellow-500/20',
    icon: 'bg-yellow-500/10 text-yellow-400',
    label: 'text-yellow-400',
  },

  slate: {
    wrapper: 'bg-slate-500/[0.06] border-slate-800',
    icon: 'bg-slate-500/10 text-slate-400',
    label: 'text-slate-300',
  },
};

/* ============================================================
   PROPERTY ADDRESS
============================================================ */

function formatPropertyAddress(address = {}) {
  if (!address) {
    return null;
  }

  if (typeof address === 'string') {
    return address;
  }

  if (Array.isArray(address)) {
    return address.filter(Boolean).join(', ') || null;
  }

  const parts = [
    address.street || address.logradouro,
    address.number || address.numero,
    address.complement || address.complemento,
    address.district || address.neighborhood || address.bairro,
    address.city || address.cidade,
    address.state || address.uf,
  ].filter(Boolean);

  return parts.length ? parts.join(', ') : null;
}

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function LeadHistory({ lead }) {
  const stageHistory = Array.isArray(lead?.stageHistory)
    ? lead.stageHistory
    : [];

  const contactHistory = Array.isArray(lead?.contactHistory)
    ? lead.contactHistory
    : [];

  /*
   * IMPORTANTE:
   *
   * Não utilizamos lead.property para definir
   * o imóvel visitado.
   *
   * lead.property pode representar o imóvel
   * de interesse do lead.
   *
   * O imóvel visitado precisa vir da visita
   * efetivamente concluída.
   */
  const [visits, setVisits] = useState([]);
  const [loadingVisits, setLoadingVisits] = useState(false);

  /* ============================================================
     LOAD VISITS
  ============================================================ */

  useEffect(() => {
    let mounted = true;

    async function loadVisits() {
      if (!lead?._id && !lead?.id) {
        setVisits([]);
        return;
      }

      try {
        setLoadingVisits(true);

        const response = await api.get('/api/visits', {
          params: {
            page: 1,
            limit: 100,
          },
        });

        const loadedVisits = normalizeVisitsResponse(response);

        if (!mounted) return;

        setVisits(loadedVisits);
      } catch (error) {
        console.error('Erro ao carregar visitas do lead:', error);

        if (mounted) {
          setVisits([]);
        }
      } finally {
        if (mounted) {
          setLoadingVisits(false);
        }
      }
    }

    loadVisits();

    return () => {
      mounted = false;
    };
  }, [lead?._id, lead?.id]);

  /* ============================================================
     VISITAS DO LEAD
  ============================================================ */

  const leadId = getObjectId(lead?._id || lead?.id);

  const leadVisits = useMemo(() => {
    if (!leadId || !Array.isArray(visits)) {
      return [];
    }

    return visits.filter((visit) => {
      const visitLeadId = getVisitLeadId(visit);

      return visitLeadId && String(visitLeadId) === String(leadId);
    });
  }, [visits, leadId]);

  /* ============================================================
     VISITAS CONCLUÍDAS
  ============================================================ */

  const completedVisits = useMemo(() => {
    return leadVisits
      .filter((visit) => {
        if (!isCompletedVisit(visit)) {
          return false;
        }

        /*
         * A visita só interessa para o card do imóvel
         * se realmente possuir um imóvel associado.
         */
        return Boolean(extractVisitProperty(visit));
      })
      .sort((a, b) => getVisitDateValue(b) - getVisitDateValue(a));
  }, [leadVisits]);

  /*
   * Visita concluída mais recente que possui imóvel.
   */
  const latestCompletedVisit = useMemo(() => {
    return completedVisits[0] || null;
  }, [completedVisits]);

  /*
   * ESTE é o imóvel que deve aparecer no histórico.
   */
  const visitedProperty = useMemo(() => {
    return extractVisitProperty(latestCompletedVisit);
  }, [latestCompletedVisit]);

  const visitedPropertyDate = useMemo(() => {
    return latestCompletedVisit ? getVisitDate(latestCompletedVisit) : null;
  }, [latestCompletedVisit]);

  /* ============================================================
     SOURCE
  ============================================================ */

  const sourceInfo = getLeadSourceInfo(lead);

  const sourceColors =
    sourceColorClasses[sourceInfo.color] || sourceColorClasses.slate;

  /* ============================================================
     LEAD
  ============================================================ */

  const leadName = lead?.name || 'Lead sem nome';

  const leadCreatedAt =
    lead?.createdAt || lead?.created_at || lead?.dateCreated;

  const currentStage =
    lead?.stage || stageHistory?.[stageHistory.length - 1]?.stage;

  const currentStatus = lead?.status;

  const priority = lead?.priority;

  const broker =
    lead?.assignedTo || lead?.broker || lead?.responsibleBroker || null;

  const notes = lead?.notes;

  const phone = lead?.phone;

  const email = lead?.email;

  /* ============================================================
     LAST ACTIVITY
  ============================================================ */

  const lastActivity = useMemo(() => {
    const dates = [
      lead?.lastActivityAt,
      lead?.updatedAt,

      ...contactHistory.map(
        (item) => item?.createdAt || item?.date || item?.occurredAt,
      ),

      ...stageHistory.map((item) => item?.changedAt || item?.createdAt),

      ...completedVisits.map((visit) => getVisitDate(visit)),
    ].filter(Boolean);

    if (!dates.length) {
      return null;
    }

    return dates.sort((a, b) => getDateValue(b) - getDateValue(a))[0];
  }, [
    lead?.lastActivityAt,
    lead?.updatedAt,
    contactHistory,
    stageHistory,
    completedVisits,
  ]);

  /* ============================================================
     SOURCE
  ============================================================ */

  const landingPage = lead?.landingPage || '';

  const referrer = lead?.referrer || '';

  /* ============================================================
     METRICS
  ============================================================ */

  const totalActivities =
    stageHistory.length + contactHistory.length + completedVisits.length;

  const daysInRelationship = leadCreatedAt
    ? Math.max(
        0,
        Math.floor((Date.now() - new Date(leadCreatedAt).getTime()) / 86400000),
      )
    : null;

  const leadScore = lead?.score ?? lead?.leadScore ?? lead?.qualificationScore;

  const proposal = lead?.proposal || lead?.latestProposal || null;

  return (
    <div className="space-y-8 pb-8">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div
            className="
              relative
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              overflow-hidden
              rounded-2xl
              border
              border-blue-500/20
              bg-blue-500/10
              text-blue-400
              shadow-lg
              shadow-blue-950/20
            "
          >
            <History size={22} />

            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Histórico do Lead
              </h2>

              <span
                className="
                  rounded-full
                  border
                  border-slate-700
                  bg-slate-900
                  px-2.5
                  py-1
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-wider
                  text-slate-400
                "
              >
                CRM Intelligence
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Visão completa da jornada, origem, interesse e relacionamento.
            </p>
          </div>
        </div>

        {lastActivity && (
          <div
            className="
              inline-flex
              items-center
              gap-2
              self-start
              rounded-xl
              border
              border-slate-800
              bg-slate-900/60
              px-3
              py-2
              text-xs
              text-slate-400
              lg:self-auto
            "
          >
            <Activity size={14} className="text-emerald-400" />

            <span>Última atividade</span>

            <span className="font-medium text-slate-200">
              {getTimeAgo(lastActivity)}
            </span>
          </div>
        )}
      </div>

      {/* ======================================================
          LEAD OVERVIEW
      ====================================================== */}

      <section
        className="
          relative
          overflow-hidden
          rounded-3xl
          border
          border-slate-800
          bg-gradient-to-br
          from-slate-900
          via-slate-900/95
          to-slate-950
          p-6
          shadow-2xl
          shadow-black/20
        "
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-500/[0.07] blur-3xl" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div
              className="
                flex
                h-14
                w-14
                shrink-0
                items-center
                justify-center
                rounded-2xl
                border
                border-slate-700
                bg-slate-800
                text-sm
                font-bold
                text-slate-200
              "
            >
              {getInitials(leadName)}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-xl font-bold text-white">
                  {leadName}
                </h3>

                {currentStatus && <StatusBadge status={currentStatus} />}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                {phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone size={14} />
                    {phone}
                  </span>
                )}

                {email && (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail size={14} />
                    {email}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <MetricCard
              icon={<GitBranch size={15} />}
              label="Etapa"
              value={getStageLabel(currentStage)}
              color="blue"
            />

            <MetricCard
              icon={<Activity size={15} />}
              label="Atividades"
              value={totalActivities}
              color="emerald"
            />

            <MetricCard
              icon={<Timer size={15} />}
              label="Relacionamento"
              value={
                daysInRelationship !== null ? `${daysInRelationship}d` : '-'
              }
              color="purple"
            />

            <MetricCard
              icon={<Target size={15} />}
              label="Score"
              value={
                leadScore !== null && leadScore !== undefined ? leadScore : '-'
              }
              color="amber"
            />
          </div>
        </div>

        {currentStage && (
          <div className="mt-6 border-t border-slate-800 pt-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Etapa atual
              </span>

              {priority && <PriorityBadge priority={priority} />}
            </div>

            <div className="flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="
                    h-full
                    rounded-full
                    bg-gradient-to-r
                    from-blue-600
                    via-blue-500
                    to-cyan-400
                  "
                  style={{
                    width: `${getStageProgress(currentStage)}%`,
                  }}
                />
              </div>

              <span className="text-xs font-semibold text-slate-300">
                {getStageLabel(currentStage)}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* ======================================================
          QUICK INFORMATION
      ====================================================== */}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard
          icon={<CalendarDays size={17} />}
          label="Lead criado em"
          value={formatDateOnly(leadCreatedAt)}
          detail={getTimeAgo(leadCreatedAt)}
          color="blue"
        />

        <InfoCard
          icon={<Activity size={17} />}
          label="Última interação"
          value={formatDate(lastActivity)}
          detail={getTimeAgo(lastActivity)}
          color="emerald"
        />

        <InfoCard
          icon={<UserCheck size={17} />}
          label="Responsável"
          value={broker?.name || 'Não atribuído'}
          detail={broker?.email || broker?.position || ''}
          color="purple"
        />

        <InfoCard
          icon={<Zap size={17} />}
          label="Prioridade"
          value={getPriorityLabel(priority)}
          detail={
            leadScore !== null && leadScore !== undefined
              ? `Score ${leadScore}`
              : 'Sem score definido'
          }
          color="amber"
        />
      </section>

      {/* ======================================================
          CONTACT PROFILE
      ====================================================== */}

      {(phone || email || broker || notes) && (
        <section>
          <SectionHeader
            icon={<UserRound size={18} />}
            title="Perfil e relacionamento"
            description="Dados principais disponíveis sobre o lead"
            color="blue"
          />

          <div className="grid gap-4 lg:grid-cols-3">
            {/* CONTATO */}

            <div
              className="
                rounded-2xl
                border
                border-slate-800
                bg-slate-900/50
                p-5
              "
            >
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Contato
              </p>

              <div className="space-y-3">
                {phone && (
                  <DetailRow
                    icon={<Phone size={15} />}
                    label="Telefone"
                    value={phone}
                  />
                )}

                {email && (
                  <DetailRow
                    icon={<Mail size={15} />}
                    label="E-mail"
                    value={email}
                  />
                )}

                {lead?.region && (
                  <DetailRow
                    icon={<MapPin size={15} />}
                    label="Região"
                    value={lead.region}
                  />
                )}
              </div>
            </div>

            {/* RESPONSÁVEL */}

            <div
              className="
                rounded-2xl
                border
                border-slate-800
                bg-slate-900/50
                p-5
              "
            >
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Responsabilidade
              </p>

              {broker ? (
                <div className="flex items-center gap-3">
                  {broker.avatar ? (
                    <img
                      src={broker.avatar}
                      alt={broker.name || 'Corretor'}
                      className="h-11 w-11 rounded-xl object-cover"
                    />
                  ) : (
                    <div
                      className="
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-xl
                        bg-slate-800
                        text-xs
                        font-semibold
                        text-slate-300
                      "
                    >
                      {getInitials(broker.name)}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">
                      {broker.name || 'Corretor'}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {broker.position ||
                        broker.email ||
                        'Corretor responsável'}
                    </p>
                  </div>
                </div>
              ) : (
                <EmptyInline text="Nenhum responsável atribuído." />
              )}
            </div>

            {/* OBSERVAÇÕES */}

            <div
              className="
                rounded-2xl
                border
                border-slate-800
                bg-slate-900/50
                p-5
              "
            >
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Observações
              </p>

              {notes ? (
                <p className="text-sm leading-relaxed text-slate-400">
                  {notes}
                </p>
              ) : (
                <EmptyInline text="Nenhuma observação registrada." />
              )}
            </div>
          </div>
        </section>
      )}

      {/* ======================================================
          SOURCE
      ====================================================== */}

      <section
        className={`
          overflow-hidden
          rounded-2xl
          border
          ${sourceColors.wrapper}
        `}
      >
        <div className="p-5">
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
                    bg-slate-950/50
                    px-2.5
                    py-1
                    text-xs
                    font-semibold
                    ${sourceColors.label}
                  `}
                >
                  {sourceInfo.label}
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-300">
                {sourceInfo.description}
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {lead?.sourceType && (
                  <SourceDetail
                    icon={<Hash size={13} />}
                    label="Tipo"
                    value={lead.sourceType}
                  />
                )}

                {lead?.sourceSite && (
                  <SourceDetail
                    icon={<Globe size={13} />}
                    label="Site"
                    value={lead.sourceSite}
                  />
                )}

                {lead?.campaign?.utmSource && (
                  <SourceDetail
                    icon={<Megaphone size={13} />}
                    label="UTM Source"
                    value={lead.campaign.utmSource}
                  />
                )}

                {lead?.campaign?.utmMedium && (
                  <SourceDetail
                    icon={<MousePointerClick size={13} />}
                    label="UTM Medium"
                    value={lead.campaign.utmMedium}
                  />
                )}

                {lead?.campaign?.utmCampaign && (
                  <SourceDetail
                    icon={<Target size={13} />}
                    label="Campanha"
                    value={lead.campaign.utmCampaign}
                  />
                )}

                {lead?.campaign?.utmTerm && (
                  <SourceDetail
                    icon={<Tag size={13} />}
                    label="Termo"
                    value={lead.campaign.utmTerm}
                  />
                )}
              </div>

              {(landingPage || referrer) && (
                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  {landingPage && (
                    <UrlDetail
                      icon={<ExternalLink size={14} />}
                      label="Página de origem"
                      value={landingPage}
                    />
                  )}

                  {referrer && referrer !== landingPage && (
                    <UrlDetail
                      icon={<ExternalLink size={14} />}
                      label="Referência"
                      value={referrer}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          PROPERTY ACTUALLY VISITED
      ====================================================== */}

      {!loadingVisits && visitedProperty && (
        <section>
          <SectionHeader
            icon={<Heart size={18} />}
            title="Imóvel visitado"
            description="Imóvel efetivamente visitado pelo lead"
            color="emerald"
          />

          <div
            className="
                overflow-hidden
                rounded-3xl
                border
                border-emerald-500/10
                bg-slate-900/60
                shadow-xl
                shadow-black/10
              "
          >
            <div className="flex flex-col lg:flex-row">
              {/* IMAGEM */}

              <div
                className="
                    relative
                    h-64
                    w-full
                    shrink-0
                    overflow-hidden
                    bg-slate-950
                    lg:h-auto
                    lg:min-h-[300px]
                    lg:w-80
                  "
              >
                {visitedProperty.image ? (
                  <img
                    src={visitedProperty.image}
                    alt={visitedProperty.name}
                    className="
                        h-full
                        w-full
                        object-cover
                        transition
                        duration-700
                        hover:scale-105
                      "
                  />
                ) : (
                  <div className="flex h-full min-h-64 items-center justify-center text-slate-700">
                    <Building2 size={54} />
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/90 to-transparent" />

                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/90 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                    <CheckCircle2 size={13} />
                    Visita realizada
                  </span>

                  {visitedProperty.code && (
                    <span className="rounded-lg bg-slate-950/70 px-3 py-1.5 text-xs font-medium text-slate-300 backdrop-blur">
                      #{visitedProperty.code}
                    </span>
                  )}
                </div>
              </div>

              {/* CONTEÚDO */}

              <div className="flex min-w-0 flex-1 flex-col p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="mb-1 text-xs font-medium uppercase tracking-wider text-emerald-500/70">
                      Imóvel efetivamente visitado
                    </p>

                    <h4 className="text-xl font-bold text-white">
                      {visitedProperty.name ||
                        visitedProperty.title ||
                        'Imóvel visitado'}
                    </h4>
                  </div>

                  {formatCurrency(visitedProperty.price) && (
                    <div className="shrink-0">
                      <p className="text-xs text-slate-500">Valor</p>

                      <p className="text-xl font-bold text-emerald-400">
                        {formatCurrency(visitedProperty.price)}
                      </p>
                    </div>
                  )}
                </div>

                {/* DATA DA VISITA */}

                {visitedPropertyDate && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.04] px-3 py-2.5">
                    <CalendarDays size={15} className="text-emerald-400" />

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                        Visita realizada em
                      </p>

                      <p className="mt-0.5 text-sm font-medium text-slate-300">
                        {formatDate(visitedPropertyDate)}
                      </p>
                    </div>
                  </div>
                )}

                {/* ENDEREÇO */}

                {formatPropertyAddress(visitedProperty.address) && (
                  <div className="mt-4 flex items-start gap-2 text-sm text-slate-400">
                    <MapPin
                      size={16}
                      className="mt-0.5 shrink-0 text-slate-500"
                    />

                    <span>
                      {formatPropertyAddress(visitedProperty.address)}
                    </span>
                  </div>
                )}

                {/* STATS */}

                <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {visitedProperty.type && (
                    <PropertyStat
                      icon={<Home size={15} />}
                      label="Tipo"
                      value={getPropertyTypeLabel(visitedProperty.type)}
                    />
                  )}

                  {Number(visitedProperty.bedrooms) > 0 && (
                    <PropertyStat
                      icon={<BedDouble size={15} />}
                      label="Quartos"
                      value={visitedProperty.bedrooms}
                    />
                  )}

                  {Number(visitedProperty.bathrooms) > 0 && (
                    <PropertyStat
                      icon={<Bath size={15} />}
                      label="Banheiros"
                      value={visitedProperty.bathrooms}
                    />
                  )}

                  {Number(visitedProperty.parkingSpaces) > 0 && (
                    <PropertyStat
                      icon={<Car size={15} />}
                      label="Vagas"
                      value={visitedProperty.parkingSpaces}
                    />
                  )}

                  {visitedProperty.area && (
                    <PropertyStat
                      icon={<Ruler size={15} />}
                      label="Área"
                      value={formatArea(visitedProperty.area)}
                    />
                  )}

                  {Number(visitedProperty.suites) > 0 && (
                    <PropertyStat
                      icon={<BedDouble size={15} />}
                      label="Suítes"
                      value={visitedProperty.suites}
                    />
                  )}
                </div>

                <div className="mt-auto pt-6">
                  <div className="flex flex-wrap items-center gap-3">
                    {visitedProperty._id && (
                      <a
                        href={`/properties/${visitedProperty._id}`}
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            border
                            border-slate-700
                            bg-slate-800/70
                            px-4
                            py-2.5
                            text-sm
                            font-medium
                            text-slate-200
                            transition
                            hover:border-slate-600
                            hover:bg-slate-800
                          "
                      >
                        Ver imóvel
                        <ExternalLink size={15} />
                      </a>
                    )}

                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                      <CheckCircle2 size={13} className="text-emerald-500" />
                      Registro confirmado
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ======================================================
          PROPOSAL
      ====================================================== */}

      {proposal && (
        <section>
          <SectionHeader
            icon={<FileText size={18} />}
            title="Proposta relacionada"
            description="Informações da última proposta associada ao lead"
            color="purple"
          />

          <div
            className="
              rounded-2xl
              border
              border-purple-500/15
              bg-purple-500/[0.04]
              p-5
            "
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <FileText size={19} />
                </div>

                <div>
                  <p className="font-semibold text-white">
                    {proposal.title ||
                      proposal.name ||
                      `Proposta #${proposal.code || proposal._id || ''}`}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {proposal.createdAt
                      ? formatDate(proposal.createdAt)
                      : 'Data não informada'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {(proposal.amount || proposal.value || proposal.price) && (
                  <span className="font-bold text-emerald-400">
                    {formatCurrency(
                      proposal.amount || proposal.value || proposal.price,
                    )}
                  </span>
                )}

                {proposal.status && (
                  <span className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300">
                    {getProposalStatusLabel(proposal.status)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ======================================================
          EMPTY HISTORY
      ====================================================== */}

      {stageHistory.length === 0 &&
        contactHistory.length === 0 &&
        completedVisits.length === 0 && (
          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              rounded-2xl
              border
              border-dashed
              border-slate-800
              bg-slate-900/30
              py-14
              text-center
            "
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-500">
              <Clock size={22} />
            </div>

            <p className="font-medium text-slate-300">
              Nenhuma atividade registrada
            </p>

            <p className="mt-1 max-w-sm text-sm text-slate-600">
              As próximas movimentações, contatos, visitas e alterações de etapa
              aparecerão aqui.
            </p>
          </div>
        )}

      {/* ======================================================
          STAGE HISTORY
      ====================================================== */}

      {stageHistory.length > 0 && (
        <section>
          <SectionHeader
            icon={<GitBranch size={18} />}
            title="Histórico de etapas"
            description="Evolução do lead dentro do pipeline"
            color="blue"
            count={stageHistory.length}
          />

          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
            <div className="space-y-0">
              {[...stageHistory]
                .sort(
                  (a, b) =>
                    getDateValue(b?.changedAt || b?.createdAt) -
                    getDateValue(a?.changedAt || a?.createdAt),
                )
                .map((item, index, items) => {
                  const previousItem = items[index + 1];

                  return (
                    <TimelineItem
                      key={`${item.changedAt || item.createdAt || index}-${index}`}
                      icon={<GitBranch size={16} />}
                      color="blue"
                      isLast={index === items.length - 1}
                    >
                      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-xs text-slate-600">
                              Etapa alterada
                            </p>

                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              {previousItem?.stage && (
                                <>
                                  <span className="text-sm text-slate-500">
                                    {getStageLabel(previousItem.stage)}
                                  </span>

                                  <ArrowRight
                                    size={14}
                                    className="text-slate-600"
                                  />
                                </>
                              )}

                              <span className="rounded-lg bg-blue-500/10 px-2.5 py-1 text-sm font-semibold text-blue-400">
                                {getStageLabel(item.stage)}
                              </span>
                            </div>
                          </div>

                          <span className="shrink-0 text-xs text-slate-600">
                            {getTimeAgo(item.changedAt || item.createdAt)}
                          </span>
                        </div>

                        {item.changedBy && (
                          <div className="mt-4 flex items-center gap-2 border-t border-slate-800/80 pt-3">
                            {item.changedBy?.avatar ? (
                              <img
                                src={item.changedBy.avatar}
                                alt={item.changedBy.name || 'Usuário'}
                                className="h-7 w-7 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-[10px] font-semibold text-slate-400">
                                {getInitials(item.changedBy?.name)}
                              </div>
                            )}

                            <p className="text-xs text-slate-500">
                              Alterado por{' '}
                              <span className="font-medium text-slate-300">
                                {item.changedBy?.name || 'Usuário'}
                              </span>
                            </p>

                            <span className="ml-auto text-xs text-slate-600">
                              {formatDate(item.changedAt || item.createdAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    </TimelineItem>
                  );
                })}
            </div>
          </div>
        </section>
      )}

      {/* ======================================================
          CONTACT HISTORY
      ====================================================== */}

      {contactHistory.length > 0 && (
        <section>
          <SectionHeader
            icon={<MessageCircle size={18} />}
            title="Contatos realizados"
            description="Interações registradas com o lead"
            color="emerald"
            count={contactHistory.length}
          />

          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-5">
            <div className="space-y-0">
              {[...contactHistory]
                .sort(
                  (a, b) =>
                    getDateValue(b?.createdAt || b?.date || b?.occurredAt) -
                    getDateValue(a?.createdAt || a?.date || a?.occurredAt),
                )
                .map((item, index, items) => {
                  const responsible = getEventResponsible(item, broker, lead);

                  const actor = getEventActor(item);

                  const hasDifferentActor =
                    actor?.name &&
                    responsible?.name &&
                    actor.name !== responsible.name;

                  const itemDate =
                    item?.createdAt || item?.date || item?.occurredAt;

                  return (
                    <TimelineItem
                      key={`${itemDate || index}-${index}`}
                      icon={<ContactIcon type={item.type} />}
                      color="green"
                      isLast={index === items.length - 1}
                    >
                      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/50 p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-200">
                              {getContactLabel(item.type)}
                            </span>

                            {item.result && (
                              <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] font-medium text-slate-400">
                                {item.result}
                              </span>
                            )}
                          </div>

                          <span className="text-xs text-slate-600">
                            {getTimeAgo(itemDate)}
                          </span>
                        </div>

                        <p className="mt-3 text-sm leading-relaxed text-slate-400">
                          {item.description || 'Sem descrição registrada.'}
                        </p>

                        {/* RESPONSÁVEL */}

                        {responsible && (
                          <div className="mt-4 flex items-center gap-3 border-t border-slate-800/80 pt-3">
                            {responsible.avatar ? (
                              <img
                                src={responsible.avatar}
                                alt={responsible.name || 'Corretor'}
                                className="
                                    h-8
                                    w-8
                                    shrink-0
                                    rounded-full
                                    object-cover
                                    ring-2
                                    ring-slate-900
                                  "
                              />
                            ) : (
                              <div
                                className="
                                    flex
                                    h-8
                                    w-8
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-full
                                    bg-blue-500/10
                                    text-[10px]
                                    font-semibold
                                    text-blue-400
                                    ring-2
                                    ring-slate-900
                                  "
                              >
                                {getInitials(responsible.name)}
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                                Responsável
                              </p>

                              <p className="truncate text-xs font-semibold text-slate-300">
                                {responsible.name || 'Não identificado'}
                              </p>

                              {responsible.position && (
                                <p className="truncate text-[10px] text-slate-600">
                                  {responsible.position}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* QUEM EXECUTOU */}

                        {hasDifferentActor && (
                          <div className="mt-3 flex items-center gap-2">
                            <UserRound size={13} className="text-slate-600" />

                            <span className="text-[10px] uppercase tracking-wider text-slate-600">
                              Executado por
                            </span>

                            <span className="text-xs font-medium text-slate-400">
                              {actor.name}
                            </span>
                          </div>
                        )}

                        <DateText>{formatDate(itemDate)}</DateText>
                      </div>
                    </TimelineItem>
                  );
                })}
            </div>
          </div>
        </section>
      )}

      {/* ======================================================
          FOOTER INSIGHT
      ====================================================== */}

      <section
        className="
          flex
          items-start
          gap-3
          rounded-2xl
          border
          border-blue-500/10
          bg-blue-500/[0.03]
          p-4
        "
      >
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
          <Sparkles size={15} />
        </div>

        <div>
          <p className="text-sm font-medium text-slate-300">
            Inteligência do lead
          </p>

          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Este painel consolida origem, relacionamento, movimentações, visitas
            realizadas, interesse imobiliário e evolução comercial do lead.
          </p>
        </div>
      </section>
    </div>
  );
}

/* ============================================================
   SECTION HEADER
============================================================ */

function SectionHeader({ icon, title, description, color = 'blue', count }) {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    purple: 'bg-purple-500/10 text-purple-400',
    amber: 'bg-amber-500/10 text-amber-400',
  };

  return (
    <div className="mb-4 flex items-center gap-3">
      <div
        className={`
          flex
          h-9
          w-9
          items-center
          justify-center
          rounded-xl
          ${colors[color] || colors.blue}
        `}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-white">{title}</h3>

          {count !== undefined && (
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
              {count}
            </span>
          )}
        </div>

        <p className="text-xs text-slate-600">{description}</p>
      </div>
    </div>
  );
}

/* ============================================================
   METRIC CARD
============================================================ */

function MetricCard({ icon, label, value, color = 'blue' }) {
  const colors = {
    blue: 'text-blue-400 bg-blue-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
  };

  return (
    <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-950/50 p-3">
      <div className="flex items-center gap-1.5">
        <span
          className={`
            flex
            h-6
            w-6
            items-center
            justify-center
            rounded-lg
            ${colors[color] || colors.blue}
          `}
        >
          {icon}
        </span>

        <span className="truncate text-[10px] uppercase tracking-wider text-slate-600">
          {label}
        </span>
      </div>

      <p className="mt-2 truncate text-sm font-semibold text-slate-200">
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   INFO CARD
============================================================ */

function InfoCard({ icon, label, value, detail, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    purple: 'bg-purple-500/10 text-purple-400',
    amber: 'bg-amber-500/10 text-amber-400',
  };

  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-800
        bg-slate-900/50
        p-4
        transition
        hover:border-slate-700
      "
    >
      <div className="flex items-center gap-3">
        <div
          className={`
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-xl
            ${colors[color] || colors.blue}
          `}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
            {label}
          </p>

          <p className="mt-1 truncate text-sm font-semibold text-slate-200">
            {value}
          </p>

          {detail && (
            <p className="mt-0.5 truncate text-xs text-slate-600">{detail}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   DETAIL ROW
============================================================ */

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-500">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-slate-600">
          {label}
        </p>

        <p className="truncate text-sm text-slate-300">{value}</p>
      </div>
    </div>
  );
}

/* ============================================================
   SOURCE DETAIL
============================================================ */

function SourceDetail({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
      <div className="flex items-center gap-1.5 text-slate-600">
        {icon}

        <span className="text-[10px] font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p
        className="mt-1 truncate text-xs font-medium text-slate-300"
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   URL DETAIL
============================================================ */

function UrlDetail({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/30 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-slate-600">
        {icon}

        <span className="text-[10px] font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="truncate text-xs text-slate-400" title={value}>
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   PROPERTY STAT
============================================================ */

function PropertyStat({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3">
      <div className="flex items-center gap-1.5 text-slate-600">
        {icon}

        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>

      <p className="mt-1 text-sm font-semibold text-slate-300">{value}</p>
    </div>
  );
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({ status }) {
  const normalized = String(status || '')
    .toLowerCase()
    .trim();

  const config = {
    novo: {
      label: 'Novo',
      className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },

    em_andamento: {
      label: 'Em andamento',
      className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },

    'em andamento': {
      label: 'Em andamento',
      className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },

    in_progress: {
      label: 'Em andamento',
      className: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    },

    convertido: {
      label: 'Convertido',
      className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },

    perdido: {
      label: 'Perdido',
      className: 'bg-red-500/10 text-red-400 border-red-500/20',
    },
  };

  const item = config[normalized] || {
    label: getStatusLabel(status),
    className: 'bg-slate-800 text-slate-400 border-slate-700',
  };

  return (
    <span
      className={`
        rounded-full
        border
        px-2.5
        py-1
        text-[10px]
        font-semibold
        ${item.className}
      `}
    >
      {item.label}
    </span>
  );
}

/* ============================================================
   PRIORITY BADGE
============================================================ */

function PriorityBadge({ priority }) {
  if (!priority) return null;

  const normalized = String(priority).toLowerCase().trim();

  const config = {
    low: 'bg-slate-800 text-slate-400',
    baixa: 'bg-slate-800 text-slate-400',

    medium: 'bg-blue-500/10 text-blue-400',

    media: 'bg-blue-500/10 text-blue-400',

    média: 'bg-blue-500/10 text-blue-400',

    high: 'bg-orange-500/10 text-orange-400',

    alta: 'bg-orange-500/10 text-orange-400',

    urgent: 'bg-red-500/10 text-red-400',

    urgente: 'bg-red-500/10 text-red-400',
  };

  return (
    <span
      className={`
        rounded-full
        px-2.5
        py-1
        text-[10px]
        font-semibold
        ${config[normalized] || 'bg-slate-800 text-slate-400'}
      `}
    >
      Prioridade {getPriorityLabel(priority)}
    </span>
  );
}

/* ============================================================
   EMPTY INLINE
============================================================ */

function EmptyInline({ text }) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-600">
      <Info size={14} />
      {text}
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
      line: 'bg-blue-500/15',
    },

    green: {
      icon: 'bg-emerald-500/10 text-emerald-400',
      line: 'bg-emerald-500/15',
    },

    purple: {
      icon: 'bg-purple-500/10 text-purple-400',
      line: 'bg-purple-500/15',
    },

    slate: {
      icon: 'bg-slate-500/10 text-slate-400',
      line: 'bg-slate-500/15',
    },
  };

  const currentColors = colors[color] || colors.slate;

  return (
    <div className="flex gap-4">
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
            ring-4
            ring-slate-950
            ${currentColors.icon}
          `}
        >
          {icon}
        </div>

        {!isLast && (
          <div
            className={`
              mt-2
              min-h-8
              w-px
              flex-1
              ${currentColors.line}
            `}
          />
        )}
      </div>

      <div
        className={`
          min-w-0
          flex-1
          ${isLast ? 'pb-2' : 'pb-5'}
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
    <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
      <Clock size={12} />
      {children}
    </div>
  );
}

/* ============================================================
   CONTACT ICON
============================================================ */

function ContactIcon({ type }) {
  const normalized = String(type || '')
    .toLowerCase()
    .trim();

  if (normalized === 'phone' || normalized === 'telefone') {
    return <Phone size={16} />;
  }

  if (
    normalized === 'email' ||
    normalized === 'e-mail' ||
    normalized === 'e_mail'
  ) {
    return <Mail size={16} />;
  }

  if (normalized === 'whatsapp') {
    return <MessageCircle size={16} />;
  }

  if (
    normalized === 'meeting' ||
    normalized === 'meeting' ||
    normalized === 'reuniao' ||
    normalized === 'reunião' ||
    normalized === 'visit' ||
    normalized === 'visita'
  ) {
    return <CalendarDays size={16} />;
  }

  return <MessageCircle size={16} />;
}

/* ============================================================
   STAGE PROGRESS
============================================================ */

function getStageProgress(stage) {
  const normalized = String(stage || '')
    .trim()
    .toLowerCase();

  const progress = {
    novo: 10,
    novo_lead: 10,

    em_contato: 22,
    primeiro_contato: 22,

    qualificado: 35,

    visita_agendada: 50,

    proposta: 65,
    proposta_enviada: 65,

    negociacao: 80,

    convertido: 100,
    fechado: 100,

    perdido: 100,
  };

  return progress[normalized] || 10;
}

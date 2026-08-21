import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  ArrowLeft,
  CalendarDays,
  Clock,
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  CircleCheck,
  Save,
  X,
  ExternalLink,
  Home,
  Tag,
  Car,
  BedDouble,
  Bath,
  Loader2,
  AlertCircle,
  UserRound,
  ClipboardList,
  Video,
  PhoneCall,
  Handshake,
  FileText,
  BriefcaseBusiness,
  MoreHorizontal,
  CalendarCheck2,
  Sparkles,
  ChevronRight,
  Timer,
  MapPinned,
  Users,
  Info,
} from 'lucide-react';

import {
  getVisitById,
  updateVisit,
  deleteVisit,
  confirmVisit,
  completeVisit,
  cancelVisit,
} from '../service/visitApi';

/* ============================================================
   CONSTANTS
============================================================ */

const EVENT_TYPES = {
  VISIT: 'visita',
  MEETING: 'reuniao',
  CALL: 'ligacao',
  ONLINE_MEETING: 'reuniao_online',
  PROPOSAL: 'proposta',
  NEGOTIATION: 'negociacao',
  INTERNAL: 'interno',
  OTHER: 'outro',
};

const EVENT_TYPE_CONFIG = {
  [EVENT_TYPES.VISIT]: {
    label: 'Visita',
    shortLabel: 'Visita',
    description: 'Visita presencial ao imóvel',
    icon: Home,
    color: 'emerald',
    gradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    ring: 'ring-emerald-500/20',
  },

  [EVENT_TYPES.MEETING]: {
    label: 'Reunião',
    shortLabel: 'Reunião',
    description: 'Reunião com Lead, cliente ou equipe',
    icon: Users,
    color: 'blue',
    gradient: 'from-blue-500/20 via-blue-500/5 to-transparent',
    border: 'border-blue-500/20',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    ring: 'ring-blue-500/20',
  },

  [EVENT_TYPES.CALL]: {
    label: 'Ligação',
    shortLabel: 'Ligação',
    description: 'Contato telefônico',
    icon: PhoneCall,
    color: 'violet',
    gradient: 'from-violet-500/20 via-violet-500/5 to-transparent',
    border: 'border-violet-500/20',
    bg: 'bg-violet-500/10',
    text: 'text-violet-400',
    ring: 'ring-violet-500/20',
  },

  [EVENT_TYPES.ONLINE_MEETING]: {
    label: 'Reunião online',
    shortLabel: 'Online',
    description: 'Reunião virtual',
    icon: Video,
    color: 'cyan',
    gradient: 'from-cyan-500/20 via-cyan-500/5 to-transparent',
    border: 'border-cyan-500/20',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    ring: 'ring-cyan-500/20',
  },

  [EVENT_TYPES.PROPOSAL]: {
    label: 'Proposta',
    shortLabel: 'Proposta',
    description: 'Acompanhamento ou apresentação de proposta',
    icon: FileText,
    color: 'amber',
    gradient: 'from-amber-500/20 via-amber-500/5 to-transparent',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    ring: 'ring-amber-500/20',
  },

  [EVENT_TYPES.NEGOTIATION]: {
    label: 'Negociação',
    shortLabel: 'Negociação',
    description: 'Etapa de negociação comercial',
    icon: Handshake,
    color: 'orange',
    gradient: 'from-orange-500/20 via-orange-500/5 to-transparent',
    border: 'border-orange-500/20',
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    ring: 'ring-orange-500/20',
  },

  [EVENT_TYPES.INTERNAL]: {
    label: 'Compromisso interno',
    shortLabel: 'Interno',
    description: 'Compromisso interno da equipe',
    icon: BriefcaseBusiness,
    color: 'slate',
    gradient: 'from-slate-500/20 via-slate-500/5 to-transparent',
    border: 'border-slate-700',
    bg: 'bg-slate-800/60',
    text: 'text-slate-300',
    ring: 'ring-slate-500/20',
  },

  [EVENT_TYPES.OTHER]: {
    label: 'Outro compromisso',
    shortLabel: 'Outro',
    description: 'Compromisso personalizado',
    icon: MoreHorizontal,
    color: 'pink',
    gradient: 'from-pink-500/20 via-pink-500/5 to-transparent',
    border: 'border-pink-500/20',
    bg: 'bg-pink-500/10',
    text: 'text-pink-400',
    ring: 'ring-pink-500/20',
  },
};

const STATUS_CONFIG = {
  agendada: {
    label: 'Agendada',
    className: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
    dot: 'bg-blue-400',
  },

  confirmada: {
    label: 'Confirmada',
    className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    dot: 'bg-emerald-400',
  },

  concluida: {
    label: 'Concluída',
    className: 'border-violet-500/20 bg-violet-500/10 text-violet-400',
    dot: 'bg-violet-400',
  },

  cancelada: {
    label: 'Cancelada',
    className: 'border-red-500/20 bg-red-500/10 text-red-400',
    dot: 'bg-red-400',
  },
};

/* ============================================================
   HELPERS
============================================================ */

function getEventType(visit) {
  return (
    visit?.type || visit?.eventType || visit?.calendarType || EVENT_TYPES.VISIT
  );
}

function getEventConfig(visit) {
  return (
    EVENT_TYPE_CONFIG[getEventType(visit)] ||
    EVENT_TYPE_CONFIG[EVENT_TYPES.OTHER]
  );
}

function isVisit(visit) {
  return getEventType(visit) === EVENT_TYPES.VISIT;
}

function getEventTitle(visit) {
  if (visit?.title) return visit.title;

  const config = getEventConfig(visit);

  if (isVisit(visit)) {
    return visit?.property?.name
      ? `Visita — ${visit.property.name}`
      : 'Visita ao imóvel';
  }

  return config.label;
}

function getStatusConfig(status) {
  return (
    STATUS_CONFIG[status] || {
      label: status || 'Desconhecido',
      className: 'border-slate-700 bg-slate-800/50 text-slate-300',
      dot: 'bg-slate-500',
    }
  );
}

function formatDate(date) {
  if (!date) return '-';

  return new Date(date).toLocaleDateString('pt-BR', {
    dateStyle: 'full',
  });
}

function formatShortDate(date) {
  if (!date) return '-';

  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatTime(date) {
  if (!date) return '-';

  return new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateTime(date) {
  if (!date) return '-';

  return new Date(date).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function formatDateTimeForInput(date) {
  if (!date) return '';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return '';

  const offset = parsed.getTimezoneOffset();

  const localDate = new Date(parsed.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const number = Number(value);

  if (Number.isNaN(number)) return null;

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(number);
}

function getDurationMinutes(visit) {
  if (!visit?.date || !visit?.endDate) return null;

  const start = new Date(visit.date).getTime();
  const end = new Date(visit.endDate).getTime();

  if (!start || !end || end <= start) return null;

  return Math.round((end - start) / 60000);
}

function formatDuration(minutes) {
  if (!minutes) return null;

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (!remaining) {
    return `${hours}h`;
  }

  return `${hours}h ${remaining}min`;
}

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function VisitDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [visit, setVisit] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    date: '',
    broker: '',
    property: '',
    address: '',
    notes: '',
    status: '',
    title: '',
  });

  /* ============================================================
     LOAD
  ============================================================ */

  useEffect(() => {
    loadVisit();
  }, [id]);

  const loadVisit = async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getVisitById(id);

      setVisit(data);

      setForm({
        date: formatDateTimeForInput(data?.date),
        broker: data?.broker?._id || data?.broker || '',
        property: data?.property?._id || data?.property || '',
        address: data?.address || '',
        notes: data?.notes || '',
        status: data?.status || '',
        title: data?.title || '',
      });
    } catch (err) {
      console.error('Erro ao carregar compromisso:', err);

      setError(
        err?.response?.data?.message ||
          'Não foi possível carregar os dados do compromisso.',
      );
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     DERIVED
  ============================================================ */

  const eventConfig = useMemo(() => getEventConfig(visit), [visit]);

  const EventIcon = eventConfig.icon;

  const statusConfig = useMemo(
    () => getStatusConfig(visit?.status),
    [visit?.status],
  );

  const duration = useMemo(() => getDurationMinutes(visit), [visit]);

  const propertyImage = useMemo(() => {
    if (!visit?.property) return '';

    if (visit.property.mainImage) {
      return visit.property.mainImage;
    }

    if (visit.property.coverImage) {
      return visit.property.coverImage;
    }

    if (Array.isArray(visit.property.images)) {
      const cover = visit.property.images.find((image) => image?.isCover);

      if (cover?.url) return cover.url;

      if (visit.property.images[0]?.url) {
        return visit.property.images[0].url;
      }
    }

    return '';
  }, [visit]);

  const propertyAddress = useMemo(() => {
    if (!visit?.property) {
      return visit?.address || '';
    }

    if (visit.property.fullAddress) {
      return visit.property.fullAddress;
    }

    if (visit.address) {
      return visit.address;
    }

    const location = visit.property.location;

    if (location) {
      return [
        location.street,
        location.number,
        location.district,
        location.city,
        location.state,
      ]
        .filter(Boolean)
        .join(', ');
    }

    return '';
  }, [visit]);

  const isVisitEvent = isVisit(visit);

  /* ============================================================
     FORM
  ============================================================ */

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        date: form.date ? new Date(form.date).toISOString() : undefined,

        broker: form.broker || undefined,

        property: form.property || undefined,

        address: form.address,

        notes: form.notes,

        status: form.status,

        title: form.title || undefined,
      };

      const updated = await updateVisit(id, payload);

      setVisit(updated);

      setForm({
        date: formatDateTimeForInput(updated?.date),
        broker: updated?.broker?._id || updated?.broker || '',
        property: updated?.property?._id || updated?.property || '',
        address: updated?.address || '',
        notes: updated?.notes || '',
        status: updated?.status || '',
        title: updated?.title || '',
      });

      setEditing(false);
      setSuccess(`${getEventConfig(updated).label} atualizado com sucesso.`);

      clearSuccess();
    } catch (err) {
      console.error('Erro ao atualizar compromisso:', err);

      setError(
        err?.response?.data?.message ||
          'Não foi possível atualizar o compromisso.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);

    setForm({
      date: formatDateTimeForInput(visit?.date),
      broker: visit?.broker?._id || visit?.broker || '',
      property: visit?.property?._id || visit?.property || '',
      address: visit?.address || '',
      notes: visit?.notes || '',
      status: visit?.status || '',
      title: visit?.title || '',
    });
  };

  /* ============================================================
     ACTIONS
  ============================================================ */

  const clearSuccess = () => {
    setTimeout(() => {
      setSuccess('');
    }, 3000);
  };

  const handleConfirm = async () => {
    try {
      setActionLoading(true);
      setError('');

      const result = await confirmVisit(id);

      const updated = result?.data || result;

      setVisit(updated);

      setSuccess(`${getEventConfig(updated).label} confirmado com sucesso.`);

      clearSuccess();
    } catch (err) {
      console.error('Erro ao confirmar compromisso:', err);

      setError(
        err?.response?.data?.message ||
          'Não foi possível confirmar o compromisso.',
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setActionLoading(true);
      setError('');

      const result = await completeVisit(id);

      const updated = result?.data || result;

      setVisit(updated);

      setSuccess(`${getEventConfig(updated).label} concluído com sucesso.`);

      clearSuccess();
    } catch (err) {
      console.error('Erro ao concluir compromisso:', err);

      setError(
        err?.response?.data?.message ||
          'Não foi possível concluir o compromisso.',
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelVisit = async () => {
    const reason = window.prompt('Informe o motivo do cancelamento:');

    if (reason === null) return;

    try {
      setActionLoading(true);
      setError('');

      const result = await cancelVisit(id, reason);

      const updated = result?.data || result;

      setVisit(updated);

      setSuccess(`${getEventConfig(updated).label} cancelado com sucesso.`);

      clearSuccess();
    } catch (err) {
      console.error('Erro ao cancelar compromisso:', err);

      setError(
        err?.response?.data?.message ||
          'Não foi possível cancelar o compromisso.',
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir este ${isVisitEvent ? 'visita' : 'compromisso'}? Esta ação não poderá ser desfeita.`,
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError('');

      await deleteVisit(id);

      navigate('/visits');
    } catch (err) {
      console.error('Erro ao excluir compromisso:', err);

      setError(
        err?.response?.data?.message ||
          'Não foi possível excluir o compromisso.',
      );

      setActionLoading(false);
    }
  };

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <div className="flex min-h-[600px] items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
            <Loader2 size={26} className="animate-spin text-blue-400" />
          </div>

          <div className="text-center">
            <p className="text-sm font-semibold text-white">
              Carregando compromisso
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Preparando os detalhes...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     EMPTY
  ============================================================ */

  if (!visit) {
    return (
      <div className="min-h-screen bg-slate-950 p-6 text-white">
        <div className="mx-auto flex min-h-[600px] max-w-4xl items-center justify-center">
          <div className="w-full rounded-3xl border border-red-500/20 bg-red-500/5 p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
              <AlertCircle size={32} className="text-red-400" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-white">
              Compromisso não encontrado
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              {error || 'Não foi possível encontrar este compromisso.'}
            </p>

            <button
              onClick={() => navigate('/visits')}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              <ArrowLeft size={16} />
              Voltar para agenda
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px] space-y-6">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <header
          className={`relative overflow-hidden rounded-3xl border ${eventConfig.border} bg-gradient-to-br ${eventConfig.gradient} bg-slate-900/70`}
        >
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-white/[0.02] blur-3xl" />

          <div className="relative p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="flex min-w-0 gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/70 text-slate-400 transition hover:border-slate-700 hover:text-white"
                >
                  <ArrowLeft size={19} />
                </button>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div
                      className={`flex items-center gap-2 rounded-full border ${eventConfig.border} ${eventConfig.bg} px-3 py-1.5`}
                    >
                      <EventIcon size={14} className={eventConfig.text} />

                      <span className={`text-xs font-bold ${eventConfig.text}`}>
                        {eventConfig.label}
                      </span>
                    </div>

                    <StatusBadge status={visit.status} />
                  </div>

                  <h1 className="mt-4 max-w-4xl text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {getEventTitle(visit)}
                  </h1>

                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                    {eventConfig.description}.
                    {visit?.lead?.name
                      ? ` Atendimento relacionado ao Lead ${visit.lead.name}.`
                      : ''}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    <HeroMeta
                      icon={<CalendarDays size={15} />}
                      value={formatShortDate(visit.date)}
                    />

                    <HeroMeta
                      icon={<Clock size={15} />}
                      value={formatTime(visit.date)}
                    />

                    {duration && (
                      <HeroMeta
                        icon={<Timer size={15} />}
                        value={formatDuration(duration)}
                      />
                    )}

                    {visit?.broker?.name && (
                      <HeroMeta
                        icon={<User size={15} />}
                        value={visit.broker.name}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 xl:justify-end">
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-slate-600 hover:bg-slate-900"
                  >
                    <Pencil size={16} />
                    Editar
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:text-white disabled:opacity-50"
                    >
                      <X size={16} />
                      Cancelar
                    </button>

                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-500 disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      Salvar
                    </button>
                  </>
                )}

                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* ======================================================
            ALERTS
        ====================================================== */}

        {error && <AlertBox type="error" message={error} />}

        {success && <AlertBox type="success" message={success} />}

        {/* ======================================================
            QUICK OVERVIEW
        ====================================================== */}

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <OverviewCard
            icon={<CalendarCheck2 size={19} />}
            label="Data"
            value={formatShortDate(visit.date)}
            accent={eventConfig.text}
          />

          <OverviewCard
            icon={<Clock size={19} />}
            label="Horário"
            value={formatTime(visit.date)}
            accent={eventConfig.text}
          />

          <OverviewCard
            icon={<UserRound size={19} />}
            label="Lead"
            value={visit.lead?.name || 'Não informado'}
            accent="text-blue-400"
          />

          <OverviewCard
            icon={<User size={19} />}
            label="Responsável"
            value={visit.broker?.name || 'Não informado'}
            accent="text-violet-400"
          />
        </section>

        {/* ======================================================
            CONTEXT FLOW
        ====================================================== */}

        <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionTitle
                icon={<Sparkles size={18} />}
                title={
                  isVisitEvent
                    ? 'Contexto da visita'
                    : 'Contexto do compromisso'
                }
              />

              <p className="mt-1 text-xs text-slate-500">
                Visão rápida das pessoas e recursos envolvidos.
              </p>
            </div>

            <span className="text-xs font-medium text-slate-600">
              {eventConfig.label}
            </span>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
            <ContextCard
              icon={<UserRound size={20} />}
              label="Lead"
              value={visit.lead?.name || 'Lead não informado'}
              subtitle={visit.lead?.phone || visit.lead?.email || 'Sem contato'}
              tone="blue"
              onClick={
                visit.lead?._id
                  ? () => navigate(`/lead-detail/${visit.lead._id}`)
                  : undefined
              }
            />

            <ContextConnector />

            {isVisitEvent ? (
              <ContextCard
                icon={<Building2 size={20} />}
                label="Imóvel"
                value={visit.property?.name || 'Imóvel não informado'}
                subtitle={
                  visit.property?.code
                    ? `Código ${visit.property.code}`
                    : visit.property?.type || 'Imóvel'
                }
                tone="emerald"
                onClick={
                  visit.property?._id
                    ? () => navigate(`/properties/${visit.property._id}`)
                    : undefined
                }
              />
            ) : (
              <ContextCard
                icon={<EventIcon size={20} />}
                label="Compromisso"
                value={visit.title || eventConfig.label}
                subtitle={eventConfig.description}
                tone="violet"
              />
            )}

            <ContextConnector />

            <ContextCard
              icon={<User size={20} />}
              label="Responsável"
              value={visit.broker?.name || 'Corretor não informado'}
              subtitle={
                visit.broker?.email || visit.broker?.phone || 'Sem contato'
              }
              tone="violet"
            />
          </div>
        </section>

        {/* ======================================================
            MAIN GRID
        ====================================================== */}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* ====================================================
              LEFT
          ==================================================== */}

          <main className="min-w-0 space-y-6">
            {/* ==================================================
                EVENT DETAILS
            ================================================== */}

            <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6">
              <SectionTitle
                icon={<CalendarDays size={18} />}
                title={
                  isVisitEvent
                    ? 'Informações da visita'
                    : 'Informações do compromisso'
                }
              />

              {editing ? (
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <InputField
                    label="Título"
                    value={form.title}
                    onChange={(value) => handleChange('title', value)}
                    placeholder={
                      isVisitEvent
                        ? 'Ex.: Visita ao apartamento'
                        : 'Nome do compromisso'
                    }
                  />

                  <InputField
                    label="Data e horário"
                    type="datetime-local"
                    value={form.date}
                    onChange={(value) => handleChange('date', value)}
                  />

                  <SelectField
                    label="Status"
                    value={form.status}
                    onChange={(value) => handleChange('status', value)}
                    options={[
                      {
                        value: 'agendada',
                        label: 'Agendada',
                      },
                      {
                        value: 'confirmada',
                        label: 'Confirmada',
                      },
                      {
                        value: 'concluida',
                        label: 'Concluída',
                      },
                      {
                        value: 'cancelada',
                        label: 'Cancelada',
                      },
                    ]}
                  />

                  <div className="sm:col-span-2">
                    <InputField
                      label={
                        isVisitEvent ? 'Endereço da visita' : 'Local / endereço'
                      }
                      value={form.address}
                      onChange={(value) => handleChange('address', value)}
                      placeholder={
                        isVisitEvent
                          ? 'Endereço da visita'
                          : 'Local do compromisso'
                      }
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <TextAreaField
                      label="Observações"
                      value={form.notes}
                      onChange={(value) => handleChange('notes', value)}
                      placeholder="Adicione informações importantes..."
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-6 space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <DetailTile
                      icon={<CalendarDays size={17} />}
                      label="Data"
                      value={formatDate(visit.date)}
                    />

                    <DetailTile
                      icon={<Clock size={17} />}
                      label="Horário"
                      value={formatTime(visit.date)}
                    />

                    {duration && (
                      <DetailTile
                        icon={<Timer size={17} />}
                        label="Duração"
                        value={formatDuration(duration)}
                      />
                    )}

                    <DetailTile
                      icon={<Info size={17} />}
                      label="Status"
                      value={statusConfig.label}
                    />
                  </div>

                  <div className="grid gap-4">
                    <DetailTile
                      icon={
                        isVisitEvent ? (
                          <MapPinned size={17} />
                        ) : (
                          <MapPin size={17} />
                        )
                      }
                      label={
                        isVisitEvent
                          ? 'Local da visita'
                          : 'Local do compromisso'
                      }
                      value={
                        visit.address ||
                        propertyAddress ||
                        'Local não informado'
                      }
                    />

                    <DetailTile
                      icon={<ClipboardList size={17} />}
                      label="Observações"
                      value={visit.notes || 'Nenhuma observação registrada.'}
                    />
                  </div>
                </div>
              )}
            </section>

            {/* ==================================================
                LEAD
            ================================================== */}

            <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6">
              <SectionTitle
                icon={<UserRound size={18} />}
                title="Lead relacionado"
              />

              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 sm:p-5">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                    <UserRound size={25} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold text-white">
                      {visit.lead?.name || 'Lead não informado'}
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400">
                      {visit.lead?.phone && (
                        <span className="inline-flex items-center gap-2">
                          <Phone size={14} />
                          {visit.lead.phone}
                        </span>
                      )}

                      {visit.lead?.email && (
                        <span className="inline-flex items-center gap-2">
                          <Mail size={14} />
                          {visit.lead.email}
                        </span>
                      )}
                    </div>
                  </div>

                  {visit.lead?._id && (
                    <button
                      onClick={() => navigate(`/lead-detail/${visit.lead._id}`)}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                    >
                      Ver Lead
                      <ExternalLink size={14} />
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* ==================================================
                PROPERTY — SOMENTE VISITA
            ================================================== */}

            {isVisitEvent && (
              <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50">
                <div className="p-5 sm:p-6">
                  <SectionTitle
                    icon={<Building2 size={18} />}
                    title="Imóvel visitado"
                  />

                  <p className="mt-1 text-xs text-slate-500">
                    Imóvel relacionado ao atendimento presencial.
                  </p>
                </div>

                <div className="border-t border-slate-800">
                  <div className="flex flex-col sm:flex-row">
                    <div className="h-64 w-full shrink-0 bg-slate-950 sm:h-auto sm:w-64">
                      {propertyImage ? (
                        <img
                          src={propertyImage}
                          alt={visit.property?.name || 'Imóvel'}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full min-h-64 items-center justify-center text-slate-700">
                          <Building2 size={48} />
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {visit.property?.name || 'Imóvel não informado'}
                          </h3>

                          {visit.property?.code && (
                            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                              Código {visit.property.code}
                            </p>
                          )}
                        </div>

                        {formatCurrency(visit.property?.price) && (
                          <span className="text-lg font-bold text-emerald-400">
                            {formatCurrency(visit.property?.price)}
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {visit.property?.type && (
                          <PropertyMeta
                            icon={<Home size={14} />}
                            value={visit.property.type}
                          />
                        )}

                        {visit.property?.category && (
                          <PropertyMeta
                            icon={<Tag size={14} />}
                            value={visit.property.category}
                          />
                        )}

                        {visit.property?.bedrooms > 0 && (
                          <PropertyMeta
                            icon={<BedDouble size={14} />}
                            value={`${visit.property.bedrooms} quartos`}
                          />
                        )}

                        {visit.property?.bathrooms > 0 && (
                          <PropertyMeta
                            icon={<Bath size={14} />}
                            value={`${visit.property.bathrooms} banheiros`}
                          />
                        )}

                        {visit.property?.parkingSpaces > 0 && (
                          <PropertyMeta
                            icon={<Car size={14} />}
                            value={`${visit.property.parkingSpaces} vagas`}
                          />
                        )}
                      </div>

                      {propertyAddress && (
                        <div className="mt-5 flex items-start gap-2 text-sm leading-6 text-slate-400">
                          <MapPin
                            size={16}
                            className="mt-1 shrink-0 text-slate-500"
                          />

                          <span>{propertyAddress}</span>
                        </div>
                      )}

                      {visit.property?._id && (
                        <div className="mt-auto pt-6">
                          <button
                            onClick={() =>
                              navigate(`/properties/${visit.property._id}`)
                            }
                            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 transition hover:text-blue-300"
                          >
                            Abrir detalhes do imóvel
                            <ChevronRight size={15} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* ==================================================
                NON-VISIT CONTEXT
            ================================================== */}

            {!isVisitEvent && (
              <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6">
                <SectionTitle
                  icon={<EventIcon size={18} />}
                  title={`Sobre esta ${eventConfig.label.toLowerCase()}`}
                />

                <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl border ${eventConfig.border} ${eventConfig.bg} ${eventConfig.text}`}
                  >
                    <EventIcon size={22} />
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-white">
                    {visit.title || eventConfig.label}
                  </h3>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                    {eventConfig.description}. Este compromisso está relacionado
                    ao Lead e ao responsável selecionado.
                  </p>
                </div>
              </section>
            )}
          </main>

          {/* ====================================================
              RIGHT
          ==================================================== */}

          <aside className="space-y-6">
            {/* ==================================================
                RESPONSIBLE
            ================================================== */}

            <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5">
              <SectionTitle icon={<User size={18} />} title="Responsável" />

              <div className="mt-5 flex items-center gap-4">
                {visit.broker?.avatar ? (
                  <img
                    src={visit.broker.avatar}
                    alt={visit.broker.name || 'Corretor'}
                    className="h-14 w-14 rounded-2xl object-cover ring-2 ring-slate-800"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10 text-violet-400">
                    <User size={24} />
                  </div>
                )}

                <div className="min-w-0">
                  <h3 className="truncate font-bold text-white">
                    {visit.broker?.name || 'Corretor não informado'}
                  </h3>

                  {visit.broker?.email && (
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {visit.broker.email}
                    </p>
                  )}
                </div>
              </div>

              {visit.broker?.phone && (
                <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-sm text-slate-400">
                  <Phone size={15} className="text-slate-500" />

                  {visit.broker.phone}
                </div>
              )}
            </section>

            {/* ==================================================
                STATUS
            ================================================== */}

            <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5">
              <SectionTitle
                icon={<CircleCheck size={18} />}
                title="Status e ações"
              />

              <div className="mt-5">
                <div
                  className={`flex items-center gap-3 rounded-2xl border ${statusConfig.className} p-4`}
                >
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${statusConfig.dot}`}
                  />

                  <div>
                    <p className="text-sm font-bold">{statusConfig.label}</p>

                    <p className="mt-0.5 text-xs opacity-70">
                      {getEventConfig(visit).label}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {visit.status === 'agendada' && (
                  <ActionButton
                    icon={<CheckCircle2 size={17} />}
                    label={`Confirmar ${isVisitEvent ? 'visita' : 'compromisso'}`}
                    onClick={handleConfirm}
                    loading={actionLoading}
                    variant="success"
                  />
                )}

                {visit.status === 'confirmada' && (
                  <ActionButton
                    icon={<CircleCheck size={17} />}
                    label={`Concluir ${isVisitEvent ? 'visita' : 'compromisso'}`}
                    onClick={handleComplete}
                    loading={actionLoading}
                    variant="primary"
                  />
                )}

                {visit.status !== 'concluida' &&
                  visit.status !== 'cancelada' && (
                    <ActionButton
                      icon={<XCircle size={17} />}
                      label={`Cancelar ${isVisitEvent ? 'visita' : 'compromisso'}`}
                      onClick={handleCancelVisit}
                      loading={actionLoading}
                      variant="danger"
                    />
                  )}
              </div>

              {visit.status === 'concluida' && (
                <CompletionState
                  type="success"
                  title={
                    isVisitEvent ? 'Visita concluída' : 'Compromisso concluído'
                  }
                  date={visit.finishedAt}
                />
              )}

              {visit.status === 'cancelada' && (
                <CompletionState
                  type="danger"
                  title={
                    isVisitEvent ? 'Visita cancelada' : 'Compromisso cancelado'
                  }
                  date={visit.cancelledAt}
                />
              )}
            </section>

            {/* ==================================================
                DATE CARD
            ================================================== */}

            <section
              className={`overflow-hidden rounded-3xl border ${eventConfig.border} bg-gradient-to-br ${eventConfig.gradient} bg-slate-900/50`}
            >
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border ${eventConfig.border} ${eventConfig.bg} ${eventConfig.text}`}
                  >
                    <EventIcon size={19} />
                  </div>

                  <span className={`text-xs font-bold ${eventConfig.text}`}>
                    {eventConfig.shortLabel}
                  </span>
                </div>

                <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Data programada
                </p>

                <p className="mt-1 text-xl font-bold text-white">
                  {formatShortDate(visit.date)}
                </p>

                <div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
                  <Clock size={15} />

                  <span>{formatTime(visit.date)}</span>

                  {duration && (
                    <>
                      <span className="text-slate-700">•</span>

                      <span>{formatDuration(duration)}</span>
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* ==================================================
                TIMELINE
            ================================================== */}

            <section className="rounded-3xl border border-slate-800 bg-slate-900/50 p-5">
              <SectionTitle icon={<Clock size={18} />} title="Linha do tempo" />

              <div className="mt-6">
                <TimelineItem
                  title={`${getEventConfig(visit).label} criada`}
                  date={visit.createdAt}
                  active
                  color={eventConfig.text}
                />

                {visit.confirmedAt && (
                  <TimelineItem
                    title={`${getEventConfig(visit).label} confirmada`}
                    date={visit.confirmedAt}
                    active
                    color="text-emerald-400"
                  />
                )}

                {visit.checkedInAt && (
                  <TimelineItem
                    title="Check-in realizado"
                    date={visit.checkedInAt}
                    active
                    color="text-cyan-400"
                  />
                )}

                {visit.finishedAt && (
                  <TimelineItem
                    title={`${getEventConfig(visit).label} finalizado`}
                    date={visit.finishedAt}
                    active
                    color="text-violet-400"
                  />
                )}

                {visit.cancelledAt && (
                  <TimelineItem
                    title={`${getEventConfig(visit).label} cancelado`}
                    date={visit.cancelledAt}
                    active
                    color="text-red-400"
                  />
                )}

                {visit.updatedAt && visit.updatedAt !== visit.createdAt && (
                  <TimelineItem
                    title="Última atualização"
                    date={visit.updatedAt}
                    active
                    color="text-slate-400"
                    last
                  />
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   UI COMPONENTS
============================================================ */

function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-blue-400">{icon}</div>

      <h2 className="font-bold tracking-tight text-white">{title}</h2>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${config.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />

      {config.label}
    </span>
  );
}

function HeroMeta({ icon, value }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs font-medium text-slate-400">
      {icon}

      <span>{value}</span>
    </span>
  );
}

function OverviewCard({ icon, label, value, accent }) {
  return (
    <div className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-4 transition hover:border-slate-700">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 ${accent}`}
        >
          {icon}
        </div>

        <div className="h-1.5 w-1.5 rounded-full bg-slate-700 transition group-hover:bg-slate-500" />
      </div>

      <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function ContextCard({ icon, label, value, subtitle, tone, onClick }) {
  const tones = {
    blue: {
      box: 'border-blue-500/20 bg-blue-500/5',
      icon: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
    },

    emerald: {
      box: 'border-emerald-500/20 bg-emerald-500/5',
      icon: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    },

    violet: {
      box: 'border-violet-500/20 bg-violet-500/5',
      icon: 'border-violet-500/20 bg-violet-500/10 text-violet-400',
    },
  };

  const theme = tones[tone] || tones.blue;

  const content = (
    <>
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-xl border ${theme.icon}`}
      >
        {icon}
      </div>

      <div className="mt-4 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-bold text-white">{value}</p>

        {subtitle && (
          <p className="mt-1 truncate text-xs text-slate-500">{subtitle}</p>
        )}
      </div>

      {onClick && (
        <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-slate-500 transition group-hover:text-white">
          Abrir detalhes
          <ChevronRight size={13} />
        </div>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`group w-full rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:border-slate-700 ${theme.box}`}
      >
        {content}
      </button>
    );
  }

  return <div className={`rounded-2xl border p-4 ${theme.box}`}>{content}</div>;
}

function ContextConnector() {
  return (
    <div className="hidden items-center justify-center md:flex">
      <div className="h-px w-8 bg-slate-800" />
      <ChevronRight size={14} className="text-slate-700" />
    </div>
  );
}

function DetailTile({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-slate-500">{icon}</div>

        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
            {label}
          </p>

          <p className="mt-1 text-sm leading-6 text-slate-200">{value}</p>
        </div>
      </div>
    </div>
  );
}

function PropertyMeta({ icon, value }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-1.5 text-xs font-medium text-slate-400">
      {icon}
      {value}
    </span>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>

      <input
        type={type}
        value={value || ''}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>

      <select
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({ label, value, onChange, placeholder = '' }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>

      <textarea
        value={value || ''}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-700 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5"
      />
    </label>
  );
}

function ActionButton({ icon, label, onClick, loading, variant = 'primary' }) {
  const variants = {
    primary:
      'border-blue-500/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20',

    success:
      'border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20',

    danger: 'border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20',
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]}`}
    >
      {loading ? <Loader2 size={17} className="animate-spin" /> : icon}

      {label}
    </button>
  );
}

function CompletionState({ type, title, date }) {
  const isSuccess = type === 'success';

  return (
    <div
      className={`mt-4 rounded-2xl border p-4 text-center ${
        isSuccess
          ? 'border-violet-500/20 bg-violet-500/5'
          : 'border-red-500/20 bg-red-500/5'
      }`}
    >
      {isSuccess ? (
        <CircleCheck size={25} className="mx-auto mb-2 text-violet-400" />
      ) : (
        <XCircle size={25} className="mx-auto mb-2 text-red-400" />
      )}

      <p
        className={`text-sm font-bold ${
          isSuccess ? 'text-violet-300' : 'text-red-300'
        }`}
      >
        {title}
      </p>

      {date && (
        <p className="mt-1 text-xs text-slate-500">{formatDateTime(date)}</p>
      )}
    </div>
  );
}

function TimelineItem({
  title,
  date,
  active = false,
  color = 'text-blue-400',
  last = false,
}) {
  return (
    <div className="flex gap-3">
      <div className="relative flex w-3 shrink-0 flex-col items-center">
        <div
          className={`mt-1 h-2.5 w-2.5 rounded-full ${
            active ? `bg-current ${color}` : 'bg-slate-700'
          }`}
        />

        {!last && <div className="mt-1 min-h-8 w-px flex-1 bg-slate-800" />}
      </div>

      <div className="pb-4">
        <p className="text-sm font-semibold text-slate-200">{title}</p>

        <p className="mt-1 text-xs text-slate-500">
          {date
            ? new Date(date).toLocaleString('pt-BR', {
                dateStyle: 'short',
                timeStyle: 'short',
              })
            : '-'}
        </p>
      </div>
    </div>
  );
}

function AlertBox({ type, message }) {
  const success = type === 'success';

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-4 text-sm ${
        success
          ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300'
          : 'border-red-500/20 bg-red-500/5 text-red-300'
      }`}
    >
      {success ? (
        <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
      ) : (
        <AlertCircle size={18} className="mt-0.5 shrink-0" />
      )}

      <span>{message}</span>
    </div>
  );
}

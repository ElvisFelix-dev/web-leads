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
} from 'lucide-react';

import {
  getVisitById,
  updateVisit,
  deleteVisit,
  confirmVisit,
  completeVisit,
  cancelVisit,
} from '../service/visitApi';

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
  });

  // ============================================================
  // LOAD
  // ============================================================

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
      });
    } catch (err) {
      console.error('Erro ao carregar visita:', err);

      setError(
        err?.response?.data?.message ||
          'Não foi possível carregar os dados da visita.',
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // HELPERS
  // ============================================================

  const formatDate = (date) => {
    if (!date) return '-';

    return new Date(date).toLocaleDateString('pt-BR', {
      dateStyle: 'full',
    });
  };

  const formatTime = (date) => {
    if (!date) return '-';

    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateTime = (date) => {
    if (!date) return '-';

    return new Date(date).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };

  const formatDateTimeForInput = (date) => {
    if (!date) return '';

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) return '';

    const offset = parsed.getTimezoneOffset();

    const localDate = new Date(parsed.getTime() - offset * 60 * 1000);

    return localDate.toISOString().slice(0, 16);
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const number = Number(value);

    if (Number.isNaN(number)) return null;

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(number);
  };

  const getStatusLabel = (status) => {
    const labels = {
      agendada: 'Agendada',
      confirmada: 'Confirmada',
      concluida: 'Concluída',
      cancelada: 'Cancelada',
    };

    return labels[status] || status || 'Desconhecido';
  };

  const getStatusClasses = (status) => {
    const classes = {
      agendada: 'bg-blue-500/10 text-blue-400 border-blue-500/20',

      confirmada: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',

      concluida: 'bg-violet-500/10 text-violet-400 border-violet-500/20',

      cancelada: 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    return (
      classes[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    );
  };

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
    if (!visit?.property) return '';

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

  // ============================================================
  // FORM
  // ============================================================

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
      });

      setEditing(false);
      setSuccess('Visita atualizada com sucesso.');

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Erro ao atualizar visita:', err);

      setError(
        err?.response?.data?.message || 'Não foi possível atualizar a visita.',
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
    });
  };

  // ============================================================
  // ACTIONS
  // ============================================================

  const handleConfirm = async () => {
    try {
      setActionLoading(true);
      setError('');

      const result = await confirmVisit(id);

      const updated = result?.data || result;

      setVisit(updated);

      setSuccess('Visita confirmada com sucesso.');

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Erro ao confirmar visita:', err);

      setError(
        err?.response?.data?.message || 'Não foi possível confirmar a visita.',
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

      setSuccess('Visita concluída com sucesso.');

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Erro ao concluir visita:', err);

      setError(
        err?.response?.data?.message || 'Não foi possível concluir a visita.',
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

      setSuccess('Visita cancelada com sucesso.');

      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Erro ao cancelar visita:', err);

      setError(
        err?.response?.data?.message || 'Não foi possível cancelar a visita.',
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Tem certeza que deseja excluir esta visita? Esta ação não poderá ser desfeita.',
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError('');

      await deleteVisit(id);

      navigate('/visits');
    } catch (err) {
      console.error('Erro ao excluir visita:', err);

      setError(
        err?.response?.data?.message || 'Não foi possível excluir a visita.',
      );

      setActionLoading(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 size={32} className="animate-spin text-blue-400" />

          <span>Carregando visita...</span>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (!visit) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <AlertCircle size={40} className="mx-auto mb-4 text-red-400" />

          <h2 className="text-lg font-semibold text-white">
            Visita não encontrada
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            {error || 'Não foi possível encontrar esta visita.'}
          </p>

          <button
            onClick={() => navigate('/visits')}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            <ArrowLeft size={16} />
            Voltar para visitas
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-white sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <button
              onClick={() => navigate(-1)}
              className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition hover:border-slate-700 hover:text-white"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Detalhes da visita
                </h1>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                    visit.status,
                  )}`}
                >
                  {getStatusLabel(visit.status)}
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-400">
                Acompanhe o Lead, imóvel, corretor e andamento da visita.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                <Pencil size={16} />
                Editar
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white disabled:opacity-50"
                >
                  <X size={16} />
                  Cancelar
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
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
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
            >
              <Trash2 size={16} />
              Excluir
            </button>
          </div>
        </div>

        {/* ======================================================
            ALERTS
        ====================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />

            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-emerald-300">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />

            <span>{success}</span>
          </div>
        )}

        {/* ======================================================
            FLOW
        ====================================================== */}

        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <ClipboardList size={19} className="text-blue-400" />

              <h2 className="font-semibold text-white">Fluxo da visita</h2>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Relação entre o Lead, imóvel e corretor responsável.
            </p>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] lg:items-center">
            {/* LEAD */}

            <FlowCard
              icon={<UserRound size={20} />}
              title="Lead"
              value={visit.lead?.name || 'Lead não informado'}
              subtitle={visit.lead?.phone || visit.lead?.email || 'Sem contato'}
              color="blue"
            />

            <FlowArrow />

            {/* PROPERTY */}

            <FlowCard
              icon={<Building2 size={20} />}
              title="Imóvel"
              value={visit.property?.name || 'Imóvel não informado'}
              subtitle={
                visit.property?.code
                  ? `Código ${visit.property.code}`
                  : visit.property?.type || 'Imóvel'
              }
              color="emerald"
            />

            <FlowArrow />

            {/* BROKER */}

            <FlowCard
              icon={<User size={20} />}
              title="Corretor"
              value={visit.broker?.name || 'Corretor não informado'}
              subtitle={
                visit.broker?.email || visit.broker?.phone || 'Sem contato'
              }
              color="violet"
            />

            <FlowArrow />

            {/* VISIT */}

            <FlowCard
              icon={<CalendarDays size={20} />}
              title="Visita"
              value={formatDate(visit.date)}
              subtitle={`${formatTime(visit.date)} • ${getStatusLabel(
                visit.status,
              )}`}
              color="amber"
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

          <div className="space-y-6">
            {/* ==================================================
                VISIT DATA
            ================================================== */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6">
              <SectionTitle
                icon={<CalendarDays size={18} />}
                title="Informações da visita"
              />

              {editing ? (
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
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
                      label="Endereço da visita"
                      value={form.address}
                      onChange={(value) => handleChange('address', value)}
                      placeholder="Endereço da visita"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <TextAreaField
                      label="Observações"
                      value={form.notes}
                      onChange={(value) => handleChange('notes', value)}
                      placeholder="Observações sobre a visita..."
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <InfoItem
                    icon={<CalendarDays size={17} />}
                    label="Data"
                    value={formatDate(visit.date)}
                  />

                  <InfoItem
                    icon={<Clock size={17} />}
                    label="Horário"
                    value={formatTime(visit.date)}
                  />

                  <InfoItem
                    icon={<MapPin size={17} />}
                    label="Endereço da visita"
                    value={
                      visit.address ||
                      propertyAddress ||
                      'Endereço não informado'
                    }
                    full
                  />

                  <InfoItem
                    icon={<ClipboardList size={17} />}
                    label="Observações"
                    value={visit.notes || 'Nenhuma observação registrada.'}
                    full
                  />
                </div>
              )}
            </section>

            {/* ==================================================
                LEAD
            ================================================== */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 sm:p-6">
              <SectionTitle icon={<UserRound size={18} />} title="Lead" />

              <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                  <UserRound size={25} />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-white">
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
                    className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    Ver Lead
                    <ExternalLink size={14} />
                  </button>
                )}
              </div>
            </section>

            {/* ==================================================
                PROPERTY
            ================================================== */}

            <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50">
              <div className="p-5 sm:p-6">
                <SectionTitle
                  icon={<Building2 size={18} />}
                  title="Imóvel visitado"
                />
              </div>

              <div className="border-t border-slate-800">
                <div className="flex flex-col sm:flex-row">
                  <div className="h-56 w-full shrink-0 bg-slate-950 sm:h-auto sm:w-60">
                    {propertyImage ? (
                      <img
                        src={propertyImage}
                        alt={visit.property?.name || 'Imóvel'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full min-h-56 items-center justify-center text-slate-700">
                        <Building2 size={46} />
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-semibold text-white">
                          {visit.property?.name || 'Imóvel não informado'}
                        </h3>

                        {visit.property?.code && (
                          <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">
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
                      <div className="mt-5 flex items-start gap-2 text-sm text-slate-400">
                        <MapPin
                          size={16}
                          className="mt-0.5 shrink-0 text-slate-500"
                        />

                        <span>{propertyAddress}</span>
                      </div>
                    )}

                    {visit.property?._id && (
                      <div className="mt-auto pt-5">
                        <button
                          onClick={() =>
                            navigate(`/properties/${visit.property._id}`)
                          }
                          className="inline-flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300"
                        >
                          Ver imóvel
                          <ExternalLink size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* ====================================================
              RIGHT
          ==================================================== */}

          <aside className="space-y-6">
            {/* ==================================================
                BROKER
            ================================================== */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
              <SectionTitle
                icon={<User size={18} />}
                title="Corretor responsável"
              />

              <div className="mt-5 flex items-center gap-4">
                {visit.broker?.avatar ? (
                  <img
                    src={visit.broker.avatar}
                    alt={visit.broker.name}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-500/10 text-violet-400">
                    <User size={24} />
                  </div>
                )}

                <div className="min-w-0">
                  <h3 className="truncate font-semibold text-white">
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
                <div className="mt-5 flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-sm text-slate-400">
                  <Phone size={15} />
                  {visit.broker.phone}
                </div>
              )}
            </section>

            {/* ==================================================
                STATUS / ACTIONS
            ================================================== */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
              <SectionTitle
                icon={<CircleCheck size={18} />}
                title="Ações da visita"
              />

              <div className="mt-5 space-y-2">
                {visit.status === 'agendada' && (
                  <ActionButton
                    icon={<CheckCircle2 size={17} />}
                    label="Confirmar visita"
                    onClick={handleConfirm}
                    loading={actionLoading}
                    variant="success"
                  />
                )}

                {visit.status === 'confirmada' && (
                  <ActionButton
                    icon={<CircleCheck size={17} />}
                    label="Concluir visita"
                    onClick={handleComplete}
                    loading={actionLoading}
                    variant="primary"
                  />
                )}

                {visit.status !== 'concluida' &&
                  visit.status !== 'cancelada' && (
                    <ActionButton
                      icon={<XCircle size={17} />}
                      label="Cancelar visita"
                      onClick={handleCancelVisit}
                      loading={actionLoading}
                      variant="danger"
                    />
                  )}

                {visit.status === 'concluida' && (
                  <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 text-center">
                    <CircleCheck
                      size={25}
                      className="mx-auto mb-2 text-violet-400"
                    />

                    <p className="text-sm font-medium text-violet-300">
                      Visita concluída
                    </p>

                    {visit.finishedAt && (
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDateTime(visit.finishedAt)}
                      </p>
                    )}
                  </div>
                )}

                {visit.status === 'cancelada' && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-center">
                    <XCircle size={25} className="mx-auto mb-2 text-red-400" />

                    <p className="text-sm font-medium text-red-300">
                      Visita cancelada
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* ==================================================
                TIMELINE
            ================================================== */}

            <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
              <SectionTitle icon={<Clock size={18} />} title="Linha do tempo" />

              <div className="mt-5 space-y-5">
                <TimelineItem
                  title="Visita criada"
                  date={visit.createdAt}
                  active
                />

                {visit.confirmedAt && (
                  <TimelineItem
                    title="Visita confirmada"
                    date={visit.confirmedAt}
                    active
                  />
                )}

                {visit.checkedInAt && (
                  <TimelineItem
                    title="Check-in realizado"
                    date={visit.checkedInAt}
                    active
                  />
                )}

                {visit.finishedAt && (
                  <TimelineItem
                    title="Visita finalizada"
                    date={visit.finishedAt}
                    active
                  />
                )}

                {visit.updatedAt && visit.updatedAt !== visit.createdAt && (
                  <TimelineItem
                    title="Última atualização"
                    date={visit.updatedAt}
                    active
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

// ============================================================
// COMPONENTS
// ============================================================

function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-2">
      <div className="text-blue-400">{icon}</div>

      <h2 className="font-semibold text-white">{title}</h2>
    </div>
  );
}

function FlowCard({ icon, title, value, subtitle, color }) {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  return (
    <div className={`min-w-0 rounded-2xl border p-4 ${colors[color]}`}>
      <div className="flex items-center gap-3">
        <div className="shrink-0">{icon}</div>

        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider opacity-70">
            {title}
          </p>

          <p className="mt-1 truncate text-sm font-semibold text-white">
            {value}
          </p>

          {subtitle && (
            <p className="mt-0.5 truncate text-xs opacity-70">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="hidden justify-center text-slate-700 lg:flex">
      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-800 bg-slate-950">
        →
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value, full = false }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-slate-500">{icon}</div>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
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
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/50 px-2.5 py-1.5 text-xs text-slate-400">
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
      <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </span>

      <input
        type={type}
        value={value || ''}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </span>

      <select
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
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
      <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </span>

      <textarea
        value={value || ''}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500"
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
      className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]}`}
    >
      {loading ? <Loader2 size={17} className="animate-spin" /> : icon}

      {label}
    </button>
  );
}

function TimelineItem({ title, date, active = false }) {
  return (
    <div className="flex gap-3">
      <div className="relative flex flex-col items-center">
        <div
          className={`mt-1 h-2.5 w-2.5 rounded-full ${
            active ? 'bg-blue-400' : 'bg-slate-700'
          }`}
        />

        <div className="mt-1 w-px flex-1 bg-slate-800" />
      </div>

      <div className="pb-1">
        <p className="text-sm font-medium text-slate-200">{title}</p>

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

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Edit3,
  Flame,
  History,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Target,
  User,
  UserCheck,
  UserPlus,
  Users,
  X,
  Zap,
  CircleDollarSign,
  ClipboardList,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  Plus,
} from 'lucide-react';

import { useNavigate, useParams } from 'react-router-dom';

import {
  getOpportunityById,
  updateOpportunityStage,
  addOpportunityInteraction,
} from '../service/opportunityService';

/**
 * =========================================================
 * CONSTANTS
 * =========================================================
 */

const STAGES = [
  {
    value: 'nova',
    label: 'Nova',
  },
  {
    value: 'qualificacao',
    label: 'Qualificação',
  },
  {
    value: 'imovel_definido',
    label: 'Imóvel definido',
  },
  {
    value: 'visita_realizada',
    label: 'Visita realizada',
  },
  {
    value: 'interesse_confirmado',
    label: 'Interesse confirmado',
  },
  {
    value: 'proposta_solicitada',
    label: 'Proposta solicitada',
  },
  {
    value: 'proposta_enviada',
    label: 'Proposta enviada',
  },
  {
    value: 'negociacao',
    label: 'Negociação',
  },
  {
    value: 'ganha',
    label: 'Ganha',
  },
  {
    value: 'perdida',
    label: 'Perdida',
  },
];

const STATUS_CONFIG = {
  aberta: {
    label: 'Aberta',
    className: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
    icon: Clock3,
  },

  ganha: {
    label: 'Ganha',
    className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
    icon: CheckCircle2,
  },

  perdida: {
    label: 'Perdida',
    className: 'border-red-500/20 bg-red-500/10 text-red-400',
    icon: XCircle,
  },
};

const TEMPERATURE_CONFIG = {
  quente: {
    label: 'Quente',
    icon: '🔥',
    className: 'border-red-500/20 bg-red-500/10 text-red-300',
  },

  morno: {
    label: 'Morno',
    icon: '🟡',
    className: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-300',
  },

  frio: {
    label: 'Frio',
    icon: '🔵',
    className: 'border-blue-500/20 bg-blue-500/10 text-blue-300',
  },
};

const INTERACTION_TYPES = [
  {
    value: 'ligacao',
    label: 'Ligação',
    icon: Phone,
  },
  {
    value: 'whatsapp',
    label: 'WhatsApp',
    icon: MessageSquare,
  },
  {
    value: 'email',
    label: 'E-mail',
    icon: Mail,
  },
  {
    value: 'visita',
    label: 'Visita',
    icon: Building2,
  },
  {
    value: 'observacao',
    label: 'Observação',
    icon: ClipboardList,
  },
];

/**
 * =========================================================
 * PAGE
 * =========================================================
 */

export default function OpportunityDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [opportunity, setOpportunity] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState('');

  const [showStageModal, setShowStageModal] = useState(false);
  const [showInteractionModal, setShowInteractionModal] = useState(false);

  const [selectedStage, setSelectedStage] = useState('');
  const [stageNote, setStageNote] = useState('');
  const [lostReason, setLostReason] = useState('');

  const [interactionType, setInteractionType] = useState('ligacao');
  const [interactionDescription, setInteractionDescription] = useState('');

  const [savingStage, setSavingStage] = useState(false);
  const [savingInteraction, setSavingInteraction] = useState(false);

  /**
   * =======================================================
   * FETCH
   * =======================================================
   */

  const fetchOpportunity = useCallback(
    async (silent = false) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError('');

        const response = await getOpportunityById(id);

        const data = response?.data || response?.opportunity || response;

        setOpportunity(data || null);

        if (data?.stage) {
          setSelectedStage(data.stage);
        }
      } catch (err) {
        console.error('Erro ao buscar oportunidade:', err);

        setError(
          err?.response?.data?.message ||
            'Não foi possível carregar a oportunidade.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id],
  );

  useEffect(() => {
    if (id) {
      fetchOpportunity();
    }
  }, [id, fetchOpportunity]);

  /**
   * =======================================================
   * DERIVED
   * =======================================================
   */

  const value = useMemo(() => {
    if (!opportunity) return 0;

    return Number(
      opportunity.expectedClosingValue || opportunity.estimatedValue || 0,
    );
  }, [opportunity]);

  const probability = Number(opportunity?.probability || 0);

  const weightedValue = Number(
    opportunity?.weightedValue || (value * probability) / 100,
  );

  const statusConfig =
    STATUS_CONFIG[opportunity?.status] || STATUS_CONFIG.aberta;

  const temperatureConfig =
    TEMPERATURE_CONFIG[opportunity?.temperature] || TEMPERATURE_CONFIG.morno;

  const currentStageIndex = STAGES.findIndex(
    (stage) => stage.value === opportunity?.stage,
  );

  /**
   * =======================================================
   * ACTIONS
   * =======================================================
   */

  const handleBack = () => {
    navigate('/opportunities');
  };

  const handleRefresh = () => {
    fetchOpportunity(true);
  };

  const handleOpenStageModal = () => {
    setSelectedStage(opportunity?.stage || '');
    setStageNote('');
    setLostReason('');
    setShowStageModal(true);
  };

  const handleUpdateStage = async () => {
    if (!selectedStage || !opportunity?._id) {
      return;
    }

    try {
      setSavingStage(true);

      const response = await updateOpportunityStage(opportunity._id, {
        stage: selectedStage,
        note: stageNote,
        lostReason,
      });

      const updated = response?.data || response?.opportunity || response;

      if (updated) {
        setOpportunity(updated);
      } else {
        await fetchOpportunity(true);
      }

      setShowStageModal(false);
    } catch (err) {
      console.error('Erro ao atualizar estágio:', err);

      setError(
        err?.response?.data?.message || 'Não foi possível atualizar o estágio.',
      );
    } finally {
      setSavingStage(false);
    }
  };

  const handleOpenInteractionModal = () => {
    setInteractionType('ligacao');
    setInteractionDescription('');
    setShowInteractionModal(true);
  };

  const handleAddInteraction = async () => {
    if (!interactionDescription.trim()) {
      return;
    }

    try {
      setSavingInteraction(true);

      const response = await addOpportunityInteraction(opportunity._id, {
        type: interactionType,
        description: interactionDescription.trim(),
      });

      const updated = response?.data || response?.opportunity || response;

      if (updated) {
        setOpportunity(updated);
      } else {
        await fetchOpportunity(true);
      }

      setShowInteractionModal(false);
      setInteractionDescription('');
    } catch (err) {
      console.error('Erro ao registrar interação:', err);

      setError(
        err?.response?.data?.message ||
          'Não foi possível registrar a interação.',
      );
    } finally {
      setSavingInteraction(false);
    }
  };

  /**
   * =======================================================
   * LOADING
   * =======================================================
   */

  if (loading) {
    return <LoadingState />;
  }

  /**
   * =======================================================
   * ERROR
   * =======================================================
   */

  if (error && !opportunity) {
    return (
      <div className="min-h-screen bg-gray-950 px-4 py-10 text-white">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={handleBack}
            className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para oportunidades
          </button>

          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-red-400" />

            <h1 className="mt-4 text-xl font-bold">
              Não foi possível carregar
            </h1>

            <p className="mt-2 text-sm text-gray-500">{error}</p>

            <button
              type="button"
              onClick={() => fetchOpportunity()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400"
            >
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return null;
  }

  /**
   * =======================================================
   * RENDER
   * =======================================================
   */

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ================================================= */}
        {/* TOP NAV */}
        {/* ================================================= */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-gray-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Oportunidades
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-gray-900 text-gray-400 transition hover:bg-gray-800 hover:text-white disabled:opacity-50"
              title="Atualizar"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
              />
            </button>

            <button
              type="button"
              onClick={() => navigate(`/opportunities/${opportunity._id}/edit`)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-gray-900 px-4 py-2.5 text-sm font-semibold text-gray-300 transition hover:bg-gray-800 hover:text-white"
            >
              <Edit3 className="h-4 w-4" />
              Editar
            </button>
          </div>
        </div>

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError('')}
              className="text-red-300 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ================================================= */}
        {/* HERO */}
        {/* ================================================= */}

        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-950">
          <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative p-6 sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${statusConfig.className}`}
                  >
                    <statusConfig.icon className="h-3.5 w-3.5" />

                    {statusConfig.label}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${temperatureConfig.className}`}
                  >
                    <span>{temperatureConfig.icon}</span>

                    {temperatureConfig.label}
                  </span>

                  {opportunity.priority && (
                    <PriorityBadge priority={opportunity.priority} />
                  )}
                </div>

                <h1 className="max-w-3xl text-2xl font-bold tracking-tight sm:text-3xl">
                  {opportunity.title || 'Sem título'}
                </h1>

                {opportunity.description && (
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-400">
                    {opportunity.description}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Criada em {formatDateTime(opportunity.createdAt)}
                  </span>

                  {opportunity.updatedAt && (
                    <span className="inline-flex items-center gap-1.5">
                      <RefreshCw className="h-3.5 w-3.5" />
                      Atualizada em {formatDateTime(opportunity.updatedAt)}
                    </span>
                  )}
                </div>
              </div>

              <div className="shrink-0">
                <button
                  type="button"
                  onClick={handleOpenStageModal}
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400"
                >
                  <Zap className="h-4 w-4" />
                  Alterar estágio
                </button>
              </div>
            </div>

            {/* ================================================= */}
            {/* STAGE PIPELINE */}
            {/* ================================================= */}

            <div className="mt-8 overflow-x-auto pb-2">
              <div className="flex min-w-[850px] items-center">
                {STAGES.map((stage, index) => {
                  const active = index === currentStageIndex;
                  const completed =
                    currentStageIndex >= 0 && index < currentStageIndex;

                  return (
                    <div key={stage.value} className="flex flex-1 items-center">
                      <div className="flex min-w-0 flex-col items-center">
                        <div
                          className={`
                            flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition
                            ${
                              active
                                ? 'border-indigo-400 bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                                : completed
                                  ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400'
                                  : 'border-white/10 bg-gray-950 text-gray-600'
                            }
                          `}
                        >
                          {completed ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            index + 1
                          )}
                        </div>

                        <span
                          className={`
                            mt-2 max-w-[90px] truncate text-center text-[10px]
                            ${
                              active
                                ? 'font-semibold text-indigo-300'
                                : completed
                                  ? 'text-gray-400'
                                  : 'text-gray-600'
                            }
                          `}
                        >
                          {stage.label}
                        </span>
                      </div>

                      {index < STAGES.length - 1 && (
                        <div
                          className={`
                            mx-1 h-px flex-1
                            ${completed ? 'bg-indigo-500/30' : 'bg-white/5'}
                          `}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ================================================= */}
        {/* KPI */}
        {/* ================================================= */}

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={<CircleDollarSign className="h-4 w-4" />}
            label="Valor esperado"
            value={formatCurrency(value)}
          />

          <MetricCard
            icon={<Target className="h-4 w-4" />}
            label="Probabilidade"
            value={`${probability}%`}
            progress={probability}
          />

          <MetricCard
            icon={<TrendingIcon />}
            label="Valor ponderado"
            value={formatCurrency(weightedValue)}
          />

          <MetricCard
            icon={<CalendarDays className="h-4 w-4" />}
            label="Fechamento previsto"
            value={
              opportunity.expectedClosingDate
                ? formatDate(opportunity.expectedClosingDate)
                : 'Não definido'
            }
          />
        </div>

        {/* ================================================= */}
        {/* MAIN GRID */}
        {/* ================================================= */}

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {/* ================================================= */}
          {/* LEFT */}
          {/* ================================================= */}

          <div className="space-y-5 lg:col-span-2">
            {/* LEAD */}

            <section className="rounded-2xl border border-white/10 bg-gray-900/70">
              <SectionHeader
                icon={<User className="h-4 w-4" />}
                title="Lead"
                action={
                  opportunity.lead?._id ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/leads/${opportunity.lead._id}`)}
                      className="text-xs font-medium text-indigo-400 transition hover:text-indigo-300"
                    >
                      Ver lead
                    </button>
                  ) : null
                }
              />

              <div className="p-5">
                {opportunity.lead ? (
                  <LeadCard lead={opportunity.lead} />
                ) : (
                  <EmptyInline
                    icon={<User className="h-5 w-5" />}
                    text="Nenhum lead vinculado."
                  />
                )}
              </div>
            </section>

            {/* PROPERTY */}

            <section className="rounded-2xl border border-white/10 bg-gray-900/70">
              <SectionHeader
                icon={<Building2 className="h-4 w-4" />}
                title="Imóvel"
                action={
                  opportunity.property?._id ? (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/properties/${opportunity.property._id}`)
                      }
                      className="text-xs font-medium text-indigo-400 transition hover:text-indigo-300"
                    >
                      Ver imóvel
                    </button>
                  ) : null
                }
              />

              <div className="p-5">
                {opportunity.property ? (
                  <PropertyCard property={opportunity.property} />
                ) : (
                  <EmptyInline
                    icon={<Building2 className="h-5 w-5" />}
                    text="Nenhum imóvel vinculado."
                  />
                )}
              </div>
            </section>

            {/* INTERACTIONS */}

            <section className="rounded-2xl border border-white/10 bg-gray-900/70">
              <SectionHeader
                icon={<MessageSquare className="h-4 w-4" />}
                title="Interações"
                subtitle={`${opportunity.interactions?.length || 0} registros`}
                action={
                  <button
                    type="button"
                    onClick={handleOpenInteractionModal}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-400 transition hover:bg-indigo-500/20"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Registrar
                  </button>
                }
              />

              <div className="p-5">
                <InteractionsList
                  interactions={opportunity.interactions || []}
                />
              </div>
            </section>

            {/* STAGE HISTORY */}

            <section className="rounded-2xl border border-white/10 bg-gray-900/70">
              <SectionHeader
                icon={<History className="h-4 w-4" />}
                title="Histórico do pipeline"
                subtitle={`${opportunity.stageHistory?.length || 0} alterações`}
              />

              <div className="p-5">
                <StageHistory history={opportunity.stageHistory || []} />
              </div>
            </section>

            {/* RESPONSIBLE HISTORY */}

            <section className="rounded-2xl border border-white/10 bg-gray-900/70">
              <SectionHeader
                icon={<Users className="h-4 w-4" />}
                title="Histórico de responsáveis"
                subtitle={`${opportunity.assignmentHistory?.length || 0} alterações`}
              />

              <div className="p-5">
                <AssignmentHistory
                  history={opportunity.assignmentHistory || []}
                  currentAssignedTo={opportunity.assignedTo}
                />
              </div>
            </section>
          </div>

          {/* ================================================= */}
          {/* RIGHT */}
          {/* ================================================= */}

          <div className="space-y-5">
            {/* RESPONSIBLE */}

            <section className="rounded-2xl border border-white/10 bg-gray-900/70">
              <SectionHeader
                icon={<UserCheck className="h-4 w-4" />}
                title="Responsável"
              />

              <div className="p-5">
                <ResponsibleCard assignedTo={opportunity.assignedTo} />

                {opportunity.createdBy && (
                  <div className="mt-5 border-t border-white/5 pt-5">
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                      Criada por
                    </p>

                    <UserMini user={opportunity.createdBy} />
                  </div>
                )}
              </div>
            </section>

            {/* NEXT ACTION */}

            <section className="rounded-2xl border border-indigo-500/10 bg-indigo-500/[0.03]">
              <SectionHeader
                icon={<Zap className="h-4 w-4 text-indigo-400" />}
                title="Próxima ação"
              />

              <div className="p-5">
                {opportunity.nextAction ? (
                  <>
                    <p className="text-sm font-semibold text-white">
                      {opportunity.nextAction}
                    </p>

                    {opportunity.nextActionAt && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-indigo-300">
                        <CalendarDays className="h-4 w-4" />

                        {formatDateTime(opportunity.nextActionAt)}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-600">
                    Nenhuma próxima ação definida.
                  </p>
                )}
              </div>
            </section>

            {/* COMMERCIAL INFO */}

            <section className="rounded-2xl border border-white/10 bg-gray-900/70">
              <SectionHeader
                icon={<CircleDollarSign className="h-4 w-4" />}
                title="Informações comerciais"
              />

              <div className="divide-y divide-white/5">
                <InfoRow
                  label="Tipo"
                  value={formatOpportunityType(opportunity.type)}
                />

                <InfoRow
                  label="Estágio"
                  value={formatStage(opportunity.stage)}
                />

                <InfoRow label="Status" value={statusConfig.label} />

                <InfoRow label="Temperatura" value={temperatureConfig.label} />

                <InfoRow
                  label="Prioridade"
                  value={formatPriority(opportunity.priority)}
                />

                <InfoRow
                  label="Valor estimado"
                  value={formatCurrency(opportunity.estimatedValue)}
                />

                <InfoRow
                  label="Valor esperado"
                  value={formatCurrency(opportunity.expectedClosingValue)}
                />

                <InfoRow label="Probabilidade" value={`${probability}%`} />
              </div>
            </section>

            {/* NOTES */}

            <section className="rounded-2xl border border-white/10 bg-gray-900/70">
              <SectionHeader
                icon={<ClipboardList className="h-4 w-4" />}
                title="Observações"
              />

              <div className="p-5">
                {opportunity.notes ? (
                  <p className="whitespace-pre-wrap text-sm leading-6 text-gray-400">
                    {opportunity.notes}
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">
                    Nenhuma observação registrada.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* =================================================== */}
      {/* STAGE MODAL */}
      {/* =================================================== */}

      {showStageModal && (
        <Modal
          title="Alterar estágio"
          subtitle="Atualize a posição desta oportunidade no pipeline."
          onClose={() => setShowStageModal(false)}
        >
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-400">
                Novo estágio
              </label>

              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="h-11 w-full rounded-xl border border-white/10 bg-gray-950 px-3 text-sm text-white outline-none focus:border-indigo-500/50"
              >
                {STAGES.map((stage) => (
                  <option key={stage.value} value={stage.value}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-gray-400">
                Observação
              </label>

              <textarea
                value={stageNote}
                onChange={(e) => setStageNote(e.target.value)}
                rows={4}
                placeholder="Descreva o motivo ou contexto da alteração..."
                className="w-full resize-none rounded-xl border border-white/10 bg-gray-950 px-3 py-3 text-sm text-white outline-none placeholder:text-gray-700 focus:border-indigo-500/50"
              />
            </div>

            {selectedStage === 'perdida' && (
              <div>
                <label className="mb-2 block text-xs font-medium text-gray-400">
                  Motivo da perda
                </label>

                <textarea
                  value={lostReason}
                  onChange={(e) => setLostReason(e.target.value)}
                  rows={3}
                  placeholder="Informe o motivo da perda..."
                  className="w-full resize-none rounded-xl border border-red-500/10 bg-gray-950 px-3 py-3 text-sm text-white outline-none placeholder:text-gray-700 focus:border-red-500/40"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 border-t border-white/5 pt-5">
              <button
                type="button"
                onClick={() => setShowStageModal(false)}
                className="rounded-xl border border-white/10 bg-gray-900 px-4 py-2.5 text-sm font-medium text-gray-400 transition hover:bg-gray-800 hover:text-white"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleUpdateStage}
                disabled={savingStage}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingStage ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                Salvar alteração
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* =================================================== */}
      {/* INTERACTION MODAL */}
      {/* =================================================== */}

      {showInteractionModal && (
        <Modal
          title="Registrar interação"
          subtitle="Registre uma atividade comercial realizada com o lead."
          onClose={() => setShowInteractionModal(false)}
        >
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-medium text-gray-400">
                Tipo de interação
              </label>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {INTERACTION_TYPES.map((item) => {
                  const Icon = item.icon;

                  const active = interactionType === item.value;

                  return (
                    <button
                      type="button"
                      key={item.value}
                      onClick={() => setInteractionType(item.value)}
                      className={`
                        flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition
                        ${
                          active
                            ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300'
                            : 'border-white/10 bg-gray-950 text-gray-500 hover:border-white/20 hover:text-gray-300'
                        }
                      `}
                    >
                      <Icon className="h-4 w-4" />

                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-gray-400">
                Descrição
              </label>

              <textarea
                value={interactionDescription}
                onChange={(e) => setInteractionDescription(e.target.value)}
                rows={5}
                placeholder="Ex.: Liguei para o cliente e conversamos sobre a negociação..."
                className="w-full resize-none rounded-xl border border-white/10 bg-gray-950 px-3 py-3 text-sm text-white outline-none placeholder:text-gray-700 focus:border-indigo-500/50"
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-white/5 pt-5">
              <button
                type="button"
                onClick={() => setShowInteractionModal(false)}
                className="rounded-xl border border-white/10 bg-gray-900 px-4 py-2.5 text-sm font-medium text-gray-400 transition hover:bg-gray-800 hover:text-white"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleAddInteraction}
                disabled={savingInteraction || !interactionDescription.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingInteraction ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Registrar interação
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/**
 * =========================================================
 * SECTION HEADER
 * =========================================================
 */

function SectionHeader({ icon, title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
          {icon}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white">{title}</h2>

          {subtitle && (
            <p className="mt-0.5 text-[10px] text-gray-600">{subtitle}</p>
          )}
        </div>
      </div>

      {action}
    </div>
  );
}

/**
 * =========================================================
 * METRIC CARD
 * =========================================================
 */

function MetricCard({ icon, label, value, progress }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gray-900/70 p-4">
      <div className="mb-3 flex items-center gap-2 text-gray-500">
        {icon}

        <span className="text-[10px] font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="text-lg font-bold text-white">{value}</p>

      {typeof progress === 'number' && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-800">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{
              width: `${Math.min(Math.max(progress, 0), 100)}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * =========================================================
 * LEAD CARD
 * =========================================================
 */

function LeadCard({ lead }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
        <User className="h-6 w-6" />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold text-white">
          {lead.name || 'Lead'}
        </h3>

        <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
          {lead.phone && (
            <span className="inline-flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />

              {lead.phone}
            </span>
          )}

          {lead.email && (
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />

              {lead.email}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * =========================================================
 * PROPERTY CARD
 * =========================================================
 */

function PropertyCard({ property }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      {property.images?.[0]?.url && (
        <img
          src={property.images[0].url}
          alt={property.name || property.title || 'Imóvel'}
          className="h-32 w-full rounded-xl object-cover sm:h-24 sm:w-32"
        />
      )}

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-semibold text-white">
          {property.name || property.title || 'Imóvel'}
        </h3>

        {property.code && (
          <p className="mt-1 text-xs text-gray-600">Código: {property.code}</p>
        )}

        {property.address && (
          <p className="mt-2 text-xs text-gray-500">
            {formatPropertyAddress(property.address)}
          </p>
        )}

        {property.price && (
          <p className="mt-3 text-sm font-semibold text-indigo-400">
            {formatCurrency(property.price)}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * =========================================================
 * RESPONSIBLE
 * =========================================================
 */

function ResponsibleCard({ assignedTo }) {
  if (!assignedTo) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-gray-950/50 p-4 text-center">
        <UserPlus className="mx-auto h-6 w-6 text-gray-600" />

        <p className="mt-2 text-sm text-gray-500">Sem responsável</p>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-indigo-500/10 bg-indigo-500/[0.03] p-3">
      <Avatar user={assignedTo} size="lg" />

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">
          {assignedTo.name || 'Corretor'}
        </p>

        {assignedTo.position && (
          <p className="mt-0.5 truncate text-xs text-gray-500">
            {assignedTo.position}
          </p>
        )}

        {assignedTo.email && (
          <p className="mt-1 truncate text-[11px] text-gray-600">
            {assignedTo.email}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * =========================================================
 * ASSIGNMENT HISTORY
 * =========================================================
 */

function AssignmentHistory({ history, currentAssignedTo }) {
  /**
   * Compatibilidade com diferentes formatos
   * de histórico.
   */

  if (!history?.length) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-gray-950/40 p-6 text-center">
        <Users className="mx-auto h-6 w-6 text-gray-700" />

        <p className="mt-2 text-sm text-gray-600">
          Nenhuma alteração de responsável registrada.
        </p>

        {currentAssignedTo && (
          <p className="mt-2 text-xs text-gray-700">
            Responsável atual:{' '}
            <span className="text-gray-500">{currentAssignedTo.name}</span>
          </p>
        )}
      </div>
    );
  }

  const orderedHistory = [...history].reverse();

  return (
    <div className="relative">
      <div className="absolute bottom-3 left-[15px] top-3 w-px bg-white/5" />

      <div className="space-y-5">
        {orderedHistory.map((item, index) => {
          const fromUser =
            item.from || item.previousAssignedTo || item.previousResponsible;

          const toUser =
            item.to ||
            item.assignedTo ||
            item.newAssignedTo ||
            item.responsible;

          const changedBy = item.changedBy || item.changedByUser || item.user;

          return (
            <div
              key={item._id || `${item.changedAt || index}-${index}`}
              className="relative pl-10"
            >
              <div className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full border border-indigo-500/20 bg-gray-950 text-indigo-400">
                <Users className="h-3.5 w-3.5" />
              </div>

              <div className="rounded-xl border border-white/5 bg-gray-950/40 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-300">
                      Responsável alterado
                    </p>

                    <p className="mt-1 text-[11px] text-gray-600">
                      {formatDateTime(item.changedAt || item.createdAt)}
                    </p>
                  </div>

                  {changedBy && (
                    <div className="flex items-center gap-2">
                      <Avatar user={changedBy} size="sm" />

                      <div>
                        <p className="text-[10px] text-gray-600">
                          Alterado por
                        </p>

                        <p className="text-xs font-medium text-gray-400">
                          {changedBy.name || 'Usuário'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <ResponsibleHistoryUser
                    user={fromUser}
                    fallback="Sem responsável"
                  />

                  <ArrowRight className="hidden h-4 w-4 shrink-0 text-gray-700 sm:block" />

                  <ResponsibleHistoryUser
                    user={toUser}
                    fallback="Sem responsável"
                    active
                  />
                </div>

                {item.note && (
                  <div className="mt-3 border-t border-white/5 pt-3">
                    <p className="text-xs leading-5 text-gray-500">
                      {item.note}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * =========================================================
 * RESPONSIBLE HISTORY USER
 * =========================================================
 */

function ResponsibleHistoryUser({ user, fallback, active = false }) {
  return (
    <div
      className={`
        flex min-w-0 flex-1 items-center gap-2 rounded-lg border px-3 py-2
        ${
          active
            ? 'border-indigo-500/10 bg-indigo-500/[0.03]'
            : 'border-white/5 bg-gray-950/50'
        }
      `}
    >
      <Avatar user={user} size="sm" />

      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-gray-300">
          {user?.name || fallback}
        </p>

        {user?.position && (
          <p className="truncate text-[10px] text-gray-600">{user.position}</p>
        )}
      </div>
    </div>
  );
}

/**
 * =========================================================
 * INTERACTIONS
 * =========================================================
 */

function InteractionsList({ interactions }) {
  if (!interactions.length) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-gray-950/40 p-6 text-center">
        <MessageSquare className="mx-auto h-6 w-6 text-gray-700" />

        <p className="mt-2 text-sm text-gray-600">
          Nenhuma interação registrada.
        </p>
      </div>
    );
  }

  const ordered = [...interactions].reverse();

  return (
    <div className="relative">
      <div className="absolute bottom-3 left-[15px] top-3 w-px bg-white/5" />

      <div className="space-y-5">
        {ordered.map((interaction, index) => {
          const type = INTERACTION_TYPES.find(
            (item) => item.value === interaction.type,
          );

          const Icon = type?.icon || MessageSquare;

          const createdBy = interaction.createdBy || interaction.user;

          return (
            <div
              key={
                interaction._id || `${interaction.createdAt || index}-${index}`
              }
              className="relative pl-10"
            >
              <div className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full border border-indigo-500/20 bg-gray-950 text-indigo-400">
                <Icon className="h-3.5 w-3.5" />
              </div>

              <div className="rounded-xl border border-white/5 bg-gray-950/40 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-300">
                      {type?.label || interaction.type || 'Interação'}
                    </p>

                    <p className="mt-1 text-[11px] text-gray-600">
                      {formatDateTime(interaction.createdAt)}
                    </p>
                  </div>

                  {createdBy && (
                    <div className="flex items-center gap-2">
                      <Avatar user={createdBy} size="sm" />

                      <div>
                        <p className="text-[10px] text-gray-600">
                          Registrado por
                        </p>

                        <p className="text-xs font-medium text-gray-400">
                          {createdBy.name || 'Usuário'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-400">
                  {interaction.description || 'Sem descrição.'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * =========================================================
 * STAGE HISTORY
 * =========================================================
 */

function StageHistory({ history }) {
  if (!history.length) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-gray-950/40 p-6 text-center">
        <History className="mx-auto h-6 w-6 text-gray-700" />

        <p className="mt-2 text-sm text-gray-600">
          Nenhuma alteração de estágio registrada.
        </p>
      </div>
    );
  }

  const ordered = [...history].reverse();

  return (
    <div className="relative">
      <div className="absolute bottom-3 left-[15px] top-3 w-px bg-white/5" />

      <div className="space-y-5">
        {ordered.map((item, index) => {
          const changedBy = item.changedBy || item.user;

          return (
            <div
              key={item._id || `${item.changedAt || index}-${index}`}
              className="relative pl-10"
            >
              <div className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full border border-indigo-500/20 bg-gray-950 text-indigo-400">
                <ArrowRight className="h-3.5 w-3.5" />
              </div>

              <div className="rounded-xl border border-white/5 bg-gray-950/40 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-300">
                      {formatStage(item.to)}
                    </p>

                    <p className="mt-1 text-[11px] text-gray-600">
                      {formatDateTime(item.changedAt)}
                    </p>
                  </div>

                  {changedBy && (
                    <div className="flex items-center gap-2">
                      <Avatar user={changedBy} size="sm" />

                      <div>
                        <p className="text-[10px] text-gray-600">
                          Alterado por
                        </p>

                        <p className="text-xs font-medium text-gray-400">
                          {changedBy.name || 'Usuário'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-lg border border-white/5 bg-gray-950 px-2.5 py-1.5 text-gray-500">
                    De{' '}
                    <strong className="font-medium text-gray-400">
                      {formatStage(item.from)}
                    </strong>
                  </span>

                  <ArrowRight className="h-3.5 w-3.5 text-gray-700" />

                  <span className="rounded-lg border border-indigo-500/10 bg-indigo-500/5 px-2.5 py-1.5 text-indigo-300">
                    Para{' '}
                    <strong className="font-medium">
                      {formatStage(item.to)}
                    </strong>
                  </span>
                </div>

                {item.note && (
                  <p className="mt-3 border-t border-white/5 pt-3 text-xs leading-5 text-gray-500">
                    {item.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * =========================================================
 * USER MINI
 * =========================================================
 */

function UserMini({ user }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar user={user} size="md" />

      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-gray-300">
          {user.name || 'Usuário'}
        </p>

        {user.position && (
          <p className="truncate text-xs text-gray-600">{user.position}</p>
        )}
      </div>
    </div>
  );
}

/**
 * =========================================================
 * AVATAR
 * =========================================================
 */

function Avatar({ user, size = 'md' }) {
  const sizes = {
    sm: 'h-7 w-7 text-[10px]',
    md: 'h-9 w-9 text-xs',
    lg: 'h-11 w-11 text-sm',
  };

  const sizeClass = sizes[size] || sizes.md;

  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name || 'Usuário'}
        className={`${sizeClass} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full border border-white/10 bg-gray-800 font-semibold text-gray-300`}
    >
      {getInitials(user?.name)}
    </div>
  );
}

/**
 * =========================================================
 * INFO ROW
 * =========================================================
 */

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5">
      <span className="text-xs text-gray-600">{label}</span>

      <span className="text-right text-xs font-medium text-gray-300">
        {value || '—'}
      </span>
    </div>
  );
}

/**
 * =========================================================
 * EMPTY INLINE
 * =========================================================
 */

function EmptyInline({ icon, text }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed border-white/10 bg-gray-950/40 px-4 py-5 text-sm text-gray-600">
      {icon}

      {text}
    </div>
  );
}

/**
 * =========================================================
 * PRIORITY
 * =========================================================
 */

function PriorityBadge({ priority }) {
  const config = {
    baixa: {
      label: 'Baixa',
      className: 'text-gray-400 bg-gray-500/10 border-gray-500/20',
    },

    media: {
      label: 'Média',
      className: 'text-yellow-300 bg-yellow-500/10 border-yellow-500/20',
    },

    alta: {
      label: 'Alta',
      className: 'text-orange-300 bg-orange-500/10 border-orange-500/20',
    },

    urgente: {
      label: 'Urgente',
      className: 'text-red-300 bg-red-500/10 border-red-500/20',
    },
  };

  const item = config[priority] || config.media;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${item.className}`}
    >
      <Flame className="h-3.5 w-3.5" />

      {item.label}
    </span>
  );
}

/**
 * =========================================================
 * MODAL
 * =========================================================
 */

function Modal({ title, subtitle, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-t-3xl border border-white/10 bg-gray-900 shadow-2xl sm:rounded-3xl">
        <div className="flex items-start justify-between border-b border-white/5 px-5 py-5">
          <div>
            <h2 className="text-base font-semibold text-white">{title}</h2>

            {subtitle && (
              <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

/**
 * =========================================================
 * LOADING
 * =========================================================
 */

function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-950 px-4 py-6">
      <div className="mx-auto max-w-7xl animate-pulse space-y-5">
        <div className="h-10 w-40 rounded-xl bg-gray-900" />

        <div className="h-64 rounded-3xl bg-gray-900" />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-28 rounded-2xl bg-gray-900" />
          ))}
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-48 rounded-2xl bg-gray-900" />
            ))}
          </div>

          <div className="space-y-5">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-40 rounded-2xl bg-gray-900" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * =========================================================
 * TRENDING ICON
 * =========================================================
 */

function TrendingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
    >
      <path d="M3 17l6-6 4 4 8-9" />
      <path d="M15 6h6v6" />
    </svg>
  );
}

/**
 * =========================================================
 * FORMAT CURRENCY
 * =========================================================
 */

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

/**
 * =========================================================
 * FORMAT DATE
 * =========================================================
 */

function formatDate(date) {
  if (!date) {
    return '—';
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }

  return parsed.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * =========================================================
 * FORMAT DATE TIME
 * =========================================================
 */

function formatDateTime(date) {
  if (!date) {
    return '—';
  }

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }

  return parsed.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * =========================================================
 * FORMAT STAGE
 * =========================================================
 */

function formatStage(stage) {
  const item = STAGES.find((current) => current.value === stage);

  return item?.label || stage || '—';
}

/**
 * =========================================================
 * FORMAT TYPE
 * =========================================================
 */

function formatOpportunityType(type) {
  if (type === 'venda') {
    return 'Venda';
  }

  if (type === 'locacao') {
    return 'Locação';
  }

  return type || 'Negócio';
}

/**
 * =========================================================
 * FORMAT PRIORITY
 * =========================================================
 */

function formatPriority(priority) {
  const labels = {
    baixa: 'Baixa',
    media: 'Média',
    alta: 'Alta',
    urgente: 'Urgente',
  };

  return labels[priority] || priority || '—';
}

/**
 * =========================================================
 * FORMAT ADDRESS
 * =========================================================
 */

function formatPropertyAddress(address) {
  if (!address) {
    return '';
  }

  if (typeof address === 'string') {
    return address;
  }

  return [
    address.street,
    address.number,
    address.neighborhood,
    address.city,
    address.state,
  ]
    .filter(Boolean)
    .join(', ');
}

/**
 * =========================================================
 * INITIALS
 * =========================================================
 */

function getInitials(name) {
  if (!name) {
    return 'U';
  }

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0])
    .join('')
    .toUpperCase();
}

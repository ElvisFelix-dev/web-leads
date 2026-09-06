import {
  Activity,
  UserPlus,
  UserCheck,
  CheckCircle2,
  CalendarCheck,
  CalendarPlus,
  Home,
  FileText,
  Send,
  Clock3,
  Circle,
  Target,
  Trophy,
  DollarSign,
  XCircle,
  RefreshCw,
  Phone,
  MessageCircle,
  Eye,
  Handshake,
  BriefcaseBusiness,
} from 'lucide-react';

import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const getId = (value) => {
  if (!value) return '';

  if (typeof value === 'string') {
    return value;
  }

  return value._id || value.id || '';
};

const normalizeText = (value) => {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const getActivityDate = (activity) => {
  return (
    activity?.createdAt ||
    activity?.updatedAt ||
    activity?.date ||
    activity?.timestamp ||
    activity?.occurredAt ||
    null
  );
};

const getResponsible = (activity) => {
  return (
    activity?.assignedTo ||
    activity?.broker ||
    activity?.responsible ||
    activity?.user ||
    activity?.createdBy ||
    activity?.performedBy ||
    null
  );
};

const getResponsibleName = (activity) => {
  const responsible = getResponsible(activity);

  if (!responsible) {
    return 'Sistema';
  }

  if (typeof responsible === 'string') {
    return responsible;
  }

  return (
    responsible.name ||
    responsible.fullName ||
    responsible.displayName ||
    'Corretor'
  );
};

const getAvatar = (activity) => {
  const responsible = getResponsible(activity);

  if (typeof responsible === 'object' && responsible?.avatar) {
    return responsible.avatar;
  }

  const name = encodeURIComponent(getResponsibleName(activity));

  return `https://ui-avatars.com/api/?name=${name}&background=334155&color=fff`;
};

const formatCurrency = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 'R$ 0,00';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(number);
};

const formatDate = (date) => {
  if (!date) return '';

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  return formatDistanceToNow(parsed, {
    addSuffix: true,
    locale: ptBR,
  });
};

const getPropertyName = (activity) => {
  return (
    activity?.property?.name ||
    activity?.property?.title ||
    activity?.propertyInfo?.name ||
    activity?.propertyInfo?.title ||
    activity?.metadata?.propertyName ||
    null
  );
};

const getLeadName = (activity) => {
  return (
    activity?.lead?.name ||
    activity?.leadInfo?.name ||
    activity?.metadata?.leadName ||
    activity?.name ||
    'Lead'
  );
};

/*
|--------------------------------------------------------------------------
| CONFIGURAÇÃO DOS EVENTOS
|--------------------------------------------------------------------------
*/

const ACTIVITY_CONFIG = {
  /*
  |--------------------------------------------------------------------------
  | LEAD
  |--------------------------------------------------------------------------
  */

  novo: {
    label: 'Novo Lead',
    description: 'Novo lead recebido',
    color: 'bg-blue-500',
    icon: UserPlus,
  },

  novo_lead: {
    label: 'Lead Recebido',
    description: 'O corretor recebeu um novo lead',
    color: 'bg-blue-500',
    icon: UserPlus,
  },

  lead_recebido: {
    label: 'Lead Recebido',
    description: 'Lead recebido pelo corretor',
    color: 'bg-blue-500',
    icon: UserPlus,
  },

  lead_assumido: {
    label: 'Lead Assumido',
    description: 'O corretor assumiu o atendimento do lead',
    color: 'bg-indigo-500',
    icon: UserCheck,
  },

  lead_atendido: {
    label: 'Lead Atendido',
    description: 'Primeiro atendimento realizado',
    color: 'bg-cyan-500',
    icon: Phone,
  },

  contato_realizado: {
    label: 'Contato Realizado',
    description: 'Contato realizado com o lead',
    color: 'bg-cyan-500',
    icon: MessageCircle,
  },

  /*
  |--------------------------------------------------------------------------
  | QUALIFICAÇÃO
  |--------------------------------------------------------------------------
  */

  qualificado: {
    label: 'Lead Qualificado',
    description: 'Lead qualificado pelo corretor',
    color: 'bg-cyan-500',
    icon: CheckCircle2,
  },

  lead_qualificado: {
    label: 'Lead Qualificado',
    description: 'Lead qualificado pelo corretor',
    color: 'bg-cyan-500',
    icon: CheckCircle2,
  },

  /*
  |--------------------------------------------------------------------------
  | OPORTUNIDADE
  |--------------------------------------------------------------------------
  */

  oportunidade: {
    label: 'Oportunidade Criada',
    description: 'Uma nova oportunidade foi criada',
    color: 'bg-amber-500',
    icon: Target,
  },

  oportunidade_criada: {
    label: 'Oportunidade Criada',
    description: 'Uma nova oportunidade foi criada',
    color: 'bg-amber-500',
    icon: Target,
  },

  opportunity_created: {
    label: 'Oportunidade Criada',
    description: 'Uma nova oportunidade foi criada',
    color: 'bg-amber-500',
    icon: Target,
  },

  /*
  |--------------------------------------------------------------------------
  | AGENDA / VISITA
  |--------------------------------------------------------------------------
  */

  compromisso: {
    label: 'Compromisso Criado',
    description: 'Novo compromisso adicionado à agenda',
    color: 'bg-orange-500',
    icon: CalendarPlus,
  },

  compromisso_criado: {
    label: 'Compromisso Criado',
    description: 'Novo compromisso adicionado à agenda',
    color: 'bg-orange-500',
    icon: CalendarPlus,
  },

  agenda_criada: {
    label: 'Compromisso Criado',
    description: 'Novo compromisso adicionado à agenda',
    color: 'bg-orange-500',
    icon: CalendarPlus,
  },

  visita_agendada: {
    label: 'Visita Agendada',
    description: 'Visita ao imóvel agendada',
    color: 'bg-orange-500',
    icon: CalendarCheck,
  },

  visita_realizada: {
    label: 'Visita Realizada',
    description: 'Visita ao imóvel realizada',
    color: 'bg-emerald-500',
    icon: Eye,
  },

  visita_concluida: {
    label: 'Visita Concluída',
    description: 'Visita ao imóvel concluída',
    color: 'bg-emerald-500',
    icon: CheckCircle2,
  },

  /*
  |--------------------------------------------------------------------------
  | PROPOSTA
  |--------------------------------------------------------------------------
  */

  proposta: {
    label: 'Proposta Criada',
    description: 'Uma proposta foi criada',
    color: 'bg-purple-500',
    icon: FileText,
  },

  proposta_criada: {
    label: 'Proposta Criada',
    description: 'Uma proposta foi criada',
    color: 'bg-purple-500',
    icon: FileText,
  },

  proposta_enviada: {
    label: 'Proposta Enviada',
    description: 'Proposta enviada ao cliente',
    color: 'bg-purple-500',
    icon: Send,
  },

  proposta_aceita: {
    label: 'Proposta Aceita',
    description: 'A proposta foi aceita pelo cliente',
    color: 'bg-green-500',
    icon: Handshake,
  },

  proposta_rejeitada: {
    label: 'Proposta Rejeitada',
    description: 'A proposta foi rejeitada',
    color: 'bg-red-500',
    icon: XCircle,
  },

  /*
  |--------------------------------------------------------------------------
  | NEGOCIAÇÃO
  |--------------------------------------------------------------------------
  */

  negociacao: {
    label: 'Em Negociação',
    description: 'Negociação em andamento',
    color: 'bg-yellow-500',
    icon: Clock3,
  },

  /*
  |--------------------------------------------------------------------------
  | VENDA
  |--------------------------------------------------------------------------
  */

  venda: {
    label: 'Venda Realizada',
    description: 'Venda realizada com sucesso',
    color: 'bg-green-500',
    icon: Trophy,
  },

  venda_realizada: {
    label: 'Venda Realizada',
    description: 'Venda realizada com sucesso',
    color: 'bg-green-500',
    icon: Trophy,
  },

  fechado: {
    label: 'Venda Fechada',
    description: 'Venda fechada com sucesso',
    color: 'bg-green-500',
    icon: Trophy,
  },

  venda_fechada: {
    label: 'Venda Fechada',
    description: 'Venda fechada com sucesso',
    color: 'bg-green-500',
    icon: Trophy,
  },

  /*
  |--------------------------------------------------------------------------
  | COMISSÃO
  |--------------------------------------------------------------------------
  */

  comissao: {
    label: 'Comissão Gerada',
    description: 'Comissão gerada pela venda',
    color: 'bg-emerald-500',
    icon: DollarSign,
  },

  comissao_gerada: {
    label: 'Comissão Gerada',
    description: 'Comissão gerada pela venda',
    color: 'bg-emerald-500',
    icon: DollarSign,
  },

  comissao_recebida: {
    label: 'Comissão Recebida',
    description: 'Comissão recebida pelo corretor',
    color: 'bg-emerald-500',
    icon: DollarSign,
  },

  /*
  |--------------------------------------------------------------------------
  | OUTROS
  |--------------------------------------------------------------------------
  */

  perdido: {
    label: 'Lead Perdido',
    description: 'Lead marcado como perdido',
    color: 'bg-red-500',
    icon: XCircle,
  },

  cancelado: {
    label: 'Cancelado',
    description: 'Operação cancelada',
    color: 'bg-red-500',
    icon: XCircle,
  },

  atualizado: {
    label: 'Atualização',
    description: 'Registro atualizado',
    color: 'bg-slate-500',
    icon: RefreshCw,
  },
};

/*
|--------------------------------------------------------------------------
| DETECTA CONFIGURAÇÃO DO EVENTO
|--------------------------------------------------------------------------
*/

const getActivityConfig = (activity) => {
  const possibleTypes = [
    activity?.type,
    activity?.eventType,
    activity?.action,
    activity?.activityType,
    activity?.stage,
    activity?.status,
  ];

  for (const value of possibleTypes) {
    const normalized = normalizeText(value);

    if (ACTIVITY_CONFIG[normalized]) {
      return ACTIVITY_CONFIG[normalized];
    }
  }

  return {
    label: activity?.name || 'Atualização',
    description: activity?.description || 'Movimentação registrada no CRM',
    color: 'bg-slate-500',
    icon: Activity,
  };
};

/*
|--------------------------------------------------------------------------
| DESCRIÇÃO DINÂMICA
|--------------------------------------------------------------------------
*/

const getActivityDescription = (activity, config) => {
  if (activity?.description) {
    return activity.description;
  }

  const type = normalizeText(
    activity?.type ||
      activity?.eventType ||
      activity?.action ||
      activity?.activityType ||
      activity?.stage,
  );

  const leadName = getLeadName(activity);
  const propertyName = getPropertyName(activity);

  switch (type) {
    case 'novo':
    case 'novo_lead':
    case 'lead_recebido':
      return `O lead ${leadName} foi recebido pelo corretor.`;

    case 'lead_assumido':
      return `O corretor assumiu o atendimento do lead ${leadName}.`;

    case 'lead_atendido':
    case 'contato_realizado':
      return `O corretor realizou contato com ${leadName}.`;

    case 'qualificado':
    case 'lead_qualificado':
      return `O lead ${leadName} foi qualificado.`;

    case 'oportunidade':
    case 'oportunidade_criada':
    case 'opportunity_created':
      return propertyName
        ? `Oportunidade criada para o imóvel ${propertyName}.`
        : 'Uma nova oportunidade foi criada.';

    case 'compromisso':
    case 'compromisso_criado':
    case 'agenda_criada':
      return propertyName
        ? `Compromisso criado para o imóvel ${propertyName}.`
        : 'Um novo compromisso foi criado na agenda.';

    case 'visita_agendada':
      return propertyName
        ? `Visita agendada para o imóvel ${propertyName}.`
        : 'Uma visita foi agendada.';

    case 'visita_realizada':
    case 'visita_concluida':
      return propertyName
        ? `Visita realizada no imóvel ${propertyName}.`
        : 'A visita foi realizada.';

    case 'proposta':
    case 'proposta_criada':
      return propertyName
        ? `Proposta criada para o imóvel ${propertyName}.`
        : 'Uma proposta foi criada.';

    case 'proposta_enviada':
      return propertyName
        ? `Proposta enviada ao cliente para o imóvel ${propertyName}.`
        : 'A proposta foi enviada ao cliente.';

    case 'proposta_aceita':
      return 'A proposta foi aceita pelo cliente.';

    case 'proposta_rejeitada':
      return 'A proposta foi rejeitada pelo cliente.';

    case 'negociacao':
      return 'A negociação está em andamento.';

    case 'venda':
    case 'venda_realizada':
    case 'fechado':
    case 'venda_fechada':
      return propertyName
        ? `Venda realizada para o imóvel ${propertyName}.`
        : 'Venda realizada com sucesso.';

    case 'comissao':
    case 'comissao_gerada':
      return 'Comissão gerada para o corretor pela venda realizada.';

    case 'comissao_recebida':
      return 'Comissão recebida pelo corretor.';

    case 'perdido':
      return `O lead ${leadName} foi marcado como perdido.`;

    case 'cancelado':
      return 'A operação foi cancelada.';

    default:
      return config.description;
  }
};

/*
|--------------------------------------------------------------------------
| VALOR DA COMISSÃO
|--------------------------------------------------------------------------
*/

const getCommissionValue = (activity) => {
  const values = [
    activity?.commissionAmount,
    activity?.commission?.amount,
    activity?.commission?.totalAmount,
    activity?.amount,
    activity?.value,
    activity?.metadata?.commissionAmount,
  ];

  for (const value of values) {
    const number = Number(value);

    if (Number.isFinite(number) && number > 0) {
      return number;
    }
  }

  return 0;
};

/*
|--------------------------------------------------------------------------
| VALOR DA VENDA
|--------------------------------------------------------------------------
*/

const getSaleValue = (activity) => {
  const values = [
    activity?.saleAmount,
    activity?.sale?.amount,
    activity?.sale?.saleAmount,
    activity?.metadata?.saleAmount,
  ];

  for (const value of values) {
    const number = Number(value);

    if (Number.isFinite(number) && number > 0) {
      return number;
    }
  }

  return 0;
};

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function RecentActivities({ activities = [] }) {
  /*
  |--------------------------------------------------------------------------
  | ORDENAÇÃO
  |--------------------------------------------------------------------------
  */

  const sortedActivities = [...activities].sort((a, b) => {
    const dateA = new Date(getActivityDate(a) || 0).getTime();
    const dateB = new Date(getActivityDate(b) || 0).getTime();

    return dateB - dateA;
  });

  if (!sortedActivities.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-800 flex items-center justify-center">
          <Activity size={26} className="text-slate-500" />
        </div>

        <p className="text-white font-medium">Nenhuma atividade recente.</p>

        <p className="text-sm text-slate-500 mt-1">
          As movimentações dos corretores aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-6">
      {/* HEADER */}

      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <Activity className="text-indigo-400" size={24} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">
              Atividades Recentes
            </h2>

            <p className="text-slate-400 text-sm">
              Últimas movimentações comerciais do CRM
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700">
          <BriefcaseBusiness size={15} className="text-indigo-400" />

          <span className="text-xs text-slate-400">
            {sortedActivities.length}{' '}
            {sortedActivities.length === 1 ? 'atividade' : 'atividades'}
          </span>
        </div>
      </div>

      {/* TIMELINE */}

      <div className="space-y-5">
        {sortedActivities.map((activity, index) => {
          const config = getActivityConfig(activity);

          const Icon = config.icon;

          const responsible = getResponsible(activity);

          const commissionValue = getCommissionValue(activity);

          const saleValue = getSaleValue(activity);

          const activityDate = getActivityDate(activity);

          const description = getActivityDescription(activity, config);

          const activityId =
            getId(activity) || `${activityDate || 'activity'}-${index}`;

          return (
            <div key={activityId} className="flex gap-4">
              {/* TIMELINE */}

              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-11
                    h-11
                    rounded-full
                    flex
                    items-center
                    justify-center
                    shrink-0
                    ${config.color}
                    shadow-lg
                  `}
                >
                  <Icon size={18} className="text-white" />
                </div>

                {index < sortedActivities.length - 1 && (
                  <div className="w-px flex-1 bg-slate-700 mt-2 min-h-[40px]" />
                )}
              </div>

              {/* CONTEÚDO */}

              <div className="flex-1 min-w-0">
                <div
                  className="
                    bg-slate-800/40
                    border
                    border-slate-700
                    rounded-xl
                    p-4
                    hover:border-slate-600
                    hover:bg-slate-800/60
                    transition
                  "
                >
                  {/* TOPO */}

                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-white">
                          {config.label}
                        </h3>

                        <span
                          className={`
                            inline-flex
                            items-center
                            gap-1.5
                            px-2
                            py-0.5
                            rounded-full
                            text-[10px]
                            font-medium
                            text-white
                            ${config.color}
                          `}
                        >
                          <Circle size={6} fill="currentColor" />
                          Atividade
                        </span>
                      </div>

                      <p className="text-sm text-slate-400 mt-1">
                        {description}
                      </p>
                    </div>

                    {/* DATA */}

                    <div className="text-right shrink-0">
                      <p className="text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(activityDate)}
                      </p>
                    </div>
                  </div>

                  {/* INFORMAÇÕES */}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {/* LEAD */}

                    {(activity?.lead ||
                      activity?.leadInfo ||
                      activity?.name) && (
                      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/70 border border-slate-700">
                        <UserPlus size={14} className="text-blue-400" />

                        <span className="text-xs text-slate-300">
                          {getLeadName(activity)}
                        </span>
                      </div>
                    )}

                    {/* IMÓVEL */}

                    {getPropertyName(activity) && (
                      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/70 border border-slate-700">
                        <Home size={14} className="text-orange-400" />

                        <span className="text-xs text-slate-300 truncate max-w-[240px]">
                          {getPropertyName(activity)}
                        </span>
                      </div>
                    )}

                    {/* VENDA */}

                    {saleValue > 0 && (
                      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
                        <Trophy size={14} className="text-green-400" />

                        <span className="text-xs text-green-300 font-medium">
                          Venda: {formatCurrency(saleValue)}
                        </span>
                      </div>
                    )}

                    {/* COMISSÃO */}

                    {commissionValue > 0 && (
                      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <DollarSign size={14} className="text-emerald-400" />

                        <span className="text-xs text-emerald-300 font-semibold">
                          Comissão: {formatCurrency(commissionValue)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* CORRETOR */}

                  {responsible && (
                    <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-slate-700/70">
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={getAvatar(activity)}
                          alt={getResponsibleName(activity)}
                          className="
                            w-8
                            h-8
                            rounded-full
                            object-cover
                            border
                            border-slate-700
                          "
                          onError={(event) => {
                            event.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              getResponsibleName(activity),
                            )}&background=334155&color=fff`;
                          }}
                        />

                        <div className="min-w-0">
                          <p className="text-sm text-white truncate">
                            {getResponsibleName(activity)}
                          </p>

                          <p className="text-xs text-slate-500">
                            {responsible?.position ||
                              responsible?.role ||
                              'Corretor'}
                          </p>
                        </div>
                      </div>

                      {/* DATA COMPLETA */}

                      {activityDate && (
                        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
                          <Clock3 size={13} />

                          {new Date(activityDate).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import {
  Activity,
  UserPlus,
  CheckCircle2,
  CalendarCheck,
  FileText,
  Clock3,
  Circle,
} from 'lucide-react';

import { formatDistanceToNow } from 'date-fns';

import { ptBR } from 'date-fns/locale';

export default function RecentActivities({ activities = [] }) {
  if (!activities.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        Nenhuma atividade recente.
      </div>
    );
  }

  const getStage = (stage) => {
    switch (stage) {
      case 'novo':
      case 'novo_lead':
        return {
          label: 'Novo Lead',
          color: 'bg-blue-500',
          icon: UserPlus,
        };

      case 'qualificado':
        return {
          label: 'Lead Qualificado',
          color: 'bg-cyan-500',
          icon: CheckCircle2,
        };

      case 'visita_agendada':
        return {
          label: 'Visita Agendada',
          color: 'bg-orange-500',
          icon: CalendarCheck,
        };

      case 'proposta_enviada':
        return {
          label: 'Proposta Enviada',
          color: 'bg-purple-500',
          icon: FileText,
        };

      case 'fechado':
        return {
          label: 'Venda Fechada',
          color: 'bg-green-500',
          icon: CheckCircle2,
        };

      case 'negociacao':
        return {
          label: 'Em Negociação',
          color: 'bg-yellow-500',
          icon: Clock3,
        };

      default:
        return {
          label: 'Atualização',
          color: 'bg-slate-500',
          icon: Activity,
        };
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-6">
      {/* HEADER */}

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
          <Activity className="text-indigo-400" size={24} />
        </div>

        <div>
          <h2 className="text-xl font-bold text-white">Atividades Recentes</h2>

          <p className="text-slate-400 text-sm">Últimas movimentações do CRM</p>
        </div>
      </div>

      <div className="space-y-6">
        {activities.map((activity, index) => {
          const stage = getStage(activity.stage);

          const Icon = stage.icon;

          return (
            <div key={activity._id} className="flex gap-4">
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
                  ${stage.color}
                  `}
                >
                  <Icon size={18} className="text-white" />
                </div>

                {index < activities.length - 1 && (
                  <div className="w-px flex-1 bg-slate-700 mt-2" />
                )}
              </div>

              {/* CONTEÚDO */}

              <div className="flex-1 bg-slate-800/40 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h3 className="font-semibold text-white">
                      {activity.name}
                    </h3>

                    <p className="text-sm text-slate-400 mt-1">{stage.label}</p>

                    {activity.assignedTo && (
                      <div className="flex items-center gap-3 mt-3">
                        <img
                          src={
                            activity.assignedTo.avatar ||
                            `https://ui-avatars.com/api/?name=${activity.assignedTo.name}`
                          }
                          alt={activity.assignedTo.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />

                        <div>
                          <p className="text-sm text-white">
                            {activity.assignedTo.name}
                          </p>

                          <p className="text-xs text-slate-500">
                            {activity.assignedTo.position}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <span
                      className={`
                      inline-flex
                      items-center
                      gap-2
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      text-white
                      ${stage.color}
                      `}
                    >
                      <Circle size={8} fill="white" />

                      {stage.label}
                    </span>

                    <p className="text-xs text-slate-500 mt-3">
                      {formatDistanceToNow(new Date(activity.updatedAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

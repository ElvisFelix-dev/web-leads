// src/components/dashboard/AdminStats.jsx
import {
  Users,
  Home,
  UserRound,
  TrendingUp,
  CalendarCheck,
  Handshake,
  FileText,
  XCircle,
  UserCheck,
  UserX,
  AlertCircle,
} from 'lucide-react';

export default function AdminStats({ stats = {}, loading = false }) {
  // Cálculo correto de leads
  const totalLeads = stats?.leads ?? 0;
  const leadsDistribuidos = stats?.leadsDistribuidos ?? 0;
  const leadsPendentes = stats?.leadsPendentes ?? 0;

  // Taxa de distribuição
  const distribuicaoPercentual =
    totalLeads > 0 ? Math.round((leadsDistribuidos / totalLeads) * 100) : 0;

  const cards = [
    {
      id: 'leads',
      title: 'Total de Leads',
      value: totalLeads,
      icon: Users,
      color: 'from-blue-600/20 to-blue-900/20',
      iconColor: 'text-blue-400',
      borderColor: 'hover:border-blue-500/50',
      description: 'Leads cadastrados no sistema',
    },
    {
      id: 'imoveis',
      title: 'Imóveis',
      value: stats.imoveis || 0,
      icon: Home,
      color: 'from-green-600/20 to-green-900/20',
      iconColor: 'text-green-400',
      borderColor: 'hover:border-green-500/50',
      description: 'Imóveis cadastrados',
    },
    {
      id: 'corretores',
      title: 'Corretores',
      value: stats.corretores || 0,
      icon: UserRound,
      color: 'from-yellow-600/20 to-yellow-900/20',
      iconColor: 'text-yellow-400',
      borderColor: 'hover:border-yellow-500/50',
      description: 'Corretores ativos',
    },
    {
      id: 'usuarios',
      title: 'Usuários',
      value: stats.usuarios || 0,
      icon: UserCheck,
      color: 'from-cyan-600/20 to-cyan-900/20',
      iconColor: 'text-cyan-400',
      borderColor: 'hover:border-cyan-500/50',
      description: 'Usuários do sistema',
    },
    {
      id: 'leadsDistribuidos',
      title: 'Leads Distribuídos',
      value: leadsDistribuidos,
      icon: TrendingUp,
      color: 'from-indigo-600/20 to-indigo-900/20',
      iconColor: 'text-indigo-400',
      borderColor: 'hover:border-indigo-500/50',
      description: `${distribuicaoPercentual}% do total`,
      badge: distribuicaoPercentual > 0 ? `${distribuicaoPercentual}%` : null,
    },
    {
      id: 'leadsPendentes',
      title: 'Leads Pendentes',
      value: leadsPendentes,
      icon: UserX,
      color: 'from-orange-600/20 to-orange-900/20',
      iconColor: 'text-orange-400',
      borderColor: 'hover:border-orange-500/50',
      description: 'Aguardando distribuição',
      badge: leadsPendentes > 0 ? '⚠️' : '✅',
    },
    {
      id: 'visitas',
      title: 'Visitas',
      value: stats.visitas || 0,
      icon: CalendarCheck,
      color: 'from-purple-600/20 to-purple-900/20',
      iconColor: 'text-purple-400',
      borderColor: 'hover:border-purple-500/50',
      description: 'Visitas realizadas',
    },
    {
      id: 'propostas',
      title: 'Propostas',
      value: stats.propostas || 0,
      icon: FileText,
      color: 'from-pink-600/20 to-pink-900/20',
      iconColor: 'text-pink-400',
      borderColor: 'hover:border-pink-500/50',
      description: 'Propostas enviadas',
    },
    {
      id: 'fechados',
      title: 'Negócios Fechados',
      value: stats.fechados || 0,
      icon: Handshake,
      color: 'from-emerald-600/20 to-emerald-900/20',
      iconColor: 'text-emerald-400',
      borderColor: 'hover:border-emerald-500/50',
      description: 'Vendas concluídas',
    },
    {
      id: 'perdidos',
      title: 'Negócios Perdidos',
      value: stats.perdidos || 0,
      icon: XCircle,
      color: 'from-red-600/20 to-red-900/20',
      iconColor: 'text-red-400',
      borderColor: 'hover:border-red-500/50',
      description: 'Oportunidades perdidas',
    },
  ];

  // Loading
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {[...Array(10)].map((_, index) => (
          <div
            key={index}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl animate-pulse"
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="h-4 w-20 bg-slate-700 rounded mb-3" />
                <div className="h-8 w-16 bg-slate-700 rounded" />
              </div>
              <div className="h-12 w-12 bg-slate-700 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Sem dados
  if (Object.keys(stats).length === 0 || totalLeads === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] bg-slate-900 border border-slate-800 rounded-2xl p-10">
        <AlertCircle size={48} className="text-slate-600 mb-4" />
        <h3 className="text-xl font-semibold text-white">
          Nenhum dado disponível
        </h3>
        <p className="text-slate-400 mt-2 text-center max-w-md">
          Cadastre seus primeiros leads, imóveis e corretores para começar a ver
          as estatísticas.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {cards.map((card) => {
          const Icon = card.icon;
          const hasBadge = card.badge !== null && card.badge !== undefined;

          return (
            <div
              key={card.id}
              className={`
                group
                relative
                overflow-hidden
                bg-gradient-to-br
                ${card.color}
                bg-slate-900
                border
                border-slate-800
                rounded-2xl
                p-5
                shadow-xl
                hover:-translate-y-1
                ${card.borderColor}
                transition-all
                duration-300
                cursor-default
              `}
            >
              {/* Efeito de brilho */}
              <div
                className="
                  absolute
                  -right-8
                  -top-8
                  w-32
                  h-32
                  rounded-full
                  bg-white/5
                  group-hover:scale-125
                  transition
                  duration-500
                "
              />

              {/* Badge */}
              {hasBadge && (
                <div
                  className="
                    absolute
                    top-3
                    right-3
                    text-xs
                    font-medium
                    px-2
                    py-1
                    rounded-full
                    bg-slate-950/50
                    text-slate-300
                    border
                    border-slate-700/50
                  "
                >
                  {card.badge}
                </div>
              )}

              {/* Conteúdo */}
              <div className="relative flex flex-col h-full">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-400 truncate">
                      {card.title}
                    </p>
                    <h2 className="mt-2 text-3xl font-bold text-white">
                      {card.value}
                    </h2>
                  </div>

                  <div
                    className={`
                      flex-shrink-0
                      p-3
                      ml-3
                      rounded-xl
                      bg-slate-950/50
                      ${card.iconColor}
                      group-hover:scale-110
                      transition
                      duration-300
                    `}
                  >
                    <Icon size={24} />
                  </div>
                </div>

                {/* Descrição */}
                {card.description && (
                  <p className="mt-2 text-xs text-slate-500 truncate">
                    {card.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumo rápido */}
      {totalLeads > 0 && (
        <div className="mt-6 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <span className="text-sm text-slate-400">
                  Distribuídos:{' '}
                  <strong className="text-white">{leadsDistribuidos}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-sm text-slate-400">
                  Pendentes:{' '}
                  <strong className="text-white">{leadsPendentes}</strong>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">
                Taxa de distribuição:
              </span>
              <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${distribuicaoPercentual}%` }}
                />
              </div>
              <span className="text-sm font-medium text-white">
                {distribuicaoPercentual}%
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Flame,
  LayoutGrid,
  List,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Users,
  UserRound,
  X,
} from 'lucide-react';

import api from '../../service/api';

const PRIORITY_CONFIG = {
  high: {
    label: 'Alta',
    className: 'border-rose-500/20 bg-rose-500/10 text-rose-300',
    dot: 'bg-rose-400',
  },
  medium: {
    label: 'Média',
    className: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
    dot: 'bg-amber-400',
  },
  low: {
    label: 'Baixa',
    className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
    dot: 'bg-emerald-400',
  },
};

const STAGE_LABELS = {
  novo_lead: 'Novo lead',
  primeiro_contato: 'Primeiro contato',
  qualificado: 'Qualificado',
  visita_agendada: 'Visita agendada',
  proposta_enviada: 'Proposta enviada',
  negociacao: 'Em negociação',
  fechado: 'Fechado',
  perdido: 'Perdido',
};

function normalizePriority(priority) {
  const value = String(priority || '').toLowerCase();

  if (['high', 'alta', 'urgent', 'urgente'].includes(value)) {
    return 'high';
  }

  if (['low', 'baixa'].includes(value)) {
    return 'low';
  }

  return 'medium';
}

function formatDate(date) {
  if (!date) return 'Data não informada';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Data não informada';
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

  const amount = Number(value);

  if (!Number.isFinite(amount)) return null;

  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });
}

function getLeadName(lead) {
  return lead?.name || lead?.fullName || 'Lead sem nome';
}

function getInitials(name) {
  return String(name || 'L')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function getStageLabel(stage) {
  if (!stage) return 'Sem etapa';

  const normalized = String(stage).toLowerCase();

  if (STAGE_LABELS[normalized]) {
    return STAGE_LABELS[normalized];
  }

  return String(stage)
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getPropertyTitle(property) {
  if (!property) return 'Sem imóvel vinculado';

  if (typeof property === 'string') {
    return 'Imóvel vinculado';
  }

  return property.title || property.name || 'Imóvel vinculado';
}

export default function BrokerLatestLeads({ brokerId }) {
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [viewMode, setViewMode] = useState('cards');

  const fetchLeads = useCallback(async () => {
    if (!brokerId) {
      setLeads([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.get(`/api/users/brokers/${brokerId}/leads`);

      const result = Array.isArray(data?.data) ? data.data : [];

      setLeads(result);
    } catch (error) {
      console.error('Erro ao buscar leads do corretor:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [brokerId]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const filteredLeads = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return leads.filter((lead) => {
      const matchesSearch =
        !query ||
        [
          lead.name,
          lead.fullName,
          lead.email,
          lead.phone,
          lead.property?.title,
          lead.property?.address,
        ].some((value) =>
          String(value || '')
            .toLowerCase()
            .includes(query),
        );

      const matchesPriority =
        priorityFilter === 'all' ||
        normalizePriority(lead.priority) === priorityFilter;

      return matchesSearch && matchesPriority;
    });
  }, [leads, searchTerm, priorityFilter]);

  const priorityCounts = useMemo(() => {
    return leads.reduce(
      (counts, lead) => {
        counts[normalizePriority(lead.priority)] += 1;
        return counts;
      },
      { high: 0, medium: 0, low: 0 },
    );
  }, [leads]);

  const openLead = (lead) => {
    if (!lead?._id) return;

    navigate(`/lead-detail/${lead._id}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setPriorityFilter('all');
  };

  return (
    <section className="relative w-full overflow-hidden rounded-3xl border border-slate-800/80 bg-[#0b1120] shadow-[0_20px_70px_-35px_rgba(0,0,0,0.8)]">
      {/* Detalhe visual superior */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/60 to-transparent" />

      <div className="p-5 sm:p-7 lg:p-8">
        {/* Cabeçalho */}
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400 shadow-inner shadow-blue-500/5">
              <Users size={22} strokeWidth={1.8} />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                  Últimos leads
                </h3>

                <span className="inline-flex items-center rounded-full border border-slate-700/80 bg-slate-800/60 px-2.5 py-1 text-xs font-medium tabular-nums text-slate-300">
                  {leads.length}
                </span>
              </div>

              <p className="mt-1 text-sm leading-relaxed text-slate-400">
                Acompanhe os clientes e as oportunidades deste corretor.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={fetchLeads}
              disabled={loading}
              title="Atualizar leads"
              aria-label="Atualizar leads"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/leads-list')}
              className="group inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 active:scale-[0.98]"
            >
              Ver todos
              <ArrowUpRight
                size={16}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </button>
          </div>
        </div>

        {/* Indicadores */}
        <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SummaryCard
            label="Prioridade alta"
            value={priorityCounts.high}
            icon={Flame}
            color="rose"
          />

          <SummaryCard
            label="Prioridade média"
            value={priorityCounts.medium}
            icon={Clock3}
            color="amber"
          />

          <SummaryCard
            label="Prioridade baixa"
            value={priorityCounts.low}
            icon={CheckCircle2}
            color="emerald"
          />
        </div>

        {/* Pesquisa e visualização */}
        <div className="mt-7 flex flex-col gap-3 border-b border-slate-800/80 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por nome, e-mail, telefone..."
              aria-label="Buscar leads"
              className="h-11 w-full rounded-xl border border-slate-800 bg-slate-950/70 pl-10 pr-10 text-sm text-white outline-none transition placeholder:text-slate-600 hover:border-slate-700 focus:border-blue-500/60 focus:ring-4 focus:ring-blue-500/10"
            />

            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                aria-label="Limpar busca"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition hover:bg-slate-800 hover:text-white"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/70 px-3">
              <SlidersHorizontal size={15} className="text-slate-500" />

              <select
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
                aria-label="Filtrar por prioridade"
                className="max-w-[150px] cursor-pointer bg-transparent text-sm text-slate-300 outline-none"
              >
                <option value="all" className="bg-slate-900">
                  Todas as prioridades
                </option>
                <option value="high" className="bg-slate-900">
                  Alta
                </option>
                <option value="medium" className="bg-slate-900">
                  Média
                </option>
                <option value="low" className="bg-slate-900">
                  Baixa
                </option>
              </select>
            </div>

            <div
              className="flex h-10 items-center rounded-xl border border-slate-800 bg-slate-950/70 p-1"
              role="group"
              aria-label="Modo de visualização"
            >
              <ViewButton
                active={viewMode === 'cards'}
                onClick={() => setViewMode('cards')}
                icon={LayoutGrid}
                label="Cards"
              />

              <ViewButton
                active={viewMode === 'list'}
                onClick={() => setViewMode('list')}
                icon={List}
                label="Lista"
              />
            </div>
          </div>
        </div>

        {/* Resultado */}
        <div className="mt-5">
          {loading ? (
            <LoadingState viewMode={viewMode} />
          ) : leads.length === 0 ? (
            <EmptyState
              title="Nenhum lead por aqui"
              description="Este corretor ainda não possui leads cadastrados."
              onAction={() => navigate('/leads-list')}
              actionLabel="Acessar todos os leads"
            />
          ) : filteredLeads.length === 0 ? (
            <EmptyState
              title="Nenhum resultado encontrado"
              description="Tente alterar sua busca ou remover os filtros."
              onAction={clearFilters}
              actionLabel="Limpar filtros"
            />
          ) : viewMode === 'cards' ? (
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
              {filteredLeads.map((lead, index) => (
                <LeadCard
                  key={lead._id || `${lead.email}-${index}`}
                  lead={lead}
                  index={index}
                  onOpen={() => openLead(lead)}
                />
              ))}
            </div>
          ) : (
            <LeadList leads={filteredLeads} onOpen={openLead} />
          )}
        </div>

        {/* Rodapé */}
        {!loading && filteredLeads.length > 0 && (
          <div className="mt-5 flex flex-col gap-2 border-t border-slate-800/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Exibindo{' '}
              <span className="font-semibold text-slate-300">
                {filteredLeads.length}
              </span>{' '}
              de{' '}
              <span className="font-semibold text-slate-300">
                {leads.length}
              </span>{' '}
              leads
            </p>

            <button
              type="button"
              onClick={() => navigate('/leads-list')}
              className="inline-flex items-center gap-2 self-start text-xs font-semibold text-blue-400 transition hover:text-blue-300 sm:self-auto"
            >
              Acessar gestão de leads
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   INDICADORES
========================================================= */

function SummaryCard({ label, value, icon: Icon, color }) {
  const colors = {
    rose: {
      icon: 'border-rose-500/20 bg-rose-500/10 text-rose-300',
      dot: 'bg-rose-400',
    },
    amber: {
      icon: 'border-amber-500/20 bg-amber-500/10 text-amber-300',
      dot: 'bg-amber-400',
    },
    emerald: {
      icon: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300',
      dot: 'bg-emerald-400',
    },
  };

  const theme = colors[color];

  return (
    <div className="group rounded-2xl border border-slate-800/80 bg-slate-900/45 p-4 transition duration-200 hover:border-slate-700 hover:bg-slate-900/80">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${theme.icon}`}
          >
            <Icon size={18} strokeWidth={1.8} />
          </div>

          <p className="truncate text-sm text-slate-400">{label}</p>
        </div>

        <span className={`h-2 w-2 shrink-0 rounded-full ${theme.dot}`} />
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight text-white tabular-nums">
          {value}
        </span>
        <span className="text-xs text-slate-500">leads</span>
      </div>
    </div>
  );
}

/* =========================================================
   CONTROLE DE VISUALIZAÇÃO
========================================================= */

function ViewButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={`Visualização em ${label.toLowerCase()}`}
      className={`inline-flex h-8 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold transition ${
        active
          ? 'bg-blue-500/15 text-blue-300 shadow-sm'
          : 'text-slate-500 hover:bg-slate-800/80 hover:text-slate-300'
      }`}
    >
      <Icon size={15} />
      <span>{label}</span>
    </button>
  );
}

/* =========================================================
   CARD DO LEAD
========================================================= */

function LeadCard({ lead, index, onOpen }) {
  const name = getLeadName(lead);
  const priority = PRIORITY_CONFIG[normalizePriority(lead.priority)];
  const property = lead.property;
  const price = formatCurrency(property?.price);

  return (
    <article className="group relative flex min-h-[300px] min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/45 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-blue-500/30 hover:bg-slate-900/90 hover:shadow-[0_18px_40px_-24px_rgba(37,99,235,0.3)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-600/60 to-transparent transition group-hover:via-blue-500/60" />

      {/* Identificação */}
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/20 to-indigo-500/10 text-sm font-bold text-blue-200">
          {getInitials(name)}
        </div>

        <div className="min-w-0 flex-1 pt-0.5">
          <h4
            className="truncate text-sm font-semibold text-white"
            title={name}
          >
            {name}
          </h4>

          <p className="mt-1 truncate text-xs text-slate-500">
            {lead.email || 'E-mail não informado'}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <PriorityBadge priority={lead.priority} />

            {index === 0 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-300">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                Recente
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Informações */}
      <div className="mt-5 space-y-3">
        <InfoRow icon={Phone} value={lead.phone || 'Telefone não informado'} />

        <InfoRow icon={CalendarDays} value={formatDate(lead.createdAt)} />
      </div>

      {/* Imóvel */}
      <div className="mt-5 flex-1 rounded-xl border border-slate-800/80 bg-slate-950/55 p-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800/80 text-slate-400">
            <Building2 size={15} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Imóvel de interesse
            </p>

            <p
              className="mt-1 truncate text-xs font-medium text-slate-200"
              title={getPropertyTitle(property)}
            >
              {getPropertyTitle(property)}
            </p>
          </div>

          {price && (
            <span className="shrink-0 text-xs font-semibold text-emerald-300">
              {price}
            </span>
          )}
        </div>

        {property?.address && (
          <div className="mt-3 flex items-start gap-2 border-t border-slate-800/70 pt-3 text-xs text-slate-500">
            <MapPin size={13} className="mt-0.5 shrink-0 text-slate-600" />
            <span className="line-clamp-2 break-words">{property.address}</span>
          </div>
        )}
      </div>

      {/* Etapa e ação */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <StageBadge stage={lead.stage} />

        <button
          type="button"
          onClick={onOpen}
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 text-xs font-semibold text-blue-300 transition hover:border-blue-400/40 hover:bg-blue-500/20 hover:text-blue-200"
        >
          Detalhes
          <ArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </button>
      </div>
    </article>
  );
}

/* =========================================================
   VISUALIZAÇÃO EM LISTA
========================================================= */

function LeadList({ leads, onOpen }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/35">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/65">
              <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Cliente
              </th>

              <th className="px-4 py-4 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Prioridade
              </th>

              <th className="px-4 py-4 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Imóvel
              </th>

              <th className="px-4 py-4 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Etapa
              </th>

              <th className="px-4 py-4 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Cadastro
              </th>

              <th className="px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Ação
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/70">
            {leads.map((lead, index) => {
              const name = getLeadName(lead);
              const property = lead.property;

              return (
                <tr
                  key={lead._id || `${lead.email}-${index}`}
                  onClick={() => onOpen(lead)}
                  className="group cursor-pointer transition hover:bg-blue-500/[0.035]"
                >
                  <td className="px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700/80 bg-slate-800/70 text-xs font-bold text-slate-200 transition group-hover:border-blue-500/30 group-hover:bg-blue-500/10 group-hover:text-blue-200">
                        {getInitials(name)}
                      </div>

                      <div className="min-w-0">
                        <p className="max-w-[200px] truncate text-sm font-medium text-slate-200">
                          {name}
                        </p>

                        <p className="mt-1 max-w-[200px] truncate text-xs text-slate-500">
                          {lead.email || lead.phone || 'Sem contato'}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <PriorityBadge priority={lead.priority} />
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex max-w-[210px] items-center gap-2">
                      <Building2
                        size={15}
                        className="shrink-0 text-slate-500"
                      />

                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-slate-300">
                          {getPropertyTitle(property)}
                        </p>

                        {property?.price && (
                          <p className="mt-1 text-xs text-emerald-300">
                            {formatCurrency(property.price)}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <StageBadge stage={lead.stage} />
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-400">
                    {formatDate(lead.createdAt)}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpen(lead);
                      }}
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-800/50 px-3 text-xs font-medium text-slate-300 transition hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-300"
                    >
                      Abrir
                      <ArrowUpRight size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-800/70 bg-slate-950/35 px-5 py-3">
        <span className="text-xs text-slate-500">
          {leads.length} {leads.length === 1 ? 'lead' : 'leads'}
        </span>

        <span className="inline-flex items-center gap-1.5 text-[10px] text-slate-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Dados do corretor
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   COMPONENTES AUXILIARES
========================================================= */

function InfoRow({ icon: Icon, value }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 text-xs text-slate-400">
      <Icon size={14} className="shrink-0 text-slate-500" />

      <span className="truncate">{value}</span>
    </div>
  );
}

function PriorityBadge({ priority }) {
  const item = PRIORITY_CONFIG[normalizePriority(priority)];

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold ${item.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
      {item.label}
    </span>
  );
}

function StageBadge({ stage }) {
  const normalized = String(stage || '').toLowerCase();

  let colorClass = 'border-slate-700/80 bg-slate-800/60 text-slate-300';

  if (normalized === 'fechado') {
    colorClass = 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
  } else if (normalized === 'perdido') {
    colorClass = 'border-rose-500/20 bg-rose-500/10 text-rose-300';
  } else if (
    normalized === 'visita_agendada' ||
    normalized === 'proposta_enviada'
  ) {
    colorClass = 'border-violet-500/20 bg-violet-500/10 text-violet-300';
  } else if (normalized === 'qualificado' || normalized === 'negociacao') {
    colorClass = 'border-blue-500/20 bg-blue-500/10 text-blue-300';
  }

  return (
    <span
      className={`inline-flex max-w-[150px] items-center truncate rounded-lg border px-2.5 py-1.5 text-[10px] font-medium ${colorClass}`}
      title={getStageLabel(stage)}
    >
      {getStageLabel(stage)}
    </span>
  );
}

function LoadingState({ viewMode }) {
  if (viewMode === 'list') {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-800/80">
        <div className="border-b border-slate-800 bg-slate-950/50 px-5 py-4">
          <div className="h-3 w-32 animate-pulse rounded bg-slate-800" />
        </div>

        <div className="space-y-0 divide-y divide-slate-800/60">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4 px-5 py-5">
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-slate-800" />

              <div className="flex-1 space-y-2">
                <div className="h-3 w-36 max-w-full animate-pulse rounded bg-slate-800" />
                <div className="h-2.5 w-48 max-w-full animate-pulse rounded bg-slate-800/70" />
              </div>

              <div className="hidden h-6 w-20 animate-pulse rounded-full bg-slate-800 sm:block" />
              <div className="hidden h-6 w-24 animate-pulse rounded-lg bg-slate-800 md:block" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="min-h-[290px] animate-pulse rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-slate-800" />

            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 rounded bg-slate-800" />
              <div className="h-2.5 w-44 max-w-full rounded bg-slate-800/70" />
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="h-3 w-40 rounded bg-slate-800/80" />
            <div className="h-3 w-32 rounded bg-slate-800/80" />
          </div>

          <div className="mt-6 h-20 rounded-xl bg-slate-800/60" />

          <div className="mt-5 flex justify-between">
            <div className="h-7 w-24 rounded-lg bg-slate-800" />
            <div className="h-9 w-24 rounded-xl bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ title, description, onAction, actionLabel }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/25 px-5 py-10 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-slate-500">
        <UserRound size={25} strokeWidth={1.5} />
      </div>

      <h4 className="mt-5 text-sm font-semibold text-slate-200">{title}</h4>

      <p className="mt-2 max-w-sm text-xs leading-relaxed text-slate-500">
        {description}
      </p>

      <button
        type="button"
        onClick={onAction}
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 text-xs font-semibold text-slate-300 transition hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-300"
      >
        {actionLabel}
        <ArrowRight size={14} />
      </button>
    </div>
  );
}

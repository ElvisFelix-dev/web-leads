import { useEffect, useMemo, useState, useContext } from 'react';

import { useNavigate } from 'react-router-dom';

import { toast } from 'react-toastify';

import {
  ArrowLeft,
  Plus,
  Users,
  Search,
  Upload,
  ClipboardList,
  UserRound,
  TrendingUp,
  CheckCircle2,
  Clock3,
  ArrowUpRight,
  SlidersHorizontal,
  X,
} from 'lucide-react';

import { format } from 'date-fns';

import api from '../service/api';

import { UserContext } from '../context/UserContext';

import ImportLeadsModal from '../components/lead/ImportLeadsModal';

export default function LeadsList() {
  const { user } = useContext(UserContext);

  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');

  const [showImport, setShowImport] = useState(false);

  const fetchLeads = async () => {
    try {
      setLoading(true);

      const { data } = await api.get('/api/leads');

      setLeads(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);

      toast.error('Erro ao carregar leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [user]);

  const filteredLeads = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return leads;

    return leads.filter((lead) => {
      return (
        lead.name?.toLowerCase().includes(value) ||
        lead.email?.toLowerCase().includes(value) ||
        lead.phone?.includes(value) ||
        lead.region?.toLowerCase().includes(value)
      );
    });
  }, [leads, search]);

  const stats = useMemo(() => {
    return {
      total: leads.length,

      newLeads: leads.filter(
        (lead) => lead.stage === 'novo_lead' || lead.stage === 'novo',
      ).length,

      negotiation: leads.filter(
        (lead) =>
          lead.stage === 'negociacao' || lead.stage === 'proposta_enviada',
      ).length,

      closed: leads.filter(
        (lead) => lead.stage === 'fechado' || lead.status === 'fechado',
      ).length,
    };
  }, [leads]);

  if (loading) {
    return <LeadsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      {/* Background decoration */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/3 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />

        <div className="absolute top-1/2 right-0 h-80 w-80 rounded-full bg-indigo-600/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1700px] p-4 sm:p-6 lg:p-8">
        {/* HEADER */}

        <div className="mb-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                aria-label="Voltar para a página anterior"
                title="Voltar"
                className="
                  group flex h-11 w-11 shrink-0 items-center justify-center
                  rounded-xl border border-blue-500/20 bg-slate-900/80
                  text-slate-400 shadow-lg shadow-black/10
                  transition-all duration-200 hover:border-blue-400/40
                  hover:bg-blue-500/10 hover:text-blue-400
                  hover:shadow-blue-950/20 active:scale-95
                  focus:outline-none focus:ring-2 focus:ring-blue-500/40
                "
              >
                <ArrowLeft
                  size={19}
                  className="transition-transform duration-200 group-hover:-translate-x-0.5"
                />
              </button>

              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/20 to-indigo-500/10 shadow-lg shadow-blue-950/20">
                  <ClipboardList size={27} className="text-blue-400" />
                </div>

                <span className="absolute -right-1 -top-1 flex h-4 w-4">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-40" />

                  <span className="relative inline-flex h-4 w-4 rounded-full bg-blue-500" />
                </span>
              </div>

              <div>
                <div className="mb-1 flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Leads
                  </h1>

                  <span className="rounded-full border border-slate-700/80 bg-slate-900/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    CRM
                  </span>
                </div>

                <p className="text-sm text-slate-500">
                  Gerencie, acompanhe e converta seus leads.
                </p>
              </div>
            </div>

            {/* ACTIONS */}

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowImport(true)}

                className="

                  group

                  inline-flex

                  h-11

                  items-center

                  gap-2

                  rounded-xl

                  border

                  border-slate-700/80

                  bg-slate-900/80

                  px-4

                  text-sm

                  font-medium

                  text-slate-300

                  shadow-lg

                  shadow-black/10

                  backdrop-blur

                  transition-all

                  duration-200

                  hover:border-slate-600

                  hover:bg-slate-800

                  hover:text-white

                  active:scale-[0.98]

                "
              >
                <Upload
                  size={17}

                  className="text-slate-400 transition-colors group-hover:text-white"
                />
                Importar
              </button>

              <button
                onClick={() => navigate('/assign-leads')}

                className="

                  group

                  inline-flex

                  h-11

                  items-center

                  gap-2

                  rounded-xl

                  border

                  border-emerald-500/20

                  bg-emerald-500/10

                  px-4

                  text-sm

                  font-medium

                  text-emerald-400

                  transition-all

                  duration-200

                  hover:border-emerald-500/40

                  hover:bg-emerald-500/15

                  hover:text-emerald-300

                  active:scale-[0.98]

                "
              >
                <Users size={17} />
                Atribuir
              </button>

              <button
                onClick={() => navigate('/create-lead')}

                className="

                  group

                  inline-flex

                  h-11

                  items-center

                  gap-2

                  rounded-xl

                  border

                  border-blue-400/20

                  bg-gradient-to-r

                  from-blue-600

                  to-indigo-600

                  px-5

                  text-sm

                  font-semibold

                  text-white

                  shadow-lg

                  shadow-blue-900/20

                  transition-all

                  duration-200

                  hover:from-blue-500

                  hover:to-indigo-500

                  hover:shadow-blue-900/30

                  active:scale-[0.98]

                "
              >
                <Plus size={18} />
                Novo Lead
              </button>
            </div>
          </div>
        </div>

        {/* STATS */}

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total de leads"

            value={stats.total}

            icon={Users}

            iconClass="text-blue-400"

            iconBg="bg-blue-500/10"

            description="Base atual"
          />

          <StatCard
            label="Novos leads"

            value={stats.newLeads}

            icon={Clock3}

            iconClass="text-amber-400"

            iconBg="bg-amber-500/10"

            description="Aguardando contato"
          />

          <StatCard
            label="Em negociação"

            value={stats.negotiation}

            icon={TrendingUp}

            iconClass="text-violet-400"

            iconBg="bg-violet-500/10"

            description="Oportunidades ativas"
          />

          <StatCard
            label="Fechados"

            value={stats.closed}

            icon={CheckCircle2}

            iconClass="text-emerald-400"

            iconBg="bg-emerald-500/10"

            description="Conversões"
          />
        </div>

        {/* SEARCH + FILTER */}

        <div
          className="

            mb-6

            rounded-2xl

            border

            border-slate-800/80

            bg-slate-900/60

            p-3

            shadow-2xl

            shadow-black/10

            backdrop-blur-xl

          "
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search
                size={19}

                className="

                  pointer-events-none

                  absolute

                  left-4

                  top-1/2

                  -translate-y-1/2

                  text-slate-500

                "
              />

              <input
                value={search}

                onChange={(e) => setSearch(e.target.value)}

                placeholder="Buscar por nome, email, telefone ou região..."

                className="

                  h-12

                  w-full

                  rounded-xl

                  border

                  border-slate-800

                  bg-slate-950/70

                  pl-11

                  pr-11

                  text-sm

                  text-white

                  outline-none

                  placeholder:text-slate-600

                  transition-all

                  duration-200

                  focus:border-blue-500/40

                  focus:bg-slate-950

                  focus:ring-4

                  focus:ring-blue-500/5

                "
              />

              {search && (
                <button
                  onClick={() => setSearch('')}

                  className="

                    absolute

                    right-3

                    top-1/2

                    flex

                    h-7

                    w-7

                    -translate-y-1/2

                    items-center

                    justify-center

                    rounded-lg

                    text-slate-500

                    transition

                    hover:bg-slate-800

                    hover:text-white

                  "
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <button
              className="

                inline-flex

                h-12

                items-center

                justify-center

                gap-2

                rounded-xl

                border

                border-slate-800

                bg-slate-950/70

                px-4

                text-sm

                font-medium

                text-slate-400

                transition

                hover:border-slate-700

                hover:bg-slate-800

                hover:text-white

              "
            >
              <SlidersHorizontal size={17} />
              Filtros
            </button>
          </div>

          {search && (
            <div className="mt-3 flex items-center gap-2 px-1 text-xs text-slate-500">
              <Search size={13} />

              <span>
                {filteredLeads.length}{' '}
                {filteredLeads.length === 1
                  ? 'lead encontrado'
                  : 'leads encontrados'}
              </span>
            </div>
          )}
        </div>

        {/* EMPTY STATE */}

        {filteredLeads.length === 0 ? (
          <EmptyState
            search={search}

            onCreate={() => navigate('/create-lead')}
          />
        ) : (
          <div
            className="

              overflow-hidden

              rounded-2xl

              border

              border-slate-800/80

              bg-slate-900/50

              shadow-2xl

              shadow-black/20

              backdrop-blur-xl

            "
          >
            <div className="flex items-center justify-between border-b border-slate-800/80 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Lista de leads
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  {filteredLeads.length} registros exibidos
                </p>
              </div>

              <div className="hidden items-center gap-2 sm:flex">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />

                <span className="text-xs text-slate-500">
                  Sistema operacional
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-slate-950/30">
                    <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Lead
                    </th>

                    <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Contato
                    </th>

                    <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Etapa
                    </th>

                    <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Prioridade
                    </th>

                    <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Corretor
                    </th>

                    <th className="px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                      Entrada
                    </th>

                    <th className="px-5 py-4" />
                  </tr>
                </thead>

                <tbody>
                  {filteredLeads.map((lead) => (
                    <LeadRow
                      key={lead._id}

                      lead={lead}

                      onClick={() => navigate(`/lead-detail/${lead._id}`)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FOOTER */}

        <div className="mt-5 flex flex-col gap-2 px-1 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>Leads Na Mão</span>

          <span>Gestão inteligente de leads</span>
        </div>
      </div>

      {showImport && (
        <ImportLeadsModal
          onClose={() => setShowImport(false)}

          onSuccess={() => fetchLeads()}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/* STAT CARD                                                                   */

/* -------------------------------------------------------------------------- */

function StatCard({
  label,

  value,

  icon: Icon,

  iconClass,

  iconBg,

  description,
}) {
  return (
    <div
      className="

        group

        relative

        overflow-hidden

        rounded-2xl

        border

        border-slate-800/80

        bg-slate-900/50

        p-5

        shadow-xl

        shadow-black/10

        backdrop-blur-xl

        transition-all

        duration-300

        hover:-translate-y-0.5

        hover:border-slate-700

        hover:bg-slate-900/80

      "
    >
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/[0.015] blur-2xl transition group-hover:bg-white/[0.03]" />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{label}</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-white">
            {value}
          </p>

          <p className="mt-1 text-[11px] text-slate-600">{description}</p>
        </div>

        <div
          className={`

            flex

            h-10

            w-10

            items-center

            justify-center

            rounded-xl

            ${iconBg}

            ${iconClass}

            border

            border-white/[0.04]

          `}
        >
          <Icon size={19} />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/* LEAD ROW                                                                    */

/* -------------------------------------------------------------------------- */

function LeadRow({ lead, onClick }) {
  const initials = getInitials(lead.name);

  return (
    <tr
      onClick={onClick}

      className="

        group

        cursor-pointer

        border-b

        border-slate-800/60

        transition-all

        duration-200

        last:border-b-0

        hover:bg-blue-500/[0.025]

      "
    >
      {/* LEAD */}

      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            className="

              flex

              h-10

              w-10

              shrink-0

              items-center

              justify-center

              rounded-xl

              border

              border-slate-700/80

              bg-gradient-to-br

              from-slate-800

              to-slate-900

              text-xs

              font-bold

              text-slate-300

              transition

              group-hover:border-blue-500/30

              group-hover:text-blue-300

            "
          >
            {initials}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white transition group-hover:text-blue-300">
              {lead.name || 'Sem nome'}
            </p>

            <p className="mt-0.5 truncate text-xs text-slate-600">
              {lead.region || 'Região não informada'}
            </p>
          </div>
        </div>
      </td>

      {/* CONTACT */}

      <td className="px-5 py-4">
        <div>
          <p className="max-w-[230px] truncate text-sm text-slate-300">
            {lead.email || '-'}
          </p>

          <p className="mt-1 text-xs text-slate-600">
            {lead.phone || 'Telefone não informado'}
          </p>
        </div>
      </td>

      {/* STAGE */}

      <td className="px-5 py-4">
        <Badge text={formatStage(lead.stage)} type="stage" />
      </td>

      {/* STATUS */}

      <td className="px-5 py-4">
        <Badge text={formatStatus(lead.status)} type="status" />
      </td>

      {/* PRIORITY */}

      <td className="px-5 py-4">
        <Badge text={formatPriority(lead.priority)} type="priority" />
      </td>

      {/* BROKER */}

      <td className="px-5 py-4">
        {lead.assignedTo ? (
          <div className="flex items-center gap-2.5">
            {lead.assignedTo.avatar ? (
              <img
                src={lead.assignedTo.avatar}

                alt={lead.assignedTo.name}

                className="

                  h-8

                  w-8

                  rounded-full

                  border

                  border-slate-700

                  object-cover

                "
              />
            ) : (
              <div
                className="

                  flex

                  h-8

                  w-8

                  items-center

                  justify-center

                  rounded-full

                  border

                  border-slate-700

                  bg-slate-800

                  text-[10px]

                  font-bold

                  text-slate-400

                "
              >
                {getInitials(lead.assignedTo.name)}
              </div>
            )}

            <div className="min-w-0">
              <p className="max-w-[130px] truncate text-sm text-slate-300">
                {lead.assignedTo.name}
              </p>

              <p className="text-[10px] text-slate-600">Corretor responsável</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-600">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-slate-700">
              <UserRound size={14} />
            </div>

            <span className="text-xs">Não atribuído</span>
          </div>
        )}
      </td>

      {/* DATE */}

      <td className="px-5 py-4">
        <div>
          <p className="text-sm text-slate-400">
            {lead.createdAt
              ? format(new Date(lead.createdAt), 'dd/MM/yyyy')
              : '-'}
          </p>

          {lead.createdAt && (
            <p className="mt-1 text-[10px] text-slate-600">
              {format(new Date(lead.createdAt), 'HH:mm')}
            </p>
          )}
        </div>
      </td>

      {/* ACTION */}

      <td className="px-5 py-4">
        <div
          className="

            flex

            h-8

            w-8

            items-center

            justify-center

            rounded-lg

            border

            border-transparent

            text-slate-700

            transition-all

            group-hover:border-slate-700

            group-hover:bg-slate-800

            group-hover:text-blue-400

          "
        >
          <ArrowUpRight size={15} />
        </div>
      </td>
    </tr>
  );
}

/* -------------------------------------------------------------------------- */

/* BADGE                                                                       */

/* -------------------------------------------------------------------------- */

function Badge({ text, type }) {
  const styles = {
    stage: 'border-blue-500/20 bg-blue-500/10 text-blue-400',

    status: 'border-slate-700 bg-slate-800/70 text-slate-300',

    priority: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
  };

  return (
    <span
      className={`

        inline-flex

        items-center

        rounded-lg

        border

        px-2.5

        py-1.5

        text-[10px]

        font-semibold

        uppercase

        tracking-wide

        ${styles[type] || styles.status}

      `}
    >
      {text || '-'}
    </span>
  );
}

/* -------------------------------------------------------------------------- */

/* EMPTY STATE                                                                 */

/* -------------------------------------------------------------------------- */

function EmptyState({ search, onCreate }) {
  return (
    <div
      className="

        flex

        min-h-[380px]

        flex-col

        items-center

        justify-center

        rounded-2xl

        border

        border-dashed

        border-slate-800

        bg-slate-900/30

        px-6

        text-center

      "
    >
      <div
        className="

          mb-5

          flex

          h-16

          w-16

          items-center

          justify-center

          rounded-2xl

          border

          border-slate-800

          bg-slate-900

          text-slate-600

        "
      >
        <Users size={27} />
      </div>

      <h3 className="text-base font-semibold text-white">
        {search ? 'Nenhum lead encontrado' : 'Sua base de leads está vazia'}
      </h3>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {search
          ? 'Tente alterar os termos da busca para encontrar o lead que procura.'
          : 'Comece adicionando seu primeiro lead para acompanhar oportunidades dentro do CRM.'}
      </p>

      {!search && (
        <button
          onClick={onCreate}

          className="

            mt-6

            inline-flex

            items-center

            gap-2

            rounded-xl

            bg-blue-600

            px-4

            py-2.5

            text-sm

            font-semibold

            text-white

            shadow-lg

            shadow-blue-950/20

            transition

            hover:bg-blue-500

            active:scale-[0.98]

          "
        >
          <Plus size={17} />
          Criar primeiro lead
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/* LOADING                                                                      */

/* -------------------------------------------------------------------------- */

function LeadsSkeleton() {
  return (
    <div className="min-h-screen bg-[#070b14] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1700px] animate-pulse">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-slate-900" />

            <div>
              <div className="h-7 w-32 rounded-lg bg-slate-900" />

              <div className="mt-2 h-4 w-56 rounded bg-slate-900" />
            </div>
          </div>

          <div className="hidden gap-2 md:flex">
            <div className="h-11 w-28 rounded-xl bg-slate-900" />

            <div className="h-11 w-28 rounded-xl bg-slate-900" />

            <div className="h-11 w-32 rounded-xl bg-slate-900" />
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}

              className="h-32 rounded-2xl border border-slate-800 bg-slate-900/60"
            />
          ))}
        </div>

        <div className="mb-6 h-20 rounded-2xl border border-slate-800 bg-slate-900/60" />

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
          <div className="h-14 border-b border-slate-800 bg-slate-950/30" />

          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-20 border-b border-slate-800/60" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/* HELPERS                                                                      */

/* -------------------------------------------------------------------------- */

function getInitials(name = '') {
  if (!name) return '?';

  const parts = name.trim().split(' ').filter(Boolean);

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatStage(stage) {
  const stages = {
    novo_lead: 'Novo lead',

    primeiro_contato: '1º contato',

    qualificado: 'Qualificado',

    visita_agendada: 'Visita agendada',

    proposta_enviada: 'Proposta enviada',

    negociacao: 'Negociação',

    fechado: 'Fechado',

    perdido: 'Perdido',
  };

  return stages[stage] || stage || '-';
}

function formatStatus(status) {
  const statuses = {
    ativo: 'Ativo',

    active: 'Ativo',

    novo: 'Novo',

    inativo: 'Inativo',

    fechado: 'Fechado',

    perdido: 'Perdido',
  };

  return statuses[status] || status || '-';
}

function formatPriority(priority) {
  const priorities = {
    alta: 'Alta',

    high: 'Alta',

    media: 'Média',

    medium: 'Média',

    baixa: 'Baixa',

    low: 'Baixa',
  };

  return priorities[priority] || priority || '-';
}

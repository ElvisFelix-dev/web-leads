import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Search,
  Users,
  UserCheck,
  UserX,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Mail,
  Phone,
  Award,
  Grid3X3,
  List,
  Filter,
  ChevronDown,
  MoreVertical,
  Eye,
  UserPlus,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

import { toast } from 'react-toastify';

import api from '../service/api';

import { UserContext } from '../context/UserContext';

export default function Brokers() {
  const { user } = useContext(UserContext);

  const [brokers, setBrokers] = useState([]);
  const [filteredBrokers, setFilteredBrokers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('card'); // 'card' | 'list'
  const [statusFilter, setStatusFilter] = useState('todos');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const navigate = useNavigate();

  /*
  =====================================
  BUSCAR CORRETORES
  =====================================
  */

  useEffect(() => {
    console.log('USER CONTEXT:', user);

    if (!user) {
      console.log('Sem usuário');
      return;
    }

    if (!user.token) {
      console.log('Sem token');
      return;
    }

    console.log('Chamando fetchBrokers');
    fetchBrokers();
  }, [user]);

  const fetchBrokers = async () => {
    try {
      setRefreshing(true);

      const { data } = await api.get('/api/users/brokers', {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      console.log('Brokers API:', data);

      const brokersData =
        data?.data || data?.brokers || data?.data?.brokers || [];
      setBrokers(brokersData);
      setFilteredBrokers(brokersData);
    } catch (error) {
      console.error('Erro ao buscar corretores:', error);
      toast.error('Erro ao carregar corretores.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /*
  =====================================
  FILTRAR CORRETORES
  =====================================
  */

  useEffect(() => {
    let result = brokers;

    // Filtro por busca
    if (search.trim()) {
      const searchText = search.toLowerCase().trim();
      result = result.filter((broker) => {
        const searchableContent = `
          ${broker.name || ''}
          ${broker.email || ''}
          ${broker.phone || ''}
          ${broker.creci || ''}
          ${broker.position || ''}
          ${broker.company || ''}
        `.toLowerCase();
        return searchableContent.includes(searchText);
      });
    }

    // Filtro por status
    if (statusFilter !== 'todos') {
      const isActive = statusFilter === 'active';
      result = result.filter((broker) => broker.isActive === isActive);
    }

    setFilteredBrokers(result);
  }, [brokers, search, statusFilter]);

  /*
  =====================================
  DELETE BROKER
  =====================================
  */

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Deseja remover este corretor?');
    if (!confirmDelete) return;

    try {
      setActionLoading(id);
      await api.delete(`/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      setBrokers((prev) => prev.filter((broker) => broker._id !== id));
      toast.success('Corretor removido com sucesso.');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao remover corretor.');
    } finally {
      setActionLoading(null);
    }
  };

  /*
  =====================================
  LIMPAR FILTROS
  =====================================
  */

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('todos');
  };

  /*
  =====================================
  METRICS
  =====================================
  */

  const total = brokers.length;
  const active = brokers.filter((broker) => broker.isActive).length;
  const inactive = total - active;

  /*
  =====================================
  LOADING
  =====================================
  */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-sm text-slate-400">Carregando corretores...</p>
        </div>
      </div>
    );
  }

  /*
  =====================================
  RENDER
  =====================================
  */

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      {/* HEADER */}
      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          {/* TITLE */}
          <div>
            <h1 className="text-2xl font-bold text-white">
              Gestão de Corretores
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Gerencie sua equipe comercial e acompanhe seus corretores.
            </p>

            {/* METRICS */}
            <div className="mt-5 flex flex-wrap gap-3">
              <MetricCard
                icon={<Users size={18} />}
                label="Total"
                value={total}
                color="border-blue-500/20 bg-blue-500/10 text-blue-400"
              />
              <MetricCard
                icon={<UserCheck size={18} />}
                label="Ativos"
                value={active}
                color="border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
              />
              <MetricCard
                icon={<UserX size={18} />}
                label="Inativos"
                value={inactive}
                color="border-red-500/20 bg-red-500/10 text-red-400"
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={fetchBrokers}
              disabled={refreshing}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-200 transition hover:bg-slate-700 disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={refreshing ? 'animate-spin' : ''}
              />
              Atualizar
            </button>

            <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500">
              <Plus size={17} />
              Novo Corretor
            </button>
          </div>
        </div>

        {/* SEARCH E FILTROS */}
        <div className="mt-5 flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar corretor por nome, email, telefone ou CRECI..."
              className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-700"
          >
            <Filter size={17} />
            Filtros
            <ChevronDown
              size={16}
              className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}
            />
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('card')}
              className={`rounded-xl p-3 transition ${
                viewMode === 'card'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
              title="Modo Card"
            >
              <Grid3X3 size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded-xl p-3 transition ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
              title="Modo Lista"
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* FILTROS EXPANDIDOS */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 gap-4 border-t border-slate-800 pt-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-400">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-white outline-none focus:border-blue-500"
              >
                <option value="todos">Todos</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>

            {(search || statusFilter !== 'todos') && (
              <div className="flex items-end justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-400 transition hover:text-blue-300"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* RESULTADO */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-400">
          {filteredBrokers.length}{' '}
          {filteredBrokers.length === 1
            ? 'corretor encontrado'
            : 'corretores encontrados'}
        </p>
      </div>

      {/* LISTAGEM */}
      {filteredBrokers.length > 0 ? (
        viewMode === 'card' ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredBrokers.map((broker) => (
              <BrokerCard
                key={broker._id}
                broker={broker}
                onDelete={() => handleDelete(broker._id)}
                onView={() => navigate(`/broker-details/${broker._id}`)}
                onEdit={() => navigate(`/broker-edit/${broker._id}`)}
                loading={actionLoading === broker._id}
              />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-800 bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Corretor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Contato
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      CRECI
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredBrokers.map((broker) => (
                    <BrokerRow
                      key={broker._id}
                      broker={broker}
                      onDelete={() => handleDelete(broker._id)}
                      onView={() => navigate(`/broker-details/${broker._id}`)}
                      onEdit={() => navigate(`/broker-edit/${broker._id}`)}
                      loading={actionLoading === broker._id}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900">
          <Users size={42} className="mb-3 text-slate-600" />
          <h3 className="text-lg font-semibold text-white">
            Nenhum corretor encontrado
          </h3>
          <p className="mt-2 text-sm text-slate-400">
            {search || statusFilter !== 'todos'
              ? 'Tente ajustar os filtros de busca.'
              : 'Você ainda não tem corretores cadastrados.'}
          </p>
          {(search || statusFilter !== 'todos') && (
            <button
              onClick={clearFilters}
              className="mt-4 text-sm text-blue-400 transition hover:text-blue-300"
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/*
=====================================
BROKER CARD
=====================================
*/

function BrokerCard({ broker, onDelete, onView, onEdit, loading }) {
  const initials =
    broker.name
      ?.split(' ')
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || '?';

  return (
    <div className="group cursor-pointer rounded-2xl border border-slate-800 bg-slate-900 p-5 transition-all duration-300 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5">
      {/* PROFILE */}
      <div className="flex items-center gap-4">
        {broker.avatar ? (
          <img
            src={broker.avatar}
            alt={broker.name}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
            className="h-16 w-16 rounded-full border border-blue-500/40 object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-xl font-bold text-white">
            {initials}
          </div>
        )}

        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-white">
            {broker.name}
          </h2>
          {broker.position && (
            <p className="truncate text-sm text-slate-400">{broker.position}</p>
          )}
          <div className="mt-1">
            <StatusBadge isActive={broker.isActive} />
          </div>
        </div>
      </div>

      {/* DETAILS */}
      <div className="mt-5 space-y-3">
        <InfoRow
          icon={<Mail size={15} />}
          value={broker.email || 'Sem email'}
        />
        <InfoRow
          icon={<Phone size={15} />}
          value={broker.phone || 'Sem telefone'}
        />
        <InfoRow
          icon={<Award size={15} />}
          value={broker.creci ? `CRECI ${broker.creci}` : 'CRECI não informado'}
        />
        {broker.company && (
          <InfoRow icon={<Building2 size={15} />} value={broker.company} />
        )}
      </div>

      {/* ACTIONS */}
      <div className="mt-5 flex justify-between border-t border-slate-800 pt-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="flex items-center gap-2 text-sm text-blue-400 transition hover:text-blue-300"
        >
          <Edit size={15} />
          Editar
        </button>

        <div className="flex gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView();
            }}
            className="flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <Eye size={15} />
            Ver
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            disabled={loading}
            className="flex items-center gap-2 text-sm text-red-400 transition hover:text-red-300 disabled:opacity-50"
          >
            <Trash2 size={15} />
            {loading ? '...' : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  );
}

/*
=====================================
BROKER ROW
=====================================
*/

function BrokerRow({ broker, onDelete, onView, onEdit, loading }) {
  const initials =
    broker.name
      ?.split(' ')
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase() || '?';

  return (
    <tr className="transition hover:bg-slate-800/50">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {broker.avatar ? (
            <img
              src={broker.avatar}
              alt={broker.name}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
              className="h-10 w-10 rounded-full border border-blue-500/40 object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-sm font-bold text-white">
              {initials}
            </div>
          )}
          <div>
            <p className="font-medium text-white">{broker.name}</p>
            {broker.position && (
              <p className="text-xs text-slate-400">{broker.position}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Mail size={14} className="text-blue-400" />
            {broker.email || '-'}
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Phone size={14} className="text-green-400" />
            {broker.phone || '-'}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-slate-400">
        {broker.creci || '-'}
      </td>
      <td className="px-6 py-4">
        <StatusBadge isActive={broker.isActive} />
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <button
            onClick={onView}
            className="rounded-lg bg-slate-800 p-2 text-slate-400 transition hover:bg-blue-600 hover:text-white"
            title="Ver"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={onEdit}
            className="rounded-lg bg-slate-800 p-2 text-slate-400 transition hover:bg-emerald-600 hover:text-white"
            title="Editar"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={onDelete}
            disabled={loading}
            className="rounded-lg bg-slate-800 p-2 text-red-400 transition hover:bg-red-600 hover:text-white disabled:opacity-50"
            title="Excluir"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

/*
=====================================
STATUS BADGE
=====================================
*/

function StatusBadge({ isActive }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
        isActive
          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
          : 'border-red-500/20 bg-red-500/10 text-red-400'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-red-400'}`}
      />
      {isActive ? 'Ativo' : 'Inativo'}
    </span>
  );
}

/*
=====================================
METRIC CARD
=====================================
*/

const MetricCard = ({ icon, label, value, color }) => {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${color}`}
    >
      <div>{icon}</div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <strong className="text-lg text-white">{value}</strong>
      </div>
    </div>
  );
};

/*
=====================================
INFO ROW
=====================================
*/

const InfoRow = ({ icon, value }) => {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-400">
      <span className="text-slate-500">{icon}</span>
      <span className="truncate">{value}</span>
    </div>
  );
};

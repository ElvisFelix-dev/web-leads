import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ArrowLeft,
  Users,
  Search,
  UserRoundCheck,
  CheckSquare,
  Square,
  Send,
  ChevronDown,
  X,
  UserPlus,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Filter,
  User,
  Building2,
  BadgeCheck,
} from 'lucide-react';

import { toast } from 'react-toastify';

import api from '../service/api';

export default function AssignLeads() {
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);

  const [brokers, setBrokers] = useState([]);

  const [selectedLeads, setSelectedLeads] = useState([]);

  const [selectedBroker, setSelectedBroker] = useState('');

  const [brokerOpen, setBrokerOpen] = useState(false);

  const [brokerSearch, setBrokerSearch] = useState('');

  const [search, setSearch] = useState('');

  const [regionFilter, setRegionFilter] = useState('all');

  const [loading, setLoading] = useState(true);

  const [assigning, setAssigning] = useState(false);

  const brokerDropdownRef = useRef(null);

  // =========================================================

  // DERIVED

  // =========================================================

  const selectedBrokerData = useMemo(
    () => brokers.find((broker) => broker._id === selectedBroker),

    [brokers, selectedBroker],
  );

  const filteredBrokers = useMemo(() => {
    if (!brokerSearch.trim()) return brokers;

    const term = brokerSearch.toLowerCase();

    return brokers.filter(
      (b) =>
        b.name?.toLowerCase().includes(term) ||
        b.email?.toLowerCase().includes(term) ||
        b.position?.toLowerCase().includes(term),
    );
  }, [brokers, brokerSearch]);

  const filteredLeads = useMemo(() => {
    const term = search.toLowerCase().trim();

    return leads.filter((lead) => {
      const withoutBroker = !lead.assignedTo;

      if (!withoutBroker) return false;

      if (regionFilter !== 'all' && lead.region !== regionFilter) {
        return false;
      }

      if (!term) return true;

      return (
        lead.name?.toLowerCase().includes(term) ||
        lead.email?.toLowerCase().includes(term) ||
        lead.phone?.includes(term)
      );
    });
  }, [leads, search, regionFilter]);

  const availableRegions = useMemo(() => {
    const regions = new Set();

    leads.forEach((lead) => {
      if (!lead.assignedTo && lead.region) {
        regions.add(lead.region);
      }
    });

    return Array.from(regions).sort();
  }, [leads]);

  const allSelected =
    filteredLeads.length > 0 && selectedLeads.length === filteredLeads.length;

  // =========================================================

  // LOAD

  // =========================================================

  async function loadData() {
    try {
      const [leadsResponse, brokersResponse] = await Promise.all([
        api.get('/api/leads'),

        api.get('/api/users/brokers'),
      ]);

      setLeads(Array.isArray(leadsResponse.data) ? leadsResponse.data : []);

      setBrokers(brokersResponse.data.data || []);
    } catch (error) {
      console.error(error);

      toast.error('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // =========================================================

  // CLOSE BROKER DROPDOWN ON OUTSIDE CLICK

  // =========================================================

  useEffect(() => {
    if (!brokerOpen) return;

    const handleClickOutside = (event) => {
      if (
        brokerDropdownRef.current &&
        !brokerDropdownRef.current.contains(event.target)
      ) {
        setBrokerOpen(false);

        setBrokerSearch('');
      }
    };

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setBrokerOpen(false);

        setBrokerSearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    document.addEventListener('keydown', handleEsc);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);

      document.removeEventListener('keydown', handleEsc);
    };
  }, [brokerOpen]);

  // =========================================================

  // SELECTION

  // =========================================================

  function toggleLead(id) {
    setSelectedLeads((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function toggleAll() {
    if (allSelected) {
      setSelectedLeads([]);

      return;
    }

    setSelectedLeads(filteredLeads.map((lead) => lead._id));
  }

  function clearSelection() {
    setSelectedLeads([]);

    setSelectedBroker('');
  }

  // =========================================================

  // ASSIGN

  // =========================================================

  async function handleAssign() {
    if (!selectedBroker) {
      toast.warning('Selecione um corretor.');

      return;
    }

    if (selectedLeads.length === 0) {
      toast.warning('Selecione pelo menos um lead.');

      return;
    }

    try {
      setAssigning(true);

      await api.patch('/api/leads/assign', {
        leadIds: selectedLeads,

        userId: selectedBroker,
      });

      toast.success(
        `${selectedLeads.length} lead${selectedLeads.length > 1 ? 's' : ''} distribuído${selectedLeads.length > 1 ? 's' : ''} com sucesso!`,
      );

      clearSelection();

      loadData();
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || 'Erro ao distribuir leads.');
    } finally {
      setAssigning(false);
    }
  }

  // =========================================================

  // HELPERS

  // =========================================================

  const getInitials = (name = '') => {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (!parts.length) return '?';

    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  const formatRegion = (region) => {
    if (!region) return '-';

    return region

      .replace(/_/g, ' ')

      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatDate = (date) => {
    if (!date) return '-';

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) return '-';

    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',

      month: 'short',
    });
  };

  // =========================================================

  // LOADING

  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-slate-800" />

            <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-green-500 animate-spin" />

            <UserRoundCheck
              className="absolute inset-0 m-auto text-green-400"

              size={22}
            />
          </div>

          <p className="text-slate-400 text-sm font-medium">
            Carregando leads e corretores...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================

  // RENDER

  // =========================================================

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* BACKGROUND EFFECTS */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-500/[0.06] rounded-full blur-[120px]" />

        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/[0.06] rounded-full blur-[120px]" />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/[0.02] rounded-full blur-[150px]" />
      </div>

      <div className="relative p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
        {/* HEADER */}

        <header className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
                <div className="absolute inset-0 bg-green-500/20 rounded-2xl blur-xl" />

                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-green-500/20 border border-green-400/30">
                  <UserRoundCheck size={26} className="text-white" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Distribuir Leads
                  </h1>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-wider">
                    <Sparkles size={10} />
                    Premium
                  </span>
                </div>

                <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />

                    <span className="text-green-400 font-semibold">
                      {filteredLeads.length}
                    </span>

                    <span>
                      {filteredLeads.length === 1
                        ? 'lead disponível'
                        : 'leads disponíveis'}
                    </span>
                  </span>

                  {selectedLeads.length > 0 && (
                    <>
                      <span className="text-slate-700">•</span>

                      <span className="text-blue-400 font-semibold">
                        {selectedLeads.length} selecionado
                        {selectedLeads.length > 1 ? 's' : ''}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <StatCard
                icon={TrendingUp}

                label="Total"

                value={leads.length}

                color="text-blue-400"

                bg="bg-blue-500/10"

                border="border-blue-500/20"
              />

              <StatCard
                icon={UserPlus}

                label="Disponíveis"

                value={filteredLeads.length}

                color="text-green-400"

                bg="bg-green-500/10"

                border="border-green-500/20"
              />

              <StatCard
                icon={Users}

                label="Corretores"

                value={brokers.length}

                color="text-purple-400"

                bg="bg-purple-500/10"

                border="border-purple-500/20"
              />
            </div>
          </div>
        </header>

        {/* =====================================================

            BROKER SELECTOR

        ====================================================== */}

        <section className="relative z-30 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 mb-5 shadow-2xl shadow-black/20">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Users size={14} className="text-blue-400" />
            </div>

            <h2 className="text-white font-semibold text-sm">
              Corretor responsável
            </h2>

            <span className="text-[10px] text-slate-500 font-medium px-2 py-0.5 rounded-full bg-slate-800/50 border border-slate-700/50">
              {brokers.length} disponíveis
            </span>
          </div>

          <div className="relative" ref={brokerDropdownRef}>
            <button
              type="button"

              onClick={() => setBrokerOpen(!brokerOpen)}

              className={`

                group w-full flex items-center justify-between

                bg-slate-800/50 hover:bg-slate-800

                border rounded-xl px-4 py-3

                transition-all duration-200

                ${brokerOpen ? 'border-blue-500/50 ring-2 ring-blue-500/10' : 'border-slate-700'}

              `}
            >
              {selectedBrokerData ? (
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    {selectedBrokerData.avatar ? (
                      <img
                        src={selectedBrokerData.avatar}

                        alt={selectedBrokerData.name}

                        className="w-11 h-11 rounded-xl object-cover border-2 border-blue-500/30"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm border-2 border-blue-400/30">
                        {getInitials(selectedBrokerData.name)}
                      </div>
                    )}

                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
                  </div>

                  <div className="text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold text-sm truncate">
                        {selectedBrokerData.name}
                      </p>

                      <BadgeCheck
                        size={14}

                        className="text-blue-400 shrink-0"
                      />
                    </div>

                    <p className="text-xs text-blue-400 truncate">
                      {selectedBrokerData.position || 'Corretor'}
                    </p>

                    <p className="text-[11px] text-slate-500 truncate">
                      {selectedBrokerData.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-700/50 border border-dashed border-slate-600 flex items-center justify-center">
                    <UserPlus size={18} className="text-slate-500" />
                  </div>

                  <div className="text-left">
                    <p className="text-slate-300 font-medium text-sm">
                      Selecione um corretor
                    </p>

                    <p className="text-[11px] text-slate-500">
                      Clique para escolher da lista
                    </p>
                  </div>
                </div>
              )}

              <ChevronDown
                size={18}

                className={`

                  text-slate-400 shrink-0 ml-2

                  transition-transform duration-200

                  ${brokerOpen ? 'rotate-180' : ''}

                `}
              />
            </button>

            {/* Dropdown */}

            {brokerOpen && (
              <div className="absolute z-[9999] mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Search inside dropdown */}

                <div className="p-2 border-b border-slate-800 bg-slate-950/50">
                  <div className="relative">
                    <Search
                      size={14}

                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                      type="text"

                      value={brokerSearch}

                      onChange={(e) => setBrokerSearch(e.target.value)}

                      placeholder="Buscar corretor..."

                      autoFocus

                      className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none focus:border-blue-500/50 transition"
                    />
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto">
                  {filteredBrokers.length === 0 ? (
                    <div className="p-6 text-center">
                      <User size={24} className="mx-auto text-slate-600 mb-2" />

                      <p className="text-xs text-slate-500">
                        Nenhum corretor encontrado
                      </p>
                    </div>
                  ) : (
                    filteredBrokers.map((broker) => (
                      <button
                        key={broker._id}

                        type="button"

                        onClick={() => {
                          setSelectedBroker(broker._id);

                          setBrokerOpen(false);

                          setBrokerSearch('');
                        }}

                        className={`

                          w-full flex items-center gap-3 px-4 py-3

                          hover:bg-slate-800/80

                          transition text-left

                          ${selectedBroker === broker._id ? 'bg-blue-500/5 border-l-2 border-blue-500' : ''}

                        `}
                      >
                        {broker.avatar ? (
                          <img
                            src={broker.avatar}

                            alt={broker.name}

                            className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold text-xs border border-slate-700 shrink-0">
                            {getInitials(broker.name)}
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium text-xs truncate">
                            {broker.name}
                          </p>

                          <p className="text-[10px] text-blue-400 truncate">
                            {broker.position || 'Corretor'}
                          </p>

                          <p className="text-[10px] text-slate-500 truncate">
                            {broker.email}
                          </p>
                        </div>

                        {selectedBroker === broker._id && (
                          <CheckCircle2
                            size={16}

                            className="text-blue-400 shrink-0"
                          />
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* =====================================================

            FILTERS — relative z-10 para ficar ABAIXO do dropdown

        ====================================================== */}

        <section className="relative z-10 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-4 mb-5">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative group">
              <Search
                size={16}

                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition"
              />

              <input
                value={search}

                onChange={(e) => setSearch(e.target.value)}

                placeholder="Buscar lead por nome, email ou telefone..."

                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-11 pr-10 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition"
              />

              {search && (
                <button
                  onClick={() => setSearch('')}

                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="relative min-w-[200px]">
              <MapPin
                size={16}

                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              />

              <select
                value={regionFilter}

                onChange={(e) => setRegionFilter(e.target.value)}

                className="w-full appearance-none bg-slate-950/50 border border-slate-800 rounded-xl pl-11 pr-10 py-3 text-sm text-white outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 transition cursor-pointer"
              >
                <option value="all">Todas as regiões</option>

                {availableRegions.map((region) => (
                  <option key={region} value={region}>
                    {formatRegion(region)}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}

                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
              />
            </div>
          </div>
        </section>

        {/* =====================================================

            ACTION BAR — relative z-10

        ====================================================== */}

        <section className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleAll}

              disabled={filteredLeads.length === 0}

              className={`

                group flex items-center gap-2 px-4 py-2.5 rounded-xl

                font-medium text-sm transition-all duration-200

                disabled:opacity-40 disabled:cursor-not-allowed

                ${
                  allSelected
                    ? 'bg-green-500/15 border border-green-500/30 text-green-400 hover:bg-green-500/20'
                    : 'bg-slate-800/50 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                }

              `}
            >
              {allSelected ? (
                <>
                  <CheckSquare size={16} />
                  Desmarcar todos
                </>
              ) : (
                <>
                  <Square size={16} />
                  Selecionar todos
                </>
              )}
            </button>

            {selectedLeads.length > 0 && (
              <button
                onClick={clearSelection}

                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/50 transition"
              >
                <X size={14} />
                Limpar
              </button>
            )}
          </div>

          <button
            onClick={handleAssign}

            disabled={
              assigning || selectedLeads.length === 0 || !selectedBroker
            }

            className={`

              group relative flex items-center justify-center gap-2

              px-6 py-3 rounded-xl font-semibold text-sm

              transition-all duration-200 overflow-hidden

              disabled:opacity-40 disabled:cursor-not-allowed

              ${
                selectedLeads.length > 0 && selectedBroker
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40'
                  : 'bg-slate-800 text-slate-500'
              }

            `}
          >
            {selectedLeads.length > 0 && selectedBroker && !assigning && (
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            )}

            <span className="relative flex items-center gap-2">
              {assigning ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Distribuindo...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Distribuir
                  {selectedLeads.length > 0 && (
                    <span className="ml-1 px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-bold">
                      {selectedLeads.length}
                    </span>
                  )}
                </>
              )}
            </span>
          </button>
        </section>

        {/* LEADS LIST */}

        {filteredLeads.length === 0 ? (
          <EmptyState hasFilters={search || regionFilter !== 'all'} />
        ) : (
          <section className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/20">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-slate-950/80 border-b border-slate-800">
                  <tr>
                    <th className="p-4 text-left w-14">
                      <button
                        onClick={toggleAll}

                        className="text-slate-400 hover:text-white transition"
                      >
                        {allSelected ? (
                          <CheckSquare size={18} className="text-green-400" />
                        ) : (
                          <Square size={18} />
                        )}
                      </button>
                    </th>

                    <th className="p-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Lead
                    </th>

                    <th className="p-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Contato
                    </th>

                    <th className="p-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Região
                    </th>

                    <th className="p-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Origem
                    </th>

                    <th className="p-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Data
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLeads.map((lead, index) => {
                    const isSelected = selectedLeads.includes(lead._id);

                    return (
                      <tr
                        key={lead._id}

                        onClick={() => toggleLead(lead._id)}

                        className={`

                          border-b border-slate-800/50 cursor-pointer

                          transition-all duration-150

                          ${
                            isSelected
                              ? 'bg-green-500/[0.06] hover:bg-green-500/[0.09]'
                              : 'hover:bg-slate-800/40'
                          }

                        `}

                        style={{ animationDelay: `${index * 20}ms` }}
                      >
                        <td className="p-4">
                          <div
                            className={`

                              w-5 h-5 rounded-md border-2 flex items-center justify-center

                              transition-all duration-200

                              ${
                                isSelected
                                  ? 'bg-green-500 border-green-500'
                                  : 'border-slate-600 hover:border-slate-500'
                              }

                            `}
                          >
                            {isSelected && (
                              <CheckCircle2 size={12} className="text-white" />
                            )}
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`

                                w-10 h-10 rounded-xl flex items-center justify-center

                                font-bold text-xs shrink-0 border

                                ${
                                  isSelected
                                    ? 'bg-green-500/20 border-green-500/40 text-green-400'
                                    : 'bg-slate-800 border-slate-700 text-slate-400'
                                }

                              `}
                            >
                              {getInitials(lead.name)}
                            </div>

                            <div className="min-w-0">
                              <p className="text-white font-semibold text-sm truncate max-w-[200px]">
                                {lead.name || 'Sem nome'}
                              </p>

                              <p className="text-[11px] text-slate-500 truncate">
                                {lead.property?.name || 'Sem imóvel vinculado'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-slate-300">
                              <Mail size={11} className="text-slate-500" />

                              <span className="truncate max-w-[180px]">
                                {lead.email || 'Sem email'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                              <Phone size={11} className="text-slate-500" />

                              <span>{lead.phone || 'Sem telefone'}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4">
                          {lead.region ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-medium">
                              <MapPin size={10} />

                              {formatRegion(lead.region)}
                            </span>
                          ) : (
                            <span className="text-slate-600 text-xs">
                              Não definida
                            </span>
                          )}
                        </td>

                        <td className="p-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-medium">
                            <Building2 size={10} />

                            {lead.source || 'manual'}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Calendar size={11} className="text-slate-500" />

                            {formatDate(lead.createdAt)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-950/50 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
              <p className="text-xs text-slate-500">
                Mostrando{' '}
                <span className="text-slate-300 font-semibold">
                  {filteredLeads.length}
                </span>{' '}
                {filteredLeads.length === 1 ? 'lead' : 'leads'}
                {search || regionFilter !== 'all' ? ' (filtrado)' : ''}
              </p>

              {selectedLeads.length > 0 && (
                <p className="text-xs text-green-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 size={12} />
                  {selectedLeads.length} selecionado
                  {selectedLeads.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// =========================================================

// SUBCOMPONENTS

// =========================================================

function StatCard({ icon: Icon, label, value, color, bg, border }) {
  return (
    <div
      className={`

        flex items-center gap-3 px-4 py-2.5 rounded-xl

        ${bg} border ${border}

        backdrop-blur-sm

        transition-all duration-200

        hover:scale-[1.02]

      `}
    >
      <div
        className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}
      >
        <Icon size={14} className={color} />
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
          {label}
        </p>

        <p className={`text-lg font-bold ${color} leading-none mt-0.5`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function EmptyState({ hasFilters }) {
  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl p-12 text-center">
      <div className="mx-auto w-20 h-20 rounded-2xl bg-slate-800/50 border border-slate-700 flex items-center justify-center mb-4">
        {hasFilters ? (
          <Filter size={32} className="text-slate-600" />
        ) : (
          <CheckCircle2 size={32} className="text-green-500/50" />
        )}
      </div>

      <h3 className="text-lg font-semibold text-white mb-2">
        {hasFilters ? 'Nenhum lead encontrado' : 'Tudo distribuído! 🎉'}
      </h3>

      <p className="text-sm text-slate-400 max-w-md mx-auto">
        {hasFilters
          ? 'Tente ajustar os filtros ou limpar a busca para ver mais leads.'
          : 'Não há leads pendentes no momento. Todos já foram atribuídos aos corretores.'}
      </p>

      {hasFilters && (
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
          <AlertCircle size={12} />
          Ajuste os filtros para ver mais resultados
        </div>
      )}
    </div>
  );
}

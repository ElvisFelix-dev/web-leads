import { Filter, Search, X, Flame, Clock } from 'lucide-react';

const BrokerPipelineFilters = ({ filters, setFilters }) => {
  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearch = (e) => {
    setFilters({
      ...filters,
      search: e.target.value,
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      priority: '',
      region: '',
      source: '',
      noContact: false,
    });
  };

  const activeFilters = Object.values(filters).filter(Boolean).length;

  const selectClass = `
    w-full
    rounded-lg
    border
    border-slate-700
    bg-slate-800
    px-3
    py-2
    text-sm
    text-slate-200
    outline-none
    transition
    focus:border-blue-500
  `;

  const quickButton = `
    flex
    items-center
    gap-2
    rounded-lg
    border
    px-3
    py-2
    text-sm
    transition
  `;

  return (
    <div
      className="
        mb-6
        rounded-xl
        border
        border-slate-700
        bg-slate-900
        p-4
        shadow-xl
      "
    >
      {/* HEADER */}

      <div
        className="
          mb-4
          flex
          items-center
          justify-between
        "
      >
        <div
          className="
            flex
            items-center
            gap-2
            text-white
          "
        >
          <Filter size={18} className="text-blue-400" />

          <span
            className="
              font-medium
            "
          >
            Filtros
          </span>

          {activeFilters > 0 && (
            <span
              className="
                rounded-full
                bg-blue-500/20
                px-2
                py-0.5
                text-xs
                text-blue-400
              "
            >
              {activeFilters}
            </span>
          )}
        </div>

        {activeFilters > 0 && (
          <button
            onClick={clearFilters}

            className="
              flex
              items-center
              gap-1
              text-sm
              text-slate-400
              hover:text-white
            "
          >
            <X size={15} />
            Limpar
          </button>
        )}
      </div>

      {/* SELECTS */}

      <div
        className="
          grid
          gap-4
          md:grid-cols-2
          lg:grid-cols-4
        "
      >
        <select
          name="status"

          value={filters.status || ''}

          onChange={handleChange}

          className={selectClass}
        >
          <option value="">Todos status</option>

          <option value="novo">Novo</option>

          <option value="em andamento">Em andamento</option>

          <option value="convertido">Convertido</option>

          <option value="perdido">Perdido</option>
        </select>

        <select
          name="priority"

          value={filters.priority || ''}

          onChange={handleChange}

          className={selectClass}
        >
          <option value="">Todas prioridades</option>

          <option value="high">🔥 Alta</option>

          <option value="medium">Média</option>

          <option value="low">Baixa</option>
        </select>

        <select
          name="region"

          value={filters.region || ''}

          onChange={handleChange}

          className={selectClass}
        >
          <option value="">Todas regiões</option>

          <option value="central">Central</option>

          <option value="zona norte">Zona Norte</option>

          <option value="zona sul">Zona Sul</option>

          <option value="zona leste">Zona Leste</option>

          <option value="zona oeste">Zona Oeste</option>
        </select>

        <select
          name="source"

          value={filters.source || ''}

          onChange={handleChange}

          className={selectClass}
        >
          <option value="">Todas origens</option>

          <option value="manual">Manual</option>

          <option value="meta">Meta Ads</option>

          <option value="zap">Zap</option>

          <option value="olx">OLX</option>

          <option value="CSV">CSV</option>
        </select>
      </div>

      {/* QUICK FILTERS */}

      <div
        className="
          mt-4
          flex
          flex-wrap
          gap-3
        "
      >
        <button
          onClick={() => {
            setFilters({
              ...filters,
              priority: 'high',
            });
          }}

          className={`
            ${quickButton}
            border-red-500/30
            bg-red-500/10
            text-red-400
          `}
        >
          <Flame size={16} />
          Leads quentes
        </button>

        <button
          onClick={() => {
            setFilters({
              ...filters,
              noContact: true,
            });
          }}

          className={`
            ${quickButton}
            border-yellow-500/30
            bg-yellow-500/10
            text-yellow-400
          `}
        >
          <Clock size={16} />
          Sem contato
        </button>
      </div>
    </div>
  );
};

export default BrokerPipelineFilters;

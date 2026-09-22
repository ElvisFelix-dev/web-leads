import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Filter, UserRound, X } from 'lucide-react';

const PipelineFilters = ({
  filters,
  setFilters,
  brokers = [],
  loadingBrokers = false,
}) => {
  const [brokerDropdownOpen, setBrokerDropdownOpen] = useState(false);

  const brokerDropdownRef = useRef(null);

  /*
  =====================================
  CHANGE FILTER
  =====================================
  */

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  /*
  =====================================
  CLEAR FILTERS
  =====================================
  */

  const clearFilters = () => {
    setFilters({
      region: '',
      status: '',
      source: '',
      assignedTo: '',
      priority: '',
    });

    setBrokerDropdownOpen(false);
  };

  /*
  =====================================
  CLOSE BROKER DROPDOWN
  =====================================
  */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        brokerDropdownRef.current &&
        !brokerDropdownRef.current.contains(event.target)
      ) {
        setBrokerDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /*
  =====================================
  ACTIVE FILTERS
  =====================================
  */

  const activeFilters = Object.values(filters).filter(Boolean).length;

  /*
  =====================================
  SELECT STYLE
  =====================================
  */

  const selectClass = `
    w-full
    rounded-lg
    border
    border-slate-700
    bg-slate-800
    px-3
    py-2.5
    text-sm
    text-slate-200
    outline-none
    transition
    hover:border-slate-600
    focus:border-blue-500
    focus:ring-1
    focus:ring-blue-500
  `;

  /*
  =====================================
  BROKER
  =====================================
  */

  const selectedBroker = brokers.find(
    (broker) => String(broker._id || broker.id) === String(filters.assignedTo),
  );

  /*
  =====================================
  BROKER AVATAR
  =====================================
  */

  const getInitials = (name = '') => {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  };

  const getAvatar = (broker) => {
    return broker?.avatar || broker?.avatarUrl || broker?.profileImage || '';
  };

  /*
  =====================================
  BROKER OPTION
  =====================================
  */

  const renderBrokerAvatar = (broker, size = 'normal') => {
    const avatar = getAvatar(broker);

    const sizeClass =
      size === 'small' ? 'h-8 w-8 text-[10px]' : 'h-9 w-9 text-xs';

    if (avatar) {
      return (
        <img
          src={avatar}
          alt={broker?.name || 'Corretor'}
          className={`${sizeClass} shrink-0 rounded-full object-cover ring-1 ring-white/10`}
        />
      );
    }

    return (
      <div
        className={`
          ${sizeClass}
          flex
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-blue-500/15
          font-semibold
          text-blue-400
          ring-1
          ring-blue-500/20
        `}
      >
        {getInitials(broker?.name)}
      </div>
    );
  };

  /*
  =====================================
  SELECT BROKER
  =====================================
  */

  const handleBrokerSelect = (brokerId) => {
    setFilters({
      ...filters,
      assignedTo: brokerId,
    });

    setBrokerDropdownOpen(false);
  };

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
            text-slate-200
          "
        >
          <Filter size={18} className="text-blue-400" />

          <span className="font-medium">Filtros</span>

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
            type="button"
            onClick={clearFilters}
            className="
              flex
              items-center
              gap-1
              text-sm
              text-slate-400
              transition
              hover:text-white
            "
          >
            <X size={15} />
            Limpar
          </button>
        )}
      </div>

      {/* FILTERS */}

      <div
        className="
          grid
          gap-4
          md:grid-cols-2
          lg:grid-cols-5
        "
      >
        {/* REGION */}

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
          <option value="abc">ABC</option>
        </select>

        {/* STATUS */}

        <select
          name="status"
          value={filters.status || ''}
          onChange={handleChange}
          className={selectClass}
        >
          <option value="">Todos Status</option>
          <option value="novo">Novo</option>
          <option value="em andamento">Em andamento</option>
          <option value="convertido">Convertido</option>
          <option value="perdido">Perdido</option>
        </select>

        {/* SOURCE */}

        <select
          name="source"
          value={filters.source || ''}
          onChange={handleChange}
          className={selectClass}
        >
          <option value="">Todas Origens</option>
          <option value="manual">Manual</option>
          <option value="meta">Meta Ads</option>
          <option value="zap">Zap</option>
          <option value="olx">OLX</option>
          <option value="csv">CSV</option>
        </select>

        {/* PRIORITY */}

        <select
          name="priority"
          value={filters.priority || ''}
          onChange={handleChange}
          className={selectClass}
        >
          <option value="">Todas prioridades</option>
          <option value="high">Alta</option>
          <option value="medium">Média</option>
          <option value="low">Baixa</option>
        </select>

        {/* ASSIGNED BROKER */}

        <div ref={brokerDropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setBrokerDropdownOpen((current) => !current)}
            className={`
              flex
              w-full
              items-center
              justify-between
              gap-3
              rounded-lg
              border
              border-slate-700
              bg-slate-800
              px-3
              py-2
              text-left
              outline-none
              transition
              hover:border-slate-600
              focus:border-blue-500
              focus:ring-1
              focus:ring-blue-500
              ${selectedBroker ? 'text-slate-100' : 'text-slate-400'}
            `}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              {selectedBroker ? (
                renderBrokerAvatar(selectedBroker, 'small')
              ) : (
                <div
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-slate-700
                    text-slate-400
                  "
                >
                  <UserRound size={15} />
                </div>
              )}

              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {selectedBroker ? selectedBroker.name : 'Todos corretores'}
                </p>

                {selectedBroker?.position && (
                  <p className="truncate text-[11px] text-slate-500">
                    {selectedBroker.position}
                  </p>
                )}
              </div>
            </div>

            <ChevronDown
              size={16}
              className={`
                shrink-0
                text-slate-400
                transition-transform
                ${brokerDropdownOpen ? 'rotate-180' : ''}
              `}
            />
          </button>

          {brokerDropdownOpen && (
            <div
              className="
                absolute
                left-0
                right-0
                z-50
                mt-2
                overflow-hidden
                rounded-xl
                border
                border-slate-700
                bg-slate-900
                shadow-2xl
                shadow-black/40
              "
            >
              {/* ALL BROKERS */}

              <button
                type="button"
                onClick={() => handleBrokerSelect('')}
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  border-b
                  border-slate-800
                  px-3
                  py-2.5
                  text-left
                  transition
                  hover:bg-slate-800
                "
              >
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-slate-800
                    text-slate-400
                  "
                >
                  <UserRound size={16} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-200">
                    Todos corretores
                  </p>

                  <p className="text-[11px] text-slate-500">
                    Visualizar todos os leads
                  </p>
                </div>

                {!filters.assignedTo && (
                  <Check size={16} className="text-blue-400" />
                )}
              </button>

              {/* LOADING */}

              {loadingBrokers && (
                <div className="px-4 py-4 text-center text-sm text-slate-500">
                  Carregando corretores...
                </div>
              )}

              {/* BROKERS */}

              {!loadingBrokers &&
                brokers.length > 0 &&
                brokers.map((broker) => {
                  const brokerId = broker._id || broker.id;

                  const isSelected =
                    String(filters.assignedTo) === String(brokerId);

                  return (
                    <button
                      key={brokerId}
                      type="button"
                      onClick={() => handleBrokerSelect(brokerId)}
                      className={`
                        flex
                        w-full
                        items-center
                        gap-3
                        px-3
                        py-2.5
                        text-left
                        transition
                        hover:bg-slate-800
                        ${isSelected ? 'bg-blue-500/10' : ''}
                      `}
                    >
                      {renderBrokerAvatar(broker, 'normal')}

                      <div className="min-w-0 flex-1">
                        <p
                          className={`
                            truncate
                            text-sm
                            font-medium
                            ${isSelected ? 'text-blue-300' : 'text-slate-200'}
                          `}
                        >
                          {broker.name || 'Corretor'}
                        </p>

                        <p className="truncate text-[11px] text-slate-500">
                          {broker.position || 'Corretor de imóveis'}
                        </p>
                      </div>

                      {isSelected && (
                        <Check size={16} className="shrink-0 text-blue-400" />
                      )}
                    </button>
                  );
                })}

              {/* EMPTY */}

              {!loadingBrokers && brokers.length === 0 && (
                <div
                  className="
                      px-4
                      py-5
                      text-center
                      text-sm
                      text-slate-500
                    "
                >
                  Nenhum corretor encontrado.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PipelineFilters;

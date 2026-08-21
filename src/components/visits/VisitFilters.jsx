import { useMemo } from 'react';
import {
  Search,
  CalendarDays,
  Filter,
  RotateCcw,
  ArrowDownUp,
  ChevronDown,
  X,
  SlidersHorizontal,
  Home,
  UserRound,
  BriefcaseBusiness,
  Clock3,
  CheckCircle2,
  CircleAlert,
  CalendarCheck2,
} from 'lucide-react';

export default function VisitFilters({ filters = {}, setFilters, onClear }) {
  // ============================================================
  // DEFAULTS
  // ============================================================

  const currentFilters = {
    search: '',
    status: '',
    startDate: '',
    endDate: '',
    order: 'asc',
    type: '',
    ...filters,
  };

  // ============================================================
  // CHANGE
  // ============================================================

  const handleChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ============================================================
  // CLEAR
  // ============================================================

  const clearFilters = () => {
    if (onClear) {
      onClear();
      return;
    }

    setFilters({
      search: '',
      status: '',
      startDate: '',
      endDate: '',
      order: 'asc',
      type: '',
    });
  };

  // ============================================================
  // ACTIVE FILTERS
  // ============================================================

  const activeFilters = useMemo(() => {
    const list = [];

    if (currentFilters.search) {
      list.push({
        key: 'search',
        label: `Busca: ${currentFilters.search}`,
      });
    }

    if (currentFilters.status) {
      const statusLabel =
        statusOptions.find((item) => item.value === currentFilters.status)
          ?.label || currentFilters.status;

      list.push({
        key: 'status',
        label: statusLabel,
      });
    }

    if (currentFilters.type) {
      const typeLabel =
        typeOptions.find((item) => item.value === currentFilters.type)?.label ||
        currentFilters.type;

      list.push({
        key: 'type',
        label: typeLabel,
      });
    }

    if (currentFilters.startDate) {
      list.push({
        key: 'startDate',
        label: `De ${formatDate(currentFilters.startDate)}`,
      });
    }

    if (currentFilters.endDate) {
      list.push({
        key: 'endDate',
        label: `Até ${formatDate(currentFilters.endDate)}`,
      });
    }

    return list;
  }, [
    currentFilters.search,
    currentFilters.status,
    currentFilters.type,
    currentFilters.startDate,
    currentFilters.endDate,
  ]);

  const hasFilters = activeFilters.length > 0;

  // ============================================================
  // REMOVE INDIVIDUAL FILTER
  // ============================================================

  const removeFilter = (key) => {
    handleChange(key, '');
  };

  // ============================================================
  // QUICK DATE FILTERS
  // ============================================================

  const applyDatePreset = (preset) => {
    const today = new Date();

    const formatInputDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    };

    if (preset === 'today') {
      const value = formatInputDate(today);

      setFilters((prev) => ({
        ...prev,
        startDate: value,
        endDate: value,
      }));

      return;
    }

    if (preset === 'tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const value = formatInputDate(tomorrow);

      setFilters((prev) => ({
        ...prev,
        startDate: value,
        endDate: value,
      }));

      return;
    }

    if (preset === 'week') {
      const start = new Date(today);

      const day = start.getDay();

      const diff = day === 0 ? -6 : 1 - day;

      start.setDate(start.getDate() + diff);

      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      setFilters((prev) => ({
        ...prev,
        startDate: formatInputDate(start),
        endDate: formatInputDate(end),
      }));

      return;
    }

    if (preset === 'month') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);

      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);

      setFilters((prev) => ({
        ...prev,
        startDate: formatInputDate(start),
        endDate: formatInputDate(end),
      }));
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <section
      className="
        group
        relative
        overflow-hidden
        rounded-[28px]
        border
        border-gray-800/80
        bg-gradient-to-br
        from-gray-900
        via-gray-900
        to-gray-950
        shadow-2xl
        shadow-black/20
      "
    >
      {/* ======================================================
          PREMIUM BACKGROUND
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -right-24
          -top-24
          h-64
          w-64
          rounded-full
          bg-blue-500/[0.07]
          blur-3xl
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-32
          -left-24
          h-64
          w-64
          rounded-full
          bg-violet-500/[0.035]
          blur-3xl
        "
      />

      {/* TOP ACCENT */}

      <div
        className="
          pointer-events-none
          absolute
          inset-x-0
          top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-blue-500/50
          to-transparent
        "
      />

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div
        className="
          relative
          flex
          flex-col
          gap-5
          border-b
          border-gray-800/80
          p-5
          sm:p-6
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        {/* TITLE */}

        <div className="flex items-center gap-4">
          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-2xl
              border
              border-blue-500/20
              bg-blue-500/10
              text-blue-400
              shadow-lg
              shadow-blue-500/5
            "
          >
            <SlidersHorizontal size={20} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2
                className="
                  text-base
                  font-bold
                  tracking-tight
                  text-white
                  sm:text-lg
                "
              >
                Controle da agenda
              </h2>

              {hasFilters && (
                <span
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    border-blue-500/20
                    bg-blue-500/10
                    px-2.5
                    py-1
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-wider
                    text-blue-400
                  "
                >
                  <Filter size={10} />
                  {activeFilters.length}{' '}
                  {activeFilters.length === 1
                    ? 'filtro ativo'
                    : 'filtros ativos'}
                </span>
              )}
            </div>

            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              Encontre rapidamente seus compromissos, visitas e atividades.
            </p>
          </div>
        </div>

        {/* CLEAR */}

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="
              group/clear
              inline-flex
              items-center
              justify-center
              gap-2
              self-start
              rounded-xl
              border
              border-gray-800
              bg-gray-950/80
              px-3.5
              py-2.5
              text-xs
              font-semibold
              text-gray-400
              transition
              hover:border-red-500/20
              hover:bg-red-500/5
              hover:text-red-400
              lg:self-auto
            "
          >
            <RotateCcw
              size={13}
              className="
                transition-transform
                duration-300
                group-hover/clear:-rotate-90
              "
            />
            Limpar filtros
          </button>
        )}
      </div>

      {/* ======================================================
          FILTER CONTENT
      ====================================================== */}

      <div className="relative p-5 sm:p-6">
        {/* ====================================================
            QUICK FILTERS
        ==================================================== */}

        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <CalendarCheck2 size={13} className="text-gray-500" />

            <span
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-gray-500
              "
            >
              Período rápido
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <QuickFilter
              label="Hoje"
              onClick={() => applyDatePreset('today')}
              active={
                currentFilters.startDate === currentFilters.endDate &&
                currentFilters.startDate === getTodayString()
              }
            />

            <QuickFilter
              label="Amanhã"
              onClick={() => applyDatePreset('tomorrow')}
            />

            <QuickFilter
              label="Esta semana"
              onClick={() => applyDatePreset('week')}
            />

            <QuickFilter
              label="Este mês"
              onClick={() => applyDatePreset('month')}
            />
          </div>
        </div>

        {/* ====================================================
            MAIN FILTERS
        ==================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-4
            md:grid-cols-2
            xl:grid-cols-12
          "
        >
          {/* SEARCH */}

          <div className="space-y-2 xl:col-span-4">
            <FieldLabel icon={Search} label="Busca" />

            <div className="relative">
              <Search
                size={16}
                className="
                  pointer-events-none
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-600
                "
              />

              <input
                type="text"
                value={currentFilters.search}
                onChange={(event) => handleChange('search', event.target.value)}
                placeholder="Buscar por cliente, imóvel ou compromisso..."
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-gray-800
                  bg-gray-950/80
                  pl-11
                  pr-10
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-gray-600
                  transition
                  focus:border-blue-500/40
                  focus:bg-gray-950
                  focus:ring-4
                  focus:ring-blue-500/[0.08]
                "
              />

              {currentFilters.search && (
                <button
                  type="button"
                  onClick={() => handleChange('search', '')}
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
                    text-gray-600
                    transition
                    hover:bg-gray-800
                    hover:text-white
                  "
                  aria-label="Limpar busca"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* TYPE */}

          <div className="space-y-2 xl:col-span-2">
            <FieldLabel icon={CalendarDays} label="Tipo" />

            <SelectField
              value={currentFilters.type}
              onChange={(value) => handleChange('type', value)}
              options={typeOptions}
              placeholder="Todos"
            />
          </div>

          {/* STATUS */}

          <div className="space-y-2 xl:col-span-2">
            <FieldLabel icon={CircleAlert} label="Status" />

            <SelectField
              value={currentFilters.status}
              onChange={(value) => handleChange('status', value)}
              options={statusOptions}
              placeholder="Todos"
            />
          </div>

          {/* ORDER */}

          <div className="space-y-2 xl:col-span-4">
            <FieldLabel icon={ArrowDownUp} label="Ordenação" />

            <SelectField
              value={currentFilters.order || 'asc'}
              onChange={(value) => handleChange('order', value)}
              options={[
                {
                  value: 'asc',
                  label: 'Mais próximos primeiro',
                },
                {
                  value: 'desc',
                  label: 'Mais distantes primeiro',
                },
              ]}
              placeholder="Ordenar"
            />
          </div>

          {/* START DATE */}

          <div className="space-y-2 xl:col-span-3">
            <FieldLabel icon={CalendarDays} label="Data inicial" />

            <DateField
              value={currentFilters.startDate}
              onChange={(value) => handleChange('startDate', value)}
            />
          </div>

          {/* END DATE */}

          <div className="space-y-2 xl:col-span-3">
            <FieldLabel icon={CalendarDays} label="Data final" />

            <DateField
              value={currentFilters.endDate}
              onChange={(value) => handleChange('endDate', value)}
            />
          </div>
        </div>

        {/* ====================================================
            ACTIVE FILTERS
        ==================================================== */}

        {hasFilters && (
          <div
            className="
              mt-6
              border-t
              border-gray-800/80
              pt-5
            "
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="
                  mr-1
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-wider
                  text-gray-600
                "
              >
                Aplicados:
              </span>

              {activeFilters.map((filter) => (
                <button
                  key={filter.key}
                  type="button"
                  onClick={() => removeFilter(filter.key)}
                  className="
                    group/tag
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-gray-800
                    bg-gray-950
                    px-3
                    py-1.5
                    text-xs
                    font-medium
                    text-gray-300
                    transition
                    hover:border-blue-500/20
                    hover:bg-blue-500/5
                    hover:text-white
                  "
                >
                  {filter.label}

                  <X
                    size={11}
                    className="
                      text-gray-600
                      transition
                      group-hover/tag:text-blue-400
                    "
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================
// FIELD LABEL
// ============================================================

function FieldLabel({ icon: Icon, label }) {
  return (
    <label
      className="
        flex
        items-center
        gap-2
        text-[10px]
        font-bold
        uppercase
        tracking-[0.14em]
        text-gray-500
      "
    >
      <Icon size={12} />

      {label}
    </label>
  );
}

// ============================================================
// SELECT
// ============================================================

function SelectField({ value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="
          h-12
          w-full
          appearance-none
          rounded-xl
          border
          border-gray-800
          bg-gray-950/80
          px-4
          pr-10
          text-sm
          text-gray-200
          outline-none
          transition
          hover:border-gray-700
          focus:border-blue-500/40
          focus:ring-4
          focus:ring-blue-500/[0.08]
        "
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        size={15}
        className="
          pointer-events-none
          absolute
          right-4
          top-1/2
          -translate-y-1/2
          text-gray-600
        "
      />
    </div>
  );
}

// ============================================================
// DATE FIELD
// ============================================================

function DateField({ value, onChange }) {
  return (
    <div className="relative">
      <CalendarDays
        size={15}
        className="
          pointer-events-none
          absolute
          left-4
          top-1/2
          -translate-y-1/2
          text-gray-600
        "
      />

      <input
        type="date"
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
        className="
          h-12
          w-full
          rounded-xl
          border
          border-gray-800
          bg-gray-950/80
          px-4
          pl-11
          text-sm
          text-gray-200
          outline-none
          transition
          hover:border-gray-700
          focus:border-blue-500/40
          focus:ring-4
          focus:ring-blue-500/[0.08]
          [color-scheme:dark]
        "
      />
    </div>
  );
}

// ============================================================
// QUICK FILTER
// ============================================================

function QuickFilter({ label, onClick, active = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        inline-flex
        items-center
        gap-2
        rounded-xl
        border
        px-3.5
        py-2
        text-xs
        font-semibold
        transition-all
        duration-200
        ${
          active
            ? `
              border-blue-500/30
              bg-blue-500/10
              text-blue-400
              shadow-lg
              shadow-blue-500/5
            `
            : `
              border-gray-800
              bg-gray-950/70
              text-gray-500
              hover:border-gray-700
              hover:bg-gray-800
              hover:text-gray-200
            `
        }
      `}
    >
      <Clock3 size={12} />

      {label}
    </button>
  );
}

// ============================================================
// OPTIONS
// ============================================================

const typeOptions = [
  {
    value: 'visit',
    label: 'Visitas',
  },
  {
    value: 'meeting',
    label: 'Reuniões',
  },
  {
    value: 'call',
    label: 'Ligações',
  },
  {
    value: 'online_meeting',
    label: 'Reuniões online',
  },
  {
    value: 'proposal',
    label: 'Propostas',
  },
  {
    value: 'negotiation',
    label: 'Negociações',
  },
  {
    value: 'internal',
    label: 'Compromissos internos',
  },
  {
    value: 'other',
    label: 'Outros',
  },
];

const statusOptions = [
  {
    value: 'agendada',
    label: 'Agendada',
  },
  {
    value: 'confirmada',
    label: 'Confirmada',
  },
  {
    value: 'realizada',
    label: 'Realizada',
  },
  {
    value: 'cancelada',
    label: 'Cancelada',
  },
  {
    value: 'nao_compareceu',
    label: 'Não compareceu',
  },
];

// ============================================================
// HELPERS
// ============================================================

function formatDate(value) {
  if (!value) return '';

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('pt-BR');
}

function getTodayString() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

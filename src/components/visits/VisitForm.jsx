import { useEffect, useMemo, useState } from 'react';

import {
  AlertCircle,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Link2,
  MapPin,
  User,
  Video,
} from 'lucide-react';

// ============================================================
// TIPOS
// ============================================================

const VISIT_TYPES = [
  {
    value: 'visit',
    label: 'Visita ao imóvel',
    description: 'Visita presencial com o cliente',
  },
  {
    value: 'meeting',
    label: 'Reunião',
    description: 'Reunião presencial',
  },
  {
    value: 'call',
    label: 'Ligação',
    description: 'Ligação com cliente ou contato',
  },
  {
    value: 'online_meeting',
    label: 'Reunião online',
    description: 'Google Meet, Zoom ou similar',
  },
  {
    value: 'proposal',
    label: 'Apresentação de proposta',
    description: 'Apresentação ou discussão de proposta',
  },
  {
    value: 'negotiation',
    label: 'Negociação',
    description: 'Negociação com cliente',
  },
  {
    value: 'internal',
    label: 'Compromisso interno',
    description: 'Reunião interna da imobiliária',
  },
  {
    value: 'other',
    label: 'Outro',
    description: 'Outro tipo de compromisso',
  },
];

// ============================================================
// COMPONENT
// ============================================================

export default function VisitForm({
  initialData = {},
  leads = [],
  properties = [],
  loading = false,
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState({
    type: 'visit',
    title: '',
    lead: '',
    property: '',
    date: '',
    endDate: '',
    location: '',
    address: '',
    meetingUrl: '',
    notes: '',
    reminderEnabled: true,
    reminderMinutes: 30,
  });

  // ============================================================
  // LEAD SELECIONADO
  // ============================================================

  const selectedLead = useMemo(() => {
    if (!form.lead) return null;

    return leads.find((item) => String(item._id) === String(form.lead)) || null;
  }, [form.lead, leads]);

  // ============================================================
  // IMÓVEL SELECIONADO
  // ============================================================

  const selectedProperty = useMemo(() => {
    if (!form.property) return null;

    return (
      properties.find((item) => String(item._id) === String(form.property)) ||
      null
    );
  }, [form.property, properties]);

  // ============================================================
  // CARREGAR EDIÇÃO
  // ============================================================

  useEffect(() => {
    if (!initialData || Object.keys(initialData).length === 0) {
      setForm({
        type: 'visit',
        title: '',
        lead: '',
        property: '',
        date: '',
        endDate: '',
        location: '',
        address: '',
        meetingUrl: '',
        notes: '',
        reminderEnabled: true,
        reminderMinutes: 30,
      });

      return;
    }

    const propertyId = initialData.property?._id || initialData.property || '';

    const property =
      properties.find((item) => String(item._id) === String(propertyId)) ||
      initialData.property ||
      null;

    const automaticAddress = buildPropertyAddress(property);

    setForm({
      type: initialData.type || 'visit',

      title: initialData.title || '',

      lead: initialData.lead?._id || initialData.lead || '',

      property: propertyId,

      date: formatDateTimeLocal(initialData.date || initialData.scheduledAt),

      endDate: formatDateTimeLocal(initialData.endDate),

      location: initialData.location || '',

      address: initialData.address || automaticAddress || '',

      meetingUrl: initialData.meetingUrl || '',

      notes: initialData.notes || '',

      reminderEnabled: initialData.reminder?.enabled ?? true,

      reminderMinutes: initialData.reminder?.minutesBefore ?? 30,
    });
  }, [initialData, properties]);

  // ============================================================
  // ALTERAR CAMPO
  // ============================================================

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // ============================================================
  // ALTERAR IMÓVEL
  // ============================================================

  const handlePropertyChange = (propertyId) => {
    const property =
      properties.find((item) => String(item._id) === String(propertyId)) ||
      null;

    const address = buildPropertyAddress(property);

    setForm((prev) => ({
      ...prev,
      property: propertyId,
      address: address || prev.address,
    }));
  };

  // ============================================================
  // TIPO
  // ============================================================

  const selectedType =
    VISIT_TYPES.find((item) => item.value === form.type) || VISIT_TYPES[0];

  const isVisit = form.type === 'visit';

  const isOnlineMeeting = form.type === 'online_meeting';

  const needsLocation = [
    'visit',
    'meeting',
    'proposal',
    'negotiation',
    'other',
  ].includes(form.type);

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.date) {
      return;
    }

    const payload = {
      type: form.type,

      title: form.title.trim(),

      lead: form.lead || null,

      property: form.property || null,

      date: form.date,

      endDate: form.endDate || null,

      location: form.location.trim(),

      address: form.address.trim(),

      meetingUrl: form.meetingUrl.trim(),

      notes: form.notes.trim(),

      reminder: {
        enabled: form.reminderEnabled,
        minutesBefore: Number(form.reminderMinutes || 0),
      },
    };

    onSubmit?.(payload);
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ==================================================
          TIPO
      ================================================== */}

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">
          Tipo de compromisso
        </label>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {VISIT_TYPES.map((item) => {
            const active = form.type === item.value;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => handleChange('type', item.value)}
                className={`
                  rounded-xl
                  border
                  p-3
                  text-left
                  transition
                  ${
                    active
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-800 bg-gray-950/40 hover:border-gray-700'
                  }
                `}
              >
                <div
                  className={`text-sm font-semibold ${
                    active ? 'text-blue-400' : 'text-gray-200'
                  }`}
                >
                  {item.label}
                </div>

                <div className="mt-1 text-xs text-gray-500">
                  {item.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ==================================================
          TÍTULO
      ================================================== */}

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-300">
          Título
        </label>

        <input
          type="text"
          value={form.title}
          onChange={(event) => handleChange('title', event.target.value)}
          placeholder={`Ex.: ${selectedType.label}`}
          maxLength={150}
          className={inputClass}
        />

        <p className="mt-1 text-xs text-gray-500">
          Se deixar vazio, o sistema criará um título automaticamente.
        </p>
      </div>

      {/* ==================================================
          DATA E HORÁRIO
      ================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>
            <CalendarDays size={15} className="text-blue-400" />
            Início
          </label>

          <input
            type="datetime-local"
            value={form.date}
            onChange={(event) => handleChange('date', event.target.value)}
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>
            <Clock3 size={15} className="text-blue-400" />
            Término
          </label>

          <input
            type="datetime-local"
            value={form.endDate}
            onChange={(event) => handleChange('endDate', event.target.value)}
            className={inputClass}
          />

          <p className="mt-1 text-xs text-gray-500">
            Se não informar, será considerado 60 minutos.
          </p>
        </div>
      </div>

      {/* ==================================================
          LEAD
      ================================================== */}

      <div>
        <label className={labelClass}>
          <User size={15} className="text-blue-400" />
          Cliente / Lead
          <span className="ml-auto text-xs text-gray-600">opcional</span>
        </label>

        <select
          value={form.lead}
          onChange={(event) => handleChange('lead', event.target.value)}
          className={inputClass}
        >
          <option value="">Nenhum lead</option>

          {leads.map((lead) => (
            <option key={lead._id} value={lead._id}>
              {lead.name}

              {lead.phone ? ` — ${lead.phone}` : ''}
            </option>
          ))}
        </select>

        {selectedLead && (
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-blue-500/10 bg-blue-500/5 p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
              <User size={17} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-200">
                {selectedLead.name}
              </p>

              {selectedLead.email && (
                <p className="truncate text-xs text-gray-500">
                  {selectedLead.email}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ==================================================
          IMÓVEL
      ================================================== */}

      <div>
        <label className={labelClass}>
          <Building2 size={15} className="text-blue-400" />
          Imóvel
          <span className="ml-auto text-xs text-gray-600">opcional</span>
        </label>

        <select
          value={form.property}
          onChange={(event) => handlePropertyChange(event.target.value)}
          className={inputClass}
        >
          <option value="">Nenhum imóvel</option>

          {properties.map((property) => (
            <option key={property._id} value={property._id}>
              {property.name}

              {property.code ? ` — ${property.code}` : ''}
            </option>
          ))}
        </select>

        {selectedProperty && (
          <div className="mt-3 rounded-xl border border-gray-800 bg-gray-950/60 p-4">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <Building2 size={18} />
              </div>

              <div className="min-w-0">
                <p className="font-medium text-gray-200">
                  {selectedProperty.name}
                </p>

                {selectedProperty.code && (
                  <p className="mt-1 text-xs text-gray-500">
                    Código: {selectedProperty.code}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================
          LOCAL
      ================================================== */}

      {needsLocation && (
        <div>
          <label className={labelClass}>
            <MapPin size={15} className="text-emerald-400" />
            Local
          </label>

          <input
            type="text"
            value={form.location}
            onChange={(event) => handleChange('location', event.target.value)}
            placeholder={
              isVisit
                ? 'Ex.: Imóvel / escritório / local da visita'
                : 'Ex.: Escritório, café, imobiliária...'
            }
            className={inputClass}
          />

          {form.property && form.address && (
            <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex gap-3">
                <MapPin
                  size={18}
                  className="mt-0.5 shrink-0 text-emerald-400"
                />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    Endereço do imóvel
                  </p>

                  <p className="mt-1 text-sm text-gray-200">{form.address}</p>

                  <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                    <CheckCircle2 size={13} className="text-emerald-500" />
                    Preenchido automaticamente
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================
          ENDEREÇO
      ================================================== */}

      {needsLocation && (
        <div>
          <label className={labelClass}>
            <MapPin size={15} className="text-gray-500" />
            Endereço
          </label>

          <input
            type="text"
            value={form.address}
            onChange={(event) => handleChange('address', event.target.value)}
            placeholder="Endereço completo"
            className={inputClass}
          />
        </div>
      )}

      {/* ==================================================
          REUNIÃO ONLINE
      ================================================== */}

      {isOnlineMeeting && (
        <div>
          <label className={labelClass}>
            <Video size={15} className="text-purple-400" />
            Link da reunião
          </label>

          <div className="relative">
            <Link2
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              type="url"
              value={form.meetingUrl}
              onChange={(event) =>
                handleChange('meetingUrl', event.target.value)
              }
              placeholder="https://meet.google.com/..."
              className={`${inputClass} pl-10`}
            />
          </div>
        </div>
      )}

      {/* ==================================================
          OBSERVAÇÕES
      ================================================== */}

      <div>
        <label className={labelClass}>
          <FileText size={15} className="text-blue-400" />
          Observações
        </label>

        <textarea
          rows={4}
          value={form.notes}
          onChange={(event) => handleChange('notes', event.target.value)}
          placeholder="Adicione informações importantes sobre o compromisso..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* ==================================================
          LEMBRETE
      ================================================== */}

      <div className="rounded-2xl border border-gray-800 bg-gray-950/50 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-200">Lembrete</p>

            <p className="mt-1 text-xs text-gray-500">
              Receber lembrete antes do compromisso.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              handleChange('reminderEnabled', !form.reminderEnabled)
            }
            className={`
              relative
              h-6
              w-11
              rounded-full
              transition
              ${form.reminderEnabled ? 'bg-blue-600' : 'bg-gray-700'}
            `}
          >
            <span
              className={`
                absolute
                top-1
                h-4
                w-4
                rounded-full
                bg-white
                transition
                ${form.reminderEnabled ? 'left-6' : 'left-1'}
              `}
            />
          </button>
        </div>

        {form.reminderEnabled && (
          <div className="mt-4">
            <select
              value={form.reminderMinutes}
              onChange={(event) =>
                handleChange('reminderMinutes', event.target.value)
              }
              className={inputClass}
            >
              <option value={5}>5 minutos antes</option>

              <option value={15}>15 minutos antes</option>

              <option value={30}>30 minutos antes</option>

              <option value={60}>1 hora antes</option>

              <option value={120}>2 horas antes</option>

              <option value={1440}>1 dia antes</option>
            </select>
          </div>
        )}
      </div>

      {/* ==================================================
          RESUMO
      ================================================== */}

      {form.date && (
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-blue-400">
            Resumo do compromisso
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <CalendarDays
                size={15}
                className="mt-0.5 shrink-0 text-gray-500"
              />

              <span className="text-gray-300">
                {formatReadableDate(form.date)}
              </span>
            </div>

            <div className="flex gap-2">
              <Clock3 size={15} className="mt-0.5 shrink-0 text-gray-500" />

              <span className="text-gray-300">{selectedType.label}</span>
            </div>

            {selectedLead && (
              <div className="flex gap-2">
                <User size={15} className="mt-0.5 shrink-0 text-gray-500" />

                <span className="text-gray-300">{selectedLead.name}</span>
              </div>
            )}

            {selectedProperty && (
              <div className="flex gap-2">
                <Building2
                  size={15}
                  className="mt-0.5 shrink-0 text-gray-500"
                />

                <span className="text-gray-300">{selectedProperty.name}</span>
              </div>
            )}

            {form.address && (
              <div className="flex gap-2">
                <MapPin size={15} className="mt-0.5 shrink-0 text-gray-500" />

                <span className="text-gray-300">{form.address}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================
          AVISO
      ================================================== */}

      {!form.date && (
        <div className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-400" />

          <div>
            <p className="text-sm font-medium text-amber-300">
              Escolha a data e horário
            </p>

            <p className="mt-1 text-xs text-amber-300/70">
              Depois você poderá adicionar lead, imóvel, local e outras
              informações.
            </p>
          </div>
        </div>
      )}

      {/* ==================================================
          AÇÕES
      ================================================== */}

      <div className="flex justify-end gap-3 border-t border-gray-800 pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="
            rounded-xl
            bg-gray-800
            px-5
            py-2.5
            text-sm
            font-medium
            text-gray-300
            transition
            hover:bg-gray-700
            hover:text-white
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={loading || !form.date}
          className="
            rounded-xl
            bg-blue-600
            px-6
            py-2.5
            text-sm
            font-semibold
            text-white
            shadow-lg
            shadow-blue-600/20
            transition
            hover:bg-blue-700
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {loading
            ? 'Salvando...'
            : initialData?._id
              ? 'Salvar alterações'
              : 'Agendar compromisso'}
        </button>
      </div>
    </form>
  );
}

// ============================================================
// STYLES
// ============================================================

const inputClass = `
  w-full
  rounded-xl
  border
  border-gray-700
  bg-gray-800
  px-4
  py-3
  text-white
  outline-none
  transition
  focus:border-blue-500
  focus:ring-2
  focus:ring-blue-500/20
`;

const labelClass = `
  mb-2
  flex
  items-center
  gap-2
  text-sm
  font-medium
  text-gray-300
`;

// ============================================================
// ADDRESS
// ============================================================

function buildPropertyAddress(property) {
  if (!property) {
    return '';
  }

  if (typeof property.address === 'string' && property.address.trim()) {
    return property.address.trim();
  }

  if (typeof property.fullAddress === 'string' && property.fullAddress.trim()) {
    return property.fullAddress.trim();
  }

  const location = property.location;

  if (!location) {
    return '';
  }

  const street = location.street || location.rua || '';

  const number = location.number || location.numero || '';

  const complement = location.complement || location.complemento || '';

  const district =
    location.district || location.neighborhood || location.bairro || '';

  const city = location.city || location.cidade || '';

  const state = location.state || location.estado || '';

  const zipCode = location.zipCode || location.zip || location.cep || '';

  let firstLine = [street, number].filter(Boolean).join(', ');

  if (complement) {
    firstLine = firstLine ? `${firstLine} - ${complement}` : complement;
  }

  const secondLine = [district, city, state].filter(Boolean).join(' - ');

  const result = [firstLine, secondLine].filter(Boolean).join(' • ');

  if (zipCode) {
    return result
      ? `${result} • CEP ${formatCep(zipCode)}`
      : `CEP ${formatCep(zipCode)}`;
  }

  return result;
}

// ============================================================
// DATETIME LOCAL
// ============================================================

function formatDateTimeLocal(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, '0');

  const day = String(date.getDate()).padStart(2, '0');

  const hours = String(date.getHours()).padStart(2, '0');

  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// ============================================================
// DATA LEGÍVEL
// ============================================================

function formatReadableDate(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ============================================================
// CEP
// ============================================================

function formatCep(value) {
  const cep = String(value).replace(/\D/g, '');

  if (cep.length !== 8) {
    return value;
  }

  return `${cep.slice(0, 5)}-${cep.slice(5)}`;
}

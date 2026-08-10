import { useEffect, useMemo, useState } from 'react';

import {
  MapPin,
  Building2,
  User,
  CalendarDays,
  FileText,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function VisitForm({
  initialData = {},
  leads = [],
  properties = [],
  loading = false,
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState({
    lead: '',
    property: '',
    scheduledAt: '',
    address: '',
    notes: '',
  });

  // =====================================
  // LOCALIZAR LEAD
  // =====================================

  const selectedLead = useMemo(() => {
    if (!form.lead) return null;

    return leads.find((item) => String(item._id) === String(form.lead)) || null;
  }, [form.lead, leads]);

  // =====================================
  // LOCALIZAR IMÓVEL
  // =====================================

  const selectedProperty = useMemo(() => {
    if (!form.property) return null;

    return (
      properties.find((item) => String(item._id) === String(form.property)) ||
      null
    );
  }, [form.property, properties]);

  // =====================================
  // CARREGAR EDIÇÃO
  // =====================================

  useEffect(() => {
    if (!initialData || Object.keys(initialData).length === 0) {
      setForm({
        lead: '',
        property: '',
        scheduledAt: '',
        address: '',
        notes: '',
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
      lead: initialData.lead?._id || initialData.lead || '',

      property: propertyId,

      scheduledAt: formatDateTimeLocal(
        initialData.scheduledAt || initialData.date,
      ),

      address: automaticAddress || initialData.address || '',

      notes: initialData.notes || '',
    });
  }, [initialData, properties]);

  // =====================================
  // ALTERAR CAMPO
  // =====================================

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // =====================================
  // SELECIONAR IMÓVEL
  // =====================================

  const handlePropertyChange = (propertyId) => {
    const property =
      properties.find((item) => String(item._id) === String(propertyId)) ||
      null;

    const address = buildPropertyAddress(property);

    setForm((prev) => ({
      ...prev,
      property: propertyId,
      address,
    }));
  };

  // =====================================
  // SUBMIT
  // =====================================

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.lead) {
      return;
    }

    if (!form.property) {
      return;
    }

    if (!form.scheduledAt) {
      return;
    }

    onSubmit?.({
      lead: form.lead,
      property: form.property,
      date: form.scheduledAt,
      address: form.address,
      notes: form.notes,
    });
  };

  // =====================================
  // RENDER
  // =====================================

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ==================================================
          LEAD
      ================================================== */}

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
          <User size={15} className="text-blue-400" />
          Cliente / Lead
        </label>

        <select
          value={form.lead}
          onChange={(event) => handleChange('lead', event.target.value)}
          className="
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
          "
          required
        >
          <option value="">Selecione um lead</option>

          {leads.map((lead) => (
            <option key={lead._id} value={lead._id}>
              {lead.name}
              {lead.phone ? ` — ${lead.phone}` : ''}
            </option>
          ))}
        </select>

        {/* RESUMO DO LEAD */}

        {selectedLead && (
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-blue-500/10 bg-blue-500/5 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
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
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
          <Building2 size={15} className="text-blue-400" />
          Imóvel
        </label>

        <select
          value={form.property}
          onChange={(event) => handlePropertyChange(event.target.value)}
          className="
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
          "
          required
        >
          <option value="">Selecione um imóvel</option>

          {properties.map((property) => (
            <option key={property._id} value={property._id}>
              {property.name}
              {property.code ? ` — ${property.code}` : ''}
            </option>
          ))}
        </select>

        {/* ==================================================
            RESUMO DO IMÓVEL
        ================================================== */}

        {selectedProperty && (
          <div className="mt-3 rounded-xl border border-gray-800 bg-gray-950/60 p-4">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <Building2 size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium text-gray-200">
                    {selectedProperty.name}
                  </p>

                  {selectedProperty.code && (
                    <span className="rounded-md bg-gray-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                      {selectedProperty.code}
                    </span>
                  )}
                </div>

                {selectedProperty.type && (
                  <p className="mt-1 text-xs text-gray-500">
                    {selectedProperty.type}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==================================================
          ENDEREÇO DO IMÓVEL
      ================================================== */}

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
          <MapPin size={15} className="text-emerald-400" />
          Endereço da visita
        </label>

        {form.property ? (
          form.address ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <MapPin size={19} />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    Local da visita
                  </p>

                  <p className="mt-1 text-sm leading-6 text-gray-200">
                    {form.address}
                  </p>

                  <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                    <CheckCircle2 size={13} className="text-emerald-500" />
                    Endereço preenchido automaticamente pelo imóvel
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex gap-3">
                <AlertCircle
                  size={18}
                  className="mt-0.5 shrink-0 text-amber-400"
                />

                <div>
                  <p className="text-sm font-medium text-amber-300">
                    Endereço não cadastrado
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-300/70">
                    Este imóvel não possui endereço cadastrado. Atualize o
                    cadastro do imóvel antes de realizar a visita.
                  </p>
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-700 bg-gray-950/40 p-5 text-center">
            <MapPin size={22} className="mx-auto text-gray-600" />

            <p className="mt-2 text-sm text-gray-500">
              Selecione um imóvel para visualizar o endereço.
            </p>
          </div>
        )}

        <input type="hidden" value={form.address} readOnly />
      </div>

      {/* ==================================================
          DATA E HORÁRIO
      ================================================== */}

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
          <CalendarDays size={15} className="text-blue-400" />
          Data e horário
        </label>

        <input
          type="datetime-local"
          value={form.scheduledAt}
          onChange={(event) => handleChange('scheduledAt', event.target.value)}
          className="
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
          "
          required
        />

        <p className="mt-2 text-xs text-gray-500">
          Escolha o dia e horário em que o lead visitará o imóvel.
        </p>
      </div>

      {/* ==================================================
          OBSERVAÇÕES
      ================================================== */}

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
          <FileText size={15} className="text-blue-400" />
          Observações
        </label>

        <textarea
          rows={4}
          value={form.notes}
          onChange={(event) => handleChange('notes', event.target.value)}
          placeholder="Ex.: Cliente pediu para conhecer a área externa, verificar vagas de garagem..."
          className="
            w-full
            resize-none
            rounded-xl
            border
            border-gray-700
            bg-gray-800
            px-4
            py-3
            text-white
            outline-none
            transition
            placeholder:text-gray-600
            focus:border-blue-500
            focus:ring-2
            focus:ring-blue-500/20
          "
        />
      </div>

      {/* ==================================================
          RESUMO DA VISITA
      ================================================== */}

      {form.lead && form.property && form.scheduledAt && (
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-blue-400">
            Resumo da visita
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <User size={15} className="mt-0.5 shrink-0 text-gray-500" />

              <span className="text-gray-300">
                {selectedLead?.name || 'Lead selecionado'}
              </span>
            </div>

            <div className="flex items-start gap-2">
              <Building2 size={15} className="mt-0.5 shrink-0 text-gray-500" />

              <span className="text-gray-300">
                {selectedProperty?.name || 'Imóvel selecionado'}
              </span>
            </div>

            <div className="flex items-start gap-2">
              <CalendarDays
                size={15}
                className="mt-0.5 shrink-0 text-gray-500"
              />

              <span className="text-gray-300">
                {formatReadableDate(form.scheduledAt)}
              </span>
            </div>

            {form.address && (
              <div className="flex items-start gap-2">
                <MapPin size={15} className="mt-0.5 shrink-0 text-gray-500" />

                <span className="text-gray-300">{form.address}</span>
              </div>
            )}
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
          disabled={loading || !form.address}
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
          {loading ? 'Salvando...' : 'Salvar visita'}
        </button>
      </div>
    </form>
  );
}

// ============================================================
// HELPERS
// ============================================================

function buildPropertyAddress(property) {
  if (!property) {
    return '';
  }

  // ------------------------------------------
  // Formatos diretos
  // ------------------------------------------

  if (typeof property.address === 'string' && property.address.trim()) {
    return property.address.trim();
  }

  if (typeof property.fullAddress === 'string' && property.fullAddress.trim()) {
    return property.fullAddress.trim();
  }

  // ------------------------------------------
  // Localização estruturada
  // ------------------------------------------

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

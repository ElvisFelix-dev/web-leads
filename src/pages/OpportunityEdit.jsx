import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronDown,
  DollarSign,
  FileText,
  Home,
  Loader2,
  Save,
  Target,
  User,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import api from '../service/api';

const STAGES = [
  { value: 'nova', label: 'Nova' },
  { value: 'qualificacao', label: 'Qualificação' },
  { value: 'imovel_definido', label: 'Imóvel definido' },
  { value: 'visita_realizada', label: 'Visita realizada' },
  { value: 'interesse_confirmado', label: 'Interesse confirmado' },
  { value: 'proposta_solicitada', label: 'Proposta solicitada' },
  { value: 'proposta_enviada', label: 'Proposta enviada' },
  { value: 'negociacao', label: 'Negociação' },
  { value: 'ganha', label: 'Ganha' },
  { value: 'perdida', label: 'Perdida' },
];

const TYPES = [
  { value: 'venda', label: 'Venda' },
  { value: 'locacao', label: 'Locação' },
];

const TEMPERATURES = [
  { value: 'frio', label: 'Frio' },
  { value: 'morno', label: 'Morno' },
  { value: 'quente', label: 'Quente' },
];

const PRIORITIES = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
];

const EMPTY_FORM = {
  title: '',
  description: '',
  lead: '',
  property: '',
  assignedTo: '',
  type: 'venda',
  stage: 'nova',
  temperature: 'morno',
  priority: 'media',
  estimatedValue: '',
  expectedClosingValue: '',
  probability: 20,
  expectedClosingDate: '',
  nextAction: '',
  nextActionAt: '',
  notes: '',
};

function extractArray(response, keys = []) {
  const root = response?.data;

  if (Array.isArray(root)) return root;

  for (const key of keys) {
    if (Array.isArray(root?.[key])) return root[key];
    if (Array.isArray(root?.data?.[key])) return root.data[key];
  }

  if (Array.isArray(root?.data)) return root.data;
  if (Array.isArray(root?.items)) return root.items;
  if (Array.isArray(root?.data?.items)) return root.data.items;
  if (Array.isArray(root?.data?.data)) return root.data.data;

  return [];
}

function getEntityId(value) {
  if (!value) return '';
  if (typeof value === 'object') {
    return String(value._id || value.id || '');
  }
  return String(value);
}

function getEntityName(value, fallback = 'Sem nome') {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  return value.name || value.title || value.email || fallback;
}

function toInputDate(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

function toInputDateTime(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  // datetime-local espera o horário local, sem Z ou offset.
  const pad = (number) => String(number).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatCurrencyInput(value) {
  if (value === null || value === undefined || value === '') return '';

  const digits = String(value)
    .replace(/\D/g, '')
    .replace(/^0+(?=\d)/, '');

  if (!digits) return '';

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(digits) / 100);
}

function formatExistingCurrency(value) {
  if (value === null || value === undefined || value === '') return '';

  const number = Number(value);
  if (!Number.isFinite(number)) return '';

  return formatCurrencyInput(String(Math.round(number * 100)));
}

function currencyToNumber(value) {
  if (!value) return 0;

  const normalized = String(value).replace(/\./g, '').replace(',', '.');

  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

function getApiError(error) {
  const data = error?.response?.data;

  if (Array.isArray(data?.errors)) {
    return data.errors.map((item) => item.message || item).join(' ');
  }

  if (data?.errors && typeof data.errors === 'object') {
    return Object.values(data.errors)
      .map((item) => item?.message || item)
      .join(' ');
  }

  return (
    data?.message || error?.message || 'Não foi possível concluir a operação.'
  );
}

function normalizeOpportunity(response) {
  const root = response?.data;

  // Compatível com respostas { data: opportunity },
  // { opportunity } e { data: { data: opportunity } }.
  return (
    root?.data?.opportunity ||
    root?.data?.data ||
    root?.opportunity ||
    root?.data ||
    root
  );
}

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/10 bg-blue-500/10 text-blue-400">
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function Field({ label, required, hint, error, children }) {
  return (
    <div className="min-w-0">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-medium text-gray-300">
          {label}
          {required && <span className="ml-1 text-blue-400">*</span>}
        </label>
        {hint && <span className="text-[11px] text-gray-600">{hint}</span>}
      </div>

      {children}

      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}

const inputClass = (error = '') =>
  `h-11 w-full rounded-xl border ${
    error ? 'border-red-500/50' : 'border-white/10'
  } bg-gray-950 px-3 text-sm text-white outline-none transition
   placeholder:text-gray-600 focus:border-blue-500/60 focus:ring-2
   focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60`;

function Select({ value, onChange, children, error, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`${inputClass(error)} appearance-none pr-10`}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
    </div>
  );
}

function MoneyInput({ value, onChange }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
        R$
      </span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(formatCurrencyInput(event.target.value))}
        placeholder="0,00"
        className={`${inputClass()} pl-10`}
      />
    </div>
  );
}

function DateInput({ value, onChange, type = 'date' }) {
  return (
    <div className="relative">
      <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${inputClass()} pl-10`}
      />
    </div>
  );
}

export default function OpportunityEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [leads, setLeads] = useState([]);
  const [properties, setProperties] = useState([]);
  const [brokers, setBrokers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const loadPage = useCallback(async () => {
    if (!id) {
      setError('O ID da oportunidade não foi informado na URL.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [
        opportunityResponse,
        leadsResponse,
        propertiesResponse,
        brokersResponse,
      ] = await Promise.all([
        api.get(`/api/opportunities/${id}`),
        api.get('/api/leads'),
        api.get('/api/properties', { params: { page: 1, limit: 100 } }),
        api.get('/api/brokers'),
      ]);

      const opportunity = normalizeOpportunity(opportunityResponse);

      if (!opportunity || !(opportunity._id || opportunity.id)) {
        throw new Error('A API não retornou os dados da oportunidade.');
      }

      const loadedLeads = extractArray(leadsResponse, ['leads', 'items']);
      const loadedProperties = extractArray(propertiesResponse, [
        'properties',
        'items',
      ]);
      const loadedBrokers = extractArray(brokersResponse, [
        'brokers',
        'users',
        'items',
      ]);

      setLeads(loadedLeads);
      setProperties(loadedProperties);
      setBrokers(loadedBrokers);

      setForm({
        title: opportunity.title || '',
        description: opportunity.description || '',
        lead: getEntityId(opportunity.lead),
        property: getEntityId(opportunity.property),
        assignedTo: getEntityId(opportunity.assignedTo),
        type: opportunity.type || 'venda',
        stage: opportunity.stage || 'nova',
        temperature: opportunity.temperature || 'morno',
        priority: opportunity.priority || 'media',
        estimatedValue: formatExistingCurrency(opportunity.estimatedValue),
        expectedClosingValue: formatExistingCurrency(
          opportunity.expectedClosingValue,
        ),
        probability: opportunity.probability ?? 20,
        expectedClosingDate: toInputDate(opportunity.expectedClosingDate),
        nextAction: opportunity.nextAction || '',
        nextActionAt: toInputDateTime(opportunity.nextActionAt),
        notes: opportunity.notes || '',
      });
    } catch (requestError) {
      console.error('Erro ao carregar oportunidade:', requestError);
      setError(getApiError(requestError));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const selectedLead = useMemo(
    () => leads.find((item) => String(item._id) === String(form.lead)),
    [leads, form.lead],
  );

  const selectedProperty = useMemo(
    () => properties.find((item) => String(item._id) === String(form.property)),
    [properties, form.property],
  );

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSuccess(false);

    setFieldErrors((current) => {
      const next = { ...current };
      delete next[field];
      return next;
    });

    if (error) setError('');
  };

  const validate = () => {
    const errors = {};

    if (!form.title.trim()) {
      errors.title = 'Informe o título da oportunidade.';
    } else if (form.title.trim().length < 3) {
      errors.title = 'O título deve ter pelo menos 3 caracteres.';
    }

    if (!form.lead) errors.lead = 'Selecione o lead relacionado.';
    if (!form.assignedTo) {
      errors.assignedTo = 'Selecione o corretor responsável.';
    }

    const probability = Number(form.probability);
    if (
      form.probability === '' ||
      !Number.isFinite(probability) ||
      probability < 0 ||
      probability > 100
    ) {
      errors.probability = 'Informe uma probabilidade entre 0 e 100%.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess(false);

    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      lead: form.lead,
      property: form.property || null,
      assignedTo: form.assignedTo,
      type: form.type,
      stage: form.stage,
      temperature: form.temperature,
      priority: form.priority,
      estimatedValue: currencyToNumber(form.estimatedValue),
      expectedClosingValue: currencyToNumber(form.expectedClosingValue),
      probability: Number(form.probability),
      expectedClosingDate: form.expectedClosingDate || null,
      nextAction: form.nextAction.trim(),
      nextActionAt: form.nextActionAt
        ? new Date(form.nextActionAt).toISOString()
        : null,
      notes: form.notes.trim(),
    };

    try {
      setSaving(true);

      await api.patch(`/api/opportunities/${id}`, payload);

      setSuccess(true);

      // Mantém a pessoa na tela de edição por um instante, com confirmação.
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (requestError) {
      console.error('Erro ao atualizar oportunidade:', requestError);
      setError(getApiError(requestError));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-gray-950 px-4 text-white">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10">
            <Loader2 className="h-7 w-7 animate-spin text-blue-400" />
          </div>
          <p className="mt-4 text-sm font-medium">Carregando oportunidade...</p>
          <p className="mt-1 text-xs text-gray-500">
            Buscando os dados para edição.
          </p>
        </div>
      </div>
    );
  }

  if (error && !form.title && !form.lead) {
    return (
      <div className="min-h-screen bg-gray-950 px-4 py-12 text-white">
        <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-gray-900/70 p-6 sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-400/20 bg-red-500/10 text-red-400">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-xl font-bold">
            Não foi possível abrir a oportunidade
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-400">{error}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadPage}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </button>
            <button
              type="button"
              onClick={() => navigate('/opportunities')}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
            >
              Voltar para oportunidades
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-7">
          <button
            type="button"
            onClick={() => navigate(`/opportunities/${id}`)}
            className="mb-5 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para oportunidade
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/10 bg-blue-500/10">
              <Target className="h-6 w-6 text-blue-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight">
                Editar oportunidade
              </h1>
              <p className="mt-1 text-sm text-gray-400">
                Atualize os dados e acompanhe a evolução do negócio.
              </p>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">
                Não foi possível salvar as alterações.
              </p>
              <p className="mt-1 text-red-300/80">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-200">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">Alterações salvas!</p>
              <p className="mt-1 text-blue-200/70">
                A oportunidade foi atualizada com sucesso.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/opportunities/${id}`)}
              className="shrink-0 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-500"
            >
              Ver oportunidade
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <section className="rounded-2xl border border-white/10 bg-gray-900/70 p-5 sm:p-6">
            <SectionHeader
              icon={Target}
              title="Identificação"
              description="Informações principais da oportunidade."
            />

            <div className="mt-6 space-y-5">
              <Field label="Título" required error={fieldErrors.title}>
                <input
                  value={form.title}
                  onChange={(event) =>
                    handleChange('title', event.target.value)
                  }
                  placeholder="Ex.: Compra de apartamento para família"
                  className={inputClass(fieldErrors.title)}
                />
              </Field>

              <Field label="Descrição" hint="Opcional">
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    handleChange('description', event.target.value)
                  }
                  rows={4}
                  placeholder="Descreva o contexto desta oportunidade..."
                  className="w-full rounded-xl border border-white/10 bg-gray-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10"
                />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-gray-900/70 p-5 sm:p-6">
            <SectionHeader
              icon={User}
              title="Relacionamentos"
              description="Defina o lead, o imóvel e o corretor responsável."
            />

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Field label="Lead" required error={fieldErrors.lead}>
                <Select
                  value={form.lead}
                  error={fieldErrors.lead}
                  onChange={(event) => handleChange('lead', event.target.value)}
                >
                  <option value="">Selecione o lead</option>
                  {leads.map((lead) => (
                    <option key={lead._id} value={lead._id}>
                      {getEntityName(lead, 'Lead')}
                      {lead.phone ? ` — ${lead.phone}` : ''}
                    </option>
                  ))}
                  {form.lead &&
                    !leads.some(
                      (item) => String(item._id) === String(form.lead),
                    ) &&
                    selectedLead && (
                      <option value={form.lead}>
                        {getEntityName(selectedLead, 'Lead')}
                      </option>
                    )}
                </Select>
                {selectedLead && (
                  <p className="mt-2 truncate rounded-lg border border-white/5 bg-gray-950/60 px-3 py-2 text-xs text-gray-500">
                    {selectedLead.email || 'Sem e-mail'}
                  </p>
                )}
              </Field>

              <Field label="Imóvel" hint="Opcional">
                <Select
                  value={form.property}
                  onChange={(event) =>
                    handleChange('property', event.target.value)
                  }
                >
                  <option value="">Nenhum imóvel definido</option>
                  {properties.map((property) => (
                    <option key={property._id} value={property._id}>
                      {getEntityName(property, 'Imóvel')}
                      {property.code ? ` — ${property.code}` : ''}
                    </option>
                  ))}
                  {form.property &&
                    !properties.some(
                      (item) => String(item._id) === String(form.property),
                    ) && (
                      <option value={form.property}>
                        {getEntityName(selectedProperty, 'Imóvel relacionado')}
                      </option>
                    )}
                </Select>

                {selectedProperty && (
                  <div className="mt-2 flex items-center gap-2 rounded-lg border border-white/5 bg-gray-950/60 px-3 py-2 text-xs text-gray-400">
                    <Home className="h-4 w-4 shrink-0 text-blue-400" />
                    <span className="truncate">
                      {getEntityName(selectedProperty, 'Imóvel')}
                    </span>
                  </div>
                )}
              </Field>

              <Field
                label="Corretor responsável"
                required
                error={fieldErrors.assignedTo}
              >
                <Select
                  value={form.assignedTo}
                  error={fieldErrors.assignedTo}
                  onChange={(event) =>
                    handleChange('assignedTo', event.target.value)
                  }
                >
                  <option value="">Selecione o corretor</option>
                  {brokers.map((broker) => (
                    <option key={broker._id} value={broker._id}>
                      {getEntityName(broker, 'Corretor')}
                      {broker.position ? ` — ${broker.position}` : ''}
                    </option>
                  ))}
                  {form.assignedTo &&
                    !brokers.some(
                      (item) => String(item._id) === String(form.assignedTo),
                    ) && (
                      <option value={form.assignedTo}>
                        {getEntityName(
                          typeof selectedLead === 'object' &&
                            getEntityId(selectedLead) === form.assignedTo
                            ? selectedLead
                            : null,
                          'Corretor atualmente responsável',
                        )}
                      </option>
                    )}
                </Select>
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-gray-900/70 p-5 sm:p-6">
            <SectionHeader
              icon={Target}
              title="Negócio"
              description="Configure o estágio, o tipo e a prioridade comercial."
            />

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Tipo" required>
                <Select
                  value={form.type}
                  onChange={(event) => handleChange('type', event.target.value)}
                >
                  {TYPES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Estágio" required error={fieldErrors.stage}>
                <Select
                  value={form.stage}
                  error={fieldErrors.stage}
                  onChange={(event) =>
                    handleChange('stage', event.target.value)
                  }
                >
                  {STAGES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Temperatura" required>
                <Select
                  value={form.temperature}
                  onChange={(event) =>
                    handleChange('temperature', event.target.value)
                  }
                >
                  {TEMPERATURES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Prioridade" required>
                <Select
                  value={form.priority}
                  onChange={(event) =>
                    handleChange('priority', event.target.value)
                  }
                >
                  {PRIORITIES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-gray-900/70 p-5 sm:p-6">
            <SectionHeader
              icon={DollarSign}
              title="Valores"
              description="Defina os valores e a probabilidade de fechamento."
            />

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <Field label="Valor estimado" hint="Opcional">
                <MoneyInput
                  value={form.estimatedValue}
                  onChange={(value) => handleChange('estimatedValue', value)}
                />
              </Field>

              <Field label="Valor esperado de fechamento" hint="Opcional">
                <MoneyInput
                  value={form.expectedClosingValue}
                  onChange={(value) =>
                    handleChange('expectedClosingValue', value)
                  }
                />
              </Field>

              <Field label="Probabilidade" error={fieldErrors.probability}>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.probability}
                    onChange={(event) =>
                      handleChange('probability', event.target.value)
                    }
                    className={`${inputClass(fieldErrors.probability)} pr-10`}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    %
                  </span>
                </div>
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-gray-900/70 p-5 sm:p-6">
            <SectionHeader
              icon={Calendar}
              title="Planejamento"
              description="Defina quando o negócio deve avançar."
            />

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <Field label="Previsão de fechamento" hint="Opcional">
                <DateInput
                  value={form.expectedClosingDate}
                  onChange={(value) =>
                    handleChange('expectedClosingDate', value)
                  }
                />
              </Field>

              <Field label="Próxima ação" hint="Opcional">
                <input
                  value={form.nextAction}
                  onChange={(event) =>
                    handleChange('nextAction', event.target.value)
                  }
                  placeholder="Ex.: Ligar para confirmar visita"
                  className={inputClass()}
                />
              </Field>

              <Field label="Data da próxima ação" hint="Opcional">
                <DateInput
                  type="datetime-local"
                  value={form.nextActionAt}
                  onChange={(value) => handleChange('nextActionAt', value)}
                />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-gray-900/70 p-5 sm:p-6">
            <SectionHeader
              icon={FileText}
              title="Observações"
              description="Registre informações importantes sobre o negócio."
            />

            <div className="mt-6">
              <textarea
                value={form.notes}
                onChange={(event) => handleChange('notes', event.target.value)}
                rows={5}
                placeholder="Observações internas da oportunidade..."
                className="w-full rounded-xl border border-white/10 bg-gray-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10"
              />
            </div>
          </section>

          <div className="sticky bottom-3 z-20 flex flex-col-reverse gap-3 rounded-2xl border border-white/10 bg-gray-950/90 p-3 shadow-2xl shadow-black/30 backdrop-blur-xl sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate(`/opportunities/${id}`)}
              disabled={saving}
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-gray-900 px-5 py-3 text-sm font-semibold text-gray-300 transition hover:bg-gray-800 hover:text-white disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando alterações...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

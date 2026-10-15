import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  FileText,
  Loader2,
  Save,
  Target,
  User,
  Home,
  ChevronDown,
  AlertCircle,
  Check,
  Search,
} from 'lucide-react';

import { createOpportunity } from '../service/opportunityService';
import api from '../service/api';
import { UserContext } from '../context/UserContext';

/* =========================================================
   CONSTANTS
========================================================= */

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
  { value: 'frio', label: 'Frio', icon: '🔵' },
  { value: 'morno', label: 'Morno', icon: '🟡' },
  { value: 'quente', label: 'Quente', icon: '🔥' },
];

const PRIORITIES = [
  { value: 'baixa', label: 'Baixa' },
  { value: 'media', label: 'Média' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
];

/* =========================================================
   HELPERS
========================================================= */

function formatCurrencyInput(value) {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const numericValue = String(value)
    .replace(/\D/g, '')
    .replace(/^0+(?=\d)/, '');

  if (!numericValue) return '';

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(numericValue) / 100);
}

function currencyToNumber(value) {
  if (!value) return 0;

  const normalized = String(value).replace(/\./g, '').replace(',', '.');

  const number = Number(normalized);

  return Number.isNaN(number) ? 0 : number;
}

function getApiError(error) {
  if (error?.response?.data?.errors) {
    const errors = error.response.data.errors;

    if (Array.isArray(errors)) {
      return errors.map((item) => item.message).join(' ');
    }

    if (typeof errors === 'object') {
      return Object.values(errors)
        .map((item) => item?.message || item)
        .join(' ');
    }
  }

  return (
    error?.response?.data?.message ||
    error?.message ||
    'Não foi possível criar a oportunidade.'
  );
}

function extractArray(response, keys = []) {
  const root = response?.data;

  if (Array.isArray(root)) return root;

  for (const key of keys) {
    if (Array.isArray(root?.[key])) return root[key];
  }

  if (Array.isArray(root?.data)) return root.data;
  if (Array.isArray(root?.data?.data)) return root.data.data;

  for (const key of keys) {
    if (Array.isArray(root?.data?.[key])) {
      return root.data[key];
    }
  }

  if (Array.isArray(root?.data?.items)) return root.data.items;
  if (Array.isArray(root?.items)) return root.items;

  return [];
}

function getPropertyName(property) {
  if (!property) return 'Imóvel';

  return (
    property.name ||
    property.title ||
    property.code ||
    property.slug ||
    'Imóvel'
  );
}

/**
 * Verifica se o imóvel está disponível.
 *
 * Aceita:
 * - disponivel
 * - disponível
 * - DISPONIVEL
 * - available
 *
 * Outros status não são considerados disponíveis.
 */
function isPropertyAvailable(property) {
  const status = String(property?.status || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s-]+/g, '_');

  return ['disponivel', 'available'].includes(status);
}

function getPropertyPrice(property) {
  if (!property) return null;

  const price =
    property.price ??
    property.prices?.sale ??
    property.prices?.salePrice ??
    property.prices?.value ??
    property.prices?.rent ??
    null;

  if (price === null || price === undefined || price === '') {
    return null;
  }

  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) return null;

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numericPrice);
}

function getPropertyImage(property) {
  if (!property) return '';

  if (property.coverImage) return property.coverImage;

  if (Array.isArray(property.images) && property.images.length > 0) {
    const firstImage = property.images[0];

    if (typeof firstImage === 'string') return firstImage;

    return firstImage?.url || firstImage?.secure_url || '';
  }

  return '';
}

function getInitials(name = '') {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  if (!parts.length) return 'C';

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/* =========================================================
   COMPONENT
========================================================= */

export default function OpportunityCreate() {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const currentUserId = user?._id || user?.id;
  const userRole = String(user?.role || '').toLowerCase();

  const isAdmin =
    ['admin', 'administrator', 'superadmin', 'super_admin'].includes(
      userRole,
    ) || user?.isAdmin === true;

  const [loading, setLoading] = useState(false);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingBrokers, setLoadingBrokers] = useState(true);

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [leads, setLeads] = useState([]);
  const [properties, setProperties] = useState([]);
  const [brokers, setBrokers] = useState([]);

  const [form, setForm] = useState({
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
  });

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    loadLeads();
    loadProperties();
  }, []);

  useEffect(() => {
    if (!user) return;
    loadBrokers();
  }, [user, isAdmin, currentUserId]);

  /* =======================================================
     LOAD LEADS
  ======================================================= */

  const loadLeads = async () => {
    try {
      setLoadingLeads(true);

      const response = await api.get('/api/leads');
      const data = extractArray(response, ['leads', 'items']);

      setLeads(data);
    } catch (err) {
      console.error('Erro ao carregar leads:', err);

      setError(
        err?.response?.data?.message || 'Não foi possível carregar os leads.',
      );
    } finally {
      setLoadingLeads(false);
    }
  };

  /* =======================================================
     LOAD PROPERTIES

     Somente imóveis disponíveis são mantidos no estado.
  ======================================================= */

  const loadProperties = async () => {
    try {
      setLoadingProperties(true);

      const response = await api.get('/api/properties', {
        params: {
          page: 1,
          limit: 100,
        },
      });

      const data = extractArray(response, ['properties', 'items']);

      const availableProperties = data.filter(isPropertyAvailable);

      setProperties(availableProperties);

      // Limpa a seleção se o imóvel não estiver mais disponível.
      setForm((prev) => {
        if (!prev.property) return prev;

        const stillAvailable = availableProperties.some(
          (property) => String(property._id) === String(prev.property),
        );

        return stillAvailable ? prev : { ...prev, property: '' };
      });
    } catch (err) {
      console.error('Erro ao carregar imóveis:', err);

      setError(
        (current) =>
          current ||
          err?.response?.data?.message ||
          'Não foi possível carregar os imóveis.',
      );
    } finally {
      setLoadingProperties(false);
    }
  };

  /* =======================================================
     LOAD BROKERS
  ======================================================= */

  const loadBrokers = async () => {
    try {
      setLoadingBrokers(true);

      // Corretores só podem atribuir a oportunidade a si mesmos.
      if (!isAdmin) {
        if (!currentUserId) {
          setBrokers([]);
          setError('Não foi possível identificar o usuário autenticado.');
          return;
        }

        const currentBroker = {
          ...user,
          _id: currentUserId,
          name: user?.name || user?.fullName || user?.username || 'Meu usuário',
        };

        setBrokers([currentBroker]);

        setForm((prev) => ({
          ...prev,
          assignedTo: String(currentUserId),
        }));

        return;
      }

      const response = await api.get('/api/brokers');
      const data = extractArray(response, ['brokers', 'users', 'items']);

      setBrokers(data);
    } catch (err) {
      console.error('Erro ao carregar corretores:', err);

      setError(
        (current) =>
          current ||
          err?.response?.data?.message ||
          'Não foi possível carregar os corretores.',
      );
    } finally {
      setLoadingBrokers(false);
    }
  };

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });

    if (error) setError('');
  };

  /* =======================================================
     LEAD CHANGE

     Só associa automaticamente o imóvel do lead se estiver
     entre os imóveis disponíveis carregados pela API.
  ======================================================= */

  const handleLeadChange = (leadId) => {
    const selectedLead = leads.find(
      (lead) => String(lead._id) === String(leadId),
    );

    const leadPropertyId =
      typeof selectedLead?.property === 'object'
        ? selectedLead.property?._id
        : selectedLead?.property;

    const leadPropertyAvailable = properties.some(
      (property) =>
        String(property._id) === String(leadPropertyId) &&
        isPropertyAvailable(property),
    );

    setForm((prev) => {
      const currentPropertyIsAvailable = properties.some(
        (property) =>
          String(property._id) === String(prev.property) &&
          isPropertyAvailable(property),
      );

      return {
        ...prev,
        lead: leadId,
        property: leadPropertyAvailable
          ? String(leadPropertyId)
          : currentPropertyIsAvailable
            ? prev.property
            : '',
      };
    });

    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next.lead;
      return next;
    });

    if (error) setError('');
  };

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validate = () => {
    const errors = {};

    if (!form.title.trim()) {
      errors.title = 'Informe o título da oportunidade.';
    } else if (form.title.trim().length < 3) {
      errors.title = 'O título deve possuir pelo menos 3 caracteres.';
    }

    if (!form.lead) {
      errors.lead = 'Selecione o lead relacionado.';
    }

    if (!form.assignedTo) {
      errors.assignedTo = 'Selecione o corretor responsável.';
    }

    if (!form.type) errors.type = 'Selecione o tipo da oportunidade.';
    if (!form.stage) errors.stage = 'Selecione o estágio.';
    if (!form.temperature) {
      errors.temperature = 'Selecione a temperatura.';
    }
    if (!form.priority) {
      errors.priority = 'Selecione a prioridade.';
    }

    const probability = Number(form.probability);

    if (Number.isNaN(probability) || probability < 0 || probability > 100) {
      errors.probability = 'A probabilidade deve estar entre 0 e 100%.';
    }

    // Impede o envio de um imóvel que não esteja na lista disponível.
    if (form.property) {
      const propertyIsAvailable = properties.some(
        (property) =>
          String(property._id) === String(form.property) &&
          isPropertyAvailable(property),
      );

      if (!propertyIsAvailable) {
        errors.property =
          'O imóvel selecionado não está mais disponível. Selecione outro imóvel.';
      }
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        lead: form.lead,
        property: form.property || null,
        assignedTo: isAdmin ? form.assignedTo : String(currentUserId || ''),
        type: form.type,
        stage: form.stage,
        temperature: form.temperature,
        priority: form.priority,
        estimatedValue: currencyToNumber(form.estimatedValue),
        expectedClosingValue: currencyToNumber(form.expectedClosingValue),
        probability: Number(form.probability),
        expectedClosingDate: form.expectedClosingDate || null,
        nextAction: form.nextAction.trim(),
        nextActionAt: form.nextActionAt || null,
        notes: form.notes.trim(),
      };

      const response = await createOpportunity(payload);

      const opportunity = response?.opportunity || response?.data || response;

      const opportunityId = opportunity?._id;

      if (opportunityId) {
        navigate(`/opportunities/${opportunityId}`);
        return;
      }

      navigate('/opportunities');
    } catch (err) {
      console.error('Erro ao criar oportunidade:', err);
      setError(getApiError(err));

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     SELECTED ITEMS
  ======================================================= */

  const selectedLead = useMemo(
    () => leads.find((lead) => String(lead._id) === String(form.lead)),
    [leads, form.lead],
  );

  const selectedProperty = useMemo(
    () =>
      properties.find(
        (property) =>
          String(property._id) === String(form.property) &&
          isPropertyAvailable(property),
      ),
    [properties, form.property],
  );

  const selectedBroker = useMemo(
    () =>
      brokers.find((broker) => String(broker._id) === String(form.assignedTo)),
    [brokers, form.assignedTo],
  );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        {/* HEADER */}

        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate('/opportunities')}
            className="mb-5 inline-flex items-center gap-2 text-sm text-gray-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para oportunidades
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10">
              <Target className="h-6 w-6 text-indigo-400" />
            </div>

            <div>
              <h1 className="text-2xl font-bold">Nova oportunidade</h1>
              <p className="mt-1 text-sm text-gray-400">
                Registre e acompanhe uma nova oportunidade comercial.
              </p>
            </div>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-medium">Não foi possível carregar os dados.</p>
              <p className="mt-1 text-red-300/80">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* IDENTIFICAÇÃO */}

          <section className="mb-5 rounded-2xl border border-white/10 bg-gray-900/70 p-5 sm:p-6">
            <SectionHeader
              icon={<Target className="h-5 w-5" />}
              title="Identificação"
              description="Informações principais da oportunidade."
            />

            <div className="mt-6 grid gap-5">
              <Field label="Título" required error={fieldErrors.title}>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Ex.: Compra de apartamento para família"
                  className={inputClass(fieldErrors.title)}
                />
              </Field>

              <Field label="Descrição" hint="Opcional">
                <textarea
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={4}
                  placeholder="Descreva o contexto desta oportunidade..."
                  className="w-full rounded-xl border border-white/10 bg-gray-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-indigo-500/50"
                />
              </Field>
            </div>
          </section>

          {/* RELACIONAMENTOS */}

          <section className="mb-5 rounded-2xl border border-white/10 bg-gray-900/70 p-5 sm:p-6">
            <SectionHeader
              icon={<User className="h-5 w-5" />}
              title="Relacionamentos"
              description="Defina o lead, imóvel e corretor responsável."
            />

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {/* LEAD */}

              <Field label="Lead" required error={fieldErrors.lead}>
                <Select
                  value={form.lead}
                  onChange={(e) => handleLeadChange(e.target.value)}
                  loading={loadingLeads}
                  error={fieldErrors.lead}
                >
                  <option value="">Selecione o lead</option>

                  {leads.map((lead) => (
                    <option key={lead._id} value={lead._id}>
                      {lead.name}
                      {lead.phone ? ` — ${lead.phone}` : ''}
                    </option>
                  ))}
                </Select>

                {selectedLead && (
                  <div className="mt-2 rounded-lg border border-white/5 bg-gray-950/60 px-3 py-2 text-xs text-gray-500">
                    {selectedLead.email || 'Sem e-mail'}

                    {selectedLead.property?.name && (
                      <span className="ml-2 text-gray-600">
                        • {selectedLead.property.name}
                      </span>
                    )}
                  </div>
                )}
              </Field>

              {/* PROPERTY */}

              <Field
                label="Imóvel"
                hint="Opcional"
                error={fieldErrors.property}
              >
                <PropertySelect
                  value={form.property}
                  onChange={(value) => handleChange('property', value)}
                  properties={properties}
                  loading={loadingProperties}
                />

                {!loadingProperties && properties.length === 0 && (
                  <p className="mt-2 text-xs text-amber-400/90">
                    Nenhum imóvel disponível foi encontrado.
                  </p>
                )}

                {selectedProperty && (
                  <div className="mt-3 overflow-hidden rounded-xl border border-white/5 bg-gray-950/60">
                    <div className="flex items-center gap-3 p-3">
                      <PropertyThumbnail
                        property={selectedProperty}
                        size="small"
                      />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {getPropertyName(selectedProperty)}
                        </p>

                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
                          {selectedProperty.code && (
                            <span>{selectedProperty.code}</span>
                          )}

                          {getPropertyPrice(selectedProperty) && (
                            <span>• {getPropertyPrice(selectedProperty)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Field>

              {/* BROKER */}

              <Field
                label="Corretor responsável"
                required
                error={fieldErrors.assignedTo}
              >
                <BrokerSelect
                  value={form.assignedTo}
                  onChange={(value) => handleChange('assignedTo', value)}
                  brokers={brokers}
                  loading={loadingBrokers}
                  error={fieldErrors.assignedTo}
                  disabled={!isAdmin}
                />
              </Field>
            </div>
          </section>

          {/* NEGÓCIO */}

          <section className="mb-5 rounded-2xl border border-white/10 bg-gray-900/70 p-5 sm:p-6">
            <SectionHeader
              icon={<Target className="h-5 w-5" />}
              title="Negócio"
              description="Configure o estágio e a prioridade comercial."
            />

            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <Field label="Tipo" required>
                <Select
                  value={form.type}
                  onChange={(e) => handleChange('type', e.target.value)}
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
                  onChange={(e) => handleChange('stage', e.target.value)}
                  error={fieldErrors.stage}
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
                  onChange={(e) => handleChange('temperature', e.target.value)}
                >
                  {TEMPERATURES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.icon} {item.label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="Prioridade" required>
                <Select
                  value={form.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
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

          {/* VALORES */}

          <section className="mb-5 rounded-2xl border border-white/10 bg-gray-900/70 p-5 sm:p-6">
            <SectionHeader
              icon={<DollarSign className="h-5 w-5" />}
              title="Valores"
              description="Defina os valores e a probabilidade de fechamento."
            />

            <div className="mt-6 grid gap-5 md:grid-cols-3">
              <Field label="Valor estimado" hint="Opcional">
                <MoneyInput
                  value={form.estimatedValue}
                  onChange={(value) => handleChange('estimatedValue', value)}
                  placeholder="0,00"
                />
              </Field>

              <Field label="Valor esperado de fechamento" hint="Opcional">
                <MoneyInput
                  value={form.expectedClosingValue}
                  onChange={(value) =>
                    handleChange('expectedClosingValue', value)
                  }
                  placeholder="0,00"
                />
              </Field>

              <Field label="Probabilidade" error={fieldErrors.probability}>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.probability}
                    onChange={(e) =>
                      handleChange('probability', e.target.value)
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

          {/* PLANEJAMENTO */}

          <section className="mb-5 rounded-2xl border border-white/10 bg-gray-900/70 p-5 sm:p-6">
            <SectionHeader
              icon={<Calendar className="h-5 w-5" />}
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
                  type="text"
                  value={form.nextAction}
                  onChange={(e) => handleChange('nextAction', e.target.value)}
                  placeholder="Ex.: Ligar para confirmar visita"
                  className={inputClass()}
                />
              </Field>

              <Field label="Data da próxima ação" hint="Opcional">
                <DateTimeInput
                  value={form.nextActionAt}
                  onChange={(value) => handleChange('nextActionAt', value)}
                />
              </Field>
            </div>
          </section>

          {/* OBSERVAÇÕES */}

          <section className="mb-6 rounded-2xl border border-white/10 bg-gray-900/70 p-5 sm:p-6">
            <SectionHeader
              icon={<FileText className="h-5 w-5" />}
              title="Observações"
              description="Registre informações importantes sobre o negócio."
            />

            <div className="mt-6">
              <textarea
                value={form.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={6}
                placeholder="Observações internas da oportunidade..."
                className="w-full rounded-xl border border-white/10 bg-gray-950 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-indigo-500/50"
              />
            </div>
          </section>

          {/* ACTIONS */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => navigate('/opportunities')}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-gray-900 px-5 py-3 text-sm font-semibold text-gray-300 transition hover:bg-gray-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Criar oportunidade
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   BROKER SELECT
========================================================= */

function BrokerSelect({
  value,
  onChange,
  brokers = [],
  loading = false,
  error = '',
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedBroker = brokers.find(
    (broker) => String(broker._id) === String(value),
  );

  const filteredBrokers = brokers.filter((broker) => {
    const term = search.toLowerCase().trim();

    if (!term) return true;

    return (
      broker.name?.toLowerCase().includes(term) ||
      broker.position?.toLowerCase().includes(term) ||
      broker.company?.toLowerCase().includes(term)
    );
  });

  const handleSelect = (broker) => {
    onChange(broker._id);
    setOpen(false);
    setSearch('');
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => !loading && !disabled && setOpen((prev) => !prev)}
        disabled={loading || disabled}
        className={`flex h-11 w-full items-center justify-between rounded-xl border bg-gray-950 px-3 text-left outline-none transition disabled:cursor-not-allowed disabled:opacity-60 ${
          error ? 'border-red-500/40' : 'border-white/10'
        } ${open ? 'border-indigo-500/50' : ''}`}
      >
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando corretores...
          </div>
        ) : selectedBroker ? (
          <div className="flex min-w-0 items-center gap-3">
            <BrokerAvatar broker={selectedBroker} size="small" />

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {selectedBroker.name}
              </p>

              {selectedBroker.position && (
                <p className="truncate text-[11px] text-gray-500">
                  {selectedBroker.position}
                </p>
              )}
            </div>
          </div>
        ) : (
          <span className="text-sm text-gray-500">Selecione o corretor</span>
        )}

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-500 transition ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-gray-900 shadow-2xl shadow-black/40">
          <div className="border-b border-white/5 p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                placeholder="Buscar corretor..."
                className="h-10 w-full rounded-lg border border-white/5 bg-gray-950 pl-9 pr-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-indigo-500/40"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-1">
            {filteredBrokers.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-gray-500">
                Nenhum corretor encontrado.
              </div>
            ) : (
              filteredBrokers.map((broker) => {
                const isSelected = String(broker._id) === String(value);

                return (
                  <button
                    key={broker._id}
                    type="button"
                    onClick={() => handleSelect(broker)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-white/5"
                  >
                    <BrokerAvatar broker={broker} size="medium" />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {broker.name}
                      </p>

                      <div className="mt-0.5 flex items-center gap-2">
                        {broker.position && (
                          <span className="truncate text-[11px] text-gray-500">
                            {broker.position}
                          </span>
                        )}

                        {broker.creci && (
                          <span className="shrink-0 text-[10px] text-gray-600">
                            CRECI {broker.creci}
                          </span>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="h-4 w-4 shrink-0 text-indigo-400" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   BROKER AVATAR
========================================================= */

function BrokerAvatar({ broker, size = 'medium' }) {
  const sizes = {
    small: 'h-8 w-8 text-[10px]',
    medium: 'h-10 w-10 text-xs',
    large: 'h-12 w-12 text-sm',
  };

  const className = sizes[size] || sizes.medium;

  if (broker?.avatar) {
    return (
      <img
        src={broker.avatar}
        alt={broker.name || 'Corretor'}
        className={`${className} shrink-0 rounded-full border border-white/10 object-cover`}
      />
    );
  }

  return (
    <div
      className={`${className} flex shrink-0 items-center justify-center rounded-full border border-indigo-400/20 bg-indigo-500/10 font-semibold text-indigo-300`}
    >
      {getInitials(broker?.name)}
    </div>
  );
}

/* =========================================================
   PROPERTY SELECT
========================================================= */

function PropertySelect({ value, onChange, properties = [], loading = false }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Proteção adicional: o seletor nunca mostra imóveis indisponíveis.
  const availableProperties = properties.filter(isPropertyAvailable);

  const selectedProperty = availableProperties.find(
    (property) => String(property._id) === String(value),
  );

  const filteredProperties = availableProperties.filter((property) => {
    const term = search.toLowerCase().trim();

    if (!term) return true;

    const name = getPropertyName(property).toLowerCase();
    const code = String(property.code || '').toLowerCase();

    return name.includes(term) || code.includes(term);
  });

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => !loading && setOpen((prev) => !prev)}
        disabled={loading}
        className={`flex h-11 w-full items-center justify-between rounded-xl border border-white/10 bg-gray-950 px-3 text-left outline-none transition hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-60 ${
          open ? 'border-indigo-500/50' : ''
        }`}
      >
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando imóveis...
          </div>
        ) : selectedProperty ? (
          <div className="flex min-w-0 items-center gap-3">
            <PropertyThumbnail property={selectedProperty} size="small" />

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {getPropertyName(selectedProperty)}
              </p>

              {selectedProperty.code && (
                <p className="truncate text-[11px] text-gray-500">
                  Código: {selectedProperty.code}
                </p>
              )}
            </div>
          </div>
        ) : (
          <span className="text-sm text-gray-500">Nenhum imóvel definido</span>
        )}

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-gray-500 transition ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-gray-900 shadow-2xl shadow-black/40">
          {/* SEARCH */}

          <div className="border-b border-white/5 p-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                placeholder="Buscar imóvel..."
                className="h-10 w-full rounded-lg border border-white/5 bg-gray-950 pl-9 pr-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-indigo-500/40"
              />
            </div>
          </div>

          {/* NONE */}

          <button
            type="button"
            onClick={() => {
              onChange('');
              setOpen(false);
              setSearch('');
            }}
            className="flex w-full items-center gap-3 border-b border-white/5 px-3 py-3 text-left text-sm text-gray-400 transition hover:bg-white/5 hover:text-white"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800">
              <Home className="h-4 w-4" />
            </div>
            Nenhum imóvel definido
          </button>

          {/* AVAILABLE PROPERTIES */}

          <div className="max-h-72 overflow-y-auto p-1">
            {filteredProperties.length === 0 ? (
              <div className="px-3 py-6 text-center">
                <Home className="mx-auto mb-2 h-6 w-6 text-gray-700" />

                <p className="text-sm text-gray-500">
                  {availableProperties.length === 0
                    ? 'Nenhum imóvel disponível.'
                    : 'Nenhum imóvel encontrado.'}
                </p>
              </div>
            ) : (
              filteredProperties.map((property) => {
                const isSelected = String(property._id) === String(value);

                return (
                  <button
                    key={property._id}
                    type="button"
                    onClick={() => {
                      onChange(property._id);
                      setOpen(false);
                      setSearch('');
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-white/5"
                  >
                    <PropertyThumbnail property={property} size="medium" />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {getPropertyName(property)}
                      </p>

                      <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-gray-500">
                        {property.code && <span>{property.code}</span>}

                        {getPropertyPrice(property) && (
                          <span>• {getPropertyPrice(property)}</span>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="h-4 w-4 shrink-0 text-indigo-400" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   PROPERTY THUMBNAIL
========================================================= */

function PropertyThumbnail({ property, size = 'medium' }) {
  const image = getPropertyImage(property);

  const sizes = {
    small: 'h-8 w-10',
    medium: 'h-12 w-14',
    large: 'h-16 w-20',
  };

  const className = sizes[size] || sizes.medium;

  if (image) {
    return (
      <img
        src={image}
        alt={getPropertyName(property)}
        className={`${className} shrink-0 rounded-lg border border-white/10 object-cover`}
      />
    );
  }

  return (
    <div
      className={`${className} flex shrink-0 items-center justify-center rounded-lg border border-white/5 bg-gray-800`}
    >
      <Home className="h-4 w-4 text-gray-600" />
    </div>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({ icon, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
        {icon}
      </div>

      <div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
}

/* =========================================================
   FIELD
========================================================= */

function Field({ label, required = false, hint = '', error = '', children }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-gray-300">
          {label}
          {required && <span className="ml-1 text-indigo-400">*</span>}
        </label>

        {hint && <span className="text-[11px] text-gray-600">{hint}</span>}
      </div>

      {children}

      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}

/* =========================================================
   SELECT
========================================================= */

function Select({ value, onChange, children, loading = false, error = '' }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={loading}
        className={`h-11 w-full appearance-none rounded-xl border bg-gray-950 px-3 pr-10 text-sm text-gray-300 outline-none transition focus:border-indigo-500/50 disabled:cursor-not-allowed disabled:opacity-60 ${
          error ? 'border-red-500/40' : 'border-white/10'
        }`}
      >
        {children}
      </select>

      {loading ? (
        <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-500" />
      ) : (
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      )}
    </div>
  );
}

/* =========================================================
   MONEY INPUT
========================================================= */

function MoneyInput({ value, onChange, placeholder = '0,00' }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-600">
        R$
      </span>

      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(formatCurrencyInput(e.target.value))}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-white/10 bg-gray-950 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-indigo-500/50"
      />
    </div>
  );
}

/* =========================================================
   DATE INPUT
========================================================= */

function DateInput({ value, onChange }) {
  return (
    <div className="relative">
      <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-white/10 bg-gray-950 px-3 pl-10 text-sm text-gray-300 outline-none transition focus:border-indigo-500/50"
      />
    </div>
  );
}

/* =========================================================
   DATETIME INPUT
========================================================= */

function DateTimeInput({ value, onChange }) {
  return (
    <div className="relative">
      <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

      <input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-white/10 bg-gray-950 px-3 pl-10 text-sm text-gray-300 outline-none transition focus:border-indigo-500/50"
      />
    </div>
  );
}

/* =========================================================
   INPUT CLASS
========================================================= */

function inputClass(error = '') {
  return `h-11 w-full rounded-xl border bg-gray-950 px-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-indigo-500/50 ${
    error ? 'border-red-500/40' : 'border-white/10'
  }`;
}

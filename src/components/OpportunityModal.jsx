import { useEffect, useMemo, useState } from 'react';
import {
  FaTimes,
  FaSave,
  FaUser,
  FaBuilding,
  FaChartLine,
} from 'react-icons/fa';

import api from '../../services/api';

const TYPES = [
  {
    value: 'venda',
    label: 'Venda',
  },
  {
    value: 'locacao',
    label: 'Locação',
  },
];

const TEMPERATURES = [
  {
    value: 'frio',
    label: 'Frio',
  },
  {
    value: 'morno',
    label: 'Morno',
  },
  {
    value: 'quente',
    label: 'Quente',
  },
];

const PRIORITIES = [
  {
    value: 'baixa',
    label: 'Baixa',
  },
  {
    value: 'media',
    label: 'Média',
  },
  {
    value: 'alta',
    label: 'Alta',
  },
  {
    value: 'urgente',
    label: 'Urgente',
  },
];

export default function OpportunityModal({ user, onClose, onSuccess }) {
  const isAdmin = Boolean(user?.isAdmin);

  const [leads, setLeads] = useState([]);
  const [properties, setProperties] = useState([]);
  const [brokers, setBrokers] = useState([]);

  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    lead: '',
    property: '',
    assignedTo: isAdmin ? '' : user?._id || user?.id || '',
    type: 'venda',
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

  /*
  =========================================================
  LOAD DATA
  =========================================================
  */

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true);
        setError('');

        const requests = [api.get('/api/leads'), api.get('/api/properties')];

        if (isAdmin) {
          requests.push(api.get('/api/users/brokers'));
        }

        const responses = await Promise.all(requests);

        const leadsResponse = responses[0];
        const propertiesResponse = responses[1];
        const brokersResponse = responses[2];

        /*
        -----------------------------------------------------
        LEADS
        -----------------------------------------------------
        */

        const leadsData =
          leadsResponse?.data?.data ||
          leadsResponse?.data?.leads ||
          leadsResponse?.data ||
          [];

        setLeads(Array.isArray(leadsData) ? leadsData : []);

        /*
        -----------------------------------------------------
        PROPERTIES
        -----------------------------------------------------
        */

        const propertiesData =
          propertiesResponse?.data?.data ||
          propertiesResponse?.data?.properties ||
          propertiesResponse?.data ||
          [];

        setProperties(Array.isArray(propertiesData) ? propertiesData : []);

        /*
        -----------------------------------------------------
        BROKERS
        -----------------------------------------------------
        */

        if (isAdmin) {
          const brokersData =
            brokersResponse?.data?.data ||
            brokersResponse?.data?.brokers ||
            brokersResponse?.data ||
            [];

          setBrokers(Array.isArray(brokersData) ? brokersData : []);
        }
      } catch (err) {
        console.error('Erro ao carregar dados da oportunidade:', err);

        setError(
          err?.response?.data?.message ||
            'Não foi possível carregar os dados necessários.',
        );
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [isAdmin, user]);

  /*
  =========================================================
  HELPERS
  =========================================================
  */

  const getId = (item) => {
    return item?._id || item?.id || '';
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return '';
    }

    return number.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const getPropertyPrice = (property) => {
    const prices = property?.prices || {};

    return prices.salePrice || prices.rentPrice || property?.price || 0;
  };

  const getPropertyAddress = (property) => {
    const location = property?.location || {};

    return [
      location.street,
      location.number,
      location.district,
      location.city,
      location.state,
    ]
      .filter(Boolean)
      .join(', ');
  };

  /*
  =========================================================
  SELECTED LEAD
  =========================================================
  */

  const selectedLead = useMemo(() => {
    return leads.find((lead) => getId(lead) === form.lead);
  }, [leads, form.lead]);

  /*
  =========================================================
  CHANGE
  =========================================================
  */

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /*
  =========================================================
  LEAD CHANGE
  =========================================================
  */

  const handleLeadChange = (value) => {
    const lead = leads.find((item) => getId(item) === value);

    setForm((prev) => ({
      ...prev,

      lead: value,

      property: lead?.property?._id || lead?.property?.id || '',
    }));
  };

  /*
  =========================================================
  SUBMIT
  =========================================================
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');

      if (!form.title.trim()) {
        setError('Informe o título da oportunidade.');
        return;
      }

      if (!form.lead) {
        setError('Selecione um lead.');
        return;
      }

      if (!form.assignedTo) {
        setError('Selecione o corretor responsável.');
        return;
      }

      const payload = {
        title: form.title.trim(),

        description: form.description.trim(),

        lead: form.lead,

        property: form.property || null,

        assignedTo: form.assignedTo,

        type: form.type,

        temperature: form.temperature,

        priority: form.priority,

        estimatedValue: form.estimatedValue ? Number(form.estimatedValue) : 0,

        expectedClosingValue: form.expectedClosingValue
          ? Number(form.expectedClosingValue)
          : 0,

        probability: Number(form.probability) || 0,

        expectedClosingDate: form.expectedClosingDate || null,

        nextAction: form.nextAction.trim(),

        nextActionAt: form.nextActionAt || null,

        notes: form.notes.trim(),
      };

      await api.post('/api/opportunities', payload);

      onSuccess?.();
    } catch (err) {
      console.error('Erro ao criar oportunidade:', err);

      const validationErrors = err?.response?.data?.errors;

      if (Array.isArray(validationErrors)) {
        setError(validationErrors.map((item) => item.message).join(' '));
      } else {
        setError(
          err?.response?.data?.message ||
            'Não foi possível criar a oportunidade.',
        );
      }
    } finally {
      setSaving(false);
    }
  };

  /*
  =========================================================
  RENDER
  =========================================================
  */

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/70
        backdrop-blur-sm
        p-4
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        className="
          w-full
          max-w-4xl
          max-h-[92vh]
          overflow-y-auto
          rounded-2xl
          border
          border-gray-800
          bg-gray-950
          shadow-2xl
        "
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="
            sticky
            top-0
            z-10
            flex
            items-center
            justify-between
            border-b
            border-gray-800
            bg-gray-950
            px-6
            py-5
          "
        >
          <div>
            <h2
              className="
                text-xl
                font-bold
                text-white
              "
            >
              Nova oportunidade
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-gray-400
              "
            >
              Transforme um lead em uma oportunidade comercial.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-lg
              p-2
              text-gray-400
              transition
              hover:bg-gray-800
              hover:text-white
            "
          >
            <FaTimes />
          </button>
        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div
              className="
                mb-6
                rounded-lg
                border
                border-red-500/30
                bg-red-500/10
                px-4
                py-3
                text-sm
                text-red-300
              "
            >
              {error}
            </div>
          )}

          {loadingData ? (
            <div
              className="
                flex
                min-h-[300px]
                items-center
                justify-center
                text-gray-400
              "
            >
              Carregando dados...
            </div>
          ) : (
            <>
              {/* =================================================
                  IDENTIFICAÇÃO
              ================================================= */}

              <section className="mb-8">
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-lg
                      bg-blue-600/20
                      text-blue-400
                    "
                  >
                    <FaChartLine />
                  </div>

                  <div>
                    <h3 className="font-semibold text-white">Identificação</h3>

                    <p className="text-xs text-gray-500">
                      Informações principais da oportunidade.
                    </p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {/* TITLE */}

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Título *
                    </label>

                    <input
                      type="text"
                      value={form.title}
                      onChange={(event) =>
                        handleChange('title', event.target.value)
                      }
                      placeholder="Ex: Compra apartamento Vila Mariana"
                      className="
                        w-full
                        rounded-lg
                        border
                        border-gray-700
                        bg-gray-900
                        px-4
                        py-3
                        text-white
                        outline-none
                        transition
                        focus:border-blue-500
                      "
                    />
                  </div>

                  {/* LEAD */}

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                      <FaUser className="text-blue-400" />
                      Lead *
                    </label>

                    <select
                      value={form.lead}
                      onChange={(event) => handleLeadChange(event.target.value)}
                      className="
                        w-full
                        rounded-lg
                        border
                        border-gray-700
                        bg-gray-900
                        px-4
                        py-3
                        text-white
                        outline-none
                        focus:border-blue-500
                      "
                    >
                      <option value="">Selecione um lead</option>

                      {leads.map((lead) => (
                        <option key={getId(lead)} value={getId(lead)}>
                          {lead.name}
                          {lead.phone ? ` — ${lead.phone}` : ''}
                        </option>
                      ))}
                    </select>

                    {selectedLead && (
                      <p className="mt-2 text-xs text-gray-500">
                        {selectedLead.email || 'Sem e-mail'}
                      </p>
                    )}
                  </div>

                  {/* PROPERTY */}

                  <div>
                    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                      <FaBuilding className="text-blue-400" />
                      Imóvel
                    </label>

                    <select
                      value={form.property}
                      onChange={(event) =>
                        handleChange('property', event.target.value)
                      }
                      className="
                        w-full
                        rounded-lg
                        border
                        border-gray-700
                        bg-gray-900
                        px-4
                        py-3
                        text-white
                        outline-none
                        focus:border-blue-500
                      "
                    >
                      <option value="">Nenhum imóvel definido</option>

                      {properties.map((property) => (
                        <option key={getId(property)} value={getId(property)}>
                          {property.name ||
                            property.title ||
                            property.code ||
                            'Imóvel'}
                        </option>
                      ))}
                    </select>

                    {form.property && (
                      <p className="mt-2 text-xs text-gray-500">
                        {(() => {
                          const property = properties.find(
                            (item) => getId(item) === form.property,
                          );

                          if (!property) return '';

                          return [
                            getPropertyAddress(property),
                            getPropertyPrice(property)
                              ? formatCurrency(getPropertyPrice(property))
                              : '',
                          ]
                            .filter(Boolean)
                            .join(' • ');
                        })()}
                      </p>
                    )}
                  </div>

                  {/* BROKER */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Corretor responsável *
                    </label>

                    {isAdmin ? (
                      <select
                        value={form.assignedTo}
                        onChange={(event) =>
                          handleChange('assignedTo', event.target.value)
                        }
                        className="
                          w-full
                          rounded-lg
                          border
                          border-gray-700
                          bg-gray-900
                          px-4
                          py-3
                          text-white
                          outline-none
                          focus:border-blue-500
                        "
                      >
                        <option value="">Selecione o corretor</option>

                        {brokers.map((broker) => (
                          <option key={getId(broker)} value={getId(broker)}>
                            {broker.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div
                        className="
                          rounded-lg
                          border
                          border-gray-700
                          bg-gray-900
                          px-4
                          py-3
                          text-gray-300
                        "
                      >
                        {user?.name || 'Corretor logado'}
                      </div>
                    )}
                  </div>

                  {/* TYPE */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Tipo *
                    </label>

                    <select
                      value={form.type}
                      onChange={(event) =>
                        handleChange('type', event.target.value)
                      }
                      className="
                        w-full
                        rounded-lg
                        border
                        border-gray-700
                        bg-gray-900
                        px-4
                        py-3
                        text-white
                        outline-none
                        focus:border-blue-500
                      "
                    >
                      {TYPES.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* =================================================
                  NEGÓCIO
              ================================================= */}

              <section className="mb-8">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
                  Classificação comercial
                </h3>

                <div className="grid gap-5 md:grid-cols-3">
                  {/* TEMPERATURE */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Temperatura
                    </label>

                    <select
                      value={form.temperature}
                      onChange={(event) =>
                        handleChange('temperature', event.target.value)
                      }
                      className="
                        w-full
                        rounded-lg
                        border
                        border-gray-700
                        bg-gray-900
                        px-4
                        py-3
                        text-white
                        outline-none
                        focus:border-blue-500
                      "
                    >
                      {TEMPERATURES.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* PRIORITY */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Prioridade
                    </label>

                    <select
                      value={form.priority}
                      onChange={(event) =>
                        handleChange('priority', event.target.value)
                      }
                      className="
                        w-full
                        rounded-lg
                        border
                        border-gray-700
                        bg-gray-900
                        px-4
                        py-3
                        text-white
                        outline-none
                        focus:border-blue-500
                      "
                    >
                      {PRIORITIES.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* PROBABILITY */}

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Probabilidade (%)
                    </label>

                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={form.probability}
                      onChange={(event) =>
                        handleChange('probability', event.target.value)
                      }
                      className="
                        w-full
                        rounded-lg
                        border
                        border-gray-700
                        bg-gray-900
                        px-4
                        py-3
                        text-white
                        outline-none
                        focus:border-blue-500
                      "
                    />
                  </div>
                </div>
              </section>

              {/* =================================================
                  VALORES
              ================================================= */}

              <section className="mb-8">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
                  Valores
                </h3>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Valor estimado
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.estimatedValue}
                      onChange={(event) =>
                        handleChange('estimatedValue', event.target.value)
                      }
                      placeholder="0,00"
                      className="
                        w-full
                        rounded-lg
                        border
                        border-gray-700
                        bg-gray-900
                        px-4
                        py-3
                        text-white
                        outline-none
                        focus:border-blue-500
                      "
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Valor esperado de fechamento
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.expectedClosingValue}
                      onChange={(event) =>
                        handleChange('expectedClosingValue', event.target.value)
                      }
                      placeholder="0,00"
                      className="
                        w-full
                        rounded-lg
                        border
                        border-gray-700
                        bg-gray-900
                        px-4
                        py-3
                        text-white
                        outline-none
                        focus:border-blue-500
                      "
                    />
                  </div>
                </div>
              </section>

              {/* =================================================
                  DATAS
              ================================================= */}

              <section className="mb-8">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
                  Próximas ações
                </h3>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Previsão de fechamento
                    </label>

                    <input
                      type="date"
                      value={form.expectedClosingDate}
                      onChange={(event) =>
                        handleChange('expectedClosingDate', event.target.value)
                      }
                      className="
                        w-full
                        rounded-lg
                        border
                        border-gray-700
                        bg-gray-900
                        px-4
                        py-3
                        text-white
                        outline-none
                        focus:border-blue-500
                      "
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Data da próxima ação
                    </label>

                    <input
                      type="datetime-local"
                      value={form.nextActionAt}
                      onChange={(event) =>
                        handleChange('nextActionAt', event.target.value)
                      }
                      className="
                        w-full
                        rounded-lg
                        border
                        border-gray-700
                        bg-gray-900
                        px-4
                        py-3
                        text-white
                        outline-none
                        focus:border-blue-500
                      "
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Próxima ação
                    </label>

                    <input
                      type="text"
                      value={form.nextAction}
                      onChange={(event) =>
                        handleChange('nextAction', event.target.value)
                      }
                      placeholder="Ex: Ligar para confirmar interesse"
                      className="
                        w-full
                        rounded-lg
                        border
                        border-gray-700
                        bg-gray-900
                        px-4
                        py-3
                        text-white
                        outline-none
                        focus:border-blue-500
                      "
                    />
                  </div>
                </div>
              </section>

              {/* =================================================
                  DESCRIÇÃO
              ================================================= */}

              <section className="mb-8">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
                  Informações adicionais
                </h3>

                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Descrição
                    </label>

                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={(event) =>
                        handleChange('description', event.target.value)
                      }
                      placeholder="Descreva a oportunidade..."
                      className="
                        w-full
                        resize-none
                        rounded-lg
                        border
                        border-gray-700
                        bg-gray-900
                        px-4
                        py-3
                        text-white
                        outline-none
                        focus:border-blue-500
                      "
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">
                      Observações
                    </label>

                    <textarea
                      rows={3}
                      value={form.notes}
                      onChange={(event) =>
                        handleChange('notes', event.target.value)
                      }
                      placeholder="Observações internas..."
                      className="
                        w-full
                        resize-none
                        rounded-lg
                        border
                        border-gray-700
                        bg-gray-900
                        px-4
                        py-3
                        text-white
                        outline-none
                        focus:border-blue-500
                      "
                    />
                  </div>
                </div>
              </section>
            </>
          )}

          {/* =================================================
              FOOTER
          ================================================= */}

          <div
            className="
              flex
              justify-end
              gap-3
              border-t
              border-gray-800
              pt-5
            "
          >
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="
                rounded-lg
                border
                border-gray-700
                px-5
                py-3
                text-sm
                font-medium
                text-gray-300
                transition
                hover:bg-gray-800
                hover:text-white
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={saving || loadingData}
              className="
                flex
                items-center
                gap-2
                rounded-lg
                bg-blue-600
                px-5
                py-3
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-blue-500
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <FaSave />

              {saving ? 'Criando...' : 'Criar oportunidade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

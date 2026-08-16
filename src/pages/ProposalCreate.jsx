import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  ArrowLeft,
  User,
  Building2,
  DollarSign,
  CreditCard,
  FileText,
  CalendarDays,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calculator,
} from 'lucide-react';

import api from '../service/api';

export default function ProposalCreate() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const leadId = searchParams.get('lead');

  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const [lead, setLead] = useState(null);
  const [properties, setProperties] = useState([]);

  const [loadingLead, setLoadingLead] = useState(true);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    property: '',
    propertyPrice: '',
    proposalPrice: '',
    downPayment: '',
    financing: '',
    fgts: '',
    paymentMethod: 'financing',
    installments: '',
    installmentValue: '',
    validityDays: 7,
    clientMessage: '',
  });

  /*
  |--------------------------------------------------------------------------
  | LOAD LEAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!leadId) {
      setError('Lead não informado.');
      setLoadingLead(false);
      return;
    }

    let mounted = true;

    const loadLead = async () => {
      try {
        setLoadingLead(true);
        setError('');

        const response = await api.get(`/api/leads/${leadId}`);

        const data = response?.data;

        if (!mounted) return;

        if (!data) {
          setError('Lead não encontrado.');
          return;
        }

        setLead(data);

        /*
         * Se o lead já possui imóvel,
         * preenche automaticamente.
         */

        const propertyId =
          data.property?._id ||
          data.property?.id ||
          (typeof data.property === 'string' ? data.property : '');

        const propertyPrice =
          data.property?.price ||
          data.propertySnapshot?.price ||
          data.propertyPrice ||
          '';

        if (propertyId) {
          setForm((current) => ({
            ...current,
            property: propertyId,
            propertyPrice,
          }));
        }
      } catch (err) {
        console.error('Erro ao carregar lead:', err);

        if (!mounted) return;

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            'Não foi possível carregar as informações do lead.',
        );
      } finally {
        if (mounted) {
          setLoadingLead(false);
        }
      }
    };

    loadLead();

    return () => {
      mounted = false;
    };
  }, [leadId]);

  /*
  |--------------------------------------------------------------------------
  | LOAD PROPERTIES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!lead) return;

    /*
     * Se o lead já possui imóvel,
     * não precisamos carregar a lista.
     */

    if (lead.property) {
      setLoadingProperties(false);
      return;
    }

    let mounted = true;

    const loadProperties = async () => {
      try {
        setLoadingProperties(true);

        const response = await api.get('/api/properties', {
          params: {
            page: 1,
            limit: 100,
          },
        });

        if (!mounted) return;

        const data = response?.data;

        const list =
          data?.properties ||
          data?.data ||
          data?.results ||
          (Array.isArray(data) ? data : []);

        setProperties(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Erro ao carregar imóveis:', err);

        if (mounted) {
          setProperties([]);
        }
      } finally {
        if (mounted) {
          setLoadingProperties(false);
        }
      }
    };

    loadProperties();

    return () => {
      mounted = false;
    };
  }, [lead]);

  /*
  |--------------------------------------------------------------------------
  | SELECTED PROPERTY
  |--------------------------------------------------------------------------
  */

  const selectedProperty = useMemo(() => {
    if (!form.property) {
      return null;
    }

    /*
     * Imóvel vindo populado no Lead.
     */

    if (
      lead?.property &&
      typeof lead.property === 'object' &&
      String(lead.property._id || lead.property.id) === String(form.property)
    ) {
      return lead.property;
    }

    /*
     * Imóvel selecionado na lista.
     */

    return properties.find(
      (property) =>
        String(property._id || property.id) === String(form.property),
    );
  }, [form.property, lead, properties]);

  /*
  |--------------------------------------------------------------------------
  | FORM CHANGE
  |--------------------------------------------------------------------------
  */

  const handleChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError('');
    setSuccess('');
  };

  /*
  |--------------------------------------------------------------------------
  | PROPERTY CHANGE
  |--------------------------------------------------------------------------
  */

  const handlePropertyChange = (value) => {
    const property = properties.find(
      (item) => String(item._id || item.id) === String(value),
    );

    setForm((current) => ({
      ...current,
      property: value,
      propertyPrice: property?.price || '',
      proposalPrice: '',
    }));

    setError('');
    setSuccess('');
  };

  /*
  |--------------------------------------------------------------------------
  | NUMBER
  |--------------------------------------------------------------------------
  */

  const toNumber = (value) => {
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0;
    }

    let normalized = String(value).replace(/\s/g, '').replace(/[R$]/gi, '');

    /*
     * Brasil:
     *
     * 500.000,00
     * 500000,00
     *
     * Internacional:
     *
     * 500000.00
     */

    if (normalized.includes(',')) {
      normalized = normalized.replace(/\./g, '').replace(',', '.');
    }

    const number = Number(normalized);

    return Number.isFinite(number) ? number : 0;
  };

  /*
  |--------------------------------------------------------------------------
  | CURRENCY
  |--------------------------------------------------------------------------
  */

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(toNumber(value));
  };

  /*
  |--------------------------------------------------------------------------
  | CALCULATIONS
  |--------------------------------------------------------------------------
  */

  const calculations = useMemo(() => {
    const propertyPrice = toNumber(form.propertyPrice);
    const proposalPrice = toNumber(form.proposalPrice);
    const downPayment = toNumber(form.downPayment);
    const financing = toNumber(form.financing);
    const fgts = toNumber(form.fgts);

    const totalPayment = downPayment + financing + fgts;

    const balance = Math.max(proposalPrice - totalPayment, 0);

    const discount =
      propertyPrice > 0 && proposalPrice > 0
        ? Math.max(propertyPrice - proposalPrice, 0)
        : 0;

    const discountPercentage =
      propertyPrice > 0 && discount > 0 ? (discount / propertyPrice) * 100 : 0;

    return {
      propertyPrice,
      proposalPrice,
      downPayment,
      financing,
      fgts,
      totalPayment,
      balance,
      discount,
      discountPercentage,
    };
  }, [
    form.propertyPrice,
    form.proposalPrice,
    form.downPayment,
    form.financing,
    form.fgts,
  ]);

  /*
  |--------------------------------------------------------------------------
  | VALIDATION
  |--------------------------------------------------------------------------
  */

  const validateForm = () => {
    if (!lead?._id) {
      return 'Lead não encontrado.';
    }

    if (!form.property) {
      return 'Selecione o imóvel da proposta.';
    }

    if (calculations.propertyPrice <= 0) {
      return 'Informe o valor do imóvel.';
    }

    if (calculations.proposalPrice <= 0) {
      return 'Informe o valor da proposta.';
    }

    if (calculations.downPayment < 0) {
      return 'O valor da entrada não pode ser negativo.';
    }

    if (calculations.financing < 0) {
      return 'O valor do financiamento não pode ser negativo.';
    }

    if (calculations.fgts < 0) {
      return 'O valor do FGTS não pode ser negativo.';
    }

    if (calculations.totalPayment > calculations.proposalPrice) {
      return (
        'A soma da entrada, financiamento e FGTS ' +
        'não pode ser maior que o valor da proposta.'
      );
    }

    if (!form.validityDays || Number(form.validityDays) < 1) {
      return 'Informe a validade da proposta.';
    }

    if (form.installments && Number(form.installments) < 0) {
      return 'O número de parcelas não pode ser negativo.';
    }

    if (form.installmentValue && toNumber(form.installmentValue) < 0) {
      return 'O valor da parcela não pode ser negativo.';
    }

    return null;
  };

  /*
  |--------------------------------------------------------------------------
  | BUILD PAYLOAD
  |--------------------------------------------------------------------------
  */

  const buildPayload = () => {
    return {
      lead: lead._id,

      property: form.property,

      values: {
        propertyPrice: calculations.propertyPrice,
        proposalPrice: calculations.proposalPrice,
        downPayment: calculations.downPayment,
        financing: calculations.financing,
        fgts: calculations.fgts,
      },

      paymentMethod: form.paymentMethod,

      installments: toNumber(form.installments),

      installmentValue: toNumber(form.installmentValue),

      validityDays: Number(form.validityDays),

      clientMessage: form.clientMessage?.trim() || '',
    };
  };

  /*
  |--------------------------------------------------------------------------
  | CREATE PROPOSAL
  |--------------------------------------------------------------------------
  */

  const createProposal = async () => {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return null;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = buildPayload();

      console.log('📄 Criando proposta...', payload);

      const response = await api.post('/api/proposals', payload);

      const data = response?.data;

      console.log('✅ Proposta criada:', data);

      /*
       * Compatibilidade com diferentes
       * formatos de resposta.
       */

      const proposal =
        data?.proposal || data?.data?.proposal || data?.data || data;

      const proposalId = proposal?._id || proposal?.id;

      if (!proposalId) {
        throw new Error(
          'A proposta foi criada, mas o servidor não retornou o ID da proposta.',
        );
      }

      const normalizedProposal = {
        ...proposal,
        _id: proposalId,
      };

      setSuccess('Proposta criada com sucesso.');

      return normalizedProposal;
    } catch (err) {
      console.error('❌ Erro ao criar proposta:', err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Não foi possível criar a proposta.';

      setError(message);

      return null;
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE
  |--------------------------------------------------------------------------
  */

  const handleSave = async () => {
    const proposal = await createProposal();

    if (!proposal) {
      return;
    }

    /*
     * Depois de criar:
     *
     * CREATE
     *   ↓
     * DETAILS
     *
     * A partir da página de detalhes,
     * o usuário poderá editar, enviar,
     * excluir etc.
     */

    setTimeout(() => {
      navigate(`/proposals/${proposal._id}`);
    }, 500);
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loadingLead) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Loader2 size={32} className="animate-spin text-blue-500" />

          <p>Carregando informações do lead...</p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | NO LEAD
  |--------------------------------------------------------------------------
  */

  if (!lead) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="
              flex
              items-center
              gap-2
              text-slate-400
              hover:text-white
              mb-6
              transition
            "
          >
            <ArrowLeft size={18} />
            Voltar
          </button>

          <div
            className="
              bg-slate-900
              border
              border-red-500/20
              rounded-2xl
              p-8
            "
          >
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle size={22} />

              <p>{error || 'Lead não encontrado.'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}

        <div
          className="
            flex
            flex-col
            lg:flex-row
            lg:items-center
            lg:justify-between
            gap-4
          "
        >
          <div>
            <button
              onClick={() => navigate(-1)}
              className="
                flex
                items-center
                gap-2
                text-slate-400
                hover:text-white
                transition
                mb-4
              "
            >
              <ArrowLeft size={18} />
              Voltar
            </button>

            <div className="flex items-center gap-3">
              <div
                className="
                  w-12
                  h-12
                  rounded-xl
                  bg-blue-500/10
                  border
                  border-blue-500/20
                  flex
                  items-center
                  justify-center
                "
              >
                <FileText size={24} className="text-blue-400" />
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  Nova Proposta
                </h1>

                <p className="text-slate-400 text-sm mt-1">
                  Crie uma nova proposta comercial para este lead.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={saving}
              className="
                flex
                items-center
                justify-center
                gap-2
                px-4
                py-2.5
                rounded-xl
                border
                border-slate-700
                bg-slate-900
                hover:bg-slate-800
                text-slate-200
                transition
                disabled:opacity-50
              "
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="
                flex
                items-center
                justify-center
                gap-2
                px-5
                py-2.5
                rounded-xl
                bg-blue-600
                hover:bg-blue-500
                text-white
                font-medium
                transition
                disabled:opacity-50
              "
            >
              {saving ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}
              Criar proposta
            </button>
          </div>
        </div>

        {/* ALERT */}

        {error && (
          <div
            className="
              flex
              items-start
              gap-3
              bg-red-500/10
              border
              border-red-500/20
              rounded-xl
              p-4
              text-red-300
            "
          >
            <AlertCircle size={20} className="mt-0.5 shrink-0" />

            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div
            className="
              flex
              items-center
              gap-3
              bg-emerald-500/10
              border
              border-emerald-500/20
              rounded-xl
              p-4
              text-emerald-300
            "
          >
            <CheckCircle2 size={20} />

            <p className="text-sm">{success}</p>
          </div>
        )}

        {/* LEAD */}

        <Card title="Lead" icon={<User size={18} />}>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            <Info label="Nome" value={lead.name} />

            <Info label="Email" value={lead.email} />

            <Info label="Telefone" value={lead.phone} />

            <Info
              label="Responsável"
              value={lead.assignedTo?.name || 'Não atribuído'}
            />
          </div>
        </Card>

        {/* PROPERTY */}

        <Card title="Imóvel" icon={<Building2 size={18} />}>
          {lead.property ? (
            <div
              className="
                rounded-xl
                border
                border-slate-800
                bg-slate-950
                p-5
              "
            >
              <div
                className="
                  flex
                  flex-col
                  md:flex-row
                  md:items-center
                  md:justify-between
                  gap-4
                "
              >
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">
                    Imóvel relacionado ao lead
                  </p>

                  <h3 className="text-lg font-semibold text-white mt-1">
                    {lead.property.title || lead.property.name || 'Imóvel'}
                  </h3>

                  {lead.property.code && (
                    <p className="text-sm text-slate-400 mt-1">
                      Código: {lead.property.code}
                    </p>
                  )}
                </div>

                <div className="text-left md:text-right">
                  <p className="text-xs text-slate-500">Valor atual</p>

                  <p className="text-xl font-bold text-emerald-400">
                    {formatCurrency(
                      lead.property.price ||
                        lead.propertyPrice ||
                        form.propertyPrice,
                    )}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-sm text-slate-300">
                Selecione o imóvel
              </label>

              <select
                value={form.property}
                onChange={(event) => handlePropertyChange(event.target.value)}
                disabled={loadingProperties}
                className="
                  w-full
                  bg-slate-950
                  border
                  border-slate-700
                  rounded-xl
                  px-4
                  py-3
                  text-white
                  outline-none
                  focus:border-blue-500
                "
              >
                <option value="">
                  {loadingProperties
                    ? 'Carregando imóveis...'
                    : 'Selecione um imóvel'}
                </option>

                {properties.map((property) => (
                  <option
                    key={property._id || property.id}
                    value={property._id || property.id}
                  >
                    {property.code ? `${property.code} - ` : ''}
                    {property.title || property.name || 'Imóvel'}
                  </option>
                ))}
              </select>

              {!loadingProperties && properties.length === 0 && (
                <p className="text-sm text-slate-500">
                  Nenhum imóvel disponível para seleção.
                </p>
              )}
            </div>
          )}
        </Card>

        {/* VALUES */}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card title="Valores da proposta" icon={<DollarSign size={18} />}>
              <div className="grid md:grid-cols-2 gap-5">
                <MoneyInput
                  label="Valor do imóvel"
                  value={form.propertyPrice}
                  onChange={(value) => handleChange('propertyPrice', value)}
                  disabled={!!lead.property}
                />

                <MoneyInput
                  label="Valor da proposta"
                  value={form.proposalPrice}
                  onChange={(value) => handleChange('proposalPrice', value)}
                  required
                />

                <MoneyInput
                  label="Entrada"
                  value={form.downPayment}
                  onChange={(value) => handleChange('downPayment', value)}
                />

                <MoneyInput
                  label="Financiamento"
                  value={form.financing}
                  onChange={(value) => handleChange('financing', value)}
                />

                <MoneyInput
                  label="FGTS"
                  value={form.fgts}
                  onChange={(value) => handleChange('fgts', value)}
                />
              </div>
            </Card>
          </div>

          {/* SUMMARY */}

          <Card title="Resumo financeiro" icon={<Calculator size={18} />}>
            <div className="space-y-4">
              <SummaryRow
                label="Valor do imóvel"
                value={formatCurrency(calculations.propertyPrice)}
              />

              <SummaryRow
                label="Valor da proposta"
                value={formatCurrency(calculations.proposalPrice)}
                highlight
              />

              <SummaryRow
                label="Entrada"
                value={formatCurrency(calculations.downPayment)}
              />

              <SummaryRow
                label="Financiamento"
                value={formatCurrency(calculations.financing)}
              />

              <SummaryRow
                label="FGTS"
                value={formatCurrency(calculations.fgts)}
              />

              <div className="border-t border-slate-800 pt-4">
                <SummaryRow
                  label="Saldo restante"
                  value={formatCurrency(calculations.balance)}
                  highlight
                />
              </div>

              {calculations.discount > 0 && (
                <div
                  className="
                    bg-amber-500/10
                    border
                    border-amber-500/20
                    rounded-xl
                    p-3
                  "
                >
                  <p className="text-xs text-amber-400">Desconto solicitado</p>

                  <p className="text-sm text-amber-300 font-medium mt-1">
                    {formatCurrency(calculations.discount)} (
                    {calculations.discountPercentage.toFixed(2)}
                    %)
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* PAYMENT */}

        <Card title="Condições de pagamento" icon={<CreditCard size={18} />}>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            <SelectField
              label="Forma de pagamento"
              value={form.paymentMethod}
              onChange={(value) => handleChange('paymentMethod', value)}
              options={[
                {
                  value: 'financing',
                  label: 'Financiamento',
                },
                {
                  value: 'cash',
                  label: 'À vista',
                },
                {
                  value: 'fgts',
                  label: 'FGTS',
                },
                {
                  value: 'mixed',
                  label: 'Misto',
                },
              ]}
            />

            <Input
              label="Parcelas"
              type="number"
              min="0"
              value={form.installments}
              onChange={(event) =>
                handleChange('installments', event.target.value)
              }
              placeholder="Ex: 360"
            />

            <MoneyInput
              label="Valor da parcela"
              value={form.installmentValue}
              onChange={(value) => handleChange('installmentValue', value)}
            />

            <Input
              label="Validade (dias)"
              type="number"
              min="1"
              value={form.validityDays}
              onChange={(event) =>
                handleChange('validityDays', event.target.value)
              }
            />
          </div>
        </Card>

        {/* MESSAGE */}

        <Card title="Mensagem para o cliente" icon={<FileText size={18} />}>
          <textarea
            value={form.clientMessage}
            onChange={(event) =>
              handleChange('clientMessage', event.target.value)
            }
            rows={5}
            placeholder="Digite uma mensagem ou observação que será apresentada ao cliente..."
            className="
              w-full
              bg-slate-950
              border
              border-slate-700
              rounded-xl
              px-4
              py-3
              text-white
              placeholder:text-slate-600
              outline-none
              focus:border-blue-500
              resize-none
            "
          />

          <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
            <CalendarDays size={14} />
            Esta proposta terá validade de{' '}
            <strong className="text-slate-300">
              {form.validityDays || 0} dias
            </strong>
            .
          </div>
        </Card>

        {/* FOOTER */}

        <div
          className="
            flex
            flex-col-reverse
            sm:flex-row
            sm:justify-end
            gap-3
            border-t
            border-slate-800
            pt-6
          "
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={saving}
            className="
              px-5
              py-3
              rounded-xl
              border
              border-slate-700
              text-slate-300
              hover:bg-slate-900
              transition
              disabled:opacity-50
            "
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="
              flex
              items-center
              justify-center
              gap-2
              px-6
              py-3
              rounded-xl
              bg-blue-600
              hover:bg-blue-500
              font-semibold
              transition
              disabled:opacity-50
            "
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Criar proposta
          </button>
        </div>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| CARD
|--------------------------------------------------------------------------
*/

function Card({ title, icon, children }) {
  return (
    <section
      className="
        bg-slate-900
        border
        border-slate-800
        rounded-2xl
        shadow-lg
        p-5
        md:p-6
      "
    >
      <div className="flex items-center gap-2 mb-6">
        {icon && <div className="text-blue-400">{icon}</div>}

        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>

      {children}
    </section>
  );
}

/*
|--------------------------------------------------------------------------
| INFO
|--------------------------------------------------------------------------
*/

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-1">{label}</p>

      <p className="text-sm text-slate-200 font-medium truncate">
        {value || '-'}
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| INPUT
|--------------------------------------------------------------------------
*/

function Input({ label, type = 'text', value, onChange, placeholder, min }) {
  return (
    <div>
      <label className="block text-sm text-slate-300 mb-2">{label}</label>

      <input
        type={type}
        min={min}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full
          bg-slate-950
          border
          border-slate-700
          rounded-xl
          px-4
          py-3
          text-white
          placeholder:text-slate-600
          outline-none
          focus:border-blue-500
        "
      />
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| MONEY INPUT
|--------------------------------------------------------------------------
*/

function MoneyInput({
  label,
  value,
  onChange,
  disabled = false,
  required = false,
}) {
  return (
    <div>
      <label className="block text-sm text-slate-300 mb-2">
        {label}

        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      <div className="relative">
        <span
          className="
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            text-slate-500
            text-sm
          "
        >
          R$
        </span>

        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="
            w-full
            bg-slate-950
            border
            border-slate-700
            rounded-xl
            pl-11
            pr-4
            py-3
            text-white
            outline-none
            focus:border-blue-500
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
          placeholder="0,00"
        />
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| SELECT
|--------------------------------------------------------------------------
*/

function SelectField({ label, value, onChange, options = [] }) {
  return (
    <div>
      <label className="block text-sm text-slate-300 mb-2">{label}</label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="
          w-full
          bg-slate-950
          border
          border-slate-700
          rounded-xl
          px-4
          py-3
          text-white
          outline-none
          focus:border-blue-500
        "
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| SUMMARY ROW
|--------------------------------------------------------------------------
*/

function SummaryRow({ label, value, highlight = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-400">{label}</span>

      <span
        className={
          highlight
            ? 'text-sm font-semibold text-emerald-400'
            : 'text-sm font-medium text-slate-200'
        }
      >
        {value}
      </span>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  ArrowLeft,
  User,
  Building2,
  DollarSign,
  CreditCard,
  FileText,
  CalendarDays,
  Save,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calculator,
  Lock,
} from 'lucide-react';

import api from '../service/api';

export default function ProposalEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [proposal, setProposal] = useState(null);
  const [properties, setProperties] = useState([]);

  const [loading, setLoading] = useState(true);
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
  | LOAD PROPOSAL
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!id) {
      setError('ID da proposta não informado.');
      setLoading(false);
      return;
    }

    let mounted = true;

    async function loadProposal() {
      try {
        setLoading(true);
        setError('');

        const response = await api.get(`/api/proposals/${id}`);

        if (!mounted) return;

        const data = response?.data;

        /*
         * Compatibilidade com diferentes respostas:
         *
         * { proposal: {...} }
         *
         * { data: { proposal: {...} } }
         *
         * { data: {...} }
         *
         * {...}
         */

        const proposalData =
          data?.proposal || data?.data?.proposal || data?.data || data;

        if (!proposalData?._id && !proposalData?.id) {
          setError('Proposta não encontrada.');
          return;
        }

        setProposal(proposalData);

        /*
         * Normaliza valores da proposta.
         */

        const values = proposalData.values || {};

        const property =
          proposalData.property?._id ||
          proposalData.property?.id ||
          proposalData.property ||
          '';

        const propertyPrice =
          values.propertyPrice ??
          proposalData.propertyPrice ??
          proposalData.property?.price ??
          '';

        const proposalPrice =
          values.proposalPrice ??
          proposalData.proposalPrice ??
          proposalData.price ??
          '';

        const downPayment =
          values.downPayment ?? proposalData.downPayment ?? '';

        const financing = values.financing ?? proposalData.financing ?? '';

        const fgts = values.fgts ?? proposalData.fgts ?? '';

        setForm({
          property,
          propertyPrice,
          proposalPrice,
          downPayment,
          financing,
          fgts,

          paymentMethod: proposalData.paymentMethod || 'financing',

          installments: proposalData.installments ?? '',

          installmentValue: proposalData.installmentValue ?? '',

          validityDays: proposalData.validityDays ?? 7,

          clientMessage: proposalData.clientMessage || '',
        });
      } catch (err) {
        console.error('Erro ao carregar proposta:', err);

        if (!mounted) return;

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            'Não foi possível carregar a proposta.',
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadProposal();

    return () => {
      mounted = false;
    };
  }, [id]);

  /*
  |--------------------------------------------------------------------------
  | LOAD PROPERTIES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    let mounted = true;

    async function loadProperties() {
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
    }

    /*
     * Só carrega depois que a proposta
     * estiver disponível.
     */

    if (proposal) {
      loadProperties();
    }

    return () => {
      mounted = false;
    };
  }, [proposal]);

  /*
  |--------------------------------------------------------------------------
  | PROPERTY
  |--------------------------------------------------------------------------
  */

  const selectedProperty = useMemo(() => {
    if (!form.property) {
      return null;
    }

    /*
     * Primeiro tenta o imóvel populado
     * diretamente na proposta.
     */

    if (
      proposal?.property &&
      typeof proposal.property === 'object' &&
      String(proposal.property._id || proposal.property.id) ===
        String(form.property)
    ) {
      return proposal.property;
    }

    return properties.find(
      (property) =>
        String(property._id || property.id) === String(form.property),
    );
  }, [form.property, proposal, properties]);

  /*
  |--------------------------------------------------------------------------
  | STATUS
  |--------------------------------------------------------------------------
  */

  const proposalStatus = proposal?.status || proposal?.state || '';

  const normalizedStatus = String(proposalStatus).toLowerCase();

  /*
   * Ajuste os status abaixo conforme os enums
   * definitivos do seu Proposal model.
   */

  const isLocked = [
    'approved',
    'aprovada',
    'rejected',
    'rejeitada',
    'closed',
    'fechada',
    'cancelled',
    'cancelada',
  ].includes(normalizedStatus);

  /*
  |--------------------------------------------------------------------------
  | FORM HELPERS
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

  const handlePropertyChange = (value) => {
    const property = properties.find(
      (item) => String(item._id || item.id) === String(value),
    );

    setForm((current) => ({
      ...current,

      property: value,

      propertyPrice: property?.price ?? current.propertyPrice,

      proposalPrice: current.proposalPrice,
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

    let normalized = String(value).replace(/\s/g, '');

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
    const number = toNumber(value);

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(number);
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
        ? propertyPrice - proposalPrice
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
    if (!proposal?._id && !proposal?.id) {
      return 'Proposta não encontrada.';
    }

    if (isLocked) {
      return 'Esta proposta não pode mais ser editada neste status.';
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
      return 'A soma da entrada, financiamento e FGTS não pode ser maior que o valor da proposta.';
    }

    if (!form.validityDays || Number(form.validityDays) < 1) {
      return 'Informe a validade da proposta.';
    }

    if (Number(form.installments) < 0) {
      return 'O número de parcelas não pode ser negativo.';
    }

    if (toNumber(form.installmentValue) < 0) {
      return 'O valor da parcela não pode ser negativo.';
    }

    return null;
  };

  /*
  |--------------------------------------------------------------------------
  | BUILD PAYLOAD
  |--------------------------------------------------------------------------
  */

  const buildPayload = () => ({
    lead: proposal.lead?._id || proposal.lead?.id || proposal.lead,

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
  });

  /*
  |--------------------------------------------------------------------------
  | UPDATE
  |--------------------------------------------------------------------------
  */

  const updateProposal = async () => {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return null;
    }

    const proposalId = proposal._id || proposal.id;

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = buildPayload();

      console.log('====================================');

      console.log('✏️ ATUALIZANDO PROPOSTA');

      console.log('🆔 ID:', proposalId);

      console.log('📦 Payload:', payload);

      console.log('====================================');

      /*
       * PATCH é usado porque estamos
       * atualizando uma proposta existente.
       */

      const response = await api.patch(`/api/proposals/${proposalId}`, payload);

      const data = response?.data;

      console.log('====================================');

      console.log('✅ RESPOSTA UPDATE PROPOSAL');

      console.log('📦 response.data:', data);

      console.log('====================================');

      const updatedProposal =
        data?.proposal || data?.data?.proposal || data?.data || data;

      const updatedId =
        updatedProposal?._id || updatedProposal?.id || proposalId;

      const normalizedProposal = {
        ...updatedProposal,
        _id: updatedId,
      };

      setProposal(normalizedProposal);

      setSuccess('Proposta atualizada com sucesso.');

      return normalizedProposal;
    } catch (err) {
      console.error('====================================');

      console.error('❌ ERRO AO ATUALIZAR PROPOSTA');

      console.error('📛 Error:', err);

      console.error('📛 Response:', err?.response?.data);

      console.error('📛 Status:', err?.response?.status);

      console.error('====================================');

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Não foi possível atualizar a proposta.';

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
    const updated = await updateProposal();

    if (!updated) {
      return;
    }

    setTimeout(() => {
      navigate(`/proposals/${updated._id}`);
    }, 700);
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE + SUBMIT
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async () => {
    const updated = await updateProposal();

    if (!updated) {
      return;
    }

    try {
      setSaving(true);
      setError('');

      await api.patch(`/api/proposals/${updated._id}/submit`);

      setSuccess('Proposta atualizada e enviada para aprovação.');

      setTimeout(() => {
        navigate(`/proposals/${updated._id}`);
      }, 700);
    } catch (err) {
      console.error('Erro ao enviar proposta:', err);

      setError(
        err?.response?.data?.message ||
          'A proposta foi atualizada, mas não foi possível enviá-la para aprovação.',
      );
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Loader2 size={32} className="animate-spin text-blue-500" />

          <p>Carregando proposta...</p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ERROR / NOT FOUND
  |--------------------------------------------------------------------------
  */

  if (!proposal) {
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

              <p>{error || 'Proposta não encontrada.'}</p>
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
        {/* ==========================================================
            HEADER
        ========================================================== */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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
                  Editar Proposta
                </h1>

                <p className="text-slate-400 text-sm mt-1">
                  Atualize as informações da proposta comercial.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || isLocked}
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
                disabled:cursor-not-allowed
              "
            >
              {saving ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}
              Salvar alterações
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving || isLocked}
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
                disabled:cursor-not-allowed
              "
            >
              {saving ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Send size={17} />
              )}
              Salvar e enviar
            </button>
          </div>
        </div>

        {/* ==========================================================
            STATUS
        ========================================================== */}

        <div
          className="
            flex
            flex-wrap
            items-center
            gap-3
            bg-slate-900
            border
            border-slate-800
            rounded-xl
            px-4
            py-3
          "
        >
          <span className="text-xs text-slate-500 uppercase tracking-wide">
            Status atual
          </span>

          <StatusBadge status={proposalStatus} />

          {isLocked && (
            <div className="flex items-center gap-2 text-amber-400 text-sm">
              <Lock size={15} />
              Esta proposta não pode ser editada neste status.
            </div>
          )}
        </div>

        {/* ==========================================================
            ALERTS
        ========================================================== */}

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

        {/* ==========================================================
            LEAD
        ========================================================== */}

        <Card title="Lead" icon={<User size={18} />}>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            <Info
              label="Nome"
              value={proposal.lead?.name || proposal.leadName}
            />

            <Info
              label="Email"
              value={proposal.lead?.email || proposal.leadEmail}
            />

            <Info
              label="Telefone"
              value={proposal.lead?.phone || proposal.leadPhone}
            />

            <Info
              label="Responsável"
              value={
                proposal.lead?.assignedTo?.name ||
                proposal.createdBy?.name ||
                'Não atribuído'
              }
            />
          </div>
        </Card>

        {/* ==========================================================
            IMÓVEL
        ========================================================== */}

        <Card title="Imóvel" icon={<Building2 size={18} />}>
          <div className="space-y-4">
            <div className="grid lg:grid-cols-[1fr_auto] gap-5">
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Imóvel
                </label>

                <select
                  value={form.property}
                  onChange={(event) => handlePropertyChange(event.target.value)}
                  disabled={loadingProperties || isLocked}
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
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  <option value="">
                    {loadingProperties
                      ? 'Carregando imóveis...'
                      : 'Selecione um imóvel'}
                  </option>

                  {selectedProperty &&
                    !properties.some(
                      (item) =>
                        String(item._id || item.id) === String(form.property),
                    ) && (
                      <option
                        value={selectedProperty._id || selectedProperty.id}
                      >
                        {selectedProperty.code
                          ? `${selectedProperty.code} - `
                          : ''}
                        {selectedProperty.title ||
                          selectedProperty.name ||
                          'Imóvel'}
                      </option>
                    )}

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
              </div>

              <div className="lg:min-w-[220px]">
                <p className="text-xs text-slate-500 mb-2">Valor atual</p>

                <div
                  className="
                    rounded-xl
                    border
                    border-slate-800
                    bg-slate-950
                    px-4
                    py-3
                  "
                >
                  <p className="text-lg font-bold text-emerald-400">
                    {formatCurrency(
                      selectedProperty?.price || form.propertyPrice,
                    )}
                  </p>
                </div>
              </div>
            </div>

            {selectedProperty && (
              <div
                className="
                  grid
                  md:grid-cols-2
                  lg:grid-cols-4
                  gap-4
                  rounded-xl
                  border
                  border-slate-800
                  bg-slate-950
                  p-4
                "
              >
                <Info label="Código" value={selectedProperty.code} />

                <Info label="Tipo" value={selectedProperty.type} />

                <Info
                  label="Endereço"
                  value={getPropertyAddress(selectedProperty)}
                />

                <Info label="Status" value={selectedProperty.status} />
              </div>
            )}
          </div>
        </Card>

        {/* ==========================================================
            VALORES
        ========================================================== */}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card title="Valores da proposta" icon={<DollarSign size={18} />}>
              <div className="grid md:grid-cols-2 gap-5">
                <MoneyInput
                  label="Valor do imóvel"
                  value={form.propertyPrice}
                  onChange={(value) => handleChange('propertyPrice', value)}
                  disabled={isLocked}
                />

                <MoneyInput
                  label="Valor da proposta"
                  value={form.proposalPrice}
                  onChange={(value) => handleChange('proposalPrice', value)}
                  required
                  disabled={isLocked}
                />

                <MoneyInput
                  label="Entrada"
                  value={form.downPayment}
                  onChange={(value) => handleChange('downPayment', value)}
                  disabled={isLocked}
                />

                <MoneyInput
                  label="Financiamento"
                  value={form.financing}
                  onChange={(value) => handleChange('financing', value)}
                  disabled={isLocked}
                />

                <MoneyInput
                  label="FGTS"
                  value={form.fgts}
                  onChange={(value) => handleChange('fgts', value)}
                  disabled={isLocked}
                />
              </div>
            </Card>
          </div>

          {/* ========================================================
              RESUMO
          ======================================================== */}

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
                  label="Total informado"
                  value={formatCurrency(calculations.totalPayment)}
                />

                <div className="mt-3">
                  <SummaryRow
                    label="Saldo restante"
                    value={formatCurrency(calculations.balance)}
                    highlight
                  />
                </div>
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

        {/* ==========================================================
            CONDIÇÕES
        ========================================================== */}

        <Card title="Condições de pagamento" icon={<CreditCard size={18} />}>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            <SelectField
              label="Forma de pagamento"
              value={form.paymentMethod}
              onChange={(value) => handleChange('paymentMethod', value)}
              disabled={isLocked}
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
              disabled={isLocked}
            />

            <MoneyInput
              label="Valor da parcela"
              value={form.installmentValue}
              onChange={(value) => handleChange('installmentValue', value)}
              disabled={isLocked}
            />

            <Input
              label="Validade (dias)"
              type="number"
              min="1"
              value={form.validityDays}
              onChange={(event) =>
                handleChange('validityDays', event.target.value)
              }
              disabled={isLocked}
            />
          </div>
        </Card>

        {/* ==========================================================
            MENSAGEM
        ========================================================== */}

        <Card title="Mensagem para o cliente" icon={<FileText size={18} />}>
          <textarea
            value={form.clientMessage}
            onChange={(event) =>
              handleChange('clientMessage', event.target.value)
            }
            disabled={isLocked}
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
              disabled:opacity-50
              disabled:cursor-not-allowed
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

        {/* ==========================================================
            FOOTER
        ========================================================== */}

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
            onClick={() => navigate(`/proposals/${id}`)}
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
            "
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || isLocked}
            className="
              flex
              items-center
              justify-center
              gap-2
              px-5
              py-3
              rounded-xl
              border
              border-slate-700
              bg-slate-900
              hover:bg-slate-800
              transition
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Salvar alterações
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || isLocked}
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
              disabled:cursor-not-allowed
            "
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
            Salvar e enviar
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

function Input({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  min,
  disabled = false,
}) {
  return (
    <div>
      <label className="block text-sm text-slate-300 mb-2">{label}</label>

      <input
        type={type}
        min={min}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
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
          disabled:opacity-50
          disabled:cursor-not-allowed
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

function SelectField({
  label,
  value,
  onChange,
  options = [],
  disabled = false,
}) {
  return (
    <div>
      <label className="block text-sm text-slate-300 mb-2">{label}</label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
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
          disabled:opacity-50
          disabled:cursor-not-allowed
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

/*
|--------------------------------------------------------------------------
| STATUS BADGE
|--------------------------------------------------------------------------
*/

function StatusBadge({ status }) {
  const normalized = String(status || '').toLowerCase();

  const config = {
    draft: {
      label: 'Rascunho',
      className: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
    },

    rascunho: {
      label: 'Rascunho',
      className: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
    },

    pending: {
      label: 'Aguardando aprovação',
      className: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    },

    pending_approval: {
      label: 'Aguardando aprovação',
      className: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    },

    aguardando_aprovacao: {
      label: 'Aguardando aprovação',
      className: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    },

    approved: {
      label: 'Aprovada',
      className: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    },

    aprovada: {
      label: 'Aprovada',
      className: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    },

    rejected: {
      label: 'Rejeitada',
      className: 'bg-red-500/10 text-red-300 border-red-500/20',
    },

    rejeitada: {
      label: 'Rejeitada',
      className: 'bg-red-500/10 text-red-300 border-red-500/20',
    },

    closed: {
      label: 'Fechada',
      className: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    },

    fechada: {
      label: 'Fechada',
      className: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    },
  };

  const current = config[normalized] || {
    label: status || 'Sem status',
    className: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        px-3
        py-1
        rounded-full
        border
        text-xs
        font-medium
        ${current.className}
      `}
    >
      {current.label}
    </span>
  );
}

/*
|--------------------------------------------------------------------------
| PROPERTY ADDRESS
|--------------------------------------------------------------------------
*/

function getPropertyAddress(property) {
  if (!property) {
    return '-';
  }

  if (typeof property.address === 'string') {
    return property.address;
  }

  if (property.address && typeof property.address === 'object') {
    const parts = [
      property.address.street,
      property.address.number,
      property.address.neighborhood,
      property.address.city,
      property.address.state,
    ].filter(Boolean);

    if (parts.length > 0) {
      return parts.join(', ');
    }
  }

  const parts = [
    property.street,
    property.number,
    property.neighborhood,
    property.city,
    property.state,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(', ') : '-';
}

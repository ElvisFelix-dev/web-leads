import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  ArrowLeft,
  User,
  Building2,
  DollarSign,
  CreditCard,
  FileText,
  CalendarDays,
  Pencil,
  Send,
  Trash2,
  XCircle,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Loader2,
  Calculator,
  Phone,
  Mail,
  MapPin,
  Hash,
  RefreshCw,
  ChevronRight,
  BedDouble,
  Bath,
  Car,
  Ruler,
  Home,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';

import api from '../service/api';

export default function ProposalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [proposal, setProposal] = useState(null);
  const [property, setProperty] = useState(null);

  const [loading, setLoading] = useState(true);
  const [propertyLoading, setPropertyLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [confirmAction, setConfirmAction] = useState(null);

  /*
  |--------------------------------------------------------------------------
  | HELPERS
  |--------------------------------------------------------------------------
  */

  const getId = useCallback((value) => {
    if (!value) return '';

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'object') {
      return value._id || value.id || '';
    }

    return '';
  }, []);

  const getName = useCallback((value, fallback = '-') => {
    if (!value) return fallback;

    if (typeof value === 'string') {
      return value;
    }

    return (
      value.name ||
      value.fullName ||
      value.title ||
      value.propertyName ||
      value.description ||
      value.companyName ||
      fallback
    );
  }, []);

  const toNumber = useCallback((value) => {
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0;
    }

    let normalized = String(value).replace(/\s/g, '').replace(/R\$/gi, '');

    if (normalized.includes(',')) {
      normalized = normalized.replace(/\./g, '').replace(',', '.');
    }

    const number = Number(normalized);

    return Number.isFinite(number) ? number : 0;
  }, []);

  const formatCurrency = useCallback(
    (value) => {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(toNumber(value));
    },
    [toNumber],
  );

  const formatNumber = useCallback(
    (value) => {
      const number = toNumber(value);

      if (!number) return '-';

      return new Intl.NumberFormat('pt-BR').format(number);
    },
    [toNumber],
  );

  const formatDate = useCallback((value) => {
    if (!value) return '-';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }, []);

  const normalizeStatus = useCallback((value) => {
    if (!value) return 'draft';

    return String(value)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/-/g, '_');
  }, []);

  /*
  |--------------------------------------------------------------------------
  | LOAD PROPERTY
  |--------------------------------------------------------------------------
  */

  const loadProperty = useCallback(async (propertyReference) => {
    if (!propertyReference) {
      setProperty(null);
      return null;
    }

    // Extrai o ID do imóvel de qualquer lugar que possa estar
    let propertyId = null;

    if (typeof propertyReference === 'string') {
      propertyId = propertyReference;
    } else if (typeof propertyReference === 'object') {
      propertyId =
        propertyReference._id ||
        propertyReference.id ||
        propertyReference.propertyId;
    }

    if (!propertyId) {
      setProperty(null);
      return null;
    }

    try {
      setPropertyLoading(true);

      /*
       * SEMPRE busca o imóvel completo via API
       * Isso garante que teremos todos os dados
       */
      const response = await api.get(`/api/properties/${propertyId}`);

      const responseData = response?.data;

      // Tenta extrair os dados do imóvel de diferentes formatos de resposta
      const propertyData =
        responseData?.data?.property ||
        responseData?.data ||
        responseData?.property ||
        responseData;

      if (
        propertyData &&
        typeof propertyData === 'object' &&
        !Array.isArray(propertyData)
      ) {
        setProperty(propertyData);
        return propertyData;
      }

      setProperty(null);
      return null;
    } catch (err) {
      console.error('Erro ao carregar imóvel da proposta:', err);
      setProperty(null);
      return null;
    } finally {
      setPropertyLoading(false);
    }
  }, []);

  /*
  |--------------------------------------------------------------------------
  | LOAD PROPOSAL
  |--------------------------------------------------------------------------
  */

  const loadProposal = useCallback(
    async ({ silent = false } = {}) => {
      if (!id) {
        setError('ID da proposta não informado.');
        setLoading(false);
        return;
      }

      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError('');

        const response = await api.get(`/api/proposals/${id}`);

        const responseData = response?.data;

        /*
         * Compatibilidade com diferentes formatos:
         *
         * {
         *   success: true,
         *   data: {...}
         * }
         *
         * {
         *   success: true,
         *   data: {
         *     proposal: {...}
         *   }
         * }
         *
         * {
         *   proposal: {...}
         * }
         *
         * {...}
         */

        const proposalData =
          responseData?.data?.proposal ||
          responseData?.data ||
          responseData?.proposal ||
          responseData;

        if (!proposalData || typeof proposalData !== 'object') {
          setProposal(null);
          setProperty(null);
          setError('Proposta não encontrada.');
          return;
        }

        setProposal(proposalData);

        /*
         * ================================================================
         * IMÓVEL
         * ================================================================
         *
         * Primeiro tentamos descobrir se o imóvel já veio populado.
         */

        // Verifica se o imóvel está em qualquer lugar possível
        const proposalProperty =
          proposalData.property ||
          proposalData.propertyId ||
          proposalData.propertyData ||
          proposalData.immobile ||
          proposalData.imovel ||
          null;

        if (proposalProperty) {
          await loadProperty(proposalProperty);
        } else {
          setProperty(null);
        }
      } catch (err) {
        console.error('Erro ao carregar proposta:', err);

        setProposal(null);
        setProperty(null);

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            'Não foi possível carregar a proposta.',
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id, loadProperty],
  );

  useEffect(() => {
    loadProposal();
  }, [loadProposal]);

  /*
  |--------------------------------------------------------------------------
  | LEAD
  |--------------------------------------------------------------------------
  */

  const lead = useMemo(() => {
    return proposal?.lead || proposal?.client || null;
  }, [proposal]);

  /*
  |--------------------------------------------------------------------------
  | PROPERTY NORMALIZATION
  |--------------------------------------------------------------------------
  */

  const propertyData = useMemo(() => {
    /*
     * Prioridade:
     *
     * 1. imóvel carregado diretamente via API (completo)
     * 2. imóvel populado dentro da proposta (parcial)
     */

    const rawProperty =
      property ||
      (proposal?.property && typeof proposal.property === 'object'
        ? proposal.property
        : null);

    if (!rawProperty) {
      return {
        id: '',
        title: 'Imóvel não informado',
        code: '',
        type: '-',
        purpose: '-',
        status: '-',
        price: 0,
        area: 0,
        bedrooms: 0,
        suites: 0,
        bathrooms: 0,
        parkingSpaces: 0,
        location: '-',
        address: null,
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
        description: '',
        images: [],
        mainImage: '',
      };
    }

    const address =
      rawProperty.address ||
      rawProperty.location?.address ||
      rawProperty.endereco ||
      null;

    const images = Array.isArray(rawProperty.images)
      ? rawProperty.images
      : Array.isArray(rawProperty.photos)
        ? rawProperty.photos
        : Array.isArray(rawProperty.gallery)
          ? rawProperty.gallery
          : Array.isArray(rawProperty.media)
            ? rawProperty.media
            : [];

    const title =
      rawProperty.title ||
      rawProperty.name ||
      rawProperty.propertyName ||
      rawProperty.reference ||
      rawProperty.code ||
      'Imóvel';

    const price =
      rawProperty.price ??
      rawProperty.salePrice ??
      rawProperty.sellingPrice ??
      rawProperty.value ??
      rawProperty.propertyPrice ??
      0;

    const area =
      rawProperty.area ??
      rawProperty.totalArea ??
      rawProperty.privateArea ??
      rawProperty.builtArea ??
      rawProperty.areaTotal ??
      0;

    const bedrooms =
      rawProperty.bedrooms ??
      rawProperty.dormitories ??
      rawProperty.rooms ??
      rawProperty.quartos ??
      0;

    const suites =
      rawProperty.suites ?? rawProperty.suiteCount ?? rawProperty.suite ?? 0;

    const bathrooms =
      rawProperty.bathrooms ??
      rawProperty.bathroomCount ??
      rawProperty.banheiros ??
      0;

    const parkingSpaces =
      rawProperty.parkingSpaces ??
      rawProperty.garages ??
      rawProperty.parking ??
      rawProperty.vacancies ??
      rawProperty.vagas ??
      0;

    const mainImage =
      rawProperty.mainImage ||
      rawProperty.coverImage ||
      rawProperty.thumbnail ||
      rawProperty.image ||
      '';

    return {
      ...rawProperty,

      id: getId(rawProperty),

      title,

      code:
        rawProperty.code ||
        rawProperty.reference ||
        rawProperty.codigo ||
        rawProperty.referenceCode ||
        '',

      type:
        rawProperty.type ||
        rawProperty.propertyType ||
        rawProperty.category ||
        rawProperty.tipo ||
        '-',

      purpose:
        rawProperty.purpose ||
        rawProperty.transactionType ||
        rawProperty.businessType ||
        rawProperty.finality ||
        '-',

      status: rawProperty.status || rawProperty.propertyStatus || '-',

      price: toNumber(price),

      area: toNumber(area),

      bedrooms: toNumber(bedrooms),

      suites: toNumber(suites),

      bathrooms: toNumber(bathrooms),

      parkingSpaces: toNumber(parkingSpaces),

      address,

      location: getPropertyLocation(rawProperty),

      neighborhood:
        rawProperty.neighborhood ||
        rawProperty.bairro ||
        rawProperty.location?.neighborhood ||
        '',

      city:
        rawProperty.city ||
        rawProperty.cidade ||
        rawProperty.location?.city ||
        '',

      state:
        rawProperty.state ||
        rawProperty.estado ||
        rawProperty.uf ||
        rawProperty.location?.state ||
        '',

      zipCode:
        rawProperty.zipCode ||
        rawProperty.cep ||
        rawProperty.location?.zipCode ||
        '',

      description:
        rawProperty.description ||
        rawProperty.details ||
        rawProperty.observations ||
        '',

      images,

      mainImage,
    };
  }, [property, proposal, getId, toNumber]);

  /*
  |--------------------------------------------------------------------------
  | PROPERTY IMAGE
  |--------------------------------------------------------------------------
  */

  const getImageUrl = useCallback((image) => {
    if (!image) return '';

    if (typeof image === 'string') {
      return image;
    }

    return (
      image?.url ||
      image?.secure_url ||
      image?.src ||
      image?.path ||
      image?.imageUrl ||
      ''
    );
  }, []);

  const propertyMainImage = useMemo(() => {
    if (propertyData.mainImage) {
      return getImageUrl(propertyData.mainImage);
    }

    if (propertyData.images?.length) {
      return getImageUrl(propertyData.images[0]);
    }

    return '';
  }, [propertyData, getImageUrl]);

  /*
  |--------------------------------------------------------------------------
  | FINANCIAL DATA
  |--------------------------------------------------------------------------
  */

  const values = useMemo(() => {
    return proposal?.values || proposal?.financial || proposal?.amounts || {};
  }, [proposal]);

  const propertyPrice = toNumber(
    values.propertyPrice || proposal?.propertyPrice || propertyData.price || 0,
  );

  const proposalPrice = toNumber(
    values.proposalPrice || proposal?.proposalPrice || proposal?.price || 0,
  );

  const downPayment = toNumber(
    values.downPayment || proposal?.downPayment || 0,
  );

  const financing = toNumber(values.financing || proposal?.financing || 0);

  const fgts = toNumber(values.fgts || proposal?.fgts || 0);

  const installments = toNumber(
    proposal?.installments || values.installments || 0,
  );

  const installmentValue = toNumber(
    proposal?.installmentValue || values.installmentValue || 0,
  );

  const totalPayment = downPayment + financing + fgts;

  const balance = Math.max(proposalPrice - totalPayment, 0);

  const discount = Math.max(propertyPrice - proposalPrice, 0);

  const discountPercentage =
    propertyPrice > 0 && discount > 0 ? (discount / propertyPrice) * 100 : 0;

  /*
  |--------------------------------------------------------------------------
  | STATUS
  |--------------------------------------------------------------------------
  */

  const status = normalizeStatus(
    proposal?.status || proposal?.stage || proposal?.state,
  );

  const statusConfig = getStatusConfig(status);

  /*
  |--------------------------------------------------------------------------
  | PERMISSIONS
  |--------------------------------------------------------------------------
  */

  const canEdit = ['draft', 'rascunho', 'rejected', 'recusada'].includes(
    status,
  );

  const canSubmit = ['draft', 'rascunho'].includes(status);

  const canCancel = ![
    'cancelled',
    'canceled',
    'cancelada',
    'accepted',
    'approved',
    'completed',
    'concluida',
  ].includes(status);

  const canDelete = ['draft', 'rascunho'].includes(status);

  /*
  |--------------------------------------------------------------------------
  | ACTIONS
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async () => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      await api.patch(`/api/proposals/${id}/submit`);

      setSuccess('Proposta enviada para aprovação.');

      await loadProposal({
        silent: true,
      });
    } catch (err) {
      console.error('Erro ao enviar proposta:', err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Não foi possível enviar a proposta para aprovação.',
      );
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleCancel = async () => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      await api.patch(`/api/proposals/${id}/cancel`);

      setSuccess('Proposta cancelada com sucesso.');

      await loadProposal({
        silent: true,
      });
    } catch (err) {
      console.error('Erro ao cancelar proposta:', err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Não foi possível cancelar a proposta.',
      );
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleDelete = async () => {
    try {
      setActionLoading(true);
      setError('');
      setSuccess('');

      await api.delete(`/api/proposals/${id}`);

      setSuccess('Proposta excluída com sucesso.');

      setTimeout(() => {
        navigate('/proposals');
      }, 700);
    } catch (err) {
      console.error('Erro ao excluir proposta:', err);

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Não foi possível excluir a proposta.',
      );

      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const executeConfirmedAction = async () => {
    if (!confirmAction) return;

    if (confirmAction.type === 'submit') {
      await handleSubmit();
      return;
    }

    if (confirmAction.type === 'cancel') {
      await handleCancel();
      return;
    }

    if (confirmAction.type === 'delete') {
      await handleDelete();
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
          <Loader2 size={34} className="animate-spin text-blue-500" />

          <p>Carregando proposta...</p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ERROR
  |--------------------------------------------------------------------------
  */

  if (!proposal) {
    return (
      <div className="min-h-screen bg-slate-950 text-white p-6">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate('/proposals')}
            className="
              flex
              items-center
              gap-2
              text-slate-400
              hover:text-white
              transition
              mb-6
            "
          >
            <ArrowLeft size={18} />
            Voltar para propostas
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
            <div className="flex items-start gap-3 text-red-300">
              <AlertCircle size={22} className="shrink-0 mt-0.5" />

              <div>
                <h2 className="font-semibold text-white">
                  Não foi possível carregar a proposta
                </h2>

                <p className="text-sm text-slate-400 mt-1">
                  {error || 'Proposta não encontrada.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => loadProposal()}
              className="
                mt-6
                flex
                items-center
                gap-2
                px-4
                py-2.5
                rounded-xl
                bg-blue-600
                hover:bg-blue-500
                transition
                text-sm
                font-medium
              "
            >
              <RefreshCw size={16} />
              Tentar novamente
            </button>
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

        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
          <div>
            <button
              onClick={() => navigate('/proposals')}
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
              Voltar para propostas
            </button>

            <div className="flex items-start gap-4">
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
                  shrink-0
                "
              >
                <FileText size={24} className="text-blue-400" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-bold">Proposta</h1>

                  <StatusBadge status={status} config={statusConfig} />
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Hash size={14} />
                    {getId(proposal)}
                  </span>

                  {proposal.createdAt && (
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={14} />
                      Criada em {formatDate(proposal.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ACTIONS */}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                loadProposal({
                  silent: true,
                })
              }
              disabled={refreshing || actionLoading}
              className="
                flex
                items-center
                justify-center
                gap-2
                px-3
                py-2.5
                rounded-xl
                border
                border-slate-700
                bg-slate-900
                hover:bg-slate-800
                text-slate-300
                transition
                disabled:opacity-50
              "
              title="Atualizar"
            >
              <RefreshCw
                size={17}
                className={refreshing ? 'animate-spin' : ''}
              />

              <span className="hidden sm:inline">Atualizar</span>
            </button>

            {canEdit && (
              <button
                type="button"
                onClick={() => navigate(`/proposals/${id}/edit`)}
                disabled={actionLoading}
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
                <Pencil size={17} />
                Editar
              </button>
            )}

            {canSubmit && (
              <button
                type="button"
                onClick={() =>
                  setConfirmAction({
                    type: 'submit',
                    title: 'Enviar proposta',
                    message:
                      'Deseja realmente enviar esta proposta para aprovação?',
                    confirmLabel: 'Enviar proposta',
                  })
                }
                disabled={actionLoading}
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  px-4
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
                <Send size={17} />
                Enviar para aprovação
              </button>
            )}
          </div>
        </div>

        {/* ==========================================================
            ALERTS
        ========================================================== */}

        {error && (
          <Alert type="error" message={error} onClose={() => setError('')} />
        )}

        {success && (
          <Alert
            type="success"
            message={success}
            onClose={() => setSuccess('')}
          />
        )}

        {/* ==========================================================
            STATUS BANNER
        ========================================================== */}

        <div
          className={`
            rounded-2xl
            border
            p-5
            ${statusConfig.container}
          `}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{statusConfig.icon}</div>

              <div>
                <p className="text-xs uppercase tracking-wide opacity-70">
                  Status da proposta
                </p>

                <p
                  className={`
                    text-lg
                    font-semibold
                    mt-1
                    ${statusConfig.text}
                  `}
                >
                  {statusConfig.label}
                </p>

                <p className="text-sm text-slate-400 mt-1">
                  {statusConfig.description}
                </p>
              </div>
            </div>

            <div className="text-left md:text-right">
              <p className="text-xs text-slate-500">Valor da proposta</p>

              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {formatCurrency(proposalPrice)}
              </p>
            </div>
          </div>
        </div>

        {/* ==========================================================
            CLIENT + PROPERTY
        ========================================================== */}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* ========================================================
              CLIENT
          ======================================================== */}

          <Card title="Cliente / Lead" icon={<User size={18} />}>
            <div className="space-y-5">
              <div>
                <p className="text-xs text-slate-500 mb-1">Nome</p>

                <p className="text-lg font-semibold text-white">
                  {getName(lead, 'Cliente não informado')}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Info
                  label="E-mail"
                  value={lead?.email}
                  icon={<Mail size={15} />}
                />

                <Info
                  label="Telefone"
                  value={lead?.phone}
                  icon={<Phone size={15} />}
                />

                <Info
                  label="Responsável"
                  value={getName(
                    lead?.assignedTo || proposal?.assignedTo,
                    'Não atribuído',
                  )}
                />

                <Info
                  label="Origem"
                  value={lead?.source || lead?.origin || '-'}
                />
              </div>

              {getId(lead) && (
                <button
                  type="button"
                  onClick={() => navigate(`/lead-detail/${getId(lead)}`)}
                  className="
                    inline-flex
                    items-center
                    gap-2
                    text-sm
                    text-blue-400
                    hover:text-blue-300
                    transition
                  "
                >
                  Ver detalhes do lead
                  <ChevronRight size={15} />
                </button>
              )}
            </div>
          </Card>

          {/* ========================================================
              PROPERTY
          ======================================================== */}

          <Card title="Imóvel" icon={<Building2 size={18} />}>
            {propertyLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                <Loader2 size={28} className="animate-spin text-blue-400" />

                <p className="text-sm">Carregando informações do imóvel...</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* PROPERTY IMAGE */}

                {propertyMainImage && (
                  <div
                    className="
                      relative
                      aspect-[16/9]
                      rounded-2xl
                      overflow-hidden
                      border
                      border-slate-800
                      bg-slate-950
                    "
                  >
                    <img
                      src={propertyMainImage}
                      alt={propertyData.title}
                      className="
                        w-full
                        h-full
                        object-cover
                      "
                      loading="lazy"
                    />

                    <div
                      className="
                        absolute
                        inset-x-0
                        bottom-0
                        p-4
                        bg-gradient-to-t
                        from-black/80
                        via-black/30
                        to-transparent
                      "
                    >
                      <p className="text-white font-semibold">
                        {propertyData.title}
                      </p>

                      {propertyData.code && (
                        <p className="text-xs text-slate-300 mt-1">
                          Código: {propertyData.code}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* PROPERTY HEADER */}

                <div className="flex items-start gap-4">
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
                      shrink-0
                    "
                  >
                    <Building2 size={22} className="text-blue-400" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 mb-1">
                      Imóvel relacionado
                    </p>

                    <p className="text-lg font-semibold text-white break-words">
                      {propertyData.title}
                    </p>

                    {propertyData.code && (
                      <p className="text-sm text-slate-400 mt-1">
                        Código:{' '}
                        <span className="text-slate-300">
                          {propertyData.code}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* PROPERTY PRICE */}

                <div
                  className="
                    rounded-xl
                    border
                    border-emerald-500/20
                    bg-emerald-500/5
                    p-4
                  "
                >
                  <p className="text-xs text-slate-500">
                    Valor atual do imóvel
                  </p>

                  <p className="text-2xl font-bold text-emerald-400 mt-1">
                    {formatCurrency(propertyData.price || propertyPrice)}
                  </p>
                </div>

                {/* PROPERTY DETAILS */}

                <div className="grid sm:grid-cols-2 gap-4">
                  <Info
                    label="Tipo"
                    value={propertyData.type}
                    icon={<Home size={15} />}
                  />

                  <Info label="Finalidade" value={propertyData.purpose} />

                  <Info label="Status" value={propertyData.status} />

                  <Info
                    label="Código"
                    value={propertyData.code || '-'}
                    icon={<Hash size={15} />}
                  />
                </div>

                {/* PROPERTY CHARACTERISTICS */}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <PropertyMetric
                    icon={<Ruler size={16} />}
                    label="Área"
                    value={
                      propertyData.area > 0
                        ? `${formatNumber(propertyData.area)} m²`
                        : '-'
                    }
                  />

                  <PropertyMetric
                    icon={<BedDouble size={16} />}
                    label="Quartos"
                    value={
                      propertyData.bedrooms > 0
                        ? formatNumber(propertyData.bedrooms)
                        : '-'
                    }
                  />

                  <PropertyMetric
                    icon={<Bath size={16} />}
                    label="Banheiros"
                    value={
                      propertyData.bathrooms > 0
                        ? formatNumber(propertyData.bathrooms)
                        : '-'
                    }
                  />

                  <PropertyMetric
                    icon={<Car size={16} />}
                    label="Vagas"
                    value={
                      propertyData.parkingSpaces > 0
                        ? formatNumber(propertyData.parkingSpaces)
                        : '-'
                    }
                  />
                </div>

                {/* SUITES */}

                {propertyData.suites > 0 && (
                  <Info
                    label="Suítes"
                    value={formatNumber(propertyData.suites)}
                  />
                )}

                {/* LOCATION */}

                <div
                  className="
                    rounded-xl
                    border
                    border-slate-800
                    bg-slate-950
                    p-4
                  "
                >
                  <p className="text-xs text-slate-500 mb-2 flex items-center gap-1.5">
                    <MapPin size={14} />
                    Localização
                  </p>

                  <p className="text-sm text-slate-200 leading-6">
                    {propertyData.location}
                  </p>
                </div>

                {/* ADDRESS DETAILS */}

                {(propertyData.neighborhood ||
                  propertyData.city ||
                  propertyData.state ||
                  propertyData.zipCode) && (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Info label="Bairro" value={propertyData.neighborhood} />

                    <Info label="Cidade" value={propertyData.city} />

                    <Info label="Estado" value={propertyData.state} />

                    <Info label="CEP" value={propertyData.zipCode} />
                  </div>
                )}

                {/* DESCRIPTION */}

                {propertyData.description && (
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Descrição</p>

                    <div
                      className="
                        rounded-xl
                        border
                        border-slate-800
                        bg-slate-950
                        p-4
                      "
                    >
                      <p className="text-sm text-slate-300 leading-7 whitespace-pre-wrap">
                        {propertyData.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* IMAGE GALLERY */}

                {propertyData.images.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <ImageIcon size={16} className="text-blue-400" />

                      <p className="text-xs text-slate-500">
                        Imagens do imóvel
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {propertyData.images.slice(0, 6).map((image, index) => {
                        const imageUrl = getImageUrl(image);

                        if (!imageUrl) {
                          return null;
                        }

                        return (
                          <div
                            key={`${imageUrl}-${index}`}
                            className="
                                  aspect-[4/3]
                                  rounded-xl
                                  overflow-hidden
                                  border
                                  border-slate-800
                                  bg-slate-950
                                "
                          >
                            <img
                              src={imageUrl}
                              alt={`Imóvel - imagem ${index + 1}`}
                              className="
                                    w-full
                                    h-full
                                    object-cover
                                    hover:scale-105
                                    transition
                                    duration-300
                                  "
                              loading="lazy"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* PROPERTY DETAILS BUTTON */}

                {propertyData.id ? (
                  <button
                    type="button"
                    onClick={() => navigate(`/properties/${propertyData.id}`)}
                    className="
                      inline-flex
                      items-center
                      gap-2
                      text-sm
                      text-blue-400
                      hover:text-blue-300
                      transition
                    "
                  >
                    Ver detalhes completos do imóvel
                    <ChevronRight size={15} />
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <AlertCircle size={15} />
                    Imóvel não possui identificação disponível.
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* ==========================================================
            FINANCIAL
        ========================================================== */}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card title="Valores da proposta" icon={<DollarSign size={18} />}>
              <div className="grid sm:grid-cols-2 gap-5">
                <FinancialBox
                  label="Valor do imóvel"
                  value={formatCurrency(propertyPrice)}
                />

                <FinancialBox
                  label="Valor da proposta"
                  value={formatCurrency(proposalPrice)}
                  highlight
                />

                <FinancialBox
                  label="Entrada"
                  value={formatCurrency(downPayment)}
                />

                <FinancialBox
                  label="Financiamento"
                  value={formatCurrency(financing)}
                />

                <FinancialBox label="FGTS" value={formatCurrency(fgts)} />

                <FinancialBox
                  label="Saldo restante"
                  value={formatCurrency(balance)}
                />
              </div>

              {discount > 0 && (
                <div
                  className="
                    mt-6
                    rounded-xl
                    border
                    border-amber-500/20
                    bg-amber-500/10
                    p-4
                  "
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-amber-400 uppercase tracking-wide">
                        Desconto solicitado
                      </p>

                      <p className="text-lg font-semibold text-amber-300 mt-1">
                        {formatCurrency(discount)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-500">Percentual</p>

                      <p className="text-sm font-semibold text-amber-300 mt-1">
                        {discountPercentage.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <Card title="Resumo financeiro" icon={<Calculator size={18} />}>
            <div className="space-y-4">
              <SummaryRow
                label="Valor do imóvel"
                value={formatCurrency(propertyPrice)}
              />

              <SummaryRow
                label="Proposta"
                value={formatCurrency(proposalPrice)}
                highlight
              />

              <SummaryRow label="Entrada" value={formatCurrency(downPayment)} />

              <SummaryRow
                label="Financiamento"
                value={formatCurrency(financing)}
              />

              <SummaryRow label="FGTS" value={formatCurrency(fgts)} />

              <div className="border-t border-slate-800 pt-4">
                <SummaryRow
                  label="Total informado"
                  value={formatCurrency(totalPayment)}
                />
              </div>

              <div className="border-t border-slate-800 pt-4">
                <SummaryRow
                  label="Saldo restante"
                  value={formatCurrency(balance)}
                  highlight
                />
              </div>
            </div>
          </Card>
        </div>

        {/* ==========================================================
            PAYMENT CONDITIONS
        ========================================================== */}

        <Card title="Condições de pagamento" icon={<CreditCard size={18} />}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Info
              label="Forma de pagamento"
              value={formatPaymentMethod(proposal?.paymentMethod)}
            />

            <Info
              label="Parcelas"
              value={installments > 0 ? `${installments}x` : '-'}
            />

            <Info
              label="Valor da parcela"
              value={
                installmentValue > 0 ? formatCurrency(installmentValue) : '-'
              }
            />

            <Info
              label="Validade"
              value={
                proposal?.validityDays ? `${proposal.validityDays} dias` : '-'
              }
            />
          </div>
        </Card>

        {/* ==========================================================
            MESSAGE
        ========================================================== */}

        {proposal?.clientMessage && (
          <Card title="Mensagem para o cliente" icon={<FileText size={18} />}>
            <div
              className="
                rounded-xl
                border
                border-slate-800
                bg-slate-950
                p-5
              "
            >
              <p className="text-sm leading-7 text-slate-300 whitespace-pre-wrap">
                {proposal.clientMessage}
              </p>
            </div>
          </Card>
        )}

        {/* ==========================================================
            DATES
        ========================================================== */}

        <Card title="Informações da proposta" icon={<CalendarDays size={18} />}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <Info label="Criada em" value={formatDate(proposal.createdAt)} />

            <Info
              label="Atualizada em"
              value={formatDate(proposal.updatedAt)}
            />

            <Info
              label="Validade"
              value={
                proposal.validityDays ? `${proposal.validityDays} dias` : '-'
              }
            />

            <Info
              label="Válida até"
              value={getExpirationDate(
                proposal.createdAt,
                proposal.validityDays,
              )}
            />
          </div>
        </Card>

        {/* ==========================================================
            AUDIT / USER
        ========================================================== */}

        {(proposal.createdBy || proposal.broker || proposal.user) && (
          <Card title="Responsável pela proposta" icon={<User size={18} />}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <Info
                label="Criada por"
                value={getName(
                  proposal.createdBy || proposal.broker || proposal.user,
                  '-',
                )}
              />

              <Info
                label="E-mail"
                value={
                  (proposal.createdBy || proposal.broker || proposal.user)
                    ?.email
                }
              />

              <Info
                label="Telefone"
                value={
                  (proposal.createdBy || proposal.broker || proposal.user)
                    ?.phone
                }
              />

              <Info
                label="Cargo"
                value={
                  (proposal.createdBy || proposal.broker || proposal.user)
                    ?.position
                }
              />
            </div>
          </Card>
        )}

        {/* ==========================================================
            FOOTER ACTIONS
        ========================================================== */}

        <div
          className="
            border-t
            border-slate-800
            pt-6
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-4
          "
        >
          <button
            type="button"
            onClick={() => navigate('/proposals')}
            disabled={actionLoading}
            className="
              flex
              items-center
              gap-2
              text-slate-400
              hover:text-white
              transition
            "
          >
            <ArrowLeft size={18} />
            Voltar para propostas
          </button>

          <div className="flex flex-wrap gap-3">
            {canDelete && (
              <button
                type="button"
                onClick={() =>
                  setConfirmAction({
                    type: 'delete',
                    title: 'Excluir proposta',
                    message:
                      'Tem certeza que deseja excluir esta proposta? Esta ação não poderá ser desfeita.',
                    confirmLabel: 'Excluir proposta',
                    danger: true,
                  })
                }
                disabled={actionLoading}
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  px-4
                  py-2.5
                  rounded-xl
                  border
                  border-red-500/20
                  bg-red-500/5
                  text-red-400
                  hover:bg-red-500/10
                  transition
                  disabled:opacity-50
                "
              >
                <Trash2 size={17} />
                Excluir
              </button>
            )}

            {canCancel && (
              <button
                type="button"
                onClick={() =>
                  setConfirmAction({
                    type: 'cancel',
                    title: 'Cancelar proposta',
                    message: 'Deseja realmente cancelar esta proposta?',
                    confirmLabel: 'Cancelar proposta',
                    danger: true,
                  })
                }
                disabled={actionLoading}
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
                  text-slate-300
                  transition
                  disabled:opacity-50
                "
              >
                <XCircle size={17} />
                Cancelar
              </button>
            )}

            {canEdit && (
              <button
                type="button"
                onClick={() => navigate(`/proposals/${id}/edit`)}
                disabled={actionLoading}
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  px-5
                  py-2.5
                  rounded-xl
                  border
                  border-slate-700
                  bg-slate-900
                  hover:bg-slate-800
                  text-white
                  transition
                  disabled:opacity-50
                "
              >
                <Pencil size={17} />
                Editar proposta
              </button>
            )}

            {canSubmit && (
              <button
                type="button"
                onClick={() =>
                  setConfirmAction({
                    type: 'submit',
                    title: 'Enviar proposta',
                    message: 'Deseja enviar esta proposta para aprovação?',
                    confirmLabel: 'Enviar para aprovação',
                  })
                }
                disabled={actionLoading}
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
                <Send size={17} />
                Enviar para aprovação
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================
          CONFIRM MODAL
      ============================================================ */}

      {confirmAction && (
        <ConfirmModal
          action={confirmAction}
          loading={actionLoading}
          onCancel={() => {
            if (!actionLoading) {
              setConfirmAction(null);
            }
          }}
          onConfirm={executeConfirmedAction}
        />
      )}
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

function Info({ label, value, icon }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-slate-500 mb-1 flex items-center gap-1.5">
        {icon}
        {label}
      </p>

      <p className="text-sm text-slate-200 font-medium break-words">
        {value || '-'}
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| PROPERTY METRIC
|--------------------------------------------------------------------------
*/

function PropertyMetric({ icon, label, value }) {
  return (
    <div
      className="
        rounded-xl
        border
        border-slate-800
        bg-slate-950
        p-3
      "
    >
      <div className="flex items-center gap-2 text-slate-500">
        {icon}

        <span className="text-[11px]">{label}</span>
      </div>

      <p className="text-sm font-semibold text-slate-200 mt-1">{value}</p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| FINANCIAL BOX
|--------------------------------------------------------------------------
*/

function FinancialBox({ label, value, highlight = false }) {
  return (
    <div
      className={`
        rounded-xl
        border
        p-4
        ${
          highlight
            ? 'border-emerald-500/20 bg-emerald-500/5'
            : 'border-slate-800 bg-slate-950'
        }
      `}
    >
      <p className="text-xs text-slate-500">{label}</p>

      <p
        className={`
          text-lg
          font-semibold
          mt-1
          ${highlight ? 'text-emerald-400' : 'text-slate-100'}
        `}
      >
        {value}
      </p>
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

function StatusBadge({ status, config }) {
  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        px-3
        py-1.5
        rounded-full
        text-xs
        font-semibold
        border
        ${config.badge}
      `}
    >
      {config.iconSmall}
      {config.label}
    </span>
  );
}

/*
|--------------------------------------------------------------------------
| ALERT
|--------------------------------------------------------------------------
*/

function Alert({ type, message, onClose }) {
  const isError = type === 'error';

  return (
    <div
      className={`
        flex
        items-start
        justify-between
        gap-4
        rounded-xl
        border
        p-4
        ${
          isError
            ? 'bg-red-500/10 border-red-500/20 text-red-300'
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
        }
      `}
    >
      <div className="flex items-start gap-3">
        {isError ? (
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
        )}

        <p className="text-sm">{message}</p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="opacity-60 hover:opacity-100 transition"
      >
        <XCircle size={17} />
      </button>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| CONFIRM MODAL
|--------------------------------------------------------------------------
*/

function ConfirmModal({ action, loading, onCancel, onConfirm }) {
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
    >
      <div
        className="
          w-full
          max-w-md
          bg-slate-900
          border
          border-slate-800
          rounded-2xl
          shadow-2xl
          p-6
        "
      >
        <div className="flex items-start gap-4">
          <div
            className={`
              w-11
              h-11
              rounded-xl
              flex
              items-center
              justify-center
              shrink-0
              ${
                action.danger
                  ? 'bg-red-500/10 text-red-400'
                  : 'bg-blue-500/10 text-blue-400'
              }
            `}
          >
            {action.danger ? <AlertCircle size={22} /> : <Send size={21} />}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white">{action.title}</h3>

            <p className="text-sm text-slate-400 mt-2 leading-6">
              {action.message}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-7">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="
              px-4
              py-2.5
              rounded-xl
              border
              border-slate-700
              bg-slate-950
              text-slate-300
              hover:bg-slate-800
              transition
              disabled:opacity-50
            "
          >
            Voltar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`
              flex
              items-center
              gap-2
              px-4
              py-2.5
              rounded-xl
              text-white
              font-medium
              transition
              disabled:opacity-50
              ${
                action.danger
                  ? 'bg-red-600 hover:bg-red-500'
                  : 'bg-blue-600 hover:bg-blue-500'
              }
            `}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}

            {action.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| STATUS CONFIG
|--------------------------------------------------------------------------
*/

function getStatusConfig(status) {
  const configs = {
    draft: {
      label: 'Rascunho',
      description: 'A proposta ainda está sendo preparada e pode ser editada.',
      text: 'text-slate-200',
      badge: 'bg-slate-500/10 border-slate-500/20 text-slate-300',
      container: 'bg-slate-500/5 border-slate-500/20',
      icon: <FileText size={22} />,
      iconSmall: <FileText size={13} />,
    },

    rascunho: {
      label: 'Rascunho',
      description: 'A proposta ainda está sendo preparada e pode ser editada.',
      text: 'text-slate-200',
      badge: 'bg-slate-500/10 border-slate-500/20 text-slate-300',
      container: 'bg-slate-500/5 border-slate-500/20',
      icon: <FileText size={22} />,
      iconSmall: <FileText size={13} />,
    },

    submitted: {
      label: 'Enviada',
      description: 'A proposta foi enviada e aguarda análise.',
      text: 'text-blue-300',
      badge: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
      container: 'bg-blue-500/5 border-blue-500/20',
      icon: <Send size={22} />,
      iconSmall: <Send size={13} />,
    },

    enviada: {
      label: 'Enviada',
      description: 'A proposta foi enviada e aguarda análise.',
      text: 'text-blue-300',
      badge: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
      container: 'bg-blue-500/5 border-blue-500/20',
      icon: <Send size={22} />,
      iconSmall: <Send size={13} />,
    },

    pending: {
      label: 'Pendente',
      description: 'A proposta aguarda análise ou aprovação.',
      text: 'text-blue-300',
      badge: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
      container: 'bg-blue-500/5 border-blue-500/20',
      icon: <Clock3 size={22} />,
      iconSmall: <Clock3 size={13} />,
    },

    under_review: {
      label: 'Em análise',
      description: 'A proposta está sendo analisada.',
      text: 'text-amber-300',
      badge: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
      container: 'bg-amber-500/5 border-amber-500/20',
      icon: <Clock3 size={22} />,
      iconSmall: <Clock3 size={13} />,
    },

    em_analise: {
      label: 'Em análise',
      description: 'A proposta está sendo analisada.',
      text: 'text-amber-300',
      badge: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
      container: 'bg-amber-500/5 border-amber-500/20',
      icon: <Clock3 size={22} />,
      iconSmall: <Clock3 size={13} />,
    },

    approved: {
      label: 'Aprovada',
      description: 'A proposta foi aprovada.',
      text: 'text-emerald-300',
      badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
      container: 'bg-emerald-500/5 border-emerald-500/20',
      icon: <CheckCircle2 size={22} />,
      iconSmall: <CheckCircle2 size={13} />,
    },

    aprovada: {
      label: 'Aprovada',
      description: 'A proposta foi aprovada.',
      text: 'text-emerald-300',
      badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
      container: 'bg-emerald-500/5 border-emerald-500/20',
      icon: <CheckCircle2 size={22} />,
      iconSmall: <CheckCircle2 size={13} />,
    },

    accepted: {
      label: 'Aceita',
      description: 'O cliente aceitou a proposta.',
      text: 'text-emerald-300',
      badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
      container: 'bg-emerald-500/5 border-emerald-500/20',
      icon: <CheckCircle2 size={22} />,
      iconSmall: <CheckCircle2 size={13} />,
    },

    rejected: {
      label: 'Recusada',
      description: 'A proposta foi recusada.',
      text: 'text-red-300',
      badge: 'bg-red-500/10 border-red-500/20 text-red-300',
      container: 'bg-red-500/5 border-red-500/20',
      icon: <XCircle size={22} />,
      iconSmall: <XCircle size={13} />,
    },

    recusada: {
      label: 'Recusada',
      description: 'A proposta foi recusada.',
      text: 'text-red-300',
      badge: 'bg-red-500/10 border-red-500/20 text-red-300',
      container: 'bg-red-500/5 border-red-500/20',
      icon: <XCircle size={22} />,
      iconSmall: <XCircle size={13} />,
    },

    cancelled: {
      label: 'Cancelada',
      description: 'A proposta foi cancelada.',
      text: 'text-red-300',
      badge: 'bg-red-500/10 border-red-500/20 text-red-300',
      container: 'bg-red-500/5 border-red-500/20',
      icon: <XCircle size={22} />,
      iconSmall: <XCircle size={13} />,
    },

    canceled: {
      label: 'Cancelada',
      description: 'A proposta foi cancelada.',
      text: 'text-red-300',
      badge: 'bg-red-500/10 border-red-500/20 text-red-300',
      container: 'bg-red-500/5 border-red-500/20',
      icon: <XCircle size={22} />,
      iconSmall: <XCircle size={13} />,
    },

    cancelada: {
      label: 'Cancelada',
      description: 'A proposta foi cancelada.',
      text: 'text-red-300',
      badge: 'bg-red-500/10 border-red-500/20 text-red-300',
      container: 'bg-red-500/5 border-red-500/20',
      icon: <XCircle size={22} />,
      iconSmall: <XCircle size={13} />,
    },

    completed: {
      label: 'Concluída',
      description: 'A negociação relacionada à proposta foi concluída.',
      text: 'text-emerald-300',
      badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
      container: 'bg-emerald-500/5 border-emerald-500/20',
      icon: <CheckCircle2 size={22} />,
      iconSmall: <CheckCircle2 size={13} />,
    },

    concluida: {
      label: 'Concluída',
      description: 'A negociação relacionada à proposta foi concluída.',
      text: 'text-emerald-300',
      badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300',
      container: 'bg-emerald-500/5 border-emerald-500/20',
      icon: <CheckCircle2 size={22} />,
      iconSmall: <CheckCircle2 size={13} />,
    },
  };

  return (
    configs[status] || {
      label: status || 'Desconhecido',
      description: 'Status atual da proposta.',
      text: 'text-slate-300',
      badge: 'bg-slate-500/10 border-slate-500/20 text-slate-300',
      container: 'bg-slate-500/5 border-slate-500/20',
      icon: <Clock3 size={22} />,
      iconSmall: <Clock3 size={13} />,
    }
  );
}

/*
|--------------------------------------------------------------------------
| PAYMENT METHOD
|--------------------------------------------------------------------------
*/

function formatPaymentMethod(value) {
  const methods = {
    financing: 'Financiamento',
    cash: 'À vista',
    fgts: 'FGTS',
    mixed: 'Misto',
    financiamento: 'Financiamento',
    vista: 'À vista',
    misto: 'Misto',
  };

  return methods[value] || value || '-';
}

/*
|--------------------------------------------------------------------------
| PROPERTY LOCATION
|--------------------------------------------------------------------------
*/

function getPropertyLocation(property) {
  if (!property) {
    return '-';
  }

  const address =
    property.address || property.location?.address || property.endereco;

  if (typeof address === 'string') {
    return address;
  }

  if (address && typeof address === 'object') {
    const parts = [
      address.street || address.logradouro || address.rua || address.address,

      address.number || address.numero,

      address.complement,

      address.neighborhood || address.bairro,

      address.city || address.cidade,

      address.state || address.estado || address.uf,

      address.zipCode || address.cep,
    ].filter(Boolean);

    if (parts.length) {
      return parts.join(', ');
    }
  }

  const location = property.location;

  if (location && typeof location === 'object') {
    const parts = [
      location.neighborhood || location.bairro,

      location.city || location.cidade,

      location.state || location.estado || location.uf,
    ].filter(Boolean);

    if (parts.length) {
      return parts.join(', ');
    }
  }

  return (
    property.neighborhood ||
    property.bairro ||
    property.city ||
    property.cidade ||
    property.location ||
    '-'
  );
}

/*
|--------------------------------------------------------------------------
| EXPIRATION DATE
|--------------------------------------------------------------------------
*/

function getExpirationDate(createdAt, validityDays) {
  if (!createdAt || !validityDays) {
    return '-';
  }

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  date.setDate(date.getDate() + Number(validityDays));

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

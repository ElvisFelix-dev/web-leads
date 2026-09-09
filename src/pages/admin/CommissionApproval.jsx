import { useMemo, useState } from 'react';

import {
  FaCheck,
  FaTimes,
  FaMoneyBillWave,
  FaUser,
  FaUserPlus,
  FaBuilding,
  FaClock,
  FaHourglassHalf,
  FaCalendarAlt,
  FaHome,
  FaReceipt,
  FaSearch,
  FaSyncAlt,
  FaChevronRight,
  FaMapMarkerAlt,
  FaPercentage,
  FaWallet,
  FaChartLine,
  FaExclamationTriangle,
} from 'react-icons/fa';

import { toast } from 'react-toastify';
import { useCommissions } from '../../hooks/useCommissions';
import { commissionService } from '../../service/commissionService';
import CommissionStatusBadge from '../../components/admin/CommissionStatusBadge';

// =============================================================
// MODAIS - COMPONENTES REUTILIZÁVEIS
// =============================================================

function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#11151f] border border-gray-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
            <FaExclamationTriangle className="text-yellow-400" />
          </div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>

        <p className="text-sm text-gray-400 leading-relaxed">{message}</p>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm font-semibold text-gray-300 hover:text-white transition-all disabled:opacity-40"
          >
            {cancelLabel}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all disabled:opacity-40 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Processando...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function PromptModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  inputLabel,
  inputPlaceholder,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  loading = false,
}) {
  const [value, setValue] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (value.trim()) {
      onConfirm(value.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#11151f] border border-gray-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <FaMoneyBillWave className="text-blue-400" />
          </div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>

        <p className="text-sm text-gray-400 leading-relaxed mb-4">{message}</p>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            {inputLabel}
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={inputPlaceholder}
            className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500 transition-all"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && value.trim()) {
                handleConfirm();
              }
              if (e.key === 'Escape') {
                onClose();
              }
            }}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm font-semibold text-gray-300 hover:text-white transition-all disabled:opacity-40"
          >
            {cancelLabel}
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading || !value.trim()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Processando...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'success',
  buttonLabel = 'OK',
}) {
  if (!isOpen) return null;

  const icons = {
    success: {
      icon: FaCheck,
      className: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    },
    error: {
      icon: FaExclamationTriangle,
      className: 'bg-red-500/10 border-red-500/20 text-red-400',
    },
    warning: {
      icon: FaExclamationTriangle,
      className: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    },
  };

  const Icon = icons[type]?.icon || icons.success.icon;
  const iconClass = icons[type]?.className || icons.success.className;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-[#11151f] border border-gray-800 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center ${iconClass}`}
          >
            <Icon className="text-lg" />
          </div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
        </div>

        <p className="text-sm text-gray-400 leading-relaxed">{message}</p>

        <button
          onClick={onClose}
          className="w-full mt-6 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm font-semibold text-gray-300 hover:text-white transition-all"
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}

// =============================================================
// COMPONENTE PRINCIPAL
// =============================================================

export default function CommissionApproval() {
  const [filters, setFilters] = useState({ status: 'pending' });
  const [updating, setUpdating] = useState(false);
  const [search, setSearch] = useState('');

  // 🔥 ESTADOS DOS MODAIS
  const [modalState, setModalState] = useState({
    confirm: { isOpen: false, data: null, action: null },
    prompt: { isOpen: false, data: null, action: null },
    alert: { isOpen: false, type: 'success', title: '', message: '' },
  });

  // =========================================================
  // COMISSÕES
  // =========================================================

  const { commissions, loading, error, refetch } = useCommissions(filters);
  const {
    commissions: allCommissions,
    loading: loadingAllCommissions,
    refetch: refetchAll,
  } = useCommissions({});

  // =========================================================
  // HELPERS
  // =========================================================

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Number(value) || 0);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatPercentage = (value) => {
    return `${Number(value) || 0}%`;
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  };

  const getImageUrl = (image) => {
    if (!image) return null;
    if (typeof image === 'string') return image;
    return (
      image.url ||
      image.secure_url ||
      image.path ||
      image.src ||
      image.location ||
      null
    );
  };

  // =========================================================
  // PROPERTY HELPERS
  // =========================================================

  const getPropertyImage = (property) => {
    if (!property) return null;
    const candidates = [
      property.coverImage,
      property.mainImage,
      property.thumbnail,
      property.image,
      property.photo,
      property.images?.[0],
      property.photos?.[0],
      property.gallery?.[0],
    ];
    for (const candidate of candidates) {
      const url = getImageUrl(candidate);
      if (url) return url;
    }
    return null;
  };

  const getPropertyName = (property) => {
    if (!property) return 'Imóvel não informado';
    return (
      property.name ||
      property.title ||
      property.propertyName ||
      property.description ||
      property.code ||
      property.formattedCode ||
      'Imóvel não informado'
    );
  };

  const getPropertyAddress = (property) => {
    if (!property) return null;
    if (property.fullAddress) return property.fullAddress;
    const location = property.location;
    if (!location) return null;
    const parts = [
      location.street,
      location.number,
      location.complement,
      location.district,
      location.city,
      location.state,
    ].filter(Boolean);
    if (!parts.length) return null;
    return parts.join(', ');
  };

  const getPropertyCode = (property) => {
    if (!property) return null;
    return (
      property.formattedCode ||
      property.code ||
      property.reference ||
      property.propertyCode ||
      null
    );
  };

  const getPropertyPrice = (property) => {
    if (!property) return 0;
    return (
      property.prices?.salePrice || property.salePrice || property.price || 0
    );
  };

  const getBrokerAvatar = (broker) => {
    if (!broker) return null;
    return getImageUrl(
      broker.avatar ||
        broker.photo ||
        broker.profileImage ||
        broker.profilePhoto ||
        broker.image,
    );
  };

  const getCommissionProperty = (commission) => {
    if (!commission) return null;
    return commission.property || commission.sale?.property || null;
  };

  // =========================================================
  // MÉTRICAS
  // =========================================================

  const metrics = useMemo(() => {
    const list =
      Array.isArray(allCommissions) && allCommissions.length
        ? allCommissions
        : [];
    const totalAmount = list.reduce(
      (sum, c) => sum + Number(c.totalAmount || 0),
      0,
    );
    const saleAmount = list.reduce(
      (sum, c) => sum + Number(c.sale?.saleAmount || c.saleAmount || 0),
      0,
    );
    const pending = list.filter((c) => c.status === 'pending').length;
    const approved = list.filter((c) => c.status === 'approved').length;
    const paid = list.filter((c) => c.status === 'paid').length;
    const cancelled = list.filter((c) => c.status === 'cancelled').length;
    return {
      total: list.length,
      totalAmount,
      saleAmount,
      pending,
      approved,
      paid,
      cancelled,
    };
  }, [allCommissions]);

  // =========================================================
  // BUSCA
  // =========================================================

  const filteredCommissions = useMemo(() => {
    const list = Array.isArray(commissions) ? commissions : [];
    if (!search.trim()) return list;
    const term = search.toLowerCase().trim();
    return list.filter((commission) => {
      const property = getCommissionProperty(commission) || {};
      const searchable = [
        commission.sale?.saleNumber,
        commission.lead?.name,
        commission.lead?.email,
        commission.lead?.phone,
        commission.sellerBroker?.name,
        commission.sellerBroker?.email,
        commission.capturerBroker?.name,
        commission.capturerBroker?.email,
        property.name,
        property.title,
        property.propertyName,
        property.code,
        property.formattedCode,
        property.fullAddress,
        property.location?.street,
        property.location?.district,
        property.location?.city,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return searchable.includes(term);
    });
  }, [commissions, search]);

  // =========================================================
  // FUNÇÕES DOS MODAIS
  // =========================================================

  const showConfirm = (title, message, action, data = null) => {
    setModalState({
      ...modalState,
      confirm: { isOpen: true, data, action },
    });
  };

  const showPrompt = (
    title,
    message,
    inputLabel,
    inputPlaceholder,
    action,
    data = null,
  ) => {
    setModalState({
      ...modalState,
      prompt: { isOpen: true, data, action, inputLabel, inputPlaceholder },
    });
  };

  const showAlert = (title, message, type = 'success') => {
    setModalState({
      ...modalState,
      alert: { isOpen: true, title, message, type },
    });
  };

  const closeModals = () => {
    setModalState({
      confirm: { isOpen: false, data: null, action: null },
      prompt: { isOpen: false, data: null, action: null },
      alert: { isOpen: false, type: 'success', title: '', message: '' },
    });
  };

  // =========================================================
  // AÇÕES
  // =========================================================

  const handleRefresh = async () => {
    try {
      await Promise.all([refetch(), refetchAll()]);
      toast.success('✅ Dados atualizados!');
    } catch (error) {
      console.error('Erro ao atualizar comissões:', error);
      toast.error('❌ Erro ao atualizar dados');
    }
  };

  const handleApprove = async (commissionId) => {
    showConfirm(
      'Aprovar Comissão',
      'Deseja realmente aprovar esta comissão? Esta ação não pode ser desfeita.',
      async () => {
        try {
          setUpdating(true);
          await commissionService.approve(commissionId);
          await Promise.all([refetch(), refetchAll()]);
          closeModals();
          showAlert('✅ Sucesso!', 'Comissão aprovada com sucesso!', 'success');
          toast.success('✅ Comissão aprovada!');
        } catch (error) {
          closeModals();
          showAlert(
            '❌ Erro',
            error.response?.data?.message || 'Erro ao aprovar comissão',
            'error',
          );
          toast.error('❌ Erro ao aprovar comissão');
        } finally {
          setUpdating(false);
        }
      },
      commissionId,
    );
  };

  const handlePay = async (commissionId) => {
    showPrompt(
      'Registrar Pagamento',
      'Informe o método de pagamento utilizado para esta comissão.',
      'Método de pagamento',
      'Ex: bank_transfer, pix, cash, check',
      async (method) => {
        try {
          setUpdating(true);
          await commissionService.pay(commissionId, { paymentMethod: method });
          await Promise.all([refetch(), refetchAll()]);
          closeModals();
          showAlert('✅ Sucesso!', 'Comissão marcada como paga!', 'success');
          toast.success('✅ Comissão paga!');
        } catch (error) {
          closeModals();
          showAlert(
            '❌ Erro',
            error.response?.data?.message || 'Erro ao pagar comissão',
            'error',
          );
          toast.error('❌ Erro ao pagar comissão');
        } finally {
          setUpdating(false);
        }
      },
      commissionId,
    );
  };

  const handleCancel = async (commissionId) => {
    showPrompt(
      'Cancelar Comissão',
      'Informe o motivo do cancelamento desta comissão.',
      'Motivo do cancelamento',
      'Ex: Venda cancelada, erro na comissão...',
      async (reason) => {
        try {
          setUpdating(true);
          await commissionService.cancel(commissionId, { reason });
          await Promise.all([refetch(), refetchAll()]);
          closeModals();
          showAlert(
            '✅ Sucesso!',
            'Comissão cancelada com sucesso!',
            'success',
          );
          toast.success('✅ Comissão cancelada!');
        } catch (error) {
          closeModals();
          showAlert(
            '❌ Erro',
            error.response?.data?.message || 'Erro ao cancelar comissão',
            'error',
          );
          toast.error('❌ Erro ao cancelar comissão');
        } finally {
          setUpdating(false);
        }
      },
      commissionId,
    );
  };

  // =========================================================
  // LOADING / ERROR
  // =========================================================

  if (loading || loadingAllCommissions) {
    return <CommissionApprovalSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#080b11] text-white p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
              <FaExclamationTriangle className="text-red-400" />
            </div>
            <h2 className="text-lg font-bold text-white">
              Não foi possível carregar as comissões
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              {error?.message || error || 'Ocorreu um erro inesperado.'}
            </p>
            <button
              onClick={handleRefresh}
              className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm font-semibold text-gray-300 hover:text-white transition-all"
            >
              <FaSyncAlt size={12} />
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-[#080b11] text-white">
      {/* BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/[0.035] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/[0.025] rounded-full blur-[120px]" />
      </div>

      {/* MODAIS */}
      <ConfirmModal
        isOpen={modalState.confirm.isOpen}
        onClose={closeModals}
        onConfirm={modalState.confirm.action}
        title="Confirmar Ação"
        message="Deseja realmente confirmar esta ação?"
        loading={updating}
      />

      <PromptModal
        isOpen={modalState.prompt.isOpen}
        onClose={closeModals}
        onConfirm={modalState.prompt.action}
        title={
          modalState.prompt.inputLabel ? 'Informar Dados' : 'Confirmar Ação'
        }
        message="Preencha as informações necessárias para continuar."
        inputLabel={modalState.prompt.inputLabel || 'Informação'}
        inputPlaceholder={
          modalState.prompt.inputPlaceholder || 'Digite aqui...'
        }
        loading={updating}
      />

      <AlertModal
        isOpen={modalState.alert.isOpen}
        onClose={closeModals}
        title={modalState.alert.title}
        message={modalState.alert.message}
        type={modalState.alert.type}
      />

      {/* MAIN CONTENT */}
      <main className="relative max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* HEADER */}
        <header className="mb-7">
          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-gray-600 font-semibold mb-2">
                <FaWallet className="text-blue-400" />
                Financeiro
                <FaChevronRight className="text-gray-700 text-[8px]" />
                Comissões
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Gestão de Comissões
              </h1>
              <p className="text-sm text-gray-500 mt-1.5 max-w-2xl">
                Controle aprovações, pagamentos e distribuição das comissões
                geradas pelas vendas.
              </p>
            </div>

            <button
              onClick={handleRefresh}
              disabled={updating}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 text-sm font-semibold text-gray-400 hover:text-white transition-all disabled:opacity-50"
            >
              <FaSyncAlt size={12} className={updating ? 'animate-spin' : ''} />
              Atualizar
            </button>
          </div>
        </header>

        {/* KPI */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
          <MetricCard
            label="Comissões"
            value={metrics.total}
            description="Todos os registros"
            icon={FaReceipt}
            accent="blue"
          />
          <MetricCard
            label="Valor em comissões"
            value={formatCurrency(metrics.totalAmount)}
            description={`Sobre ${formatCurrency(metrics.saleAmount)} em vendas`}
            icon={FaMoneyBillWave}
            accent="emerald"
          />
          <MetricCard
            label="Pendentes"
            value={metrics.pending}
            description="Aguardando aprovação"
            icon={FaHourglassHalf}
            accent="yellow"
            trend={metrics.pending > 0 ? 'Ação necessária' : 'Tudo em dia'}
          />
          <MetricCard
            label="Pagas"
            value={metrics.paid}
            description={`${metrics.approved} aprovadas aguardando pagamento`}
            icon={FaCheck}
            accent="green"
          />
        </section>

        {/* FILTERS */}
        <section className="mb-6">
          <div className="rounded-2xl border border-gray-800 bg-[#0d1119]/90 p-2">
            <div className="flex flex-col lg:flex-row gap-2">
              <div className="flex flex-wrap gap-1.5">
                <StatusFilter
                  active={filters.status === 'pending'}
                  icon={FaHourglassHalf}
                  label="Pendentes"
                  count={metrics.pending}
                  accent="yellow"
                  onClick={() => setFilters({ status: 'pending' })}
                />
                <StatusFilter
                  active={filters.status === 'approved'}
                  icon={FaClock}
                  label="Aprovadas"
                  count={metrics.approved}
                  accent="blue"
                  onClick={() => setFilters({ status: 'approved' })}
                />
                <StatusFilter
                  active={filters.status === 'paid'}
                  icon={FaCheck}
                  label="Pagas"
                  count={metrics.paid}
                  accent="green"
                  onClick={() => setFilters({ status: 'paid' })}
                />
                <StatusFilter
                  active={filters.status === 'cancelled'}
                  icon={FaTimes}
                  label="Canceladas"
                  count={metrics.cancelled}
                  accent="red"
                  onClick={() => setFilters({ status: 'cancelled' })}
                />
                <StatusFilter
                  active={!filters.status}
                  icon={FaChartLine}
                  label="Todas"
                  count={metrics.total}
                  accent="gray"
                  onClick={() => setFilters({})}
                />
              </div>

              <div className="lg:ml-auto relative min-w-0 lg:w-80">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600 text-xs" />
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar venda, cliente, imóvel..."
                  className="w-full h-10 rounded-xl bg-gray-950/70 border border-gray-800 pl-9 pr-4 text-sm text-gray-300 placeholder:text-gray-700 outline-none focus:border-blue-500/40 transition-all"
                />
              </div>
            </div>
          </div>
        </section>

        {/* RESULTS HEADER */}
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="text-xs text-gray-600">
            {filteredCommissions.length}{' '}
            {filteredCommissions.length === 1
              ? 'comissão encontrada'
              : 'comissões encontradas'}
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-xs text-gray-500 hover:text-white transition-colors"
            >
              Limpar busca
            </button>
          )}
        </div>

        {/* LIST */}
        <section className="space-y-4">
          {filteredCommissions.length === 0 ? (
            <EmptyState
              search={search}
              status={filters.status}
              onClear={() => {
                setSearch('');
                setFilters({});
              }}
            />
          ) : (
            filteredCommissions.map((commission) => (
              <CommissionCard
                key={commission._id}
                commission={commission}
                updating={updating}
                onApprove={handleApprove}
                onPay={handlePay}
                onCancel={handleCancel}
                formatCurrency={formatCurrency}
                formatDate={formatDate}
                formatPercentage={formatPercentage}
                getPropertyImage={getPropertyImage}
                getPropertyName={getPropertyName}
                getPropertyAddress={getPropertyAddress}
                getPropertyCode={getPropertyCode}
                getPropertyPrice={getPropertyPrice}
                getBrokerAvatar={getBrokerAvatar}
                getInitials={getInitials}
                getCommissionProperty={getCommissionProperty}
              />
            ))
          )}
        </section>
      </main>
    </div>
  );
}

// =============================================================
// COMMISSION CARD
// =============================================================

function CommissionCard({
  commission,
  updating,
  onApprove,
  onPay,
  onCancel,
  formatCurrency,
  formatDate,
  formatPercentage,
  getPropertyImage,
  getPropertyName,
  getPropertyAddress,
  getPropertyCode,
  getPropertyPrice,
  getBrokerAvatar,
  getInitials,
  getCommissionProperty,
}) {
  const property = getCommissionProperty(commission) || {};

  const propertyImage = getPropertyImage(property);

  const propertyName = getPropertyName(property);

  const propertyAddress = getPropertyAddress(property);

  const propertyCode = getPropertyCode(property);

  const propertyPrice = getPropertyPrice(property);

  const saleNumber = commission.sale?.saleNumber || 'VENDA N/A';

  const saleAmount = Number(
    commission.sale?.saleAmount || commission.saleAmount || propertyPrice || 0,
  );

  const seller = commission.sellerBroker;

  const capturer = commission.capturerBroker;

  const sellerPercentage = Number(
    commission.distribution?.seller?.percentage || 0,
  );

  const capturerPercentage = Number(
    commission.distribution?.capturer?.percentage || 0,
  );

  const companyPercentage = Number(
    commission.distribution?.company?.percentage || 0,
  );

  const sellerAmount = Number(commission.distribution?.seller?.amount || 0);

  const capturerAmount = Number(commission.distribution?.capturer?.amount || 0);

  const companyAmount = Number(commission.distribution?.company?.amount || 0);

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-[#0d1119]/95 hover:border-gray-700 transition-all duration-300">
      {/* STATUS ACCENT */}

      <div
        className={`absolute top-0 left-0 right-0 h-px ${
          commission.status === 'pending'
            ? 'bg-yellow-500/40'
            : commission.status === 'approved'
              ? 'bg-blue-500/40'
              : commission.status === 'paid'
                ? 'bg-emerald-500/40'
                : 'bg-red-500/30'
        }`}
      />

      <div className="p-4 sm:p-5 lg:p-6">
        {/* HEADER */}

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            {/* PROPERTY IMAGE */}

            <div className="relative w-20 h-20 sm:w-28 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-gray-800 bg-gray-900">
              {propertyImage ? (
                <img
                  src={propertyImage}
                  alt={propertyName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                  <FaHome className="text-gray-700 text-xl" />

                  <span className="text-[8px] uppercase tracking-wider text-gray-700">
                    Sem imagem
                  </span>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
            </div>

            {/* PROPERTY INFO */}

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="font-mono text-[11px] text-blue-400">
                  {saleNumber}
                </span>

                <span className="text-gray-700">•</span>

                <span className="text-[11px] text-gray-600">
                  {formatDate(commission.createdAt)}
                </span>

                <CommissionStatusBadge status={commission.status} />
              </div>

              <h2 className="text-base sm:text-lg font-bold text-white truncate max-w-[600px]">
                {propertyName}
              </h2>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                {propertyCode && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-gray-600">
                    <FaReceipt size={8} />
                    Ref. {propertyCode}
                  </span>
                )}

                {propertyAddress && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-gray-600 truncate max-w-[520px]">
                    <FaMapMarkerAlt size={8} />

                    {propertyAddress}
                  </span>
                )}
              </div>

              {/* PROPERTY PRICE */}

              {propertyPrice > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] uppercase tracking-wider text-gray-700">
                    Valor do imóvel
                  </span>

                  <span className="text-xs font-semibold text-gray-400">
                    {formatCurrency(propertyPrice)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* TOTAL */}

          <div className="lg:text-right shrink-0">
            <p className="text-[10px] uppercase tracking-[0.16em] text-gray-600 font-semibold">
              Comissão total
            </p>

            <p className="text-2xl sm:text-3xl font-bold text-emerald-400 mt-0.5">
              {formatCurrency(commission.totalAmount)}
            </p>

            <div className="flex items-center lg:justify-end gap-2 mt-1">
              <span className="text-xs text-gray-600">
                {formatPercentage(commission.totalPercentage)}
              </span>

              <span className="text-gray-800">•</span>

              <span className="text-xs text-gray-600">
                venda {formatCurrency(saleAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* DIVIDER */}

        <div className="my-5 border-t border-gray-800/80" />

        {/* PEOPLE */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PersonMiniCard
            label="Cliente"
            name={commission.lead?.name || 'Cliente não informado'}
            subtitle={commission.lead?.email || commission.lead?.phone}
            initials={getInitials(commission.lead?.name)}
            icon={FaUser}
            accent="gray"
          />

          <PersonMiniCard
            label="Corretor vendedor"
            name={seller?.name || 'Vendedor não informado'}
            subtitle={seller?.email}
            avatar={getBrokerAvatar(seller)}
            initials={getInitials(seller?.name)}
            icon={FaUser}
            accent="blue"
          />

          <PersonMiniCard
            label="Corretor captador"
            name={capturer?.name || 'Sem captador'}
            subtitle={capturer?.email}
            avatar={getBrokerAvatar(capturer)}
            initials={getInitials(capturer?.name)}
            icon={FaUserPlus}
            accent="purple"
            muted={!capturer}
          />
        </div>

        {/* DISTRIBUTION */}

        <div className="mt-5 rounded-xl border border-gray-800 bg-gray-950/40 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <FaPercentage className="text-gray-600 text-xs" />

                <p className="text-xs font-semibold text-gray-300">
                  Distribuição da comissão
                </p>
              </div>

              <p className="text-[11px] text-gray-600 mt-1">
                Como os {formatCurrency(commission.totalAmount)} serão
                distribuídos
              </p>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-[10px] uppercase tracking-wider text-gray-700">
                Comissão
              </p>

              <p className="text-sm font-bold text-emerald-400">
                {formatPercentage(commission.totalPercentage)}
              </p>
            </div>
          </div>

          {/* BAR */}

          <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-gray-800">
            {sellerPercentage > 0 && (
              <div
                className="bg-blue-500"
                style={{
                  width: `${sellerPercentage}%`,
                }}
              />
            )}

            {capturerPercentage > 0 && (
              <div
                className="bg-purple-500"
                style={{
                  width: `${capturerPercentage}%`,
                }}
              />
            )}

            {companyPercentage > 0 && (
              <div
                className="bg-emerald-500"
                style={{
                  width: `${companyPercentage}%`,
                }}
              />
            )}
          </div>

          {/* ITEMS */}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            <DistributionItem
              icon={FaUser}
              label="Vendedor"
              percentage={sellerPercentage}
              amount={sellerAmount}
              accent="blue"
              formatCurrency={formatCurrency}
              formatPercentage={formatPercentage}
            />

            <DistributionItem
              icon={FaUserPlus}
              label="Captador"
              percentage={capturerPercentage}
              amount={capturerAmount}
              accent="purple"
              formatCurrency={formatCurrency}
              formatPercentage={formatPercentage}
              muted={!capturer}
            />

            <DistributionItem
              icon={FaBuilding}
              label="Imobiliária"
              percentage={companyPercentage}
              amount={companyAmount}
              accent="emerald"
              formatCurrency={formatCurrency}
              formatPercentage={formatPercentage}
            />
          </div>
        </div>

        {/* FOOTER */}

        <div className="mt-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-gray-600">
            <span className="inline-flex items-center gap-1.5">
              <FaCalendarAlt size={9} />
              Criada em {formatDate(commission.createdAt)}
            </span>

            {commission.dueDate && (
              <span className="inline-flex items-center gap-1.5">
                <FaClock size={9} />
                Vencimento {formatDate(commission.dueDate)}
              </span>
            )}

            {commission.paymentMethod && (
              <span className="inline-flex items-center gap-1.5">
                <FaMoneyBillWave size={9} />

                {commission.paymentMethod}
              </span>
            )}
          </div>

          {/* ACTIONS */}

          <div className="flex flex-col sm:flex-row gap-2">
            {commission.status === 'pending' && (
              <>
                <button
                  onClick={() => onCancel(commission._id)}
                  disabled={updating}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/15 bg-red-500/5 hover:bg-red-500/10 text-red-400 text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FaTimes size={11} />
                  Cancelar
                </button>

                <button
                  onClick={() => onApprove(commission._id)}
                  disabled={updating}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-950/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FaCheck size={11} />

                  {updating ? 'Processando...' : 'Aprovar comissão'}

                  <FaChevronRight size={8} />
                </button>
              </>
            )}

            {commission.status === 'approved' && (
              <button
                onClick={() => onPay(commission._id)}
                disabled={updating}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FaMoneyBillWave size={11} />

                {updating ? 'Processando...' : 'Registrar pagamento'}

                <FaChevronRight size={8} />
              </button>
            )}

            {commission.status === 'paid' && (
              <div className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-xs font-semibold">
                <FaCheck size={11} />
                Comissão paga
              </div>
            )}

            {commission.status === 'cancelled' && (
              <div className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/5 border border-red-500/10 text-red-400 text-xs font-semibold">
                <FaTimes size={11} />
                Comissão cancelada
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

// =============================================================
// METRIC CARD
// =============================================================

function MetricCard({ label, value, description, icon: Icon, accent, trend }) {
  const themes = {
    blue: {
      icon: 'bg-blue-500/10 border-blue-500/10 text-blue-400',
      glow: 'bg-blue-500/5',
      value: 'text-white',
    },

    emerald: {
      icon: 'bg-emerald-500/10 border-emerald-500/10 text-emerald-400',
      glow: 'bg-emerald-500/5',
      value: 'text-emerald-400',
    },

    yellow: {
      icon: 'bg-yellow-500/10 border-yellow-500/10 text-yellow-400',
      glow: 'bg-yellow-500/5',
      value: 'text-yellow-400',
    },

    green: {
      icon: 'bg-emerald-500/10 border-emerald-500/10 text-emerald-400',
      glow: 'bg-emerald-500/5',
      value: 'text-emerald-400',
    },
  };

  const theme = themes[accent] || themes.blue;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-[#0d1119] p-5">
      <div
        className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl ${theme.glow}`}
      />

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center ${theme.icon}`}
          >
            <Icon className="text-sm" />
          </div>

          {trend && (
            <span className="text-[9px] uppercase tracking-wider text-gray-600 font-semibold">
              {trend}
            </span>
          )}
        </div>

        <p className="text-[10px] uppercase tracking-[0.15em] text-gray-600 font-semibold mt-5">
          {label}
        </p>

        <p className={`text-2xl font-bold mt-1 ${theme.value}`}>{value}</p>

        <p className="text-[11px] text-gray-600 mt-1.5">{description}</p>
      </div>
    </div>
  );
}

// =============================================================
// STATUS FILTER
// =============================================================

function StatusFilter({ active, icon: Icon, label, count, accent, onClick }) {
  const themes = {
    yellow: {
      active: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/15',
    },

    blue: {
      active: 'bg-blue-500/10 text-blue-400 border-blue-500/15',
    },

    green: {
      active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/15',
    },

    red: {
      active: 'bg-red-500/10 text-red-400 border-red-500/15',
    },

    gray: {
      active: 'bg-gray-800 text-gray-200 border-gray-700',
    },
  };

  const theme = themes[accent] || themes.gray;

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
        active
          ? theme.active
          : 'border-transparent text-gray-600 hover:text-gray-300 hover:bg-gray-800/60'
      }`}
    >
      <Icon size={11} />

      <span>{label}</span>

      <span
        className={`min-w-5 h-5 px-1.5 rounded-md flex items-center justify-center text-[10px] ${
          active ? 'bg-black/10' : 'bg-gray-900 text-gray-600'
        }`}
      >
        {count}
      </span>
    </button>
  );
}

// =============================================================
// PERSON MINI CARD
// =============================================================

function PersonMiniCard({
  label,
  name,
  subtitle,
  avatar,
  initials,
  icon: Icon,
  accent = 'gray',
  muted = false,
}) {
  const themes = {
    gray: {
      bg: 'bg-gray-800',
      text: 'text-gray-400',
    },

    blue: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
    },

    purple: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
    },
  };

  const theme = themes[accent] || themes.gray;

  return (
    <div
      className={`rounded-xl border border-gray-800 bg-gray-950/30 p-3.5 ${
        muted ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-10 h-10 rounded-xl object-cover border border-gray-700"
            />
          ) : (
            <div
              className={`w-10 h-10 rounded-xl ${theme.bg} flex items-center justify-center`}
            >
              {name && name !== 'Sem captador' ? (
                <span className={`text-xs font-bold ${theme.text}`}>
                  {initials}
                </span>
              ) : (
                <Icon className={`text-xs ${theme.text}`} />
              )}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-[9px] uppercase tracking-[0.14em] text-gray-700 font-semibold">
            {label}
          </p>

          <p className="text-xs font-semibold text-gray-300 truncate mt-0.5">
            {name}
          </p>

          {subtitle && (
            <p className="text-[10px] text-gray-700 truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================
// DISTRIBUTION ITEM
// =============================================================

function DistributionItem({
  icon: Icon,
  label,
  percentage,
  amount,
  accent,
  muted = false,
  formatCurrency,
  formatPercentage,
}) {
  const themes = {
    blue: {
      icon: 'bg-blue-500/10 text-blue-400',
      amount: 'text-blue-400',
    },

    purple: {
      icon: 'bg-purple-500/10 text-purple-400',
      amount: 'text-purple-400',
    },

    emerald: {
      icon: 'bg-emerald-500/10 text-emerald-400',
      amount: 'text-emerald-400',
    },
  };

  const theme = themes[accent] || themes.blue;

  return (
    <div
      className={`flex items-center justify-between gap-3 ${
        muted ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${theme.icon}`}
        >
          <Icon size={10} />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] text-gray-600">{label}</p>

          <p className="text-xs font-semibold text-gray-400">
            {formatPercentage(percentage)}
          </p>
        </div>
      </div>

      <p className={`text-xs font-bold ${theme.amount}`}>
        {formatCurrency(amount)}
      </p>
    </div>
  );
}

// =============================================================
// EMPTY STATE
// =============================================================

function EmptyState({ search, status, onClear }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-800 bg-[#0d1119]/60 p-12 text-center">
      <div className="mx-auto w-14 h-14 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center">
        {search ? (
          <FaSearch className="text-gray-700" />
        ) : status === 'pending' ? (
          <FaHourglassHalf className="text-gray-700" />
        ) : (
          <FaReceipt className="text-gray-700" />
        )}
      </div>

      <h3 className="text-sm font-semibold text-gray-400 mt-4">
        {search
          ? 'Nenhuma comissão encontrada'
          : 'Nenhuma comissão nesta categoria'}
      </h3>

      <p className="text-xs text-gray-700 mt-1 max-w-md mx-auto">
        {search
          ? 'Tente buscar por outro cliente, imóvel, venda ou corretor.'
          : 'Quando houver comissões correspondentes a este filtro, elas aparecerão aqui.'}
      </p>

      {(search || status) && (
        <button
          onClick={onClear}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs font-semibold text-gray-400 hover:text-white transition-all"
        >
          Limpar filtros
        </button>
      )}
    </div>
  );
}

// =============================================================
// SKELETON
// =============================================================

function CommissionApprovalSkeleton() {
  return (
    <div className="min-h-screen bg-[#080b11] p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1500px] mx-auto animate-pulse">
        <div className="mb-8">
          <div className="h-3 w-24 bg-gray-900 rounded mb-3" />

          <div className="h-8 w-72 bg-gray-900 rounded" />

          <div className="h-4 w-96 bg-gray-900 rounded mt-3" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-7">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-32 rounded-2xl bg-[#0d1119] border border-gray-900"
            />
          ))}
        </div>

        <div className="h-14 rounded-2xl bg-[#0d1119] border border-gray-900 mb-6" />

        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-80 rounded-2xl bg-[#0d1119] border border-gray-900"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

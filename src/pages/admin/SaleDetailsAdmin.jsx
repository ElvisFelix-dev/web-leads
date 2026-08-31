import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  FaArrowLeft,
  FaCheck,
  FaTimes,
  FaEdit,
  FaMoneyBillWave,
  FaUsers,
  FaUserPlus,
  FaBuilding,
  FaCalendarAlt,
  FaHome,
  FaHandshake,
  FaClipboardList,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaFileContract,
  FaChevronRight,
  FaCircle,
  FaReceipt,
  FaMapMarkerAlt,
  FaExternalLinkAlt,
  FaUserTie,
} from 'react-icons/fa';

import { useSale } from '../../hooks/useSales';
import { saleService } from '../../service/saleService';
import { commissionService } from '../../service/commissionService';

import SaleStatusBadge from '../../components/admin/SaleStatusBadge';
import CommissionStatusBadge from '../../components/admin/CommissionStatusBadge';
import CommissionDistribution from '../../components/admin/CommissionDistribution';
import CommissionApproveModal from '../../components/admin/CommissionApproveModal.jsx';

export default function SaleDetailsAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { sale, loading, refetch } = useSale(id);

  const [updating, setUpdating] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);

  const [commission, setCommission] = useState(null);
  const [commissionLoading, setCommissionLoading] = useState(false);

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

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '-';
    }

    return parsedDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatShortDate = (date) => {
    if (!date) return '-';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return '-';
    }

    return parsedDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // =========================================================
  // BUSCAR COMISSÃO
  // =========================================================

  const fetchCommission = async () => {
    if (!id) return;

    try {
      setCommissionLoading(true);

      const response = await commissionService.getAll({
        sale: id,
      });

      if (response?.data && response.data.length > 0) {
        setCommission(response.data[0]);
      } else {
        setCommission(null);
      }
    } catch (error) {
      console.error('Erro ao buscar comissão:', error);
      setCommission(null);
    } finally {
      setCommissionLoading(false);
    }
  };

  useEffect(() => {
    if (sale) {
      fetchCommission();
    }
  }, [sale]);

  // =========================================================
  // SUCESSO DA COMISSÃO
  // =========================================================

  const handleCommissionSuccess = async () => {
    setShowCommissionModal(false);

    await refetch();
    await fetchCommission();
  };

  // =========================================================
  // AÇÕES DA VENDA
  // =========================================================

  const handleCompleteSale = async () => {
    if (!window.confirm('Confirmar conclusão da venda?')) {
      return;
    }

    try {
      setUpdating(true);

      await saleService.complete(id);

      await refetch();
      await fetchCommission();

      window.alert('✅ Venda concluída com sucesso!');
    } catch (error) {
      console.error('Erro ao concluir venda:', error);

      window.alert(
        '❌ Erro ao concluir venda: ' +
          (error.response?.data?.message || 'Erro inesperado'),
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelSale = async () => {
    const reason = window.prompt('Motivo do cancelamento:');

    if (!reason?.trim()) {
      return;
    }

    if (!window.confirm('Confirmar cancelamento da venda?')) {
      return;
    }

    try {
      setUpdating(true);

      await saleService.cancel(id, reason.trim());

      await refetch();
      await fetchCommission();

      window.alert('✅ Venda cancelada com sucesso!');
    } catch (error) {
      console.error('Erro ao cancelar venda:', error);

      window.alert(
        '❌ Erro ao cancelar venda: ' +
          (error.response?.data?.message || 'Erro inesperado'),
      );
    } finally {
      setUpdating(false);
    }
  };

  // =========================================================
  // DADOS NORMALIZADOS
  // =========================================================

  const commissionData = useMemo(() => {
    return commission || sale?.commission || {};
  }, [commission, sale]);

  const commissionStatus = commission?.status || null;

  const hasCapturer =
    sale?.acquisitionBroker !== null && sale?.acquisitionBroker !== undefined;

  const hasCapturerCommission =
    Number(commissionData?.distribution?.capturer?.amount || 0) > 0;

  const showCapturer = hasCapturer || hasCapturerCommission;

  // =========================================================
  // IMÓVEL
  // =========================================================

  const property = sale?.property || {};

  const propertyName =
    property?.title ||
    property?.name ||
    property?.description ||
    'Imóvel não informado';

  const propertyCode =
    property?.code || property?.reference || property?.propertyCode || '';

  const propertyImage =
    property?.coverImage ||
    property?.mainImage ||
    property?.thumbnail ||
    property?.image ||
    property?.photo ||
    property?.images?.[0]?.url ||
    property?.images?.[0] ||
    property?.photos?.[0]?.url ||
    property?.photos?.[0] ||
    null;

  const propertyAddress =
    property?.address?.street ||
    property?.address?.formatted ||
    property?.address?.full ||
    property?.address ||
    property?.location?.address ||
    '';

  const propertyNeighborhood =
    property?.address?.neighborhood ||
    property?.neighborhood ||
    property?.location?.neighborhood ||
    '';

  // =========================================================
  // CORRETOR VENDEDOR
  // =========================================================

  const sellerBroker = sale?.sellerBroker || {};

  const sellerAvatar =
    sellerBroker?.avatar ||
    sellerBroker?.photo ||
    sellerBroker?.profileImage ||
    sellerBroker?.image ||
    sellerBroker?.avatarUrl ||
    sellerBroker?.profile?.avatar ||
    null;

  const sellerPosition =
    sellerBroker?.position ||
    sellerBroker?.role ||
    sellerBroker?.jobTitle ||
    sellerBroker?.title ||
    'Corretor de imóveis';

  // =========================================================
  // CORRETOR CAPTADOR
  // =========================================================

  const acquisitionBroker = sale?.acquisitionBroker || {};

  const capturerAvatar =
    acquisitionBroker?.avatar ||
    acquisitionBroker?.photo ||
    acquisitionBroker?.profileImage ||
    acquisitionBroker?.image ||
    acquisitionBroker?.avatarUrl ||
    acquisitionBroker?.profile?.avatar ||
    null;

  const capturerPosition =
    acquisitionBroker?.position ||
    acquisitionBroker?.role ||
    acquisitionBroker?.jobTitle ||
    acquisitionBroker?.title ||
    'Corretor captador';

  // =========================================================
  // PAGAMENTO
  // =========================================================

  const paymentStatusMap = {
    pending: 'Pendente',
    partial: 'Parcial',
    paid: 'Pago',
  };

  const paymentStatus =
    paymentStatusMap[sale?.paymentStatus] ||
    sale?.paymentStatus ||
    'Não informado';

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070a10] text-white">
        <div className="max-w-[1600px] mx-auto p-6 lg:p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-80 bg-gray-800/80 rounded-xl" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-32 bg-gray-900/80 border border-gray-800 rounded-2xl"
                />
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_390px] gap-6">
              <div className="space-y-6">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-56 bg-gray-900/80 border border-gray-800 rounded-2xl"
                  />
                ))}
              </div>

              <div className="h-[600px] bg-gray-900/80 border border-gray-800 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // VENDA NÃO ENCONTRADA
  // =========================================================

  if (!sale) {
    return (
      <div className="min-h-screen bg-[#070a10] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-gray-900/90 border border-gray-800 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <FaReceipt className="text-red-400 text-2xl" />
          </div>

          <h2 className="text-xl font-bold text-white mb-2">
            Venda não encontrada
          </h2>

          <p className="text-sm text-gray-500 mb-6">
            Não foi possível localizar os dados desta venda.
          </p>

          <button
            onClick={() => navigate('/sales')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm font-medium transition-all"
          >
            <FaArrowLeft size={13} />
            Voltar para vendas
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-[#070a10] text-white">
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-250px] left-[-180px] w-[600px] h-[600px] bg-blue-600/[0.035] rounded-full blur-3xl" />

        <div className="absolute top-[350px] right-[-250px] w-[600px] h-[600px] bg-emerald-600/[0.035] rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <header className="mb-7">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
            <div className="flex items-start gap-4">
              <Link
                to="/sales"
                className="group mt-1 w-11 h-11 rounded-xl bg-gray-900/80 border border-gray-800 hover:border-gray-700 hover:bg-gray-800 flex items-center justify-center transition-all shadow-lg"
              >
                <FaArrowLeft
                  size={15}
                  className="text-gray-400 group-hover:text-white group-hover:-translate-x-0.5 transition-all"
                />
              </Link>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-gray-500 font-semibold">
                    Gestão de vendas
                  </span>

                  <span className="w-1 h-1 rounded-full bg-gray-700" />

                  <span className="text-xs text-gray-600">
                    Registro #{sale._id?.slice(-6)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    Venda{' '}
                    <span className="font-mono text-blue-400">
                      {sale.saleNumber}
                    </span>
                  </h1>

                  <SaleStatusBadge status={sale.status} />
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-500">
                  <FaClock size={11} />

                  <span>Criada em {formatShortDate(sale.createdAt)}</span>

                  {sale.saleDate && (
                    <>
                      <span className="text-gray-700">•</span>

                      <span>Venda em {formatShortDate(sale.saleDate)}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {(sale.status === 'pending' || sale.status === 'contract') && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleCompleteSale}
                  disabled={updating}
                  className="group inline-flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-950/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaCheck
                    size={13}
                    className="group-hover:scale-110 transition-transform"
                  />

                  {updating ? 'Processando...' : 'Concluir venda'}
                </button>

                <button
                  onClick={handleCancelSale}
                  disabled={updating}
                  className="inline-flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-red-500/10 border border-gray-800 hover:border-red-500/30 text-gray-300 hover:text-red-400 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaTimes size={13} />
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </header>

        {/* =====================================================
            PROPERTY HERO
        ====================================================== */}

        <section className="mb-6">
          <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/80 shadow-xl group">
            <div className="flex flex-col md:flex-row">
              {/* IMAGEM */}
              <div className="relative w-full md:w-[220px] lg:w-[260px] h-48 md:h-auto shrink-0 overflow-hidden bg-gray-950">
                {propertyImage ? (
                  <img
                    src={propertyImage}
                    alt={propertyName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(event) => {
                      event.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full min-h-[190px] flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-gray-900">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/10 flex items-center justify-center">
                      <FaHome className="text-emerald-400 text-xl" />
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] uppercase tracking-wider text-white/80 font-semibold">
                  Imóvel vendido
                </span>
              </div>

              {/* INFORMAÇÕES */}
              <div className="flex-1 p-5 md:p-6 flex flex-col justify-center">
                <div className="flex items-start justify-between gap-5">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-400/70 font-semibold mb-2">
                      Imóvel da negociação
                    </p>

                    <h2 className="text-xl md:text-2xl font-bold text-white truncate">
                      {propertyName}
                    </h2>

                    {propertyCode && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">Código</span>

                        <span className="font-mono text-xs text-blue-400">
                          {propertyCode}
                        </span>
                      </div>
                    )}

                    {(propertyAddress || propertyNeighborhood) && (
                      <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                        <FaMapMarkerAlt
                          size={10}
                          className="text-gray-600 shrink-0"
                        />

                        <span className="truncate">
                          {[propertyAddress, propertyNeighborhood]
                            .filter(Boolean)
                            .join(' • ')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="hidden sm:flex w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 items-center justify-center shrink-0">
                    <FaHome className="text-gray-400 text-sm" />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-5">
                  <div className="px-3 py-2 rounded-xl bg-gray-800/60 border border-gray-800">
                    <span className="text-[10px] uppercase tracking-wider text-gray-600 block">
                      Negociação
                    </span>

                    <span className="text-sm font-semibold text-gray-200">
                      {formatCurrency(sale.saleAmount)}
                    </span>
                  </div>

                  <div className="px-3 py-2 rounded-xl bg-gray-800/60 border border-gray-800">
                    <span className="text-[10px] uppercase tracking-wider text-gray-600 block">
                      Proposta
                    </span>

                    <span className="text-sm font-semibold text-gray-200">
                      {formatCurrency(sale.proposalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            SUMMARY
        ====================================================== */}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <SummaryCard
            icon={<FaMoneyBillWave />}
            iconClass="bg-blue-500/10 text-blue-400 border-blue-500/10"
            label="Valor da venda"
            value={formatCurrency(sale.saleAmount)}
            description="Valor final negociado"
          />

          <SummaryCard
            icon={<FaHandshake />}
            iconClass="bg-purple-500/10 text-purple-400 border-purple-500/10"
            label="Valor da proposta"
            value={formatCurrency(sale.proposalAmount)}
            description="Valor originalmente proposto"
          />

          <SummaryCard
            icon={<FaMoneyBillWave />}
            iconClass="bg-emerald-500/10 text-emerald-400 border-emerald-500/10"
            label="Comissão total"
            value={formatCurrency(commissionData?.totalAmount)}
            description={`${commissionData?.totalPercentage || 0}% sobre a venda`}
            accent
          />
        </section>

        {/* =====================================================
            MAIN GRID
        ====================================================== */}

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_390px] gap-6">
          {/* ===================================================
              LEFT
          ==================================================== */}

          <main className="space-y-6">
            {/* DETALHES */}
            <section className="bg-gray-900/80 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
              <SectionHeader
                icon={<FaClipboardList />}
                iconClass="bg-blue-500/10 text-blue-400"
                title="Detalhes da venda"
                subtitle="Informações operacionais e financeiras"
                right={
                  <span className="hidden sm:flex items-center gap-2 text-xs text-gray-600">
                    <FaCircle size={5} className="text-blue-400" />
                    Registro ativo
                  </span>
                }
              />

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <DetailItem
                    label="Número da venda"
                    value={sale.saleNumber}
                    mono
                    accent
                  />

                  <DetailItem
                    label="Data da venda"
                    value={formatDate(sale.saleDate)}
                    icon={<FaCalendarAlt size={12} />}
                  />

                  <DetailItem
                    label="Status da venda"
                    value={<SaleStatusBadge status={sale.status} />}
                  />

                  <DetailItem
                    label="Status do pagamento"
                    value={
                      <span
                        className={`inline-flex items-center gap-2 text-sm ${
                          sale.paymentStatus === 'paid'
                            ? 'text-emerald-400'
                            : sale.paymentStatus === 'partial'
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                        }`}
                      >
                        <FaCircle size={6} />
                        {paymentStatus}
                      </span>
                    }
                  />

                  {sale.completedAt && (
                    <DetailItem
                      label="Venda concluída em"
                      value={formatDate(sale.completedAt)}
                    />
                  )}

                  {sale.cancelledAt && (
                    <DetailItem
                      label="Cancelada em"
                      value={formatDate(sale.cancelledAt)}
                      danger
                    />
                  )}

                  {sale.cancellationReason && (
                    <div className="md:col-span-2 p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                      <p className="text-xs uppercase tracking-wider text-red-400/70 mb-2">
                        Motivo do cancelamento
                      </p>

                      <p className="text-sm text-red-300 leading-relaxed">
                        {sale.cancellationReason}
                      </p>
                    </div>
                  )}

                  {sale.notes && (
                    <div className="md:col-span-2 p-4 rounded-xl bg-gray-800/40 border border-gray-800">
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
                        Observações
                      </p>

                      <p className="text-sm text-gray-300 leading-relaxed">
                        {sale.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* ENTIDADES */}
            <section className="bg-gray-900/80 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
              <SectionHeader
                icon={<FaUsers />}
                iconClass="bg-purple-500/10 text-purple-400"
                title="Participantes da negociação"
                subtitle="Cliente, imóvel e equipe comercial envolvida"
              />

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* LEAD */}
                <EntityCard
                  icon={<FaUsers />}
                  iconClass="bg-blue-500/10 text-blue-400"
                  label="Lead / Cliente"
                  name={sale.lead?.name || 'Não informado'}
                  secondary={sale.lead?.phone}
                  secondaryIcon={
                    sale.lead?.phone ? <FaPhone size={10} /> : null
                  }
                  avatar={sale.lead?.avatar || sale.lead?.photo}
                />

                {/* IMÓVEL */}
                <PropertyEntityCard
                  image={propertyImage}
                  name={propertyName}
                  code={propertyCode}
                  address={propertyNeighborhood || propertyAddress}
                />

                {/* VENDEDOR */}
                <BrokerEntityCard
                  label="Corretor vendedor"
                  name={sellerBroker?.name || 'Não informado'}
                  position={sellerPosition}
                  email={sellerBroker?.email}
                  phone={sellerBroker?.phone}
                  avatar={sellerAvatar}
                  color="purple"
                />

                {/* CAPTADOR */}
                <BrokerEntityCard
                  label="Corretor captador"
                  name={
                    acquisitionBroker?.name ||
                    (showCapturer ? 'Captador vinculado' : 'Não vinculado')
                  }
                  position={
                    acquisitionBroker?.name
                      ? capturerPosition
                      : showCapturer
                        ? 'Participação registrada na comissão'
                        : 'Sem participação'
                  }
                  email={acquisitionBroker?.email}
                  phone={acquisitionBroker?.phone}
                  avatar={capturerAvatar}
                  color="orange"
                  muted={!acquisitionBroker?.name && !showCapturer}
                />
              </div>
            </section>

            {/* TIMELINE */}
            <section className="bg-gray-900/80 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
              <SectionHeader
                icon={<FaClock />}
                iconClass="bg-cyan-500/10 text-cyan-400"
                title="Linha do tempo"
                subtitle="Histórico principal da venda"
              />

              <div className="p-6">
                <TimelineItem
                  title="Venda criada"
                  date={sale.createdAt}
                  active
                  icon={<FaClipboardList />}
                />

                {sale.saleDate && (
                  <TimelineItem
                    title="Data da venda"
                    date={sale.saleDate}
                    active
                    icon={<FaHandshake />}
                  />
                )}

                {sale.completedAt && (
                  <TimelineItem
                    title="Venda concluída"
                    date={sale.completedAt}
                    active
                    success
                    icon={<FaCheck />}
                  />
                )}

                {sale.cancelledAt && (
                  <TimelineItem
                    title="Venda cancelada"
                    date={sale.cancelledAt}
                    active
                    danger
                    icon={<FaTimes />}
                  />
                )}
              </div>
            </section>
          </main>

          {/* ===================================================
              RIGHT SIDEBAR
          ==================================================== */}

          <aside className="space-y-6">
            {/* COMISSÃO */}
            <section className="relative overflow-hidden bg-gray-900/90 border border-gray-800 rounded-2xl shadow-xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative">
                <SectionHeader
                  icon={<FaMoneyBillWave />}
                  iconClass="bg-emerald-500/10 text-emerald-400"
                  title="Comissão"
                  subtitle="Distribuição financeira"
                  right={
                    commission ? (
                      <CommissionStatusBadge status={commission.status} />
                    ) : null
                  }
                />

                <div className="p-6">
                  {commissionLoading ? (
                    <div className="space-y-4 animate-pulse">
                      <div className="h-24 bg-gray-800 rounded-xl" />
                      <div className="h-14 bg-gray-800 rounded-xl" />
                      <div className="h-14 bg-gray-800 rounded-xl" />
                    </div>
                  ) : (
                    <>
                      <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/10 p-5 mb-5">
                        <div className="flex items-end justify-between gap-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500">
                              Comissão total
                            </p>

                            <p className="text-2xl font-bold text-emerald-400 mt-1">
                              {formatCurrency(commissionData?.totalAmount)}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-[10px] uppercase tracking-wider text-gray-600">
                              Percentual
                            </p>

                            <p className="text-lg font-bold text-white mt-1">
                              {commissionData?.totalPercentage || 0}%
                            </p>
                          </div>
                        </div>
                      </div>

                      <CommissionDistribution
                        distribution={
                          commissionData?.distribution || commissionData
                        }
                        totalAmount={commissionData?.totalAmount}
                        hasCapturer={showCapturer}
                      />

                      <div className="mt-5 pt-5 border-t border-gray-800 space-y-3">
                        <FinancialRow
                          label="Total da comissão"
                          value={formatCurrency(commissionData?.totalAmount)}
                          accent
                        />

                        <FinancialRow
                          label="Percentual total"
                          value={`${commissionData?.totalPercentage || 0}%`}
                        />

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Status</span>

                          {commission ? (
                            <CommissionStatusBadge status={commission.status} />
                          ) : (
                            <span className="text-xs text-gray-600">
                              Não gerada
                            </span>
                          )}
                        </div>

                        {!showCapturer && (
                          <div className="pt-3 mt-3 border-t border-gray-800">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                Captador
                              </span>

                              <span className="text-xs text-gray-600">
                                Não vinculado
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* CORRETOR PRINCIPAL */}
            <section className="bg-gray-900/90 border border-gray-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/10 flex items-center justify-center">
                  <FaUserTie className="text-purple-400 text-sm" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold">
                    Responsável pela venda
                  </h3>

                  <p className="text-xs text-gray-600 mt-0.5">
                    Corretor responsável pela negociação
                  </p>
                </div>
              </div>

              <BrokerProfile
                name={sellerBroker?.name || 'Não informado'}
                position={sellerPosition}
                avatar={sellerAvatar}
                email={sellerBroker?.email}
                phone={sellerBroker?.phone}
              />
            </section>

            {/* AÇÕES COMISSÃO */}
            {sale.status === 'completed' && (
              <section className="bg-gray-900/90 border border-gray-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/10 flex items-center justify-center">
                    <FaEdit className="text-blue-400 text-sm" />
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold">
                      Gestão da comissão
                    </h3>

                    <p className="text-xs text-gray-600 mt-0.5">
                      Ajuste e aprovação financeira
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowCommissionModal(true)}
                  className="group w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-950/20 transition-all"
                >
                  <span className="flex items-center gap-2.5 text-sm font-semibold">
                    <FaEdit size={14} />
                    Gerenciar comissão
                  </span>

                  <FaChevronRight
                    size={12}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>

                <p className="text-[11px] text-gray-600 text-center mt-3">
                  {commissionStatus === 'approved'
                    ? 'Comissão aprovada para pagamento'
                    : commissionStatus === 'paid'
                      ? 'Comissão já registrada como paga'
                      : 'Revise a distribuição antes da aprovação'}
                </p>
              </section>
            )}

            {/* FINANCEIRO */}
            <section className="bg-gray-900/90 border border-gray-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/10 flex items-center justify-center">
                  <FaFileContract className="text-purple-400 text-sm" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold">Resumo financeiro</h3>

                  <p className="text-xs text-gray-600 mt-0.5">
                    Indicadores da negociação
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <FinancialRow
                  label="Valor da venda"
                  value={formatCurrency(sale.saleAmount)}
                  strong
                />

                <FinancialRow
                  label="Valor da proposta"
                  value={formatCurrency(sale.proposalAmount)}
                />

                <FinancialRow
                  label="Comissão"
                  value={formatCurrency(commissionData?.totalAmount)}
                  accent
                />

                <div className="border-t border-gray-800 pt-4">
                  <FinancialRow
                    label="Status do pagamento"
                    value={paymentStatus}
                  />
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>

      {/* =======================================================
          MODAL
      ======================================================== */}

      {showCommissionModal && (
        <CommissionApproveModal
          sale={sale}
          onClose={() => setShowCommissionModal(false)}
          onSuccess={handleCommissionSuccess}
        />
      )}
    </div>
  );
}

// =============================================================
// SUMMARY CARD
// =============================================================

function SummaryCard({
  icon,
  iconClass,
  label,
  value,
  description,
  accent = false,
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl p-5 border shadow-xl transition-all duration-300 ${
        accent
          ? 'bg-gray-900/80 border-emerald-500/10 hover:border-emerald-500/20'
          : 'bg-gray-900/80 border-gray-800 hover:border-gray-700'
      }`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/[0.015] blur-2xl pointer-events-none" />

      <div className="relative flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl border flex items-center justify-center ${iconClass}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500 font-medium">
            {label}
          </p>

          <p
            className={`mt-1 text-xl font-bold ${
              accent ? 'text-emerald-400' : 'text-white'
            }`}
          >
            {value}
          </p>

          <p className="text-[11px] text-gray-600 mt-0.5">{description}</p>
        </div>
      </div>
    </div>
  );
}

// =============================================================
// SECTION HEADER
// =============================================================

function SectionHeader({ icon, iconClass, title, subtitle, right }) {
  return (
    <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconClass}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <h2 className="text-base font-semibold text-white">{title}</h2>

          {subtitle && (
            <p className="text-xs text-gray-600 mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
      </div>

      {right}
    </div>
  );
}

// =============================================================
// DETAIL
// =============================================================

function DetailItem({
  label,
  value,
  icon,
  mono = false,
  accent = false,
  danger = false,
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.15em] text-gray-600 mb-1.5">
        {label}
      </p>

      <div
        className={`flex items-center gap-2 text-sm ${
          mono ? 'font-mono' : ''
        } ${
          danger ? 'text-red-400' : accent ? 'text-blue-400' : 'text-gray-200'
        }`}
      >
        {icon && <span className="text-gray-600 shrink-0">{icon}</span>}

        {value}
      </div>
    </div>
  );
}

// =============================================================
// ENTITY CARD
// =============================================================

function EntityCard({
  icon,
  iconClass,
  label,
  name,
  secondary,
  secondaryIcon,
  muted = false,
  avatar,
}) {
  return (
    <div
      className={`group rounded-2xl border p-4 transition-all duration-300 ${
        muted
          ? 'bg-gray-900/30 border-gray-800/70 opacity-60'
          : 'bg-gray-800/25 border-gray-800 hover:border-gray-700 hover:bg-gray-800/45'
      }`}
    >
      <div className="flex items-start gap-3">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-10 h-10 shrink-0 rounded-xl object-cover border border-gray-700"
          />
        ) : (
          <div
            className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${iconClass}`}
          >
            {icon}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.12em] text-gray-600 font-semibold">
            {label}
          </p>

          <p className="text-sm font-semibold text-gray-200 mt-1 truncate">
            {name}
          </p>

          {secondary && (
            <p className="flex items-center gap-1.5 text-xs text-gray-600 mt-1 truncate">
              {secondaryIcon}

              <span className="truncate">{secondary}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// =============================================================
// PROPERTY CARD
// =============================================================

function PropertyEntityCard({ image, name, code, address }) {
  return (
    <div className="group rounded-2xl border border-gray-800 bg-gray-800/25 hover:bg-gray-800/45 hover:border-gray-700 overflow-hidden transition-all duration-300">
      <div className="flex items-center gap-4 p-4">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-950 border border-gray-800 shrink-0">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FaHome className="text-emerald-400/70" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.12em] text-gray-600 font-semibold">
            Imóvel
          </p>

          <p className="text-sm font-semibold text-gray-200 mt-1 truncate">
            {name}
          </p>

          {code && (
            <p className="font-mono text-[11px] text-blue-400 mt-1">{code}</p>
          )}

          {address && (
            <p className="flex items-center gap-1.5 text-[11px] text-gray-600 mt-1 truncate">
              <FaMapMarkerAlt size={9} />
              {address}
            </p>
          )}
        </div>

        <FaChevronRight
          size={11}
          className="text-gray-700 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all"
        />
      </div>
    </div>
  );
}

// =============================================================
// BROKER CARD
// =============================================================

function BrokerEntityCard({
  label,
  name,
  position,
  email,
  phone,
  avatar,
  color = 'purple',
  muted = false,
}) {
  const colors = {
    purple: {
      fallback: 'bg-purple-500/10 text-purple-400 border-purple-500/10',
      badge: 'bg-purple-500/5 text-purple-400/80 border-purple-500/10',
    },
    orange: {
      fallback: 'bg-orange-500/10 text-orange-400 border-orange-500/10',
      badge: 'bg-orange-500/5 text-orange-400/80 border-orange-500/10',
    },
  };

  const theme = colors[color] || colors.purple;

  const initials = name
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <div
      className={`group rounded-2xl border p-4 transition-all duration-300 ${
        muted
          ? 'bg-gray-900/30 border-gray-800/70 opacity-60'
          : 'bg-gray-800/25 border-gray-800 hover:border-gray-700 hover:bg-gray-800/45'
      }`}
    >
      <div className="flex items-start gap-3">
        {avatar ? (
          <img
            src={avatar}
            alt={name}
            className="w-12 h-12 rounded-2xl object-cover border border-gray-700 shrink-0"
            onError={(event) => {
              event.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center font-bold text-sm shrink-0 ${theme.fallback}`}
          >
            {initials || <FaUserTie size={16} />}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.12em] text-gray-600 font-semibold">
            {label}
          </p>

          <p className="text-sm font-semibold text-gray-100 mt-1 truncate">
            {name}
          </p>

          {position && (
            <span
              className={`inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-md border text-[10px] font-medium ${theme.badge}`}
            >
              <FaUserTie size={8} />
              {position}
            </span>
          )}

          <div className="mt-2 space-y-1">
            {phone && (
              <p className="flex items-center gap-1.5 text-[11px] text-gray-600 truncate">
                <FaPhone size={9} />
                {phone}
              </p>
            )}

            {email && (
              <p className="flex items-center gap-1.5 text-[11px] text-gray-600 truncate">
                <FaEnvelope size={9} />
                {email}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================
// BROKER PROFILE
// =============================================================

function BrokerProfile({ name, position, avatar, email, phone }) {
  const initials = name
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex items-center gap-4">
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className="w-16 h-16 rounded-2xl object-cover border border-gray-700 shadow-lg"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/10 flex items-center justify-center text-purple-400 font-bold text-lg">
          {initials || <FaUserTie />}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-white truncate">{name}</p>

        <p className="text-xs text-purple-400 mt-1">{position}</p>

        {phone && (
          <p className="flex items-center gap-1.5 text-[11px] text-gray-600 mt-2">
            <FaPhone size={9} />
            {phone}
          </p>
        )}

        {email && (
          <p className="flex items-center gap-1.5 text-[11px] text-gray-600 mt-1 truncate">
            <FaEnvelope size={9} />
            {email}
          </p>
        )}
      </div>
    </div>
  );
}

// =============================================================
// TIMELINE
// =============================================================

function TimelineItem({
  title,
  date,
  icon,
  active = false,
  success = false,
  danger = false,
}) {
  if (!date) return null;

  return (
    <div className="relative flex gap-4">
      <div className="relative flex flex-col items-center">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
            danger
              ? 'bg-red-500/10 border-red-500/20 text-red-400'
              : success
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
          }`}
        >
          {icon}
        </div>

        <div className="w-px h-full bg-gray-800 absolute top-9" />
      </div>

      <div className="pb-7">
        <p
          className={`text-sm font-medium ${
            danger
              ? 'text-red-400'
              : success
                ? 'text-emerald-400'
                : 'text-gray-200'
          }`}
        >
          {title}
        </p>

        <p className="text-xs text-gray-600 mt-1">
          {new Date(date).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}

// =============================================================
// FINANCIAL ROW
// =============================================================

function FinancialRow({ label, value, strong = false, accent = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-gray-500">{label}</span>

      <span
        className={`text-sm ${
          strong
            ? 'font-bold text-white'
            : accent
              ? 'font-bold text-emerald-400'
              : 'font-medium text-gray-300'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

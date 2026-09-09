// src/components/admin/CommissionApproveModal.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  FaTimes,
  FaCheck,
  FaUser,
  FaUserPlus,
  FaBuilding,
  FaMoneyBillWave,
  FaEdit,
  FaSave,
  FaHome,
  FaPhone,
  FaEnvelope,
  FaReceipt,
  FaPercentage,
  FaExclamationTriangle,
  FaLightbulb,
  FaUndo,
} from 'react-icons/fa';

import { toast } from 'react-toastify';

import { commissionService } from '../../service/commissionService';

// =========================================================
// HELPERS
// =========================================================

const formatCurrency = (value) => {
  const safeValue = Number(value) || 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(safeValue);
};

const formatPercentage = (value) => {
  const safeValue = Number(value) || 0;
  return `${safeValue}%`;
};

export default function CommissionApproveModal({ sale, onClose, onSuccess }) {
  const [commission, setCommission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const navigate = useNavigate();

  const [editData, setEditData] = useState({
    totalPercentage: 0,
    sellerPercentage: 0,
    capturerPercentage: 0,
    companyPercentage: 0,
  });

  // =========================================================
  // NORMALIZA ID
  // =========================================================

  const getObjectId = (value) => {
    if (!value) return null;

    if (typeof value === 'string') return value;

    return value._id || value.id || null;
  };

  // =========================================================
  // INICIAIS
  // =========================================================

  const getInitials = (name) => {
    if (!name) return '??';

    return String(name)
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  };

  // =========================================================
  // NORMALIZA IMAGEM
  // =========================================================

  const getImageUrl = (image) => {
    if (!image) return null;

    if (typeof image === 'string') {
      return image.trim() || null;
    }

    if (typeof image === 'object') {
      return (
        image.url ||
        image.secure_url ||
        image.secureUrl ||
        image.path ||
        image.src ||
        image.location ||
        image.imageUrl ||
        image.publicUrl ||
        image.original ||
        null
      );
    }

    return null;
  };

  // =========================================================
  // OBTÉM IMAGEM DO IMÓVEL
  // =========================================================

  const getPropertyImage = (property) => {
    if (!property) return null;

    const candidates = [
      property.mainImage,
      property.coverImage,
      property.thumbnail,
      property.image,
      property.photo,
      property.images?.[0],
      property.photos?.[0],
      property.gallery?.[0],
      property.media?.[0],
      property.photos?.[0]?.url,
      property.images?.[0]?.url,
    ];

    for (const candidate of candidates) {
      const url = getImageUrl(candidate);

      if (url) {
        return url;
      }
    }

    return null;
  };

  // =========================================================
  // AVATAR DO CORRETOR
  // =========================================================

  const getBrokerAvatar = (broker) => {
    if (!broker) return null;

    const candidates = [
      broker.avatar,
      broker.photo,
      broker.profileImage,
      broker.profilePhoto,
      broker.image,
      broker.picture,
    ];

    for (const candidate of candidates) {
      const url = getImageUrl(candidate);

      if (url) return url;
    }

    return null;
  };

  // =========================================================
  // POSIÇÃO DO CORRETOR
  // =========================================================

  const getBrokerPosition = (broker, fallback) => {
    if (!broker) return fallback;

    return (
      broker.position ||
      broker.role ||
      broker.jobTitle ||
      broker.title ||
      broker.cargo ||
      fallback
    );
  };

  // =========================================================
  // TELEFONE
  // =========================================================

  const getBrokerPhone = (broker) => {
    if (!broker) return null;

    return broker.phone || broker.mobile || broker.whatsapp || null;
  };

  // =========================================================
  // NORMALIZA IMÓVEL
  // =========================================================

  const normalizedProperty = useMemo(() => {
    const commissionProperty = commission?.property || {};
    const saleProperty = sale?.property || {};

    const merged = {
      ...commissionProperty,
      ...saleProperty,

      _id:
        saleProperty?._id ||
        saleProperty?.id ||
        commissionProperty?._id ||
        commissionProperty?.id,

      id:
        saleProperty?.id ||
        saleProperty?._id ||
        commissionProperty?.id ||
        commissionProperty?._id,

      name:
        saleProperty?.name ||
        saleProperty?.title ||
        commissionProperty?.name ||
        commissionProperty?.title,

      title:
        saleProperty?.title ||
        saleProperty?.name ||
        commissionProperty?.title ||
        commissionProperty?.name,

      mainImage:
        saleProperty?.mainImage || commissionProperty?.mainImage || null,

      coverImage:
        saleProperty?.coverImage || commissionProperty?.coverImage || null,

      images: saleProperty?.images?.length
        ? saleProperty.images
        : commissionProperty?.images || [],

      photos: saleProperty?.photos?.length
        ? saleProperty.photos
        : commissionProperty?.photos || [],

      gallery: saleProperty?.gallery?.length
        ? saleProperty.gallery
        : commissionProperty?.gallery || [],

      fullAddress:
        saleProperty?.fullAddress || commissionProperty?.fullAddress || '',

      code:
        saleProperty?.code ||
        saleProperty?.formattedCode ||
        commissionProperty?.code ||
        commissionProperty?.formattedCode ||
        null,
    };

    return merged;
  }, [commission, sale]);

  // =========================================================
  // IMAGEM DO IMÓVEL
  // =========================================================

  const propertyImage = useMemo(() => {
    return getPropertyImage(normalizedProperty);
  }, [normalizedProperty]);

  // =========================================================
  // NORMALIZA DADOS DA COMISSÃO
  // =========================================================

  const getEditDataFromCommission = (commissionData) => {
    const distribution = commissionData?.distribution || {};

    return {
      totalPercentage: Number(commissionData?.totalPercentage) || 0,

      sellerPercentage: Number(distribution?.seller?.percentage) || 0,

      capturerPercentage: Number(distribution?.capturer?.percentage) || 0,

      companyPercentage: Number(distribution?.company?.percentage) || 0,
    };
  };

  // =========================================================
  // SUGESTÃO DE DISTRIBUIÇÃO
  // =========================================================

  const suggestDistribution = () => {
    const hasCapturer = Boolean(
      commission?.capturerBroker || sale?.acquisitionBroker,
    );

    let suggestion;

    if (hasCapturer) {
      suggestion = {
        totalPercentage: 5,
        sellerPercentage: 60,
        capturerPercentage: 30,
        companyPercentage: 10,
      };
    } else {
      suggestion = {
        totalPercentage: 5,
        sellerPercentage: 100,
        capturerPercentage: 0,
        companyPercentage: 0,
      };
    }

    setEditData(suggestion);
    setShowSuggestions(false);
    toast.info('Distribuição sugerida aplicada!');
  };

  // =========================================================
  // PRESETS DE DISTRIBUIÇÃO
  // =========================================================

  const presets = useMemo(() => {
    const hasCapturer = Boolean(
      commission?.capturerBroker || sale?.acquisitionBroker,
    );

    if (!hasCapturer) {
      return [{ label: '100% Vendedor', seller: 100, capturer: 0, company: 0 }];
    }

    return [
      { label: '60/30/10', seller: 60, capturer: 30, company: 10 },
      { label: '70/20/10', seller: 70, capturer: 20, company: 10 },
      { label: '50/30/20', seller: 50, capturer: 30, company: 20 },
      { label: '80/10/10', seller: 80, capturer: 10, company: 10 },
    ];
  }, [commission, sale]);

  const applyPreset = (preset) => {
    setEditData({
      totalPercentage: editData.totalPercentage || 5,
      sellerPercentage: preset.seller,
      capturerPercentage: preset.capturer,
      companyPercentage: preset.company,
    });
    setShowSuggestions(false);
    toast.info(`Preset "${preset.label}" aplicado!`);
  };

  // =========================================================
  // BUSCA COMISSÃO
  // =========================================================

  useEffect(() => {
    if (!sale?._id) {
      setLoading(false);
      return;
    }

    const fetchCommission = async () => {
      try {
        setLoading(true);
        setError(null);

        let commissionData = null;

        try {
          const response = await commissionService.getAll({
            sale: sale._id,
          });

          console.log('🔎 COMMISSION API:', response);

          if (response?.data && response.data.length > 0) {
            commissionData = response.data[0];

            console.log('🔎 COMMISSION DATA:', commissionData);

            console.log('🏠 PROPERTY DA COMISSÃO:', commissionData?.property);

            console.log('🏠 PROPERTY DA VENDA:', sale?.property);
          }
        } catch (err) {
          if (err.response?.status !== 404) {
            console.error('Erro ao buscar comissão:', err);
          }
        }

        // =====================================================
        // COMISSÃO EXISTENTE
        // =====================================================

        if (commissionData) {
          setCommission(commissionData);

          setEditData(getEditDataFromCommission(commissionData));

          return;
        }

        // =====================================================
        // COMISSÃO NOVA
        // =====================================================

        const saleCommission = sale.commission || {};

        const acquisitionBroker =
          sale.acquisitionBroker || sale.capturerBroker || null;

        const hasCapturer = Boolean(getObjectId(acquisitionBroker));

        const totalPercentage = Number(saleCommission.totalPercentage) || 5;

        let sellerPercentage = Number(saleCommission.seller?.percentage) || 0;

        let capturerPercentage =
          Number(saleCommission.acquisition?.percentage) || 0;

        let companyPercentage = Number(saleCommission.company?.percentage) || 0;

        if (
          sellerPercentage === 0 &&
          capturerPercentage === 0 &&
          companyPercentage === 0
        ) {
          if (hasCapturer) {
            sellerPercentage = 60;
            capturerPercentage = 30;
            companyPercentage = 10;
          } else {
            sellerPercentage = 100;
            capturerPercentage = 0;
            companyPercentage = 0;
          }
        }

        const saleAmount = Number(sale.saleAmount) || 0;

        const totalAmount = saleAmount * (totalPercentage / 100);

        commissionData = {
          _id: 'new',

          sale: sale._id,

          lead: sale.lead,

          property: sale.property || null,

          sellerBroker: sale.sellerBroker || null,

          capturerBroker: acquisitionBroker,

          saleAmount,

          totalPercentage,

          totalAmount,

          distribution: {
            seller: {
              percentage: sellerPercentage,
              amount: totalAmount * (sellerPercentage / 100),
            },

            capturer: {
              percentage: capturerPercentage,
              amount: totalAmount * (capturerPercentage / 100),
            },

            company: {
              percentage: companyPercentage,
              amount: totalAmount * (companyPercentage / 100),
            },
          },

          status: 'pending',
        };

        setCommission(commissionData);

        setEditData(getEditDataFromCommission(commissionData));
      } catch (err) {
        console.error('Erro ao buscar comissão:', err);

        setError('Erro ao carregar dados da comissão');
      } finally {
        setLoading(false);
      }
    };

    fetchCommission();
  }, [sale]);

  // =========================================================
  // CÁLCULO
  // =========================================================

  const calculated = useMemo(() => {
    const saleAmount = Number(sale?.saleAmount) || 0;

    const totalPercentage = Number(editData?.totalPercentage) || 0;

    const sellerPercentage = Number(editData?.sellerPercentage) || 0;

    const capturerPercentage = Number(editData?.capturerPercentage) || 0;

    const companyPercentage = Number(editData?.companyPercentage) || 0;

    const totalAmount = saleAmount * (totalPercentage / 100);

    return {
      totalAmount,

      sellerAmount: totalAmount * (sellerPercentage / 100),

      capturerAmount: totalAmount * (capturerPercentage / 100),

      companyAmount: totalAmount * (companyPercentage / 100),
    };
  }, [sale, editData]);

  // =========================================================
  // DISTRIBUIÇÃO
  // =========================================================

  const distributionTotal =
    Number(editData.sellerPercentage || 0) +
    Number(editData.capturerPercentage || 0) +
    Number(editData.companyPercentage || 0);

  const distributionIsValid = Math.abs(distributionTotal - 100) <= 0.001;

  // =========================================================
  // SALVAR
  // =========================================================

  const handleSave = async () => {
    if (!distributionIsValid) {
      setError(
        `A distribuição da comissão deve totalizar 100%. Atualmente: ${distributionTotal}%`,
      );

      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await commissionService.generateFromSale(sale._id, {
        totalPercentage: Number(editData.totalPercentage) || 0,

        sellerPercentage: Number(editData.sellerPercentage) || 0,

        capturerPercentage: Number(editData.capturerPercentage) || 0,

        companyPercentage: Number(editData.companyPercentage) || 0,
      });

      if (response?.data) {
        setCommission(response.data);

        setEditData(getEditDataFromCommission(response.data));
      } else {
        setCommission((previous) => ({
          ...previous,

          totalPercentage: editData.totalPercentage,

          totalAmount: calculated.totalAmount,

          distribution: {
            seller: {
              percentage: editData.sellerPercentage,

              amount: calculated.sellerAmount,
            },

            capturer: {
              percentage: editData.capturerPercentage,

              amount: calculated.capturerAmount,
            },

            company: {
              percentage: editData.companyPercentage,

              amount: calculated.companyAmount,
            },
          },

          status: previous?.status || 'pending',
        }));
      }

      setEditMode(false);

      onSuccess?.();

      toast.success('✅ Comissão salva com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar comissão:', err);

      setError(err.response?.data?.message || 'Erro ao salvar comissão');
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // APROVAR
  // =========================================================

  const handleApprove = async () => {
    if (!commission || commission._id === 'new') {
      setError('Salve a comissão antes de aprovar');

      return;
    }

    if (!window.confirm('Confirmar aprovação da comissão?')) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await commissionService.approve(commission._id);

      if (response?.data) {
        setCommission(response.data);
      } else {
        setCommission((previous) => ({
          ...previous,
          status: 'approved',
        }));
      }

      toast.success('✅ Comissão aprovada com sucesso!');

      onSuccess?.();
    } catch (err) {
      console.error('Erro ao aprovar comissão:', err);

      setError(err.response?.data?.message || 'Erro ao aprovar comissão');
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DADOS NORMALIZADOS DA TELA
  // =========================================================

  const lead = commission?.lead || sale?.lead || null;

  const leadName = lead?.name || 'Cliente não informado';

  const property = normalizedProperty;

  const propertyTitle =
    property?.name ||
    property?.title ||
    property?.description ||
    'Imóvel não informado';

  const propertyCode =
    property?.code ||
    property?.formattedCode ||
    property?.reference ||
    property?.ref ||
    null;

  const saleNumber = commission?.sale?.saleNumber || sale?.saleNumber || 'N/A';

  const saleAmount = commission?.sale?.saleAmount ?? sale?.saleAmount ?? 0;

  const sellerBroker = commission?.sellerBroker || sale?.sellerBroker || null;

  const capturerBroker =
    commission?.capturerBroker || sale?.acquisitionBroker || null;

  const hasCapturer =
    Boolean(capturerBroker) || Number(editData.capturerPercentage) > 0;

  const isEditable =
    commission?.status === 'pending' || commission?._id === 'new';

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div className="w-full max-w-md bg-[#11151f] border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-800 rounded-lg w-48 mx-auto" />
            <div className="h-20 bg-gray-800 rounded-xl" />
            <div className="h-16 bg-gray-800 rounded-xl" />
            <div className="h-16 bg-gray-800 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-5">
      <div className="relative w-full max-w-5xl max-h-[94vh] bg-[#0d1119] border border-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* HEADER */}
        <header className="shrink-0 px-5 sm:px-7 py-5 border-b border-gray-800 bg-[#11151f]/95">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <FaMoneyBillWave className="text-emerald-400 text-lg" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    Gerenciar Comissão
                  </h2>

                  {commission && commission._id !== 'new' && (
                    <CommissionStatus status={commission.status} />
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  Venda{' '}
                  <span className="font-mono text-blue-400">{saleNumber}</span>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-gray-800 transition-all"
              aria-label="Fechar"
            >
              <FaTimes size={16} />
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-7 space-y-6">
            {/* HERO DA VENDA */}
            <section className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900/90 via-gray-900/60 to-gray-950/90">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative p-4 sm:p-5">
                <div className="flex flex-col lg:flex-row gap-5">
                  {/* IMÓVEL */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="relative w-24 h-20 sm:w-32 sm:h-24 shrink-0 rounded-xl overflow-hidden border border-gray-700 bg-gray-800">
                      {propertyImage ? (
                        <img
                          src={propertyImage}
                          alt={propertyTitle}
                          className="w-full h-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                          <FaHome className="text-gray-600 text-2xl" />
                        </div>
                      )}

                      <div className="absolute bottom-0 left-0 right-0 h-7 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-gray-600 font-semibold">
                        Imóvel negociado
                      </p>

                      <h3 className="text-base sm:text-lg font-bold text-white mt-1 truncate">
                        {propertyTitle}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        {propertyCode && (
                          <span className="text-xs font-mono text-gray-500">
                            Ref. {propertyCode}
                          </span>
                        )}

                        {propertyCode && (
                          <span className="text-gray-700">•</span>
                        )}

                        <span className="text-xs text-gray-500">
                          {leadName}
                        </span>
                      </div>

                      {property?.fullAddress && (
                        <p className="text-[11px] text-gray-600 mt-1.5 truncate max-w-xl">
                          {property.fullAddress}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* VALOR */}
                  <div className="lg:min-w-[220px] lg:border-l lg:border-gray-800 lg:pl-5 flex items-center lg:justify-end">
                    <div className="lg:text-right">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-gray-600 font-semibold">
                        Valor da venda
                      </p>

                      <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                        {formatCurrency(saleAmount)}
                      </p>

                      <p className="text-xs text-gray-600 mt-1">
                        Valor final negociado
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* PARTICIPANTES */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Participantes da comissão
                  </h3>

                  <p className="text-xs text-gray-600 mt-0.5">
                    Profissionais envolvidos na negociação
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BrokerCard
                  label="Corretor vendedor"
                  broker={sellerBroker}
                  fallbackName="Vendedor não informado"
                  fallbackPosition="Corretor"
                  accent="blue"
                />

                {hasCapturer ? (
                  <BrokerCard
                    label="Corretor captador"
                    broker={capturerBroker}
                    fallbackName="Captador vinculado"
                    fallbackPosition="Captador"
                    accent="purple"
                  />
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-800 bg-gray-900/30 p-4 flex items-center gap-3 opacity-70">
                    <div className="w-11 h-11 rounded-xl bg-gray-800 flex items-center justify-center">
                      <FaUserPlus className="text-gray-600" />
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-gray-600 font-semibold">
                        Corretor captador
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        Nenhum captador vinculado
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* INFORMAÇÕES DA VENDA */}
            <section className="rounded-2xl border border-gray-800 bg-gray-900/50 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <FaReceipt className="text-blue-400 text-sm" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Informações da venda
                  </h3>

                  <p className="text-xs text-gray-600">
                    Dados utilizados para o cálculo da comissão
                  </p>
                </div>
              </div>

              <div className="p-5 grid grid-cols-2 lg:grid-cols-4 gap-5">
                <InfoBlock label="Venda" value={saleNumber} mono accent />

                <InfoBlock label="Cliente" value={leadName} />

                <InfoBlock
                  label="Valor negociado"
                  value={formatCurrency(saleAmount)}
                  strong
                />

                <InfoBlock label="Imóvel" value={propertyTitle} />
              </div>
            </section>

            {/* DISTRIBUIÇÃO */}
            <section className="rounded-2xl border border-gray-800 bg-gray-900/50 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Distribuição da comissão
                  </h3>

                  <p className="text-xs text-gray-600 mt-0.5">
                    Defina como a comissão será dividida entre os participantes
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {isEditable && (
                    <>
                      <button
                        onClick={() => setShowSuggestions(!showSuggestions)}
                        className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-xs font-semibold transition-all"
                      >
                        <FaLightbulb size={12} />
                        Sugerir
                      </button>

                      <button
                        onClick={() => {
                          setEditMode((previous) => !previous);
                          setError(null);
                          setShowSuggestions(false);
                        }}
                        className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs font-semibold text-gray-300 hover:text-white transition-all"
                      >
                        {editMode ? <FaSave size={12} /> : <FaEdit size={12} />}

                        {editMode ? 'Visualizar' : 'Editar distribuição'}
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* SUGGESTIONS PANEL */}
              {showSuggestions && isEditable && (
                <div className="px-5 py-4 border-b border-gray-800 bg-amber-500/5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-amber-400">
                        💡 Sugestões de distribuição
                      </p>

                      <p className="text-[11px] text-gray-600 mt-0.5">
                        Selecione um preset ou aplique uma sugestão automática
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={suggestDistribution}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 text-xs font-medium transition-all"
                      >
                        <FaUndo size={10} />
                        Sugestão automática
                      </button>

                      {presets.map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => applyPreset(preset)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white text-xs font-medium transition-all"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="p-5">
                {editMode && isEditable ? (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <PercentageInput
                        label="Comissão total"
                        value={editData.totalPercentage}
                        onChange={(value) =>
                          setEditData((previous) => ({
                            ...previous,
                            totalPercentage: value,
                          }))
                        }
                        accent="emerald"
                        large
                      />

                      <div className="rounded-xl bg-gray-950/60 border border-gray-800 p-4 flex flex-col justify-center">
                        <p className="text-[10px] uppercase tracking-wider text-gray-600">
                          Valor da comissão
                        </p>

                        <p className="text-xl font-bold text-emerald-400 mt-1">
                          {formatCurrency(calculated.totalAmount)}
                        </p>

                        <p className="text-xs text-gray-600 mt-1">
                          Sobre {formatCurrency(saleAmount)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <PercentageInput
                        label="Vendedor"
                        value={editData.sellerPercentage}
                        onChange={(value) =>
                          setEditData((previous) => ({
                            ...previous,
                            sellerPercentage: value,
                          }))
                        }
                        accent="blue"
                      />

                      <PercentageInput
                        label="Captador"
                        value={editData.capturerPercentage}
                        onChange={(value) =>
                          setEditData((previous) => ({
                            ...previous,
                            capturerPercentage: value,
                          }))
                        }
                        accent="purple"
                        disabled={!hasCapturer}
                      />

                      <PercentageInput
                        label="Imobiliária"
                        value={editData.companyPercentage}
                        onChange={(value) =>
                          setEditData((previous) => ({
                            ...previous,
                            companyPercentage: value,
                          }))
                        }
                        accent="emerald"
                      />
                    </div>

                    <DistributionValidation
                      total={distributionTotal}
                      valid={distributionIsValid}
                    />

                    <button
                      onClick={handleSave}
                      disabled={saving || !distributionIsValid}
                      className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-950/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <FaSave size={13} />

                      {saving ? 'Salvando comissão...' : 'Salvar distribuição'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <DistributionCard
                        label="Vendedor"
                        broker={sellerBroker}
                        icon={FaUser}
                        amount={calculated?.sellerAmount ?? 0}
                        percentage={editData?.sellerPercentage ?? 0}
                        accent="blue"
                      />

                      {hasCapturer ? (
                        <DistributionCard
                          label="Captador"
                          broker={capturerBroker}
                          icon={FaUserPlus}
                          amount={calculated?.capturerAmount ?? 0}
                          percentage={editData?.capturerPercentage ?? 0}
                          accent="purple"
                        />
                      ) : (
                        <DistributionCard
                          label="Captador"
                          icon={FaUserPlus}
                          amount={0}
                          percentage={0}
                          accent="gray"
                          muted
                        />
                      )}

                      <DistributionCard
                        label="Imobiliária"
                        icon={FaBuilding}
                        amount={calculated?.companyAmount ?? 0}
                        percentage={editData?.companyPercentage ?? 0}
                        accent="emerald"
                      />
                    </div>

                    <DistributionBar
                      seller={editData.sellerPercentage}
                      capturer={hasCapturer ? editData.capturerPercentage : 0}
                      company={editData.companyPercentage}
                    />

                    <div className="rounded-xl bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent border border-emerald-500/10 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.15em] text-gray-600 font-semibold">
                            Comissão total
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            {formatPercentage(editData.totalPercentage)} sobre o
                            valor da venda
                          </p>
                        </div>

                        <p className="text-2xl font-bold text-emerald-400">
                          {formatCurrency(calculated.totalAmount)}
                        </p>
                      </div>
                    </div>

                    {/* RESUMO DA DISTRIBUIÇÃO */}
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <div className="text-center p-2 rounded-lg bg-blue-500/5 border border-blue-500/10">
                        <p className="text-[10px] text-gray-600">Vendedor</p>
                        <p className="text-sm font-bold text-blue-400">
                          {formatPercentage(editData.sellerPercentage)}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {formatCurrency(calculated.sellerAmount)}
                        </p>
                      </div>

                      <div className="text-center p-2 rounded-lg bg-purple-500/5 border border-purple-500/10">
                        <p className="text-[10px] text-gray-600">Captador</p>
                        <p className="text-sm font-bold text-purple-400">
                          {hasCapturer
                            ? formatPercentage(editData.capturerPercentage)
                            : '—'}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {hasCapturer
                            ? formatCurrency(calculated.capturerAmount)
                            : '—'}
                        </p>
                      </div>

                      <div className="text-center p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                        <p className="text-[10px] text-gray-600">Imobiliária</p>
                        <p className="text-sm font-bold text-emerald-400">
                          {formatPercentage(editData.companyPercentage)}
                        </p>
                        <p className="text-[10px] text-gray-500">
                          {formatCurrency(calculated.companyAmount)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* ERRO */}
            {error && (
              <div className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4">
                <FaExclamationTriangle className="text-red-400 mt-0.5 shrink-0" />

                <div>
                  <p className="text-sm font-semibold text-red-400">
                    Não foi possível concluir a operação
                  </p>

                  <p className="text-xs text-red-300/80 mt-1">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <footer className="shrink-0 px-5 sm:px-7 py-4 border-t border-gray-800 bg-[#11151f]/95">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-xs text-gray-600">
              {commission?.status === 'approved'
                ? 'Esta comissão já foi aprovada.'
                : commission?.status === 'paid'
                  ? 'Esta comissão já foi paga.'
                  : 'Revise a distribuição antes de aprovar.'}
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2">
              <button
                onClick={onClose}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white text-sm font-semibold transition-all"
              >
                <FaTimes size={12} />
                Fechar
              </button>

              {commission &&
                commission._id !== 'new' &&
                commission.status === 'pending' && (
                  <button
                    onClick={handleApprove}
                    disabled={saving || editMode || !distributionIsValid}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-950/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <FaCheck size={13} />

                    {saving ? 'Aprovando...' : 'Aprovar comissão'}
                  </button>
                )}

              {commission &&
                commission._id !== 'new' &&
                commission.status === 'approved' && (
                  <button
                    onClick={() => navigate('/commissions')}
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold shadow-lg shadow-emerald-950/20 transition-all disabled:opacity-40"
                  >
                    <FaMoneyBillWave size={13} />
                    Marcar como paga
                  </button>
                )}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// =============================================================
// BROKER CARD
// =============================================================

function BrokerCard({
  label,
  broker,
  fallbackName,
  fallbackPosition,
  accent = 'blue',
}) {
  const name = broker?.name || fallbackName;

  const position = getBrokerPosition(broker, fallbackPosition);

  const avatar = getBrokerAvatar(broker);

  const phone = getBrokerPhone(broker);

  const email = broker?.email;

  const accentMap = {
    blue: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/10',
      text: 'text-blue-400',
      glow: 'bg-blue-500/5',
    },

    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/10',
      text: 'text-purple-400',
      glow: 'bg-purple-500/5',
    },
  };

  const theme = accentMap[accent] || accentMap.blue;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/50 p-4">
      <div
        className={`absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl ${theme.glow}`}
      />

      <div className="relative flex items-center gap-4">
        <div className="relative shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-14 h-14 rounded-2xl object-cover border border-gray-700"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div
              className={`w-14 h-14 rounded-2xl ${theme.bg} border ${theme.border} flex items-center justify-center`}
            >
              <span className={`text-sm font-bold ${theme.text}`}>
                {getInitials(name)}
              </span>
            </div>
          )}

          <div
            className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ${theme.bg} border-2 border-[#11151f] flex items-center justify-center`}
          >
            <FaUser className={`${theme.text} text-[8px]`} />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.15em] text-gray-600 font-semibold">
            {label}
          </p>

          <p className="text-sm font-bold text-white mt-1 truncate">{name}</p>

          <p className={`text-xs ${theme.text} mt-0.5`}>{position}</p>

          <div className="flex flex-wrap items-center gap-3 mt-2">
            {phone && (
              <span className="inline-flex items-center gap-1.5 text-[10px] text-gray-600">
                <FaPhone size={8} />
                {phone}
              </span>
            )}

            {email && (
              <span className="inline-flex items-center gap-1.5 text-[10px] text-gray-600 truncate max-w-[180px]">
                <FaEnvelope size={8} />
                {email}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================
// DISTRIBUTION CARD (CORRIGIDO)
// =============================================================

function DistributionCard({
  label,
  broker,
  icon: Icon,
  amount,
  percentage,
  accent,
  muted = false,
}) {
  // 🔥 VALORES PADRÃO PARA EVITAR ERROS
  const safeAmount = Number(amount) || 0;
  const safePercentage = Number(percentage) || 0;
  const safeLabel = label || 'Distribuição';

  const themes = {
    blue: {
      card: 'bg-blue-500/5 border-blue-500/10',
      icon: 'bg-blue-500/10 border-blue-500/10',
      text: 'text-blue-400',
    },
    purple: {
      card: 'bg-purple-500/5 border-purple-500/10',
      icon: 'bg-purple-500/10 border-purple-500/10',
      text: 'text-purple-400',
    },
    emerald: {
      card: 'bg-emerald-500/5 border-emerald-500/10',
      icon: 'bg-emerald-500/10 border-emerald-500/10',
      text: 'text-emerald-400',
    },
    gray: {
      card: 'bg-gray-800/20 border-gray-800',
      icon: 'bg-gray-800 border-gray-700',
      text: 'text-gray-600',
    },
  };

  const theme = themes[accent] || themes.gray;

  // 🔥 VERIFICAR SE O ÍCONE EXISTE
  const IconComponent = Icon || FaUser;

  return (
    <div
      className={`relative min-w-0 rounded-2xl border p-4 sm:p-5 transition-all ${theme.card} ${
        muted ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`w-10 h-10 shrink-0 rounded-xl border flex items-center justify-center ${theme.icon}`}
        >
          <IconComponent className={`${theme.text} text-sm`} />
        </div>

        <span className={`text-xs font-bold ${theme.text}`}>
          {formatPercentage(safePercentage)}
        </span>
      </div>

      <div className="mt-4 min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-gray-600 font-semibold">
          {safeLabel}
        </p>

        {broker?.name && (
          <p className="text-xs text-gray-500 mt-1 truncate">{broker.name}</p>
        )}

        <p className="text-lg sm:text-xl font-bold text-white mt-2 truncate">
          {formatCurrency(safeAmount)}
        </p>
      </div>
    </div>
  );
}

// =============================================================
// PERCENTAGE INPUT
// =============================================================

function PercentageInput({
  label,
  value,
  onChange,
  accent = 'blue',
  disabled = false,
  large = false,
}) {
  const accents = {
    blue: 'focus-within:border-blue-500/50',

    purple: 'focus-within:border-purple-500/50',

    emerald: 'focus-within:border-emerald-500/50',
  };

  return (
    <div
      className={`rounded-xl border border-gray-800 bg-gray-950/60 p-4 ${
        accents[accent] || accents.blue
      } ${disabled ? 'opacity-40' : ''}`}
    >
      <label className="text-[10px] uppercase tracking-wider text-gray-600 font-semibold block mb-2">
        {label}
      </label>

      <div className="relative">
        <input
          type="number"
          min="0"
          max="100"
          step="0.1"
          disabled={disabled}
          value={value}
          onChange={(event) => onChange(parseFloat(event.target.value) || 0)}
          className={`w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 pr-10 text-white font-semibold focus:border-blue-500 focus:outline-none transition-all ${
            large ? 'text-xl' : 'text-base'
          }`}
        />

        <FaPercentage className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 text-xs" />
      </div>

      {disabled && (
        <p className="text-[10px] text-gray-600 mt-2">
          Nenhum captador vinculado a esta venda
        </p>
      )}
    </div>
  );
}

// =============================================================
// DISTRIBUTION VALIDATION
// =============================================================

function DistributionValidation({ total, valid }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        valid
          ? 'bg-emerald-500/5 border-emerald-500/10'
          : 'bg-red-500/5 border-red-500/20'
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              valid ? 'bg-emerald-500/10' : 'bg-red-500/10'
            }`}
          >
            {valid ? (
              <FaCheck className="text-emerald-400 text-xs" />
            ) : (
              <FaExclamationTriangle className="text-red-400 text-xs" />
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-300">Distribuição</p>

            <p className="text-[11px] text-gray-600 mt-0.5">
              {valid
                ? 'A distribuição está equilibrada.'
                : 'A soma precisa totalizar exatamente 100%.'}
            </p>
          </div>
        </div>

        <span
          className={`text-lg font-bold ${
            valid ? 'text-emerald-400' : 'text-red-400'
          }`}
        >
          {total}%
        </span>
      </div>
    </div>
  );
}

// =============================================================
// DISTRIBUTION BAR
// =============================================================

function DistributionBar({ seller, capturer, company }) {
  return (
    <div>
      <div className="h-3 w-full rounded-full overflow-hidden flex bg-gray-800">
        {seller > 0 && (
          <div
            className="bg-blue-500 transition-all duration-500"
            style={{
              width: `${seller}%`,
            }}
          />
        )}

        {capturer > 0 && (
          <div
            className="bg-purple-500 transition-all duration-500"
            style={{
              width: `${capturer}%`,
            }}
          />
        )}

        {company > 0 && (
          <div
            className="bg-emerald-500 transition-all duration-500"
            style={{
              width: `${company}%`,
            }}
          />
        )}
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3">
        <Legend color="bg-blue-500" label="Vendedor" value={seller} />

        {capturer > 0 && (
          <Legend color="bg-purple-500" label="Captador" value={capturer} />
        )}

        <Legend color="bg-emerald-500" label="Imobiliária" value={company} />
      </div>
    </div>
  );
}

// =============================================================
// LEGEND
// =============================================================

function Legend({ color, label, value }) {
  return (
    <span className="inline-flex items-center gap-2 text-[11px] text-gray-500">
      <span className={`w-2 h-2 rounded-full ${color}`} />

      {label}

      <strong className="text-gray-300">{value}%</strong>
    </span>
  );
}

// =============================================================
// INFO BLOCK
// =============================================================

function InfoBlock({
  label,
  value,
  mono = false,
  accent = false,
  strong = false,
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] uppercase tracking-wider text-gray-600 font-semibold">
        {label}
      </p>

      <p
        className={`mt-1.5 text-sm truncate ${mono ? 'font-mono' : ''} ${
          accent
            ? 'text-blue-400'
            : strong
              ? 'font-bold text-white'
              : 'text-gray-300'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

// =============================================================
// STATUS
// =============================================================

function CommissionStatus({ status }) {
  const config = {
    pending: {
      label: 'Pendente',
      className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    },

    approved: {
      label: 'Aprovada',
      className: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },

    paid: {
      label: 'Paga',
      className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },

    cancelled: {
      label: 'Cancelada',
      className: 'bg-red-500/10 text-red-400 border-red-500/20',
    },
  };

  const item = config[status] || {
    label: status || 'Indefinido',
    className: 'bg-gray-800 text-gray-400 border-gray-700',
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${item.className}`}
    >
      {item.label}
    </span>
  );
}

// =============================================================
// GLOBAL HELPERS
// =============================================================

function getInitials(name) {
  if (!name) return '??';

  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

// =============================================================
// AVATAR
// =============================================================

function getBrokerAvatar(broker) {
  if (!broker) return null;

  const image =
    broker.avatar ||
    broker.photo ||
    broker.profileImage ||
    broker.profilePhoto ||
    broker.image ||
    broker.picture;

  if (!image) return null;

  if (typeof image === 'string') {
    return image.trim() || null;
  }

  return (
    image.url ||
    image.secure_url ||
    image.secureUrl ||
    image.path ||
    image.src ||
    image.location ||
    image.imageUrl ||
    image.publicUrl ||
    null
  );
}

// =============================================================
// POSITION
// =============================================================

function getBrokerPosition(broker, fallback) {
  if (!broker) return fallback;

  return (
    broker.position ||
    broker.role ||
    broker.jobTitle ||
    broker.title ||
    broker.cargo ||
    fallback
  );
}

// =============================================================
// PHONE
// =============================================================

function getBrokerPhone(broker) {
  if (!broker) return null;

  return broker.phone || broker.mobile || broker.whatsapp || null;
}

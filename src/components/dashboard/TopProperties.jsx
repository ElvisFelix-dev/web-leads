import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  TrendingUp,
  Eye,
  MessageCircle,
  Heart,
  Home,
  Building2,
  MapPin,
  DollarSign,
  Star,
  ChevronRight,
  Sparkles,
  Trophy,
  Medal,
  Crown,
  RefreshCw,
} from 'lucide-react';

import { toast } from 'react-toastify';

import api from '../../service/api';

const MAX_PROPERTIES = 3;

/* =========================================================
   HELPERS
========================================================= */

const getPropertyStats = (property) => {
  const statistics = property?.statistics || {};

  const views = Number(
    statistics.views ??
      statistics.totalViews ??
      property?.views ??
      property?.totalViews ??
      0,
  );

  const contacts = Number(
    statistics.contacts ??
      statistics.totalContacts ??
      property?.contacts ??
      property?.totalContacts ??
      0,
  );

  const favorites = Number(
    statistics.favorites ??
      statistics.totalFavorites ??
      property?.favorites ??
      property?.totalFavorites ??
      0,
  );

  let conversionRate = Number(
    statistics.conversionRate ?? property?.conversionRate ?? 0,
  );

  if (!conversionRate && views > 0) {
    conversionRate = (contacts / views) * 100;
  }

  return {
    views,
    contacts,
    favorites,
    conversionRate,
  };
};

const normalizeImage = (property) => {
  const image =
    property?.mainImage ||
    property?.coverImage ||
    property?.image ||
    property?.images?.[0]?.url ||
    property?.images?.[0] ||
    property?.photos?.[0]?.url ||
    property?.photos?.[0];

  return typeof image === 'string' ? image : '';
};

/* =========================================================
   FORMATTERS
========================================================= */

const formatCurrency = (value) => {
  const number = Number(value || 0);

  if (!number) {
    return 'Consultar';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(number);
};

const formatNumber = (value) => {
  return new Intl.NumberFormat('pt-BR').format(Number(value || 0));
};

const formatPercentage = (value) => {
  return `${Number(value || 0)
    .toFixed(1)
    .replace('.', ',')}%`;
};

/* =========================================================
   STATUS
========================================================= */

const STATUS_CONFIG = {
  disponivel: {
    label: 'Disponível',
    className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
  },

  vendido: {
    label: 'Vendido',
    className: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
  },

  reservado: {
    label: 'Reservado',
    className: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
  },

  alugado: {
    label: 'Alugado',
    className: 'border-violet-500/20 bg-violet-500/10 text-violet-400',
  },
};

const getStatusConfig = (status) => {
  return (
    STATUS_CONFIG[String(status || '').toLowerCase()] || {
      label: status || 'Indefinido',
      className: 'border-slate-700 bg-slate-800/50 text-slate-400',
    }
  );
};

/* =========================================================
   RANK
========================================================= */

const getRankConfig = (rank) => {
  if (rank === 1) {
    return {
      icon: Crown,
      label: '1º',
      iconClass: 'text-amber-300',
      badge: 'border-amber-400/20 bg-amber-400/10',
      numberClass: 'text-amber-300',
    };
  }

  if (rank === 2) {
    return {
      icon: Medal,
      label: '2º',
      iconClass: 'text-slate-300',
      badge: 'border-slate-400/20 bg-slate-400/10',
      numberClass: 'text-slate-300',
    };
  }

  return {
    icon: Medal,
    label: '3º',
    iconClass: 'text-orange-300',
    badge: 'border-orange-400/20 bg-orange-400/10',
    numberClass: 'text-orange-300',
  };
};

/* =========================================================
   COMPONENT
========================================================= */

export default function TopProperties() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [properties, setProperties] = useState([]);

  const [stats, setStats] = useState({
    totalViews: 0,
    totalContacts: 0,
    totalFavorites: 0,
    conversionRate: 0,
  });

  const [timeRange, setTimeRange] = useState('30');

  const [sortBy, setSortBy] = useState('views');

  const [filterType, setFilterType] = useState('todos');

  const [meta, setMeta] = useState({});

  /* =========================================================
     LOAD
  ========================================================= */

  useEffect(() => {
    loadTopProperties();
  }, [timeRange, sortBy, filterType]);

  const loadTopProperties = async () => {
    try {
      setLoading(true);

      const response = await api.get('/api/properties/popular', {
        params: {
          days: timeRange,

          sort: sortBy,

          type: filterType !== 'todos' ? filterType : undefined,

          limit: MAX_PROPERTIES,

          status: 'disponivel',
        },
      });

      const data = response?.data?.data || response?.data || [];

      const metaData = response?.data?.meta || {};

      const topThree = Array.isArray(data) ? data.slice(0, MAX_PROPERTIES) : [];

      const processedData = topThree.map((property) => {
        const propertyStats = getPropertyStats(property);

        return {
          ...property,

          totalViews: propertyStats.views,

          totalContacts: propertyStats.contacts,

          totalFavorites: propertyStats.favorites,

          conversionRate: propertyStats.conversionRate,

          statistics: property.statistics || propertyStats,
        };
      });

      setProperties(processedData);

      setMeta(metaData);

      calculateStats(processedData);
    } catch (error) {
      console.error('Erro ao carregar top imóveis:', error);

      if (error?.response?.status === 404) {
        setProperties([]);

        calculateStats([]);

        return;
      }

      toast.error(
        error?.response?.data?.message ||
          'Não foi possível carregar os imóveis em destaque.',
      );

      const mockData = generateMockData().slice(0, MAX_PROPERTIES);

      setProperties(mockData);

      calculateStats(mockData);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =========================================================
     STATS
  ========================================================= */

  const calculateStats = (items) => {
    if (!items?.length) {
      setStats({
        totalViews: 0,
        totalContacts: 0,
        totalFavorites: 0,
        conversionRate: 0,
      });

      return;
    }

    const totalViews = items.reduce(
      (sum, property) => sum + Number(property.totalViews || 0),
      0,
    );

    const totalContacts = items.reduce(
      (sum, property) => sum + Number(property.totalContacts || 0),
      0,
    );

    const totalFavorites = items.reduce(
      (sum, property) => sum + Number(property.totalFavorites || 0),
      0,
    );

    const conversionRate =
      totalViews > 0 ? (totalContacts / totalViews) * 100 : 0;

    setStats({
      totalViews,
      totalContacts,
      totalFavorites,
      conversionRate,
    });
  };

  /* =========================================================
     REFRESH
  ========================================================= */

  const handleRefresh = async () => {
    if (refreshing) return;

    setRefreshing(true);

    await loadTopProperties();
  };

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const handlePropertyClick = (property) => {
    if (!property?._id) return;

    navigate(`/propertycrm-details/${property._id}`);
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <section className="w-full overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80">
        {/* Header */}

        <div className="border-b border-slate-800/80 p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-5 w-36 animate-pulse rounded bg-slate-800" />

              <div className="h-3 w-52 animate-pulse rounded bg-slate-800/70" />
            </div>

            <div className="h-8 w-20 animate-pulse rounded-lg bg-slate-800" />
          </div>
        </div>

        {/* Skeleton */}

        <div className="space-y-2 p-4">
          {Array.from({
            length: MAX_PROPERTIES,
          }).map((_, index) => (
            <div
              key={index}
              className="h-[92px] animate-pulse rounded-xl border border-slate-800 bg-slate-900/50"
            />
          ))}
        </div>
      </section>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section className="w-full overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80 shadow-xl shadow-black/10">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="border-b border-slate-800/80 bg-gradient-to-r from-slate-950 via-slate-900/60 to-slate-950 px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          {/* Title */}

          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10">
              <Trophy size={17} className="text-amber-300" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-base font-bold text-white">
                  Top 3 Imóveis
                </h2>

                <span className="hidden rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-blue-400 sm:inline-flex">
                  Ranking
                </span>
              </div>

              <p className="mt-0.5 truncate text-[11px] text-slate-500">
                Melhor desempenho no período
              </p>
            </div>
          </div>

          {/* Controls */}

          <div className="flex shrink-0 items-center gap-1.5">
            <select
              value={timeRange}
              onChange={(event) => setTimeRange(event.target.value)}
              className="h-8 rounded-lg border border-slate-800 bg-slate-900 px-2 text-[10px] font-medium text-slate-400 outline-none transition focus:border-blue-500"
            >
              <option value="7">7 dias</option>

              <option value="30">30 dias</option>

              <option value="60">60 dias</option>

              <option value="90">90 dias</option>
            </select>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              title="Atualizar ranking"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-500 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white disabled:opacity-50"
            >
              <RefreshCw
                size={13}
                className={refreshing ? 'animate-spin' : ''}
              />
            </button>
          </div>
        </div>

        {/* Filters */}

        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
          {[
            ['todos', 'Todos'],
            ['apartamento', 'Apartamentos'],
            ['casa', 'Casas'],
            ['cobertura', 'Coberturas'],
            ['comercial', 'Comerciais'],
            ['terreno', 'Terrenos'],
          ].map(([value, label]) => {
            const active = filterType === value;

            return (
              <button
                key={value}
                type="button"
                onClick={() => setFilterType(value)}
                className={`shrink-0 rounded-md border px-2.5 py-1 text-[10px] font-medium transition ${
                  active
                    ? 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                    : 'border-slate-800 bg-slate-900/50 text-slate-600 hover:border-slate-700 hover:text-slate-400'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================
          MINI SUMMARY
      ===================================================== */}

      {properties.length > 0 && (
        <div className="grid grid-cols-4 border-b border-slate-800/80">
          <MiniStat
            icon={Eye}
            value={formatNumber(stats.totalViews)}
            label="Views"
            color="blue"
          />

          <MiniStat
            icon={MessageCircle}
            value={formatNumber(stats.totalContacts)}
            label="Contatos"
            color="emerald"
          />

          <MiniStat
            icon={Heart}
            value={formatNumber(stats.totalFavorites)}
            label="Favoritos"
            color="rose"
          />

          <MiniStat
            icon={TrendingUp}
            value={formatPercentage(stats.conversionRate)}
            label="Conversão"
            color="violet"
          />
        </div>
      )}

      {/* =====================================================
          RANKING
      ===================================================== */}

      <div className="p-3">
        {properties.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {properties.slice(0, MAX_PROPERTIES).map((property, index) => (
              <CompactPropertyCard
                key={property?._id || property?.id || index}
                property={property}
                rank={index + 1}
                onClick={() => handlePropertyClick(property)}
              />
            ))}
          </div>
        )}

        {/* Footer */}

        {properties.length > 0 && (
          <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 px-1 pt-3 text-[10px] text-slate-600">
            <span>
              Top {properties.length} de {meta?.total || properties.length}{' '}
              imóveis
            </span>

            <span className="flex items-center gap-1">
              <Sparkles size={10} className="text-blue-400" />
              Atualizado em tempo real
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({ icon: Icon, value, label, color }) {
  const colorMap = {
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
    rose: 'text-rose-400',
    violet: 'text-violet-400',
  };

  return (
    <div className="flex min-w-0 items-center justify-center gap-2 border-r border-slate-800/70 px-2 py-2.5 last:border-r-0">
      <Icon size={13} className={colorMap[color] || colorMap.blue} />

      <div className="min-w-0">
        <p className="truncate text-[11px] font-bold text-slate-200">{value}</p>

        <p className="truncate text-[8px] uppercase tracking-wider text-slate-600">
          {label}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   COMPACT PROPERTY CARD
========================================================= */

function CompactPropertyCard({ property, rank, onClick }) {
  const [imageError, setImageError] = useState(false);

  const rankConfig = getRankConfig(rank);

  const RankIcon = rankConfig.icon;

  const statusConfig = getStatusConfig(property?.status);

  const image = normalizeImage(property);

  const stats = getPropertyStats(property);

  const title =
    property?.title ||
    property?.name ||
    property?.code ||
    'Imóvel sem identificação';

  const propertyType = property?.type || property?.propertyType || 'Imóvel';

  const neighborhood =
    property?.location?.neighborhood ||
    property?.neighborhood ||
    property?.address?.neighborhood ||
    '';

  const city =
    property?.location?.city || property?.city || property?.address?.city || '';

  const salePrice =
    property?.salePrice || property?.price || property?.sale?.price || 0;

  const area =
    property?.area ||
    property?.privateArea ||
    property?.totalArea ||
    property?.usefulArea ||
    0;

  const isFeatured = Boolean(
    property?.featured || property?.isFeatured || property?.destaque,
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border p-2.5 text-left transition-all duration-200 ${
        rank === 1
          ? 'border-amber-400/15 bg-gradient-to-r from-amber-400/[0.035] to-slate-900/40'
          : 'border-slate-800/80 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-900/60'
      }`}
    >
      {/* Rank */}

      <div
        className={`flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded-lg border ${rankConfig.badge}`}
      >
        <RankIcon size={12} className={rankConfig.iconClass} />

        <span className={`text-[9px] font-bold ${rankConfig.numberClass}`}>
          {rankConfig.label}
        </span>
      </div>

      {/* Image */}

      <div className="relative h-[66px] w-[82px] shrink-0 overflow-hidden rounded-lg bg-slate-900">
        {image && !imageError ? (
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
            <Home size={22} className="text-slate-700" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 to-transparent" />

        {isFeatured && (
          <div className="absolute bottom-1 left-1 flex h-5 w-5 items-center justify-center rounded-md bg-slate-950/80 backdrop-blur-sm">
            <Star size={10} className="text-amber-300" fill="currentColor" />
          </div>
        )}
      </div>

      {/* Main Info */}

      <div className="min-w-0 flex-1">
        {/* Type / Status */}

        <div className="mb-0.5 flex items-center gap-1.5">
          <span className="truncate text-[9px] font-semibold uppercase tracking-wider text-slate-600">
            {propertyType}
          </span>

          <span
            className={`rounded px-1.5 py-0.5 text-[8px] font-semibold ${statusConfig.className}`}
          >
            {statusConfig.label}
          </span>
        </div>

        {/* Title */}

        <h3 className="truncate text-[13px] font-semibold text-slate-200 transition group-hover:text-blue-300">
          {title}
        </h3>

        {/* Location */}

        {(neighborhood || city) && (
          <div className="mt-0.5 flex min-w-0 items-center gap-1">
            <MapPin size={10} className="shrink-0 text-slate-600" />

            <span className="truncate text-[9px] text-slate-600">
              {[neighborhood, city].filter(Boolean).join(', ')}
            </span>
          </div>
        )}

        {/* Bottom */}

        <div className="mt-1.5 flex items-center gap-3">
          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-300">
            <DollarSign size={10} className="text-emerald-400" />

            {formatCurrency(salePrice)}
          </span>

          {area > 0 && (
            <span className="text-[9px] text-slate-600">
              {formatNumber(area)} m²
            </span>
          )}
        </div>
      </div>

      {/* Metrics */}

      <div className="hidden shrink-0 items-center gap-3 border-l border-slate-800/80 pl-3 sm:flex">
        <CompactMetric
          icon={Eye}
          value={formatNumber(stats.views)}
          color="blue"
          label="views"
        />

        <CompactMetric
          icon={MessageCircle}
          value={formatNumber(stats.contacts)}
          color="emerald"
          label="contatos"
        />

        <CompactMetric
          icon={Heart}
          value={formatNumber(stats.favorites)}
          color="rose"
          label="favoritos"
        />

        <CompactMetric
          icon={TrendingUp}
          value={formatPercentage(stats.conversionRate)}
          color="violet"
          label="conversão"
        />
      </div>

      {/* Arrow */}

      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-700 transition group-hover:bg-blue-500/10 group-hover:text-blue-400">
        <ChevronRight size={15} />
      </div>
    </button>
  );
}

/* =========================================================
   COMPACT METRIC
========================================================= */

function CompactMetric({ icon: Icon, value, color, label }) {
  const colors = {
    blue: 'text-blue-400',
    emerald: 'text-emerald-400',
    rose: 'text-rose-400',
    violet: 'text-violet-400',
  };

  return (
    <div className="min-w-[42px] text-center">
      <Icon size={11} className={`mx-auto ${colors[color] || colors.blue}`} />

      <p className="mt-0.5 text-[10px] font-bold text-slate-300">{value}</p>

      <p className="text-[7px] uppercase tracking-wide text-slate-700">
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState() {
  return (
    <div className="flex min-h-[190px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/20 px-4 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900">
        <Building2 size={19} className="text-slate-600" />
      </div>

      <h3 className="mt-3 text-xs font-semibold text-slate-400">
        Nenhum imóvel encontrado
      </h3>

      <p className="mt-1 max-w-xs text-[10px] leading-4 text-slate-600">
        Não encontramos imóveis disponíveis para os filtros selecionados.
      </p>
    </div>
  );
}

/* =========================================================
   MOCK DATA
========================================================= */

function generateMockData() {
  const baseProperties = [
    {
      _id: 'mock-1',
      title: 'Apartamento Premium Vila Mariana',
      type: 'Apartamento',
      status: 'disponivel',
      featured: true,
      salePrice: 980000,
      area: 86,
      neighborhood: 'Vila Mariana',
      city: 'São Paulo',
      images: [],
      statistics: {
        views: 1842,
        contacts: 126,
        favorites: 89,
        conversionRate: 6.84,
      },
    },

    {
      _id: 'mock-2',
      title: 'Cobertura Duplex Paraíso',
      type: 'Cobertura',
      status: 'disponivel',
      featured: true,
      salePrice: 1650000,
      area: 142,
      neighborhood: 'Paraíso',
      city: 'São Paulo',
      images: [],
      statistics: {
        views: 1526,
        contacts: 103,
        favorites: 74,
        conversionRate: 6.75,
      },
    },

    {
      _id: 'mock-3',
      title: 'Apartamento Moderno Saúde',
      type: 'Apartamento',
      status: 'disponivel',
      featured: false,
      salePrice: 720000,
      area: 72,
      neighborhood: 'Saúde',
      city: 'São Paulo',
      images: [],
      statistics: {
        views: 1378,
        contacts: 91,
        favorites: 61,
        conversionRate: 6.6,
      },
    },
  ];

  return baseProperties.slice(0, MAX_PROPERTIES).map((property) => {
    const propertyStats = getPropertyStats(property);

    return {
      ...property,

      totalViews: propertyStats.views,

      totalContacts: propertyStats.contacts,

      totalFavorites: propertyStats.favorites,

      conversionRate: propertyStats.conversionRate,
    };
  });
}

// src/pages/PropertyFavorites.jsx
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Heart,
  Home,
  MapPin,
  BedDouble,
  Bath,
  Car,
  Maximize2,
  Eye,
  Search,
  RefreshCw,
  Loader2,
  Building2,
  X,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

import Header from '../components/site/Header';

import api from '../service/api';

/* ============================================================
   HELPERS
============================================================ */

function formatCurrency(value) {
  if (value === null || value === undefined || value === '') {
    return 'Consulte';
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return 'Consulte';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(number);
}

function formatArea(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return typeof value === 'string' ? value : null;
  }

  return `${new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 0,
  }).format(number)} m²`;
}

function getPropertyId(property) {
  return property?._id || property?.id || null;
}

function getPropertyImage(property) {
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
    property.media?.[0],
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate) {
      return candidate;
    }

    if (candidate?.url) {
      return candidate.url;
    }

    if (candidate?.secure_url) {
      return candidate.secure_url;
    }
  }

  return null;
}

function getPropertyTitle(property) {
  return property?.title || property?.name || property?.headline || 'Imóvel';
}

function getPropertyType(property) {
  return (
    property?.propertyType ||
    property?.type ||
    property?.property_type ||
    property?.category ||
    'Imóvel'
  );
}

function getAddress(property) {
  const location = property?.location || property?.address || {};

  if (typeof location === 'string') {
    return location;
  }

  const parts = [
    location.street || location.logradouro || '',
    location.number || location.numero || '',
    location.neighborhood || location.district || location.bairro || '',
    location.city || location.cidade || '',
    location.state || location.uf || '',
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(', ') : '';
}

function getBedrooms(property) {
  return property?.bedrooms ?? property?.rooms ?? property?.dormitories ?? 0;
}

function getBathrooms(property) {
  return property?.bathrooms ?? property?.bathroomCount ?? 0;
}

function getParking(property) {
  return property?.parkingSpaces ?? property?.parking ?? property?.garage ?? 0;
}

function getArea(property) {
  if (property?.dimensions && typeof property.dimensions === 'object') {
    return (
      property.dimensions.totalArea ??
      property.dimensions.builtArea ??
      property.dimensions.landArea ??
      null
    );
  }

  if (property?.area && typeof property.area === 'object') {
    return (
      property.area.total ??
      property.area.useful ??
      property.area.built ??
      property.area.private ??
      null
    );
  }

  return (
    property?.area ??
    property?.totalArea ??
    property?.builtArea ??
    property?.usefulArea ??
    null
  );
}

function getSalePrice(property) {
  if (property?.prices && typeof property.prices === 'object') {
    return property.prices.salePrice ?? property.prices.sale ?? null;
  }

  return property?.salePrice ?? property?.price ?? null;
}

function getRentPrice(property) {
  if (property?.prices && typeof property.prices === 'object') {
    return property.prices.rentPrice ?? property.prices.rent ?? null;
  }

  return property?.rentPrice ?? null;
}

function formatStatus(status) {
  if (!status) return '';

  const statusMap = {
    available: 'Disponível',
    active: 'Disponível',
    disponivel: 'Disponível',
    vendido: 'Vendido',
    sold: 'Vendido',
    reserved: 'Reservado',
    reservado: 'Reservado',
    rented: 'Alugado',
    alugado: 'Alugado',
    inactive: 'Inativo',
    indisponivel: 'Indisponível',
  };

  return statusMap[status] || status;
}

/* ============================================================
   COMPONENTE PRINCIPAL
============================================================ */

export default function PropertyFavorites() {
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  });

  const [actionLoading, setActionLoading] = useState(null);

  /* ==========================================================
     CARREGAR FAVORITOS
  ========================================================== */

  const loadFavorites = async (silent = false, page = 1) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const response = await api.get('/api/property-favorite', {
        params: {
          page,
          limit: pagination.limit,
          search: search || undefined,
        },
      });

      const data = response.data?.data || response.data || {};
      const items = data.favorites || data.items || data.data || [];

      setFavorites(Array.isArray(items) ? items : []);

      if (data.pagination) {
        setPagination({
          page: data.pagination.page || page,
          limit: data.pagination.limit || 20,
          total: data.pagination.total || 0,
          pages: data.pagination.pages || 0,
          hasNext: data.pagination.hasNext || false,
          hasPrev: data.pagination.hasPrev || false,
        });
      } else {
        const total = Array.isArray(items) ? items.length : 0;
        setPagination({
          page: 1,
          limit: 20,
          total,
          pages: total > 0 ? 1 : 0,
          hasNext: false,
          hasPrev: false,
        });
      }
    } catch (err) {
      console.error('Erro ao carregar favoritos:', err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Não foi possível carregar seus favoritos.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* ==========================================================
     CARREGAR INICIAL
  ========================================================== */

  useEffect(() => {
    loadFavorites();
  }, []);

  /* ==========================================================
     REMOVER FAVORITO
  ========================================================== */

  const handleRemoveFavorite = async (propertyId) => {
    if (!propertyId) return;

    try {
      setActionLoading(propertyId);

      await api.delete(`/api/property-favorite/${propertyId}`);

      setFavorites((prev) =>
        prev.filter((item) => {
          const id = item.property?._id || item.property?.id || item._id;
          return String(id) !== String(propertyId);
        }),
      );

      setPagination((prev) => ({
        ...prev,
        total: prev.total - 1,
      }));
    } catch (err) {
      console.error('Erro ao remover favorito:', err);

      alert(
        err.response?.data?.message ||
          'Não foi possível remover este imóvel dos favoritos.',
      );
    } finally {
      setActionLoading(null);
    }
  };

  /* ==========================================================
     PESQUISAR
  ========================================================== */

  const handleSearch = (e) => {
    e.preventDefault();
    loadFavorites(false, 1);
  };

  const handleClearSearch = () => {
    setSearch('');
    loadFavorites(false, 1);
  };

  /* ==========================================================
     PAGINAÇÃO
  ========================================================== */

  const goToPage = (page) => {
    if (page < 1 || (pagination.pages && page > pagination.pages)) return;
    loadFavorites(true, page);
  };

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-64 bg-gray-800 rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="h-64 bg-gray-900 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* HEADER */}

        {/* SEARCH */}

        <div className="mb-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                size={18}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, código ou localização..."
                className="w-full h-11 bg-gray-900 border border-gray-800 rounded-xl pl-11 pr-4 text-white placeholder:text-gray-600 outline-none focus:border-blue-500/50 transition"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition"
            >
              Buscar
            </button>

            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 transition"
              >
                <X size={16} />
              </button>
            )}
          </form>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
              <Heart className="h-4 w-4 text-red-400" />
            </div>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* FAVORITES LIST */}

        {favorites.length === 0 ? (
          <EmptyState
            hasSearch={!!search}
            onClearSearch={handleClearSearch}
            onExplore={() => navigate('/properties')}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favorites.map((item) => {
                const property = item.property || item;
                const favoriteId = item._id || item.id;

                return (
                  <FavoriteCard
                    key={favoriteId || getPropertyId(property)}
                    property={property}
                    favoriteId={favoriteId}
                    onRemove={() =>
                      handleRemoveFavorite(
                        getPropertyId(property) || favoriteId,
                      )
                    }
                    loading={actionLoading === getPropertyId(property)}
                  />
                );
              })}
            </div>

            {/* PAGINATION */}

            {pagination.pages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-sm text-gray-500">
                  Página {pagination.page} de {pagination.pages}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                    className="w-9 h-9 rounded-lg border border-gray-800 bg-gray-900 text-gray-400 hover:text-white hover:border-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <span className="text-sm text-gray-500 px-2">
                    {pagination.page} / {pagination.pages}
                  </span>

                  <button
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className="w-9 h-9 rounded-lg border border-gray-800 bg-gray-900 text-gray-400 hover:text-white hover:border-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   FAVORITE CARD
============================================================ */

function FavoriteCard({ property, favoriteId, onRemove, loading }) {
  const propertyId = getPropertyId(property);
  const title = getPropertyTitle(property);
  const type = getPropertyType(property);
  const image = getPropertyImage(property);
  const address = getAddress(property);
  const status = formatStatus(property?.status);
  const isSold =
    property?.status?.toLowerCase() === 'vendido' ||
    property?.status?.toLowerCase() === 'sold';

  const salePrice = getSalePrice(property);
  const rentPrice = getRentPrice(property);
  const displayPrice = salePrice || rentPrice || property?.price || null;
  const isForRent = !salePrice && Boolean(rentPrice);

  const bedrooms = getBedrooms(property);
  const bathrooms = getBathrooms(property);
  const parking = getParking(property);
  const area = getArea(property);

  const fallbackImage =
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="group relative bg-gray-900/80 border border-gray-800 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5">
      {/* IMAGE */}

      <Link
        to={`/properties/${propertyId}`}
        className="relative block overflow-hidden"
      >
        <div className="relative aspect-[4/3] bg-gray-950">
          <img
            src={image || fallbackImage}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = fallbackImage;
            }}
          />

          {/* STATUS BADGE */}

          {status && (
            <div
              className={`absolute top-3 left-3 px-2.5 py-1.5 rounded-lg text-xs font-semibold ${
                isSold
                  ? 'bg-emerald-500/90 text-white'
                  : 'bg-blue-500/90 text-white'
              }`}
            >
              {status}
            </div>
          )}

          {/* TYPE BADGE */}

          {type && (
            <div className="absolute top-3 right-3 px-2.5 py-1.5 rounded-lg bg-black/70 backdrop-blur-sm text-white text-xs font-medium border border-white/10">
              {type}
            </div>
          )}

          {/* REMOVE BUTTON */}

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove();
            }}
            disabled={loading}
            className="absolute bottom-3 right-3 p-2 rounded-lg bg-red-500/90 hover:bg-red-600 text-white transition disabled:opacity-50"
            aria-label="Remover dos favoritos"
            title="Remover dos favoritos"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <X size={16} />
            )}
          </button>
        </div>
      </Link>

      {/* CONTENT */}

      <div className="p-4">
        <Link to={`/properties/${propertyId}`}>
          <h3 className="text-base font-semibold text-white hover:text-blue-400 transition line-clamp-1">
            {title}
          </h3>
        </Link>

        {/* ADDRESS */}

        {address && (
          <div className="flex items-start gap-1.5 mt-1.5 text-xs text-gray-500">
            <MapPin size={13} className="mt-0.5 shrink-0" />
            <span className="line-clamp-1">{address}</span>
          </div>
        )}

        {/* PRICE */}

        <div className="mt-3">
          <p className="text-xs text-gray-500">
            {isForRent ? 'Aluguel' : 'Venda'}
          </p>
          <p
            className={`text-xl font-bold ${isSold ? 'text-gray-500' : 'text-white'}`}
          >
            {formatCurrency(displayPrice)}
          </p>
          {isForRent && <p className="text-xs text-gray-500">/ mês</p>}
        </div>

        {/* FEATURES */}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 border-t border-gray-800">
          {bedrooms > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <BedDouble size={14} className="text-gray-500" />
              <span>{bedrooms}</span>
            </div>
          )}

          {bathrooms > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Bath size={14} className="text-gray-500" />
              <span>{bathrooms}</span>
            </div>
          )}

          {parking > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Car size={14} className="text-gray-500" />
              <span>{parking}</span>
            </div>
          )}

          {area > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Maximize2 size={14} className="text-gray-500" />
              <span>{formatArea(area)}</span>
            </div>
          )}
        </div>

        {/* FOOTER */}

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Eye size={13} />
              {property.statistics?.views || 0}
            </span>

            <span className="inline-flex items-center gap-1">
              <Heart size={13} className="fill-blue-500/20 text-blue-400" />
              {property.statistics?.favorites || 0}
            </span>
          </div>

          <Link
            to={`/properties/${propertyId}`}
            className="text-xs font-medium text-blue-400 hover:text-blue-300 transition"
          >
            Ver detalhes →
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState({ hasSearch, onClearSearch, onExplore }) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
        <Heart className="h-10 w-10 text-blue-400" />
      </div>

      <h2 className="mt-6 text-xl font-bold text-white">
        {hasSearch
          ? 'Nenhum favorito encontrado'
          : 'Você ainda não tem imóveis favoritados'}
      </h2>

      <p className="mt-3 max-w-md mx-auto text-sm text-gray-500">
        {hasSearch
          ? 'Não encontramos imóveis favoritados com os filtros selecionados.'
          : 'Comece a explorar os imóveis e adicione seus preferidos aos favoritos.'}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {hasSearch && (
          <button
            onClick={onClearSearch}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white transition"
          >
            <X size={16} />
            Limpar busca
          </button>
        )}

        <button
          onClick={onExplore}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium transition shadow-lg shadow-blue-600/20"
        >
          <Sparkles size={16} />
          Explorar imóveis
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   CHEVRON ICONS
============================================================ */

function ChevronLeft(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRight(props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

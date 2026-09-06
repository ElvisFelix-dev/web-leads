// src/pages/PropertyList.jsx
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import {
  Home,
  Plus,
  Search,
  RefreshCcw,
  Grid3X3,
  List,
  Eye,
  Pencil,
  Trash2,
  Star,
  Building2,
  MapPin,
  BedDouble,
  Bath,
  Car,
  Ruler,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Clock3,
  Archive,
  EyeOff,
  RotateCcw,
} from 'lucide-react';

import useProperties from '../hooks/useProperties';

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export default function PropertyList() {
  const {
    properties,
    loading,
    remove,
    publish,
    unpublish,
    archive,
    restore,
    featured,
    fetchProperties,
  } = useProperties();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [purposeFilter, setPurposeFilter] = useState('todos');
  const [view, setView] = useState('grid');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  // ============================================================
  // FILTRAR IMÓVEIS
  // ============================================================

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      if (!property) return false;

      const matchSearch =
        property.name?.toLowerCase().includes(search.toLowerCase()) ||
        property.location?.city?.toLowerCase().includes(search.toLowerCase()) ||
        property.location?.district
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        property.code?.toLowerCase().includes(search.toLowerCase());

      const matchStatus =
        statusFilter === 'todos' ? true : property.status === statusFilter;

      const matchPurpose =
        purposeFilter === 'todos' ? true : property.purpose === purposeFilter;

      return matchSearch && matchStatus && matchPurpose;
    });
  }, [properties, search, statusFilter, purposeFilter]);

  // ============================================================
  // ESTATÍSTICAS
  // ============================================================

  const stats = useMemo(() => {
    return {
      total: properties.length,
      published: properties.filter((item) => item.status === 'published')
        .length,
      draft: properties.filter((item) => item.status === 'draft').length,
      archived: properties.filter((item) => item.status === 'archived').length,
      featured: properties.filter((item) => item.featured).length,
      sale: properties.filter((item) => item.purpose === 'venda').length,
      rent: properties.filter((item) => item.purpose === 'aluguel').length,
    };
  }, [properties]);

  // ============================================================
  // AÇÕES COM TOASTIFY
  // ============================================================

  const handleArchive = async (id) => {
    if (actionLoading) return;

    const toastId = toast.loading('Arquivando imóvel...');

    try {
      setActionLoading(id);
      await archive(id);
      toast.update(toastId, {
        render: '✅ Imóvel arquivado com sucesso!',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
      await fetchProperties();
    } catch (err) {
      console.error('Erro ao arquivar:', err);
      toast.update(toastId, {
        render: err?.message || '❌ Erro ao arquivar imóvel.',
        type: 'error',
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestore = async (id) => {
    if (actionLoading) return;

    const toastId = toast.loading('Restaurando imóvel...');

    try {
      setActionLoading(id);
      await restore(id);
      toast.update(toastId, {
        render: '✅ Imóvel restaurado com sucesso!',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
      await fetchProperties();
    } catch (err) {
      console.error('Erro ao restaurar:', err);
      toast.update(toastId, {
        render: err?.message || '❌ Erro ao restaurar imóvel.',
        type: 'error',
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handlePublish = async (id) => {
    if (actionLoading) return;

    const toastId = toast.loading('Publicando imóvel...');

    try {
      setActionLoading(id);
      await publish(id);
      toast.update(toastId, {
        render: '✅ Imóvel publicado com sucesso!',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
      await fetchProperties();
    } catch (err) {
      console.error('Erro ao publicar:', err);
      toast.update(toastId, {
        render: err?.message || '❌ Erro ao publicar imóvel.',
        type: 'error',
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnpublish = async (id) => {
    if (actionLoading) return;

    const toastId = toast.loading('Despublicando imóvel...');

    try {
      setActionLoading(id);
      await unpublish(id);
      toast.update(toastId, {
        render: '✅ Imóvel despublicado com sucesso!',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
      await fetchProperties();
    } catch (err) {
      console.error('Erro ao despublicar:', err);
      toast.update(toastId, {
        render: err?.message || '❌ Erro ao despublicar imóvel.',
        type: 'error',
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleFeatured = async (id) => {
    if (actionLoading) return;

    const property = properties.find((p) => p._id === id);
    const isFeatured = property?.featured;
    const action = isFeatured
      ? 'Removendo destaque...'
      : 'Adicionando destaque...';
    const successMsg = isFeatured
      ? 'Imóvel removido dos destaques!'
      : 'Imóvel adicionado aos destaques!';

    const toastId = toast.loading(action);

    try {
      setActionLoading(id);
      await featured(id);
      toast.update(toastId, {
        render: `✅ ${successMsg}`,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
      await fetchProperties();
    } catch (err) {
      console.error('Erro ao alterar destaque:', err);
      toast.update(toastId, {
        render: err?.message || '❌ Erro ao alterar destaque.',
        type: 'error',
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async (id) => {
    if (actionLoading) return;

    if (
      !window.confirm(
        'Deseja realmente excluir este imóvel? Esta ação não pode ser desfeita.',
      )
    ) {
      return;
    }

    const toastId = toast.loading('Excluindo imóvel...');

    try {
      setActionLoading(id);
      await remove(id);
      toast.update(toastId, {
        render: '✅ Imóvel excluído com sucesso!',
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
      await fetchProperties();
    } catch (err) {
      console.error('Erro ao excluir:', err);
      toast.update(toastId, {
        render: err?.message || '❌ Erro ao excluir imóvel.',
        type: 'error',
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="mx-auto max-w-[1700px] space-y-8 px-6 py-8">
      {/* HEADER */}
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 p-8 shadow-2xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-xl bg-blue-600/20 p-3">
                <Home size={30} className="text-blue-400" />
              </div>

              <div>
                <h1 className="text-4xl font-bold text-white">Imóveis</h1>
                <p className="text-slate-400">
                  Gerencie todo seu portfólio imobiliário.
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/create-property"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
          >
            <Plus size={18} />
            Novo imóvel
          </Link>
        </div>
      </div>

      {/* STATS */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-6">
        <StatCard
          icon={<Building2 size={22} />}
          title="Total"
          value={stats.total}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle2 size={22} />}
          title="Publicados"
          value={stats.published}
          color="emerald"
        />
        <StatCard
          icon={<Clock3 size={22} />}
          title="Rascunhos"
          value={stats.draft}
          color="yellow"
        />
        <StatCard
          icon={<Archive size={22} />}
          title="Arquivados"
          value={stats.archived}
          color="red"
        />
        <StatCard
          icon={<Star size={22} />}
          title="Destaques"
          value={stats.featured}
          color="amber"
        />
        <StatCard
          icon={<TrendingUp size={22} />}
          title="Venda"
          value={stats.sale}
          color="cyan"
        />
      </div>

      {/* TOOLBAR */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex flex-col gap-4 xl:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              placeholder="Pesquisar por nome, código ou localização..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-12 pr-4 text-white outline-none transition focus:border-blue-500"
            />
          </div>

          <select
            value={purposeFilter}
            onChange={(e) => setPurposeFilter(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 text-slate-200"
          >
            <option value="todos">Finalidade</option>
            <option value="venda">Venda</option>
            <option value="aluguel">Aluguel</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-800 px-4 text-slate-200"
          >
            <option value="todos">Status</option>
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
            <option value="archived">Arquivado</option>
          </select>

          <button
            onClick={fetchProperties}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 text-slate-200 hover:bg-slate-700"
          >
            <RefreshCcw size={18} />
            Atualizar
          </button>

          <button
            onClick={() => setView('grid')}
            className={`rounded-xl p-3 ${
              view === 'grid'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <Grid3X3 size={18} />
          </button>

          <button
            onClick={() => setView('list')}
            className={`rounded-xl p-3 ${
              view === 'list'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* GRID / LIST */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="h-[480px] animate-pulse rounded-3xl bg-slate-800"
            />
          ))}
        </div>
      ) : (
        <div
          className={`grid gap-7 ${
            view === 'grid' ? 'md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'
          }`}
        >
          {filteredProperties.map((property) => {
            if (!property || !property._id) return null;

            return (
              <PropertyCard
                key={property._id}
                property={property}
                onArchive={() => handleArchive(property._id)}
                onRestore={() => handleRestore(property._id)}
                onPublish={() => handlePublish(property._id)}
                onUnpublish={() => handleUnpublish(property._id)}
                onFeatured={() => handleFeatured(property._id)}
                onRemove={() => handleRemove(property._id)}
                view={view}
                loading={actionLoading === property._id}
              />
            );
          })}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && filteredProperties.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-900 py-24">
          <Building2 size={60} className="text-slate-600" />
          <h2 className="mt-6 text-2xl font-bold text-white">
            Nenhum imóvel encontrado
          </h2>
          <p className="mt-3 max-w-md text-center text-slate-400">
            Tente alterar os filtros ou cadastre um novo imóvel para começar.
          </p>
          <Link
            to="/properties/create"
            className="mt-8 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-500"
          >
            Novo imóvel
          </Link>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   PROPERTY CARD
============================================================ */

function PropertyCard({
  property,
  onArchive,
  onRestore,
  onPublish,
  onUnpublish,
  onFeatured,
  onRemove,
  view,
  loading,
}) {
  const isGrid = view === 'grid';

  // 🔥 CORRIGIDO: Status em português
  const isArchived = property.status === 'arquivado';
  const isPublished =
    property.status === 'disponivel' && property.published === true;
  const isDraft =
    property.status === 'rascunho' ||
    (property.status === 'disponivel' && property.published === false);

  const getStatusColor = (status) => {
    const colors = {
      disponivel: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20',
      rascunho: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20',
      arquivado: 'bg-red-500/20 text-red-400 border-red-500/20',
      vendido: 'bg-blue-500/20 text-blue-400 border-blue-500/20',
      alugado: 'bg-purple-500/20 text-purple-400 border-purple-500/20',
      reservado: 'bg-amber-500/20 text-amber-400 border-amber-500/20',
    };
    return (
      colors[status] || 'bg-slate-500/20 text-slate-400 border-slate-500/20'
    );
  };

  const getStatusLabel = (status) => {
    const labels = {
      disponivel: 'Disponível',
      rascunho: 'Rascunho',
      arquivado: 'Arquivado',
      vendido: 'Vendido',
      alugado: 'Alugado',
      reservado: 'Reservado',
    };
    return labels[status] || status;
  };

  const getPurposeLabel = (purpose) => {
    const labels = {
      venda: 'Venda',
      aluguel: 'Locação',
      venda_aluguel: 'Venda e Locação',
    };
    return labels[purpose] || purpose;
  };

  const imageUrl =
    property.images?.find((i) => i.isCover)?.url ||
    property.images?.[0]?.url ||
    '/images/property-placeholder.jpg';

  return (
    <div
      className={`overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500 hover:shadow-[0_0_40px_rgba(59,130,246,.18)] ${
        isGrid ? '' : 'flex gap-6'
      } ${isArchived ? 'opacity-75' : ''}`}
    >
      {/* IMAGEM */}
      <div
        className={`relative overflow-hidden ${
          isGrid ? 'aspect-[16/10]' : 'w-64 shrink-0 aspect-[16/10]'
        }`}
      >
        <img
          src={imageUrl}
          alt={property.name}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = '/images/property-placeholder.jpg';
          }}
        />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
            {getPurposeLabel(property.purpose)}
          </span>

          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(property.status)}`}
          >
            {getStatusLabel(property.status)}
          </span>

          {property.featured && (
            <span className="rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold text-black">
              Destaque
            </span>
          )}
        </div>

        {isArchived && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="flex flex-col items-center gap-2">
              <Archive size={40} className="text-white/60" />
              <span className="text-sm font-semibold text-white/80">
                Arquivado
              </span>
            </div>
          </div>
        )}
      </div>

      {/* CONTEÚDO */}
      <div className={`space-y-4 p-5 ${isGrid ? '' : 'flex-1'}`}>
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-xl font-bold text-white line-clamp-1">
              {property.name}
            </h3>
          </div>

          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-400">
            <MapPin size={14} />
            <span className="line-clamp-1">
              {property.location?.district}
              {property.location?.city && ` • ${property.location.city}`}
            </span>
          </p>

          {property.code && (
            <p className="text-xs text-slate-500">Código: {property.code}</p>
          )}
        </div>

        <div className="text-3xl font-bold text-blue-400">
          {currency.format(
            property.prices?.salePrice || property.prices?.rentPrice || 0,
          )}
        </div>

        {/* CARACTERÍSTICAS */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <InfoItem
            icon={<BedDouble size={15} />}
            value={property.bedrooms || 0}
          />
          <InfoItem icon={<Bath size={15} />} value={property.bathrooms || 0} />
          <InfoItem
            icon={<Car size={15} />}
            value={property.parkingSpaces || 0}
          />
          <InfoItem
            icon={<Ruler size={15} />}
            value={`${property.dimensions?.totalArea || 0}m²`}
          />
        </div>

        {/* FEATURES */}
        {property.features?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {property.features.slice(0, 4).map((feature) => (
              <span
                key={feature}
                className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300"
              >
                {feature}
              </span>
            ))}
            {property.features.length > 4 && (
              <span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-500">
                +{property.features.length - 4}
              </span>
            )}
          </div>
        )}

        {/* AÇÕES */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar size={14} />
            {new Date(property.updatedAt).toLocaleDateString('pt-BR')}
          </div>

          <div className="flex gap-1.5">
            <Link
              to={`/propertycrm-details/${property._id}`}
              className="rounded-xl bg-slate-800 p-2 text-slate-300 transition hover:bg-blue-600 hover:text-white"
              title="Visualizar"
            >
              <Eye size={16} />
            </Link>

            <Link
              to={`/properties/edit/${property._id}`}
              className="rounded-xl bg-slate-800 p-2 text-slate-300 transition hover:bg-emerald-600 hover:text-white"
              title="Editar"
            >
              <Pencil size={16} />
            </Link>

            <button
              onClick={onFeatured}
              disabled={loading || isArchived}
              className={`rounded-xl p-2 transition ${
                property.featured
                  ? 'bg-yellow-500 text-black'
                  : 'bg-slate-800 text-slate-300 hover:bg-yellow-500 hover:text-black'
              } ${loading || isArchived ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={
                property.featured ? 'Remover destaque' : 'Adicionar destaque'
              }
            >
              <Star size={16} />
            </button>

            {isPublished && (
              <button
                onClick={onUnpublish}
                disabled={loading}
                className={`rounded-xl bg-orange-600 p-2 text-white transition hover:bg-orange-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Despublicar"
              >
                <EyeOff size={16} />
              </button>
            )}

            {isDraft && (
              <button
                onClick={onPublish}
                disabled={loading}
                className={`rounded-xl bg-emerald-600 p-2 text-white transition hover:bg-emerald-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Publicar"
              >
                <CheckCircle2 size={16} />
              </button>
            )}

            {/* 🔥 BOTÃO RESTAURAR - SÓ APARECE QUANDO ARQUIVADO */}
            {isArchived && (
              <button
                onClick={onRestore}
                disabled={loading}
                className={`rounded-xl bg-emerald-600 p-2 text-white transition hover:bg-emerald-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Restaurar (Desarquivar)"
              >
                <RotateCcw size={16} />
              </button>
            )}

            {/* 🔥 BOTÃO ARQUIVAR - SÓ APARECE QUANDO NÃO ESTÁ ARQUIVADO */}
            {!isArchived && (
              <button
                onClick={onArchive}
                disabled={loading}
                className={`rounded-xl bg-slate-800 p-2 text-slate-300 transition hover:bg-amber-600 hover:text-white ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Arquivar"
              >
                <Archive size={16} />
              </button>
            )}

            <button
              onClick={onRemove}
              disabled={loading}
              className={`rounded-xl bg-slate-800 p-2 text-red-400 transition hover:bg-red-600 hover:text-white ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Excluir"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({ icon, title, value, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-600/20 text-blue-400',
    emerald: 'bg-emerald-600/20 text-emerald-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    amber: 'bg-amber-500/20 text-amber-400',
    cyan: 'bg-cyan-600/20 text-cyan-400',
    red: 'bg-red-600/20 text-red-400',
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-blue-500">
      <div className={`inline-flex rounded-xl p-3 ${colors[color]}`}>
        {icon}
      </div>
      <p className="mt-4 text-sm text-slate-400">{title}</p>
      <h2 className="mt-2 text-3xl font-bold text-white">{value}</h2>
    </div>
  );
}

/* ============================================================
   INFO ITEM
============================================================ */

function InfoItem({ icon, value }) {
  return (
    <div className="rounded-xl bg-slate-800 p-2.5">
      <div className="mb-1 flex justify-center text-blue-400">{icon}</div>
      <div className="text-sm font-semibold text-white">{value ?? '-'}</div>
    </div>
  );
}

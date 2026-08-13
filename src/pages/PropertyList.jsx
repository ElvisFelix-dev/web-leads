import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  Home,
  Plus,
  Search,
  Filter,
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
  DollarSign,
  Calendar,
  TrendingUp,
  CheckCircle2,
  Clock3,
  Archive,
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
    featured,
    fetchProperties,
  } = useProperties();

  const [search, setSearch] = useState('');

  const [statusFilter, setStatusFilter] = useState('todos');

  const [purposeFilter, setPurposeFilter] = useState('todos');

  const [view, setView] = useState('grid');

  useEffect(() => {
    fetchProperties();
  }, []);

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      const matchSearch =
        property.name?.toLowerCase().includes(search.toLowerCase()) ||
        property.location?.city?.toLowerCase().includes(search.toLowerCase()) ||
        property.location?.district
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchStatus =
        statusFilter === 'todos' ? true : property.status === statusFilter;

      const matchPurpose =
        purposeFilter === 'todos' ? true : property.purpose === purposeFilter;

      return matchSearch && matchStatus && matchPurpose;
    });
  }, [properties, search, statusFilter, purposeFilter]);

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

  return (
    <div
      className="
      mx-auto
      max-w-[1700px]
      space-y-8
      px-6
      py-8
      "
    >
      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div
        className="
        rounded-3xl
        border
        border-slate-800
        bg-gradient-to-r
        from-slate-900
        via-slate-900
        to-slate-800
        p-8
        shadow-2xl
        "
      >
        <div
          className="
          flex
          flex-col
          gap-6
          lg:flex-row
          lg:items-center
          lg:justify-between
          "
        >
          <div>
            <div
              className="
              mb-3
              flex
              items-center
              gap-3
              "
            >
              <div
                className="
                rounded-xl
                bg-blue-600/20
                p-3
                "
              >
                <Home size={30} className="text-blue-400" />
              </div>

              <div>
                <h1
                  className="
                  text-4xl
                  font-bold
                  text-white
                  "
                >
                  Imóveis
                </h1>

                <p className="text-slate-400">
                  Gerencie todo seu portfólio imobiliário.
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/properties/create"
            className="
            inline-flex
            items-center
            gap-2
            rounded-xl
            bg-blue-600
            px-6
            py-3
            font-semibold
            text-white
            transition
            hover:bg-blue-500
            "
          >
            <Plus size={18} />
            Novo imóvel
          </Link>
        </div>
      </div>

      {/* ===================================================== */}
      {/* DASHBOARD */}
      {/* ===================================================== */}

      <div
        className="
        grid
        gap-5
        md:grid-cols-2
        xl:grid-cols-6
        "
      >
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

      {/* ===================================================== */}
      {/* TOOLBAR */}
      {/* ===================================================== */}

      <div
        className="
        rounded-2xl
        border
        border-slate-800
        bg-slate-900
        p-5
        "
      >
        <div
          className="
          flex
          flex-col
          gap-4
          xl:flex-row
          "
        >
          <div
            className="
            relative
            flex-1
            "
          >
            <Search
              size={18}
              className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-slate-500
              "
            />

            <input
              type="text"
              placeholder="Pesquisar imóvel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
              w-full
              rounded-xl
              border
              border-slate-700
              bg-slate-800
              py-3
              pl-12
              pr-4
              text-white
              outline-none
              transition
              focus:border-blue-500
              "
            />
          </div>
          <select
            value={purposeFilter}
            onChange={(e) => setPurposeFilter(e.target.value)}
            className="
            rounded-xl
            border
            border-slate-700
            bg-slate-800
            px-4
            text-slate-200
            "
          >
            <option value="todos">Finalidade</option>
            <option value="venda">Venda</option>
            <option value="aluguel">Aluguel</option>
            <option value="venda_aluguel">Venda + Aluguel</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="
            rounded-xl
            border
            border-slate-700
            bg-slate-800
            px-4
            text-slate-200
            "
          >
            <option value="todos">Status</option>
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
            <option value="archived">Arquivado</option>
          </select>

          <button
            onClick={fetchProperties}
            className="
            flex
            items-center
            gap-2
            rounded-xl
            border
            border-slate-700
            bg-slate-800
            px-5
            text-slate-200
            hover:bg-slate-700
            "
          >
            <RefreshCcw size={18} />
            Atualizar
          </button>

          <button
            onClick={() => setView('grid')}
            className={`
              rounded-xl
              p-3
              ${
                view === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400'
              }
            `}
          >
            <Grid3X3 size={18} />
          </button>

          <button
            onClick={() => setView('list')}
            className={`
              rounded-xl
              p-3
              ${
                view === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400'
              }
            `}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* ===================================================== */}
      {/* GRID */}
      {/* ===================================================== */}

      {loading ? (
        <div
          className="
          grid
          gap-6
          md:grid-cols-2
          xl:grid-cols-3
          "
        >
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="
              h-[480px]
              animate-pulse
              rounded-3xl
              bg-slate-800
              "
            />
          ))}
        </div>
      ) : (
        <div
          className={`
          grid
          gap-7
          ${view === 'grid' ? 'md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}
        `}
        >
          {filteredProperties.map((property) => (
            <div
              key={property._id}
              className="
              overflow-hidden
              rounded-3xl
              border
              border-slate-800
              bg-slate-900
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-blue-500
              hover:shadow-[0_0_40px_rgba(59,130,246,.18)]
              "
            >
              {/* ============================================ */}
              {/* FOTO */}
              {/* ============================================ */}

              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={
                    property.images?.find((i) => i.isCover)?.url ||
                    property.images?.[0]?.url ||
                    '/images/property-placeholder.jpg'
                  }
                  alt={property.name}
                  className="
                  h-full
                  w-full
                  object-cover
                  transition-transform
                  duration-500
                  hover:scale-110
                  "
                />

                <div
                  className="
                  absolute
                  left-4
                  top-4
                  flex
                  gap-2
                  "
                >
                  <span
                    className="
                    rounded-full
                    bg-blue-600
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    text-white
                    "
                  >
                    {property.purpose}
                  </span>

                  {property.featured && (
                    <span
                      className="
                      rounded-full
                      bg-yellow-500
                      px-3
                      py-1
                      text-xs
                      font-bold
                      text-black
                      "
                    >
                      Destaque
                    </span>
                  )}
                </div>
              </div>

              {/* ============================================ */}
              {/* BODY */}
              {/* ============================================ */}

              <div className="space-y-5 p-6">
                <div>
                  <h3
                    className="
                    text-xl
                    font-bold
                    text-white
                    "
                  >
                    {property.name}
                  </h3>

                  <p
                    className="
                    mt-2
                    flex
                    items-center
                    gap-2
                    text-sm
                    text-slate-400
                    "
                  >
                    <MapPin size={15} />

                    {property.location?.district}

                    {property.location?.city && ` • ${property.location.city}`}
                  </p>
                </div>

                <div
                  className="
                  text-3xl
                  font-bold
                  text-blue-400
                  "
                >
                  {currency.format(
                    property.prices?.salePrice ||
                      property.prices?.rentPrice ||
                      0,
                  )}
                </div>

                <div
                  className="
                  grid
                  grid-cols-4
                  gap-3
                  text-center
                  "
                >
                  <InfoItem
                    icon={<BedDouble size={16} />}
                    value={property.bedrooms}
                  />

                  <InfoItem
                    icon={<Bath size={16} />}
                    value={property.bathrooms}
                  />

                  <InfoItem
                    icon={<Car size={16} />}
                    value={property.parkingSpaces}
                  />

                  <InfoItem
                    icon={<Ruler size={16} />}
                    value={`${property.area?.total || 0}m²`}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {property.features?.slice(0, 4).map((feature) => (
                    <span
                      key={feature}
                      className="
                        rounded-full
                        bg-slate-800
                        px-3
                        py-1
                        text-xs
                        text-slate-300
                        "
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                <div
                  className="
                  flex
                  items-center
                  justify-between
                  border-t
                  border-slate-800
                  pt-5
                  "
                >
                  <div
                    className="
                    flex
                    items-center
                    gap-2
                    text-xs
                    text-slate-500
                    "
                  >
                    <Calendar size={14} />

                    {new Date(property.updatedAt).toLocaleDateString('pt-BR')}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/propertycrm-details/${property._id}`}
                      className="
                      rounded-xl
                      bg-slate-800
                      p-2.5
                      text-slate-300
                      transition
                      hover:bg-blue-600
                      hover:text-white
                      "
                    >
                      <Eye size={17} />
                    </Link>

                    <Link
                      to={`/properties/edit/${property._id}`}
                      className="
                      rounded-xl
                      bg-slate-800
                      p-2.5
                      text-slate-300
                      transition
                      hover:bg-emerald-600
                      hover:text-white
                      "
                    >
                      <Pencil size={17} />
                    </Link>

                    <button
                      onClick={() => featured(property._id)}
                      className={`
                        rounded-xl
                        p-2.5
                        transition
                        ${
                          property.featured
                            ? 'bg-yellow-500 text-black'
                            : 'bg-slate-800 text-slate-300 hover:bg-yellow-500 hover:text-black'
                        }
                      `}
                    >
                      <Star size={17} />
                    </button>

                    {property.status === 'published' ? (
                      <button
                        onClick={() => unpublish(property._id)}
                        className="
                        rounded-xl
                        bg-orange-600
                        p-2.5
                        text-white
                        transition
                        hover:bg-orange-500
                        "
                      >
                        <Clock3 size={17} />
                      </button>
                    ) : (
                      <button
                        onClick={() => publish(property._id)}
                        className="
                        rounded-xl
                        bg-emerald-600
                        p-2.5
                        text-white
                        transition
                        hover:bg-emerald-500
                        "
                      >
                        <CheckCircle2 size={17} />
                      </button>
                    )}

                    <button
                      onClick={() => archive(property._id)}
                      className="
                      rounded-xl
                      bg-slate-800
                      p-2.5
                      text-slate-300
                      transition
                      hover:bg-amber-600
                      hover:text-white
                      "
                    >
                      <Archive size={17} />
                    </button>

                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            'Deseja realmente excluir este imóvel?',
                          )
                        ) {
                          remove(property._id);
                        }
                      }}
                      className="
                      rounded-xl
                      bg-slate-800
                      p-2.5
                      text-red-400
                      transition
                      hover:bg-red-600
                      hover:text-white
                      "
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredProperties.length === 0 && (
        <div
          className="
          flex
          flex-col
          items-center
          justify-center
          rounded-3xl
          border
          border-dashed
          border-slate-700
          bg-slate-900
          py-24
          "
        >
          <Building2 size={60} className="text-slate-600" />

          <h2
            className="
            mt-6
            text-2xl
            font-bold
            text-white
            "
          >
            Nenhum imóvel encontrado
          </h2>

          <p
            className="
            mt-3
            max-w-md
            text-center
            text-slate-400
            "
          >
            Tente alterar os filtros ou cadastre um novo imóvel para começar.
          </p>

          <Link
            to="/create-property"
            className="
            mt-8
            rounded-xl
            bg-blue-600
            px-6
            py-3
            font-semibold
            text-white
            transition
            hover:bg-blue-500
            "
          >
            Novo imóvel
          </Link>
        </div>
      )}
    </div>
  );
}

/* =====================================================
   COMPONENTES AUXILIARES
===================================================== */

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
    <div
      className="
      rounded-2xl
      border
      border-slate-800
      bg-slate-900
      p-5
      transition
      hover:border-blue-500
      "
    >
      <div
        className={`
        inline-flex
        rounded-xl
        p-3
        ${colors[color]}
      `}
      >
        {icon}
      </div>

      <p
        className="
        mt-4
        text-sm
        text-slate-400
        "
      >
        {title}
      </p>

      <h2
        className="
        mt-2
        text-3xl
        font-bold
        text-white
        "
      >
        {value}
      </h2>
    </div>
  );
}

function InfoItem({ icon, value }) {
  return (
    <div
      className="
      rounded-xl
      bg-slate-800
      p-3
      "
    >
      <div
        className="
        mb-2
        flex
        justify-center
        text-blue-400
        "
      >
        {icon}
      </div>

      <div
        className="
        text-sm
        font-semibold
        text-white
        "
      >
        {value ?? '-'}
      </div>
    </div>
  );
}

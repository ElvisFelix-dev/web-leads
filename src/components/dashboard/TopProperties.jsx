// src/components/dashboard/TopProperties.jsx
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
  BedDouble,
  Bath,
  Car,
  Ruler,
  DollarSign,
  Star,
  ChevronRight,
  Loader2,
  Sparkles,
  Award,
  Trophy,
  Crown,
  Medal,
  BarChart3,
  Zap,
} from 'lucide-react';

import { toast } from 'react-toastify';
import api from '../../service/api';

export default function TopProperties() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalContacts: 0,
    totalFavorites: 0,
    avgViews: 0,
    avgContacts: 0,
    conversionRate: 0,
  });
  const [timeRange, setTimeRange] = useState('30');
  const [sortBy, setSortBy] = useState('views');
  const [filterType, setFilterType] = useState('todos');
  const [meta, setMeta] = useState({});

  useEffect(() => {
    loadTopProperties();
  }, [timeRange, sortBy, filterType]);

  // Função para extrair estatísticas de forma consistente
  const getPropertyStats = (property) => {
    // Se tiver o objeto statistics (estrutura do MongoDB)
    if (property.statistics) {
      return {
        views: property.statistics.views || 0,
        contacts: property.statistics.contacts || 0,
        favorites: property.statistics.favorites || 0,
        conversionRate: property.statistics.conversionRate || 0,
      };
    }

    // Se tiver os campos diretamente no objeto (estrutura antiga)
    return {
      views: property.totalViews || property.views || 0,
      contacts: property.totalContacts || property.contacts || 0,
      favorites: property.totalFavorites || property.favorites || 0,
      conversionRate: property.conversionRate || 0,
    };
  };

  const loadTopProperties = async () => {
    try {
      setLoading(true);

      const response = await api.get('/api/properties/popular', {
        params: {
          days: timeRange,
          sort: sortBy,
          type: filterType !== 'todos' ? filterType : undefined,
          limit: 20,
          status: 'disponivel',
        },
      });

      console.log('📊 Top Properties Response:', response.data);

      const data = response.data?.data || response.data || [];
      const metaData = response.data?.meta || {};

      // Processar dados para garantir que as estatísticas estejam disponíveis
      const processedData = data.map((property) => {
        const stats = getPropertyStats(property);
        return {
          ...property,
          // Garantir que os campos estejam disponíveis em ambos os formatos
          totalViews: stats.views,
          totalContacts: stats.contacts,
          totalFavorites: stats.favorites,
          conversionRate: stats.conversionRate,
          // Manter o objeto statistics original se existir
          statistics: property.statistics || stats,
        };
      });

      setProperties(processedData);
      setMeta(metaData);

      // Calcular estatísticas totais
      const totalViews = processedData.reduce(
        (acc, p) => acc + (p.totalViews || 0),
        0,
      );
      const totalContacts = processedData.reduce(
        (acc, p) => acc + (p.totalContacts || 0),
        0,
      );
      const totalFavorites = processedData.reduce(
        (acc, p) => acc + (p.totalFavorites || 0),
        0,
      );

      const avgConversion =
        processedData.length > 0
          ? processedData.reduce((acc, p) => acc + (p.conversionRate || 0), 0) /
            processedData.length
          : 0;

      setStats({
        totalViews,
        totalContacts,
        totalFavorites,
        avgViews:
          processedData.length > 0
            ? Math.round(totalViews / processedData.length)
            : 0,
        avgContacts:
          processedData.length > 0
            ? Math.round(totalContacts / processedData.length)
            : 0,
        conversionRate: Math.round(avgConversion * 100) / 100,
      });
    } catch (error) {
      console.error('❌ Erro ao carregar top imóveis:', error);

      if (error.response?.status === 404) {
        toast.warning(
          'Rota de top imóveis não encontrada. Verifique o backend.',
        );
        setProperties([]);
      } else {
        toast.error('Erro ao carregar dados dos imóveis');
        const mockData = generateMockData();
        setProperties(mockData);
        setStats({
          totalViews: mockData.reduce((acc, p) => acc + p.totalViews, 0),
          totalContacts: mockData.reduce((acc, p) => acc + p.totalContacts, 0),
          totalFavorites: mockData.reduce(
            (acc, p) => acc + p.totalFavorites,
            0,
          ),
          avgViews: Math.round(
            mockData.reduce((acc, p) => acc + p.totalViews, 0) /
              mockData.length,
          ),
          avgContacts: Math.round(
            mockData.reduce((acc, p) => acc + p.totalContacts, 0) /
              mockData.length,
          ),
          conversionRate: 12.5,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Mock data para desenvolvimento (atualizado com a estrutura do MongoDB)
  const generateMockData = () => {
    const names = [
      'Cobertura Duplex em Moema',
      'Casa em Alphaville',
      'Apartamento em Pinheiros',
      'Cobertura em Vila Olímpia',
      'Casa em Jardim Paulista',
      'Apartamento em Itaim Bibi',
      'Cobertura em Perdizes',
      'Casa em Morumbi',
      'Apartamento em Vila Mariana',
      'Cobertura em Brooklin',
    ];

    return names.map((name, index) => ({
      _id: `mock-${index}`,
      name,
      type: ['apartamento', 'casa', 'cobertura', 'apartamento', 'casa'][
        index % 5
      ],
      price: 500000 + Math.random() * 1500000,
      location: {
        city: ['São Paulo', 'Barueri', 'São Paulo', 'São Paulo', 'São Paulo'][
          index % 5
        ],
        district: [
          'Moema',
          'Alphaville',
          'Pinheiros',
          'Vila Olímpia',
          'Jardim Paulista',
        ][index % 5],
      },
      bedrooms: 2 + Math.floor(Math.random() * 4),
      bathrooms: 1 + Math.floor(Math.random() * 3),
      parkingSpaces: 1 + Math.floor(Math.random() * 3),
      dimensions: {
        totalArea: 80 + Math.floor(Math.random() * 200),
      },
      // Usando a estrutura do MongoDB com objeto statistics
      statistics: {
        views: 100 + Math.floor(Math.random() * 900),
        contacts: 10 + Math.floor(Math.random() * 90),
        favorites: 5 + Math.floor(Math.random() * 45),
        conversionRate: 5 + Math.random() * 20,
      },
      // Também mantendo os campos diretos para compatibilidade
      totalViews: 100 + Math.floor(Math.random() * 900),
      totalContacts: 10 + Math.floor(Math.random() * 90),
      totalFavorites: 5 + Math.floor(Math.random() * 45),
      conversionRate: 5 + Math.random() * 20,
      status: [
        'disponivel',
        'disponivel',
        'vendido',
        'disponivel',
        'reservado',
      ][index % 5],
      coverImage: `https://picsum.photos/seed/${index + 100}/400/300`,
      images: [{ url: `https://picsum.photos/seed/${index + 100}/400/300` }],
    }));
  };

  const formatCurrency = (value) => {
    if (!value || value === 0) return 'R$ 0';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusColor = (status) => {
    const colors = {
      disponivel: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      vendido: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      reservado: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      alugado: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    };
    return (
      colors[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    );
  };

  const getStatusLabel = (status) => {
    const labels = {
      disponivel: 'Disponível',
      vendido: 'Vendido',
      reservado: 'Reservado',
      alugado: 'Alugado',
    };
    return labels[status] || status || 'Desconhecido';
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown size={20} className="text-yellow-400" />;
    if (rank === 2) return <Medal size={20} className="text-slate-300" />;
    if (rank === 3) return <Medal size={20} className="text-amber-600" />;
    return <Award size={20} className="text-slate-500" />;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'border-yellow-500/30 bg-yellow-500/10';
    if (rank === 2) return 'border-slate-400/30 bg-slate-400/10';
    if (rank === 3) return 'border-amber-600/30 bg-amber-600/10';
    return 'border-slate-700/30 bg-slate-700/10';
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-3 text-slate-400">Carregando dados...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <BarChart3 size={22} className="text-blue-400" />
            Imóveis em Destaque
          </h2>
          <p className="text-sm text-slate-400">
            Rankings de visualizações, contatos e engajamento
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="60">Últimos 60 dias</option>
            <option value="90">Últimos 90 dias</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500"
          >
            <option value="views">Mais Visualizados</option>
            <option value="contacts">Mais Contatos</option>
            <option value="favorites">Mais Favoritados</option>
            <option value="conversion">Melhor Conversão</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-white outline-none focus:border-blue-500"
          >
            <option value="todos">Todos os tipos</option>
            <option value="apartamento">Apartamentos</option>
            <option value="casa">Casas</option>
            <option value="cobertura">Coberturas</option>
            <option value="comercial">Comerciais</option>
            <option value="terreno">Terrenos</option>
          </select>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<Eye size={18} />}
          label="Visualizações"
          value={stats.totalViews.toLocaleString()}
          subtitle={`Média ${stats.avgViews} por imóvel`}
          color="blue"
        />
        <StatCard
          icon={<MessageCircle size={18} />}
          label="Contatos"
          value={stats.totalContacts.toLocaleString()}
          subtitle={`Média ${stats.avgContacts} por imóvel`}
          color="emerald"
        />
        <StatCard
          icon={<Heart size={18} />}
          label="Favoritos"
          value={stats.totalFavorites.toLocaleString()}
          subtitle="Total acumulado"
          color="rose"
        />
        <StatCard
          icon={<TrendingUp size={18} />}
          label="Taxa de Conversão"
          value={`${stats.conversionRate || 0}%`}
          subtitle={`${properties.filter((p) => p.totalContacts > 0).length} imóveis com contatos`}
          color="purple"
        />
      </div>

      {/* PROPERTY LIST */}
      {properties.length > 0 ? (
        <div className="space-y-4">
          {properties.map((property, index) => (
            <PropertyRankCard
              key={property._id}
              property={property}
              rank={index + 1}
              sortBy={sortBy}
              onClick={() => navigate(`/propertycrm-details/${property._id}`)}
              getStatusColor={getStatusColor}
              getStatusLabel={getStatusLabel}
              formatCurrency={formatCurrency}
              getRankIcon={getRankIcon}
              getRankColor={getRankColor}
            />
          ))}
        </div>
      ) : (
        <EmptyState />
      )}

      {/* FOOTER */}
      {properties.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{meta.total || properties.length} imóveis encontrados</span>
          <span className="flex items-center gap-1">
            <Sparkles size={12} className="text-blue-400" />
            Dados atualizados em tempo real
          </span>
        </div>
      )}
    </div>
  );
}

/*
======================================
SUBCOMPONENTES
======================================
*/

function StatCard({ icon, label, value, subtitle, color }) {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  return (
    <div className={`rounded-xl border ${colors[color]} bg-slate-900/50 p-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={colors[color]}>{icon}</span>
          <span className="text-xs text-slate-400">{label}</span>
        </div>
      </div>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-500">{subtitle}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-900/30 py-12">
      <Home size={40} className="text-slate-600" />
      <h4 className="mt-3 text-lg font-medium text-white">
        Nenhum imóvel encontrado
      </h4>
      <p className="mt-1 text-sm text-slate-400">
        Cadastre imóveis para ver as estatísticas de engajamento.
      </p>
    </div>
  );
}

function PropertyRankCard({
  property,
  rank,
  sortBy,
  onClick,
  getStatusColor,
  getStatusLabel,
  formatCurrency,
  getRankIcon,
  getRankColor,
}) {
  const getImage = (property) => {
    if (property.coverImage) return property.coverImage;
    if (property.images && property.images.length > 0) {
      const cover = property.images.find((img) => img.isCover);
      return cover?.url || property.images[0]?.url;
    }
    return null;
  };

  const image = getImage(property);

  // Função para extrair estatísticas do objeto property
  const getStats = (property) => {
    // Se tiver o objeto statistics (estrutura do MongoDB)
    if (property.statistics) {
      return {
        views: property.statistics.views || 0,
        contacts: property.statistics.contacts || 0,
        favorites: property.statistics.favorites || 0,
        conversionRate: property.statistics.conversionRate || 0,
      };
    }

    // Se tiver os campos diretamente no objeto
    return {
      views: property.totalViews || property.views || 0,
      contacts: property.totalContacts || property.contacts || 0,
      favorites: property.totalFavorites || property.favorites || 0,
      conversionRate: property.conversionRate || 0,
    };
  };

  const stats = getStats(property);

  // Pegando todos os valores das métricas
  const views = stats.views;
  const contacts = stats.contacts;
  const favorites = stats.favorites;
  const conversion = stats.conversionRate;

  // Formatar valores
  const formatMetric = (value) => {
    return typeof value === 'number' ? value.toLocaleString() : value;
  };

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition hover:border-blue-500/50 hover:bg-slate-800/50"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        {/* RANK */}
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${getRankColor(rank)}`}
        >
          {getRankIcon(rank)}
        </div>

        {/* IMAGE */}
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-800">
          {image ? (
            <img
              src={image}
              alt={property.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '';
                e.currentTarget.className = 'hidden';
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-600">
              <Building2 size={24} />
            </div>
          )}
        </div>

        {/* INFO */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold text-white truncate">
              {property.name}
            </h4>
            <span
              className={`rounded-full border px-2 py-0.5 text-xs ${getStatusColor(property.status)}`}
            >
              {getStatusLabel(property.status)}
            </span>
            {property.featured && (
              <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-400">
                <Star size={10} className="inline mr-0.5" />
                Destaque
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin size={13} />
              {property.location?.district ||
                property.location?.city ||
                'Localização não informada'}
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <DollarSign size={13} />
              {formatCurrency(property.prices?.salePrice || property.price)}
            </span>
            <span className="flex items-center gap-1">
              <Ruler size={13} />
              {property.dimensions?.totalArea || property.area || 0}m²
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-3 text-xs">
            {property.bedrooms > 0 && (
              <span className="flex items-center gap-1 text-slate-400">
                <BedDouble size={12} />
                {property.bedrooms}
              </span>
            )}
            {property.bathrooms > 0 && (
              <span className="flex items-center gap-1 text-slate-400">
                <Bath size={12} />
                {property.bathrooms}
              </span>
            )}
            {property.parkingSpaces > 0 && (
              <span className="flex items-center gap-1 text-slate-400">
                <Car size={12} />
                {property.parkingSpaces}
              </span>
            )}
            {property.suites > 0 && (
              <span className="flex items-center gap-1 text-slate-400">
                <Star size={12} />
                {property.suites} suítes
              </span>
            )}
          </div>
        </div>

        {/* MÉTRICAS - TODAS AS MÉTRICAS VISÍVEIS */}
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-4 lg:flex-col lg:items-end">
          {/* Visualizações */}
          <div className="flex items-center gap-2">
            <Eye size={14} className="text-blue-400" />
            <span className="text-sm text-white font-medium">
              {formatMetric(views)}
            </span>
            <span className="text-xs text-slate-500">visualizações</span>
          </div>

          {/* Contatos */}
          <div className="flex items-center gap-2">
            <MessageCircle size={14} className="text-emerald-400" />
            <span className="text-sm text-white font-medium">
              {formatMetric(contacts)}
            </span>
            <span className="text-xs text-slate-500">contatos</span>
          </div>

          {/* Favoritos */}
          <div className="flex items-center gap-2">
            <Heart size={14} className="text-rose-400" />
            <span className="text-sm text-white font-medium">
              {formatMetric(favorites)}
            </span>
            <span className="text-xs text-slate-500">favoritos</span>
          </div>

          {/* Taxa de Conversão (se disponível) */}
          {conversion > 0 && (
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-purple-400" />
              <span className="text-sm text-white font-medium">
                {Math.round(conversion)}%
              </span>
              <span className="text-xs text-slate-500">conversão</span>
            </div>
          )}

          <ChevronRight
            size={16}
            className="text-slate-600 opacity-0 transition group-hover:opacity-100"
          />
        </div>
      </div>
    </div>
  );
}

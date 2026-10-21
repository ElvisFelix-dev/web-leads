// src/pages/PropertyList.jsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import {
  Home,
  ArrowLeft,
  Plus,
  Search,
  RefreshCcw,
  Download,
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle2,
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
  Clock3,
  Archive,
  EyeOff,
  RotateCcw,
} from 'lucide-react';

import useProperties from '../hooks/useProperties';
import { importPropertiesCSV } from '../services/propertyApi';

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export default function PropertyList() {
  const navigate = useNavigate();
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
    fetchAllPropertiesForExport,
  } = useProperties();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [purposeFilter, setPurposeFilter] = useState('todos');
  const [view, setView] = useState('grid');
  const [actionLoading, setActionLoading] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [importRows, setImportRows] = useState([]);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);

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
        statusFilter === 'todos'
          ? true
          : statusFilter === 'published'
            ? property.status === 'disponivel' && property.published === true
            : statusFilter === 'draft'
              ? property.status === 'rascunho' ||
                (property.status === 'disponivel' &&
                  property.published === false)
              : statusFilter === 'archived'
                ? property.status === 'arquivado'
                : property.status === statusFilter;

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
  // EXPORTAR IMÓVEIS FILTRADOS PARA CSV
  // ============================================================

  const handleExportCSV = async () => {
    const toastId = toast.loading(
      'Carregando todos os imóveis para exportação...',
    );

    try {
      const allProperties = await fetchAllPropertiesForExport();

      const normalizedSearch = search.trim().toLowerCase();

      const exportProperties = allProperties.filter((property) => {
        if (!property) return false;

        const matchSearch =
          property.name?.toLowerCase().includes(normalizedSearch) ||
          property.location?.city?.toLowerCase().includes(normalizedSearch) ||
          property.location?.district
            ?.toLowerCase()
            .includes(normalizedSearch) ||
          property.code?.toLowerCase().includes(normalizedSearch);

        const matchStatus =
          statusFilter === 'todos'
            ? true
            : statusFilter === 'published'
              ? property.status === 'disponivel' && property.published === true
              : statusFilter === 'draft'
                ? property.status === 'rascunho' ||
                  (property.status === 'disponivel' &&
                    property.published === false)
                : statusFilter === 'archived'
                  ? property.status === 'arquivado'
                  : property.status === statusFilter;

        const matchPurpose =
          purposeFilter === 'todos' ? true : property.purpose === purposeFilter;

        return matchSearch && matchStatus && matchPurpose;
      });

      if (!exportProperties.length) {
        toast.update(toastId, {
          render: 'Não há imóveis para exportar com os filtros atuais.',
          type: 'info',
          isLoading: false,
          autoClose: 3000,
        });
        return;
      }

      const csvEscape = (value) => {
        const normalized =
          value === null || value === undefined ? '' : String(value);
        return `"${normalized.replace(/"/g, '""')}"`;
      };

      const headers = [
        'Nome',
        'Código',
        'Finalidade',
        'Status',
        'Preço de venda (R$)',
        'Preço de aluguel (R$)',
        'Taxa de condomínio (R$)',
        'IPTU (R$)',
        'Cidade',
        'Estado',
        'Bairro',
        'CEP',
        'Tipo',
        'Categoria',
        'Quartos',
        'Suítes',
        'Banheiros',
        'Vagas',
        'Área total (m²)',
        'Área construída (m²)',
        'Mobiliado',
        'Aceita pets',
        'Aceita financiamento',
        'Aceita FGTS',
        'Destaque',
        'Exclusivo',
        'Ativo',
        'Publicado',
        'Características',
        'Nome do corretor',
        'E-mail do corretor',
        'Telefone do corretor',
        'Data de cadastro',
        'Última atualização',
      ];

      const rows = exportProperties.map((property) => [
        property.name,
        property.code,
        property.purpose,
        property.status,
        property.prices?.salePrice,
        property.prices?.rentPrice,
        property.prices?.condominiumFee,
        property.prices?.iptu,
        property.location?.city,
        property.location?.state,
        property.location?.district,
        property.location?.zipCode,
        property.type,
        property.category,
        property.bedrooms,
        property.suites,
        property.bathrooms,
        property.parkingSpaces,
        property.dimensions?.totalArea,
        property.dimensions?.builtArea,
        property.furnished ? 'Sim' : 'Não',
        property.acceptsPets ? 'Sim' : 'Não',
        property.acceptsFinancing ? 'Sim' : 'Não',
        property.acceptsFGTS ? 'Sim' : 'Não',
        property.featured ? 'Sim' : 'Não',
        property.exclusive ? 'Sim' : 'Não',
        property.active ? 'Sim' : 'Não',
        property.published ? 'Sim' : 'Não',
        Array.isArray(property.features) ? property.features.join(' | ') : '',
        property.broker?.name,
        property.broker?.email,
        property.broker?.phone,
        property.createdAt
          ? new Date(property.createdAt).toLocaleDateString('pt-BR')
          : '',
        property.updatedAt
          ? new Date(property.updatedAt).toLocaleDateString('pt-BR')
          : '',
      ]);

      const csvContent = [
        headers.map(csvEscape).join(';'),
        ...rows.map((row) => row.map(csvEscape).join(';')),
      ].join('\r\n');

      const blob = new Blob(['\uFEFF', csvContent], {
        type: 'text/csv;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const date = new Date().toISOString().slice(0, 10);

      link.href = url;
      link.download = `imoveis-${date}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      toast.update(toastId, {
        render: `${exportProperties.length} imóvel(is) exportado(s) com sucesso.`,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      });
    } catch (err) {
      console.error('Erro ao exportar imóveis:', err);
      toast.update(toastId, {
        render: err?.message || 'Erro ao exportar imóveis para CSV.',
        type: 'error',
        isLoading: false,
        autoClose: 4000,
      });
    }
  };

  // ============================================================
  // IMPORTAR IMÓVEIS CSV
  // ============================================================

  const parseCSV = (text) => {
    const firstLine = text.split(/\r?\n/, 1)[0] || '';
    const delimiter =
      (firstLine.match(/;/g) || []).length >=
      (firstLine.match(/,/g) || []).length
        ? ';'
        : ',';
    const rows = [];
    let row = [];
    let cell = '';
    let quoted = false;

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const next = text[i + 1];

      if (char === '"' && quoted && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = !quoted;
      } else if (char === delimiter && !quoted) {
        row.push(cell);
        cell = '';
      } else if ((char === '\n' || char === '\r') && !quoted) {
        if (char === '\r' && next === '\n') i += 1;
        row.push(cell);
        if (row.some((value) => String(value).trim() !== '')) rows.push(row);
        row = [];
        cell = '';
      } else {
        cell += char;
      }
    }

    row.push(cell);
    if (row.some((value) => String(value).trim() !== '')) rows.push(row);
    if (rows.length < 2)
      throw new Error('O CSV precisa conter cabeçalho e pelo menos um imóvel.');

    const normalizeHeader = (header) =>
      String(header || '')
        .replace(/^\uFEFF/, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();

    const headers = rows[0].map(normalizeHeader);
    return rows.slice(1).map((values) => {
      const raw = {};
      headers.forEach((header, index) => {
        raw[header] = String(values[index] ?? '').trim();
      });

      const get = (...keys) => {
        for (const key of keys) {
          const value = raw[normalizeHeader(key)];
          if (value !== undefined) return value;
        }
        return '';
      };
      const number = (value) => {
        if (!value) return 0;
        let normalized = String(value).trim().replace(/\s/g, '');
        if (normalized.includes(',') && normalized.includes('.')) {
          normalized = normalized.replace(/\./g, '').replace(',', '.');
        } else if (normalized.includes(',')) {
          normalized = normalized.replace(',', '.');
        }
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : 0;
      };
      const boolean = (value, fallback = false) => {
        if (!value) return fallback;
        return ['sim', 's', 'true', '1', 'yes', 'y'].includes(
          String(value).trim().toLowerCase(),
        );
      };
      const enumValue = (value) =>
        String(value || '')
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/\s+/g, '_');

      return {
        name: get('Nome', 'name'),
        code: get('Código', 'Codigo', 'code'),
        purpose: enumValue(get('Finalidade', 'purpose')) || 'venda',
        status: enumValue(get('Status', 'status')) || 'disponivel',
        type: enumValue(get('Tipo', 'type')),
        category: enumValue(get('Categoria', 'category')),
        prices: {
          salePrice: number(
            get('Preço de venda (R$)', 'Preco de venda (R$)', 'salePrice'),
          ),
          rentPrice: number(
            get('Preço de aluguel (R$)', 'Preco de aluguel (R$)', 'rentPrice'),
          ),
          condominiumFee: number(
            get(
              'Taxa de condomínio (R$)',
              'Taxa de condominio (R$)',
              'condominiumFee',
            ),
          ),
          iptu: number(get('IPTU (R$)', 'iptu')),
        },
        location: {
          city: get('Cidade', 'city'),
          state: get('Estado', 'state'),
          district: get('Bairro', 'district'),
          zipCode: get('CEP', 'zipCode'),
        },
        bedrooms: number(get('Quartos', 'bedrooms')),
        suites: number(get('Suítes', 'Suites', 'suites')),
        bathrooms: number(get('Banheiros', 'bathrooms')),
        parkingSpaces: number(get('Vagas', 'parkingSpaces')),
        dimensions: {
          totalArea: number(
            get('Área total (m²)', 'Area total (m²)', 'totalArea'),
          ),
          builtArea: number(
            get('Área construída (m²)', 'Area construida (m²)', 'builtArea'),
          ),
        },
        furnished: boolean(get('Mobiliado', 'furnished')),
        acceptsPets: boolean(get('Aceita pets', 'acceptsPets')),
        acceptsFinancing: boolean(
          get('Aceita financiamento', 'acceptsFinancing'),
          true,
        ),
        acceptsFGTS: boolean(get('Aceita FGTS', 'acceptsFGTS')),
        featured: boolean(get('Destaque', 'featured')),
        exclusive: boolean(get('Exclusivo', 'exclusive')),
        active: boolean(get('Ativo', 'active'), true),
        published: boolean(get('Publicado', 'published'), true),
        features: get('Características', 'Caracteristicas', 'features')
          .split('|')
          .map((feature) => feature.trim())
          .filter(Boolean),
      };
    });
  };

  const handleImportFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!/\.csv$/i.test(file.name)) {
      toast.error('Selecione um arquivo .csv.');
      return;
    }

    try {
      const content = await file.text();
      const rows = parseCSV(content);
      if (rows.length > 500) {
        toast.error('O limite é de 500 imóveis por importação.');
        return;
      }
      const invalidRows = rows
        .map((row, index) => (!row.name || !row.type ? index + 2 : null))
        .filter(Boolean);

      setImportFile(file);
      setImportRows(rows);
      setImportResult(null);
      setImportModalOpen(true);

      if (invalidRows.length) {
        toast.warning(
          `Confira as linhas ${invalidRows.slice(0, 8).join(', ')}: nome e tipo são obrigatórios.`,
        );
      }
    } catch (error) {
      toast.error(error?.message || 'Não foi possível ler o CSV.');
    }
  };

  const handleConfirmImport = async () => {
    if (!importRows.length || importLoading) return;
    const invalidCount = importRows.filter(
      (row) => !row.name || !row.type,
    ).length;
    if (invalidCount) {
      toast.error(
        `Corrija ${invalidCount} linha(s) sem nome ou tipo antes de importar.`,
      );
      return;
    }

    setImportLoading(true);
    const toastId = toast.loading(`Importando ${importRows.length} imóveis...`);
    try {
      const result = await importPropertiesCSV(importRows);
      setImportResult(result);
      toast.update(toastId, {
        render: `Importação concluída: ${result.imported || 0} importado(s), ${result.failed || 0} com erro, ${result.skipped || 0} duplicado(s).`,
        type: result.failed || result.skipped ? 'warning' : 'success',
        isLoading: false,
        autoClose: 6000,
      });
      await fetchProperties();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Erro ao importar imóveis.';
      toast.update(toastId, {
        render: message,
        type: 'error',
        isLoading: false,
        autoClose: 5000,
      });
    } finally {
      setImportLoading(false);
    }
  };

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

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-3 font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
            >
              <ArrowLeft size={18} />
              Voltar
            </button>

            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-blue-400/40 bg-blue-600/20 px-5 py-3 font-semibold text-blue-200 shadow-lg shadow-blue-950/20 transition hover:border-blue-300/60 hover:bg-blue-600/30 focus-within:ring-2 focus-within:ring-blue-500/60">
              <Upload size={18} />
              Importar CSV
              <input
                type="file"
                accept=".csv,text/csv"
                className="sr-only"
                onChange={handleImportFileChange}
                disabled={importLoading}
                aria-label="Selecionar arquivo CSV para importar imóveis"
              />
            </label>

            <Link
              to="/create-property"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-950/20 transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400/60"
            >
              <Plus size={18} />
              Novo imóvel
            </Link>
          </div>
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
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative min-w-[240px] flex-[1_1_320px]">
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
            onClick={handleExportCSV}
            disabled={loading || filteredProperties.length === 0}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
            title="Exportar os imóveis exibidos pelos filtros atuais"
          >
            <Download size={18} />
            Exportar CSV
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

      {/* MODAL DE PRÉ-VISUALIZAÇÃO E RESULTADO DA IMPORTAÇÃO */}
      {importModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-700 bg-slate-950 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-800 p-6">
              <div>
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-blue-500/15 p-3 text-blue-300">
                    <FileSpreadsheet size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {importResult
                        ? 'Resultado da importação'
                        : 'Importar imóveis'}
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      {importFile?.name} · {importRows.length} registro(s)
                      detectado(s)
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!importLoading) {
                    setImportModalOpen(false);
                    setImportRows([]);
                    setImportFile(null);
                    setImportResult(null);
                  }
                }}
                disabled={importLoading}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
                aria-label="Fechar"
              >
                <X size={20} />
              </button>
            </div>

            {importResult ? (
              <div className="max-h-[65vh] space-y-5 overflow-y-auto p-6">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                    <p className="text-sm text-emerald-300">Importados</p>
                    <p className="mt-2 text-3xl font-bold text-white">
                      {importResult.imported || 0}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
                    <p className="text-sm text-red-300">Com erro</p>
                    <p className="mt-2 text-3xl font-bold text-white">
                      {importResult.failed || 0}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                    <p className="text-sm text-amber-300">
                      Duplicados ignorados
                    </p>
                    <p className="mt-2 text-3xl font-bold text-white">
                      {importResult.skipped || 0}
                    </p>
                  </div>
                </div>
                {importResult.errors?.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-white">
                      Registros que precisam de atenção
                    </h3>
                    {importResult.errors.map((item, index) => (
                      <div
                        key={`${item.line}-${index}`}
                        className="rounded-xl border border-slate-800 bg-slate-900 p-4"
                      >
                        <p className="font-medium text-white">
                          Linha {item.line}:{' '}
                          {item.name || item.code || 'Imóvel sem identificação'}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          {item.message}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="max-h-[65vh] overflow-auto p-6">
                <div className="mb-5 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 text-sm text-blue-100">
                  Confira a prévia antes de importar. Nome e tipo são
                  obrigatórios. O backend validará os enums do seu model;
                  registros inválidos serão reportados individualmente.
                </div>
                <div className="mb-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-900 p-4">
                    <p className="text-xs text-slate-400">Total de registros</p>
                    <p className="mt-1 text-2xl font-bold text-white">
                      {importRows.length}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-900 p-4">
                    <p className="text-xs text-slate-400">
                      Linhas aparentemente válidas
                    </p>
                    <p className="mt-1 text-2xl font-bold text-emerald-300">
                      {importRows.filter((row) => row.name && row.type).length}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-900 p-4">
                    <p className="text-xs text-slate-400">Linhas incompletas</p>
                    <p className="mt-1 text-2xl font-bold text-amber-300">
                      {
                        importRows.filter((row) => !row.name || !row.type)
                          .length
                      }
                    </p>
                  </div>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
                    <thead className="bg-slate-900 text-xs uppercase text-slate-400">
                      <tr>
                        <th className="px-4 py-3">#</th>
                        <th className="px-4 py-3">Imóvel</th>
                        <th className="px-4 py-3">Tipo</th>
                        <th className="px-4 py-3">Finalidade</th>
                        <th className="px-4 py-3">Cidade</th>
                        <th className="px-4 py-3">Código</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {importRows.slice(0, 30).map((row, index) => (
                        <tr
                          key={`${row.code || row.name}-${index}`}
                          className="text-slate-300"
                        >
                          <td className="px-4 py-3 text-slate-500">
                            {index + 2}
                          </td>
                          <td className="px-4 py-3 font-medium text-white">
                            {row.name || '—'}
                          </td>
                          <td className="px-4 py-3">{row.type || '—'}</td>
                          <td className="px-4 py-3">{row.purpose || '—'}</td>
                          <td className="px-4 py-3">
                            {row.location?.city || '—'}
                          </td>
                          <td className="px-4 py-3">
                            {row.code || 'Gerado automaticamente'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {importRows.length > 30 && (
                  <p className="mt-3 text-sm text-slate-500">
                    Exibindo os primeiros 30 registros; todos os{' '}
                    {importRows.length} serão processados.
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-800 p-6 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  if (!importLoading) {
                    setImportModalOpen(false);
                    setImportRows([]);
                    setImportFile(null);
                    setImportResult(null);
                  }
                }}
                disabled={importLoading}
                className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 transition hover:bg-slate-900 disabled:opacity-50"
              >
                {importResult ? 'Fechar' : 'Cancelar'}
              </button>
              {!importResult && (
                <button
                  type="button"
                  onClick={handleConfirmImport}
                  disabled={
                    importLoading ||
                    !importRows.length ||
                    importRows.some((row) => !row.name || !row.type)
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle2 size={18} />
                  {importLoading
                    ? 'Importando...'
                    : `Confirmar importação (${importRows.length})`}
                </button>
              )}
            </div>
          </div>
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

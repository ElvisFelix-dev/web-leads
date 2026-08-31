import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaSearch,
  FaPlus,
  FaFilter,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaFileContract,
  FaTimesCircle,
  FaSyncAlt,
  FaMoneyBillWave,
  FaUser,
  FaBuilding,
  FaCalendarAlt,
  FaArrowRight,
} from 'react-icons/fa';

import { useSales } from '../../hooks/useSales';
import SaleStatusBadge from '../../components/admin/SaleStatusBadge';

export default function SalesAdmin() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    status: '',
  });

  const { sales, pagination, loading, error, refetch } = useSales(filters);

  // =========================================================
  // HELPERS
  // =========================================================

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  const formatDate = (date) => {
    if (!date) return '—';

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return '—';
    }

    return parsed.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatShortCurrency = (value) => {
    const amount = Number(value || 0);

    if (amount >= 1000000) {
      return `R$ ${(amount / 1000000).toFixed(1).replace('.', ',')} mi`;
    }

    if (amount >= 1000) {
      return `R$ ${(amount / 1000).toFixed(0).replace('.', ',')} mil`;
    }

    return formatCurrency(amount);
  };

  const completedSales = sales.filter(
    (sale) => sale.status === 'completed',
  ).length;

  const pendingSales = sales.filter((sale) => sale.status === 'pending').length;

  const contractSales = sales.filter(
    (sale) => sale.status === 'contract',
  ).length;

  const cancelledSales = sales.filter(
    (sale) => sale.status === 'cancelled',
  ).length;

  const visibleSalesValue = sales.reduce(
    (total, sale) => total + Number(sale.saleAmount || 0),
    0,
  );

  // =========================================================
  // HANDLERS
  // =========================================================

  const handleSearch = (e) => {
    e.preventDefault();

    setFilters((prev) => ({
      ...prev,
      page: 1,
    }));

    refetch();
  };

  const handleStatusFilter = (status) => {
    setFilters((prev) => ({
      ...prev,
      status,
      page: 1,
    }));

    refetch();
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > pagination.pages) return;

    setFilters((prev) => ({
      ...prev,
      page,
    }));

    refetch();
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      search: '',
      status: '',
    });

    refetch();
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080b12] text-white">
        <div className="max-w-[1600px] mx-auto p-6 lg:p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-64 bg-gray-800 rounded-xl" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-32 bg-gray-900 border border-gray-800 rounded-2xl"
                />
              ))}
            </div>

            <div className="h-20 bg-gray-900 border border-gray-800 rounded-2xl" />

            <div className="h-[500px] bg-gray-900 border border-gray-800 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="min-h-screen bg-[#080b12] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-gray-900/80 border border-red-500/20 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-14 h-14 mx-auto mb-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <FaTimesCircle className="text-red-400 text-2xl" />
          </div>

          <h2 className="text-lg font-semibold mb-2">
            Não foi possível carregar as vendas
          </h2>

          <p className="text-sm text-gray-400 mb-6">{error}</p>

          <button
            type="button"
            onClick={refetch}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold transition-all"
          >
            <FaSyncAlt size={13} />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-[#080b12] text-white">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <header className="mb-8">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <FaChartLine className="text-blue-400" />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-blue-400 font-semibold">
                    Comercial
                  </p>

                  <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
                    Gerenciar Vendas
                  </h1>
                </div>
              </div>

              <p className="text-sm text-gray-500 max-w-2xl">
                Acompanhe negociações, contratos, valores e vendas concluídas em
                um único lugar.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={refetch}
                className="hidden sm:inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl border border-gray-800 bg-gray-900/70 text-gray-300 hover:text-white hover:border-gray-700 transition-all"
                title="Atualizar vendas"
              >
                <FaSyncAlt size={13} />
                Atualizar
              </button>

              <Link
                to="/sales/create"
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/20 font-semibold text-sm transition-all"
              >
                <FaPlus size={14} />
                Nova Venda
              </Link>
            </div>
          </div>
        </header>

        {/* =====================================================
            KPI CARDS
        ====================================================== */}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {/* Total */}
          <div className="relative overflow-hidden bg-gray-900/70 border border-gray-800 rounded-2xl p-5">
            <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-blue-500/5 blur-2xl" />

            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">
                  Vendas no período
                </p>

                <p className="text-2xl font-bold mt-2">
                  {pagination?.total || 0}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Registros encontrados
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <FaChartLine className="text-blue-400" />
              </div>
            </div>
          </div>

          {/* Concluídas */}
          <div className="relative overflow-hidden bg-gray-900/70 border border-gray-800 rounded-2xl p-5">
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">
                  Concluídas
                </p>

                <p className="text-2xl font-bold mt-2">{completedSales}</p>

                <p className="text-xs text-emerald-400 mt-1">
                  Negócios finalizados
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <FaCheckCircle className="text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Em contrato */}
          <div className="relative overflow-hidden bg-gray-900/70 border border-gray-800 rounded-2xl p-5">
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">
                  Em contrato
                </p>

                <p className="text-2xl font-bold mt-2">{contractSales}</p>

                <p className="text-xs text-yellow-400 mt-1">
                  Negociações em andamento
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                <FaFileContract className="text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Valor */}
          <div className="relative overflow-hidden bg-gray-900/70 border border-gray-800 rounded-2xl p-5">
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">
                  Volume exibido
                </p>

                <p className="text-2xl font-bold mt-2 text-emerald-400">
                  {formatShortCurrency(visibleSalesValue)}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Soma dos registros atuais
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <FaMoneyBillWave className="text-emerald-400" />
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            STATUS SUMMARY
        ====================================================== */}

        <section className="flex flex-wrap items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => handleStatusFilter('')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              !filters.status
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                : 'bg-gray-900/50 text-gray-500 border-gray-800 hover:text-gray-300'
            }`}
          >
            Todos
            <span className="px-1.5 py-0.5 rounded-md bg-gray-800 text-gray-400">
              {pagination?.total || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleStatusFilter('pending')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              filters.status === 'pending'
                ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                : 'bg-gray-900/50 text-gray-500 border-gray-800 hover:text-gray-300'
            }`}
          >
            <FaClock size={11} />
            Pendentes
            <span className="px-1.5 py-0.5 rounded-md bg-gray-800 text-gray-400">
              {pendingSales}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleStatusFilter('contract')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              filters.status === 'contract'
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                : 'bg-gray-900/50 text-gray-500 border-gray-800 hover:text-gray-300'
            }`}
          >
            <FaFileContract size={11} />
            Contratos
            <span className="px-1.5 py-0.5 rounded-md bg-gray-800 text-gray-400">
              {contractSales}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleStatusFilter('completed')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              filters.status === 'completed'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-gray-900/50 text-gray-500 border-gray-800 hover:text-gray-300'
            }`}
          >
            <FaCheckCircle size={11} />
            Concluídas
            <span className="px-1.5 py-0.5 rounded-md bg-gray-800 text-gray-400">
              {completedSales}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleStatusFilter('cancelled')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              filters.status === 'cancelled'
                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                : 'bg-gray-900/50 text-gray-500 border-gray-800 hover:text-gray-300'
            }`}
          >
            <FaTimesCircle size={11} />
            Canceladas
            <span className="px-1.5 py-0.5 rounded-md bg-gray-800 text-gray-400">
              {cancelledSales}
            </span>
          </button>
        </section>

        {/* =====================================================
            FILTER BAR
        ====================================================== */}

        <section className="bg-gray-900/70 border border-gray-800 rounded-2xl p-4 mb-6 shadow-xl shadow-black/5">
          <form
            onSubmit={handleSearch}
            className="flex flex-col lg:flex-row gap-3"
          >
            {/* Busca */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm" />

              <input
                type="text"
                placeholder="Buscar por número da venda..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    search: e.target.value,
                  }))
                }
                className="w-full h-11 bg-gray-950/70 border border-gray-800 rounded-xl pl-11 pr-4 text-sm text-white placeholder-gray-600 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 focus:outline-none transition-all"
              />
            </div>

            {/* Status */}
            <div className="relative min-w-[220px]">
              <FaFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-xs pointer-events-none" />

              <select
                value={filters.status}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="w-full h-11 appearance-none bg-gray-950/70 border border-gray-800 rounded-xl pl-10 pr-10 text-sm text-gray-300 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10 focus:outline-none transition-all cursor-pointer"
              >
                <option value="">Todos os status</option>
                <option value="pending">Pendente</option>
                <option value="contract">Em Contrato</option>
                <option value="completed">Concluída</option>
                <option value="cancelled">Cancelada</option>
              </select>

              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none">
                ▾
              </span>
            </div>

            <button
              type="submit"
              className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold transition-all"
            >
              Buscar
            </button>

            <button
              type="button"
              onClick={handleClearFilters}
              className="h-11 px-5 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-700 text-sm font-medium text-gray-300 hover:text-white transition-all"
            >
              Limpar
            </button>
          </form>
        </section>

        {/* =====================================================
            TABLE
        ====================================================== */}

        <section className="bg-gray-900/70 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/10">
          {/* Table Header */}
          <div className="px-5 lg:px-6 py-4 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-white">Vendas</h2>

              <p className="text-xs text-gray-500 mt-0.5">
                {pagination?.total || 0} registros encontrados
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Dados atualizados
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr className="border-b border-gray-800 bg-gray-950/30">
                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-[0.14em]">
                    Venda
                  </th>

                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-[0.14em]">
                    Cliente
                  </th>

                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-[0.14em]">
                    Imóvel
                  </th>

                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-[0.14em]">
                    Valor
                  </th>

                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-[0.14em]">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-[10px] font-bold text-gray-500 uppercase tracking-[0.14em]">
                    Data
                  </th>

                  <th className="px-6 py-4 text-right text-[10px] font-bold text-gray-500 uppercase tracking-[0.14em]">
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-800/80">
                {sales.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-20">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-gray-800/70 border border-gray-700/70 flex items-center justify-center mb-4">
                          <FaSearch className="text-gray-600 text-xl" />
                        </div>

                        <h3 className="text-sm font-semibold text-gray-300">
                          Nenhuma venda encontrada
                        </h3>

                        <p className="text-xs text-gray-600 mt-1 max-w-sm">
                          Tente alterar os filtros ou realizar uma nova busca.
                        </p>

                        {(filters.search || filters.status) && (
                          <button
                            type="button"
                            onClick={handleClearFilters}
                            className="mt-4 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Limpar filtros
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  sales.map((sale) => (
                    <tr
                      key={sale._id}
                      className="group hover:bg-gray-800/30 transition-colors"
                    >
                      {/* Venda */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/10 flex items-center justify-center">
                            <FaMoneyBillWave
                              size={13}
                              className="text-blue-400"
                            />
                          </div>

                          <div>
                            <Link
                              to={`/sales/${sale._id}`}
                              className="font-mono text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              {sale.saleNumber || '—'}
                            </Link>

                            <p className="text-[10px] text-gray-600 mt-0.5">
                              ID {sale._id?.slice(-8)}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Cliente */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center">
                            <FaUser size={11} className="text-gray-500" />
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-200">
                              {sale.lead?.name || 'Cliente não informado'}
                            </p>

                            {sale.lead?.phone && (
                              <p className="text-xs text-gray-600 mt-0.5">
                                {sale.lead.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Imóvel */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/10 flex items-center justify-center">
                            <FaBuilding size={12} className="text-purple-400" />
                          </div>

                          <div className="max-w-[240px]">
                            <p className="text-sm text-gray-200 truncate">
                              {sale.property?.name || 'Imóvel não informado'}
                            </p>

                            {sale.property?.code && (
                              <p className="text-xs text-gray-600 mt-0.5">
                                Código {sale.property.code}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Valor */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-emerald-400">
                          {formatCurrency(sale.saleAmount)}
                        </p>

                        {sale.commission?.totalAmount && (
                          <p className="text-[10px] text-gray-600 mt-0.5">
                            Comissão:{' '}
                            {formatCurrency(sale.commission.totalAmount)}
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <SaleStatusBadge status={sale.status} />
                      </td>

                      {/* Data */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <FaCalendarAlt size={11} className="text-gray-600" />

                          {formatDate(sale.saleDate || sale.createdAt)}
                        </div>
                      </td>

                      {/* Ações */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/sales/${sale._id}`}
                            className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-blue-600/10 border border-blue-500/10 text-blue-400 hover:bg-blue-600 hover:text-white transition-all text-xs font-semibold"
                          >
                            Detalhes
                            <FaArrowRight size={10} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ===================================================
              PAGINATION
          ==================================================== */}

          {pagination?.total > 0 && (
            <div className="px-5 lg:px-6 py-4 border-t border-gray-800 bg-gray-950/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-xs text-gray-500">
                Mostrando{' '}
                <span className="text-gray-300 font-medium">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>{' '}
                até{' '}
                <span className="text-gray-300 font-medium">
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total,
                  )}
                </span>{' '}
                de{' '}
                <span className="text-gray-300 font-medium">
                  {pagination.total}
                </span>{' '}
                vendas
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="w-9 h-9 rounded-lg border border-gray-800 bg-gray-900 text-gray-400 hover:text-white hover:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                  title="Página anterior"
                >
                  <FaChevronLeft size={11} />
                </button>

                <div className="h-9 px-4 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-semibold text-gray-300">
                  Página {pagination.page}
                  <span className="text-gray-600 mx-1.5">/</span>
                  {pagination.pages}
                </div>

                <button
                  type="button"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="w-9 h-9 rounded-lg border border-gray-800 bg-gray-900 text-gray-400 hover:text-white hover:border-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                  title="Próxima página"
                >
                  <FaChevronRight size={11} />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

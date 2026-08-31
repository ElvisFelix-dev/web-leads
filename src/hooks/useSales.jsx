import { useState, useEffect, useCallback } from 'react';
import { saleService } from '../service/saleService';

export function useSales(filters = {}) {
  const [sales, setSales] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSales = useCallback(
    async (params = {}) => {
      try {
        setLoading(true);
        setError(null);

        const response = await saleService.getAll({
          ...filters,
          ...params,
        });

        setSales(response.data || []);
        setPagination(response.pagination || {});
      } catch (err) {
        setError(err.response?.data?.message || 'Erro ao carregar vendas');
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  return {
    sales,
    pagination,
    loading,
    error,
    loadSales,
    refetch: loadSales,
  };
}

export function useSale(id) {
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSale = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await saleService.getById(id);
      setSale(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao carregar venda');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadSale();
  }, [loadSale]);

  return {
    sale,
    loading,
    error,
    refetch: loadSale,
  };
}

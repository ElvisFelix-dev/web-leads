import { useCallback, useEffect, useMemo, useState } from 'react';

import { commissionService } from '../service/commissionService';

export function useCommissions(filters = {}) {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /*
   * =========================================================
   * NORMALIZA FILTROS
   * =========================================================
   *
   * Evita que um novo objeto com os mesmos valores
   * provoque uma nova busca.
   */

  const normalizedFilters = useMemo(() => {
    if (!filters || typeof filters !== 'object') {
      return {};
    }

    return {
      ...filters,
    };
  }, [JSON.stringify(filters)]);

  /*
   * =========================================================
   * CARREGAR COMISSÕES
   * =========================================================
   */

  const loadCommissions = useCallback(
    async (params = {}) => {
      try {
        setLoading(true);
        setError(null);

        const response = await commissionService.getAll({
          ...normalizedFilters,
          ...params,
        });

        /*
         * Compatibilidade com diferentes formatos da API
         */

        const data = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];

        setCommissions(data);
      } catch (err) {
        console.error('❌ ERRO AO CARREGAR COMISSÕES:', err);

        setError(
          err.response?.data?.message ||
            err.message ||
            'Erro ao carregar comissões',
        );

        setCommissions([]);
      } finally {
        setLoading(false);
      }
    },
    [normalizedFilters],
  );

  /*
   * =========================================================
   * INITIAL LOAD / FILTER CHANGE
   * =========================================================
   */

  useEffect(() => {
    loadCommissions();
  }, [loadCommissions]);

  /*
   * =========================================================
   * RETORNO
   * =========================================================
   */

  return {
    commissions,
    loading,
    error,
    refetch: loadCommissions,
  };
}

/*
 * =============================================================
 * COMISSÃO POR ID
 * =============================================================
 */

export function useCommission(id) {
  const [commission, setCommission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCommission = useCallback(async () => {
    if (!id) {
      setCommission(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await commissionService.getById(id);

      setCommission(response?.data || null);
    } catch (err) {
      console.error('❌ ERRO AO CARREGAR COMISSÃO:', err);

      setError(
        err.response?.data?.message ||
          err.message ||
          'Erro ao carregar comissão',
      );

      setCommission(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCommission();
  }, [loadCommission]);

  return {
    commission,
    loading,
    error,
    refetch: loadCommission,
  };
}

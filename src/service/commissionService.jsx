// src/service/commissionService.js
import api from './api';

export const commissionService = {
  /**
   * Lista todas as comissões (admin)
   */
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/api/commissions', { params });
      return response.data;
    } catch (error) {
      // Se for 404, retorna dados vazios em vez de erro
      if (error.response?.status === 404) {
        return { success: true, data: [], count: 0 };
      }
      throw error;
    }
  },

  /**
   * Busca comissão por ID
   */
  getById: async (id) => {
    const response = await api.get(`/api/commissions/${id}`);
    return response.data;
  },

  /**
   * Minhas comissões (corretor)
   */
  getMyCommissions: async (params = {}) => {
    const response = await api.get('/api/commissions/my-commissions', {
      params,
    });
    return response.data;
  },

  /**
   * Resumo financeiro do corretor
   */
  getSummary: async () => {
    const response = await api.get('/api/commissions/summary');
    return response.data;
  },

  /**
   * Aprova comissão
   */
  approve: async (id) => {
    const response = await api.patch(`/api/commissions/${id}/approve`);
    return response.data;
  },

  /**
   * Marca comissão como paga
   */
  pay: async (id, data) => {
    const response = await api.patch(`/api/commissions/${id}/pay`, data);
    return response.data;
  },

  /**
   * Cancela comissão
   */
  cancel: async (id, data) => {
    const response = await api.patch(`/api/commissions/${id}/cancel`, data);
    return response.data;
  },

  /**
   * Gera comissão a partir de venda
   */
  generateFromSale: async (saleId, config = {}) => {
    const response = await api.post('/api/commissions/generate-from-sale', {
      saleId,
      config,
    });
    return response.data;
  },

  /**
   * Backfill - gera comissões para vendas antigas
   */
  backfill: async () => {
    const response = await api.post('/api/commissions/backfill');
    return response.data;
  },
};

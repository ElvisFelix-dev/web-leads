import api from './api';

// ==========================================
// VENDAS
// ==========================================

export const saleService = {
  /**
   * Lista todas as vendas (admin)
   */
  getAll: async (params = {}) => {
    const response = await api.get('/api/sales', { params });
    return response.data;
  },

  /**
   * Busca venda por ID
   */
  getById: async (id) => {
    const response = await api.get(`/api/sales/${id}`);
    return response.data;
  },

  /**
   * Cria venda a partir de proposta
   */
  createFromProposal: async (proposalId, data) => {
    const response = await api.post(
      `/api/sales/from-proposal/${proposalId}`,
      data,
    );
    return response.data;
  },

  /**
   * Atualiza status da venda
   */
  updateStatus: async (id, status, notes) => {
    const response = await api.patch(`/api/sales/${id}/status`, {
      status,
      notes,
    });
    return response.data;
  },

  /**
   * Conclui venda
   */
  complete: async (id, notes) => {
    const response = await api.patch(`/api/sales/${id}/complete`, { notes });
    return response.data;
  },

  /**
   * Cancela venda
   */
  cancel: async (id, reason) => {
    const response = await api.patch(`/api/sales/${id}/cancel`, { reason });
    return response.data;
  },

  /**
   * Atualiza status de pagamento
   */
  updatePaymentStatus: async (id, paymentStatus) => {
    const response = await api.patch(`/api/sales/${id}/payment-status`, {
      paymentStatus,
    });
    return response.data;
  },

  /**
   * Métricas de vendas
   */
  getMetrics: async (params = {}) => {
    const response = await api.get('/api/sales/metrics', { params });
    return response.data;
  },
};

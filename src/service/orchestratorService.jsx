// src/services/orchestratorService.js
import api from './api';

/**
 * =========================================================
 * APROVAR PROPOSTA (FLUXO COMPLETO)
 * =========================================================
 */
export const approveProposal = async (proposalId, comment = '') => {
  // 🔥 CORRIGIDO: Usar a rota correta do proposals
  const response = await api.post(
    `/api/orchestrator/proposals/${proposalId}/approve`,
    {
      comment,
    },
  );
  return response.data;
};
// router.post('/proposals/:proposalId/approve'
/**
 * =========================================================
 * DASHBOARD DO CORRETOR
 * =========================================================
 */
export const getBrokerDashboard = async () => {
  const response = await api.get('/orchestrator/dashboard/broker');
  return response.data;
};

/**
 * =========================================================
 * DASHBOARD DO ADMIN
 * =========================================================
 */
export const getAdminDashboard = async () => {
  const response = await api.get('/orchestrator/dashboard/admin');
  return response.data;
};

/**
 * =========================================================
 * PIPELINE COMPLETO
 * =========================================================
 */
export const getPipeline = async () => {
  const response = await api.get('/orchestrator/pipeline');
  return response.data;
};

/**
 * =========================================================
 * RESUMO DE COMISSÕES
 * =========================================================
 */
export const getCommissionSummary = async () => {
  const response = await api.get('/orchestrator/commissions/summary');
  return response.data;
};

/**
 * =========================================================
 * LISTAR COMISSÕES
 * =========================================================
 */
export const getCommissions = async (params = {}) => {
  const response = await api.get('/orchestrator/commissions', { params });
  return response.data;
};

/**
 * =========================================================
 * MÉTRICAS DE VENDAS
 * =========================================================
 */
export const getSalesMetrics = async (params = {}) => {
  const response = await api.get('/orchestrator/metrics/sales', { params });
  return response.data;
};

/**
 * =========================================================
 * EXPORT PADRÃO
 * =========================================================
 */
export default {
  approveProposal,
  getBrokerDashboard,
  getAdminDashboard,
  getPipeline,
  getCommissionSummary,
  getCommissions,
  getSalesMetrics,
};

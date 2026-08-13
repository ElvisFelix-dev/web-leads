import api from './api';

/**
 * =========================================================
 * GET OPPORTUNITIES
 * =========================================================
 */

export const getOpportunities = async (filters = {}) => {
  const params = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params[key] = value;
    }
  });

  const response = await api.get('/api/opportunities', {
    params,
  });

  /**
   * O backend retorna:
   *
   * {
   *   success: true,
   *   opportunities: [],
   *   pagination: {}
   * }
   */

  return response.data;
};

/**
 * =========================================================
 * GET OPPORTUNITY BY ID
 * =========================================================
 */

export const getOpportunityById = async (id) => {
  if (!id) {
    throw new Error('ID da oportunidade não informado.');
  }

  const response = await api.get(`/api/opportunities/${id}`);

  return response.data;
};

/**
 * =========================================================
 * CREATE OPPORTUNITY
 * =========================================================
 */

export const createOpportunity = async (data) => {
  const response = await api.post('/api/opportunities', data);

  return response.data;
};

/**
 * =========================================================
 * UPDATE OPPORTUNITY
 * =========================================================
 */

export const updateOpportunity = async (id, data) => {
  if (!id) {
    throw new Error('ID da oportunidade não informado.');
  }

  const response = await api.patch(`/api/opportunities/${id}`, data);

  return response.data;
};

/**
 * =========================================================
 * UPDATE STAGE
 * =========================================================
 */

export const updateOpportunityStage = async (id, data) => {
  if (!id) {
    throw new Error('ID da oportunidade não informado.');
  }

  const response = await api.patch(`/api/opportunities/${id}/stage`, data);

  return response.data;
};

/**
 * =========================================================
 * ADD INTERACTION
 * =========================================================
 */

export const addOpportunityInteraction = async (id, data) => {
  if (!id) {
    throw new Error('ID da oportunidade não informado.');
  }

  const response = await api.post(
    `/api/opportunities/${id}/interactions`,
    data,
  );

  return response.data;
};

/**
 * =========================================================
 * ARCHIVE
 * =========================================================
 */

export const archiveOpportunity = async (id) => {
  if (!id) {
    throw new Error('ID da oportunidade não informado.');
  }

  const response = await api.delete(`/api/opportunities/${id}`);

  return response.data;
};

export default {
  getOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  updateOpportunityStage,
  addOpportunityInteraction,
  archiveOpportunity,
};

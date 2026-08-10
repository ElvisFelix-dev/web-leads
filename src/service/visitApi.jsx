import api from './api';

// =====================================
// Listar visitas
// =====================================

export const getVisits = async (params = {}) => {
  const { data } = await api.get('/api/visits', {
    params,
  });

  return data;
};

// =====================================
// Buscar visita por ID
// =====================================

export const getVisitById = async (id) => {
  const { data } = await api.get(`/api/visits/${id}`);

  return data.data || data;
};

// =====================================
// Criar visita
// =====================================

export const createVisit = async (body) => {
  const { data } = await api.post('/api/visits', body);

  return data.data || data;
};

// =====================================
// Atualizar visita
// =====================================

export const updateVisit = async (id, body) => {
  const { data } = await api.put(`/api/visits/${id}`, body);

  return data.data || data;
};

// =====================================
// Excluir visita
// =====================================

export const deleteVisit = async (id) => {
  const { data } = await api.delete(`/api/visits/${id}`);

  return data;
};

// =====================================
// Confirmar visita
// =====================================

export const confirmVisit = async (id) => {
  const { data } = await api.patch(`/api/visits/${id}/confirm`);

  return data;
};

// =====================================
// Completar visita
// =====================================

export const completeVisit = async (id) => {
  const { data } = await api.patch(`/api/visits/${id}/complete`);

  return data;
};

// =====================================
// Cancelar visita
// =====================================

export const cancelVisit = async (id, reason = '') => {
  const { data } = await api.patch(`/api/visits/${id}/cancel`, { reason });

  return data;
};

// =====================================
// Visitas de hoje
// =====================================

export const getTodayVisits = async () => {
  const { data } = await api.get('/api/visits/today');

  return data.data || data;
};

// =====================================
// Próximas visitas
// =====================================

export const getUpcomingVisits = async () => {
  const { data } = await api.get('/api/visits/upcoming');

  return data.data || data;
};

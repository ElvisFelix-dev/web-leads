// src/service/leadApi.js
import api from './api';

// =====================================
// Buscar leads
// =====================================

export const getLeads = async (params = {}) => {
  const { data } = await api.get('/api/leads', {
    params,
  });
  return data.data || data;
};

// =====================================
// Atualizar lead - CORRIGIDO ✅
// =====================================

export const updateLead = async (id, body) => {
  // 🔥 MUDAR DE PUT PARA PATCH
  const { data } = await api.patch(`/api/leads/${id}`, body);
  return data.data || data;
};

// =====================================
// Buscar lead por ID
// =====================================

export const getLeadById = async (id) => {
  const { data } = await api.get(`/api/leads/${id}`);
  return data.data || data;
};

// =====================================
// Criar lead (opcional)
// =====================================

export const createLead = async (body) => {
  const { data } = await api.post('/api/leads', body);
  return data.data || data;
};

// =====================================
// Excluir lead (opcional)
// =====================================

export const deleteLead = async (id) => {
  const { data } = await api.delete(`/api/leads/${id}`);
  return data.data || data;
};

// =====================================
// Alterar etapa do lead (Drag & Drop)
// =====================================

export const changeLeadStage = async (id, stage) => {
  const { data } = await api.patch(`/api/leads/${id}/stage`, { stage });
  return data.data || data;
};

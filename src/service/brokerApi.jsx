import api from './api';

// ==========================================
// Buscar corretores públicos
// ==========================================

export const getPublicBrokers = async () => {
  const response = await api.get('/api/brokers/public');

  return response.data;
};

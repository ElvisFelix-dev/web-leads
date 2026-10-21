import api from './api';

// =====================================
// Buscar imóveis
// =====================================
export const getProperties = async (params = {}) => {
  const { data } = await api.get('/api/properties', {
    params,
  });

  return data.data || data;
};

// =====================================
// Buscar imóvel por ID
// =====================================
export const getPropertyById = async (id) => {
  const { data } = await api.get(`/api/properties/${id}`);

  return data.data || data;
};

// =====================================
// Buscar imóvel por slug
// =====================================
export const getPropertyBySlug = async (slug) => {
  const { data } = await api.get(
    `/api/properties/slug/${encodeURIComponent(slug)}`,
  );

  return data.data || data;
};

// =====================================
// Importar imóveis por CSV
// =====================================
// O backend precisa disponibilizar POST /api/properties/import/csv
// e receber { properties: [...] }.
export const importPropertiesCSV = async (properties = []) => {
  const { data } = await api.post('/api/properties/import/csv', {
    properties,
  });

  return data.data || data;
};

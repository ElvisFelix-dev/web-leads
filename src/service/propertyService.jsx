import api from './api';

/*
============================================================
 LISTAR IMÓVEIS
============================================================
*/

export const getProperties = async (params = {}) => {
  const response = await api.get('/api/properties', {
    params,
  });

  return response.data;
};

/*
============================================================
 BUSCAR IMÓVEL POR ID
============================================================
*/

export const getPropertyById = async (id) => {
  const response = await api.get(`/api/properties/${id}`);

  return response.data;
};

/*
============================================================
 BUSCAR POR SLUG
============================================================
*/

export const getPropertyBySlug = async (slug) => {
  const response = await api.get(`/aoi/properties/slug/${slug}`);

  return response.data;
};

/*
============================================================
 BUSCAR POR CÓDIGO
============================================================
*/

export const getPropertyByCode = async (code) => {
  const response = await api.get(`/api/properties/code/${code}`);

  return response.data;
};

/*
============================================================
 PESQUISA
============================================================
*/

export const searchProperties = async (query) => {
  const response = await api.get('/api/properties/search', {
    params: query,
  });

  return response.data;
};

/*
============================================================
 FILTROS
============================================================
*/

export const filterProperties = async (filters) => {
  const response = await api.get('/api/properties/filter', {
    params: filters,
  });

  return response.data;
};

/*
============================================================
 CRIAR IMÓVEL
 ADMIN
============================================================
*/

export const createProperty = async (propertyData) => {
  const response = await api.post('/api/properties', propertyData);

  return response.data;
};

/*
============================================================
 ATUALIZAR IMÓVEL
 ADMIN
============================================================
*/

export const updateProperty = async (id, propertyData) => {
  const response = await api.put(`/api/properties/${id}`, propertyData);

  return response.data;
};

/*
============================================================
 DELETAR IMÓVEL
 ADMIN
============================================================
*/

export const deleteProperty = async (id) => {
  const response = await api.delete(`/api/properties/${id}`);

  return response.data;
};

/*
============================================================
 PUBLICAÇÃO
============================================================
*/

export const publishProperty = async (id) => {
  const response = await api.patch(`/api/properties/${id}/publish`);

  return response.data;
};

export const unpublishProperty = async (id) => {
  const response = await api.patch(`/api/properties/${id}/unpublish`);

  return response.data;
};

/*
============================================================
 STATUS
============================================================
*/

export const archiveProperty = async (id) => {
  const response = await api.patch(`/api/properties/${id}/archive`);

  return response.data;
};

export const restoreProperty = async (id) => {
  const response = await api.patch(`/api/properties/${id}/restore`);

  return response.data;
};

export const activateProperty = async (id) => {
  const response = await api.patch(`/api/properties/${id}/activate`);

  return response.data;
};

/*
============================================================
 DESTAQUE
============================================================
*/

export const toggleFeatured = async (id) => {
  const response = await api.patch(`/api/properties/${id}/featured`);

  return response.data;
};

/*
============================================================
 CORRETOR RESPONSÁVEL
============================================================
*/

export const assignBroker = async (id, brokerId) => {
  const response = await api.patch(`/api/properties/${id}/broker`, {
    brokerId,
  });

  return response.data;
};

/*
============================================================
 DUPLICAR
============================================================
*/

export const duplicateProperty = async (id) => {
  const response = await api.post(`/api/properties/${id}/duplicate`);

  return response.data;
};

/*
============================================================
 IMÓVEL DESTAQUE / HOME
============================================================
*/

export const getFeaturedProperties = async () => {
  const response = await api.get('/api/properties/featured');

  return response.data;
};

export const getLatestProperties = async () => {
  const response = await api.get('/api/properties/latest');

  return response.data;
};

/*
============================================================
 DASHBOARD ADMIN
============================================================
*/

export const getPropertyDashboard = async () => {
  const response = await api.get('/api/properties/dashboard');

  return response.data;
};

export const getPropertyStatistics = async () => {
  const response = await api.get('/api/properties/statistics');

  return response.data;
};

/*
============================================================
 MÉTRICAS
============================================================
*/

export const incrementPropertyView = async (id) => {
  const response = await api.post(`/api/properties/${id}/view`);

  return response.data;
};

export const incrementPropertyFavorite = async (id) => {
  const response = await api.post(`/api/properties/${id}/favorite`);

  return response.data;
};

export const incrementPropertyContact = async (id) => {
  const response = await api.post(`/api/properties/${id}/contact`);

  return response.data;
};

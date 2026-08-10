import api from './api'


// =====================================
// Buscar imóveis
// =====================================

export const getProperties = async (params = {}) => {

  const { data } = await api.get('/api/properties', {
    params,
  })


  return data.data || data

}



// =====================================
// Buscar imóvel por ID
// =====================================

export const getPropertyById = async (id) => {

  const { data } = await api.get(
    `/api/properties/${id}`
  )


  return data.data || data

}

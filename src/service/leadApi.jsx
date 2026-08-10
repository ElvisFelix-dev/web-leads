import api from './api'


// =====================================
// Buscar leads
// =====================================

export const getLeads = async (params = {}) => {

  const { data } = await api.get('/api/leads', {
    params,
  })


  return data.data || data

}

// =====================================
// Atualizar lead
// =====================================

export const updateLead = async (id, body) => {

  const { data } = await api.put(
    `/api/leads/${id}`,
    body
  )

  return data.data || data

}



// =====================================
// Buscar lead por ID
// =====================================

export const getLeadById = async (id) => {

  const { data } = await api.get(
    `/api/leads/${id}`
  )


  return data.data || data

}

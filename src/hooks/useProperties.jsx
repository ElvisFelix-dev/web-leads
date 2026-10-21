import { useCallback, useEffect, useState } from 'react';

import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  publishProperty,
  unpublishProperty,
  archiveProperty,
  restoreProperty,
  activateProperty,
  toggleFeatured,
  assignBroker,
  duplicateProperty,
  getFeaturedProperties,
  getLatestProperties,
  searchProperties,
  filterProperties,
  getPropertyDashboard,
  getPropertyStatistics,
} from '../service/propertyService';

export default function useProperties(autoLoad = true, params = null) {
  const [properties, setProperties] = useState([]);

  const [property, setProperty] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  /*
  ============================================================
  LISTAR
  ============================================================
  */

  const fetchProperties = useCallback(
    async (filters = params || {}) => {
      try {
        setLoading(true);
        setError(null);

        const data = await getProperties(filters);

        setProperties(data.data || data.properties || []);

        return data;
      } catch (err) {
        setError(err.response?.data?.message || 'Erro ao carregar imóveis.');

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [params],
  );

  /*
  ============================================================
  BUSCAR TODOS OS IMÓVEIS PARA EXPORTAÇÃO
  Faz paginação usando o limite máximo aceito pelo backend (100).
  Não altera o estado `properties` exibido na tela.
  ============================================================
  */

  const fetchAllPropertiesForExport = useCallback(
    async (filters = params || {}) => {
      const allProperties = [];
      const limit = 100;
      let page = 1;

      while (true) {
        const result = await getProperties({
          ...filters,
          page,
          limit,
        });

        const batch = Array.isArray(result)
          ? result
          : result?.data || result?.properties || [];

        allProperties.push(...batch);

        if (batch.length < limit) {
          break;
        }

        page += 1;
      }

      return allProperties;
    },
    [params],
  );

  /*
  ============================================================
  BUSCAR POR ID
  ============================================================
  */

  const fetchProperty = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const data = await getPropertyById(id);

      setProperty(data.data || data.property);

      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao buscar imóvel.');

      throw err;
    } finally {
      setLoading(false);
    }
  };

  /*
  ============================================================
  CRIAR
  ============================================================
  */

  const create = async (propertyData) => {
    try {
      const data = await createProperty(propertyData);

      await fetchProperties();

      return data;
    } catch (error) {
      console.log('ERRO CREATE PROPERTY:', error.response?.data);

      throw error;
    }
  };

  /*
  ============================================================
  ATUALIZAR
  ============================================================
  */

  const update = async (id, propertyData) => {
    const data = await updateProperty(id, propertyData);

    await fetchProperties();

    return data;
  };

  /*
  ============================================================
  EXCLUIR
  ============================================================
  */

  const remove = async (id) => {
    const data = await deleteProperty(id);

    await fetchProperties();

    return data;
  };

  /*
  ============================================================
  STATUS
  ============================================================
  */

  const publish = async (id) => {
    const data = await publishProperty(id);

    await fetchProperties();

    return data;
  };

  const unpublish = async (id) => {
    const data = await unpublishProperty(id);

    await fetchProperties();

    return data;
  };

  const archive = async (id) => {
    const data = await archiveProperty(id);

    await fetchProperties();

    return data;
  };

  const restore = async (id) => {
    const data = await restoreProperty(id);

    await fetchProperties();

    return data;
  };

  const activate = async (id) => {
    const data = await activateProperty(id);

    await fetchProperties();

    return data;
  };

  /*
  ============================================================
  FEATURED
  ============================================================
  */

  const featured = async (id) => {
    const data = await toggleFeatured(id);

    await fetchProperties();

    return data;
  };

  /*
  ============================================================
  BROKER
  ============================================================
  */

  const changeBroker = async (id, brokerId) => {
    const data = await assignBroker(id, brokerId);

    await fetchProperties();

    return data;
  };

  /*
  ============================================================
  DUPLICAR
  ============================================================
  */

  const duplicate = async (id) => {
    const data = await duplicateProperty(id);

    await fetchProperties();

    return data;
  };

  /*
  ============================================================
  BUSCAS
  ============================================================
  */

  const search = async (query) => {
    const data = await searchProperties(query);

    return data;
  };

  const filter = async (filters) => {
    const data = await filterProperties(filters);

    return data;
  };

  /*
  ============================================================
  HOME / HIGHLIGHTS
  ============================================================
  */

  const featuredList = async () => {
    return await getFeaturedProperties();
  };

  const latestList = async () => {
    return await getLatestProperties();
  };

  /*
  ============================================================
  DASHBOARD
  ============================================================
  */

  const dashboard = async () => {
    return await getPropertyDashboard();
  };

  const statistics = async () => {
    return await getPropertyStatistics();
  };

  /*
  ============================================================
  AUTO LOAD
  ============================================================
  */

  useEffect(() => {
    if (autoLoad) {
      fetchProperties();
    }
  }, [autoLoad, fetchProperties]);

  return {
    // states

    properties,

    property,

    loading,

    error,

    // CRUD

    fetchProperties,

    fetchAllPropertiesForExport,

    fetchProperty,

    create,

    update,

    remove,

    // status

    publish,

    unpublish,

    archive,

    restore,

    activate,

    // features

    featured,

    changeBroker,

    duplicate,

    // search

    search,

    filter,

    // public

    featuredList,

    latestList,

    // dashboard

    dashboard,

    statistics,
  };
}

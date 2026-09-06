// hooks/useFavorite.js
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../service/api';

export function useFavorite(propertyId, isAvailable = true) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Verificar status do favorito
  const checkStatus = useCallback(async () => {
    if (!propertyId || !isAvailable) return;

    try {
      const response = await api.get(
        `/api/property-favorite/${propertyId}/check`,
      );
      const data = response.data?.data || response.data;

      setIsFavorite(Boolean(data?.isFavorite ?? data?.favorite ?? false));
      setFavoriteId(data?.favoriteId || null);
    } catch (err) {
      console.warn('Erro ao verificar favorito:', err);
    }
  }, [propertyId, isAvailable]);

  // Adicionar favorito
  const addFavorite = useCallback(async () => {
    if (!propertyId) {
      toast.error('ID do imóvel não encontrado.');
      return;
    }

    if (loading) {
      toast.info('Aguarde...');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await api.post(
        `/api/properties/${propertyId}/increment-favorite`,
      );
      const data = response.data?.data || response.data;

      setIsFavorite(true);
      setFavoriteId(data?.favoriteId || `fav-${Date.now()}`);

      toast.success('Imóvel adicionado aos favoritos! 🏠');

      // Salvar no sessionStorage
      const favorited = JSON.parse(
        sessionStorage.getItem('favoritedProperties') || '[]',
      );
      if (!favorited.includes(propertyId)) {
        favorited.push(propertyId);
        sessionStorage.setItem(
          'favoritedProperties',
          JSON.stringify(favorited),
        );
      }
    } catch (err) {
      setError(err.message);
      toast.error('Erro ao adicionar favorito. Tente novamente.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [propertyId, loading]);

  // Remover favorito
  const removeFavorite = useCallback(async () => {
    if (!favoriteId && !propertyId) {
      toast.error('Favorito não encontrado.');
      return;
    }

    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      // Tentar remover pelo ID primeiro
      if (favoriteId) {
        await api.delete(`/api/property-favorite/${favoriteId}`);
      } else {
        // Fallback: toggle
        await api.post(`/api/property-favorite/${propertyId}/toggle`);
      }

      setIsFavorite(false);
      setFavoriteId(null);

      toast.success('Imóvel removido dos favoritos!');

      // Remover do sessionStorage
      const favorited = JSON.parse(
        sessionStorage.getItem('favoritedProperties') || '[]',
      );
      const updated = favorited.filter((id) => id !== propertyId);
      sessionStorage.setItem('favoritedProperties', JSON.stringify(updated));
    } catch (err) {
      setError(err.message);
      toast.error('Erro ao remover favorito. Tente novamente.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [propertyId, favoriteId, loading]);

  // Toggle
  const toggleFavorite = useCallback(async () => {
    if (isFavorite) {
      await removeFavorite();
    } else {
      await addFavorite();
    }
  }, [isFavorite, addFavorite, removeFavorite]);

  // Carregar status inicial
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    isFavorite,
    favoriteId,
    loading,
    error,
    checkStatus,
    addFavorite,
    removeFavorite,
    toggleFavorite,
  };
}

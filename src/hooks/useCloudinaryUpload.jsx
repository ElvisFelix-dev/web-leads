import { useState, useCallback } from 'react';

import api from '../service/api';

const ENDPOINTS = {
  avatar: '/api/uploads/avatar',

  cover: '/api/uploads/cover',

  property: '/api/uploads/property',

  logo: '/api/uploads/logo',

  image: '/api/uploads/image',
};

const useCloudinaryUpload = () => {
  const [progress, setProgress] = useState(0);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState(null);

  /**
   * ======================================================
   * Upload Genérico
   * ======================================================
   */

  const uploadImage = useCallback(async (file, uploadType = 'image') => {
    try {
      setLoading(true);

      setError(null);

      setProgress(0);

      if (!file) {
        throw new Error('Arquivo não informado.');
      }

      const endpoint = ENDPOINTS[uploadType];

      if (!endpoint) {
        throw new Error(`Tipo de upload inválido: ${uploadType}`);
      }

      const formData = new FormData();

      formData.append('image', file);

      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },

        onUploadProgress: (event) => {
          if (!event.total) return;

          const percent = Math.round((event.loaded * 100) / event.total);

          setProgress(percent);
        },
      });

      return response.data;
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Erro ao enviar imagem';

      setError(message);

      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * ======================================================
   * Reset
   * ======================================================
   */

  const resetUpload = () => {
    setProgress(0);

    setLoading(false);

    setError(null);
  };

  return {
    uploadImage,

    progress,

    loading,

    error,

    resetUpload,
  };
};

export default useCloudinaryUpload;

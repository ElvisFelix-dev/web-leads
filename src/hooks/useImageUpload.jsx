import { useState, useCallback } from 'react';

const useImageUpload = () => {
  const [originalImage, setOriginalImage] = useState(null);

  const [preview, setPreview] = useState(null);

  const [file, setFile] = useState(null);

  const [error, setError] = useState(null);

  /**
   * Recebe arquivo do Dropzone
   */
  const selectImage = useCallback((selectedFile) => {
    try {
      setError(null);

      if (!selectedFile) {
        throw new Error('Nenhuma imagem selecionada');
      }

      const imageUrl = URL.createObjectURL(selectedFile);

      setOriginalImage(imageUrl);

      setPreview(imageUrl);
    } catch (error) {
      setError(error.message);
    }
  }, []);

  /**
   * Depois do Crop
   */
  const setCroppedImage = useCallback((croppedFile) => {
    const previewUrl = URL.createObjectURL(croppedFile);

    setFile(croppedFile);

    setPreview(previewUrl);
  }, []);

  /**
   * Limpar tudo
   */
  const resetImage = useCallback(() => {
    if (originalImage) {
      URL.revokeObjectURL(originalImage);
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setOriginalImage(null);

    setPreview(null);

    setFile(null);

    setError(null);
  }, [originalImage, preview]);

  return {
    originalImage,

    preview,

    file,

    error,

    selectImage,

    setCroppedImage,

    resetImage,
  };
};

export default useImageUpload;

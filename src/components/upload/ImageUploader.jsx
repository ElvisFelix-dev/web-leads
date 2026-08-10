import { useState } from 'react';

import ImageCropper from './ImageCropper';
import Dropzone from './Dropzone';
import ImagePreview from './ImagePreview';
import UploadProgress from './UploadProgress';
import RemoveImageButton from './RemoveImageButton';

import getCroppedImage from '../../utils/getCroppedImage';
import compressImage from '../../utils/compressImage';

import useCloudinaryUpload from '../../hooks/useCloudinaryUpload';

const ImageUploader = ({
  onUpload,

  uploadType = 'image',

  previewType = 'avatar',

  aspect = 1,

  cropShape = 'round',
}) => {
  const [image, setImage] = useState(null);

  const [preview, setPreview] = useState(null);

  const [showCropper, setShowCropper] = useState(false);

  const { uploadImage, progress, loading, error } = useCloudinaryUpload();

  /*
  =====================================
  Selecionar imagem
  =====================================
  */

  const handleSelectImage = (file) => {
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setImage(previewUrl);

    setPreview(previewUrl);

    setShowCropper(true);
  };

  /*
  =====================================
  Crop concluído
  =====================================
  */

  const handleCropComplete = async ({ croppedAreaPixels, rotation }) => {
    try {
      /*
      ==========================
      Recorta
      ==========================
      */

      const croppedFile = await getCroppedImage(
        image,
        croppedAreaPixels,
        rotation,
      );

      /*
      ==========================
      Compressão
      ==========================
      */

      const compressedFile = await compressImage(croppedFile, {
        maxWidth: previewType === 'cover' ? 1600 : 800,

        maxHeight: previewType === 'cover' ? 600 : 800,

        quality: 0.9,
      });

      /*
      ==========================
      Preview
      ==========================
      */

      if (preview) {
        URL.revokeObjectURL(preview);
      }

      const finalPreview = URL.createObjectURL(compressedFile);

      setPreview(finalPreview);

      setShowCropper(false);

      /*
      ==========================
      Upload
      ==========================
      */

      const response = await uploadImage(compressedFile, uploadType);

      console.log('UPLOAD RESPONSE', response);

      onUpload?.(response);
    } catch (error) {
      console.error('Erro no upload da imagem', error);
    }
  };

  /*
  =====================================
  Remover imagem
  =====================================
  */

  const removeImage = () => {
    if (image) {
      URL.revokeObjectURL(image);
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImage(null);

    setPreview(null);

    setShowCropper(false);
  };

  return (
    <div className="space-y-4">
      {preview && (
        <ImagePreview image={preview} type={previewType} loading={loading} />
      )}

      {!preview && <Dropzone onFileSelected={handleSelectImage} />}

      {preview && <RemoveImageButton onRemove={removeImage} />}

      {loading && <UploadProgress progress={progress} />}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {showCropper && (
        <ImageCropper
          image={image}
          aspect={aspect}
          cropShape={cropShape}
          onCancel={() => {
            removeImage();
          }}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  );
};

export default ImageUploader;

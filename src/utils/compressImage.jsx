const compressImage = (file, options = {}) => {
  const {
    maxWidth = 1200,

    maxHeight = 1200,

    quality = 0.85,

    type = 'image/webp',
  } = options;

  return new Promise((resolve, reject) => {
    const image = new Image();

    const reader = new FileReader();

    reader.onload = (event) => {
      image.src = event.target.result;
    };

    image.onload = () => {
      let width = image.width;

      let height = image.height;

      /**
       * Redimensionamento
       */

      if (width > maxWidth) {
        height = Math.round(height * (maxWidth / width));

        width = maxWidth;
      }

      if (height > maxHeight) {
        width = Math.round(width * (maxHeight / height));

        height = maxHeight;
      }

      const canvas = document.createElement('canvas');

      canvas.width = width;

      canvas.height = height;

      const ctx = canvas.getContext('2d');

      ctx.drawImage(image, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Erro ao comprimir imagem'));

            return;
          }

          const compressedFile = new File(
            [blob],

            `image-${Date.now()}.webp`,

            {
              type,
            },
          );

          resolve(compressedFile);
        },

        type,

        quality,
      );
    };

    image.onerror = reject;

    reader.onerror = reject;

    reader.readAsDataURL(file);
  });
};

export default compressImage;

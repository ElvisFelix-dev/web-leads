const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();

    image.crossOrigin = 'anonymous';

    image.onload = () => resolve(image);

    image.onerror = reject;

    image.src = url;
  });

const getCroppedImage = async (imageSrc, pixelCrop, rotation = 0) => {
  const image = await createImage(imageSrc);

  const canvas = document.createElement('canvas');

  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.save();

  if (rotation !== 0) {
    ctx.translate(canvas.width / 2, canvas.height / 2);

    ctx.rotate((rotation * Math.PI) / 180);

    ctx.translate(-canvas.width / 2, -canvas.height / 2);
  }

  ctx.drawImage(
    image,

    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,

    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  ctx.restore();

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(
          new File([blob], 'cropped-image.jpg', {
            type: 'image/jpeg',
          }),
        );
      },
      'image/jpeg',
      0.95,
    );
  });
};

export default getCroppedImage;

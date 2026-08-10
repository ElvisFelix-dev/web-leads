import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';

const ImageCropper = ({
  image,
  aspect = 1,
  cropShape = 'round',
  onCropComplete,
  onCancel,
}) => {
  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
  });

  const [zoom, setZoom] = useState(1);

  const [rotation, setRotation] = useState(0);

  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleConfirm = () => {
    onCropComplete({
      croppedAreaPixels,
      rotation,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-xl p-5 w-[95%] max-w-xl">
        <h2 className="text-lg font-semibold mb-4">Ajustar imagem</h2>

        <div
          className="
            relative
            w-full
            h-[350px]
            bg-gray-900
            rounded-lg
            overflow-hidden
          "
        >
          <Cropper
            image={image}

            crop={crop}

            zoom={zoom}

            rotation={rotation}

            aspect={aspect}

            cropShape={cropShape}

            showGrid={true}

            onCropChange={setCrop}

            onZoomChange={setZoom}

            onRotationChange={setRotation}

            onCropComplete={handleCropComplete}
          />
        </div>

        <div className="mt-5 space-y-4">
          {/* Zoom */}
          <div>
            <label className="text-sm font-medium">Zoom</label>

            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Rotação */}
          <div>
            <label className="text-sm font-medium">Rotação</label>

            <input
              type="range"
              min="0"
              max="360"
              value={rotation}
              onChange={(e) => setRotation(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="
                px-4
                py-2
                rounded-lg
                bg-gray-200
                hover:bg-gray-300
              "
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className="
                px-4
                py-2
                rounded-lg
                bg-blue-600
                text-white
                hover:bg-blue-700
              "
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;

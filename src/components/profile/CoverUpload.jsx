import { useState } from 'react';
import { FaCamera } from 'react-icons/fa';

import ImageUploader from '../upload/ImageUploader';

const CoverUpload = ({ onUploaded }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Botão discreto */}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="
          flex
          h-11
          w-11
          items-center
          justify-center
          rounded-full
          bg-black/60
          backdrop-blur-md
          text-white
          transition
          hover:bg-black/80
        "
      >
        <FaCamera />
      </button>

      {open && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/70
          "
        >
          <div
            className="
              w-full
              max-w-5xl
              rounded-2xl
              bg-gray-900
              p-6
            "
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Alterar capa</h2>

              <button onClick={() => setOpen(false)} className="text-white">
                ✕
              </button>
            </div>

            <ImageUploader
              uploadType="cover"
              previewType="cover"
              aspect={16 / 5}
              cropShape="rect"
              onUpload={(response) => {
                onUploaded?.(response);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default CoverUpload;

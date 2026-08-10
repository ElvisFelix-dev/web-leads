import { useState } from 'react';

import { FaCamera } from 'react-icons/fa';

import ImageUploader from '../upload/ImageUploader';

const AvatarUpload = ({ avatar, name, onUploaded }) => {
  const [openUploader, setOpenUploader] = useState(false);

  return (
    <>
      <div
        className="
          relative
          flex
          h-44
          w-44
          items-center
          justify-center
          overflow-hidden
          rounded-full
          border-4
          border-gray-900
          bg-gray-800
          shadow-2xl
          ring-4
          ring-cyan-500/20
        "
      >
        {avatar ? (
          <img
            src={avatar}
            alt={name || 'Avatar'}
            loading="lazy"
            draggable={false}
            className="
              h-full
              w-full
              object-cover
              object-center
              transition-all
              duration-300
              select-none
            "
          />
        ) : (
          <div
            className="
              flex
              h-full
              w-full
              items-center
              justify-center
              bg-gradient-to-br
              from-blue-700
              via-cyan-600
              to-cyan-400
              text-7xl
              font-bold
              text-white
              select-none
            "
          >
            {name ? name.charAt(0).toUpperCase() : '?'}
          </div>
        )}

        {/* Botão câmera */}

        <button
          type="button"
          onClick={() => setOpenUploader(true)}
          className="
            absolute
            bottom-2
            left-2
            z-20
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-full
            border-2
            border-gray-900
            bg-blue-600
            text-lg
            text-white
            shadow-xl
            transition-all
            duration-200
            hover:scale-110
            hover:bg-cyan-500
            active:scale-95
          "
          title="Alterar foto"
        >
          <FaCamera />
        </button>
      </div>

      {openUploader && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/80
            p-4
            backdrop-blur-sm
          "
        >
          <div
            className="
              w-full
              max-w-xl
              rounded-3xl
              border
              border-gray-800
              bg-gray-900
              p-6
              shadow-2xl
            "
          >
            <div
              className="
                mb-6
                flex
                items-center
                justify-between
              "
            >
              <h2
                className="
                  text-xl
                  font-bold
                  text-white
                "
              >
                Alterar foto do perfil
              </h2>

              <button
                type="button"
                onClick={() => setOpenUploader(false)}
                className="
                  rounded-lg
                  p-2
                  text-gray-400
                  transition
                  hover:bg-gray-800
                  hover:text-white
                "
              >
                ✕
              </button>
            </div>

            <ImageUploader
              uploadType="avatar"
              previewType="avatar"
              aspect={1}
              cropShape="round"
              onUpload={(response) => {
                onUploaded?.(response);
                setOpenUploader(false);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default AvatarUpload;

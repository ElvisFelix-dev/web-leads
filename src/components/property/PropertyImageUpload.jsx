import { useRef, useState } from 'react';

import { Upload, Image as ImageIcon, Loader2, Star, X } from 'lucide-react';

import api from '../../service/api';

export default function PropertyImageUpload({ images = [], onChange }) {
  const inputRef = useRef(null);

  const [uploading, setUploading] = useState(false);

  const [dragging, setDragging] = useState(false);

  const [progress, setProgress] = useState(0);

  /*
  =====================================================
  Upload de uma imagem
  =====================================================
  */

  async function uploadFile(file) {
    try {
      setUploading(true);

      const formData = new FormData();

      formData.append('image', file);

      const response = await api.post('/api/uploads/property', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },

        onUploadProgress: (event) => {
          const percent = Math.round((event.loaded * 100) / event.total);

          setProgress(percent);
        },
      });

      const newImage = {
        url: response.data.url,

        public_id: response.data.public_id,

        isCover: images.length === 0,

        order: images.length,
      };

      onChange([...images, newImage]);
    } catch (error) {
      console.error(error.response);

      console.error(error.message);
    } finally {
      setUploading(false);

      setProgress(0);
    }
  }

  /*
  =====================================================
  Upload múltiplo
  =====================================================
  */

  async function handleFiles(event) {
    const files = Array.from(event.target.files);

    if (!files.length) return;

    for (const file of files) {
      await uploadFile(file);
    }

    event.target.value = '';
  }

  /*
  =====================================================
  Drag & Drop
  =====================================================
  */

  function handleDragOver(e) {
    e.preventDefault();

    setDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();

    setDragging(false);
  }

  async function handleDrop(e) {
    e.preventDefault();

    setDragging(false);

    const files = Array.from(e.dataTransfer.files);

    if (!files.length) return;

    for (const file of files) {
      await uploadFile(file);
    }
  }

  /*
  =====================================================
  Remover imagem
  =====================================================
  */

  function removeImage(public_id) {
    const newImages = images.filter((image) => image.public_id !== public_id);

    if (!newImages.find((image) => image.isCover) && newImages.length) {
      newImages[0].isCover = true;
    }

    onChange(newImages);
  }

  /*
  =====================================================
  Definir capa
  =====================================================
  */

  function setCover(public_id) {
    const newImages = images.map((image) => ({
      ...image,

      isCover: image.public_id === public_id,
    }));

    onChange(newImages);
  }
  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
            <ImageIcon size={20} />
            Fotos do imóvel
          </h3>

          <p className="mt-1 text-sm text-gray-400">
            Adicione fotos profissionais do imóvel.
          </p>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="
            flex
            items-center
            gap-2
            rounded-xl
            bg-blue-600
            px-4
            py-2
            text-sm
            font-medium
            text-white
            transition
            hover:bg-blue-700
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {uploading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Upload size={18} />
          )}

          {uploading ? 'Enviando...' : 'Adicionar fotos'}
        </button>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          hidden
          onChange={handleFiles}
        />
      </div>

      {/* =====================================================
          PROGRESSO
      ===================================================== */}

      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Upload em andamento...</span>

            <span>{progress}%</span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-gray-800">
            <div
              style={{
                width: `${progress}%`,
              }}
              className="
                h-full
                rounded-full
                bg-blue-500
                transition-all
                duration-300
              "
            />
          </div>
        </div>
      )}

      {/* =====================================================
          DROP AREA
      ===================================================== */}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          flex
          h-56
          cursor-pointer
          flex-col
          items-center
          justify-center
          rounded-2xl
          border-2
          border-dashed
          transition-all

          ${
            dragging
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-gray-700 bg-[#111827]'
          }

          hover:border-blue-500
          hover:bg-blue-500/5
        `}
      >
        <Upload
          size={42}
          className={`
            mb-4
            ${dragging ? 'text-blue-500' : 'text-gray-500'}
          `}
        />

        <h4 className="text-base font-semibold text-white">
          Arraste imagens aqui
        </h4>

        <p className="mt-2 text-center text-sm text-gray-400">
          ou clique para selecionar arquivos
        </p>

        <span className="mt-3 text-xs text-gray-500">JPG • PNG • WEBP</span>
      </div>

      {/* =====================================================
          GRID
      ===================================================== */}

      {images.length > 0 && (
        <div
          className="
            grid
            gap-5
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
          "
        >
          {images.map((image) => (
            <div
              key={image.public_id}
              className="
                group
                relative
                overflow-hidden
                rounded-2xl
                border
                border-gray-800
                bg-[#111827]
                shadow-lg
              "
            >
              <img
                src={image.url}
                alt="Imóvel"
                className="
                  h-60
                  w-full
                  object-cover
                  transition-transform
                  duration-500
                  group-hover:scale-105
                "
              />

              {/* Overlay */}

              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-t
                  from-black/90
                  via-black/20
                  to-transparent
                  opacity-0
                  transition
                  duration-300
                  group-hover:opacity-100
                "
              />

              {/* Badge Capa */}

              {image.isCover && (
                <div
                  className="
                    absolute
                    left-3
                    top-3
                    flex
                    items-center
                    gap-1
                    rounded-full
                    bg-yellow-500
                    px-3
                    py-1
                    text-xs
                    font-bold
                    text-black
                  "
                >
                  <Star size={13} fill="currentColor" />
                  CAPA
                </div>
              )}

              {/* Botões */}

              <div
                className="
                  absolute
                  bottom-3
                  right-3
                  flex
                  gap-2
                  opacity-0
                  transition
                  duration-300
                  group-hover:opacity-100
                "
              >
                {!image.isCover && (
                  <button
                    type="button"
                    onClick={() => setCover(image.public_id)}
                    className="
                      rounded-xl
                      bg-yellow-500
                      p-3
                      text-black
                      transition
                      hover:scale-110
                    "
                    title="Definir como capa"
                  >
                    <Star size={18} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => removeImage(image.public_id)}
                  className="
                    rounded-xl
                    bg-red-600
                    p-3
                    text-white
                    transition
                    hover:scale-110
                    hover:bg-red-700
                  "
                  title="Remover imagem"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estado vazio */}

      {images.length === 0 && !uploading && (
        <div
          className="
            rounded-2xl
            border
            border-dashed
            border-gray-700
            bg-[#111827]
            py-14
            text-center
          "
        >
          <ImageIcon size={46} className="mx-auto mb-4 text-gray-600" />

          <h3 className="text-lg font-semibold text-white">
            Nenhuma imagem adicionada
          </h3>

          <p className="mt-2 text-sm text-gray-400">
            Faça upload das fotos para começar.
          </p>
        </div>
      )}
    </div>
  );
}

import { useRef, useState } from 'react';

import { FaCloudUploadAlt, FaImage } from 'react-icons/fa';

const Dropzone = ({ onFileSelected, accept = 'image/*', maxSize = 5 }) => {
  const inputRef = useRef(null);

  const [dragActive, setDragActive] = useState(false);

  const validateFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Selecione apenas imagens.');

      return false;
    }

    const fileSizeMB = file.size / 1024 / 1024;

    if (fileSizeMB > maxSize) {
      alert(`A imagem deve ter no máximo ${maxSize}MB`);

      return false;
    }

    return true;
  };

  const handleFile = (file) => {
    if (!file) return;

    if (validateFile(file)) {
      onFileSelected(file);
    }
  };

  const handleInputChange = (event) => {
    const file = event.target.files[0];

    handleFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();

    setDragActive(false);

    const file = event.dataTransfer.files[0];

    handleFile(file);
  };

  return (
    <div>
      <input
        ref={inputRef}

        type="file"

        accept={accept}

        hidden

        onChange={handleInputChange}
      />

      <div
        onDragEnter={() => setDragActive(true)}

        onDragOver={(event) => event.preventDefault()}

        onDragLeave={() => setDragActive(false)}

        onDrop={handleDrop}

        onClick={() => inputRef.current.click()}

        className={`
          cursor-pointer
          border-2
          border-dashed
          rounded-xl
          p-8
          text-center
          transition

          ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400'
          }

        `}
      >
        <div
          className="
          flex
          flex-col
          items-center
          gap-3
        "
        >
          {dragActive ? (
            <FaImage
              className="
                text-5xl
                text-blue-500
              "
            />
          ) : (
            <FaCloudUploadAlt
              className="
                text-5xl
                text-gray-400
              "
            />
          )}

          <p
            className="
              text-gray-700
              font-medium
            "
          >
            Arraste sua imagem aqui
          </p>

          <span
            className="
              text-sm
              text-gray-500
            "
          >
            ou clique para selecionar
          </span>

          <span
            className="
              text-xs
              text-gray-400
            "
          >
            PNG, JPG ou WEBP até {maxSize}MB
          </span>
        </div>
      </div>
    </div>
  );
};

export default Dropzone;

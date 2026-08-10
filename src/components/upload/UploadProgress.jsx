const UploadProgress = ({ progress = 0, label = 'Enviando imagem...' }) => {
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">{label}</span>

        <span className="text-sm font-semibold">{progress}%</span>
      </div>

      <div
        className="
          w-full
          h-3
          bg-gray-200
          rounded-full
          overflow-hidden
        "
      >
        <div
          className="
            h-full
            bg-blue-600
            transition-all
            duration-300
            ease-in-out
          "
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      {progress === 100 && (
        <p
          className="
            text-sm
            text-green-600
            font-medium
          "
        >
          Upload concluído!
        </p>
      )}
    </div>
  );
};

export default UploadProgress;

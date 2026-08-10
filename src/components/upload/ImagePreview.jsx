const ImagePreview = ({
  image,
  type = 'avatar',
  loading = false,
  className = '',
}) => {
  if (!image) {
    return null;
  }

  const isAvatar = type === 'avatar';

  return (
    <div
      className={`
        relative
        overflow-hidden
        ${isAvatar ? 'w-32 h-32 rounded-full' : 'w-full h-56 rounded-xl'}
        ${className}
      `}
    >
      <img
        src={image}
        alt="Preview"
        className="
          w-full
          h-full
          object-cover
        "
      />

      {loading && (
        <div
          className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              bg-black/40
            "
        >
          <div
            className="
                w-8
                h-8
                border-4
                border-white
                border-t-transparent
                rounded-full
                animate-spin
              "
          />
        </div>
      )}
    </div>
  );
};

export default ImagePreview;

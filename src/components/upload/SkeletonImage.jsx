const SkeletonImage = ({ type = 'avatar', className = '' }) => {
  const isAvatar = type === 'avatar';

  return (
    <div
      className={`
        animate-pulse
        bg-gray-200
        overflow-hidden

        ${isAvatar ? 'w-32 h-32 rounded-full' : 'w-full h-56 rounded-xl'}

        ${className}
      `}
    >
      <div
        className="
          w-full
          h-full
          bg-gray-300
        "
      />
    </div>
  );
};

export default SkeletonImage;

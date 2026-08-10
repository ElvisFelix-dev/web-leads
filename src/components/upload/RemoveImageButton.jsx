import { FaTrash } from 'react-icons/fa';

const RemoveImageButton = ({
  onRemove,
  label = 'Remover foto',
  disabled = false,
}) => {
  return (
    <button
      type="button"

      disabled={disabled}

      onClick={onRemove}

      className="
        inline-flex
        items-center
        gap-2

        px-4
        py-2

        rounded-lg

        bg-red-50

        text-red-600

        hover:bg-red-100

        transition

        disabled:
        opacity-50

        disabled:
        cursor-not-allowed
      "
    >
      <FaTrash />

      <span>{label}</span>
    </button>
  );
};

export default RemoveImageButton;

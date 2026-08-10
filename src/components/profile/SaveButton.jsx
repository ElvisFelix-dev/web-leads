import { FaSave, FaSpinner } from 'react-icons/fa';

export default function SaveButton({
  loading = false,
  children = 'Salvar alterações',
  type = 'submit',
  disabled = false,
  className = '',
}) {
  return (
    <button
      type={type}
      disabled={loading || disabled}
      className={`
        flex
        items-center
        justify-center
        gap-2
        px-6
        py-3
        rounded-xl
        font-medium
        text-white
        transition
        duration-200

        ${
          loading || disabled
            ? `
              bg-gray-400
              cursor-not-allowed
            `
            : `
              bg-blue-600
              hover:bg-blue-700
              active:scale-95
            `
        }

        ${className}
      `}
    >
      {loading ? (
        <>
          <FaSpinner
            className="
              animate-spin
            "
          />
          Salvando...
        </>
      ) : (
        <>
          <FaSave />

          {children}
        </>
      )}
    </button>
  );
}

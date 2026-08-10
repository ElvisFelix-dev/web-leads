import { FaExclamationCircle } from 'react-icons/fa';

export default function FormError({ message, className = '' }) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={`
        flex
        items-center
        gap-2
        mt-2
        text-sm
        text-red-400
        ${className}
      `}
    >
      <FaExclamationCircle
        className="
          flex-shrink-0
        "
      />

      <span>{message}</span>
    </div>
  );
}

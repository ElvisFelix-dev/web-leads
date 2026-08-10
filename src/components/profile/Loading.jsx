import { FaSpinner } from 'react-icons/fa';

export default function Loading({ message = 'Carregando...' }) {
  return (
    <div
      className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-gray-950
      "
    >
      <div
        className="
          flex
          flex-col
          items-center
          gap-5
        "
      >
        <div
          className="
            flex
            items-center
            justify-center
            w-16
            h-16
            rounded-full
            bg-gray-900
            border
            border-gray-800
          "
        >
          <FaSpinner
            className="
              text-3xl
              text-blue-500
              animate-spin
            "
          />
        </div>

        <p
          className="
            text-sm
            text-gray-400
          "
        >
          {message}
        </p>
      </div>
    </div>
  );
}

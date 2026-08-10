import { FaExclamationTriangle } from 'react-icons/fa'

export default function ConfirmActionModal({
  open,
  title = 'Confirmar ação',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmColor = 'red',
  loading = false,
  onConfirm,
  onClose,
}) {
  if (!open) return null

  const colors = {
    red: 'bg-red-600 hover:bg-red-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    yellow: 'bg-yellow-500 hover:bg-yellow-600 text-black',
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/70
        backdrop-blur-sm
        p-4
      "
    >
      <div
        className="
          w-full
          max-w-md
          rounded-2xl
          bg-gray-900
          border
          border-gray-800
          shadow-2xl
          overflow-hidden
          animate-in
          fade-in
          zoom-in-95
          duration-200
        "
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-4">
            <div
              className="
                h-14
                w-14
                rounded-full
                bg-red-500/10
                flex
                items-center
                justify-center
              "
            >
              <FaExclamationTriangle
                size={26}
                className="text-red-400"
              />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">
                {title}
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="
            flex
            justify-end
            gap-3
            p-5
          "
        >
          <button
            onClick={onClose}
            disabled={loading}
            className="
              px-5
              py-2
              rounded-xl
              bg-gray-700
              hover:bg-gray-600
              transition
              disabled:opacity-50
            "
          >
            {cancelText}
          </button>

          <button
            disabled={loading}
            onClick={onConfirm}
            className={`
              px-5
              py-2
              rounded-xl
              text-white
              transition
              disabled:opacity-50
              ${colors[confirmColor]}
            `}
          >
            {loading
              ? 'Processando...'
              : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

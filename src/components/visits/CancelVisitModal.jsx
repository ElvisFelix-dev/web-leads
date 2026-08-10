import { useEffect, useState } from 'react'

import {
  FaTimes,
  FaBan,
  FaExclamationTriangle,
} from 'react-icons/fa'

export default function CancelVisitModal({
  open,
  loading = false,
  onClose,
  onConfirm,
}) {
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (open) {
      setReason('')
    }
  }, [open])

  if (!open) return null

  const handleConfirm = () => {
    onConfirm({
      reason,
    })
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
      onClick={onClose}
    >
      <div
        className="
          w-full
          max-w-lg
          rounded-2xl
          bg-gray-900
          border
          border-gray-800
          shadow-2xl
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}

        <div
          className="
            flex
            items-center
            justify-between
            p-6
            border-b
            border-gray-800
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                w-10
                h-10
                rounded-full
                bg-red-500/20
                flex
                items-center
                justify-center
              "
            >
              <FaExclamationTriangle className="text-red-500" />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white">
                Cancelar visita
              </h2>

              <p className="text-sm text-gray-400">
                Essa ação poderá ser registrada no histórico.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="
              text-gray-400
              hover:text-white
              transition
            "
          >
            <FaTimes />
          </button>
        </div>

        {/* Conteúdo */}

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Motivo do cancelamento
            </label>

            <textarea
              rows={5}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex.: Cliente desistiu, imóvel indisponível, reagendamento solicitado..."
              className="
                w-full
                rounded-xl
                border
                border-gray-700
                bg-gray-800
                px-4
                py-3
                text-white
                resize-none
                outline-none
                focus:border-red-500
              "
            />
          </div>

          <div
            className="
              rounded-xl
              bg-red-500/10
              border
              border-red-500/20
              p-4
              text-sm
              text-red-300
            "
          >
            O cancelamento atualizará o status da visita e poderá alterar o estágio do lead no CRM.
          </div>
        </div>

        {/* Footer */}

        <div
          className="
            flex
            justify-end
            gap-3
            p-6
            border-t
            border-gray-800
          "
        >
          <button
            onClick={onClose}
            disabled={loading}
            className="
              px-5
              py-2.5
              rounded-xl
              bg-gray-700
              hover:bg-gray-600
              transition
              disabled:opacity-50
            "
          >
            Voltar
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="
              flex
              items-center
              gap-2
              px-5
              py-2.5
              rounded-xl
              bg-red-600
              hover:bg-red-700
              transition
              disabled:opacity-50
            "
          >
            <FaBan />

            {loading
              ? 'Cancelando...'
              : 'Cancelar visita'}
          </button>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'

import {
  FaCheckCircle,
  FaTimes,
  FaClipboardCheck,
} from 'react-icons/fa'

export default function VisitResultModal({
  open,
  loading = false,
  onClose,
  onConfirm,
}) {
  const [result, setResult] = useState('interessado')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (open) {
      setResult('interessado')
      setNotes('')
    }
  }, [open])

  if (!open) return null

  const handleConfirm = () => {
    onConfirm({
      result,
      notes,
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
            <FaClipboardCheck className="text-purple-500 text-xl" />

            <h2 className="text-xl font-semibold text-white">
              Finalizar visita
            </h2>
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
              Resultado da visita
            </label>

            <select
              value={result}
              onChange={(e) => setResult(e.target.value)}
              className="
                w-full
                rounded-xl
                border
                border-gray-700
                bg-gray-800
                px-4
                py-3
                text-white
                outline-none
                focus:border-blue-500
              "
            >
              <option value="interessado">
                Interessado
              </option>

              <option value="aguardando">
                Aguardando decisão
              </option>

              <option value="reagendar">
                Reagendar visita
              </option>

              <option value="desistiu">
                Cliente desistiu
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">
              Observações
            </label>

            <textarea
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre a visita..."
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
                focus:border-blue-500
              "
            />
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
            Cancelar
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
              bg-purple-600
              hover:bg-purple-700
              transition
              disabled:opacity-50
            "
          >
            <FaCheckCircle />

            {loading
              ? 'Salvando...'
              : 'Finalizar visita'}
          </button>
        </div>
      </div>
    </div>
  )
}

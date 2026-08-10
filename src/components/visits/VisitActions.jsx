import { useState } from 'react'
import { toast } from 'react-toastify'

import {
  FaCheckCircle,
  FaFlagCheckered,
  FaTimesCircle,
} from 'react-icons/fa'

import {
  confirmVisit,
  completeVisit,
  cancelVisit,
} from '../../service/visitApi'

import ConfirmActionModal from './ConfirmActionModal'
import CancelVisitModal from './CancelVisitModal'
import VisitResultModal from './VisitResultModal'

export default function VisitActions({
  visit,
  onRefresh,
}) {
  const [loading, setLoading] = useState(false)

  const [showConfirmModal, setShowConfirmModal] =
    useState(false)

  const [showCancelModal, setShowCancelModal] =
    useState(false)

  const [showResultModal, setShowResultModal] =
    useState(false)

  // =====================================
  // Confirmar visita
  // =====================================

  const handleConfirm = async () => {
    try {
      setLoading(true)

      await confirmVisit(visit._id)

      toast.success('Visita confirmada com sucesso!')

      setShowConfirmModal(false)

      onRefresh?.()
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Erro ao confirmar visita.'
      )
    } finally {
      setLoading(false)
    }
  }

  // =====================================
  // Finalizar visita
  // =====================================

  const handleComplete = async ({
    result,
    notes,
  }) => {
    try {
      setLoading(true)

      await completeVisit(visit._id, {
        result,
        notes,
      })

      toast.success('Visita finalizada com sucesso!')

      setShowResultModal(false)

      onRefresh?.()
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Erro ao finalizar visita.'
      )
    } finally {
      setLoading(false)
    }
  }

  // =====================================
  // Cancelar visita
  // =====================================

  const handleCancel = async ({
    reason,
  }) => {
    try {
      setLoading(true)

      await cancelVisit(visit._id, {
        reason,
      })

      toast.success('Visita cancelada com sucesso!')

      setShowCancelModal(false)

      onRefresh?.()
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          'Erro ao cancelar visita.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Botões */}

      <div className="mt-6 flex flex-wrap gap-3">
        {visit.status === 'agendada' && (
          <>
            <button
              onClick={() =>
                setShowConfirmModal(true)
              }
              className="
                flex
                items-center
                gap-2
                px-4
                py-2
                rounded-xl
                bg-green-600
                hover:bg-green-700
                transition
              "
            >
              <FaCheckCircle />

              Confirmar
            </button>

            <button
              onClick={() =>
                setShowCancelModal(true)
              }
              className="
                flex
                items-center
                gap-2
                px-4
                py-2
                rounded-xl
                bg-red-600
                hover:bg-red-700
                transition
              "
            >
              <FaTimesCircle />

              Cancelar
            </button>
          </>
        )}

        {visit.status === 'confirmada' && (
          <>
            <button
              onClick={() =>
                setShowResultModal(true)
              }
              className="
                flex
                items-center
                gap-2
                px-4
                py-2
                rounded-xl
                bg-purple-600
                hover:bg-purple-700
                transition
              "
            >
              <FaFlagCheckered />

              Finalizar
            </button>

            <button
              onClick={() =>
                setShowCancelModal(true)
              }
              className="
                flex
                items-center
                gap-2
                px-4
                py-2
                rounded-xl
                bg-red-600
                hover:bg-red-700
                transition
              "
            >
              <FaTimesCircle />

              Cancelar
            </button>
          </>
        )}
      </div>

      {/* Confirmar */}

      <ConfirmActionModal
        open={showConfirmModal}
        title="Confirmar visita"
        message="Deseja confirmar esta visita?"
        confirmText="Confirmar"
        confirmColor="green"
        loading={loading}
        onClose={() =>
          setShowConfirmModal(false)
        }
        onConfirm={handleConfirm}
      />

      {/* Cancelar */}

      <CancelVisitModal
        open={showCancelModal}
        loading={loading}
        onClose={() =>
          setShowCancelModal(false)
        }
        onConfirm={handleCancel}
      />

      {/* Finalizar */}

      <VisitResultModal
        open={showResultModal}
        loading={loading}
        onClose={() =>
          setShowResultModal(false)
        }
        onConfirm={handleComplete}
      />
    </>
  )
}

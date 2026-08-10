import { useEffect } from 'react';
import { X } from 'lucide-react';

import VisitForm from './VisitForm';

export default function VisitModal({
  open,
  onClose,
  visit,
  leads = [],
  properties = [],
  onSuccess,
  loading = false,
}) {
  // ============================================================
  // ESC PARA FECHAR
  // ============================================================

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !loading) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, loading, onClose]);

  // ============================================================
  // BLOQUEAR SCROLL DO BODY
  // ============================================================

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  // ============================================================
  // NÃO RENDERIZAR
  // ============================================================

  if (!open) {
    return null;
  }

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (data) => {
    try {
      await onSuccess(data);
    } catch (error) {
      console.error('Erro ao salvar visita:', error);

      throw error;
    }
  };

  // ============================================================
  // FECHAR
  // ============================================================

  const handleClose = () => {
    if (loading) {
      return;
    }

    onClose();
  };

  // ============================================================
  // RENDER
  // ============================================================

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
        p-4
        backdrop-blur-sm
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="
          flex
          w-full
          max-w-2xl
          max-h-[92vh]
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-gray-800
          bg-gray-900
          shadow-2xl
        "
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <div
          className="
            flex
            shrink-0
            items-center
            justify-between
            border-b
            border-gray-800
            px-6
            py-4
          "
        >
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-white">
              {visit ? 'Editar visita' : 'Nova visita'}
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              {visit
                ? 'Atualize as informações da visita.'
                : 'Agende uma visita ao imóvel.'}
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            aria-label="Fechar"
            className="
              ml-4
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              text-gray-400
              transition
              hover:bg-gray-800
              hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <X size={20} />
          </button>
        </div>

        {/* ==================================================
            FORM
        ================================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <VisitForm
            initialData={visit}
            leads={leads}
            properties={properties}
            loading={loading}
            onSubmit={handleSubmit}
            onCancel={handleClose}
          />
        </div>
      </div>
    </div>
  );
}

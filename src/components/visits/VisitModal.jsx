import { useEffect } from 'react';
import {
  X,
  CalendarDays,
  MapPin,
  Users,
  Video,
  Phone,
  Building2,
  FileText,
  Handshake,
  Clock,
} from 'lucide-react';

import VisitForm from './VisitForm';

/*
============================================================
TIPOS DE COMPROMISSO
============================================================
*/

const VISIT_TYPES = {
  visit: {
    label: 'Visita',
    description: 'Visita a um imóvel com o cliente.',
    icon: MapPin,
  },

  meeting: {
    label: 'Reunião',
    description: 'Reunião presencial com cliente ou equipe.',
    icon: Users,
  },

  call: {
    label: 'Ligação',
    description: 'Ligação ou contato telefônico.',
    icon: Phone,
  },

  online_meeting: {
    label: 'Reunião online',
    description: 'Reunião por vídeo ou plataforma online.',
    icon: Video,
  },

  proposal: {
    label: 'Proposta',
    description: 'Apresentação ou acompanhamento de proposta.',
    icon: FileText,
  },

  negotiation: {
    label: 'Negociação',
    description: 'Compromisso relacionado a uma negociação.',
    icon: Handshake,
  },

  internal: {
    label: 'Reunião interna',
    description: 'Reunião interna da imobiliária.',
    icon: Building2,
  },

  other: {
    label: 'Outro',
    description: 'Outro tipo de compromisso.',
    icon: CalendarDays,
  },
};

/*
============================================================
HELPERS
============================================================
*/

const getEventType = (visit) => {
  return visit?.type || 'visit';
};

const getTypeConfig = (visit) => {
  const type = getEventType(visit);

  return (
    VISIT_TYPES[type] || {
      label: 'Compromisso',
      description: 'Compromisso da agenda.',
      icon: CalendarDays,
    }
  );
};

/*
============================================================
COMPONENT
============================================================
*/

export default function VisitModal({
  open,
  onClose,
  visit,
  leads = [],
  properties = [],
  brokers = [],
  onSuccess,
  loading = false,
}) {
  /*
  ============================================================
  ESC PARA FECHAR
  ============================================================
  */

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

  /*
  ============================================================
  BLOQUEAR SCROLL
  ============================================================
  */

  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  /*
  ============================================================
  NÃO RENDERIZAR
  ============================================================
  */

  if (!open) {
    return null;
  }

  /*
  ============================================================
  CONFIGURAÇÃO DO EVENTO
  ============================================================
  */

  const typeConfig = getTypeConfig(visit);

  const TypeIcon = typeConfig.icon;

  const isEditing = Boolean(visit);

  /*
  ============================================================
  SUBMIT
  ============================================================
  */

  const handleSubmit = async (data) => {
    try {
      await onSuccess(data);
    } catch (error) {
      console.error('Erro ao salvar compromisso:', error);

      throw error;
    }
  };

  /*
  ============================================================
  FECHAR
  ============================================================
  */

  const handleClose = () => {
    if (loading) {
      return;
    }

    onClose();
  };

  /*
  ============================================================
  RENDER
  ============================================================
  */

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
          max-w-3xl
          max-h-[94vh]
          flex-col
          overflow-hidden
          rounded-3xl
          border
          border-gray-800
          bg-gray-900
          shadow-2xl
          shadow-black/40
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
            bg-gray-900/95
            px-6
            py-5
          "
        >
          <div className="flex min-w-0 items-center gap-4">
            {/* ICON */}
            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-blue-500/10
                text-blue-400
                ring-1
                ring-blue-500/20
              "
            >
              <TypeIcon size={22} />
            </div>

            {/* TITLE */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">
                  {visit ? 'Editar compromisso' : 'Novo compromisso'}
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  {visit
                    ? 'Atualize as informações do compromisso.'
                    : 'Agende uma nova atividade na sua agenda.'}
                </p>

                {isEditing && (
                  <span
                    className="
                      hidden
                      rounded-full
                      border
                      border-gray-700
                      bg-gray-800
                      px-2.5
                      py-1
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-gray-400
                      sm:inline-flex
                    "
                  >
                    Editando
                  </span>
                )}
              </div>

              <p className="mt-1 text-sm text-gray-400">
                {isEditing
                  ? `Atualize as informações deste ${typeConfig.label.toLowerCase()}.`
                  : 'Organize seu próximo compromisso na agenda.'}
              </p>
            </div>
          </div>

          {/* CLOSE */}
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            aria-label="Fechar"
            className="
              ml-4
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-xl
              border
              border-transparent
              text-gray-400
              transition
              hover:border-gray-700
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
            EVENT TYPE SUMMARY
        ================================================== */}

        <div
          className="
            shrink-0
            border-b
            border-gray-800
            bg-gray-950/40
            px-6
            py-3
          "
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
              <Clock size={14} />

              <span>Tipo do compromisso</span>
            </div>

            <span
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-blue-500/20
                bg-blue-500/10
                px-3
                py-1.5
                text-xs
                font-semibold
                text-blue-300
              "
            >
              <TypeIcon size={13} />

              {typeConfig.label}
            </span>

            <span className="hidden text-xs text-gray-500 sm:block">
              {typeConfig.description}
            </span>
          </div>
        </div>

        {/* ==================================================
            FORM
        ================================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="p-6">
            <VisitForm
              initialData={visit}
              leads={leads}
              properties={properties}
              brokers={brokers}
              loading={loading}
              onSubmit={handleSubmit}
              onCancel={handleClose}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

import {
  DndContext,
  DragOverlay,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';

import { useState } from 'react';

import { Inbox } from 'lucide-react';

import BrokerLeadCard from './BrokerLeadCard';

const STAGES = [
  {
    id: 'novo_lead',
    label: 'Novos Leads',
  },

  {
    id: 'primeiro_contato',
    label: 'Primeiro Contato',
  },

  {
    id: 'qualificado',
    label: 'Qualificados',
  },

  {
    id: 'visita_agendada',
    label: 'Visitas Agendadas',
  },

  {
    id: 'proposta_enviada',
    label: 'Propostas',
  },

  {
    id: 'negociacao',
    label: 'Negociação',
  },

  {
    id: 'fechado',
    label: 'Fechados',
  },

  {
    id: 'perdido',
    label: 'Perdidos',
  },
];

const BrokerPipelineBoard = ({
  leads = [],
  loading = false,
  onChangeStage,
}) => {
  const [activeLead, setActiveLead] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const getLeadsByStage = (stage) => {
    return leads.filter((lead) => lead.stage === stage);
  };

  const handleDragStart = (event) => {
    const lead = leads.find((item) => item._id === event.active.id);

    setActiveLead(lead);
  };

  const handleDragCancel = () => {
    setActiveLead(null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    setActiveLead(null);

    if (!over) return;

    const leadId = active.id;

    const newStage = String(over.id);

    const lead = leads.find((item) => item._id === leadId);

    if (!lead) return;

    if (lead.stage === newStage) return;

    onChangeStage?.(leadId, newStage);
  };

  if (loading) {
    return (
      <div
        className="
          flex
          h-64
          items-center
          justify-center
          rounded-xl
          border
          border-slate-700
          bg-slate-900
          text-slate-400
        "
      >
        Carregando pipeline...
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}

      collisionDetection={closestCorners}

      onDragStart={handleDragStart}

      onDragCancel={handleDragCancel}

      onDragEnd={handleDragEnd}
    >
      <div
        className="
          overflow-x-auto
          pb-5
        "
      >
        <div
          className="
            flex
            min-w-max
            gap-4
          "
        >
          {STAGES.map((stage) => (
            <PipelineColumn
              key={stage.id}

              stage={stage}

              leads={getLeadsByStage(stage.id)}
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeLead && (
          <div
            className="
                rotate-3
                opacity-90
              "
          >
            <BrokerLeadCard lead={activeLead} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};

const PipelineColumn = ({ stage, leads }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  return (
    <div
      ref={setNodeRef}

      className={`
        flex
        w-80
        flex-col
        rounded-xl
        border
        bg-slate-900
        transition

        ${isOver ? 'border-blue-500 bg-slate-800' : 'border-slate-700'}

      `}
    >
      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-slate-700
          px-4
          py-3
        "
      >
        <h3
          className="
            font-semibold
            text-white
          "
        >
          {stage.label}
        </h3>

        <span
          className="
            rounded-full
            bg-slate-800
            px-2
            py-1
            text-xs
            text-slate-400
          "
        >
          {leads.length}
        </span>
      </div>

      <div
        className="
          min-h-[220px]
          space-y-3
          p-3
        "
      >
        {leads.length ? (
          leads.map((lead) => (
            <DraggableLead
              key={lead._id}

              lead={lead}
            />
          ))
        ) : (
          <EmptyStage />
        )}
      </div>
    </div>
  );
};

const DraggableLead = ({ lead }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: lead._id,
  });

  const style = {
    transform: transform
      ? `translate3d(
        ${transform.x}px,
        ${transform.y}px,
        0
      )`
      : undefined,
  };

  return (
    <div
      ref={setNodeRef}

      style={style}

      {...listeners}

      {...attributes}

      className="
        cursor-grab
        active:cursor-grabbing
      "
    >
      <BrokerLeadCard lead={lead} />
    </div>
  );
};

const EmptyStage = () => {
  return (
    <div
      className="
        flex
        h-32
        flex-col
        items-center
        justify-center
        gap-2
        text-slate-600
      "
    >
      <Inbox size={24} />

      <span
        className="
          text-xs
        "
      >
        Solte o lead aqui
      </span>
    </div>
  );
};

export default BrokerPipelineBoard;

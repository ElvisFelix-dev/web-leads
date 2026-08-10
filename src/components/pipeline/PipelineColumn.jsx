/*
=====================================
PIPELINE COLUMN
=====================================
*/

import { useDraggable, useDroppable } from '@dnd-kit/core';

import { Inbox } from 'lucide-react';

import BrokerLeadCard from '../pipeline/brokerPipeline/BrokerLeadCard';

const PipelineColumn = ({ stage, leads = [] }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`
        flex
        w-[340px]
        flex-col
        rounded-2xl
        border
        transition-all
        duration-200
        ${
          isOver
            ? 'border-blue-500 bg-slate-800 shadow-lg shadow-blue-500/10'
            : 'border-slate-700 bg-slate-900'
        }
      `}
    >
      {/* HEADER */}

      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-slate-700
          px-4
          py-4
        "
      >
        <div>
          <h3
            className="
              font-semibold
              text-white
            "
          >
            {stage.label}
          </h3>

          <p
            className="
              mt-1
              text-xs
              text-slate-400
            "
          >
            {leads.length} Leads
          </p>
        </div>

        <span
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            bg-slate-800
            text-sm
            font-semibold
            text-white
          "
        >
          {leads.length}
        </span>
      </div>

      {/* BODY */}

      <div
        className="
          min-h-[600px]
          flex-1
          space-y-3
          p-4
        "
      >
        {leads.length ? (
          leads.map((lead) => <DraggableLead key={lead._id} lead={lead} />)
        ) : (
          <EmptyStage />
        )}
      </div>
    </div>
  );
};

/*
=====================================
DRAGGABLE LEAD
=====================================
*/

const DraggableLead = ({ lead }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: lead._id,
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,

    opacity: isDragging ? 0.45 : 1,

    transition: isDragging ? undefined : 'transform .15s ease',

    touchAction: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        cursor-grab
        active:cursor-grabbing
        ${isDragging ? 'scale-105 z-50' : ''}
      `}
    >
      <BrokerLeadCard lead={lead} />
    </div>
  );
};

/*
=====================================
EMPTY COLUMN
=====================================
*/

const EmptyStage = () => {
  return (
    <div
      className="
        flex
        h-40
        flex-col
        items-center
        justify-center
        rounded-xl
        border-2
        border-dashed
        border-slate-700
        text-slate-500
        transition-colors
      "
    >
      <Inbox size={28} className="mb-3" />

      <p className="text-sm font-medium">Arraste um lead</p>

      <span
        className="
          text-xs
          text-slate-600
        "
      >
        para esta etapa
      </span>
    </div>
  );
};

export default PipelineColumn;

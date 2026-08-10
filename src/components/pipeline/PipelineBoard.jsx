import { useEffect, useMemo, useState } from 'react';

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

import { toast } from 'react-toastify';

import api from '../../service/api';

import PipelineColumn from './PipelineColumn';
import BrokerLeadCard from '../pipeline/brokerPipeline/BrokerLeadCard';

const STAGES = [
  { id: 'novo_lead', label: 'Novos Leads' },
  { id: 'primeiro_contato', label: 'Primeiro Contato' },
  { id: 'qualificado', label: 'Qualificados' },
  { id: 'visita_agendada', label: 'Visitas' },
  { id: 'proposta_enviada', label: 'Propostas' },
  { id: 'negociacao', label: 'Negociação' },
  { id: 'fechado', label: 'Fechados' },
  { id: 'perdido', label: 'Perdidos' },
];

/*
=====================================
CRIA BOARD VAZIO
=====================================
*/

const createEmptyBoard = () => {
  return STAGES.reduce((acc, stage) => {
    acc[stage.id] = [];
    return acc;
  }, {});
};

const PipelineBoard = ({ pipeline = {}, loading = false, reload }) => {
  const [board, setBoard] = useState(createEmptyBoard());

  const [activeLead, setActiveLead] = useState(null);

  /*
  =====================================
  SINCRONIZA PIPELINE
  =====================================
  */

  useEffect(() => {
    const nextBoard = createEmptyBoard();

    Object.entries(pipeline || {}).forEach(([stage, leads]) => {
      nextBoard[stage] = Array.isArray(leads) ? leads : [];
    });

    setBoard(nextBoard);
  }, [pipeline]);

  /*
  =====================================
  DND
  =====================================
  */

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  /*
  =====================================
  TODAS AS LEADS
  =====================================
  */

  const allLeads = useMemo(() => {
    return Object.values(board).flat();
  }, [board]);

  /*
  =====================================
  DRAG START
  =====================================
  */

  const handleDragStart = (event) => {
    const lead = allLeads.find((item) => item._id === String(event.active.id));

    setActiveLead(lead || null);
  };

  /*
  =====================================
  CANCEL
  =====================================
  */

  const handleDragCancel = () => {
    setActiveLead(null);
  };

  /*
  =====================================
  DRAG END
  =====================================
  */

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    setActiveLead(null);

    if (!over) return;

    const leadId = String(active.id);
    const destinationStage = String(over.id);

    const movedLead = allLeads.find((lead) => lead._id === leadId);

    if (!movedLead) return;

    if (movedLead.stage === destinationStage) return;

    /*
    =====================================
    BACKUP
    =====================================
    */

    const previousBoard = structuredClone(board);

    /*
    =====================================
    NOVO BOARD
    =====================================
    */

    const newBoard = structuredClone(board);

    /*
    =====================================
    REMOVE DA ORIGEM
    =====================================
    */

    Object.keys(newBoard).forEach((stage) => {
      newBoard[stage] = (newBoard[stage] || []).filter(
        (lead) => lead._id !== leadId,
      );
    });

    /*
    =====================================
    GARANTE DESTINO
    =====================================
    */

    if (!newBoard[destinationStage]) {
      newBoard[destinationStage] = [];
    }

    /*
    =====================================
    ADICIONA DESTINO
    =====================================
    */

    newBoard[destinationStage].unshift({
      ...movedLead,
      stage: destinationStage,
    });

    /*
    =====================================
    UPDATE OTIMISTA
    =====================================
    */

    setBoard(newBoard);

    try {
      await api.patch(`/api/leads/${leadId}/stage`, {
        stage: destinationStage,
      });

      toast.success('Lead movido com sucesso');

      reload?.();
    } catch (error) {
      console.error(error);

      setBoard(previousBoard);

      toast.error(error.response?.data?.message || 'Erro ao mover Lead.');
    }
  };

  /*
  =====================================
  LOADING
  =====================================
  */

  if (loading) {
    return (
      <div
        className="
          flex
          h-96
          items-center
          justify-center
          rounded-3xl
          border
          border-slate-800
          bg-slate-900
        "
      >
        <div className="text-center">
          <div
            className="
              mx-auto
              mb-5
              h-12
              w-12
              animate-spin
              rounded-full
              border-4
              border-blue-500
              border-t-transparent
            "
          />

          <p className="text-slate-400">Carregando Pipeline...</p>
        </div>
      </div>
    );
  }

  /*
  =====================================
  RENDER
  =====================================
  */

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
            gap-5
          "
        >
          {STAGES.map((stage) => (
            <PipelineColumn
              key={stage.id}
              stage={stage}
              leads={board[stage.id]}
            />
          ))}
        </div>
      </div>

      <DragOverlay>
        {activeLead ? (
          <div
            className="
              rotate-2
              opacity-90
            "
          >
            <BrokerLeadCard lead={activeLead} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default PipelineBoard;

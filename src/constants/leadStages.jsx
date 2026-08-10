// src/constants/leadStages.js

export const LEAD_STAGES = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  VISIT: 'visit',
  PROPOSAL: 'proposal',
  NEGOTIATION: 'negotiation',
  WON: 'won',
  LOST: 'lost',
};

export const LEAD_STAGE_LABELS = {
  [LEAD_STAGES.NEW]: 'Novo Lead',
  [LEAD_STAGES.CONTACTED]: 'Contato',
  [LEAD_STAGES.QUALIFIED]: 'Qualificado',
  [LEAD_STAGES.VISIT]: 'Visita',
  [LEAD_STAGES.PROPOSAL]: 'Proposta',
  [LEAD_STAGES.NEGOTIATION]: 'Negociação',
  [LEAD_STAGES.WON]: 'Fechado',
  [LEAD_STAGES.LOST]: 'Perdido',
};

import { useEffect, useState } from 'react';

import { toast } from 'react-toastify';

import api from '../service/api';

import useUser from '../hooks/useUser';

import BrokerPipelineHeader from '../components/pipeline/brokerPipeline/BrokerPipelineHeader';

import BrokerPipelineFilters from '../components/pipeline/brokerPipeline/BrokerPipelineFilters';

import BrokerPipelineBoard from '../components/pipeline/brokerPipeline/BrokerPipelineBoard';

const initialFilters = {
  search: '',

  status: '',

  priority: '',

  region: '',

  source: '',

  noContact: false,
};

const BrokerPipeline = () => {
  const { user } = useUser();

  const [leads, setLeads] = useState([]);

  const [filters, setFilters] = useState(initialFilters);

  const [loading, setLoading] = useState(false);

  /*
  =====================================
  LOAD LEADS
  =====================================
  */

  const loadLeads = async () => {
    try {
      setLoading(true);

      const params = {
        ...filters,
      };

      const response = await api.get('/api/leads', {
        params,
      });

      console.log('LEADS API:', response.data);

      setLeads(
        Array.isArray(response.data) ? response.data : response.data.data || [],
      );
    } catch (error) {
      console.error(error);

      toast.error('Erro ao carregar leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    loadLeads();
  }, [filters]);

  /*
  =====================================
  CREATE LEAD
  =====================================
  */

  const handleCreateLead = () => {
    console.log('abrir modal novo lead');
  };

  /*
  =====================================
  CHANGE STAGE
  =====================================
  */

  const handleChangeStage = async (leadId, newStage) => {
    const previousLeads = [...leads];

    try {
      /*
      Atualização otimista
      */

      setLeads((current) =>
        current.map((lead) =>
          lead._id === leadId
            ? {
                ...lead,

                stage: newStage,
              }
            : lead,
        ),
      );

      await api.patch(
        `/api/leads/${leadId}/stage`,

        {
          stage: newStage,
        },
      );

      toast.success('Lead atualizado');
    } catch (error) {
      console.error(error);

      setLeads(previousLeads);

      toast.error('Não foi possível mover o lead');
    }
  };

  /*
  =====================================
  STATS
  =====================================
  */

  const stats = {
    total: leads.length,

    novos: leads.filter((lead) => lead.stage === 'novo_lead').length,

    andamento: leads.filter((lead) =>
      ['primeiro_contato', 'qualificado', 'negociacao'].includes(lead.stage),
    ).length,

    visitas: leads.filter((lead) => lead.stage === 'visita_agendada').length,

    convertidos: leads.filter((lead) => lead.stage === 'fechado').length,
  };

  console.log(
    leads.map((lead) => ({
      name: lead.name,
      stage: lead.stage,
    })),
  );

  return (
    <div
      className="
        min-h-screen
        bg-slate-950
        p-6
      "
    >
      <BrokerPipelineHeader
        broker={user}

        stats={stats}

        reload={loadLeads}

        loading={loading}

        onCreateLead={handleCreateLead}
      />

      <BrokerPipelineFilters
        filters={filters}

        setFilters={setFilters}
      />

      <BrokerPipelineBoard
        leads={leads}

        loading={loading}

        onChangeStage={handleChangeStage}
      />
    </div>
  );
};

export default BrokerPipeline;

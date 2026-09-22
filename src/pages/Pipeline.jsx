import { useEffect, useState } from 'react';

import api from '../service/api';

import PipelineHeader from '../components/pipeline/PipelineHeader';
import PipelineFilters from '../components/pipeline/PipelineFilters';
import PipelineBoard from '../components/pipeline/PipelineBoard';

const Pipeline = () => {
  const [pipeline, setPipeline] = useState({});
  const [loading, setLoading] = useState(true);

  const [brokers, setBrokers] = useState([]);
  const [loadingBrokers, setLoadingBrokers] = useState(true);

  const [filters, setFilters] = useState({
    region: '',
    assignedTo: '',
    source: '',
    status: '',
    priority: '',
  });

  /*
  =====================================
  LOAD BROKERS
  =====================================
  */

  const loadBrokers = async () => {
    try {
      setLoadingBrokers(true);

      const { data } = await api.get('/api/users/brokers');

      console.log('====================================');
      console.log('👥 CORRETORES DO PIPELINE');
      console.log('Resposta:', data);
      console.log('Corretores:', data?.data);
      console.log('====================================');

      const brokerList = Array.isArray(data?.data) ? data.data : [];

      setBrokers(brokerList);
    } catch (error) {
      console.error(
        '❌ Erro ao carregar corretores:',
        error.response?.data || error.message,
      );

      setBrokers([]);
    } finally {
      setLoadingBrokers(false);
    }
  };

  /*
  =====================================
  LOAD PIPELINE
  =====================================
  */

  const loadPipeline = async () => {
    try {
      setLoading(true);

      const { data } = await api.get('/api/leads/pipeline', {
        params: filters,
      });

      const pipelineData = data?.data || {};

      console.log('====================================');
      console.log('📊 PIPELINE API');
      console.log('Filtros:', filters);
      console.log('Pipeline:', pipelineData);
      console.log('====================================');

      setPipeline(pipelineData);
    } catch (error) {
      console.error(
        '❌ Erro ao carregar pipeline:',
        error.response?.data || error.message,
      );

      setPipeline({});
    } finally {
      setLoading(false);
    }
  };

  /*
  =====================================
  INITIAL LOAD
  =====================================
  */

  useEffect(() => {
    loadBrokers();
  }, []);

  /*
  =====================================
  LOAD PIPELINE WHEN FILTER CHANGES
  =====================================
  */

  useEffect(() => {
    loadPipeline();
  }, [filters]);

  /*
  =====================================
  TOTAL LEADS
  =====================================
  */

  const totalLeads = Object.values(pipeline || {}).flat().length;

  /*
  =====================================
  PIPELINE METRICS
  =====================================
  */

  const metrics = {
    novo_lead: pipeline.novo_lead?.length || 0,
    primeiro_contato: pipeline.primeiro_contato?.length || 0,
    qualificado: pipeline.qualificado?.length || 0,
    visita_agendada: pipeline.visita_agendada?.length || 0,
    proposta_enviada: pipeline.proposta_enviada?.length || 0,
    negociacao: pipeline.negociacao?.length || 0,
    fechado: pipeline.fechado?.length || 0,
    perdido: pipeline.perdido?.length || 0,

    /*
    Compatibilidade com Header
    */

    convertidos: pipeline.fechado?.length || 0,
  };

  console.log('Pipeline metrics:', metrics);

  return (
    <div className="min-h-screen bg-gray-950">
      <main className="p-6">
        {/* HEADER */}

        <PipelineHeader
          totalLeads={totalLeads}
          metrics={metrics}
          reload={loadPipeline}
          loading={loading}
        />

        {/* FILTERS */}

        <div className="mt-6">
          <PipelineFilters
            filters={filters}
            setFilters={setFilters}
            brokers={brokers}
            loadingBrokers={loadingBrokers}
          />
        </div>

        {/* BOARD */}

        <div className="mt-6">
          <PipelineBoard
            pipeline={pipeline}
            loading={loading}
            reload={loadPipeline}
          />
        </div>
      </main>
    </div>
  );
};

export default Pipeline;

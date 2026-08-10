import { useEffect, useState } from 'react';

import {
  Users,
  Search,
  UserRoundCheck,
  CheckSquare,
  Square,
  Send,
  ChevronDown,
} from 'lucide-react';

import { toast } from 'react-toastify';

import api from '../service/api';

export default function AssignLeads() {
  const [leads, setLeads] = useState([]);

  const [brokers, setBrokers] = useState([]);

  const [selectedLeads, setSelectedLeads] = useState([]);

  const [selectedBroker, setSelectedBroker] = useState('');

  const [brokerOpen, setBrokerOpen] = useState(false);

  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(true);

  const [assigning, setAssigning] = useState(false);

  const selectedBrokerData = brokers.find(
    (broker) => broker._id === selectedBroker,
  );

  async function loadData() {
    try {
      const [leadsResponse, brokersResponse] = await Promise.all([
        api.get('/api/leads'),

        api.get('/api/users/brokers'),
      ]);

      setLeads(Array.isArray(leadsResponse.data) ? leadsResponse.data : []);

      setBrokers(brokersResponse.data.data || []);
    } catch (error) {
      console.error(error);

      toast.error('Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredLeads = leads.filter((lead) => {
    const withoutBroker = !lead.assignedTo;

    const value = search.toLowerCase();

    const matches =
      lead.name?.toLowerCase().includes(value) ||
      lead.email?.toLowerCase().includes(value) ||
      lead.phone?.includes(value);

    return withoutBroker && matches;
  });

  function toggleLead(id) {
    setSelectedLeads((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }

      return [...prev, id];
    });
  }

  function toggleAll() {
    if (
      selectedLeads.length === filteredLeads.length &&
      filteredLeads.length > 0
    ) {
      setSelectedLeads([]);

      return;
    }

    setSelectedLeads(filteredLeads.map((lead) => lead._id));
  }

  async function handleAssign() {
    if (!selectedBroker) {
      toast.warning('Selecione um corretor.');

      return;
    }

    if (selectedLeads.length === 0) {
      toast.warning('Selecione pelo menos um lead.');

      return;
    }

    try {
      setAssigning(true);

      await api.patch('/api/leads/assign', {
        leadIds: selectedLeads,

        userId: selectedBroker,
      });

      toast.success('Leads distribuídos com sucesso!');

      setSelectedLeads([]);

      setSelectedBroker('');

      loadData();
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || 'Erro ao distribuir leads.');
    } finally {
      setAssigning(false);
    }
  }

  if (loading) {
    return (
      <div
        className="
          min-h-screen
          flex
          items-center
          justify-center
          bg-slate-950
          text-slate-400
        "
      >
        Carregando...
      </div>
    );
  }
  return (
    <div
      className="
        min-h-screen
        bg-slate-950
        p-6
      "
    >
      {/* HEADER */}
      <div
        className="
          flex
          flex-col
          lg:flex-row
          justify-between
          gap-4
          mb-6
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <div
            className="
              bg-green-500/10
              p-3
              rounded-xl
            "
          >
            <UserRoundCheck
              size={28}

              className="
                text-green-400
              "
            />
          </div>

          <div>
            <h1
              className="
                text-3xl
                font-bold
                text-white
              "
            >
              Distribuir Leads
            </h1>

            <p
              className="
                text-slate-400
              "
            >
              Leads disponíveis:
              <span
                className="
                  ml-2
                  text-green-400
                  font-semibold
                "
              >
                {filteredLeads.length}
              </span>
            </p>
          </div>
        </div>
      </div>
      {/* SELEÇÃO DO CORRETOR */}
      <div
        className="
          bg-slate-900
          border
          border-slate-800
          rounded-xl
          p-5
          mb-6
        "
      >
        <div
          className="
            flex
            items-center
            gap-2
            mb-4
          "
        >
          <Users
            size={20}

            className="
              text-blue-400
            "
          />

          <h2
            className="
              text-white
              font-semibold
            "
          >
            Corretor responsável
          </h2>
        </div>

        <div
          className="
            relative
          "
        >
          <button
            type="button"

            onClick={() => setBrokerOpen(!brokerOpen)}

            className="
              w-full
              flex
              items-center
              justify-between
              bg-slate-800
              border
              border-slate-700
              rounded-lg
              px-4
              py-3
            "
          >
            {selectedBrokerData ? (
              <div
                className="
                    flex
                    items-center
                    gap-3
                  "
              >
                <img
                  src={selectedBrokerData.avatar || '/avatar-default.png'}

                  alt={selectedBrokerData.name}

                  className="
                      w-12
                      h-12
                      rounded-full
                      object-cover
                      border
                      border-slate-700
                    "
                />

                <div
                  className="
                      text-left
                    "
                >
                  <p
                    className="
                        text-white
                        font-semibold
                      "
                  >
                    {selectedBrokerData.name}
                  </p>

                  <p
                    className="
                        text-sm
                        text-blue-400
                      "
                  >
                    {selectedBrokerData.position || 'Cargo não informado'}
                  </p>

                  <p
                    className="
                        text-xs
                        text-slate-400
                      "
                  >
                    {selectedBrokerData.email}
                  </p>
                </div>
              </div>
            ) : (
              <span
                className="
                    text-slate-400
                  "
              >
                Selecione um corretor
              </span>
            )}

            <ChevronDown
              size={18}

              className="
                text-slate-400
              "
            />
          </button>

          {brokerOpen && (
            <div
              className="
                  absolute
                  z-50
                  mt-2
                  w-full
                  bg-slate-800
                  border
                  border-slate-700
                  rounded-lg
                  shadow-xl
                  max-h-80
                  overflow-y-auto
                "
            >
              {brokers.map((broker) => (
                <button
                  key={broker._id}

                  type="button"

                  onClick={() => {
                    setSelectedBroker(broker._id);

                    setBrokerOpen(false);
                  }}

                  className="
                          w-full
                          flex
                          items-center
                          gap-3
                          px-4
                          py-3
                          hover:bg-slate-700
                          transition
                          text-left
                        "
                >
                  <img
                    src={broker.avatar || '/avatar-default.png'}

                    alt={broker.name}

                    className="
                            w-11
                            h-11
                            rounded-full
                            object-cover
                            border
                            border-slate-700
                          "
                  />

                  <div>
                    <p
                      className="
                              text-white
                              font-medium
                            "
                    >
                      {broker.name}
                    </p>

                    <p
                      className="
                              text-sm
                              text-blue-400
                            "
                    >
                      {broker.position || 'Cargo não informado'}
                    </p>

                    <p
                      className="
                              text-xs
                              text-slate-400
                            "
                    >
                      {broker.email}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      // BUSCA DOS LEADS
      <div
        className="
          bg-slate-900
          border
          border-slate-800
          rounded-xl
          p-4
          mb-6
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          <Search
            size={20}
            className="
              text-slate-500
            "
          />

          <input
            value={search}

            onChange={(e) => setSearch(e.target.value)}

            placeholder="
              Buscar lead por nome, email ou telefone...
            "

            className="
              w-full
              bg-transparent
              outline-none
              text-white
              placeholder:text-slate-500
            "
          />
        </div>
      </div>
      {/* AÇÕES */}
      <div
        className="
          flex
          flex-col
          md:flex-row
          justify-between
          gap-4
          mb-5
        "
      >
        <button
          onClick={toggleAll}

          className="
            flex
            items-center
            justify-center
            gap-2
            bg-slate-800
            hover:bg-slate-700
            text-white
            px-4
            py-2
            rounded-lg
            transition
          "
        >
          {selectedLeads.length === filteredLeads.length &&
          filteredLeads.length > 0 ? (
            <CheckSquare size={18} />
          ) : (
            <Square size={18} />
          )}
          Selecionar todos
        </button>

        <button
          onClick={handleAssign}

          disabled={assigning}

          className="
            flex
            items-center
            justify-center
            gap-2
            bg-green-600
            hover:bg-green-700
            disabled:opacity-50
            text-white
            px-5
            py-2
            rounded-lg
            transition
          "
        >
          <Send size={18} />

          {assigning
            ? 'Distribuindo...'
            : `Distribuir (${selectedLeads.length})`}
        </button>
      </div>
      {/* LISTA DE LEADS */}
      {filteredLeads.length === 0 ? (
        <div
          className="
              bg-slate-900
              border
              border-slate-800
              rounded-xl
              p-8
              text-center
              text-slate-400
            "
        >
          Nenhum lead disponível para distribuição.
        </div>
      ) : (
        <div
          className="
              bg-slate-900
              border
              border-slate-800
              rounded-xl
              overflow-hidden
            "
        >
          <div
            className="
                overflow-x-auto
              "
          >
            <table
              className="
                  w-full
                  min-w-[800px]
                "
            >
              <thead
                className="
                    bg-slate-800
                    text-slate-300
                  "
              >
                <tr>
                  <th className="p-4 text-left">Selecionar</th>

                  <th className="p-4 text-left">Lead</th>

                  <th className="p-4 text-left">Contato</th>

                  <th className="p-4 text-left">Região</th>

                  <th className="p-4 text-left">Data</th>
                </tr>
              </thead>

              <tbody>
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead._id}

                    className="
                            border-t
                            border-slate-800
                            hover:bg-slate-800/60
                            transition
                          "
                  >
                    <td
                      className="
                              p-4
                            "
                    >
                      <button onClick={() => toggleLead(lead._id)}>
                        {selectedLeads.includes(lead._id) ? (
                          <CheckSquare
                            size={20}

                            className="
                                      text-green-400
                                    "
                          />
                        ) : (
                          <Square
                            size={20}

                            className="
                                      text-slate-500
                                    "
                          />
                        )}
                      </button>
                    </td>

                    <td
                      className="
                              p-4
                            "
                    >
                      <p
                        className="
                                text-white
                                font-semibold
                              "
                      >
                        {lead.name}
                      </p>

                      <p
                        className="
                                text-sm
                                text-slate-500
                              "
                      >
                        {lead.source}
                      </p>
                    </td>

                    <td
                      className="
                              p-4
                            "
                    >
                      <p
                        className="
                                text-slate-300
                              "
                      >
                        {lead.email}
                      </p>

                      <p
                        className="
                                text-sm
                                text-slate-500
                              "
                      >
                        {lead.phone}
                      </p>
                    </td>

                    <td
                      className="
                              p-4
                              text-slate-300
                            "
                    >
                      {lead.region || '-'}
                    </td>

                    <td
                      className="
                              p-4
                              text-slate-400
                            "
                    >
                      {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

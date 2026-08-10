import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, Users, Search, Upload, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';

import api from '../service/api';
import { UserContext } from '../context/UserContext';

import ImportLeadsModal from '../components/lead/ImportLeadsModal';

export default function LeadsList() {
  const { user } = useContext(UserContext);

  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');

  const [showImport, setShowImport] = useState(false);

  const fetchLeads = async () => {
    try {
      const { data } = await api.get('/api/leads');

      setLeads(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);

      toast.error('Erro ao carregar leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [user]);

  const filteredLeads = leads.filter((lead) => {
    const value = search.toLowerCase();

    return (
      lead.name?.toLowerCase().includes(value) ||
      lead.email?.toLowerCase().includes(value) ||
      lead.phone?.includes(value)
    );
  });

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
        Carregando leads...
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
      p-2
      rounded-lg
      bg-blue-500/10
    "
          >
            <ClipboardList
              size={28}
              className="
        text-blue-400
      "
            />
          </div>

          <h1
            className="
      text-3xl
      font-bold
      text-white
    "
          >
            Leads
          </h1>
        </div>

        <div
          className="
          flex
          flex-wrap
          gap-3
        "
        >
          <button
            onClick={() => setShowImport(true)}

            className="
              flex
              items-center
              gap-2
              bg-purple-600
              hover:bg-purple-700
              text-white
              px-4
              py-2
              rounded-lg
              transition
            "
          >
            <Upload size={18} />
            Importar CSV
          </button>

          <button
            onClick={() => navigate('/assign-leads')}

            className="
              flex
              items-center
              gap-2
              bg-green-600
              hover:bg-green-700
              text-white
              px-4
              py-2
              rounded-lg
              transition
            "
          >
            <Users size={18} />
            Atribuir
          </button>

          <button
            onClick={() => navigate('/create-lead')}

            className="
              flex
              items-center
              gap-2
              bg-blue-600
              hover:bg-blue-700
              text-white
              px-4
              py-2
              rounded-lg
              transition
            "
          >
            <Plus size={18} />
            Novo Lead
          </button>
        </div>
      </div>

      {/* SEARCH */}

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
              Buscar por nome, email ou telefone...
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
          Nenhum lead encontrado.
        </div>
      ) : (
        <div
          className="
            w-full
            overflow-hidden
            bg-slate-900
            border
            border-slate-800
            rounded-xl
            shadow-lg
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
                min-w-[900px]
                text-left
              "
            >
              <thead
                className="
                  bg-slate-800
                  text-slate-300
                "
              >
                <tr>
                  <th className="p-4">Lead</th>

                  <th className="p-4">Contato</th>

                  <th className="p-4">Etapa</th>

                  <th className="p-4">Status</th>

                  <th className="p-4">Prioridade</th>

                  <th className="p-4">Corretor</th>

                  <th className="p-4">Data</th>
                </tr>
              </thead>

              <tbody>
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead._id}

                    onClick={() => navigate(`/lead-detail/${lead._id}`)}

                    className="
                          border-t
                          border-slate-800
                          hover:bg-slate-800/60
                          cursor-pointer
                          transition
                        "
                  >
                    <td className="p-4">
                      <p
                        className="
                            font-semibold
                            text-white
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
                        {lead.region || '-'}
                      </p>
                    </td>

                    <td className="p-4">
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

                    <td className="p-4">
                      <Badge text={lead.stage} type="blue" />
                    </td>

                    <td className="p-4">
                      <Badge text={lead.status} type="gray" />
                    </td>

                    <td className="p-4">
                      <Badge text={lead.priority} type="yellow" />
                    </td>

                    <td className="p-4">
                      {lead.assignedTo ? (
                        <div
                          className="
                                flex
                                items-center
                                gap-2
                              "
                        >
                          <img
                            src={lead.assignedTo.avatar}

                            alt={lead.assignedTo.name}

                            className="
                                    w-8
                                    h-8
                                    rounded-full
                                    object-cover
                                    border
                                    border-slate-700
                                  "
                          />

                          <span
                            className="
                                  text-slate-300
                                "
                          >
                            {lead.assignedTo.name}
                          </span>
                        </div>
                      ) : (
                        <span
                          className="
                                text-slate-500
                              "
                        >
                          Sem corretor
                        </span>
                      )}
                    </td>

                    <td
                      className="
                          p-4
                          text-slate-400
                        "
                    >
                      {format(new Date(lead.createdAt), 'dd/MM/yyyy')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showImport && (
        <ImportLeadsModal
          onClose={() => setShowImport(false)}

          onSuccess={() => fetchLeads()}
        />
      )}
    </div>
  );
}

function Badge({ text, type }) {
  const styles = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',

    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',

    gray: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <span
      className={`
      px-3
      py-1
      rounded-full
      text-xs
      border
      ${styles[type]}
    `}
    >
      {text || '-'}
    </span>
  );
}

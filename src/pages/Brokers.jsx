import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Search,
  Users,
  UserCheck,
  UserX,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Mail,
  Phone,
  Award,
} from 'lucide-react';

import { toast } from 'react-toastify';

import api from '../service/api';

import { UserContext } from '../context/UserContext';

export default function Brokers() {
  const { user } = useContext(UserContext);

  const [brokers, setBrokers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState('');

  const navigate = useNavigate();

  /*
  =====================================
  BUSCAR CORRETORES
  =====================================
  */

  useEffect(() => {
    console.log('USER CONTEXT:', user);

    if (!user) {
      console.log('Sem usuário');
      return;
    }

    if (!user.token) {
      console.log('Sem token');
      return;
    }

    console.log('Chamando fetchBrokers');

    fetchBrokers();
  }, [user]);

  const fetchBrokers = async () => {
    try {
      setRefreshing(true);

      const { data } = await api.get('/api/users/brokers', {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      console.log('Brokers API:', data);

      const brokersData =
        data?.data || data?.brokers || data?.data?.brokers || [];

      setBrokers(brokersData);
    } catch (error) {
      console.error('Erro ao buscar corretores:', error);

      toast.error('Erro ao carregar corretores.');
    } finally {
      setLoading(false);

      setRefreshing(false);
    }
  };

  /*
  =====================================
  DELETE BROKER
  =====================================
  */

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Deseja remover este corretor?');

    if (!confirmDelete) return;

    try {
      await api.delete(`/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      setBrokers((prev) => prev.filter((broker) => broker._id !== id));

      toast.success('Corretor removido.');
    } catch (error) {
      console.error(error);

      toast.error('Erro ao remover corretor.');
    }
  };

  /*
  =====================================
  SEARCH FILTER
  =====================================
  */

  const filteredBrokers = brokers.filter((broker) => {
    const searchText = `
          ${broker.name || ''}
          ${broker.email || ''}
          ${broker.phone || ''}
          ${broker.creci || ''}
          `.toLowerCase();

    return searchText.includes(search.toLowerCase());
  });

  /*
  =====================================
  METRICS
  =====================================
  */

  const total = brokers.length;

  const active = brokers.filter((broker) => broker.isActive).length;

  const inactive = total - active;
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
          min-h-screen
          items-center
          justify-center
          bg-slate-950
        "
      >
        <div
          className="
            flex
            flex-col
            items-center
            gap-4
          "
        >
          <div
            className="
              h-10
              w-10
              animate-spin
              rounded-full
              border-4
              border-blue-500
              border-t-transparent
            "
          />

          <p
            className="
              text-sm
              text-slate-400
            "
          >
            Carregando corretores...
          </p>
        </div>
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
          mb-6
          rounded-2xl
          border
          border-slate-800
          bg-slate-900
          p-5
          shadow-xl
        "
      >
        <div
          className="
            flex
            flex-col
            gap-5
            xl:flex-row
            xl:items-center
            xl:justify-between
          "
        >
          {/* TITLE */}

          <div>
            <h1
              className="
                text-2xl
                font-bold
                text-white
              "
            >
              Gestão de Corretores
            </h1>

            <p
              className="
                mt-1
                text-sm
                text-slate-400
              "
            >
              Gerencie sua equipe comercial e acompanhe seus corretores.
            </p>

            {/* METRICS */}

            <div
              className="
                mt-5
                flex
                flex-wrap
                gap-3
              "
            >
              <MetricCard
                icon={<Users size={18} />}

                label="Total"

                value={total}

                color="
                  border-blue-500/20
                  bg-blue-500/10
                  text-blue-400
                "
              />

              <MetricCard
                icon={<UserCheck size={18} />}

                label="Ativos"

                value={active}

                color="
                  border-emerald-500/20
                  bg-emerald-500/10
                  text-emerald-400
                "
              />

              <MetricCard
                icon={<UserX size={18} />}

                label="Inativos"

                value={inactive}

                color="
                  border-red-500/20
                  bg-red-500/10
                  text-red-400
                "
              />
            </div>
          </div>

          {/* ACTIONS */}

          <div
            className="
              flex
              gap-3
            "
          >
            <button
              onClick={fetchBrokers}

              disabled={refreshing}

              className="
                flex
                items-center
                gap-2
                rounded-xl
                border
                border-slate-700
                bg-slate-800
                px-4
                py-2.5
                text-sm
                text-slate-200
                transition
                hover:bg-slate-700
                disabled:opacity-50
              "
            >
              <RefreshCw
                size={17}

                className={refreshing ? 'animate-spin' : ''}
              />
              Atualizar
            </button>

            <button
              className="
                flex
                items-center
                gap-2
                rounded-xl
                bg-blue-600
                px-4
                py-2.5
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-blue-500
              "
            >
              <Plus size={17} />
              Novo Corretor
            </button>
          </div>
        </div>

        {/* SEARCH */}

        <div
          className="
            relative
            mt-5
          "
        >
          <Search
            size={17}

            className="
              absolute
              left-4
              top-1/2
              -translate-y-1/2
              text-slate-500
            "
          />

          <input
            value={search}

            onChange={(e) => setSearch(e.target.value)}

            placeholder="
              Buscar corretor por nome, email, telefone ou CRECI...
            "

            className="
              w-full
              rounded-xl
              border
              border-slate-700
              bg-slate-800
              py-3
              pl-11
              pr-4
              text-sm
              text-white
              outline-none
              placeholder:text-slate-500
              focus:border-blue-500
            "
          />
        </div>
      </div>
      {/* BROKERS GRID */}

      {filteredBrokers.length > 0 ? (
        <div
          className="
              grid
              gap-5
              md:grid-cols-2
              xl:grid-cols-3
            "
        >
          {filteredBrokers.map((broker) => (
            <div
              key={broker._id}

              onClick={() => navigate(`/broker-details/${broker._id}`)}

              className="
      cursor-pointer
      rounded-2xl
      border
      border-slate-800
      bg-slate-900
      p-5
      transition-all
      duration-300
      hover:border-blue-500/40
      hover:shadow-lg
    "
            >
              {/* PROFILE */}

              <div
                className="
                        flex
                        items-center
                        gap-4
                      "
              >
                {broker.avatar ? (
                  <img
                    src={broker.avatar}

                    alt={broker.name}

                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}

                    className="
                              h-16
                              w-16
                              rounded-full
                              border
                              border-blue-500/40
                              object-cover
                            "
                  />
                ) : (
                  <div
                    className="
                              flex
                              h-16
                              w-16
                              items-center
                              justify-center
                              rounded-full
                              bg-gradient-to-br
                              from-blue-600
                              to-indigo-700
                              text-xl
                              font-bold
                              text-white
                            "
                  >
                    {broker.name
                      ?.split(' ')
                      .slice(0, 2)
                      .map((word) => word[0])
                      .join('')
                      .toUpperCase()}
                  </div>
                )}

                <div
                  className="
                          min-w-0
                        "
                >
                  <h2
                    className="
                            truncate
                            text-lg
                            font-semibold
                            text-white
                          "
                  >
                    {broker.name}
                  </h2>

                  <span
                    className={`
                            mt-1
                            inline-flex
                            rounded-full
                            border
                            px-3
                            py-1
                            text-xs

                            ${
                              broker.isActive
                                ? `
                              border-emerald-500/20
                              bg-emerald-500/10
                              text-emerald-400
                              `
                                : `
                              border-red-500/20
                              bg-red-500/10
                              text-red-400
                              `
                            }
                          `}
                  >
                    {broker.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>

              {/* DETAILS */}

              <div
                className="
                        mt-5
                        space-y-3
                      "
              >
                <InfoRow
                  icon={<Mail size={15} />}

                  value={broker.email || 'Sem email'}
                />

                <InfoRow
                  icon={<Phone size={15} />}

                  value={broker.phone || 'Sem telefone'}
                />

                <InfoRow
                  icon={<Award size={15} />}

                  value={
                    broker.creci
                      ? `CRECI ${broker.creci}`
                      : 'CRECI não informado'
                  }
                />
              </div>

              {/* EXTRA INFO */}

              {broker.company && (
                <div
                  className="
                            mt-4
                            rounded-xl
                            border
                            border-slate-800
                            bg-slate-950
                            px-3
                            py-2
                            text-xs
                            text-slate-400
                          "
                >
                  {broker.company}
                </div>
              )}

              {/* ACTIONS */}

              <div
                className="
                        mt-5
                        flex
                        justify-between
                        border-t
                        border-slate-800
                        pt-4
                      "
              >
                <button
                  onClick={() =>
                    toast.info('Editar corretor em desenvolvimento')
                  }

                  className="
                          flex
                          items-center
                          gap-2
                          text-sm
                          text-blue-400
                          transition
                          hover:text-blue-300
                        "
                >
                  <Edit size={15} />
                  Editar
                </button>

                <button
                  onClick={() => handleDelete(broker._id)}

                  className="
                          flex
                          items-center
                          gap-2
                          text-sm
                          text-red-400
                          transition
                          hover:text-red-300
                        "
                >
                  <Trash2 size={15} />
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="
              flex
              min-h-[250px]
              flex-col
              items-center
              justify-center
              rounded-2xl
              border
              border-dashed
              border-slate-700
              bg-slate-900
            "
        >
          <Users
            size={42}

            className="
                mb-3
                text-slate-600
              "
          />

          <h3
            className="
                text-lg
                font-semibold
                text-white
              "
          >
            Nenhum corretor encontrado
          </h3>

          <p
            className="
                mt-2
                text-sm
                text-slate-400
              "
          >
            Tente alterar sua busca.
          </p>
        </div>
      )}
    </div>
  );
}

/*
=====================================
METRIC CARD
=====================================
*/

const MetricCard = ({ icon, label, value, color }) => {
  return (
    <div
      className={`
        flex
        items-center
        gap-3
        rounded-xl
        border
        px-4
        py-3
        ${color}
      `}
    >
      <div>{icon}</div>

      <div>
        <p
          className="
            text-xs
            text-slate-400
          "
        >
          {label}
        </p>

        <strong
          className="
            text-lg
            text-white
          "
        >
          {value}
        </strong>
      </div>
    </div>
  );
};

/*
=====================================
INFO ROW
=====================================
*/

const InfoRow = ({ icon, value }) => {
  return (
    <div
      className="
        flex
        items-center
        gap-3
        text-sm
        text-slate-400
      "
    >
      <span
        className="
          text-slate-500
        "
      >
        {icon}
      </span>

      <span className="truncate">{value}</span>
    </div>
  );
};

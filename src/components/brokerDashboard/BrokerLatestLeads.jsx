import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  User,
  Phone,
  Building2,
  CalendarDays,
  Flame,
  ArrowRight,
  Users,
  MapPin,
  DollarSign,
} from 'lucide-react';

import api from '../../service/api';

export default function BrokerLatestLeads({ brokerId }) {
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!brokerId) return;

    fetchLeads();
  }, [brokerId]);

  async function fetchLeads() {
    try {
      const { data } = await api.get(`/api/users/brokers/${brokerId}/leads`);

      console.log('Broker Leads:', data);

      setLeads(data.data || []);
    } catch (error) {
      console.error('Erro ao buscar leads:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div
        className="
        w-full
        rounded-2xl
        border
        border-slate-800
        bg-slate-900
        p-8
        "
      >
        <p
          className="
          text-sm
          text-slate-400
          "
        >
          Carregando leads...
        </p>
      </div>
    );
  }

  return (
    <div
      className="
w-full
rounded-2xl
border
border-slate-800
bg-slate-900
p-8
"
    >
      {/* HEADER */}

      <div
        className="
mb-8
flex
items-center
justify-between
"
      >
        <div
          className="
flex
items-center
gap-4
"
        >
          <div
            className="
rounded-xl
bg-blue-500/10
p-3
text-blue-400
"
          >
            <Users size={22} />
          </div>

          <div>
            <h3
              className="
text-xl
font-semibold
text-white
"
            >
              Últimos Leads
            </h3>

            <p
              className="
text-sm
text-slate-400
"
            >
              Leads recentes do corretor
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/leads-list')}

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
          Ver todos
          <ArrowRight size={15} />
        </button>
      </div>

      {leads.length === 0 ? (
        <div
          className="
flex
min-h-[220px]
flex-col
items-center
justify-center
rounded-xl
border
border-dashed
border-slate-700
"
        >
          <Users
            size={40}

            className="
mb-3
text-slate-600
"
          />

          <p
            className="
text-sm
text-slate-400
"
          >
            Nenhum lead encontrado
          </p>
        </div>
      ) : (
        <div
          className="
grid
grid-cols-1
gap-6
xl:grid-cols-2
2xl:grid-cols-3
"
        >
          {leads.map((lead, index) => (
            <div
              key={lead._id}

              className="
group
min-h-[330px]
rounded-xl
border
border-slate-800
bg-slate-950
p-6
transition
hover:border-blue-500/40
hover:bg-slate-900
hover:shadow-xl
"
            >
              {/* CLIENTE */}

              <div
                className="
flex
items-center
justify-between
gap-4
"
              >
                <div
                  className="
flex
min-w-0
items-center
gap-3
"
                >
                  <div
                    className="
flex
h-12
w-12
items-center
justify-center
rounded-full
bg-blue-500/10
text-blue-400
"
                  >
                    <User size={20} />
                  </div>

                  <div
                    className="
min-w-0
"
                  >
                    <h4
                      className="
truncate
font-semibold
text-white
"
                    >
                      {lead.name}
                    </h4>

                    <p
                      className="
truncate
text-xs
text-slate-500
"
                    >
                      {lead.email}
                    </p>
                  </div>
                </div>

                <div
                  className="
flex
items-center
gap-2
"
                >
                  {index === 0 && (
                    <span
                      className="
rounded-full
border
border-emerald-500/20
bg-emerald-500/10
px-2
py-1
text-xs
text-emerald-400
"
                    >
                      Novo
                    </span>
                  )}

                  <PriorityBadge priority={lead.priority} />
                </div>
              </div>

              {/* DADOS */}

              <div
                className="
mt-6
space-y-4
"
              >
                <InfoRow
                  icon={<Phone size={15} />}

                  value={lead.phone || 'Sem telefone'}
                />

                <PropertyInfo property={lead.property} />

                <InfoRow
                  icon={<CalendarDays size={15} />}

                  value={new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                />
              </div>

              {/* STATUS */}

              <div
                className="
mt-6
flex
items-center
justify-between
"
              >
                <span
                  className="
rounded-full
border
border-blue-500/20
bg-blue-500/10
px-3
py-1
text-xs
text-blue-300
"
                >
                  {lead.stage}
                </span>

                <button
                  onClick={() => navigate(`/lead-detail/${lead._id}`)}

                  className="
flex
items-center
gap-2
rounded-lg
bg-blue-500/10
px-4
py-2
text-sm
text-blue-400
transition
hover:bg-blue-500/20
hover:text-blue-300
"
                >
                  Detalhes
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, value }) {
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

      <span
        className="
truncate
"
      >
        {value}
      </span>
    </div>
  );
}

function PropertyInfo({ property }) {
  if (!property) {
    return (
      <InfoRow
        icon={<Building2 size={15} />}

        value="Sem imóvel vinculado"
      />
    );
  }

  return (
    <div
      className="
rounded-xl
border
border-slate-800
bg-slate-900
p-4
"
    >
      <div
        className="
flex
items-center
gap-2
text-xs
text-blue-400
"
      >
        <Building2 size={15} />
        Imóvel interessado
      </div>

      <h5
        className="
mt-2
truncate
font-semibold
text-white
"
      >
        {property.title}
      </h5>

      {property.address && (
        <div
          className="
mt-2
flex
items-center
gap-2
text-xs
text-slate-400
"
        >
          <MapPin size={13} />

          {property.address}
        </div>
      )}

      {property.price && (
        <div
          className="
mt-2
flex
items-center
gap-2
text-sm
text-emerald-400
"
        >
          <DollarSign size={14} />

          {Number(property.price).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
        </div>
      )}
    </div>
  );
}

function PriorityBadge({ priority }) {
  const config = {
    high: {
      label: 'Alta',
      style: 'bg-red-500/10 text-red-400 border-red-500/20',
    },

    medium: {
      label: 'Média',
      style: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    },

    low: {
      label: 'Baixa',
      style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    },
  };

  const item = config[priority] || config.medium;

  return (
    <span
      className={`
flex
items-center
gap-1
rounded-full
border
px-3
py-1
text-xs
${item.style}
`}
    >
      <Flame size={12} />

      {item.label}
    </span>
  );
}

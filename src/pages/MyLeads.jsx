import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Users,
  UserCheck,
  Clock,
  Phone,
  Mail,
  Eye,
  TrendingUp,
  MapPin,
  Star,
} from 'lucide-react';

import { toast } from 'react-toastify';

import { getLeads, updateLead } from '../service/leadApi';

export default function MyLeads() {
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);

  const [loading, setLoading] = useState(true);

  const [updatingLeadId, setUpdatingLeadId] = useState(null);

  /*
  ======================================
  CARREGAR LEADS
  ======================================
  */

  const loadLeads = async () => {
    try {
      setLoading(true);

      const data = await getLeads();

      setLeads(data || []);
    } catch (error) {
      console.error('Erro ao carregar leads:', error);

      toast.error('Erro ao carregar leads');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  /*
  ======================================
  ATUALIZAR STATUS
  ======================================
  */

  const handleChangeStatus = async (leadId, status) => {
    try {
      setUpdatingLeadId(leadId);

      const updated = await updateLead(leadId, {
        status,
      });

      setLeads((prev) =>
        prev.map((lead) =>
          lead._id === leadId
            ? {
                ...lead,
                status: updated.status,
              }
            : lead,
        ),
      );

      toast.success('Status atualizado');
    } catch (error) {
      console.error(error);

      toast.error('Erro ao atualizar status');
    } finally {
      setUpdatingLeadId(null);
    }
  };

  /*
  ======================================
  LOADING
  ======================================
  */

  if (loading) {
    return (
      <div
        className="
          min-h-screen
          bg-slate-950
          flex
          items-center
          justify-center
          text-slate-400
        "
      >
        Carregando leads...
      </div>
    );
  }

  /*
  ======================================
  MÉTRICAS
  ======================================
  */

  const total = leads.length;

  const converted = leads.filter((lead) => lead.status === 'convertido').length;

  const pending = leads.filter((lead) => lead.status === 'novo').length;

  const negotiation = leads.filter(
    (lead) => lead.stage === 'negociacao',
  ).length;

  return (
    <div
      className="
        min-h-screen
        bg-slate-950
        text-white
        p-4
        sm:p-6
        lg:p-8
        space-y-8
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
        "
      >
        <div>
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                w-12
                h-12
                rounded-xl
                bg-blue-500/10
                flex
                items-center
                justify-center
              "
            >
              <Users
                size={26}
                className="
                  text-blue-400
                "
              />
            </div>

            <div>
              <h1
                className="
                  text-3xl
                  font-bold
                "
              >
                Meus Leads
              </h1>

              <p
                className="
                  text-slate-400
                  text-sm
                "
              >
                Gerencie seus clientes e oportunidades.
              </p>
            </div>
          </div>
        </div>

        <div
          className="
            flex
            items-center
            gap-2
            bg-slate-900
            border
            border-slate-800
            rounded-xl
            px-5
            py-3
          "
        >
          <TrendingUp
            size={20}
            className="
              text-green-400
            "
          />

          <span
            className="
              text-slate-300
            "
          >
            {total} leads ativos
          </span>
        </div>
      </div>
      {/* STATS */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-4
          gap-5
        "
      >
        <StatCard title="Total Leads" value={total} icon={<Users />} />

        <StatCard title="Convertidos" value={converted} icon={<UserCheck />} />

        <StatCard title="Novos" value={pending} icon={<Clock />} />

        <StatCard
          title="Negociação"
          value={negotiation}
          icon={<TrendingUp />}
        />
      </div>

      {/* LISTAGEM */}

      {!leads.length ? (
        <div
          className="
            bg-slate-900
            border
            border-slate-800
            rounded-2xl
            p-10
            text-center
            text-slate-400
          "
        >
          <Users
            size={40}
            className="
              mx-auto
              mb-4
              text-slate-600
            "
          />
          Nenhum lead atribuído.
        </div>
      ) : (
        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-3
            gap-6
          "
        >
          {leads.map((lead) => (
            <div
              key={lead._id}

              className="
                group
                bg-slate-900
                border
                border-slate-800
                rounded-2xl
                p-6
                hover:border-blue-500/50
                hover:shadow-xl
                hover:shadow-blue-500/5
                transition-all
                duration-300
              "
            >
              {/* HEADER CARD */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  {lead.avatar ? (
                    <img
                      src={lead.avatar}

                      alt={lead.name}

                      className="
                        w-12
                        h-12
                        rounded-full
                        object-cover
                        border
                        border-slate-700
                      "
                    />
                  ) : (
                    <div
                      className="
                        w-12
                        h-12
                        rounded-full
                        bg-blue-500/20
                        flex
                        items-center
                        justify-center
                        text-blue-400
                        font-bold
                        text-lg
                      "
                    >
                      {lead.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}

                  <div>
                    <h2
                      className="
                        font-bold
                        text-lg
                        text-white
                      "
                    >
                      {lead.name}
                    </h2>

                    <div
                      className="
                        flex
                        items-center
                        gap-1
                        text-xs
                        text-slate-500
                      "
                    >
                      <MapPin size={13} />

                      {lead.region || '-'}
                    </div>
                  </div>
                </div>

                <Star
                  size={18}
                  className="
                    text-yellow-400
                  "
                />
              </div>

              {/* CONTATO */}

              <div
                className="
                  mt-5
                  space-y-2
                  text-sm
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-slate-300
                  "
                >
                  <Mail
                    size={15}
                    className="
                      text-blue-400
                    "
                  />

                  {lead.email || '-'}
                </div>

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-slate-300
                  "
                >
                  <Phone
                    size={15}
                    className="
                      text-green-400
                    "
                  />

                  {lead.phone || '-'}
                </div>
              </div>

              {/* BADGES */}

              <div
                className="
                  flex
                  flex-wrap
                  gap-2
                  mt-5
                "
              >
                <Badge
                  text={lead.status || 'novo'}

                  type="blue"
                />

                <Badge
                  text={lead.stage || '-'}

                  type="purple"
                />

                <Badge
                  text={lead.priority || 'media'}

                  type="yellow"
                />
              </div>

              {/* ACTIONS */}

              <div
                className="
                  mt-6
                  flex
                  justify-between
                  items-center
                "
              >
                <div
                  className="
                    flex
                    gap-3
                  "
                >
                  {lead.phone && (
                    <a
                      href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}

                      target="_blank"

                      rel="noreferrer"

                      className="
                        w-9
                        h-9
                        rounded-lg
                        bg-green-500/10
                        flex
                        items-center
                        justify-center
                        hover:bg-green-500/20
                        transition
                      "
                    >
                      <Phone
                        size={18}
                        className="
                          text-green-400
                        "
                      />
                    </a>
                  )}

                  {lead.email && (
                    <a
                      href={`mailto:${lead.email}`}

                      className="
                        w-9
                        h-9
                        rounded-lg
                        bg-blue-500/10
                        flex
                        items-center
                        justify-center
                        hover:bg-blue-500/20
                        transition
                      "
                    >
                      <Mail
                        size={18}
                        className="
                          text-blue-400
                        "
                      />
                    </a>
                  )}
                </div>

                <button
                  onClick={() => navigate(`/lead-detail/${lead._id}`)}

                  className="
                    flex
                    items-center
                    gap-2
                    text-sm
                    text-blue-400
                    hover:text-blue-300
                  "
                >
                  Ver detalhes
                  <Eye size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function StatCard({ title, value, icon }) {
  return (
    <div
      className="
        bg-slate-900
        border
        border-slate-800
        rounded-2xl
        p-5
        flex
        items-center
        justify-between
        hover:border-blue-500/40
        transition
      "
    >
      <div>
        <p
          className="
            text-sm
            text-slate-400
          "
        >
          {title}
        </p>

        <h3
          className="
            text-3xl
            font-bold
            mt-2
            text-white
          "
        >
          {value}
        </h3>
      </div>

      <div
        className="
          w-12
          h-12
          rounded-xl
          bg-blue-500/10
          flex
          items-center
          justify-center
          text-blue-400
        "
      >
        {icon}
      </div>
    </div>
  );
}

function Badge({ text, type }) {
  const styles = {
    blue: `
      bg-blue-500/10
      text-blue-400
      border-blue-500/20
      `,

    purple: `
      bg-purple-500/10
      text-purple-400
      border-purple-500/20
      `,

    yellow: `
      bg-yellow-500/10
      text-yellow-400
      border-yellow-500/20
      `,

    green: `
      bg-green-500/10
      text-green-400
      border-green-500/20
      `,

    red: `
      bg-red-500/10
      text-red-400
      border-red-500/20
      `,

    gray: `
      bg-slate-800
      text-slate-300
      border-slate-700
      `,
  };

  return (
    <span
      className={`
        px-3
        py-1
        rounded-full
        text-xs
        font-medium
        border
        ${styles[type] || styles.gray}
      `}
    >
      {text || '-'}
    </span>
  );
}

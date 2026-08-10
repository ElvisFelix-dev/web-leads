import {
  User,
  Phone,
  Mail,
  CalendarDays,
  ArrowRight,
  UserRound,
} from 'lucide-react';

import { format } from 'date-fns';

import { useNavigate } from 'react-router-dom';

export default function LatestLeads({ leads = [] }) {
  const navigate = useNavigate();

  if (!leads.length) {
    return (
      <div
        className="
        bg-slate-900
        border
        border-slate-800
        rounded-2xl
        p-8
        text-center
        text-slate-400
        "
      >
        Nenhum lead recebido recentemente.
      </div>
    );
  }

  return (
    <div
      className="
      bg-slate-900
      border
      border-slate-800
      rounded-2xl
      shadow-xl
      p-6
      "
    >
      {/* HEADER */}

      <div
        className="
        flex
        items-center
        justify-between
        mb-6
        "
      >
        <div>
          <h2
            className="
            text-xl
            font-bold
            text-white
            flex
            items-center
            gap-2
            "
          >
            <User className="text-blue-500" size={22} />
            Últimos Leads
          </h2>

          <p
            className="
            text-sm
            text-slate-400
            mt-1
            "
          >
            Leads recebidos recentemente na plataforma
          </p>
        </div>

        <button
          onClick={() => navigate('/leads-list')}
          className="
          text-sm
          text-blue-400
          hover:text-blue-300
          flex
          items-center
          gap-1
          "
        >
          Ver todos
          <ArrowRight size={16} />
        </button>
      </div>

      {/* LISTA */}

      <div
        className="
        space-y-4
        "
      >
        {leads.map((lead) => (
          <div
            key={lead._id}

            className="
              bg-slate-950
              border
              border-slate-800
              rounded-xl
              p-4
              hover:border-blue-500/50
              transition
              "
          >
            <div
              className="
                flex
                flex-col
                lg:flex-row
                lg:items-center
                justify-between
                gap-4
                "
            >
              {/* LEAD INFO */}

              <div
                className="
                  flex
                  items-center
                  gap-4
                  "
              >
                <div
                  className="
                    w-12
                    h-12
                    rounded-full
                    bg-blue-500/10
                    flex
                    items-center
                    justify-center
                    "
                >
                  <User
                    className="
                      text-blue-400
                      "
                  />
                </div>

                <div>
                  <h3
                    className="
                      text-white
                      font-semibold
                      "
                  >
                    {lead.name}
                  </h3>

                  <div
                    className="
                      flex
                      flex-col
                      text-sm
                      text-slate-400
                      mt-1
                      "
                  >
                    {lead.email && (
                      <span
                        className="
                            flex
                            items-center
                            gap-2
                            "
                      >
                        <Mail size={14} />

                        {lead.email}
                      </span>
                    )}

                    {lead.phone && (
                      <span
                        className="
                            flex
                            items-center
                            gap-2
                            "
                      >
                        <Phone size={14} />

                        {lead.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* STATUS */}

              <div
                className="
                  flex
                  flex-wrap
                  gap-2
                  "
              >
                <Badge text={lead.stage} type="blue" />

                <Badge text={lead.status} type="gray" />

                {lead.source && <Badge text={lead.source} type="green" />}
              </div>

              {/* CORRETOR */}

              <div
                className="
                  flex
                  items-center
                  gap-3
                  "
              >
                {lead.assignedTo ? (
                  <>
                    <img
                      src={lead.assignedTo.avatar || '/avatar-default.png'}

                      alt={lead.assignedTo.name}

                      className="
                          w-9
                          h-9
                          rounded-full
                          object-cover
                          border
                          border-slate-700
                          "
                    />

                    <div>
                      <p
                        className="
                            text-sm
                            text-white
                            "
                      >
                        {lead.assignedTo.name}
                      </p>

                      <p
                        className="
                            text-xs
                            text-slate-500
                            "
                      >
                        {lead.assignedTo.position || 'Corretor'}
                      </p>
                    </div>
                  </>
                ) : (
                  <div
                    className="
                        flex
                        items-center
                        gap-2
                        text-slate-500
                        "
                  >
                    <UserRound size={18} />
                    Sem corretor
                  </div>
                )}
              </div>

              {/* DATA */}

              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-sm
                  text-slate-400
                  "
              >
                <CalendarDays size={16} />

                {format(new Date(lead.createdAt), 'dd/MM/yyyy')}
              </div>
            </div>
          </div>
        ))}
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

    gray: `
    bg-slate-800
    text-slate-300
    border-slate-700
    `,

    green: `
    bg-green-500/10
    text-green-400
    border-green-500/20
    `,
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

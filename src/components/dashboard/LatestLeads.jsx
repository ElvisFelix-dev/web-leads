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
          border border-slate-800
          rounded-2xl
          p-8
          text-center
        "
      >
        <div
          className="
            w-11
            h-11
            mx-auto
            mb-3
            rounded-xl
            bg-slate-800
            border border-slate-700
            flex
            items-center
            justify-center
          "
        >
          <User size={19} className="text-slate-500" />
        </div>

        <p className="text-sm text-slate-400">
          Nenhum lead recebido recentemente.
        </p>
      </div>
    );
  }

  return (
    <div
      className="
        bg-slate-900
        border border-slate-800
        rounded-2xl
        shadow-xl
        overflow-hidden
      "
    >
      {/* HEADER */}

      <div
        className="
          px-5
          py-5
          border-b border-slate-800
          flex
          items-center
          justify-between
          gap-4
        "
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <div
              className="
                w-8
                h-8
                rounded-lg
                bg-blue-500/10
                border border-blue-500/10
                flex
                items-center
                justify-center
                shrink-0
              "
            >
              <User size={16} className="text-blue-400" />
            </div>

            <h2
              className="
                text-lg
                font-bold
                text-white
                truncate
              "
            >
              Últimos Leads
            </h2>
          </div>

          <p
            className="
              text-xs
              text-slate-500
              mt-1
              ml-10
            "
          >
            Leads recebidos recentemente na plataforma
          </p>
        </div>

        <button
          onClick={() => navigate('/leads-list')}
          className="
            shrink-0
            flex
            items-center
            gap-1.5
            px-2.5
            py-2
            rounded-lg
            text-xs
            font-medium
            text-blue-400
            hover:text-blue-300
            hover:bg-blue-500/10
            transition
          "
        >
          <span className="hidden sm:inline">Ver todos</span>

          <ArrowRight size={15} />
        </button>
      </div>

      {/* LISTA */}

      <div className="p-4 space-y-3">
        {leads.map((lead) => (
          <LeadCard key={lead._id} lead={lead} />
        ))}
      </div>
    </div>
  );
}

/* =====================================================
   LEAD CARD
===================================================== */

function LeadCard({ lead }) {
  return (
    <div
      className="
        group
        w-full
        bg-slate-950
        border border-slate-800
        rounded-xl
        p-4
        overflow-hidden
        transition-all
        duration-200
        hover:border-slate-700
        hover:bg-slate-950/80
      "
    >
      {/* =================================================
          TOPO
      ================================================= */}

      <div
        className="
          flex
          items-start
          justify-between
          gap-3
          min-w-0
        "
      >
        {/* LEAD */}

        <div
          className="
            flex
            items-center
            gap-3
            min-w-0
            flex-1
          "
        >
          {/* AVATAR */}

          <div
            className="
              w-10
              h-10
              rounded-xl
              bg-blue-500/10
              border border-blue-500/15
              flex
              items-center
              justify-center
              shrink-0
            "
          >
            <User size={17} className="text-blue-400" />
          </div>

          {/* DADOS */}

          <div className="min-w-0 flex-1">
            <h3
              className="
                text-sm
                font-semibold
                text-white
                truncate
              "
              title={lead.name}
            >
              {lead.name || 'Lead sem nome'}
            </h3>

            <div
              className="
                flex
                flex-col
                gap-0.5
                mt-1
                min-w-0
              "
            >
              {lead.email && (
                <div
                  className="
                    flex
                    items-center
                    gap-1.5
                    min-w-0
                    text-[11px]
                    text-slate-500
                  "
                >
                  <Mail size={12} className="shrink-0" />

                  <span className="truncate" title={lead.email}>
                    {lead.email}
                  </span>
                </div>
              )}

              {lead.phone && (
                <div
                  className="
                    flex
                    items-center
                    gap-1.5
                    text-[11px]
                    text-slate-500
                  "
                >
                  <Phone size={12} className="shrink-0" />

                  <span>{lead.phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DATA */}

        <div
          className="
            flex
            items-center
            gap-1.5
            text-[11px]
            text-slate-600
            shrink-0
            pt-0.5
          "
        >
          <CalendarDays size={13} />

          <span className="hidden sm:inline">
            {format(new Date(lead.createdAt), 'dd/MM/yyyy')}
          </span>
        </div>
      </div>

      {/* =================================================
          DIVISOR
      ================================================= */}

      <div className="h-px bg-slate-800/70 my-3" />

      {/* =================================================
          RODAPÉ
      ================================================= */}

      <div
        className="
          flex
          flex-col
          sm:flex-row
          sm:items-center
          sm:justify-between
          gap-3
          min-w-0
        "
      >
        {/* STATUS */}

        <div
          className="
            flex
            flex-wrap
            items-center
            gap-1.5
            min-w-0
          "
        >
          {lead.stage && <Badge text={lead.stage} type="blue" />}

          {lead.status && <Badge text={lead.status} type="gray" />}

          {lead.source && <Badge text={lead.source} type="green" />}
        </div>

        {/* CORRETOR */}

        <div
          className="
            flex
            items-center
            gap-2
            min-w-0
            max-w-full
          "
        >
          {lead.assignedTo ? (
            <>
              <img
                src={lead.assignedTo.avatar || '/avatar-default.png'}
                alt={lead.assignedTo.name || 'Corretor'}
                className="
                  w-7
                  h-7
                  rounded-full
                  object-cover
                  border border-slate-700
                  shrink-0
                "
              />

              <div className="min-w-0">
                <p
                  className="
                    text-[11px]
                    font-medium
                    text-slate-300
                    truncate
                  "
                  title={lead.assignedTo.name}
                >
                  {lead.assignedTo.name}
                </p>

                <p
                  className="
                    text-[10px]
                    text-slate-600
                    truncate
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
                gap-1.5
                text-[11px]
                text-slate-600
              "
            >
              <div
                className="
                  w-7
                  h-7
                  rounded-full
                  bg-slate-800
                  flex
                  items-center
                  justify-center
                "
              >
                <UserRound size={13} />
              </div>

              <span>Sem corretor</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   BADGE
===================================================== */

function Badge({ text, type }) {
  const styles = {
    blue: `
      bg-blue-500/10
      text-blue-400
      border-blue-500/20
    `,

    gray: `
      bg-slate-800/80
      text-slate-300
      border-slate-700
    `,

    green: `
      bg-emerald-500/10
      text-emerald-400
      border-emerald-500/20
    `,
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        max-w-[150px]
        px-2.5
        py-1
        rounded-md
        border
        text-[10px]
        font-medium
        whitespace-nowrap
        overflow-hidden
        text-ellipsis
        ${styles[type] || styles.gray}
      `}
      title={text || '-'}
    >
      {text || '-'}
    </span>
  );
}

import {
  Phone,
  MessageCircle,
  MapPin,
  Home,
  CalendarDays,
  Flame,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const BrokerLeadCard = ({ lead }) => {
  const navigate = useNavigate();

  const priorityConfig = {
    high: {
      label: 'Alta',
      className: 'text-red-400 bg-red-500/10 border-red-500/20',
    },

    medium: {
      label: 'Média',
      className: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    },

    low: {
      label: 'Baixa',
      className: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
    },
  };

  const priority = priorityConfig[lead.priority] || priorityConfig.medium;

  const initials = lead.name
    ?.split(' ')
    .map((name) => name[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const whatsappLink =
    lead.whatsappLink ||
    (lead.phone ? `https://wa.me/${lead.phone.replace(/\D/g, '')}` : null);

  const handleOpenLead = () => {
    navigate(`/lead-detail/${lead._id}`);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleOpenLead}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleOpenLead();
        }
      }}
      className="
        group
        cursor-pointer
        rounded-xl
        border
        border-slate-700
        bg-slate-800
        p-4
        transition-all
        duration-200
        hover:-translate-y-1
        hover:border-blue-500
        hover:bg-slate-800/90
        hover:shadow-xl
        hover:shadow-blue-500/10
      "
    >
      {/* TOP */}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-blue-600/20
              text-sm
              font-semibold
              text-blue-400
            "
          >
            {initials || '?'}
          </div>

          <div>
            <h4
              className="
                max-w-[170px]
                truncate
                font-semibold
                text-white
                transition-colors
                group-hover:text-blue-400
              "
            >
              {lead.name}
            </h4>

            <p className="text-xs text-slate-400">
              {lead.phone || 'Sem telefone'}
            </p>
          </div>
        </div>

        <span
          className={`
            flex
            items-center
            gap-1
            rounded-full
            border
            px-2
            py-1
            text-xs
            ${priority.className}
          `}
        >
          {lead.priority === 'high' && <Flame size={12} />}

          {priority.label}
        </span>
      </div>

      {/* PROPERTY */}

      {lead.property && (
        <div
          className="
            mt-4
            rounded-lg
            bg-slate-900
            p-3
            transition-colors
            group-hover:bg-slate-700
          "
        >
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Home size={15} className="text-blue-400" />

            <span className="truncate">{lead.property.name || 'Imóvel'}</span>
          </div>
        </div>
      )}

      {/* INFO */}

      <div className="mt-4 space-y-2 text-xs text-slate-400">
        {lead.region && (
          <div className="flex items-center gap-2">
            <MapPin size={14} />

            {lead.region}
          </div>
        )}

        <div className="flex items-center gap-2">
          <CalendarDays size={14} />

          {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
        </div>
      </div>

      {/* ACTIONS */}

      <div className="mt-4 flex gap-2 border-t border-slate-700 pt-3">
        {lead.phone && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="
              flex
              flex-1
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-green-600/20
              py-2
              text-xs
              text-green-400
              transition
              hover:bg-green-600/30
            "
          >
            <MessageCircle size={15} />
            WhatsApp
          </a>
        )}

        {lead.phone && (
          <a
            href={`tel:${lead.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="
              flex
              items-center
              justify-center
              rounded-lg
              bg-slate-700
              px-3
              text-slate-300
              transition
              hover:bg-slate-600
            "
          >
            <Phone size={15} />
          </a>
        )}
      </div>
    </div>
  );
};

export default BrokerLeadCard;

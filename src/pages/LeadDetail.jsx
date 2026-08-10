import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  ArrowLeft,
  Edit,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
} from 'lucide-react';

import api from '../service/api';

import LeadHistory from '../components/lead/LeadHistory';

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadLead() {
      try {
        setLoading(true);

        const { data } = await api.get(`/api/leads/${id}`);

        setLead(data);
      } catch (error) {
        console.error('Erro ao carregar lead:', error);

        setError('Não foi possível carregar o lead.');
      } finally {
        setLoading(false);
      }
    }

    loadLead();
  }, [id]);

  const formatDate = (date) => {
    if (!date) return '-';

    return new Date(date).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div
        className="
        min-h-[400px]
        flex
        items-center
        justify-center
        text-slate-400
      "
      >
        Carregando informações do lead...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="
        p-6
        text-red-400
      "
      >
        {error}
      </div>
    );
  }

  if (!lead) return null;

  return (
    <div
      className="
      min-h-screen
      bg-slate-950
      p-6
      space-y-6
    "
    >
      {/* HEADER */}

      <div
        className="
        flex
        items-center
        justify-between
      "
      >
        <button
          onClick={() => navigate(-1)}

          className="
            flex
            items-center
            gap-2
            text-slate-400
            hover:text-white
            transition
          "
        >
          <ArrowLeft size={18} />
          Voltar
        </button>

        <button
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
          <Edit size={18} />
          Editar
        </button>
      </div>

      {/* HEADER LEAD */}

      <div
        className="
        bg-slate-900
        border
        border-slate-800
        rounded-xl
        shadow-lg
        p-6
      "
      >
        <h1
          className="
          text-2xl
          font-bold
          text-white
        "
        >
          {lead.name}
        </h1>

        <div
          className="
          flex
          flex-wrap
          gap-3
          mt-4
        "
        >
          <Badge text={lead.stage} type="blue" />

          <Badge text={lead.priority} type="yellow" />

          <Badge text={lead.status} type="gray" />
        </div>
      </div>

      {/* INFORMAÇÕES */}

      <Card title="Informações do Lead">
        <div
          className="
          grid
          md:grid-cols-2
          gap-6
        "
        >
          <Info icon={<User size={18} />} label="Nome" value={lead.name} />

          <Info icon={<Mail size={18} />} label="Email" value={lead.email} />

          <Info
            icon={<Phone size={18} />}
            label="Telefone"
            value={lead.phone}
          />

          <Info
            icon={<MapPin size={18} />}
            label="Região"
            value={lead.region}
          />

          <Info
            icon={<Building2 size={18} />}
            label="Origem"
            value={lead.source}
          />

          <Info
            icon={<Calendar size={18} />}
            label="Criado em"
            value={formatDate(lead.createdAt)}
          />
        </div>
      </Card>

      {/* OBSERVAÇÕES */}

      <Card title="Observações">
        <p
          className="
          text-slate-400
          whitespace-pre-line
        "
        >
          {lead.notes || 'Nenhuma observação cadastrada.'}
        </p>
      </Card>

      {/* USUÁRIOS */}

      <div
        className="
        grid
        md:grid-cols-2
        gap-6
      "
      >
        <UserCard
          title="Criado por"

          user={lead.createdBy}
        />

        <UserCard
          title="Responsável"

          user={lead.assignedTo}
        />
      </div>

      {/* DATAS */}

      <Card title="Datas importantes">
        <div
          className="
          grid
          md:grid-cols-3
          gap-6
        "
        >
          <Info
            label="Último contato"

            value={formatDate(lead.lastContactAt)}
          />

          <Info
            label="Visita"

            value={formatDate(lead.visitDate)}
          />

          <Info
            label="Proposta"

            value={formatDate(lead.proposalDate)}
          />
        </div>
      </Card>

      {/* HISTÓRICO */}

      <LeadHistory lead={lead} />
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div
      className="
      bg-slate-900
      border
      border-slate-800
      rounded-xl
      shadow-lg
      p-6
    "
    >
      <h2
        className="
        text-lg
        font-semibold
        text-white
        mb-5
      "
      >
        {title}
      </h2>

      {children}
    </div>
  );
}

function Info({ icon, label, value }) {
  return (
    <div
      className="
      flex
      gap-3
      items-start
    "
    >
      {icon && (
        <div
          className="
            text-blue-400
            mt-1
          "
        >
          {icon}
        </div>
      )}

      <div>
        <p
          className="
          text-xs
          text-slate-500
        "
        >
          {label}
        </p>

        <p
          className="
          text-slate-200
          font-medium
        "
        >
          {value || '-'}
        </p>
      </div>
    </div>
  );
}

function UserCard({ title, user }) {
  return (
    <Card title={title}>
      {user ? (
        <div
          className="
            flex
            items-center
            gap-4
          "
        >
          <img
            src={user.avatar}

            alt={user.name}

            className="
                w-12
                h-12
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
              {user.name}
            </p>

            <p
              className="
                text-sm
                text-slate-400
              "
            >
              {user.email}
            </p>
          </div>
        </div>
      ) : (
        <p
          className="
            text-slate-500
          "
        >
          Não atribuído
        </p>
      )}
    </Card>
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
      text-sm
      border
      ${styles[type]}
    `}
    >
      {text}
    </span>
  );
}

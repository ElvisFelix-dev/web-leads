import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import {
  ArrowLeft,
  Mail,
  Phone,
  Award,
  Target,
  Users,
  CalendarCheck,
  Handshake,
  DollarSign,
  TrendingUp,
  Instagram,
  Linkedin,
  MapPin,
} from 'lucide-react';

import { toast } from 'react-toastify';

import BrokerPerformanceChart from '../components/brokerDashboard/BrokerPerformanceChart';
import BrokerLatestLeads from '../components/brokerDashboard/BrokerLatestLeads';

import api from '../service/api';

export default function BrokerDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const [broker, setBroker] = useState(null);

  const [loading, setLoading] = useState(true);

  /*
  =====================================
  BUSCAR CORRETOR
  =====================================
  */

  useEffect(() => {
    fetchBroker();
  }, [id]);

  const fetchBroker = async () => {
    try {
      const { data } = await api.get(`/api/users/brokers/${id}`);

      console.log('Broker Details:', data);

      setBroker(data.data);
    } catch (error) {
      console.error(error);

      toast.error('Erro ao carregar corretor');
    } finally {
      setLoading(false);
    }
  };

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
          h-12
          w-12
          animate-spin
          rounded-full
          border-4
          border-blue-500
          border-t-transparent
          "
        />
      </div>
    );
  }

  if (!broker) {
    return (
      <div
        className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-slate-950
        text-white
        "
      >
        Corretor não encontrado
      </div>
    );
  }

  const profile = broker.profile || {};

  return (
    <div
      className="
      min-h-screen
      bg-slate-950
      p-6
      text-white
      "
    >
      <button
        onClick={() => navigate(-1)}

        className="
        mb-6
        flex
        items-center
        gap-2
        text-sm
        text-slate-400
        hover:text-white
        "
      >
        <ArrowLeft size={18} />
        Voltar
      </button>

      {/* HEADER */}

      <div
        className="
        overflow-hidden
        rounded-3xl
        border
        border-slate-800
        bg-slate-900
        "
      >
        <div
          className="
          h-48
          bg-cover
          bg-center
          "
          style={{
            backgroundImage: `url(${profile.coverImage || ''})`,
          }}
        >
          {!profile.coverImage && (
            <div
              className="
              h-full
              bg-gradient-to-r
              from-blue-700
              via-indigo-700
              to-purple-700
              "
            />
          )}
        </div>

        <div
          className="
          px-6
          pb-6
          "
        >
          <div
            className="
            -mt-16
            flex
            flex-col
            gap-5
            md:flex-row
            md:items-end
            "
          >
            <img
              src={profile.avatar || '/avatar.png'}

              alt={profile.name}

              className="
              h-32
              w-32
              rounded-full
              border-4
              border-slate-900
              object-cover
              "
            />

            <div
              className="
              flex-1
              "
            >
              <h1
                className="
                text-3xl
                font-bold
                "
              >
                {profile.name}
              </h1>

              <p
                className="
                text-slate-400
                "
              >
                {profile.position}
              </p>

              <div
                className="
                mt-3
                flex
                flex-wrap
                gap-3
                "
              >
                <Status online={broker.availability === 'Disponível'} />

                <Badge>CRECI {profile.creci || '---'}</Badge>

                <Badge>{profile.company || 'Sem empresa'}</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MÉTRICAS */}

      <div
        className="
        mt-6
        grid
        gap-5
        md:grid-cols-2
        xl:grid-cols-4
        "
      >
        <Metric
          icon={<Users />}
          title="Leads"
          value={broker.stats?.leads || 0}
        />

        <Metric
          icon={<CalendarCheck />}
          title="Visitas"
          value={broker.stats?.visits || 0}
        />

        <Metric
          icon={<Handshake />}
          title="Negócios"
          value={broker.stats?.deals || 0}
        />

        <Metric
          icon={<DollarSign />}
          title="Receita"
          value={formatMoney(broker.stats?.revenue)}
        />
      </div>

      {/* PERFORMANCE CHART */}

      <div className="mt-6">
        <BrokerPerformanceChart brokerId={broker.profile?.id || broker._id} />
      </div>

      {/* ÚLTIMOS LEADS */}
      <div
        className="
        mt-6
        grid
        w-full
        gap-6
        "
      >
        <BrokerLatestLeads brokerId={broker.profile?.id || broker._id} />
      </div>

      {/* INFORMAÇÕES */}

      <div
        className="
        mt-6
        grid
        gap-6
        xl:grid-cols-3
        "
      >
        <Section title="Contato">
          <Info icon={<Mail />} value={profile.email} />

          <Info icon={<Phone />} value={profile.phone} />

          <Info
            icon={<MapPin />}
            value={profile.regions?.join(', ') || 'Sem regiões cadastradas'}
          />
        </Section>

        <Section title="Performance">
          <Info
            icon={<TrendingUp />}
            value={`${broker.stats?.conversionRate || 0}% conversão`}
          />

          <Info
            icon={<Target />}
            value={`Meta mensal: ${broker.settings?.monthlyGoal || 0}`}
          />

          <Info
            icon={<Award />}
            value={`Nível ${broker.performance?.level || 1}`}
          />
        </Section>

        <Section title="Redes Sociais">
          <Info
            icon={<Instagram />}
            value={broker.socials?.instagram || 'Não informado'}
          />

          <Info
            icon={<Linkedin />}
            value={broker.socials?.linkedin || 'Não informado'}
          />
        </Section>
      </div>
    </div>
  );
}

function formatMoney(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

function Metric({ icon, title, value }) {
  return (
    <div
      className="
rounded-2xl
border
border-slate-800
bg-slate-900
p-5
"
    >
      <div
        className="
flex
items-center
gap-3
text-blue-400
"
      >
        {icon}

        <span>{title}</span>
      </div>

      <strong
        className="
mt-3
block
text-3xl
"
      >
        {value}
      </strong>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div
      className="
rounded-2xl
border
border-slate-800
bg-slate-900
p-5
"
    >
      <h3
        className="
mb-5
text-lg
font-semibold
"
      >
        {title}
      </h3>

      <div
        className="
space-y-4
"
      >
        {children}
      </div>
    </div>
  );
}

function Info({ icon, value }) {
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
text-blue-400
"
      >
        {icon}
      </span>

      <span>{value || '-'}</span>
    </div>
  );
}

function Badge({ children }) {
  return (
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
      {children}
    </span>
  );
}

function Status({ online }) {
  return (
    <span
      className={`
rounded-full
px-3
py-1
text-xs

${online ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}

`}
    >
      {online ? 'Disponível' : 'Indisponível'}
    </span>
  );
}

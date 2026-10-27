import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  Award,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Globe,
  Instagram,
  Linkedin,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  User,
  UserRound,
  Users,
  X,
  Youtube,
} from 'lucide-react';
import { toast } from 'react-toastify';

import { UserContext } from '../context/UserContext';
import api from '../service/api';

/*
|--------------------------------------------------------------------------
| CONSTANTES
|--------------------------------------------------------------------------
*/

const SPECIALTIES = [
  'Apartamento',
  'Casa',
  'Cobertura',
  'Alto Padrão',
  'Lançamentos',
  'Comercial',
  'Locação',
  'Terrenos',
  'Investimentos',
];

const AVAILABILITY_OPTIONS = [
  'Disponível',
  'Em visita',
  'Em reunião',
  'Offline',
];

const LANGUAGE_LEVELS = ['Básico', 'Intermediário', 'Avançado', 'Fluente'];

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Segunda' },
  { value: 'tuesday', label: 'Terça' },
  { value: 'wednesday', label: 'Quarta' },
  { value: 'thursday', label: 'Quinta' },
  { value: 'friday', label: 'Sexta' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' },
];

const LEAD_TYPES = [
  { value: 'venda', label: 'Venda' },
  { value: 'aluguel', label: 'Aluguel' },
  { value: 'ambos', label: 'Venda + Aluguel' },
];

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const emptyForm = {
  name: '',
  email: '',
  phone: '',

  avatar: '',
  coverImage: '',
  bio: '',
  website: '',

  position: 'Corretor de Imóveis',
  company: '',
  creci: '',
  creciActive: false,
  experienceYears: 0,
  signature: '',

  specialties: [],
  regions: [],
  highlights: [],

  availability: 'Disponível',
  workingHours: {
    start: '09:00',
    end: '18:00',
  },

  address: {
    street: '',
    number: '',
    district: '',
    city: '',
    state: '',
    zipCode: '',
  },

  socials: {
    instagram: '',
    facebook: '',
    linkedin: '',
    youtube: '',
    tiktok: '',
    whatsapp: '',
  },

  settings: {
    monthlyGoal: 10,
    commissionPercentage: 3,
    themeColor: '#2563EB',
    notifications: true,
    language: 'pt-BR',
    showcaseEnabled: true,
  },

  commissionPercentage: 3,
  capturerCommissionPercentage: 1,

  isActive: true,
  isOnline: false,

  role: 'broker',

  brokerSettings: {
    specializedRegions: [],
    specializedTypes: [],
    isActive: true,
    maxActiveLeads: 50,
    priority: 0,
    availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    workHours: {
      start: '09:00',
      end: '18:00',
    },
    acceptedLeadTypes: ['venda', 'aluguel'],
    minPropertyValue: 0,
    maxPropertyValue: '',
  },

  newPassword: '',
  confirmPassword: '',
};

/*
|--------------------------------------------------------------------------
| COMPONENTES AUXILIARES
|--------------------------------------------------------------------------
*/

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
  className = '',
}) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-black/10 ${className}`}
    >
      <div className="border-b border-slate-800 px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <Icon size={18} />
          </div>

          <div>
            <h2 className="font-semibold text-white">{title}</h2>

            {description && (
              <p className="mt-0.5 text-sm text-slate-400">{description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  icon: Icon,
  required = false,
  disabled = false,
  min,
  max,
  step,
  className = '',
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}

        {required && <span className="ml-1 text-red-400">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
        )}

        <input
          name={name}
          value={value ?? ''}
          onChange={onChange}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          className={`
            w-full rounded-xl border border-slate-700 bg-slate-950/70
            px-3 py-2.5 text-sm text-white outline-none
            placeholder:text-slate-600
            transition
            focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10
            disabled:cursor-not-allowed disabled:opacity-50
            ${Icon ? 'pl-10' : ''}
          `}
        />
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  icon: Icon,
  className = '',
}) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
        )}

        <select
          value={value ?? ''}
          onChange={onChange}
          className={`
            w-full appearance-none rounded-xl border border-slate-700
            bg-slate-950/70 px-3 py-2.5 pr-10 text-sm text-white
            outline-none transition
            focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10
            ${Icon ? 'pl-10' : ''}
          `}
        >
          {options.map((option) => {
            const normalized =
              typeof option === 'string'
                ? { value: option, label: option }
                : option;

            return (
              <option
                key={normalized.value}
                value={normalized.value}
                className="bg-slate-900"
              >
                {normalized.label}
              </option>
            );
          })}
        </select>

        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
      </div>
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder = '',
  maxLength,
  rows = 5,
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-300">
          {label}
        </label>

        {maxLength && (
          <span className="text-xs text-slate-500">
            {(value || '').length}/{maxLength}
          </span>
        )}
      </div>

      <textarea
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
      />
    </div>
  );
}

function Toggle({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
      <div>
        <div className="text-sm font-medium text-white">{label}</div>

        {description && (
          <div className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </div>
        )}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`
          relative h-6 w-11 shrink-0 rounded-full transition
          ${checked ? 'bg-blue-600' : 'bg-slate-700'}
        `}
      >
        <span
          className={`
            absolute top-1 h-4 w-4 rounded-full bg-white transition
            ${checked ? 'left-6' : 'left-1'}
          `}
        />
      </button>
    </label>
  );
}

function MultiSelect({ label, options, values, onToggle }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = values.includes(option);

          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={`
                inline-flex items-center gap-1.5 rounded-lg border px-3 py-2
                text-xs font-medium transition
                ${
                  selected
                    ? 'border-blue-500/40 bg-blue-500/10 text-blue-300'
                    : 'border-slate-700 bg-slate-950/60 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                }
              `}
            >
              {selected && <Check size={13} />}
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TagsInput({
  label,
  values,
  onChange,
  placeholder = 'Digite e pressione Enter',
}) {
  const [input, setInput] = useState('');

  const addValue = () => {
    const value = input.trim();

    if (!value) return;

    if (!values.includes(value)) {
      onChange([...values, value]);
    }

    setInput('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addValue();
    }

    if (event.key === 'Backspace' && !input && values.length) {
      onChange(values.slice(0, -1));
    }
  };

  const removeValue = (value) => {
    onChange(values.filter((item) => item !== value));
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </label>

      <div className="rounded-xl border border-slate-700 bg-slate-950/70 p-2">
        <div className="mb-2 flex flex-wrap gap-2">
          {values.map((value) => (
            <span
              key={value}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-500/10 px-2.5 py-1.5 text-xs text-blue-300"
            >
              {value}

              <button
                type="button"
                onClick={() => removeValue(value)}
                className="text-blue-400 transition hover:text-red-400"
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>

        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addValue}
          placeholder={placeholder}
          className="w-full bg-transparent px-1 py-1.5 text-sm text-white outline-none placeholder:text-slate-600"
        />
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| COMPONENTE PRINCIPAL
|--------------------------------------------------------------------------
*/

export default function BrokerEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');

  /*
  |--------------------------------------------------------------------------
  | BUSCAR CORRETOR
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!id || !user?.token) return;

    const fetchBroker = async () => {
      try {
        setLoading(true);
        setError('');

        const { data } = await api.get(`/api/users/admin/users/${id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        const broker =
          data?.data?.user ||
          data?.data?.broker ||
          data?.user ||
          data?.broker ||
          data?.data;

        if (!broker) {
          throw new Error('Dados do corretor não encontrados.');
        }

        setForm({
          ...emptyForm,

          ...broker,

          name: broker.name || '',
          email: broker.email || '',
          phone: broker.phone || '',

          avatar: broker.avatar || '',
          coverImage: broker.coverImage || '',
          bio: broker.bio || '',
          website: broker.website || '',

          position: broker.position || 'Corretor de Imóveis',

          company: broker.company || '',
          creci: broker.creci || '',
          creciActive: Boolean(broker.creciActive),
          experienceYears: broker.experienceYears ?? 0,
          signature: broker.signature || '',

          specialties: Array.isArray(broker.specialties)
            ? broker.specialties
            : [],

          regions: Array.isArray(broker.regions) ? broker.regions : [],

          highlights: Array.isArray(broker.highlights) ? broker.highlights : [],

          availability: broker.availability || 'Disponível',

          workingHours: {
            ...emptyForm.workingHours,
            ...(broker.workingHours || {}),
          },

          address: {
            ...emptyForm.address,
            ...(broker.address || {}),
          },

          socials: {
            ...emptyForm.socials,
            ...(broker.socials || {}),
          },

          settings: {
            ...emptyForm.settings,
            ...(broker.settings || {}),
          },

          commissionPercentage:
            broker.commissionPercentage ??
            broker.settings?.commissionPercentage ??
            3,

          capturerCommissionPercentage:
            broker.capturerCommissionPercentage ?? 1,

          isActive: broker.isActive !== undefined ? broker.isActive : true,

          isOnline: Boolean(broker.isOnline),

          role: broker.role || 'broker',

          brokerSettings: {
            ...emptyForm.brokerSettings,
            ...(broker.brokerSettings || {}),
            workHours: {
              ...emptyForm.brokerSettings.workHours,
              ...(broker.brokerSettings?.workHours || {}),
            },
          },

          newPassword: '',
          confirmPassword: '',
        });
      } catch (err) {
        console.error('Erro ao buscar corretor:', err);

        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Não foi possível carregar o corretor.';

        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchBroker();
  }, [id, user?.token]);

  /*
  |--------------------------------------------------------------------------
  | HANDLERS
  |--------------------------------------------------------------------------
  */

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNestedChange = (section, field, value) => {
    setForm((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSocialChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      socials: {
        ...prev.socials,
        [field]: value,
      },
    }));
  };

  const handleAddressChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  };

  const toggleSpecialty = (specialty) => {
    setForm((prev) => {
      const exists = prev.specialties.includes(specialty);

      return {
        ...prev,
        specialties: exists
          ? prev.specialties.filter((item) => item !== specialty)
          : [...prev.specialties, specialty],
      };
    });
  };

  const toggleDay = (day) => {
    setForm((prev) => {
      const exists = prev.brokerSettings.availableDays.includes(day);

      return {
        ...prev,
        brokerSettings: {
          ...prev.brokerSettings,
          availableDays: exists
            ? prev.brokerSettings.availableDays.filter((item) => item !== day)
            : [...prev.brokerSettings.availableDays, day],
        },
      };
    });
  };

  const toggleLeadType = (type) => {
    setForm((prev) => {
      const exists = prev.brokerSettings.acceptedLeadTypes.includes(type);

      return {
        ...prev,
        brokerSettings: {
          ...prev.brokerSettings,
          acceptedLeadTypes: exists
            ? prev.brokerSettings.acceptedLeadTypes.filter(
                (item) => item !== type,
              )
            : [...prev.brokerSettings.acceptedLeadTypes, type],
        },
      };
    });
  };

  /*
  |--------------------------------------------------------------------------
  | VALIDAR
  |--------------------------------------------------------------------------
  */

  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error('Informe o nome do corretor.');
      return false;
    }

    if (!form.email.trim()) {
      toast.error('Informe o e-mail do corretor.');
      return false;
    }

    if (form.newPassword && form.newPassword.length < 6) {
      toast.error('A nova senha deve possuir pelo menos 6 caracteres.');
      return false;
    }

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      toast.error('As senhas não conferem.');
      return false;
    }

    const commission = Number(form.commissionPercentage);

    const capturerCommission = Number(form.capturerCommissionPercentage);

    if (Number.isNaN(commission) || commission < 0 || commission > 100) {
      toast.error('A comissão de venda deve estar entre 0% e 100%.');
      return false;
    }

    if (
      Number.isNaN(capturerCommission) ||
      capturerCommission < 0 ||
      capturerCommission > 100
    ) {
      toast.error('A comissão de captação deve estar entre 0% e 100%.');
      return false;
    }

    return true;
  };

  /*
  |--------------------------------------------------------------------------
  | SALVAR
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);

      /*
       * Enviamos somente os campos que o backend
       * atualmente aceita em adminUpdateUser.
       *
       * brokerSettings NÃO é enviado porque o controller
       * atual não possui esse campo em allowedFields.
       */

      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),

        avatar: form.avatar.trim(),
        coverImage: form.coverImage.trim(),
        bio: form.bio.trim(),
        website: form.website.trim(),

        position: form.position.trim(),
        company: form.company.trim(),
        creci: form.creci.trim(),
        creciActive: Boolean(form.creciActive),
        experienceYears: Number(form.experienceYears) || 0,
        signature: form.signature.trim(),

        specialties: form.specialties,
        regions: form.regions,
        highlights: form.highlights,

        availability: form.availability,

        workingHours: {
          start: form.workingHours.start,
          end: form.workingHours.end,
        },

        address: form.address,

        socials: form.socials,

        settings: {
          ...form.settings,
          monthlyGoal: Number(form.settings.monthlyGoal) || 0,
          commissionPercentage: Number(form.commissionPercentage) || 0,
          notifications: Boolean(form.settings.notifications),
          showcaseEnabled: Boolean(form.settings.showcaseEnabled),
        },

        commissionPercentage: Number(form.commissionPercentage) || 0,

        capturerCommissionPercentage:
          Number(form.capturerCommissionPercentage) || 0,

        brokerSettings: {
          ...form.brokerSettings,
          specializedRegions: form.brokerSettings.specializedRegions || [],
          specializedTypes: form.brokerSettings.specializedTypes || [],
          isActive: Boolean(form.brokerSettings.isActive),
          maxActiveLeads: Number(form.brokerSettings.maxActiveLeads) || 1,
          priority: Number(form.brokerSettings.priority) || 0,
          availableDays: form.brokerSettings.availableDays || [],
          workHours: {
            start: form.brokerSettings.workHours?.start || '09:00',
            end: form.brokerSettings.workHours?.end || '18:00',
          },
          acceptedLeadTypes: form.brokerSettings.acceptedLeadTypes || [],
          minPropertyValue: Number(form.brokerSettings.minPropertyValue) || 0,
          maxPropertyValue:
            form.brokerSettings.maxPropertyValue === '' ||
            form.brokerSettings.maxPropertyValue == null
              ? null
              : Number(form.brokerSettings.maxPropertyValue),
        },

        isActive: Boolean(form.isActive),

        role: form.role,
      };

      if (form.newPassword.trim()) {
        payload.password = form.newPassword.trim();
      }

      const { data } = await api.put(`/api/users/admin/users/${id}`, payload, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      toast.success(data?.message || 'Corretor atualizado com sucesso.');

      navigate('/brokers');
    } catch (err) {
      console.error('Erro ao atualizar corretor:', err);

      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Não foi possível atualizar o corretor.';

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | PREVIEW
  |--------------------------------------------------------------------------
  */

  const initials = useMemo(() => {
    const name = form.name || 'Corretor';

    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((item) => item[0])
      .join('')
      .toUpperCase();
  }, [form.name]);

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={36} className="animate-spin text-blue-500" />

            <p className="text-sm text-slate-400">
              Carregando dados do corretor...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | ERROR
  |--------------------------------------------------------------------------
  */

  if (error && !form.name) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={() => navigate('/brokers')}
            className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Voltar para corretores
          </button>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle size={22} className="mt-0.5 shrink-0 text-red-400" />

              <div>
                <h2 className="font-semibold text-white">
                  Não foi possível carregar o corretor
                </h2>

                <p className="mt-1 text-sm text-red-300/80">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* HEADER */}

        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate('/brokers')}
            className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={17} />
            Voltar para corretores
          </button>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                  <UserRound size={22} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-white">
                    Editar corretor
                  </h1>

                  <p className="mt-1 text-sm text-slate-400">
                    Gerencie os dados, perfil profissional e configurações do
                    corretor.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`
                  inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium
                  ${
                    form.isActive
                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                      : 'border-red-500/20 bg-red-500/10 text-red-400'
                  }
                `}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    form.isActive ? 'bg-emerald-400' : 'bg-red-400'
                  }`}
                />

                {form.isActive ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            {/* COLUNA PRINCIPAL */}

            <div className="space-y-6 xl:col-span-2">
              {/* DADOS PESSOAIS */}

              <SectionCard
                icon={User}
                title="Dados pessoais"
                description="Informações básicas de identificação e contato."
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Field
                    label="Nome completo"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Nome do corretor"
                    icon={User}
                    required
                  />

                  <Field
                    label="E-mail"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    type="email"
                    placeholder="corretor@email.com"
                    icon={Mail}
                    required
                  />

                  <Field
                    label="Telefone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+5511999999999"
                    icon={Phone}
                  />

                  <Field
                    label="Website"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    placeholder="https://..."
                    icon={Globe}
                  />

                  <div className="md:col-span-2">
                    <TextareaField
                      label="Biografia"
                      value={form.bio}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          bio: event.target.value,
                        }))
                      }
                      placeholder="Conte um pouco sobre a experiência profissional do corretor..."
                      maxLength={500}
                      rows={5}
                    />
                  </div>
                </div>
              </SectionCard>

              {/* DADOS PROFISSIONAIS */}

              <SectionCard
                icon={Award}
                title="Dados profissionais"
                description="Informações utilizadas no perfil profissional do corretor."
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Field
                    label="Cargo"
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    placeholder="Corretor de Imóveis"
                    icon={BadgeCheck}
                  />

                  <Field
                    label="Imobiliária / Empresa"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Nome da empresa"
                    icon={Building2}
                  />

                  <Field
                    label="CRECI"
                    name="creci"
                    value={form.creci}
                    onChange={handleChange}
                    placeholder="Ex.: 123456-F"
                    icon={BadgeCheck}
                  />

                  <Field
                    label="Anos de experiência"
                    name="experienceYears"
                    value={form.experienceYears}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                  />

                  <div className="md:col-span-2">
                    <Toggle
                      label="CRECI ativo"
                      description="Indica se o registro profissional está ativo."
                      checked={form.creciActive}
                      onChange={() =>
                        setForm((prev) => ({
                          ...prev,
                          creciActive: !prev.creciActive,
                        }))
                      }
                    />
                  </div>

                  <div className="md:col-span-2">
                    <MultiSelect
                      label="Especialidades"
                      options={SPECIALTIES}
                      values={form.specialties}
                      onToggle={toggleSpecialty}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <TagsInput
                      label="Regiões de atuação"
                      values={form.regions}
                      onChange={(values) =>
                        setForm((prev) => ({
                          ...prev,
                          regions: values,
                        }))
                      }
                      placeholder="Ex.: Vila Mariana, Saúde, Moema..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <TagsInput
                      label="Destaques profissionais"
                      values={form.highlights}
                      onChange={(values) =>
                        setForm((prev) => ({
                          ...prev,
                          highlights: values,
                        }))
                      }
                      placeholder="Ex.: Especialista em alto padrão..."
                    />
                  </div>
                </div>
              </SectionCard>

              {/* ENDEREÇO */}

              <SectionCard
                icon={MapPin}
                title="Endereço"
                description="Endereço profissional ou de atendimento."
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-6">
                  <Field
                    label="CEP"
                    value={form.address.zipCode}
                    onChange={(event) =>
                      handleAddressChange('zipCode', event.target.value)
                    }
                    placeholder="00000-000"
                    className="md:col-span-2"
                  />

                  <Field
                    label="Rua"
                    value={form.address.street}
                    onChange={(event) =>
                      handleAddressChange('street', event.target.value)
                    }
                    placeholder="Nome da rua"
                    className="md:col-span-4"
                  />

                  <Field
                    label="Número"
                    value={form.address.number}
                    onChange={(event) =>
                      handleAddressChange('number', event.target.value)
                    }
                    placeholder="123"
                    className="md:col-span-2"
                  />

                  <Field
                    label="Bairro"
                    value={form.address.district}
                    onChange={(event) =>
                      handleAddressChange('district', event.target.value)
                    }
                    placeholder="Bairro"
                    className="md:col-span-4"
                  />

                  <Field
                    label="Cidade"
                    value={form.address.city}
                    onChange={(event) =>
                      handleAddressChange('city', event.target.value)
                    }
                    placeholder="São Paulo"
                    className="md:col-span-4"
                  />

                  <Field
                    label="Estado"
                    value={form.address.state}
                    onChange={(event) =>
                      handleAddressChange('state', event.target.value)
                    }
                    placeholder="SP"
                    className="md:col-span-2"
                  />
                </div>
              </SectionCard>

              {/* REDES SOCIAIS */}

              <SectionCard
                icon={Globe}
                title="Redes sociais"
                description="Links públicos do perfil do corretor."
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Field
                    label="Instagram"
                    value={form.socials.instagram}
                    onChange={(event) =>
                      handleSocialChange('instagram', event.target.value)
                    }
                    placeholder="@usuario ou URL"
                    icon={Instagram}
                  />

                  <Field
                    label="Facebook"
                    value={form.socials.facebook}
                    onChange={(event) =>
                      handleSocialChange('facebook', event.target.value)
                    }
                    placeholder="URL do Facebook"
                  />

                  <Field
                    label="LinkedIn"
                    value={form.socials.linkedin}
                    onChange={(event) =>
                      handleSocialChange('linkedin', event.target.value)
                    }
                    placeholder="URL do LinkedIn"
                    icon={Linkedin}
                  />

                  <Field
                    label="YouTube"
                    value={form.socials.youtube}
                    onChange={(event) =>
                      handleSocialChange('youtube', event.target.value)
                    }
                    placeholder="URL do canal"
                    icon={Youtube}
                  />

                  <Field
                    label="TikTok"
                    value={form.socials.tiktok}
                    onChange={(event) =>
                      handleSocialChange('tiktok', event.target.value)
                    }
                    placeholder="@usuario ou URL"
                  />

                  <Field
                    label="WhatsApp"
                    value={form.socials.whatsapp}
                    onChange={(event) =>
                      handleSocialChange('whatsapp', event.target.value)
                    }
                    placeholder="+5511999999999"
                    icon={Phone}
                  />
                </div>
              </SectionCard>

              {/* AGENDA / DISPONIBILIDADE */}

              <SectionCard
                icon={Users}
                title="Disponibilidade"
                description="Configure a disponibilidade apresentada no perfil."
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <SelectField
                    label="Status"
                    value={form.availability}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        availability: event.target.value,
                      }))
                    }
                    options={AVAILABILITY_OPTIONS}
                    className="md:col-span-1"
                  />

                  <Field
                    label="Início"
                    value={form.workingHours.start}
                    onChange={(event) =>
                      handleNestedChange(
                        'workingHours',
                        'start',
                        event.target.value,
                      )
                    }
                    type="time"
                  />

                  <Field
                    label="Fim"
                    value={form.workingHours.end}
                    onChange={(event) =>
                      handleNestedChange(
                        'workingHours',
                        'end',
                        event.target.value,
                      )
                    }
                    type="time"
                  />
                </div>
              </SectionCard>

              {/* CONFIGURAÇÕES COMERCIAIS */}

              <SectionCard
                icon={Award}
                title="Comissões"
                description="Percentuais utilizados no processo comercial e de captação."
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Field
                    label="Comissão de venda (%)"
                    name="commissionPercentage"
                    value={form.commissionPercentage}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="3"
                  />

                  <Field
                    label="Comissão como captador (%)"
                    name="capturerCommissionPercentage"
                    value={form.capturerCommissionPercentage}
                    onChange={handleChange}
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="1"
                  />
                </div>

                <div className="mt-5 rounded-xl border border-blue-500/10 bg-blue-500/5 p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck
                      size={18}
                      className="mt-0.5 shrink-0 text-blue-400"
                    />

                    <div>
                      <p className="text-sm font-medium text-blue-300">
                        Configuração de comissão
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        A comissão de venda representa o percentual utilizado
                        quando o corretor atua como vendedor. A comissão de
                        captação é utilizada quando ele participa como captador
                        do imóvel.
                      </p>
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* SENHA */}

              <SectionCard
                icon={LockKeyhole}
                title="Segurança"
                description="Altere a senha somente se necessário."
              >
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Field
                    label="Nova senha"
                    name="newPassword"
                    value={form.newPassword}
                    onChange={handleChange}
                    type="password"
                    placeholder="Deixe vazio para manter"
                    icon={LockKeyhole}
                  />

                  <Field
                    label="Confirmar nova senha"
                    name="confirmPassword"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    type="password"
                    placeholder="Repita a nova senha"
                    icon={LockKeyhole}
                  />
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  A senha será alterada somente se você preencher os dois
                  campos.
                </p>
              </SectionCard>
            </div>

            {/* SIDEBAR */}

            <div className="space-y-6">
              {/* PERFIL */}

              <SectionCard
                icon={UserRound}
                title="Perfil"
                description="Visualização rápida."
              >
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    {form.avatar ? (
                      <img
                        src={form.avatar}
                        alt={form.name}
                        className="h-28 w-28 rounded-full border-4 border-slate-800 object-cover shadow-xl"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-slate-800 bg-gradient-to-br from-blue-600 to-indigo-700 text-3xl font-bold text-white shadow-xl">
                        {initials}
                      </div>
                    )}

                    <span
                      className={`
                        absolute bottom-1 right-1 h-5 w-5 rounded-full border-4 border-slate-900
                        ${form.isActive ? 'bg-emerald-500' : 'bg-red-500'}
                      `}
                    />
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-white">
                    {form.name || 'Nome do corretor'}
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    {form.position || 'Corretor de Imóveis'}
                  </p>

                  {form.creci && (
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-400">
                      <BadgeCheck size={13} />
                      CRECI {form.creci}
                    </div>
                  )}
                </div>
              </SectionCard>

              {/* AVATAR */}

              <SectionCard
                icon={User}
                title="Imagens"
                description="URLs das imagens do perfil."
              >
                <div className="space-y-5">
                  <Field
                    label="URL do avatar"
                    name="avatar"
                    value={form.avatar}
                    onChange={handleChange}
                    placeholder="https://..."
                  />

                  <Field
                    label="URL da capa"
                    name="coverImage"
                    value={form.coverImage}
                    onChange={handleChange}
                    placeholder="https://..."
                  />

                  {form.coverImage && (
                    <div className="overflow-hidden rounded-xl border border-slate-800">
                      <img
                        src={form.coverImage}
                        alt="Capa"
                        className="h-28 w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </SectionCard>

              {/* STATUS */}

              <SectionCard
                icon={ShieldCheck}
                title="Acesso"
                description="Controle do acesso do corretor."
              >
                <div className="space-y-3">
                  <Toggle
                    label="Corretor ativo"
                    description="Usuários inativos não conseguem acessar o sistema."
                    checked={form.isActive}
                    onChange={() =>
                      setForm((prev) => ({
                        ...prev,
                        isActive: !prev.isActive,
                      }))
                    }
                  />

                  <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                    <div className="text-xs text-slate-500">
                      Perfil de acesso
                    </div>

                    <div className="mt-1 font-medium capitalize text-white">
                      {form.role === 'admin' ? 'Administrador' : 'Corretor'}
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* CONFIGURAÇÕES */}

              <SectionCard
                icon={CheckCircle2}
                title="Configurações"
                description="Preferências do perfil."
              >
                <div className="space-y-3">
                  <Field
                    label="Meta mensal"
                    type="number"
                    min="0"
                    value={form.settings.monthlyGoal}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          monthlyGoal: event.target.value,
                        },
                      }))
                    }
                  />

                  <Toggle
                    label="Notificações"
                    description="Permitir notificações no sistema."
                    checked={form.settings.notifications}
                    onChange={() =>
                      setForm((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          notifications: !prev.settings.notifications,
                        },
                      }))
                    }
                  />

                  <Toggle
                    label="Vitrine pública"
                    description="Exibir o corretor na vitrine."
                    checked={form.settings.showcaseEnabled}
                    onChange={() =>
                      setForm((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          showcaseEnabled: !prev.settings.showcaseEnabled,
                        },
                      }))
                    }
                  />
                </div>
              </SectionCard>

              {/* AVISO */}

              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle
                    size={19}
                    className="mt-0.5 shrink-0 text-amber-400"
                  />

                  <div>
                    <h3 className="text-sm font-semibold text-amber-300">
                      Atenção
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      As alterações serão aplicadas imediatamente ao cadastro do
                      corretor.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}

          <div className="sticky bottom-0 z-20 mt-6 border-t border-slate-800 bg-slate-950/95 py-4 backdrop-blur">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => navigate('/brokers')}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={17} />
                Cancelar
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Salvar alterações
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

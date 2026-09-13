import { useContext, useMemo, useState } from 'react';

import { useForm } from 'react-hook-form';

import { yupResolver } from '@hookform/resolvers/yup';

import * as yup from 'yup';

import { toast } from 'react-toastify';

import { useNavigate } from 'react-router-dom';

import {
  ArrowLeft,
  UserPlus,
  User,
  Mail,
  Phone,
  MapPin,
  Tag,
  FileText,
  Save,
  Loader2,
  Shuffle,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

import api from '../service/api';

import { UserContext } from '../context/UserContext';

/* =========================================================
   CONSTANTS
========================================================= */

const VALID_REGIONS = [
  'central',
  'zona_oeste',
  'zona_leste',
  'zona_sul',
  'zona_norte',
  'abc',
  'grande_sp',
  'interior',
  'litoral',
];

const REGION_OPTIONS = [
  {
    value: 'central',
    label: 'Centro',
  },
  {
    value: 'zona_oeste',
    label: 'Zona Oeste',
  },
  {
    value: 'zona_leste',
    label: 'Zona Leste',
  },
  {
    value: 'zona_sul',
    label: 'Zona Sul',
  },
  {
    value: 'zona_norte',
    label: 'Zona Norte',
  },
  {
    value: 'abc',
    label: 'ABC',
  },
  {
    value: 'grande_sp',
    label: 'Grande São Paulo',
  },
  {
    value: 'interior',
    label: 'Interior',
  },
  {
    value: 'litoral',
    label: 'Litoral',
  },
];

const STATUS_OPTIONS = [
  {
    value: 'novo',
    label: 'Novo',
  },
  {
    value: 'em_contato',
    label: 'Em contato',
  },
  {
    value: 'qualificado',
    label: 'Qualificado',
  },
  {
    value: 'visita_agendada',
    label: 'Visita agendada',
  },
  {
    value: 'proposta',
    label: 'Proposta',
  },
  {
    value: 'convertido',
    label: 'Convertido',
  },
  {
    value: 'perdido',
    label: 'Perdido',
  },
];

/* =========================================================
   HELPERS
========================================================= */

/**
 * Mantém somente números.
 */
function onlyNumbers(value = '') {
  return String(value).replace(/\D/g, '');
}

/**
 * Máscara de telefone brasileiro.
 *
 * Exemplos:
 * 11999999999 -> (11) 99999-9999
 * 1133334444  -> (11) 3333-4444
 */
function formatPhone(value = '') {
  const numbers = onlyNumbers(value).slice(0, 11);

  if (!numbers) {
    return '';
  }

  if (numbers.length <= 2) {
    return `(${numbers}`;
  }

  if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  }

  if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(
      2,
      6,
    )}-${numbers.slice(6)}`;
  }

  return `(${numbers.slice(0, 2)}) ${numbers.slice(
    2,
    7,
  )}-${numbers.slice(7, 11)}`;
}

/**
 * Validação de telefone brasileiro.
 *
 * Aceita:
 * (11) 99999-9999
 * (11) 3333-4444
 */
function isValidBrazilianPhone(value = '') {
  const numbers = onlyNumbers(value);

  if (numbers.length !== 10 && numbers.length !== 11) {
    return false;
  }

  const ddd = Number(numbers.slice(0, 2));

  // Faixa de DDDs utilizada no Brasil.
  const validDDD = ddd >= 11 && ddd <= 99;

  if (!validDDD) {
    return false;
  }

  const number = numbers.slice(2);

  // Celular brasileiro começa com 9.
  if (numbers.length === 11) {
    return number.startsWith('9');
  }

  return true;
}

/**
 * Normaliza email.
 */
function normalizeEmail(value = '') {
  return value.trim().toLowerCase();
}

/**
 * Nome amigável das regiões.
 */
function getRegionLabel(region) {
  const option = REGION_OPTIONS.find((item) => item.value === region);

  return option?.label || region || '-';
}

/* =========================================================
   VALIDATION
========================================================= */

const schema = yup.object().shape({
  name: yup
    .string()
    .transform((value) => value?.trim())
    .required('Nome é obrigatório')
    .min(2, 'Digite pelo menos 2 caracteres')
    .max(120, 'Nome muito longo'),

  email: yup
    .string()
    .transform((value) => value?.trim().toLowerCase())
    .required('Email é obrigatório')
    .email('Digite um email válido')
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i, 'Digite um email válido')
    .max(160, 'Email muito longo'),

  phone: yup
    .string()
    .required('Telefone é obrigatório')
    .test(
      'valid-brazilian-phone',
      'Digite um telefone brasileiro válido',
      (value) => isValidBrazilianPhone(value),
    ),

  status: yup
    .string()
    .oneOf(
      STATUS_OPTIONS.map((option) => option.value),
      'Status inválido',
    )
    .required('Status é obrigatório'),

  region: yup
    .string()
    .nullable()
    .test(
      'valid-region',
      'Selecione uma região válida',
      (value) => !value || VALID_REGIONS.includes(value),
    ),

  notes: yup
    .string()
    .transform((value) => value?.trim())
    .nullable()
    .max(2000, 'As observações podem ter no máximo 2000 caracteres'),
});

/* =========================================================
   FIELD LABEL
========================================================= */

function FieldLabel({ icon: Icon, children, required = false }) {
  return (
    <label className="mb-2.5 flex items-center gap-2 text-sm font-medium text-slate-300">
      {Icon && <Icon size={15} className="text-blue-400" />}

      <span>{children}</span>

      {required && <span className="text-red-400">*</span>}
    </label>
  );
}

/* =========================================================
   FIELD ERROR
========================================================= */

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return (
    <div className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
      <AlertCircle size={13} />
      <span>{message}</span>
    </div>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="border-b border-slate-800/80 px-5 py-5 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/10 bg-blue-500/10">
          <Icon size={18} className="text-blue-400" />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white">{title}</h2>

          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CREATE LEAD
========================================================= */

export default function CreateLead() {
  const { user } = useContext(UserContext);

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [phoneValue, setPhoneValue] = useState('');

  const [notesLength, setNotesLength] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),

    defaultValues: {
      name: '',
      email: '',
      phone: '',
      status: 'novo',
      region: '',
      notes: '',
    },
  });

  /* =======================================================
     PHONE REGISTER
  ======================================================= */

  const phoneRegister = register('phone');

  const handlePhoneChange = (event) => {
    const formatted = formatPhone(event.target.value);

    setPhoneValue(formatted);

    setValue('phone', formatted, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const onSubmit = async (data) => {
    if (!user?._id) {
      toast.error('Você precisa estar logado para criar um lead.');

      return;
    }

    let userInfo = {};

    try {
      userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    } catch (error) {
      console.error('Erro ao ler userInfo:', error);
    }

    if (!userInfo?.token) {
      toast.error('Sessão expirada. Faça login novamente.');

      return;
    }

    setLoading(true);

    try {
      const normalizedEmail = normalizeEmail(data.email);

      const normalizedPhone = onlyNumbers(data.phone);

      const payload = {
        ...data,

        name: data.name.trim(),

        email: normalizedEmail,

        // Backend recebe somente números.
        phone: normalizedPhone,

        region: data.region || null,

        notes: data.notes?.trim() || '',

        createdBy: user._id,

        assignmentType: 'round_robin',

        status: data.status || 'novo',
      };

      console.log('Criando lead:', payload);

      await api.post('/api/leads', payload, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      });

      toast.success('Lead criado e distribuído automaticamente.');

      navigate('/leads-list');
    } catch (error) {
      console.error('Erro ao criar lead:', error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Erro ao criar lead.';

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     STYLES
  ======================================================= */

  const inputClass = `
    h-12
    w-full
    rounded-xl
    border
    border-slate-800
    bg-slate-950/70
    px-4
    text-sm
    text-white
    placeholder:text-slate-600
    outline-none
    transition-all
    duration-200
    hover:border-slate-700
    focus:border-blue-500/50
    focus:bg-slate-950
    focus:ring-4
    focus:ring-blue-500/5
  `;

  const selectClass = `
    ${inputClass}
    appearance-none
    cursor-pointer
    pr-10
  `;

  const textareaClass = `
    w-full
    min-h-[150px]
    resize-y
    rounded-xl
    border
    border-slate-800
    bg-slate-950/70
    px-4
    py-3
    text-sm
    leading-6
    text-white
    placeholder:text-slate-600
    outline-none
    transition-all
    duration-200
    hover:border-slate-700
    focus:border-blue-500/50
    focus:bg-slate-950
    focus:ring-4
    focus:ring-blue-500/5
  `;

  const selectedRegionLabel = useMemo(
    () => getRegionLabel(document?.activeElement?.value),
    [],
  );

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      {/* BACKGROUND DECORATION */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/3 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />

        <div className="absolute right-0 top-1/2 h-80 w-80 rounded-full bg-indigo-600/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto w-full max-w-[1400px] p-4 sm:p-6 lg:p-8">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8">
          <button
            type="button"
            onClick={() => navigate('/leads-list')}
            disabled={loading}
            className="
              mb-5
              inline-flex
              items-center
              gap-2
              rounded-lg
              px-2
              py-1.5
              text-sm
              text-slate-500
              transition
              hover:bg-slate-900
              hover:text-white
              disabled:opacity-50
            "
          >
            <ArrowLeft size={16} />
            Voltar para leads
          </button>

          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div
                  className="
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-blue-500/20
                    bg-gradient-to-br
                    from-blue-500/20
                    to-indigo-500/10
                    shadow-lg
                    shadow-blue-950/20
                  "
                >
                  <UserPlus size={26} className="text-blue-400" />
                </div>

                <div className="absolute -right-1 -top-1 flex h-4 w-4">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-30" />

                  <span className="relative inline-flex h-4 w-4 rounded-full bg-blue-500" />
                </div>
              </div>

              <div>
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    Criar novo lead
                  </h1>

                  <span className="rounded-full border border-slate-700/80 bg-slate-900/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    CRM
                  </span>
                </div>

                <p className="text-sm text-slate-500">
                  Cadastre um novo contato e deixe o sistema cuidar da
                  distribuição.
                </p>
              </div>
            </div>

            {/* SECURITY INDICATOR */}
            <div className="hidden items-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900/50 px-4 py-3 backdrop-blur-xl lg:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                <ShieldCheck size={17} className="text-emerald-400" />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                  Dados protegidos
                </p>

                <p className="text-xs text-slate-400">Cadastro seguro</p>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <div className="mx-auto w-full max-w-5xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* =================================================
                DADOS DO LEAD
            ================================================= */}

            <section
              className="
                overflow-hidden
                rounded-2xl
                border
                border-slate-800/80
                bg-slate-900/50
                shadow-2xl
                shadow-black/10
                backdrop-blur-xl
              "
            >
              <SectionHeader
                icon={User}
                title="Dados do lead"
                description="Informações principais do contato"
              />

              <div className="p-5 sm:p-6">
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {/* NAME */}

                  <div>
                    <FieldLabel icon={User} required>
                      Nome completo
                    </FieldLabel>

                    <input
                      type="text"
                      placeholder="Ex.: João da Silva"
                      autoComplete="name"
                      {...register('name')}
                      className={inputClass}
                    />

                    <FieldError message={errors.name?.message} />
                  </div>

                  {/* EMAIL */}

                  <div>
                    <FieldLabel icon={Mail} required>
                      Email
                    </FieldLabel>

                    <input
                      type="email"
                      placeholder="exemplo@email.com"
                      autoComplete="email"
                      inputMode="email"
                      {...register('email')}
                      className={inputClass}
                    />

                    <FieldError message={errors.email?.message} />
                  </div>

                  {/* PHONE */}

                  <div>
                    <FieldLabel icon={Phone} required>
                      Telefone
                    </FieldLabel>

                    <div className="relative">
                      <input
                        type="tel"
                        placeholder="(11) 99999-9999"
                        autoComplete="tel"
                        inputMode="numeric"
                        name={phoneRegister.name}
                        ref={phoneRegister.ref}
                        onBlur={phoneRegister.onBlur}
                        value={phoneValue}
                        onChange={handlePhoneChange}
                        className={inputClass}
                      />

                      {phoneValue && isValidBrazilianPhone(phoneValue) && (
                        <CheckCircle2
                          size={17}
                          className="
                              absolute
                              right-4
                              top-1/2
                              -translate-y-1/2
                              text-emerald-400
                            "
                        />
                      )}
                    </div>

                    <FieldError message={errors.phone?.message} />

                    {!errors.phone && phoneValue && (
                      <p className="mt-2 text-[11px] text-slate-600">
                        O telefone será salvo com DDD e somente números.
                      </p>
                    )}
                  </div>

                  {/* REGION */}

                  <div>
                    <FieldLabel icon={MapPin}>Região de interesse</FieldLabel>

                    <div className="relative">
                      <select {...register('region')} className={selectClass}>
                        <option value="" className="bg-slate-950">
                          Selecione uma região
                        </option>

                        {REGION_OPTIONS.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                            className="bg-slate-950"
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>

                      <ChevronDown
                        size={17}
                        className="
                          pointer-events-none
                          absolute
                          right-4
                          top-1/2
                          -translate-y-1/2
                          text-slate-500
                        "
                      />
                    </div>

                    <FieldError message={errors.region?.message} />
                  </div>

                  {/* STATUS */}

                  <div className="lg:col-span-2">
                    <FieldLabel icon={Tag}>Status inicial</FieldLabel>

                    <div className="relative">
                      <select {...register('status')} className={selectClass}>
                        {STATUS_OPTIONS.map((option) => (
                          <option
                            key={option.value}
                            value={option.value}
                            className="bg-slate-950"
                          >
                            {option.label}
                          </option>
                        ))}
                      </select>

                      <ChevronDown
                        size={17}
                        className="
                          pointer-events-none
                          absolute
                          right-4
                          top-1/2
                          -translate-y-1/2
                          text-slate-500
                        "
                      />
                    </div>

                    <FieldError message={errors.status?.message} />
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                DISTRIBUIÇÃO AUTOMÁTICA
            ================================================= */}

            <section
              className="
                relative
                overflow-hidden
                rounded-2xl
                border
                border-blue-500/20
                bg-gradient-to-br
                from-blue-500/[0.06]
                to-indigo-500/[0.02]
                shadow-xl
                shadow-blue-950/10
              "
            >
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl" />

              <div className="relative p-5 sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-blue-500/10
                        bg-blue-500/10
                      "
                    >
                      <Shuffle size={20} className="text-blue-400" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold text-white">
                          Distribuição automática
                        </h2>

                        <span
                          className="
                            rounded-full
                            border
                            border-blue-500/20
                            bg-blue-500/10
                            px-2
                            py-0.5
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-wider
                            text-blue-300
                          "
                        >
                          Round Robin
                        </span>
                      </div>

                      <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
                        O sistema encaminhará automaticamente este lead para o
                        próximo corretor elegível da fila.
                      </p>
                    </div>
                  </div>

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      border
                      border-slate-800
                      bg-slate-950/60
                      px-4
                      py-3
                    "
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                      <CheckCircle2 size={17} className="text-emerald-400" />
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-slate-600">
                        Distribuição
                      </p>

                      <p className="text-xs font-medium text-slate-300">
                        Automática
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                OBSERVAÇÕES
            ================================================= */}

            <section
              className="
                overflow-hidden
                rounded-2xl
                border
                border-slate-800/80
                bg-slate-900/50
                shadow-2xl
                shadow-black/10
                backdrop-blur-xl
              "
            >
              <SectionHeader
                icon={FileText}
                title="Observações"
                description="Informações adicionais sobre o lead"
              />

              <div className="p-5 sm:p-6">
                <div className="relative">
                  <textarea
                    placeholder="Ex.: Cliente procura apartamento de 3 dormitórios na Zona Oeste, com 2 vagas e varanda..."
                    {...register('notes')}
                    onChange={(event) => {
                      register('notes').onChange(event);

                      setNotesLength(event.target.value.length);
                    }}
                    maxLength={2000}
                    className={textareaClass}
                  />

                  <div className="pointer-events-none absolute bottom-3 right-3 rounded-lg border border-slate-800 bg-slate-950/80 px-2 py-1 text-[10px] text-slate-600">
                    {notesLength}/2000
                  </div>
                </div>

                <FieldError message={errors.notes?.message} />
              </div>
            </section>

            {/* =================================================
                SUMMARY
            ================================================= */}

            <div
              className="
                flex
                items-start
                gap-3
                rounded-2xl
                border
                border-slate-800/80
                bg-slate-900/30
                p-4
              "
            >
              <Sparkles size={17} className="mt-0.5 shrink-0 text-blue-400" />

              <div>
                <p className="text-xs font-medium text-slate-300">
                  Pronto para cadastrar
                </p>

                <p className="mt-1 text-[11px] leading-5 text-slate-600">
                  Após o cadastro, o lead será distribuído automaticamente para
                  um corretor elegível conforme a regra de Round Robin.
                </p>
              </div>
            </div>

            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="flex flex-col-reverse gap-3 pb-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => navigate('/leads-list')}
                disabled={loading}
                className="
                  inline-flex
                  h-12
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-800
                  bg-slate-900
                  px-6
                  text-sm
                  font-medium
                  text-slate-300
                  transition-all
                  hover:border-slate-700
                  hover:bg-slate-800
                  hover:text-white
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <ArrowLeft size={17} />
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="
                  inline-flex
                  h-12
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-blue-400/20
                  bg-gradient-to-r
                  from-blue-600
                  to-indigo-600
                  px-7
                  text-sm
                  font-semibold
                  text-white
                  shadow-lg
                  shadow-blue-950/30
                  transition-all
                  duration-200
                  hover:from-blue-500
                  hover:to-indigo-500
                  hover:shadow-blue-900/30
                  active:scale-[0.98]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Criando lead...
                  </>
                ) : (
                  <>
                    <Save size={17} />
                    Criar lead
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// src/pages/CreateLead.jsx

import { useContext, useState } from 'react';
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
  UsersRound,
  Shuffle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

import api from '../service/api';
import { UserContext } from '../context/UserContext';

/* =========================================================
   VALIDATION
========================================================= */

const schema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required('Nome é obrigatório')
    .min(2, 'Digite pelo menos 2 caracteres'),

  email: yup
    .string()
    .trim()
    .email('Email inválido')
    .required('Email é obrigatório'),

  phone: yup.string().trim().required('Telefone é obrigatório'),

  status: yup
    .string()
    .oneOf(
      [
        'novo',
        'em_contato',
        'qualificado',
        'visita_agendada',
        'proposta',
        'convertido',
        'perdido',
      ],
      'Status inválido',
    ),

  region: yup.string().trim().nullable(),

  notes: yup.string().trim().nullable(),
});

/* =========================================================
   STATUS
========================================================= */

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
   FIELD LABEL
========================================================= */

function FieldLabel({ icon: Icon, children, required = false }) {
  return (
    <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
      {Icon && <Icon size={16} className="text-indigo-400" />}

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
    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
      <AlertCircle size={13} />

      <span>{message}</span>
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

  /* =======================================================
     FORM
  ======================================================= */

  const {
    register,
    handleSubmit,
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
      /* ===================================================
         PAYLOAD

         O frontend informa apenas a estratégia.

         O backend deve:
         1. Buscar corretores elegíveis
         2. Identificar o próximo da fila
         3. Atribuir o lead
         4. Registrar a distribuição
      =================================================== */

      const payload = {
        ...data,

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
     INPUT STYLES
  ======================================================= */

  const inputClass = `
    w-full
    rounded-xl
    border
    border-gray-800
    bg-gray-900
    px-4
    py-3
    text-sm
    text-white
    placeholder:text-gray-600
    outline-none
    transition-all
    duration-200
    hover:border-gray-700
    focus:border-indigo-500
    focus:ring-2
    focus:ring-indigo-500/10
  `;

  const textareaClass = `
    w-full
    min-h-[130px]
    resize-y
    rounded-xl
    border
    border-gray-800
    bg-gray-900
    px-4
    py-3
    text-sm
    text-white
    placeholder:text-gray-600
    outline-none
    transition-all
    duration-200
    hover:border-gray-700
    focus:border-indigo-500
    focus:ring-2
    focus:ring-indigo-500/10
  `;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-950 p-4 text-white sm:p-6 lg:p-8">
      {/* ===================================================
          CONTAINER PRINCIPAL

          Mesmo padrão do Dashboard.jsx
      =================================================== */}

      <div className="mx-auto max-w-7xl">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {/* VOLTAR */}

            <button
              type="button"
              onClick={() => navigate('/leads-list')}
              className="
                mb-3
                inline-flex
                items-center
                gap-2
                text-sm
                text-gray-400
                transition
                hover:text-white
              "
            >
              <ArrowLeft size={16} />
              Voltar para leads
            </button>

            {/* TITLE */}

            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  bg-indigo-600/10
                "
              >
                <UserPlus size={25} className="text-indigo-400" />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-white">
                  Criar novo lead
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  Cadastre um novo contato no CRM
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            FORM CONTAINER

            Centralizado na mesma área do Dashboard
        ================================================= */}

        <div className="mx-auto w-full max-w-5xl">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* =============================================
                DADOS DO LEAD
            ============================================= */}

            <section
              className="
                overflow-hidden
                rounded-2xl
                border
                border-slate-800
                bg-slate-900/80
                shadow-xl
              "
            >
              {/* HEADER */}

              <div className="border-b border-slate-800 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      bg-indigo-600/10
                    "
                  >
                    <User size={19} className="text-indigo-400" />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      Dados do lead
                    </h2>

                    <p className="text-xs text-slate-500">
                      Informações principais do contato
                    </p>
                  </div>
                </div>
              </div>

              {/* BODY */}

              <div className="p-5 sm:p-6">
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {/* =======================================
                      NOME
                  ======================================= */}

                  <div>
                    <FieldLabel icon={User} required>
                      Nome completo
                    </FieldLabel>

                    <input
                      type="text"
                      placeholder="Digite o nome completo"
                      autoComplete="name"
                      {...register('name')}
                      className={inputClass}
                    />

                    <FieldError message={errors.name?.message} />
                  </div>

                  {/* =======================================
                      EMAIL
                  ======================================= */}

                  <div>
                    <FieldLabel icon={Mail} required>
                      Email
                    </FieldLabel>

                    <input
                      type="email"
                      placeholder="exemplo@email.com"
                      autoComplete="email"
                      {...register('email')}
                      className={inputClass}
                    />

                    <FieldError message={errors.email?.message} />
                  </div>

                  {/* =======================================
                      TELEFONE
                  ======================================= */}

                  <div>
                    <FieldLabel icon={Phone} required>
                      Telefone
                    </FieldLabel>

                    <input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      autoComplete="tel"
                      {...register('phone')}
                      className={inputClass}
                    />

                    <FieldError message={errors.phone?.message} />
                  </div>

                  {/* =======================================
                      REGIÃO
                  ======================================= */}

                  <div>
                    <FieldLabel icon={MapPin}>Região de interesse</FieldLabel>

                    <input
                      type="text"
                      placeholder="Ex.: Vila Mariana, Saúde, Paraíso..."
                      {...register('region')}
                      className={inputClass}
                    />

                    <FieldError message={errors.region?.message} />
                  </div>

                  {/* =======================================
                      STATUS
                  ======================================= */}

                  <div>
                    <FieldLabel icon={Tag}>Status inicial</FieldLabel>

                    <select
                      {...register('status')}
                      className={`
                        ${inputClass}
                        cursor-pointer
                      `}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                          className="bg-slate-900"
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <FieldError message={errors.status?.message} />
                  </div>
                </div>
              </div>
            </section>

            {/* =============================================
                DISTRIBUIÇÃO AUTOMÁTICA
            ============================================= */}

            <section
              className="
                overflow-hidden
                rounded-2xl
                border
                border-indigo-500/20
                bg-indigo-500/[0.04]
              "
            >
              <div className="p-5 sm:p-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  {/* INFO */}

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
                        bg-indigo-500/10
                      "
                    >
                      <Shuffle size={21} className="text-indigo-400" />
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
                            border-indigo-500/20
                            bg-indigo-500/10
                            px-2
                            py-0.5
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-wider
                            text-indigo-300
                          "
                        >
                          Round Robin
                        </span>
                      </div>

                      <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
                        O sistema irá encaminhar automaticamente este lead para
                        o próximo corretor elegível da fila de distribuição.
                      </p>
                    </div>
                  </div>

                  {/* STATUS */}

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                      rounded-xl
                      border
                      border-slate-800
                      bg-slate-950/50
                      px-4
                      py-3
                    "
                  >
                    <CheckCircle2 size={18} className="text-emerald-400" />

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

            {/* =============================================
                OBSERVAÇÕES
            ============================================= */}

            <section
              className="
                overflow-hidden
                rounded-2xl
                border
                border-slate-800
                bg-slate-900/80
                shadow-xl
              "
            >
              {/* HEADER */}

              <div className="border-b border-slate-800 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      bg-indigo-600/10
                    "
                  >
                    <FileText size={19} className="text-indigo-400" />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-white">
                      Observações
                    </h2>

                    <p className="text-xs text-slate-500">
                      Informações adicionais sobre o lead
                    </p>
                  </div>
                </div>
              </div>

              {/* BODY */}

              <div className="p-5 sm:p-6">
                <textarea
                  placeholder="Digite aqui informações relevantes sobre o lead..."
                  {...register('notes')}
                  className={textareaClass}
                />

                <FieldError message={errors.notes?.message} />
              </div>
            </section>

            {/* =============================================
                ACTIONS
            ============================================= */}

            <div
              className="
                flex
                flex-col-reverse
                gap-3
                sm:flex-row
                sm:justify-end
              "
            >
              {/* CANCELAR */}

              <button
                type="button"
                onClick={() => navigate('/leads-list')}
                disabled={loading}
                className="
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-slate-800
                  bg-slate-900
                  px-5
                  text-sm
                  font-medium
                  text-slate-300
                  transition
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

              {/* CRIAR */}

              <button
                type="submit"
                disabled={loading}
                className="
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-indigo-600
                  px-6
                  text-sm
                  font-semibold
                  text-white
                  shadow-lg
                  shadow-indigo-600/20
                  transition
                  hover:bg-indigo-500
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

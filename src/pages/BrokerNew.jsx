import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ArrowLeft,
  Save,
  X,
  User,
  Mail,
  Phone,
  Award,
  Building2,
  Shield,
  UserCheck,
  UserX,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  BriefcaseBusiness,
  Clock3,
  FileText,
} from 'lucide-react';

import { toast } from 'react-toastify';

import api from '../service/api';

import { UserContext } from '../context/UserContext';

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const formatPhone = (value = '') => {
  const numbers = value.replace(/\D/g, '').slice(0, 11);

  if (numbers.length <= 2) {
    return numbers;
  }

  if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  }

  if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(
      2,
      6,
    )}-${numbers.slice(6)}`;
  }

  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
};

const normalizeExperience = (value) => {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return 0;
  }

  return Math.min(Math.max(number, 0), 50);
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
  required = false,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
      <div className="mb-6 flex items-start gap-3 border-b border-slate-800 pb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
          <Icon size={20} className="text-blue-400" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">{title}</h2>

            {required && (
              <span className="text-xs text-red-400">* Obrigatório</span>
            )}
          </div>

          {description && (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  required = false,
  disabled = false,
  maxLength,
  min,
  max,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-400">
        {label}

        {required && <span className="ml-1 text-red-400">*</span>}
      </label>

      <input
        type={type}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        min={min}
        max={max}
        className={`mt-2 w-full rounded-xl border bg-slate-800 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60 ${
          error ? 'border-red-500 focus:border-red-500' : 'border-slate-700'
        }`}
      />

      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
          <AlertCircle size={13} />
          {error}
        </p>
      )}
    </div>
  );
}

function TextareaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 4,
  maxLength,
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-slate-400">
          {label}
        </label>

        {maxLength && (
          <span className="text-xs text-slate-600">
            {(value || '').length}/{maxLength}
          </span>
        )}
      </div>

      <textarea
        name={name}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className="mt-2 w-full resize-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
      />
    </div>
  );
}

function PasswordField({
  label,
  name,
  value,
  onChange,
  placeholder,
  showPassword,
  onToggle,
  error,
  required = false,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-400">
        {label}

        {required && <span className="ml-1 text-red-400">*</span>}
      </label>

      <div className="relative mt-2">
        <input
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full rounded-xl border bg-slate-800 px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 ${
            error ? 'border-red-500 focus:border-red-500' : 'border-slate-700'
          }`}
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 transition hover:bg-slate-700 hover:text-white"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
          <AlertCircle size={13} />
          {error}
        </p>
      )}
    </div>
  );
}

function StatusButton({ active, onClick, icon: Icon, title, description }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl border p-4 text-left transition ${
        active
          ? title === 'Ativo'
            ? 'border-emerald-500/30 bg-emerald-500/10 ring-1 ring-emerald-500/20'
            : 'border-red-500/30 bg-red-500/10 ring-1 ring-red-500/20'
          : 'border-slate-700 bg-slate-800 hover:border-slate-600 hover:bg-slate-750'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            active
              ? title === 'Ativo'
                ? 'bg-emerald-500/10'
                : 'bg-red-500/10'
              : 'bg-slate-700'
          }`}
        >
          <Icon
            size={20}
            className={
              active
                ? title === 'Ativo'
                  ? 'text-emerald-400'
                  : 'text-red-400'
                : 'text-slate-500'
            }
          />
        </div>

        <div className="min-w-0">
          <p
            className={`text-sm font-semibold ${
              active
                ? title === 'Ativo'
                  ? 'text-emerald-400'
                  : 'text-red-400'
                : 'text-slate-300'
            }`}
          >
            {title}
          </p>

          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        </div>
      </div>
    </button>
  );
}

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function BrokerNew() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',

    creci: '',
    position: 'Corretor de Imóveis',
    company: '',
    experienceYears: 0,
    bio: '',

    isActive: true,
  });

  const [errors, setErrors] = useState({});

  /*
  |--------------------------------------------------------------------------
  | VALIDATION
  |--------------------------------------------------------------------------
  */

  const validate = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Nome é obrigatório.';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Informe o nome completo.';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'E-mail é obrigatório.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Informe um e-mail válido.';
    }

    if (!formData.phone?.trim()) {
      newErrors.phone = 'Telefone é obrigatório.';
    } else {
      const phoneNumbers = formData.phone.replace(/\D/g, '');

      if (phoneNumbers.length < 10) {
        newErrors.phone = 'Informe um telefone válido.';
      }
    }

    if (!formData.creci?.trim()) {
      newErrors.creci = 'CRECI é obrigatório.';
    }

    if (!formData.password?.trim()) {
      newErrors.password = 'Senha é obrigatória.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'A senha deve ter no mínimo 6 caracteres.';
    }

    if (!formData.confirmPassword?.trim()) {
      newErrors.confirmPassword = 'Confirme a senha.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  /*
  |--------------------------------------------------------------------------
  | HANDLE CHANGE
  |--------------------------------------------------------------------------
  */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let nextValue = type === 'checkbox' ? checked : value;

    if (name === 'phone') {
      nextValue = formatPhone(value);
    }

    if (name === 'experienceYears') {
      nextValue = value === '' ? '' : normalizeExperience(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Revise os campos obrigatórios antes de continuar.');

      return;
    }

    try {
      setSaving(true);

      const phoneNumbers = formData.phone.replace(/\D/g, '');

      /*
       * O backend atual recebe telefone no padrão
       * internacional. Mantemos o valor formatado
       * apenas na interface.
       */
      const normalizedPhone = phoneNumbers ? `+55${phoneNumbers}` : '';

      const payload = {
        name: formData.name.trim(),

        email: formData.email.trim().toLowerCase(),

        password: formData.password.trim(),

        phone: normalizedPhone,

        creci: formData.creci.trim(),

        position: formData.position?.trim() || 'Corretor de Imóveis',

        company: formData.company?.trim() || '',

        bio: formData.bio?.trim() || '',

        experienceYears: Number(formData.experienceYears) || 0,

        isActive: Boolean(formData.isActive),

        role: 'broker',
      };

      const response = await api.post('/api/users/register', payload, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      console.log('Corretor criado:', response.data);

      toast.success('Corretor cadastrado com sucesso!');

      navigate('/brokers');
    } catch (error) {
      console.error('Erro ao cadastrar corretor:', error);

      let errorMessage = 'Erro ao cadastrar corretor.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 409) {
        errorMessage = 'Já existe um usuário com esses dados.';
      }

      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CANCEL
  |--------------------------------------------------------------------------
  */

  const handleCancel = () => {
    if (saving) return;

    navigate('/brokers');
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-6">
      {/* ================================================================
          HEADER
      ================================================================ */}

      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-400 transition hover:border-slate-600 hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              title="Voltar"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-white md:text-2xl">
                  Novo Corretor
                </h1>

                <span className="hidden rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400 sm:inline-flex">
                  Cadastro
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Cadastre um novo corretor na imobiliária.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              <X size={17} />
              Cancelar
            </button>

            <button
              type="submit"
              form="broker-form"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
            >
              {saving ? (
                <RefreshCw size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}

              {saving ? 'Cadastrando...' : 'Cadastrar Corretor'}
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================
          FORM
      ================================================================ */}

      <form id="broker-form" onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* ============================================================
              COLUNA PRINCIPAL
          ============================================================ */}

          <div className="space-y-6 lg:col-span-2">
            {/* ==========================================================
                DADOS PESSOAIS
            ========================================================== */}

            <SectionCard
              icon={User}
              title="Dados Pessoais"
              description="Informações básicas de identificação e contato."
              required
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Nome Completo"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: João da Silva"
                  error={errors.name}
                  required
                />

                <Field
                  label="CRECI"
                  name="creci"
                  value={formData.creci}
                  onChange={handleChange}
                  placeholder="Ex: 123456-F"
                  error={errors.creci}
                  required
                />

                <Field
                  label="E-mail"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="corretor@email.com"
                  error={errors.email}
                  required
                />

                <Field
                  label="Telefone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(11) 99999-9999"
                  error={errors.phone}
                  required
                />
              </div>
            </SectionCard>

            {/* ==========================================================
                DADOS PROFISSIONAIS
            ========================================================== */}

            <SectionCard
              icon={Award}
              title="Dados Profissionais"
              description="Informações profissionais que serão utilizadas no perfil do corretor."
            >
              <div className="grid gap-5 md:grid-cols-2">
                <Field
                  label="Cargo"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  placeholder="Ex: Corretor de Imóveis"
                />

                <Field
                  label="Empresa"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Ex: Union SP"
                />

                <Field
                  label="Anos de Experiência"
                  name="experienceYears"
                  type="number"
                  value={formData.experienceYears}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  max="50"
                />

                <div className="rounded-xl border border-slate-800 bg-slate-800/50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                      <BriefcaseBusiness size={18} className="text-blue-400" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-300">
                        Perfil profissional
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Essas informações poderão ser complementadas
                        posteriormente no cadastro do corretor.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <TextareaField
                  label="Biografia"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Escreva uma breve apresentação profissional do corretor..."
                  rows={5}
                  maxLength={500}
                />
              </div>
            </SectionCard>

            {/* ==========================================================
                ACESSO
            ========================================================== */}

            <SectionCard
              icon={Shield}
              title="Senha de Acesso"
              description="Defina as credenciais que serão utilizadas para acessar o sistema."
              required
            >
              <div className="mb-5 rounded-xl border border-blue-500/10 bg-blue-500/5 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                    <Shield size={18} className="text-blue-400" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-blue-400">
                      Segurança da conta
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      A senha deve possuir no mínimo 6 caracteres. Oriente o
                      corretor a alterá-la após o primeiro acesso.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <PasswordField
                  label="Senha"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mínimo de 6 caracteres"
                  showPassword={showPassword}
                  onToggle={() => setShowPassword((prev) => !prev)}
                  error={errors.password}
                  required
                />

                <PasswordField
                  label="Confirmar Senha"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Digite a senha novamente"
                  showPassword={showPassword}
                  onToggle={() => setShowPassword((prev) => !prev)}
                  error={errors.confirmPassword}
                  required
                />
              </div>
            </SectionCard>

            {/* ==========================================================
                INFORMAÇÕES
            ========================================================== */}

            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                  <FileText size={20} className="text-blue-400" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-blue-400">
                    Sobre o cadastro
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Após o cadastro, o corretor poderá ser gerenciado pelo
                    painel administrativo. Você poderá complementar
                    posteriormente informações como endereço, redes sociais,
                    especialidades, regiões de atuação e configurações
                    comerciais.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================
              COLUNA LATERAL
          ============================================================ */}

          <div className="space-y-6 lg:col-span-1">
            {/* ==========================================================
                STATUS
            ========================================================== */}

            <SectionCard
              icon={UserCheck}
              title="Status"
              description="Defina se o corretor poderá acessar o sistema."
            >
              <div className="space-y-3">
                <StatusButton
                  active={formData.isActive}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: true,
                    }))
                  }
                  icon={UserCheck}
                  title="Ativo"
                  description="Pode acessar o sistema."
                />

                <StatusButton
                  active={!formData.isActive}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      isActive: false,
                    }))
                  }
                  icon={UserX}
                  title="Inativo"
                  description="Acesso bloqueado."
                />
              </div>

              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-800/70 p-4">
                <div className="flex items-center gap-2">
                  {formData.isActive ? (
                    <CheckCircle size={17} className="text-emerald-400" />
                  ) : (
                    <Clock3 size={17} className="text-slate-500" />
                  )}

                  <span className="text-sm text-slate-400">
                    Status inicial:
                  </span>

                  <strong
                    className={
                      formData.isActive ? 'text-emerald-400' : 'text-slate-400'
                    }
                  >
                    {formData.isActive ? 'Ativo' : 'Inativo'}
                  </strong>
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-600">
                  {formData.isActive
                    ? 'O corretor poderá acessar a plataforma após o cadastro.'
                    : 'O corretor será cadastrado, mas permanecerá sem acesso até ser ativado.'}
                </p>
              </div>
            </SectionCard>

            {/* ==========================================================
                RESUMO
            ========================================================== */}

            <SectionCard
              icon={AlertCircle}
              title="Resumo"
              description="Confira os principais dados antes de cadastrar."
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm text-slate-600">Nome</span>

                  <span className="max-w-[180px] truncate text-right text-sm font-medium text-slate-300">
                    {formData.name || '—'}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm text-slate-600">CRECI</span>

                  <span className="text-right text-sm font-medium text-slate-300">
                    {formData.creci || '—'}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm text-slate-600">E-mail</span>

                  <span className="max-w-[180px] truncate text-right text-sm font-medium text-slate-300">
                    {formData.email || '—'}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm text-slate-600">Telefone</span>

                  <span className="text-right text-sm font-medium text-slate-300">
                    {formData.phone || '—'}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm text-slate-600">Cargo</span>

                  <span className="max-w-[180px] truncate text-right text-sm font-medium text-slate-300">
                    {formData.position || '—'}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm text-slate-600">Empresa</span>

                  <span className="max-w-[180px] truncate text-right text-sm font-medium text-slate-300">
                    {formData.company || '—'}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm text-slate-600">Experiência</span>

                  <span className="text-right text-sm font-medium text-slate-300">
                    {formData.experienceYears || 0}{' '}
                    {Number(formData.experienceYears) === 1 ? 'ano' : 'anos'}
                  </span>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-800 pt-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      formData.isActive ? 'bg-emerald-400' : 'bg-slate-600'
                    }`}
                  />

                  <span className="text-xs text-slate-500">
                    {formData.isActive
                      ? 'Corretor será cadastrado como ativo'
                      : 'Corretor será cadastrado como inativo'}
                  </span>
                </div>
              </div>
            </SectionCard>

            {/* ==========================================================
                PERFIL
            ========================================================== */}

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800">
                  <Building2 size={20} className="text-slate-400" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Perfil do Corretor
                  </h3>

                  <p className="mt-0.5 text-xs text-slate-600">
                    Tipo de usuário
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                    <User size={20} className="text-blue-400" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      Corretor de Imóveis
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Usuário com acesso ao ambiente comercial.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ==========================================================
                DICA
            ========================================================== */}

            <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/5 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
                  <CheckCircle size={18} className="text-emerald-400" />
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-emerald-400">
                    Pronto para cadastrar
                  </h4>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Preencha os campos obrigatórios e clique em “Cadastrar
                    Corretor”.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

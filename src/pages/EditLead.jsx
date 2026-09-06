// src/pages/EditLead.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  ArrowLeft,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Star,
  Clock,
  MessageCircle,
  TrendingUp,
  CheckCircle,
  XCircle,
  Archive,
  AlertCircle,
  Building2,
  Calendar,
  FileText,
  Tag,
  Users,
  Loader2,
} from 'lucide-react';

import { toast } from 'react-toastify';

import { getLeadById, updateLead } from '../service/leadApi';
import api from '../service/api';

// Constantes para status - ALINHADAS COM O BACKEND
const LEAD_STATUS = {
  NOVO: 'novo',
  CONTATADO: 'contatado',
  EM_NEGOCIACAO: 'em_negociacao',
  CONVERTIDO: 'convertido',
  PERDIDO: 'perdido',
  ARQUIVADO: 'arquivado',
};

const STATUS_LABELS = {
  [LEAD_STATUS.NOVO]: 'Novo',
  [LEAD_STATUS.CONTATADO]: 'Contatado',
  [LEAD_STATUS.EM_NEGOCIACAO]: 'Em Negociação',
  [LEAD_STATUS.CONVERTIDO]: 'Convertido',
  [LEAD_STATUS.PERDIDO]: 'Perdido',
  [LEAD_STATUS.ARQUIVADO]: 'Arquivado',
};

const STATUS_COLORS = {
  [LEAD_STATUS.NOVO]: 'blue',
  [LEAD_STATUS.CONTATADO]: 'purple',
  [LEAD_STATUS.EM_NEGOCIACAO]: 'yellow',
  [LEAD_STATUS.CONVERTIDO]: 'green',
  [LEAD_STATUS.PERDIDO]: 'red',
  [LEAD_STATUS.ARQUIVADO]: 'gray',
};

const STATUS_ICONS = {
  [LEAD_STATUS.NOVO]: Clock,
  [LEAD_STATUS.CONTATADO]: MessageCircle,
  [LEAD_STATUS.EM_NEGOCIACAO]: TrendingUp,
  [LEAD_STATUS.CONVERTIDO]: CheckCircle,
  [LEAD_STATUS.PERDIDO]: XCircle,
  [LEAD_STATUS.ARQUIVADO]: Archive,
};

const PRIORITY_LABELS = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
};

const PRIORITY_COLORS = {
  baixa: 'gray',
  media: 'yellow',
  alta: 'orange',
  urgente: 'red',
};

const REGIONS = [
  'central',
  'zona norte',
  'zona sul',
  'zona leste',
  'zona oeste',
  'abc',
];

const SOURCES = [
  'manual',
  'public',
  'meta',
  'olx',
  'zap',
  'csv',
  'site',
  'hotsite',
  'portal',
  'referral',
];

export default function EditLead() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lead, setLead] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    region: '',
    status: '',
    priority: 'media',
    notes: '',
    source: 'manual',
    property: '',
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [backendErrors, setBackendErrors] = useState([]);
  const [properties, setProperties] = useState([]);
  const [propertiesLoading, setPropertiesLoading] = useState(false);

  /*
  ======================================
  CARREGAR LEAD
  ======================================
  */

  useEffect(() => {
    loadLead();
    loadProperties();
  }, [id]);

  const loadLead = async () => {
    try {
      setLoading(true);
      const data = await getLeadById(id);
      setLead(data);

      // Preencher formulário
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        region: data.region || '',
        status: data.status || LEAD_STATUS.NOVO,
        priority: data.priority || 'media',
        notes: data.notes || '',
        source: data.source || 'manual',
        property: data.property?._id || data.property || '',
      });

      console.log('📋 Lead carregado:', data);
    } catch (error) {
      console.error('❌ Erro ao carregar lead:', error);
      toast.error('Erro ao carregar dados do lead');

      if (error.response?.status === 404) {
        toast.error('Lead não encontrado');
        navigate('/leads');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadProperties = async () => {
    try {
      setPropertiesLoading(true);
      const response = await api.get('/api/properties', {
        params: {
          status: 'disponivel',
          active: true,
          limit: 100,
        },
      });

      const propertiesData =
        response.data?.data?.properties ||
        response.data?.properties ||
        response.data?.data ||
        [];
      setProperties(propertiesData);
      console.log('🏠 Propriedades carregadas:', propertiesData.length);
    } catch (error) {
      console.error('Erro ao carregar propriedades:', error);
    } finally {
      setPropertiesLoading(false);
    }
  };

  /*
  ======================================
  HANDLE CHANGE
  ======================================
  */

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Limpar erro do campo
    setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    setBackendErrors([]);
  };

  /*
  ======================================
  VALIDAÇÃO
  ======================================
  */

  const validateForm = () => {
    const errors = {};

    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Nome é obrigatório';
    }

    if (!formData.email || formData.email.trim() === '') {
      errors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'E-mail inválido';
    }

    if (!formData.phone || formData.phone.trim() === '') {
      errors.phone = 'Telefone é obrigatório';
    }

    if (!formData.region) {
      errors.region = 'Região é obrigatória';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /*
  ======================================
  SUBMIT
  ======================================
  */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = document.querySelector('[data-error]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    try {
      setSaving(true);
      setBackendErrors([]);

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        region: formData.region,
        status: formData.status,
        priority: formData.priority,
        notes: formData.notes?.trim() || '',
        source: formData.source,
        property: formData.property || null,
      };

      console.log('📤 Atualizando lead:', payload);

      const updated = await updateLead(id, payload);
      console.log('✅ Lead atualizado:', updated);

      toast.success('Lead atualizado com sucesso!');
      navigate(`/lead-detail/${id}`);
    } catch (error) {
      console.error('❌ Erro ao atualizar lead:', error);

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Array.isArray(errors)
          ? errors.map((e) => e.message || e.msg || JSON.stringify(e))
          : [error.response.data.message || 'Erro ao atualizar lead'];
        setBackendErrors(errorMessages);
      } else if (error.response?.data?.message) {
        setBackendErrors([error.response.data.message]);
      } else {
        setBackendErrors(['Erro ao atualizar lead. Tente novamente.']);
      }
    } finally {
      setSaving(false);
    }
  };

  /*
  ======================================
  LOADING
  ======================================
  */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <p className="text-slate-400">Carregando dados do lead...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-red-400" />
          <h2 className="mt-4 text-2xl font-bold text-white">
            Lead não encontrado
          </h2>
          <p className="mt-2 text-slate-400">
            O lead que você está tentando editar não existe.
          </p>
          <button
            onClick={() => navigate('/leads')}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500"
          >
            Voltar para lista
          </button>
        </div>
      </div>
    );
  }

  const StatusIcon = STATUS_ICONS[formData.status] || AlertCircle;

  /*
  ======================================
  RENDER
  ======================================
  */

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/lead-detail/${id}`)}
              className="rounded-xl border border-slate-700 bg-slate-900 p-3 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <ArrowLeft size={20} />
            </button>

            <div>
              <h1 className="text-2xl font-bold text-white">Editar Lead</h1>
              <p className="text-sm text-slate-400">
                Atualize as informações do lead
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-900 px-4 py-2">
              <span className={`inline-flex items-center gap-2 text-sm`}>
                <StatusIcon
                  size={16}
                  className={`text-${STATUS_COLORS[formData.status]}-400`}
                />
                <span className="text-slate-300">
                  Status:{' '}
                  <span
                    className={`text-${STATUS_COLORS[formData.status]}-400 font-medium`}
                  >
                    {STATUS_LABELS[formData.status]}
                  </span>
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* ERROS DO BACKEND */}
        {backendErrors.length > 0 && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
            <h4 className="mb-2 font-semibold text-red-400">
              Erros de validação:
            </h4>
            <ul className="list-inside list-disc space-y-1 text-sm text-red-400">
              {backendErrors.map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* FORMULÁRIO */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* DADOS BÁSICOS */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-6 flex items-center gap-3 text-lg font-semibold text-white">
              <User size={20} className="text-blue-400" />
              Dados do Lead
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Nome *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full rounded-xl border ${validationErrors.name ? 'border-red-500' : 'border-slate-700'} bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-500`}
                  placeholder="Nome completo"
                />
                {validationErrors.name && (
                  <p className="mt-1 text-sm text-red-400" data-error>
                    {validationErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  E-mail *
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full rounded-xl border ${validationErrors.email ? 'border-red-500' : 'border-slate-700'} bg-slate-800 pl-11 pr-4 py-3 text-white outline-none transition focus:border-blue-500`}
                    placeholder="email@exemplo.com"
                  />
                </div>
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-red-400" data-error>
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Telefone *
                </label>
                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full rounded-xl border ${validationErrors.phone ? 'border-red-500' : 'border-slate-700'} bg-slate-800 pl-11 pr-4 py-3 text-white outline-none transition focus:border-blue-500`}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                {validationErrors.phone && (
                  <p className="mt-1 text-sm text-red-400" data-error>
                    {validationErrors.phone}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Região *
                </label>
                <div className="relative">
                  <MapPin
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className={`w-full rounded-xl border ${validationErrors.region ? 'border-red-500' : 'border-slate-700'} bg-slate-800 pl-11 pr-4 py-3 text-white outline-none transition focus:border-blue-500`}
                  >
                    <option value="">Selecione</option>
                    {REGIONS.map((region) => (
                      <option key={region} value={region}>
                        {region.charAt(0).toUpperCase() + region.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                {validationErrors.region && (
                  <p className="mt-1 text-sm text-red-400" data-error>
                    {validationErrors.region}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* STATUS E PRIORIDADE */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-6 flex items-center gap-3 text-lg font-semibold text-white">
              <Clock size={20} className="text-purple-400" />
              Status e Prioridade
            </h2>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                >
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Prioridade
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                >
                  {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* STATUS BADGE */}
            <div className="mt-6 rounded-xl border border-slate-700 bg-slate-800 p-4">
              <div className="flex items-center gap-3">
                <StatusIcon
                  size={20}
                  className={`text-${STATUS_COLORS[formData.status]}-400`}
                />
                <div>
                  <p className="text-sm font-medium text-white">
                    Status atual:{' '}
                    <span
                      className={`text-${STATUS_COLORS[formData.status]}-400`}
                    >
                      {STATUS_LABELS[formData.status]}
                    </span>
                  </p>
                  <p className="text-xs text-slate-400">
                    O status define o estágio do lead no pipeline de vendas
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* IMÓVEL */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-6 flex items-center gap-3 text-lg font-semibold text-white">
              <Building2 size={20} className="text-emerald-400" />
              Imóvel de Interesse
            </h2>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Imóvel
              </label>
              <select
                name="property"
                value={formData.property}
                onChange={handleChange}
                disabled={propertiesLoading}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-500 disabled:opacity-50"
              >
                <option value="">Nenhum imóvel selecionado</option>
                {properties.map((property) => (
                  <option key={property._id} value={property._id}>
                    {property.name} {property.code ? `(${property.code})` : ''}
                  </option>
                ))}
              </select>
              {propertiesLoading && (
                <p className="mt-1 text-xs text-slate-400">
                  Carregando imóveis...
                </p>
              )}
              <p className="mt-2 text-xs text-slate-400">
                Selecione um imóvel que esteja relacionado a este lead
              </p>
            </div>
          </div>

          {/* OBSERVAÇÕES */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-6 flex items-center gap-3 text-lg font-semibold text-white">
              <FileText size={20} className="text-amber-400" />
              Observações
            </h2>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Notas
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-500 resize-none"
                placeholder="Adicione observações sobre este lead..."
              />
              <p className="mt-1 text-xs text-slate-400">
                Informações adicionais sobre o lead e seu interesse
              </p>
            </div>
          </div>

          {/* ORIGEM */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-6 flex items-center gap-3 text-lg font-semibold text-white">
              <Tag size={20} className="text-cyan-400" />
              Origem
            </h2>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Fonte
              </label>
              <select
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-500"
              >
                {SOURCES.map((source) => (
                  <option key={source} value={source}>
                    {source.charAt(0).toUpperCase() + source.slice(1)}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-slate-400">
                Como este lead foi captado? (Site, Redes Sociais, CSV, etc.)
              </p>
            </div>
          </div>

          {/* BOTÕES */}
          <div className="sticky bottom-4 z-40 rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-white">
                  Pronto para salvar?
                </h3>
                <p className="text-sm text-slate-400">
                  Revise todas as informações antes de salvar as alterações.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => navigate(`/lead-detail/${id}`)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-6 py-2.5 font-medium text-slate-300 transition hover:bg-slate-700"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
                >
                  <Save size={18} />
                  {saving ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

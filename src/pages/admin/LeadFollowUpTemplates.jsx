import { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Navigate, useNavigate } from 'react-router-dom';

import { toast } from 'react-toastify';

import {
  FiSave,
  FiRefreshCw,
  FiMessageCircle,
  FiClock,
  FiInfo,
  FiCheckCircle,
  FiArrowLeft,
  FiAlertTriangle,
  FiX,
} from 'react-icons/fi';

import { UserContext } from '../../context/UserContext';

import api from '../../service/api';

const DEFAULT_TEMPLATES = [
  {
    step: 'D0',

    label: 'D0 · Primeiro contato',

    message:
      'Olá, {nome}! Recebemos seu interesse{referencia_imovel} e estamos à disposição para ajudar. Você ainda está procurando um imóvel?',
  },

  {
    step: 'D1',

    label: 'D1 · Após 1 dia',

    message:
      'Olá, {nome}! Passando para saber se você conseguiu avançar na busca{referencia_imovel}. Posso ajudar com as opções disponíveis?',
  },

  {
    step: 'D3',

    label: 'D3 · Após 3 dias',

    message:
      'Olá, {nome}! Gostaria de saber se ainda podemos ajudar na sua busca{referencia_imovel}. Se suas preferências mudaram, podemos considerar isso também.',
  },

  {
    step: 'D5',

    label: 'D5 · Após 5 dias',

    message:
      'Olá, {nome}! Continuo à disposição para ajudar você a encontrar um imóvel que faça sentido para suas necessidades. Podemos conversar?',
  },

  {
    step: 'D7',

    label: 'D7 · Após 7 dias',

    message:
      'Olá, {nome}! Ainda podemos ajudar na sua busca por um imóvel. Se quiser continuar, basta responder a esta mensagem.',
  },

  {
    step: 'D10',

    label: 'D10 · Último contato',

    message:
      'Olá, {nome}! Este é nosso último contato automático por enquanto. Se ainda estiver procurando um imóvel, pode responder por aqui que teremos prazer em ajudar.',
  },
];

const VARIABLES = [
  ['{nome}', 'Primeiro nome'],

  ['{nome_completo}', 'Nome completo'],

  ['{imovel}', 'Nome do imóvel'],

  ['{codigo_imovel}', 'Código do imóvel'],

  ['{bairro}', 'Bairro'],

  ['{cidade}', 'Cidade'],

  ['{referencia_imovel}', 'Referência automática do imóvel'],
];

const makePreview = (message) =>
  String(message || '')
    .replaceAll('{nome}', 'Mariana')

    .replaceAll('{nome_completo}', 'Mariana Oliveira')

    .replaceAll('{imovel}', 'Apartamento com varanda')

    .replaceAll('{codigo_imovel}', 'NV-000123')

    .replaceAll('{bairro}', 'Vila Mariana')

    .replaceAll('{cidade}', 'São Paulo')

    .replaceAll(
      '{referencia_imovel}',

      ' sobre o imóvel Apartamento com varanda, no bairro Vila Mariana, em São Paulo',
    )

    .replace(/[ \t]{2,}/g, ' ');

export default function LeadFollowUpTemplates() {
  const { user } = useContext(UserContext);

  const navigate = useNavigate();

  const isAdmin = user?.isAdmin === true || user?.role === 'admin';

  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [applying, setApplying] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const [selectedStep, setSelectedStep] = useState('D0');

  const [updatedAt, setUpdatedAt] = useState(null);

  const selectedTemplate = useMemo(
    () => templates.find((item) => item.step === selectedStep) || templates[0],

    [templates, selectedStep],
  );

  const loadTemplates = useCallback(async () => {
    setLoading(true);

    try {
      const { data } = await api.get('/api/lead-follow-up-templates');

      if (Array.isArray(data?.templates) && data.templates.length) {
        setTemplates(data.templates);
      }

      setUpdatedAt(data?.updatedAt || null);
    } catch (error) {
      console.error('[CentralFollowUps] Erro ao carregar mensagens:', error);

      toast.error(
        error?.response?.data?.message ||
          'Não foi possível carregar as mensagens.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) loadTemplates();
  }, [isAdmin, loadTemplates]);

  useEffect(() => {
    if (!isApplyModalOpen || applying) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsApplyModalOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isApplyModalOpen, applying]);

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const updateMessage = (step, message) => {
    setTemplates((current) =>
      current.map((item) => (item.step === step ? { ...item, message } : item)),
    );
  };

  const insertVariable = (variable) => {
    if (!selectedTemplate) return;

    updateMessage(
      selectedTemplate.step,

      `${selectedTemplate.message || ''}${variable}`,
    );
  };

  const handleSave = async () => {
    if (templates.some((item) => !String(item.message || '').trim())) {
      toast.error('Todas as mensagens precisam ter algum conteúdo.');

      return;
    }

    setSaving(true);

    try {
      const { data } = await api.put('/api/lead-follow-up-templates', {
        templates,
      });

      if (Array.isArray(data?.templates)) setTemplates(data.templates);

      setUpdatedAt(data?.updatedAt || new Date().toISOString());

      toast.success('Mensagens salvas com sucesso!');
    } catch (error) {
      console.error('[CentralFollowUps] Erro ao salvar mensagens:', error);

      toast.error(
        error?.response?.data?.message ||
          'Não foi possível salvar as mensagens.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleApplyPending = () => {
    if (saving || applying) return;
    setIsApplyModalOpen(true);
  };

  const confirmApplyPending = async () => {
    if (applying || saving) return;

    setApplying(true);
    try {
      const { data } = await api.post(
        '/api/lead-follow-up-templates/apply-pending',
      );

      toast.success(
        `Atualização concluída: ${data?.updated ?? 0} mensagem(ns) pendente(s) atualizada(s).`,
      );
      setIsApplyModalOpen(false);
    } catch (error) {
      console.error(
        '[CentralFollowUps] Erro ao aplicar mensagens pendentes:',
        error,
      );
      toast.error(
        error?.response?.data?.message ||
          'Não foi possível atualizar os follow-ups pendentes.',
      );
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-950 text-sm text-slate-400">
        <span className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />
        Carregando mensagens de follow-up...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050914] px-4 py-6 text-slate-100 md:px-8 md:py-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-blue-500/[0.10] blur-[130px]" />

        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/[0.08] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl space-y-6">
        <header className="relative flex flex-col gap-5 overflow-hidden rounded-3xl border border-slate-800/90 bg-gradient-to-br from-slate-900 via-slate-950 to-[#080d1b] p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:flex-row md:items-center md:justify-between md:p-8">
          <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />

          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-300">
              <FiMessageCircle /> ADMINISTRAÇÃO · AUTOMAÇÃO WHATSAPP
            </div>

            <h1 className="text-2xl font-bold md:text-3xl">
              Central de Follow-ups
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              Edite as mensagens automáticas enviadas ao longo da sequência. As
              alterações ficam salvas no MongoDB.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"

              onClick={() => navigate(-1)}

              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-700/40"
            >
              <FiArrowLeft size={17} /> Voltar
            </button>

            <button
              type="button"

              onClick={handleSave}

              disabled={saving}

              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/40 transition hover:-translate-y-0.5 hover:from-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiSave /> {saving ? 'Salvando...' : 'Salvar mensagens'}
            </button>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-slate-800/90 bg-gradient-to-br from-slate-900/95 to-slate-950/90 p-3 shadow-[0_18px_55px_rgba(0,0,0,0.22)] backdrop-blur-xl">
            <div className="px-3 pb-3 pt-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              Sequência atual
            </div>

            <div className="space-y-1">
              {templates.map((item) => (
                <button
                  key={item.step}

                  onClick={() => setSelectedStep(item.step)}

                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${selectedStep === item.step ? 'bg-blue-500/10 text-blue-300 ring-1 ring-blue-500/30' : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'}`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${selectedStep === item.step ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/30' : 'bg-slate-800 text-slate-400'}`}
                  >
                    {item.step}
                  </span>

                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">
                      {item.label.split(' · ')[1] || item.label}
                    </span>

                    <span className="mt-0.5 block text-xs text-slate-500">
                      {item.step === 'D0'
                        ? '5 minutos após agendar'
                        : item.step === 'D1'
                          ? 'Após 1 dia'
                          : `Após ${item.step.slice(1)} dias`}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.07] p-3 text-xs leading-5 text-amber-300">
              <FiInfo className="mr-1 inline" /> A sequência mantém os prazos já
              configurados. Esta tela altera o conteúdo das mensagens.
            </div>
          </aside>

          <section className="space-y-6">
            <div className="rounded-2xl border border-slate-800/90 bg-gradient-to-br from-slate-900/95 to-slate-950/90 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.22)] backdrop-blur-xl md:p-7">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-blue-400">
                    Mensagem {selectedTemplate?.step}
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-white">
                    {selectedTemplate?.label}
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Personalize o texto abaixo. Os campos entre chaves serão
                    substituídos automaticamente.
                  </p>
                </div>

                <span className="hidden rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 sm:inline-flex sm:items-center sm:gap-1">
                  <FiCheckCircle /> Editável
                </span>
              </div>

              <label
                htmlFor="follow-up-message"

                className="mb-2 block text-sm font-semibold text-slate-200"
              >
                Conteúdo da mensagem
              </label>

              <textarea
                id="follow-up-message"

                value={selectedTemplate?.message || ''}

                onChange={(event) =>
                  updateMessage(selectedTemplate.step, event.target.value)
                }

                maxLength={2000}

                rows={7}

                className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950/70 p-4 text-sm leading-6 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-500/70 focus:ring-4 focus:ring-blue-500/10"

                placeholder="Digite o texto que será enviado ao lead..."
              />

              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Use as variáveis abaixo para personalizar a conversa.
                </span>

                <span>{selectedTemplate?.message?.length || 0}/2000</span>
              </div>

              <div className="mt-6">
                <p className="mb-3 text-sm font-semibold text-slate-200">
                  Inserir variável
                </p>

                <div className="flex flex-wrap gap-2">
                  {VARIABLES.map(([variable, label]) => (
                    <button
                      key={variable}

                      type="button"

                      onClick={() => insertVariable(variable)}

                      title={label}

                      className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-300 transition hover:border-blue-400/40 hover:bg-blue-500/20"
                    >
                      {variable}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800/90 bg-gradient-to-br from-slate-900/95 to-slate-950/90 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.22)] backdrop-blur-xl md:p-7">
              <div className="mb-4 flex items-center gap-2">
                <FiMessageCircle className="text-emerald-400" />

                <h3 className="font-bold text-white">Prévia da mensagem</h3>

                <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Exemplo
                </span>
              </div>

              <div className="max-w-2xl rounded-2xl rounded-tl-sm border border-emerald-500/20 bg-emerald-950/50 p-4 text-sm leading-6 text-slate-100 shadow-sm">
                {makePreview(selectedTemplate?.message)}

                <div className="mt-2 text-right text-[10px] text-slate-500">
                  Prévia ilustrativa · WhatsApp
                </div>
              </div>

              <p className="mt-4 text-xs leading-5 text-slate-400">
                Se o lead não estiver associado a um imóvel, a variável{' '}
                <code className="rounded bg-slate-800 px-1 py-0.5 text-slate-200">
                  {'{referencia_imovel}'}
                </code>{' '}
                ficará vazia. Os outros campos do imóvel também ficam vazios
                quando não houver dados.
              </p>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-slate-800/90 bg-gradient-to-br from-slate-900/95 to-slate-950/90 p-5 shadow-[0_18px_55px_rgba(0,0,0,0.22)] backdrop-blur-xl md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 font-bold text-white">
                  <FiRefreshCw className="text-blue-400" /> Aplicar alterações
                  às mensagens pendentes
                </div>

                <p className="mt-1 text-sm leading-5 text-slate-400">
                  Opcional: depois de salvar, atualize as mensagens ainda
                  pendentes. Mensagens enviadas ou canceladas não serão
                  alteradas.
                </p>
              </div>

              <button
                type="button"

                onClick={handleApplyPending}

                disabled={applying || saving}

                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 disabled:opacity-60"
              >
                <FiRefreshCw className={applying ? 'animate-spin' : ''} />{' '}
                {applying ? 'Aplicando...' : 'Atualizar pendentes'}
              </button>
            </div>

            <div className="flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <span className="inline-flex items-center gap-1">
                <FiClock /> Prazos mantidos: D0 (5 min), D1, D3, D5, D7 e D10.
              </span>

              <span>
                {updatedAt
                  ? `Última atualização: ${new Date(updatedAt).toLocaleString('pt-BR')}`
                  : 'Ainda não há data de atualização registrada.'}
              </span>
            </div>
          </section>
        </div>
      </div>

      {isApplyModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !applying) {
              setIsApplyModalOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="apply-pending-title"
            aria-describedby="apply-pending-description"
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-700/80 bg-gradient-to-br from-slate-900 via-slate-950 to-[#080d1b] shadow-[0_30px_100px_rgba(0,0,0,0.65)]"
          >
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />
            <div className="p-6 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-300">
                  <FiAlertTriangle size={23} />
                </div>
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  disabled={applying}
                  aria-label="Fechar confirmação"
                  className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-slate-700/60 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FiX size={20} />
                </button>
              </div>

              <h2
                id="apply-pending-title"
                className="mt-5 text-xl font-bold tracking-tight text-white sm:text-2xl"
              >
                Atualizar follow-ups pendentes?
              </h2>
              <p
                id="apply-pending-description"
                className="mt-3 text-sm leading-6 text-slate-300"
              >
                O texto salvo dos modelos será aplicado às mensagens que ainda
                estão pendentes na fila. Essa ação não altera mensagens já
                enviadas, canceladas ou em processamento.
              </p>

              <div className="mt-5 flex gap-3 rounded-2xl border border-amber-400/15 bg-amber-400/[0.06] p-4">
                <FiInfo className="mt-0.5 shrink-0 text-amber-300" size={18} />
                <p className="text-xs leading-5 text-slate-300">
                  Confira se você já salvou as mensagens desejadas antes de
                  confirmar. A alteração será aplicada aos follow-ups pendentes
                  existentes.
                </p>
              </div>

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  disabled={applying}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-700/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmApplyPending}
                  disabled={applying || saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/40 transition hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-4 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiRefreshCw
                    size={16}
                    className={applying ? 'animate-spin' : ''}
                  />
                  {applying
                    ? 'Atualizando pendentes...'
                    : 'Sim, atualizar mensagens'}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

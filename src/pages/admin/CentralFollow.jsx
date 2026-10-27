import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiArrowLeft,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiCopy,
  FiInfo,
  FiMessageCircle,
  FiPause,
  FiPlus,
  FiRefreshCw,
  FiSave,
  FiShield,
  FiTrash2,
  FiZap,
} from 'react-icons/fi';
import { UserContext } from '../../context/UserContext';
import api from '../../service/api';

const TIMEZONE = 'America/Sao_Paulo';
const STEPS = [
  {
    step: 'D0',
    label: 'Primeiro contato',
    timing: 'Após a entrada do lead',
    delayMinutes: 5,
    time: '09:00',
    enabled: true,
    message:
      'Olá, {nome}! Recebemos seu interesse{referencia_imovel} e estamos à disposição para ajudar. Você ainda está procurando um imóvel?',
  },
  {
    step: 'D1',
    label: 'Retomada leve',
    timing: '1 dia depois',
    delayMinutes: 1440,
    time: '09:00',
    enabled: true,
    message:
      'Olá, {nome}! Passando para saber se você conseguiu avançar na busca{referencia_imovel}. Posso ajudar com as opções disponíveis?',
  },
  {
    step: 'D3',
    label: 'Acompanhamento',
    timing: '3 dias depois',
    delayMinutes: 4320,
    time: '10:30',
    enabled: true,
    message:
      'Olá, {nome}! Gostaria de saber se ainda podemos ajudar na sua busca{referencia_imovel}. Se suas preferências mudaram, podemos considerar isso também.',
  },
  {
    step: 'D5',
    label: 'Ajuda contextual',
    timing: '5 dias depois',
    delayMinutes: 7200,
    time: '14:00',
    enabled: true,
    message:
      'Olá, {nome}! Continuo à disposição para ajudar você a encontrar um imóvel que faça sentido para suas necessidades. Podemos conversar?',
  },
  {
    step: 'D7',
    label: 'Última tentativa leve',
    timing: '7 dias depois',
    delayMinutes: 10080,
    time: '15:00',
    enabled: true,
    message:
      'Olá, {nome}! Ainda podemos ajudar na sua busca por um imóvel. Se quiser continuar, basta responder a esta mensagem.',
  },
  {
    step: 'D10',
    label: 'Encerramento da sequência',
    timing: '10 dias depois',
    delayMinutes: 14400,
    time: '16:30',
    enabled: true,
    message:
      'Olá, {nome}! Este é nosso último contato automático por enquanto. Se ainda estiver procurando um imóvel, pode responder por aqui que teremos prazer em ajudar.',
  },
];
const DEFAULT_CONFIG = {
  enabled: true,
  timezone: TIMEZONE,
  windowStart: '09:00',
  windowEnd: '18:00',
  allowWeekends: true,
  steps: STEPS,
};
const VARIABLES = [
  ['{nome}', 'Primeiro nome'],
  ['{nome_completo}', 'Nome completo'],
  ['{imovel}', 'Nome do imóvel'],
  ['{codigo_imovel}', 'Código do imóvel'],
  ['{bairro}', 'Bairro'],
  ['{cidade}', 'Cidade'],
  ['{referencia_imovel}', 'Referência do imóvel'],
];
const newClientId = () =>
  `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function normalizeConfig(data) {
  const raw = data?.config || data?.automation || data || {};
  const incomingSteps = Array.isArray(raw.steps) ? raw.steps : [];
  return {
    ...DEFAULT_CONFIG,
    ...raw,
    timezone: TIMEZONE,
    steps: STEPS.map((fallback) => ({
      ...fallback,
      ...(incomingSteps.find((item) => item.step === fallback.step) || {}),
    })),
  };
}

function normalizeTemplates(items) {
  return STEPS.map((fallback) => {
    const saved =
      (Array.isArray(items) ? items : []).find(
        (item) => item.step === fallback.step,
      ) || {};
    const variations =
      Array.isArray(saved.variations) && saved.variations.length
        ? saved.variations.map((item) => ({
            ...item,
            message: item.message || '',
            enabled: item.enabled !== false,
            clientId: item._id || newClientId(),
          }))
        : [
            {
              message: saved.message || fallback.message,
              enabled: true,
              clientId: newClientId(),
            },
          ];
    return {
      ...fallback,
      ...saved,
      enabled: saved.enabled !== false,
      message: saved.message || fallback.message,
      variations,
    };
  });
}

function renderPreview(message) {
  return String(message || '')
    .replaceAll('{nome}', 'Mariana')
    .replaceAll('{nome_completo}', 'Mariana Oliveira')
    .replaceAll('{imovel}', 'Apartamento com varanda')
    .replaceAll('{codigo_imovel}', 'ND-00123')
    .replaceAll('{bairro}', 'Vila Mariana')
    .replaceAll('{cidade}', 'São Paulo')
    .replaceAll(
      '{referencia_imovel}',
      ' sobre o imóvel Apartamento com varanda, no bairro Vila Mariana, em São Paulo',
    )
    .replace(/[ \t]{2,}/g, ' ');
}

export default function CentralFollow() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const isAdmin = user?.isAdmin === true || user?.role === 'admin';
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [templates, setTemplates] = useState(() => normalizeTemplates(STEPS));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [selectedStep, setSelectedStep] = useState('D0');
  const [selectedVariationId, setSelectedVariationId] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [usageByVariation, setUsageByVariation] = useState({});
  const [showVariables, setShowVariables] = useState(false);
  const [applyModal, setApplyModal] = useState(false);
  const [automationApiAvailable, setAutomationApiAvailable] = useState(true);

  const selectedConfigStep = useMemo(
    () =>
      config.steps.find((item) => item.step === selectedStep) ||
      config.steps[0],
    [config.steps, selectedStep],
  );
  const selectedTemplate = useMemo(
    () => templates.find((item) => item.step === selectedStep) || templates[0],
    [templates, selectedStep],
  );
  const selectedVariation = useMemo(
    () =>
      selectedTemplate?.variations?.find(
        (item) => item.clientId === selectedVariationId,
      ) || selectedTemplate?.variations?.[0],
    [selectedTemplate, selectedVariationId],
  );
  const enabledStepsCount = config.steps.filter((item) => item.enabled).length;
  const activeVariationCount = templates.reduce(
    (sum, item) =>
      sum +
      (item.enabled
        ? item.variations.filter(
            (variation) => variation.enabled && variation.message.trim(),
          ).length
        : 0),
    0,
  );
  const preview = renderPreview(
    selectedVariation?.message || selectedConfigStep?.message,
  );

  const loadAll = useCallback(async () => {
    setLoading(true);
    const results = await Promise.allSettled([
      api.get('/api/lead-follow-up-automation'),
      api.get('/api/lead-follow-up-templates'),
      api.get('/api/lead-follow-up-templates/usage'),
    ]);
    const [automationResult, templatesResult, usageResult] = results;
    if (automationResult.status === 'fulfilled') {
      setConfig(normalizeConfig(automationResult.value.data));
      setUpdatedAt(
        automationResult.value.data?.updatedAt ||
          automationResult.value.data?.config?.updatedAt ||
          null,
      );
      setAutomationApiAvailable(true);
    } else {
      const status = automationResult.reason?.response?.status;
      setAutomationApiAvailable(status !== 404);
      if (status !== 404)
        toast.error(
          automationResult.reason?.response?.data?.message ||
            'Não foi possível carregar as regras de automação.',
        );
      setConfig(DEFAULT_CONFIG);
    }
    if (templatesResult.status === 'fulfilled') {
      const items = templatesResult.value.data?.templates;
      if (Array.isArray(items) && items.length)
        setTemplates(normalizeTemplates(items));
      setUpdatedAt(
        (current) => templatesResult.value.data?.updatedAt || current,
      );
    } else {
      toast.error(
        templatesResult.reason?.response?.data?.message ||
          'Não foi possível carregar as mensagens.',
      );
    }
    if (usageResult.status === 'fulfilled') {
      const usage = Array.isArray(usageResult.value.data?.usage)
        ? usageResult.value.data.usage
        : [];
      setUsageByVariation(
        Object.fromEntries(
          usage.map((item) => [String(item.variationId), item]),
        ),
      );
    } else setUsageByVariation({});
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) loadAll();
  }, [isAdmin, loadAll]);
  useEffect(() => {
    if (
      selectedTemplate?.variations?.length &&
      !selectedTemplate.variations.some(
        (item) => item.clientId === selectedVariationId,
      )
    ) {
      setSelectedVariationId(selectedTemplate.variations[0].clientId);
    }
  }, [selectedTemplate, selectedVariationId]);
  useEffect(() => {
    if (!applyModal || applying) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setApplyModal(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [applyModal, applying]);

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const updateConfig = (changes) =>
    setConfig((current) => ({ ...current, ...changes }));
  const updateConfigStep = (step, changes) => {
    setConfig((current) => ({
      ...current,
      steps: current.steps.map((item) =>
        item.step === step ? { ...item, ...changes } : item,
      ),
    }));
    if (Object.prototype.hasOwnProperty.call(changes, 'enabled')) {
      setTemplates((current) =>
        current.map((item) =>
          item.step === step ? { ...item, enabled: changes.enabled } : item,
        ),
      );
    }
  };
  const updateTemplateStep = (step, changes) => {
    setTemplates((current) =>
      current.map((item) =>
        item.step === step ? { ...item, ...changes } : item,
      ),
    );
    if (Object.prototype.hasOwnProperty.call(changes, 'enabled')) {
      setConfig((current) => ({
        ...current,
        steps: current.steps.map((item) =>
          item.step === step ? { ...item, enabled: changes.enabled } : item,
        ),
      }));
    }
  };
  const updateVariation = (step, clientId, changes) =>
    setTemplates((current) =>
      current.map((item) =>
        item.step !== step
          ? item
          : {
              ...item,
              variations: item.variations.map((variation) =>
                variation.clientId === clientId
                  ? { ...variation, ...changes }
                  : variation,
              ),
            },
      ),
    );

  const saveAll = async () => {
    if (config.windowStart >= config.windowEnd)
      return toast.error('O início da janela precisa ser anterior ao fim.');
    for (const item of templates) {
      if (
        item.enabled &&
        !item.variations.some((variation) => variation.enabled)
      ) {
        toast.error(
          `Ative uma variação na etapa ${item.step} ou pause a etapa.`,
        );
        setSelectedStep(item.step);
        return;
      }
      if (
        item.variations.some(
          (variation) => !String(variation.message || '').trim(),
        )
      ) {
        toast.error(
          `Preencha ou remova as variações vazias da etapa ${item.step}.`,
        );
        setSelectedStep(item.step);
        return;
      }
      if (
        item.variations.some((variation) => variation.message.length > 2000)
      ) {
        toast.error(
          `Uma mensagem da etapa ${item.step} ultrapassa 2.000 caracteres.`,
        );
        setSelectedStep(item.step);
        return;
      }
    }
    if (!automationApiAvailable)
      return toast.error('A API de automação não está disponível no backend.');
    setSaving(true);
    try {
      const safeConfig = { ...config, timezone: TIMEZONE };
      const templatePayload = templates.map((item) => {
        const variations = item.variations.map(({ _id, message, enabled }) => ({
          ...(_id ? { _id } : {}),
          message: message.trim(),
          enabled: enabled !== false,
        }));
        const firstActive =
          variations.find((variation) => variation.enabled) || variations[0];
        return {
          step: item.step,
          label: item.label,
          enabled: item.enabled !== false,
          message: firstActive?.message || item.message,
          variations,
        };
      });
      // Primeiro persistimos os modelos e suas variações. Só depois salvamos
      // as regras da automação, evitando duas gravações concorrentes no mesmo
      // documento LeadFollowUpTemplate.
      const templateResponse = await api.put('/api/lead-follow-up-templates', {
        templates: templatePayload,
      });
  // A rota de automação deve atualizar somente settings; as mensagens e
  // variações já foram persistidas pela rota de templates acima.
  const automationResponse = await api.put(
    '/api/lead-follow-up-automation',
    { config: safeConfig },
  );

  setConfig(normalizeConfig(automationResponse.data));
  if (Array.isArray(templateResponse.data?.templates)) {
    setTemplates(normalizeTemplates(templateResponse.data.templates));
  }
  setUpdatedAt(
    automationResponse.data?.updatedAt ||
      templateResponse.data?.updatedAt ||
      new Date().toISOString(),
  );
  toast.success(
    safeConfig.enabled
      ? 'Regras e mensagens salvas. A automação está habilitada nas configurações.'
      : 'Regras e mensagens salvas. A automação permanece pausada.',
  );
} catch (error) {
  toast.error(
    error?.response?.data?.message ||
      'Não foi possível salvar todas as configurações. Verifique os endpoints do backend.',
  );
  // Recarrega para evitar que a interface apresente um estado parcialmente salvo como confirmado.
  await loadAll();
} finally {
  setSaving(false);
}
  };

  const addVariation = () => {
    if (selectedTemplate.variations.length >= 10)
      return toast.info('Cada etapa pode ter até 10 variações.');
    const variation = { clientId: newClientId(), message: '', enabled: true };
    updateTemplateStep(selectedStep, {
      variations: [...selectedTemplate.variations, variation],
    });
    setSelectedVariationId(variation.clientId);
  };
  const removeVariation = (variation) => {
    if (selectedTemplate.variations.length <= 1)
      return toast.error('Mantenha pelo menos uma variação por etapa.');
    const remaining = selectedTemplate.variations.filter(
      (item) => item.clientId !== variation.clientId,
    );
    updateTemplateStep(selectedStep, { variations: remaining });
    setSelectedVariationId(remaining[0]?.clientId || null);
  };
  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(selectedVariation?.message || '');
      toast.success('Mensagem copiada.');
    } catch {
      toast.error('Não foi possível copiar a mensagem neste navegador.');
    }
  };
  const applyPending = async () => {
    if (applying || saving) return;
    setApplying(true);
    try {
      const { data } = await api.post(
        '/api/lead-follow-up-templates/apply-pending',
      );
      toast.success(
        `Atualização concluída: ${data?.updated ?? 0} mensagem(ns) pendente(s) atualizada(s).`,
      );
      setApplyModal(false);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          'Não foi possível atualizar os follow-ups pendentes.',
      );
    } finally {
      setApplying(false);
    }
  };

  if (loading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-3 bg-[#050914] text-sm text-slate-400">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />
        Carregando Central de Follow-ups...
      </div>
    );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050914] px-4 py-6 text-slate-100 md:px-8 md:py-8">
      <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-blue-500/[0.10] blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/[0.08] blur-[130px]" />
      <div className="relative mx-auto max-w-7xl space-y-6">
        <header className="overflow-hidden rounded-3xl border border-slate-800/90 bg-gradient-to-br from-slate-900 via-slate-950 to-[#080d1b] p-6 shadow-2xl md:p-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-blue-300">
                <FiZap /> CRM NODUS / Central inteligente
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
                Central de Follow-ups
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Gerencie em um só lugar a programação, as regras de envio e as
                mensagens automáticas D0–D10.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800"
              >
                <FiArrowLeft /> Voltar
              </button>
              <button
                type="button"
                onClick={loadAll}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800"
              >
                <FiRefreshCw /> Atualizar
              </button>
              <button
                type="button"
                onClick={saveAll}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/40 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60"
              >
                <FiSave /> {saving ? 'Salvando...' : 'Salvar tudo'}
              </button>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <FiClock /> Janela diária
              </div>
              <div className="mt-2 text-xl font-bold">
                {config.windowStart} – {config.windowEnd}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Fuso de São Paulo
              </div>
            </div>
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <FiCheckCircle /> Etapas ativas
              </div>
              <div className="mt-2 text-2xl font-bold">
                {enabledStepsCount}
                <span className="ml-1 text-sm text-slate-500">/ 6</span>
              </div>
              <div className="mt-1 text-xs text-slate-500">D0 até D10</div>
            </div>
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <FiMessageCircle /> Variações ativas
              </div>
              <div className="mt-2 text-2xl font-bold">
                {activeVariationCount}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Nas etapas habilitadas
              </div>
            </div>
            <div
              className={`rounded-2xl border p-4 ${config.enabled ? 'border-emerald-500/20 bg-emerald-500/[0.05]' : 'border-amber-500/20 bg-amber-500/[0.05]'}`}
            >
              <div
                className={`flex items-center gap-2 text-xs ${config.enabled ? 'text-emerald-200' : 'text-amber-200'}`}
              >
                <FiShield /> Estado da automação
              </div>
              <div
                className={`mt-2 text-lg font-bold ${config.enabled ? 'text-emerald-200' : 'text-amber-200'}`}
              >
                {config.enabled ? 'Automação habilitada' : 'Envios pausados'}
              </div>
              <div className="mt-1 text-xs text-slate-400">
                A configuração não substitui as validações de envio do backend.
              </div>
            </div>
          </div>
        </header>
    {!automationApiAvailable && (
      <div className="flex gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/[0.08] p-4 text-sm text-amber-100">
        <FiInfo className="mt-0.5 shrink-0" />
        <div>
          <strong>API de automação indisponível.</strong>
          <p className="mt-1 text-amber-100/80">
            A parte de mensagens pode continuar usando os endpoints
            existentes, mas as regras de horários só serão persistidas
            quando a API de automação estiver disponível.
          </p>
        </div>
      </div>
    )}

    <section className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="h-fit rounded-2xl border border-slate-800/90 bg-slate-900/80 p-3 shadow-xl">
        <div className="flex items-center justify-between px-3 pb-3 pt-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Sequência de contato
          </span>
          <span className="rounded-lg bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-400">
            6 ETAPAS
          </span>
        </div>
        <div className="space-y-1">
          {config.steps.map((item) => {
            const active = item.step === selectedStep;
            const template = templates.find(
              (entry) => entry.step === item.step,
            );
            const count =
              template?.variations?.filter((variation) => variation.enabled)
                .length || 0;
            return (
              <button
                key={item.step}
                type="button"
                onClick={() => setSelectedStep(item.step)}
                className={`w-full rounded-xl border p-3 text-left transition ${active ? 'border-blue-400/30 bg-blue-500/[0.12]' : 'border-transparent hover:border-slate-700 hover:bg-slate-800/60'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="block text-sm font-bold text-white">
                      {item.step} · {item.label}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {item.time} · {count} variação(ões)
                    </span>
                  </div>
                  <span
                    className={`h-2 w-2 rounded-full ${item.enabled && template?.enabled ? 'bg-emerald-400' : 'bg-slate-600'}`}
                  />
                </div>
              </button>
            );
          })}
        </div>
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <div className="flex items-start gap-2 text-xs leading-5 text-slate-400">
            <FiInfo className="mt-0.5 shrink-0 text-blue-300" /> Configure
            horários e mensagens por etapa. A seleção de variações é feita
            pelo backend conforme as regras existentes.
          </div>
        </div>
      </aside>

      <main className="min-w-0 space-y-5">
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 md:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="rounded-xl bg-blue-500/10 p-3 text-blue-300">
              <FiClock size={20} />
            </span>
            <div>
              <h2 className="font-bold text-white">
                Regras gerais de envio
              </h2>
              <p className="text-sm text-slate-400">
                Aplicadas globalmente a toda a sequência.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-medium text-slate-300">
                Início da janela
              </span>
              <input
                type="time"
                value={config.windowStart}
                onChange={(event) =>
                  updateConfig({ windowStart: event.target.value })
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white focus:border-blue-500 focus:outline-none"
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-slate-300">
                Fim da janela
              </span>
              <input
                type="time"
                value={config.windowEnd}
                onChange={(event) =>
                  updateConfig({ windowEnd: event.target.value })
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white focus:border-blue-500 focus:outline-none"
              />
            </label>
            <label className="flex items-center justify-between gap-4 rounded-xl border border-blue-500/25 bg-blue-500/[0.06] p-4 sm:col-span-2">
              <span>
                <span className="block font-semibold text-white">
                  Habilitar automação de follow-ups
                </span>
                <span className="mt-1 block text-xs text-slate-400">
                  O envio real também depende das validações e permissões do
                  backend.
                </span>
              </span>
              <input
                aria-label="Habilitar automação de follow-ups"
                type="checkbox"
                checked={config.enabled === true}
                onChange={(event) =>
                  updateConfig({ enabled: event.target.checked })
                }
                className="h-5 w-5 rounded border-slate-600 bg-slate-900 text-blue-500"
              />
            </label>
            <label className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/70 p-4 sm:col-span-2">
              <span>
                <span className="block font-semibold text-white">
                  Permitir finais de semana
                </span>
                <span className="mt-1 block text-xs text-slate-400">
                  Quando desativado, a programação deve aguardar o próximo
                  dia útil.
                </span>
              </span>
              <input
                aria-label="Permitir finais de semana"
                type="checkbox"
                checked={config.allowWeekends}
                onChange={(event) =>
                  updateConfig({ allowWeekends: event.target.checked })
                }
                className="h-5 w-5 rounded border-slate-600 bg-slate-900 text-blue-500"
              />
            </label>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 sm:col-span-2">
              <p className="text-sm font-semibold text-white">
                Fuso horário
              </p>
              <p className="mt-1 text-sm text-slate-400">
                {TIMEZONE} (fixo)
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 md:p-6">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-bold text-white">
                Programação da etapa {selectedStep}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Defina o horário e se esta etapa participa da sequência.
              </p>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={selectedConfigStep.enabled}
                onChange={(event) =>
                  updateConfigStep(selectedStep, {
                    enabled: event.target.checked,
                  })
                }
                className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-500"
              />{' '}
              Etapa ativa
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-medium text-slate-300">
                Momento relativo
              </span>
              <input
                readOnly
                value={
                  selectedConfigStep.timing ||
                  (selectedStep === 'D0'
                    ? 'Após a entrada do lead'
                    : `${selectedStep.slice(1)} dias depois`)
                }
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-3 text-slate-400"
              />
            </label>
            <label>
              <span className="mb-2 block text-sm font-medium text-slate-300">
                Horário preferencial
              </span>
              <input
                type="time"
                value={selectedConfigStep.time}
                onChange={(event) =>
                  updateConfigStep(selectedStep, {
                    time: event.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white focus:border-blue-500 focus:outline-none"
              />
            </label>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            O agendador do backend precisa aplicar esses horários à fila
            pendente. Esta tela não altera diretamente registros já
            agendados até a configuração ser salva e a lógica do servidor
            aplicar as regras.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-800/90 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-5 shadow-xl md:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-2.5 py-1.5 text-xs font-black text-white">
                  {selectedStep}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Editor de mensagens
                </span>
              </div>
              <h2 className="mt-3 text-xl font-bold text-white">
                {selectedConfigStep.label}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Edite alternativas de mensagem e visualize como o texto será
                apresentado.
              </p>
            </div>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5">
              <span className="text-sm font-medium text-slate-300">
                Etapa de mensagens ativa
              </span>
              <input
                type="checkbox"
                checked={selectedTemplate.enabled !== false}
                onChange={(event) =>
                  updateTemplateStep(selectedStep, {
                    enabled: event.target.checked,
                  })
                }
                className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-500"
              />
            </label>
          </div>
          <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Alternativas da mensagem
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {
                      selectedTemplate.variations.filter(
                        (item) => item.enabled,
                      ).length
                    }{' '}
                    ativa(s) · até 10 por etapa
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addVariation}
                  disabled={selectedTemplate.variations.length >= 10}
                  className="inline-flex items-center gap-2 rounded-xl border border-blue-400/20 bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-200 hover:bg-blue-500/20 disabled:opacity-40"
                >
                  <FiPlus /> Nova variação
                </button>
              </div>
              <div className="space-y-2">
                {selectedTemplate.variations.map((variation, index) => (
                  <div
                    key={variation.clientId}
                    className={`rounded-xl border p-3 ${selectedVariation?.clientId === variation.clientId ? 'border-blue-400/40 bg-blue-500/[0.08]' : 'border-slate-800 bg-slate-950/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedVariationId(variation.clientId)
                        }
                        className="flex min-w-0 flex-1 items-center gap-3 text-left"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/15 text-xs font-black text-blue-300">
                          V{index + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                            Variação {index + 1}
                            {selectedVariation?.clientId ===
                              variation.clientId && (
                              <FiCheck className="text-blue-300" />
                            )}
                          </span>
                          <span className="mt-1 block truncate text-xs text-slate-500">
                            {variation.message ||
                              'Mensagem ainda não preenchida'}
                          </span>
                          <span className="mt-1 block text-[10px] text-slate-600">
                            {usageByVariation[
                              String(variation._id || variation.clientId)
                            ]?.usageCount ?? 0}{' '}
                            uso(s)
                          </span>
                        </span>
                      </button>
                      <input
                        aria-label={`Ativar variação ${index + 1}`}
                        type="checkbox"
                        checked={variation.enabled !== false}
                        onChange={(event) =>
                          updateVariation(
                            selectedStep,
                            variation.clientId,
                            { enabled: event.target.checked },
                          )
                        }
                        className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeVariation(variation)}
                        aria-label={`Remover variação ${index + 1}`}
                        className="rounded-lg p-2 text-slate-500 hover:bg-rose-500/10 hover:text-rose-300"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-[#080d19] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      Editor da variação
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Personalize sem perder as variáveis dinâmicas.
                    </p>
                  </div>
                  <span className="rounded-lg bg-slate-800 px-2 py-1 text-[10px] font-bold uppercase text-slate-400">
                    {(selectedVariation?.message || '').length}/2000
                  </span>
                </div>
                <textarea
                  value={selectedVariation?.message || ''}
                  onChange={(event) =>
                    updateVariation(
                      selectedStep,
                      selectedVariation.clientId,
                      { message: event.target.value },
                    )
                  }
                  maxLength={2000}
                  rows={7}
                  placeholder="Escreva a mensagem desta alternativa..."
                  className="mt-4 w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-6 text-slate-200 outline-none placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setShowVariables((value) => !value)}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    <FiPlus />{' '}
                    {showVariables
                      ? 'Ocultar variáveis'
                      : 'Inserir variável'}
                  </button>
                  <button
                    type="button"
                    onClick={copyMessage}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                  >
                    <FiCopy /> Copiar texto
                  </button>
                </div>
                {showVariables && (
                  <div className="mt-3 flex flex-wrap gap-2 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                    {VARIABLES.map(([token, label]) => (
                      <button
                        key={token}
                        type="button"
                        title={label}
                        onClick={() =>
                          updateVariation(
                            selectedStep,
                            selectedVariation.clientId,
                            {
                              message: `${selectedVariation?.message || ''}${token}`,
                            },
                          )
                        }
                        className="rounded-lg border border-blue-400/20 bg-blue-500/10 px-2.5 py-1.5 font-mono text-[11px] text-blue-200 hover:bg-blue-500/20"
                      >
                        {token}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded-2xl border border-emerald-400/15 bg-gradient-to-br from-emerald-500/[0.07] to-teal-500/[0.025] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-100">
                    <FiMessageCircle /> Prévia da mensagem
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/70">
                    Exemplo
                  </span>
                </div>
                <div className="mt-4 whitespace-pre-wrap break-words rounded-2xl rounded-tl-md border border-emerald-400/10 bg-[#10251f] px-4 py-3 text-sm leading-6 text-emerald-50">
                  {preview || (
                    <span className="italic text-slate-500">
                      Digite uma mensagem para visualizar a prévia.
                    </span>
                  )}
                </div>
                <div className="mt-2 text-right text-[10px] text-slate-500">
                  Prévia fictícia — nenhum WhatsApp será enviado
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/[0.05] p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="rounded-xl bg-blue-500/10 p-3 text-blue-300">
                <FiZap size={20} />
              </span>
              <div>
                <h2 className="font-bold text-white">
                  Fluxo automático do lead
                </h2>
                <p className="text-xs text-slate-400">
                  Sem informar ID manualmente
                </p>
              </div>
            </div>
            <ol className="space-y-3 text-sm leading-5 text-slate-300">
              <li>
                <strong className="text-white">1.</strong> O lead preenche o
                formulário do site e concede consentimento válido para
                contato via WhatsApp.
              </li>
              <li>
                <strong className="text-white">2.</strong> O backend cria o
                lead e agenda D0 e as próximas etapas automaticamente.
              </li>
              <li>
                <strong className="text-white">3.</strong> O processador
                envia D0 e D1 nos horários configurados, respeitando a
                janela permitida.
              </li>
            </ol>
            <p className="mt-4 rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-xs leading-5 text-slate-400">
              Esta tela configura as regras; o fluxo depende também da
              integração entre formulário, serviço de agendamento e
              processador no backend.
            </p>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] p-5">
            <div className="flex items-center gap-2 text-amber-200">
              <FiShield />
              <h2 className="font-bold">Proteções obrigatórias</h2>
            </div>
            <ul className="mt-3 space-y-3 text-sm leading-5 text-slate-300">
              <li className="flex gap-2">
                <FiCheckCircle className="mt-0.5 shrink-0 text-emerald-400" />{' '}
                Exigir consentimento válido para WhatsApp.
              </li>
              <li className="flex gap-2">
                <FiCheckCircle className="mt-0.5 shrink-0 text-emerald-400" />{' '}
                Cancelar a sequência após resposta do lead.
              </li>
              <li className="flex gap-2">
                <FiCheckCircle className="mt-0.5 shrink-0 text-emerald-400" />{' '}
                Manter deduplicação e proteção contra reenvio.
              </li>
              <li className="flex gap-2">
                <FiCheckCircle className="mt-0.5 shrink-0 text-emerald-400" />{' '}
                Auditar a fila pendente antes de liberar envios reais em
                lote.
              </li>
            </ul>
            <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950/60 p-3 text-xs leading-5 text-slate-400">
              Última atualização:{' '}
              {updatedAt
                ? new Date(updatedAt).toLocaleString('pt-BR')
                : 'Ainda não registrada'}
            </div>
          </div>
        </section>
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2 text-xs leading-5 text-slate-400">
            <FiInfo className="mt-0.5 shrink-0 text-blue-300" /> Aplicar
            mensagens às pendentes atualiza somente registros com status
            pendente e não dispara envio por si só.
          </div>
          <button
            type="button"
            onClick={() => setApplyModal(true)}
            disabled={saving || applying}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-bold text-slate-200 hover:bg-slate-700 disabled:opacity-50"
          >
            <FiRefreshCw /> Aplicar às pendentes
          </button>
        </div>
      </main>
    </section>
  </div>
  {applyModal && (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !applying)
          setApplyModal(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-followups-title"
        className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#0b1220] p-6 shadow-2xl"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300">
          <FiRefreshCw size={22} />
        </div>
        <h2
          id="apply-followups-title"
          className="mt-4 text-lg font-bold text-white"
        >
          Atualizar mensagens pendentes?
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Esta ação recalcula o texto dos follow-ups pendentes. Mensagens
          enviadas, simuladas, em processamento ou canceladas não devem ser
          alteradas. Isso não dispara um envio por si só.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={applying}
            onClick={() => setApplyModal(false)}
            className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={applying}
            onClick={applyPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
          >
            {applying ? 'Atualizando...' : 'Confirmar atualização'}
          </button>
        </div>
      </div>
    </div>
  )}
</div>
  );
}

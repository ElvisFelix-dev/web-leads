import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiArrowLeft, FiCalendar, FiCheckCircle, FiClock, FiInfo, FiMessageCircle,
  FiPause, FiPlay, FiRefreshCw, FiSave, FiShield, FiZap,
} from 'react-icons/fi';
import { UserContext } from '../../context/UserContext';
import api from '../../service/api';

const TIMEZONE = 'America/Sao_Paulo';
const DEFAULT_STEPS = [
  { step: 'D0', label: 'Primeiro contato', delayMinutes: 5, time: '09:00', enabled: true, message: 'Olá, {nome}! Recebemos seu interesse{referencia_imovel} e estamos à disposição para ajudar. Você ainda está procurando um imóvel?' },
  { step: 'D1', label: 'Retomada leve', delayMinutes: 1440, time: '09:00', enabled: true, message: 'Olá, {nome}! Passando para saber se você conseguiu avançar na busca{referencia_imovel}. Posso ajudar com as opções disponíveis?' },
  { step: 'D3', label: 'Acompanhamento', delayMinutes: 4320, time: '10:30', enabled: true, message: 'Olá, {nome}! Gostaria de saber se ainda podemos ajudar na sua busca{referencia_imovel}. Se suas preferências mudaram, podemos considerar isso também.' },
  { step: 'D5', label: 'Ajuda contextual', delayMinutes: 7200, time: '14:00', enabled: true, message: 'Olá, {nome}! Continuo à disposição para ajudar você a encontrar um imóvel que faça sentido para suas necessidades. Podemos conversar?' },
  { step: 'D7', label: 'Última tentativa leve', delayMinutes: 10080, time: '15:00', enabled: true, message: 'Olá, {nome}! Ainda podemos ajudar na sua busca por um imóvel. Se quiser continuar, basta responder a esta mensagem.' },
  { step: 'D10', label: 'Encerramento da sequência', delayMinutes: 14400, time: '16:30', enabled: true, message: 'Olá, {nome}! Este é nosso último contato automático por enquanto. Se ainda estiver procurando um imóvel, pode responder por aqui que teremos prazer em ajudar.' },
];
const DEFAULT_CONFIG = {
  enabled: false,
  timezone: TIMEZONE,
  windowStart: '09:00',
  windowEnd: '18:00',
  allowWeekends: true,
  steps: DEFAULT_STEPS,
};
const VARIABLES = ['{nome}', '{nome_completo}', '{imovel}', '{codigo_imovel}', '{bairro}', '{cidade}', '{referencia_imovel}'];

function normalizeConfig(data) {
  const raw = data?.config || data?.automation || data || {};
  const incomingSteps = Array.isArray(raw.steps) ? raw.steps : [];
  return {
    ...DEFAULT_CONFIG,
    ...raw,
    timezone: TIMEZONE,
    steps: DEFAULT_STEPS.map((fallback) => ({
      ...fallback,
      ...(incomingSteps.find((item) => item.step === fallback.step) || {}),
    })),
  };
}

function previewMessage(message) {
  return String(message || '')
    .replaceAll('{nome}', 'Mariana')
    .replaceAll('{nome_completo}', 'Mariana Oliveira')
    .replaceAll('{imovel}', 'Apartamento com varanda')
    .replaceAll('{codigo_imovel}', 'ND-00123')
    .replaceAll('{bairro}', 'Vila Mariana')
    .replaceAll('{cidade}', 'São Paulo')
    .replaceAll('{referencia_imovel}', ' sobre o imóvel Apartamento com varanda, no bairro Vila Mariana')
    .replace(/[ \t]{2,}/g, ' ');
}

export default function FollowUpAutomation() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const isAdmin = user?.isAdmin === true || user?.role === 'admin';
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testLeadId, setTestLeadId] = useState('');
  const [selectedStep, setSelectedStep] = useState('D0');
  const [updatedAt, setUpdatedAt] = useState(null);
  const [backendAvailable, setBackendAvailable] = useState(true);

  const selected = useMemo(
    () => config.steps.find((item) => item.step === selectedStep) || config.steps[0],
    [config.steps, selectedStep],
  );

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/lead-follow-up-automation');
      setConfig(normalizeConfig(data));
      setUpdatedAt(data?.updatedAt || data?.config?.updatedAt || null);
      setBackendAvailable(true);
    } catch (error) {
      if (error?.response?.status === 404) {
        setBackendAvailable(false);
        // A tela pode ser visualizada, mas a configuração só será persistida
        // quando o endpoint de automação existir no backend.
      } else {
        toast.error(error?.response?.data?.message || 'Não foi possível carregar a automação.');
      }
      setConfig(DEFAULT_CONFIG);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) loadConfig();
  }, [isAdmin, loadConfig]);

  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  const updateConfig = (changes) => setConfig((current) => ({ ...current, ...changes }));
  const updateStep = (step, changes) => setConfig((current) => ({
    ...current,
    steps: current.steps.map((item) => item.step === step ? { ...item, ...changes } : item),
  }));

  const save = async () => {
    if (!backendAvailable) {
      toast.error('O endpoint /api/lead-follow-up-automation ainda precisa ser implementado no backend.');
      return;
    }
    if (config.windowStart >= config.windowEnd) {
      toast.error('O início da janela precisa ser anterior ao fim.');
      return;
    }
    if (config.steps.some((item) => item.enabled && !item.message.trim())) {
      toast.error('Preencha a mensagem de todas as etapas ativas.');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...config, timezone: TIMEZONE, enabled: false };
      const { data } = await api.put('/api/lead-follow-up-automation', { config: payload });
      setConfig(normalizeConfig(data));
      setUpdatedAt(data?.updatedAt || new Date().toISOString());
      toast.success('Configurações salvas em modo seguro. Os envios reais continuam pausados.');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Não foi possível salvar as configurações.');
    } finally {
      setSaving(false);
    }
  };

  const runTest = async () => {
    if (!testLeadId.trim()) {
      toast.info('Informe o ID de um lead para executar o teste.');
      return;
    }
    setTesting(true);
    try {
      const { data } = await api.post('/api/lead-follow-up-automation/test', {
        leadId: testLeadId.trim(),
        step: selectedStep,
        dryRun: true,
      });
      toast.success(data?.message || 'Teste simulado solicitado. Nenhuma mensagem real foi enviada.');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'O endpoint de teste ainda não está disponível no backend.');
    } finally {
      setTesting(false);
    }
  };

  const toggleActivation = async () => {
    if (config.enabled) {
      updateConfig({ enabled: false });
      toast.info('Automação pausada nesta tela. Salve para persistir a alteração.');
      return;
    }
    toast.info('Antes de ativar envios reais, execute e valide o teste individual no backend.');
  };

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center gap-3 bg-[#050914] text-sm text-slate-400"><span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />Carregando automação...</div>;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050914] px-4 py-6 text-slate-100 md:px-8 md:py-8">
      <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-blue-500/[0.10] blur-[130px]" />
      <div className="relative mx-auto max-w-7xl space-y-6">
        <header className="overflow-hidden rounded-3xl border border-slate-800/90 bg-gradient-to-br from-slate-900 via-slate-950 to-[#080d1b] p-6 shadow-2xl md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-blue-300"><FiZap /> CRM NODUS / Automação</div>
              <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Automação de Follow-ups</h1>
              <p className="mt-2 text-sm leading-6 text-slate-300">Configure a sequência global, os horários permitidos e as mensagens enviadas aos leads elegíveis.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800"><FiArrowLeft /> Voltar</button>
              <button type="button" onClick={loadConfig} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3 text-sm font-semibold text-slate-200 hover:bg-slate-800"><FiRefreshCw /> Atualizar</button>
              <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/40 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60"><FiSave /> {saving ? 'Salvando...' : 'Salvar configuração'}</button>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4"><div className="flex items-center gap-2 text-xs text-slate-400"><FiCalendar /> Etapas habilitadas</div><div className="mt-2 text-2xl font-bold">{config.steps.filter((item) => item.enabled).length}<span className="ml-1 text-sm text-slate-500">/ 6</span></div></div>
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4"><div className="flex items-center gap-2 text-xs text-slate-400"><FiClock /> Janela diária</div><div className="mt-2 text-2xl font-bold">{config.windowStart} – {config.windowEnd}</div><div className="mt-1 text-xs text-slate-500">Horário de São Paulo</div></div>
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4"><div className="flex items-center gap-2 text-xs text-slate-400"><FiShield /> Modo de operação</div><div className="mt-2 text-lg font-bold text-amber-300">Envios reais pausados</div><div className="mt-1 text-xs text-slate-500">Ativação exige validação separada</div></div>
          </div>
        </header>

        {!backendAvailable && <div className="flex gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/[0.08] p-4 text-sm text-amber-100"><FiInfo className="mt-0.5 shrink-0" /><div><strong>Integração de backend pendente.</strong><p className="mt-1 text-amber-100/80">A interface está pronta para desenvolvimento visual, mas a API de configuração ainda não foi encontrada nesta versão. Salvar e testar serão habilitados quando os endpoints correspondentes forem implementados.</p></div></div>}

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 md:p-6">
              <div className="mb-5 flex items-center gap-3"><span className="rounded-xl bg-blue-500/10 p-3 text-blue-300"><FiClock size={20} /></span><div><h2 className="font-bold text-white">Regras gerais de envio</h2><p className="text-sm text-slate-400">Aplicadas globalmente a toda a sequência.</p></div></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block"><span className="mb-2 block text-sm font-medium text-slate-300">Início da janela</span><input type="time" value={config.windowStart} onChange={(e) => updateConfig({ windowStart: e.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white focus:border-blue-500 focus:outline-none" /></label>
                <label className="block"><span className="mb-2 block text-sm font-medium text-slate-300">Fim da janela</span><input type="time" value={config.windowEnd} onChange={(e) => updateConfig({ windowEnd: e.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-white focus:border-blue-500 focus:outline-none" /></label>
                <div className="sm:col-span-2 flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/70 p-4"><div><p className="font-semibold text-white">Permitir finais de semana</p><p className="mt-1 text-xs text-slate-400">Quando desativado, a programação aguarda o próximo dia útil.</p></div><input aria-label="Permitir finais de semana" type="checkbox" checked={config.allowWeekends} onChange={(e) => updateConfig({ allowWeekends: e.target.checked })} className="h-5 w-5 rounded border-slate-600 bg-slate-900 text-blue-500 focus:ring-blue-500" /></div>
                <div className="sm:col-span-2 rounded-xl border border-slate-800 bg-slate-950/70 p-4"><p className="text-sm font-semibold text-white">Fuso horário</p><p className="mt-1 text-sm text-slate-400">America/Sao_Paulo (fixo para esta configuração)</p></div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 md:p-6">
              <div className="mb-5"><h2 className="font-bold text-white">Etapas e mensagens</h2><p className="mt-1 text-sm text-slate-400">Ajuste o horário preferencial e o texto de cada etapa D0–D10.</p></div>
              <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-6">{config.steps.map((item) => <button key={item.step} type="button" onClick={() => setSelectedStep(item.step)} className={`rounded-xl border p-3 text-left transition ${selectedStep === item.step ? 'border-blue-400/50 bg-blue-500/10' : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'}`}><div className="flex items-center justify-between"><span className="font-black text-white">{item.step}</span><span className={`h-2 w-2 rounded-full ${item.enabled ? 'bg-emerald-400' : 'bg-slate-600'}`} /></div><span className="mt-1 block text-xs text-slate-400">{item.time}</span></button>)}</div>
              {selected && <div className="mt-5 space-y-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 md:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-bold text-white">{selected.step} · {selected.label}</h3><p className="text-xs text-slate-500">Preferência de horário para esta etapa</p></div><label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={selected.enabled} onChange={(e) => updateStep(selected.step, { enabled: e.target.checked })} className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-blue-500" /> Etapa ativa</label></div>
                <div className="grid gap-4 sm:grid-cols-2"><label><span className="mb-2 block text-sm font-medium text-slate-300">Dia relativo</span><input readOnly value={selected.step === 'D0' ? 'Após a entrada do lead' : `${selected.step.slice(1)} dias após o início`} className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-3 text-slate-400" /></label><label><span className="mb-2 block text-sm font-medium text-slate-300">Horário preferencial</span><input type="time" value={selected.time} onChange={(e) => updateStep(selected.step, { time: e.target.value })} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-white focus:border-blue-500 focus:outline-none" /></label></div>
                <label className="block"><span className="mb-2 block text-sm font-medium text-slate-300">Mensagem WhatsApp</span><textarea maxLength={2000} rows={5} value={selected.message} onChange={(e) => updateStep(selected.step, { message: e.target.value })} className="w-full resize-y rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm leading-6 text-white focus:border-blue-500 focus:outline-none" /><span className="mt-1 block text-right text-xs text-slate-500">{selected.message.length}/2000 caracteres</span></label>
                <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Inserir variável</p><div className="flex flex-wrap gap-2">{VARIABLES.map((variable) => <button key={variable} type="button" onClick={() => updateStep(selected.step, { message: `${selected.message}${variable}` })} className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs font-mono text-blue-300 hover:border-blue-500/50">{variable}</button>)}</div></div>
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] p-4"><div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-300"><FiMessageCircle /> Prévia da mensagem</div><p className="whitespace-pre-wrap text-sm leading-6 text-slate-200">{previewMessage(selected.message)}</p></div>
              </div>}
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="mb-4 flex items-center gap-3"><span className="rounded-xl bg-violet-500/10 p-3 text-violet-300"><FiShield size={20} /></span><div><h2 className="font-bold text-white">Teste individual</h2><p className="text-xs text-slate-400">Valide sem enviar WhatsApp real</p></div></div>
              <label className="block"><span className="mb-2 block text-sm font-medium text-slate-300">ID do lead</span><input value={testLeadId} onChange={(e) => setTestLeadId(e.target.value)} placeholder="Ex.: 66f..." className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-white placeholder:text-slate-600 focus:border-blue-500 focus:outline-none" /></label>
              <button type="button" disabled={testing || !backendAvailable} onClick={runTest} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 py-3 text-sm font-bold text-violet-200 hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50"><FiPlay /> {testing ? 'Executando...' : `Simular etapa ${selectedStep}`}</button>
              <p className="mt-3 text-xs leading-5 text-slate-500">O teste deve validar consentimento, janela de envio, resposta prévia e deduplicação. A chamada é enviada com <code>dryRun: true</code>.</p>
            </section>
            <section className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] p-5">
              <div className="flex items-center gap-2 text-amber-200"><FiShield /><h2 className="font-bold">Proteções obrigatórias</h2></div>
              <ul className="mt-3 space-y-3 text-sm leading-5 text-slate-300"><li className="flex gap-2"><FiCheckCircle className="mt-0.5 shrink-0 text-emerald-400" /> Exigir consentimento válido para WhatsApp.</li><li className="flex gap-2"><FiCheckCircle className="mt-0.5 shrink-0 text-emerald-400" /> Cancelar a sequência após resposta do lead.</li><li className="flex gap-2"><FiCheckCircle className="mt-0.5 shrink-0 text-emerald-400" /> Manter deduplicação e proteção contra reenvio.</li><li className="flex gap-2"><FiCheckCircle className="mt-0.5 shrink-0 text-emerald-400" /> Não ativar envios reais ao apenas salvar.</li></ul>
            </section>
            <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <h2 className="font-bold text-white">Ativação</h2>
              <p className="mt-2 text-sm leading-5 text-slate-400">A ativação real ficará bloqueada nesta primeira etapa até o backend validar o teste individual e a fila pendente.</p>
              <button type="button" onClick={toggleActivation} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-semibold text-slate-400"><FiPause /> Envios reais pausados</button>
              {updatedAt && <p className="mt-3 text-xs text-slate-500">Última atualização: {new Date(updatedAt).toLocaleString('pt-BR')}</p>}
            </section>
          </aside>
        </section>
      </div>
    </div>
  );
}

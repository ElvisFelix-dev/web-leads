import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiCheck, FiCheckCircle, FiClock, FiCopy, FiInfo, FiMessageCircle, FiPlus, FiRefreshCw, FiSave, FiShield, FiTrash2, FiZap } from 'react-icons/fi';
import { UserContext } from '../../context/UserContext';
import api from '../../service/api';

const DEFAULT_TEMPLATES = [
  { step: 'D0', label: 'D0 · Primeiro contato', enabled: true, message: 'Olá, {nome}! Recebemos seu interesse{referencia_imovel} e estamos à disposição para ajudar. Você ainda está procurando um imóvel?' },
  { step: 'D1', label: 'D1 · Após 1 dia', enabled: true, message: 'Olá, {nome}! Passando para saber se você conseguiu avançar na busca{referencia_imovel}. Posso ajudar com as opções disponíveis?' },
  { step: 'D3', label: 'D3 · Após 3 dias', enabled: true, message: 'Olá, {nome}! Gostaria de saber se ainda podemos ajudar na sua busca{referencia_imovel}. Se suas preferências mudaram, podemos considerar isso também.' },
  { step: 'D5', label: 'D5 · Após 5 dias', enabled: true, message: 'Olá, {nome}! Continuo à disposição para ajudar você a encontrar um imóvel que faça sentido para suas necessidades. Podemos conversar?' },
  { step: 'D7', label: 'D7 · Após 7 dias', enabled: true, message: 'Olá, {nome}! Ainda podemos ajudar na sua busca por um imóvel. Se quiser continuar, basta responder a esta mensagem.' },
  { step: 'D10', label: 'D10 · Último contato', enabled: true, message: 'Olá, {nome}! Este é nosso último contato automático por enquanto. Se ainda estiver procurando um imóvel, pode responder por aqui que teremos prazer em ajudar.' },
];
const VARIABLES = [['{nome}', 'Primeiro nome'], ['{nome_completo}', 'Nome completo'], ['{imovel}', 'Nome do imóvel'], ['{codigo_imovel}', 'Código do imóvel'], ['{bairro}', 'Bairro'], ['{cidade}', 'Cidade'], ['{referencia_imovel}', 'Referência do imóvel']];
const STEP_META = {
  D0: { timing: 'Imediato', title: 'Primeiro contato', accent: 'from-sky-500 to-blue-600' },
  D1: { timing: '1 dia depois', title: 'Retomada leve', accent: 'from-blue-500 to-indigo-600' },
  D3: { timing: '3 dias depois', title: 'Acompanhamento', accent: 'from-indigo-500 to-violet-600' },
  D5: { timing: '5 dias depois', title: 'Ajuda contextual', accent: 'from-violet-500 to-purple-600' },
  D7: { timing: '7 dias depois', title: 'Última tentativa leve', accent: 'from-purple-500 to-fuchsia-600' },
  D10: { timing: '10 dias depois', title: 'Encerramento da sequência', accent: 'from-slate-500 to-slate-700' },
};
const newClientId = () => `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const normalizeTemplates = (items) => DEFAULT_TEMPLATES.map((fallback) => {
  const saved = (items || []).find((item) => item.step === fallback.step) || {};
  const variations = Array.isArray(saved.variations) && saved.variations.length
    ? saved.variations.map((item) => ({ ...item, message: item.message || '', enabled: item.enabled !== false, clientId: item._id || newClientId() }))
    : [{ message: saved.message || fallback.message, enabled: true, clientId: newClientId() }];
  return { ...fallback, ...saved, enabled: saved.enabled !== false, message: saved.message || fallback.message, variations };
});
const renderPreview = (message) => String(message || '')
  .replaceAll('{nome}', 'Mariana').replaceAll('{nome_completo}', 'Mariana Oliveira')
  .replaceAll('{imovel}', 'Apartamento com varanda').replaceAll('{codigo_imovel}', 'NV-000123')
  .replaceAll('{bairro}', 'Vila Mariana').replaceAll('{cidade}', 'São Paulo')
  .replaceAll('{referencia_imovel}', ' sobre o imóvel Apartamento com varanda, no bairro Vila Mariana, em São Paulo')
  .replace(/[ \t]{2,}/g, ' ');

export default function LeadFollowUpTemplates() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const isAdmin = user?.isAdmin === true || user?.role === 'admin';
  const [templates, setTemplates] = useState(() => normalizeTemplates(DEFAULT_TEMPLATES));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applyModal, setApplyModal] = useState(false);
  const [selectedStep, setSelectedStep] = useState('D0');
  const [selectedVariationId, setSelectedVariationId] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [usageByVariation, setUsageByVariation] = useState({});
  const [showVariables, setShowVariables] = useState(false);

  const selectedTemplate = useMemo(() => templates.find((item) => item.step === selectedStep) || templates[0], [templates, selectedStep]);
  const selectedVariation = useMemo(() => selectedTemplate?.variations?.find((item) => item.clientId === selectedVariationId) || selectedTemplate?.variations?.[0], [selectedTemplate, selectedVariationId]);
  const activeVariationCount = templates.reduce((sum, item) => sum + (item.enabled ? item.variations.filter((variation) => variation.enabled && variation.message.trim()).length : 0), 0);
  const enabledStepsCount = templates.filter((item) => item.enabled).length;

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/lead-follow-up-templates');
      if (Array.isArray(data?.templates) && data.templates.length) setTemplates(normalizeTemplates(data.templates));
      setUpdatedAt(data?.updatedAt || null);
      try {
        const usageResponse = await api.get('/api/lead-follow-up-templates/usage');
        const usage = Array.isArray(usageResponse.data?.usage) ? usageResponse.data.usage : [];
        setUsageByVariation(Object.fromEntries(usage.map((item) => [String(item.variationId), item])));
      } catch (usageError) {
        // A instalação pode ainda não ter aplicado o endpoint opcional de histórico.
        console.info('[NODUS · Central de Mensagens] Histórico indisponível nesta versão do backend.', usageError);
        setUsageByVariation({});
      }
    } catch (error) {
      console.error('[NODUS · Central de Mensagens] Erro ao carregar:', error);
      toast.error(error?.response?.data?.message || 'Não foi possível carregar as mensagens.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (isAdmin) loadTemplates(); }, [isAdmin, loadTemplates]);
  useEffect(() => {
    if (!applyModal || applying) return undefined;
    const onKeyDown = (event) => { if (event.key === 'Escape') setApplyModal(false); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [applyModal, applying]);
  useEffect(() => {
    if (selectedTemplate?.variations?.length && !selectedTemplate.variations.some((item) => item.clientId === selectedVariationId)) setSelectedVariationId(selectedTemplate.variations[0].clientId);
  }, [selectedTemplate, selectedVariationId]);

  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  const updateStep = (step, changes) => setTemplates((current) => current.map((item) => item.step === step ? { ...item, ...changes } : item));
  const updateVariation = (step, clientId, changes) => setTemplates((current) => current.map((template) => template.step !== step ? template : { ...template, variations: template.variations.map((item) => item.clientId === clientId ? { ...item, ...changes } : item) }));

  const addVariation = () => {
    if (selectedTemplate.variations.length >= 10) return toast.info('Cada etapa pode ter até 10 variações.');
    const item = { clientId: newClientId(), message: '', enabled: true };
    updateStep(selectedStep, { variations: [...selectedTemplate.variations, item] });
    setSelectedVariationId(item.clientId);
  };
  const removeVariation = (variation) => {
    if (selectedTemplate.variations.length <= 1) return toast.error('Mantenha pelo menos uma variação por etapa.');
    const remaining = selectedTemplate.variations.filter((item) => item.clientId !== variation.clientId);
    updateStep(selectedStep, { variations: remaining });
    setSelectedVariationId(remaining[0]?.clientId || null);
  };
  const insertVariable = (variable) => {
    if (selectedVariation) updateVariation(selectedStep, selectedVariation.clientId, { message: `${selectedVariation.message || ''}${variable}` });
  };
  const handleSave = async () => {
    for (const item of templates) {
      if (item.enabled && !item.variations.some((variation) => variation.enabled)) { toast.error(`Ative uma variação na etapa ${item.step} ou pause a etapa.`); setSelectedStep(item.step); return; }
      if (item.variations.some((variation) => !String(variation.message || '').trim())) { toast.error(`Preencha ou remova as variações vazias da etapa ${item.step}.`); setSelectedStep(item.step); return; }
      if (item.variations.some((variation) => variation.message.length > 2000)) { toast.error(`Uma mensagem da etapa ${item.step} ultrapassa 2.000 caracteres.`); setSelectedStep(item.step); return; }
    }
    setSaving(true);
    try {
      const payload = templates.map((item) => {
        const variations = item.variations.map(({ _id, message, enabled }) => ({ ...(_id ? { _id } : {}), message: message.trim(), enabled: enabled !== false }));
        const firstActive = variations.find((variation) => variation.enabled) || variations[0];
        return { step: item.step, label: item.label, enabled: item.enabled !== false, message: firstActive?.message || item.message, variations };
      });
      const { data } = await api.put('/api/lead-follow-up-templates', { templates: payload });
      if (Array.isArray(data?.templates)) setTemplates(normalizeTemplates(data.templates));
      setUpdatedAt(data?.updatedAt || new Date().toISOString());
      toast.success('Variações salvas com sucesso!');
    } catch (error) {
      console.error('[NODUS · Central de Mensagens] Erro ao salvar:', error);
      toast.error(error?.response?.data?.message || 'Não foi possível salvar as variações.');
    } finally { setSaving(false); }
  };
  const confirmApplyPending = async () => {
    if (applying || saving) return;
    setApplying(true);
    try {
      const { data } = await api.post('/api/lead-follow-up-templates/apply-pending');
      toast.success(`Atualização concluída: ${data?.updated ?? 0} mensagem(ns) pendente(s) atualizada(s).`);
      setApplyModal(false);
    } catch (error) {
      console.error('[NODUS · Central de Mensagens] Erro ao aplicar:', error);
      toast.error(error?.response?.data?.message || 'Não foi possível atualizar os follow-ups pendentes.');
    } finally { setApplying(false); }
  };
  const copyMessage = async () => {
    try { await navigator.clipboard.writeText(selectedVariation?.message || ''); toast.success('Mensagem copiada.'); }
    catch { toast.error('Não foi possível copiar a mensagem neste navegador.'); }
  };

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center gap-3 bg-[#050914] text-sm text-slate-400"><span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />Carregando Central de Mensagens...</div>;
  const activeCount = selectedTemplate?.variations?.filter((item) => item.enabled).length || 0;
  const meta = STEP_META[selectedStep] || STEP_META.D0;
  const preview = renderPreview(selectedVariation?.message);

  return <div className="relative min-h-screen overflow-hidden bg-[#050914] px-4 py-6 text-slate-100 md:px-8 md:py-8">
    <div className="pointer-events-none absolute inset-0 overflow-hidden"><div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-blue-500/[0.10] blur-[130px]" /><div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-indigo-500/[0.08] blur-[130px]" /></div>
    <div className="relative mx-auto max-w-7xl space-y-6">
      <header className="relative overflow-hidden rounded-3xl border border-slate-800/90 bg-gradient-to-br from-slate-900 via-slate-950 to-[#080d1b] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:p-8">
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between"><div className="max-w-3xl"><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-blue-300"><FiZap /> CRM NODUS <span className="text-slate-600">/</span> Automação inteligente</div><h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">Central de Variações de Mensagens</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Organize alternativas por etapa, personalize o contato e mantenha a seleção integrada ao fluxo de follow-up.</p></div><div className="flex flex-col gap-2 sm:flex-row"><button type="button" onClick={() => navigate(-1)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"><FiArrowLeft /> Voltar</button><button type="button" onClick={handleSave} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/40 transition hover:from-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"><FiSave /> {saving ? 'Salvando...' : 'Salvar alterações'}</button></div></div>
        <div className="mt-7 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4"><div className="flex items-center gap-2 text-xs font-medium text-slate-400"><FiMessageCircle /> Variações ativas</div><div className="mt-2 text-2xl font-bold text-white">{activeVariationCount}</div><div className="mt-1 text-xs text-slate-500">Nas etapas habilitadas</div></div><div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4"><div className="flex items-center gap-2 text-xs font-medium text-slate-400"><FiClock /> Etapas habilitadas</div><div className="mt-2 text-2xl font-bold text-white">{enabledStepsCount}<span className="ml-1 text-sm font-medium text-slate-500">/ 6</span></div><div className="mt-1 text-xs text-slate-500">D0 até D10</div></div><div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-4"><div className="flex items-center gap-2 text-xs font-medium text-slate-400"><FiCheckCircle /> Última alteração</div><div className="mt-2 text-sm font-bold text-white">{updatedAt ? new Date(updatedAt).toLocaleString('pt-BR') : 'Ainda não registrada'}</div><div className="mt-1 text-xs text-slate-500">Configuração salva no servidor</div></div></div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-slate-800/90 bg-slate-900/80 p-3 shadow-xl"><div className="flex items-center justify-between px-3 pb-3 pt-2"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Sequência de contato</span><span className="rounded-lg bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-400">6 ETAPAS</span></div><div className="space-y-1">{templates.map((item) => { const active = item.step === selectedStep; const count = item.variations.filter((variation) => variation.enabled).length; const itemMeta = STEP_META[item.step] || STEP_META.D0; return <button key={item.step} type="button" onClick={() => setSelectedStep(item.step)} className={`group w-full rounded-xl border p-3 text-left transition ${active ? 'border-blue-400/30 bg-blue-500/[0.12] shadow-lg shadow-blue-950/20' : 'border-transparent hover:border-slate-700 hover:bg-slate-800/60'}`}><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-3"><span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${itemMeta.accent} text-xs font-black text-white shadow-lg`}>{item.step}</span><span><span className={`block text-sm font-semibold ${active ? 'text-white' : 'text-slate-300'}`}>{itemMeta.title}</span><span className="mt-1 block text-xs text-slate-500">{itemMeta.timing}</span></span></div><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${item.enabled ? 'bg-emerald-400/10 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>{item.enabled ? `${count} ativa${count === 1 ? '' : 's'}` : 'Pausada'}</span></div></button>; })}</div><div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-3"><div className="flex items-start gap-2 text-xs leading-5 text-slate-400"><FiInfo className="mt-0.5 shrink-0 text-blue-300" /> O backend prioriza as variações ativas com menor uso registrado, para distribuir as alternativas de forma equilibrada.</div></div></aside>

        <main className="min-w-0 space-y-5"><section className="rounded-2xl border border-slate-800/90 bg-gradient-to-br from-slate-900/90 to-slate-950/90 p-5 shadow-xl md:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><span className={`rounded-lg bg-gradient-to-r ${meta.accent} px-2.5 py-1.5 text-xs font-black text-white`}>{selectedStep}</span><span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{meta.timing}</span></div><h2 className="mt-3 text-xl font-bold text-white">{meta.title}</h2><p className="mt-1 text-sm text-slate-400">Cadastre mensagens alternativas para esta etapa da sequência.</p></div><label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2.5"><span className="text-sm font-medium text-slate-300">{selectedTemplate.enabled ? 'Etapa ativa' : 'Etapa pausada'}</span><input type="checkbox" checked={selectedTemplate.enabled !== false} onChange={(event) => updateStep(selectedStep, { enabled: event.target.checked })} className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500" /></label></div>
          <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"><div className="space-y-3"><div className="flex items-center justify-between gap-3"><div><h3 className="text-sm font-bold text-white">Alternativas da mensagem</h3><p className="mt-1 text-xs text-slate-500">{activeCount} ativa(s) · até 10 por etapa</p></div><button type="button" onClick={addVariation} disabled={selectedTemplate.variations.length >= 10} className="inline-flex items-center gap-2 rounded-xl border border-blue-400/20 bg-blue-500/10 px-3 py-2 text-xs font-bold text-blue-200 transition hover:bg-blue-500/20 disabled:opacity-40"><FiPlus /> Nova variação</button></div>
            <div className="space-y-2">{selectedTemplate.variations.map((variation, index) => <div key={variation.clientId} className={`rounded-xl border p-3 transition ${selectedVariation?.clientId === variation.clientId ? 'border-blue-400/40 bg-blue-500/[0.08]' : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'}`}><div className="flex items-center gap-3"><button type="button" onClick={() => setSelectedVariationId(variation.clientId)} className="flex min-w-0 flex-1 items-center gap-3 text-left"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-black ${variation.enabled ? 'bg-blue-500/15 text-blue-300' : 'bg-slate-800 text-slate-500'}`}>V{index + 1}</span><span className="min-w-0 flex-1"><span className="flex items-center gap-2 text-sm font-semibold text-slate-200">Variação {index + 1}{selectedVariation?.clientId === variation.clientId && <FiCheck className="text-blue-300" />}</span><span className="mt-1 block truncate text-xs text-slate-500">{variation.message || 'Mensagem ainda não preenchida'}</span><span className="mt-1 block text-[10px] text-slate-600">{usageByVariation[String(variation._id || variation.clientId)]?.usageCount ?? 0} uso(s) registrado(s){usageByVariation[String(variation._id || variation.clientId)]?.lastUsedAt ? ` · último ${new Date(usageByVariation[String(variation._id || variation.clientId)].lastUsedAt).toLocaleDateString('pt-BR')}` : ''}</span></span></button><label title={variation.enabled ? 'Desativar variação' : 'Ativar variação'} className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={variation.enabled !== false} onChange={(event) => updateVariation(selectedStep, variation.clientId, { enabled: event.target.checked })} className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500" /></label><button type="button" onClick={() => removeVariation(variation)} aria-label={`Remover variação ${index + 1}`} className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-300"><FiTrash2 /></button></div></div>)}</div></div>
            <div className="space-y-4"><div className="rounded-2xl border border-slate-800 bg-[#080d19] p-4"><div className="flex items-center justify-between gap-3"><div><h3 className="text-sm font-bold text-white">Editor da variação</h3><p className="mt-1 text-xs text-slate-500">Personalize sem perder as variáveis dinâmicas.</p></div><span className="rounded-lg bg-slate-800 px-2 py-1 text-[10px] font-bold uppercase text-slate-400">{(selectedVariation?.message || '').length}/2000</span></div><textarea value={selectedVariation?.message || ''} onChange={(event) => updateVariation(selectedStep, selectedVariation.clientId, { message: event.target.value })} maxLength={2000} rows={7} placeholder="Escreva a mensagem desta alternativa..." className="mt-4 w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm leading-6 text-slate-200 outline-none transition placeholder:text-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20" /><div className="mt-3 flex flex-wrap items-center justify-between gap-2"><button type="button" onClick={() => setShowVariables((value) => !value)} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800"><FiPlus /> {showVariables ? 'Ocultar variáveis' : 'Inserir variável'}</button><button type="button" onClick={copyMessage} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800"><FiCopy /> Copiar texto</button></div>{showVariables && <div className="mt-3 flex flex-wrap gap-2 rounded-xl border border-slate-800 bg-slate-900/70 p-3">{VARIABLES.map(([token, label]) => <button key={token} type="button" title={label} onClick={() => insertVariable(token)} className="rounded-lg border border-blue-400/20 bg-blue-500/10 px-2.5 py-1.5 font-mono text-[11px] text-blue-200 transition hover:bg-blue-500/20">{token}</button>)}</div>}</div>
              <div className="rounded-2xl border border-emerald-400/15 bg-gradient-to-br from-emerald-500/[0.07] to-teal-500/[0.025] p-4"><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2 text-sm font-bold text-emerald-100"><FiMessageCircle /> Prévia da conversa</div><span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/70">Exemplo</span></div><div className="mt-4 flex items-start gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-black text-white">N</div><div className="min-w-0 flex-1"><div className="mb-1 flex items-center justify-between gap-3 text-[11px] text-slate-500"><span>CRM NODUS · exemplo</span><span>Agora</span></div><div className="rounded-2xl rounded-tl-md border border-emerald-400/10 bg-[#10251f] px-4 py-3 text-sm leading-6 text-emerald-50 shadow-lg shadow-black/10">{preview || <span className="italic text-slate-500">Digite uma mensagem para visualizar a prévia.</span>}</div><div className="mt-2 text-right text-[10px] text-slate-500">Prévia fictícia — nenhum WhatsApp será enviado</div></div></div></div>
            </div></div>
        </section>

        <section className="grid gap-4 md:grid-cols-2"><div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><div className="flex items-start gap-3"><span className="rounded-xl bg-blue-500/10 p-2.5 text-blue-300"><FiRefreshCw size={18} /></span><div><h3 className="text-sm font-bold text-white">Seleção equilibrada</h3><p className="mt-1 text-sm leading-6 text-slate-400">A seleção é feita no backend com base no menor uso registrado entre as variações ativas. A interface configura as alternativas sem tentar contornar regras do WhatsApp.</p></div></div></div><div className="rounded-2xl border border-amber-400/15 bg-amber-500/[0.04] p-5"><div className="flex items-start gap-3"><span className="rounded-xl bg-amber-500/10 p-2.5 text-amber-300"><FiShield size={18} /></span><div><h3 className="text-sm font-bold text-amber-100">Contato responsável</h3><p className="mt-1 text-sm leading-6 text-slate-300">Use as variações para personalizar mensagens legítimas. A automação deve respeitar consentimento, frequência adequada e interrupção quando o lead responder.</p></div></div></div></section>
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-2 text-xs leading-5 text-slate-400"><FiInfo className="mt-0.5 shrink-0 text-blue-300" /> Salvar altera a configuração. Aplicar às pendentes atualiza apenas mensagens com status pendente.</div><button type="button" onClick={() => setApplyModal(true)} disabled={saving || applying} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-bold text-slate-200 transition hover:border-slate-600 hover:bg-slate-700 disabled:opacity-50"><FiRefreshCw className={applying ? 'animate-spin' : ''} /> {applying ? 'Aplicando...' : 'Aplicar às pendentes'}</button></div>
        </main>
      </div>
    </div>
    {applyModal && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget && !applying) setApplyModal(false); }}><div role="dialog" aria-modal="true" aria-labelledby="apply-followups-title" className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#0b1220] p-6 shadow-2xl shadow-black/50"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300"><FiRefreshCw size={22} /></div><h2 id="apply-followups-title" className="mt-4 text-lg font-bold text-white">Atualizar mensagens pendentes?</h2><p className="mt-2 text-sm leading-6 text-slate-400">A ação recalcula o texto dos follow-ups com status <strong className="text-slate-200">pending</strong>. Mensagens enviadas, simuladas, em processamento ou canceladas não serão alteradas. Isso não dispara um envio por si só.</p><div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" disabled={applying} onClick={() => setApplyModal(false)} className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-50">Cancelar</button><button type="button" disabled={applying} onClick={confirmApplyPending} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50"><FiRefreshCw className={applying ? 'animate-spin' : ''} /> {applying ? 'Atualizando...' : 'Confirmar atualização'}</button></div></div></div>}
  </div>;
}

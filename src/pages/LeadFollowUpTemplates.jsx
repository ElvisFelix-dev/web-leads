import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiSave, FiRefreshCw, FiMessageCircle, FiClock, FiInfo, FiCheckCircle } from 'react-icons/fi'
import { UserContext } from '../../context/UserContext'
import api from '../../service/api'

const DEFAULT_TEMPLATES = [
  { step: 'D0', label: 'D0 · Primeiro contato', message: 'Olá, {nome}! Recebemos seu interesse{referencia_imovel} e estamos à disposição para ajudar. Você ainda está procurando um imóvel?' },
  { step: 'D1', label: 'D1 · Após 1 dia', message: 'Olá, {nome}! Passando para saber se você conseguiu avançar na busca{referencia_imovel}. Posso ajudar com as opções disponíveis?' },
  { step: 'D3', label: 'D3 · Após 3 dias', message: 'Olá, {nome}! Gostaria de saber se ainda podemos ajudar na sua busca{referencia_imovel}. Se suas preferências mudaram, podemos considerar isso também.' },
  { step: 'D5', label: 'D5 · Após 5 dias', message: 'Olá, {nome}! Continuo à disposição para ajudar você a encontrar um imóvel que faça sentido para suas necessidades. Podemos conversar?' },
  { step: 'D7', label: 'D7 · Após 7 dias', message: 'Olá, {nome}! Ainda podemos ajudar na sua busca por um imóvel. Se quiser continuar, basta responder a esta mensagem.' },
  { step: 'D10', label: 'D10 · Último contato', message: 'Olá, {nome}! Este é nosso último contato automático por enquanto. Se ainda estiver procurando um imóvel, pode responder por aqui que teremos prazer em ajudar.' },
]

const VARIABLES = [
  ['{nome}', 'Primeiro nome'],
  ['{nome_completo}', 'Nome completo'],
  ['{imovel}', 'Nome do imóvel'],
  ['{codigo_imovel}', 'Código do imóvel'],
  ['{bairro}', 'Bairro'],
  ['{cidade}', 'Cidade'],
  ['{referencia_imovel}', 'Referência automática do imóvel'],
]

const makePreview = (message) => String(message || '')
  .replaceAll('{nome}', 'Mariana')
  .replaceAll('{nome_completo}', 'Mariana Oliveira')
  .replaceAll('{imovel}', 'Apartamento com varanda')
  .replaceAll('{codigo_imovel}', 'NV-000123')
  .replaceAll('{bairro}', 'Vila Mariana')
  .replaceAll('{cidade}', 'São Paulo')
  .replaceAll('{referencia_imovel}', ' sobre o imóvel Apartamento com varanda, no bairro Vila Mariana, em São Paulo')
  .replace(/[ \t]{2,}/g, ' ')

export default function LeadFollowUpTemplates() {
  const { user } = useContext(UserContext)
  const isAdmin = user?.isAdmin === true || user?.role === 'admin'
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [applying, setApplying] = useState(false)
  const [selectedStep, setSelectedStep] = useState('D0')
  const [updatedAt, setUpdatedAt] = useState(null)

  const selectedTemplate = useMemo(
    () => templates.find((item) => item.step === selectedStep) || templates[0],
    [templates, selectedStep],
  )

  const loadTemplates = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/api/lead-follow-up-templates')
      if (Array.isArray(data?.templates) && data.templates.length) {
        setTemplates(data.templates)
      }
      setUpdatedAt(data?.updatedAt || null)
    } catch (error) {
      console.error('[CentralFollowUps] Erro ao carregar mensagens:', error)
      toast.error(error?.response?.data?.message || 'Não foi possível carregar as mensagens.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAdmin) loadTemplates()
  }, [isAdmin, loadTemplates])

  if (!isAdmin) return <Navigate to="/dashboard" replace />

  const updateMessage = (step, message) => {
    setTemplates((current) => current.map((item) => item.step === step ? { ...item, message } : item))
  }

  const insertVariable = (variable) => {
    if (!selectedTemplate) return
    updateMessage(selectedTemplate.step, `${selectedTemplate.message || ''}${variable}`)
  }

  const handleSave = async () => {
    if (templates.some((item) => !String(item.message || '').trim())) {
      toast.error('Todas as mensagens precisam ter algum conteúdo.')
      return
    }
    setSaving(true)
    try {
      const { data } = await api.put('/api/lead-follow-up-templates', { templates })
      if (Array.isArray(data?.templates)) setTemplates(data.templates)
      setUpdatedAt(data?.updatedAt || new Date().toISOString())
      toast.success('Mensagens salvas com sucesso!')
    } catch (error) {
      console.error('[CentralFollowUps] Erro ao salvar mensagens:', error)
      toast.error(error?.response?.data?.message || 'Não foi possível salvar as mensagens.')
    } finally {
      setSaving(false)
    }
  }

  const handleApplyPending = async () => {
    const confirmed = window.confirm('Atualizar o texto de todos os follow-ups que ainda estão pendentes? Mensagens enviadas, canceladas ou em processamento não serão alteradas.')
    if (!confirmed) return
    setApplying(true)
    try {
      const { data } = await api.post('/api/lead-follow-up-templates/apply-pending')
      toast.success(`Atualização concluída: ${data?.updated ?? 0} mensagem(ns) pendente(s) atualizada(s).`)
    } catch (error) {
      console.error('[CentralFollowUps] Erro ao aplicar mensagens pendentes:', error)
      toast.error(error?.response?.data?.message || 'Não foi possível atualizar os follow-ups pendentes.')
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-slate-500">Carregando mensagens de follow-up...</div>
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-2xl bg-slate-950 p-6 text-white shadow-xl md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-300">
              <FiMessageCircle /> ADMINISTRAÇÃO · AUTOMAÇÃO WHATSAPP
            </div>
            <h1 className="text-2xl font-bold md:text-3xl">Central de Follow-ups</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">Edite as mensagens automáticas enviadas ao longo da sequência. As alterações ficam salvas no MongoDB.</p>
          </div>
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60">
            <FiSave /> {saving ? 'Salvando...' : 'Salvar mensagens'}
          </button>
        </header>

        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="px-3 pb-3 pt-2 text-xs font-bold uppercase tracking-wider text-slate-400">Sequência atual</div>
            <div className="space-y-1">
              {templates.map((item) => (
                <button key={item.step} onClick={() => setSelectedStep(item.step)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${selectedStep === item.step ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100' : 'text-slate-600 hover:bg-slate-50'}`}>
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${selectedStep === item.step ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{item.step}</span>
                  <span className="min-w-0"><span className="block text-sm font-semibold">{item.label.split(' · ')[1] || item.label}</span><span className="mt-0.5 block text-xs text-slate-400">{item.step === 'D0' ? '5 minutos após agendar' : item.step === 'D1' ? 'Após 1 dia' : `Após ${item.step.slice(1)} dias`}</span></span>
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800"><FiInfo className="mr-1 inline" /> A sequência mantém os prazos já configurados. Esta tela altera o conteúdo das mensagens.</div>
          </aside>

          <section className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div><p className="text-sm font-medium text-blue-600">Mensagem {selectedTemplate?.step}</p><h2 className="mt-1 text-xl font-bold text-slate-900">{selectedTemplate?.label}</h2><p className="mt-1 text-sm text-slate-500">Personalize o texto abaixo. Os campos entre chaves serão substituídos automaticamente.</p></div>
                <span className="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:inline-flex sm:items-center sm:gap-1"><FiCheckCircle /> Editável</span>
              </div>

              <label htmlFor="follow-up-message" className="mb-2 block text-sm font-semibold text-slate-700">Conteúdo da mensagem</label>
              <textarea id="follow-up-message" value={selectedTemplate?.message || ''} onChange={(event) => updateMessage(selectedTemplate.step, event.target.value)} maxLength={2000} rows={7} className="w-full resize-y rounded-xl border border-slate-300 bg-white p-4 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Digite o texto que será enviado ao lead..." />
              <div className="mt-2 flex items-center justify-between text-xs text-slate-400"><span>Use as variáveis abaixo para personalizar a conversa.</span><span>{selectedTemplate?.message?.length || 0}/2000</span></div>

              <div className="mt-6"><p className="mb-3 text-sm font-semibold text-slate-700">Inserir variável</p><div className="flex flex-wrap gap-2">{VARIABLES.map(([variable, label]) => <button key={variable} type="button" onClick={() => insertVariable(variable)} title={label} className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100">{variable}</button>)}</div></div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
              <div className="mb-4 flex items-center gap-2"><FiMessageCircle className="text-emerald-600" /><h3 className="font-bold text-slate-900">Prévia da mensagem</h3><span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Exemplo</span></div>
              <div className="max-w-2xl rounded-2xl rounded-tl-sm bg-emerald-50 p-4 text-sm leading-6 text-slate-800 shadow-sm">{makePreview(selectedTemplate?.message)}<div className="mt-2 text-right text-[10px] text-slate-400">Prévia ilustrativa · WhatsApp</div></div>
              <p className="mt-4 text-xs leading-5 text-slate-500">Se o lead não estiver associado a um imóvel, a variável <code className="rounded bg-slate-100 px-1 py-0.5">{'{referencia_imovel}'}</code> ficará vazia. Os outros campos do imóvel também ficam vazios quando não houver dados.</p>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl"><div className="flex items-center gap-2 font-bold text-slate-900"><FiRefreshCw className="text-blue-600" /> Aplicar alterações às mensagens pendentes</div><p className="mt-1 text-sm leading-5 text-slate-500">Opcional: depois de salvar, atualize as mensagens ainda pendentes. Mensagens enviadas ou canceladas não serão alteradas.</p></div>
              <button type="button" onClick={handleApplyPending} disabled={applying || saving} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"><FiRefreshCw className={applying ? 'animate-spin' : ''} /> {applying ? 'Aplicando...' : 'Atualizar pendentes'}</button>
            </div>

            <div className="flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between"><span className="inline-flex items-center gap-1"><FiClock /> Prazos mantidos: D0 (5 min), D1, D3, D5, D7 e D10.</span><span>{updatedAt ? `Última atualização: ${new Date(updatedAt).toLocaleString('pt-BR')}` : 'Ainda não há data de atualização registrada.'}</span></div>
          </section>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Edit,
  ExternalLink,
  FileText,
  History,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  User,
  Building2,
  BriefcaseBusiness,
  Target,
  Clock3,
  AlertCircle,
  ChevronRight,
  CheckCircle2,
  X,
  Link2,
  Copy,
  Send,
  LoaderCircle,
  Check,
} from 'lucide-react';

import api from '../service/api';

import { useChat } from '../context/ChatContext';

import LeadHistory from '../components/lead/LeadHistory';

import LeadRecentMessages from '../components/lead/LeadRecentMessages';

export default function LeadDetails() {
  const { id } = useParams();

  const navigate = useNavigate();

  const { openLeadConversation } = useChat();

  const [lead, setLead] = useState(null);

  const [proposals, setProposals] = useState([]);

  const [visits, setVisits] = useState([]);

  const [loading, setLoading] = useState(true);

  const [loadingProposals, setLoadingProposals] = useState(false);

  const [loadingVisits, setLoadingVisits] = useState(false);

  const [openingChat, setOpeningChat] = useState(false);

  const [error, setError] = useState(null);

  const [chatError, setChatError] = useState('');

  // Link público individual da proposta.
  const [publicProposalUrl, setPublicProposalUrl] = useState('');
  const [publicProposalExpiresAt, setPublicProposalExpiresAt] = useState(null);
  const [generatingPublicLink, setGeneratingPublicLink] = useState(false);
  const [copyingPublicLink, setCopyingPublicLink] = useState(false);
  const [publicLinkError, setPublicLinkError] = useState('');
  const [publicLinkSuccess, setPublicLinkSuccess] = useState('');

  /*

   * ============================================================

   * CARREGAR LEAD

   * ============================================================

   */

  useEffect(() => {
    async function loadLead() {
      try {
        setLoading(true);

        setError(null);

        const response = await api.get(`/api/leads/${id}`);

        const payload = response?.data;

        const loadedLead =
          payload?.data?.lead || payload?.data || payload?.lead || payload;

        setLead(loadedLead || null);
      } catch (error) {
        console.error('Erro ao carregar lead:', error);

        setError(
          error?.response?.data?.message || 'Não foi possível carregar o lead.',
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadLead();
    }
  }, [id]);

  /*

   * ============================================================

   * CARREGAR PROPOSTAS DO LEAD

   * ============================================================

   */

  useEffect(() => {
    async function loadProposals() {
      if (!id) return;

      try {
        setLoadingProposals(true);

        const response = await api.get(`/api/proposals/lead/${id}`);

        const payload = response?.data;

        const loadedProposals =
          payload?.data?.proposals || payload?.data || payload?.proposals || [];

        setProposals(Array.isArray(loadedProposals) ? loadedProposals : []);
      } catch (error) {
        console.error('Erro ao carregar propostas do lead:', error);

        setProposals([]);
      } finally {
        setLoadingProposals(false);
      }
    }

    loadProposals();
  }, [id]);

  /*

   * ============================================================

   * CARREGAR VISITAS DO LEAD

   * ============================================================

   *

   * O imóvel visitado é obtido da própria visita,

   * priorizando visit.propertyInfo.

   *

   * Não utilizamos lead.property para exibir o imóvel visitado.

   */

  useEffect(() => {
    async function loadVisits() {
      if (!id) return;

      try {
        setLoadingVisits(true);

        const response = await api.get('/api/visits', {
          params: {
            page: 1,

            limit: 100,
          },
        });

        const payload = response?.data;

        const loadedVisits =
          payload?.data?.visits ||
          payload?.data?.items ||
          payload?.visits ||
          payload?.items ||
          payload?.data ||
          [];

        if (!Array.isArray(loadedVisits)) {
          setVisits([]);

          return;
        }

        const leadVisits = loadedVisits.filter((visit) => {
          const visitLeadId =
            visit?.leadInfo?.id ||
            visit?.leadInfo?._id ||
            visit?.lead?._id ||
            visit?.lead?.id ||
            (typeof visit?.lead === 'string' ? visit.lead : null);

          return visitLeadId && String(visitLeadId) === String(id);
        });

        setVisits(leadVisits);
      } catch (error) {
        console.error('Erro ao carregar visitas do lead:', error);

        setVisits([]);
      } finally {
        setLoadingVisits(false);
      }
    }

    loadVisits();
  }, [id]);

  /*

   * ============================================================

   * PROPOSTAS NORMALIZADAS

   * ============================================================

   */

  const normalizedProposals = useMemo(() => {
    const leadProposals = Array.isArray(lead?.proposals) ? lead.proposals : [];

    const source = proposals.length > 0 ? proposals : leadProposals;

    return [...source].sort((a, b) => {
      return getProposalDateValue(b) - getProposalDateValue(a);
    });
  }, [proposals, lead?.proposals]);

  /*

   * ============================================================

   * PROPOSTA MAIS RECENTE

   * ============================================================

   */

  const latestProposal = useMemo(() => {
    return normalizedProposals[0] || null;
  }, [normalizedProposals]);

  /*

   * ============================================================

   * DATA DA PROPOSTA

   * ============================================================

   */

  const proposalDate = useMemo(() => {
    if (lead?.proposalDate) {
      return lead.proposalDate;
    }

    if (latestProposal) {
      return getProposalDate(latestProposal);
    }

    return null;
  }, [lead?.proposalDate, latestProposal]);

  /*

   * ============================================================

   * VALOR DA PROPOSTA

   * ============================================================

   */

  const latestProposalValue = useMemo(() => {
    if (!latestProposal) return null;

    return getProposalValue(latestProposal);
  }, [latestProposal]);

  /*

   * ============================================================

   * VISITAS REALIZADAS COM IMÓVEL

   * ============================================================

   */

  const completedVisits = useMemo(() => {
    if (!Array.isArray(visits)) return [];

    return visits

      .filter((visit) => {
        if (!isCompletedVisit(visit)) return false;

        return Boolean(extractVisitProperty(visit));
      })

      .sort((a, b) => getVisitDateValue(b) - getVisitDateValue(a));
  }, [visits]);

  /*

   * ============================================================

   * ÚLTIMA VISITA REALIZADA

   * ============================================================

   */

  const latestCompletedVisit = useMemo(() => {
    return completedVisits[0] || null;
  }, [completedVisits]);

  /*

   * ============================================================

   * IMÓVEL EFETIVAMENTE VISITADO

   * ============================================================

   */

  const visitedProperty = useMemo(() => {
    if (!latestCompletedVisit) return null;

    return extractVisitProperty(latestCompletedVisit);
  }, [latestCompletedVisit]);

  /*

   * ============================================================

   * DATA DA VISITA REALIZADA

   * ============================================================

   */

  const completedVisitDate = useMemo(() => {
    if (!latestCompletedVisit) return null;

    return getVisitDate(latestCompletedVisit);
  }, [latestCompletedVisit]);

  /*

   * ============================================================

   * FORMATADORES

   * ============================================================

   */

  const formatDate = (date, withTime = false) => {
    if (!date) return '-';

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return '-';

    return parsedDate.toLocaleDateString('pt-BR', {
      day: '2-digit',

      month: '2-digit',

      year: 'numeric',

      ...(withTime
        ? {
            hour: '2-digit',

            minute: '2-digit',
          }
        : {}),
    });
  };

  const formatCurrency = (value) => {
    if (
      value === undefined ||
      value === null ||
      value === '' ||
      Number.isNaN(Number(value))
    ) {
      return '-';
    }

    return Number(value).toLocaleString('pt-BR', {
      style: 'currency',

      currency: 'BRL',
    });
  };

  /*

   * ============================================================

   * WHATSAPP WEB

   * ============================================================

   */

  const whatsappUrl = useMemo(() => {
    const phone = normalizePhone(lead?.phone);

    if (!phone) return null;

    // Evita adicionar o código do Brasil duas vezes.

    const internationalPhone = phone.startsWith('55') ? phone : `55${phone}`;

    return `https\://wa.me/${internationalPhone}`;
  }, [lead?.phone]);

  /*

   * ============================================================

   * ABRIR CONVERSA WHATSAPP DENTRO DO CRM

   * ============================================================

   *

   * A função openLeadConversation deve estar implementada

   * no ChatContext e localizar a conversa vinculada ao lead.

   *

   * O envio da mensagem continua sendo feito pela tela de chat.

   */

  const handleOpenWhatsAppChat = async () => {
    if (!lead?._id || openingChat) return;

    setOpeningChat(true);

    setChatError('');

    try {
      if (typeof openLeadConversation !== 'function') {
        throw new Error(
          'A função de abrir conversas não está disponível no ChatContext.',
        );
      }

      await openLeadConversation(lead._id);

      navigate('/chat');
    } catch (error) {
      console.error('Erro ao abrir conversa WhatsApp:', error);

      setChatError(
        error?.response?.data?.message ||
          error?.message ||
          'Não foi possível abrir a conversa deste lead.',
      );
    } finally {
      setOpeningChat(false);
    }
  };

  /*

   * ============================================================

   * AÇÕES

   * ============================================================

   */

  const handleCreateProposal = () => {
    if (!lead?._id) return;

    navigate(`/proposals/create?lead=${lead._id}`);
  };

  // Gera um link público individual validado pelo backend.
  const handleGeneratePublicProposalLink = async () => {
    if (!lead?._id || generatingPublicLink) return;

    setGeneratingPublicLink(true);
    setPublicLinkError('');
    setPublicLinkSuccess('');

    try {
      const leadPropertyId =
        typeof lead.property === 'string'
          ? lead.property
          : lead.property?._id || lead.property?.id;

      const visitedPropertyId =
        typeof visitedProperty === 'string'
          ? visitedProperty
          : visitedProperty?._id || visitedProperty?.id;

      const propertyId = leadPropertyId || visitedPropertyId;

      if (!propertyId) {
        throw new Error(
          'Este lead ainda não possui um imóvel vinculado. Vincule um imóvel disponível antes de gerar o link.',
        );
      }

      const response = await api.post('/api/public-proposals/links', {
        leadId: lead._id,
        propertyId,
      });

      const result = response?.data?.data || response?.data;
      const linkPath = result?.path;

      if (!linkPath || !result?.token) {
        throw new Error(
          'O servidor não retornou o link público. Confira a integração da rota de propostas públicas.',
        );
      }

      setPublicProposalUrl(
        /^https?:\/\//i.test(linkPath)
          ? linkPath
          : `${window.location.origin}${linkPath.startsWith('/') ? '' : '/'}${linkPath}`,
      );
      setPublicProposalExpiresAt(result.expiresAt || null);
      setPublicLinkSuccess(
        'Link gerado com segurança. Copie e compartilhe com o cliente.',
      );
    } catch (error) {
      console.error('Erro ao gerar link público da proposta:', error);
      setPublicLinkError(
        error?.response?.data?.message ||
          error?.message ||
          'Não foi possível gerar o link público da proposta.',
      );
    } finally {
      setGeneratingPublicLink(false);
    }
  };

  const handleCopyPublicProposalLink = async () => {
    if (!publicProposalUrl || copyingPublicLink) return;

    setCopyingPublicLink(true);
    setPublicLinkError('');
    setPublicLinkSuccess('');

    try {
      await navigator.clipboard.writeText(publicProposalUrl);
      setPublicLinkSuccess(
        'Link copiado. Agora você pode enviá-lo ao cliente.',
      );
    } catch (error) {
      console.error('Erro ao copiar link público:', error);
      setPublicLinkError(
        'Não foi possível copiar automaticamente. Selecione e copie o link exibido.',
      );
    } finally {
      setCopyingPublicLink(false);
    }
  };

  const handleSendPublicProposalWhatsApp = async () => {
    if (!publicProposalUrl || !lead?._id || !lead?.phone) {
      setPublicLinkError(
        'Gere o link da proposta e confirme se o lead possui telefone cadastrado.',
      );
      return;
    }

    if (openingChat) return;

    const message = `Olá, ${lead.name || 'tudo bem'}! Segue o link seguro para preencher sua proposta do imóvel: ${publicProposalUrl}`;

    setOpeningChat(true);
    setPublicLinkError('');
    setPublicLinkSuccess('');

    try {
      if (typeof openLeadConversation !== 'function') {
        throw new Error(
          'A integração de conversas não está disponível no ChatContext.',
        );
      }

      // Localiza/seleciona a conversa WhatsApp vinculada ao lead no CRM.
      const conversation = await openLeadConversation(lead._id);

      if (!conversation?._id) {
        throw new Error(
          'A conversa foi aberta, mas não foi possível identificar seu ID para enviar a proposta.',
        );
      }

      // Passa o ID exato da conversa selecionada para evitar depender
      // do formato do vínculo lead/conversa retornado pelo backend.
      navigate('/chat', {
        state: {
          crmWhatsAppSend: {
            requestId: `public-proposal-${lead._id}-${Date.now()}`,
            leadId: String(lead._id),
            conversationId: String(conversation._id),
            message,
          },
        },
      });
    } catch (error) {
      console.error(
        'Erro ao enviar link da proposta pelo WhatsApp do CRM:',
        error,
      );
      setPublicLinkError(
        error?.response?.data?.message ||
          error?.message ||
          'Não foi possível abrir a conversa WhatsApp deste lead no CRM.',
      );
    } finally {
      setOpeningChat(false);
    }
  };

  const handleEdit = () => {
    if (!lead?._id) return;

    navigate(`/leads/${lead._id}/edit`);
  };

  /*

   * ============================================================

   * LOADING

   * ============================================================

   */

  if (loading) {
    return <LeadDetailsSkeleton />;
  }

  /*

   * ============================================================

   * ERROR

   * ============================================================

   */

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="mx-auto max-w-7xl">
          <button
            type="button"

            onClick={() => navigate(-1)}

            className="mb-6 flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                <AlertCircle size={22} />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Não foi possível carregar o lead
                </h2>

                <p className="mt-1 text-sm text-slate-400">{error}</p>

                <button
                  type="button"

                  onClick={() => window.location.reload()}

                  className="mt-4 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!lead) return null;

  /*

   * ============================================================

   * DADOS RELACIONADOS

   * ============================================================

   */

  const assignedTo = lead.assignedTo;

  const createdBy = lead.createdBy;

  const sourceBroker = lead.sourceBroker;

  /*

   * ============================================================

   * RENDER

   * ============================================================

   */

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
        {/* TOP BAR */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"

            onClick={() => navigate(-1)}

            className="flex w-fit items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {/* NOVO: ABRIR CONVERSA DENTRO DO CRM */}

            <button
              type="button"

              onClick={handleOpenWhatsAppChat}

              disabled={openingChat}

              className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-400 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <MessageCircle size={17} />

              {openingChat ? 'Abrindo conversa...' : 'Conversar no CRM'}
            </button>

            {/* WHATSAPP WEB EXISTENTE */}

            {/* {whatsappUrl && (

              <a

                href={whatsappUrl}

                target="_blank"

                rel="noopener noreferrer"

                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"

              >

                <ExternalLink size={17} />

                WhatsApp Web

              </a>

            )} */}

            <button
              type="button"

              onClick={handleEdit}

              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
            >
              <Edit size={17} />
              Editar
            </button>

            <button
              type="button"

              onClick={handleCreateProposal}

              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-blue-500"
            >
              <FileText size={17} />
              Fazer proposta
            </button>
          </div>
        </div>

        {/* ERRO AO ABRIR CONVERSA */}

        {chatError && (
          <div
            role="alert"

            className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />

            <div className="min-w-0 flex-1">
              <p className="font-medium">Não foi possível abrir a conversa</p>

              <p className="mt-1 break-words text-red-300/80">{chatError}</p>
            </div>

            <button
              type="button"

              onClick={() => setChatError('')}

              aria-label="Fechar mensagem de erro"

              className="text-red-300 transition hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* LEAD HEADER */}

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <div className="p-6 lg:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                  <User size={26} />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-bold text-white sm:text-3xl">
                      {lead.name}
                    </h1>

                    <Badge
                      text={formatLabel(lead.status)}

                      type={getStatusBadgeType(lead.status)}
                    />
                  </div>

                  <p className="mt-2 text-sm text-slate-400">
                    Lead criado em {formatDate(lead.createdAt, true)}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge text={formatLabel(lead.stage)} type="blue" />

                    <Badge
                      text={`Prioridade: ${formatLabel(lead.priority)}`}

                      type={getPriorityBadgeType(lead.priority)}
                    />

                    {lead.sourceType && (
                      <Badge text={formatLabel(lead.sourceType)} type="gray" />
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:min-w-[420px]">
                <MetricCard
                  label="Score"

                  value={lead.score ?? 0}

                  icon={<Target size={17} />}
                />

                <MetricCard
                  label="Proposta"

                  value={
                    latestProposalValue !== null
                      ? formatCurrency(latestProposalValue)
                      : lead.proposalValue
                        ? formatCurrency(lead.proposalValue)
                        : '0'
                  }

                  icon={<FileText size={17} />}
                />

                <MetricCard
                  label="Data proposta"

                  value={proposalDate ? formatDate(proposalDate) : '-'}

                  icon={<Calendar size={17} />}
                />
              </div>
            </div>
          </div>
        </section>

        {/* PRÓXIMA AÇÃO */}

        {(lead.nextAction || lead.nextActionDate) && (
          <section className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-blue-400">
                  <Clock3 size={20} />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-blue-400">
                    Próxima ação
                  </p>

                  <p className="mt-1 font-medium text-white">
                    {lead.nextAction || 'Ação não definida'}
                  </p>

                  {lead.nextActionDate && (
                    <p className="mt-1 text-sm text-slate-400">
                      Agendada para {formatDate(lead.nextActionDate, true)}
                    </p>
                  )}
                </div>
              </div>

              <button
                type="button"

                onClick={() => navigate('/calendar')}

                className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400 transition hover:bg-blue-500/20"
              >
                Ver agenda
                <ArrowRight size={16} />
              </button>
            </div>
          </section>
        )}

        {/* GRID PRINCIPAL */}

        <div className="grid gap-6 xl:grid-cols-3">
          {/* COLUNA PRINCIPAL */}

          <div className="space-y-6 xl:col-span-2">
            {/* INFORMAÇÕES DO LEAD */}

            <Card title="Informações do Lead" icon={<User size={18} />}>
              <div className="grid gap-6 md:grid-cols-2">
                <Info
                  icon={<User size={18} />}

                  label="Nome"

                  value={lead.name}
                />

                <Info
                  icon={<Mail size={18} />}

                  label="Email"

                  value={lead.email}

                  href={lead.email ? `mailto:${lead.email}` : null}
                />

                <Info
                  icon={<Phone size={18} />}

                  label="Telefone"

                  value={lead.phone}

                  href={lead.phone ? `tel:${lead.phone}` : null}
                />

                <Info
                  icon={<MapPin size={18} />}

                  label="Região"

                  value={formatLabel(lead.region)}
                />

                <Info
                  icon={<Building2 size={18} />}

                  label="Origem"

                  value={formatLabel(lead.source)}
                />

                <Info
                  icon={<Target size={18} />}

                  label="Tipo de origem"

                  value={formatLabel(lead.sourceType)}
                />

                {lead.sourceSite && (
                  <Info
                    icon={<ExternalLink size={18} />}

                    label="Site de origem"

                    value={lead.sourceSite}
                  />
                )}

                {lead.landingPage && (
                  <Info
                    icon={<ExternalLink size={18} />}

                    label="Landing page"

                    value={lead.landingPage}
                  />
                )}
              </div>
            </Card>

            {/* IMÓVEL EFETIVAMENTE VISITADO */}

            {!loadingVisits && visitedProperty && (
              <PropertyCard
                property={visitedProperty}

                visit={latestCompletedVisit}

                visitDate={completedVisitDate}

                onCreateProposal={handleCreateProposal}

                navigate={navigate}
              />
            )}

            {/* PROPOSTAS */}

            <ProposalCard
              proposals={normalizedProposals}
              loading={loadingProposals}
              onCreateProposal={handleCreateProposal}
              navigate={navigate}
            />

            {/* PROPOSTA PÚBLICA PARA O CLIENTE */}
            <Card title="Link público de proposta" icon={<Link2 size={18} />}>
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <Link2 size={19} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-white">
                      Envie a proposta para o cliente preencher
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      Gere um link individual vinculado a este lead, ao imóvel
                      disponível e ao corretor responsável. O cliente poderá
                      informar os valores e as condições da proposta.
                    </p>
                  </div>
                </div>

                {!publicProposalUrl ? (
                  <button
                    type="button"
                    onClick={handleGeneratePublicProposalLink}
                    disabled={generatingPublicLink}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {generatingPublicLink ? (
                      <LoaderCircle size={17} className="animate-spin" />
                    ) : (
                      <Link2 size={17} />
                    )}
                    {generatingPublicLink
                      ? 'Gerando link seguro...'
                      : 'Gerar link público'}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <label
                      htmlFor="public-proposal-url"
                      className="block text-xs font-medium uppercase tracking-wide text-slate-500"
                    >
                      Link para compartilhar
                    </label>
                    <input
                      id="public-proposal-url"
                      type="text"
                      readOnly
                      value={publicProposalUrl}
                      onFocus={(event) => event.target.select()}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-3 text-sm text-slate-200 outline-none focus:border-blue-500"
                    />

                    {publicProposalExpiresAt && (
                      <p className="text-xs text-slate-500">
                        Válido até {formatDate(publicProposalExpiresAt, true)}.
                        O link é individual e de uso único.
                      </p>
                    )}

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={handleCopyPublicProposalLink}
                        disabled={copyingPublicLink}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-700 disabled:opacity-60"
                      >
                        {copyingPublicLink ? (
                          <LoaderCircle size={16} className="animate-spin" />
                        ) : (
                          <Copy size={16} />
                        )}
                        {copyingPublicLink ? 'Copiando...' : 'Copiar link'}
                      </button>

                      <button
                        type="button"
                        onClick={handleSendPublicProposalWhatsApp}
                        disabled={!lead.phone || openingChat}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {openingChat ? (
                          <LoaderCircle size={16} className="animate-spin" />
                        ) : (
                          <Send size={16} />
                        )}
                        {openingChat
                          ? 'Enviando pelo CRM...'
                          : 'Enviar pelo WhatsApp do CRM'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPublicProposalUrl('');
                          setPublicProposalExpiresAt(null);
                          setPublicLinkError('');
                          setPublicLinkSuccess('');
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
                      >
                        Gerar outro link
                      </button>
                    </div>
                  </div>
                )}

                {publicLinkSuccess && (
                  <p
                    role="status"
                    className="flex items-start gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-300"
                  >
                    <Check size={17} className="mt-0.5 shrink-0" />
                    <span>{publicLinkSuccess}</span>
                  </p>
                )}

                {publicLinkError && (
                  <p
                    role="alert"
                    className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-300"
                  >
                    <AlertCircle size={17} className="mt-0.5 shrink-0" />
                    <span>{publicLinkError}</span>
                  </p>
                )}

                <p className="text-xs leading-5 text-slate-500">
                  A criação depende de um corretor responsável e de um imóvel
                  disponível. O link expira e só pode ser utilizado uma vez.
                </p>
              </div>
            </Card>

            {/* OBSERVAÇÕES */}

            <Card title="Observações" icon={<MessageCircle size={18} />}>
              {lead.notes ? (
                <div className="space-y-4">
                  <p className="whitespace-pre-line text-sm leading-7 text-slate-300">
                    {lead.notes}
                  </p>

                  {lead.updatedAt && (
                    <p className="text-xs text-slate-600">
                      Última atualização: {formatDate(lead.updatedAt, true)}
                    </p>
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={<MessageCircle size={20} />}

                  text="Nenhuma observação cadastrada."
                />
              )}
            </Card>

            {/* DATAS COMERCIAIS */}

            <Card title="Datas comerciais" icon={<Calendar size={18} />}>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <CommercialDate
                  label="Último contato"

                  value={lead.lastContactAt}

                  icon={<Phone size={16} />}
                />

                <CommercialDate
                  label="Visita realizada"

                  value={completedVisitDate}

                  icon={<Calendar size={16} />}
                />

                <CommercialDate
                  label="Proposta"

                  value={proposalDate}

                  icon={<FileText size={16} />}

                  highlight
                />

                <CommercialDate
                  label="Fechamento"

                  value={lead.closeDate}

                  icon={<CheckCircle2 size={16} />}
                />
              </div>

              {latestProposal && (
                <div className="mt-5 rounded-xl border border-blue-500/10 bg-blue-500/5 p-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Última proposta
                      </p>

                      <p className="mt-1 font-medium text-white">
                        {latestProposal.code ||
                          latestProposal.number ||
                          `#${String(latestProposal._id || '').slice(-6)}`}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-xs text-slate-500">Valor</p>

                      <p className="font-semibold text-blue-400">
                        {formatCurrency(latestProposalValue)}
                      </p>
                    </div>

                    <Badge
                      text={formatLabel(latestProposal.status)}

                      type={getProposalBadgeType(latestProposal.status)}
                    />
                  </div>
                </div>
              )}
            </Card>

            {/* ÚLTIMAS MENSAGENS DO LEAD */}

            <LeadRecentMessages leadId={lead._id} />

            {/* HISTÓRICO */}

            <Card title="Histórico" icon={<History size={18} />} noPadding>
              <LeadHistory lead={lead} />
            </Card>
          </div>

          {/* SIDEBAR */}

          <div className="space-y-6">
            <UserCard
              title="Corretor responsável"

              icon={<BriefcaseBusiness size={18} />}

              user={assignedTo}
            />

            <UserCard
              title="Lead criado por"

              icon={<User size={18} />}

              user={createdBy}
            />

            {/* CAPTAÇÃO */}

            <Card title="Captação" icon={<Target size={18} />}>
              <div className="space-y-5">
                <Info label="Origem" value={formatLabel(lead.source)} />

                <Info label="Tipo" value={formatLabel(lead.sourceType)} />

                {sourceBroker && (
                  <Info label="Corretor de origem" value={sourceBroker.name} />
                )}

                {lead.referrer && (
                  <Info label="Referência" value={lead.referrer} />
                )}

                {lead.sourceUrl && <Info label="URL" value={lead.sourceUrl} />}
              </div>
            </Card>

            {/* DISTRIBUIÇÃO */}

            <Card title="Distribuição" icon={<BriefcaseBusiness size={18} />}>
              <div className="space-y-5">
                <Info label="Tipo" value={formatLabel(lead.assignmentType)} />

                <Info
                  label="Atribuído em"

                  value={formatDate(lead.assignedAt, true)}
                />

                <Info
                  label="Aguardando distribuição"

                  value={lead.awaitingAssignment ? 'Sim' : 'Não'}
                />

                {lead.assignedBy && (
                  <Info
                    label="Distribuído por"

                    value={
                      lead.assignedBy?.name || lead.assignedBy?.email || '-'
                    }
                  />
                )}
              </div>
            </Card>

            {/* RESUMO DA PROPOSTA */}

            <Card title="Resumo da proposta" icon={<FileText size={18} />}>
              {latestProposal ? (
                <div className="space-y-4">
                  <Info
                    label="Status"

                    value={
                      <Badge
                        text={formatLabel(latestProposal.status)}

                        type={getProposalBadgeType(latestProposal.status)}
                      />
                    }
                  />

                  <Info
                    label="Valor"

                    value={formatCurrency(latestProposalValue)}
                  />

                  <Info label="Data" value={formatDate(proposalDate, true)} />

                  <button
                    type="button"

                    onClick={() => navigate(`/proposals/${latestProposal._id}`)}

                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
                  >
                    Ver proposta
                    <ChevronRight size={16} />
                  </button>
                </div>
              ) : (
                <EmptyState
                  icon={<FileText size={20} />}

                  text="Nenhuma proposta cadastrada."
                />
              )}
            </Card>

            {/* AÇÕES RÁPIDAS */}

            <Card title="Ações rápidas" icon={<ArrowRight size={18} />}>
              <div className="space-y-2">
                <QuickAction
                  icon={<MessageCircle size={17} />}

                  label={
                    openingChat ? 'Abrindo conversa...' : 'Conversar no CRM'
                  }

                  onClick={handleOpenWhatsAppChat}

                  disabled={openingChat}
                />

                {whatsappUrl && (
                  <QuickAction
                    icon={<ExternalLink size={17} />}

                    label="Abrir WhatsApp Web"

                    onClick={() =>
                      window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
                    }
                  />
                )}

                {lead.email && (
                  <QuickAction
                    icon={<Mail size={17} />}

                    label="Enviar email"

                    onClick={() => {
                      window.location.href = `mailto:${lead.email}`;
                    }}
                  />
                )}

                <QuickAction
                  icon={<Calendar size={17} />}

                  label="Abrir agenda"

                  onClick={() => navigate('/my-visits')}
                />

                <QuickAction
                  icon={<Edit size={17} />}

                  label="Editar lead"

                  onClick={handleEdit}
                />

                <QuickAction
                  icon={<FileText size={17} />}

                  label="Criar proposta"

                  onClick={handleCreateProposal}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================

   CARD

\================================================================ */

function Card({ title, icon, children, noPadding = false }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-lg">
      <div className="flex items-center gap-2 border-b border-slate-800 px-6 py-4">
        {icon && <span className="text-blue-400">{icon}</span>}

        <h2 className="font-semibold text-white">{title}</h2>
      </div>

      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </section>
  );
}

/* ================================================================

   INFO

\================================================================ */

function Info({ icon, label, value, href = null }) {
  const content = (
    <>
      {icon && <div className="mt-0.5 shrink-0 text-slate-500">{icon}</div>}

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>

        <div className="mt-1 break-words text-sm font-medium text-slate-200">
          {value || '-'}
        </div>
      </div>
    </>
  );

  if (href && value) {
    return (
      <a
        href={href}

        className="flex items-start gap-3 rounded-lg transition hover:bg-slate-800/50"
      >
        {content}
      </a>
    );
  }

  return <div className="flex items-start gap-3">{content}</div>;
}

/* ================================================================

   COMMERCIAL DATE

\================================================================ */

function CommercialDate({ label, value, icon, highlight = false }) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight && value
          ? 'border-blue-500/20 bg-blue-500/5'
          : 'border-slate-800 bg-slate-950/40'
      }`}
    >
      <div
        className={`flex items-center gap-2 ${
          highlight && value ? 'text-blue-400' : 'text-slate-500'
        }`}
      >
        {icon}

        <span className="text-xs font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>

      <p
        className={`mt-3 text-sm font-semibold ${
          highlight && value ? 'text-blue-300' : 'text-slate-200'
        }`}
      >
        {value ? formatDateStatic(value) : '-'}
      </p>

      {!value && <p className="mt-1 text-xs text-slate-600">Não registrada</p>}
    </div>
  );
}

/* ================================================================

   USER CARD

\================================================================ */

function UserCard({ title, icon, user }) {
  return (
    <Card title={title} icon={icon}>
      {user ? (
        <div className="flex items-center gap-4">
          {user.avatar ? (
            <img
              src={user.avatar}

              alt={user.name || 'Usuário'}

              className="h-12 w-12 shrink-0 rounded-full border border-slate-700 object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-400">
              <User size={20} />
            </div>
          )}

          <div className="min-w-0">
            <p className="truncate font-medium text-white">
              {user.name || 'Usuário'}
            </p>

            {user.email && (
              <p className="truncate text-sm text-slate-400">{user.email}</p>
            )}

            {user.position && (
              <p className="mt-0.5 text-xs text-slate-500">{user.position}</p>
            )}
          </div>
        </div>
      ) : (
        <EmptyState
          icon={<User size={20} />}

          text="Nenhum responsável atribuído."
        />
      )}
    </Card>
  );
}

/* ================================================================

   PROPERTY CARD

\================================================================ */

function PropertyCard({
  property,

  visit,

  visitDate,

  onCreateProposal,

  navigate,
}) {
  if (!property) return null;

  const address = property.address || {};

  const propertyTitle = property.title || property.name || 'Imóvel sem título';

  const propertyPrice = property.price;

  const propertyId = property._id || property.id || null;

  return (
    <Card title="Imóvel visitado" icon={<Building2 size={18} />}>
      <div className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-white">
                {propertyTitle}
              </h3>

              {property.code && (
                <span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs font-medium text-slate-400">
                  {property.code}
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                <CheckCircle2 size={14} />
                Visita realizada
              </span>

              {visitDate && (
                <span className="text-xs text-slate-500">
                  {formatDateStatic(visitDate)}
                </span>
              )}
            </div>

            {(address.street ||
              address.city ||
              address.logradouro ||
              address.cidade) && (
              <div className="mt-3 flex items-start gap-2 text-sm text-slate-400">
                <MapPin size={16} className="mt-0.5 shrink-0" />

                <span>{formatPropertyAddress(address)}</span>
              </div>
            )}
          </div>

          {propertyPrice !== undefined && propertyPrice !== null && (
            <div className="sm:text-right">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Valor
              </p>

              <p className="mt-1 text-xl font-bold text-white">
                {formatCurrencyStatic(propertyPrice)}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {property.type && (
            <PropertyStat label="Tipo" value={formatLabel(property.type)} />
          )}

          {property.bedrooms !== undefined && property.bedrooms !== null && (
            <PropertyStat label="Quartos" value={property.bedrooms} />
          )}

          {property.bathrooms !== undefined && property.bathrooms !== null && (
            <PropertyStat label="Banheiros" value={property.bathrooms} />
          )}

          {property.area?.total && (
            <PropertyStat label="Área" value={`${property.area.total} m²`} />
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {propertyId && (
            <button
              type="button"

              onClick={() => navigate(`/properties/${propertyId}`)}

              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-700"
            >
              Ver imóvel
              <ChevronRight size={16} />
            </button>
          )}

          <button
            type="button"

            onClick={onCreateProposal}

            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            <FileText size={17} />
            Fazer proposta
          </button>
        </div>
      </div>
    </Card>
  );
}

/* ================================================================

   PROPOSAL CARD

\================================================================ */

function ProposalCard({ proposals, loading, onCreateProposal, navigate }) {
  return (
    <Card title="Propostas" icon={<FileText size={18} />}>
      {loading ? (
        <div className="space-y-3">
          <ProposalSkeleton />

          <ProposalSkeleton />
        </div>
      ) : proposals.length > 0 ? (
        <div className="space-y-3">
          {proposals.map((proposal) => (
            <ProposalItem
              key={proposal._id}

              proposal={proposal}

              onClick={() => navigate(`/proposals/${proposal._id}`)}
            />
          ))}

          <button
            type="button"

            onClick={onCreateProposal}

            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-blue-400 transition hover:text-blue-300"
          >
            <FileText size={16} />
            Criar nova proposta
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-950/40 px-6 py-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <FileText size={22} />
          </div>

          <h3 className="mt-4 font-medium text-white">
            Nenhuma proposta criada
          </h3>

          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Crie uma proposta para este lead e envie para aprovação do
            administrador.
          </p>

          <button
            type="button"

            onClick={onCreateProposal}

            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            <FileText size={17} />
            Fazer proposta
          </button>
        </div>
      )}
    </Card>
  );
}

/* ================================================================

   PROPOSAL ITEM

\================================================================ */

function ProposalItem({ proposal, onClick }) {
  const proposalValue = getProposalValue(proposal);

  const proposalDate = getProposalDate(proposal);

  return (
    <button
      type="button"

      onClick={onClick}

      className="group w-full rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-left transition hover:border-slate-700 hover:bg-slate-800/60"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-medium text-white">
            Proposta{' '}
            {proposal.code ||
              proposal.number ||
              `#${String(proposal._id || '').slice(-6)}`}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-400">
              {formatCurrencyStatic(proposalValue)}
            </span>

            {proposalDate && (
              <span className="text-xs text-slate-600">
                {formatDateStatic(proposalDate)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            text={formatLabel(proposal.status)}

            type={getProposalBadgeType(proposal.status)}
          />

          <ChevronRight
            size={18}

            className="text-slate-600 transition group-hover:text-slate-300"
          />
        </div>
      </div>
    </button>
  );
}

/* ================================================================

   PROPOSAL SKELETON

\================================================================ */

function ProposalSkeleton() {
  return <div className="h-20 animate-pulse rounded-xl bg-slate-950/60" />;
}

/* ================================================================

   PROPERTY STAT

\================================================================ */

function PropertyStat({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-950/60 p-3">
      <p className="text-xs text-slate-500">{label}</p>

      <p className="mt-1 text-sm font-medium text-slate-200">{value}</p>
    </div>
  );
}

/* ================================================================

   METRIC CARD

\================================================================ */

function MetricCard({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}

        <span className="text-xs">{label}</span>
      </div>

      <p className="mt-2 truncate text-sm font-bold text-white">{value}</p>
    </div>
  );
}

/* ================================================================

   QUICK ACTION

\================================================================ */

function QuickAction({ icon, label, onClick, disabled = false }) {
  return (
    <button
      type="button"

      onClick={onClick}

      disabled={disabled}

      className="flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-left text-sm text-slate-300 transition hover:border-slate-800 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="text-slate-500">{icon}</span>

      {label}
    </button>
  );
}

/* ================================================================

   EMPTY STATE

\================================================================ */

function EmptyState({ icon, text }) {
  return (
    <div className="flex items-center gap-3 py-2 text-sm text-slate-500">
      <span className="text-slate-600">{icon}</span>

      {text}
    </div>
  );
}

/* ================================================================

   BADGE

\================================================================ */

function Badge({ text, type = 'gray' }) {
  const styles = {
    blue: 'border-blue-500/20 bg-blue-500/10 text-blue-400',

    green: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',

    yellow: 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400',

    red: 'border-red-500/20 bg-red-500/10 text-red-400',

    gray: 'border-slate-700 bg-slate-800 text-slate-300',

    purple: 'border-purple-500/20 bg-purple-500/10 text-purple-400',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${
        styles[type] || styles.gray
      }`}
    >
      {text || '-'}
    </span>
  );
}

/* ================================================================

   SKELETON

\================================================================ */

function LeadDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="h-6 w-24 animate-pulse rounded bg-slate-800" />

        <div className="h-48 animate-pulse rounded-2xl bg-slate-900" />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <SkeletonCard />

            <SkeletonCard />

            <SkeletonCard />
          </div>

          <div className="space-y-6">
            <SkeletonCard />

            <SkeletonCard />

            <SkeletonCard />
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return <div className="h-48 animate-pulse rounded-2xl bg-slate-900" />;
}

/* ================================================================

   HELPERS

\================================================================ */

function normalizePhone(phone) {
  if (!phone) return '';

  return String(phone).replace(/\D/g, '');
}

function formatLabel(value) {
  if (!value) return '-';

  return String(value)
    .replace(/_/g, ' ')

    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeText(value) {
  if (!value) return '';

  return String(value)
    .trim()

    .toLowerCase()

    .normalize('NFD')

    .replace(/[\u0300-\u036f]/g, '');
}

/* ================================================================

   VISIT HELPERS

\================================================================ */

function isCompletedVisit(visit) {
  if (!visit) return false;

  const status = normalizeText(
    visit.status || visit.visitStatus || visit.state || '',
  );

  return [
    'concluida',

    'completed',

    'complete',

    'realizada',

    'realizado',

    'done',
  ].includes(status);
}

function getVisitDate(visit) {
  if (!visit) return null;

  return (
    visit.finishedAt ||
    visit.completedAt ||
    visit.realizedAt ||
    visit.realizedDate ||
    visit.date ||
    visit.visitDate ||
    visit.startAt ||
    visit.startDate ||
    visit.scheduledAt ||
    visit.createdAt ||
    null
  );
}

function getVisitDateValue(visit) {
  const date = getVisitDate(visit);

  if (!date) return 0;

  const timestamp = new Date(date).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function extractVisitProperty(visit) {
  if (!visit) return null;

  const property =
    visit.propertyInfo ||
    visit.property ||
    visit.propertyData ||
    visit.propertyDetails ||
    null;

  if (!property || typeof property === 'string') {
    return null;
  }

  const hasPropertyIdentifier =
    property._id ||
    property.id ||
    property.code ||
    property.name ||
    property.title;

  if (!hasPropertyIdentifier) return null;

  return {
    ...property,

    _id: property._id || property.id || null,

    id: property.id || property._id || null,

    name: property.name || property.title || 'Imóvel sem título',

    title: property.title || property.name || '',

    address: property.address || property.location || {},

    price:
      property.price ??
      property.prices?.salePrice ??
      property.prices?.rentPrice ??
      null,
  };
}

/* ================================================================

   STATIC FORMATTERS

\================================================================ */

function formatCurrencyStatic(value) {
  if (
    value === undefined ||
    value === null ||
    value === '' ||
    Number.isNaN(Number(value))
  ) {
    return '-';
  }

  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',

    currency: 'BRL',
  });
}

function formatDateStatic(date) {
  if (!date) return '-';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return '-';

  return parsedDate.toLocaleDateString('pt-BR', {
    day: '2-digit',

    month: '2-digit',

    year: 'numeric',
  });
}

function formatPropertyAddress(address = {}) {
  const parts = [
    address.street || address.logradouro,

    address.number || address.numero,

    address.district || address.neighborhood || address.bairro,

    address.city || address.cidade,

    address.state || address.uf,
  ].filter(Boolean);

  return parts.length ? parts.join(', ') : 'Endereço não informado';
}

/* ================================================================

   PROPOSAL HELPERS

\================================================================ */

function getProposalDate(proposal) {
  if (!proposal) return null;

  return (
    proposal.proposalDate ||
    proposal.submittedAt ||
    proposal.sentAt ||
    proposal.createdAt ||
    proposal.updatedAt ||
    null
  );
}

function getProposalDateValue(proposal) {
  const date = getProposalDate(proposal);

  if (!date) return 0;

  const timestamp = new Date(date).getTime();

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getProposalValue(proposal) {
  if (!proposal) return null;

  return (
    proposal.values?.proposalPrice ??
    proposal.values?.price ??
    proposal.proposalPrice ??
    proposal.price ??
    proposal.amount ??
    proposal.value ??
    null
  );
}

/* ================================================================

   LEAD STATUS

\================================================================ */

function getStatusBadgeType(status) {
  const normalizedStatus = normalizeText(status);

  switch (normalizedStatus) {
    case 'novo':
      return 'blue';

    case 'em andamento':

    case 'in progress':

    case 'in_progress':
      return 'yellow';

    case 'convertido':
      return 'green';

    case 'perdido':
      return 'red';

    default:
      return 'gray';
  }
}

/* ================================================================

   PRIORITY

\================================================================ */

function getPriorityBadgeType(priority) {
  const normalizedPriority = normalizeText(priority);

  switch (normalizedPriority) {
    case 'alta':

    case 'high':
      return 'red';

    case 'media':

    case 'medium':
      return 'yellow';

    case 'baixa':

    case 'low':
      return 'blue';

    default:
      return 'gray';
  }
}

/* ================================================================

   PROPOSAL STATUS

\================================================================ */

function getProposalBadgeType(status) {
  const normalizedStatus = normalizeText(status);

  switch (normalizedStatus) {
    case 'accepted':

    case 'aprovada':
      return 'green';

    case 'pending':

    case 'pendente':
      return 'yellow';

    case 'rejected':

    case 'rejeitada':
      return 'red';

    case 'draft':

    case 'rascunho':
      return 'gray';

    case 'cancelled':

    case 'cancelada':
      return 'purple';

    default:
      return 'gray';
  }
}

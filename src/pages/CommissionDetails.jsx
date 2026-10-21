import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Copy,
  Home,
  PartyPopper,
  ShieldCheck,
  Trophy,
  UserRound,
  Wallet,
  Building2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { getCommissionById } from '../service/commissionService';

const currency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const date = (value) => {
  if (!value) return 'Não informado';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Não informado';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(parsed);
};

const firstValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== '');

const getName = (value) =>
  typeof value === 'string'
    ? value
    : firstValue(value?.name, value?.fullName, value?.title, value?.email);

const normalizeStatus = (status) =>
  String(status || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const statusInfo = (status) => {
  const normalized = normalizeStatus(status);
  if (['paid', 'paga', 'pago', 'paid_out'].includes(normalized)) {
    return {
      label: 'Comissão paga',
      className: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
      icon: CheckCircle2,
    };
  }
  if (['approved', 'aprovada', 'aprovado'].includes(normalized)) {
    return {
      label: 'Comissão aprovada',
      className: 'bg-sky-400/10 text-sky-300 border-sky-400/20',
      icon: BadgeCheck,
    };
  }
  if (
    ['pending', 'pendente', 'prevista', 'processing', 'em análise'].includes(
      normalized,
    )
  ) {
    return {
      label: 'Aguardando processamento',
      className: 'bg-amber-400/10 text-amber-300 border-amber-400/20',
      icon: Clock3,
    };
  }
  if (
    ['cancelled', 'canceled', 'cancelada', 'cancelado'].includes(normalized)
  ) {
    return {
      label: 'Comissão cancelada',
      className: 'bg-rose-400/10 text-rose-300 border-rose-400/20',
      icon: AlertCircle,
    };
  }
  return {
    label: status || 'Status não informado',
    className: 'bg-white/5 text-slate-300 border-white/10',
    icon: ShieldCheck,
  };
};

function InfoItem({ icon: Icon, label, value, subvalue }) {
  return (
    <div className="flex min-w-0 gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-semibold text-slate-100">
          {value || 'Não informado'}
        </p>
        {subvalue && <p className="mt-1 text-xs text-slate-500">{subvalue}</p>}
      </div>
    </div>
  );
}

export default function CommissionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [commission, setCommission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const loadCommission = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getCommissionById(id);
      setCommission(
        response?.data?.commission ??
          response?.data?.data ??
          response?.data ??
          response?.commission ??
          response,
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Não foi possível carregar os detalhes desta comissão.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const view = useMemo(() => {
    const c = commission || {};
    const sale = c.sale || {};
    const property = c.property || sale.property || {};
    const lead = c.lead || sale.lead || {};
    const broker =
      c.sellerBroker || c.broker || c.brokerId || sale.sellerBroker || {};
    const distribution = c.distribution || {};
    const seller = distribution.seller || {};
    const saleAmount = firstValue(
      c.saleAmount,
      c.saleValue,
      sale.saleAmount,
      sale.saleValue,
      sale.value,
      0,
    );
    const totalCommission = firstValue(
      c.totalAmount,
      c.totalCommission,
      c.commission?.totalAmount,
      distribution.totalAmount,
      0,
    );
    const brokerCommission = firstValue(
      c.brokerAmount,
      c.commission?.brokerAmount,
      seller.amount,
      distribution.sellerAmount,
      0,
    );
    const status = firstValue(
      c.status,
      c.commission?.status,
      sale.paymentStatus,
      'pending',
    );
    const propertyName = firstValue(
      property.name,
      property.title,
      property.propertyName,
      sale.propertySnapshot?.name,
      'Imóvel vendido',
    );
    const propertyAddress = firstValue(
      property.location?.address,
      property.address,
      sale.propertySnapshot?.address,
    );
    const brokerName = firstValue(
      getName(broker),
      getName(seller.broker),
      getName(c.brokerSnapshot),
      'Corretor responsável',
    );
    const saleNumber = firstValue(
      sale.saleNumber,
      c.saleNumber,
      sale.code,
      c.code,
    );
    const saleDate = firstValue(sale.saleDate, c.saleDate, c.createdAt);
    const paidAt = firstValue(
      c.paidAt,
      c.payment?.paidAt,
      sale.commission?.paidAt,
    );
    return {
      sale,
      property,
      lead,
      brokerName,
      saleAmount,
      totalCommission,
      brokerCommission,
      status,
      propertyName,
      propertyAddress,
      saleNumber,
      saleDate,
      paidAt,
    };
  }, [commission]);

  const state = statusInfo(view.status);
  const StatusIcon = state.icon;
  const saleCompleted = [
    'completed',
    'concluida',
    'concluido',
    'realizada',
    'realizado',
    'approved',
    'aprovada',
    'aprovado',
  ].includes(normalizeStatus(view.sale?.status));
  const isPaid = ['paid', 'paga', 'pago', 'paid_out'].includes(
    normalizeStatus(view.status),
  );

  const copyAchievement = async () => {
    const message = `🏆 Conquista realizada no Leads Na Mão!\nParabéns pela venda, ${view.brokerName}!\nImóvel: ${view.propertyName}\nValor da venda: ${currency(view.saleAmount)}\nUma oportunidade transformada em negócio fechado.`;
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setError('Não foi possível copiar o texto neste navegador.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#070d18] px-4 py-12 text-slate-100">
        <div className="mx-auto flex max-w-5xl items-center justify-center gap-3 rounded-3xl border border-white/10 bg-[#0c1628] p-12 text-slate-300">
          <RefreshCw className="animate-spin text-blue-300" size={20} />{' '}
          Carregando os detalhes da conquista...
        </div>
      </div>
    );
  }

  if (error && !commission) {
    return (
      <div className="min-h-[70vh] bg-[#070d18] px-4 py-12 text-slate-100">
        <div className="mx-auto max-w-2xl rounded-3xl border border-rose-400/20 bg-[#0c1628] p-8 text-center">
          <AlertCircle className="mx-auto text-rose-300" size={36} />
          <h1 className="mt-4 text-xl font-bold">
            Não conseguimos abrir esta comissão
          </h1>
          <p className="mt-2 text-sm text-slate-400">{error}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={loadCommission}
              className="rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-400"
            >
              Tentar novamente
            </button>
            <button
              onClick={() => navigate('/commissions')}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/5"
            >
              Voltar às comissões
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#070d18] px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-blue-400/30 hover:bg-blue-400/5 hover:text-white"
        >
          <ArrowLeft size={17} /> Voltar
        </button>

        <section className="relative isolate overflow-hidden rounded-[2rem] border border-blue-300/15 bg-gradient-to-br from-[#132d53] via-[#0d1c34] to-[#101626] p-6 shadow-2xl shadow-blue-950/20 sm:p-10">
          <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/[0.08] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">
                <PartyPopper size={15} /> Conquista registrada
              </div>
              <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
                Parabéns pela venda<span className="text-blue-300">!</span>
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                {view.brokerName}, cada conversa, acompanhamento e negociação
                ajudou a transformar uma oportunidade em negócio fechado. Essa
                conquista é sua — celebre esse resultado!
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold ${state.className}`}
                >
                  <StatusIcon size={16} /> {state.label}
                </span>
                {view.saleNumber && (
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-300">
                    Venda {view.saleNumber}
                  </span>
                )}
              </div>
            </div>
            <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-[2rem] border border-amber-200/20 bg-gradient-to-br from-amber-300/15 to-blue-400/10 shadow-[0_0_70px_rgba(96,165,250,0.12)] lg:mx-0 lg:h-44 lg:w-44">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-amber-200/25 bg-[#0d1c34]/80 text-amber-200 lg:h-28 lg:w-28">
                <Trophy size={58} strokeWidth={1.35} />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/[0.08] bg-[#0c1628] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-slate-400">Valor da venda</p>
              <Building2 className="text-blue-300" size={19} />
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
              {currency(view.saleAmount)}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Negócio concluído no CRM
            </p>
          </div>
          <div className="rounded-3xl border border-blue-300/20 bg-gradient-to-br from-blue-500/10 to-[#0c1628] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-slate-400">Comissão total</p>
              <Wallet className="text-blue-300" size={19} />
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-blue-200 sm:text-3xl">
              {currency(view.totalCommission)}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Valor total registrado para esta operação
            </p>
          </div>
          <div className="rounded-3xl border border-emerald-300/15 bg-gradient-to-br from-emerald-500/[0.08] to-[#0c1628] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-slate-400">Comissão do corretor</p>
              <UserRound className="text-emerald-300" size={19} />
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-emerald-200 sm:text-3xl">
              {currency(view.brokerCommission)}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {isPaid
                ? 'Pagamento registrado'
                : 'Acompanhe o status do pagamento abaixo'}
            </p>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-3xl border border-white/[0.08] bg-[#0c1628] p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-400/10 text-blue-300">
                <Home size={21} />
              </div>
              <div>
                <h2 className="text-lg font-bold">Detalhes do negócio</h2>
                <p className="text-sm text-slate-500">
                  Resumo da operação realizada
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <InfoItem
                icon={Home}
                label="Imóvel"
                value={view.propertyName}
                subvalue={view.propertyAddress}
              />
              <InfoItem
                icon={UserRound}
                label="Corretor responsável"
                value={view.brokerName}
              />
              <InfoItem
                icon={CalendarDays}
                label="Data da venda"
                value={date(view.saleDate)}
              />
              <InfoItem
                icon={Wallet}
                label="Status da comissão"
                value={state.label}
                subvalue={
                  isPaid
                    ? `Pago em ${date(view.paidAt)}`
                    : 'O status será atualizado conforme o financeiro processar a comissão.'
                }
              />
            </div>
          </section>

          <section className="rounded-3xl border border-white/[0.08] bg-[#0c1628] p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300/10 text-amber-200">
                <Trophy size={21} />
              </div>
              <div>
                <h2 className="text-lg font-bold">
                  Uma conquista que merece ser celebrada
                </h2>
                <p className="text-sm text-slate-500">
                  Reconhecimento profissional
                </p>
              </div>
            </div>
            <blockquote className="mt-5 rounded-2xl border border-amber-200/10 bg-gradient-to-br from-amber-200/[0.06] to-transparent p-5">
              <p className="text-base font-semibold leading-7 text-slate-100">
                “Grandes resultados são construídos com consistência, confiança
                e dedicação. Mais uma oportunidade que virou negócio!”
              </p>
              <footer className="mt-3 text-sm text-slate-500">
                — Leads Na Mão
              </footer>
            </blockquote>
            <button
              onClick={copyAchievement}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-blue-300/30 hover:bg-blue-400/[0.06]"
            >
              {copied ? (
                <CheckCircle2 size={17} className="text-emerald-300" />
              ) : (
                <Copy size={17} />
              )}
              {copied ? 'Mensagem copiada!' : 'Copiar mensagem de conquista'}
            </button>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              A mensagem copiada não inclui dados pessoais do comprador.
            </p>
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-white/[0.08] bg-[#0c1628] p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Acompanhamento financeiro</h2>
              <p className="mt-1 text-sm text-slate-500">
                Transparência sobre a etapa atual da comissão
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${state.className}`}
            >
              <StatusIcon size={15} />
              {state.label}
            </span>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="flex gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${saleCompleted ? 'bg-emerald-400/10 text-emerald-300' : 'bg-blue-400/10 text-blue-300'}`}
              >
                <CheckCircle2 size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold">Venda registrada</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {date(view.saleDate)}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${['approved', 'aprovada', 'aprovado', 'paid', 'paga', 'pago'].includes(normalizeStatus(view.status)) ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-400/10 text-amber-300'}`}
              >
                <BadgeCheck size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold">Comissão aprovada</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {[
                    'approved',
                    'aprovada',
                    'aprovado',
                    'paid',
                    'paga',
                    'pago',
                  ].includes(normalizeStatus(view.status))
                    ? 'Etapa registrada'
                    : 'Aguardando aprovação ou processamento'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isPaid ? 'bg-emerald-400/10 text-emerald-300' : 'bg-white/5 text-slate-500'}`}
              >
                <Wallet size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold">Pagamento da comissão</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {isPaid
                    ? `Pago em ${date(view.paidAt)}`
                    : 'Ainda não consta como paga'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/[0.07] py-6 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-slate-500">
            Leads Na Mão <span className="mx-1 text-slate-700">•</span> Mais
            conexões, mais negócios.
          </p>
          <button
            onClick={() => navigate('/commissions')}
            className="text-sm font-semibold text-blue-300 transition hover:text-blue-200"
          >
            Ver central de comissões <span aria-hidden="true">→</span>
          </button>
        </footer>
      </div>
    </main>
  );
}

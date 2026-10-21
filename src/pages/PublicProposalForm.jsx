import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  Home,
  LoaderCircle,
  ShieldCheck,
} from 'lucide-react';

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

const currency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

// Converte valores digitados no padrão brasileiro para número.
// Ex.: "1.250.000,50" -> 1250000.5
const parseBRLInput = (value) => {
  if (typeof value === 'number') return value;
  if (!value) return 0;

  const normalized = String(value)
    .replace(/[R$\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^\d.-]/g, '');

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

// Formata o campo enquanto o usuário digita, mantendo centavos.
// Os campos começam a aceitar somente números e os dois últimos dígitos
// representam os centavos, evitando problemas com ponto/vírgula.
const formatBRLInput = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return '';

  const amount = Number(digits) / 100;
  return amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatIntegerInput = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('pt-BR');
};

const parseIntegerInput = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  return digits ? Number(digits) : 0;
};

const initialForm = {
  proposalPrice: '',
  downPayment: '0,00',
  financing: '0,00',
  fgts: '0,00',
  paymentMethod: 'financing',
  installments: '0',
  installmentValue: '0,00',
  validityDays: '7',
  clientMessage: '',
};

const fieldClass =
  'w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/10';

function CurrencyInput({ id, name, label, value, onChange, required = false }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm text-slate-300">
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-slate-500">
          R$
        </span>
        <input
          id={id}
          name={name}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          required={required}
          value={value}
          onChange={onChange}
          placeholder="0,00"
          className={`${fieldClass} pl-12 tabular-nums`}
        />
      </div>
    </div>
  );
}

export default function PublicProposalForm() {
  const { token } = useParams();
  const [context, setContext] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/public-proposals/${encodeURIComponent(token)}`,
        );
        const json = await response.json();

        if (!response.ok || !json.success) {
          throw new Error(json.message || 'Não foi possível abrir o link.');
        }

        if (active) {
          setContext(json.data);
          setForm((current) => ({
            ...current,
            proposalPrice: formatBRLInput(
              Math.round(Number(json.data?.property?.price || 0) * 100),
            ),
          }));
        }
      } catch (err) {
        if (active) setError(err.message || 'Link indisponível.');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [token]);

  const balance = useMemo(
    () =>
      Math.max(
        parseBRLInput(form.proposalPrice) -
          parseBRLInput(form.downPayment) -
          parseBRLInput(form.financing) -
          parseBRLInput(form.fgts),
        0,
      ),
    [form.proposalPrice, form.downPayment, form.financing, form.fgts],
  );

  const change = (event) => {
    const { name, value } = event.target;

    if (
      [
        'proposalPrice',
        'downPayment',
        'financing',
        'fgts',
        'installmentValue',
      ].includes(name)
    ) {
      setForm((current) => ({
        ...current,
        [name]: formatBRLInput(value),
      }));
      return;
    }

    if (name === 'installments') {
      setForm((current) => ({
        ...current,
        [name]: formatIntegerInput(value),
      }));
      return;
    }

    setForm((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (parseBRLInput(form.proposalPrice) <= 0) {
      setError('Informe um valor de proposta maior que zero.');
      return;
    }

    setSending(true);

    try {
      const response = await fetch(
        `${API_URL}/api/public-proposals/${encodeURIComponent(token)}/submit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            proposalPrice: parseBRLInput(form.proposalPrice),
            downPayment: parseBRLInput(form.downPayment),
            financing: parseBRLInput(form.financing),
            fgts: parseBRLInput(form.fgts),
            installments: parseIntegerInput(form.installments),
            installmentValue: parseBRLInput(form.installmentValue),
            validityDays: Number(form.validityDays),
          }),
        },
      );

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(
          json.message || 'Não foi possível enviar sua proposta.',
        );
      }

      setSuccess(json.data);
    } catch (err) {
      setError(err.message || 'Erro ao enviar a proposta.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 px-4 text-white">
        <LoaderCircle className="animate-spin text-blue-300" />
        <span className="sr-only">Carregando proposta</span>
      </main>
    );
  }

  if (success) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 px-4 py-12 text-white">
        <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900 p-8 text-center shadow-2xl sm:p-12">
          <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-emerald-400/10 text-emerald-300">
            <CheckCircle2 size={34} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-300">
            Leads Na Mão
          </p>
          <h1 className="mt-3 text-3xl font-semibold">Proposta recebida!</h1>
          <p className="mt-4 leading-7 text-slate-300">
            Sua proposta foi registrada e será analisada pelo corretor
            responsável antes de seguir para o gestor.
          </p>
          {success.proposalNumber && (
            <p className="mt-5 rounded-xl bg-white/5 px-4 py-3 text-sm text-slate-300">
              Proposta nº{' '}
              <strong className="text-white">{success.proposalNumber}</strong>
            </p>
          )}
          <p className="mt-6 text-sm text-slate-400">
            Você já pode fechar esta página. O corretor entrará em contato com
            você.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-300">
              Leads Na Mão
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Proposta imobiliária segura
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
            <ShieldCheck size={15} className="text-emerald-300" />
            Link protegido
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200"
          >
            {error}
          </div>
        )}

        {!context ? (
          <section className="rounded-3xl border border-white/10 bg-slate-900 p-8">
            <h1 className="text-2xl font-semibold">Link indisponível</h1>
            <p className="mt-3 text-slate-400">
              Solicite um novo link ao corretor responsável.
            </p>
          </section>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <aside className="overflow-hidden rounded-3xl border border-white/10 bg-slate-900 shadow-2xl">
              {context.property.coverImage ? (
                <img
                  src={context.property.coverImage}
                  alt={context.property.name}
                  className="h-60 w-full object-cover"
                />
              ) : (
                <div className="grid h-48 place-items-center bg-gradient-to-br from-blue-950 via-slate-900 to-slate-800">
                  <Home size={42} className="text-blue-200/70" />
                </div>
              )}
              <div className="p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
                  Imóvel selecionado
                </p>
                <h1 className="mt-3 text-2xl font-semibold leading-tight">
                  {context.property.name}
                </h1>
                {context.property.code && (
                  <p className="mt-2 text-sm text-slate-400">
                    Código {context.property.code}
                  </p>
                )}
                {context.property.address && (
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {[
                      context.property.address.street,
                      context.property.address.number,
                      context.property.address.district,
                      context.property.address.city,
                      context.property.address.state,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                )}
                <div className="mt-6 border-t border-white/10 pt-5">
                  <p className="text-sm text-slate-400">Valor anunciado</p>
                  <p className="mt-1 text-2xl font-semibold tabular-nums text-white">
                    {currency(context.property.price)}
                  </p>
                </div>
                <div className="mt-6 rounded-2xl bg-white/[0.04] p-4">
                  <p className="text-sm text-slate-400">Atendimento</p>
                  <p className="mt-1 font-medium">{context.broker.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Corretor responsável
                  </p>
                </div>
              </div>
            </aside>

            <section className="rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl sm:p-8">
              <div className="mb-7 flex items-start gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-500/10 text-blue-300">
                  <FileText size={21} />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold">Monte sua proposta</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    Olá, {context.customer.name}. Preencha os valores para
                    enviar sua proposta ao corretor.
                  </p>
                </div>
              </div>

              <form onSubmit={submit} className="space-y-5">
                <CurrencyInput
                  id="proposalPrice"
                  name="proposalPrice"
                  label="Valor da proposta (R$) *"
                  value={form.proposalPrice}
                  onChange={change}
                  required
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <CurrencyInput
                    id="downPayment"
                    name="downPayment"
                    label="Entrada"
                    value={form.downPayment}
                    onChange={change}
                  />
                  <CurrencyInput
                    id="financing"
                    name="financing"
                    label="Financiamento"
                    value={form.financing}
                    onChange={change}
                  />
                  <CurrencyInput
                    id="fgts"
                    name="fgts"
                    label="FGTS"
                    value={form.fgts}
                    onChange={change}
                  />
                  <div>
                    <label
                      htmlFor="paymentMethod"
                      className="mb-2 block text-sm text-slate-300"
                    >
                      Forma de pagamento
                    </label>
                    <select
                      id="paymentMethod"
                      name="paymentMethod"
                      value={form.paymentMethod}
                      onChange={change}
                      className={fieldClass}
                    >
                      <option value="cash">À vista</option>
                      <option value="financing">Financiamento</option>
                      <option value="fgts">FGTS</option>
                      <option value="mixed">Misto</option>
                    </select>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-400">Saldo estimado</span>
                    <strong className="text-lg tabular-nums text-white">
                      {currency(balance)}
                    </strong>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Calculado automaticamente: valor da proposta menos entrada,
                    financiamento e FGTS. Os valores serão revisados pelo
                    corretor; o envio não representa aprovação final.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="installments"
                      className="mb-2 block text-sm text-slate-300"
                    >
                      Número de parcelas
                    </label>
                    <input
                      id="installments"
                      name="installments"
                      type="text"
                      inputMode="numeric"
                      value={form.installments}
                      onChange={change}
                      placeholder="0"
                      className={`${fieldClass} tabular-nums`}
                    />
                  </div>
                  <CurrencyInput
                    id="installmentValue"
                    name="installmentValue"
                    label="Valor da parcela"
                    value={form.installmentValue}
                    onChange={change}
                  />
                </div>

                <div>
                  <label
                    htmlFor="validityDays"
                    className="mb-2 block text-sm text-slate-300"
                  >
                    Validade desejada
                  </label>
                  <select
                    id="validityDays"
                    name="validityDays"
                    value={form.validityDays}
                    onChange={change}
                    className={fieldClass}
                  >
                    <option value="3">3 dias</option>
                    <option value="7">7 dias</option>
                    <option value="15">15 dias</option>
                    <option value="30">30 dias</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="clientMessage"
                    className="mb-2 block text-sm text-slate-300"
                  >
                    Observações (opcional)
                  </label>
                  <textarea
                    id="clientMessage"
                    name="clientMessage"
                    rows="3"
                    maxLength="3000"
                    value={form.clientMessage}
                    onChange={change}
                    placeholder="Inclua condições ou informações adicionais..."
                    className={`${fieldClass} resize-y`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={sending}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-3.5 font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sending ? (
                    <>
                      <LoaderCircle size={18} className="animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar proposta
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
                <p className="text-center text-xs leading-5 text-slate-500">
                  Ao enviar, você autoriza o tratamento dos dados necessários
                  para análise desta proposta.
                </p>
              </form>
            </section>
          </div>
        )}

        <footer className="mt-8 text-center text-xs text-slate-600">
          Leads Na Mão · Propostas imobiliárias
        </footer>
      </div>
    </main>
  );
}

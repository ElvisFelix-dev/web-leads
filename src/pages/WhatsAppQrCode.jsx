import { useCallback, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  FaWhatsapp,
  FaCheck,
  FaCheckCircle,
  FaSyncAlt,
  FaExclamationTriangle,
  FaMobileAlt,
  FaShieldAlt,
  FaQrcode,
  FaArrowRight,
  FaClock,
  FaWifi,
} from 'react-icons/fa';
import api from '../service/api';

const STEPS = [
  {
    number: '01',
    title: 'Abra o WhatsApp',
    description: 'Acesse o aplicativo no seu celular.',
  },
  {
    number: '02',
    title: 'Acesse aparelhos conectados',
    description: 'No menu do WhatsApp, abra Aparelhos conectados.',
  },
  {
    number: '03',
    title: 'Conecte um aparelho',
    description: 'Toque em Conectar aparelho para continuar.',
  },
  {
    number: '04',
    title: 'Escaneie o código',
    description: 'Aponte a câmera para o QR Code desta tela.',
  },
];

export default function WhatsAppQrCode() {
  const [qrCode, setQrCode] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadQrCode = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError('');

      // Descobre a integração cadastrada no backend; não fixa um ObjectId no frontend.
      const integrationsResponse = await api.get('/api/whatsapp/integrations');
      const integrations = integrationsResponse.data?.data;

      if (!Array.isArray(integrations) || integrations.length === 0) {
        setQrCode('');
        setStatus('');
        setError(
          'Nenhuma integração WhatsApp foi cadastrada. Configure a sessão compartilhada no gerenciamento de integrações.',
        );
        return;
      }

      const integration = integrations.find((item) => item.enabled !== false);

      if (!integration) {
        setQrCode('');
        setStatus('STOPPED');
        setError('A integração WhatsApp está desativada. Ative a sessão compartilhada antes de conectar.');
        return;
      }

      const integrationId = integration._id || integration.id;

      if (!integrationId) {
        throw new Error('A integração retornada não possui um identificador válido.');
      }

      const response = await api.get(
        `/api/whatsapp/qr?integrationId=${encodeURIComponent(integrationId)}`,
      );

      const data = response.data?.data;

      if (!data) {
        throw new Error('Resposta inválida do servidor.');
      }

      const currentStatus = String(data.status || '').toUpperCase();
      setStatus(currentStatus);

      if (currentStatus === 'CONNECTED') {
        setQrCode('');
        return;
      }

      if (data.base64) {
        const base64 = String(data.base64);
        setQrCode(
          base64.startsWith('data:')
            ? base64
            : `data:image/png;base64,${base64}`,
        );
        return;
      }

      if (data.qr) {
        const image = await QRCode.toDataURL(String(data.qr), {
          width: 360,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: {
            dark: '#111827',
            light: '#FFFFFF',
          },
        });

        setQrCode(image);
        return;
      }

      // O QR pode demorar alguns segundos para ficar disponível.
      setQrCode('');
    } catch (err) {
      console.error('Erro ao carregar dados do WhatsApp:', err);

      if (err.response?.status === 401) {
        setError(
          'Sua sessão no CRM expirou ou você não tem autorização para acessar esta conexão. Faça login novamente.',
        );
      } else if (err.response?.status === 403) {
        setError(
          'Seu usuário não possui permissão para gerenciar a conexão do WhatsApp.',
        );
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            'Não foi possível carregar os dados do WhatsApp.',
        );
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQrCode();

    const intervalId = window.setInterval(() => {
      loadQrCode(true);
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [loadQrCode]);

  const isConnected = status === 'CONNECTED';
  const hasQrCode = !loading && !isConnected && !error && Boolean(qrCode);

  const statusConfig = {
    CONNECTED: {
      label: 'Conectado',
      dot: 'bg-emerald-400',
      text: 'text-emerald-300',
      border: 'border-emerald-400/20',
      background: 'bg-emerald-400/10',
    },
    CONNECTING: {
      label: 'Conectando',
      dot: 'bg-amber-400',
      text: 'text-amber-300',
      border: 'border-amber-400/20',
      background: 'bg-amber-400/10',
    },
    STOPPED: {
      label: 'Sessão parada',
      dot: 'bg-rose-400',
      text: 'text-rose-300',
      border: 'border-rose-400/20',
      background: 'bg-rose-400/10',
    },
  };

  const currentStatus = statusConfig[status] || {
    label: status || 'Verificando',
    dot: 'bg-slate-400',
    text: 'text-slate-300',
    border: 'border-white/10',
    background: 'bg-white/5',
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080b12] px-4 py-8 text-white sm:px-6 lg:px-8">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[420px] w-[620px] -translate-x-1/2 rounded-full bg-emerald-500/[0.08] blur-[130px]" />
        <div className="absolute right-[-150px] top-[35%] h-[320px] w-[320px] rounded-full bg-blue-500/[0.05] blur-[120px]" />
        <div className="absolute bottom-[-200px] left-[-100px] h-[350px] w-[350px] rounded-full bg-emerald-400/[0.04] blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_90%)]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-5 border-b border-white/[0.07] pb-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 shadow-[0_0_35px_rgba(16,185,129,0.08)]">
              <FaWhatsapp className="text-[27px] text-emerald-400" />
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight text-white">
                Leads <span className="text-emerald-400">Na Mão</span>
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Central de comunicação
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-2 sm:self-auto">
            <FaShieldAlt className="text-xs text-slate-400" />
            <span className="text-xs font-medium text-slate-300">
              Conexão da imobiliária
            </span>
          </div>
        </header>

        {/* Page heading */}
        <section className="mb-8 max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
              Integrações
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[42px]">
            Conecte seu <span className="text-emerald-400">WhatsApp</span>
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
            Centralize as conversas da sua imobiliária no Leads Na Mão e
            facilite o atendimento aos seus leads em um só lugar.
          </p>
        </section>

        {/* Main layout */}
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Connection panel */}
          <section className="overflow-hidden rounded-3xl border border-white/[0.09] bg-[#10151f]/90 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl">
            <div className="flex flex-col gap-4 border-b border-white/[0.07] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-slate-300">
                  <FaQrcode size={17} />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Conexão do aparelho
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Escaneie o código para vincular sua sessão
                  </p>
                </div>
              </div>

              {!loading && (
                <span
                  className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${currentStatus.background} ${currentStatus.border} ${currentStatus.text}`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${currentStatus.dot} ${
                      status === 'CONNECTING' ? 'animate-pulse' : ''
                    }`}
                  />
                  {currentStatus.label}
                </span>
              )}
            </div>

            <div className="p-5 sm:p-7">
              {/* Loading */}
              {loading && (
                <div className="flex min-h-[390px] flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-[#0b1018] px-5 text-center">
                  <div className="relative flex h-20 w-20 items-center justify-center">
                    <div className="absolute inset-0 animate-ping rounded-full border border-emerald-400/20" />
                    <div className="absolute inset-2 rounded-full border border-emerald-400/20" />
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10">
                      <FaWhatsapp className="text-2xl text-emerald-400" />
                    </div>
                  </div>

                  <h3 className="mt-6 text-base font-semibold text-white">
                    Verificando sua conexão
                  </h3>

                  <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                    Estamos consultando o status da sessão do WhatsApp.
                  </p>

                  <div className="mt-6 h-1 w-40 overflow-hidden rounded-full bg-white/[0.06]">
                    <div className="h-full w-1/2 animate-pulse rounded-full bg-emerald-400" />
                  </div>
                </div>
              )}

              {/* Connected */}
              {!loading && isConnected && (
                <div className="relative overflow-hidden rounded-2xl border border-emerald-400/20 bg-[#0b1515] px-5 py-12 text-center sm:px-10">
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_65%)]" />

                  <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] border border-emerald-400/20 bg-emerald-400/10 shadow-[0_0_50px_rgba(16,185,129,0.10)]">
                    <FaCheckCircle className="text-[38px] text-emerald-400" />
                  </div>

                  <div className="relative mt-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300">
                      <FaCheck size={10} />
                      Conexão estabelecida
                    </div>

                    <h3 className="mt-5 text-2xl font-bold tracking-tight text-white">
                      Tudo pronto!
                    </h3>

                    <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-400">
                      O WhatsApp da sua imobiliária está conectado ao Leads Na
                      Mão. Você já pode utilizar a sessão integrada conforme as
                      permissões configuradas no CRM.
                    </p>
                  </div>

                  <div className="relative mx-auto mt-8 flex max-w-sm items-center gap-3 rounded-xl border border-white/[0.07] bg-black/20 p-4 text-left">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10">
                      <FaWifi className="text-emerald-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">
                        Sessão do WhatsApp
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Autenticação realizada
                      </p>
                    </div>
                    <FaCheckCircle className="shrink-0 text-emerald-400" />
                  </div>
                </div>
              )}

              {/* Error */}
              {!loading && !isConnected && error && (
                <div className="rounded-2xl border border-rose-400/15 bg-rose-400/[0.04] px-5 py-10 text-center sm:px-10">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-400/15 bg-rose-400/[0.08]">
                    <FaExclamationTriangle className="text-2xl text-rose-300" />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-white">
                    Não foi possível carregar o QR Code
                  </h3>

                  <p className="mx-auto mt-3 max-w-md break-words text-sm leading-7 text-slate-400">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={loadQrCode}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-[#062b1d] shadow-lg shadow-emerald-500/10 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                  >
                    <FaSyncAlt />
                    Tentar novamente
                  </button>

                  <p className="mt-4 text-xs leading-5 text-slate-500">
                    Se o problema continuar, verifique o estado da sessão no
                    gerenciamento do WA-AKG.
                  </p>
                </div>
              )}

              {/* Waiting for QR */}
              {!loading && !isConnected && !error && !qrCode && (
                <div className="flex min-h-[390px] flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-[#0b1018] px-5 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400/10">
                    <FaClock className="text-2xl text-amber-300" />
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-white">
                    Aguardando QR Code
                  </h3>
                  <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
                    Estamos aguardando o WA-AKG disponibilizar o código. Esta tela verifica novamente automaticamente.
                  </p>
                  <button
                    type="button"
                    onClick={() => loadQrCode()}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08]"
                  >
                    <FaSyncAlt size={12} />
                    Verificar agora
                  </button>
                </div>
              )}

              {/* QR Code */}
              {hasQrCode && (
                <div className="grid items-center gap-7 xl:grid-cols-[minmax(0,1fr)_220px]">
                  <div className="flex flex-col items-center rounded-2xl border border-white/[0.06] bg-[#0b1018] px-4 py-7 sm:px-7">
                    <div className="mb-5 flex items-center gap-2 text-xs font-medium text-slate-400">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
                      Aguardando leitura do código
                    </div>

                    <div className="relative rounded-[26px] bg-white p-3 shadow-[0_0_60px_rgba(16,185,129,0.07)] sm:p-4">
                      <div className="absolute -left-1.5 -top-1.5 h-7 w-7 rounded-tl-xl border-l-2 border-t-2 border-emerald-400" />
                      <div className="absolute -right-1.5 -top-1.5 h-7 w-7 rounded-tr-xl border-r-2 border-t-2 border-emerald-400" />
                      <div className="absolute -bottom-1.5 -left-1.5 h-7 w-7 rounded-bl-xl border-b-2 border-l-2 border-emerald-400" />
                      <div className="absolute -bottom-1.5 -right-1.5 h-7 w-7 rounded-br-xl border-b-2 border-r-2 border-emerald-400" />

                      <img
                        src={qrCode}
                        alt="QR Code para conectar o WhatsApp"
                        className="block h-auto w-full max-w-[280px] select-none"
                      />
                    </div>

                    <div className="mt-6 flex items-center gap-2 text-center text-xs leading-5 text-slate-500">
                      <FaClock className="shrink-0 text-amber-400" />
                      <span>Mantenha esta tela aberta durante a conexão.</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400">
                        Guia de conexão
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-white">
                        Como conectar
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Siga os passos no celular para vincular o WhatsApp.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {STEPS.map((step, index) => (
                        <div key={step.number} className="flex gap-3">
                          <div className="relative flex shrink-0 flex-col items-center">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-[10px] font-bold text-emerald-300">
                              {step.number}
                            </div>

                            {index < STEPS.length - 1 && (
                              <div className="mt-1 h-5 w-px bg-white/[0.08]" />
                            )}
                          </div>

                          <div className="pb-1">
                            <p className="text-sm font-medium text-slate-200">
                              {step.title}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {step.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl border border-emerald-400/10 bg-emerald-400/[0.04] p-3.5">
                      <div className="flex gap-2.5">
                        <FaShieldAlt className="mt-0.5 shrink-0 text-sm text-emerald-400" />
                        <p className="text-xs leading-5 text-slate-400">
                          Por segurança, escaneie apenas o código exibido dentro
                          do seu CRM.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="flex flex-col gap-4 border-t border-white/[0.07] bg-black/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-slate-400">
                  <FaMobileAlt size={15} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-300">
                    Dispositivo móvel
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Utilize o aplicativo oficial
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={loadQrCode}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2.5 rounded-xl border border-white/[0.09] bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-emerald-400/20 hover:bg-emerald-400/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaSyncAlt
                  className={loading ? 'animate-spin' : ''}
                  size={12}
                />
                {loading ? 'Verificando conexão...' : 'Atualizar conexão'}
              </button>
            </div>
          </section>

          {/* Side information */}
          <aside className="space-y-5">
            <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-[#10151f]/90 p-6 shadow-xl shadow-black/10">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.07]">
                <FaWhatsapp className="text-xl text-emerald-400" />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-white">
                Sua operação, mais conectada
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Integre o WhatsApp ao fluxo de atendimento da sua imobiliária e
                acompanhe as conversas pela plataforma.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  'Conversas centralizadas no CRM',
                  'Atendimento organizado por lead',
                  'Mais agilidade no contato com clientes',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/10">
                      <FaCheck className="text-[9px] text-emerald-400" />
                    </div>
                    <p className="text-sm leading-5 text-slate-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/[0.08] bg-[#10151f]/90 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/[0.08] text-blue-300">
                  <FaShieldAlt />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Dica de segurança
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Proteja sua sessão
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-400">
                Conecte somente números autorizados pela imobiliária. Se
                precisar trocar de número, encerre a sessão anterior conforme o
                procedimento de gerenciamento da integração.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5">
              <FaArrowRight className="shrink-0 text-xs text-slate-500" />
              <p className="text-xs leading-5 text-slate-500">
                Após conectar, volte ao chat do Leads Na Mão para testar o envio
                e o recebimento de mensagens.
              </p>
            </div>
          </aside>
        </div>

        {/* Bottom */}
        <footer className="mt-8 flex flex-col gap-2 border-t border-white/[0.06] pt-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p className="text-xs text-slate-600">
            Leads Na Mão · Gestão imobiliária
          </p>

          <p className="text-xs text-slate-600">Integração WhatsApp</p>
        </footer>
      </div>
    </main>
  );
}

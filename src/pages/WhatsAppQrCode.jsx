import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import api from '../service/api';

const INTEGRATION_ID = '6ac3a588b306b9ba06537ef2';

export default function WhatsAppQrCode() {
  const [qrCode, setQrCode] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadQrCode = async () => {
    try {
      setLoading(true);
      setError('');
      setQrCode('');

      const response = await api.get(
        `/api/whatsapp/qr?integrationId=${INTEGRATION_ID}`,
      );

      const data = response.data?.data;

      if (!data) {
        throw new Error('Resposta inválida do servidor.');
      }

      const currentStatus = String(data.status || '').toUpperCase();

      setStatus(currentStatus);

      // WhatsApp já está conectado.
      // Nesse estado o WA-AKG normalmente retorna qr: null.
      if (currentStatus === 'CONNECTED') {
        setQrCode('');
        return;
      }

      // Se ainda não existe QR, mostramos uma mensagem específica.
      if (!data.qr) {
        setError(
          currentStatus === 'CONNECTING'
            ? 'A conexão com o WhatsApp está sendo iniciada. Tente novamente em alguns segundos.'
            : 'O QR Code ainda não está disponível.',
        );
        return;
      }

      const image = await QRCode.toDataURL(data.qr, {
        width: 320,
        margin: 2,
      });

      setQrCode(image);
    } catch (err) {
      console.error('Erro ao carregar dados do WhatsApp:', err);

      if (err.response?.status === 401) {
        setError(
          'Sua sessão no CRM expirou ou você não tem permissão para acessar a conexão do WhatsApp. Faça login novamente.',
        );
      } else if (err.response?.status === 403) {
        setError(
          'Seu usuário não possui permissão para gerenciar a conexão do WhatsApp.',
        );
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            'Erro ao carregar os dados do WhatsApp.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQrCode();
  }, []);

  const isConnected = status === 'CONNECTED';

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-white">
            Conectar WhatsApp
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Gerencie a conexão do WhatsApp da sua imobiliária.
          </p>
        </div>

        <div className="mt-8">
          {loading && (
            <div className="flex min-h-[320px] items-center justify-center rounded-2xl bg-white">
              <div className="text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />

                <p className="mt-4 text-sm text-slate-500">
                  Verificando conexão...
                </p>
              </div>
            </div>
          )}

          {!loading && isConnected && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-8 w-8 text-emerald-400"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h2 className="mt-5 text-xl font-semibold text-white">
                WhatsApp conectado
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                O WhatsApp da sua imobiliária já está conectado ao Leads Na Mão.
                Não é necessário escanear um novo QR Code.
              </p>

              <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-slate-950/50 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

                <span className="text-sm font-medium text-emerald-300">
                  Conexão ativa
                </span>
              </div>
            </div>
          )}

          {!loading && !isConnected && error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-6 w-6 text-red-400"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.5M12 16h.01M10.29 3.86l-7.82 13.5A2 2 0 004.2 20.5h15.6a2 2 0 001.73-3.14l-7.82-13.5a2 2 0 00-3.42 0z"
                  />
                </svg>
              </div>

              <p className="mt-4 text-sm leading-6 text-red-300">{error}</p>

              <button
                type="button"
                onClick={loadQrCode}
                className="mt-5 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
              >
                Verificar novamente
              </button>
            </div>
          )}

          {!loading && !isConnected && !error && qrCode && (
            <div>
              <div className="flex min-h-[320px] items-center justify-center rounded-2xl bg-white p-5">
                <img
                  src={qrCode}
                  alt="QR Code para conectar o WhatsApp"
                  className="h-auto w-full max-w-[280px]"
                />
              </div>

              <div className="mt-5 text-center">
                <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  Aguardando conexão
                </span>
              </div>
            </div>
          )}
        </div>

        {!loading && !isConnected && !error && qrCode && (
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-sm font-medium text-white">Como conectar</p>

            <ol className="mt-3 space-y-2 text-sm text-slate-400">
              <li>1. Abra o WhatsApp no celular.</li>
              <li>2. Acesse Configurações → Aparelhos conectados.</li>
              <li>3. Toque em "Conectar aparelho".</li>
              <li>4. Escaneie o QR Code acima.</li>
            </ol>
          </div>
        )}

        <button
          type="button"
          onClick={loadQrCode}
          disabled={loading}
          className="mt-5 w-full rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Verificando...' : 'Atualizar status'}
        </button>

        {!loading && status && (
          <div className="mt-4 text-center">
            <span className="text-xs text-slate-500">
              Status da sessão: {status}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

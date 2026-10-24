// src/pages/Contact.jsx

import { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MessageSquare,
  Send,
  CheckCircle2,
  Building2,
  MapPin,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';

import Header from '../../components/site/Header';
import Footer from '../../components/site/Footer';

import api from '../../service/api';
import { toast } from 'react-toastify';

export default function Contact() {
  const initialForm = {
    name: '',
    email: '',
    phone: '',
    region: 'central',
    message: '',
    whatsappConsent: false,
  };

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedWhatsappConsent, setSubmittedWhatsappConsent] =
    useState(false);
  const [error, setError] = useState('');

  const regions = [
    { value: 'central', label: 'Centro' },
    { value: 'zona_sul', label: 'Zona Sul' },
    { value: 'zona_norte', label: 'Zona Norte' },
    { value: 'zona_oeste', label: 'Zona Oeste' },
    { value: 'zona_leste', label: 'Zona Leste' },
    { value: 'abc', label: 'ABC' },
    { value: 'grande_sp', label: 'Grande SP' },
  ];

  // ============================================================
  // VALIDAÇÕES
  // ============================================================

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    return emailRegex.test(email.trim());
  };

  const validatePhone = (phone) => {
    const numbers = phone.replace(/\D/g, '');

    if (numbers.length < 10 || numbers.length > 11) {
      return false;
    }

    const ddd = Number(numbers.substring(0, 2));

    return ddd >= 11 && ddd <= 99;
  };

  // ============================================================
  // FORMATAÇÃO DE TELEFONE
  // ============================================================

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11);

    if (numbers.length <= 2) {
      return numbers;
    }

    if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    }

    if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(
        2,
        6,
      )}-${numbers.slice(6)}`;
    }

    return `(${numbers.slice(0, 2)}) ${numbers.slice(
      2,
      7,
    )}-${numbers.slice(7)}`;
  };

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleChange = (field, value) => {
    const nextValue = field === 'phone' ? formatPhone(value) : value;

    setForm((prev) => ({
      ...prev,
      [field]: nextValue,
    }));

    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return;

    setError('');

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();
    const message = form.message.trim();

    if (name.length < 2) {
      const messageError = 'Informe seu nome completo.';

      setError(messageError);
      toast.error(messageError);
      return;
    }

    if (!validateEmail(email)) {
      const messageError =
        'Digite um e-mail válido, por exemplo: nome@email.com.';

      setError(messageError);
      toast.error(messageError);
      return;
    }

    if (!validatePhone(phone)) {
      const messageError =
        'Digite um telefone válido, por exemplo: (11) 99999-9999.';

      setError(messageError);
      toast.error(messageError);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/lead-capture/site', {
        name,
        email,
        phone,
        region: form.region,
        source: 'public',
        sourceType: 'company_site',
        notes: message,
        message,
        landingPage: window.location.href,
        referrer: document.referrer || '',

        // Consentimento explícito coletado pelo formulário.
        // O backend deve persistir a autorização com segurança.
        whatsappConsent: {
          status: form.whatsappConsent ? 'granted' : 'unknown',
          source: form.whatsappConsent ? 'site' : '',
        },
      });

      console.log('Lead criado:', response.data);

      setSubmittedWhatsappConsent(form.whatsappConsent);
      setSuccess(true);
      setForm(initialForm);

      toast.success('Solicitação enviada com sucesso!');

      if (response.data?.assignedTo?.name) {
        toast.info(
          `Seu contato foi encaminhado para ${response.data.assignedTo.name}.`,
        );
      }
    } catch (err) {
      console.error('Erro ao enviar contato:', err.response?.data || err);

      const errorMessage =
        err.response?.data?.message ||
        'Não foi possível enviar sua mensagem. Tente novamente.';

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INTERFACE
  // ============================================================

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />

      <main>
        <section className="relative overflow-hidden">
          {/* Fundo decorativo */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-gray-950 to-gray-950" />

          <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-blue-600/10 blur-3xl" />

          <div className="pointer-events-none absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-indigo-600/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              {/* APRESENTAÇÃO */}
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-sm text-blue-400">
                  <Building2 size={16} />
                  Atendimento personalizado
                </div>

                <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                  Encontre o imóvel
                  <span className="block text-blue-500">ideal para você.</span>
                </h1>

                <p className="mt-6 max-w-xl text-lg leading-8 text-gray-400">
                  Conte para nós o que você procura. Nossa equipe vai analisar
                  suas necessidades e ajudar você a encontrar as melhores
                  opções.
                </p>

                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-blue-500/30">
                    <CheckCircle2 size={22} className="mb-3 text-blue-500" />

                    <h3 className="font-semibold">Atendimento personalizado</h3>

                    <p className="mt-2 text-sm leading-6 text-gray-400">
                      Entendemos suas necessidades antes de apresentar os
                      imóveis.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-blue-500/30">
                    <MessageCircle size={22} className="mb-3 text-blue-500" />

                    <h3 className="font-semibold">Contato facilitado</h3>

                    <p className="mt-2 text-sm leading-6 text-gray-400">
                      Sua solicitação é encaminhada para nossa equipe comercial.
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex items-start gap-3 text-sm text-gray-500">
                  <ShieldCheck
                    size={20}
                    className="mt-0.5 shrink-0 text-blue-400"
                  />

                  <p>
                    Seus dados são utilizados para atender à sua solicitação. A
                    autorização para contato pelo WhatsApp é opcional.
                  </p>
                </div>
              </div>

              {/* FORMULÁRIO */}
              <div className="rounded-3xl border border-white/10 bg-gray-900/80 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
                {success ? (
                  <div className="flex min-h-[540px] flex-col items-center justify-center text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10 text-green-400">
                      <CheckCircle2 size={42} />
                    </div>

                    <h2 className="text-2xl font-bold">Mensagem enviada!</h2>

                    <p className="mt-3 max-w-md leading-7 text-gray-400">
                      Recebemos seus dados. Nossa equipe vai analisar sua
                      solicitação e entrar em contato.
                    </p>

                    {submittedWhatsappConsent && (
                      <p className="mt-3 text-sm text-blue-400">
                        Sua autorização de contato pelo WhatsApp foi enviada
                        junto com a solicitação.
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => setSuccess(false)}
                      className="mt-8 rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900"
                    >
                      Enviar outra mensagem
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <h2 className="text-2xl font-bold">
                        Fale com um especialista
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-gray-400">
                        Preencha seus dados para encontrarmos as melhores opções
                        para você.
                      </p>
                    </div>

                    {/* NOME */}
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="mb-2 block text-sm font-medium text-gray-300"
                      >
                        Nome completo <span className="text-red-400">*</span>
                      </label>

                      <div className="relative">
                        <User
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                        />

                        <input
                          id="contact-name"
                          type="text"
                          autoComplete="name"
                          value={form.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          placeholder="Seu nome completo"
                          required
                          minLength={2}
                          maxLength={100}
                          className="w-full rounded-xl border border-white/10 bg-gray-950 py-3.5 pl-11 pr-4 text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    {/* EMAIL */}
                    <div>
                      <label
                        htmlFor="contact-email"
                        className="mb-2 block text-sm font-medium text-gray-300"
                      >
                        E-mail <span className="text-red-400">*</span>
                      </label>

                      <div className="relative">
                        <Mail
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                        />

                        <input
                          id="contact-email"
                          type="email"
                          autoComplete="email"
                          value={form.email}
                          onChange={(e) =>
                            handleChange('email', e.target.value)
                          }
                          placeholder="seu@email.com"
                          required
                          maxLength={254}
                          className="w-full rounded-xl border border-white/10 bg-gray-950 py-3.5 pl-11 pr-4 text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>
                    </div>

                    {/* TELEFONE */}
                    <div>
                      <label
                        htmlFor="contact-phone"
                        className="mb-2 block text-sm font-medium text-gray-300"
                      >
                        WhatsApp / Telefone{' '}
                        <span className="text-red-400">*</span>
                      </label>

                      <div className="relative">
                        <Phone
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                        />

                        <input
                          id="contact-phone"
                          type="tel"
                          autoComplete="tel"
                          inputMode="tel"
                          value={form.phone}
                          onChange={(e) =>
                            handleChange('phone', e.target.value)
                          }
                          placeholder="(11) 99999-9999"
                          required
                          maxLength={16}
                          pattern="\([0-9]{2}\) [0-9]{4,5}-[0-9]{4}"
                          title="Digite um telefone válido, por exemplo: (11) 99999-9999"
                          className="w-full rounded-xl border border-white/10 bg-gray-950 py-3.5 pl-11 pr-4 text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      <p className="mt-1 text-xs text-gray-500">
                        Formato: (DDD) 9XXXX-XXXX ou (DDD) XXXX-XXXX
                      </p>
                    </div>

                    {/* REGIÃO */}
                    <div>
                      <label
                        htmlFor="contact-region"
                        className="mb-2 block text-sm font-medium text-gray-300"
                      >
                        Região de interesse{' '}
                        <span className="text-red-400">*</span>
                      </label>

                      <div className="relative">
                        <MapPin
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                        />

                        <select
                          id="contact-region"
                          value={form.region}
                          onChange={(e) =>
                            handleChange('region', e.target.value)
                          }
                          required
                          className="w-full rounded-xl border border-white/10 bg-gray-950 py-3.5 pl-11 pr-4 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        >
                          {regions.map((region) => (
                            <option key={region.value} value={region.value}>
                              {region.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* MENSAGEM */}
                    <div>
                      <label
                        htmlFor="contact-message"
                        className="mb-2 block text-sm font-medium text-gray-300"
                      >
                        Como podemos ajudar?
                      </label>

                      <div className="relative">
                        <MessageSquare
                          size={18}
                          className="absolute left-4 top-4 text-gray-500"
                        />

                        <textarea
                          id="contact-message"
                          rows={4}
                          value={form.message}
                          onChange={(e) =>
                            handleChange('message', e.target.value)
                          }
                          maxLength={500}
                          placeholder="Ex.: Procuro um apartamento de 2 quartos para comprar..."
                          className="w-full resize-none rounded-xl border border-white/10 bg-gray-950 py-3.5 pl-11 pr-4 text-white outline-none transition placeholder:text-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      <div className="mt-1 flex justify-end text-xs text-gray-500">
                        {form.message.length}/500
                      </div>
                    </div>

                    {/* CONSENTIMENTO OPCIONAL PARA WHATSAPP */}
                    <div className="rounded-xl border border-blue-500/20 bg-blue-500/[0.05] p-4">
                      <label
                        htmlFor="contact-whatsapp-consent"
                        className="flex cursor-pointer items-start gap-3"
                      >
                        <input
                          id="contact-whatsapp-consent"
                          type="checkbox"
                          checked={form.whatsappConsent}
                          onChange={(e) =>
                            handleChange('whatsappConsent', e.target.checked)
                          }
                          className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-blue-500"
                        />

                        <span className="text-sm leading-6 text-gray-300">
                          Autorizo a imobiliária a entrar em contato comigo pelo
                          WhatsApp para tratar da minha solicitação e apresentar
                          opções de imóveis. Sei que posso retirar esta
                          autorização a qualquer momento.
                          <span className="mt-2 block text-xs leading-5 text-gray-500">
                            Opcional. Deixe desmarcado se não quiser autorizar o
                            contato pelo WhatsApp. Sua solicitação poderá ser
                            enviada normalmente.
                          </span>
                        </span>
                      </label>
                    </div>

                    {/* ERRO */}
                    {error && (
                      <div
                        role="alert"
                        className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                      >
                        {error}
                      </div>
                    )}

                    {/* BOTÃO */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Enviando solicitação...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          Quero falar com um corretor
                        </>
                      )}
                    </button>

                    <p className="text-center text-xs leading-5 text-gray-500">
                      Seus dados serão utilizados para processar sua
                      solicitação. A autorização para contato pelo WhatsApp é
                      opcional.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

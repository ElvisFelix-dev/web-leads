import { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MessageSquare,
  Send,
  CheckCircle2,
  ArrowLeft,
  Building2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import Header from '../../components/site/Header';
import Footer from '../../components/site/Footer';

import api from '../../service/api';

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      await api.post('/api/leads', {
        name: form.name,
        email: form.email,
        phone: form.phone,

        source: 'public',

        notes: form.message,

        message: form.message,
      });

      setSuccess(true);

      setForm({
        name: '',
        email: '',
        phone: '',
        message: '',
      });
    } catch (err) {
      console.error('Erro ao enviar contato:', err.response?.data || err);

      setError(
        err.response?.data?.message ||
          'Não foi possível enviar sua mensagem. Tente novamente.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />

      <main className="min-h-screen bg-gray-950 text-white">
        {/* ================================
          HERO
      ================================= */}

        <section className="relative overflow-hidden ">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-gray-950 to-gray-950" />

          <div className="relative mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-24 ">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              {/* ============================
                TEXTO
            ============================= */}

              <div>
                <div
                  className="
                  mb-6
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-blue-500/20
                  bg-blue-500/10
                  px-4
                  py-2
                  text-sm
                  text-blue-400
                "
                >
                  <Building2 size={16} />
                  Atendimento personalizado
                </div>

                <h1
                  className="
                  max-w-2xl
                  text-4xl
                  font-bold
                  tracking-tight
                  sm:text-5xl
                  lg:text-6xl
                "
                >
                  Encontre o imóvel
                  <span className="block text-blue-500">ideal para você.</span>
                </h1>

                <p
                  className="
                  mt-6
                  max-w-xl
                  text-lg
                  leading-8
                  text-gray-400
                "
                >
                  Conte para nós o que você procura. Nossa equipe vai analisar
                  suas necessidades e entrar em contato para ajudar você a
                  encontrar as melhores opções.
                </p>

                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                  <div
                    className="
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.03]
                    p-5
                  "
                  >
                    <CheckCircle2 size={22} className="mb-3 text-blue-500" />

                    <h3 className="font-semibold">Atendimento personalizado</h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Entendemos suas necessidades antes de apresentar os
                      imóveis.
                    </p>
                  </div>

                  <div
                    className="
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/[0.03]
                    p-5
                  "
                  >
                    <CheckCircle2 size={22} className="mb-3 text-blue-500" />

                    <h3 className="font-semibold">Resposta rápida</h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Seu contato chega diretamente para nossa equipe.
                    </p>
                  </div>
                </div>
              </div>

              {/* ============================
                FORMULÁRIO
            ============================= */}

              <div
                className="
                rounded-3xl
                border
                border-white/10
                bg-gray-900/80
                p-6
                shadow-2xl
                backdrop-blur-xl
                sm:p-8
              "
              >
                {success ? (
                  <div className="flex min-h-[480px] flex-col items-center justify-center text-center">
                    <div
                      className="
                      mb-6
                      flex
                      h-20
                      w-20
                      items-center
                      justify-center
                      rounded-full
                      bg-green-500/10
                      text-green-500
                    "
                    >
                      <CheckCircle2 size={42} />
                    </div>

                    <h2 className="text-2xl font-bold">Mensagem enviada!</h2>

                    <p className="mt-3 max-w-md text-gray-400">
                      Recebemos seus dados com sucesso. Nossa equipe entrará em
                      contato com você em breve.
                    </p>

                    <button
                      type="button"
                      onClick={() => setSuccess(false)}
                      className="
                      mt-8
                      rounded-xl
                      bg-blue-600
                      px-6
                      py-3
                      font-semibold
                      transition
                      hover:bg-blue-700
                    "
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

                      <p className="mt-2 text-sm text-gray-400">
                        Preencha seus dados e entraremos em contato.
                      </p>
                    </div>

                    {/* NOME */}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-300">
                        Nome
                      </label>

                      <div className="relative">
                        <User
                          size={18}
                          className="
                          absolute
                          left-4
                          top-1/2
                          -translate-y-1/2
                          text-gray-500
                        "
                        />

                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          placeholder="Seu nome"
                          required
                          className="
                          w-full
                          rounded-xl
                          border
                          border-white/10
                          bg-gray-950
                          py-3.5
                          pl-11
                          pr-4
                          text-white
                          outline-none
                          transition
                          placeholder:text-gray-600
                          focus:border-blue-500
                          focus:ring-2
                          focus:ring-blue-500/20
                        "
                        />
                      </div>
                    </div>

                    {/* EMAIL */}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-300">
                        E-mail
                      </label>

                      <div className="relative">
                        <Mail
                          size={18}
                          className="
                          absolute
                          left-4
                          top-1/2
                          -translate-y-1/2
                          text-gray-500
                        "
                        />

                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) =>
                            handleChange('email', e.target.value)
                          }
                          placeholder="seu@email.com"
                          required
                          className="
                          w-full
                          rounded-xl
                          border
                          border-white/10
                          bg-gray-950
                          py-3.5
                          pl-11
                          pr-4
                          text-white
                          outline-none
                          transition
                          placeholder:text-gray-600
                          focus:border-blue-500
                          focus:ring-2
                          focus:ring-blue-500/20
                        "
                        />
                      </div>
                    </div>

                    {/* TELEFONE */}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-300">
                        WhatsApp / Telefone
                      </label>

                      <div className="relative">
                        <Phone
                          size={18}
                          className="
                          absolute
                          left-4
                          top-1/2
                          -translate-y-1/2
                          text-gray-500
                        "
                        />

                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) =>
                            handleChange('phone', e.target.value)
                          }
                          placeholder="(11) 99999-9999"
                          required
                          className="
                          w-full
                          rounded-xl
                          border
                          border-white/10
                          bg-gray-950
                          py-3.5
                          pl-11
                          pr-4
                          text-white
                          outline-none
                          transition
                          placeholder:text-gray-600
                          focus:border-blue-500
                          focus:ring-2
                          focus:ring-blue-500/20
                        "
                        />
                      </div>
                    </div>

                    {/* MENSAGEM */}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-300">
                        Como podemos ajudar?
                      </label>

                      <div className="relative">
                        <MessageSquare
                          size={18}
                          className="
                          absolute
                          left-4
                          top-4
                          text-gray-500
                        "
                        />

                        <textarea
                          rows={5}
                          value={form.message}
                          onChange={(e) =>
                            handleChange('message', e.target.value)
                          }
                          placeholder="Ex.: Procuro um apartamento de 2 quartos para comprar..."
                          className="
                          w-full
                          resize-none
                          rounded-xl
                          border
                          border-white/10
                          bg-gray-950
                          py-3.5
                          pl-11
                          pr-4
                          text-white
                          outline-none
                          transition
                          placeholder:text-gray-600
                          focus:border-blue-500
                          focus:ring-2
                          focus:ring-blue-500/20
                        "
                        />
                      </div>
                    </div>

                    {/* ERRO */}

                    {error && (
                      <div
                        className="
                        rounded-xl
                        border
                        border-red-500/20
                        bg-red-500/10
                        px-4
                        py-3
                        text-sm
                        text-red-400
                      "
                      >
                        {error}
                      </div>
                    )}

                    {/* BOTÃO */}

                    <button
                      type="submit"
                      disabled={loading}
                      className="
                      flex
                      w-full
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-blue-600
                      px-6
                      py-4
                      font-semibold
                      text-white
                      shadow-lg
                      shadow-blue-600/20
                      transition
                      hover:bg-blue-700
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                    >
                      {loading ? (
                        <>
                          <span
                            className="
                            h-5
                            w-5
                            animate-spin
                            rounded-full
                            border-2
                            border-white/30
                            border-t-white
                          "
                          />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send size={18} />
                          Quero falar com um corretor
                        </>
                      )}
                    </button>

                    <p className="text-center text-xs text-gray-600">
                      Seus dados serão enviados com segurança para nossa equipe
                      comercial.
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

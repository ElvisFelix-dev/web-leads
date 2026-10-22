import {
  ArrowUpRight,
  Building2,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Youtube,
} from 'lucide-react';
import { Link } from 'react-router-dom';

function getWhatsAppUrl(phone) {
  if (!phone) return null;

  const cleanPhone = String(phone).replace(/\D/g, '');

  if (!cleanPhone) return null;

  const normalizedPhone = cleanPhone.startsWith('55')
    ? cleanPhone
    : `55${cleanPhone}`;

  return `https://wa.me/${normalizedPhone}`;
}

function getPhoneUrl(phone) {
  if (!phone) return null;

  const cleanPhone = String(phone).replace(/\D/g, '');

  if (!cleanPhone) return null;

  const normalizedPhone = cleanPhone.startsWith('55')
    ? cleanPhone
    : `55${cleanPhone}`;

  return `tel:+${normalizedPhone}`;
}

function getMailUrl(email) {
  if (!email) return null;

  return `mailto:${email}`;
}

function getLocation(broker) {
  const city = broker?.city || broker?.address?.city;
  const state = broker?.state || broker?.address?.state;

  if (city && state) {
    return `${city}, ${state}`;
  }

  return city || state || null;
}

/**
 * Normaliza links das redes sociais.
 *
 * Aceita:
 * - elvis-felix
 * - linkedin.com/in/elvis-felix
 * - https://linkedin.com/in/elvis-felix
 * - https://www.linkedin.com/in/elvis-felix/
 */
function getSocialUrl(broker, platform) {
  const value = broker?.socials?.[platform] || broker?.[platform] || '';

  if (!value) return null;

  let username = String(value).trim();

  if (!username) return null;

  // Se já for uma URL completa, usa diretamente.
  if (/^https?:\/\//i.test(username)) {
    return username;
  }

  // Remove protocolos caso tenham sido cadastrados sem o padrão esperado.
  username = username
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .trim();

  switch (platform) {
    case 'instagram': {
      username = username
        .replace(/^instagram\.com\//i, '')
        .replace(/^@/, '')
        .replace(/\/+$/, '');

      if (!username) return null;

      return `https://www.instagram.com/${username}/`;
    }

    case 'facebook': {
      username = username
        .replace(/^facebook\.com\//i, '')
        .replace(/^fb\.com\//i, '')
        .replace(/\/+$/, '');

      if (!username) return null;

      return `https://www.facebook.com/${username}`;
    }

    case 'linkedin': {
      username = username
        .replace(/^linkedin\.com\/in\//i, '')
        .replace(/^linkedin\.com\//i, '')
        .replace(/\/+$/, '');

      if (!username) return null;

      return `https://www.linkedin.com/in/${username}/`;
    }

    case 'youtube': {
      // Se já cadastrou youtube.com/@usuario ou youtube.com/c/canal,
      // preservamos o caminho.
      if (
        username.toLowerCase().startsWith('youtube.com/') ||
        username.toLowerCase().startsWith('youtu.be/')
      ) {
        return `https://${username}`;
      }

      if (username.startsWith('@')) {
        return `https://www.youtube.com/${username}`;
      }

      return `https://www.youtube.com/@${username}`;
    }

    default:
      return null;
  }
}

function SocialLink({ href, label, icon: Icon }) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Abrir ${label}`}
      title={label}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
    >
      <Icon size={17} strokeWidth={1.8} />
    </a>
  );
}

export default function HotsiteFooter({ broker, brokerSlug }) {
  const brokerName = broker?.name || 'Consultor imobiliário';
  const companyName = broker?.company || 'Imobiliária';

  const location = getLocation(broker);

  const whatsappUrl = getWhatsAppUrl(broker?.phone);
  const phoneUrl = getPhoneUrl(broker?.phone);
  const mailUrl = getMailUrl(broker?.email);

  const instagramUrl = getSocialUrl(broker, 'instagram');
  const facebookUrl = getSocialUrl(broker, 'facebook');
  const linkedinUrl = getSocialUrl(broker, 'linkedin');
  const youtubeUrl = getSocialUrl(broker, 'youtube');

  const basePath = `/broker/${brokerSlug}`;

  return (
    <footer className="bg-slate-950 text-white">
      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_0.8fr_1fr] lg:gap-16">
          {/* Brand */}
          <div>
            <Link to={basePath} className="inline-flex items-center gap-3">
              {broker?.avatar ? (
                <img
                  src={broker.avatar}
                  alt={brokerName}
                  className="h-11 w-11 rounded-xl object-cover ring-1 ring-white/10"
                />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-950">
                  <Building2 size={20} />
                </div>
              )}

              <div>
                <p className="text-sm font-semibold tracking-tight">
                  {brokerName}
                </p>

                <p className="mt-0.5 text-xs text-slate-500">{companyName}</p>
              </div>
            </Link>

            <p className="mt-6 max-w-md text-sm leading-7 text-slate-400">
              Atendimento personalizado para ajudar você a encontrar o imóvel
              ideal para morar, investir ou realizar seu próximo negócio.
            </p>

            {/* Social */}
            <div className="mt-7 flex items-center gap-2">
              <SocialLink
                href={instagramUrl}
                label="Instagram"
                icon={Instagram}
              />

              <SocialLink href={facebookUrl} label="Facebook" icon={Facebook} />

              <SocialLink href={linkedinUrl} label="LinkedIn" icon={Linkedin} />

              <SocialLink href={youtubeUrl} label="YouTube" icon={Youtube} />
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white">
              Navegação
            </h3>

            <nav className="mt-5 flex flex-col gap-3">
              <Link
                to={basePath}
                className="w-fit text-sm text-slate-400 transition-colors hover:text-white"
              >
                Início
              </Link>

              <Link
                to={`${basePath}/sobre`}
                className="w-fit text-sm text-slate-400 transition-colors hover:text-white"
              >
                Sobre
              </Link>

              <Link
                to={`${basePath}/imoveis`}
                className="w-fit text-sm text-slate-400 transition-colors hover:text-white"
              >
                Imóveis
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-white">
              Atendimento
            </h3>

            <div className="mt-5 space-y-4">
              {location && (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-slate-400">
                    <MapPin size={16} />
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Região de atendimento
                    </p>

                    <p className="mt-1 text-sm text-slate-300">{location}</p>
                  </div>
                </div>
              )}

              {broker?.phone && phoneUrl && (
                <a href={phoneUrl} className="group flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-slate-400 transition-colors group-hover:text-white">
                    <Phone size={16} />
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">Telefone</p>

                    <p className="mt-1 text-sm text-slate-300 transition-colors group-hover:text-white">
                      {broker.phone}
                    </p>
                  </div>
                </a>
              )}

              {broker?.email && mailUrl && (
                <a href={mailUrl} className="group flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-slate-400 transition-colors group-hover:text-white">
                    <Mail size={16} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">E-mail</p>

                    <p className="mt-1 truncate text-sm text-slate-300 transition-colors group-hover:text-white">
                      {broker.email}
                    </p>
                  </div>
                </a>
              )}
            </div>

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition-all duration-200 hover:bg-slate-100 hover:shadow-lg"
              >
                <MessageCircle size={17} />
                Falar pelo WhatsApp
                <ArrowUpRight size={15} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/[0.07]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-6 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} {brokerName}. Todos os direitos
            reservados.
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-500">
            <span>{companyName}</span>

            {broker?.creci && <span>CRECI {broker.creci}</span>}

            <span className="text-slate-700">|</span>

            <span className="inline-flex items-center gap-1.5">
              Desenvolvido por
              <a
                href="https://crmleadnamao.netlify.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-300 hover:text-white transition-colors"
              >
                CRM NODUS
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

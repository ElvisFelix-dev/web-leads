import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Building2, Menu, MessageCircle, X } from 'lucide-react';

function getWhatsAppUrl(phone) {
  if (!phone) return '#';

  const normalizedPhone = String(phone).replace(/\D/g, '');

  if (!normalizedPhone) return '#';

  const finalPhone = normalizedPhone.startsWith('55')
    ? normalizedPhone
    : `55${normalizedPhone}`;

  return `https://wa.me/${finalPhone}`;
}

function getInitials(name) {
  if (!name) return 'LN';

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
}

export default function HotsiteNavbar({ broker, brokerSlug: brokerSlugProp }) {
  const location = useLocation();
  const params = useParams();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  /*
   * O slug da página vem da URL:
   *
   * /broker/felix-pereira
   *
   * useParams() => { slug: 'felix-pereira' }
   *
   * Usamos o prop como fallback.
   */
  const brokerSlug = params.slug || params.brokerSlug || brokerSlugProp || '';

  const name = broker?.name || 'Consultor Imobiliário';
  const avatar = broker?.avatar || broker?.photo || '';
  const company = broker?.company || 'Leads Na Mão';
  const phone = broker?.phone || broker?.whatsapp || '';

  const basePath = brokerSlug ? `/broker/${brokerSlug}` : '/broker';

  const isHome = location.pathname === basePath;
  const isAbout = location.pathname === `${basePath}/sobre`;
  const isProperties = location.pathname === `${basePath}/imoveis`;

  const whatsappUrl = getWhatsAppUrl(phone);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMenuOpen) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const handleWhatsAppClick = () => {
    if (!whatsappUrl || whatsappUrl === '#') return;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  /*
   * Evita gerar:
   *
   * /broker/undefined/imoveis
   *
   * caso o slug ainda não esteja disponível.
   */
  const propertiesPath = brokerSlug ? `${basePath}/imoveis` : '#';

  const aboutPath = brokerSlug ? `${basePath}/sobre` : '#';

  return (
    <>
      <header
        className={[
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          isScrolled
            ? 'border-b border-slate-200/80 bg-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl'
            : 'border-b border-white/10 bg-slate-950/75 backdrop-blur-md',
        ].join(' ')}
      >
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          {/* Brand */}
          <Link to={basePath} className="group flex min-w-0 items-center gap-3">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className={[
                  'h-11 w-11 rounded-full object-cover ring-2 transition',
                  isScrolled ? 'ring-slate-100' : 'ring-white/15',
                ].join(' ')}
              />
            ) : (
              <div
                className={[
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition',
                  isScrolled
                    ? 'bg-slate-100 text-slate-700'
                    : 'bg-white/10 text-white',
                ].join(' ')}
              >
                {broker?.name ? (
                  <span className="text-sm font-bold">{getInitials(name)}</span>
                ) : (
                  <Building2 size={20} />
                )}
              </div>
            )}

            <div className="min-w-0">
              <p
                className={[
                  'truncate text-sm font-bold transition sm:text-[15px]',
                  isScrolled ? 'text-slate-900' : 'text-white',
                ].join(' ')}
              >
                {name}
              </p>

              <p
                className={[
                  'truncate text-[11px] font-medium transition sm:text-xs',
                  isScrolled ? 'text-slate-500' : 'text-white/60',
                ].join(' ')}
              >
                {company}
              </p>
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            <Link
              to={basePath}
              className={[
                'rounded-full px-4 py-2 text-sm font-medium transition',
                isHome
                  ? isScrolled
                    ? 'bg-slate-900 text-white'
                    : 'bg-white/10 text-white'
                  : isScrolled
                    ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                    : 'text-white/70 hover:bg-white/10 hover:text-white',
              ].join(' ')}
            >
              Início
            </Link>

            <Link
              to={aboutPath}
              className={[
                'rounded-full px-4 py-2 text-sm font-medium transition',
                isAbout
                  ? isScrolled
                    ? 'bg-slate-900 text-white'
                    : 'bg-white/10 text-white'
                  : isScrolled
                    ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                    : 'text-white/70 hover:bg-white/10 hover:text-white',
              ].join(' ')}
            >
              Sobre
            </Link>

            <Link
              to={propertiesPath}
              className={[
                'rounded-full px-4 py-2 text-sm font-medium transition',
                isProperties
                  ? isScrolled
                    ? 'bg-slate-900 text-white'
                    : 'bg-white/10 text-white'
                  : isScrolled
                    ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                    : 'text-white/70 hover:bg-white/10 hover:text-white',
              ].join(' ')}
            >
              Imóveis
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <button
              type="button"
              onClick={handleWhatsAppClick}
              disabled={!phone}
              className={[
                'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all',
                phone
                  ? isScrolled
                    ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/15 hover:-translate-y-0.5 hover:bg-slate-800'
                    : 'bg-white text-slate-950 shadow-lg shadow-black/10 hover:-translate-y-0.5 hover:bg-slate-100'
                  : 'cursor-not-allowed bg-slate-300 text-slate-500',
              ].join(' ')}
            >
              <MessageCircle size={17} />

              <span>Falar no WhatsApp</span>
            </button>
          </div>

          {/* Mobile button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-label={isMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={isMenuOpen}
            className={[
              'flex h-10 w-10 items-center justify-center rounded-full transition md:hidden',
              isScrolled
                ? 'text-slate-900 hover:bg-slate-100'
                : 'text-white hover:bg-white/10',
            ].join(' ')}
          >
            {isMenuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={() => setIsMenuOpen(false)}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
          />

          <div className="absolute inset-x-0 top-[76px] border-b border-slate-200 bg-white px-5 pb-6 pt-4 shadow-2xl">
            <nav className="flex flex-col gap-1">
              <Link
                to={basePath}
                className={[
                  'rounded-xl px-4 py-3.5 text-sm font-semibold transition',
                  isHome
                    ? 'bg-slate-950 text-white'
                    : 'text-slate-700 hover:bg-slate-100',
                ].join(' ')}
              >
                Início
              </Link>

              <Link
                to={aboutPath}
                className={[
                  'rounded-xl px-4 py-3.5 text-sm font-semibold transition',
                  isAbout
                    ? 'bg-slate-950 text-white'
                    : 'text-slate-700 hover:bg-slate-100',
                ].join(' ')}
              >
                Sobre
              </Link>

              <Link
                to={propertiesPath}
                className={[
                  'rounded-xl px-4 py-3.5 text-sm font-semibold transition',
                  isProperties
                    ? 'bg-slate-950 text-white'
                    : 'text-slate-700 hover:bg-slate-100',
                ].join(' ')}
              >
                Imóveis
              </Link>
            </nav>

            <div className="mt-4 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={handleWhatsAppClick}
                disabled={!phone}
                className={[
                  'flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold transition',
                  phone
                    ? 'bg-slate-950 text-white hover:bg-slate-800'
                    : 'cursor-not-allowed bg-slate-200 text-slate-400',
                ].join(' ')}
              >
                <MessageCircle size={18} />

                <span>
                  {phone ? 'Falar no WhatsApp' : 'WhatsApp não informado'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

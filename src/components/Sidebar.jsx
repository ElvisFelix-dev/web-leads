import { useState, useRef, useContext, useEffect } from 'react';

import { Link, useLocation, useNavigate } from 'react-router-dom';

import { UserContext } from '../context/UserContext';

import {
  FaBars,
  FaGem,
  FaCalendarCheck,
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronDown,
  FaChevronRight,
  FaChartLine,
  FaClipboardList,
  FaGlobe,
  FaSignOutAlt,
  FaBuilding,
  FaUserTie,
  FaProjectDiagram,
  FaTachometerAlt,
  FaPlusSquare,
  FaBullseye,
  FaMoneyBillWave,
  FaHandshake,
  FaShoppingCart,
  FaCheckCircle,
  FaComments,
  FaWhatsapp,
  FaBell,
} from 'react-icons/fa';

import imgLogo from '../assets/logoImg.png';

import {
  subscribePush,
  unsubscribePush,
  isPushSubscribed,
} from '../service/pushNotificationService';

export default function Sidebar({ onCollapseChange }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [salesMenuOpen, setSalesMenuOpen] = useState(false);

  const [pushSubscribed, setPushSubscribed] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  const dropdownRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useContext(UserContext);

  // ============================================================
  // HELPERS
  // ============================================================

  const getInitials = (name) => {
    if (!name) return 'U';

    return name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const slugify = (str) =>
    str
      ?.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-');

  const handleCollapse = () => {
    const value = !collapsed;

    setCollapsed(value);
    onCollapseChange?.(value);
  };

  const handleLogout = () => {
    logout();

    navigate('/');

    setMobileOpen(false);
    setDropdownOpen(false);
  };

  // ============================================================
  // PUSH NOTIFICATIONS
  // ============================================================

  const handlePushToggle = async () => {
    if (pushLoading) return;

    setPushLoading(true);

    try {
      if (pushSubscribed) {
        await unsubscribePush();

        setPushSubscribed(false);

        console.log('[Sidebar] Notificações push desativadas.');

        return;
      }

      await subscribePush();

      setPushSubscribed(true);

      console.log('[Sidebar] Notificações push ativadas.');
    } catch (error) {
      console.error('[Sidebar] Erro ao configurar notificações push:', error);
    } finally {
      setPushLoading(false);
    }
  };

  // ============================================================
  // VERIFICA SUBSCRIPTION PUSH
  // ============================================================

  useEffect(() => {
    let mounted = true;

    const checkPushSubscription = async () => {
      try {
        const subscribed = await isPushSubscribed();

        if (mounted) {
          setPushSubscribed(subscribed);
        }
      } catch (error) {
        console.error('[Sidebar] Erro ao verificar notificações push:', error);
      }
    };

    checkPushSubscription();

    return () => {
      mounted = false;
    };
  }, []);

  // ============================================================
  // FECHA DROPDOWN DO USUÁRIO AO CLICAR FORA
  // ============================================================

  useEffect(() => {
    const closeDropdown = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', closeDropdown);

    return () => {
      document.removeEventListener('mousedown', closeDropdown);
    };
  }, []);

  // ============================================================
  // HELPERS DE ROTAS
  // ============================================================

  const isActive = (path) => {
    if (!path || path === '#') return false;

    return location.pathname === path;
  };

  const isActivePath = (paths = []) => {
    return paths.some((path) => {
      if (!path) return false;

      return (
        location.pathname === path || location.pathname.startsWith(`${path}/`)
      );
    });
  };

  // ============================================================
  // CHAT ATIVO
  // ============================================================

  const isChatActive = isActivePath(['/chat']);

  // ============================================================
  // VENDAS ATIVAS
  // ============================================================

  const isSalesActive = isActivePath(['/sales', '/commissions']);

  // Abre automaticamente o submenu de vendas
  useEffect(() => {
    if (isSalesActive) {
      setSalesMenuOpen(true);
    }
  }, [isSalesActive]);

  // ============================================================
  // MENU DE VENDAS
  // ============================================================

  const salesMenu = {
    label: 'Vendas',
    icon: <FaHandshake />,
    subItems: [
      {
        path: '/sales',
        label: 'Todas as Vendas',
        icon: <FaShoppingCart />,
      },
      {
        path: '/commissions',
        label: 'Comissões',
        icon: <FaMoneyBillWave />,
      },
      {
        path: '/commissions?status=pending',
        label: 'Aprovar Comissões',
        icon: <FaCheckCircle />,
      },
    ],
  };

  // ============================================================
  // CHAT
  // ============================================================

  const chatMenu = {
    path: '/chat',
    label: 'Chat',
    icon: <FaComments />,
  };

  // ============================================================
  // MENU ADMIN
  // ============================================================

  const adminLinks = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: <FaTachometerAlt />,
    },

    {
      path: '/qr',
      label: 'WhatsApp',
      icon: <FaWhatsapp />,
    },

    // ----------------------------------------------------------
    // CHAT
    // ----------------------------------------------------------

    {
      path: '/chat',
      label: 'Chat',
      icon: <FaComments />,
    },

    // ----------------------------------------------------------
    // IMÓVEIS
    // ----------------------------------------------------------

    {
      path: '/create-property',
      label: 'Criar Imóvel',
      icon: <FaPlusSquare />,
    },

    {
      path: '/property-list',
      label: 'Imóveis',
      icon: <FaBuilding />,
    },

    // ----------------------------------------------------------
    // EQUIPE
    // ----------------------------------------------------------

    {
      path: '/brokers',
      label: 'Corretores',
      icon: <FaUserTie />,
    },

    // ----------------------------------------------------------
    // LEADS
    // ----------------------------------------------------------

    {
      path: '/leads-list',
      label: 'Leads',
      icon: <FaClipboardList />,
    },

    {
      path: '/pipeline',
      label: 'Pipeline',
      icon: <FaProjectDiagram />,
    },

    {
      path: '/opportunities',
      label: 'Oportunidades',
      icon: <FaGem />,
    },

    // ----------------------------------------------------------
    // PROPOSTAS
    // ----------------------------------------------------------

    {
      path: '/proposals',
      label: 'Propostas',
      icon: <FaBullseye />,
    },

    // ----------------------------------------------------------
    // VISITAS
    // ----------------------------------------------------------

    {
      path: '/visits',
      label: 'Agenda de Visitas',
      icon: <FaCalendarAlt />,
    },

    // ----------------------------------------------------------
    // SITE
    // ----------------------------------------------------------

    {
      path: '/home',
      label: 'Site da Imobiliária',
      icon: <FaGlobe />,
      target: '_blank',
    },
  ];

  // ============================================================
  // MENU CORRETOR
  // ============================================================

  const brokerLinks = user
    ? [
        {
          path: '/broker-dashboard',
          label: 'Meu Dashboard',
          icon: <FaChartLine />,
        },

        // ------------------------------------------------------
        // CHAT
        // ------------------------------------------------------

        {
          path: '/chat',
          label: 'Chat',
          icon: <FaComments />,
        },

        // ------------------------------------------------------
        // LEADS
        // ------------------------------------------------------

        {
          path: '/my-leads',
          label: 'Meus Leads',
          icon: <FaClipboardList />,
        },

        {
          path: '/my-pipeline',
          label: 'Meu Pipeline',
          icon: <FaProjectDiagram />,
        },

        // ------------------------------------------------------
        // VISITAS
        // ------------------------------------------------------

        {
          path: '/my-visits',
          label: 'Minhas Visitas',
          icon: <FaCalendarCheck />,
        },

        // ------------------------------------------------------
        // OPORTUNIDADES
        // ------------------------------------------------------

        {
          path: '/opportunities',
          label: 'Oportunidades',
          icon: <FaBullseye />,
        },

        // ------------------------------------------------------
        // IMÓVEIS
        // ------------------------------------------------------

        {
          path: '/property-list',
          label: 'Imóveis',
          icon: <FaBuilding />,
        },

        // ------------------------------------------------------
        // SITE
        // ------------------------------------------------------

        {
          path: `/broker/${slugify(user.name)}`,
          label: 'Meu Site',
          target: '_blank',
          icon: <FaGlobe />,
        },
      ]
    : [];

  // ============================================================
  // RENDER ITEM NORMAL
  // ============================================================

  const renderMenuItem = (item) => {
    const active = isActive(item.path);

    return (
      <li key={item.path}>
        <Link
          to={item.path}
          target={item.target}
          rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
          onClick={() => {
            setMobileOpen(false);
            setDropdownOpen(false);
          }}
          title={collapsed ? item.label : ''}
          className={`
            group
            flex
            items-center
            gap-3
            p-3
            rounded-lg
            transition-all
            duration-200
            ${
              active
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }
          `}
        >
          {/* Ícone */}
          <span
            className={`
              w-5
              flex
              items-center
              justify-center
              text-lg
              shrink-0
              transition
              ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}
            `}
          >
            {item.icon}
          </span>

          {/* Label */}
          {!collapsed && (
            <span className="text-sm font-medium truncate">{item.label}</span>
          )}

          {/* Indicador ativo */}
          {!collapsed && active && (
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
          )}
        </Link>
      </li>
    );
  };

  // ============================================================
  // RENDER MENU DE VENDAS
  // ============================================================

  const renderSalesMenu = () => {
    return (
      <li>
        {/* Botão Vendas */}
        <button
          type="button"
          onClick={() => {
            if (collapsed) {
              setCollapsed(false);
              onCollapseChange?.(false);
              setSalesMenuOpen(true);
            } else {
              setSalesMenuOpen((prev) => !prev);
            }
          }}
          title={collapsed ? 'Vendas' : ''}
          className={`
            group
            w-full
            flex
            items-center
            gap-3
            p-3
            rounded-lg
            transition-all
            duration-200
            ${
              isSalesActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }
          `}
        >
          {/* Ícone */}
          <span className="w-5 flex items-center justify-center text-lg shrink-0">
            <FaHandshake />
          </span>

          {!collapsed && (
            <>
              <span className="text-sm font-medium flex-1 text-left">
                Vendas
              </span>

              <span className="text-xs text-gray-400">
                {salesMenuOpen ? <FaChevronDown /> : <FaChevronRight />}
              </span>
            </>
          )}
        </button>

        {/* Submenu */}
        {!collapsed && salesMenuOpen && (
          <ul className="ml-5 mt-1 space-y-1 border-l border-gray-700 pl-3">
            {salesMenu.subItems.map((subItem) => {
              const [pathname] = subItem.path.split('?');

              const active = location.pathname === pathname;

              return (
                <li key={subItem.path}>
                  <Link
                    to={subItem.path}
                    onClick={() => {
                      setMobileOpen(false);
                      setDropdownOpen(false);
                    }}
                    className={`
                      group
                      flex
                      items-center
                      gap-3
                      p-2.5
                      rounded-lg
                      text-sm
                      transition
                      ${
                        active
                          ? 'bg-blue-600/20 text-blue-400'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      }
                    `}
                  >
                    <span className="w-4 flex items-center justify-center text-sm">
                      {subItem.icon}
                    </span>

                    <span className="flex-1 truncate">{subItem.label}</span>

                    {active && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </li>
    );
  };

  // ============================================================
  // USER MENU
  // ============================================================

  const profilePath = user?.isAdmin ? '/me' : '/profile';

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <>
      {/* ========================================================
          MOBILE BUTTON
      ======================================================== */}

      <button
        type="button"
        onClick={() => setMobileOpen((prev) => !prev)}
        aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
        className="
          fixed
          top-4
          left-4
          z-50
          p-3
          rounded-xl
          bg-gray-900
          border
          border-gray-800
          text-white
          shadow-lg
          sm:hidden
        "
      >
        <FaBars />
      </button>

      {/* ========================================================
          MOBILE OVERLAY
      ======================================================== */}

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="
            fixed
            inset-0
            bg-black/60
            backdrop-blur-sm
            z-30
            sm:hidden
          "
        />
      )}

      {/* ========================================================
          SIDEBAR
      ======================================================== */}

      <aside
        className={`
          sidebar-scroll
          fixed
          top-0
          left-0
          z-40
          h-screen
          bg-gray-900
          border-r
          border-gray-800
          transition-all
          duration-300
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          sm:translate-x-0
          flex
          flex-col
        `}
      >
        {/* ======================================================
            HEADER
        ====================================================== */}

        <div
          className="
            flex
            items-center
            justify-between
            p-4
            border-b
            border-gray-800
            shrink-0
          "
        >
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div
                className="
                  w-8
                  h-8
                  rounded-lg
                  bg-blue-600
                  flex
                  items-center
                  justify-center
                  text-white
                  font-bold
                  text-xs
                "
              >
                <img
                  src={imgLogo}
                  alt="LeadsNaMão"
                  className="w-6 h-6 object-contain"
                />
              </div>

              <h1 className="text-lg font-bold text-white">
                Leads
                <span className="text-blue-500">NaMão</span>
              </h1>
            </div>
          )}

          {collapsed && (
            <div
              className="
                w-10
                h-10
                mx-auto
                rounded-lg
                bg-blue-600
                flex
                items-center
                justify-center
                text-white
                font-bold
                text-xs
              "
            >
              <img
                src={imgLogo}
                alt="LeadsNaMão"
                className="w-6 h-6 object-contain"
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleCollapse}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
            className="
              hidden
              sm:flex
              items-center
              justify-center
              w-8
              h-8
              rounded-lg
              text-gray-500
              hover:bg-gray-800
              hover:text-white
              transition
            "
          >
            <FaChevronLeft
              className={`
                transition-transform
                duration-300
                ${collapsed ? 'rotate-180' : ''}
              `}
            />
          </button>
        </div>

        {/* ======================================================
            USUÁRIO
        ====================================================== */}

        <div
          ref={dropdownRef}
          className="
            p-4
            border-b
            border-gray-800
            shrink-0
          "
        >
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            title={collapsed ? user?.name || 'Usuário' : ''}
            className="
              flex
              items-center
              gap-3
              w-full
              rounded-xl
              hover:bg-gray-800/60
              p-1
              transition
            "
          >
            {/* Avatar */}
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || 'Usuário'}
                className="
                  w-11
                  h-11
                  rounded-full
                  object-cover
                  border
                  border-blue-500/60
                  shrink-0
                "
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div
                className="
                  w-11
                  h-11
                  rounded-full
                  bg-blue-600
                  flex
                  items-center
                  justify-center
                  text-white
                  font-bold
                  shrink-0
                  border
                  border-blue-500/50
                "
              >
                {getInitials(user?.name)}
              </div>
            )}

            {!collapsed && (
              <div className="text-left min-w-0 flex-1">
                <p className="text-white text-sm font-semibold truncate">
                  {user?.name || 'Usuário'}
                </p>

                <span className="text-gray-500 text-xs">
                  {user?.isAdmin ? 'Administrador' : 'Corretor'}
                </span>
              </div>
            )}
          </button>

          {/* ====================================================
              USER DROPDOWN
          ==================================================== */}

          {dropdownOpen && (
            <div
              className="
                mt-3
                bg-gray-800
                border
                border-gray-700
                rounded-xl
                overflow-hidden
                shadow-xl
              "
            >
              {/* PERFIL */}
              <Link
                to={profilePath}
                onClick={() => {
                  setDropdownOpen(false);
                  setMobileOpen(false);
                }}
                className="
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3
                  text-sm
                  text-gray-200
                  hover:bg-gray-700
                  transition
                "
              >
                <FaUserTie size={14} />

                <span>Perfil</span>
              </Link>

              {/* NOTIFICAÇÕES */}
              <button
                type="button"
                onClick={handlePushToggle}
                disabled={pushLoading}
                className="
                  flex
                  items-center
                  gap-3
                  w-full
                  px-4
                  py-3
                  text-sm
                  text-gray-200
                  hover:bg-gray-700
                  transition
                  disabled:opacity-60
                  disabled:cursor-wait
                "
              >
                <FaBell
                  size={14}
                  className={pushSubscribed ? 'text-blue-400' : 'text-gray-400'}
                />

                <span className="flex-1 text-left">
                  {pushLoading
                    ? 'Configurando...'
                    : pushSubscribed
                      ? 'Notificações ativadas'
                      : 'Ativar notificações'}
                </span>

                {pushSubscribed && !pushLoading && (
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                )}
              </button>

              {/* SAIR */}
              <button
                type="button"
                onClick={handleLogout}
                className="
                  flex
                  items-center
                  gap-3
                  w-full
                  px-4
                  py-3
                  text-sm
                  text-gray-200
                  hover:bg-gray-700
                  transition
                "
              >
                <FaSignOutAlt size={14} />

                <span>Sair</span>
              </button>
            </div>
          )}
        </div>

        {/* ======================================================
            NAVEGAÇÃO
        ====================================================== */}

        <nav
          className="
            flex-1
            p-3
            overflow-y-auto
            min-h-0
          "
        >
          <ul className="space-y-1.5">
            {/* ==================================================
                ADMIN
            ================================================== */}

            {user?.isAdmin ? (
              <>
                {/* Menus principais */}
                {adminLinks.map((item) => renderMenuItem(item))}

                {/* Vendas */}
                {renderSalesMenu()}
              </>
            ) : (
              /* ==================================================
                 CORRETOR
              ================================================== */

              brokerLinks.map((item) => renderMenuItem(item))
            )}
          </ul>
        </nav>

        {/* ======================================================
            FOOTER
        ====================================================== */}

        {!collapsed && (
          <div
            className="
              p-4
              border-t
              border-gray-800
              shrink-0
            "
          >
            <p className="text-[10px] text-gray-600 text-center">
              LeadsNaMão v1.0
            </p>
          </div>
        )}
      </aside>
    </>
  );
}

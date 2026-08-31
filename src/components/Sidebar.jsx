import { useState, useRef, useContext, useEffect } from 'react';

import { Link, useLocation, useNavigate } from 'react-router-dom';

import { UserContext } from '../context/UserContext';

import {
  FaBars,
  FaCalendarCheck,
  FaCalendarAlt,
  FaChevronLeft,
  FaChartLine,
  FaClipboardList,
  FaUser,
  FaGlobe,
  FaSignOutAlt,
  FaBuilding,
  FaUserTie,
  FaProjectDiagram,
  FaTachometerAlt,
  FaPlusSquare,
  FaBullseye,
  FaMoneyBillWave, // NOVO
  FaHandshake, // NOVO
  FaChevronDown, // NOVO
  FaChevronRight, // NOVO
  FaShoppingCart, // NOVO
  FaCheckCircle, // NOVO
  FaClock, // NOVO
} from 'react-icons/fa';

export default function Sidebar({ onCollapseChange }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [salesMenuOpen, setSalesMenuOpen] = useState(false); // NOVO
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(UserContext);

  /*
  =========================
       HELPERS
  =========================
  */

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
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

  const isActive = (path) => location.pathname === path;
  const isActivePath = (paths) =>
    paths.some((path) => location.pathname === path);

  // Verifica se está em uma página de vendas para abrir o submenu
  const isSalesActive = isActivePath(['/sales', '/sales/:id', '/commissions']);

  // Abre o submenu automaticamente se estiver em uma página de vendas
  useEffect(() => {
    if (isSalesActive) {
      setSalesMenuOpen(true);
    }
  }, [location.pathname]);

  /*
  =========================
          MENUS
  =========================
  */

  // 🔥 NOVO: Menu de Vendas com subitens
  const salesMenu = {
    path: '#',
    label: 'Vendas',
    icon: <FaHandshake />,
    subItems: [
      {
        path: '/sales',
        label: 'Todas as Vendas',
        icon: <FaShoppingCart />,
        badge: null, // Poderia mostrar contagem de vendas pendentes
      },
      {
        path: '/commissions',
        label: 'Comissões',
        icon: <FaMoneyBillWave />,
        badge: null, // Poderia mostrar contagem de comissões pendentes
      },
      {
        path: '/commissions?status=pending',
        label: 'Aprovar Comissões',
        icon: <FaCheckCircle />,
        badge: null, // Poderia mostrar contagem de comissões pendentes
      },
    ],
  };

  const adminLinks = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: <FaTachometerAlt />,
    },
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
    {
      path: '/brokers',
      label: 'Corretores',
      icon: <FaUserTie />,
    },
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
      path: '/proposals',
      label: 'Propostas',
      icon: <FaBullseye />,
    },
    {
      path: '/visits',
      label: 'Agenda de Visitas',
      icon: <FaCalendarAlt />,
    },
    {
      path: '/home',
      label: 'Site da Imobiliária',
      icon: <FaGlobe />,
      target: '_blank',
    },
  ];

  const brokerLinks = user
    ? [
        {
          path: '/broker-dashboard',
          label: 'Meu Dashboard',
          icon: <FaChartLine />,
        },
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
        {
          path: '/my-visits',
          label: 'Minhas Visitas',
          icon: <FaCalendarCheck />,
        },
        {
          path: '/profile',
          label: 'Perfil',
          icon: <FaUser />,
        },
        {
          path: '/property-list',
          label: 'Imóveis',
          icon: <FaBuilding />,
        },
        {
          path: `/broker/${slugify(user.name)}`,
          label: 'Meu Site',
          target: '_blank',
          icon: <FaGlobe />,
        },
      ]
    : [];

  const menu = user?.isAdmin ? adminLinks : brokerLinks;

  // ============================================
  // RENDERIZA ITEM DO MENU
  // ============================================
  const renderMenuItem = (item) => {
    // Se for o menu de Vendas (admin), renderiza com submenu
    if (user?.isAdmin && item.label === 'Vendas') {
      return renderSalesMenu();
    }

    // Item normal
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
            flex
            items-center
            gap-3
            p-3
            rounded-lg
            transition

            ${
              isActive(item.path)
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }
          `}
        >
          <span className="text-lg">{item.icon}</span>

          {!collapsed && (
            <span className="text-sm font-medium">{item.label}</span>
          )}
        </Link>
      </li>
    );
  };

  // ============================================
  // RENDERIZA SUBMENU DE VENDAS
  // ============================================
  const renderSalesMenu = () => {
    const isSalesActive = isActivePath(['/admin/sales', '/admin/commissions']);

    return (
      <li>
        {/* Botão do menu Vendas */}
        <button
          onClick={() => !collapsed && setSalesMenuOpen(!salesMenuOpen)}
          className={`
            w-full
            flex
            items-center
            gap-3
            p-3
            rounded-lg
            transition
            ${
              isSalesActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }
          `}
          title={collapsed ? 'Vendas' : ''}
        >
          <span className="text-lg">
            <FaHandshake />
          </span>

          {!collapsed && (
            <>
              <span className="text-sm font-medium flex-1 text-left">
                Vendas
              </span>

              <span className="text-xs">
                {salesMenuOpen ? <FaChevronDown /> : <FaChevronRight />}
              </span>
            </>
          )}
        </button>

        {/* Subitens */}
        {!collapsed && salesMenuOpen && (
          <ul className="ml-6 mt-1 space-y-1 border-l-2 border-gray-700 pl-3">
            {salesMenu.subItems.map((subItem) => (
              <li key={subItem.path}>
                <Link
                  to={subItem.path}
                  onClick={() => {
                    setMobileOpen(false);
                    setDropdownOpen(false);
                  }}
                  className={`
                    flex
                    items-center
                    gap-3
                    p-2.5
                    rounded-lg
                    text-sm
                    transition
                    ${
                      isActive(subItem.path)
                        ? 'bg-blue-600/30 text-blue-400'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <span className="text-sm">{subItem.icon}</span>
                  <span className="flex-1">{subItem.label}</span>

                  {/* Badge para itens pendentes */}
                  {subItem.badge && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-400">
                      {subItem.badge}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <>
      {/* =========================================
          MOBILE BUTTON
      ========================================= */}

      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="
          fixed
          top-4
          left-4
          z-50
          p-3
          rounded-lg
          bg-gray-900
          text-white
          shadow-lg
          sm:hidden
        "
      >
        <FaBars />
      </button>

      {/* =========================================
          MOBILE OVERLAY
      ========================================= */}

      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="
            fixed
            inset-0
            bg-black/50
            z-30
            sm:hidden
          "
        />
      )}

      {/* =========================================
          SIDEBAR
      ========================================= */}

      <aside
        className={`
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
        {/* =========================================
            HEADER
        ========================================= */}

        <div
          className="
            flex
            items-center
            justify-between
            p-4
            border-b
            border-gray-800
          "
        >
          {!collapsed && (
            <h1
              className="
                text-xl
                font-bold
                text-white
              "
            >
              Leads
              <span className="text-blue-500">NaMão</span>
            </h1>
          )}

          <button
            onClick={handleCollapse}
            className="
              hidden
              sm:flex
              text-gray-400
              hover:text-white
            "
          >
            <FaChevronLeft
              className={`
                transition
                ${collapsed ? 'rotate-180' : ''}
              `}
            />
          </button>
        </div>

        {/* =========================================
            USER
        ========================================= */}

        <div
          ref={dropdownRef}
          className="
            p-4
            border-b
            border-gray-800
          "
        >
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="
              flex
              items-center
              gap-3
              w-full
            "
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="
                  w-12
                  h-12
                  rounded-full
                  object-cover
                  border
                  border-blue-500
                "
              />
            ) : (
              <div
                className="
                  w-12
                  h-12
                  rounded-full
                  bg-blue-600
                  flex
                  items-center
                  justify-center
                  text-white
                  font-bold
                "
              >
                {getInitials(user?.name)}
              </div>
            )}

            {!collapsed && (
              <div className="text-left">
                <p
                  className="
                    text-white
                    text-sm
                    font-semibold
                  "
                >
                  {user?.name}
                </p>

                <span
                  className="
                    text-gray-400
                    text-xs
                  "
                >
                  {user?.isAdmin ? 'Administrador' : 'Corretor'}
                </span>
              </div>
            )}
          </button>

          {/* =========================================
              USER DROPDOWN
          ========================================= */}

          {dropdownOpen && (
            <div
              className="
                mt-3
                bg-gray-800
                rounded-lg
                overflow-hidden
              "
            >
              <Link
                to={user?.isAdmin ? '/me' : '/profile'}
                className="
                  block
                  px-4
                  py-2
                  text-gray-200
                  hover:bg-gray-700
                "
              >
                Perfil
              </Link>

              <button
                onClick={handleLogout}
                className="
                  flex
                  items-center
                  gap-2
                  w-full
                  px-4
                  py-2
                  text-gray-200
                  hover:bg-gray-700
                "
              >
                <FaSignOutAlt />
                Sair
              </button>
            </div>
          )}
        </div>

        {/* =========================================
            MENU
        ========================================= */}

        <nav
          className="
            flex-1
            p-3
            overflow-y-auto
          "
        >
          <ul className="space-y-2">
            {/* Menu para ADMIN */}
            {user?.isAdmin ? (
              <>
                {/* Itens principais */}
                {adminLinks.map((item) => renderMenuItem(item))}

                {/* 🔥 Menu de Vendas (com submenu) */}
                {renderSalesMenu()}
              </>
            ) : (
              /* Menu para CORRETOR */
              brokerLinks.map((item) => renderMenuItem(item))
            )}
          </ul>
        </nav>

        {/* =========================================
            FOOTER (opcional)
        ========================================= */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-800">
            <p className="text-xs text-gray-500 text-center">LeadsNaMão v1.0</p>
          </div>
        )}
      </aside>
    </>
  );
}

import { useState, useRef, useContext, useEffect } from 'react';

import { Link, useLocation, useNavigate } from 'react-router-dom';

import { UserContext } from '../context/UserContext';

import {
  FaBars,
  FaCalendarCheck,
  FaCalendarAlt,
  FaChevronLeft,
  FaChartLine,
  FaHome,
  FaUsers,
  FaClipboardList,
  FaUser,
  FaGlobe,
  FaSignOutAlt,
  FaBuilding,
  FaUserTie,
  FaProjectDiagram,
  FaTachometerAlt,
  FaPlusSquare,
} from 'react-icons/fa';

export default function Sidebar({ onCollapseChange }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const [collapsed, setCollapsed] = useState(false);

  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  /*
  =========================
          MENUS
  =========================
  */

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
      path: '/visits',
      label: 'Agenda de Visitas',
      icon: <FaCalendarAlt />,
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
          path: `/hotsite/${slugify(user.name)}`,
          label: 'Meu Site',
          icon: <FaGlobe />,
        },
      ]
    : [];

  const menu = user?.isAdmin ? adminLinks : brokerLinks;

  return (
    <>
      {/* MOBILE BUTTON */}

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

      {/* MOBILE OVERLAY */}

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

      {/* SIDEBAR */}

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
        {/* HEADER */}

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

        {/* USER */}

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

        {/* MENU */}

        <nav
          className="
flex-1
p-3
"
        >
          <ul className="space-y-2">
            {menu.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}

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
                    <span
                      className="
text-sm
font-medium
"
                    >
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}

import { useState, useEffect, useContext, useRef, useMemo } from 'react';
import {
  FaTimes,
  FaSearch,
  FaUser,
  FaUsers,
  FaCheck,
  FaCircle,
  FaComments,
  FaSpinner,
  FaTrashAlt,
  FaArrowRight,
  FaShieldAlt,
  FaUserPlus,
  FaExclamationCircle,
} from 'react-icons/fa';

import { useChat } from '../../context/ChatContext';
import { UserContext } from '../../context/UserContext';

const getInitials = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const getRoleLabel = (role) => {
  const roles = {
    admin: 'Administrador',
    broker: 'Corretor',
    manager: 'Gestor',
    user: 'Usuário',
  };

  return roles[role] || 'Usuário';
};

const getUserId = (value) => {
  if (!value) return '';

  return String(typeof value === 'object' && value._id ? value._id : value);
};

export default function NewConversationModal({ isOpen, onClose }) {
  const { user } = useContext(UserContext);
  const { createConversation, createBrokerChannel, searchUsers } = useChat();

  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUsersData, setSelectedUsersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [mode, setMode] = useState('direct');
  const [error, setError] = useState('');

  const searchInputRef = useRef(null);
  const channelInputRef = useRef(null);
  const requestIdRef = useRef(0);

  const isAdmin = user?.role === 'admin' || user?.isAdmin === true;

  const selectedUserObjects = useMemo(() => {
    return selectedUsers
      .map((id) => {
        const normalizedId = getUserId(id);

        return (
          selectedUsersData.find((item) => getUserId(item) === normalizedId) ||
          results.find((item) => getUserId(item) === normalizedId)
        );
      })
      .filter(Boolean);
  }, [selectedUsers, selectedUsersData, results]);

  const canCreate =
    mode === 'direct'
      ? selectedUsers.length > 0
      : channelName.trim().length > 0;

  // =========================================================
  // RESET
  // =========================================================

  useEffect(() => {
    if (isOpen) return;

    requestIdRef.current += 1;
    setSearch('');
    setResults([]);
    setSelectedUsers([]);
    setSelectedUsersData([]);
    setChannelName('');
    setMode('direct');
    setLoading(false);
    setCreating(false);
    setError('');
  }, [isOpen]);

  // =========================================================
  // FOCUS
  // =========================================================

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (mode === 'direct') {
        searchInputRef.current?.focus();
      } else {
        channelInputRef.current?.focus();
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [isOpen, mode]);

  // =========================================================
  // ESC
  // =========================================================

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !creating) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, creating, onClose]);

  // =========================================================
  // BUSCA DE USUÁRIOS
  // =========================================================

  useEffect(() => {
    if (!isOpen || mode !== 'direct') {
      setLoading(false);
      return;
    }

    const normalizedSearch = search.trim();
    const requestId = ++requestIdRef.current;

    if (normalizedSearch.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError('');

        const users = await searchUsers(normalizedSearch);

        if (requestId !== requestIdRef.current) return;

        const currentUserId = getUserId(user?._id);

        const filteredUsers = Array.isArray(users)
          ? users.filter((item) => getUserId(item) !== currentUserId)
          : [];

        setResults(filteredUsers);

        // Mantém os dados dos usuários já selecionados mesmo
        // quando uma nova busca altera a lista de resultados.
        setSelectedUsersData((previous) => {
          const merged = new Map(
            previous.map((item) => [getUserId(item), item]),
          );

          filteredUsers.forEach((item) => {
            const id = getUserId(item);

            if (
              selectedUsers.some((selectedId) => getUserId(selectedId) === id)
            ) {
              merged.set(id, item);
            }
          });

          return Array.from(merged.values());
        });
      } catch (err) {
        if (requestId !== requestIdRef.current) return;

        console.error('Erro ao buscar usuários:', err);
        setResults([]);
        setError('Não foi possível buscar os usuários. Tente novamente.');
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, mode, isOpen, searchUsers, user?._id]);

  // =========================================================
  // SELEÇÃO DE USUÁRIOS
  // =========================================================

  const isSelected = (userId) =>
    selectedUsers.some((id) => getUserId(id) === getUserId(userId));

  const toggleUser = (userItem) => {
    const userId = getUserId(userItem);

    if (!userId || creating) return;

    setError('');

    if (isSelected(userId)) {
      setSelectedUsers((previous) =>
        previous.filter((id) => getUserId(id) !== userId),
      );

      setSelectedUsersData((previous) =>
        previous.filter((item) => getUserId(item) !== userId),
      );

      return;
    }

    setSelectedUsers((previous) => [...previous, userId]);

    setSelectedUsersData((previous) => {
      const exists = previous.some((item) => getUserId(item) === userId);

      return exists ? previous : [...previous, userItem];
    });
  };

  const clearSelectedUsers = () => {
    setSelectedUsers([]);
    setSelectedUsersData([]);
    setError('');
  };

  // =========================================================
  // CRIAR CONVERSA OU CANAL
  // =========================================================

  const handleCreate = async () => {
    if (creating || !canCreate) return;

    try {
      setError('');
      setCreating(true);

      if (mode === 'channel') {
        const name = channelName.trim();

        if (!name) {
          setError('Digite um nome para o canal.');
          return;
        }

        await createBrokerChannel(name);
      } else {
        if (selectedUsers.length === 0) {
          setError('Selecione pelo menos um usuário.');
          return;
        }

        await createConversation(selectedUsers);
      }

      onClose();
    } catch (err) {
      console.error('Erro ao criar conversa:', err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Não foi possível criar a conversa. Tente novamente.',
      );
    } finally {
      setCreating(false);
    }
  };

  // =========================================================
  // MODO
  // =========================================================

  const handleModeChange = (nextMode) => {
    if (creating || mode === nextMode) return;

    requestIdRef.current += 1;
    setMode(nextMode);
    setError('');
    setLoading(false);

    if (nextMode === 'channel') {
      setSearch('');
      setResults([]);
      setSelectedUsers([]);
      setSelectedUsersData([]);
    } else {
      setChannelName('');
    }
  };

  // =========================================================
  // FECHAR
  // =========================================================

  const handleClose = () => {
    if (creating) return;
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#02040a]/80 p-3 backdrop-blur-xl sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !creating) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-conversation-title"
        className="
          relative flex max-h-[min(780px,92dvh)] w-full max-w-[540px]
          flex-col overflow-hidden rounded-[24px]
          border border-white/[0.09] bg-[#0b0f18]
          shadow-[0_32px_100px_rgba(0,0,0,0.65)]
          ring-1 ring-black/30
        "
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Reflexo decorativo */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />
        <div className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full bg-blue-500/[0.07] blur-[90px]" />

        {/* HEADER */}
        <header className="relative flex shrink-0 items-center justify-between border-b border-white/[0.07] px-5 py-5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-blue-400/20 bg-gradient-to-br from-blue-500/20 to-indigo-500/[0.07] text-blue-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <FaComments size={19} />
              <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-[3px] border-[#0b0f18] bg-blue-400" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="new-conversation-title"
                  className="text-[16px] font-bold tracking-[-0.035em] text-white sm:text-[17px]"
                >
                  Nova conversa
                </h2>

                <span className="rounded-md border border-blue-400/15 bg-blue-400/[0.08] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.12em] text-blue-300">
                  Chat
                </span>
              </div>

              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                Conecte-se com sua equipe em poucos passos.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={creating}
            aria-label="Fechar janela"
            className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-transparent text-slate-500 transition duration-200 hover:border-white/[0.08] hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FaTimes size={14} />
          </button>
        </header>

        {/* BODY */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6 sm:py-6">
          <div className="space-y-6">
            {/* TIPO DE CONVERSA */}
            <section>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
                    Tipo de conversa
                  </p>
                  <p className="mt-1 text-[10px] text-slate-600">
                    Escolha como deseja se comunicar.
                  </p>
                </div>

                <span className="text-[10px] font-medium text-slate-600">
                  Etapa 01
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* CONVERSA DIRETA */}
                <button
                  type="button"
                  onClick={() => handleModeChange('direct')}
                  disabled={creating}
                  aria-pressed={mode === 'direct'}
                  className={`
                    group relative flex min-h-[105px] flex-col justify-between
                    overflow-hidden rounded-2xl border p-3.5 text-left
                    transition-all duration-200 sm:p-4
                    ${
                      mode === 'direct'
                        ? 'border-blue-400/35 bg-gradient-to-br from-blue-500/[0.13] to-blue-500/[0.035] shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]'
                        : 'border-white/[0.07] bg-white/[0.018] hover:border-white/[0.14] hover:bg-white/[0.035]'
                    }
                    disabled:cursor-not-allowed disabled:opacity-50
                  `}
                >
                  <div className="flex w-full items-start justify-between">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
                        mode === 'direct'
                          ? 'border-blue-400/20 bg-blue-400/[0.12] text-blue-300'
                          : 'border-white/[0.06] bg-white/[0.035] text-slate-500 group-hover:text-slate-300'
                      }`}
                    >
                      <FaUser size={14} />
                    </div>

                    <span
                      className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border transition ${
                        mode === 'direct'
                          ? 'border-blue-400 bg-blue-400 text-[#07101f]'
                          : 'border-white/[0.14] text-transparent'
                      }`}
                    >
                      <FaCheck size={8} />
                    </span>
                  </div>

                  <div className="mt-3">
                    <p
                      className={`text-[12px] font-bold ${
                        mode === 'direct' ? 'text-white' : 'text-slate-300'
                      }`}
                    >
                      Conversa direta
                    </p>
                    <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                      Inicie um diálogo privado.
                    </p>
                  </div>
                </button>

                {/* CANAL */}
                {isAdmin ? (
                  <button
                    type="button"
                    onClick={() => handleModeChange('channel')}
                    disabled={creating}
                    aria-pressed={mode === 'channel'}
                    className={`
                      group relative flex min-h-[105px] flex-col justify-between
                      overflow-hidden rounded-2xl border p-3.5 text-left
                      transition-all duration-200 sm:p-4
                      ${
                        mode === 'channel'
                          ? 'border-blue-400/35 bg-gradient-to-br from-blue-500/[0.13] to-indigo-500/[0.035] shadow-[inset_0_1px_0_rgba(255,255,255,0.035)]'
                          : 'border-white/[0.07] bg-white/[0.018] hover:border-white/[0.14] hover:bg-white/[0.035]'
                      }
                      disabled:cursor-not-allowed disabled:opacity-50
                    `}
                  >
                    <div className="flex w-full items-start justify-between">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${
                          mode === 'channel'
                            ? 'border-blue-400/20 bg-blue-400/[0.12] text-blue-300'
                            : 'border-white/[0.06] bg-white/[0.035] text-slate-500 group-hover:text-slate-300'
                        }`}
                      >
                        <FaUsers size={15} />
                      </div>

                      <span
                        className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border transition ${
                          mode === 'channel'
                            ? 'border-blue-400 bg-blue-400 text-[#07101f]'
                            : 'border-white/[0.14] text-transparent'
                        }`}
                      >
                        <FaCheck size={8} />
                      </span>
                    </div>

                    <div className="mt-3">
                      <p
                        className={`text-[12px] font-bold ${
                          mode === 'channel' ? 'text-white' : 'text-slate-300'
                        }`}
                      >
                        Canal da equipe
                      </p>
                      <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
                        Comunicação compartilhada.
                      </p>
                    </div>
                  </button>
                ) : (
                  <div className="flex min-h-[105px] flex-col justify-between rounded-2xl border border-white/[0.045] bg-white/[0.012] p-3.5 opacity-55 sm:p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.04] bg-white/[0.025] text-slate-600">
                      <FaUsers size={15} />
                    </div>

                    <div className="mt-3">
                      <p className="text-[12px] font-bold text-slate-500">
                        Canal da equipe
                      </p>
                      <p className="mt-1 text-[10px] text-slate-600">
                        Exclusivo para administradores.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* CONVERSA DIRETA */}
            {mode === 'direct' && (
              <section className="space-y-4">
                <div>
                  <div className="mb-2.5 flex items-center justify-between">
                    <label
                      htmlFor="conversation-user-search"
                      className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400"
                    >
                      Encontrar usuário
                    </label>

                    {selectedUsers.length > 0 && (
                      <span className="text-[10px] font-semibold text-blue-300">
                        {selectedUsers.length} selecionado
                        {selectedUsers.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="group relative">
                    <FaSearch
                      size={13}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition group-focus-within:text-blue-300"
                    />

                    <input
                      id="conversation-user-search"
                      ref={searchInputRef}
                      type="text"
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setError('');
                      }}
                      placeholder="Nome ou endereço de e-mail..."
                      autoComplete="off"
                      disabled={creating}
                      className="
                        h-[46px] w-full rounded-[14px]
                        border border-white/[0.08] bg-[#070a11]
                        pl-11 pr-11 text-[12px] text-slate-100
                        outline-none transition duration-200
                        placeholder:text-slate-600
                        hover:border-white/[0.13]
                        focus:border-blue-400/50 focus:bg-[#090d16]
                        focus:ring-4 focus:ring-blue-500/[0.07]
                        disabled:cursor-not-allowed disabled:opacity-50
                      "
                    />

                    {loading ? (
                      <FaSpinner
                        size={13}
                        className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-blue-300"
                      />
                    ) : search ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSearch('');
                          setResults([]);
                          setError('');
                          searchInputRef.current?.focus();
                        }}
                        disabled={creating}
                        aria-label="Limpar busca"
                        className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/[0.06] hover:text-white"
                      >
                        <FaTimes size={11} />
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* LISTA DE USUÁRIOS */}
                {search.trim().length < 2 ? (
                  <div className="flex flex-col items-center rounded-2xl border border-dashed border-white/[0.09] bg-white/[0.012] px-5 py-7 text-center">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.025] text-slate-500">
                      <FaUserPlus size={16} />
                    </div>

                    <p className="text-[12px] font-semibold text-slate-300">
                      Quem você deseja encontrar?
                    </p>
                    <p className="mt-1.5 max-w-[250px] text-[10px] leading-relaxed text-slate-500">
                      Digite pelo menos 2 caracteres para pesquisar os usuários
                      disponíveis no CRM.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                        Resultados da busca
                      </span>

                      {!loading && (
                        <span className="text-[10px] tabular-nums text-slate-600">
                          {results.length}{' '}
                          {results.length === 1 ? 'usuário' : 'usuários'}
                        </span>
                      )}
                    </div>

                    <div className="max-h-[230px] space-y-1 overflow-y-auto overscroll-contain pr-1 [scrollbar-color:rgba(148,163,184,0.18)_transparent] [scrollbar-width:thin]">
                      {loading ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.05] bg-white/[0.012] py-9">
                          <FaSpinner
                            size={18}
                            className="mb-3 animate-spin text-blue-300"
                          />
                          <span className="text-[11px] text-slate-500">
                            Procurando usuários...
                          </span>
                        </div>
                      ) : results.length === 0 ? (
                        <div className="rounded-2xl border border-white/[0.05] bg-white/[0.012] px-4 py-8 text-center">
                          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.03] text-slate-600">
                            <FaSearch size={14} />
                          </div>

                          <p className="text-[12px] font-semibold text-slate-300">
                            Nenhum usuário encontrado
                          </p>
                          <p className="mt-1.5 text-[10px] text-slate-500">
                            Confira a escrita ou tente outro termo.
                          </p>
                        </div>
                      ) : (
                        results.map((item) => {
                          const selected = isSelected(item._id);

                          return (
                            <button
                              key={item._id}
                              type="button"
                              onClick={() => toggleUser(item)}
                              disabled={creating}
                              aria-pressed={selected}
                              className={`
                                group flex w-full items-center gap-3
                                rounded-[14px] border p-3 text-left
                                transition-all duration-150
                                ${
                                  selected
                                    ? 'border-blue-400/25 bg-blue-400/[0.075]'
                                    : 'border-transparent bg-transparent hover:border-white/[0.06] hover:bg-white/[0.025]'
                                }
                                disabled:cursor-not-allowed disabled:opacity-50
                              `}
                            >
                              <div className="relative shrink-0">
                                <div
                                  className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-[13px] border ${
                                    selected
                                      ? 'border-blue-400/30 bg-blue-400/10'
                                      : 'border-white/[0.08] bg-gradient-to-br from-slate-700/70 to-slate-900'
                                  }`}
                                >
                                  {item.avatar || item.profileImage ? (
                                    <img
                                      src={item.avatar || item.profileImage}
                                      alt={item.name || 'Usuário'}
                                      loading="lazy"
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-[11px] font-bold tracking-wide text-slate-300">
                                      {getInitials(item.name)}
                                    </span>
                                  )}
                                </div>

                                <FaCircle
                                  size={7}
                                  className={`absolute -bottom-0.5 -right-0.5 rounded-full ring-[3px] ring-[#0b0f18] ${
                                    selected
                                      ? 'text-blue-400'
                                      : 'text-slate-600'
                                  }`}
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                                  <p className="max-w-full truncate text-[12px] font-semibold text-slate-100">
                                    {item.name || 'Usuário'}
                                  </p>

                                  {item.role && (
                                    <span className="hidden rounded-md border border-white/[0.06] bg-white/[0.025] px-1.5 py-0.5 text-[8px] font-semibold text-slate-500 sm:inline-flex">
                                      {getRoleLabel(item.role)}
                                    </span>
                                  )}
                                </div>

                                <p className="mt-1 truncate text-[10px] text-slate-500">
                                  {item.email || 'E-mail não informado'}
                                </p>
                              </div>

                              <span
                                className={`flex h-[23px] w-[23px] shrink-0 items-center justify-center rounded-lg border transition ${
                                  selected
                                    ? 'border-blue-400 bg-blue-400 text-[#07101f]'
                                    : 'border-white/[0.12] text-transparent group-hover:border-white/[0.2]'
                                }`}
                              >
                                <FaCheck size={9} />
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* USUÁRIOS SELECIONADOS */}
                {selectedUsers.length > 0 && (
                  <div className="overflow-hidden rounded-2xl border border-blue-400/[0.16] bg-gradient-to-br from-blue-500/[0.055] to-transparent">
                    <div className="flex items-center justify-between gap-3 border-b border-white/[0.05] px-3.5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-400/[0.1] text-blue-300">
                          <FaUsers size={12} />
                        </div>

                        <div>
                          <p className="text-[11px] font-bold text-slate-200">
                            Destinatários
                          </p>
                          <p className="mt-0.5 text-[9px] text-slate-500">
                            Pessoas selecionadas para a conversa
                          </p>
                        </div>

                        <span className="flex h-5 min-w-5 items-center justify-center rounded-md bg-blue-400/[0.12] px-1.5 text-[9px] font-bold text-blue-300">
                          {selectedUsers.length}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={clearSelectedUsers}
                        disabled={creating}
                        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-medium text-slate-500 transition hover:bg-red-400/[0.08] hover:text-red-300 disabled:opacity-40"
                      >
                        <FaTrashAlt size={9} />
                        Limpar
                      </button>
                    </div>

                    <div className="flex max-h-[112px] flex-wrap gap-2 overflow-y-auto p-3 [scrollbar-width:thin]">
                      {selectedUserObjects.map((userObj) => (
                        <div
                          key={userObj._id}
                          className="flex max-w-full items-center gap-2 rounded-xl border border-white/[0.07] bg-[#0b0f18]/80 py-1.5 pl-1.5 pr-2"
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-800 text-[9px] font-bold text-slate-300">
                            {userObj.avatar || userObj.profileImage ? (
                              <img
                                src={userObj.avatar || userObj.profileImage}
                                alt={userObj.name || 'Usuário'}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              getInitials(userObj.name)
                            )}
                          </div>

                          <span className="max-w-[130px] truncate text-[10px] font-medium text-slate-200">
                            {userObj.name || 'Usuário'}
                          </span>

                          <button
                            type="button"
                            onClick={() => toggleUser(userObj)}
                            disabled={creating}
                            aria-label={`Remover ${userObj.name || 'usuário'}`}
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-red-400/10 hover:text-red-300 disabled:opacity-40"
                          >
                            <FaTimes size={9} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* CANAL */}
            {mode === 'channel' && (
              <section className="space-y-4">
                <div>
                  <label
                    htmlFor="conversation-channel-name"
                    className="mb-2.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400"
                  >
                    Nome do canal
                  </label>

                  <div className="group relative">
                    <FaUsers
                      size={14}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition group-focus-within:text-blue-300"
                    />

                    <input
                      id="conversation-channel-name"
                      ref={channelInputRef}
                      type="text"
                      value={channelName}
                      onChange={(event) => {
                        setChannelName(event.target.value);
                        setError('');
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          handleCreate();
                        }
                      }}
                      placeholder="Ex.: Equipe de Vendas"
                      maxLength={80}
                      autoComplete="off"
                      disabled={creating}
                      className="
                        h-[46px] w-full rounded-[14px]
                        border border-white/[0.08] bg-[#070a11]
                        pl-11 pr-4 text-[12px] text-slate-100
                        outline-none transition duration-200
                        placeholder:text-slate-600
                        hover:border-white/[0.13]
                        focus:border-blue-400/50 focus:bg-[#090d16]
                        focus:ring-4 focus:ring-blue-500/[0.07]
                        disabled:cursor-not-allowed disabled:opacity-50
                      "
                    />

                    <span className="pointer-events-none absolute bottom-[-19px] right-1 text-[9px] tabular-nums text-slate-600">
                      {channelName.length}/80
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex gap-3 rounded-2xl border border-blue-400/[0.13] bg-gradient-to-br from-blue-500/[0.07] to-transparent p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-400/[0.09] text-blue-300">
                    <FaShieldAlt size={14} />
                  </div>

                  <div>
                    <p className="text-[11px] font-bold text-slate-200">
                      Canal compartilhado da equipe
                    </p>
                    <p className="mt-1.5 text-[10px] leading-[1.7] text-slate-500">
                      Os corretores e administradores ativos elegíveis serão
                      incluídos automaticamente pelo CRM. Você poderá utilizar o
                      canal para compartilhar informações e alinhar atividades
                      com a equipe.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* ERRO */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.07] px-3.5 py-3"
              >
                <FaExclamationCircle
                  size={13}
                  className="mt-0.5 shrink-0 text-red-300"
                />

                <p className="min-w-0 flex-1 text-[11px] leading-relaxed text-red-200">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => setError('')}
                  aria-label="Fechar mensagem de erro"
                  className="shrink-0 rounded-md p-1 text-red-300/60 transition hover:bg-red-300/10 hover:text-red-200"
                >
                  <FaTimes size={10} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <footer className="relative flex shrink-0 flex-col-reverse gap-3 border-t border-white/[0.07] bg-[#090d15]/95 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="hidden items-center gap-2 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
            <span className="text-[10px] text-slate-500">
              {mode === 'channel'
                ? 'Canal da equipe'
                : selectedUsers.length > 0
                  ? `${selectedUsers.length} destinatário(s) selecionado(s)`
                  : 'Pronto para iniciar'}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              disabled={creating}
              className="
                h-10 rounded-xl border border-white/[0.07]
                px-4 text-[11px] font-semibold text-slate-400
                transition duration-200
                hover:border-white/[0.13] hover:bg-white/[0.035]
                hover:text-white
                disabled:cursor-not-allowed disabled:opacity-40
              "
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleCreate}
              disabled={!canCreate || creating}
              className="
                group relative flex h-10 items-center justify-center gap-2.5
                overflow-hidden rounded-xl border border-blue-400/25
                bg-gradient-to-r from-blue-600 to-blue-500
                px-4 text-[11px] font-bold text-white
                shadow-[0_5px_18px_rgba(37,99,235,0.18)]
                transition duration-200
                hover:border-blue-300/40 hover:from-blue-500 hover:to-indigo-500
                hover:shadow-[0_7px_24px_rgba(37,99,235,0.28)]
                active:scale-[0.98]
                disabled:cursor-not-allowed disabled:border-white/[0.05]
                disabled:bg-slate-800 disabled:text-slate-500
                disabled:shadow-none
              "
            >
              {creating ? (
                <>
                  <FaSpinner size={12} className="animate-spin" />
                  <span>Criando...</span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'channel' ? 'Criar canal' : 'Iniciar conversa'}
                  </span>
                  <FaArrowRight
                    size={10}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </>
              )}
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}

import { useState, useEffect, useContext, useRef } from 'react';
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
} from 'react-icons/fa';

import { useChat } from '../../context/ChatContext';
import { UserContext } from '../../context/UserContext';

export default function NewConversationModal({ isOpen, onClose }) {
  const { user } = useContext(UserContext);
  const { createConversation, createBrokerChannel, searchUsers } = useChat();

  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [mode, setMode] = useState('direct');
  const [error, setError] = useState('');

  const searchInputRef = useRef(null);
  const channelInputRef = useRef(null);

  // =========================================================
  // RESET
  // =========================================================

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setResults([]);
      setSelectedUsers([]);
      setChannelName('');
      setMode('direct');
      setLoading(false);
      setCreating(false);
      setError('');
    }
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
  // SEARCH USERS
  // =========================================================

  useEffect(() => {
    if (mode !== 'direct') return;

    const normalizedSearch = search.trim();

    const delayDebounce = setTimeout(async () => {
      if (normalizedSearch.length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const users = await searchUsers(normalizedSearch);
        const currentUserId = user?._id?.toString();

        const filteredUsers = Array.isArray(users)
          ? users.filter((item) => item?._id?.toString() !== currentUserId)
          : [];

        setResults(filteredUsers);
      } catch (err) {
        console.error('Erro ao buscar usuários:', err);
        setResults([]);
        setError('Não foi possível buscar os usuários.');
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, mode, searchUsers, user?._id]);

  // =========================================================
  // HELPERS
  // =========================================================

  const getInitials = (name = '') => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
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

  const isSelected = (userId) =>
    selectedUsers.some((id) => id?.toString() === userId?.toString());

  const selectedUserObjects = selectedUsers
    .map((id) =>
      results.find((item) => item?._id?.toString() === id?.toString()),
    )
    .filter(Boolean);

  // =========================================================
  // TOGGLE USER
  // =========================================================

  const toggleUser = (userId) => {
    if (!userId || creating) return;
    setError('');

    setSelectedUsers((prev) => {
      const exists = prev.some((id) => id?.toString() === userId?.toString());
      if (exists) {
        return prev.filter((id) => id?.toString() !== userId?.toString());
      }
      return [...prev, userId];
    });
  };

  // =========================================================
  // CREATE
  // =========================================================

  const handleCreate = async () => {
    if (creating) return;

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
          'Não foi possível criar a conversa.',
      );
    } finally {
      setCreating(false);
    }
  };

  // =========================================================
  // ENTER
  // =========================================================

  const handleKeyDown = (event) => {
    if (event.key !== 'Enter') return;

    if (mode === 'channel' && channelName.trim()) {
      handleCreate();
    }
  };

  // =========================================================
  // MODE
  // =========================================================

  const handleModeChange = (nextMode) => {
    if (creating) return;

    setMode(nextMode);
    setError('');

    if (nextMode === 'channel') {
      setSearch('');
      setResults([]);
      setSelectedUsers([]);
    } else {
      setChannelName('');
    }
  };

  // =========================================================
  // CLOSE
  // =========================================================

  const handleClose = () => {
    if (creating) return;
    onClose();
  };

  if (!isOpen) return null;

  const canCreate =
    mode === 'direct'
      ? selectedUsers.length > 0
      : channelName.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !creating) {
          onClose();
        }
      }}
    >
      <div
        className="
          relative
          w-full
          max-w-lg
          max-h-[90vh]
          flex
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-white/[0.07]
          bg-[#0d1119]
          shadow-[0_25px_80px_rgba(0,0,0,0.55)]
        "
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
              <FaComments size={16} />
            </div>
            <div>
              <h2 className="text-[15px] font-bold tracking-tight text-white">
                Nova conversa
              </h2>
              <p className="mt-0.5 text-[11px] text-gray-500">
                Inicie uma nova conversa no Leads Na Mão
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={creating}
            aria-label="Fechar"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <FaTimes size={15} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-5">
            {/* MODE SELECTOR */}
            <div>
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-gray-600">
                  Tipo de conversa
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Direct */}
                <button
                  type="button"
                  onClick={() => handleModeChange('direct')}
                  disabled={creating}
                  className={`
                    group relative flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all
                    ${
                      mode === 'direct'
                        ? 'border-blue-500/30 bg-blue-500/10'
                        : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.10] hover:bg-white/[0.04]'
                    }
                    disabled:cursor-not-allowed disabled:opacity-50
                  `}
                >
                  <div
                    className={`
                      flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition
                      ${
                        mode === 'direct'
                          ? 'bg-blue-500/15 text-blue-400'
                          : 'bg-white/[0.04] text-gray-500 group-hover:text-gray-300'
                      }
                    `}
                  >
                    <FaUser size={13} />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-bold ${
                        mode === 'direct' ? 'text-white' : 'text-gray-300'
                      }`}
                    >
                      Conversa direta
                    </p>
                    <p className="mt-0.5 text-[10px] text-gray-600">
                      Fale com um usuário
                    </p>
                  </div>
                  {mode === 'direct' && (
                    <div className="absolute right-3 top-3">
                      <FaCheck size={10} className="text-blue-400" />
                    </div>
                  )}
                </button>

                {/* Channel */}
                {user?.role === 'admin' ? (
                  <button
                    type="button"
                    onClick={() => handleModeChange('channel')}
                    disabled={creating}
                    className={`
                      group relative flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all
                      ${
                        mode === 'channel'
                          ? 'border-blue-500/30 bg-blue-500/10'
                          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.10] hover:bg-white/[0.04]'
                      }
                      disabled:cursor-not-allowed disabled:opacity-50
                    `}
                  >
                    <div
                      className={`
                        flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition
                        ${
                          mode === 'channel'
                            ? 'bg-blue-500/15 text-blue-400'
                            : 'bg-white/[0.04] text-gray-500 group-hover:text-gray-300'
                        }
                      `}
                    >
                      <FaUsers size={14} />
                    </div>
                    <div className="min-w-0">
                      <p
                        className={`text-xs font-bold ${
                          mode === 'channel' ? 'text-white' : 'text-gray-300'
                        }`}
                      >
                        Canal
                      </p>
                      <p className="mt-0.5 text-[10px] text-gray-600">
                        Comunicação em grupo
                      </p>
                    </div>
                    {mode === 'channel' && (
                      <div className="absolute right-3 top-3">
                        <FaCheck size={10} className="text-blue-400" />
                      </div>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center gap-3 rounded-xl border border-white/[0.04] bg-white/[0.015] px-3.5 py-3 opacity-40">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.03] text-gray-600">
                      <FaUsers size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500">Canal</p>
                      <p className="mt-0.5 text-[10px] text-gray-700">
                        Disponível para administradores
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* DIRECT MODE */}
            {mode === 'direct' && (
              <div className="space-y-3">
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-gray-600">
                    Encontrar usuário
                  </label>

                  <div className="relative">
                    <FaSearch
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600"
                      size={12}
                    />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setError('');
                      }}
                      placeholder="Digite nome ou e-mail..."
                      disabled={creating}
                      className="
                        h-11 w-full rounded-xl border border-white/[0.07] bg-[#080b11] pl-10 pr-10 text-xs text-white outline-none placeholder:text-gray-700 transition
                        focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10
                        disabled:cursor-not-allowed disabled:opacity-50
                      "
                    />

                    {loading && (
                      <FaSpinner
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-blue-400"
                        size={12}
                      />
                    )}

                    {!loading && search && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearch('');
                          setResults([]);
                          searchInputRef.current?.focus();
                        }}
                        className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-gray-600 transition hover:bg-white/[0.05] hover:text-gray-300"
                      >
                        <FaTimes size={10} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Search helper */}
                {search.trim().length < 2 && selectedUsers.length === 0 && (
                  <div className="rounded-xl border border-dashed border-white/[0.06] bg-white/[0.015] px-4 py-5 text-center">
                    <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-gray-600">
                      <FaSearch size={12} />
                    </div>
                    <p className="text-xs font-medium text-gray-500">
                      Busque por nome ou e-mail
                    </p>
                    <p className="mt-1 text-[10px] text-gray-700">
                      Digite pelo menos 2 caracteres
                    </p>
                  </div>
                )}

                {/* Results */}
                {search.trim().length >= 2 && (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-600">
                        Usuários
                      </span>
                      {!loading && results.length > 0 && (
                        <span className="text-[10px] text-gray-700">
                          {results.length}{' '}
                          {results.length === 1 ? 'resultado' : 'resultados'}
                        </span>
                      )}
                    </div>

                    <div className="max-h-52 space-y-1 overflow-y-auto pr-1">
                      {loading ? (
                        <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.05] bg-white/[0.015] py-8">
                          <FaSpinner
                            className="mb-2 animate-spin text-blue-400"
                            size={16}
                          />
                          <span className="text-[11px] text-gray-600">
                            Buscando usuários...
                          </span>
                        </div>
                      ) : results.length === 0 ? (
                        <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] px-4 py-8 text-center">
                          <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.03] text-gray-700">
                            <FaUser size={12} />
                          </div>
                          <p className="text-xs font-medium text-gray-500">
                            Nenhum usuário encontrado
                          </p>
                          <p className="mt-1 text-[10px] text-gray-700">
                            Tente outro nome ou e-mail
                          </p>
                        </div>
                      ) : (
                        results.map((item) => {
                          const selected = isSelected(item._id);
                          return (
                            <button
                              key={item._id}
                              type="button"
                              onClick={() => toggleUser(item._id)}
                              disabled={creating}
                              className={`
                                group flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-all
                                ${
                                  selected
                                    ? 'border-blue-500/25 bg-blue-500/[0.08]'
                                    : 'border-transparent hover:border-white/[0.05] hover:bg-white/[0.035]'
                                }
                                disabled:cursor-not-allowed disabled:opacity-50
                              `}
                            >
                              <div className="relative shrink-0">
                                <div
                                  className={`
                                    flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border
                                    ${
                                      selected
                                        ? 'border-blue-500/30 bg-blue-500/10'
                                        : 'border-white/[0.06] bg-gray-800'
                                    }
                                  `}
                                >
                                  {item.avatar ? (
                                    <img
                                      src={item.avatar}
                                      alt={item.name || 'Usuário'}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-xs font-bold text-gray-400">
                                      {getInitials(item.name)}
                                    </span>
                                  )}
                                </div>
                                <FaCircle className="absolute -bottom-0.5 -right-0.5 text-[7px] text-gray-600 ring-2 ring-[#0d1119]" />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="truncate text-xs font-semibold text-white">
                                    {item.name || 'Usuário'}
                                  </p>
                                  {item.role && (
                                    <span className="hidden rounded-md bg-white/[0.04] px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-wide text-gray-600 sm:inline-flex">
                                      {getRoleLabel(item.role)}
                                    </span>
                                  )}
                                </div>
                                <p className="mt-0.5 truncate text-[10px] text-gray-600">
                                  {item.email || 'Sem e-mail'}
                                </p>
                              </div>

                              <div
                                className={`
                                  flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition
                                  ${
                                    selected
                                      ? 'border-blue-500 bg-blue-500 text-white'
                                      : 'border-white/[0.10] bg-transparent text-transparent group-hover:border-white/[0.18]'
                                  }
                                `}
                              >
                                <FaCheck size={9} />
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* Selected */}
                {selectedUserObjects.length > 0 && (
                  <div className="rounded-xl border border-blue-500/15 bg-blue-500/[0.035] p-3">
                    <div className="mb-2.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-500">
                          Selecionados
                        </span>
                        <span className="rounded-md bg-blue-500/15 px-1.5 py-0.5 text-[9px] font-bold text-blue-400">
                          {selectedUsers.length}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedUsers([])}
                        className="text-[10px] text-gray-500 transition hover:text-red-400"
                      >
                        Limpar todos
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {selectedUserObjects.map((userObj) => (
                        <div
                          key={userObj._id}
                          className="flex items-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-[11px] text-white"
                        >
                          <span className="truncate max-w-[120px]">
                            {userObj.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleUser(userObj._id)}
                            className="text-gray-400 hover:text-white"
                          >
                            <FaTimes size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CHANNEL MODE */}
            {mode === 'channel' && (
              <div className="space-y-3">
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.14em] text-gray-600">
                    Nome do canal
                  </label>
                  <input
                    ref={channelInputRef}
                    type="text"
                    value={channelName}
                    onChange={(e) => {
                      setChannelName(e.target.value);
                      setError('');
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Ex: Equipe de Vendas"
                    disabled={creating}
                    className="
                      h-11 w-full rounded-xl border border-white/[0.07] bg-[#080b11] px-4 text-xs text-white outline-none placeholder:text-gray-700 transition
                      focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10
                      disabled:cursor-not-allowed disabled:opacity-50
                    "
                  />
                </div>
              </div>
            )}

            {/* ERROR MESSAGE */}
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-2 border-t border-white/[0.06] px-5 py-4 bg-[#0a0e17]">
          <button
            type="button"
            onClick={handleClose}
            disabled={creating}
            className="rounded-xl px-4 py-2.5 text-xs font-medium text-gray-400 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-40"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleCreate}
            disabled={!canCreate || creating}
            className="
              flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition
              hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            {creating ? (
              <>
                <FaSpinner className="animate-spin" size={12} />
                <span>Criando...</span>
              </>
            ) : (
              <span>
                {mode === 'channel' ? 'Criar canal' : 'Iniciar conversa'}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

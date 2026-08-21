import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  FaCalendarAlt,
  FaList,
  FaPlus,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaSyncAlt,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheck,
  FaShieldAlt,
  FaUserLock,
  FaBan,
  FaHome,
  FaUsers,
  FaUser,
  FaBriefcase,
  FaChevronDown,
  FaFilter,
  FaLayerGroup,
  FaArrowRight,
} from 'react-icons/fa';

import {
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  getCalendarMetrics,
} from '../service/calendarApi';

import { getLeads } from '../service/leadApi';
import { getProperties } from '../service/propertyApi';

import VisitList from '../components/visits/VisitList';
import VisitModal from '../components/visits/VisitModal';
import VisitFilters from '../components/visits/VisitFilters';
import VisitCalendar from '../components/visits/VisitCalendar';

export default function Visits() {
  // ============================================================
  // STATE
  // ============================================================

  const [visits, setVisits] = useState([]);
  const [leads, setLeads] = useState([]);
  const [properties, setProperties] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);

  const [viewMode, setViewMode] = useState('calendar');

  /**
   * commercial
   * personal
   * all
   */
  const [agendaMode, setAgendaMode] = useState('all');

  const [showCreateMenu, setShowCreateMenu] = useState(false);

  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [formErrorType, setFormErrorType] = useState('error');
  const [successMessage, setSuccessMessage] = useState('');

  const [metrics, setMetrics] = useState(null);

  const [filters, setFilters] = useState({
    status: '',
    date: '',
    search: '',
  });

  // ============================================================
  // REFS
  // ============================================================

  const mountedRef = useRef(true);
  const saveLockRef = useRef(false);
  const createMenuRef = useRef(null);

  // ============================================================
  // MOUNT / UNMOUNT
  // ============================================================

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ============================================================
  // CLOSE CREATE MENU
  // ============================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        createMenuRef.current &&
        !createMenuRef.current.contains(event.target)
      ) {
        setShowCreateMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // ============================================================
  // HELPERS
  // ============================================================

  const extractMessage = useCallback((error, fallback) => {
    const responseData = error?.response?.data;

    if (typeof responseData === 'string' && responseData.trim()) {
      return responseData;
    }

    return (
      responseData?.message ||
      responseData?.error ||
      responseData?.detail ||
      error?.message ||
      fallback
    );
  }, []);

  const getErrorStatus = useCallback((error) => {
    return error?.response?.status || error?.status || null;
  }, []);

  const getConflict = useCallback((error) => {
    return (
      error?.response?.data?.conflict ||
      error?.response?.data?.data?.conflict ||
      null
    );
  }, []);

  const clearFeedback = useCallback(() => {
    setError('');
    setFormError('');
    setFormErrorType('error');
    setSuccessMessage('');
  }, []);

  const clearFormError = useCallback(() => {
    setFormError('');
    setFormErrorType('error');
  }, []);

  // ============================================================
  // EVENT TYPE HELPERS
  // ============================================================

  const COMMERCIAL_TYPES = useMemo(
    () => [
      'visit',
      'meeting',
      'call',
      'online_meeting',
      'proposal',
      'negotiation',
    ],
    [],
  );

  const PERSONAL_TYPES = useMemo(() => ['internal', 'other'], []);

  const isCommercialEvent = useCallback(
    (event) => {
      return COMMERCIAL_TYPES.includes(event?.type);
    },
    [COMMERCIAL_TYPES],
  );

  const isPersonalEvent = useCallback(
    (event) => {
      return PERSONAL_TYPES.includes(event?.type);
    },
    [PERSONAL_TYPES],
  );

  // ============================================================
  // FILTER EVENTS BY AGENDA MODE
  // ============================================================

  const visibleVisits = useMemo(() => {
    if (agendaMode === 'commercial') {
      return visits.filter(isCommercialEvent);
    }

    if (agendaMode === 'personal') {
      return visits.filter(isPersonalEvent);
    }

    return visits;
  }, [visits, agendaMode, isCommercialEvent, isPersonalEvent]);

  // ============================================================
  // LOAD CALENDAR
  // ============================================================

  const loadCalendar = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        if (!silent) {
          setError('');
        }

        const response = await getCalendarEvents(filters);

        console.log('📅 CALENDAR RESPONSE:', response);

        const events =
          response?.data ||
          response?.events ||
          response?.results ||
          response?.items ||
          [];

        if (!mountedRef.current) return;

        setVisits(Array.isArray(events) ? events : []);
      } catch (error) {
        console.error(
          '❌ ERRO AO CARREGAR AGENDA:',
          error?.response?.data || error?.message || error,
        );

        if (!mountedRef.current) return;

        const status = getErrorStatus(error);

        const message = extractMessage(
          error,
          'Não foi possível carregar os compromissos.',
        );

        if (status === 401) {
          setError('Sua sessão expirou. Faça login novamente.');
        } else if (status === 403) {
          setError('Você não possui permissão para visualizar esta agenda.');
        } else {
          setError(message);
        }

        if (!silent) {
          setVisits([]);
        }
      } finally {
        if (!mountedRef.current) return;

        setLoading(false);
        setRefreshing(false);
      }
    },
    [filters, extractMessage, getErrorStatus],
  );

  // ============================================================
  // LOAD METRICS
  // ============================================================

  const loadMetrics = useCallback(async () => {
    try {
      const response = await getCalendarMetrics(filters);

      console.log('📊 CALENDAR METRICS:', response);

      const data = response?.data || response?.metrics || response || null;

      if (!mountedRef.current) return;

      if (data && typeof data === 'object') {
        setMetrics(data);
      }
    } catch (error) {
      console.warn(
        '⚠️ Não foi possível carregar métricas:',
        error?.response?.data || error?.message || error,
      );
    }
  }, [filters]);

  // ============================================================
  // LOAD FORM DATA
  // ============================================================

  const loadFormData = useCallback(async () => {
    try {
      const [leadsResponse, propertiesResponse] = await Promise.all([
        getLeads(),
        getProperties(),
      ]);

      console.log('👤 LEADS:', leadsResponse);
      console.log('🏠 PROPERTIES:', propertiesResponse);

      const leadsList =
        leadsResponse?.data ||
        leadsResponse?.leads ||
        leadsResponse?.results ||
        leadsResponse?.items ||
        leadsResponse ||
        [];

      const propertiesList =
        propertiesResponse?.data ||
        propertiesResponse?.properties ||
        propertiesResponse?.results ||
        propertiesResponse?.items ||
        propertiesResponse ||
        [];

      if (!mountedRef.current) return;

      setLeads(Array.isArray(leadsList) ? leadsList : []);
      setProperties(Array.isArray(propertiesList) ? propertiesList : []);
    } catch (error) {
      console.error(
        '❌ ERRO AO CARREGAR DADOS DO FORMULÁRIO:',
        error?.response?.data || error?.message || error,
      );
    }
  }, []);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadFormData();
  }, [loadFormData]);

  // ============================================================
  // LOAD CALENDAR WHEN FILTERS CHANGE
  // ============================================================

  useEffect(() => {
    loadCalendar();
    loadMetrics();
  }, [loadCalendar, loadMetrics]);

  // ============================================================
  // AUTO CLEAR SUCCESS
  // ============================================================

  useEffect(() => {
    if (!successMessage) return undefined;

    const timer = setTimeout(() => {
      if (mountedRef.current) {
        setSuccessMessage('');
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [successMessage]);

  // ============================================================
  // CREATE
  // ============================================================

  const handleCreate = useCallback(
    (mode = 'commercial') => {
      if (saving || saveLockRef.current) return;

      clearFeedback();

      setShowCreateMenu(false);
      setSelectedVisit(null);

      /**
       * O modo escolhido fica disponível para o VisitModal
       * através do objeto de configuração.
       *
       * Não enviamos tipo diretamente para a API aqui.
       * O modal continua sendo responsável por montar o payload.
       */
      setSelectedVisit({
        __new: true,
        __agendaMode: mode,
      });

      setShowModal(true);
    },
    [clearFeedback, saving],
  );

  // ============================================================
  // EDIT
  // ============================================================

  const handleEdit = useCallback(
    (visit) => {
      if (!visit || saving || saveLockRef.current) return;

      clearFeedback();

      setSelectedVisit(visit);
      setShowModal(true);
    },
    [clearFeedback, saving],
  );

  // ============================================================
  // CLOSE MODAL
  // ============================================================

  const handleCloseModal = useCallback(() => {
    if (saving || saveLockRef.current) return;

    setSelectedVisit(null);
    setFormError('');
    setFormErrorType('error');
    setShowModal(false);
  }, [saving]);

  // ============================================================
  // SAVE
  // ============================================================

  const handleSuccess = useCallback(
    async (data) => {
      if (saving || saveLockRef.current) {
        console.warn('⚠️ Salvamento ignorado: operação já em andamento.');

        return null;
      }

      saveLockRef.current = true;

      try {
        setSaving(true);
        setFormError('');
        setFormErrorType('error');
        setError('');
        setSuccessMessage('');

        /**
         * __new é usado somente internamente para diferenciar
         * o estado inicial do modal.
         */
        const isEditing = Boolean(selectedVisit?._id && !selectedVisit?.__new);

        console.log('🧩 CALENDAR SAVE DEBUG:', {
          selectedVisit,
          selectedVisitId: selectedVisit?._id,
          isEditing,
          data,
        });

        let response;

        // ======================================================
        // EDIT
        // ======================================================

        if (isEditing) {
          response = await updateCalendarEvent(selectedVisit._id, data);

          console.log('✅ COMPROMISSO ATUALIZADO:', response);

          if (mountedRef.current) {
            setSuccessMessage('Compromisso atualizado com sucesso.');
          }
        }

        // ======================================================
        // CREATE
        // ======================================================
        else {
          response = await createCalendarEvent(data);

          console.log('✅ COMPROMISSO CRIADO:', response);

          if (mountedRef.current) {
            setSuccessMessage('Compromisso agendado com sucesso.');
          }
        }

        // ======================================================
        // CLOSE MODAL
        // ======================================================

        if (mountedRef.current) {
          setSelectedVisit(null);
          setShowModal(false);
          setFormError('');
          setFormErrorType('error');
        }

        // ======================================================
        // REFRESH
        // ======================================================

        await Promise.all([loadCalendar({ silent: true }), loadMetrics()]);

        return response;
      } catch (error) {
        console.error(
          '❌ ERRO AO SALVAR COMPROMISSO:',
          error?.response?.data || error?.message || error,
        );

        if (!mountedRef.current) {
          return null;
        }

        const status = getErrorStatus(error);

        const message = extractMessage(
          error,
          'Não foi possível salvar o compromisso.',
        );

        const conflict = getConflict(error);

        // ======================================================
        // 409
        // ======================================================

        if (status === 409) {
          let conflictMessage =
            message || 'Já existe um compromisso neste horário.';

          if (conflict?.title) {
            conflictMessage = `Já existe o compromisso "${conflict.title}" neste horário.`;
          }

          setFormError(conflictMessage);
          setFormErrorType('conflict');

          return null;
        }

        // ======================================================
        // 400
        // ======================================================

        if (status === 400) {
          setFormError(
            message || 'Verifique os dados informados antes de continuar.',
          );

          setFormErrorType('validation');

          return null;
        }

        // ======================================================
        // 401
        // ======================================================

        if (status === 401) {
          setFormError('Sua sessão expirou. Faça login novamente.');

          setFormErrorType('auth');

          return null;
        }

        // ======================================================
        // 403
        // ======================================================

        if (status === 403) {
          setFormError('Você não possui permissão para realizar esta ação.');

          setFormErrorType('permission');

          return null;
        }

        // ======================================================
        // 404
        // ======================================================

        if (status === 404) {
          setFormError(
            'O compromisso não foi encontrado. A agenda pode ter sido atualizada por outro usuário.',
          );

          setFormErrorType('notFound');

          return null;
        }

        // ======================================================
        // 422
        // ======================================================

        if (status === 422) {
          setFormError(
            message || 'Os dados enviados não puderam ser processados.',
          );

          setFormErrorType('validation');

          return null;
        }

        // ======================================================
        // 429
        // ======================================================

        if (status === 429) {
          setFormError(
            'Muitas tentativas em pouco tempo. Aguarde alguns segundos e tente novamente.',
          );

          setFormErrorType('rateLimit');

          return null;
        }

        // ======================================================
        // 500+
        // ======================================================

        if (status >= 500) {
          setFormError(
            'O servidor encontrou um problema ao salvar o compromisso. Tente novamente em alguns instantes.',
          );

          setFormErrorType('server');

          return null;
        }

        // ======================================================
        // NETWORK
        // ======================================================

        if (!error?.response) {
          setFormError(
            'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
          );

          setFormErrorType('network');

          return null;
        }

        // ======================================================
        // GENERIC
        // ======================================================

        setFormError(message);
        setFormErrorType('error');

        return null;
      } finally {
        saveLockRef.current = false;

        if (mountedRef.current) {
          setSaving(false);
        }
      }
    },
    [
      saving,
      selectedVisit,
      loadCalendar,
      loadMetrics,
      extractMessage,
      getErrorStatus,
      getConflict,
    ],
  );

  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = useCallback(async () => {
    if (loading || refreshing || saving) return;

    clearFeedback();

    await Promise.all([loadCalendar({ silent: true }), loadMetrics()]);
  }, [loading, refreshing, saving, clearFeedback, loadCalendar, loadMetrics]);

  // ============================================================
  // CALCULATED METRICS
  // ============================================================

  const calculatedMetrics = useMemo(() => {
    const total = visits.length;

    const confirmed = visits.filter(
      (event) => event.status === 'confirmada' || event.status === 'confirmed',
    ).length;

    const pending = visits.filter(
      (event) =>
        event.status === 'agendada' ||
        event.status === 'scheduled' ||
        event.status === 'pendente' ||
        event.status === 'pending',
    ).length;

    const completed = visits.filter(
      (event) => event.status === 'realizada' || event.status === 'completed',
    ).length;

    const cancelled = visits.filter(
      (event) => event.status === 'cancelada' || event.status === 'cancelled',
    ).length;

    const commercial = visits.filter(isCommercialEvent).length;

    const personal = visits.filter(isPersonalEvent).length;

    return {
      total,
      pending,
      confirmed,
      completed,
      cancelled,
      commercial,
      personal,
    };
  }, [visits, isCommercialEvent, isPersonalEvent]);

  // ============================================================
  // FINAL METRICS
  // ============================================================

  const totalEvents =
    metrics?.total ?? metrics?.totalEvents ?? calculatedMetrics.total;

  const pendingEvents =
    metrics?.pending ??
    metrics?.pendingEvents ??
    metrics?.scheduled ??
    calculatedMetrics.pending;

  const confirmedEvents =
    metrics?.confirmed ??
    metrics?.confirmedEvents ??
    calculatedMetrics.confirmed;

  const completedEvents =
    metrics?.completed ??
    metrics?.completedEvents ??
    metrics?.realized ??
    calculatedMetrics.completed;

  const cancelledEvents =
    metrics?.cancelled ??
    metrics?.cancelledEvents ??
    metrics?.canceled ??
    calculatedMetrics.cancelled;

  // ============================================================
  // AGENDA SUMMARY
  // ============================================================

  const agendaSummary = useMemo(() => {
    if (agendaMode === 'commercial') {
      return {
        label: 'Agenda comercial',
        description: 'Leads, visitas, reuniões e oportunidades',
        icon: FaBriefcase,
        color: 'text-blue-400',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/20',
      };
    }

    if (agendaMode === 'personal') {
      return {
        label: 'Agenda pessoal',
        description: 'Compromissos internos e pessoais',
        icon: FaUser,
        color: 'text-violet-400',
        bg: 'bg-violet-500/10',
        border: 'border-violet-500/20',
      };
    }

    return {
      label: 'Agenda completa',
      description: 'Todos os seus compromissos em um só lugar',
      icon: FaLayerGroup,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
    };
  }, [agendaMode]);

  const AgendaIcon = agendaSummary.icon;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div
      className="
        min-h-screen
        bg-gray-950
        p-4
        text-white
        sm:p-6
        lg:p-8
      "
    >
      <div className="mx-auto max-w-[1600px] space-y-7">
        {/* ======================================================
            HEADER
        ====================================================== */}

        <div
          className="
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          <div>
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-13
                  w-13
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-blue-500/20
                  bg-blue-500/10
                  text-blue-400
                  shadow-lg
                  shadow-blue-500/5
                "
              >
                <FaCalendarAlt size={21} />
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h1
                    className="
                      text-2xl
                      font-bold
                      tracking-tight
                      text-white
                      sm:text-3xl
                    "
                  >
                    Minha Agenda
                  </h1>

                  {!loading && (
                    <span
                      className="
                        hidden
                        rounded-full
                        border
                        border-gray-800
                        bg-gray-900
                        px-2.5
                        py-1
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wider
                        text-gray-500
                        sm:inline-flex
                      "
                    >
                      {totalEvents}{' '}
                      {totalEvents === 1 ? 'compromisso' : 'compromissos'}
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-gray-400">
                  Organize sua rotina comercial e seus compromissos pessoais.
                </p>
              </div>
            </div>
          </div>

          {/* ACTIONS */}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading || refreshing || saving}
              title="Atualizar agenda"
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                border
                border-gray-800
                bg-gray-900
                text-gray-400
                shadow-sm
                transition
                hover:border-gray-700
                hover:bg-gray-800
                hover:text-white
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <FaSyncAlt
                className={loading || refreshing ? 'animate-spin' : ''}
              />
            </button>

            {/* CREATE MENU */}

            <div ref={createMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setShowCreateMenu((value) => !value)}
                disabled={saving}
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-blue-600
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  shadow-lg
                  shadow-blue-600/20
                  transition
                  hover:bg-blue-500
                  hover:shadow-blue-600/30
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <FaPlus />
                Novo compromisso
                <FaChevronDown
                  size={10}
                  className={`
                    transition-transform
                    ${showCreateMenu ? 'rotate-180' : ''}
                  `}
                />
              </button>

              {showCreateMenu && (
                <div
                  className="
                    absolute
                    right-0
                    top-[calc(100%+8px)]
                    z-50
                    w-72
                    overflow-hidden
                    rounded-2xl
                    border
                    border-gray-800
                    bg-gray-900
                    p-2
                    shadow-2xl
                    shadow-black/40
                  "
                >
                  <button
                    type="button"
                    onClick={() => handleCreate('commercial')}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      p-3
                      text-left
                      transition
                      hover:bg-gray-800
                    "
                  >
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-blue-500/10
                        text-blue-400
                      "
                    >
                      <FaBriefcase size={14} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">
                        Compromisso comercial
                      </p>

                      <p className="mt-0.5 text-xs text-gray-500">
                        Visita, lead, reunião ou negociação
                      </p>
                    </div>

                    <FaArrowRight size={10} className="ml-auto text-gray-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCreate('personal')}
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-xl
                      p-3
                      text-left
                      transition
                      hover:bg-gray-800
                    "
                  >
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-violet-500/10
                        text-violet-400
                      "
                    >
                      <FaUser size={14} />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">
                        Compromisso pessoal
                      </p>

                      <p className="mt-0.5 text-xs text-gray-500">
                        Interno, pessoal ou administrativo
                      </p>
                    </div>

                    <FaArrowRight size={10} className="ml-auto text-gray-600" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ======================================================
            AGENDA TYPE SELECTOR
        ====================================================== */}

        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-gray-800
            bg-gray-900
            shadow-lg
            shadow-black/10
          "
        >
          <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  ${agendaSummary.bg}
                  ${agendaSummary.color}
                `}
              >
                <AgendaIcon size={15} />
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  {agendaSummary.label}
                </p>

                <p className="mt-0.5 text-xs text-gray-500">
                  {agendaSummary.description}
                </p>
              </div>
            </div>

            <div
              className="
                flex
                w-full
                flex-wrap
                items-center
                gap-1
                rounded-xl
                border
                border-gray-800
                bg-gray-950
                p-1
                lg:w-auto
              "
            >
              <AgendaModeButton
                active={agendaMode === 'all'}
                onClick={() => setAgendaMode('all')}
                icon={<FaLayerGroup />}
                label="Todos"
                count={visits.length}
              />

              <AgendaModeButton
                active={agendaMode === 'commercial'}
                onClick={() => setAgendaMode('commercial')}
                icon={<FaBriefcase />}
                label="Comercial"
                count={calculatedMetrics.commercial}
              />

              <AgendaModeButton
                active={agendaMode === 'personal'}
                onClick={() => setAgendaMode('personal')}
                icon={<FaUser />}
                label="Pessoal"
                count={calculatedMetrics.personal}
              />
            </div>
          </div>
        </div>

        {/* ======================================================
            FEEDBACK
        ====================================================== */}

        {successMessage && !showModal && (
          <FeedbackBanner
            type="success"
            message={successMessage}
            onClose={() => setSuccessMessage('')}
          />
        )}

        {error && !showModal && (
          <FeedbackBanner
            type="error"
            title="Não foi possível carregar a agenda"
            message={error}
            action={
              <button
                type="button"
                onClick={handleRefresh}
                className="
                  shrink-0
                  rounded-lg
                  bg-red-500/10
                  px-3
                  py-1.5
                  text-xs
                  font-medium
                  text-red-300
                  transition
                  hover:bg-red-500/20
                "
              >
                Tentar novamente
              </button>
            }
          />
        )}

        {/* ======================================================
            METRICS
        ====================================================== */}

        <div
          className="
            grid
            grid-cols-2
            gap-3
            lg:grid-cols-5
          "
        >
          <MetricCard
            label="Total"
            value={totalEvents}
            icon={<FaCalendarAlt />}
            iconClass="text-blue-400"
            iconBg="bg-blue-500/10"
          />

          <MetricCard
            label="Pendentes"
            value={pendingEvents}
            icon={<FaClock />}
            iconClass="text-yellow-400"
            iconBg="bg-yellow-500/10"
          />

          <MetricCard
            label="Confirmadas"
            value={confirmedEvents}
            icon={<FaCheckCircle />}
            iconClass="text-green-400"
            iconBg="bg-green-500/10"
          />

          <MetricCard
            label="Realizadas"
            value={completedEvents}
            icon={<FaCheckCircle />}
            iconClass="text-purple-400"
            iconBg="bg-purple-500/10"
          />

          <MetricCard
            label="Canceladas"
            value={cancelledEvents}
            icon={<FaTimesCircle />}
            iconClass="text-red-400"
            iconBg="bg-red-500/10"
          />
        </div>

        {/* ======================================================
            FILTERS
        ====================================================== */}

        <VisitFilters filters={filters} setFilters={setFilters} />

        {/* ======================================================
            MAIN CARD
        ====================================================== */}

        <div
          className="
            overflow-hidden
            rounded-[24px]
            border
            border-gray-800
            bg-gray-900
            shadow-2xl
            shadow-black/20
          "
        >
          {/* TOOLBAR */}

          <div
            className="
              flex
              flex-col
              gap-4
              border-b
              border-gray-800
              bg-gray-900/80
              p-4
              sm:p-5
              lg:flex-row
              lg:items-center
              lg:justify-between
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-gray-950
                  text-gray-400
                "
              >
                <FaFilter size={13} />
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  Visualização da agenda
                </p>

                <p className="text-xs text-gray-500">
                  {visibleVisits.length}{' '}
                  {visibleVisits.length === 1
                    ? 'compromisso encontrado'
                    : 'compromissos encontrados'}
                </p>
              </div>
            </div>

            {/* VIEW MODE */}

            <div
              className="
                flex
                w-full
                items-center
                gap-1
                rounded-xl
                border
                border-gray-800
                bg-gray-950
                p-1
                sm:w-fit
              "
            >
              <ViewButton
                active={viewMode === 'calendar'}
                onClick={() => setViewMode('calendar')}
                icon={<FaCalendarAlt />}
                label="Calendário"
              />

              <ViewButton
                active={viewMode === 'list'}
                onClick={() => setViewMode('list')}
                icon={<FaList />}
                label="Lista"
              />
            </div>
          </div>

          {/* ====================================================
              CONTENT
          ==================================================== */}

          <div className="p-3 sm:p-5 lg:p-6">
            {loading ? (
              <CalendarLoading />
            ) : viewMode === 'calendar' ? (
              <div
                className="
                  overflow-hidden
                  rounded-2xl
                  border
                  border-gray-800
                  bg-gray-950/40
                "
              >
                <div
                  className="
                    border-b
                    border-gray-800
                    bg-gray-900/60
                    px-4
                    py-3
                  "
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-blue-400" size={13} />

                      <span className="text-sm font-semibold text-gray-200">
                        Calendário
                      </span>
                    </div>

                    <span className="text-xs text-gray-500">
                      Clique em um compromisso para editar
                    </span>
                  </div>
                </div>

                <div className="p-2 sm:p-4">
                  <VisitCalendar
                    visits={visibleVisits}
                    onSelectDate={handleEdit}
                  />
                </div>
              </div>
            ) : (
              <VisitList
                visits={visibleVisits}
                onEdit={handleEdit}
                onRefresh={loadCalendar}
              />
            )}
          </div>
        </div>

        {/* ======================================================
            MODAL
        ====================================================== */}

        <VisitModal
          open={showModal}
          visit={selectedVisit}
          leads={leads}
          properties={properties}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
          loading={saving}
        />

        {/* ======================================================
            FORM ERROR
        ====================================================== */}

        {showModal && formError && (
          <FormErrorBanner
            type={formErrorType}
            message={formError}
            onClose={clearFormError}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================
// AGENDA MODE BUTTON
// ============================================================

function AgendaModeButton({ active, onClick, icon, label, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        flex-1
        items-center
        justify-center
        gap-2
        rounded-lg
        px-3
        py-2
        text-xs
        font-semibold
        transition
        sm:flex-none
        sm:px-4
        ${
          active
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
            : 'text-gray-500 hover:bg-gray-800 hover:text-gray-200'
        }
      `}
    >
      <span className="text-[11px]">{icon}</span>

      {label}

      <span
        className={`
          rounded-full
          px-1.5
          py-0.5
          text-[9px]
          ${active ? 'bg-white/10 text-white' : 'bg-gray-800 text-gray-500'}
        `}
      >
        {count}
      </span>
    </button>
  );
}

// ============================================================
// VIEW BUTTON
// ============================================================

function ViewButton({ active, onClick, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        flex-1
        items-center
        justify-center
        gap-2
        rounded-lg
        px-4
        py-2
        text-sm
        font-medium
        transition
        sm:flex-none
        ${
          active
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10'
            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        }
      `}
    >
      <span className="text-[12px]">{icon}</span>

      {label}
    </button>
  );
}

// ============================================================
// FORM ERROR BANNER
// ============================================================

function FormErrorBanner({ type = 'error', message, onClose }) {
  const configs = {
    conflict: {
      icon: FaExclamationTriangle,
      title: 'Conflito de agenda',
      description: 'Já existe outro compromisso ocupando este horário.',
      wrapper: 'border-amber-500/30 bg-amber-500/[0.06]',
      iconWrapper: 'bg-amber-500/10 text-amber-400',
      titleClass: 'text-amber-100',
      messageClass: 'text-gray-300',
    },

    validation: {
      icon: FaInfoCircle,
      title: 'Verifique os dados',
      description: 'Algumas informações precisam ser corrigidas.',
      wrapper: 'border-blue-500/30 bg-blue-500/[0.06]',
      iconWrapper: 'bg-blue-500/10 text-blue-400',
      titleClass: 'text-blue-100',
      messageClass: 'text-gray-300',
    },

    auth: {
      icon: FaUserLock,
      title: 'Sessão expirada',
      description: 'Faça login novamente para continuar.',
      wrapper: 'border-orange-500/30 bg-orange-500/[0.06]',
      iconWrapper: 'bg-orange-500/10 text-orange-400',
      titleClass: 'text-orange-100',
      messageClass: 'text-gray-300',
    },

    permission: {
      icon: FaShieldAlt,
      title: 'Acesso negado',
      description: 'Seu usuário não possui permissão para esta ação.',
      wrapper: 'border-red-500/30 bg-red-500/[0.06]',
      iconWrapper: 'bg-red-500/10 text-red-400',
      titleClass: 'text-red-100',
      messageClass: 'text-gray-300',
    },

    notFound: {
      icon: FaBan,
      title: 'Compromisso não encontrado',
      description: 'A agenda pode ter sido alterada por outro usuário.',
      wrapper: 'border-purple-500/30 bg-purple-500/[0.06]',
      iconWrapper: 'bg-purple-500/10 text-purple-400',
      titleClass: 'text-purple-100',
      messageClass: 'text-gray-300',
    },

    network: {
      icon: FaSyncAlt,
      title: 'Falha de conexão',
      description: 'Não foi possível conectar ao servidor.',
      wrapper: 'border-red-500/30 bg-red-500/[0.06]',
      iconWrapper: 'bg-red-500/10 text-red-400',
      titleClass: 'text-red-100',
      messageClass: 'text-gray-300',
    },

    server: {
      icon: FaTimesCircle,
      title: 'Erro no servidor',
      description: 'O servidor não conseguiu concluir a operação.',
      wrapper: 'border-red-500/30 bg-red-500/[0.06]',
      iconWrapper: 'bg-red-500/10 text-red-400',
      titleClass: 'text-red-100',
      messageClass: 'text-gray-300',
    },

    rateLimit: {
      icon: FaClock,
      title: 'Muitas tentativas',
      description: 'Aguarde alguns segundos antes de tentar novamente.',
      wrapper: 'border-yellow-500/30 bg-yellow-500/[0.06]',
      iconWrapper: 'bg-yellow-500/10 text-yellow-400',
      titleClass: 'text-yellow-100',
      messageClass: 'text-gray-300',
    },

    error: {
      icon: FaTimesCircle,
      title: 'Não foi possível salvar',
      description: 'Ocorreu um problema ao salvar o compromisso.',
      wrapper: 'border-red-500/30 bg-red-500/[0.06]',
      iconWrapper: 'bg-red-500/10 text-red-400',
      titleClass: 'text-red-100',
      messageClass: 'text-gray-300',
    },
  };

  const config = configs[type] || configs.error;

  const Icon = config.icon;

  return (
    <div
      className="
        pointer-events-none
        fixed
        inset-x-0
        bottom-5
        z-[70]
        flex
        justify-center
        px-4
      "
    >
      <div
        className={`
          pointer-events-auto
          flex
          w-full
          max-w-2xl
          items-start
          gap-3
          rounded-2xl
          border
          p-4
          shadow-2xl
          shadow-black/50
          backdrop-blur-xl
          ${config.wrapper}
        `}
      >
        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${config.iconWrapper}
          `}
        >
          <Icon />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`
              text-sm
              font-semibold
              ${config.titleClass}
            `}
          >
            {config.title}
          </p>

          <p className="mt-1 text-xs leading-5 text-gray-500">
            {config.description}
          </p>

          <div
            className={`
              mt-2
              rounded-lg
              bg-black/10
              px-3
              py-2
              text-sm
              leading-5
              ${config.messageClass}
            `}
          >
            {message}
          </div>

          {type === 'conflict' && (
            <p
              className="
                mt-2
                text-xs
                font-medium
                text-amber-400/80
              "
            >
              Altere o horário do compromisso e tente novamente.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            text-gray-500
            transition
            hover:bg-gray-800
            hover:text-white
          "
          aria-label="Fechar mensagem"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// ============================================================
// FEEDBACK BANNER
// ============================================================

function FeedbackBanner({ type = 'info', title, message, action, onClose }) {
  const config = {
    success: {
      wrapper: 'border-green-500/20 bg-green-500/5 text-green-300',
      icon: 'bg-green-500/10 text-green-400',
      Icon: FaCheck,
      defaultTitle: 'Tudo certo',
    },

    error: {
      wrapper: 'border-red-500/20 bg-red-500/5 text-red-300',
      icon: 'bg-red-500/10 text-red-400',
      Icon: FaTimesCircle,
      defaultTitle: 'Ocorreu um erro',
    },

    info: {
      wrapper: 'border-blue-500/20 bg-blue-500/5 text-blue-300',
      icon: 'bg-blue-500/10 text-blue-400',
      Icon: FaInfoCircle,
      defaultTitle: 'Informação',
    },
  };

  const current = config[type] || config.info;

  const Icon = current.Icon;

  return (
    <div
      className={`
        flex
        items-start
        gap-3
        rounded-2xl
        border
        p-4
        text-sm
        ${current.wrapper}
      `}
    >
      <div
        className={`
          flex
          h-9
          w-9
          shrink-0
          items-center
          justify-center
          rounded-xl
          ${current.icon}
        `}
      >
        <Icon />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-white">
          {title || current.defaultTitle}
        </p>

        {message && <p className="mt-1 leading-5 text-gray-400">{message}</p>}
      </div>

      {action}

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            text-gray-500
            transition
            hover:bg-gray-800
            hover:text-white
          "
          aria-label="Fechar"
        >
          ×
        </button>
      )}
    </div>
  );
}

// ============================================================
// METRIC CARD
// ============================================================

function MetricCard({
  label,
  value,
  icon,
  iconClass = 'text-blue-400',
  iconBg = 'bg-blue-500/10',
}) {
  return (
    <div
      className="
        group
        rounded-2xl
        border
        border-gray-800
        bg-gray-900
        p-4
        shadow-lg
        shadow-black/5
        transition
        hover:-translate-y-0.5
        hover:border-gray-700
        hover:shadow-xl
        hover:shadow-black/10
        sm:p-5
      "
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-gray-500 sm:text-sm">{label}</span>

        <div
          className={`
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-xl
            ${iconBg}
            ${iconClass}
            transition
            group-hover:scale-105
            sm:h-10
            sm:w-10
          `}
        >
          {icon}
        </div>
      </div>

      <div className="mt-3 sm:mt-4">
        <span
          className="
            text-2xl
            font-bold
            tracking-tight
            text-white
            sm:text-3xl
          "
        >
          {value}
        </span>
      </div>
    </div>
  );
}

// ============================================================
// LOADING
// ============================================================

function CalendarLoading() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="
              h-24
              animate-pulse
              rounded-xl
              bg-gray-800
            "
          />
        ))}
      </div>

      <div
        className="
          flex
          min-h-[420px]
          items-center
          justify-center
          rounded-2xl
          border
          border-gray-800
          bg-gray-950/40
        "
      >
        <div className="text-center">
          <FaCalendarAlt
            className="
              mx-auto
              mb-4
              animate-pulse
              text-3xl
              text-blue-500/50
            "
          />

          <p className="text-sm text-gray-400">Carregando agenda...</p>

          <p className="mt-1 text-xs text-gray-600">
            Buscando seus compromissos
          </p>
        </div>
      </div>
    </div>
  );
}

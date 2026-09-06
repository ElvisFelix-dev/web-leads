import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ArrowLeft,
  Save,
  Home,
  Image as ImageIcon,
  Building2,
  DollarSign,
  BedDouble,
  MapPin,
  CheckCircle,
  UserRound,
  Phone,
  Mail,
  Percent,
  Ruler,
  Car,
  Bath,
  Layers,
  Calendar,
  Key,
  FileText,
  Building,
  Tag,
  Star,
  Eye,
  Heart,
  Users,
  ClipboardList,
  Video,
  File,
  Award,
  Shield,
  Clock,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

import { formatCurrency, currencyToNumber } from '../utils/currency';
import { formatArea, areaToNumber } from '../utils/area';

import useProperties from '../hooks/useProperties';
import api from '../service/api';
import PropertyImageUpload from '../components/property/PropertyImageUpload';

const PROPERTY_TYPES = [
  'casa',
  'apartamento',
  'kitnet',
  'studio',
  'sobrado',
  'loft',
  'terreno',
  'chacara',
  'sitio',
  'comercial',
  'galpao',
];

const PROPERTY_CATEGORIES = [
  'casa',
  'apartamento',
  'terreno',
  'comercial',
  'chacara',
  'condominio',
];

const PROPERTY_PURPOSES = ['venda', 'aluguel', 'venda_aluguel'];

const PROPERTY_CONSTRUCTION_STATUS = [
  'planta',
  'construcao',
  'pronto',
  'usado',
  'reformado',
];

const PROPERTY_REGIONS = [
  'central',
  'zona norte',
  'zona sul',
  'zona leste',
  'zona oeste',
  'abc',
];

const AVAILABLE_FEATURES = [
  'Piscina',
  'Churrasqueira',
  'Academia',
  'Playground',
  'Salão de Festas',
  'Elevador',
  'Portaria 24h',
  'Sacada',
  'Varanda Gourmet',
  'Closet',
  'Suíte',
  'Ar Condicionado',
  'Mobiliado',
  'Aceita Pets',
];

/*
==========================================================
ESTILOS
==========================================================
*/

const inputClass = `
  w-full
  rounded-xl
  border
  border-gray-700
  bg-gray-800/70
  px-4
  py-3.5
  text-sm
  text-gray-100
  placeholder:text-gray-500
  transition-all
  duration-200
  outline-none
  hover:border-gray-500
  focus:border-blue-500
  focus:ring-4
  focus:ring-blue-500/10
`;

const selectClass = inputClass;

const labelClass = `
  mb-2
  block
  text-sm
  font-medium
  text-gray-300
`;

const cardClass = `
  group
  rounded-2xl
  border
  border-gray-800
  bg-gray-900
  p-8
  shadow-xl
  transition-all
  duration-300
  hover:border-gray-700
  hover:shadow-2xl
`;

const sectionTitle = `
  mb-8
  flex
  items-center
  gap-4
  text-lg
  font-semibold
  text-white
`;

const checkboxClass = `
  h-5
  w-5
  rounded
  border-gray-600
  bg-gray-700
  text-blue-600
  focus:ring-2
  focus:ring-blue-500
  focus:ring-offset-2
  focus:ring-offset-gray-900
`;

/*
==========================================================
ESTADO INICIAL
==========================================================
*/

const initialState = {
  name: '',
  description: '',
  shortDescription: '',
  code: '',

  type: 'casa',
  category: 'casa',
  purpose: 'venda',

  constructionStatus: 'pronto',
  condition: 'usado',

  images: [],
  coverImage: '',
  video: '',
  videos: [],
  documents: [],
  floorPlan: '',
  virtualTour: '',

  prices: {
    salePrice: '',
    rentPrice: '',
    condominium: '',
    iptu: '',
    otherFees: '',
  },

  area: {
    total: '',
    built: '',
    landArea: '',
    frontage: '',
    background: '',
  },

  bedrooms: 0,
  suites: 0,
  bathrooms: 0,
  parkingSpaces: 0,
  floor: 0,
  totalFloors: 0,

  furnished: false,
  acceptsPets: false,
  acceptsFinancing: true,
  acceptsFGTS: false,

  location: {
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    district: '',
    city: '',
    state: '',
    country: 'Brasil',
    region: '',
  },

  features: [],
  highlights: [],
  tags: [],

  registrationNumber: '',
  deedNumber: '',

  captation: {
    broker: '',
    percentage: 0,
  },

  owner: {
    name: '',
    phone: '',
    email: '',
    document: '',
  },

  priority: 0,
  color: '',
  notes: '',
  internalNotes: '',
};

export default function PropertyCreate() {
  const navigate = useNavigate();

  const { create, loading, error } = useProperties(false);

  const [form, setForm] = useState(initialState);
  const [validationErrors, setValidationErrors] = useState({});
  const [backendErrors, setBackendErrors] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [highlightInput, setHighlightInput] = useState('');

  /*
  ==========================================================
  CORRETORES
  ==========================================================
  */

  const [brokers, setBrokers] = useState([]);
  const [brokersLoading, setBrokersLoading] = useState(false);

  /*
  ==========================================================
  USUÁRIO / ADMIN
  ==========================================================
  */

  const [isAdmin, setIsAdmin] = useState(false);

  /*
  ==========================================================
  BUSCAR USUÁRIO E CORRETORES
  ==========================================================
  */

  useEffect(() => {
    let mounted = true;

    async function loadCurrentUserAndBrokers() {
      try {
        const storedUser = localStorage.getItem('userInfo');

        if (!storedUser) {
          console.warn('userInfo não encontrado no localStorage.');
          return;
        }

        const userInfo = JSON.parse(storedUser);
        const currentUser = userInfo?.user || userInfo?.data || userInfo;

        console.log('USUÁRIO LOGADO:', currentUser);

        const admin =
          currentUser?.isAdmin === true || currentUser?.role === 'admin';

        console.log('É ADMIN?', admin);

        if (!mounted) return;
        setIsAdmin(admin);

        if (!admin) {
          console.warn('Usuário atual não é admin.');
          return;
        }

        setBrokersLoading(true);

        const response = await api.get('/api/users/brokers');

        console.log('RESPOSTA COMPLETA BROKERS:', response.data);

        const data =
          response.data?.data?.brokers ||
          response.data?.brokers ||
          response.data?.data ||
          response.data ||
          [];

        console.log('BROKERS EXTRAÍDOS:', data);

        const normalizedBrokers = Array.isArray(data)
          ? data.filter((broker) => broker && broker._id && broker.name)
          : [];

        console.log('BROKERS NORMALIZADOS:', normalizedBrokers);

        if (!mounted) return;
        setBrokers(normalizedBrokers);
      } catch (err) {
        console.error('Erro ao buscar usuário/corretores:', err);
        if (mounted) {
          setBrokers([]);
        }
      } finally {
        if (mounted) {
          setBrokersLoading(false);
        }
      }
    }

    loadCurrentUserAndBrokers();

    return () => {
      mounted = false;
    };
  }, []);

  /*
  ==========================================================
  CAMPOS SIMPLES
  ==========================================================
  */

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setForm((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    setValidationErrors((prev) => ({ ...prev, [name]: undefined }));
    setBackendErrors([]);
  }

  /*
  ==========================================================
  CAMPOS ANINHADOS
  ==========================================================
  */

  function handleNestedChange(group, field, value) {
    setForm((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [field]: value,
      },
    }));
    setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    setBackendErrors([]);
  }

  /*
  ==========================================================
  PERCENTUAL DE CAPTAÇÃO
  ==========================================================
  */

  function handlePercentageChange(value) {
    const digits = String(value)
      .replace(/[^0-9.,]/g, '')
      .replace(',', '.');

    if (digits === '') {
      handleNestedChange('captation', 'percentage', 0);
      return;
    }

    const number = Number(digits);
    if (Number.isNaN(number)) return;

    handleNestedChange(
      'captation',
      'percentage',
      Math.min(100, Math.max(0, number)),
    );
  }

  /*
  ==========================================================
  VALORES
  ==========================================================
  */

  function handleMoneyChange(field, value) {
    handleNestedChange('prices', field, formatCurrency(value));
  }

  /*
  ==========================================================
  CONTADORES
  ==========================================================
  */

  function updateNumber(field, value) {
    const number = Number(value);
    setForm((prev) => ({
      ...prev,
      [field]: Number.isNaN(number) ? 0 : number,
    }));
  }

  /*
  ==========================================================
  ÁREA
  ==========================================================
  */

  function handleArea(field, value) {
    handleNestedChange('area', field, value);
  }

  /*
  ==========================================================
  COMODIDADES
  ==========================================================
  */

  function toggleFeature(feature) {
    setForm((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((item) => item !== feature)
        : [...prev.features, feature],
    }));
  }

  /*
  ==========================================================
  TAGS E HIGHLIGHTS
  ==========================================================
  */

  function addTag() {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  }

  function removeTag(tag) {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  }

  function addHighlight() {
    if (
      highlightInput.trim() &&
      !form.highlights.includes(highlightInput.trim())
    ) {
      setForm((prev) => ({
        ...prev,
        highlights: [...prev.highlights, highlightInput.trim()],
      }));
      setHighlightInput('');
    }
  }

  function removeHighlight(highlight) {
    setForm((prev) => ({
      ...prev,
      highlights: prev.highlights.filter((h) => h !== highlight),
    }));
  }

  /*
  ==========================================================
  VALIDAÇÃO
  ==========================================================
  */

  function validateForm() {
    const errors = {};

    if (!form.name || form.name.trim() === '') {
      errors.name = 'Nome do imóvel é obrigatório';
    }

    if (!form.location.city || form.location.city.trim() === '') {
      errors.city = 'Cidade é obrigatória';
    }

    if (!form.location.state || form.location.state.trim() === '') {
      errors.state = 'Estado é obrigatório';
    }

    const salePrice = currencyToNumber(form.prices.salePrice);
    const rentPrice = currencyToNumber(form.prices.rentPrice);

    if (form.purpose === 'venda' || form.purpose === 'venda_aluguel') {
      if (salePrice === 0) {
        errors.salePrice = 'Preço de venda é obrigatório para imóveis à venda';
      }
    }

    if (form.purpose === 'aluguel' || form.purpose === 'venda_aluguel') {
      if (rentPrice === 0) {
        errors.rentPrice =
          'Preço de aluguel é obrigatório para imóveis para aluguel';
      }
    }

    const totalArea = Number(form.area.total);
    if (!totalArea || totalArea <= 0) {
      errors.areaTotal = 'Área total é obrigatória e deve ser maior que 0';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  /*
  ==========================================================
  SUBMIT
  ==========================================================
  */

  async function handleSubmit(e) {
    e.preventDefault();

    setValidationErrors({});
    setBackendErrors([]);

    if (!validateForm()) {
      const firstError = document.querySelector('[data-error]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    try {
      const salePrice = currencyToNumber(form.prices.salePrice);
      const rentPrice = currencyToNumber(form.prices.rentPrice);
      const condominiumFee = currencyToNumber(form.prices.condominium);
      const iptu = currencyToNumber(form.prices.iptu);
      const otherFees = currencyToNumber(form.prices.otherFees);

      const totalArea = Number(form.area.total) || 0;
      const builtArea = Number(form.area.built) || 0;
      const landArea = Number(form.area.landArea) || 0;
      const frontage = Number(form.area.frontage) || 0;
      const background = Number(form.area.background) || 0;

      const payload = {
        name: form.name.trim(),
        description: form.description?.trim() || '',
        shortDescription: form.shortDescription?.trim() || '',
        code: form.code?.trim() || '',

        type: form.type,
        category: form.category,
        purpose: form.purpose,
        constructionStatus: form.constructionStatus,
        condition: form.condition || 'usado',

        images: form.images || [],
        coverImage: form.coverImage || '',
        video: form.video || '',
        videos: form.videos || [],
        documents: form.documents || [],
        floorPlan: form.floorPlan || '',
        virtualTour: form.virtualTour || '',

        prices: {
          salePrice: salePrice,
          rentPrice: rentPrice,
          condominiumFee: condominiumFee,
          iptu: iptu,
          otherFees: otherFees,
        },

        dimensions: {
          totalArea: totalArea,
          builtArea: builtArea,
          landArea: landArea,
          frontage: frontage,
          background: background,
        },

        bedrooms: Number(form.bedrooms) || 0,
        suites: Number(form.suites) || 0,
        bathrooms: Number(form.bathrooms) || 0,
        parkingSpaces: Number(form.parkingSpaces) || 0,
        floor: Number(form.floor) || 0,
        totalFloors: Number(form.totalFloors) || 0,

        furnished: form.furnished || false,
        acceptsPets: form.acceptsPets || false,
        acceptsFinancing:
          form.acceptsFinancing !== undefined ? form.acceptsFinancing : true,
        acceptsFGTS: form.acceptsFGTS || false,

        location: {
          zipCode: form.location.zipCode?.trim() || '',
          street: form.location.street?.trim() || '',
          number: form.location.number?.trim() || '',
          complement: form.location.complement?.trim() || '',
          district: form.location.district?.trim() || '',
          city: form.location.city?.trim() || '',
          state: form.location.state?.trim().toUpperCase() || '',
          country: form.location.country?.trim() || 'Brasil',
          region: form.location.region || '',
        },

        features: form.features || [],
        highlights: form.highlights || [],
        tags: form.tags || [],

        registrationNumber: form.registrationNumber?.trim() || '',
        deedNumber: form.deedNumber?.trim() || '',

        captation: {
          broker: form.captation.broker || null,
          percentage: Number(form.captation.percentage) || 0,
        },

        owner: {
          name: form.owner.name?.trim() || '',
          phone: form.owner.phone?.trim() || '',
          email: form.owner.email?.trim().toLowerCase() || '',
          document: form.owner.document?.trim() || '',
        },

        priority: Number(form.priority) || 0,
        color: form.color || '',
        notes: form.notes?.trim() || '',
        internalNotes: form.internalNotes?.trim() || '',

        active: true,
        published: true,
        isDeleted: false,
        status: 'disponivel',
        isPublished: true,
        publishedAt: new Date().toISOString(),
        featured: false,
        exclusive: false,
      };

      console.log('📦 PAYLOAD ENVIADO:', JSON.stringify(payload, null, 2));

      await create(payload);
      navigate('/property-list');
    } catch (err) {
      console.error('❌ Erro ao criar imóvel:', err);

      if (err.response) {
        console.error('📡 STATUS:', err.response.status);
        console.error(
          '📡 DATA COMPLETA:',
          JSON.stringify(err.response.data, null, 2),
        );

        const errorData = err.response.data;

        if (errorData?.errors) {
          console.error('🔍 ERROS DO BACKEND (RAW):', errorData.errors);

          let errorMessages = [];

          if (Array.isArray(errorData.errors)) {
            errorData.errors.forEach((item) => {
              let msg = '';
              if (typeof item === 'string') {
                msg = item;
              } else if (item?.field && item?.message) {
                msg = `${item.field}: ${item.message}`;
              } else if (item?.message) {
                msg = item.message;
              } else if (item?.msg) {
                msg = item.msg;
              } else {
                msg = JSON.stringify(item);
              }
              errorMessages.push(msg);
            });
          } else if (typeof errorData.errors === 'object') {
            Object.entries(errorData.errors).forEach(([field, message]) => {
              errorMessages.push(`${field}: ${message}`);
            });
          }

          setBackendErrors(
            errorMessages.length > 0
              ? errorMessages
              : ['Erro de validação desconhecido'],
          );
        } else if (errorData?.message) {
          setBackendErrors([errorData.message]);
        } else {
          setBackendErrors([
            `Erro ${err.response.status}: ${err.response.statusText}`,
          ]);
        }
      } else if (err.request) {
        setBackendErrors(['Servidor não respondeu. Verifique sua conexão.']);
      } else {
        setBackendErrors([err.message || 'Erro desconhecido ao criar imóvel']);
      }
    }
  }

  /*
  ==========================================================
  COMPONENTE NUMBER INPUT
  ==========================================================
  */

  function NumberInput({ label, value, onChange, min = 0, step = 1 }) {
    return (
      <div>
        <label className={labelClass}>{label}</label>

        <div
          className="
            mt-2
            flex
            items-center
            overflow-hidden
            rounded-xl
            border
            border-zinc-700
            bg-zinc-900
          "
        >
          <button
            type="button"
            onClick={() => onChange(Math.max(min, value - step))}
            className="
              h-12
              w-12
              border-r
              border-zinc-700
              text-xl
              text-white
              hover:bg-zinc-800
            "
          >
            −
          </button>

          <input
            value={value}
            readOnly
            className="
              h-12
              flex-1
              bg-transparent
              text-center
              text-lg
              font-semibold
              text-white
              outline-none
            "
          />

          <button
            type="button"
            onClick={() => onChange(value + step)}
            className="
              h-12
              w-12
              border-l
              border-zinc-700
              text-xl
              text-white
              hover:bg-zinc-800
            "
          >
            +
          </button>
        </div>
      </div>
    );
  }

  /*
  ==========================================================
  COMPONENTE TAG INPUT
  ==========================================================
  */

  function TagInput({
    label,
    value,
    onChange,
    onAdd,
    onRemove,
    items,
    placeholder,
  }) {
    return (
      <div>
        <label className={labelClass}>{label}</label>

        <div className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={onChange}
            onKeyPress={(e) => e.key === 'Enter' && onAdd()}
            placeholder={placeholder}
            className={inputClass}
          />
          <button
            type="button"
            onClick={onAdd}
            className="rounded-xl bg-blue-600 px-4 py-2 text-white hover:bg-blue-500"
          >
            Adicionar
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600/20 px-3 py-1.5 text-sm text-blue-400"
            >
              {item}
              <button
                type="button"
                onClick={() => onRemove(item)}
                className="text-blue-300 hover:text-white"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div
        className="
          mx-auto
          max-w-7xl
          space-y-8
          p-6
          md:p-8
        "
      >
        {/* HEADER */}
        <div
          className="
            flex
            flex-col
            gap-6
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="
                rounded-2xl
                border
                border-gray-800
                bg-gray-900
                p-4
                text-gray-300
                transition-all
                hover:border-gray-700
                hover:bg-gray-800
              "
            >
              <ArrowLeft size={22} />
            </button>

            <div
              className="
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                border
                border-blue-500/20
                bg-blue-600/10
              "
            >
              <Building2 size={30} className="text-blue-400" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-white">Novo Imóvel</h1>

              <p className="mt-2 text-gray-400">
                Cadastre imóveis completos para venda ou locação, mantendo seu
                CRM organizado.
              </p>
            </div>
          </div>

          <div
            className="
              hidden
              rounded-2xl
              border
              border-gray-800
              bg-gray-900
              px-6
              py-5
              xl:block
            "
          >
            <p
              className="
                text-xs
                uppercase
                tracking-wider
                text-gray-500
              "
            >
              STATUS
            </p>

            <div className="mt-2 flex items-center gap-2">
              <span
                className="
                  h-2
                  w-2
                  rounded-full
                  bg-emerald-400
                "
              />
              <span className="font-medium text-gray-200">Novo Cadastro</span>
            </div>
          </div>
        </div>

        {/* ERROS */}
        {error && (
          <div
            className="
              rounded-2xl
              border
              border-red-500/20
              bg-red-500/10
              p-5
              text-red-400
            "
          >
            {typeof error === 'string'
              ? error
              : error?.message || 'Não foi possível salvar o imóvel.'}
          </div>
        )}

        {backendErrors.length > 0 && (
          <div
            className="
              rounded-2xl
              border
              border-red-500/20
              bg-red-500/10
              p-5
            "
          >
            <h4 className="mb-2 font-semibold text-red-400">
              Erros de validação do servidor:
            </h4>
            <ul className="list-inside list-disc space-y-1 text-sm text-red-400">
              {backendErrors.map((err, index) => (
                <li key={index}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ======================================================
              INFORMAÇÕES BÁSICAS
          ====================================================== */}

          <section className={cardClass}>
            <h2 className={sectionTitle}>
              <Home className="text-blue-400" size={22} />
              Informações Básicas
            </h2>

            <div className="grid gap-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Nome do Imóvel *</label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className={`${inputClass} ${
                      validationErrors.name ? 'border-red-500' : ''
                    }`}
                    placeholder="Ex.: Casa Alto Padrão Alphaville"
                    required
                  />
                  {validationErrors.name && (
                    <p className="mt-1 text-sm text-red-400" data-error>
                      {validationErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Código do Imóvel</label>
                  <input
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Ex.: NV-000001"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Deixe em branco para gerar automaticamente
                  </p>
                </div>
              </div>

              <div>
                <label className={labelClass}>Descrição Curta</label>
                <input
                  name="shortDescription"
                  value={form.shortDescription}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Resumo rápido do imóvel (máx. 150 caracteres)"
                  maxLength={150}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {form.shortDescription.length}/150 caracteres
                </p>
              </div>

              <div>
                <label className={labelClass}>Descrição Completa</label>
                <textarea
                  rows={6}
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className={`${inputClass} resize-none`}
                  placeholder="Descreva os principais diferenciais do imóvel..."
                />
              </div>

              <div
                className="
                  grid
                  gap-6
                  md:grid-cols-2
                  xl:grid-cols-4
                "
              >
                <div>
                  <label className={labelClass}>Tipo</label>

                  <select
                    className={selectClass}
                    value={form.type}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        type: e.target.value,
                      }))
                    }
                  >
                    {PROPERTY_TYPES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Categoria</label>

                  <select
                    className={selectClass}
                    value={form.category}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                  >
                    {PROPERTY_CATEGORIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Finalidade *</label>

                  <select
                    className={selectClass}
                    value={form.purpose}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        purpose: e.target.value,
                      }))
                    }
                  >
                    {PROPERTY_PURPOSES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Selecione "venda" ou "venda_aluguel" para preencher o preço
                    de venda
                  </p>
                </div>

                <div>
                  <label className={labelClass}>Status da Construção</label>

                  <select
                    className={selectClass}
                    value={form.constructionStatus}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        constructionStatus: e.target.value,
                      }))
                    }
                  >
                    {PROPERTY_CONSTRUCTION_STATUS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Condição</label>
                  <select
                    className={selectClass}
                    value={form.condition}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        condition: e.target.value,
                      }))
                    }
                  >
                    <option value="novo">Novo</option>
                    <option value="usado">Usado</option>
                    <option value="reformado">Reformado</option>
                    <option value="em_obra">Em Obra</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Prioridade</label>
                  <select
                    className={selectClass}
                    value={form.priority}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        priority: Number(e.target.value),
                      }))
                    }
                  >
                    <option value={0}>Normal</option>
                    <option value={1}>Baixa</option>
                    <option value={2}>Média</option>
                    <option value={3}>Alta</option>
                    <option value={4}>Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Cor (opcional)</label>
                <input
                  type="color"
                  name="color"
                  value={form.color}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border border-gray-700 bg-gray-800/70 p-1"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Use para destacar o imóvel na lista
                </p>
              </div>
            </div>
          </section>

          {/* ======================================================
              MIDIA
          ====================================================== */}

          <section className={cardClass}>
            <div className="mb-8 flex items-center gap-4">
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  bg-purple-600/10
                  text-purple-400
                "
              >
                <ImageIcon size={22} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">Mídia</h2>
                <p className="text-sm text-gray-400">
                  Fotos, vídeos, tour virtual e documentos
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className={labelClass}>Galeria de Fotos</label>
                <PropertyImageUpload
                  images={form.images}
                  onChange={(images) =>
                    setForm((prev) => ({
                      ...prev,
                      images,
                    }))
                  }
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    URL do Vídeo (YouTube/Vimeo)
                  </label>
                  <input
                    name="video"
                    value={form.video}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>

                <div>
                  <label className={labelClass}>Tour Virtual</label>
                  <input
                    name="virtualTour"
                    value={form.virtualTour}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="https://my.matterport.com/show/..."
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Planta Baixa</label>
                <input
                  name="floorPlan"
                  value={form.floorPlan}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="URL da planta baixa"
                />
              </div>
            </div>
          </section>

          {/* ======================================================
              VALORES
          ====================================================== */}

          <section className={cardClass}>
            <div className="mb-8 flex items-center gap-4">
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  bg-emerald-600/10
                  text-emerald-400
                "
              >
                <DollarSign size={22} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">Valores</h2>
                <p className="text-sm text-gray-400">
                  Configure os valores de venda, aluguel e despesas
                </p>
              </div>
            </div>

            {validationErrors.salePrice && (
              <div
                className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
                data-error
              >
                {validationErrors.salePrice}
              </div>
            )}

            {validationErrors.rentPrice && (
              <div
                className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400"
                data-error
              >
                {validationErrors.rentPrice}
              </div>
            )}

            <div
              className="
                grid
                gap-6
                md:grid-cols-2
                xl:grid-cols-4
              "
            >
              <div>
                <label className={labelClass}>
                  Valor de Venda{' '}
                  {(form.purpose === 'venda' ||
                    form.purpose === 'venda_aluguel') &&
                    ' *'}
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="R$ 0,00"
                  className={`${inputClass} ${
                    validationErrors.salePrice ? 'border-red-500' : ''
                  }`}
                  value={form.prices.salePrice}
                  onChange={(e) =>
                    handleMoneyChange('salePrice', e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>
                  Valor do Aluguel
                  {(form.purpose === 'aluguel' ||
                    form.purpose === 'venda_aluguel') &&
                    ' *'}
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="R$ 0,00"
                  className={`${inputClass} ${
                    validationErrors.rentPrice ? 'border-red-500' : ''
                  }`}
                  value={form.prices.rentPrice}
                  onChange={(e) =>
                    handleMoneyChange('rentPrice', e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>Condomínio</label>

                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="R$ 0,00"
                  className={inputClass}
                  value={form.prices.condominium}
                  onChange={(e) =>
                    handleMoneyChange('condominium', e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>IPTU</label>

                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="R$ 0,00"
                  className={inputClass}
                  value={form.prices.iptu}
                  onChange={(e) => handleMoneyChange('iptu', e.target.value)}
                />
              </div>

              <div className="md:col-span-2 xl:col-span-4">
                <label className={labelClass}>Outras Taxas</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="R$ 0,00"
                  className={inputClass}
                  value={form.prices.otherFees}
                  onChange={(e) =>
                    handleMoneyChange('otherFees', e.target.value)
                  }
                />
              </div>
            </div>
          </section>

          {/* ======================================================
              CARACTERÍSTICAS
          ====================================================== */}

          <section className={cardClass}>
            <div className="mb-8 flex items-center gap-4">
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  bg-purple-600/10
                  text-purple-400
                "
              >
                <BedDouble size={22} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">
                  Características do Imóvel
                </h2>
                <p className="text-sm text-gray-400">
                  Informe os detalhes físicos do imóvel
                </p>
              </div>
            </div>

            <div
              className="
                grid
                gap-6
                md:grid-cols-2
                xl:grid-cols-4
              "
            >
              <NumberInput
                label="Quartos"
                value={form.bedrooms}
                onChange={(value) => updateNumber('bedrooms', value)}
              />

              <NumberInput
                label="Suítes"
                value={form.suites}
                onChange={(value) => updateNumber('suites', value)}
              />

              <NumberInput
                label="Banheiros"
                value={form.bathrooms}
                onChange={(value) => updateNumber('bathrooms', value)}
              />

              <NumberInput
                label="Vagas de Garagem"
                value={form.parkingSpaces}
                onChange={(value) => updateNumber('parkingSpaces', value)}
              />
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <NumberInput
                label="Andar"
                value={form.floor}
                onChange={(value) => updateNumber('floor', value)}
              />

              <NumberInput
                label="Total de Andares"
                value={form.totalFloors}
                onChange={(value) => updateNumber('totalFloors', value)}
              />
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div>
                <label className={labelClass}>Área Total (m²) *</label>

                <input
                  type="number"
                  step="0.01"
                  className={`${inputClass} ${
                    validationErrors.areaTotal ? 'border-red-500' : ''
                  }`}
                  value={form.area.total}
                  onChange={(e) =>
                    handleNestedChange('area', 'total', e.target.value)
                  }
                  placeholder="Ex.: 120"
                />
                {validationErrors.areaTotal && (
                  <p className="mt-1 text-sm text-red-400" data-error>
                    {validationErrors.areaTotal}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Área total do imóvel em metros quadrados (obrigatório)
                </p>
              </div>

              <div>
                <label className={labelClass}>Área Construída (m²)</label>

                <input
                  type="number"
                  step="0.01"
                  className={inputClass}
                  value={form.area.built}
                  onChange={(e) =>
                    handleNestedChange('area', 'built', e.target.value)
                  }
                  placeholder="Ex.: 100"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Área construída em metros quadrados (opcional)
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <div>
                <label className={labelClass}>Área do Terreno (m²)</label>
                <input
                  type="number"
                  step="0.01"
                  className={inputClass}
                  value={form.area.landArea}
                  onChange={(e) =>
                    handleNestedChange('area', 'landArea', e.target.value)
                  }
                  placeholder="Ex.: 300"
                />
              </div>

              <div>
                <label className={labelClass}>Testada (m)</label>
                <input
                  type="number"
                  step="0.01"
                  className={inputClass}
                  value={form.area.frontage}
                  onChange={(e) =>
                    handleNestedChange('area', 'frontage', e.target.value)
                  }
                  placeholder="Ex.: 12.5"
                />
              </div>

              <div>
                <label className={labelClass}>Fundos (m)</label>
                <input
                  type="number"
                  step="0.01"
                  className={inputClass}
                  value={form.area.background}
                  onChange={(e) =>
                    handleNestedChange('area', 'background', e.target.value)
                  }
                  placeholder="Ex.: 25"
                />
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="furnished"
                  name="furnished"
                  checked={form.furnished}
                  onChange={handleChange}
                  className={checkboxClass}
                />
                <label htmlFor="furnished" className="text-sm text-gray-300">
                  Mobiliado
                </label>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="acceptsPets"
                  name="acceptsPets"
                  checked={form.acceptsPets}
                  onChange={handleChange}
                  className={checkboxClass}
                />
                <label htmlFor="acceptsPets" className="text-sm text-gray-300">
                  Aceita Pets
                </label>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="acceptsFinancing"
                  name="acceptsFinancing"
                  checked={form.acceptsFinancing}
                  onChange={handleChange}
                  className={checkboxClass}
                />
                <label
                  htmlFor="acceptsFinancing"
                  className="text-sm text-gray-300"
                >
                  Aceita Financiamento
                </label>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="acceptsFGTS"
                  name="acceptsFGTS"
                  checked={form.acceptsFGTS}
                  onChange={handleChange}
                  className={checkboxClass}
                />
                <label htmlFor="acceptsFGTS" className="text-sm text-gray-300">
                  Aceita FGTS
                </label>
              </div>
            </div>
          </section>

          {/* ======================================================
              PROPRIETÁRIO
          ====================================================== */}

          <section className={cardClass}>
            <div className="mb-8 flex items-center gap-4">
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  bg-amber-600/10
                  text-amber-400
                "
              >
                <UserRound size={22} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">
                  Proprietário do Imóvel
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Dados internos do proprietário. Essas informações não serão
                  exibidas no site público.
                </p>
              </div>
            </div>

            <div
              className="
                mb-6
                rounded-xl
                border
                border-amber-500/20
                bg-amber-500/5
                p-4
              "
            >
              <div className="flex items-start gap-3">
                <UserRound
                  size={18}
                  className="mt-0.5 shrink-0 text-amber-400"
                />

                <div>
                  <p className="text-sm font-medium text-amber-300">
                    Informação interna
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Nome, telefone, e-mail e documento permanecem disponíveis
                    somente dentro do CRM.
                  </p>
                </div>
              </div>
            </div>

            <div
              className="
                grid
                gap-6
                md:grid-cols-2
              "
            >
              <div>
                <label className={labelClass}>Nome completo</label>

                <input
                  type="text"
                  className={inputClass}
                  value={form.owner.name}
                  onChange={(e) =>
                    handleNestedChange('owner', 'name', e.target.value)
                  }
                  placeholder="Nome completo do proprietário"
                />
              </div>

              <div>
                <label className={labelClass}>Telefone</label>

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
                    className={`${inputClass} pl-11`}
                    value={form.owner.phone}
                    onChange={(e) =>
                      handleNestedChange('owner', 'phone', e.target.value)
                    }
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>E-mail</label>

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
                    className={`${inputClass} pl-11`}
                    value={form.owner.email}
                    onChange={(e) =>
                      handleNestedChange('owner', 'email', e.target.value)
                    }
                    placeholder="proprietario@email.com"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>CPF / CNPJ</label>

                <input
                  type="text"
                  className={inputClass}
                  value={form.owner.document}
                  onChange={(e) =>
                    handleNestedChange('owner', 'document', e.target.value)
                  }
                  placeholder="000.000.000-00"
                />
              </div>
            </div>
          </section>

          {/* ======================================================
              CAPTAÇÃO
          ====================================================== */}

          <section className={cardClass}>
            <div className="mb-8 flex items-center gap-4">
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-600/10
                  text-blue-400
                "
              >
                <Percent size={22} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">
                  Captação do Imóvel
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  Defina internamente qual corretor realizou a captação
                </p>
              </div>
            </div>

            <div
              className="
                mb-6
                rounded-xl
                border
                border-blue-500/20
                bg-blue-500/5
                p-4
              "
            >
              <div className="flex items-start gap-3">
                <Percent size={18} className="mt-0.5 shrink-0 text-blue-400" />

                <div>
                  <p className="text-sm font-medium text-blue-300">
                    Regra de captação
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Essa informação é exclusivamente interna e não será exibida
                    para o cliente.
                  </p>
                </div>
              </div>
            </div>

            <div
              className="
                grid
                gap-6
                md:grid-cols-2
              "
            >
              <div>
                <label className={labelClass}>Captado por</label>

                <select
                  className={selectClass}
                  value={form.captation.broker}
                  onChange={(e) =>
                    handleNestedChange('captation', 'broker', e.target.value)
                  }
                  disabled={brokersLoading}
                >
                  <option value="">
                    {brokersLoading
                      ? 'Carregando corretores...'
                      : 'Selecione o corretor captador'}
                  </option>

                  {brokers.map((broker) => (
                    <option key={broker._id} value={broker._id}>
                      {broker.name}
                      {broker.position ? ` — ${broker.position}` : ''}
                    </option>
                  ))}
                </select>

                {!brokersLoading && brokers.length === 0 && (
                  <p className="mt-2 text-xs text-amber-400">
                    Nenhum corretor disponível para seleção.
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass}>Percentual de captação</label>

                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    inputMode="decimal"
                    className={`
                      ${inputClass}
                      pr-12
                      appearance-none
                      [&::-webkit-inner-spin-button]:appearance-none
                      [&::-webkit-outer-spin-button]:appearance-none
                    `}
                    value={form.captation.percentage}
                    onChange={(e) => handlePercentageChange(e.target.value)}
                    placeholder="Ex.: 10"
                  />

                  <Percent
                    size={18}
                    className="
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-gray-500
                    "
                  />
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Informe o percentual da comissão destinado ao corretor
                  responsável pela captação.
                </p>
              </div>
            </div>
          </section>

          {/* ======================================================
              LOCALIZAÇÃO
          ====================================================== */}

          <section className={cardClass}>
            <div className="mb-8 flex items-center gap-4">
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  bg-orange-600/10
                  text-orange-400
                "
              >
                <MapPin size={22} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">
                  Localização
                </h2>

                <p className="text-sm text-gray-400">
                  Informe o endereço completo do imóvel
                </p>
              </div>
            </div>

            <div
              className="
                grid
                gap-6
                md:grid-cols-2
                xl:grid-cols-4
              "
            >
              <div>
                <label className={labelClass}>CEP</label>

                <input
                  className={inputClass}
                  value={form.location.zipCode}
                  onChange={(e) =>
                    handleNestedChange('location', 'zipCode', e.target.value)
                  }
                />
              </div>

              <div className="xl:col-span-3">
                <label className={labelClass}>Rua</label>

                <input
                  className={inputClass}
                  value={form.location.street}
                  onChange={(e) =>
                    handleNestedChange('location', 'street', e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>Número</label>

                <input
                  className={inputClass}
                  value={form.location.number}
                  onChange={(e) =>
                    handleNestedChange('location', 'number', e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>Complemento</label>

                <input
                  className={inputClass}
                  value={form.location.complement}
                  onChange={(e) =>
                    handleNestedChange('location', 'complement', e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>Bairro</label>

                <input
                  className={inputClass}
                  value={form.location.district}
                  onChange={(e) =>
                    handleNestedChange('location', 'district', e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>Cidade *</label>

                <input
                  className={`${inputClass} ${
                    validationErrors.city ? 'border-red-500' : ''
                  }`}
                  value={form.location.city}
                  onChange={(e) =>
                    handleNestedChange('location', 'city', e.target.value)
                  }
                />
                {validationErrors.city && (
                  <p className="mt-1 text-sm text-red-400" data-error>
                    {validationErrors.city}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass}>Estado *</label>

                <input
                  maxLength={2}
                  className={`${inputClass} ${
                    validationErrors.state ? 'border-red-500' : ''
                  }`}
                  value={form.location.state}
                  onChange={(e) =>
                    handleNestedChange(
                      'location',
                      'state',
                      e.target.value.toUpperCase(),
                    )
                  }
                />
                {validationErrors.state && (
                  <p className="mt-1 text-sm text-red-400" data-error>
                    {validationErrors.state}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass}>País</label>

                <input
                  className={inputClass}
                  value={form.location.country}
                  onChange={(e) =>
                    handleNestedChange('location', 'country', e.target.value)
                  }
                  placeholder="Brasil"
                />
              </div>

              <div>
                <label className={labelClass}>Região</label>

                <select
                  className={selectClass}
                  value={form.location.region}
                  onChange={(e) =>
                    handleNestedChange('location', 'region', e.target.value)
                  }
                >
                  <option value="">Selecione</option>

                  {PROPERTY_REGIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* ======================================================
              COMODIDADES
          ====================================================== */}

          <section className={cardClass}>
            <div className="mb-8 flex items-center gap-4">
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  bg-cyan-600/10
                  text-cyan-400
                "
              >
                <CheckCircle size={22} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">
                  Comodidades
                </h2>

                <p className="text-sm text-gray-400">
                  Selecione todos os diferenciais disponíveis
                </p>
              </div>
            </div>

            <div
              className="
                grid
                gap-4
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
              "
            >
              {AVAILABLE_FEATURES.map((feature) => {
                const active = form.features.includes(feature);

                return (
                  <button
                    key={feature}
                    type="button"
                    onClick={() => toggleFeature(feature)}
                    className={`
                      group
                      flex
                      items-center
                      gap-3
                      rounded-xl
                      border
                      p-4
                      transition-all
                      duration-300

                      ${
                        active
                          ? `
                            border-blue-500
                            bg-blue-600
                            text-white
                            shadow-lg
                            shadow-blue-600/20
                          `
                          : `
                            border-gray-700
                            bg-gray-800/60
                            text-gray-300
                            hover:border-gray-500
                            hover:bg-gray-800
                          `
                      }
                    `}
                  >
                    <div
                      className={`
                        flex
                        h-6
                        w-6
                        items-center
                        justify-center
                        rounded-full
                        transition-all

                        ${
                          active
                            ? 'bg-white text-blue-600'
                            : 'bg-gray-700 text-gray-400'
                        }
                      `}
                    >
                      ✓
                    </div>

                    <span className="text-sm font-medium">{feature}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ======================================================
              TAGS E HIGHLIGHTS
          ====================================================== */}

          <section className={cardClass}>
            <div className="mb-8 flex items-center gap-4">
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  bg-indigo-600/10
                  text-indigo-400
                "
              >
                <Tag size={22} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">
                  Tags e Destaques
                </h2>
                <p className="text-sm text-gray-400">
                  Adicione palavras-chave e diferenciais do imóvel
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <TagInput
                label="Tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onAdd={addTag}
                onRemove={removeTag}
                items={form.tags}
                placeholder="Ex.: cobertura, vista-mar, lazer..."
              />

              <TagInput
                label="Destaques (Highlights)"
                value={highlightInput}
                onChange={(e) => setHighlightInput(e.target.value)}
                onAdd={addHighlight}
                onRemove={removeHighlight}
                items={form.highlights}
                placeholder="Ex.: Varanda Gourmet, Piscina Privativa..."
              />
            </div>
          </section>

          {/* ======================================================
              DOCUMENTOS E REGISTROS
          ====================================================== */}

          <section className={cardClass}>
            <div className="mb-8 flex items-center gap-4">
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  bg-rose-600/10
                  text-rose-400
                "
              >
                <FileText size={22} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">
                  Documentos e Registros
                </h2>
                <p className="text-sm text-gray-400">
                  Números de registro e documentos do imóvel
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className={labelClass}>Número de Registro</label>
                <input
                  name="registrationNumber"
                  value={form.registrationNumber}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Número de matrícula do imóvel"
                />
              </div>

              <div>
                <label className={labelClass}>Número da Escritura</label>
                <input
                  name="deedNumber"
                  value={form.deedNumber}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Número da escritura pública"
                />
              </div>
            </div>
          </section>

          {/* ======================================================
              OBSERVAÇÕES
          ====================================================== */}

          <section className={cardClass}>
            <div className="mb-8 flex items-center gap-4">
              <div
                className="
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  bg-yellow-600/10
                  text-yellow-400
                "
              >
                <ClipboardList size={22} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-white">
                  Observações
                </h2>
                <p className="text-sm text-gray-400">
                  Anotações internas sobre o imóvel
                </p>
              </div>
            </div>

            <div className="grid gap-6">
              <div>
                <label className={labelClass}>Notas Públicas</label>
                <textarea
                  rows={3}
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  className={`${inputClass} resize-none`}
                  placeholder="Notas que podem ser compartilhadas com clientes..."
                />
              </div>

              <div>
                <label className={labelClass}>Notas Internas</label>
                <textarea
                  rows={3}
                  name="internalNotes"
                  value={form.internalNotes}
                  onChange={handleChange}
                  className={`${inputClass} resize-none`}
                  placeholder="Anotações internas apenas para a equipe CRM..."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Essas notas são visíveis apenas para a equipe interna
                </p>
              </div>
            </div>
          </section>

          {/* ======================================================
              FOOTER
          ====================================================== */}

          <div
            className="
              sticky
              bottom-4
              z-40
              rounded-2xl
              border
              border-gray-800
              bg-gray-900/95
              p-6
              shadow-2xl
              backdrop-blur-xl
            "
          >
            <div
              className="
                flex
                flex-col
                gap-6
                lg:flex-row
                lg:items-center
                lg:justify-between
              "
            >
              <div>
                <h3 className="font-semibold text-white">
                  Pronto para publicar?
                </h3>

                <p className="mt-1 text-sm text-gray-400">
                  Revise todas as informações antes de salvar o imóvel.
                </p>
              </div>

              <div
                className="
                  flex
                  flex-col-reverse
                  gap-4
                  sm:flex-row
                "
              >
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="
                    rounded-xl
                    border
                    border-gray-700
                    bg-gray-800
                    px-6
                    py-3
                    font-medium
                    text-gray-300
                    transition-all
                    hover:border-gray-600
                    hover:bg-gray-700
                  "
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    flex
                    items-center
                    justify-center
                    gap-3
                    rounded-xl
                    bg-blue-600
                    px-8
                    py-3
                    font-semibold
                    text-white
                    shadow-lg
                    shadow-blue-600/20
                    transition-all
                    hover:scale-[1.02]
                    hover:bg-blue-500
                    active:scale-95
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  <Save size={18} />

                  {loading ? 'Salvando imóvel...' : 'Salvar Imóvel'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

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
  Trash2,
  Loader2,
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

/*
==========================================================
ESTADO INICIAL
==========================================================
*/

const initialState = {
  name: '',
  description: '',

  type: 'casa',
  category: 'casa',
  purpose: 'venda',

  constructionStatus: 'pronto',
  condition: 'usado',

  images: [],

  prices: {
    salePrice: '',
    rentPrice: '',
    condominium: '',
    iptu: '',
  },

  area: {
    total: '',
    built: '',
  },

  bedrooms: 0,
  suites: 0,
  bathrooms: 0,
  parkingSpaces: 0,

  location: {
    zipCode: '',
    street: '',
    number: '',
    complement: '',
    district: '',
    city: '',
    state: '',
    region: '',
  },

  features: [],

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
};

export default function PropertyEdit() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Usando o hook useProperties
  const { update, remove, loading, error } = useProperties(false);

  const [form, setForm] = useState(initialState);
  const [validationErrors, setValidationErrors] = useState({});
  const [backendErrors, setBackendErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [propertyLoaded, setPropertyLoaded] = useState(false);

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
  BUSCAR USUÁRIO, CORRETORES E DADOS DO IMÓVEL
  ==========================================================
  */

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        // Buscar usuário
        const storedUser = localStorage.getItem('userInfo');
        if (storedUser) {
          const userInfo = JSON.parse(storedUser);
          const currentUser = userInfo?.user || userInfo?.data || userInfo;
          const admin =
            currentUser?.isAdmin === true || currentUser?.role === 'admin';
          if (mounted) setIsAdmin(admin);
        }

        // Buscar corretores (se admin)
        const storedUserInfo = localStorage.getItem('userInfo');
        if (storedUserInfo) {
          const userInfo = JSON.parse(storedUserInfo);
          const currentUser = userInfo?.user || userInfo?.data || userInfo;
          const admin =
            currentUser?.isAdmin === true || currentUser?.role === 'admin';

          if (admin) {
            setBrokersLoading(true);
            try {
              const response = await api.get('/api/users/brokers');
              const data =
                response.data?.data?.brokers ||
                response.data?.brokers ||
                response.data?.data ||
                response.data ||
                [];
              const normalizedBrokers = Array.isArray(data)
                ? data.filter((broker) => broker && broker._id && broker.name)
                : [];
              if (mounted) setBrokers(normalizedBrokers);
            } catch (err) {
              console.error('Erro ao buscar corretores:', err);
            } finally {
              if (mounted) setBrokersLoading(false);
            }
          }
        }

        // Buscar dados do imóvel - USANDO API DIRETAMENTE
        if (id && mounted) {
          try {
            console.log('🔍 Buscando imóvel ID:', id);
            const response = await api.get(`/api/properties/${id}`);
            console.log('📦 Resposta do backend:', response.data);

            const propertyData =
              response.data?.data || response.data?.property || response.data;

            if (propertyData && mounted) {
              console.log('🏠 Dados do imóvel carregados:', propertyData);

              // Preencher o formulário com os dados do imóvel
              setForm({
                name: propertyData.name || '',
                description: propertyData.description || '',
                type: propertyData.type || 'casa',
                category: propertyData.category || 'casa',
                purpose: propertyData.purpose || 'venda',
                constructionStatus: propertyData.constructionStatus || 'pronto',
                condition: propertyData.condition || 'usado',
                active:
                  propertyData.active !== undefined
                    ? propertyData.active
                    : true,
                published:
                  propertyData.published !== undefined
                    ? propertyData.published
                    : true,
                isDeleted:
                  propertyData.isDeleted !== undefined
                    ? propertyData.isDeleted
                    : false,
                status: propertyData.status || 'published',
                isPublished:
                  propertyData.isPublished !== undefined
                    ? propertyData.isPublished
                    : true,
                images: propertyData.images || [],
                prices: {
                  salePrice: propertyData.prices?.salePrice
                    ? formatCurrency(String(propertyData.prices.salePrice))
                    : '',
                  rentPrice: propertyData.prices?.rentPrice
                    ? formatCurrency(String(propertyData.prices.rentPrice))
                    : '',
                  condominium: propertyData.prices?.condominiumFee
                    ? formatCurrency(String(propertyData.prices.condominiumFee))
                    : '',
                  iptu: propertyData.prices?.iptu
                    ? formatCurrency(String(propertyData.prices.iptu))
                    : '',
                },
                area: {
                  total: propertyData.dimensions?.totalArea
                    ? String(propertyData.dimensions.totalArea)
                    : '',
                  built: propertyData.dimensions?.builtArea
                    ? String(propertyData.dimensions.builtArea)
                    : '',
                },
                bedrooms: propertyData.bedrooms || 0,
                suites: propertyData.suites || 0,
                bathrooms: propertyData.bathrooms || 0,
                parkingSpaces: propertyData.parkingSpaces || 0,
                location: {
                  zipCode: propertyData.location?.zipCode || '',
                  street: propertyData.location?.street || '',
                  number: propertyData.location?.number || '',
                  complement: propertyData.location?.complement || '',
                  district: propertyData.location?.district || '',
                  city: propertyData.location?.city || '',
                  state: propertyData.location?.state || '',
                  region: propertyData.location?.region || '',
                },
                features: propertyData.features || [],
                captation: {
                  broker:
                    propertyData.captation?.broker?._id ||
                    propertyData.captation?.broker ||
                    '',
                  percentage: propertyData.captation?.percentage || 0,
                },
                owner: {
                  name: propertyData.owner?.name || '',
                  phone: propertyData.owner?.phone || '',
                  email: propertyData.owner?.email || '',
                  document: propertyData.owner?.document || '',
                },
              });

              setPropertyLoaded(true);
            } else {
              setBackendErrors(['Imóvel não encontrado.']);
            }
          } catch (err) {
            console.error('❌ Erro ao carregar imóvel:', err);
            if (err.response) {
              console.error('Status:', err.response.status);
              console.error('Dados:', err.response.data);
              setBackendErrors([
                `Erro ${err.response.status}: ${err.response.data?.message || 'Imóvel não encontrado'}`,
              ]);
            } else {
              setBackendErrors([
                'Não foi possível carregar os dados do imóvel.',
              ]);
            }
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setBackendErrors(['Erro ao carregar dados.']);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [id]); // SÓ DEPENDE DO ID

  /*
  ==========================================================
  CAMPOS SIMPLES
  ==========================================================
  */

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
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
  SUBMIT - ATUALIZAR
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

      const totalArea = Number(form.area.total) || 0;
      const builtArea = Number(form.area.built) || 0;

      const payload = {
        name: form.name.trim(),
        description: form.description?.trim() || '',
        type: form.type,
        category: form.category,
        purpose: form.purpose,
        constructionStatus: form.constructionStatus,
        condition: form.condition || 'usado',
        images: form.images || [],

        prices: {
          salePrice: salePrice,
          rentPrice: rentPrice,
          condominiumFee: condominiumFee,
          iptu: iptu,
        },

        dimensions: {
          totalArea: totalArea,
          builtArea: builtArea,
        },

        bedrooms: Number(form.bedrooms) || 0,
        suites: Number(form.suites) || 0,
        bathrooms: Number(form.bathrooms) || 0,
        parkingSpaces: Number(form.parkingSpaces) || 0,

        location: {
          zipCode: form.location.zipCode?.trim() || '',
          street: form.location.street?.trim() || '',
          number: form.location.number?.trim() || '',
          complement: form.location.complement?.trim() || '',
          district: form.location.district?.trim() || '',
          city: form.location.city?.trim() || '',
          state: form.location.state?.trim().toUpperCase() || '',
          region: form.location.region || '',
        },

        features: form.features || [],

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
      };

      console.log('📦 PAYLOAD ATUALIZAÇÃO:', JSON.stringify(payload, null, 2));

      await update(id, payload);
      navigate('/property-list');
    } catch (err) {
      console.error('❌ Erro ao atualizar imóvel:', err);

      if (err.response) {
        console.error('📡 STATUS:', err.response.status);
        console.error(
          '📡 DATA COMPLETA:',
          JSON.stringify(err.response.data, null, 2),
        );

        const errorData = err.response.data;

        if (errorData?.errors) {
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
        setBackendErrors([
          err.message || 'Erro desconhecido ao atualizar imóvel',
        ]);
      }
    }
  }

  /*
  ==========================================================
  EXCLUIR IMÓVEL
  ==========================================================
  */

  async function handleDelete() {
    if (
      !window.confirm(
        'Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.',
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await remove(id);
      navigate('/property-list');
    } catch (err) {
      console.error('Erro ao excluir imóvel:', err);
      setBackendErrors(['Não foi possível excluir o imóvel. Tente novamente.']);
    } finally {
      setIsDeleting(false);
    }
  }

  /*
  ==========================================================
  COMPONENTE NUMBER INPUT
  ==========================================================
  */

  function NumberInput({ label, value, onChange }) {
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
            onClick={() => onChange(Math.max(0, value - 1))}
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
            onClick={() => onChange(value + 1)}
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

  // Loading
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-500" />
          <p className="mt-4 text-gray-400">Carregando dados do imóvel...</p>
        </div>
      </div>
    );
  }

  // Se não encontrou o imóvel
  if (!propertyLoaded && !isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <Building2 className="mx-auto h-16 w-16 text-gray-600" />
          <h2 className="mt-4 text-2xl font-bold text-white">
            Imóvel não encontrado
          </h2>
          <p className="mt-2 text-gray-400">
            O imóvel que você está tentando editar não existe ou foi removido.
          </p>
          <button
            onClick={() => navigate('/property-list')}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-500"
          >
            Voltar para lista
          </button>
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
              <h1 className="text-3xl font-bold text-white">Editar Imóvel</h1>

              <p className="mt-2 text-gray-400">
                Atualize as informações do imóvel.
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
              <span className="font-medium text-gray-200">Editando</span>
            </div>
          </div>
        </div>

        {/* ERRO GERAL */}
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
              : error?.message || 'Não foi possível carregar o imóvel.'}
          </div>
        )}

        {/* ERROS DO BACKEND */}
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
          {/* INFORMAÇÕES BÁSICAS - MESMO CÓDIGO DO PROPERTYCREATE */}
          <section className={cardClass}>
            <h2 className={sectionTitle}>
              <Home className="text-blue-400" size={22} />
              Informações Básicas
            </h2>

            <div className="grid gap-6">
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
                <label className={labelClass}>Descrição</label>

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
            </div>
          </section>

          {/* GALERIA + RESUMO - MESMO CÓDIGO */}
          <div className="grid gap-8 xl:grid-cols-5">
            <section className={`${cardClass} xl:col-span-3`}>
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
                  <ImageIcon size={22} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Galeria de Fotos
                  </h2>

                  <p className="mt-1 text-sm text-gray-400">
                    Adicione ou remova imagens do imóvel.
                  </p>
                </div>
              </div>

              <PropertyImageUpload
                images={form.images}
                onChange={(images) =>
                  setForm((prev) => ({
                    ...prev,
                    images,
                  }))
                }
              />
            </section>

            <aside className={`${cardClass} xl:col-span-2`}>
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
                  <Building2 size={22} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white">Resumo</h2>

                  <p className="text-sm text-gray-400">
                    Informações principais.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div
                  className="
                    rounded-xl
                    border
                    border-gray-800
                    bg-gray-800/40
                    p-4
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
                    Tipo
                  </p>

                  <p className="mt-2 font-semibold text-white capitalize">
                    {form.type}
                  </p>
                </div>

                <div
                  className="
                    rounded-xl
                    border
                    border-gray-800
                    bg-gray-800/40
                    p-4
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
                    Finalidade
                  </p>

                  <p className="mt-2 font-semibold text-white capitalize">
                    {form.purpose}
                  </p>
                </div>

                <div
                  className="
                    rounded-xl
                    border
                    border-gray-800
                    bg-gray-800/40
                    p-4
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
                    Cidade
                  </p>

                  <p className="mt-2 font-semibold text-white">
                    {form.location.city || '-'}
                  </p>
                </div>

                <div
                  className="
                    rounded-xl
                    border
                    border-gray-800
                    bg-gray-800/40
                    p-4
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
                    Fotos
                  </p>

                  <p className="mt-2 text-2xl font-bold text-blue-400">
                    {form.images.length}
                  </p>
                </div>
              </div>
            </aside>
          </div>

          {/* VALORES - MESMO CÓDIGO */}
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
                  Configure os valores de venda, aluguel e despesas.
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
                  Valor de Venda
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
            </div>
          </section>

          {/* CARACTERÍSTICAS - MESMO CÓDIGO */}
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
                  Informe os detalhes físicos do imóvel.
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
              </div>
            </div>
          </section>

          {/* PROPRIETÁRIO - MESMO CÓDIGO */}
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
                  Dados internos do proprietário.
                </p>
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

          {/* CAPTAÇÃO - MESMO CÓDIGO */}
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
                  Defina internamente qual corretor realizou a captação.
                </p>
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
              </div>
            </div>
          </section>

          {/* LOCALIZAÇÃO - MESMO CÓDIGO */}
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
                  Informe o endereço completo do imóvel.
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

          {/* COMODIDADES - MESMO CÓDIGO */}
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
                  Selecione todos os diferenciais disponíveis.
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

          {/* FOOTER */}
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
                  Pronto para atualizar?
                </h3>

                <p className="mt-1 text-sm text-gray-400">
                  Revise todas as informações antes de salvar as alterações.
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
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="
                    flex
                    items-center
                    justify-center
                    gap-3
                    rounded-xl
                    bg-red-600
                    px-6
                    py-3
                    font-semibold
                    text-white
                    shadow-lg
                    shadow-red-600/20
                    transition-all
                    hover:scale-[1.02]
                    hover:bg-red-500
                    active:scale-95
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  <Trash2 size={18} />
                  {isDeleting ? 'Excluindo...' : 'Excluir'}
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

                  {loading ? 'Salvando alterações...' : 'Salvar Alterações'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

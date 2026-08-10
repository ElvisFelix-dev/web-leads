import { useState } from 'react';
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
} from 'lucide-react';

import { formatCurrency, currencyToNumber } from '../utils/currency';
import { formatArea, areaToNumber } from '../utils/area';

import useProperties from '../hooks/useProperties';
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

/* ==========================================================
   ESTILO PREMIUM
========================================================== */

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
};

export default function PropertyCreate() {
  const navigate = useNavigate();

  const { create, loading, error } = useProperties(false);

  const [form, setForm] = useState(initialState);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleNestedChange(group, field, value) {
    setForm((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [field]: value,
      },
    }));
  }

  function handleMoneyChange(field, value) {
    handleNestedChange('prices', field, formatCurrency(value));
  }

  function updateNumber(field, value) {
    const number = Number(value);

    setForm((prev) => ({
      ...prev,
      [field]: Number.isNaN(number) ? 0 : number,
    }));
  }

  function handleArea(field, value) {
    handleNestedChange('area', field, formatArea(value));
  }

  function toggleFeature(feature) {
    setForm((prev) => ({
      ...prev,

      features: prev.features.includes(feature)
        ? prev.features.filter((item) => item !== feature)
        : [...prev.features, feature],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await create({
        ...form,

        prices: {
          salePrice: currencyToNumber(form.prices.salePrice),

          rentPrice: currencyToNumber(form.prices.rentPrice),

          condominiumFee: currencyToNumber(form.prices.condominium),

          iptu: currencyToNumber(form.prices.iptu),
        },

        dimensions: {
          totalArea: areaToNumber(form.area.total),

          builtArea: areaToNumber(form.area.built),
        },

        bedrooms: Number(form.bedrooms),

        suites: Number(form.suites),

        bathrooms: Number(form.bathrooms),

        parkingSpaces: Number(form.parkingSpaces),
      });

      navigate('/property-list');
    } catch (err) {
      console.error(err);
    }
  }

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
        {/* ==========================================================
            HEADER
        ========================================================== */}

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
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
            <p className="text-xs uppercase tracking-wider text-gray-500">
              STATUS
            </p>

            <div className="mt-2 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>

              <span className="font-medium text-gray-200">Novo Cadastro</span>
            </div>
          </div>
        </div>

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
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ==========================================================
              INFORMAÇÕES BÁSICAS
          ========================================================== */}

          <section className={cardClass}>
            <h2 className={sectionTitle}>
              <Home className="text-blue-400" size={22} />
              Informações Básicas
            </h2>

            <div className="grid gap-6">
              <div>
                <label className={labelClass}>Nome do Imóvel</label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Ex.: Casa Alto Padrão Alphaville"
                  required
                />
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

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
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
                      <option key={item}>{item}</option>
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
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Finalidade</label>

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
                      <option key={item}>{item}</option>
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
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>
          {/* ==========================================================
              GALERIA + VALORES
          ========================================================== */}

          <div className="grid gap-8 xl:grid-cols-5">
            {/* GALERIA */}

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
                    Adicione imagens em alta qualidade para destacar o imóvel.
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

            {/* RESUMO */}

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
                <div className="rounded-xl border border-gray-800 bg-gray-800/40 p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Tipo
                  </p>

                  <p className="mt-2 font-semibold text-white capitalize">
                    {form.type}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-800 bg-gray-800/40 p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Finalidade
                  </p>

                  <p className="mt-2 font-semibold text-white capitalize">
                    {form.purpose}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-800 bg-gray-800/40 p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Cidade
                  </p>

                  <p className="mt-2 font-semibold text-white">
                    {form.location.city || '-'}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-800 bg-gray-800/40 p-4">
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Fotos
                  </p>

                  <p className="mt-2 text-2xl font-bold text-blue-400">
                    {form.images.length}
                  </p>
                </div>
              </div>
            </aside>
          </div>

          {/* ==========================================================
              VALORES
          ========================================================== */}

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

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className={labelClass}>Valor de Venda</label>

                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="R$ 0,00"
                  className={inputClass}
                  value={form.prices.salePrice}
                  onChange={(e) =>
                    handleMoneyChange('salePrice', e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>Valor do Aluguel</label>

                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="R$ 0,00"
                  className={inputClass}
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

          {/* ==========================================================
              CARACTERÍSTICAS
          ========================================================== */}

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

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
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
                <label className={labelClass}>Área Total (m²)</label>

                <input
                  type="number"
                  className={inputClass}
                  value={form.area.total}
                  onChange={(e) =>
                    handleNestedChange('area', 'total', e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>Área Construída (m²)</label>

                <input
                  type="number"
                  className={inputClass}
                  value={form.area.built}
                  onChange={(e) =>
                    handleNestedChange('area', 'built', e.target.value)
                  }
                />
              </div>
            </div>
          </section>
          {/* ==========================================================
              LOCALIZAÇÃO
          ========================================================== */}

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

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
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
                <label className={labelClass}>Cidade</label>

                <input
                  className={inputClass}
                  value={form.location.city}
                  onChange={(e) =>
                    handleNestedChange('location', 'city', e.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass}>Estado</label>

                <input
                  maxLength={2}
                  className={inputClass}
                  value={form.location.state}
                  onChange={(e) =>
                    handleNestedChange(
                      'location',
                      'state',
                      e.target.value.toUpperCase(),
                    )
                  }
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

          {/* ==========================================================
              COMODIDADES
          ========================================================== */}

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

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

          {/* ==========================================================
              FOOTER
          ========================================================== */}

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
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="font-semibold text-white">
                  Pronto para publicar?
                </h3>

                <p className="mt-1 text-sm text-gray-400">
                  Revise todas as informações antes de salvar o imóvel.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-4 sm:flex-row">
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

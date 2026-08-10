import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import {
  FaBriefcase,
  FaBuilding,
  FaIdBadge,
  FaCheckCircle,
  FaClock,
  FaSignature,
} from 'react-icons/fa';

import FormError from '../FormError';

const SPECIALTIES = [
  'Apartamento',
  'Casa',
  'Cobertura',
  'Alto Padrão',
  'Lançamentos',
  'Comercial',
  'Locação',
  'Terrenos',
  'Investimentos',
];

export default function ProfileProfessional({ user, onSave }) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,

    formState: { errors, isSubmitting },
  } = useForm();

  /*
  ==========================================
  CARREGAR DADOS
  ==========================================
  */

  useEffect(() => {
    if (!user) return;

    reset({
      position: user.position || '',

      company: user.company || '',

      creci: user.creci || '',

      creciActive: user.creciActive || false,

      experienceYears: user.experienceYears || 0,

      signature: user.signature || '',

      specialties: Array.isArray(user.specialties) ? user.specialties : [],

      regions: Array.isArray(user.regions)
        ? user.regions.join(', ')
        : user.regions || '',

      highlights: Array.isArray(user.highlights)
        ? user.highlights.join(', ')
        : user.highlights || '',
    });
  }, [user, reset]);

  /*
  ==========================================
  ESPECIALIDADES
  ==========================================
  */

  const selectedSpecialties = watch('specialties') || [];

  function toggleSpecialty(item) {
    if (selectedSpecialties.includes(item)) {
      setValue(
        'specialties',

        selectedSpecialties.filter((specialty) => specialty !== item),

        {
          shouldDirty: true,
        },
      );
    } else {
      setValue(
        'specialties',

        [...selectedSpecialties, item],

        {
          shouldDirty: true,
        },
      );
    }
  }

  /*
  ==========================================
  SALVAR
  ==========================================
  */

  async function handleSave(data) {
    try {
      const payload = {
        position: data.position,

        company: data.company,

        creci: data.creci,

        creciActive: data.creciActive,

        experienceYears: Number(data.experienceYears),

        signature: data.signature,

        specialties: data.specialties || [],

        regions: data.regions
          ? data.regions
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
          : [],

        highlights: data.highlights
          ? data.highlights
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
      };

      await onSave(payload);

      toast.success('Perfil profissional atualizado!');
    } catch (error) {
      console.error('Erro ao atualizar perfil profissional:', error);

      toast.error(
        error.response?.data?.message ||
          'Erro ao atualizar perfil profissional',
      );
    }
  }
  return (
    <section
      className="
      overflow-hidden
      rounded-3xl
      border
      border-gray-800
      bg-gray-900
      shadow-xl
      "
    >
      {/* HEADER */}

      <div
        className="
        border-b
        border-gray-800
        px-8
        py-6
        "
      >
        <h2
          className="
          text-2xl
          font-bold
          text-white
          "
        >
          Perfil Profissional
        </h2>

        <p
          className="
          mt-2
          text-gray-400
          "
        >
          Configure suas informações profissionais exibidas no perfil público e
          interno do CRM.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(handleSave)}

        className="
        space-y-10
        p-8
        "
      >
        {/* ============================
            INFORMAÇÕES PROFISSIONAIS
        ============================ */}

        <div>
          <h3
            className="
            mb-6
            text-lg
            font-semibold
            text-white
            "
          >
            Informações Profissionais
          </h3>

          <div
            className="
            grid
            gap-6
            lg:grid-cols-2
            "
          >
            {/* CARGO */}

            <div>
              <label
                className="
                mb-2
                flex
                items-center
                gap-2
                text-sm
                font-medium
                text-gray-300
                "
              >
                <FaBriefcase />
                Cargo
              </label>

              <input
                {...register('position')}

                placeholder="Corretor de Imóveis"

                className="
                w-full
                rounded-xl
                border
                border-gray-700
                bg-gray-800
                px-4
                py-3
                text-white
                outline-none
                transition
                focus:border-blue-500
                "
              />

              <FormError message={errors.position?.message} />
            </div>

            {/* EMPRESA */}

            <div>
              <label
                className="
                mb-2
                flex
                items-center
                gap-2
                text-sm
                font-medium
                text-gray-300
                "
              >
                <FaBuilding />
                Empresa
              </label>

              <input
                {...register('company')}

                placeholder="Nome da imobiliária"

                className="
                w-full
                rounded-xl
                border
                border-gray-700
                bg-gray-800
                px-4
                py-3
                text-white
                outline-none
                transition
                focus:border-blue-500
                "
              />

              <FormError message={errors.company?.message} />
            </div>

            {/* CRECI */}

            <div>
              <label
                className="
                mb-2
                flex
                items-center
                gap-2
                text-sm
                font-medium
                text-gray-300
                "
              >
                <FaIdBadge />
                CRECI
              </label>

              <input
                {...register('creci')}

                placeholder="000000-F"

                className="
                w-full
                rounded-xl
                border
                border-gray-700
                bg-gray-800
                px-4
                py-3
                text-white
                outline-none
                transition
                focus:border-blue-500
                "
              />

              <FormError message={errors.creci?.message} />
            </div>

            {/* EXPERIÊNCIA */}

            <div>
              <label
                className="
                mb-2
                flex
                items-center
                gap-2
                text-sm
                font-medium
                text-gray-300
                "
              >
                <FaClock />
                Anos de Experiência
              </label>

              <input
                type="number"

                min={0}

                {...register('experienceYears', {
                  valueAsNumber: true,
                })}

                className="
                w-full
                rounded-xl
                border
                border-gray-700
                bg-gray-800
                px-4
                py-3
                text-white
                outline-none
                transition
                focus:border-blue-500
                "
              />
            </div>
          </div>

          {/* CRECI ATIVO */}

          <div className="mt-6">
            <label
              className="
              flex
              items-center
              gap-3
              rounded-2xl
              border
              border-gray-800
              bg-gray-800/50
              px-4
              py-4
              text-gray-300
              "
            >
              <input
                type="checkbox"

                {...register('creciActive')}

                className="
                h-4
                w-4
                rounded
                border-gray-600
                bg-gray-700
                text-blue-500
                "
              />

              <div
                className="
                flex
                items-center
                gap-2
                "
              >
                <FaCheckCircle
                  className="
                  text-green-400
                  "
                />
                CRECI ativo e regularizado
              </div>
            </label>
          </div>
        </div>

        {/* ASSINATURA */}

        <div>
          <h3
            className="
            mb-6
            text-lg
            font-semibold
            text-white
            "
          >
            Assinatura Profissional
          </h3>

          <label
            className="
            mb-2
            flex
            items-center
            gap-2
            text-sm
            font-medium
            text-gray-300
            "
          >
            <FaSignature />
            Assinatura
          </label>

          <input
            {...register('signature')}

            placeholder="
            Especialista em imóveis de alto padrão
            "

            className="
            w-full
            rounded-xl
            border
            border-gray-700
            bg-gray-800
            px-4
            py-3
            text-white
            "
          />
        </div>
        {/* ============================
            ESPECIALIDADES
        ============================ */}

        <div>
          <h3
            className="
            mb-6
            text-lg
            font-semibold
            text-white
            "
          >
            Especialidades
          </h3>

          <div
            className="
            flex
            flex-wrap
            gap-3
            "
          >
            {SPECIALTIES.map((item) => {
              const active = selectedSpecialties.includes(item);

              return (
                <button
                  key={item}

                  type="button"

                  onClick={() => toggleSpecialty(item)}

                  className={`
                    rounded-full
                    px-4
                    py-2
                    text-sm
                    font-medium
                    transition-all

                    ${
                      active
                        ? `
                        bg-blue-600
                        text-white
                        shadow-lg
                        shadow-blue-600/30
                      `
                        : `
                        border
                        border-gray-700
                        bg-gray-800
                        text-gray-300
                        hover:border-blue-500
                        hover:text-white
                      `
                    }
                  `}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>

        {/* ============================
            REGIÕES DE ATUAÇÃO
        ============================ */}

        <div>
          <h3
            className="
            mb-6
            text-lg
            font-semibold
            text-white
            "
          >
            Regiões de Atuação
          </h3>

          <textarea
            rows={3}

            {...register('regions')}

            placeholder="
            Ex.: Santana, Tucuruvi, Casa Verde, Zona Norte...
            "

            className="
            w-full
            rounded-2xl
            border
            border-gray-700
            bg-gray-800
            px-4
            py-4
            text-white
            resize-none
            outline-none
            transition
            focus:border-blue-500
            "
          />

          <p
            className="
            mt-2
            text-sm
            text-gray-500
            "
          >
            Separe cada região utilizando vírgulas.
          </p>
        </div>

        {/* ============================
            DESTAQUES
        ============================ */}

        <div>
          <h3
            className="
            mb-6
            text-lg
            font-semibold
            text-white
            "
          >
            Destaques
          </h3>

          <textarea
            rows={4}

            {...register('highlights')}

            placeholder="
            Ex.: Especialista em lançamentos, 300 imóveis vendidos...
            "

            className="
            w-full
            rounded-2xl
            border
            border-gray-700
            bg-gray-800
            px-4
            py-4
            text-white
            resize-none
            outline-none
            transition
            focus:border-blue-500
            "
          />

          <p
            className="
            mt-2
            text-sm
            text-gray-500
            "
          >
            Separe os destaques utilizando vírgulas.
          </p>
        </div>

        {/* ============================
            BOTÃO SALVAR
        ============================ */}

        <div
          className="
          flex
          justify-end
          border-t
          border-gray-800
          pt-8
          "
        >
          <button
            type="submit"

            disabled={isSubmitting}

            className="
            rounded-xl
            bg-gradient-to-r
            from-blue-600
            to-cyan-500
            px-10
            py-3
            font-semibold
            text-white
            shadow-lg
            transition
            hover:scale-105
            hover:shadow-blue-500/40
            disabled:cursor-not-allowed
            disabled:opacity-60
            "
          >
            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </section>
  );
}

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import { FaUser, FaEnvelope, FaPhone, FaGlobe } from 'react-icons/fa';

import FormError from '../FormError';
import SaveButton from './SaveButton';

export default function ProfilePersonal({ user, onSave }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (!user) return;

    reset({
      name: user.name || '',

      email: user.email || '',

      phone: user.phone || '',

      website: user.website || '',

      bio: user.bio || '',

      street: user.address?.street || '',

      number: user.address?.number || '',

      district: user.address?.district || '',

      city: user.address?.city || '',

      state: user.address?.state || '',

      zipCode: user.address?.zipCode || '',

      availability: user.availability || 'Disponível',

      workingStart: user.workingHours?.start || '',

      workingEnd: user.workingHours?.end || '',
    });
  }, [user, reset]);

  async function handleSave(data) {
    try {
      await onSave({
        name: data.name,

        phone: data.phone,

        website: data.website,

        bio: data.bio,

        address: {
          street: data.street,

          number: data.number,

          district: data.district,

          city: data.city,

          state: data.state,

          zipCode: data.zipCode,
        },

        availability: data.availability,

        workingHours: {
          start: data.workingStart,

          end: data.workingEnd,
        },
      });

      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);

      toast.error(error.response?.data?.message || 'Erro ao atualizar perfil');
    }
  }

  return (
    <section
      className="
rounded-3xl
border
border-gray-800
bg-gray-900
shadow-xl
overflow-hidden
"
    >
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
          Informações Pessoais
        </h2>

        <p
          className="
mt-2
text-gray-400
"
        >
          Atualize seus dados pessoais e mantenha seu perfil profissional sempre
          atualizado.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(handleSave)}
        className="
p-8
space-y-10
"
      >
        {/* DADOS BÁSICOS */}

        <div>
          <h3
            className="
mb-6
text-lg
font-semibold
text-white
"
          >
            Dados Básicos
          </h3>

          <div
            className="
grid
gap-6
lg:grid-cols-2
"
          >
            {/* Nome */}

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
                <FaUser />
                Nome Completo
              </label>

              <input
                {...register('name')}
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
focus:border-blue-500
"
              />

              <FormError message={errors.name?.message} />
            </div>

            {/* Email */}

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
                <FaEnvelope />
                Email
              </label>

              <input
                {...register('email')}
                readOnly
                className="
w-full
cursor-not-allowed
rounded-xl
border
border-gray-700
bg-gray-700
px-4
py-3
text-gray-400
"
              />
            </div>

            {/* Telefone */}

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
                <FaPhone />
                Telefone
              </label>

              <input
                {...register('phone')}
                placeholder="+55 11 99999-9999"
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
focus:border-blue-500
"
              />

              <FormError message={errors.phone?.message} />
            </div>

            {/* Website */}

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
                <FaGlobe />
                Website
              </label>

              <input
                {...register('website')}
                placeholder="https://meusite.com.br"
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
focus:border-blue-500
"
              />

              <FormError message={errors.website?.message} />
            </div>
          </div>
        </div>

        {/* BIO */}

        <div>
          <h3
            className="
mb-3
text-lg
font-semibold
text-white
"
          >
            Biografia
          </h3>

          <textarea
            rows={6}

            maxLength={500}

            {...register('bio')}

            placeholder="Conte um pouco sobre sua experiência profissional..."

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
focus:border-blue-500
"
          />
        </div>

        {/* ENDEREÇO */}

        <div>
          <h3
            className="
mb-6
text-lg
font-semibold
text-white
"
          >
            Endereço
          </h3>

          <div
            className="
grid
gap-6
lg:grid-cols-2
"
          >
            {[
              ['zipCode', 'CEP'],
              ['street', 'Rua'],
              ['number', 'Número'],
              ['district', 'Bairro'],
              ['city', 'Cidade'],
              ['state', 'Estado'],
            ].map(([field, label]) => (
              <div key={field}>
                <label
                  className="
mb-2
block
text-sm
font-medium
text-gray-300
"
                >
                  {label}
                </label>

                <input
                  {...register(field)}
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
focus:border-blue-500
"
                />
              </div>
            ))}
          </div>
        </div>

        {/* DISPONIBILIDADE */}

        <div>
          <h3
            className="
mb-6
text-lg
font-semibold
text-white
"
          >
            Disponibilidade
          </h3>

          <div
            className="
grid
gap-6
lg:grid-cols-3
"
          >
            <div>
              <label
                className="
mb-2
block
text-sm
font-medium
text-gray-300
"
              >
                Status
              </label>

              <select
                {...register('availability')}
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
              >
                <option value="Disponível">🟢 Disponível</option>

                <option value="Em visita">🟡 Em visita</option>

                <option value="Em reunião">🔵 Em reunião</option>

                <option value="Offline">⚫ Offline</option>
              </select>
            </div>

            <div>
              <label
                className="
mb-2
block
text-sm
font-medium
text-gray-300
"
              >
                Início Expediente
              </label>

              <input
                type="time"
                {...register('workingStart')}
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

            <div>
              <label
                className="
mb-2
block
text-sm
font-medium
text-gray-300
"
              >
                Fim Expediente
              </label>

              <input
                type="time"
                {...register('workingEnd')}
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
          </div>
        </div>

        {/* BOTÃO */}

        <div
          className="
flex
justify-end
pt-8
border-t
border-gray-800
"
        >
          <SaveButton loading={isSubmitting} />
        </div>
      </form>
    </section>
  );
}

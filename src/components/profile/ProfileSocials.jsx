import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';

import {
  FaInstagram,
  FaFacebook,
  FaLinkedin,
  FaYoutube,
  FaWhatsapp,
  FaTiktok,
  FaShareAlt,
} from 'react-icons/fa';

import FormError from '../FormError';
import SaveButton from './SaveButton';

export default function ProfileSocials({ user, onSave }) {
  const {
    register,
    handleSubmit,
    reset,

    formState: { errors, isSubmitting },
  } = useForm();

  /*
  ======================================
  CARREGAR DADOS
  ======================================
  */

  useEffect(() => {
    if (!user) return;

    const socials = user.socials || {};

    reset({
      instagram: socials.instagram || '',

      facebook: socials.facebook || '',

      linkedin: socials.linkedin || '',

      youtube: socials.youtube || '',

      tiktok: socials.tiktok || '',

      whatsapp: socials.whatsapp || '',
    });
  }, [user, reset]);

  /*
  ======================================
  SALVAR
  ======================================
  */

  async function handleSave(data) {
    try {
      const payload = {
        socials: {
          instagram: data.instagram?.trim() || '',

          facebook: data.facebook?.trim() || '',

          linkedin: data.linkedin?.trim() || '',

          youtube: data.youtube?.trim() || '',

          tiktok: data.tiktok?.trim() || '',

          whatsapp: data.whatsapp?.trim() || '',
        },
      };

      await onSave(payload);

      toast.success('Redes sociais atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar redes sociais:', error);

      toast.error(
        error.response?.data?.message || 'Erro ao atualizar redes sociais',
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
          flex
          items-center
          gap-3
          text-2xl
          font-bold
          text-white
          "
        >
          <FaShareAlt className="text-blue-500" />
          Redes Sociais
        </h2>

        <p
          className="
          mt-2
          text-gray-400
          "
        >
          Configure seus perfis para facilitar o contato com seus clientes.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(handleSave)}

        className="
        space-y-10
        p-8
        "
      >
        <div
          className="
          grid
          gap-6
          lg:grid-cols-2
          "
        >
          {/* INSTAGRAM */}

          <SocialInput
            icon={<FaInstagram className="text-pink-500" />}

            label="Instagram"

            prefix="instagram.com/"

            name="instagram"

            register={register}

            error={errors.instagram}

            placeholder="seu_usuario"
          />

          {/* FACEBOOK */}

          <SocialInput
            icon={<FaFacebook className="text-blue-500" />}

            label="Facebook"

            prefix="facebook.com/"

            name="facebook"

            register={register}

            error={errors.facebook}

            placeholder="seu_perfil"
          />

          {/* LINKEDIN */}

          <SocialInput
            icon={<FaLinkedin className="text-blue-400" />}

            label="LinkedIn"

            prefix="linkedin.com/in/"

            name="linkedin"

            register={register}

            error={errors.linkedin}

            placeholder="seu_nome"
          />
          {/* YOUTUBE */}

          <SocialInput
            icon={<FaYoutube className="text-red-500" />}

            label="YouTube"

            prefix="youtube.com/@"

            name="youtube"

            register={register}

            error={errors.youtube}

            placeholder="seu_canal"
          />

          {/* TIKTOK */}

          <SocialInput
            icon={<FaTiktok className="text-cyan-400" />}

            label="TikTok"

            prefix="tiktok.com/@"

            name="tiktok"

            register={register}

            error={errors.tiktok}

            placeholder="seu_usuario"
          />

          {/* WHATSAPP */}

          <SocialInput
            icon={<FaWhatsapp className="text-green-500" />}

            label="WhatsApp"

            prefix="+55"

            name="whatsapp"

            register={register}

            error={errors.whatsapp}

            placeholder="11999999999"
          />
        </div>

        {/* DICA */}

        <div
          className="
          rounded-2xl
          border
          border-blue-900/40
          bg-gradient-to-r
          from-blue-950/40
          to-cyan-950/30
          p-6
          "
        >
          <h3
            className="
            text-lg
            font-semibold
            text-white
            "
          >
            💡 Dica para aumentar suas conversões
          </h3>

          <p
            className="
            mt-3
            leading-relaxed
            text-gray-300
            "
          >
            Perfis completos aumentam a confiança dos clientes. Mantenha
            principalmente seu Instagram, WhatsApp e LinkedIn atualizados para
            facilitar novos contatos e oportunidades.
          </p>
        </div>

        {/* BOTÃO */}

        <div
          className="
          flex
          justify-end
          border-t
          border-gray-800
          pt-8
          "
        >
          <SaveButton loading={isSubmitting} />
        </div>
      </form>
    </section>
  );
}

/*
=================================================
COMPONENTE INPUT SOCIAL
=================================================
*/

function SocialInput({
  icon,

  label,

  prefix,

  name,

  register,

  error,

  placeholder,
}) {
  return (
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
        {icon}

        {label}
      </label>

      <div
        className="
        flex
        "
      >
        <span
          className="
          flex
          items-center
          rounded-l-xl
          border
          border-gray-700
          bg-gray-800
          px-4
          text-sm
          text-gray-400
          "
        >
          {prefix}
        </span>

        <input
          {...register(name)}

          placeholder={placeholder}

          className="
          min-w-0
          flex-1
          rounded-r-xl
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

      <FormError message={error?.message} />
    </div>
  );
}

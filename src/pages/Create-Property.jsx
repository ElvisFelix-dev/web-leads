import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import api from "../service/api";

// 🔎 Componente de erro reutilizável
function FormError({ message }) {
  return message ? (
    <p className="text-red-500 text-sm mt-1">{message}</p>
  ) : null;
}

// 📌 Schema de validação com Yup
const schema = yup.object().shape({
  name: yup.string().required("O nome é obrigatório"),
  bedrooms: yup
    .number()
    .typeError("Informe um número")
    .positive("Deve ser maior que 0")
    .required("Número de quartos é obrigatório"),
  bathrooms: yup
    .number()
    .typeError("Informe um número")
    .positive("Deve ser maior que 0")
    .required("Número de banheiros é obrigatório"),
  countInStock: yup
    .number()
    .typeError("Informe um número")
    .min(1, "Deve ser no mínimo 1")
    .required("Estoque é obrigatório"),
  price: yup
    .number()
    .typeError("Informe um número")
    .positive("Preço deve ser maior que 0")
    .required("Preço é obrigatório"),
  parking: yup.string().required("Informe as vagas"),
  category: yup.string().oneOf(["casa", "apartamento"]).required(),
  region: yup
    .string()
    .oneOf(["central", "zona oeste", "zona leste", "zona sul", "zona norte", "abc"])
    .required(),
  description: yup.string().required("Descrição é obrigatória"),
  address: yup.string().required("Endereço é obrigatório"),
  offer: yup.string().nullable(),
});

export default function CreateProperty() {
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 10);
    setImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => data.append(key, value));
      images.forEach((img) => data.append("images", img));

      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      if (!userInfo || !userInfo.token) throw new Error("Usuário não autenticado");

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const response = await api.post("/api/properties/create-property", data, config);
      toast.success("✅ Imóvel criado com sucesso!");

      reset();
      setImages([]);
      setPreviewImages([]);
      console.log("Imóvel criado:", response.data);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message || "Erro ao criar imóvel");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition duration-200 hover:border-blue-400";

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen sm:ml-64">
      {/* sm:ml-64 = espaço para o sidebar em telas maiores */}

      <div className="pt-5 max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-blue-950 mb-8">Criar Imóvel</h1>

        <form
          className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <input type="text" placeholder="Nome do imóvel" {...register("name")} className={inputClass} />
              <FormError message={errors.name?.message} />
            </div>

            <div>
              <input type="number" placeholder="Quartos" {...register("bedrooms")} className={inputClass} />
              <FormError message={errors.bedrooms?.message} />
            </div>

            <div>
              <input type="number" placeholder="Banheiros" {...register("bathrooms")} className={inputClass} />
              <FormError message={errors.bathrooms?.message} />
            </div>

            <div>
              <input type="number" placeholder="Quantidade em estoque" {...register("countInStock")} className={inputClass} />
              <FormError message={errors.countInStock?.message} />
            </div>

            <div>
              <input type="number" placeholder="Preço" {...register("price")} className={inputClass} />
              <FormError message={errors.price?.message} />
            </div>

            <div>
              <input type="number" placeholder="Vagas" {...register("parking")} className={inputClass} />
              <FormError message={errors.parking?.message} />
            </div>

            <div>
              <select {...register("category")} className={inputClass}>
                <option value="">Selecione a categoria</option>
                <option value="casa">Casa</option>
                <option value="apartamento">Apartamento</option>
              </select>
              <FormError message={errors.category?.message} />
            </div>

            <div>
              <select {...register("region")} className={inputClass}>
                <option value="">Selecione a região</option>
                <option value="central">Central</option>
                <option value="zona oeste">Zona Oeste</option>
                <option value="zona leste">Zona Leste</option>
                <option value="zona sul">Zona Sul</option>
                <option value="zona norte">Zona Norte</option>
                <option value="abc">ABC</option>
              </select>
              <FormError message={errors.region?.message} />
            </div>
          </div>

          <div>
            <textarea placeholder="Descrição" {...register("description")} className={inputClass} />
            <FormError message={errors.description?.message} />
          </div>

          <div>
            <input type="text" placeholder="Endereço completo" {...register("address")} className={inputClass} />
            <FormError message={errors.address?.message} />
          </div>

          <div>
            <input type="text" placeholder="Oferta" {...register("offer")} className={inputClass} />
            <FormError message={errors.offer?.message} />
          </div>

          {/* Upload imagens */}
          <div>
            <label className="block mb-2 font-medium">Imagens do imóvel (até 10)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className={inputClass}
              required
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {previewImages.map((src, idx) => (
                <img key={idx} src={src} alt={`Preview ${idx}`} className="w-32 h-32 object-cover rounded" />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-950 text-white font-bold py-3 px-4 rounded hover:bg-blue-800 transition w-full"
          >
            {loading ? "Enviando..." : "Criar Imóvel"}
          </button>
        </form>
      </div>
    </div>
  );
}

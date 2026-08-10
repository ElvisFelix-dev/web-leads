// src/pages/Landing.jsx
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import api from "../service/api";

export default function Landing() {
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data) => {
    try {
      await api.post("/api/leads/public", data); // 🔥 rota pública sem `protect`
      toast.success("✅ Recebemos seus dados! Um corretor entrará em contato.");
      reset();
    } catch (error) {
      console.error(error);
      toast.error("❌ Erro ao enviar, tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-900 to-blue-700 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-lg w-full">
        <h1 className="text-3xl font-bold text-center text-blue-900 mb-4">
          Encontre seu imóvel ideal
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Preencha seus dados e um de nossos corretores entrará em contato para
          ajudar você a conquistar o seu novo lar 🏡
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            type="text"
            placeholder="Seu nome"
            {...register("name", { required: true })}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="email"
            placeholder="Seu e-mail"
            {...register("email", { required: true })}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="tel"
            placeholder="WhatsApp (com DDD)"
            {...register("phone", { required: true })}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          <select
            {...register("region", { required: true })}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecione a região</option>
            <option value="central">Central</option>
            <option value="zona oeste">Zona Oeste</option>
            <option value="zona leste">Zona Leste</option>
            <option value="zona sul">Zona Sul</option>
            <option value="zona norte">Zona Norte</option>
            <option value="abc">ABC</option>
          </select>

          <button
            type="submit"
            className="w-full bg-blue-900 text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition"
          >
            Quero ser contatado
          </button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-4">
          Seus dados estão seguros e serão usados apenas para contato.
        </p>
      </div>
    </div>
  );
}

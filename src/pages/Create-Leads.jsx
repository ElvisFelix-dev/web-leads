import { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../service/api";
import { UserContext } from "../context/UserContext";

const schema = yup.object().shape({
  name: yup.string().required("Nome é obrigatório"),
  email: yup.string().email("Email inválido").required("Email é obrigatório"),
  phone: yup.string().required("Telefone é obrigatório"),
  status: yup.string().oneOf(["novo", "em andamento", "convertido", "perdido"]),
  region: yup.string().nullable(),
  notes: yup.string().nullable(),
});

export default function CreateLead() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    if (!user) {
      toast.error("⚠️ Você precisa estar logado para criar um lead");
      return;
    }

    setLoading(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const payload = { ...data, createdBy: user._id };
      await api.post("/api/leads", payload, {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      });
      toast.success("✅ Lead criado com sucesso!");
      navigate("/leads-list");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Erro ao criar lead");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-200";

  const errorClass = "text-red-500 text-sm mt-1 flex items-center gap-1";

  return (
    <div className="sm:ml-64 min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">
          Criar Lead
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="font-medium mb-1 block">Nome <span className="text-red-500">*</span></label>
            <input type="text" placeholder="Nome do Lead" {...register("name")} className={inputClass} />
            {errors.name && <p className={errorClass}>⚠ {errors.name.message}</p>}
          </div>

          <div>
            <label className="font-medium mb-1 block">Email <span className="text-red-500">*</span></label>
            <input type="email" placeholder="Email" {...register("email")} className={inputClass} />
            {errors.email && <p className={errorClass}>⚠ {errors.email.message}</p>}
          </div>

          <div>
            <label className="font-medium mb-1 block">Telefone <span className="text-red-500">*</span></label>
            <input type="text" placeholder="Telefone" {...register("phone")} className={inputClass} />
            {errors.phone && <p className={errorClass}>⚠ {errors.phone.message}</p>}
          </div>

          <div>
            <label className="font-medium mb-1 block">Região</label>
            <select {...register("region")} className={inputClass}>
              <option value="">Selecione a região</option>
              <option value="central">Central</option>
              <option value="zona oeste">Zona Oeste</option>
              <option value="zona leste">Zona Leste</option>
              <option value="zona sul">Zona Sul</option>
              <option value="zona norte">Zona Norte</option>
              <option value="abc">ABC</option>
            </select>
          </div>

          <div>
            <label className="font-medium mb-1 block">Status</label>
            <select {...register("status")} className={inputClass}>
              <option value="novo">Novo</option>
              <option value="em andamento">Em Andamento</option>
              <option value="convertido">Convertido</option>
              <option value="perdido">Perdido</option>
            </select>
          </div>

          <div>
            <label className="font-medium mb-1 block">Observações</label>
            <textarea placeholder="Observações" {...register("notes")} className={`${inputClass} h-24`} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-900 text-white font-bold py-3 rounded hover:bg-blue-800 transition flex items-center justify-center gap-2 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Salvando..." : "Criar Lead"}
          </button>
        </form>
      </div>
    </div>
  );
}

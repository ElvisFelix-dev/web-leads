import React, { useState, useEffect } from "react";
import api from "../service/api";
import { toast } from "react-toastify";
import { AiOutlineEdit, AiOutlineClose, AiOutlineDelete } from "react-icons/ai";

export default function ManageProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProperty, setEditingProperty] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    address: "",
    region: "",
    images: [],
  });
  const [search, setSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [regionSearch, setRegionSearch] = useState("");
  const [previewImages, setPreviewImages] = useState([]);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem("userInfo"))?.token;
      const res = await api.get("/api/properties", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProperties(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar imóveis.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (property) => {
    setEditingProperty(property);
    setFormData({
      name: property.name || "",
      price: property.price || "",
      address: property.address || "",
      region: property.region || "",
      images: property.images || [],
    });
    setPreviewImages(property.images || []);
  };

  const handleCloseModal = () => {
    setEditingProperty(null);
    setFormData({ name: "", price: "", address: "", region: "", images: [] });
    setPreviewImages([]);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({ ...prev, images: files }));
    setPreviewImages(files.map((file) => URL.createObjectURL(file)));
  };

  const handleUpdate = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("userInfo"))?.token;
      const data = new FormData();
      data.append("name", formData.name);
      data.append("price", formData.price);
      data.append("address", formData.address);
      data.append("region", formData.region);
      formData.images.forEach((file) => data.append("images", file));

      const res = await api.put(`/api/properties/${editingProperty._id}`, data, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      setProperties((prev) =>
        prev.map((p) => (p._id === editingProperty._id ? res.data : p))
      );
      toast.success("Imóvel atualizado com sucesso!");
      handleCloseModal();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar imóvel.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja deletar este imóvel?")) return;
    try {
      const token = JSON.parse(localStorage.getItem("userInfo"))?.token;
      await api.delete(`/api/properties/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProperties((prev) => prev.filter((p) => p._id !== id));
      toast.success("Imóvel deletado!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao deletar imóvel.");
    }
  };

  const filteredProperties = properties.filter((p) => {
    const matchName = p.name.toLowerCase().includes(search.toLowerCase());
    const matchAddress = p.address.toLowerCase().includes(search.toLowerCase());
    const matchRegion = p.region?.toLowerCase().includes(regionSearch.toLowerCase());
    const matchMin = minPrice ? p.price >= Number(minPrice) : true;
    const matchMax = maxPrice ? p.price <= Number(maxPrice) : true;
    return (matchName || matchAddress) && matchRegion && matchMin && matchMax;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Carregando imóveis...</p>
      </div>
    );
  }

  return (
    <div className="sm:ml-64 p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-6 text-blue-950 dark:text-white">
        Gerenciar Imóveis Avançado
      </h1>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { placeholder: "Buscar por nome ou endereço", value: search, setter: setSearch },
          { placeholder: "Buscar por região", value: regionSearch, setter: setRegionSearch },
          { placeholder: "Preço mínimo", value: minPrice, setter: setMinPrice, type: "number" },
          { placeholder: "Preço máximo", value: maxPrice, setter: setMaxPrice, type: "number" },
        ].map((f, i) => (
          <input
            key={i}
            type={f.type || "text"}
            placeholder={f.placeholder}
            value={f.value}
            onChange={(e) => f.setter(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 px-3 py-2 rounded w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        ))}
      </div>

      {/* Lista de imóveis */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProperties.map((property) => (
          <div
            key={property._id}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow hover:shadow-lg transition flex flex-col justify-between"
          >
            <div>
              {property.images && property.images.length > 0 ? (
                <img
                  src={property.images[0]}
                  alt={property.name}
                  className="w-full h-40 object-cover rounded mb-2"
                />
              ) : (
                <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 rounded mb-2 flex items-center justify-center text-gray-500 dark:text-gray-300">
                  Sem imagem
                </div>
              )}
              <h2 className="text-xl font-bold mb-1 text-blue-950 dark:text-white">{property.name}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-1">
                Preço:{" "}
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(property.price)}
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-1">Endereço: {property.address}</p>
              <p className="text-gray-500 dark:text-gray-400 mb-1">Região: {property.region || "-"}</p>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => handleEditClick(property)}
                className="flex items-center gap-1 text-blue-950 dark:text-blue-400 hover:text-blue-700 transition"
              >
                <AiOutlineEdit size={20} /> Editar
              </button>
              <button
                onClick={() => handleDelete(property._id)}
                className="flex items-center gap-1 text-red-600 dark:text-red-400 hover:text-red-700 transition"
              >
                <AiOutlineDelete size={20} /> Deletar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de edição */}
      {editingProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 transition"
            >
              <AiOutlineClose size={24} />
            </button>
            <h2 className="text-xl font-bold mb-4 text-blue-950 dark:text-white">Editar Imóvel</h2>
            <div className="flex flex-col gap-3">
              {["name", "price", "address", "region"].map((field) => (
                <input
                  key={field}
                  type={field === "price" ? "number" : "text"}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  className="border border-gray-300 dark:border-gray-600 px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              ))}
              <input
                type="file"
                multiple
                onChange={handleImageChange}
                className="border border-gray-300 dark:border-gray-600 px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {previewImages.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded border dark:border-gray-600"
                  />
                ))}
              </div>
              <button
                onClick={handleUpdate}
                className="bg-blue-950 dark:bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800 transition mt-2"
              >
                Atualizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

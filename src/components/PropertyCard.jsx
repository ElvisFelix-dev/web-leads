import { MapPin } from "lucide-react";

export default function PropertyCard({ property }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      {/* Imagem do imóvel */}
      <img
        src={property.images?.[0] || "/fallback.jpg"}
        alt={property.title || "Imóvel"}
        className="w-full h-48 object-cover"
      />

      {/* Conteúdo */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {property.name || "Título não informado"}
        </h3>

        <p className="text-gray-600 mb-2">
          {property.description || "Sem descrição disponível"}
        </p>

        {/* Localização */}
        <div className="flex items-center gap-2 text-gray-700 mb-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span>
            {property.address
              ? property.address
              : property.location
              ? `${property.location.lat}, ${property.location.lng}`
              : "Localização não informada"}
          </span>
        </div>

        {/* Preço */}
        <p className="text-blue-600 font-bold text-lg">
          {property.price
            ? `R$ ${property.price.toLocaleString("pt-BR")}`
            : "Preço a consultar"}
        </p>
      </div>
    </div>
  );
}

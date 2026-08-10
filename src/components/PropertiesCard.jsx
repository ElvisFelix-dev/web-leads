import { Link } from "react-router-dom";

export default function PropertiesCard({ property }) {
  // Badge baseada na oferta
  const getBadge = (offer) => {
    if (!offer) return null;
    return { text: "Oferta", bg: "bg-red-600" };
  };

  const badge = getBadge(property.offer);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <div className="relative">
        <img
          src={property.images?.[0] || "https://via.placeholder.com/300x200"}
          alt={property.name}
          className="w-full h-48 object-cover"
        />
        {/* Badge sobre a imagem */}
        {badge && (
          <span
            className={`absolute top-0 left-0 m-2 text-white text-xs font-bold px-2 py-1 rounded-br-lg ${badge.bg}`}
          >
            {badge.text}
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{property.name}</h3>
        <p className="text-gray-600 text-sm mb-2">{property.address}</p>
        <p className="text-gray-800 font-bold mb-4">
          R$ {property.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </p>
        <Link
          to={`/property/${property._id}`}
          className="block text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
        >
          Ver detalhes
        </Link>
      </div>
    </div>
  );
}

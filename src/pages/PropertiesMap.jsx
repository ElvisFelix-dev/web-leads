import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../service/api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const propertyIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
});

export default function PropertiesMap() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [filters, setFilters] = useState({ region: "", bedrooms: "", parking: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchProperties = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/api/properties", { params: filters });
      setProperties(data);
    } catch (err) {
      console.error("Erro ao buscar imóveis:", err);
      setError("Não foi possível carregar os imóveis.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });
  const handleSearch = () => fetchProperties();

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Busca de Imóveis</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <select name="region" value={filters.region} onChange={handleChange} className="border p-2 rounded w-full">
          <option value="">Todas Regiões</option>
          <option value="central">Central</option>
          <option value="zona oeste">Zona Oeste</option>
          <option value="zona leste">Zona Leste</option>
          <option value="zona sul">Zona Sul</option>
          <option value="zona norte">Zona Norte</option>
          <option value="abc">ABC</option>
        </select>
        <input type="number" name="bedrooms" value={filters.bedrooms} placeholder="Dormitórios mínimos" onChange={handleChange} className="border p-2 rounded w-full" />
        <input type="number" name="parking" value={filters.parking} placeholder="Vagas mínimas" onChange={handleChange} className="border p-2 rounded w-full" />
        <button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full">Buscar</button>
      </div>

      {loading && <div className="flex justify-center items-center py-10"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {!loading && properties.length > 0 && (
        <div className="w-full h-[500px] md:h-[600px] rounded-lg overflow-hidden shadow">
          <MapContainer center={[-23.55, -46.63]} zoom={12} scrollWheelZoom className="w-full h-full">
            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {properties.map((property) => {
              const lat = property?.location?.lat || -23.55;
              const lng = property?.location?.lng || -46.63;

              return (
                <Marker key={property._id} position={[lat, lng]} icon={propertyIcon}>
                  <Popup>
                    <div className="w-48 space-y-1 cursor-pointer" onClick={() => navigate(`/property-detail/${property._id}`)}>
                      <img src={property.images[0]} alt={property.name} className="w-full h-24 object-cover rounded" />
                      <h2 className="font-bold">{property.name}</h2>
                      <p className="text-sm text-gray-600">{property.region}</p>
                      <p className="text-sm">{property.bedrooms} dorms • {property.parking} vagas</p>
                      <p className="text-green-600 font-semibold">R$ {property.price.toLocaleString()}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      )}

      {!loading && properties.length === 0 && !error && <p className="text-gray-500 text-center">Nenhum imóvel encontrado.</p>}
    </div>
  );
}

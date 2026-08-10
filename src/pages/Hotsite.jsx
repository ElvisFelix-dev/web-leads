import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../service/api";

import HeaderHotsite from "../components/HeaderHotsite";
import PropertiesSection from "../components/PropertiesSection";

export default function Hotsite() {
  const { name: slug } = useParams();
  const [corretor, setCorretor] = useState(null);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: corretorData } = await api.get(`/api/users/brokers/name/${slug}`);
        setCorretor(corretorData);

        const { data: propertiesData } = await api.get(`/api/properties?brokerId=${corretorData._id}`);
        setProperties(propertiesData);
      } catch (error) {
        console.error("Erro ao buscar dados do corretor:", error);
      }
    };
    fetchData();
  }, [slug]);

  if (!corretor) return <p className="p-6 text-gray-600">Carregando hotsite...</p>;

  // Agrupa propriedades por região
  const propertiesByRegion = properties.reduce((acc, prop) => {
    const region = prop.region || "Outros";
    if (!acc[region]) acc[region] = [];
    acc[region].push(prop);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderHotsite corretor={corretor} />
      {Object.keys(propertiesByRegion).map(region => (
        <PropertiesSection
          key={region}
          region={region}
          properties={propertiesByRegion[region]}
        />
      ))}
    </div>
  );
}

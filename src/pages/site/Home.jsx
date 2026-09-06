import { useEffect, useState } from 'react';

import Header from '../../components/site/Header';
import Footer from '../../components/site/Footer';

import HeroSearch from '../../components/site/HeroSearch';
import FeaturedProperties from '../../components/site/FeaturedProperties';
import PersonalizedService from '../../components/site/PersonalizedService';

import FinalCTA from '../../components/site/FinalCTA';

import { getProperties } from '../../service/propertyApi';
import { getPublicBrokers } from '../../service/brokerApi';

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // CARREGAR DADOS DA HOME
  // ==========================================

  const loadHomeData = async () => {
    try {
      setLoading(true);

      const [propertiesResponse, brokersResponse] = await Promise.all([
        getProperties(),
        getPublicBrokers(),
      ]);

      // ==========================================
      // DEBUG
      // ==========================================

      console.log('====================================');
      console.log('RESPOSTA IMÓVEIS:', propertiesResponse);
      console.log('RESPOSTA CORRETORES:', brokersResponse);
      console.log('====================================');

      // ==========================================
      // NORMALIZAR IMÓVEIS
      // ==========================================

      let propertyList = [];

      if (Array.isArray(propertiesResponse)) {
        propertyList = propertiesResponse;
      } else if (Array.isArray(propertiesResponse?.properties)) {
        propertyList = propertiesResponse.properties;
      } else if (Array.isArray(propertiesResponse?.data)) {
        propertyList = propertiesResponse.data;
      }

      // ==========================================
      // NORMALIZAR CORRETORES
      // ==========================================

      let brokerList = [];

      if (Array.isArray(brokersResponse)) {
        brokerList = brokersResponse;
      } else if (Array.isArray(brokersResponse?.brokers)) {
        brokerList = brokersResponse.brokers;
      } else if (Array.isArray(brokersResponse?.data)) {
        brokerList = brokersResponse.data;
      }

      console.log('====================================');
      console.log('IMÓVEIS PARA HOME:', propertyList);
      console.log('TOTAL IMÓVEIS:', propertyList.length);
      console.log('PRIMEIRO IMÓVEL:', propertyList[0] || null);
      console.log('====================================');

      console.log('====================================');
      console.log('CORRETORES PARA HOME:', brokerList);
      console.log('TOTAL CORRETORES:', brokerList.length);
      console.log('PRIMEIRO CORRETOR:', brokerList[0] || null);
      console.log('====================================');

      // ==========================================
      // SALVAR ESTADOS
      // ==========================================

      setProperties(propertyList);
      setBrokers(brokerList);
    } catch (error) {
      console.error('Erro ao carregar dados da Home:', error);

      setProperties([]);
      setBrokers([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // INIT
  // ==========================================

  useEffect(() => {
    loadHomeData();
  }, []);

  // ==========================================
  // IMÓVEIS EM DESTAQUE
  // ==========================================

  const featuredProperties = properties.slice(0, 6);

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />

      <main>
        {/* HERO */}
        <HeroSearch />

        {/* IMÓVEIS */}
        <FeaturedProperties properties={featuredProperties} loading={loading} />

        {/* ATENDIMENTO */}
        <PersonalizedService />

        {/* CTA */}
        <FinalCTA
          onContact={() => {
            // futuramente: página de contato
          }}
          onSearch={() => {
            window.scrollTo({
              top: 0,
              behavior: 'smooth',
            });
          }}
        />
      </main>

      <Footer />
    </div>
  );
}

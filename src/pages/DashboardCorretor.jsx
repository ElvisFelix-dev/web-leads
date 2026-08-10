import React, { useEffect, useState } from "react";
import LeadCard from "../components/LeadCard";
import axios from "axios";

export default function DashboardCorretor() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const token = JSON.parse(localStorage.getItem("userInfo"))?.token;
        if (!token) {
          setError("Você precisa estar logado.");
          setLoading(false);
          return;
        }

        const res = await axios.get("/api/leads", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const leadsArray = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.leads)
          ? res.data.leads
          : Object.values(res.data);

        setLeads(leadsArray);
      } catch (err) {
        console.error("Erro ao buscar leads:", err);
        setError("Não foi possível carregar os leads.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">Carregando leads...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );

  return (
    <div className="sm:ml-64 min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-950 dark:text-white">
        Meus Leads
      </h1>

      {leads.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">
          Nenhum lead recebido ainda.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {leads.map((lead) => (
            <LeadCard key={lead._id} lead={lead} />
          ))}
        </div>
      )}
    </div>
  );
}

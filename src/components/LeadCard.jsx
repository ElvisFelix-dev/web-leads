import React from "react";

const LeadCard = ({ lead }) => {
  return (
    <div className="border rounded-lg shadow p-4 flex flex-col gap-2">
      <h3 className="font-bold">{lead.name}</h3>
      <p>Email: {lead.email}</p>
      <p>Telefone: {lead.phone}</p>
      <p>Imóvel: {lead.property?.name}</p>
      <a
        href={lead.whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 bg-green-500 text-white p-2 rounded hover:bg-green-600 text-center"
      >
        Falar no WhatsApp
      </a>
    </div>
  );
};

export default LeadCard;

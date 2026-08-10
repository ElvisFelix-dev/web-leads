import { FaWhatsapp, FaPhone, FaEnvelope } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";
import slugify from "slugify";

export default function HeaderHotsite({ corretor }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Slug do corretor para usar nas rotas do hotsite
  const corretorSlug = slugify(corretor.name, { lower: true });

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        {/* Corretor */}
        <div className="flex items-center gap-3">
          {corretor.avatar ? (
            <img
              src={corretor.avatar}
              alt={corretor.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-bold">
              {corretor.name[0]}
            </div>
          )}
          <div>
            <h1 className="text-lg font-semibold">{corretor.name}</h1>
            <p className="text-sm text-gray-600">Consultor de Imóveis</p>
          </div>
        </div>

        {/* Menu desktop */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to={`/hotsite/${corretorSlug}#properties`} className="hover:underline">
            Imóveis
          </Link>

          {/* Botão WhatsApp */}
          {corretor.phone && (
            <a
              href={`https://wa.me/${corretor.phone.replace("+", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition"
            >
              <FaWhatsapp size={20} />
              WhatsApp
            </a>
          )}
          {corretor.email && (
            <a
              href={`mailto:${corretor.email}`}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition"
            >
              <FaEnvelope size={18} />
              E-mail
            </a>
          )}
        </nav>

        {/* Botão mobile */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden p-4 border-t border-gray-200">
          <nav className="flex flex-col space-y-2">
            <Link to={`/hotsite/${corretorSlug}#properties`} className="hover:underline">
              Imóveis
            </Link>

            {corretor.phone && (
              <a
                href={`https://wa.me/${corretor.phone.replace("+", "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition mt-2"
              >
                <FaWhatsapp size={20} />
                WhatsApp
              </a>
            )}
            {corretor.email && (
              <a
                href={`mailto:${corretor.email}`}
                className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition mt-2"
              >
                <FaEnvelope size={18} />
                E-mail
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

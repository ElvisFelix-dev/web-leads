import { useState } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { toast } from 'react-toastify';

import api from '../../service/api';

export default function ImportLeadsModal({ onClose, onSuccess }) {
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!file) {
      toast.warning('Selecione um arquivo CSV.');

      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append('csv', file);

      const { data } = await api.post('/api/leads/import/csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success(`${data.total} leads importados com sucesso!`);

      onSuccess();

      onClose();
    } catch (error) {
      console.error('Erro ao importar CSV:', error);

      toast.error(error.response?.data?.message || 'Erro ao importar CSV.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      toast.warning('Selecione somente arquivos CSV.');

      return;
    }

    setFile(selectedFile);
  };

  return (
    <div
      className="
      fixed
      inset-0
      bg-black/60
      flex
      items-center
      justify-center
      z-50
      p-4
    "
    >
      <div
        className="
        w-full
        max-w-md
        bg-slate-900
        border
        border-slate-800
        rounded-xl
        shadow-xl
        p-6
      "
      >
        {/* HEADER */}

        <div
          className="
          flex
          justify-between
          items-center
          mb-6
        "
        >
          <div
            className="
            flex
            items-center
            gap-3
          "
          >
            <div
              className="
              p-2
              rounded-lg
              bg-purple-500/10
            "
            >
              <Upload
                size={22}
                className="
                  text-purple-400
                "
              />
            </div>

            <h2
              className="
              text-xl
              font-semibold
              text-white
            "
            >
              Importar Leads
            </h2>
          </div>

          <button
            onClick={onClose}

            className="
              text-slate-400
              hover:text-white
              transition
            "
          >
            <X size={22} />
          </button>
        </div>

        {/* FILE */}

        <label
          className="
          flex
          flex-col
          items-center
          justify-center
          border-2
          border-dashed
          border-slate-700
          rounded-xl
          p-8
          cursor-pointer
          hover:border-purple-500
          transition
        "
        >
          <FileText
            size={36}
            className="
              text-slate-500
              mb-3
            "
          />

          <span
            className="
            text-slate-300
            text-sm
            text-center
          "
          >
            {file ? file.name : 'Clique para selecionar um CSV'}
          </span>

          <input
            type="file"

            accept=".csv"

            onChange={handleFileChange}

            className="
              hidden
            "
          />
        </label>

        {/* ACTIONS */}

        <div
          className="
          flex
          justify-end
          gap-3
          mt-6
        "
        >
          <button
            onClick={onClose}

            disabled={loading}

            className="
              px-4
              py-2
              rounded-lg
              bg-slate-800
              text-slate-300
              hover:bg-slate-700
            "
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}

            disabled={loading}

            className="
              px-4
              py-2
              rounded-lg
              bg-purple-600
              hover:bg-purple-700
              text-white
              disabled:opacity-50
            "
          >
            {loading ? 'Importando...' : 'Importar'}
          </button>
        </div>
      </div>
    </div>
  );
}

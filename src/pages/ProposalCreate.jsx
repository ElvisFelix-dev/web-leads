// src/pages/ProposalCreate.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  ArrowLeft,
  User,
  Building2,
  DollarSign,
  CreditCard,
  FileText,
  CalendarDays,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calculator,
  MapPin,
  BedDouble,
  Bath,
  Car,
  Ruler,
  Check,
  Eye,
  Percent,
  ChevronDown,
  Target,
} from 'lucide-react';

import { NumericFormat } from 'react-number-format';

import api from '../service/api';

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const normalizeText = (value) => {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

const getId = (item) => {
  if (!item) return '';

  if (typeof item === 'string') {
    return item;
  }

  return String(item._id || item.id || '');
};

const toNumber = (value) => {
  if (value === null || value === undefined || value === '') {
    return 0;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  let normalized = String(value)
    .trim()
    .replace(/\s/g, '')
    .replace(/[R$]/gi, '');

  if (!normalized) {
    return 0;
  }

  if (normalized.includes(',')) {
    normalized = normalized.replace(/\./g, '').replace(',', '.');
  }

  const number = Number(normalized);

  return Number.isFinite(number) ? number : 0;
};

const formatCurrency = (value) => {
  const number = toNumber(value);

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(number);
};

const formatInteger = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return '0';
  }

  return new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 0,
  }).format(number);
};

/*
|--------------------------------------------------------------------------
| VISIT HELPERS
|--------------------------------------------------------------------------
*/

const getVisitDate = (visit) => {
  if (!visit) return null;

  return (
    visit.finishedAt ||
    visit.completedAt ||
    visit.realizedAt ||
    visit.realizedDate ||
    visit.date ||
    visit.scheduledDate ||
    visit.visitDate ||
    visit.createdAt ||
    null
  );
};

const getDateValue = (date) => {
  if (!date) return 0;

  const timestamp = new Date(date).getTime();

  return Number.isFinite(timestamp) ? timestamp : 0;
};

const isCompletedVisit = (visit) => {
  const status = normalizeText(
    visit?.status || visit?.visitStatus || visit?.state,
  );

  return [
    'concluida',
    'completed',
    'realizada',
    'realizado',
    'done',
    'finalizada',
    'finalizado',
  ].includes(status);
};

const extractVisitProperty = (visit) => {
  if (!visit) return null;

  const property =
    visit?.propertyInfo ||
    visit?.property ||
    visit?.propertyData ||
    visit?.propertyDetails ||
    null;

  if (!property || typeof property !== 'object') {
    return null;
  }

  const id = property._id || property.id || null;

  if (!id) {
    return null;
  }

  const images = Array.isArray(property.images) ? property.images : [];

  const image =
    property.image ||
    property.mainImage ||
    property.coverImage ||
    images.find((item) => item?.isMain)?.url ||
    images.find((item) => item?.url)?.url ||
    images[0]?.url ||
    '';

  const price =
    property.price ??
    property.prices?.salePrice ??
    property.prices?.rentPrice ??
    property.salePrice ??
    property.value ??
    0;

  return {
    ...property,

    _id: id,
    id,

    name: property.name || property.title || property.propertyName || 'Imóvel',

    title: property.title || property.name || property.propertyName || 'Imóvel',

    code: property.code || property.reference || property.codigo || '',

    type: property.type || property.propertyType || '',

    purpose:
      property.purpose ||
      property.businessType ||
      property.transactionType ||
      '',

    price,

    image,
    mainImage: property.mainImage || image,
    coverImage: property.coverImage || image,

    images,

    address: property.address || null,

    fullAddress: property.fullAddress || property.formattedAddress || '',

    location: property.location || null,

    bedrooms: property.bedrooms ?? property.rooms ?? property.dormitories ?? 0,

    bathrooms: property.bathrooms ?? property.bathroomCount ?? 0,

    suites: property.suites ?? property.suiteCount ?? 0,

    parkingSpaces:
      property.parkingSpaces ?? property.parking ?? property.garages ?? 0,

    area:
      property.area ??
      property.totalArea ??
      property.privateArea ??
      property.builtArea ??
      0,

    builtArea: property.builtArea ?? property.area?.built ?? 0,

    privateArea: property.privateArea ?? property.area?.private ?? 0,
  };
};

/*
|--------------------------------------------------------------------------
| PROPERTY HELPERS
|--------------------------------------------------------------------------
*/

const getPropertyArea = (property) => {
  if (!property) return 0;

  const area =
    property.area ??
    property.privateArea ??
    property.builtArea ??
    property.totalArea ??
    0;

  if (typeof area === 'object') {
    return area.total ?? area.private ?? area.useful ?? area.built ?? 0;
  }

  return area;
};

const formatArea = (value) => {
  const number = toNumber(value);

  if (!number) return '-';

  return `${new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 2,
  }).format(number)} m²`;
};

const formatPropertyAddress = (property) => {
  if (!property) return '';

  if (typeof property.fullAddress === 'string' && property.fullAddress) {
    return property.fullAddress;
  }

  const address = property.address;

  if (typeof address === 'string') {
    return address;
  }

  if (address && typeof address === 'object') {
    const parts = [
      address.street || address.logradouro,
      address.number || address.numero,
      address.complement,
      address.neighborhood || address.bairro,
      address.city || address.cidade,
      address.state || address.uf,
    ].filter(Boolean);

    if (parts.length) {
      return parts.join(', ');
    }
  }

  if (property.location && typeof property.location === 'object') {
    const parts = [
      property.location.street,
      property.location.number,
      property.location.neighborhood,
      property.location.city,
      property.location.state,
    ].filter(Boolean);

    if (parts.length) {
      return parts.join(', ');
    }
  }

  return '';
};

const formatVisitDate = (date) => {
  if (!date) return '';

  const timestamp = new Date(date).getTime();

  if (!Number.isFinite(timestamp)) {
    return '';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(date));
};

/*
|--------------------------------------------------------------------------
| STAGE HELPERS
|--------------------------------------------------------------------------
*/

const formatStage = (stage) => {
  const stages = {
    nova: 'Nova',
    qualificacao: 'Qualificação',
    imovel_definido: 'Imóvel definido',
    visita_realizada: 'Visita realizada',
    interesse_confirmado: 'Interesse confirmado',
    proposta_solicitada: 'Proposta solicitada',
    proposta_enviada: 'Proposta enviada',
    negociacao: 'Negociação',
    ganha: 'Ganha',
    perdida: 'Perdida',
  };

  return stages[stage] || stage || '—';
};

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function ProposalCreate() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const leadId = searchParams.get('lead');
  const opportunityId = searchParams.get('opportunity');
  const propertyId = searchParams.get('property');

  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const [lead, setLead] = useState(null);
  const [opportunity, setOpportunity] = useState(null);

  const [properties, setProperties] = useState([]);
  const [visits, setVisits] = useState([]);

  const [loadingLead, setLoadingLead] = useState(true);
  const [loadingOpportunity, setLoadingOpportunity] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [loadingVisits, setLoadingVisits] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /*
   * IMPORTANTE:
   *
   * Valores monetários agora são NUMBER.
   *
   * Exemplo:
   *
   * propertyPrice: 650000
   * proposalPrice: 620000
   * downPayment: 100000
   *
   * A formatação R$ 650.000,00 fica somente
   * no componente NumericFormat.
   */

  const [form, setForm] = useState({
    property: '',
    propertyPrice: 0,
    proposalPrice: 0,
    downPayment: 0,
    financing: 0,
    fgts: 0,

    paymentMethod: 'financing',

    installments: 0,
    installmentValue: 0,

    validityDays: 7,

    clientMessage: '',
  });

  /*
  |--------------------------------------------------------------------------
  | LOAD LEAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!leadId) {
      setError('Lead não informado.');
      setLoadingLead(false);
      return;
    }

    let mounted = true;

    const loadLead = async () => {
      try {
        setLoadingLead(true);
        setError('');

        const response = await api.get(`/api/leads/${leadId}`);

        const data =
          response?.data?.lead ||
          response?.data?.data?.lead ||
          response?.data?.data ||
          response?.data;

        if (!mounted) return;

        if (!data) {
          setError('Lead não encontrado.');
          setLead(null);
          return;
        }

        setLead(data);

        /*
         * O imóvel do lead é apenas FALLBACK.
         */

        const propertyIdFromLead =
          data.property?._id ||
          data.property?.id ||
          (typeof data.property === 'string' ? data.property : '');

        const propertyPrice =
          data.property?.price ??
          data.propertySnapshot?.price ??
          data.propertyPrice ??
          0;

        if (propertyIdFromLead) {
          setForm((current) => ({
            ...current,
            property: propertyIdFromLead,
            propertyPrice: toNumber(propertyPrice),
          }));
        }
      } catch (err) {
        console.error('Erro ao carregar lead:', err);

        if (!mounted) return;

        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            'Não foi possível carregar as informações do lead.',
        );
      } finally {
        if (mounted) {
          setLoadingLead(false);
        }
      }
    };

    loadLead();

    return () => {
      mounted = false;
    };
  }, [leadId]);

  /*
  |--------------------------------------------------------------------------
  | LOAD OPPORTUNITY
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!opportunityId) return;

    let mounted = true;

    const loadOpportunity = async () => {
      try {
        setLoadingOpportunity(true);

        const response = await api.get(`/api/opportunities/${opportunityId}`);

        const data = response?.data?.data || response?.data || response;

        if (!mounted) return;

        if (data) {
          setOpportunity(data);

          // Se não tiver property selecionada e a oportunidade tem property
          if (!form.property && data.property?._id) {
            setForm((current) => ({
              ...current,
              property: data.property._id,
              propertyPrice: toNumber(
                data.expectedClosingValue || data.estimatedValue || 0,
              ),
              proposalPrice: toNumber(
                data.expectedClosingValue || data.estimatedValue || 0,
              ),
            }));
          }
        }
      } catch (err) {
        console.error('Erro ao carregar oportunidade:', err);
      } finally {
        if (mounted) {
          setLoadingOpportunity(false);
        }
      }
    };

    loadOpportunity();

    return () => {
      mounted = false;
    };
  }, [opportunityId]);

  /*
  |--------------------------------------------------------------------------
  | LOAD VISITS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!leadId) return;

    let mounted = true;

    const loadVisits = async () => {
      try {
        setLoadingVisits(true);

        const response = await api.get('/api/visits', {
          params: {
            page: 1,
            limit: 100,
          },
        });

        if (!mounted) return;

        const payload = response?.data;

        const list =
          payload?.data?.visits ||
          payload?.data?.items ||
          payload?.visits ||
          payload?.items ||
          payload?.data ||
          (Array.isArray(payload) ? payload : []);

        const normalizedList = Array.isArray(list) ? list : [];

        const currentLeadId = String(leadId);

        const leadVisits = normalizedList.filter((visit) => {
          const visitLeadId =
            visit?.leadInfo?.id ||
            visit?.leadInfo?._id ||
            visit?.lead?._id ||
            visit?.lead?.id ||
            visit?.leadId;

          return visitLeadId && String(visitLeadId) === currentLeadId;
        });

        setVisits(leadVisits);
      } catch (err) {
        console.error('Erro ao carregar visitas:', err);

        if (mounted) {
          setVisits([]);
        }
      } finally {
        if (mounted) {
          setLoadingVisits(false);
        }
      }
    };

    loadVisits();

    return () => {
      mounted = false;
    };
  }, [leadId]);

  /*
  |--------------------------------------------------------------------------
  | COMPLETED VISITS
  |--------------------------------------------------------------------------
  */

  const completedVisits = useMemo(() => {
    return visits
      .filter((visit) => {
        return isCompletedVisit(visit) && extractVisitProperty(visit);
      })
      .sort(
        (a, b) => getDateValue(getVisitDate(b)) - getDateValue(getVisitDate(a)),
      );
  }, [visits]);

  /*
  |--------------------------------------------------------------------------
  | VISITED PROPERTIES
  |--------------------------------------------------------------------------
  */

  const visitedProperties = useMemo(() => {
    const map = new Map();

    completedVisits.forEach((visit) => {
      const property = extractVisitProperty(visit);

      if (!property) return;

      const propertyId = getId(property);

      if (!propertyId) return;

      const visitDate = getVisitDate(visit);

      if (!map.has(propertyId)) {
        map.set(propertyId, {
          ...property,
          visitDate,
          visitCount: 1,
        });
      } else {
        const current = map.get(propertyId);

        map.set(propertyId, {
          ...current,
          visitCount: current.visitCount + 1,
        });
      }
    });

    return Array.from(map.values());
  }, [completedVisits]);

  /*
  |--------------------------------------------------------------------------
  | LATEST COMPLETED VISIT
  |--------------------------------------------------------------------------
  */

  const latestCompletedVisit = useMemo(() => {
    return completedVisits[0] || null;
  }, [completedVisits]);

  /*
  |--------------------------------------------------------------------------
  | VISITED PROPERTY IDS
  |--------------------------------------------------------------------------
  */

  const visitedPropertyIds = useMemo(() => {
    return new Set(
      visitedProperties.map((property) => String(getId(property))),
    );
  }, [visitedProperties]);

  /*
  |--------------------------------------------------------------------------
  | AUTO SELECTION
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (loadingVisits) return;

    /*
     * VÁRIOS IMÓVEIS VISITADOS
     */

    if (visitedProperties.length > 1) {
      setForm((current) => {
        const currentProperty = String(current.property || '');

        if (visitedPropertyIds.has(currentProperty)) {
          return current;
        }

        return {
          ...current,
          property: '',
          propertyPrice: 0,
          proposalPrice: 0,
        };
      });

      return;
    }

    /*
     * UM ÚNICO IMÓVEL VISITADO
     */

    if (visitedProperties.length === 1) {
      const property = visitedProperties[0];
      const propertyId = getId(property);

      if (!propertyId) return;

      setForm((current) => {
        const sameProperty =
          String(current.property || '') === String(propertyId);

        return {
          ...current,

          property: propertyId,

          propertyPrice: toNumber(property.price),

          ...(sameProperty ? {} : { proposalPrice: 0 }),
        };
      });

      return;
    }

    /*
     * NENHUMA VISITA:
     *
     * Mantém o imóvel do lead como fallback.
     */
  }, [loadingVisits, visitedProperties, visitedPropertyIds]);

  /*
  |--------------------------------------------------------------------------
  | LOAD PROPERTIES
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (loadingVisits) return;

    /*
     * Se já existem imóveis visitados,
     * não precisamos carregar a lista geral.
     */

    if (visitedProperties.length > 0) {
      setLoadingProperties(false);
      return;
    }

    if (!lead) return;

    let mounted = true;

    const loadProperties = async () => {
      try {
        setLoadingProperties(true);

        const response = await api.get('/api/properties', {
          params: {
            page: 1,
            limit: 100,
          },
        });

        if (!mounted) return;

        const data = response?.data;

        const list =
          data?.properties ||
          data?.data?.properties ||
          data?.data ||
          data?.results ||
          (Array.isArray(data) ? data : []);

        setProperties(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Erro ao carregar imóveis:', err);

        if (mounted) {
          setProperties([]);
        }
      } finally {
        if (mounted) {
          setLoadingProperties(false);
        }
      }
    };

    loadProperties();

    return () => {
      mounted = false;
    };
  }, [lead, loadingVisits, visitedProperties.length]);

  /*
  |--------------------------------------------------------------------------
  | PROPERTY FROM LEAD
  |--------------------------------------------------------------------------
  */

  const leadProperty = useMemo(() => {
    if (!lead?.property) {
      return null;
    }

    if (typeof lead.property === 'object') {
      return lead.property;
    }

    return (
      properties.find(
        (property) =>
          String(property._id || property.id) === String(lead.property),
      ) || null
    );
  }, [lead, properties]);

  /*
  |--------------------------------------------------------------------------
  | SELECTABLE PROPERTIES
  |--------------------------------------------------------------------------
  */

  const selectableProperties = useMemo(() => {
    if (visitedProperties.length > 0) {
      return visitedProperties;
    }

    const map = new Map();

    if (leadProperty) {
      const id = getId(leadProperty);

      if (id) {
        map.set(id, {
          ...leadProperty,
          _id: id,
          id,
          visitDate: null,
          visitCount: 0,
        });
      }
    }

    properties.forEach((property) => {
      const id = getId(property);

      if (!id) return;

      if (!map.has(id)) {
        map.set(id, {
          ...property,
          _id: id,
          id,
          visitDate: null,
          visitCount: 0,
        });
      }
    });

    return Array.from(map.values());
  }, [visitedProperties, leadProperty, properties]);

  /*
  |--------------------------------------------------------------------------
  | SELECTED PROPERTY
  |--------------------------------------------------------------------------
  */

  const selectedProperty = useMemo(() => {
    if (!form.property) {
      return null;
    }

    return (
      selectableProperties.find(
        (property) => String(getId(property)) === String(form.property),
      ) || null
    );
  }, [selectableProperties, form.property]);

  /*
  |--------------------------------------------------------------------------
  | SELECTED VISIT INFO
  |--------------------------------------------------------------------------
  */

  const selectedVisitDate = useMemo(() => {
    if (!selectedProperty) {
      return null;
    }

    const propertyId = String(getId(selectedProperty));

    const matchingVisit = completedVisits.find((visit) => {
      const property = extractVisitProperty(visit);

      return property && String(getId(property)) === propertyId;
    });

    return matchingVisit ? getVisitDate(matchingVisit) : null;
  }, [selectedProperty, completedVisits]);

  /*
  |--------------------------------------------------------------------------
  | FORM CHANGE
  |--------------------------------------------------------------------------
  */

  const handleChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError('');
    setSuccess('');
  };

  /*
  |--------------------------------------------------------------------------
  | MONEY CHANGE
  |--------------------------------------------------------------------------
  |
  | NumericFormat já retorna floatValue.
  |
  | Exemplo:
  *
  * R$ 650.000,00
  *
  * retorna:
  *
  * 650000
  *
  */

  const handleMoneyChange = (field, value) => {
    handleChange(field, value ?? 0);
  };

  /*
  |--------------------------------------------------------------------------
  | INTEGER CHANGE
  |--------------------------------------------------------------------------
  */

  const handleIntegerChange = (field, value) => {
    handleChange(field, value ?? 0);
  };

  /*
  |--------------------------------------------------------------------------
  | PROPERTY CHANGE
  |--------------------------------------------------------------------------
  */

  const handlePropertyChange = (value) => {
    const property = selectableProperties.find(
      (item) => String(getId(item)) === String(value),
    );

    if (!property) {
      setForm((current) => ({
        ...current,
        property: '',
        propertyPrice: 0,
        proposalPrice: 0,
      }));

      return;
    }

    setForm((current) => ({
      ...current,

      property: getId(property),

      propertyPrice: toNumber(property.price),

      proposalPrice: 0,
    }));

    setError('');
    setSuccess('');
  };

  /*
  |--------------------------------------------------------------------------
  | CALCULATIONS
  |--------------------------------------------------------------------------
  */

  const calculations = useMemo(() => {
    const propertyPrice = Number(form.propertyPrice) || 0;

    const proposalPrice = Number(form.proposalPrice) || 0;

    const downPayment = Number(form.downPayment) || 0;

    const financing = Number(form.financing) || 0;

    const fgts = Number(form.fgts) || 0;

    const totalPayment = downPayment + financing + fgts;

    const balance = Math.max(proposalPrice - totalPayment, 0);

    const discount =
      propertyPrice > 0 && proposalPrice > 0
        ? Math.max(propertyPrice - proposalPrice, 0)
        : 0;

    const discountPercentage =
      propertyPrice > 0 && discount > 0 ? (discount / propertyPrice) * 100 : 0;

    const paymentPercentage =
      proposalPrice > 0
        ? Math.min((totalPayment / proposalPrice) * 100, 100)
        : 0;

    return {
      propertyPrice,
      proposalPrice,
      downPayment,
      financing,
      fgts,

      totalPayment,

      balance,

      discount,

      discountPercentage,

      paymentPercentage,
    };
  }, [
    form.propertyPrice,
    form.proposalPrice,
    form.downPayment,
    form.financing,
    form.fgts,
  ]);

  /*
  |--------------------------------------------------------------------------
  | VALIDATION
  |--------------------------------------------------------------------------
  */

  const validateForm = () => {
    if (!lead?._id && !lead?.id) {
      return 'Lead não encontrado.';
    }

    if (!form.property) {
      if (visitedProperties.length > 1) {
        return 'Selecione qual imóvel visitado será utilizado para esta proposta.';
      }

      return 'Selecione o imóvel da proposta.';
    }

    if (calculations.propertyPrice <= 0) {
      return 'Informe o valor do imóvel.';
    }

    if (calculations.proposalPrice <= 0) {
      return 'Informe o valor da proposta.';
    }

    if (calculations.downPayment < 0) {
      return 'O valor da entrada não pode ser negativo.';
    }

    if (calculations.financing < 0) {
      return 'O valor do financiamento não pode ser negativo.';
    }

    if (calculations.fgts < 0) {
      return 'O valor do FGTS não pode ser negativo.';
    }

    if (calculations.totalPayment > calculations.proposalPrice) {
      return (
        'A soma da entrada, financiamento e FGTS ' +
        'não pode ser maior que o valor da proposta.'
      );
    }

    const validityDays = Number(form.validityDays) || 0;

    if (!validityDays || validityDays < 1) {
      return 'Informe a validade da proposta.';
    }

    const installments = Number(form.installments) || 0;

    if (installments < 0) {
      return 'O número de parcelas não pode ser negativo.';
    }

    if (Number(form.installmentValue) < 0) {
      return 'O valor da parcela não pode ser negativo.';
    }

    return null;
  };

  /*
  |--------------------------------------------------------------------------
  | BUILD PAYLOAD
  |--------------------------------------------------------------------------
  */

  const buildPayload = () => {
    return {
      lead: lead._id || lead.id,

      opportunity: opportunity?._id || null,

      /*
       * ESTE É O IMÓVEL ESCOLHIDO PELO CORRETOR.
       */
      property: form.property,

      values: {
        propertyPrice: calculations.propertyPrice,

        proposalPrice: calculations.proposalPrice,

        downPayment: calculations.downPayment,

        financing: calculations.financing,

        fgts: calculations.fgts,
      },

      paymentMethod: form.paymentMethod,

      installments: Number(form.installments) || 0,

      installmentValue: Number(form.installmentValue) || 0,

      validityDays: Number(form.validityDays) || 7,

      clientMessage: form.clientMessage?.trim() || '',
    };
  };

  /*
  |--------------------------------------------------------------------------
  | CREATE PROPOSAL
  |--------------------------------------------------------------------------
  */

  const createProposal = async () => {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return null;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = buildPayload();

      console.log('📄 Criando proposta...', payload);

      const response = await api.post('/api/proposals', payload);

      const data = response?.data;

      console.log('✅ Proposta criada:', data);

      const proposal =
        data?.proposal || data?.data?.proposal || data?.data || data;

      const proposalId = proposal?._id || proposal?.id;

      if (!proposalId) {
        throw new Error(
          'A proposta foi criada, mas o servidor não retornou o ID da proposta.',
        );
      }

      const normalizedProposal = {
        ...proposal,
        _id: proposalId,
      };

      setSuccess('Proposta criada com sucesso.');

      return normalizedProposal;
    } catch (err) {
      console.error('❌ Erro ao criar proposta:', err);

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Não foi possível criar a proposta.';

      setError(message);

      return null;
    } finally {
      setSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE
  |--------------------------------------------------------------------------
  */

  const handleSave = async () => {
    const proposal = await createProposal();

    if (!proposal) {
      return;
    }

    setTimeout(() => {
      navigate(`/proposals/${proposal._id}`);
    }, 500);
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loadingLead) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Loader2 size={32} className="animate-spin text-blue-500" />

          <p>Carregando informações do lead...</p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | NO LEAD
  |--------------------------------------------------------------------------
  */

  if (!lead) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="
              flex
              items-center
              gap-2
              text-slate-400
              hover:text-white
              mb-6
              transition
            "
          >
            <ArrowLeft size={18} />
            Voltar
          </button>

          <div
            className="
              bg-slate-900
              border
              border-red-500/20
              rounded-2xl
              p-8
            "
          >
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle size={22} />

              <p>{error || 'Lead não encontrado.'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}

        <div
          className="
            flex
            flex-col
            lg:flex-row
            lg:items-center
            lg:justify-between
            gap-4
          "
        >
          <div>
            <button
              onClick={() => navigate(-1)}
              className="
                flex
                items-center
                gap-2
                text-slate-400
                hover:text-white
                transition
                mb-4
              "
            >
              <ArrowLeft size={18} />
              Voltar
            </button>

            <div className="flex items-center gap-3">
              <div
                className="
                  w-12
                  h-12
                  rounded-xl
                  bg-blue-500/10
                  border
                  border-blue-500/20
                  flex
                  items-center
                  justify-center
                "
              >
                <FileText size={24} className="text-blue-400" />
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  Nova Proposta
                </h1>

                <p className="text-slate-400 text-sm mt-1">
                  Crie uma nova proposta comercial para este lead.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={saving}
              className="
                flex
                items-center
                justify-center
                gap-2
                px-4
                py-2.5
                rounded-xl
                border
                border-slate-700
                bg-slate-900
                hover:bg-slate-800
                text-slate-200
                transition
                disabled:opacity-50
              "
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="
                flex
                items-center
                justify-center
                gap-2
                px-5
                py-2.5
                rounded-xl
                bg-blue-600
                hover:bg-blue-500
                text-white
                font-medium
                transition
                disabled:opacity-50
              "
            >
              {saving ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}
              Criar proposta
            </button>
          </div>
        </div>

        {/* ALERT */}

        {error && (
          <div
            className="
              flex
              items-start
              gap-3
              bg-red-500/10
              border
              border-red-500/20
              rounded-xl
              p-4
              text-red-300
            "
          >
            <AlertCircle size={20} className="mt-0.5 shrink-0" />

            <p className="text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div
            className="
              flex
              items-center
              gap-3
              bg-emerald-500/10
              border
              border-emerald-500/20
              rounded-xl
              p-4
              text-emerald-300
            "
          >
            <CheckCircle2 size={20} />

            <p className="text-sm">{success}</p>
          </div>
        )}

        {/* LEAD */}

        <Card title="Lead" icon={<User size={18} />}>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            <Info label="Nome" value={lead.name} />

            <Info label="Email" value={lead.email} />

            <Info label="Telefone" value={lead.phone} />

            <Info
              label="Responsável"
              value={
                lead.assignedTo?.name || lead.broker?.name || 'Não atribuído'
              }
            />
          </div>
        </Card>

        {/* OPPORTUNITY - NOVO */}

        {opportunity && (
          <Card title="Oportunidade vinculada" icon={<Target size={18} />}>
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                  <Target size={18} className="text-indigo-400" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white">
                    {opportunity.title || 'Oportunidade'}
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-400">
                    <span>
                      Estágio:{' '}
                      <span className="text-slate-300">
                        {formatStage(opportunity.stage)}
                      </span>
                    </span>

                    <span>
                      Valor:{' '}
                      <span className="text-emerald-400">
                        {formatCurrency(
                          opportunity.expectedClosingValue ||
                            opportunity.estimatedValue,
                        )}
                      </span>
                    </span>

                    {opportunity.probability !== undefined && (
                      <span>
                        Probabilidade:{' '}
                        <span className="text-blue-400">
                          {opportunity.probability}%
                        </span>
                      </span>
                    )}
                  </div>

                  {opportunity.description && (
                    <p className="mt-2 text-xs text-slate-500 line-clamp-2">
                      {opportunity.description}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/opportunities/${opportunity._id}`)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition shrink-0"
                >
                  Ver oportunidade
                </button>
              </div>
            </div>
          </Card>
        )}

        {/* PROPERTY */}

        <Card title="Imóvel da proposta" icon={<Building2 size={18} />}>
          {/* LOADING VISITS */}

          {loadingVisits && (
            <div
              className="
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-slate-800
                bg-slate-950
                p-5
                text-slate-400
              "
            >
              <Loader2 size={18} className="animate-spin text-blue-400" />

              <span className="text-sm">Verificando imóveis visitados...</span>
            </div>
          )}

          {/* MULTIPLE VISITED PROPERTIES */}

          {!loadingVisits && visitedProperties.length > 1 && (
            <div className="space-y-5">
              <div
                className="
                  rounded-xl
                  border
                  border-blue-500/20
                  bg-blue-500/5
                  p-4
                "
              >
                <div className="flex items-start gap-3">
                  <div
                    className="
                      w-9
                      h-9
                      rounded-lg
                      bg-blue-500/10
                      flex
                      items-center
                      justify-center
                      shrink-0
                    "
                  >
                    <Building2 size={18} className="text-blue-400" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-blue-300">
                      O lead visitou {visitedProperties.length} imóveis
                    </p>

                    <p className="text-xs text-slate-400 mt-1">
                      Selecione o imóvel para o qual deseja registrar esta
                      proposta.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {visitedProperties.map((property) => {
                  const propertyId = getId(property);

                  const isSelected =
                    String(form.property) === String(propertyId);

                  return (
                    <VisitedPropertyCard
                      key={propertyId}
                      property={property}
                      selected={isSelected}
                      onSelect={() => handlePropertyChange(propertyId)}
                    />
                  );
                })}
              </div>

              {!selectedProperty && (
                <div
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    border
                    border-amber-500/20
                    bg-amber-500/5
                    p-4
                    text-amber-300
                  "
                >
                  <AlertCircle size={18} />

                  <p className="text-sm">
                    Selecione um imóvel acima para continuar com a proposta.
                  </p>
                </div>
              )}

              {selectedProperty && (
                <div
                  className="
                    rounded-xl
                    border
                    border-emerald-500/20
                    bg-emerald-500/5
                    p-4
                  "
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={17} className="text-emerald-400" />

                    <p className="text-sm text-emerald-300">
                      Imóvel selecionado para a proposta
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-white mt-1">
                    {selectedProperty.title ||
                      selectedProperty.name ||
                      'Imóvel'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ONE VISITED PROPERTY */}

          {!loadingVisits && visitedProperties.length === 1 && (
            <PropertyPreview
              property={selectedProperty || visitedProperties[0]}
              visited
              visitDate={selectedVisitDate}
              visitCount={visitedProperties[0]?.visitCount || 1}
            />
          )}

          {/* NO COMPLETED VISITS */}

          {!loadingVisits && visitedProperties.length === 0 && (
            <div className="space-y-5">
              <div
                className="
                  rounded-xl
                  border
                  border-slate-800
                  bg-slate-950
                  p-4
                "
              >
                <div className="flex items-start gap-3">
                  <div
                    className="
                      w-9
                      h-9
                      rounded-lg
                      bg-slate-800
                      flex
                      items-center
                      justify-center
                      shrink-0
                    "
                  >
                    <Building2 size={18} className="text-slate-400" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-300">
                      Nenhuma visita concluída
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      O imóvel abaixo é baseado no interesse registrado no lead.
                      Você também pode selecionar outro imóvel.
                    </p>
                  </div>
                </div>
              </div>

              {selectedProperty ? (
                <PropertyPreview property={selectedProperty} visited={false} />
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-300">Selecione o imóvel</p>

                    <p className="text-xs text-slate-500 mt-1">
                      Escolha o imóvel que será utilizado na proposta.
                    </p>
                  </div>

                  <PropertySelector
                    value={form.property}
                    properties={selectableProperties}
                    loading={loadingProperties}
                    onChange={handlePropertyChange}
                  />

                  {!loadingProperties && selectableProperties.length === 0 && (
                    <p className="text-sm text-slate-500">
                      Nenhum imóvel disponível para seleção.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* SELECTOR WHEN THERE ARE NO VISITS BUT PROPERTY EXISTS */}

          {!loadingVisits &&
            visitedProperties.length === 0 &&
            selectedProperty && (
              <div className="mt-5">
                <PropertySelector
                  value={form.property}
                  properties={selectableProperties}
                  loading={loadingProperties}
                  onChange={handlePropertyChange}
                />
              </div>
            )}
        </Card>

        {/* VALUES */}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card title="Valores da proposta" icon={<DollarSign size={18} />}>
              <div className="grid md:grid-cols-2 gap-5">
                <MoneyInput
                  label="Valor do imóvel"
                  value={form.propertyPrice}
                  onChange={(value) =>
                    handleMoneyChange('propertyPrice', value)
                  }
                  disabled={!!selectedProperty}
                />

                <MoneyInput
                  label="Valor da proposta"
                  value={form.proposalPrice}
                  onChange={(value) =>
                    handleMoneyChange('proposalPrice', value)
                  }
                  required
                />

                <MoneyInput
                  label="Entrada"
                  value={form.downPayment}
                  onChange={(value) => handleMoneyChange('downPayment', value)}
                />

                <MoneyInput
                  label="Financiamento"
                  value={form.financing}
                  onChange={(value) => handleMoneyChange('financing', value)}
                />

                <MoneyInput
                  label="FGTS"
                  value={form.fgts}
                  onChange={(value) => handleMoneyChange('fgts', value)}
                />
              </div>

              {/* PAYMENT PROGRESS */}

              {calculations.proposalPrice > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">
                      Composição do pagamento
                    </span>

                    <span className="text-xs font-medium text-slate-300">
                      {calculations.paymentPercentage.toFixed(0)}%
                    </span>
                  </div>

                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="
                        h-full
                        bg-blue-500
                        rounded-full
                        transition-all
                      "
                      style={{
                        width: `${calculations.paymentPercentage}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* SUMMARY */}

          <Card title="Resumo financeiro" icon={<Calculator size={18} />}>
            <div className="space-y-4">
              <SummaryRow
                label="Valor do imóvel"
                value={formatCurrency(calculations.propertyPrice)}
              />

              <SummaryRow
                label="Valor da proposta"
                value={formatCurrency(calculations.proposalPrice)}
                highlight
              />

              <SummaryRow
                label="Entrada"
                value={formatCurrency(calculations.downPayment)}
              />

              <SummaryRow
                label="Financiamento"
                value={formatCurrency(calculations.financing)}
              />

              <SummaryRow
                label="FGTS"
                value={formatCurrency(calculations.fgts)}
              />

              <SummaryRow
                label="Total composto"
                value={formatCurrency(calculations.totalPayment)}
              />

              <div className="border-t border-slate-800 pt-4">
                <SummaryRow
                  label="Saldo restante"
                  value={formatCurrency(calculations.balance)}
                  highlight
                />
              </div>

              {calculations.discount > 0 && (
                <div
                  className="
                    bg-amber-500/10
                    border
                    border-amber-500/20
                    rounded-xl
                    p-3
                  "
                >
                  <div className="flex items-center gap-2">
                    <Percent size={14} className="text-amber-400" />

                    <p className="text-xs text-amber-400">
                      Desconto solicitado
                    </p>
                  </div>

                  <p className="text-sm text-amber-300 font-medium mt-1">
                    {formatCurrency(calculations.discount)} (
                    {calculations.discountPercentage.toFixed(2)}
                    %)
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* PAYMENT */}

        <Card title="Condições de pagamento" icon={<CreditCard size={18} />}>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            <SelectField
              label="Forma de pagamento"
              value={form.paymentMethod}
              onChange={(value) => handleChange('paymentMethod', value)}
              options={[
                {
                  value: 'financing',
                  label: 'Financiamento',
                },
                {
                  value: 'cash',
                  label: 'À vista',
                },
                {
                  value: 'fgts',
                  label: 'FGTS',
                },
                {
                  value: 'mixed',
                  label: 'Misto',
                },
              ]}
            />

            <IntegerInput
              label="Parcelas"
              value={form.installments}
              onChange={(value) => handleIntegerChange('installments', value)}
              placeholder="Ex: 360"
            />

            <MoneyInput
              label="Valor da parcela"
              value={form.installmentValue}
              onChange={(value) => handleMoneyChange('installmentValue', value)}
            />

            <IntegerInput
              label="Validade (dias)"
              value={form.validityDays}
              onChange={(value) => handleIntegerChange('validityDays', value)}
              placeholder="Ex: 7"
            />
          </div>
        </Card>

        {/* MESSAGE */}

        <Card title="Mensagem para o cliente" icon={<FileText size={18} />}>
          <textarea
            value={form.clientMessage}
            onChange={(event) =>
              handleChange('clientMessage', event.target.value)
            }
            rows={5}
            placeholder="Digite uma mensagem ou observação que será apresentada ao cliente..."
            className="
              w-full
              bg-slate-950
              border
              border-slate-700
              rounded-xl
              px-4
              py-3
              text-white
              placeholder:text-slate-600
              outline-none
              focus:border-blue-500
              focus:ring-1
              focus:ring-blue-500/30
              resize-none
              transition
            "
          />

          <div className="flex items-center gap-2 mt-3 text-xs text-slate-500">
            <CalendarDays size={14} />
            Esta proposta terá validade de{' '}
            <strong className="text-slate-300">
              {Number(form.validityDays) || 0} dias
            </strong>
            .
          </div>
        </Card>

        {/* FOOTER */}

        <div
          className="
            flex
            flex-col-reverse
            sm:flex-row
            sm:justify-end
            gap-3
            border-t
            border-slate-800
            pt-6
          "
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={saving}
            className="
              px-5
              py-3
              rounded-xl
              border
              border-slate-700
              text-slate-300
              hover:bg-slate-900
              transition
              disabled:opacity-50
            "
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="
              flex
              items-center
              justify-center
              gap-2
              px-6
              py-3
              rounded-xl
              bg-blue-600
              hover:bg-blue-500
              font-semibold
              transition
              disabled:opacity-50
            "
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}
            Criar proposta
          </button>
        </div>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| CARD
|--------------------------------------------------------------------------
*/

function Card({ title, icon, children }) {
  return (
    <section
      className="
        bg-slate-900
        border
        border-slate-800
        rounded-2xl
        shadow-lg
        p-5
        md:p-6
      "
    >
      <div className="flex items-center gap-2 mb-6">
        {icon && <div className="text-blue-400">{icon}</div>}

        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>

      {children}
    </section>
  );
}

/*
|--------------------------------------------------------------------------
| INFO
|--------------------------------------------------------------------------
*/

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-500 mb-1">{label}</p>

      <p className="text-sm text-slate-200 font-medium truncate">
        {value || '-'}
      </p>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| INPUT
|--------------------------------------------------------------------------
*/

function Input({ label, value, onChange, placeholder, inputMode = 'text' }) {
  return (
    <div>
      <label className="block text-sm text-slate-300 mb-2">{label}</label>

      <input
        type="text"
        inputMode={inputMode}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full
          bg-slate-950
          border
          border-slate-700
          rounded-xl
          px-4
          py-3
          text-white
          placeholder:text-slate-600
          outline-none
          focus:border-blue-500
          focus:ring-1
          focus:ring-blue-500/30
          transition
        "
      />
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| INTEGER INPUT
|--------------------------------------------------------------------------
|
| Também usamos NumericFormat aqui para:
|
| 360
| 1.000
| 7
|
| O estado continua sendo NUMBER.
|
*/

function IntegerInput({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
}) {
  return (
    <div>
      <label className="block text-sm text-slate-300 mb-2">{label}</label>

      <NumericFormat
        value={value ?? 0}
        thousandSeparator="."
        decimalSeparator=","
        decimalScale={0}
        allowNegative={false}
        allowLeadingZeros={false}
        inputMode="numeric"
        disabled={disabled}
        placeholder={placeholder}
        onValueChange={(values) => {
          onChange(values.floatValue ?? 0);
        }}
        className="
          w-full
          bg-slate-950
          border
          border-slate-700
          rounded-xl
          px-4
          py-3
          text-white
          placeholder:text-slate-600
          outline-none
          focus:border-blue-500
          focus:ring-1
          focus:ring-blue-500/30
          disabled:opacity-50
          disabled:cursor-not-allowed
          transition
        "
      />
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| MONEY INPUT
|--------------------------------------------------------------------------
*/

function MoneyInput({
  label,
  value,
  onChange,
  disabled = false,
  required = false,
}) {
  return (
    <div>
      <label className="block text-sm text-slate-300 mb-2">
        {label}

        {required && <span className="text-red-400 ml-1">*</span>}
      </label>

      <div className="relative">
        <span
          className="
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            text-slate-500
            text-sm
            pointer-events-none
            z-10
          "
        >
          R$
        </span>

        <NumericFormat
          value={value ?? 0}
          thousandSeparator="."
          decimalSeparator=","
          decimalScale={2}
          fixedDecimalScale
          allowNegative={false}
          allowLeadingZeros={false}
          inputMode="decimal"
          disabled={disabled}
          placeholder="0,00"
          onValueChange={(values) => {
            onChange(values.floatValue ?? 0);
          }}
          className="
            w-full
            bg-slate-950
            border
            border-slate-700
            rounded-xl
            pl-11
            pr-4
            py-3
            text-white
            placeholder:text-slate-600
            outline-none
            focus:border-blue-500
            focus:ring-1
            focus:ring-blue-500/30
            disabled:opacity-50
            disabled:cursor-not-allowed
            transition
          "
        />
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| SELECT
|--------------------------------------------------------------------------
*/

function SelectField({ label, value, onChange, options = [] }) {
  return (
    <div>
      <label className="block text-sm text-slate-300 mb-2">{label}</label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="
          w-full
          bg-slate-950
          border
          border-slate-700
          rounded-xl
          px-4
          py-3
          text-white
          outline-none
          focus:border-blue-500
          focus:ring-1
          focus:ring-blue-500/30
          transition
        "
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| PROPERTY SELECTOR
|--------------------------------------------------------------------------
*/

function PropertySelector({
  value,
  properties = [],
  loading = false,
  onChange,
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={loading}
        className="
          appearance-none
          w-full
          bg-slate-950
          border
          border-slate-700
          rounded-xl
          px-4
          py-3
          pr-11
          text-white
          outline-none
          focus:border-blue-500
          focus:ring-1
          focus:ring-blue-500/30
          transition
          disabled:opacity-50
        "
      >
        <option value="">
          {loading ? 'Carregando imóveis...' : 'Selecione um imóvel'}
        </option>

        {properties.map((property) => (
          <option key={getId(property)} value={getId(property)}>
            {property.code ? `${property.code} - ` : ''}
            {property.title || property.name || 'Imóvel'}
          </option>
        ))}
      </select>

      <ChevronDown
        size={17}
        className="
          absolute
          right-4
          top-1/2
          -translate-y-1/2
          text-slate-500
          pointer-events-none
        "
      />
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| VISITED PROPERTY CARD
|--------------------------------------------------------------------------
*/

function VisitedPropertyCard({ property, selected = false, onSelect }) {
  const image =
    property?.image || property?.mainImage || property?.coverImage || '';

  const address = formatPropertyAddress(property);

  const area = getPropertyArea(property);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`
        group
        text-left
        w-full
        rounded-2xl
        border
        overflow-hidden
        transition
        ${
          selected
            ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/30'
            : 'border-slate-800 bg-slate-950 hover:border-slate-600'
        }
      `}
    >
      <div className="relative h-44 bg-slate-900">
        {image ? (
          <img
            src={image}
            alt={property.title || property.name || 'Imóvel'}
            className="
              absolute
              inset-0
              w-full
              h-full
              object-cover
              transition
              group-hover:scale-[1.02]
            "
          />
        ) : (
          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              text-slate-700
            "
          >
            <Building2 size={48} />
          </div>
        )}

        <div
          className="
            absolute
            top-3
            left-3
            flex
            items-center
            gap-1.5
            px-2.5
            py-1.5
            rounded-lg
            bg-emerald-500/90
            text-white
            text-xs
            font-semibold
            shadow-lg
          "
        >
          <Check size={13} />
          Visitado
        </div>

        {selected && (
          <div
            className="
              absolute
              top-3
              right-3
              w-8
              h-8
              rounded-full
              bg-blue-600
              flex
              items-center
              justify-center
              shadow-lg
            "
          >
            <Check size={17} />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {property.code && (
              <span
                className="
                  inline-flex
                  text-[11px]
                  font-medium
                  text-blue-400
                  bg-blue-500/10
                  border
                  border-blue-500/20
                  px-2
                  py-1
                  rounded-md
                  mb-2
                "
              >
                {property.code}
              </span>
            )}

            <h3 className="text-base font-semibold text-white truncate">
              {property.title || property.name || 'Imóvel'}
            </h3>
          </div>

          <div className="text-right shrink-0">
            <p className="text-[10px] text-slate-500">Valor</p>

            <p className="text-sm font-bold text-emerald-400">
              {formatCurrency(property.price)}
            </p>
          </div>
        </div>

        {address && (
          <div className="flex items-start gap-2 mt-3 text-xs text-slate-400">
            <MapPin size={14} className="mt-0.5 shrink-0" />

            <span className="line-clamp-2">{address}</span>
          </div>
        )}

        <div
          className="
            flex
            flex-wrap
            items-center
            gap-x-4
            gap-y-2
            mt-4
            pt-4
            border-t
            border-slate-800
          "
        >
          {property.bedrooms > 0 && (
            <PropertyStat
              icon={<BedDouble size={14} />}
              value={property.bedrooms}
              label="quartos"
            />
          )}

          {property.suites > 0 && (
            <PropertyStat
              icon={<Building2 size={14} />}
              value={property.suites}
              label="suítes"
            />
          )}

          {property.parkingSpaces > 0 && (
            <PropertyStat
              icon={<Car size={14} />}
              value={property.parkingSpaces}
              label="vagas"
            />
          )}

          {area > 0 && (
            <PropertyStat
              icon={<Ruler size={14} />}
              value={formatArea(area)}
              label=""
            />
          )}
        </div>

        {property.visitDate && (
          <div className="flex items-center gap-2 mt-4 text-xs text-emerald-400">
            <Eye size={13} />

            <span>
              Última visita:{' '}
              <strong>{formatVisitDate(property.visitDate)}</strong>
            </span>
          </div>
        )}

        {property.visitCount > 1 && (
          <div className="mt-2 text-[11px] text-slate-500">
            Visitado {property.visitCount} vezes
          </div>
        )}

        <div
          className={`
            mt-4
            text-center
            text-xs
            font-semibold
            rounded-lg
            py-2
            transition
            ${
              selected
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'
            }
          `}
        >
          {selected ? '✓ Imóvel selecionado' : 'Selecionar imóvel'}
        </div>
      </div>
    </button>
  );
}

/*
|--------------------------------------------------------------------------
| PROPERTY PREVIEW
|--------------------------------------------------------------------------
*/

function PropertyPreview({
  property,
  visited = false,
  visitDate = null,
  visitCount = 1,
}) {
  const image =
    property?.image || property?.mainImage || property?.coverImage || '';

  const address = formatPropertyAddress(property);

  const area = getPropertyArea(property);

  return (
    <div
      className="
        rounded-2xl
        border
        border-slate-800
        bg-slate-950
        overflow-hidden
      "
    >
      <div className="grid lg:grid-cols-[220px_1fr]">
        {/* IMAGE */}

        <div className="relative bg-slate-900 min-h-[180px]">
          {image ? (
            <img
              src={image}
              alt={property.title || property.name || 'Imóvel'}
              className="
                absolute
                inset-0
                w-full
                h-full
                object-cover
              "
            />
          ) : (
            <div
              className="
                absolute
                inset-0
                flex
                items-center
                justify-center
                text-slate-700
              "
            >
              <Building2 size={48} />
            </div>
          )}

          {visited && (
            <div
              className="
                absolute
                top-3
                left-3
                flex
                items-center
                gap-1.5
                px-2.5
                py-1.5
                rounded-lg
                bg-emerald-500/90
                text-white
                text-xs
                font-semibold
                shadow-lg
              "
            >
              <Check size={13} />
              Visita realizada
            </div>
          )}
        </div>

        {/* CONTENT */}

        <div className="p-5 md:p-6">
          <div
            className="
              flex
              flex-col
              md:flex-row
              md:items-start
              md:justify-between
              gap-4
            "
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                {property.code && (
                  <span
                    className="
                      text-xs
                      font-medium
                      text-blue-400
                      bg-blue-500/10
                      border
                      border-blue-500/20
                      px-2
                      py-1
                      rounded-md
                    "
                  >
                    {property.code}
                  </span>
                )}

                {visited && (
                  <span
                    className="
                      text-xs
                      text-emerald-400
                      bg-emerald-500/10
                      border
                      border-emerald-500/20
                      px-2
                      py-1
                      rounded-md
                    "
                  >
                    Imóvel visitado
                  </span>
                )}
              </div>

              <h3 className="text-xl font-semibold text-white">
                {property.title || property.name || 'Imóvel'}
              </h3>

              {address && (
                <div className="flex items-start gap-2 mt-2 text-sm text-slate-400">
                  <MapPin size={15} className="mt-0.5 shrink-0" />

                  <span>{address}</span>
                </div>
              )}
            </div>

            <div className="md:text-right">
              <p className="text-xs text-slate-500">Valor atual</p>

              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {formatCurrency(property.price)}
              </p>
            </div>
          </div>

          {/* STATS */}

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-x-6
              gap-y-3
              mt-5
              pt-5
              border-t
              border-slate-800
            "
          >
            {property.bedrooms > 0 && (
              <PropertyStat
                icon={<BedDouble size={15} />}
                value={property.bedrooms}
                label="quartos"
              />
            )}

            {property.bathrooms > 0 && (
              <PropertyStat
                icon={<Bath size={15} />}
                value={property.bathrooms}
                label="banheiros"
              />
            )}

            {property.suites > 0 && (
              <PropertyStat
                icon={<Building2 size={15} />}
                value={property.suites}
                label="suítes"
              />
            )}

            {property.parkingSpaces > 0 && (
              <PropertyStat
                icon={<Car size={15} />}
                value={property.parkingSpaces}
                label="vagas"
              />
            )}

            {area > 0 && (
              <PropertyStat
                icon={<Ruler size={15} />}
                value={formatArea(area)}
                label=""
              />
            )}
          </div>

          {/* VISIT INFO */}

          {visited && visitDate && (
            <div
              className="
                flex
                flex-wrap
                items-center
                gap-2
                mt-4
                text-xs
                text-emerald-400
              "
            >
              <Eye size={14} />

              <span>
                Visita realizada em{' '}
                <strong>{formatVisitDate(visitDate)}</strong>
              </span>

              {visitCount > 1 && (
                <span className="text-slate-500">• {visitCount} visitas</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| PROPERTY STAT
|--------------------------------------------------------------------------
*/

function PropertyStat({ icon, value, label }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-400">
      <span className="text-slate-500">{icon}</span>

      <span className="text-slate-200 font-medium">{value}</span>

      {label && <span>{label}</span>}
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| SUMMARY ROW
|--------------------------------------------------------------------------
*/

function SummaryRow({ label, value, highlight = false }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-400">{label}</span>

      <span
        className={
          highlight
            ? 'text-sm font-semibold text-emerald-400'
            : 'text-sm font-medium text-slate-200'
        }
      >
        {value}
      </span>
    </div>
  );
}

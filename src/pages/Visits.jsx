
import { useEffect, useState } from 'react'

import {
  FaCalendarAlt,
  FaList,
  FaPlus,
  FaClock,
  FaCheckCircle,
} from 'react-icons/fa'


import {
  getVisits,
  createVisit,
} from '../service/visitApi'


import {
  getLeads,
} from '../service/leadApi'


import {
  getProperties,
} from '../service/propertyApi'


import VisitList from '../components/visits/VisitList'
import VisitModal from '../components/visits/VisitModal'
import VisitFilters from '../components/visits/VisitFilters'
import VisitCalendar from '../components/visits/VisitCalendar'



export default function Visits() {


  const [visits,setVisits] = useState([])

  const [leads,setLeads] = useState([])

  const [properties,setProperties] = useState([])


  const [loading,setLoading] = useState(true)

  const [showModal,setShowModal] = useState(false)

  const [selectedVisit,setSelectedVisit] = useState(null)


  const [viewMode,setViewMode] = useState('list')


  const [filters,setFilters] = useState({

    status:'',
    date:'',
    search:'',

  })



  // ===============================
  // Carregar dados
  // ===============================

  const loadData = async()=>{
    try {

      setLoading(true)


      const [
        visitsData,
        leadsData,
        propertiesData,
      ] = await Promise.all([

        getVisits(filters),

        getLeads(),

        getProperties(),

      ])


      console.log("VISITAS:", visitsData)


      setVisits(
        visitsData.visits || []
      )


      setLeads(
        leadsData || []
      )


      setProperties(
        propertiesData || []
      )


    } catch(error){

      console.error(
        'Erro ao carregar visitas:',
        error
      )

    } finally {

      setLoading(false)

    }

  }



  useEffect(()=>{

    loadData()

  },[filters])





  // ===============================
  // Modal
  // ===============================


  const handleCreate = ()=>{

    setSelectedVisit(null)

    setShowModal(true)

  }



  const handleEdit = (visit)=>{

    setSelectedVisit(visit)

    setShowModal(true)

  }



  // =====================================
  // Fechar modal
  // =====================================

  const handleCloseModal = () => {

    setSelectedVisit(null)

    setShowModal(false)

  }



  const handleSuccess = async (data) => {
    try {

      console.log('DADOS ENVIADOS PARA API:', data)

      const response = await createVisit(data)

      console.log('RESPOSTA API:', response)

      handleCloseModal()

      loadData()

    } catch(error) {

      console.error(
        'ERRO AO CRIAR VISITA:',
        error.response?.data || error.message
      )

    }
  }




  // ===============================
  // Estatísticas
  // ===============================


  const totalVisits = visits.length


  const confirmedVisits =
    visits.filter(
      visit=>visit.status === 'confirmada'
    ).length


  const pendingVisits =
    visits.filter(
      visit=>visit.status === 'agendada'
    ).length





  return (

    <div className="
      min-h-screen
      p-4
      sm:p-6
      lg:p-8
      space-y-8
      bg-gray-950
      text-white
    ">



      {/* HEADER */}

      <div className="
        flex
        flex-col
        lg:flex-row
        lg:items-center
        lg:justify-between
        gap-5
      ">


        <div>


          <h1 className="
            text-3xl
            font-bold
            flex
            items-center
            gap-3
          ">

            <FaCalendarAlt className="text-blue-500"/>

            Agenda de Visitas

          </h1>


          <p className="
            text-gray-400
            mt-2
          ">

            Gerencie visitas, clientes e imóveis.

          </p>


        </div>




        <button

          onClick={handleCreate}

          className="
            flex
            items-center
            justify-center
            gap-2
            px-6
            py-3
            rounded-xl
            bg-blue-600
            hover:bg-blue-700
            transition
            shadow-lg
            shadow-blue-600/20
          "

        >

          <FaPlus/>

          Nova visita

        </button>


      </div>





      {/* CARDS */}

      <div className="
        grid
        grid-cols-1
        md:grid-cols-3
        gap-5
      ">


        <div className="
          bg-gray-900
          border
          border-gray-800
          rounded-2xl
          p-5
        ">

          <div className="flex justify-between">

            <span className="text-gray-400">
              Total
            </span>


            <FaCalendarAlt
              className="text-blue-500"
            />

          </div>


          <h2 className="text-3xl font-bold mt-3">

            {totalVisits}

          </h2>


        </div>





        <div className="
          bg-gray-900
          border
          border-gray-800
          rounded-2xl
          p-5
        ">


          <div className="flex justify-between">


            <span className="text-gray-400">
              Confirmadas
            </span>


            <FaCheckCircle
              className="text-green-500"
            />


          </div>


          <h2 className="text-3xl font-bold mt-3">

            {confirmedVisits}

          </h2>


        </div>





        <div className="
          bg-gray-900
          border
          border-gray-800
          rounded-2xl
          p-5
        ">


          <div className="flex justify-between">


            <span className="text-gray-400">
              Pendentes
            </span>


            <FaClock
              className="text-yellow-500"
            />


          </div>


          <h2 className="text-3xl font-bold mt-3">

            {pendingVisits}

          </h2>


        </div>



      </div>






      {/* FILTROS */}

      <VisitFilters

        filters={filters}

        setFilters={setFilters}

      />






      {/* VISUALIZAÇÃO */}

      <div className="
        bg-gray-900
        border
        border-gray-800
        rounded-2xl
        p-6
      ">


        <div className="
          flex
          gap-3
          mb-6
        ">


          <button

            onClick={()=>setViewMode('list')}

            className={`
              flex
              items-center
              gap-2
              px-4
              py-2
              rounded-lg
              ${
                viewMode==='list'
                ?
                'bg-blue-600'
                :
                'bg-gray-800'
              }
            `}

          >

            <FaList/>

            Lista

          </button>




          <button

            onClick={()=>setViewMode('calendar')}

            className={`
              flex
              items-center
              gap-2
              px-4
              py-2
              rounded-lg
              ${
                viewMode==='calendar'
                ?
                'bg-blue-600'
                :
                'bg-gray-800'
              }
            `}

          >

            <FaCalendarAlt/>

            Calendário

          </button>



        </div>





        {
          loading

          ?

          <div className="
            text-center
            py-20
            text-gray-400
          ">

            Carregando visitas...

          </div>


          :


          viewMode === 'list'


          ?

          <VisitList

            visits={visits}

            onEdit={handleEdit}

            onRefresh={loadData}

          />


          :


          <VisitCalendar

            visits={visits}

            onSelect={handleEdit}

          />


        }


      </div>







      <VisitModal

      open={showModal}

      visit={selectedVisit}

      leads={leads}

      properties={properties}

      onClose={handleCloseModal}

      onSuccess={handleSuccess}

    />



    </div>

  )

}

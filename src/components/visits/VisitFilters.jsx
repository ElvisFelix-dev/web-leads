import {
  Search,
  Calendar,
  Filter,
  RotateCcw,
  ArrowDownUp,
} from 'lucide-react'


export default function VisitFilters({
  filters,
  setFilters,
  onClear,
}) {


  const handleChange = (
    field,
    value
  ) => {

    setFilters((prev)=>({
      ...prev,
      [field]: value,
    }))

  }



  const clearFilters = ()=>{

    if(onClear){
      onClear()
      return
    }


    setFilters({

      search:'',
      status:'',
      startDate:'',
      endDate:'',
      order:'asc',

    })

  }



  const hasFilters =
    filters.search ||
    filters.status ||
    filters.startDate ||
    filters.endDate





  return (

    <div
      className="
        bg-gradient-to-br
        from-gray-900
        to-gray-950
        border
        border-gray-800
        rounded-3xl
        p-6
        shadow-xl
      "
    >


      {/* HEADER */}

      <div
        className="
          flex
          items-center
          justify-between
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
              rounded-xl
              bg-blue-500/10
            "
          >

            <Filter
              size={20}
              className="text-blue-400"
            />

          </div>


          <div>

            <h2
              className="
                text-white
                font-semibold
              "
            >
              Filtros de visitas
            </h2>


            <p
              className="
                text-xs
                text-gray-500
              "
            >
              Pesquise e organize sua agenda
            </p>


          </div>


        </div>



        {
          hasFilters && (

            <span
              className="
                text-xs
                px-3
                py-1
                rounded-full
                bg-blue-500/10
                text-blue-400
                border
                border-blue-500/20
              "
            >

              Filtros ativos

            </span>

          )
        }


      </div>






      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-6
          gap-5
        "
      >





        {/* BUSCA */}


        <div
          className="
            xl:col-span-2
            space-y-2
          "
        >

          <label
            className="
              text-xs
              text-gray-400
            "
          >
            Cliente
          </label>



          <div
            className="
              relative
            "
          >

            <Search
              size={18}
              className="
                absolute
                left-3
                top-3
                text-gray-500
              "
            />


            <input

              type="text"

              placeholder="Nome do cliente..."

              value={
                filters.search || ''
              }


              onChange={(e)=>
                handleChange(
                  'search',
                  e.target.value
                )
              }


              className="
                w-full
                pl-10
                pr-4
                py-2.5
                rounded-xl
                bg-gray-800
                border
                border-gray-700
                text-white
                placeholder:text-gray-500
                transition
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500/40
              "

            />

          </div>

        </div>








        {/* STATUS */}


        <div
          className="
            space-y-2
          "
        >

          <label
            className="
              text-xs
              text-gray-400
            "
          >
            Status
          </label>


          <select

            value={
              filters.status || ''
            }


            onChange={(e)=>
              handleChange(
                'status',
                e.target.value
              )
            }


            className="
              w-full
              bg-gray-800
              border
              border-gray-700
              rounded-xl
              px-3
              py-2.5
              text-white
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500/40
            "

          >

            <option value="">
              Todos
            </option>


            <option value="agendada">
              Agendada
            </option>


            <option value="confirmada">
              Confirmada
            </option>


            <option value="realizada">
              Realizada
            </option>


            <option value="cancelada">
              Cancelada
            </option>


            <option value="nao_compareceu">
              Não compareceu
            </option>


          </select>


        </div>








        {/* DATA INICIAL */}


        <div
          className="
            space-y-2
          "
        >

          <label
            className="
              text-xs
              text-gray-400
            "
          >
            De
          </label>


          <div
            className="
              relative
            "
          >

            <Calendar
              size={18}
              className="
                absolute
                left-3
                top-3
                text-gray-500
              "
            />


            <input

              type="date"

              value={
                filters.startDate || ''
              }


              onChange={(e)=>
                handleChange(
                  'startDate',
                  e.target.value
                )
              }


              className="
                w-full
                pl-10
                py-2.5
                rounded-xl
                bg-gray-800
                border
                border-gray-700
                text-white
              "

            />


          </div>


        </div>









        {/* DATA FINAL */}


        <div
          className="
            space-y-2
          "
        >

          <label
            className="
              text-xs
              text-gray-400
            "
          >
            Até
          </label>


          <div
            className="
              relative
            "
          >

            <Calendar
              size={18}
              className="
                absolute
                left-3
                top-3
                text-gray-500
              "
            />


            <input

              type="date"


              value={
                filters.endDate || ''
              }


              onChange={(e)=>
                handleChange(
                  'endDate',
                  e.target.value
                )
              }


              className="
                w-full
                pl-10
                py-2.5
                rounded-xl
                bg-gray-800
                border
                border-gray-700
                text-white
              "

            />


          </div>


        </div>









        {/* ORDENAÇÃO */}


        <div
          className="
            space-y-2
          "
        >

          <label
            className="
              text-xs
              text-gray-400
            "
          >
            Ordenação
          </label>


          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <ArrowDownUp
              size={18}
              className="text-gray-500"
            />


            <select

              value={
                filters.order || 'asc'
              }


              onChange={(e)=>
                handleChange(
                  'order',
                  e.target.value
                )
              }


              className="
                flex-1
                bg-gray-800
                border
                border-gray-700
                rounded-xl
                px-3
                py-2.5
                text-white
              "

            >

              <option value="asc">
                Mais próximas
              </option>


              <option value="desc">
                Mais recentes
              </option>


            </select>


          </div>


        </div>







      </div>






      {/* BOTÃO LIMPAR */}


      <div
        className="
          mt-6
          flex
          justify-end
        "
      >

        <button

          onClick={clearFilters}


          className="
            flex
            items-center
            gap-2
            px-5
            py-2.5
            rounded-xl
            bg-red-600/20
            border
            border-red-500/30
            text-red-400
            hover:bg-red-600
            hover:text-white
            transition
          "

        >

          <RotateCcw
            size={18}
          />

          Limpar filtros

        </button>


      </div>



    </div>

  )
}

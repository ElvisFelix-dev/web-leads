import { useMemo, useState } from 'react'

import {
  FaChevronLeft,
  FaChevronRight,
  FaCalendarDay,
} from 'react-icons/fa'


const statusColors = {
  agendada: 'bg-blue-400',
  confirmada: 'bg-green-400',
  realizada: 'bg-purple-400',
  cancelada: 'bg-red-400',
  nao_compareceu: 'bg-yellow-400',
}


const statusLabels = {
  agendada: 'Agendada',
  confirmada: 'Confirmada',
  realizada: 'Realizada',
  cancelada: 'Cancelada',
  nao_compareceu: 'Não compareceu',
}



export default function VisitCalendar({
  visits = [],
  onSelectDate,
}) {


  const [currentDate, setCurrentDate] =
    useState(new Date())


  const [selectedDate, setSelectedDate] =
    useState(new Date())



  const month =
    currentDate.getMonth()


  const year =
    currentDate.getFullYear()



  const firstDay =
    new Date(year, month, 1)


  const lastDay =
    new Date(year, month + 1, 0)



  const daysInMonth =
    lastDay.getDate()


  const startWeekDay =
    firstDay.getDay()



  // Agrupar visitas por dia

  const visitsByDay = useMemo(() => {

    const map = {}

    visits.forEach((visit)=>{

      if(!visit.date)
        return


      const key =
        new Date(visit.date)
        .toDateString()


      if(!map[key]){
        map[key] = []
      }


      map[key].push(visit)

    })


    return map

  },[visits])



  const changeMonth = (direction)=>{

    setCurrentDate(
      new Date(
        year,
        month + direction,
        1
      )
    )

  }



  const goToday = ()=>{

    const today = new Date()

    setCurrentDate(today)

    setSelectedDate(today)

  }



  const handleSelectDate = (date)=>{

    setSelectedDate(date)

    onSelectDate?.(date)

  }



  const monthName =
    currentDate.toLocaleString(
      'pt-BR',
      {
        month:'long',
        year:'numeric'
      }
    )



  const weekDays = [
    'Dom',
    'Seg',
    'Ter',
    'Qua',
    'Qui',
    'Sex',
    'Sáb'
  ]



  const cells = []



  for(
    let i = 0;
    i < startWeekDay;
    i++
  ){
    cells.push(null)
  }



  for(
    let day = 1;
    day <= daysInMonth;
    day++
  ){

    cells.push(
      new Date(
        year,
        month,
        day
      )
    )

  }



  return (

    <div
      className="
        bg-gray-900
        border
        border-gray-800
        rounded-2xl
        p-6
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

        <button
          onClick={()=>changeMonth(-1)}
          className="
            p-3
            rounded-xl
            bg-gray-800
            hover:bg-gray-700
          "
        >

          <FaChevronLeft/>

        </button>



        <div className="text-center">


          <h2
            className="
              text-xl
              font-bold
              capitalize
            "
          >

            {monthName}

          </h2>



          <button
            onClick={goToday}
            className="
              mt-2
              text-xs
              text-blue-400
              hover:text-blue-300
              flex
              items-center
              gap-2
              mx-auto
            "
          >

            <FaCalendarDay/>

            Hoje

          </button>


        </div>



        <button
          onClick={()=>changeMonth(1)}
          className="
            p-3
            rounded-xl
            bg-gray-800
            hover:bg-gray-700
          "
        >

          <FaChevronRight/>

        </button>


      </div>





      {/* SEMANA */}

      <div
        className="
          grid
          grid-cols-7
          gap-2
          mb-3
        "
      >

        {
          weekDays.map(day=>(

            <div
              key={day}
              className="
                text-center
                text-sm
                text-gray-500
                font-semibold
              "
            >

              {day}

            </div>

          ))
        }


      </div>





      {/* CALENDARIO */}


      <div
        className="
          grid
          grid-cols-7
          gap-2
        "
      >

      {
        cells.map((date,index)=>{


          if(!date){

            return (
              <div
                key={index}
              />
            )

          }



          const key =
            date.toDateString()



          const dayVisits =
            visitsByDay[key] || []



          const isToday =
            key === new Date()
              .toDateString()



          const isSelected =
            selectedDate
              ?.toDateString() === key



          return (

            <div
              key={key}
              className="relative group"
            >

              <button

                onClick={()=>
                  handleSelectDate(date)
                }

                className={`
                  w-full
                  h-20
                  rounded-xl
                  flex
                  flex-col
                  items-center
                  justify-center
                  transition
                  border

                  ${
                    isSelected
                    ?
                    'border-blue-500 bg-blue-600/20'
                    :
                    'border-transparent bg-gray-800'
                  }

                  ${
                    isToday
                    ?
                    'ring-2 ring-blue-500'
                    :
                    ''
                  }

                  hover:bg-gray-700
                `}
              >


                <span
                  className="
                    text-white
                    font-semibold
                  "
                >

                  {date.getDate()}

                </span>



                {
                  dayVisits.length > 0 && (

                    <>

                      <span
                        className="
                          text-xs
                          text-gray-400
                          mt-1
                        "
                      >

                        {dayVisits.length}
                        {' '}
                        visita(s)

                      </span>



                      <div
                        className="
                          flex
                          gap-1
                          mt-1
                        "
                      >

                      {
                        [
                          ...new Set(
                            dayVisits.map(
                              v=>v.status
                            )
                          )
                        ]
                        .map(status=>(

                          <span
                            key={status}
                            className={`
                              w-2
                              h-2
                              rounded-full
                              ${statusColors[status]}
                            `}
                          />

                        ))
                      }

                      </div>


                    </>

                  )
                }


              </button>



              {/* TOOLTIP */}

              {
                dayVisits.length > 0 && (

                  <div
                    className="
                      hidden
                      group-hover:block
                      absolute
                      z-20
                      left-1/2
                      -translate-x-1/2
                      top-full
                      mt-2
                      w-64
                      bg-gray-950
                      border
                      border-gray-700
                      rounded-xl
                      p-4
                      shadow-xl
                    "
                  >

                  {
                    dayVisits.map(visit=>(

                      <div
                        key={visit._id}
                        className="
                          mb-3
                          last:mb-0
                        "
                      >

                        <p
                          className="
                            text-white
                            font-medium
                          "
                        >
                          {visit.lead?.name}
                        </p>


                        <p
                          className="
                            text-xs
                            text-gray-400
                          "
                        >

                          {visit.property?.name}

                        </p>


                        <span
                          className="
                            text-xs
                            text-blue-400
                          "
                        >

                          {statusLabels[visit.status]}

                        </span>


                      </div>

                    ))
                  }

                  </div>

                )
              }


            </div>

          )

        })
      }

      </div>





      {/* LEGENDA */}

      <div
        className="
          mt-6
          pt-5
          border-t
          border-gray-800
          flex
          flex-wrap
          gap-4
        "
      >

      {
        Object.entries(statusColors)
        .map(([status,color])=>(

          <div
            key={status}
            className="
              flex
              items-center
              gap-2
              text-xs
              text-gray-400
            "
          >

            <span
              className={`
                w-3
                h-3
                rounded-full
                ${color}
              `}
            />

            {statusLabels[status]}

          </div>

        ))
      }


      </div>


    </div>

  )

}

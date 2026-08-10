import {
  FaCalendarAlt,
  FaUser,
  FaHome,
  FaPhone,
  FaClock,
} from 'react-icons/fa'


export default function BrokerNextVisits({
  visits = [],
}) {


  const statusConfig = {
    agendada: {
      label: 'Agendada',
      style: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    },

    confirmada: {
      label: 'Confirmada',
      style: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    },

    realizada: {
      label: 'Realizada',
      style: 'bg-green-500/10 text-green-400 border-green-500/20',
    },

    cancelada: {
      label: 'Cancelada',
      style: 'bg-red-500/10 text-red-400 border-red-500/20',
    },
  }



  const orderedVisits = [...visits]

    .sort(
      (a,b)=>
        new Date(a.visitDate) -
        new Date(b.visitDate)
    )

    .slice(0,3)



  return (

    <div
      className="
        bg-gray-900
        rounded-2xl
        border
        border-gray-800
        p-6
        shadow-xl
      "
    >


      <div
        className="
          flex
          items-center
          justify-between
          mb-6
        "
      >

        <div>

          <h2
            className="
              text-xl
              font-semibold
              text-white
            "
          >
            Próximas visitas
          </h2>


          <p
            className="
              text-sm
              text-gray-400
              mt-1
            "
          >
            Agenda comercial
          </p>

        </div>



        <div
          className="
            px-3
            py-1
            rounded-full
            bg-blue-500/10
            text-blue-400
            text-sm
            border
            border-blue-500/20
          "
        >

          {orderedVisits.length}

        </div>


      </div>





      {
        orderedVisits.length === 0 ? (

          <div
            className="
              py-12
              text-center
              text-gray-500
            "
          >

            Nenhuma visita agendada.

          </div>


        ) : (


          <div
            className="
              space-y-4
            "
          >


            {
              orderedVisits.map((visit)=>(


                <div

                  key={visit._id}

                  className="
                    group
                    bg-gray-800/50
                    rounded-2xl
                    p-5
                    border
                    border-gray-700
                    hover:border-blue-500/40
                    transition-all
                    duration-300
                    hover:shadow-lg
                  "

                >



                  <div
                    className="
                      flex
                      items-start
                      justify-between
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
                          w-10
                          h-10
                          rounded-full
                          bg-blue-500/10
                          flex
                          items-center
                          justify-center
                        "
                      >

                        <FaUser
                          className="
                            text-blue-400
                          "
                        />

                      </div>



                      <div>


                        <h3
                          className="
                            text-white
                            font-semibold
                          "
                        >

                          {visit.name}

                        </h3>


                        <p
                          className="
                            text-xs
                            text-gray-500
                            mt-1
                          "
                        >

                          Cliente interessado

                        </p>


                      </div>


                    </div>





                    <span
                      className={`
                        px-3
                        py-1
                        rounded-full
                        text-xs
                        border
                        ${statusConfig[visit.status]?.style ??
                          'bg-gray-700 text-gray-300 border-gray-600'}
                      `}
                    >
                      {statusConfig[visit.status]?.label ?? visit.status}
                    </span>


                  </div>






                  <div
                    className="
                      mt-5
                      space-y-3
                    "
                  >



                    <div
                      className="
                        flex
                        items-center
                        gap-3
                        text-sm
                        text-gray-400
                      "
                    >

                      <FaPhone
                        className="
                          text-gray-500
                        "
                      />


                      {visit.phone ||
                      'Telefone não informado'}


                    </div>





                    <div
                      className="
                        flex
                        items-center
                        gap-3
                        text-sm
                        text-gray-400
                      "
                    >

                      <FaHome
                        className="
                          text-gray-500
                        "
                      />


                      {visit.property ||
                      'Imóvel não informado'}


                    </div>






                    <div
                      className="
                        flex
                        items-center
                        gap-3
                        text-sm
                        text-blue-400
                        bg-blue-500/5
                        rounded-xl
                        p-3
                      "
                    >

                      <FaCalendarAlt />


                      {
                        visit.visitDate

                        ?

                        new Date(
                          visit.visitDate
                        ).toLocaleString(
                          'pt-BR',
                          {
                            day:'2-digit',
                            month:'2-digit',
                            year:'numeric',
                            hour:'2-digit',
                            minute:'2-digit',
                          }
                        )

                        :

                        'Data não informada'
                      }


                    </div>


                  </div>



                </div>


              ))
            }


          </div>


        )
      }



    </div>

  )
}

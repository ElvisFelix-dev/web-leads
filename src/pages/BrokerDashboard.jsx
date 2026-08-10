import {
  useEffect,
  useState,
} from "react";

import {
  RefreshCw
} from "lucide-react";


import api from "../service/api";


import BrokerHeader from "../components/brokerDashboard/BrokerHeader";
import BrokerStats from "../components/brokerDashboard/BrokerStats";
import BrokerCharts from "../components/brokerDashboard/BrokerCharts";
import BrokerGoals from "../components/brokerDashboard/BrokerGoals";
import BrokerNextVisits from "../components/brokerDashboard/BrokerNextVisits";
import BrokerRecentLeads from "../components/brokerDashboard/BrokerRecentLeads";
import BrokerActivity from "../components/brokerDashboard/BrokerActivity";



export default function BrokerDashboard() {


  const [
    dashboard,
    setDashboard
  ] = useState(null);



  const [
    loading,
    setLoading
  ] = useState(true);



  const [
    error,
    setError
  ] = useState("");



  const loadDashboard = async()=>{


    try {


      setLoading(true);

      setError("");



      const {
        data
      } = await api.get(
        "/api/broker-dashboard"
      );



      console.log(
        "DASHBOARD API:",
        data
      );



      setDashboard(data);



    } catch(err){


      console.error(
        "Erro dashboard:",
        err
      );


      setError(
        "Erro ao carregar dashboard"
      );



    } finally{


      setLoading(false);


    }


  };



  useEffect(()=>{


    loadDashboard();


  },[]);




  if(loading){


    return(

      <div
        className="
          min-h-screen
          bg-gray-950
          flex
          items-center
          justify-center
        "
      >

        <span
          className="
            text-gray-400
          "
        >

          Carregando dashboard...

        </span>


      </div>

    )


  }




  if(error){


    return(

      <div
        className="
          min-h-screen
          bg-gray-950
          flex
          flex-col
          items-center
          justify-center
          gap-4
          text-white
        "
      >


        <p className="text-red-400">

          {error}

        </p>



        <button
          onClick={loadDashboard}
          className="
            flex
            items-center
            gap-2
            bg-blue-600
            px-4
            py-2
            rounded-xl
          "
        >

          <RefreshCw size={18}/>

          Tentar novamente


        </button>



      </div>

    )

  }




  console.log(dashboard.stats)
  return(

    <div
      className="
        min-h-screen
        bg-gray-950
        text-white
        p-6
      "
    >



      <div
        className="
          flex
          justify-end
          mb-4
        "
      >

        <button

          onClick={loadDashboard}

          className="
            flex
            items-center
            gap-2
            bg-gray-800
            hover:bg-gray-700
            px-4
            py-2
            rounded-xl
          "

        >

          <RefreshCw size={18}/>

          Atualizar

        </button>


      </div>




      <BrokerHeader
        broker={dashboard.broker}
        stats={dashboard.stats}
        rank={dashboard.rank}
        points={dashboard.points}
      />




      <BrokerStats

        stats={
          dashboard.stats || {}
        }

      />





      <div
        className="
          grid
          lg:grid-cols-3
          gap-6
          mt-6
        "
      >


        <div
          className="
            lg:col-span-2
          "
        >

          <BrokerCharts

            chart={
              dashboard.chart || {}
            }

          />


        </div>




        <BrokerGoals

          goals={
            dashboard.goals || {}
          }

        />


      </div>





      <div
        className="
          grid
          lg:grid-cols-2
          gap-6
          mt-6
        "
      >


        <BrokerNextVisits

          visits={
            dashboard.nextVisits || []
          }

        />



        <BrokerRecentLeads
        leads={dashboard?.recentLeads || []}
      />


      </div>





      <div className="mt-6">


        <BrokerActivity

          activities={
            dashboard.activities || []
          }

        />


      </div>



    </div>

  )

}

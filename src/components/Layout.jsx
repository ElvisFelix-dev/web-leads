import {
  useContext,
  useEffect,
  useState
} from "react";

import {
  Outlet,
  useLocation,
  matchPath,
  useNavigate
} from "react-router-dom";

import {
  UserContext
} from "../context/UserContext";

import Sidebar from "./Sidebar";


export default function Layout() {


  const location = useLocation();

  const navigate = useNavigate();

  const { user } = useContext(UserContext);


  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);



  const hiddenSidebarRoutes = [
    "/",
    "/sign-up",
    "/forgot-password",
    "/reset-password/:token",
    "/hotsite-corretor/:corretorId",
  ];



  const shouldHideSidebar =
    hiddenSidebarRoutes.some((path) =>
      matchPath(
        {
          path,
          end:true
        },
        location.pathname
      )
    );





  const adminRoutes = [
    "/dashboard",
    "/create-property",
    "/manage-properties",
    "/brokers",
    "/leads-list",
    "/pipeline"
  ];



  const userRoutes = [
    "/broker-dashboard",
    "/my-leads",
    "/my-pipeline",
    "/my-properties",
    "/profile"
  ];






  useEffect(()=>{


    if(!user)
      return;



    const isAdminRoute =
      adminRoutes.some(path =>
        matchPath(
          {
            path,
            end:true
          },
          location.pathname
        )
      );



    const isUserRoute =
      userRoutes.some(path =>
        matchPath(
          {
            path,
            end:true
          },
          location.pathname
        )
      );




    if(
      !user.isAdmin &&
      isAdminRoute
    ){

      navigate(
        "/broker-dashboard",
        {
          replace:true
        }
      );

    }



    if(
      user.isAdmin &&
      isUserRoute
    ){

      navigate(
        "/dashboard",
        {
          replace:true
        }
      );

    }



  },[
    location.pathname,
    navigate,
    user
  ]);






  return (

    <div
      className="
      min-h-screen
      bg-gray-950
      "
    >


      {
        !shouldHideSidebar &&

        <Sidebar
          onCollapseChange={
            setSidebarCollapsed
          }
        />

      }




      <main

        className={`

        min-h-screen

        transition-all
        duration-300


        ${
          shouldHideSidebar
          ?
          ""
          :
          sidebarCollapsed
          ?
          "sm:ml-20"
          :
          "sm:ml-64"

        }


        bg-gray-950

        `}

      >

        <Outlet />

      </main>



    </div>

  )

}

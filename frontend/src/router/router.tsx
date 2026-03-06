import { lazy } from "react";
import { createBrowserRouter, } from "react-router-dom";

import Loadable from "../component/loader/Loadable";

import Layout from "../component/layout/Layout";
import { URL_DASHBOARD, URL_LOGIN, URL_NEW_MEETING_BOOKING, URL_TODO } from "./router-link";

// Lazy load your components
const ToDoPage = Loadable(lazy(() => import("../page/ToDo/ToDo")));
const Login = Loadable(lazy(() => import("../page/Login/Login") ));
const MeetingDashboard = Loadable(lazy(() => import("../page/Dashboard/Dashboard")));
const MeetingBooking = Loadable(lazy(() => import("../page/MeetingBooking/MeetingBooking")));
const NotFoundPage = Loadable(lazy(() => import("../page/NotFound/NotFound")));


export const router = createBrowserRouter(
  [
    {
      path: URL_LOGIN(),
      element: <Login />
    },
    {
    element: <Layout />, // Wrap protected routes with Layout
    children: [
      {
      path: URL_DASHBOARD(),
      element: <MeetingDashboard />      
    },
    {
      path: URL_NEW_MEETING_BOOKING(),
      element: <MeetingBooking />      
    },
    {
      path: URL_TODO(),
      element: <ToDoPage />
      },]
    },
    
    {
      path: "*",
      element: <NotFoundPage />,
    },
  ],
  { basename: "/portal" }
);

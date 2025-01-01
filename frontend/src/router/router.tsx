import { createBrowserRouter } from "react-router-dom";

import { URL_DASHBOARD, URL_LOGIN } from "./router-link";
import Login from "../page/Login/Login";
import MeetingDashboard from "../page/Dashboard/Dashboard";

export const router = createBrowserRouter(
  [
    {
      path: URL_LOGIN(),
      element: <Login />,
    },
    {
      path: URL_DASHBOARD(),
      element: <MeetingDashboard />,
    },
  ],
  { basename: "/portal" }
);

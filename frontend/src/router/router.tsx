import { createBrowserRouter, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";

import { URL_DASHBOARD, URL_LOGIN } from "./router-link";

// Lazy load your components
const Login = lazy(() => import("../page/Login/Login"));
const MeetingDashboard = lazy(() => import("../page/Dashboard/Dashboard"));
const NotFoundPage = lazy(() => import("../page/NotFound/NotFound"));

// Create a loader component
const Loader = () => <div>Loading...</div>;

export const router = createBrowserRouter(
  [
    {
      path: URL_LOGIN(),
      element: (
        <Suspense fallback={<Loader />}>
          <Login />
        </Suspense>
      ),
    },
    {
      path: URL_DASHBOARD(),
      element: (
        <Suspense fallback={<Loader />}>
          <MeetingDashboard />
        </Suspense>
      ),
    },
    {
      path: "*",
      element: (
        <Suspense fallback={<Loader />}>
          <NotFoundPage />
        </Suspense>
      ),
    },
  ],
  { basename: "/portal" }
);

import "./App.css";
import { useFrappeAuth } from "frappe-react-sdk";
import { router } from "./router/router";
import { RouterProvider } from "react-router-dom";
import Login from "./page/Login/Login";
import Dashboard from "./page/Dashboard/Dashboard";
import { Toaster } from "react-hot-toast";
function App() {
  const { currentUser } = useFrappeAuth();
  return (
    <div className="App">
      <Toaster />
      <RouterProvider router={router} />
    </div>
  );
}

export default App;

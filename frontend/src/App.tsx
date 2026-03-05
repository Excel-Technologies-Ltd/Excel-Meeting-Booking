import { useFrappeAuth } from "frappe-react-sdk";
import { Toaster } from "react-hot-toast";
import { RouterProvider } from "react-router-dom";
import "./App.css";
import { router } from "./router/router";
function App() {
  const { currentUser,  } = useFrappeAuth();

  console.log({currentUser});
  
  return (
    <div className="App">
      <Toaster />
      <RouterProvider router={router} />
    </div>
  );
}

export default App;

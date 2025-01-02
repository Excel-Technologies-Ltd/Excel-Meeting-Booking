import { useFrappeAuth } from "frappe-react-sdk";
import DigitalClock from "./DigitalClock";
import epicLogo from "./epic_logo.jpeg";
import arcappsLogo from "./logo1.png";
import { useNavigate } from "react-router";
import { URL_LOGIN } from "../../../router/router-link";
import toast from "react-hot-toast";

export const Header = () => {
  const navigate = useNavigate();
  const { logout } = useFrappeAuth();
  const logoutHandlder = async () => {
    await logout();
    toast.success("Logout successful");
    navigate(URL_LOGIN());
  };

  return (
    <header className="flex justify-between items-center mb-8 text-white flex-wrap px-5">
      <div className="w-20">
        <img className="w-20" src={epicLogo} alt="Epic Logo" />
      </div>
      <p className="text-sm hidden sm:block text-gray-200">
        <DigitalClock />
      </p>
      <div onClick={logoutHandlder} className="w-20 cursor-pointer">
        <img className="w-20 rounded" src={arcappsLogo} alt="ArcApps Logo" />
      </div>
    </header>
  );
};

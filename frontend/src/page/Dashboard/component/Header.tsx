import { useFrappeAuth } from "frappe-react-sdk";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";
import { URL_DASHBOARD, URL_LOGIN } from "../../../router/router-link";
import DigitalClock from "./DigitalClock";
import epicLogo from "./epic_logo.jpeg";
import arcappsLogo from "./logo1.png";

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
      <Link to={URL_DASHBOARD()} className="w-20">
        <img className="w-20" src={epicLogo} alt="Epic Logo" />
      </Link>
      <p className="text-sm hidden sm:block text-gray-200">
        <DigitalClock />
      </p>
      <Link to={"#"} onClick={logoutHandlder} className="w-20 cursor-pointer">
        <img className="w-20 rounded" src={arcappsLogo} alt="ArcApps Logo" />
      </Link>
    </header>
  );
};

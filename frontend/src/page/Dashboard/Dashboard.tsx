import { useFrappeAuth } from "frappe-react-sdk";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loader from "../../component/loader/Loader";
import { URL_LOGIN } from "../../router/router-link";
import { AvailableRooms } from "./component/AvailabeRooms";

const MeetingDashboard = () => {
  const { currentUser, isLoading } = useFrappeAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthentication = async () => {
      // Only redirect if we're sure there's no user and loading is complete
      if (!isLoading && !currentUser) {
        console.log("Redirecting to login...");
        navigate(URL_LOGIN());
      }
    };

    checkAuthentication();
  }, [currentUser, navigate, isLoading]);

  // Optional: Show loading state while checking authentication
  if (isLoading) {
    return <Loader variant="page" />;
  }

  return (
    
        <AvailableRooms />
   
  );
};

export default MeetingDashboard;

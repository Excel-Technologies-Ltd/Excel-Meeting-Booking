import { useFrappeAuth } from "frappe-react-sdk";
import { AvailableRooms } from "./component/AvailabeRooms";
import { Header } from "./component/Header";
import { URL_LOGIN } from "../../router/router-link";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-cover bg-center relative overflow-y-auto p-6">
      {/* Background overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-60 z-0 pointer-events-none"></div>

      {/* Scrollable content */}
      <div className="relative z-10 max-h-screen overflow-y-auto">
        <Header />
        <AvailableRooms />
      </div>
    </div>
  );
};

export default MeetingDashboard;

import { Outlet } from "react-router";
import { Header } from "../../page/Dashboard/component/Header";

type Props = {};

const Layout = ({}: Props) => {
    return (
        <div className="min-h-screen bg-cover bg-center relative overflow-y-auto p-6">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-black bg-opacity-60 z-0 pointer-events-none"></div>

            {/* Scrollable content */}
            <div className="relative z-10 max-h-screen overflow-y-auto">
                <Header />
                <Outlet /> {/* This will render the matched child route component */}
            </div>
        </div>
    );
};

export default Layout;
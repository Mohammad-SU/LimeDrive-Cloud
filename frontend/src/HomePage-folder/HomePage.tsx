import { useEffect } from 'react'
import "./HomePage.scss"
import { useNavigate, useLocation } from "react-router-dom";
import { useUserContext } from '../contexts/UserContext.tsx';
import { Outlet } from "react-router-dom";
import Header from "../components/Header-comp/Header.tsx"
import Sidebar from "../components/Sidebar-comp/Sidebar.tsx"


function HomePage() {
    const navigate = useNavigate();
    const location = useLocation()
    const { token, user } = useUserContext();

    useEffect(() => {
        if (!token && location.pathname == "/home") {
            navigate('/auth');
        }
    }, [token]);

    if (!token || !user.username) {
        return null
    }

    return (
        <div className="HomePage">
            <Header />
            <div className="main-content">
                <Sidebar />
                <div className="content">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default HomePage
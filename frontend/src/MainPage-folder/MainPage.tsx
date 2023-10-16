import { memo, useEffect } from 'react'
import "./MainPage.scss"
import { useNavigate, useLocation } from "react-router-dom";
import { useUserContext } from '../contexts/UserContext.tsx';
import { Outlet } from "react-router-dom";
import Header from "../components/Header-comp/Header.tsx"
import Sidebar from "../components/Sidebar-comp/Sidebar.tsx"
import Toast from '../components/Toast-comp/Toast.tsx';


function MainPage() {
    const navigate = useNavigate();
    const location = useLocation()
    const { token, user } = useUserContext();

    useEffect(() => {
        if (!token && location.pathname != "/auth") {
            navigate('/auth');
        }
        else if (token && location.pathname == "/") {
            navigate('/LimeDrive');
        }
    }, [token]);

    if (!token || !user.username) {
        return null
    }

    return (
            <div className="MainPage">
                <Header />
                <div className="main-content">
                    <Sidebar />
                    <div className="content">
                        <Outlet />
                    </div>
                </div>
                <Toast message="This is a toast message."/>
            </div>
    )
}

export default memo(MainPage)
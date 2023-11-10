import { memo, useEffect } from 'react'
import "./MainPage.scss"
import { useNavigate, useLocation } from "react-router-dom";
import { useUserContext } from '../contexts/UserContext.tsx';
import { Outlet } from "react-router-dom";
import useGlobalEnterKey from '../hooks/useGlobalEnterKey.ts'
import Header from "../components/Header-comp/Header.tsx"
import Sidebar from "../components/Sidebar-comp/Sidebar.tsx"

function MainPage() {
    useGlobalEnterKey();
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
                <main className="main-content">
                    <Sidebar />
                    <div className="content">
                        <Outlet />
                    </div>
                </main>
            </div>
    )
}

export default memo(MainPage)
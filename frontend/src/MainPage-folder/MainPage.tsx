import { memo, useEffect } from 'react'
import "./MainPage.scss"
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useUserContext } from '../contexts/UserContext.tsx';
import FileViewer from '../components/MainSections-COMPS/FileViewer-COMPS/FileViewer.tsx';
import useGlobalEnterKey from '../hooks/useGlobalEnterKey.ts'
import Header from "../components/Header-COMPS/Header.tsx"
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
        else if (token && location.pathname === "/") {
            navigate('/LimeDrive');
        }
    }, [token]);

    if (!token || !user.username) {
        return null
    }

    return (
            <div className="MainPage">
                <Header />
                <div className="content-wrapper">
                    <Sidebar />
                    <main className="main-content">
                        <Outlet />
                        <FileViewer />
                    </main>
                </div>
            </div>
    )
}

export default memo(MainPage)
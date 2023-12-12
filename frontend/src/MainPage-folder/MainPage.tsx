import { memo, useState, useEffect, useRef } from 'react'
import "./MainPage.scss"
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useUserContext } from '../contexts/UserContext.tsx';
import FileViewer from '../components/MainSections-COMPS/FileViewer-COMPS/FileViewer.tsx';
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

    const [previousTargetedElement, setPreviousTargetedElement] = useState<HTMLElement | null>(null);
    const isMounted = useRef(false); // For skipping on first page load (WORKS IN PRODUCTION DUE TO REACT STRICT MODE BEING DISABLED)
    useEffect(() => {// Because :targeted pseudo-class doesnt work with react
        if (!isMounted.current) {
            isMounted.current = true;
            if (location.hash) {
                const { pathname } = location;
                navigate(pathname, { replace: true });
            }
            return;
        }
    
        let mainTimeoutId: NodeJS.Timeout;
        let removeTimeoutId: NodeJS.Timeout;
        mainTimeoutId = setTimeout(() => { // For waiting for proper rendering
            const targetElement = document.getElementById(location.hash.substring(1));
            if (targetElement) {
                if (previousTargetedElement) {
                    previousTargetedElement.classList.remove('targeted');
                }
    
                targetElement.classList.add('targeted');
    
                setPreviousTargetedElement(targetElement);
    
                removeTimeoutId = setTimeout(() => {
                    targetElement.classList.remove('targeted');
                }, 5000);
            }
        }, 50);

        return () => {
            if (mainTimeoutId) {
                clearTimeout(mainTimeoutId);
            }
            if (removeTimeoutId) {
                clearTimeout(removeTimeoutId);
            }
        };
    }, [location]);

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
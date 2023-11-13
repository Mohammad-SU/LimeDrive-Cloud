import { memo, useState, useEffect, useRef } from 'react'
import "./MainPage.scss"
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { useUserContext } from '../contexts/UserContext.tsx';
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
    const isMounted = useRef(false); // For skipping on first page load
    useEffect(() => {// Because :targeted pseudo-class doesnt work with react
        if (!isMounted.current) {
            isMounted.current = true;
            if (location.hash) {
                const { pathname } = location;
                navigate(pathname, { replace: true });
            }
            return;
        }
        const targetElement = document.getElementById(location.hash.substring(1));

        if (targetElement) {
            if (previousTargetedElement) {
                previousTargetedElement.classList.remove('targeted');
            }

            targetElement.classList.add('targeted');

            setPreviousTargetedElement(targetElement);

            const timeoutId = setTimeout(() => {
                targetElement.classList.remove('targeted');
            }, 5000);

            return () => clearTimeout(timeoutId);
        }
    }, [location.hash]);

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
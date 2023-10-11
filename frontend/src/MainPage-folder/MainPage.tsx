import { memo, useEffect } from 'react'
import "./MainPage.scss"
import { useNavigate, useLocation } from "react-router-dom";
import { useUserContext } from '../contexts/UserContext.tsx';
import { DndContext, DragStartEvent } from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { Outlet } from "react-router-dom";
import Header from "../components/Header-comp/Header.tsx"
import Sidebar from "../components/Sidebar-comp/Sidebar.tsx"
import { useFileContext } from '../contexts/FileContext.tsx';


function MainPage() {
    const navigate = useNavigate();
    const location = useLocation()
    const { token, user } = useUserContext();
    const { setDraggedItemId } = useFileContext()

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

    function handleDragStart(event: DragStartEvent) {
        setDraggedItemId(event.active.id.toString());
    }
      
    function handleDragEnd() {
        setDraggedItemId("");
    }

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} modifiers={[snapCenterToCursor]}>
            <div className="MainPage">
                <Header />
                <div className="main-content">
                    <Sidebar />
                    <div className="content">
                        <Outlet />
                    </div>
                </div>
            </div>
        </DndContext>
    )
}

export default memo(MainPage)
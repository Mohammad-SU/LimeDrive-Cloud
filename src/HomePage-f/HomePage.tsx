import { useState, useEffect, memo } from 'react'
import "./HomePage.scss"
import { useNavigate } from "react-router-dom";
import { useUserContext } from '../contexts/UserContext';
import { Outlet } from "react-router-dom";
import Header from "../components/Header-comp/Header.tsx"
import Sidebar from "../components/Sidebar-comp/Sidebar.tsx"


function HomePage() {
    const navigate = useNavigate();
    const { user } = useUserContext();

    useEffect(() => { // Redirect the user if not logged in
        if (!user.username) {
            navigate("/auth")
        }
    }, [user.username, navigate])

    if (!user.username) {
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

export default memo(HomePage)
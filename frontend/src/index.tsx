import React from 'react'
import ReactDOM from 'react-dom/client'
import {createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import "./global.scss"
import { UserProvider } from "./contexts/UserContext"
import { FileProvider } from './contexts/FileContext';
import { ToastProvider } from './contexts/ToastContext';
import AuthPage from "./AuthPage-folder/AuthPage"
import MainPage from "./MainPage-folder/MainPage"
import AllFiles from './components/MainSections-COMPS/AllFiles-COMPS/AllFiles';
import { BsRecycle } from 'react-icons/bs';

const router = createBrowserRouter([
    {
        path: "/*",
        element: <Navigate to="/auth" replace={true} />,
    },
    {
        path: "/auth",
        element: <AuthPage />,
    },
    {
        path: "/",
        element: <MainPage />,
        children: [
            {
                path: "/LimeDrive/*",
                element: <AllFiles />,
            },
            {
                path: "/recycle-bin",
                element: <BsRecycle />,
            },
        ],
    }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ToastProvider>
            <FileProvider>
                <UserProvider>
                    <RouterProvider router={router} />
                </UserProvider>
            </FileProvider>
        </ToastProvider>
    </React.StrictMode>,
)
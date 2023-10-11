import React from 'react'
import ReactDOM from 'react-dom/client'
import {createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import "./global.scss"
import { UserProvider } from "./contexts/UserContext"
import { FileProvider } from './contexts/FileContext';
import AuthPage from "./AuthPage-folder/AuthPage"
import MainPage from "./MainPage-folder/MainPage"
import FileList from './components/FileList-COMPS/FileList';

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
                element: <FileList />,
            },
        ],
    }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <FileProvider>
            <UserProvider>
                <RouterProvider router={router} />
            </UserProvider>
        </FileProvider>
    </React.StrictMode>,
)
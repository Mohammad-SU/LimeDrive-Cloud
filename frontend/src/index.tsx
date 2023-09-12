import React from 'react'
import ReactDOM from 'react-dom/client'
import {createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import "./global.scss"
import { UserProvider } from "./contexts/UserContext"
import { FileProvider } from './contexts/FileContext';
import AuthPage from "./AuthPage-f/AuthPage"
import HomePage from "./HomePage-f/HomePage"
import FileList from './components/FileList-comp/FileList'

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
        path: "/home",
        element: <HomePage />,
        children: [
            {
                path: "/home",
                element: <FileList />,
            },
        ],
    }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <UserProvider>
            <FileProvider>
                <RouterProvider router={router} />
            </FileProvider>   
        </UserProvider>
    </React.StrictMode>,
)
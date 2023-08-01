import React from 'react'
import ReactDOM from 'react-dom/client'
import {createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import "./global.scss"
import LoginPage from "./LoginPage-f/LoginPage"
import HomePage from './HomePage-f/HomePage'

const router = createBrowserRouter([
    {
        path: "*",
        element: <Navigate to="/login" replace={true} />,
    },
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/home",
        element: <HomePage />,
    },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>,
)

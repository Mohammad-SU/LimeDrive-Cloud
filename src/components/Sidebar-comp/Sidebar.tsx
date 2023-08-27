import { useState, memo } from 'react'
import "./Sidebar.scss"
import { Link } from "react-router-dom";
import {AiOutlineUpload} from "react-icons/ai";

function Sidebar() {
    return (
        <div className="Sidebar">
            <button className="upload-btn">
                <AiOutlineUpload className="upload-icon"/>
                Upload
            </button>
            <nav>
                <Link to="/home">All Files</Link>
                <Link to="/shared">Shared</Link>
                <Link to="/images-%26-media">Images & Media</Link>
                <Link to="/starred">Starred</Link>
                <Link to="/recycle-bin">Recycle Bin</Link>
            </nav>

            <div className="space-left">
                <h1>Space Left</h1>
                <div className="bar"></div>
                <p className="label">null bytes of null bytes used</p>
            </div>
        </div>
    )
}

export default memo(Sidebar)
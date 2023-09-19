import { memo } from 'react'
import "./Sidebar.scss"
import { Link } from "react-router-dom"
import Upload from '../Upload-comp/Upload'

function Sidebar() {
    return (
        <div className="Sidebar">
            <Upload />
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
                <p className="label">x bytes of x bytes used</p>
            </div>
        </div>
    )
}

export default memo(Sidebar)
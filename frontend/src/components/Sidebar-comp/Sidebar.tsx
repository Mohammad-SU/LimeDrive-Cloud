import { memo, useState, useRef } from 'react'
import "./Sidebar.scss"
import { Link } from "react-router-dom"
import { AiOutlinePlus, AiFillFolderAdd, AiFillFolder, AiFillFile } from 'react-icons/ai'
import { IoArrowUpSharp } from 'react-icons/io5'
import UploadInfo from '../UploadInfo-comp/UploadInfo' 

function Sidebar() {
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [showNewMenu, setShowNewMenu] = useState(false)

    return (
        <div className="Sidebar">
            <button className="new-btn" onClick={() => setShowNewMenu(current => !current)}>
                <AiOutlinePlus className="plus-icon" />
                New
            </button>
            {showNewMenu &&
                <ul className="new-menu">
                    <button>
                        <AiFillFolderAdd className="menu-icon"></AiFillFolderAdd>
                        New folder
                    </button>
                    <button onClick={() => fileInputRef?.current?.click()}>
                        <div className="menu-icon">
                            <AiFillFile className="outer-icon"/>
                            <IoArrowUpSharp className="inner-icon"/>
                        </div>
                        File upload
                    </button>
                    <button>
                        <div className="menu-icon">
                            <AiFillFolder className="outer-icon"/>
                            <IoArrowUpSharp className="inner-icon"/>
                        </div>
                        Folder upload
                    </button>
                </ul>
            }
            <UploadInfo fileInputRef={fileInputRef}/>
            
            <nav>
                <Link to="/home">All Files</Link>
                <Link to="/shared">Shared</Link>
                <Link to="/media-gallery">Media Gallery</Link>
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
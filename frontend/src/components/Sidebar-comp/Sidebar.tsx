import { memo, useState, useRef } from 'react'
import "./Sidebar.scss"
import { Link } from "react-router-dom"
import { AnimatePresence } from "framer-motion";
import { AiOutlinePlus, AiFillFolderAdd, AiFillFolder, AiFillFile } from 'react-icons/ai'
import { IoArrowUpSharp } from 'react-icons/io5'
import { useFormLogic } from "../../hooks/useFormLogic.ts";
import useDelayedExit from '../../hooks/useDelayedExit.ts';
import UploadInfo from '../UploadInfo-comp/UploadInfo'
import Backdrop from '../Backdrop-comp/Backdrop.tsx'
import DynamicClip from '../DynamicClip.tsx';

function Sidebar() {
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [showNewMenu, setShowNewMenu] = useState(false)
    const [showNewFolderModal, setShowNewFolderModal] = useState(false)
    const { isVisible: isNewfolderModalVisible } = useDelayedExit(showNewFolderModal, 300);

    const { formData, handleInputChange } = useFormLogic({
        newFolderName: '',
    })

    return (
        <>
            <div className="Sidebar">
                <button className="new-btn" onClick={() => setShowNewMenu(current => !current)}>
                    <AiOutlinePlus className="plus-icon" />
                    New
                </button>
                {showNewMenu &&
                    <ul className="new-menu">
                        <button onClick={() => setShowNewFolderModal(true)}>
                            <AiFillFolderAdd className="menu-icon" />
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
                
                <nav>
                    <Link to="/all-files">All Files</Link>
                    <Link to="/shared">Shared</Link>
                    <Link to="/media-gallery">Media Gallery</Link>
                    <Link to="/starred">Starred</Link>
                    <Link to="/recycle-bin">Recycle Bin</Link>
                </nav>

                <div className="space-left">
                    <h1>Space Left</h1>
                    <div className="bar"></div>
                    <p className="label">No. MB of No. MB used</p>
                </div>
            </div>

            { isNewfolderModalVisible &&
                <>
                    <div className="new-folder-modal">
                        <div className="heading-cont">
                            <AiFillFolderAdd className="modal-icon" />
                            <h1>Create folder</h1>
                        </div>

                        <div className="input-cont">
                            <label htmlFor="folder-name-input">Folder name:</label>
                            <input
                                type="text"
                                id="folder-name-input"
                                placeholder="Can contain a-z, A-Z, 0-9, spaces, -, _"
                                name="newFolderName"
                                value={formData.newFolderName}
                                onChange={(e) => handleInputChange(e, 255)}
                                maxLength={255}
                            />
                        </div>

                        <div className="btn-cont">
                            <button className='cancel-btn' onClick={() => setShowNewFolderModal(false)}>Cancel</button>
                            <button className='create-btn'>Create</button>
                        </div>
                    </div>
                </>
            }

            <AnimatePresence>
                {showNewFolderModal && <Backdrop onClick={() => setShowNewFolderModal(false)}/>} {/* Use showNewFolderModal as condition as backdrop should be invisible faster*/} 
            </AnimatePresence>

            <DynamicClip 
                clipPathId={"newFolderModalClip"}
                animation={showNewFolderModal}
                numRects={10}
                incrementProportion={0.05}
            />

            <UploadInfo fileInputRef={fileInputRef}/>
        </>
    )
}

export default memo(Sidebar)
import { memo, useState, useRef, useEffect} from 'react'
import "./Sidebar.scss"
import { Link } from "react-router-dom"
import { AnimatePresence } from "framer-motion";
import { AiOutlineClockCircle, AiOutlineStar, AiOutlinePicture, AiOutlinePlus, AiFillFolderAdd, AiFillFolder, AiFillFile, AiOutlineClose } from 'react-icons/ai'
import { TfiFiles } from 'react-icons/tfi'
import { SlTrash } from 'react-icons/sl'
import { IoArrowUpSharp, IoPeopleOutline } from 'react-icons/io5'
import { useUserContext } from '../../contexts/UserContext.tsx';
import { useFileContext } from '../../contexts/FileContext.tsx';
import { useFormLogic } from "../../hooks/useFormLogic.ts";
import useDelayedExit from '../../hooks/useDelayedExit.ts';
import UploadInfo from '../UploadInfo-comp/UploadInfo'
import Backdrop from '../Backdrop-comp/Backdrop.tsx'
import DynamicClip from '../DynamicClip.tsx';

function Sidebar() {
    const { apiSecure } = useUserContext()
    const { currentPath, addFolders } = useFileContext()
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [showNewMenu, setShowNewMenu] = useState(false)
    
    const [showNewFolderModal, setShowNewFolderModal] = useState(false)
    const { isVisible: isNewfolderModalVisible } = useDelayedExit(showNewFolderModal, 300);
    const folderNameInputRef = useRef<HTMLInputElement | null>(null);
    const { formData, handleInputChange } = useFormLogic({
        newFolderName: '',
    })
    const isFolderNameValid = /^[a-zA-Z0-9\s-_]+$/.test(formData.newFolderName)

    useEffect(() => {
        if (isNewfolderModalVisible) {
            folderNameInputRef.current?.focus()
        }
    }, [isNewfolderModalVisible]);

    const handleCreateFolder = async () => {
        if (!isFolderNameValid) {
            return;
        }
        const name = formData.newFolderName

        const requestFormData = new FormData();
        requestFormData.append('folders[]', name)
        requestFormData.append('app_path', currentPath + name)
    
        try {
            const response = await apiSecure.post('/uploadFolder', requestFormData);
    
            addFolders(response.data)
            setShowNewFolderModal(false);
        } 
        catch (error) {
            console.error(error);
        }
    };
    

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
                    <Link to="/all-files">
                        <TfiFiles className="nav-icon all-files" />
                        All Files
                    </Link>
                    <Link to="/shared">
                        <IoPeopleOutline className="nav-icon shared" />
                        Shared
                    </Link>
                    <Link to="/recent">
                        <AiOutlineClockCircle className="nav-icon" />
                        Recent
                    </Link>
                    <Link to="/starred">
                        <AiOutlineStar className="nav-icon starred" />
                        Starred
                    </Link>
                    <Link to="/media-gallery">
                        <AiOutlinePicture className="nav-icon media-gallery"/>
                        Media Gallery
                    </Link>
                    <Link to="/recycle-bin">
                        <SlTrash className="nav-icon recycle-bin"/>
                        Recycle Bin
                    </Link>
                </nav>

                <div className="space-left">
                    <h1>Space Left</h1>
                    <div className="bar"></div>
                    <p className="label">No. MB of No. MB used</p>
                </div>
            </div>

            { isNewfolderModalVisible &&
                    <div className="new-folder-modal">
                        <AiOutlineClose className="close-icon icon-btn" onClick={() => setShowNewFolderModal(false)}/>
                        <div className="heading-cont">
                            <AiFillFolderAdd className="modal-icon" />
                            <h1>Create folder</h1>
                        </div>

                        <div className="input-cont">
                            <label htmlFor="folder-name-input">Folder name</label>
                            <input
                                type="text"
                                id="folder-name-input"
                                placeholder="Can contain a-z, A-Z, 0-9, spaces, -, _"
                                name="newFolderName"
                                value={formData.newFolderName}
                                onChange={(e) => handleInputChange(e, 255)}
                                maxLength={255}
                                ref={folderNameInputRef}
                            />
                            {!isFolderNameValid && formData.newFolderName !='' && (
                                <p className="error-message">Invalid folder name format.</p>
                            )}
                        </div>

                        <div className="btn-cont">
                            <button className='cancel-btn' onClick={() => setShowNewFolderModal(false)}>Cancel</button>
                            <button className='create-btn' onClick={handleCreateFolder}>Create</button>
                        </div>
                        
                        <DynamicClip
                            clipPathId={"newFolderModalClip"}
                            animation={showNewFolderModal}
                            numRects={10}
                        />
                    </div>
            }
            <div className={`new-folder-modal-shadow ${showNewFolderModal ? 'delayed-shadow' : ''}`}></div>

            <AnimatePresence>
                {showNewFolderModal && <Backdrop onClick={() => setShowNewFolderModal(false)}/>} {/* Use showNewFolderModal as condition as backdrop should be invisible faster*/} 
            </AnimatePresence>

            <UploadInfo fileInputRef={fileInputRef}/>
        </>
    )
}

export default memo(Sidebar)
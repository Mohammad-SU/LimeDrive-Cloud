import { memo, useState, useRef, useEffect} from 'react'
import "./Sidebar.scss"
import axios, { AxiosError } from 'axios';
import { Link } from "react-router-dom"
import { AnimatePresence } from "framer-motion";
import { AiOutlineClockCircle, AiOutlineStar, AiOutlinePicture, AiOutlinePlus, AiFillFolderAdd, AiFillFolder, AiFillFile, AiOutlineClose } from 'react-icons/ai'
import { TfiFiles } from 'react-icons/tfi'
import { SlTrash } from 'react-icons/sl'
import { IoArrowUpSharp, IoPeopleOutline } from 'react-icons/io5'
import { useUserContext } from '../../contexts/UserContext.tsx';
import { useFileContext } from '../../contexts/FileContext.tsx';
import { useToast } from '../../contexts/ToastContext.tsx';
import { useFormLogic } from "../../hooks/useFormLogic.ts";
import useDelayedExit from '../../hooks/useDelayedExit.ts';
import useClickOutside from '../../hooks/useClickOutside.ts';
import UploadInfo from '../UploadInfo-comp/UploadInfo'
import LoadingBar from '../LoadingBar-COMPS/LoadingBar.tsx';
import Backdrop from '../Backdrop-comp/Backdrop.tsx'
import DynamicClip from '../DynamicClip.tsx';

function Sidebar() {
    const { apiSecure } = useUserContext()
    const { currentPath, folders, addFolders } = useFileContext()
    const { showToast } = useToast()
    const [backendErrorMsg, setBackendErrorMsg] = useState<string | null>(null)

    const newMenuRef = useRef<HTMLUListElement | null>(null)
    const [showNewMenu, setShowNewMenu] = useState(false)
    const { isVisible: isNewMenuVisible } = useDelayedExit({
        shouldRender: showNewMenu,
        delayMs: 300,
    });
    useClickOutside(newMenuRef, () => {
        setShowNewMenu(false);
    });

    const fileInputRef = useRef<HTMLInputElement | null>(null)
    
    const [showNewFolderModal, setShowNewFolderModal] = useState(false)
    const { isVisible: isNewfolderModalVisible } = useDelayedExit({
        shouldRender: showNewFolderModal,
        delayMs: 300,
        onExitCallback: () => {
            formData.newFolderName = '';
            setBackendErrorMsg(null)
        },
    });

    const folderNameInputRef = useRef<HTMLInputElement | null>(null);
    const { formData, handleInputChange } = useFormLogic({
        newFolderName: '',
    }, (event) => {
        setBackendErrorMsg(null);
    })
    const isFolderNameValid = /^[a-zA-Z0-9\s-_]+$/.test(formData.newFolderName)
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        if (isNewfolderModalVisible) {
            folderNameInputRef.current?.focus()
        }
    }, [isNewfolderModalVisible]);

    const handleCreateFolder = async () => {
        if (!isFolderNameValid || loading) {
            return;
        }

        const matchingFolder = folders.find((folder) => folder.app_path === currentPath.slice(0, -1));
        const parent_folder_id = matchingFolder ? matchingFolder.id.substring(2) : "0"; // 0 represents root directory id, aka "LimeDrive/"
    
        try {
            setLoading(true)
            const response = await apiSecure.post('/uploadFolder', {
                name: formData.newFolderName,
                app_path: currentPath + formData.newFolderName,
                parent_folder_id: parent_folder_id
            });
    
            addFolders(response.data)
            setShowNewFolderModal(false);
            showToast({message: "Folder added.", showSuccessIcon: true})
        } 
        catch (error) {
            console.error(error);
            if (axios.isAxiosError(error)) {
                setBackendErrorMsg(error?.response?.data.message)
            }
        }
        finally {
            setLoading(false)
        }
    };
    
    return (
        <>
            <div className="Sidebar">
                <button 
                    className="new-btn" 
                    onClick={() => setShowNewMenu(!showNewMenu)}
                >
                    <AiOutlinePlus className="plus-icon" />
                    New
                </button>
                {isNewMenuVisible &&
                    <ul className="new-menu" ref={newMenuRef}>
                        <button onClick={() => {
                            setShowNewFolderModal(true)
                            setShowNewMenu(false)
                        }}>
                            <AiFillFolderAdd className="menu-icon" />
                            New folder
                        </button>

                        <button onClick={() => {
                            fileInputRef?.current?.click()
                            setShowNewMenu(false)
                        }}>
                            <div className="menu-icon">
                                <AiFillFile className="outer-icon"/>
                                <IoArrowUpSharp className="inner-icon"/>
                            </div>
                            File upload
                        </button>

                        <button onClick={() => {
                            fileInputRef?.current?.click()
                            setShowNewMenu(false)
                        }}>
                            <div className="menu-icon">
                                <AiFillFolder className="outer-icon"/>
                                <IoArrowUpSharp className="inner-icon"/>
                            </div>
                            Folder upload
                        </button>
                    </ul>
                }
                <DynamicClip
                    clipPathId={"newMenuClip"}
                    animation={showNewMenu}
                    numRects={6}
                />
                
                <nav>
                    <Link to="/LimeDrive">
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

            {isNewfolderModalVisible &&
                    <form 
                        className="new-folder-modal modal"
                        onSubmit={(event) => {
                            event.preventDefault();
                            handleCreateFolder();
                        }}
                    >
                        <button className="icon-btn-wrapper" type="button" onClick={() => setShowNewFolderModal(false)}>
                            <AiOutlineClose className="close-icon icon-btn" />
                        </button>
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
                                required
                                disabled={loading}
                            />
                            <div className="error-and-loading">
                                {loading ?
                                    <div className="creating-wrapper">
                                        <span>Creating folder...</span>
                                        <LoadingBar loading={loading}/>
                                    </div>
                                    
                                    : (!isFolderNameValid && formData.newFolderName !='') || (backendErrorMsg == 'Invalid folder name format.') ? 
                                        "Invalid folder name format."

                                    : backendErrorMsg ?
                                        "Error. Please check connection."

                                    : null
                                }
                            </div>
                        </div>

                        <div className="btn-cont">
                            <button className='cancel-btn' type="button" onClick={() => setShowNewFolderModal(false)} disabled={loading}>
                                Cancel
                            </button>
                            <button 
                                className='create-btn'
                                type="submit"
                                disabled={formData.newFolderName == '' || backendErrorMsg != null || !isFolderNameValid || loading}
                            >
                                Create
                            </button>
                        </div>
                        
                        <DynamicClip
                            clipPathId={"newFolderModalClip"}
                            animation={showNewFolderModal}
                            numRects={10}
                        />
                    </form>
            }
            <div className={`new-folder-modal-shadow ${showNewFolderModal ? 'delayed-shadow' : ''}`}></div>
            <Backdrop render={showNewFolderModal} onClick={() => setShowNewFolderModal(false)}/> {/* Use showNewFolderModal instead of isNewFolderModalVisible as render condition since backdrop should be invisible faster*/}

            <UploadInfo fileInputRef={fileInputRef}/>
        </>
    )
}

export default memo(Sidebar)
import { memo, useState, useRef} from 'react'
import "./Sidebar.scss"
import axios from 'axios';
import { NavLink, useNavigate } from "react-router-dom"
import { AiOutlinePicture, AiOutlinePlus, AiFillFolderAdd, AiFillFolder, AiFillFile } from 'react-icons/ai'
import { TfiFiles } from 'react-icons/tfi'
import { SlTrash } from 'react-icons/sl'
import { IoArrowUpSharp, IoPeopleOutline } from 'react-icons/io5'
import { useUserContext } from '../../contexts/UserContext.tsx';
import { useFileContext } from '../../contexts/FileContext.tsx';
import { useToast } from '../../contexts/ToastContext.tsx';
import { useFormLogic } from "../../hooks/useFormLogic.ts";
import useDelayedExit from '../../hooks/useDelayedExit.ts';
import DynamicClip from '../DynamicClip.tsx';
import useClickOutside from '../../hooks/useClickOutside.ts';
import Modal from '../Modal-comp/Modal.tsx';
import UploadInfo from '../UploadInfo-comp/UploadInfo'
import LoadingBar from '../LoadingBar-COMPS/LoadingBar.tsx';

function Sidebar() {
    const { apiSecure } = useUserContext()
    const { currentPath, folders, addFolders } = useFileContext()
    const { showToast } = useToast()
    const navigate = useNavigate()
    const [backendErrorMsg, setBackendErrorMsg] = useState<string | null>(null)

    const newMenuRef = useRef<HTMLUListElement | null>(null)
    const [showNewMenu, setShowNewMenu] = useState(false)
    const { isVisible: isNewMenuVisible } = useDelayedExit({
        shouldRender: showNewMenu,
    });
    useClickOutside(newMenuRef, () => {
        setShowNewMenu(false);
    });

    const fileInputRef = useRef<HTMLInputElement | null>(null)
    
    const [showNewFolderModal, setShowNewFolderModal] = useState(false)
    const folderNameInputRef = useRef<HTMLInputElement | null>(null);
    const { formData, handleInputChange } = useFormLogic({
        newFolderName: '',
    }, (event) => {
        setBackendErrorMsg(null);
    })
    const isFolderNameValid = /^[^<>\\/:?*"|]{1,255}$/.test(formData.newFolderName.trim());
    const isConflictingName = folders.some((folder) => folder.app_path == currentPath + folder.name && folder.name == formData.newFolderName.trim());
    const [loading, setLoading] = useState<boolean>(false)

    const handleModalOpen = () => {
        if (backendErrorMsg) { // For if error occurs while modal is closed (toast would already tell the user)
            setBackendErrorMsg(null)
        }
        setShowNewFolderModal(true)
        setShowNewMenu(false)
    }
    const handleCreateFolder = async () => {
        if (formData.newFolderName.trim() == '' || !isFolderNameValid || isConflictingName || loading) {
            return;
        }

        try {
            setLoading(true)
            const parentFolder = folders.find((folder) => folder.app_path === currentPath.slice(0, -1));
            const app_path = currentPath + formData.newFolderName.trim()
            const parent_folder_id = parentFolder ? parentFolder.id.substring(2) : "0"; // 0 represents root directory id, aka "LimeDrive/"
            showToast({message: "Creating folder...", loading: true})
            setShowNewFolderModal(false);
            const response = await apiSecure.post('/uploadFolder', {
                name: formData.newFolderName.trim(),
                app_path: app_path,
                parent_folder_id: parent_folder_id
            });

            addFolders(response.data)
            showToast({message: "Folder created.", showSuccessIcon: true})
            formData.newFolderName = ''

            setTimeout(() => { // Wait for folder with it's id to be properly rendered to the DOM
                if (currentPath == parentFolder?.app_path + "/" || parent_folder_id === "0" && currentPath == "LimeDrive/") { // Jump to folder if user is still in same path
                    navigate(currentPath.slice(0, -1)+"#d_"+response.data.id)
                    const element = document.getElementById(`d_${response.data.id}`);
                    if (element) {
                        element.scrollIntoView({ behavior: "smooth" });
                    }
                }
            }, 1);
        } 
        catch (error) {
            console.error(error);
            if (axios.isAxiosError(error)) {
                setBackendErrorMsg(error?.response?.data.message)
                showToast({message: "Error. Please check your connection.", showFailIcon: true})
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
                    onMouseDown={() => setShowNewMenu(!showNewMenu)}
                >
                    <AiOutlinePlus className="plus-icon" />
                    New
                </button>
                {isNewMenuVisible &&
                    <ul className="new-menu" ref={newMenuRef}>
                        <button onClick={handleModalOpen}>
                            <AiFillFolderAdd className="menu-icon" />
                            Create folder
                        </button>

                        <button 
                            className="file-upload-btn"
                            onClick={() => {
                                fileInputRef!.current!.webkitdirectory = false;
                                fileInputRef?.current?.click()
                                setShowNewMenu(false)
                            }}
                        >
                            <div className="menu-icon">
                                <AiFillFile className="outer-icon"/>
                                <IoArrowUpSharp className="inner-icon"/>
                            </div>
                            File upload
                        </button>

                        <button 
                            className="folder-upload-btn"
                            onClick={() => {
                                // fileInputRef!.current!.webkitdirectory = true;
                                // fileInputRef?.current?.click();
                                showToast({message: "Folder uploads not yet featured. Please manually create folders and upload files instead.", showFailIcon: true})
                                setShowNewMenu(false)
                            }}
                        >
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
                    <NavLink to="/LimeDrive">
                        <TfiFiles className="nav-icon all-files" />
                        All Files
                    </NavLink>
                    <NavLink to="/shared">
                        <IoPeopleOutline className="nav-icon shared" />
                        Shared
                    </NavLink>
                    <NavLink to="/media-gallery">
                        <AiOutlinePicture className="nav-icon media-gallery"/>
                        Media Gallery
                    </NavLink>
                    <NavLink to="/recycle-bin">
                        <SlTrash className="nav-icon recycle-bin"/>
                        Recycle Bin
                    </NavLink>
                </nav>

                <div className="space-left">
                    <h1>Space Left</h1>
                    <div className="bar"></div>
                    <p className="label">No. MB of No. MB used</p>
                </div>
            </div>

            <Modal 
                className="new-folder-modal"
                onSubmit={() => handleCreateFolder()}
                render={showNewFolderModal}
                clipPathId="newFolderModalClip"
                onCloseClick={() => setShowNewFolderModal(false)}
                closeBtnTabIndex={loading ? 0 : -1}
                onVisible={() => folderNameInputRef.current?.focus()}
                onExit={() => {
                    if (!loading) {formData.newFolderName = ''}
                    setBackendErrorMsg(null)
                }}
            >
                <h1>
                    <AiFillFolderAdd className="modal-icon" /> 
                    Create folder
                </h1>
                
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
                        aria-label="Input for new folder name"
                    />
                    <div className="error-and-loading">
                        {loading ?
                            <LoadingBar loading={loading}/> 
                            : (!isFolderNameValid && formData.newFolderName.trim() !== '') || (backendErrorMsg == 'Invalid folder name format.') ? 
                                "Name cannot contain: < > \\ / : ? * \" |"
                            : isConflictingName ?
                                "Name conflicts with an existing folder in this directory."
                            : backendErrorMsg ?
                                "Error. Please check connection."
                            : null
                        }
                    </div>
                </div>

                <div className="modal-btn-cont">
                    <button className='modal-cancel-btn' type="button" onClick={() => setShowNewFolderModal(false)} disabled={loading}>
                        Cancel
                    </button>
                    <button 
                        className='modal-primary-btn'
                        type="submit"
                        disabled={formData.newFolderName.trim() == '' || !isFolderNameValid || isConflictingName || loading}
                    >
                        Create
                    </button>
                </div>
            </Modal>
            {showNewFolderModal && <div className={`new-folder-modal-shadow ${showNewFolderModal ? 'delayed-shadow' : ''}`}></div>}

            <UploadInfo fileInputRef={fileInputRef}/>
        </>
    )
}

export default memo(Sidebar)
import { memo, useState, useRef} from 'react'
import "./Sidebar.scss"
import axios from 'axios';
import { NavLink } from "react-router-dom"
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
import useUnfocusPopup from '../../hooks/useUnfocusPopup.ts';
import Modal from '../Modal-comp/Modal.tsx';
import UploadInfo from '../UploadInfo-comp/UploadInfo'

function Sidebar() {
    const { apiSecure } = useUserContext()
    const { currentPath, folders, addFolders, setScrollTargetId } = useFileContext()
    const { showToast } = useToast()
    const [backendErrorMsg, setBackendErrorMsg] = useState<string | null>(null)

    const newMenuRef = useRef<HTMLUListElement | null>(null)
    const [showNewMenu, setShowNewMenu] = useState(false)
    const { isVisible: isNewMenuVisible } = useDelayedExit({
        shouldRender: showNewMenu,
    });
    useUnfocusPopup(newMenuRef, () => {
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
    const isConflictingName = folders.some((folder) => folder.app_path === currentPath + folder.name && folder.name === formData.newFolderName.trim());
    const [creationCooldown, setCreationCooldown] = useState<boolean>(false)
    console.log(formData.newFolderName)

    const handleModalOpen = () => {
        if (backendErrorMsg) { // For if error occurs while modal is closed (toast would already tell the user)
            setBackendErrorMsg(null)
        }
        setShowNewFolderModal(true)
        setShowNewMenu(false)
    }
    const handleCreateFolder = async () => {
        if (formData.newFolderName.trim() === '' || !isFolderNameValid || isConflictingName || creationCooldown) {
            return;
        }

        try {
            setCreationCooldown(true);
            setTimeout(() => {
                setCreationCooldown(false);
            }, 350);
            const newCurrentPath = currentPath
            const parentFolder = folders.find((folder) => folder.app_path === currentPath.slice(0, -1));
            const app_path = currentPath + formData.newFolderName.trim()
            const parent_folder_id = parentFolder ? parentFolder.id.substring(2) : "0"; // 0 represents root directory id, aka "LimeDrive/"
            setShowNewFolderModal(false);
            showToast({message: "Creating folder...", loading: true})
            const response = await apiSecure.post('/createFolder', {
                name: formData.newFolderName.trim(),
                app_path: app_path,
                parent_folder_id: parseInt(parent_folder_id)
            });

            addFolders(response.data)
            showToast({message: "Folder created.", showSuccessIcon: true})
            if (newCurrentPath == currentPath) {
                setScrollTargetId("d_"+response.data.id)
            }
        } 
        catch (error) {
            console.error(error);
            if (axios.isAxiosError(error)) {
                setBackendErrorMsg(error?.response?.data.message)
                showToast({message: "Failed to create folder. Please check your connection.", showFailIcon: true})
            }
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
                    <NavLink to="/LimeDrive" onClick={() => showToast({message: "Sharing not yet featured.", showFailIcon: true})}>
                        <IoPeopleOutline className="nav-icon shared" />
                        Shared
                    </NavLink>
                    <NavLink to="/LimeDrive" onClick={() => showToast({message: "Media gallery not yet featured.", showFailIcon: true})}>
                        <AiOutlinePicture className="nav-icon media-gallery"/>
                        Media Gallery
                    </NavLink>
                    <NavLink to="/LimeDrive" onClick={() => showToast({message: "Recycle bin not yet featured.", showFailIcon: true})}>
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
                closeBtnTabIndex={creationCooldown && formData.newFolderName.trim() !== '' ? 0 : -1}
                onVisible={() => folderNameInputRef.current?.focus()}
                onExit={() => {
                    formData.newFolderName = ''
                    setBackendErrorMsg(null)
                }}
            >
                <h1>
                    <AiFillFolderAdd className="modal-icon" /> 
                    Create folder
                </h1>
                
                <div className="input-cont">
                    <label htmlFor="folder-name-input">Name</label>
                    <input
                        type="text"
                        id="folder-name-input"
                        placeholder="Folder name"
                        name="newFolderName"
                        value={formData.newFolderName}
                        onChange={(e) => handleInputChange(e, 255)}
                        maxLength={255}
                        ref={folderNameInputRef}
                        required
                        disabled={creationCooldown}
                        aria-label="Input for new folder name"
                    />
                    <p className="error">
                        {(!isFolderNameValid && formData.newFolderName.trim() !== '') || (backendErrorMsg === 'Invalid folder name format.') ?
                                "Cannot contain: < > \\ / : ? * \" |"
                            : isConflictingName ?
                                "Name conflicts with an existing folder in this path."
                            : backendErrorMsg ?
                                "Error. Please check connection."
                            : null
                        }
                    </p>
                </div>

                <div className="modal-btn-cont">
                    <button className='modal-cancel-btn' type="button" onClick={() => setShowNewFolderModal(false)} disabled={creationCooldown && formData.newFolderName.trim() !== ''}>
                        Cancel
                    </button>
                    <button 
                        className='modal-primary-btn'
                        type="submit"
                        disabled={formData.newFolderName.trim() === '' || !isFolderNameValid || isConflictingName || creationCooldown}
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
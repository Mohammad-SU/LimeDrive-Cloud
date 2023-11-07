import "./MoveBtn.scss"
import { memo, useMemo, useState, useEffect } from 'react'
import { useFileContext } from '../../../contexts/FileContext'
import Modal from '../../Modal-comp/Modal'
import { useToast } from "../../../contexts/ToastContext"
import { FolderType } from "../../../types"
import { SlCursorMove } from 'react-icons/sl'
import { AiOutlineFolder } from 'react-icons/ai';
import Breadcrumb from "../../FileList-COMPS/Breadcrumb-comp/Breadcrumb"

function MoveBtn() {
    const { folders, currentPath, selectedItems } = useFileContext()
    const { showToast } = useToast()
    const [moveButtonClicked, setMoveButtonClicked] = useState(false);
    const [showMoveModal, setShowMoveModal] = useState(false)
    const [moveListPath, setMoveListPath] = useState(currentPath)
    const [moveListFolders, setMoveListFolders] = useState<FolderType[]>([]);
    const [targetFolder, setTargetFolder] = useState<FolderType | undefined>(undefined)

    const handleMoveBtnClick = () => {
        if (folders.length == 0) {
            showToast({message: `No folders available to move items to.`, showFailIcon: true});
        } else {
            setShowMoveModal(true)
            setMoveButtonClicked(true)
        }
    }

    const hasSubfolders = (folderPath: string) => {
        return folders.some((folder) => {
            return folder.app_path.startsWith(folderPath + '/');
        });
    };

    useEffect(() => {
        if (hasSubfolders(currentPath.slice(0, -1))) {
            setMoveListPath(currentPath);
        } 
        else { // If current folder doesnt have subfolders, then setMoveListPath to parent path
            const currentFolder = folders.find((folder) => folder.app_path === currentPath.slice(0, -1))
            if (currentFolder) {
                const lastIndex = currentPath.lastIndexOf(currentFolder.name);
                const newPath = currentPath.slice(0, lastIndex) + currentPath.slice(lastIndex).replace(currentFolder.name + '/', '');
                setMoveListPath(newPath);
            }
        }
        setTargetFolder(undefined)
        setMoveButtonClicked(false);
    }, [currentPath, moveButtonClicked]);

    useEffect(() => {
        let newTargetFolder = targetFolder
        if (moveListPath.slice(0, -1) != targetFolder?.app_path) {
            newTargetFolder = folders.find((folder) => folder.app_path === moveListPath.slice(0, -1));
            setTargetFolder(newTargetFolder);
        }
        
        if (!newTargetFolder || hasSubfolders(newTargetFolder.app_path)) {
            setMoveListFolders(
                folders
                    .filter((folder) => {
                        const lastSlashIndex = folder.app_path.lastIndexOf('/');
                        return folder.app_path.substring(0, lastSlashIndex + 1) === moveListPath;
                    })
                    .sort((a, b) => a.name.localeCompare(b.name)) // Sort A-Z
            ) 
        }
    }, [folders, moveListPath]);

    const handleFolderClick = (folder: FolderType) => {
        const prevTarget = targetFolder
        if (prevTarget && !hasSubfolders(prevTarget.app_path)) {
            setMoveListPath(moveListPath.replace(prevTarget.name, folder.name));
        } else {
            const firstSlashIndex = moveListPath.indexOf('/');
            const newPath = "LimeDrive/" +  moveListPath.substring(firstSlashIndex + 1);
            setMoveListPath(newPath + folder.name + "/")
        }

        if (!selectedItems.some(selectedItem => selectedItem.id === folder.id)) {
            setTargetFolder(folder)
        }
    }

    return (
        <>
            <button className="MoveBtn" onClick={handleMoveBtnClick}>
                <SlCursorMove className="tool-icon move"/>
                Move
            </button>

            <Modal 
                className="move-modal"
                render={showMoveModal}
                clipPathId="moveModalClip"
                onCloseClick={() => setShowMoveModal(false)}
            >
                <h1>
                    Move {selectedItems.length} {selectedItems.length > 1 ? 'items' : 'item'} to...
                </h1>
                <Breadcrumb path={moveListPath} setPath={setMoveListPath} btnType={true}/>
                <div className="move-list">
                    {moveListFolders.map((folder, index) => (
                        <div 
                            className={`folder
                                ${selectedItems.some(selectedItem => selectedItem.id === folder.id) ? 'selected-for-moving' : ''}
                                ${folder.id == targetFolder?.id ? 'move-selected' : ''}
                            `}
                            key={index} 
                            onClick={() => handleFolderClick(folder)}
                        >
                            <AiOutlineFolder className="folder-icon" />
                            <span 
                                className="text-cont" 
                                tabIndex={0}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        handleFolderClick(folder);
                                    }
                                }}
                            >
                                {folder.name}
                            </span>
                            {hasSubfolders(folder.app_path) && 
                                <span className="subfolders-indicator">&gt;</span>
                            }
                        </div>
                    ))}
                </div>

                <div className="modal-btn-cont">
                    <button className='modal-cancel-btn' onClick={() => setShowMoveModal(false)} disabled={false}>
                        Cancel
                    </button>
                    <button 
                        className='modal-primary-btn'
                        disabled={
                            (!targetFolder && moveListPath != "LimeDrive/") ||                             
                            selectedItems.some(selectedItem => selectedItem.app_path === moveListPath + selectedItem.name)
                        }
                    >
                        Move
                    </button>
                </div>
            </Modal>
        </>
    )
}

export default memo(MoveBtn)
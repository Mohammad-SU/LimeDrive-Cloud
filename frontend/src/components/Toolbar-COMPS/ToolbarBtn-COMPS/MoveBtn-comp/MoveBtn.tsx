import "./MoveBtn.scss"
import { memo, useState, useEffect } from 'react'
import { useFileContext } from '../../../../contexts/FileContext'
import Modal from '../../../Modal-comp/Modal'
import { useToast } from "../../../../contexts/ToastContext"
import { FolderType } from "../../../../types"
import { SlCursorMove } from 'react-icons/sl'
import { AiOutlineFolder } from 'react-icons/ai';
import Breadcrumb from "../../../MainSections-COMPS/Breadcrumb-comp/Breadcrumb"
import { useUserContext } from "../../../../contexts/UserContext"

function MoveBtn({ toolbarRendered }: { toolbarRendered: boolean }) {
    const { folders, currentPath, selectedItems, filterItemsByPath, handleMoveItems } = useFileContext()
    const { showToast } = useToast()
    const { apiSecure } = useUserContext()
    const [toolbarMoveClicked, setToolbarMoveClicked] = useState(false);
    const [showMoveModal, setShowMoveModal] = useState(false)
    const [moveListPath, setMoveListPath] = useState(currentPath)
    const [moveListFolders, setMoveListFolders] = useState<FolderType[]>([]);
    const [targetFolder, setTargetFolder] = useState<FolderType | undefined>(undefined)

    const handleToolbarMoveClick = () => {
        if (selectedItems.length == 0) return

        if (folders.length == 0) {
            showToast({message: `No folders available to move items to.`, showFailIcon: true});
        } else {
            setShowMoveModal(true)
            setToolbarMoveClicked(true)
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
        else { // If current folder doesnt have subfolders, then setMoveListPath to parent path to prevent empty list that wouldn't benefit the user
            const currentFolder = folders.find((folder) => folder.app_path === currentPath.slice(0, -1))
            if (currentFolder) {
                const lastIndex = currentPath.lastIndexOf(currentFolder.name);
                const newPath = currentPath.slice(0, lastIndex) + currentPath.slice(lastIndex).replace(currentFolder.name + '/', '');
                setMoveListPath(newPath);
            }
        }
        setToolbarMoveClicked(false);
    }, [currentPath, toolbarMoveClicked]);

    useEffect(() => {
        let newTargetFolder = { ...targetFolder } as FolderType | undefined;
        if (moveListPath.slice(0, -1) != newTargetFolder?.app_path) { // For resetting targetFolder when modal is closed and then reopened and making sure there's no subfolder issues
            newTargetFolder = folders.find((folder) => folder.app_path === moveListPath.slice(0, -1));
            setTargetFolder(newTargetFolder);
        }
        if (!newTargetFolder || hasSubfolders(newTargetFolder.app_path)) { // Render subfolders
            setMoveListFolders(
                filterItemsByPath(folders, moveListPath).sort((a, b) => a.name.localeCompare(b.name)) as FolderType[] // Sort A-Z
            ) 
        }
    }, [folders, moveListPath]);

    const handleFolderClick = (folder: FolderType) => {
        const prevTarget = targetFolder
        if (prevTarget && !hasSubfolders(prevTarget.app_path)) { // If prevTarget didn't have subfolders then the end of the breadcrumb should be REPLACED with the new target's name for correct rendering of folders under that path, and to prevent unnecessary stacking in the breadcrumb
            const lastOccurrenceIndex = moveListPath.lastIndexOf(prevTarget.name);
            setMoveListPath(moveListPath.slice(0, lastOccurrenceIndex) + folder.name + "/");
        } else { // Otherwise ADD target folder's name to the end of the breadcrumb
            setMoveListPath(moveListPath + folder.name + "/")
        }

        if (!selectedItems.some(selectedItem => selectedItem.id === folder.id)) { // If the user clicks on a folder that is NOT part of the folders that they selected for moving
            setTargetFolder(folder)
        }
    }

    const handleModalMoveClick = () => {
        if ((!targetFolder && moveListPath != "LimeDrive/") || selectedItems.some(selectedItem => selectedItem.app_path === moveListPath + selectedItem.name) || selectedItems.length == 0) { // In case user removes disabled attribute from modal move btn
            return
        }
        else if (selectedItems.length == 1 && moveListPath.startsWith(selectedItems[0].app_path)) {
            return showToast({message: `Cannot move folder inside itself.`, showFailIcon: true});
        }

        let newTargetFolder = { ...targetFolder } as FolderType | undefined;
        if (moveListPath == "LimeDrive/") { // If user wants to move items to root
            newTargetFolder = {
                id: 'd_0',
                name: 'LimeDrive',
                app_path: 'LimeDrive',
                date: new Date(),
            };
        }
        handleMoveItems(selectedItems, newTargetFolder!, apiSecure)
    }

    return (
        <>
            <button className="MoveBtn" onClick={handleToolbarMoveClick}>
                <SlCursorMove className="tool-icon move-icon"/>
                Move
            </button>

            <Modal 
                className="move-modal"
                render={showMoveModal && toolbarRendered}
                clipPathId="moveModalClip"
                numRects={10}
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
                        onClick={handleModalMoveClick}
                        disabled={
                            (!targetFolder && moveListPath != "LimeDrive/") ||                             
                            selectedItems.some(selectedItem => selectedItem.app_path === moveListPath + selectedItem.name) ||
                            selectedItems.length == 0
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
import { memo, useMemo, useState, useEffect } from 'react'
import "./FileList.scss"
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom'
import { DndContext, DragOverlay, DragStartEvent, DragEndEvent, useSensor, useSensors, MouseSensor, TouchSensor } from '@dnd-kit/core';
import { snapCenterToCursor } from '@dnd-kit/modifiers';
import { useFileContext } from '../../contexts/FileContext'
import { useUserContext } from '../../contexts/UserContext'
import { useToast } from '../../contexts/ToastContext';
import { FileType } from '../../types'
import { FolderType } from '../../types'
import Breadcrumb from './Breadcrumb-comp/Breadcrumb'
import MainToolbar from '../Toolbar-COMPS/MainToolbar-comp/MainToolbar'
import Checkbox from './Checkbox-comp/Checkbox'
import Folder from "./Folder-comp/Folder"
import File from "./File-comp/File"
import { AiOutlineFile, AiOutlineFolder } from 'react-icons/ai';

function FileList() {
    const { currentPath, setCurrentPath, files, folders, updateFiles, updateFolders, selectedItems, setSelectedItems, addToSelectedItems, removeFromSelectedItems } = useFileContext()
    const { showToast } = useToast()

    const navigate = useNavigate()
    // Correct slashes to match app_paths
    const location = useLocation()
    const path = decodeURIComponent(location.pathname.slice(1) + "/")
    useEffect(() => {
        folders.some(folder => folder.app_path === path.slice(0, -1)) ?
            setCurrentPath(path)
            : navigate("/LimeDrive")
    }, [path]);

    const sortedFolders = useMemo(() => {
        const filteredFolders = folders.filter(folder => folder.app_path.replace(folder.name, '') === currentPath);
        return filteredFolders.slice().sort((a, b) => { // Sort A-Z by folder name
            return a.name.localeCompare(b.name);
        });
    }, [folders, currentPath]);

    const sortedFiles = useMemo(() => {
        const filteredFiles = files.filter(file => file.app_path.replace(file.name, '') === currentPath);
        return filteredFiles.slice().sort((a, b) => { // Sort so most recently uploaded files will be at the beginning
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB.getTime() - dateA.getTime();
        });
    }, [files, currentPath]);

    const handleItemSelection = (item: FileType | FolderType, event: React.MouseEvent<HTMLDivElement>, isItemSelected: boolean) => {
        const isCtrlPressed = event.ctrlKey || event.metaKey;
        const isShiftPressed = event.shiftKey;
        const isCheckboxClicked = (event.target instanceof HTMLElement && event.target.hasAttribute('data-checkbox'))

        if (isCtrlPressed || isCheckboxClicked) { // Multiple selections with possibly separated file locations, also logic for checkbox clicks
            if (isItemSelected) {
                addToSelectedItems([item]);
            }
            else {
                removeFromSelectedItems([item]);
            }
        } 
        // else if (isShiftPressed && lastClickedItem) { // Multiple selections with files together in a range
        //     const itemToSelect: (FileType | FolderType)[] = [];
        //     const startIndex = selectedItems.findIndex(selectedItem => selectedItem.id === lastClickedItem.id);
        //     const endIndex = selectedItems.findIndex(selectedItem => selectedItem.id === item.id);
    
        //     if (startIndex >= 0 && endIndex >= 0) {
        //         const start = Math.min(startIndex, endIndex);
        //         const end = Math.max(startIndex, endIndex);
    
        //         for (let i = start; i <= end; i++) {
        //             itemToSelect.push(selectedItems[i]);
        //         }
        //     }
    
        //     setSelectedItems(itemToSelect);
        // }
        else { // Regular item click logic
            setSelectedItems([item])
        }
    
        // setLastClickedItem(Item)
    }

    const [showSelectAll, setShowSelectAll] = useState(false);
    const [showDeselectAll, setShowDeselectAll] = useState(false)

    const handleHeaderCheckboxClick = () => {
        if (!showSelectAll && !showDeselectAll) {
            setShowSelectAll(true)
            addToSelectedItems(sortedFiles)
            addToSelectedItems(sortedFolders)
        }
        else {
            setShowSelectAll(false)
            setShowDeselectAll(false)
            removeFromSelectedItems(sortedFiles)
            removeFromSelectedItems(sortedFolders)
        }
    };

    useEffect(() => { // Make sure header-row checkbox looks correct based on items and handle some keyboard shortcuts
        if (selectedItems.length == 0) {
            setShowSelectAll(false)
            setShowDeselectAll(false)
        }
        else if (selectedItems.length < (sortedFiles.length + sortedFolders.length)) { 
            setShowSelectAll(false)
            setShowDeselectAll(true)
        }
        else if (selectedItems.length == (sortedFiles.length + sortedFolders.length)) { 
            setShowSelectAll(true)
            setShowDeselectAll(false)
        }

        const handleKeyShortcuts = (event: KeyboardEvent) => {
            const isModalOpen = document.querySelector(".Backdrop");
            const isInputFocused = document.activeElement instanceof HTMLInputElement;

            if (!isModalOpen && !isInputFocused) {
                if (event.key === 'Escape') {
                    event.preventDefault();
                    setSelectedItems([]);
                }
                if (event.ctrlKey && event.key === 'a') {
                    event.preventDefault();
                    setSelectedItems([...sortedFiles, ...sortedFolders]);
                }
            }
        };        
      
        window.addEventListener('keydown', handleKeyShortcuts)
      
        return () => {
            window.removeEventListener('keydown', handleKeyShortcuts)
        }
    }, [selectedItems]);

    useEffect(() => {
        setSelectedItems([])
    }, [currentPath])

    const mouseSensor = useSensor(MouseSensor, {
        activationConstraint: {
            distance: 10, // Require the mouse to move by 10 pixels before activating
        },
    });
    const touchSensor = useSensor(TouchSensor, {
        // Press delay of 200ms, with tolerance of 20px of movement
        activationConstraint: {
            delay: 200,
            tolerance: 5,
        },
    });
    const sensors = useSensors(mouseSensor, touchSensor)

    const [draggedItem, setDraggedItem] = useState<Record<string, any>>()
    const [droppedOnItem, setDroppedOnItem] = useState<Record<string, any>>()
    const { apiSecure } = useUserContext()
    const [backendErrorMsg, setBackendErrorMsg] = useState<string | null>(null)

    const handleDragStart = (event: DragStartEvent) => {
        setDraggedItem(event.active.data.current);
    }
    const handleDragEnd = async (event: DragEndEvent) => {
        const newDroppedOnItem = event.over?.data.current

        if (draggedItem && newDroppedOnItem && (draggedItem.id != newDroppedOnItem.id)) {
            try {
                // setDroppedOnItem(newDroppedOnItem) // check if this is required or not
                showToast({message: "Testing backend response...", loading: true})
                const new_path = newDroppedOnItem.app_path + "/" + draggedItem.name;
                const postId = !draggedItem.type ? // If draggedItem is a folder (id has d_ prefix on the frontend) then filter it for the backend
                    parseInt(draggedItem.id.substring(2))
                    : draggedItem.id

                const response = await apiSecure.post('/updatePaths', {
                    id: postId,
                    new_path: new_path,
                    type: draggedItem.type,
                    parent_folder_id: parseInt(newDroppedOnItem.id.substring(2))
                });

                const updatedItems = response.data.updatedItems;
                const foldersToUpdate: Record<string, { app_path: string }> = {};
                const filesToUpdate: Record<number, { app_path: string }> = {};
    
                updatedItems.forEach((item: { id: string | number, updated_path: string }) => {
                    item.id.toString().startsWith('d_') ?
                        foldersToUpdate[item.id] = { app_path: item.updated_path }
                        : filesToUpdate[item.id as number] = { app_path: item.updated_path }
                });
                // Batch update files and folders
                if (Object.keys(filesToUpdate).length > 0) {
                    updateFiles(filesToUpdate);
                }
                if (Object.keys(foldersToUpdate).length > 0) {
                    updateFolders(foldersToUpdate);
                }

                showToast({message: "Item successfully moved.", showSuccessIcon: true})
            } 
            catch (error) {
                console.error(error);
                if (axios.isAxiosError(error)) {
                    setBackendErrorMsg(error?.response?.data.message)
                    showToast({ message: `Error: ${error?.response?.data.message}`, showFailIcon: true });
                }
            }
        }
    }

    const foldersMapped = sortedFolders.map(folder => {
        return <Folder
            key={folder.id}
            folder={folder}
            onSelect={handleItemSelection}
        />
    })
    const filesMapped = sortedFiles.map(file => {
        return <File
            key={file.id}
            file={file}
            onSelect={handleItemSelection}
        />
    })
    const emptyDirectory = sortedFiles.length + sortedFolders.length == 0

    return (
            <div className={`FileList ${emptyDirectory ? 'empty-directory' : ''}`}>
                <div className="FileList-main-header">
                    <Breadcrumb />
                    <MainToolbar />

                    <div className="list-header-row">
                        <Checkbox
                            className={`list-checkbox ${showSelectAll || showDeselectAll ? "show-checkbox" : "hide-checkbox"}`}
                            checked={showSelectAll}
                            onClick={handleHeaderCheckboxClick}
                            showMinus={showDeselectAll}
                        />
                        <p className="name-header">Name</p>
                        <p>Type</p>
                        <p>Size</p>
                        <p>Uploaded (D/M/Y)</p>
                    </div>
                </div>

                <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} modifiers={[snapCenterToCursor]} sensors={sensors}>
                    <div className={`main-list ${emptyDirectory ? 'empty-directory' : ''}`}>
                        {foldersMapped}
                        {filesMapped}
                        {emptyDirectory && <h1 className="empty-message">Empty directory. Click "New" to add items.</h1>}
                    </div>

                    <DragOverlay className="drag-overlay" style={{width: 300}}>
                        {draggedItem &&
                            <>
                                {draggedItem.type == undefined ? 
                                    <AiOutlineFolder className="drag-icon-folder"/>
                                    : <AiOutlineFile className="drag-icon-file"/>
                                }
                                <p>{draggedItem.name}</p>
                            </>
                        }
                    </DragOverlay>
                </DndContext>
            </div>
    )
}

export default memo(FileList)
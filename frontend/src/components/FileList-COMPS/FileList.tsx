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
import { ItemTypes } from '../../types';
import Breadcrumb from './Breadcrumb-comp/Breadcrumb'
import MainToolbar from '../Toolbar-COMPS/MainToolbar-comp/MainToolbar'
import Checkbox from './Checkbox-comp/Checkbox'
import Folder from "./Folder-comp/Folder"
import File from "./File-comp/File"
import { AiOutlineFile, AiOutlineFolder } from 'react-icons/ai';

function FileList() {
    const { 
        currentPath, 
        setCurrentPath, 
        files, 
        folders, 
        selectedItems, 
        setSelectedItems, 
        addToSelectedItems, 
        removeFromSelectedItems, 
        filterItemsByPath, 
        setConflictingItems, 
        handleMoveItems,
        processingItems 
    } = useFileContext()
    const { showToast } = useToast()

    const navigate = useNavigate()
    const location = useLocation()
    const path = decodeURIComponent(location.pathname.slice(1) + "/")
    useEffect(() => {
        folders.some(folder => folder.app_path === path.slice(0, -1)) || path == "LimeDrive/" ? // if the URL path doesn't match a real directory path then navigate to root
            setCurrentPath(path)
            : navigate("/LimeDrive")

        setConflictingItems([]);
    }, [path]);

    const sortedFolders = useMemo(() => {
        const filteredFolders = filterItemsByPath(folders, currentPath)
        return filteredFolders.slice().sort((a, b) => { // Sort A-Z by folder name
            return a.name.localeCompare(b.name);
        });
    }, [folders, currentPath]);

    const sortedFiles = useMemo(() => {
        const filteredFiles = filterItemsByPath(files, currentPath)
        return filteredFiles.slice().sort((a, b) => { // Sort so most recently uploaded files will be at the beginning
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB.getTime() - dateA.getTime();
        });
    }, [files, currentPath]);

    const handleItemSelection = (item: ItemTypes, event: React.MouseEvent<HTMLDivElement>, isItemSelected: boolean) => {
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
            const itemsToSelect = [...sortedFiles, ...sortedFolders].filter(
                (item) => !processingItems.some((sentItem) => sentItem.id === item.id)
            );
            addToSelectedItems(itemsToSelect);
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
    }, [selectedItems, sortedFiles, sortedFolders]);

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

    const [draggedItem, setDraggedItem] = useState<ItemTypes>() // The file or folder that is directly being dragged, regardless of selected items
    const { apiSecure } = useUserContext()

    const handleDragStart = (event: DragStartEvent) => {
        const draggedItem = event.active.data.current as ItemTypes;

        if (selectedItems.length > 0 && !selectedItems.some(item => item.id === draggedItem.id)) {
            addToSelectedItems([draggedItem]);
        }
    
        setDraggedItem(draggedItem);
    }
    const handleDragEnd = async (event: DragEndEvent) => {
        const newDroppedOnItem = event.over?.data.current as FolderType;
        
        if (draggedItem && newDroppedOnItem && (draggedItem.id != newDroppedOnItem.id) && !selectedItems.some(item => item.id === newDroppedOnItem.id)) {
            let itemsToMove: ItemTypes[]
            selectedItems.length <= 1 ?
                itemsToMove = [draggedItem]
                : itemsToMove = selectedItems

            handleMoveItems(itemsToMove, newDroppedOnItem, apiSecure)
        }
    }

    const foldersMapped = sortedFolders.map(folder => {
        return <Folder
            key={folder.id}
            folder={folder as FolderType}
            onSelect={handleItemSelection}
        />
    })
    const filesMapped = sortedFiles.map(file => {
        return <File
            key={file.id}
            file={file as FileType}
            onSelect={handleItemSelection}
        />
    })
    const emptyDirectory = sortedFiles.length + sortedFolders.length == 0

    return (
            <div className={`FileList ${emptyDirectory ? 'empty-directory' : ''}`}>
                <div className="FileList-main-header">
                    <Breadcrumb path={currentPath} setPath={setCurrentPath}/>
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
                                <div className="main-drag-cont">
                                    {draggedItem.type === undefined ?
                                        <AiOutlineFolder className="drag-icon-folder"/>
                                        : <AiOutlineFile className="drag-icon-file"/>
                                    }
                                    <p>{draggedItem.name}</p>

                                    {selectedItems.length > 1 && 
                                        <div className={`item-counter ${selectedItems.length > 9 ? 'larger' : ''}`}>
                                            {selectedItems.length < 10 ?
                                                selectedItems.length
                                                : "9+"
                                            }
                                        </div>
                                    }
                                </div>
                                {selectedItems.length > 1 && <div className="second-stack stack-item" />}
                                {selectedItems.length > 2 && <div className="third-stack stack-item" />}
                            </>
                        }
                    </DragOverlay>
                </DndContext>
            </div>
    )
}

export default memo(FileList)
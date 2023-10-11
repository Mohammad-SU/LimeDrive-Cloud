import { memo, useMemo, useState, useEffect } from 'react'
import "./FileList.scss"
import { useLocation } from 'react-router-dom'
import { DragOverlay } from '@dnd-kit/core';
import { useFileContext } from '../../contexts/FileContext'
import { FileType } from '../../types'
import { FolderType } from '../../types'
import Breadcrumb from './Breadcrumb-comp/Breadcrumb'
import MainToolbar from '../Toolbar-COMPS/MainToolbar-comp/MainToolbar'
import Checkbox from './Checkbox-comp/Checkbox'
import Folder from "./Folder-comp/Folder"
import File from "./File-comp/File"

function FileList() {
    const [refresh, setRefresh] = useState(false);
    useEffect(() => { // Trigger re-render when browser's back button is clicked
        const handlePopstate = () => {
            setRefresh((prevRefresh) => !prevRefresh);
        };
        window.addEventListener('popstate', handlePopstate);
        return () => {
            window.removeEventListener('popstate', handlePopstate);
        };
    }, []);

    const { currentPath, setCurrentPath, draggedItemId, files, folders, selectedItems, setSelectedItems, addToSelectedItems, removeFromSelectedItems } = useFileContext()

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

    const [selectAll, setSelectAll] = useState(false);
    const [showDeselectAll, setShowDeselectAll] = useState(false)

    const handleHeaderCheckboxClick = () => {
        if (!selectAll && !showDeselectAll) {
            setSelectAll(true)
            addToSelectedItems(files)
            addToSelectedItems(folders)
        }
        else {
            setSelectAll(false)
            setShowDeselectAll(false)
            removeFromSelectedItems(files)
            removeFromSelectedItems(folders)
        }
    };

    useEffect(() => { // Makes sure header-row checkbox looks correct based on items
        if (files.length + folders.length == 0) {
            setSelectAll(false)
        }
        else if (selectedItems.length < files.length + folders.length) { 
            setSelectAll(false)
            setShowDeselectAll(true)
        }
        else {
            setShowDeselectAll(false)
            setSelectAll(true)
        }

        if (selectedItems.length == 0) {
            setShowDeselectAll(false)
        }

        console.log(selectedItems)

        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setSelectedItems([]);
            }
        };
      
        window.addEventListener('keydown', handleEscapeKey)
      
        return () => {
            window.removeEventListener('keydown', handleEscapeKey)
        }
    }, [selectedItems]);

    useEffect(() => {
        setSelectedItems([])
    }, [currentPath])
   
    // Correct slashes to match app_paths
    const location = useLocation()
    var path = location.pathname.slice(1) + "/";
    setCurrentPath(path)

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

    return (
        <div className="FileList">
            <div className="FileList-main-header">
                <Breadcrumb />
                <MainToolbar />

                <div className="list-header-row">
                    <Checkbox
                        className={`list-checkbox ${selectAll || showDeselectAll ? "show-checkbox" : "hide-checkbox"}`}
                        checked={selectAll}
                        onClick={handleHeaderCheckboxClick}
                        showMinus={showDeselectAll}
                    />
                    <p className="name-header">Name</p>
                    <p>Type</p>
                    <p>Size</p>
                    <p>Upload Date (D/M/Y)</p>
                </div>
            </div>

            <div className="main-list">
                {foldersMapped}
                {filesMapped}
            </div>

            <DragOverlay className="drag-overlay" style={{width: 300}}>
                {draggedItemId && <p>{`Item ${draggedItemId}`}</p>}
            </DragOverlay>
        </div>
    )
}

export default memo(FileList)
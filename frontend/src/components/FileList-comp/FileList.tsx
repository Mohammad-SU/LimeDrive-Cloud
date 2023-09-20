import { memo, useMemo } from 'react'
import "./FileList.scss"
import { useFileContext } from '../../contexts/FileContext'
import { FileType } from '../../types'
import { FolderType } from '../../types'
import Folder from "../Folder-comp/Folder"
import File from "../File-comp/File"

function FileList() {
    const { files, folders, selectedItems, setSelectedItems, addToSelectedItems, removeFromSelectedItems } = useFileContext()

    const handleItemSelection = (item: FileType | FolderType, event: React.MouseEvent<HTMLDivElement> | React.ChangeEvent<HTMLInputElement>, isItemSelected: boolean) => {
        const isCtrlPressed = event.ctrlKey || event.metaKey;
        const isShiftPressed = event.shiftKey;
    
        if (isCtrlPressed || event.type === 'change') { // Multiple selections with separated file locations, also logic for checkbox clicks
            if (isItemSelected) {
                addToSelectedItems(item);
            } 
            else {
                removeFromSelectedItems(item);
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
        else if (event.type != 'change') { // Regular item click logic
            if (isItemSelected) {
                setSelectedItems([item])
            }
            else {
                setSelectedItems([])
            }
        }
    
        // setLastClickedItem(Item)
    }

    const sortedFiles = useMemo(() => {
        return files.slice().sort((a, b) => { // Sort so most recent files will be at the beginning
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB.getTime() - dateA.getTime();
        });
    }, [files]);

    const sortedFolders = useMemo(() => {
        return folders.slice().sort((a, b) => { // Sort A-Z by folder name
            return a.name.localeCompare(b.name);
        });
    }, [folders]);
    
    const foldersMapped = sortedFolders.map(folder => {
        return <Folder
            key={folder.id}
            folder={folder} // map entire object
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

    console.log(selectedItems)

    return (
        <div className="FileList">
            <div className="header-row">
                <p className="name-header">Name</p>
                <p>Type</p>
                <p>Extension</p>
                <p>Size</p>
                <p>Date (D/M/Y)</p>
            </div>
            <div className="main-list">
                {foldersMapped}
                {filesMapped}
            </div>
        </div>
    )
}

export default memo(FileList)
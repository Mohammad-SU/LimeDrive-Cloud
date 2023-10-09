import { memo, useState, useEffect } from 'react'
import { DateTime } from 'luxon';
import { useNavigate, useLocation } from 'react-router-dom';
import "./Folder.scss"
import { FolderType } from '../../../types';
import { useFileContext } from '../../../contexts/FileContext';
import Checkbox from '../Checkbox-comp/Checkbox';

interface FolderProps {
    folder: FolderType;
    onSelect: (item: FolderType, event: React.MouseEvent<HTMLDivElement>, isItemSelected: boolean) => void;
}

function Folder({ folder, onSelect }: FolderProps) {
    const [isSelected, setIsSelected] = useState(false)
    const [showCheckbox, setShowCheckbox] = useState(false)
    const { currentPath, setCurrentPath, selectedItems } = useFileContext()

    function formatDate(date: Date) {
        const dateTime = DateTime.fromJSDate(date).toLocal();
        return dateTime.toFormat('dd/MM/yyyy HH:mm');
    }
    const formattedDate = formatDate(new Date(folder.date));

    function handleFolderClick(event: React.MouseEvent<HTMLDivElement>) {
        event.preventDefault();
        const isCtrlPressed = event.ctrlKey || event.metaKey;
        const isShiftPressed = event.shiftKey;
        const isCheckboxClicked = (event.target instanceof HTMLElement && event.target.hasAttribute('data-checkbox'))
        let newIsSelected;

        if (isCtrlPressed || isCheckboxClicked) {
            newIsSelected = !isSelected
        }
        else {
            newIsSelected = true
        }

        setIsSelected(newIsSelected);
        onSelect(folder, event, newIsSelected)
    }

    const navigate = useNavigate()

    const openFolder = () => {
        navigate(folder.name)
    }

    useEffect(() => { // Ensure correct rendering of selected folder
        setIsSelected(selectedItems.some(selectedItem => selectedItem.id === folder.id));
        selectedItems.length > 0 ? setShowCheckbox(true) : setShowCheckbox(false)
    }, [selectedItems]);
    
    return (
        <div 
            className={`Folder ${isSelected ? 'selected' : ''}`} 
            onClick={handleFolderClick}
            onDoubleClick={openFolder}
        >
            <Checkbox 
                className={`list-checkbox ${showCheckbox ? "show-checkbox" : 'hide-checkbox'}`} 
                checked={isSelected}
            />
            <p className="name" onClick={openFolder}><span>{folder.name}</span></p>
            <p>--</p>
            <p>0 B</p>
            <p>{formattedDate}</p>
        </div>
    )
}

export default memo(Folder)
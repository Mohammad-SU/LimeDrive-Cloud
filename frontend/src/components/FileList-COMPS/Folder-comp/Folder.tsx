import { memo, useState, useEffect } from 'react'
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
    const { selectedItems } = useFileContext()

    function handleFolderClick(event: React.MouseEvent<HTMLDivElement>) {
        event.preventDefault();
        const newIsSelected = true;
        setIsSelected(newIsSelected);
        onSelect(folder, event, newIsSelected)
    }

    useEffect(() => { // Ensure correct rendering of selected folder
        setIsSelected(selectedItems.some(selectedItem => selectedItem.id === folder.id));
    }, [selectedItems]);
    
    return (
        <div className={`Folder ${isSelected ? 'selected' : ''}`} onClick={handleFolderClick}>
            <Checkbox checked={isSelected}/>
            <p className="folder-name">{folder.name}</p>
        </div>
    )
}

export default memo(Folder)

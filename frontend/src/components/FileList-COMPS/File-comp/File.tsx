import { memo, useState, useEffect } from 'react'
import { DateTime } from 'luxon';
import "./File.scss"
import { FileType } from '../../../types/index.ts';
import { useFileContext } from '../../../contexts/FileContext.tsx';
import Checkbox from '../Checkbox-comp/Checkbox.tsx';

interface FileProps {
    file: FileType;
    onSelect: (item: FileType, event: React.MouseEvent<HTMLDivElement>, isItemSelected: boolean) => void;
}

function File({ file, onSelect }: FileProps) {
    function formatBytes(bytes: number) {
        if (bytes < 1048576) {
            return (bytes / 1024).toFixed(2) + " KB";
        } else {
            return (bytes / 1048576).toFixed(2) + " MB";
        }
    }
    const formattedSize = formatBytes(file.size);

    function formatDate(date: Date) {
        const dateTime = DateTime.fromJSDate(date).toLocal();
        return dateTime.toFormat('dd/MM/yyyy HH:mm');
    }
    const formattedDate = formatDate(new Date(file.date));

    // console.log(file.date)

    const [isSelected, setIsSelected] = useState(false)
    const [showCheckbox, setShowCheckbox] = useState(false)
    const { selectedItems } = useFileContext()

    function handleFileClick(event: React.MouseEvent<HTMLDivElement>) {
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
        onSelect(file, event, newIsSelected)
    }

    useEffect(() => { // Ensure correct rendering of selected file
        setIsSelected(selectedItems.some(selectedItem => selectedItem.id === file.id));
        selectedItems.length > 0 ? setShowCheckbox(true) : setShowCheckbox(false)
    }, [selectedItems]);

    return (
        <div className={`File ${isSelected ? 'selected' : ''}`} onClick={handleFileClick}>
            <Checkbox 
                className={`list-checkbox ${showCheckbox ? "show-checkbox" : "hide-checkbox"}`} 
                checked={isSelected}
            />
            <p className="name"><span>{file.name}</span></p>
            <p>{file.type}</p>
            <p>{formattedSize}</p>
            <p>{formattedDate}</p>
        </div>
    )
}

export default memo(File)
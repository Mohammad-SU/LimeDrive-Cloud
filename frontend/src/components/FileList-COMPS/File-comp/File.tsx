import { memo, useState, useEffect } from 'react'
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
        const day = date.getDate();
        const month = date.getMonth() + 1; // Months are 0-indexed, so add 1
        const year = date.getFullYear();
        let hours = date.getHours();
        const minutes = date.getMinutes();
      
        const amPm = hours >= 12 ? 'pm' : 'am'; // Convert to 12-hour format
        hours = hours % 12;
        hours = hours === 0 ? 12 : hours; // Convert 0 to 12
      
        const formattedDay = day;
        const formattedMonth = month;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes; // Pad minutes with leading zeros if needed
      
        return `${formattedDay}/${formattedMonth}/${year} ${hours}:${formattedMinutes}${amPm}`;
    }

    const date = new Date(file.date) // Parse ISO 8601
    const dateToFormat = date;
    const formattedDate = formatDate(dateToFormat);

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
            <p className="name">{file.name}</p>
            <p>{file.type}</p>
            <p>{file.extension}</p>
            <p>{formattedSize}</p>
            <p>{formattedDate}</p>
        </div>
    )
}

export default memo(File)
import { memo, useState, useEffect } from 'react'
import { DateTime } from 'luxon';
import { FileType } from '../../../types/index.ts';
import { useFileContext } from '../../../contexts/FileContext.tsx';
import { useDraggable, useDndMonitor } from '@dnd-kit/core';
import { AiOutlineFile, AiOutlineExclamation} from 'react-icons/ai';
import Checkbox from '../Checkbox-comp/Checkbox.tsx';

interface FileProps {
    file: FileType;
    onSelect: (item: FileType, event: React.MouseEvent<HTMLDivElement>, isItemSelected: boolean) => void;
}

function File({ file, onSelect }: FileProps) {
    const [isSelected, setIsSelected] = useState(false)
    const [showCheckbox, setShowCheckbox] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [disableDefaultHover, setDisableDefaultHover] = useState(false)
    const { selectedItems, conflictingItems, processingItems } = useFileContext()

    function handleFileClick(event: React.MouseEvent<HTMLDivElement>) {
        if (isProcessing) return

        const isCtrlPressed = event.ctrlKey || event.metaKey;
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
    useEffect(() => {
        setIsProcessing(processingItems.some(sentItem => sentItem.id === file.id));
    }, [processingItems]);

    const [isSelectDragging, setIsSelectDragging] = useState(false)
    useDndMonitor({
        onDragStart() {
            if (isSelected) {
                setIsSelectDragging(true)
            }
            setDisableDefaultHover(true)
        },
        onDragEnd() {
            setIsSelectDragging(false)
            setDisableDefaultHover(false)
        },
    });
    useEffect(() => {
        function handleEscapeKey(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsSelectDragging(false);
            }
        }
        window.addEventListener('keydown', handleEscapeKey);
        return () => {
            window.removeEventListener('keydown', handleEscapeKey);
        };
    }, []);

    const {attributes, listeners, isDragging, setNodeRef} = useDraggable({
        id: file.id,
        data: file,
        attributes: {
            tabIndex: -1,
        },
        disabled: isProcessing,
    });

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

    return (
        <div 
            className={`File 
                ${isSelected ? 'selected' : ''}
                ${isDragging || isSelectDragging ? 'dragging' : ''}
                ${isProcessing ? 'processing' : ''}
                ${disableDefaultHover ? 'disable-default-hover' : ''}
            `}
            id={file.id.toString()}
            onClick={handleFileClick}
            ref={setNodeRef}
            {...listeners} 
            {...attributes}
        >
            <Checkbox
                className={`list-checkbox ${showCheckbox && !isProcessing ? "show-checkbox" : "hide-checkbox"}`} 
                checked={isSelected}
            />
            <p className="name">
                <span className="icon-cont">
                    <AiOutlineFile className="main-icon" />
                    {conflictingItems.some(conflictingItem => conflictingItem.id === file.id) &&
                        <>
                            <AiOutlineExclamation className="conflict-icon"/>
                            <span className="tooltip">Cannot move: conflicting<br/>name in target folder</span>
                        </>
                    }
                </span>
                <span 
                    className="text-cont" 
                    tabIndex={0}
                    aria-label="File"
                >
                    {file.name}
                </span>
            </p>
            <p>{file.type}</p>
            <p>{formattedSize}</p>
            <p>{formattedDate}</p>
        </div>
    )
}

export default memo(File)
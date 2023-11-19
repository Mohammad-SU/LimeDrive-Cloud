import { memo, useState, useEffect, useRef } from 'react'
import { DateTime } from 'luxon';
import { useNavigate } from 'react-router-dom';
import { FolderType } from '../../../types';
import { useFileContext } from '../../../contexts/FileContext';
import { useDraggable, useDroppable, useDndMonitor } from '@dnd-kit/core';
import { AiOutlineFolder, AiOutlineExclamation} from 'react-icons/ai';
import Checkbox from '../Checkbox-comp/Checkbox';

interface FolderProps {
    folder: FolderType;
    onSelect: (item: FolderType, event: React.MouseEvent<HTMLDivElement>, isItemSelected: boolean) => void;
}

function Folder({ folder, onSelect }: FolderProps) {
    const [isSelected, setIsSelected] = useState(false)
    const [showCheckbox, setShowCheckbox] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [isConflicting, setIsConflicting] = useState(false)
    const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [showSelectDelayed, setShowSelectDelayed] = useState(false) // For select-delayed class since (clickTimeoutRef.current != null) doesnt apply the class for some reason
    const { selectedItems, currentPath, conflictingItems, processingItems } = useFileContext()

    function handleFolderClick(event: React.MouseEvent<HTMLDivElement>) {
        if (isProcessing) return
        
        const isCtrlPressed = event.ctrlKey || event.metaKey;
        const isShiftPressed = event.shiftKey;
        const isCheckboxClicked = (event.target instanceof HTMLElement && event.target.hasAttribute('data-checkbox'))
        let newIsSelected: boolean;

        if (isCtrlPressed || isCheckboxClicked) {
            newIsSelected = !isSelected
            setIsSelected(newIsSelected);
            onSelect(folder, event, newIsSelected);
        }
        else if (isShiftPressed) {
            newIsSelected = true
            onSelect(folder, event, newIsSelected);
        }
        else {
            newIsSelected = true
            setShowSelectDelayed(true)

            if (event.detail === 2 && clickTimeoutRef.current != null) { // If double clicked, prevent selection
                clearTimeout(clickTimeoutRef.current);
                clickTimeoutRef.current = null;
                setShowSelectDelayed(false)
            }
            else {
                const timeout = setTimeout(() => {
                    setIsSelected(newIsSelected);
                    onSelect(folder, event, newIsSelected);
                    clickTimeoutRef.current = null;
                    setShowSelectDelayed(false)
                }, 200);
    
                clickTimeoutRef.current = timeout;
            }
        }
    }

    useEffect(() => { // Ensure correct rendering of selected folder
        setIsSelected(selectedItems.some(selectedItem => selectedItem.id === folder.id));
        selectedItems.length > 0 ? setShowCheckbox(true) : setShowCheckbox(false)
    }, [selectedItems]);
    useEffect(() => {
        const newIsProcessing = processingItems.some(processingItem => processingItem.id === folder.id)
        setIsProcessing(newIsProcessing)
    }, [processingItems]);
    useEffect(() => {
        const newIsConflicting = conflictingItems.some(conflictingItem => conflictingItem.id === folder.id)
        setIsConflicting(newIsConflicting)
    }, [conflictingItems]);

    const {attributes, listeners, isDragging, setNodeRef: dragSetNodeRef} = useDraggable({
        id: folder.id,
        data: folder,
        attributes: {
            tabIndex: -1,
        },
        disabled: isProcessing,
    });

    const {isOver, setNodeRef: dropSetNodeRef} = useDroppable({
        id: folder.id,
        data: folder,
        disabled: isProcessing,
    });

    const [sameDragAndDropId, setSameDragAndDropId] = useState(false)
    const [isSelectDragging, setIsSelectDragging] = useState(false)
    useDndMonitor({
        onDragStart() {
            if (isSelected) {
                setIsSelectDragging(true)
            }
        },
        onDragOver(event) {
            event.active.id == event.over?.id ?
                setSameDragAndDropId(true) 
                : setSameDragAndDropId(false)
        },
        onDragEnd() {
            setIsSelectDragging(false)
        },
    });

    useEffect(() => {
        function handleEscapeKey(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsSelectDragging(false);
                if (clickTimeoutRef.current !== null) {
                    clearTimeout(clickTimeoutRef.current)
                }
                clickTimeoutRef.current = null
                setShowSelectDelayed(false)
            }
        }
        window.addEventListener('keydown', handleEscapeKey);
        return () => {
            window.removeEventListener('keydown', handleEscapeKey);
        };
    }, []);

    const navigate = useNavigate()
    const openFolder = (event: React.MouseEvent | React.KeyboardEvent) => {
        event.stopPropagation();
        if (isProcessing) {
            return
        }
        const isCheckboxClicked = (event.target instanceof HTMLElement && event.target.hasAttribute('data-checkbox'))

        if (!isCheckboxClicked) {
            const firstSlashIndex = currentPath.indexOf('/');
            const newPath = currentPath.substring(firstSlashIndex + 1)
            navigate((newPath + folder.name).replace(/[^\/]+/g, (match) => encodeURIComponent(match))) // encode but excluding slashes
        }
    }

    function formatDate(date: Date) {
        const dateTime = DateTime.fromJSDate(date).toLocal();
        return dateTime.toFormat('dd/MM/yyyy HH:mm');
    }
    const formattedDate = formatDate(new Date(folder.date));

    return (
        <div // Dont give style when dropped on but prevent drag operations in filecontext if its in processing items and user tries to move it
            className={`Folder 
                ${isSelected ? 'selected' : ''}
                ${showSelectDelayed ? 'select-delayed' : ''}
                ${isOver && !sameDragAndDropId && !isSelected ? 'over' : ''}
                ${isDragging || isSelectDragging ? 'dragging' : ''}
                ${isProcessing ? 'processing' : ''}
            `}
            id={folder.id}
            onClick={handleFolderClick}
            onDoubleClick={openFolder}
            ref={(node) => {
                dragSetNodeRef(node);
                dropSetNodeRef(node);
            }}
            {...listeners}
            {...attributes}
        >
            <Checkbox
                className={`list-checkbox ${showCheckbox && !isProcessing ? "show-checkbox" : 'hide-checkbox'}`}
                checked={isSelected}
            />
            <p className="name">
                <span className="icon-cont">
                    <AiOutlineFolder className="main-icon" />
                    {isConflicting &&
                        <>
                            <AiOutlineExclamation className="conflict-icon"/>
                            <span className="tooltip">Cannot move: conflicting<br/>name in target directory</span>
                        </>
                    }
                </span>
                <span 
                    className="text-cont"
                    onClick={openFolder} 
                    tabIndex={0}
                    // onKeyDown={(event) => { // Might include different function from click?
                    //     if (event.key === 'Enter') {
                    //         openFolder(event);
                    //     }
                    // }}
                    aria-label="Folder"
                >
                    {folder.name}
                </span>
            </p>
            <p>--</p>
            <p>--</p>
            <p>{formattedDate}</p>
        </div>
    )
}

export default memo(Folder)
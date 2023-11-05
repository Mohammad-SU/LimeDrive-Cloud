import { memo, useState, useEffect } from 'react'
import { DateTime } from 'luxon';
import { useNavigate } from 'react-router-dom';
import "./Folder.scss"
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
    const [isSelectDelayed, setIsSelectDelayed] = useState(false);
    const [showCheckbox, setShowCheckbox] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [isDroppedOn, setIsDroppedOn] = useState(false)
    const [isConflicting, setIsConflicting] = useState(false)
    const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);
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
        else {
            newIsSelected = true
            setIsSelectDelayed(true)

            if (clickTimeout !== null) { // If a timeout was set, clear it to prevent the selection
                clearTimeout(clickTimeout);
                setClickTimeout(null);
            }
            if (event.detail === 2) { // If double clicked, prevent selection
                setIsSelectDelayed(false)
                return;
            }
            const timeout = setTimeout(() => {
                setIsSelected(newIsSelected);
                setIsSelectDelayed(false)
                onSelect(folder, event, newIsSelected);
            }, 200);

            setClickTimeout(timeout);
        }
    }

    useEffect(() => { // Ensure correct rendering of selected folder
        setIsSelected(selectedItems.some(selectedItem => selectedItem.id === folder.id));
        selectedItems.length > 0 ? setShowCheckbox(true) : setShowCheckbox(false)
    }, [selectedItems]);
    useEffect(() => {
        const newIsProcessing = processingItems.some(sentItem => sentItem.id === folder.id)
        setIsProcessing(newIsProcessing)
        if (!newIsProcessing) {
            setIsDroppedOn(false)
        }
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
        onDragEnd(event) {
            if (event.over?.id === folder.id) {
                setIsDroppedOn(true)
            }
            setIsSelectDragging(false)
        },
    });

    const navigate = useNavigate()
    const openFolder = (event: React.MouseEvent | React.KeyboardEvent) => {
        event.stopPropagation();
        const isCheckboxClicked = (event.target instanceof HTMLElement && event.target.hasAttribute('data-checkbox'))

        if (!isCheckboxClicked) {
            const firstSlashIndex = currentPath.indexOf('/');
            const newPath = currentPath.substring(firstSlashIndex + 1);
            navigate(newPath + folder.name);
        }
    }

    function formatDate(date: Date) {
        const dateTime = DateTime.fromJSDate(date).toLocal();
        return dateTime.toFormat('dd/MM/yyyy HH:mm');
    }
    const formattedDate = formatDate(new Date(folder.date));

    return (
        <div 
            className={`
                Folder ${isSelected ? 'selected' : ''}
                ${isSelectDelayed ? 'select-delayed' : ''}
                ${isOver && !sameDragAndDropId && !isSelected ? 'over' : ''}
                ${isDragging || isSelectDragging ? 'dragging' : ''}
                ${isProcessing ? 'processing' : ''}
                ${isDroppedOn && isProcessing ? 'dropped-on' : ''}
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
                    onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                            openFolder(event);
                        }
                    }}
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
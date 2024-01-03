import { useState, memo, useRef } from 'react';
import "./Search.scss";
import { ItemTypes } from '../../../types';
import { BsSearch } from "react-icons/bs";
import { useFileContext } from '../../../contexts/FileContext';
import { DateTime } from 'luxon';
import { AiOutlineFolder, AiOutlineFile } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import useUnfocusPopup from '../../../hooks/useUnfocusPopup';

function Search() {
    const { files, folders, setScrollTargetId } = useFileContext()
    const navigate = useNavigate()
    const searchRef = useRef<HTMLDivElement | null>(null)
    const [showResultsList, setShowResultsList] = useState(false)
    useUnfocusPopup(searchRef, () => {
        setShowResultsList(false);
    });
    const [searchTerm, setSearchTerm] = useState('');

    const filteredFiles = files.filter((file) =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredFolders = folders.filter((folder) =>
        folder.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredItems = [...filteredFolders, ...filteredFiles];

    const getParentFolderName = (appPath: string): string => {
        const pathParts = appPath.split('/');
        return pathParts[pathParts.length - 2];
    }

    const formatDate = (date: Date) => {
        const dateTime = DateTime.fromJSDate(date).toLocal();
        const today = DateTime.local().startOf('day');

        if (dateTime >= today) {
            return dateTime.toFormat('HH:mm');
        } else {
            return dateTime.toFormat('dd/MM/yyyy');
        }
    }

    const onResultItemClick = (item: ItemTypes, event: React.MouseEvent) => {
        let path = item.app_path

        if (Number.isInteger(item.id)) { // File
            const lastSlashIndex = item.app_path.lastIndexOf('/');
            path = item.app_path.substring(0, lastSlashIndex)
            setScrollTargetId(item.id)
        }

        const pathToNavigate = "/" + (path).replace(/[^\/]+/g, (match) => encodeURIComponent(match))
        const isCtrlPressed = event.ctrlKey || event.metaKey;
        const isShiftPressed = event.shiftKey;

        isCtrlPressed || isShiftPressed ? 
            window.open(pathToNavigate, '_blank')
        : navigate(pathToNavigate);

        setShowResultsList(false)
        setSearchTerm('')
    }

    return (
        <div className="Search" ref={searchRef}>
            <BsSearch className="search-icon" />
            <input
                className="search-input"
                type="text"
                placeholder="Search..."
                maxLength={40000}
                name="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={() => setShowResultsList(true)}
            />
            {(searchTerm !== '' && showResultsList) &&
                <div className="results-list">
                    {filteredItems.length === 0 ?
                        <p className="no-results">No results</p>
                        :
                        filteredItems.map((item) => (
                            <div className="result-item" key={item.id} onClick={(e) => onResultItemClick(item, e)}>
                                {item.id.toString().startsWith("d_") ?
                                    <AiOutlineFolder className="icon" />
                                    : <AiOutlineFile className="icon" />
                                }
                                <div className="details-cont">
                                    <div className="name-and-path-cont">
                                        <p className="name">{item.name}</p>
                                        <p className="app-path">
                                            {getParentFolderName(item.app_path)}
                                        </p>
                                    </div>
                                    <p>{formatDate(new Date(item.date))}</p>
                                </div>
                            </div>
                        ))
                    }
                </div>
            }
        </div>
    );
}

export default memo(Search);
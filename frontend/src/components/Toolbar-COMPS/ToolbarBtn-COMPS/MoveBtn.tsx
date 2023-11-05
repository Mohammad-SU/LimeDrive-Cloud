import "./MoveBtn.scss"
import { memo, useState, useEffect } from 'react'
import { useFileContext } from '../../../contexts/FileContext'
import Modal from '../../Modal-comp/Modal'
import { SlCursorMove } from 'react-icons/sl'
import { AiOutlineFolder } from 'react-icons/ai';
import Breadcrumb from "../../FileList-COMPS/Breadcrumb-comp/Breadcrumb"

function MoveBtn() {
    const { folders, currentPath, selectedItems } = useFileContext()
    const [showMoveModal, setShowMoveModal] = useState(false)
    const [moveListPath, setMoveListPath] = useState(currentPath)
    useEffect(() => {
        setMoveListPath(currentPath);
    }, [currentPath]);

    const MoveListFolders = folders.filter((folder) => {
            const lastSlashIndex = folder.app_path.lastIndexOf('/');
            return folder.app_path.substring(0, lastSlashIndex + 1) === moveListPath;
        })
        .sort((a, b) => a.name.localeCompare(b.name)); // A-Z

    const openFolder = (event: React.MouseEvent | React.KeyboardEvent, folderName: string) => {
        event.stopPropagation();
        const firstSlashIndex = moveListPath.indexOf('/');
        const newPath = "LimeDrive/" +  moveListPath.substring(firstSlashIndex + 1);
        setMoveListPath(newPath + folderName + "/")
    }

    return (
        <>
            <button className="MoveBtn" onClick={() => setShowMoveModal(true)}>
                <SlCursorMove className="tool-icon move"/>
                Move
            </button>

            <Modal 
                className="move-modal"
                render={showMoveModal}
                clipPathId="moveModalClip"
                onBackdropClick={() => setShowMoveModal(false)}
                // Add close click instead of backdrop click, add option to show close btn on modal component
            >
                <h1>
                    Move {selectedItems.length} {selectedItems.length > 1 ? 'items' : 'item'} to...
                </h1>
                <Breadcrumb path={moveListPath} setPath={setMoveListPath} btnType={true}/>
                <div className="move-list">
                    {MoveListFolders.map((folder, index) => (
                        <div 
                            className="folder" 
                            key={index} 
                            onClick={(event) => openFolder(event, folder.name)}
                        >
                            <AiOutlineFolder className="folder-icon" />
                            {folder.name}
                        </div>
                    ))}
                </div>

                <div className="modal-btn-cont">
                    <button className='modal-cancel-btn' onClick={() => setShowMoveModal(false)} disabled={false}>
                        Cancel
                    </button>
                    <button 
                        className='modal-primary-btn'
                        disabled={false}
                    >
                        Move
                    </button>
                </div>
            </Modal>
        </>
    )
}

export default memo(MoveBtn)
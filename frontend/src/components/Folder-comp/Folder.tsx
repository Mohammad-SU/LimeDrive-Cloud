import { memo } from 'react'
import "./Folder.scss"
import { FolderType } from '../../types';

interface FolderProps {
    folder: FolderType;
}

function Folder({ folder }: FolderProps) {
    return (
        <div className="Folder">
            <p className="folder-name">{folder.name}</p>
        </div>
    )
}

export default memo(Folder)

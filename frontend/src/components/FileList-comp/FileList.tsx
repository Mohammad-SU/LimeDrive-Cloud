import { memo } from 'react'
import "./FileList.scss"
import { useFileContext } from '../../contexts/FileContext'
import Folder from "../Folder-comp/Folder"
import File from "../File-comp/File"

function FileList() {
    const { files, folders } = useFileContext()

    const foldersMapped = folders.map(folder => {
        return <Folder 
            key={folder.id}
            folder={folder} // map entire folder object
        />
    })

    const filesMapped = files.map(file => {
        return <File 
            key={file.id}
            file={file}
        />
    })

    return (
        <div className="FileList">
            <div className="header-row">
                <p className="name-header">Name</p>
                <p>Type</p>
                <p>Extension</p>
                <p>Size</p>
                <p>Date (D/M/Y)</p>
            </div>
            <div className="main-list">
                {foldersMapped}
                {filesMapped}
            </div>
        </div>
    )
}

export default memo(FileList)
import { memo, useMemo } from 'react'
import "./FileList.scss"
import { useFileContext } from '../../contexts/FileContext'
import Folder from "../Folder-comp/Folder"
import File from "../File-comp/File"

function FileList() {
    const { files, folders, selectedFiles } = useFileContext()

    const sortedFiles = useMemo(() => {
        return files.slice().sort((a, b) => { // Sort so most recent files will be at the beginning
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB.getTime() - dateA.getTime();
        });
    }, [files]);

    const sortedFolders = useMemo(() => {
        return folders.slice().sort((a, b) => {
            return a.name.localeCompare(b.name); // Sort A-Z by folder name
        });
    }, [folders]);

    const foldersMapped = sortedFolders.map(folder => {
        return <Folder 
            key={folder.id}
            folder={folder} // map entire folder object
        />
    })

    const filesMapped = sortedFiles.map(file => {
        return <File 
            key={file.id}
            file={file}
        />
    })

    console.log(selectedFiles)

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
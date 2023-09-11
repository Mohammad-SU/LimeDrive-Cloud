import { memo } from 'react'
import "./FileList.scss"
import File from "../File-comp/File"
import { FileType } from '../../types/index.ts'

function FileList() {
    const files: FileType[] = [
    ]

    const filesMapped = files.map(file => {
        return <File 
            key={file.id}
            file={file} // Pass the entire file object as prop
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
            {filesMapped}
        </div>
    )
}

export default memo(FileList)
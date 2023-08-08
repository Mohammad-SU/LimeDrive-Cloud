import { useState, memo } from 'react'
import "./FileList.scss"
import File from "../File-comp/File"
import { FileType } from '../../types/index.ts';

interface FileListProps {
    files: FileType[];
}

function FileList({ files }: FileListProps) {
    const filesMapped = files.map(file => {
        return <File 
            key={file.id}
            file={file} // Pass the entire file object as prop
        />
    })

    return (
        <div className="FileList">
            {filesMapped}
        </div>
    )
}

export default memo(FileList)
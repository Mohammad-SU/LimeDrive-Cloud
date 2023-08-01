import { useState, memo } from 'react'
import "./FileList.scss"
import File from "../File-comp/File"

function FileList({ files }) {
    const filesMapped = files.map(file => {
        return <File 
            key={file.id}
            id={file.id}
            name={file.name}
            path={file.path}
            date={file.date}
            type={file.type}
            size={file.size}
        />
    })

    return (
        <div className="FileList">
            {filesMapped}
        </div>
    )
}

export default memo(FileList)
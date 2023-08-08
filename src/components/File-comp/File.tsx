import { useState, memo } from 'react'
import "./File.scss"
import { FileType } from '../../types/index.ts';

interface FileProps {
    file: FileType;
}

function File({ file }: FileProps) {
    return (
        <div className="File">
            <p>ID = {file.id}</p>
            <p>Name = {file.name}</p>
            <p>Path: {file.path}</p>
            <p>Date: {file.date.toISOString()}</p>
            <p>Type: {file.type}</p>
            <p>Size: {file.size}</p>
        </div>
    )
}

export default memo(File)

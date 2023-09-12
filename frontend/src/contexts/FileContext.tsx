import { createContext, useContext, useState } from 'react'
import { FileType } from '../types'
import { FolderType } from '../types'

interface FileContextType {
  files: FileType[]
  folders: FolderType[]
  addFile: (file: FileType) => void
  addFolder: (folder: FolderType) => void
  // Add more functions to manipulate files and folders if needed
}

const FileContext = createContext<FileContextType | undefined>(undefined)

export function useFileContext() {
    const context = useContext(FileContext)
    if (!context) {
        throw new Error('useFileContext must be used within a FileContextProvider')
    }
    return context;
}

export function FileProvider({ children }: { children: React.ReactNode }) {
    const [files, setFiles] = useState<FileType[]>([])
    const [folders, setFolders] = useState<FolderType[]>([])

    const addFile = (file: FileType) => {
        setFiles((prevFiles) => [...prevFiles, file])
    }

    const addFolder = (folder: FolderType) => {
        setFolders((prevFolders) => [...prevFolders, folder])
    }

    return (
        <FileContext.Provider value={{ files, folders, addFile, addFolder }}>
            {children}
        </FileContext.Provider>
    )
}
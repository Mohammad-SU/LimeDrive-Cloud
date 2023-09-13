import { createContext, useContext, useState } from 'react'
import { FileType } from '../types'
import { FolderType } from '../types'

interface FileContextType {
  files: FileType[]
  folders: FolderType[]
  addFiles: (files: FileType[]) => void;
  addFolders: (folders: FolderType[]) => void
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

    const addFiles = (newFiles: FileType[]) => {
        let filesToAdd = Array.isArray(newFiles) ? newFiles : [newFiles]
        setFiles((prevFiles) => [...prevFiles, ...filesToAdd])
        filesToAdd = [] // Empty to prevent duplicates due to re-renders
    }

    const addFolders = (newFolders: FolderType[]) => {
        let foldersToAdd = Array.isArray(newFolders) ? newFolders : [newFolders]
        setFolders((prevFolders) => [...prevFolders, ...foldersToAdd])
        foldersToAdd = []
    }

    return (
        <FileContext.Provider value={{ files, folders, addFiles, addFolders }}>
            {children}
        </FileContext.Provider>
    )
}
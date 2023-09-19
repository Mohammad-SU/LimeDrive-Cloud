import { createContext, useContext, useState } from 'react'
import { FileType } from '../types'
import { FolderType } from '../types'

interface FileContextType {
  files: FileType[]
  folders: FolderType[]

  addFiles: (files: FileType[]) => void;
  addFolders: (folders: FolderType[]) => void

  setFiles: React.Dispatch<React.SetStateAction<FileType[]>>;
  setFolders: React.Dispatch<React.SetStateAction<FolderType[]>>;

  selectedFiles: FileType[];
  addToSelectedFiles: (file: FileType) => void; // add to selectedFiles array, etc.
  removeFromSelectedFiles: (file: FileType) => void;

  selectedFolders: FolderType[];
  addToSelectedFolders: (folder: FolderType) => void;
  removeFromSelectedFolders: (folder: FolderType) => void;
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

    const [selectedFiles, setSelectedFiles] = useState<FileType[]>([])
    const [selectedFolders, setSelectedFolders] = useState<FolderType[]>([])

    const addToSelectedFiles = (file: FileType) => {
        setSelectedFiles((prevSelectedFiles) => [...prevSelectedFiles, file])
    }
    const removeFromSelectedFiles = (file: FileType) => {
        setSelectedFiles((prevSelectedFiles) => prevSelectedFiles.filter((f) => f.id !== file.id))
    }
    const addToSelectedFolders = (folder: FolderType) => {
        setSelectedFolders((prevSelectedFolders) => [...prevSelectedFolders, folder])
    }
    const removeFromSelectedFolders = (folder: FolderType) => {
        setSelectedFolders((prevSelectedFolders) =>
            prevSelectedFolders.filter((f) => f.id !== folder.id)
        )
    }

    return (
        <FileContext.Provider value={{
            files,
            folders,
            setFiles,
            setFolders,
            addFiles,
            addFolders,
            selectedFiles,
            addToSelectedFiles,
            removeFromSelectedFiles,
            selectedFolders,
            addToSelectedFolders,
            removeFromSelectedFolders,
        }}>
            {children}
        </FileContext.Provider>
    )
}
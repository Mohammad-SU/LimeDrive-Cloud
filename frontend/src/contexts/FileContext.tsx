import { createContext, useContext, useState } from 'react'
import { FileType } from '../types'
import { FolderType } from '../types'

interface FileContextType {
  files: FileType[]
  folders: FolderType[]
  setFiles: React.Dispatch<React.SetStateAction<FileType[]>>;
  setFolders: React.Dispatch<React.SetStateAction<FolderType[]>>;

  addFiles: (files: FileType[]) => void;
  addFolders: (folders: FolderType[]) => void

  selectedItems: (FileType | FolderType)[];
  setSelectedItems: React.Dispatch<React.SetStateAction<(FileType | FolderType)[]>>;
  addToSelectedItems: (item: FileType | FolderType) => void;
  removeFromSelectedItems: (item: FileType | FolderType) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined)
// CHECK IF ARRAY IS DUPLICATED OR ONLY FILELIST MAP
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
        console.trace('addFiles function called');
        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
    const addFolders = (newFolders: FolderType[]) => {
        setFolders((prevFolders) => [...prevFolders, ...newFolders]);
    }

    const [selectedItems, setSelectedItems] = useState<(FileType | FolderType)[]>([]);

    const addToSelectedItems = (item: FileType | FolderType) => {
        setSelectedItems((prevSelected) => {
            if (prevSelected.some((selectedItem) => selectedItem.id === item.id)) {
                return prevSelected
            }
            return [...prevSelected, item]
        })
    }
    const removeFromSelectedItems = (item: FileType | FolderType) => {
        setSelectedItems((prevSelected) => {
            return prevSelected.filter((selectedItem) => selectedItem.id !== item.id);
        })
    }
    
    return (
        <FileContext.Provider value={{
            files,
            folders,
            setFiles,
            setFolders,

            addFiles,
            addFolders,

            selectedItems,
            setSelectedItems,
            addToSelectedItems,
            removeFromSelectedItems
        }}>
            {children}
        </FileContext.Provider>
    )
}
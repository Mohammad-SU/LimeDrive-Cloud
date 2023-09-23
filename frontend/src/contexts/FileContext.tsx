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
  addToSelectedItems: (item: (FileType | FolderType)[]) => void;
  removeFromSelectedItems: (item: (FileType | FolderType)[]) => void;
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

    const addFiles = (newFiles: FileType[]) => { // Filter out new files that already exist in the current state
        setFiles((prevFiles) => {
            const uniqueNewFiles = newFiles.filter((newFile) => {
                return !prevFiles.some((prevFile) => prevFile.id === newFile.id);
            });

            return [...prevFiles, ...uniqueNewFiles];
        });
    };

    const addFolders = (newFolders: FolderType[]) => {
        setFolders((prevFolders) => {
            const uniqueNewFolders = newFolders.filter((newFolder) => {
                return !prevFolders.some((prevFolder) => prevFolder.id === newFolder.id);
            });
        
            return [...prevFolders, ...uniqueNewFolders];
        });
    };

    const [selectedItems, setSelectedItems] = useState<(FileType | FolderType)[]>([]);

    const addToSelectedItems = (items: (FileType | FolderType) | (FileType | FolderType)[]) => {
        setSelectedItems((prevSelected) => {
            const itemsArray = Array.isArray(items) ? items : [items]; // Convert singular to array
            const newItems = itemsArray.filter((item) => // Filter out items that are already selected
                !prevSelected.some((selectedItem) => selectedItem.id === item.id)
            );
            return [...prevSelected, ...newItems];
        });
    };

    const removeFromSelectedItems = (items: (FileType | FolderType) | (FileType | FolderType)[]) => {
        setSelectedItems((prevSelected) => {
            const itemsArray = Array.isArray(items) ? items : [items];
            const newSelected = prevSelected.filter((prevItem) => // Filter out items to be removed
                !itemsArray.some((item) => item.id === prevItem.id)
            );
            return newSelected;
        });
    };
    
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
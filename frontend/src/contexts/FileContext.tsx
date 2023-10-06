import { useMemo, createContext, useContext, useState } from 'react'
import { FileType } from '../types'
import { FolderType } from '../types'

interface FileContextType {
    currentPath: string

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

export function useFileContext() {
    const context = useContext(FileContext)
    if (!context) {
        throw new Error('useFileContext must be used within a FileContextProvider')
    }
    return context;
}

export function FileProvider({ children }: { children: React.ReactNode }) {
    const [currentPath, setCurrentPath] = useState('all-files/'); // Change whenever user opens a folder, e.g. to all-files/documents/. Should be set to all-files/ by default/when user is on a separate page

    const [files, setFiles] = useState<FileType[]>([])
    const [folders, setFolders] = useState<FolderType[]>([])
    const [selectedItems, setSelectedItems] = useState<(FileType | FolderType)[]>([]);

    const addFiles = (newFiles: FileType | FileType[]) => { // Filter out new files that already exist in the current state
        setFiles((prevFiles) => {
            const newFilesArray = Array.isArray(newFiles) ? newFiles : [newFiles];
            const uniqueNewFiles = newFilesArray.filter((newFile) => {
                return !prevFiles.some((prevFile) => prevFile.id === newFile.id);
            });

            return [...prevFiles, ...uniqueNewFiles];
        });
    };

    const addFolders = (newFolders: FolderType | FolderType[]) => {
        setFolders((prevFolders) => {
            const newFoldersArray = Array.isArray(newFolders) ? newFolders : [newFolders];
            const uniqueNewFolders = newFoldersArray.filter((newFolder) => {
                return !prevFolders.some((prevFolder) => prevFolder.id === newFolder.id);
            });
        
            return [...prevFolders, ...uniqueNewFolders];
        });
    };

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
    
    const contextValue: FileContextType = useMemo(() => {
        return {
            currentPath,

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
        };
    }, [currentPath, files, folders, selectedItems])

    return (
        <FileContext.Provider value={contextValue}>
            {children}
        </FileContext.Provider>
    )
}
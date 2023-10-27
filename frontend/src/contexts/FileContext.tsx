import { useMemo, createContext, useContext, useState } from 'react'
import { FileType } from '../types'
import { FolderType } from '../types'
import { ItemTypes } from '../types'

interface FileContextType {
    currentPath: string
    setCurrentPath: React.Dispatch<React.SetStateAction<string>>

    files: FileType[]
    folders: FolderType[]
    setFiles: React.Dispatch<React.SetStateAction<FileType[]>>;
    setFolders: React.Dispatch<React.SetStateAction<FolderType[]>>;

    addFiles: (files: FileType[]) => void;
    addFolders: (folders: FolderType[]) => void

    updateFiles: (updates: { [fileId: string]: Partial<FileType> }) => void;
    updateFolders: (updates: { [folderId: string]: Partial<FolderType> }) => void;

    selectedItems: ItemTypes[];
    setSelectedItems: React.Dispatch<React.SetStateAction<ItemTypes[]>>;
    addToSelectedItems: (item: ItemTypes[]) => void;
    removeFromSelectedItems: (item: ItemTypes[]) => void;

    conflictingItems: ItemTypes[];
    setConflictingItems: React.Dispatch<React.SetStateAction<ItemTypes[]>>;

    processingItems: ItemTypes[];
    setProcessingItems: React.Dispatch<React.SetStateAction<ItemTypes[]>>;
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
    const [currentPath, setCurrentPath] = useState("LimeDrive/"); // Change whenever user opens a folder, e.g. to LimeDrive/documents. Should be set to LimeDrive/ by default/when user is on a separate page

    const [files, setFiles] = useState<FileType[]>([])
    const [folders, setFolders] = useState<FolderType[]>([])
    const [selectedItems, setSelectedItems] = useState<ItemTypes[]>([]);
    const [processingItems, setProcessingItems] = useState<ItemTypes[]>([]);
    const [conflictingItems, setConflictingItems] = useState<ItemTypes[]>([]);

    const addFiles = (newFiles: FileType[]) => { // Filter out new files that already exist in the current state
        setFiles((prevFiles) => {
            const newFilesArray = Array.isArray(newFiles) ? newFiles : [newFiles];
            const uniqueNewFiles = newFilesArray.filter((newFile) => {
                return !prevFiles.some((prevFile) => prevFile.id === newFile.id);
            });

            return [...prevFiles, ...uniqueNewFiles];
        });
    };

    const addFolders = (newFolders: FolderType[]) => {
        setFolders((prevFolders) => {
            const newFoldersArray = Array.isArray(newFolders) ? newFolders : [newFolders];

            const foldersWithPrefixedIds = newFoldersArray.map((folder) => ({ // Add the "d_" prefix to the IDs of the new folders to prevent conflicts with file IDs
                ...folder,
                id: `d_${folder.id}`,
            }));

            const uniqueNewFolders = foldersWithPrefixedIds.filter((newFolder) => {
                return !prevFolders.some((prevFolder) => prevFolder.id === newFolder.id);
            });

            return [...prevFolders, ...uniqueNewFolders];
        });
    };

    const updateFiles = (updates: { [fileId: string]: Partial<FileType> }) => {
        setFiles((prevFiles) => {
            const updatedFiles = prevFiles.map((file) => {
                const update = updates[file.id];
                if (update) {
                    return { ...file, ...update };
                }
                return file;
            });
            return updatedFiles;
        });
    };

    const updateFolders = (updates: { [folderId: string]: Partial<FolderType> }) => {
        setFolders((prevFolders) => {
            const updatedFolders = prevFolders.map((folder) => {
                const update = updates[folder.id];
                if (update) {
                    return { ...folder, ...update };
                }
                return folder;
            });
            return updatedFolders;
        });
    };

    const addToSelectedItems = (items: ItemTypes[]) => {
        setSelectedItems((prevSelected) => {
            const itemsArray = Array.isArray(items) ? items : [items];
            const newItems = itemsArray.filter((item) => // Filter out items that are already selected
                !prevSelected.some((selectedItem) => selectedItem.id === item.id)
            );
            return [...prevSelected, ...newItems];
        });
    };

    const removeFromSelectedItems = (items: ItemTypes[]) => {
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
            setCurrentPath,

            files,
            folders,
            setFiles,
            setFolders,

            addFiles,
            addFolders,

            updateFiles,
            updateFolders,

            selectedItems,
            setSelectedItems,
            addToSelectedItems,
            removeFromSelectedItems,

            conflictingItems,
            setConflictingItems,
            processingItems,
            setProcessingItems,
        };
    }, [currentPath, files, folders, selectedItems, conflictingItems, processingItems])

    return (
        <FileContext.Provider value={contextValue}>
            {children}
        </FileContext.Provider>
    )
}
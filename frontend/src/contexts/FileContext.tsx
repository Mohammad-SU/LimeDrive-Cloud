import { useMemo, createContext, useContext, useState } from 'react'
import { FileType } from '../types'
import { FolderType } from '../types'
import { ItemTypes } from '../types'
import { useToast } from './ToastContext'
import axios, { AxiosInstance } from 'axios'

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

    fileToView: FileType | null
    setFileToView: React.Dispatch<React.SetStateAction<FileType | null>>;

    selectedItems: ItemTypes[];
    setSelectedItems: React.Dispatch<React.SetStateAction<ItemTypes[]>>;
    addToSelectedItems: (item: ItemTypes[]) => void;
    removeFromSelectedItems: (item: ItemTypes[]) => void;

    filterItemsByPath: (items: ItemTypes[], path: string) => ItemTypes[];

    conflictingItems: ItemTypes[];
    setConflictingItems: React.Dispatch<React.SetStateAction<ItemTypes[]>>;
    sameFolderConflictingItems: FolderType[]
    setSameFolderConflictingItems: React.Dispatch<React.SetStateAction<FolderType[]>>;
    handleMoveItems: (itemsToMove: ItemTypes[], targetFolder: FolderType, apiSecure: AxiosInstance) => void;
    processingItems: ItemTypes[];
    addToProcessingItems: (item: ItemTypes[]) => void;
    removeFromProcessingItems: (item: ItemTypes[]) => void;
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
    const [fileToView, setFileToView] = useState<FileType | null>(null)
    const [selectedItems, setSelectedItems] = useState<ItemTypes[]>([]);
    const [processingItems, setProcessingItems] = useState<ItemTypes[]>([]);
    const [conflictingItems, setConflictingItems] = useState<ItemTypes[]>([]);
    const [sameFolderConflictingItems, setSameFolderConflictingItems] = useState<FolderType[]>([])
    const { showToast } = useToast()

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

    const addItems = (newItems: ItemTypes[], setState: React.Dispatch<React.SetStateAction<ItemTypes[]>>) => {
        setState((prevItems) => {
            const itemsArray = Array.isArray(newItems) ? newItems : [newItems];
            const uniqueNewItems = itemsArray.filter((item) =>
                !prevItems.some((prevItem) => prevItem.id === item.id)
            );
            return [...prevItems, ...uniqueNewItems];
        });
    };

    const removeItems = (items: ItemTypes[], setState: React.Dispatch<React.SetStateAction<ItemTypes[]>>) => {
        setState((prevItems) => {
            const itemsArray = Array.isArray(items) ? items : [items];
            const newItems = prevItems.filter((prevItem) =>
                !itemsArray.some((item) => item.id === prevItem.id)
            );
            return newItems;
        });
    };

    const addToSelectedItems = (newItems: ItemTypes[]) => addItems(newItems, setSelectedItems);
    const removeFromSelectedItems = (items: ItemTypes[]) => removeItems(items, setSelectedItems);
    const addToProcessingItems = (newItems: ItemTypes[]) => addItems(newItems, setProcessingItems);
    const removeFromProcessingItems = (items: ItemTypes[]) => removeItems(items, setProcessingItems);

    const filterItemsByPath = (items: ItemTypes[], path: string): ItemTypes[] => {
        const filteredItems = items.filter(item => {
            const lastSlashIndex = item.app_path.lastIndexOf('/');
            return item.app_path.substring(0, lastSlashIndex + 1) === path;
        });
        return filteredItems;
    }

    const [conflictingItemsTimeout, setConflictingItemsTimeout] = useState<NodeJS.Timeout | null>(null);
    const handleMoveItems = async (itemsToMove: ItemTypes[], targetFolder: FolderType, apiSecure: AxiosInstance) => {
        if (processingItems.some(processingItem => processingItem.id === targetFolder.id)) {
            return showToast({message: `Cannot move: target folder is currently being processed.`, showFailIcon: true});
        } else if (itemsToMove.some(itemToMove => processingItems.some(processingItem => processingItem.id === itemToMove.id))) {
            return showToast({message: `Cannot move: one or more selected items are currently being processed.`, showFailIcon: true});
        }

        const foldersToMove = itemsToMove.filter((item) => {
            return !item.type;
        });
        const filesToMove = itemsToMove.filter((item) => {
            return item.type;
        });

        const targetDirectFolders = filterItemsByPath(folders, targetFolder.app_path + "/")
        const targetDirectFiles = filterItemsByPath(files, targetFolder.app_path + "/")

        const newConflictingItems: ItemTypes[] = [];

        const fileConflicts = filesToMove.filter((fileToMove) => {
            return targetDirectFiles.some((fileInTarget) => fileInTarget.name === fileToMove.name);
        });

        const folderConflicts = foldersToMove.filter((folderToMove) => {
            const isSameFolder = targetFolder.app_path.startsWith(folderToMove.app_path)
            if (isSameFolder) {setSameFolderConflictingItems([folderToMove as FolderType])}
            const isSameName = targetDirectFolders.some((folderInTarget) => folderInTarget.name === folderToMove.name);
            return isSameFolder || isSameName;
        });

        newConflictingItems.push(...fileConflicts, ...folderConflicts);

        if (newConflictingItems.length > 0) {
            setConflictingItems(newConflictingItems)
            if (conflictingItemsTimeout) {
                clearTimeout(conflictingItemsTimeout);
            }
            const timeoutId = setTimeout(() => {
                setConflictingItems([]);
                setSameFolderConflictingItems([]);
            }, 8000);
            setConflictingItemsTimeout(timeoutId);
            if (newConflictingItems.length == itemsToMove.length) { // Different toast message not needed for sameFolderConflictingItems as MoveBtn.tsx handles that
                return showToast({message: `Cannot move any items: please rename or deselect items with the same name between both directories.`, showFailIcon: true});
            }
        }

        const newItemsToMove = itemsToMove.filter((itemToMove) => {
            return !newConflictingItems.some((conflictingItem) => conflictingItem.id === itemToMove.id);
        });

        try {
            const itemsToMoveData = newItemsToMove.map(item => {
                const new_path = targetFolder.app_path + "/" + item.name;
                const postId = !item.type ? // If draggedItem is a folder (id has d_ prefix on the frontend) then filter it for the backend
                    parseInt((item.id as string).substring(2))
                    : item.id

                return {
                    id: postId,
                    new_path: new_path,
                    type: item.type,
                    parent_folder_id: parseInt((targetFolder.id as string).substring(2))
                }
            })
            addToProcessingItems(newItemsToMove)
            removeFromSelectedItems(newItemsToMove)

            newItemsToMove.length == 1 && newConflictingItems.length == 0 ?
                showToast({message: "Moving 1 item...", loading: true})
            : newItemsToMove.length > 1 && newConflictingItems.length == 0 ?
                showToast({message: `Moving ${newItemsToMove.length} items...`, loading: true})
            : showToast({message: `Moving ${newItemsToMove.length} of ${itemsToMove.length} items (conflicts/errors were detected)...`, loading: true})

            const response = await apiSecure.post('/updatePaths', {
                items: itemsToMoveData
            });

            const updatedItems = response.data.updatedItems;
            const foldersToUpdate: Record<string, { app_path: string }> = {};
            const filesToUpdate: Record<number, { app_path: string }> = {};

            updatedItems.forEach((item: { id: string | number, updated_path: string }) => {
                item.id.toString().startsWith('d_') ?
                    foldersToUpdate[item.id] = { app_path: item.updated_path }
                    : filesToUpdate[item.id as number] = { app_path: item.updated_path }
            });
            const movedFiles = Object.keys(filesToUpdate)
            const movedFolders = Object.keys(foldersToUpdate)
            if (movedFiles.length > 0) {
                updateFiles(filesToUpdate);
            }
            if (movedFolders.length > 0) {
                updateFolders(foldersToUpdate);
            }

            newItemsToMove.length == 1 && newConflictingItems.length == 0 ?
                showToast({message: "1 item successfully moved.", showSuccessIcon: true})
            : newItemsToMove.length > 1 && newConflictingItems.length == 0 ?
                showToast({message: `${newItemsToMove.length} items successfully moved.`, showSuccessIcon: true})
            : showToast({message: `${newItemsToMove.length} out of ${itemsToMove.length} items were successfully moved (conflicts/errors were detected)`, showSuccessIcon: true})
        } 
        catch (error) {
            console.error(error);
            if (axios.isAxiosError(error)) {
                showToast({message: `Failed to move. Please check your connection.`, showFailIcon: true });
            }
        }
        finally {
            removeFromProcessingItems(newItemsToMove)
        }
    }
    
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

            fileToView,
            setFileToView,

            selectedItems,
            setSelectedItems,
            addToSelectedItems,
            removeFromSelectedItems,

            filterItemsByPath,

            conflictingItems,
            setConflictingItems,
            sameFolderConflictingItems,
            setSameFolderConflictingItems,
            handleMoveItems,

            processingItems,
            addToProcessingItems,
            removeFromProcessingItems,
        };
    }, [currentPath, files, folders, fileToView, selectedItems, conflictingItems, sameFolderConflictingItems, processingItems])

    return (
        <FileContext.Provider value={contextValue}>
            {children}
        </FileContext.Provider>
    )
}
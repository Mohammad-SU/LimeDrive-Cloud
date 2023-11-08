import { useMemo, createContext, useContext, useState } from 'react'
import { FileType } from '../types'
import { FolderType } from '../types'
import { ItemTypes } from '../types'
import { useToast } from './ToastContext'
import axios, { AxiosInstance } from 'axios'
import { ppid } from 'process'

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

    filterItemsByPath: (items: ItemTypes[], path: string) => ItemTypes[];

    conflictingItems: ItemTypes[];
    setConflictingItems: React.Dispatch<React.SetStateAction<ItemTypes[]>>;
    handleMoveItems: (itemsToMove: ItemTypes[], targetFolder: FolderType, apiSecure: AxiosInstance) => void;
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

    const filterItemsByPath = (items: ItemTypes[], path: string): ItemTypes[] => {
        const filteredItems = items.filter(item => {
            const lastSlashIndex = item.app_path.lastIndexOf('/');
            return item.app_path.substring(0, lastSlashIndex + 1) === path;
        });
        return filteredItems;
    }

    const [conflictingItemsTimeout, setConflictingItemsTimeout] = useState<NodeJS.Timeout | null>(null);
    const handleMoveItems = async (itemsToMove: ItemTypes[], targetFolder: FolderType, apiSecure: AxiosInstance) => {
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
            return targetDirectFolders.some((folderInTarget) => folderInTarget.name === folderToMove.name);
        });

        newConflictingItems.push(...fileConflicts, ...folderConflicts);

        if (newConflictingItems.length > 0) {
            setConflictingItems(newConflictingItems)
            if (conflictingItemsTimeout) {
                clearTimeout(conflictingItemsTimeout);
            }
            const timeoutId = setTimeout(() => {
                setConflictingItems([]);
            }, 8000);
            setConflictingItemsTimeout(timeoutId);
            if (newConflictingItems.length == itemsToMove.length) {
                return showToast({message: `Cannot move: please rename or deselect items with the same name between both directories.`, showFailIcon: true});
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
            setProcessingItems([...newItemsToMove, targetFolder])
            removeFromSelectedItems(newItemsToMove)

            newItemsToMove.length == 1 ?
                showToast({message: "Moving item...", loading: true})
                : showToast({message: `Moving ${selectedItems.length} items...`, loading: true})

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
            const movedFilesNum = Object.keys(filesToUpdate).length
            const movedFoldersNum = Object.keys(foldersToUpdate).length
            if (movedFilesNum > 0) {
                updateFiles(filesToUpdate);
            }
            if (movedFoldersNum > 0) {
                updateFolders(foldersToUpdate);
            }

            movedFilesNum + movedFoldersNum == 1 && newConflictingItems.length == 0 ?
                showToast({message: "1 item moved.", showSuccessIcon: true})
            : movedFilesNum + movedFoldersNum > 1 && newConflictingItems.length == 0 ?
                showToast({message: `${movedFilesNum + movedFoldersNum} items moved.`, showSuccessIcon: true})
            : showToast({message: `Moved ${movedFilesNum + movedFoldersNum} of ${itemsToMove.length} items (conflicts/errors were detected)`, showSuccessIcon: true})
        } 
        catch (error) {
            console.error(error);
            if (axios.isAxiosError(error)) {
                showToast({ message: `Cannot move: please check your connection.`, showFailIcon: true });
            }
        }
        finally {
            setProcessingItems([])
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

            selectedItems,
            setSelectedItems,
            addToSelectedItems,
            removeFromSelectedItems,

            filterItemsByPath,

            conflictingItems,
            setConflictingItems,
            handleMoveItems,
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
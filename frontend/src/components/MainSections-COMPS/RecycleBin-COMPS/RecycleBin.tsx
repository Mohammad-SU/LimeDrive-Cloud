function AllFiles() {
    const { 
        currentPath,
        setCurrentPath, 
        files, 
        folders, 
        selectedItems, 
        setSelectedItems, 
        addToSelectedItems, 
        removeFromSelectedItems, 
        filterItemsByPath, 
        setConflictingItems, 
        handleMoveItems,
        processingItems 
    } = useFileContext()

    const navigate = useNavigate()
    const location = useLocation()
    const path = decodeURIComponent(location.pathname).slice(1) + "/"
    useEffect(() => {
        folders.some(folder => folder.app_path === path.slice(0, -1)) || path == "LimeDrive/" ? // if the URL path doesn't match a real directory path then navigate to root
            setCurrentPath(path)
            : navigate("/LimeDrive")
        setConflictingItems([]);
    }, [path]);

    const sortedFolders = useMemo(() => {
        const filteredFolders = filterItemsByPath(folders, currentPath)
        return filteredFolders.slice().sort((a, b) => { // Sort A-Z by folder name
            return a.name.localeCompare(b.name);
        });
    }, [folders, currentPath]);

    const sortedFiles = useMemo(() => {
        const filteredFiles = filterItemsByPath(files, currentPath)
        return filteredFiles.slice().sort((a, b) => { // Sort so most recently uploaded files will be at the beginning
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB.getTime() - dateA.getTime();
        });
    }, [files, currentPath]);
    
    const sortedItems = [...sortedFolders, ...sortedFiles];

    const [lastClickedItem, setLastClickedItem] = useState<ItemTypes | null>(null)
    const handleItemSelection = (item: ItemTypes, event: React.MouseEvent<HTMLDivElement>, isItemSelected: boolean) => {
        const isCtrlPressed = event.ctrlKey || event.metaKey;
        const isShiftPressed = event.shiftKey;
        const isCheckboxClicked = (event.target instanceof HTMLElement && event.target.hasAttribute('data-checkbox'))

        if (isCtrlPressed || isCheckboxClicked) { // Multiple selections with possibly separated file locations, also logic for checkbox clicks
            if (isItemSelected) {
                addToSelectedItems([item]);
            }
            else {
                removeFromSelectedItems([item]);
            }
        } 
        else if (isShiftPressed && lastClickedItem) { // Multiple selections with files together in a range
            const itemToSelect: ItemTypes[] = [];
            const startIndex = sortedItems.findIndex(sortedItem => sortedItem.id === lastClickedItem.id);
            const endIndex = sortedItems.findIndex(sortedItem => sortedItem.id === item.id);
    
            if (startIndex >= 0 && endIndex >= 0) {
                const start = Math.min(startIndex, endIndex);
                const end = Math.max(startIndex, endIndex);
    
                for (let i = start; i <= end; i++) {
                    itemToSelect.push(sortedItems[i]);
                }
            }
    
            setSelectedItems(itemToSelect);
        }
        else { // Regular item click logic
            setSelectedItems([item])
        }

        setSelectedItems((prevSelectedItems) => { // Functional form to make condition based on latest state
            if (prevSelectedItems.length == 1 || isCtrlPressed) {
                setLastClickedItem(item);
            }
            return prevSelectedItems;
        });
    }

    const [showSelectAll, setShowSelectAll] = useState(false);
    const [showDeselectAll, setShowDeselectAll] = useState(false)

    const handleHeaderCheckboxClick = () => {
        if (!showSelectAll && !showDeselectAll) {
            setShowSelectAll(true)
            const itemsToSelect = [...sortedFiles, ...sortedFolders].filter( // Select all sorted items that are not processing
                (item) => !processingItems.some((sentItem) => sentItem.id === item.id)
            );
            addToSelectedItems(itemsToSelect);
        }
        else {
            setShowSelectAll(false)
            setShowDeselectAll(false)
            setSelectedItems([])
            setLastClickedItem(null)
        }
    };

    useEffect(() => { // Make sure header-row checkbox looks correct based on items and handle some keyboard shortcuts
        if (selectedItems.length == 0) {
            setShowSelectAll(false)
            setShowDeselectAll(false)
        }
        else if (selectedItems.length < (sortedFiles.length + sortedFolders.length)) { 
            setShowSelectAll(false)
            setShowDeselectAll(true)
        }
        else if (selectedItems.length == (sortedFiles.length + sortedFolders.length)) { 
            setShowSelectAll(true)
            setShowDeselectAll(false)
        }

        const handleKeyShortcuts = (event: KeyboardEvent) => {
            const isModalOpen = document.querySelector(".Backdrop");
            const isInputFocused = document.activeElement instanceof HTMLInputElement;

            if (!isModalOpen && !isInputFocused) {
                if (event.key === 'Escape') {
                    event.preventDefault();
                    setSelectedItems([]);
                    setLastClickedItem(null)
                }
                if (event.ctrlKey && event.key === 'a') {
                    event.preventDefault();
                    setSelectedItems([...sortedFiles, ...sortedFolders]);
                }
            }
        };
      
        window.addEventListener('keydown', handleKeyShortcuts)
      
        return () => {
            window.removeEventListener('keydown', handleKeyShortcuts)
        }
    }, [selectedItems, sortedFiles, sortedFolders]);

    useEffect(() => {
        setSelectedItems([])
        setLastClickedItem(null)
    }, [currentPath])

    const foldersMapped = sortedFolders.map(folder => {
        return <Folder
            key={folder.id}
            folder={folder as FolderType}
            onSelect={handleItemSelection}
        />
    })
    const filesMapped = sortedFiles.map(file => {
        return <File
            key={file.id}
            file={file as FileType}
            onSelect={handleItemSelection}
        />
    })
    const emptyDirectory = sortedFiles.length + sortedFolders.length == 0

    return (
            <div className={`AllFiles ${emptyDirectory ? 'empty-directory' : ''}`}>
                <div className="section-main-header">
                    <Breadcrumb path={currentPath} setPath={setCurrentPath}/>
                    <div className="tool-area">
                        <SortingToolbar />
                        <MainToolbar />
                    </div>

                    <div className="list-header-row">
                        <Checkbox
                            className={`list-checkbox ${showSelectAll || showDeselectAll ? "show-checkbox" : "hide-checkbox"}`}
                            checked={showSelectAll}
                            onClick={handleHeaderCheckboxClick}
                            showMinus={showDeselectAll}
                        />
                        <p className="name-header">
                            Name 
                            {selectedItems.length > 0 && <span>[{selectedItems.length} selected]</span>}
                        </p>
                        <p>Type</p>
                        <p>Size</p>
                        <p>Uploaded (D/M/Y)</p>
                    </div>
                </div>

                <div className={`main-list ${emptyDirectory ? 'empty-directory' : ''}`}>
                    {deletedItemsMapped}
                    {emptyDirectory && <h1 className="empty-message">Empty directory. Click "New" to add items.</h1>}
                </div>
            </div>
    )
}

export default memo(AllFiles)
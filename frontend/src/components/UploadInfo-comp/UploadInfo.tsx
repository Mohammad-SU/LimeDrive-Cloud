import { useState, useRef, useEffect, memo } from 'react'
import "../../global.scss"
import "./UploadInfo.scss"
import axios, { CancelTokenSource } from 'axios';
import { HashLink as Link } from 'react-router-hash-link';
import { useUserContext } from '../../contexts/UserContext.tsx'
import { useFileContext } from '../../contexts/FileContext.tsx';
import useDelayedExit from '../../hooks/useDelayedExit.ts';
import { AiFillFileText } from 'react-icons/ai'
import { IoChevronDownSharp, IoChevronUpSharp } from 'react-icons/io5'
import { IoMdClose } from 'react-icons/io'
import { FileType } from '../../types/FileType.ts';
import ProgressBar from '../LoadingBar-COMPS/ProgressBar.tsx'
import DynamicClip from '../DynamicClip.tsx';

interface QueueFile {
    fileObj: File,
    id: number | null;
    app_path: string;
}

function UploadInfo({ fileInputRef }: { fileInputRef: React.RefObject<HTMLInputElement> }) {
    const [showUploadInfo, setshowUploadInfo] = useState(true)
    const { isVisible: isUploadInfoVisible } = useDelayedExit({
        shouldRender: showUploadInfo,
        delayMs: 300,
    });

    const { currentPath, files, folders, addFiles, addFolders } = useFileContext()
    
    const [fileErrors, setFileErrors] = useState(new Map());
    const [currentlyUploadingFile, setCurrentlyUploadingFile] = useState<QueueFile | null>(null);
    const [prevUploadedFiles, setPrevUploadedFiles] = useState<QueueFile[]>([]); // Files in the list that have been successfully uploaded and will not be sent again
    const [uploadQueue, setUploadQueue] = useState<QueueFile[]>([]); // Files in the list to be sent to backend
    const [uploadListFilesNum, setUploadListFilesNum] = useState<number>(0) // Number of files in the list in total, including both current and successful uploads
    const [currentUploadIndex, setCurrentUploadIndex] = useState<number>(-1); // Current file to be uploaded in uploadQueue (negative means no files in uploadQueue)
    const [successfulUploadNum, setSuccessfulUploadNum] = useState<number>(0);
    const [currentFileProgress, setCurrentFileProgress] = useState<number | null>(0);
    const cancelTokenSource = useRef<CancelTokenSource | null>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files
        if (!selectedFiles) return

        const successfulFiles = uploadQueue.filter (
            (file, index) => !fileErrors.has(file) && index < currentUploadIndex
        )

        const newCurrentPath = currentPath
        let newFiles: QueueFile[]

        if (fileInputRef?.current?.webkitdirectory == false || true) { // For file selection dialog (remove "true" condition after folder uploading is implemented)
            const samePathFiles = [ // Includes app's files and queue files (which includes failed files in the queue) but not successfull files that have not yet been added to prevUploadedFiles
                ...files.filter((file) => file.app_path === newCurrentPath + file.name),
                ...uploadQueue.filter((queuefile) => !successfulFiles.includes(queuefile) && queuefile.app_path === newCurrentPath + queuefile.fileObj.name), // Incase a file is uploading to the same path but hasnt been fully uploaded yet so that it will still be included in the conflict check
            ];
            newFiles = Array.from(selectedFiles).map((selectedFile) => {
                const suffixRegex = /\(\d+\)(?=\D*$)/;  // Remove last occurence of existing suffix such as (1), (2), etc.`
                const similarFileNames = samePathFiles.filter((file: QueueFile | FileType) => {
                    let baseName: string;
                    'fileObj' in file ?
                        baseName = (file as QueueFile).fileObj.name.replace(suffixRegex, '')
                        : baseName = (file as FileType).name.replace(suffixRegex, '');
    
                    const selectedBaseName = selectedFile.name.replace(suffixRegex, '');
                    return baseName === selectedBaseName;
                });
        
                let fileName = selectedFile.name; // Note: if the user intentionally put a (1), (2), etc. suffix before uploading then their suffix will still be preserved
                const dotIndex = fileName.lastIndexOf('.');
                const baseName = dotIndex !== -1 ? fileName.slice(0, dotIndex) : fileName;
                const extension = dotIndex !== -1 ? fileName.slice(dotIndex) : '';
    
                fileName = similarFileNames.length > 0 ? `${baseName}(${similarFileNames.length})${extension}` : fileName;
                const renamedFileObj = new File([selectedFile], fileName, { type: selectedFile.type });
        
                return {
                    fileObj: renamedFileObj,
                    id: null,
                    app_path: newCurrentPath + fileName,
                };
            });
        }
        else { // For folder selection dialog
            // const deepestPath = Array.from(selectedFiles).reduce((deepest, selectedFile) => { // Get deepest webkitRelativePath from selectedFiles based on number of slashes
            //     const slashesCount = (selectedFile.webkitRelativePath.match(/\//g) || []).length;
            //     return slashesCount > deepest.slashesCount ? { path: selectedFile.webkitRelativePath, slashesCount } : deepest;
            // }, { path: '', slashesCount: -1 }).path;

            // const deepestPathFolderNames = deepestPath.split('/').slice(0, -1); // slice removes the last element (file name)

            // /* things to do when adding this feature   
            //     - abort uploading files inside folder if folder fails creation (add them to file error map)
            //     - add selectedfiles to newFiles with correct app_paths, all at once
            //     - add previous folder names in same path to create path for a deeper folder
            //     - show toast for folder successfully uploaded when all files and folders inside top level folder have been uploaded (with or without errors)?
            // */

            // const handleCreateFolder = async () => {
            //     try {
            //         const parentFolder = folders.find((folder) => folder.app_path === currentPath.slice(0, -1));
            //         const app_path = currentPath + formData.newFolderName.trim()
            //         const parent_folder_id = parentFolder ? parentFolder.id.substring(2) : "0"; // 0 represents root directory id, aka "LimeDrive/"
            //         setShowNewFolderModal(false);
            //         const response = await apiSecure.post('/createFolder', {
            //             name: formData.newFolderName.trim(),
            //             app_path: app_path,
            //             parent_folder_id: parent_folder_id
            //         });
        
            //         addFolders(response.data)
            //         showToast({message: "Folder created.", showSuccessIcon: true})
            //         formData.newFolderName = ''
        
            //         setTimeout(() => { // Wait for folder with it's id to be properly rendered to the DOM
            //             if (currentPath == parentFolder?.app_path + "/" || parent_folder_id === "0" && currentPath == "LimeDrive/") { // Jump to folder if user is still in same path
            //                 navigate(currentPath.slice(0, -1)+"#d_"+response.data.id)
            //                 const element = document.getElementById(`d_${response.data.id}`);
            //                 if (element) {
            //                     element.scrollIntoView({ behavior: "smooth" });
            //                 }
            //             }
            //         }, 1);
            //     } 
            //     catch (error) {
            //         console.error(error);
            //         if (axios.isAxiosError(error)) {
            //             setBackendErrorMsg(error?.response?.data.message)
            //             showToast({message: "Error creating folder. Please check your connection.", showFailIcon: true})
            //         }
            //     }
            // }
        }

        const remainingFiles = uploadQueue.filter ( // Includes currently uploading file, queued files, and failed files
            (file, index) => index >= currentUploadIndex && !successfulFiles.includes(file)
        )

        const updatedUploadQueue = [
            ...remainingFiles,
            ...newFiles,
        ]

        const newFileErrors = new Map(); // Reset file error map
        setFileErrors(newFileErrors);
        setPrevUploadedFiles((prevFiles: QueueFile[]) => [...successfulFiles, ...prevFiles]);
        setUploadQueue(updatedUploadQueue);
        setUploadListFilesNum((prevValue) => prevValue + newFiles.length);
        setCurrentUploadIndex(0);
    }

    const { apiSecure } = useUserContext()
    
    const uploadFile = async (file: QueueFile) => {
        const formData = new FormData();
        formData.append('file', file.fileObj) // Actual js file object
        formData.append('app_path', file.app_path) // e.g. app_path = LimeDrive/LimeDrive.txt

        const lastSlashIndex = file.app_path.lastIndexOf('/');
        const parentFolder = folders.find((folder) => folder.app_path === file.app_path.substring(0, lastSlashIndex));
        const parent_folder_id = parentFolder ? parentFolder.id.substring(2) : "0"; // 0 represents root directory (LimeDrive) id
        formData.append('parent_folder_id', parent_folder_id)

        const source = axios.CancelToken.source();
        cancelTokenSource.current = source;
    
        try {
            const response = await apiSecure.post('/uploadFile', formData, {
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total != undefined) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setCurrentFileProgress(percentCompleted);
                    } else {
                        setCurrentFileProgress(0);
                    }
                },
                cancelToken: source.token,
            })

            addFiles(response.data)
            const updatedQueueFile = { fileObj: file.fileObj, id: response.data.id, app_path: response.data.app_path };
            setUploadQueue((prevQueue) => // Update the corresponing file's id in uploadQueue
                prevQueue.map((queueFile) =>
                    queueFile === file ? updatedQueueFile : queueFile
                )
            );

            setSuccessfulUploadNum(current => current + 1)
        } 
        catch (error) {
            console.error(error)
            if (axios.isAxiosError(error) && !axios.isCancel(error)) {
                setFileErrors((prevErrors) => new Map(prevErrors).set(file, error));
            }
        }
        finally {
            setCurrentUploadIndex((prevIndex) => prevIndex + 1);
            setCurrentFileProgress(0);
            setCurrentlyUploadingFile(null);
            cancelTokenSource.current = null;
        }
    }

    useEffect(() => {
        if (currentUploadIndex >= 0 && currentUploadIndex < uploadQueue.length) {
            const fileToUpload = uploadQueue[currentUploadIndex];
            if (fileToUpload !== currentlyUploadingFile) {
                setCurrentlyUploadingFile(fileToUpload);
                setshowUploadInfo(true)
                uploadFile(fileToUpload);
            }
        }
        else if (currentUploadIndex === uploadQueue.length) { // arrays start at 0 index, so if index equals array length it means it is complete
            setCurrentlyUploadingFile(null)
        }
    }, [currentlyUploadingFile, uploadQueue]);

    const onRetryClick = () => { // Causes all failed files in uploadQueue to be added back to the queue
        const successfulFiles = uploadQueue.filter (
            (file, index) => !fileErrors.has(file) && index < currentUploadIndex
        )
        
        const filesToRetry: QueueFile[] = uploadQueue.filter((file) => fileErrors.has(file));

        const queuedFiles = uploadQueue.filter (
            (file, index) => index > currentUploadIndex && !successfulFiles.includes(file)
        )

        const newFileErrors = new Map()
        setFileErrors(newFileErrors);

        const updatedUploadQueue: QueueFile[] = [
            ...(currentlyUploadingFile ? [currentlyUploadingFile] : []),
            ...filesToRetry,
            ...queuedFiles,
        ]

        setUploadQueue(updatedUploadQueue);
        setCurrentUploadIndex(0);
        setPrevUploadedFiles((prevFiles: QueueFile[]) => [...successfulFiles, ...prevFiles]);
    }
    
    const onCancelClick = (fileToRemove: QueueFile) => {
        if (fileToRemove == currentlyUploadingFile && currentFileProgress === 100) {
            return
        }

        const updatedUploadQueue = uploadQueue.filter((file) => file !== fileToRemove);

        if (fileToRemove === currentlyUploadingFile) {
            cancelTokenSource?.current?.cancel('Upload cancelled by user');
            setCurrentUploadIndex((prevValue) => prevValue - 1);
        }
        
        setUploadQueue(updatedUploadQueue);
        setUploadListFilesNum((prevValue) => prevValue - 1);
    }

    const [collapseUploadList, setCollapseUploadList] = useState<boolean>(false)

    const onCloseClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.stopPropagation()
        if (currentlyUploadingFile) return
        setshowUploadInfo(false)
    }

    const renderFileDetails = (file: QueueFile, index: number, isPrevUploaded: boolean) => {
        const correspondingFile = files.find((appFile) => appFile.id === file.id);
        const parentPath = correspondingFile?.app_path ? correspondingFile.app_path.substring(0, correspondingFile.app_path.lastIndexOf('/')) : '';
        const parentFolderName = parentPath ? parentPath.substring(parentPath.lastIndexOf('/') + 1) : '';
        const isDeleted = !correspondingFile && (isPrevUploaded || (index < currentUploadIndex && !fileErrors.has(file)))
        return (
            <div className={`file ${isDeleted ? 'deleted' : ''}`} key={index}>
                <AiFillFileText className="file-icon" />
                <div className="file-info">
                    <div className="name">{file.fileObj.name}</div>
                        <div className="progress-and-location">
                            {!isPrevUploaded && index === currentUploadIndex ? 
                                <ProgressBar progress={currentFileProgress} />
                                : !isPrevUploaded && index > currentUploadIndex ? 
                                    "Queued"
                                : fileErrors.has(file) ? 
                                    "Error. Check connection."
                                : isDeleted ?
                                    "Deleted"
                                : <>In <span className="link">
                                        <Link to={(parentPath).replace(/[^\/]+/g, (match) => encodeURIComponent(match))+'#'+file.id} smooth>{parentFolderName}</Link> {/* Based on parent path instead of the queue file's path so that this link updates when the user moves that file*/}
                                    </span></>
                            }
                        </div>
                    
                </div>
                {index >= currentUploadIndex && !fileErrors.has(file) && !isPrevUploaded ?
                    <button
                        className="cancel-btn"
                        onClick={() => onCancelClick(file)}
                        disabled={index === currentUploadIndex && currentFileProgress === 100}
                    >
                        Cancel
                    </button>
                    : fileErrors.has(file) && !isPrevUploaded ? 
                        <button className="retry-btn" onClick={onRetryClick}>Retry</button>
                    : isDeleted ?
                        null
                    : <button>Copy Link</button>
                }
            </div>
        );
    };    

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
                onClick={(event) => ((event.target as HTMLInputElement).value = '')} // So that if user selects the exact same files as the last time, onChange still runs
                multiple
            />
            {uploadListFilesNum > 0 && isUploadInfoVisible &&
                <div className="UploadInfo">
                    <div className="header" onClick={() => setCollapseUploadList(prevState => !prevState)}>
                        <p>
                            {successfulUploadNum < uploadListFilesNum && currentlyUploadingFile ?
                                `${successfulUploadNum} of ${uploadListFilesNum} ${uploadListFilesNum > 1 ? 'uploads' : 'upload'} complete`
                                : `${successfulUploadNum} ${successfulUploadNum > 1 ? 'uploads' : 'upload'} complete ${fileErrors.size > 0 ? `(${fileErrors.size} failed)` : ''}`
                            }
                            
                            {currentlyUploadingFile && collapseUploadList &&
                                <span className="spinner-after"></span>
                            }
                        </p>

                        <div className="header__icons-cont">
                            <button className="icon-btn-wrapper">
                                {!collapseUploadList ?
                                    <IoChevronDownSharp className="icon-btn" />
                                    : <IoChevronUpSharp className="icon-btn" />
                                }
                            </button>
                            {!currentlyUploadingFile && 
                                <button className="icon-btn-wrapper" onClick={onCloseClick}>
                                    <IoMdClose className="icon-btn" />
                                </button>
                            }
                        </div>
                    </div>
                    
                    {!collapseUploadList &&
                        <div className="upload-list">
                            {uploadQueue.map((file, index) => renderFileDetails(file, index, false))}
                            {prevUploadedFiles.map((file, index) => renderFileDetails(file, index, true))}
                        </div>
                    }
                    <DynamicClip
                        clipPathId={"uploadInfoClip"}
                        animation={showUploadInfo}
                        numRects={12}
                    />
                </div>
            }
        </>
    )
}

export default memo(UploadInfo)
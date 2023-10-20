import { useState, useRef, useEffect, memo } from 'react'
import "../../global.scss"
import "./UploadInfo.scss"
import axios, { CancelTokenSource } from 'axios';
import { Link } from 'react-router-dom'
import { useUserContext } from '../../contexts/UserContext.tsx'
import { useFileContext } from '../../contexts/FileContext.tsx';
import useDelayedExit from '../../hooks/useDelayedExit.ts';
import { AiFillFileText } from 'react-icons/ai'
import { IoChevronDownSharp, IoChevronUpSharp } from 'react-icons/io5'
import { IoMdClose } from 'react-icons/io'
import ProgressBar from '../LoadingBar-COMPS/ProgressBar.tsx'
import DynamicClip from '../DynamicClip.tsx';

function UploadInfo({ fileInputRef }: { fileInputRef: React.RefObject<HTMLInputElement> }) {
    const [showUploadInfo, setshowUploadInfo] = useState(true)
    const { isVisible: isUploadInfoVisible } = useDelayedExit({
        shouldRender: showUploadInfo,
        delayMs: 300,
    });

    const { currentPath, folders, addFiles, addFolders } = useFileContext()
    
    const [fileErrors, setFileErrors] = useState(new Map());
    const [currentlyUploadingFile, setCurrentlyUploadingFile] = useState<File | null>(null);
    const [prevUploadedFiles, setPrevUploadedFiles] = useState<File[]>([]); // Files in the list that have been successfully uploaded and will not be sent again
    const [uploadQueue, setUploadQueue] = useState<File[]>([]); // Files in the list to be sent to backend
    const [uploadListFilesNum, setUploadListFilesNum] = useState<number>(0) // Number of files in the list in total, including both current and successful uploads
    const [currentUploadIndex, setCurrentUploadIndex] = useState<number>(-1); // Current file to be uploaded in uploadQueue (negative means no files in uploadQueue)
    const [successfulUploadNum, setSuccessfulUploadNum] = useState<number>(0);
    const [currentFileProgress, setCurrentFileProgress] = useState<number | null>(0);
    const [selectedCurrentPath, setSelectedCurrentPath] = useState(currentPath)
    const cancelTokenSource = useRef<CancelTokenSource | null>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files
        if (!selectedFiles) return
        const newFiles = Array.from(selectedFiles);
        setSelectedCurrentPath(currentPath)

        if (!currentlyUploadingFile) {
            const successfulFiles = fileErrors.size > 0 ? uploadQueue.filter((file) => !fileErrors.has(file)) : uploadQueue; // If no file errors then add entire uploadQueue
            const failedFiles = fileErrors.size > 0 ? uploadQueue.filter((file) => fileErrors.has(file)) : []; // Failed uploads to add back to queue, empty array if none
    
            const newFileErrors = new Map(); // Reset file error map
            setFileErrors(newFileErrors);
    
            setPrevUploadedFiles((prevFiles: File[]) => [ ...successfulFiles, ...prevFiles])
            setUploadListFilesNum((prevValue) => prevValue + newFiles.length)
    
            setUploadQueue([...newFiles, ...failedFiles])
            setCurrentUploadIndex(0)
            setCurrentlyUploadingFile(uploadQueue[currentUploadIndex])
        }
        else { // If files are currently being uploaded
            const successfulFiles = uploadQueue.filter (
                (file, index) => !fileErrors.has(file) && index < currentUploadIndex
            )
            const remainingFiles = uploadQueue.filter ( // Includes currently uploading file, queued files, and failed files
                (file, index) => index >= currentUploadIndex && !successfulFiles.includes(file)
            )

            const updatedUploadQueue = [
                ...remainingFiles,
                ...newFiles,
            ]

            setPrevUploadedFiles((prevFiles: File[]) => [...successfulFiles, ...prevFiles]);
            setUploadQueue(updatedUploadQueue);
            setUploadListFilesNum((prevValue) => prevValue + newFiles.length);
            setCurrentUploadIndex((prevIndex) => prevIndex - successfulFiles.length); // Subtract for correct index due to successful files being removed from uploadQueue and being added to prevUploadedFiles
            setCurrentlyUploadingFile(uploadQueue[currentUploadIndex])
        }
    }

    const { apiSecure } = useUserContext()
    
    const uploadFile = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file)

        const app_path = selectedCurrentPath.endsWith('/') ? selectedCurrentPath + file.name : selectedCurrentPath + '/' + file.name;
        formData.append('app_path', app_path) // e.g. app_path = LimeDrive/LimeDrive.txt

        const matchingFolder = folders.find((folder) => folder.app_path === selectedCurrentPath.slice(0, -1));
        const parent_folder_id = matchingFolder ? matchingFolder.id.substring(2) : "0"; // 0 represents root directory id, aka "LimeDrive/"
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
        
        const filesToRetry: File[] = uploadQueue.filter((file) => fileErrors.has(file));

        const queuedFiles = uploadQueue.filter (
            (file, index) => index > currentUploadIndex && !successfulFiles.includes(file)
        )

        const newFileErrors = new Map()
        setFileErrors(newFileErrors);

        const updatedUploadQueue: File[] = [
            uploadQueue[currentUploadIndex], // Move true/original 'currently uploading file' to front
            ...filesToRetry,
            ...queuedFiles,
        ]

        setUploadQueue(updatedUploadQueue);
        setCurrentUploadIndex(0);
        setCurrentlyUploadingFile(null) // Trigger useEffect to run
        setPrevUploadedFiles((prevFiles: File[]) => [...successfulFiles, ...prevFiles]);
    }
    
    const onCancelClick = (fileToRemove: File) => {
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

    const onCloseClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        event.stopPropagation()
        if (currentlyUploadingFile) return
        setshowUploadInfo(false)
    }
    

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
                multiple
            />
            {uploadListFilesNum > 0 && isUploadInfoVisible &&
                <div className="UploadInfo">
                    <div className="header" onClick={() => setCollapseUploadList(prevState => !prevState)}>
                        {successfulUploadNum} of {uploadListFilesNum} {uploadListFilesNum > 1 ? 'uploads' : 'upload'} complete
                        {currentlyUploadingFile && collapseUploadList &&
                            <span className="spinner-after"></span>
                        }

                        <div className="header__icons-cont">
                            {!collapseUploadList ?
                                <IoChevronDownSharp className="icon-btn" />
                                : <IoChevronUpSharp className="icon-btn" />
                            }
                            {!currentlyUploadingFile && <IoMdClose onClick={onCloseClick} className="icon-btn" />}
                        </div>
                    </div>
                    
                    {!collapseUploadList &&
                        <div className="upload-list">
                            {uploadQueue.map((file, index) => (
                                    <div className="file" key={index}>
                                        <AiFillFileText className="file-icon" />
                                        <div className="file-info">
                                            <div className="name">{file.name}</div>
                                            <div className="progress-and-location">
                                                {index === currentUploadIndex ? 
                                                    <ProgressBar progress={currentFileProgress} />

                                                    : index > currentUploadIndex ?
                                                        <span>Queued</span>

                                                    : fileErrors.has(file) ? 
                                                        <span>Error. Check connection.</span>

                                                    : <>In <span className="link"><Link to={`LimeDrive/${file.name}`}>LimeDrive</Link></span></>
                                                }
                                            </div>
                                        </div>
                                        {index >= currentUploadIndex && !fileErrors.has(file) ?
                                            <button 
                                                className="cancel-btn" 
                                                onClick={() => onCancelClick(file)}
                                                disabled={index === currentUploadIndex && currentFileProgress === 100}
                                            >
                                                Cancel
                                            </button>
                                            
                                            : fileErrors.has(file) ? 
                                                <button className="retry-btn" onClick={onRetryClick}>Retry</button>
                                            
                                            : <button>Copy Link</button>
                                        }
                                        
                                    </div>
                            ))}
                            {prevUploadedFiles.map((file, index) => (
                                <div className="file" key={index}>
                                    <AiFillFileText className="file-icon" />
                                    <div className="file-info">
                                        <div className="name">{file.name}</div>
                                        <div className="location">
                                            In <span className="link"><Link to={`LimeDrive/${file.name}`}>LimeDrive</Link></span>
                                        </div>
                                    </div>
                                    <button>Copy Link</button>
                                </div>
                            ))}
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
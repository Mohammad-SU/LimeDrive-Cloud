import { useState, useRef, useEffect, memo } from 'react'
import "../../global.scss"
import "./Upload.scss"
import axios, { AxiosError } from 'axios'
import api from '../../axios-config.ts'
import { Link } from 'react-router-dom'
import { useUserContext } from '../../contexts/UserContext.tsx'
import { useFileContext } from '../../contexts/FileContext';
import { AiOutlineUpload, AiFillFileText } from 'react-icons/ai'
import { IoChevronDownSharp, IoChevronUpSharp } from 'react-icons/io5'
import { IoMdClose } from 'react-icons/io'
import ProgressBar from '../LoadingBar-COMPS/ProgressBar.tsx'

function Upload() {
    const [collapseUploadList, setCollapseUploadList] = useState<boolean>(false)
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click()
        }
    }
    
    const [backendError, setBackendError] = useState<AxiosError | null>(null);
    const [app_path, setApp_path] = useState('all-files/');
    const [currentlyUploading, setCurrentlyUploading] = useState(false) // Are files in the process of being uploaded/are queued?
    const [prevUploadedFiles, setPrevUploadedFiles] = useState<File[]>([]); // Files in the list that have been successfully uploaded and will not be sent again
    const [uploadQueue, setUploadQueue] = useState<File[]>([]); // Files in the list to be sent to backend
    const [uploadListFilesNum, setUploadListFilesNum] = useState<number>(0) // Number of files in the list in total, including both current and successful uploads
    const [currentUploadIndex, setCurrentUploadIndex] = useState<number>(-1); // Current file to be uploaded in uploadQueue (negative means no files in uploadQueue)
    const [successfulUploadNum, setSuccessfulUploadNum] = useState<number>(0);
    const [currentFileProgress, setCurrentFileProgress] = useState<number | null>(0);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files
        if (!selectedFiles) return

        const newFiles = Array.from(selectedFiles)
        
        setPrevUploadedFiles((prevFiles: File[]) => [...prevFiles, ...uploadQueue])
        setUploadListFilesNum((prevValue) => prevValue + newFiles.length)

        setUploadQueue(newFiles)
        setCurrentUploadIndex(0)
    }

    const { token } = useUserContext();
    const { addFiles } = useFileContext()
    
    const uploadFile = async (file: File) => {
        const formData = new FormData();
        formData.append('files[]', file)
        formData.append('app_path', app_path)
    
        try {
            setCurrentlyUploading(true)

            const response = await api.post('/uploadFiles', formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
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
            })

            addFiles(response.data[0])
        } 
        catch (error) {
            if (axios.isAxiosError(error)) {
                setBackendError(error);
            }
        }
    }

    useEffect(() => {
        if (currentUploadIndex >= 0 && currentUploadIndex < uploadQueue.length) {
            uploadFile(uploadQueue[currentUploadIndex]) // Upload the current file
                .then(() => {
                    setCurrentUploadIndex((prevIndex) => prevIndex + 1);
                    setCurrentFileProgress(0);
                    setSuccessfulUploadNum(current => current + 1)
                })
        }
        else if (currentUploadIndex === uploadQueue.length) {
            setCurrentlyUploading(false)
        }
    }, [currentUploadIndex]);
    

    return (
        <>
            <button className="upload-btn" onClick={handleUploadClick}>
                <AiOutlineUpload className="upload-icon" />
                Upload
            </button>
            <input
                ref={fileInputRef}
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
                multiple
            />

            {uploadListFilesNum > 0 &&
                <div className="upload-info">
                    <div className="header" onClick={() => setCollapseUploadList(prevState => !prevState)}>
                        {successfulUploadNum} of {uploadListFilesNum} {uploadListFilesNum > 1 ? 'uploads' : 'upload'} complete
                        {currentlyUploading && collapseUploadList &&
                            <span className="spinner-after"></span>
                        }

                        <div className="header__icons-cont">
                            {!collapseUploadList ?
                                <IoChevronDownSharp className="icon" />
                                : <IoChevronUpSharp className="icon" />
                            }
                            <IoMdClose className="icon" />
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

                                                    : backendError ? 
                                                        <span>Error. Check connection.</span>

                                                    : <>In <span className="link"><Link to={`all-files/${file.name}`}>all-files</Link></span></>
                                                }
                                            </div>
                                        </div>
                                        <button>Copy Link</button>
                                    </div>
                            ))}
                            {prevUploadedFiles.map((file, index) => (
                                <div className="file" key={index}>
                                    <AiFillFileText className="file-icon" />
                                    <div className="file-info">
                                        <div className="name">{file.name}</div>
                                        <div className="location">
                                            In <span className="link"><Link to={`all-files/${file.name}`}>all-files</Link></span>
                                        </div>
                                    </div>
                                    <button>Copy Link</button>
                                </div>
                            ))}
                        </div>
                    }
                </div>
            }
        </>
    )
}

export default memo(Upload)
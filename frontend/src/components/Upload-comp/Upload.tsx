import { useState, useRef, useEffect, memo } from 'react'
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
    
    const { addFiles } = useFileContext()
    const [backendError, setBackendError] = useState<AxiosError | null>(null);
    const [app_path, setApp_path] = useState('all-files/');
    const [uploadNumComplete, setUploadNumComplete] = useState<number>(0)
    const [uploadNumAll, setUploadNumAll] = useState<number>(0)
    const [uploading, setUploading] = useState<boolean>(false)
    const [uploadQueue, setUploadQueue] = useState<File[]>([]);
    const [currentUploadIndex, setCurrentUploadIndex] = useState<number>(-1);
    const [currentFileProgress, setCurrentFileProgress] = useState<number | null>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files;
        if (selectedFiles) {
            setUploadQueue((prevQueue) => [...prevQueue, ...Array.from(selectedFiles)]);
            setCurrentUploadIndex(0)
        }
    }

    const { token } = useUserContext();
    
    const uploadFile = async (file: File) => {
        if (!file) return // No file selected? exit function.

        const formData = new FormData();
        formData.append('files[]', file)
        formData.append('app_path', app_path)
    
        try {
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
            uploadFile(uploadQueue[currentUploadIndex]).then(() => {
                setCurrentUploadIndex((prevIndex) => prevIndex + 1)
                setCurrentFileProgress(null)
            })
        }
    }, [currentUploadIndex])

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

            {uploadQueue.length > 0 &&
                <div className="upload-info">
                    <div className="header">
                        {currentUploadIndex} of {uploadQueue.length} uploads complete
                        <div className="header__icons-cont">
                            {!collapseUploadList ?
                                <IoChevronDownSharp className="icon" onClick={() => setCollapseUploadList(true)}/>
                                : <IoChevronUpSharp className="icon" onClick={() => setCollapseUploadList(false)}/>
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

                                                : <>In <span className="link"><Link to="/folder-that-has-file">folder-that-has-file</Link></span></>
                                            }
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
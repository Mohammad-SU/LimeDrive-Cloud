import { useState, useRef } from 'react'
import "./Upload.scss"
import axios from 'axios'
import { Link } from 'react-router-dom'
import { AiOutlineUpload, AiFillFileText } from 'react-icons/ai'
import { IoChevronDownSharp, IoChevronUpSharp } from 'react-icons/io5'
import { IoMdClose } from 'react-icons/io'
import { handleBackendError } from '../../functions/BackendErrorResponse.ts'
import { FileType } from '../../types/index.ts'
import LoadingBar from '../LoadingBar-comp/LoadingBar.tsx'

function Upload() {
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const handleUploadClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }
    
    const [uploadNumComplete, setUploadNumComplete] = useState<number>(0)
    const [uploadNumAll, setUploadNumAll] = useState<number>(0)
    const [uploading, setUploading] = useState<boolean>(false)
    const [backendError, setBackendError] = useState<string | null>(null)
    const [collapseUploadList, setCollapseUploadList] = useState<boolean>(false)

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files;
        if (selectedFiles) {
            setUploading(true)

            const formData = new FormData();
            for (let i = 0; i < selectedFiles.length; i++) {
                formData.append('files[]', selectedFiles[i]);
            }

            try {
                const response = await axios.post('/api/upload', formData);
                console.log('Upload successful:', response.data);
            } 
            catch (error) {
                if (axios.isAxiosError(error)) {
                    setBackendError(handleBackendError(error))
                }
            }
            finally {
                setUploading(false)
            }
        }
    }

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

            <div className="upload-info">
                <div className="header">
                    {uploadNumComplete} of {uploadNumAll} uploads complete
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
                        <div className="file">
                            <AiFillFileText className="file-icon"/>
                            <div className="file-info">
                                <div className="name">file-name-file-file-name-file</div>
                                <div className="progress-and-location">
                                    {!uploading ? <LoadingBar loading={!uploading} className={"upload"}/>
                                        : backendError? <span>Error. Check connection.</span>
                                        : <>In <span className="link"><Link to="/folder-that-has-file">folder-that-has-file-folder-that-has-file</Link></span></>
                                    }
                                </div>
                            </div>
                            <button>Copy Link</button>
                        </div>
                    </div>
                }
            </div>
        </>
    )
}

export default Upload;
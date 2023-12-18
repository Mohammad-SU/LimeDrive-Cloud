import { memo, useState, useEffect, useRef } from 'react';
import "./FileViewer.scss"
import axios from 'axios';
import { useFileContext } from '../../../contexts/FileContext';
import { useUserContext } from '../../../contexts/UserContext';
import { AiOutlineClose, AiOutlineComment, AiOutlineDownload, AiOutlinePrinter } from 'react-icons/ai';
import { motion, AnimatePresence } from 'framer-motion';
import DynamicClip from '../../DynamicClip';
import LoadingBar from '../../LoadingBar-COMPS/LoadingBar';
import Backdrop from '../../Backdrop-comp/Backdrop';
import useDelayedExit from '../../../hooks/useDelayedExit';
import FocusTrap from 'focus-trap-react';
import ContentViewer from './ContentViewer';
import { BsChevronDown, BsShare, BsThreeDotsVertical } from 'react-icons/bs';
import { useToast } from '../../../contexts/ToastContext';

function FileViewer() {
    const { fileToView, setFileToView } = useFileContext();
    const { apiSecure } = useUserContext();
    const { showToast, setToastContainer } = useToast()
    const fileViewerRef = useRef<HTMLDivElement | null>(null);
    const fileViewerHeaderRef = useRef<HTMLDivElement | null>(null);
    const [fileToViewName, setFileToViewName] = useState("") // Here because of animation exit problems
    const [fileContentUrl, setFileContentUrl] = useState("");
    const [notSupported, setNotSupported] = useState(false);
    const [backendErrorMsg, setBackendErrorMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const controller = new AbortController();
    const supportedFileTypes: string[] = [
        "image/bmp", "text/csv", "application/vnd.oasis.opendocument.text",
        "image/gif", "text/htm", "text/html", "image/jpg", "image/jpeg",
        "application/pdf", "image/png", "image/x-icon", "text/plain",
        "video/mp4", "video/webm", "audio/ogg", "audio/mpeg"
    ];
    const { isVisible: isFileViewerVisible }  = useDelayedExit({
        shouldRender: fileToView != null,
        onExitCallback: () => {
            setToastContainer(document.body)
            if (fileContentUrl) window.URL.revokeObjectURL(fileContentUrl)
            setFileToViewName("")
            setFileContentUrl("")
            setNotSupported(false);
            setBackendErrorMsg("");
        }
    })

    const setupFileViewer = async () => {
        if (!fileToView) return
        const newFileToView = { ...fileToView }
        setFileToViewName(newFileToView.name)
        if (fileContentUrl) window.URL.revokeObjectURL(fileContentUrl) // Leave this just in case
        setTimeout(() => { // Run after FileViewer is rendered
            setToastContainer(document.querySelector(".FileViewer") as HTMLElement | null);
        }, 1);
        if (!supportedFileTypes.includes(newFileToView.type)) {
            setNotSupported(true);
            return;
        }
        try {
            setLoading(true)
            const response = await apiSecure.get('/getFileContent', {
                params: {id: newFileToView.id},
                signal: controller.signal,
                responseType: newFileToView.type.startsWith('video/') ? 'json' : 'arraybuffer',
            });

            let url
            if (newFileToView.type.startsWith("video/")) {
                url = response.data.fileUrl
            } 
            else {
                const fileContent = new Blob([response.data], { type: newFileToView.type })
                url = URL.createObjectURL(fileContent)
            }
            console.log(url)
            setFileContentUrl(url);
        } 
        catch (error) {
            console.error(error);
            if (axios.isAxiosError(error)) {
                setBackendErrorMsg(error.message)
            }
        }
        finally {
            if (newFileToView.type.startsWith("video")) {
                setTimeout(() => {
                    setLoading(false)
                }, 5000);
            } else {
                setLoading(false)
            }
        }
    };
    useEffect(() => {
        setupFileViewer()
        return () => {
            setTimeout(() => {
                controller.abort(); // Used here instead of in onExitCallback or in below useeffect because for some reason aborting didnt work in those places, timeout is here to match the animation
            }, 300);
        }
    }, [fileToView])

    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.stopPropagation()
                setFileToView(null)
            }
        }
        const handleClickOutside = (event: MouseEvent) => {
            if (event.target === fileViewerRef.current || event.target === fileViewerHeaderRef.current) { // If FileViewer or its header clicked directly (none of its children clicked)
                setFileToView(null);
            }
        };
        window.addEventListener('keydown', handleEscapeKey);
        window.addEventListener('click', handleClickOutside);
        
        return () => {
            window.removeEventListener('keydown', handleEscapeKey);
            window.removeEventListener('click', handleClickOutside);
        }
    }, [])

    return (
            <>
                {isFileViewerVisible &&
                    <FocusTrap>
                        <div className="FileViewer" ref={fileViewerRef}>
                            <div className="file-viewer-header" ref={fileViewerHeaderRef}>
                                <div className="file-name-cont">
                                    <button className="icon-btn-wrapper close-btn" onClick={() => setFileToView(null)}>
                                        <AiOutlineClose className="icon-btn" />
                                    </button>
                                    <h1>{fileToViewName}</h1>
                                    <DynamicClip clipPathId='fileViewerNameContClip' animation={fileToView != null} numRects={1} />
                                </div>

                                <button className="open-with-btn" onClick={() => showToast({message: "Open with not yet featured.", showFailIcon: true})}>
                                    Open with
                                    <BsChevronDown className='chevron'/>
                                    <DynamicClip clipPathId='fileViewerOpenWithBtnClip' animation={fileToView != null} numRects={4} />
                                </button>

                                <div className="file-viewer-toolbar">
                                    <button className="icon-btn-wrapper comment-btn" onClick={() => showToast({message: "Commenting from preview not yet featured.", showFailIcon: true})}>
                                        <AiOutlineComment className="icon-btn comment-icon"/>
                                    </button>
                                    <button className="icon-btn-wrapper print-btn" onClick={() => showToast({message: "Printing not yet featured.", showFailIcon: true})}>
                                        <AiOutlinePrinter className="icon-btn printer-icon"/>
                                    </button>
                                    <button className="icon-btn-wrapper download-btn" onClick={() => showToast({message: "Downloading from preview not yet featured.", showFailIcon: true})}>
                                        <AiOutlineDownload className="icon-btn download-icon"/>
                                    </button>
                                    <button className="icon-btn-wrapper more-btn" onClick={() => showToast({message: "More preview tools not yet featured.", showFailIcon: true})}>
                                        <BsThreeDotsVertical className="icon-btn vertical-dots-icon"/>
                                    </button>
                                    <DynamicClip clipPathId='FileViewerToolbarIconBtnClip' animation={fileToView != null} numRects={4} />
                                    <button className="share-btn" onClick={() => showToast({message: "Sharing from preview not yet featured.", showFailIcon: true})}>
                                        <BsShare className="share-icon"/>
                                        Share
                                        <DynamicClip clipPathId='fileViewerShareBtnClip' animation={fileToView != null} numRects={4} />
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence> {/* DynamicClip not used for content viewer due to slowness of clip animation when file content is loaded */}
                                {fileToView &&
                                    <motion.div 
                                        className="file-content"
                                        initial={{  boxShadow: '0 0 0px 0px lime' }}
                                        animate={{ boxShadow: '0 0 30px 7px lime'}}
                                        exit={{ boxShadow: '0 0 0px 0px lime' }} // For some reason changing it to "none" doesn't animate and changing initial boxShadow to 0 looks weird, and didnt work when giving it to child containers. Transition for this didn't work in scss either
                                        transition={{ duration: 0.3 }}
                                        key="fileViewerContentKey"
                                    >
                                        {loading || notSupported || backendErrorMsg || !fileContentUrl ?
                                            <motion.div 
                                                className="loading-indicator-and-info"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                key="fileContentLoadingIndicatorKey"
                                            >
                                                {loading ?
                                                    <><h1>Loading Content...</h1>
                                                    <LoadingBar /></>
                                                 : notSupported ?
                                                    <h1 className="not-supported-text">Preview not supported for this file type.</h1>
                                                 :
                                                    <h1 className="error-text">Failed to load preview.<br/>Please check your connection.</h1>
                                                }
                                            </motion.div>
                                         :
                                            <motion.div
                                                className="ContentViewer-cont"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                key="docViewerKey"
                                            >
                                                <ContentViewer fileContentUrl={fileContentUrl} fileType={fileToView.type}/>
                                            </motion.div>
                                        }
                                    </motion.div>
                                }
                            </AnimatePresence>
                        </div>
                    </FocusTrap>
                }
                <Backdrop render={fileToView != null} className="file-viewer-backdrop" onClick={() => setFileToView(null)}/>
            </>
    )
}

export default memo(FileViewer);

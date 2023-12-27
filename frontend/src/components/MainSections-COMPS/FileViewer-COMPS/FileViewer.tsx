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
    const [textTooLarge, setTextTooLarge] = useState(false);
    const [fileTextContent, setFileTextContent] = useState("");
    const [urlExpired, setUrlExpired] = useState(false);
    const [backendErrorMsg, setBackendErrorMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [urlExpirationTimeout, setUrlExpirationTimeout] = useState<NodeJS.Timeout | undefined>(undefined);
    const controller = new AbortController();
    const supportedFileTypes: string[] = [
        "image/jpg", "image/jpeg", "image/bmp", "image/gif", 
        "image/png", "image/x-icon", "application/pdf", 
        "video/mp4", "video/webm", "audio/ogg", "audio/mpeg", 
        "audio/wav", "audio/flac", "audio/x-m4a",
        "text/plain", "text/htm", "text/html",
    ];
    const { isVisible: isFileViewerVisible }  = useDelayedExit({
        shouldRender: fileToView != null,
        onExitCallback: () => {
            setToastContainer(document.body)
            if (fileContentUrl) window.URL.revokeObjectURL(fileContentUrl)
            setFileToViewName("")
            setFileContentUrl("")
            setNotSupported(false);
            setTextTooLarge(false);
            setFileTextContent("")
            setBackendErrorMsg("");
            setContentLoaded(false)
            setUrlExpired(false)
            clearTimeout(urlExpirationTimeout)
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
        else if (newFileToView.type === "text/plain" && newFileToView.size > 20 * 1024 * 1024) {
            setTextTooLarge(true);
            return;
        }

        try {
            setLoading(true)
            const response = await apiSecure.get('/getFileContent', {
                params: {id: newFileToView.id},
                signal: controller.signal,
            });

            if (newFileToView.type === "text/plain") {
                setFileTextContent(response.data)
            } else {
                setFileContentUrl(response.data.fileUrl);
            }

            if (newFileToView.type.startsWith("video/")) { // User may notice problems when viewing a video type file after its url expires, but other supported file types don't seem to have issues after url expiration
                const currentTime = Math.floor(Date.now() / 1000);
                const timeRemaining = response.data.expirationTime - currentTime;
    
                const expirationTimeout = setTimeout(() => {
                    window.URL.revokeObjectURL(fileContentUrl)
                    setUrlExpired(true)
                }, timeRemaining * 1000);
    
                setUrlExpirationTimeout(expirationTimeout);
            }
        }
        catch (error) {
            console.error(error);
            if (axios.isAxiosError(error)) {
                setBackendErrorMsg(error.message)
            }
        }
        finally {
            setLoading(false)
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

    const [contentLoaded, setContentLoaded] = useState(false)

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
                                    <button className="icon-btn-wrapper comment-btn" onClick={() => showToast({message: "Commenting from viewer not yet featured.", showFailIcon: true})}>
                                        <AiOutlineComment className="icon-btn comment-icon"/>
                                    </button>
                                    <button className="icon-btn-wrapper print-btn" onClick={() => showToast({message: "Printing from file viewer toolbar not yet featured.", showFailIcon: true})}>
                                        <AiOutlinePrinter className="icon-btn printer-icon"/>
                                    </button>
                                    <button className="icon-btn-wrapper download-btn" onClick={() => showToast({message: "Downloading from viewer not yet featured.", showFailIcon: true})}>
                                        <AiOutlineDownload className="icon-btn download-icon"/>
                                    </button>
                                    <button className="icon-btn-wrapper more-btn" onClick={() => showToast({message: "More viewer tools not yet featured.", showFailIcon: true})}>
                                        <BsThreeDotsVertical className="icon-btn vertical-dots-icon"/>
                                    </button>
                                    <DynamicClip clipPathId='FileViewerToolbarIconBtnClip' animation={fileToView != null} numRects={4} />
                                    <button className="share-btn" onClick={() => showToast({message: "Sharing from viewer not yet featured.", showFailIcon: true})}>
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
                                        {(loading || notSupported || urlExpired || textTooLarge || !fileContentUrl && !fileTextContent || backendErrorMsg) ?
                                            (<motion.div 
                                                className="loading-indicator-and-info"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }} // Exit animation doesn't seem to work when loading condition changes to render the ContentViewer
                                                transition={{ duration: 0.3 }}
                                                key="fileContentLoadingIndicatorKey"
                                            >
                                                {loading ?
                                                    <><h1>Loading Content...</h1>
                                                    <LoadingBar /></>
                                                 : notSupported ?
                                                    <h1 className="not-supported-text">Preview not supported for this file type.</h1>
                                                 : urlExpired ?
                                                    <h1 className="error-text">Content source expired.<br/>Reopen this file to view it again.</h1>
                                                 : textTooLarge ?
                                                    <h1 className="error-text">Cannot preview "text/plain"<br/>that are larger than 20MB.</h1>
                                                 :
                                                    <h1 className="error-text">Failed to load content.<br/>Please check your connection.</h1>
                                                }
                                            </motion.div>)
                                         :  // Leave separate so that loading may feel less slow to user
                                            (<>                                                
                                                <motion.span
                                                    className="spinner-after"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: !contentLoaded && !(fileToView.type.startsWith("image/") && fileToView.size < 2097152) ? 1 : 0 }} // Smaller images usually load quite faster
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    key="contentViewerSpinnerKey"
                                                />
                                                <motion.div
                                                    className="ContentViewer-cont"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: !contentLoaded ? 0 : 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    key="contentViewerKey"
                                                >
                                                    <ContentViewer fileContentUrl={fileContentUrl} fileType={fileToView.type} fileTextContent={fileTextContent} setContentLoaded={setContentLoaded}/>
                                                </motion.div>
                                            </>)
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

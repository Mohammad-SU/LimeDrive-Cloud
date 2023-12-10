import { memo, useState, useEffect, useRef } from 'react';
import "./FileViewer.scss"
import axios from 'axios';
import { useFileContext } from '../../../contexts/FileContext';
import { useUserContext } from '../../../contexts/UserContext';
import { AiOutlineClose, AiOutlineComment, AiOutlineDownload, AiOutlinePrinter } from 'react-icons/ai';
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { motion, AnimatePresence } from 'framer-motion';
import DynamicClip from '../../DynamicClip';
import LoadingBar from '../../LoadingBar-COMPS/LoadingBar';
import Backdrop from '../../Backdrop-comp/Backdrop';
import useDelayedExit from '../../../hooks/useDelayedExit';
import FocusTrap from 'focus-trap-react';
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
        "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/gif", "text/htm", "text/html", "image/jpg", "image/jpeg",
        "application/pdf", "image/png", "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "image/tiff", "text/plain", "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "video/mp4"
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
            });
            const binaryData = atob(response.data.fileContent);

            const arrayBuffer = new ArrayBuffer(binaryData.length);
            const view = new Uint8Array(arrayBuffer);
            for (let i = 0; i < binaryData.length; i++) {
                view[i] = binaryData.charCodeAt(i);
            }
            const blob = new Blob([arrayBuffer], { type: newFileToView.type });
            setFileContentUrl(window.URL.createObjectURL(blob));
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
                controller.abort(); // Used here instead of in onExitCallback and below useeffect because for some reason aborting didnt work in those places
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
                                        <DynamicClip clipPathId='fileViewerCommentBtnClip' animation={fileToView != null} numRects={4} />
                                    </button>
                                    <button className="icon-btn-wrapper print-btn" onClick={() => showToast({message: "Printing not yet featured.", showFailIcon: true})}>
                                        <AiOutlinePrinter className="icon-btn printer-icon"/>
                                        <DynamicClip clipPathId='fileViewerPrintBtnClip' animation={fileToView != null} numRects={4} />
                                    </button>
                                    <button className="icon-btn-wrapper download-btn" onClick={() => showToast({message: "Downloading from preview not yet featured.", showFailIcon: true})}>
                                        <AiOutlineDownload className="icon-btn download-icon"/>
                                        <DynamicClip clipPathId='fileViewerDownloadBtnClip' animation={fileToView != null} numRects={4} />
                                    </button>
                                    <button className="icon-btn-wrapper more-btn" onClick={() => showToast({message: "More preview tools not yet featured.", showFailIcon: true})}>
                                        <BsThreeDotsVertical className="icon-btn vertical-dots-icon"/>
                                        <DynamicClip clipPathId='fileViewerMoreBtnClip' animation={fileToView != null} numRects={4} />
                                    </button>
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
                                        {loading || notSupported || backendErrorMsg ?
                                            <motion.div 
                                                className="loading-indicator-and-info"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                key="fileContentLoadingIndicatorKey"
                                            >
                                                {loading ?
                                                        <><h1>Loading File...</h1>
                                                        <LoadingBar /></>
                                                    : notSupported ?
                                                        <h1 className="not-supported-text">Preview not supported for this file type.</h1>
                                                    :
                                                        <h1 className="error-text">Failed to load preview.<br/>Please check your connection.</h1>
                                                }
                                            </motion.div>
                                            :
                                            <motion.div
                                                className="doc-viewer-cont"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                key="docViewerKey"
                                            >
                                                <DocViewer
                                                    className="doc-viewer"
                                                    pluginRenderers={DocViewerRenderers}
                                                    documents={[{ uri: fileContentUrl }]}
                                                    config={{ header: { disableHeader: true } }}
                                                ></DocViewer>
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

// FileViewer.tsx
import { memo, useState, useEffect } from 'react';
import "./FileViewer.scss"
import { useFileContext } from '../../../contexts/FileContext';
import { useUserContext } from '../../../contexts/UserContext';
import { AiOutlineClose } from 'react-icons/ai';
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { motion, AnimatePresence } from 'framer-motion';
import DynamicClip from '../../DynamicClip';
import Backdrop from '../../Backdrop-comp/Backdrop';
import useDelayedExit from '../../../hooks/useDelayedExit';
import FocusTrap from 'focus-trap-react';

function FileViewer() {
    const { fileToView, setFileToView } = useFileContext();
    const { apiSecure } = useUserContext();
    const [fileToViewName, setFileToViewName] = useState("") // Here because of animation exit problems
    const [fileContentUrl, setFileContentUrl] = useState("");
    const { isVisible: isToolbarVisible }  = useDelayedExit({
        shouldRender: fileToView != null,
        onExitCallback: () => {
            setFileToViewName("")
            setFileContentUrl("")
        }
    })

    const fetchFileContent = async () => {
        if (!fileToView) return
        const newFileToView = { ...fileToView }
        try {
            setFileToViewName(newFileToView.name)
            const lastPeriodIndex =  newFileToView.name.lastIndexOf('.');
            const fileExtension = lastPeriodIndex !== -1 ? newFileToView.name.slice(lastPeriodIndex + 1) : '';
            
            const response = await apiSecure.get('/fetchFileContent', {
                params: {
                    id: newFileToView.id,
                    extension: fileExtension
                }
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
        }
    };

    useEffect(() => {
        fetchFileContent()
    }, [fileToView])

    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.stopPropagation()
                setFileToView(null)
            }
        }
        window.addEventListener('keydown', handleEscapeKey);
        return () => {
            window.removeEventListener('keydown', handleEscapeKey);
        }
    }, [])

    return (
        
            <>
                {isToolbarVisible && 
                    <FocusTrap>
                        <div className="FileViewer">
                            <div className="toolbar">
                                <button className="icon-btn-wrapper close-btn" onClick={() => setFileToView(null)}>
                                    <AiOutlineClose className="icon-btn" />
                                </button>
                                <h1>{fileToViewName}</h1>
                                <DynamicClip clipPathId='fileViewerToolbarClip' animation={fileToView != null} numRects={1} />
                            </div>

                            <AnimatePresence>
                                {fileToView &&
                                    <motion.div
                                        key="fileViewerContentKey"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="file-content"
                                    >
                                        <DocViewer
                                            className="doc-viewer"
                                            pluginRenderers={DocViewerRenderers}
                                            documents={[{ uri: fileContentUrl }]}
                                            config={{ header: { disableHeader: true } }}
                                        ></DocViewer>
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

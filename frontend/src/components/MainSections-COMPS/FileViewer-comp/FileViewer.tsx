// FileViewer.tsx
import { memo, useState, useEffect } from 'react';
import "./FileViewer.scss"
import { useFileContext } from '../../../contexts/FileContext';
import { AiOutlineClose } from 'react-icons/ai';
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { motion, AnimatePresence } from 'framer-motion';
import DynamicClip from '../../DynamicClip';
import Backdrop from '../../Backdrop-comp/Backdrop';
import useDelayedExit from '../../../hooks/useDelayedExit';
import FocusTrap from 'focus-trap-react';

function FileViewer() {
    const { fileToView, setFileToView } = useFileContext();
    const [fileToViewName, setFileToViewName] = useState("") // Here because of animation exit problems
    const { isVisible: isToolbarVisible }  = useDelayedExit({
        shouldRender: fileToView != null,
        onExitCallback: () => setFileToViewName("")
    })

    useEffect(() => {
        if (fileToView) setFileToViewName(fileToView.name)
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
                                            pluginRenderers={DocViewerRenderers}
                                            documents={[{ uri: 'src/assets/images/ascii/LimeDrive-ascii.png'}]}
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

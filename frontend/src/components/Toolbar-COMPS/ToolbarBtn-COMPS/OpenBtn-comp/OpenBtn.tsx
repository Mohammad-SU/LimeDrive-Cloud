import "./OpenBtn.scss"
import { memo, useState, useEffect } from 'react'
import { useFileContext } from '../../../../contexts/FileContext'
import { useToast } from "../../../../contexts/ToastContext"
import { useUserContext } from "../../../../contexts/UserContext"
import { BsEye } from "react-icons/bs"
import DynamicClip from "../../../DynamicClip"
import useDelayedExit from "../../../../hooks/useDelayedExit"
import { AiOutlineClose } from "react-icons/ai"

function OpenBtn({ toolbarRendered }: { toolbarRendered: boolean }) {
    const { selectedItems } = useFileContext()
    const { showToast } = useToast()
    const { apiSecure } = useUserContext()
    const [showFileViewer, setShowFileViewer] = useState(false)
    const { isVisible: isFileViewerVisbile } = useDelayedExit({
        shouldRender: showFileViewer,
    })

    const handleToolbarOpenClick = async () => {
        const newSelectedItems = selectedItems.slice();

        if (newSelectedItems.length == 0 || newSelectedItems.length > 1 || newSelectedItems[0].type == undefined) { // If more than no items or one item selected or if folder selected then return
            return
        }

        try {
            setShowFileViewer(true)
            const response = await apiSecure.post('/getFileContent', {
                fileId: newSelectedItems[0].id
            });
            console.log(response.data)
        } 
        catch (error) {
            console.error(error);
        }
    }

    return (
        <>
            <button className="OpenBtn" onClick={handleToolbarOpenClick}>
                <BsEye className="tool-icon eye"/>
                Preview
            </button>

            {isFileViewerVisbile && selectedItems[0]?.name && // Extra condition in case user presses browser back button
                <div className="file-viewer">
                    <div className="heading-cont">
                        <button className="icon-btn-wrapper close-btn" type="button" onClick={() => setShowFileViewer(false)}>
                            <AiOutlineClose className="icon-btn" />
                        </button>
                        <h1>{selectedItems[0].name}</h1>
                    </div>

                    <div className="file-content">
                    </div>
                    <DynamicClip
                        clipPathId="fileViewerClip"
                        animation={showFileViewer}
                        numRects={50}
                        incrementProportion={0.025}
                        animationDuration={300}
                    />
                </div>
            }
        </>
    )
}

export default memo(OpenBtn)
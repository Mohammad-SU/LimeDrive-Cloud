import { memo, useState, useEffect } from 'react'
import "./MainToolbar.scss"
import useDelayedExit from '../../../hooks/useDelayedExit'
import { useFileContext } from '../../../contexts/FileContext'
import DownloadBtn from '../ToolbarBtn-COMPS/DownloadBtn'
import OpenBtn from '../ToolbarBtn-COMPS/OpenBtn'
import DeleteBtn from '../ToolbarBtn-COMPS/DeleteBtn-comp/DeleteBtn'
import MoveBtn from '../ToolbarBtn-COMPS/MoveBtn-comp/MoveBtn'
import { AiOutlineStar } from 'react-icons/ai'
import { BsLink45Deg, BsShare } from 'react-icons/bs'
import { GoPencil } from 'react-icons/go'
import DynamicClip from '../../DynamicClip'
import { useToast } from '../../../contexts/ToastContext'


function MainToolbar() {
    const { showToast } = useToast()
    const { selectedItems } = useFileContext()
    const [showToolbar, setShowToolbar] = useState(false)
    const [showOpenBtn, setShowOpenBtn] = useState(false)
    const [showRenameBtn, setShowRenameBtn] = useState(false)

    useEffect(() => {
        const newShowToolbar = selectedItems.length > 0
        setShowToolbar(newShowToolbar);

        !newShowToolbar ? // So that the openBtn doesnt quickly unrender when all items are unselected, so that the openBtn is hidden after the clip animation instead
            null
        : selectedItems.length === 1 && selectedItems[0].type != undefined ?
            setShowOpenBtn(true)
        : setShowOpenBtn(false)

        !newShowToolbar ? // So that the openBtn doesnt quickly unrender when all items are unselected, so that the openBtn is hidden after the clip animation instead
            null
        : selectedItems.length === 1 ?
            setShowRenameBtn(true)
        : setShowRenameBtn(false)
    }, [selectedItems]);

    const { isVisible: isToolbarVisible }  = useDelayedExit({
        shouldRender: showToolbar,
        delayMs: 300 // Different from clip animation duration due to modals being unrendered after items are unselected (though not 100% sure if it fixes the issue)
    })

    return (
        isToolbarVisible &&
            <div className="MainToolbar">
                <div className="main-tools">
                    <DownloadBtn />
                    {showOpenBtn && <OpenBtn />}
                    <DeleteBtn toolbarRendered={showToolbar}/>
                    
                    <div className="toolbar-divider" />

                    <MoveBtn toolbarRendered={showToolbar}/>
                    {showRenameBtn &&
                        <button className="RenameBtn" onClick={() => showToast({message: "Renaming not yet featured.", showFailIcon: true})}>
                            <GoPencil className="tool-icon"/>
                            Rename
                        </button>
                    }
                    <button className="StarBtn" onClick={() => showToast({message: "Starring not yet featured.", showFailIcon: true})}>
                        <AiOutlineStar className="tool-icon"/>
                        Star
                    </button>
                </div>

                <div className="sharing-tools">
                    <button className="LinkBtn" onClick={() => showToast({message: "Getting link from link button not yet featured.", showFailIcon: true})}> {/* For multiple selected items, control access modal and separate copied links with commas*/}
                        <BsLink45Deg className="tool-icon link"/>
                    </button>
                    <button className="ShareBtn" onClick={() => showToast({message: "Sharing not yet featured.", showFailIcon: true})}>
                        <BsShare className="tool-icon share"/>
                        Share
                    </button>
                </div>
                <DynamicClip clipPathId="MainToolbarBtnClip" animation={showToolbar} animationDuration={200} numRects={4}/>
            </div>
    )
}

export default memo(MainToolbar)
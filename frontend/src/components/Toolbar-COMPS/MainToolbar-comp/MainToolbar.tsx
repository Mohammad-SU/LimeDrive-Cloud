import { memo, useState, useEffect } from 'react'
import "./MainToolbar.scss"
import useDelayedExit from '../../../hooks/useDelayedExit'
import { useFileContext } from '../../../contexts/FileContext'
import OpenBtn from '../ToolbarBtn-COMPS/OpenBtn'
import DeleteBtn from '../ToolbarBtn-COMPS/DeleteBtn-comp/DeleteBtn'
import MoveBtn from '../ToolbarBtn-COMPS/MoveBtn-comp/MoveBtn'
import { AiOutlineDownload, AiOutlineStar } from 'react-icons/ai'
import { BsLink45Deg, BsShare } from 'react-icons/bs'
import { GoPencil } from 'react-icons/go'
import DynamicClip from '../../DynamicClip'


function MainToolbar() {
    const { selectedItems } = useFileContext()
    const [showToolbar, setShowToolbar] = useState(false)
    const [showOpenBtn, setShowOpenBtn] = useState(false)

    useEffect(() => {
        const newShowToolbar = selectedItems.length > 0
        setShowToolbar(newShowToolbar);

        !newShowToolbar ? // So that the openBtn doesnt quickly unrender when all items are unselected, so that the openBtn is hidden after the clip animation instead
            null
        : selectedItems.length == 1 && selectedItems[0].type != undefined ?
            setShowOpenBtn(true)
        : setShowOpenBtn(false)
    }, [selectedItems]);

    const { isVisible: isToolbarVisible }  = useDelayedExit({
        shouldRender: showToolbar,
        delayMs: 300 // Different from clip animation duration due to modals being unrendered after items are unselected (though not 100% sure if it fixes the issue)
    })

    return (
        isToolbarVisible &&
            <div className="MainToolbar">
                <div className="main-tools">
                    <button className="DownloadBtn">
                        <AiOutlineDownload className="tool-icon"/>
                        Download
                        <DynamicClip clipPathId="DownloadBtnClip" animation={showToolbar} animationDuration={200} numRects={4} incrementProportion={0.1}/>
                    </button>

                    {showOpenBtn &&
                        <OpenBtn toolbarRendered={showToolbar}/>
                    }
                    <DynamicClip clipPathId="OpenBtnClip" animation={showToolbar} animationDuration={200} numRects={4} incrementProportion={0.1}/>

                    <DeleteBtn toolbarRendered={showToolbar}/>
                    <DynamicClip clipPathId="DeleteBtnClip" animation={showToolbar} animationDuration={200} numRects={4} incrementProportion={0.1}/>
                    
                    <div className="toolbar-divider" />
                    <DynamicClip clipPathId="toolbarDividerClip" animation={showToolbar} animationDuration={200} numRects={4} incrementProportion={0.1}/>

                    <MoveBtn toolbarRendered={showToolbar}/>
                    <DynamicClip clipPathId="MoveBtnClip" animation={showToolbar} animationDuration={200} numRects={4} incrementProportion={0.1}/>

                    <button className="RenameBtn">
                        <GoPencil className="tool-icon"/>
                        Rename
                        <DynamicClip clipPathId="RenameBtnClip" animation={showToolbar} animationDuration={200} numRects={4} incrementProportion={0.1}/>
                    </button>
                    <button className="StarBtn">
                        <AiOutlineStar className="tool-icon"/>
                        Star
                        <DynamicClip clipPathId="StarBtnClip" animation={showToolbar} animationDuration={200} numRects={4} incrementProportion={0.1}/>
                    </button>
                </div>

                <div className="sharing-tools">
                    <button className="LinkBtn">
                        <BsLink45Deg className="tool-icon link"/>
                        <DynamicClip clipPathId="LinkBtnClip" animation={showToolbar} animationDuration={200} numRects={4} incrementProportion={0.1}/>
                    </button>
                    <button className="ShareBtn">
                        <BsShare className="tool-icon share"/>
                        Share
                        <DynamicClip clipPathId="ShareBtnClip" animation={showToolbar} animationDuration={200} numRects={4} incrementProportion={0.1}/>
                    </button>
                </div>
            </div>
    )
}

export default memo(MainToolbar)
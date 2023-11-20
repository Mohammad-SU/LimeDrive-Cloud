import { memo, useState, useEffect } from 'react'
import "./MainToolbar.scss"
import useDelayedExit from '../../../hooks/useDelayedExit'
import { useFileContext } from '../../../contexts/FileContext'
import MoveBtn from '../ToolbarBtn-COMPS/MoveBtn-comp/MoveBtn'
import DeleteBtn from '../ToolbarBtn-COMPS/DeleteBtn-comp/DeleteBtn'
import { AiOutlineDownload, AiOutlineStar } from 'react-icons/ai'
import { BsEye, BsLink45Deg, BsShare } from 'react-icons/bs'
import { GoPencil } from 'react-icons/go'
import DynamicClip from '../../DynamicClip'


function MainToolbar() {
    const { selectedItems } = useFileContext()
    const [showToolbar, setShowToolbar] = useState(false)
    useEffect(() => {
        setShowToolbar(selectedItems.length > 0);
    }, [selectedItems]);

    const { isVisible: isToolbarVisible }  = useDelayedExit({
        shouldRender: showToolbar,
        delayMs: 200
    })

    return (
        isToolbarVisible &&
            <div className="MainToolbar">
                <div className="main-tools">
                    <button className="DownloadBtn">
                        <AiOutlineDownload className="tool-icon"/>
                        Download
                        <DynamicClip clipPathId="DownloadBtnClip" animation={showToolbar} animationDuration={200} numRects={4}/>
                    </button>
                    <button className="PreviewBtn">
                        <BsEye className="tool-icon eye"/>
                        Preview
                        <DynamicClip clipPathId="PreviewBtnClip" animation={showToolbar} animationDuration={200} numRects={4}/>
                    </button>

                    <DeleteBtn toolbarRendered={showToolbar}/>
                    <DynamicClip clipPathId="DeleteBtnClip" animation={showToolbar} animationDuration={200} numRects={4}/>
                    
                    <div className="toolbar-divider" />

                    <MoveBtn toolbarRendered={showToolbar}/>
                    <DynamicClip clipPathId="MoveBtnClip" animation={showToolbar} animationDuration={200} numRects={4}/>

                    <button className="RenameBtn">
                        <GoPencil className="tool-icon"/>
                        Rename
                        <DynamicClip clipPathId="RenameBtnClip" animation={showToolbar} animationDuration={200} numRects={4}/>
                    </button>
                    <button className="StarBtn">
                        <AiOutlineStar className="tool-icon"/>
                        Star
                        <DynamicClip clipPathId="StarBtnClip" animation={showToolbar} animationDuration={200} numRects={4}/>
                    </button>
                </div>

                <div className="sharing-tools">
                    <button className="LinkBtn">
                        <BsLink45Deg className="tool-icon link"/>
                        <DynamicClip clipPathId="LinkBtnClip" animation={showToolbar} animationDuration={200} numRects={4}/>
                    </button>
                    <button className="ShareBtn">
                        <BsShare className="tool-icon share"/>
                        Share
                        <DynamicClip clipPathId="ShareBtnClip" animation={showToolbar} animationDuration={200} numRects={4}/>
                    </button>
                </div>
            </div>
    )
}

export default memo(MainToolbar)
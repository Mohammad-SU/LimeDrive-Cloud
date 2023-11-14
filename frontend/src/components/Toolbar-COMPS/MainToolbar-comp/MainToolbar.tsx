import { memo, useState, useEffect } from 'react'
import "./MainToolbar.scss"
import useDelayedExit from '../../../hooks/useDelayedExit'
import { useFileContext } from '../../../contexts/FileContext'
import MoveBtn from '../ToolbarBtn-COMPS/MoveBtn'
import { AiOutlineDownload, AiOutlineStar } from 'react-icons/ai'
import { BsEye, BsLink45Deg, BsShare } from 'react-icons/bs'
import { SlTrash } from 'react-icons/sl'
import { GoPencil } from 'react-icons/go'
import DynamicClip from '../../DynamicClip'


function MainToolbar() {
    const { selectedItems } = useFileContext()
    const [showToolbar, setShowToolbar] = useState(false)
    useEffect(() => {
        setShowToolbar(selectedItems.length > 0);
    }, [selectedItems]);

    const { isVisible: isToolbarVisible }  = useDelayedExit({
        shouldRender: showToolbar
    })

    return (
        isToolbarVisible &&
            <div className="MainToolbar">
                <div className="main-tools">
                    <button className="DownloadBtn">
                        <AiOutlineDownload className="tool-icon"/>
                        Download
                        <DynamicClip clipPathId="DownloadBtnClip" animation={showToolbar} numRects={4}/>
                    </button>
                    <button className="PreviewBtn">
                        <BsEye className="tool-icon eye"/>
                        Preview
                        <DynamicClip clipPathId="PreviewBtnClip" animation={showToolbar} numRects={4}/>
                    </button>
                    <button className="DeleteBtn">
                        <SlTrash className="tool-icon trash"/>
                        Delete
                        <DynamicClip clipPathId="DeleteBtnClip" animation={showToolbar} numRects={4}/>
                    </button>
                    
                    <div className="toolbar-divider" />

                    <MoveBtn toolbarRendered={showToolbar}/>
                    <DynamicClip clipPathId="MoveBtnClip" animation={showToolbar} numRects={4}/>

                    <button className="RenameBtn">
                        <GoPencil className="tool-icon"/>
                        Rename
                        <DynamicClip clipPathId="RenameBtnClip" animation={showToolbar} numRects={4}/>
                    </button>
                    <button className="StarBtn">
                        <AiOutlineStar className="tool-icon"/>
                        Star
                        <DynamicClip clipPathId="StarBtnClip" animation={showToolbar} numRects={4}/>
                    </button>
                </div>

                <div className="sharing-tools">
                    <button className="LinkBtn">
                        <BsLink45Deg className="tool-icon link"/>
                        <DynamicClip clipPathId="LinkBtnClip" animation={showToolbar} numRects={4}/>
                    </button>
                    <button className="ShareBtn">
                        <BsShare className="tool-icon share"/>
                        Share
                        <DynamicClip clipPathId="ShareBtnClip" animation={showToolbar} numRects={4}/>
                    </button>
                </div>
            </div>
    )
}

export default memo(MainToolbar)
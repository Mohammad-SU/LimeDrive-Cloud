import { memo } from 'react'
import { useFileContext } from '../../../contexts/FileContext'
import useDelayedExit from '../../../hooks/useDelayedExit'
import DynamicClip from '../../DynamicClip'
import Backdrop from '../../Backdrop-comp/Backdrop'
import { SlCursorMove } from 'react-icons/sl'
import "./MoveBtn.scss"

function MoveBtn() {
    const { selectedItems } = useFileContext()

    return (
        <>
            <button className="MoveBtn">
                <SlCursorMove className="tool-icon move"/>
                Move
            </button>
            {/* <div className="move-modal modal">
            
            </div> */}
        </>
    )
}

export default memo(MoveBtn)
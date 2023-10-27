import { memo } from 'react'
import "./MainToolbar.scss"
import { useFileContext } from '../../../contexts/FileContext'
import MoveBtn from '../ToolbarBtn-COMPS/MoveBtn'
import { AiOutlineDownload, AiOutlineStar } from 'react-icons/ai'
import { BsEye, BsLink45Deg, BsShare } from 'react-icons/bs'
import { SlTrash, SlCursorMove } from 'react-icons/sl'
import { GoPencil } from 'react-icons/go'

function MainToolbar() {
    const { selectedItems } = useFileContext()

    return (
        <div className="MainToolbar">
            <div className="main-tools">
                <button>
                    <AiOutlineDownload className="tool-icon"/>
                    Download
                </button>
                <button>
                    <BsEye className="tool-icon eye"/>
                    Preview
                </button>
                <button>
                    <SlTrash className="tool-icon trash"/>
                    Delete
                </button>
                <div className="divider" />
                <MoveBtn />
                <button>
                    <GoPencil className="tool-icon"/>
                    Rename
                </button>
                <button>
                    <AiOutlineStar className="tool-icon"/>
                    Star
                </button>
            </div>

            <div className="sharing-tools">
                <button>
                    <BsLink45Deg className="tool-icon link"/>
                </button>
                <button>
                    <BsShare className="tool-icon share"/>
                    Share
                </button>
            </div>
        </div>
    )
}

export default memo(MainToolbar)
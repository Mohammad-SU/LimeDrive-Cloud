import { memo } from 'react'
import { useFileContext } from '../../../contexts/FileContext'
import { AiOutlineDownload, AiOutlineStar } from 'react-icons/ai'
import { BsEye, BsLink45Deg, BsShare } from 'react-icons/bs'
import { SlTrash } from 'react-icons/sl'
import { GoPencil } from 'react-icons/go'
import "./MainToolbar.scss"

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
                    <BsEye className="tool-icon decrease"/>
                    Preview
                </button>
                <button>
                    <SlTrash className="tool-icon decrease"/>
                    Delete
                </button>
                <div className="divider" />
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
                    Copy link
                </button> {/* change to link icon only? */}
                <button>
                    <BsShare className="tool-icon share"/>
                    Share
                </button>
            </div>
        </div>
    )
}

export default memo(MainToolbar)
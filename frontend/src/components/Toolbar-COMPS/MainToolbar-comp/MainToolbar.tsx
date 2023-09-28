import { memo } from 'react'
import { useFileContext } from '../../../contexts/FileContext'
import "./MainToolbar.scss"

function MainToolbar() {
    const { selectedItems } = useFileContext()

    return (
        <div className="MainToolbar">
            <div className="main-tools">
                <button>Download</button>
                <button>View in</button>
                <button>Delete</button>
                <div className="divider" />
                <button>Rename</button>
                <button>Star</button>
            </div>

            <div className="sharing-tools">
                <button>Copy link</button> {/* change to link icon only? */}
                <button>Share</button>
            </div>
        </div>
    )
}

export default memo(MainToolbar)
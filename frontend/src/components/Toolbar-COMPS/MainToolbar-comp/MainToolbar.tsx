import { memo } from 'react'
import { useFileContext } from '../../../contexts/FileContext'
import "./MainToolbar.scss"

function MainToolbar() {
    const { selectedItems } = useFileContext()

    return (
        <div className="MainToolbar">
            <button></button>
        </div>
    )
}

export default memo(MainToolbar)
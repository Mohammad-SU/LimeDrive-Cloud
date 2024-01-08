import { memo } from 'react'
import { useFileContext } from '../../../contexts/FileContext'
import { AiOutlineDownload } from "react-icons/ai"
import { useUserContext } from '../../../contexts/UserContext'

function DownloadBtn() {
    const { selectedItems, handleDownloadItems } = useFileContext()
    const { apiSecure } = useUserContext()

    return (
        <button className="DownloadBtn" onClick={() => handleDownloadItems(selectedItems, apiSecure)}>
            <AiOutlineDownload className="tool-icon"/>
            Download
        </button>
    )
}

export default memo(DownloadBtn)
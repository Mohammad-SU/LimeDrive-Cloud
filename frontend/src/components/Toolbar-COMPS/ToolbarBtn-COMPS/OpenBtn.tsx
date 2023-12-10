import { memo } from 'react'
import { useFileContext } from '../../../contexts/FileContext'
import { AiOutlineDownload } from "react-icons/ai"

function OpenBtn() {
    const { selectedItems, setFileToView } = useFileContext()

    const handleToolbarOpenClick = async () => {
        const newSelectedItems = selectedItems.slice();
        if (newSelectedItems.length == 0 || newSelectedItems.length > 1 || newSelectedItems[0].type == undefined) { // If no items, more than one item, or if folder selected then return
            return
        }
        setFileToView(newSelectedItems[0])
    }

    return (
        <button className="DownloadBtn">
            <AiOutlineDownload className="tool-icon"/>
            Download
        </button>
    )
}

export default memo(OpenBtn)
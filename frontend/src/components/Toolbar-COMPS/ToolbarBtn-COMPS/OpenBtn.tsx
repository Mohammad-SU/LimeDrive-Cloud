import { memo } from 'react'
import { useFileContext } from '../../../contexts/FileContext'
import { useUserContext } from "../../../contexts/UserContext"
import { BsEye } from "react-icons/bs"

function OpenBtn() {
    const { selectedItems, setFileToView } = useFileContext()
    const { apiSecure } = useUserContext()

    const handleToolbarOpenClick = async () => {
        const newSelectedItems = selectedItems.slice();
        if (newSelectedItems.length == 0 || newSelectedItems.length > 1 || newSelectedItems[0].type == undefined) { // If no items, more than one item, or if folder selected then return
            return
        }

        try {
            setFileToView(newSelectedItems[0])
            const response = await apiSecure.post('/getFileContent', {
                fileId: newSelectedItems[0].id
            });
            console.log(response.data)
        } 
        catch (error) {
            console.error(error);
        }
    }

    return (
        <button className="OpenBtn" onClick={handleToolbarOpenClick}>
            <BsEye className="tool-icon eye"/>
            Preview
        </button>
    )
}

export default memo(OpenBtn)
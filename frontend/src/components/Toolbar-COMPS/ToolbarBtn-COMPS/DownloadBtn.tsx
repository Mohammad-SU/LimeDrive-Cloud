import { memo } from 'react'
import { useFileContext } from '../../../contexts/FileContext'
import { AiOutlineDownload } from "react-icons/ai"
import { useToast } from '../../../contexts/ToastContext'
import { useUserContext } from '../../../contexts/UserContext'
import _debounce from 'lodash/debounce';

function DownloadBtn() {
    const { showToast } = useToast()
    const { selectedItems } = useFileContext()
    const { apiSecure } = useUserContext()

    const fetchFileDownload = async () => {
        if (selectedItems.length == 0) return

        try {        
            showToast({message: "Getting download...", loading: true})

            const response = await apiSecure.get('/getItemDownload', {
                params: { itemIds: selectedItems.map(item => item.id) },
            });
        } 
        catch (error) {
            console.error(error);
            showToast({message: "Failed to download. Please check your connection.", showFailIcon: true})
        }
    };

    return (
        <button className="DownloadBtn" onClick={() => _debounce(fetchFileDownload, 200)}>
            <AiOutlineDownload className="tool-icon"/>
            Download
        </button>
    )
}

export default memo(DownloadBtn)
import { memo } from 'react'
import { useFileContext } from '../../../contexts/FileContext'
import { AiOutlineDownload } from "react-icons/ai"
import { useToast } from '../../../contexts/ToastContext'
import { useUserContext } from '../../../contexts/UserContext'
import _throttle from 'lodash/throttle';

function DownloadBtn() {
    const { showToast } = useToast()
    const { selectedItems } = useFileContext()
    const { apiSecure } = useUserContext()

    const fetchFileDownload = async () => {
        if (selectedItems.length === 0) return
        showToast({message: "Getting download...", loading: true})

        try {
            const response = await apiSecure.get('/getItemDownload', {
                params: {itemIds: selectedItems.map(item => item.id)},
            });
            console.log(response.data)
            window.location.href = response.data.downloadUrl;
            showToast({message: "Download retrieved.", showSuccessIcon: true})
        }
        catch (error) {
            console.error(error);
            showToast({message: "Failed to download. Please check your connection.", showFailIcon: true})
        }
    };

    return (
        <button className="DownloadBtn" onClick={_throttle(fetchFileDownload, 200)}>
            <AiOutlineDownload className="tool-icon"/>
            Download
        </button>
    )
}

export default memo(DownloadBtn)
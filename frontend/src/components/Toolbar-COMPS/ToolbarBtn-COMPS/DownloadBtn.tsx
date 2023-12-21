import { memo } from 'react'
import { useFileContext } from '../../../contexts/FileContext'
import { AiOutlineDownload } from "react-icons/ai"
import { useToast } from '../../../contexts/ToastContext'
import { useUserContext } from '../../../contexts/UserContext'
import { FileType } from '../../../types'
import _debounce from 'lodash/debounce';

function DownloadBtn() {
    const { showToast } = useToast()
    const { selectedItems } = useFileContext()
    const { apiSecure } = useUserContext()

    const fetchFileDownload = async () => {
        if (selectedItems.length === 0) return
        const isSingleFile = selectedItems.length === 1 && !selectedItems[0].id.toString().startsWith("d_")
        showToast({message: "Getting download...", loading: true})

        try {            
            const response = await apiSecure.get('/getItemDownload', {
                params: {itemIds: selectedItems.map(item => item.id)},
                responseType: isSingleFile ? "json" : "arraybuffer"
            });
            if (isSingleFile) {
                window.location.href = response.data.downloadUrl;
            } else {
                const blob = new Blob([response.data], { type: 'application/zip' });
                const objectUrl = window.URL.createObjectURL(blob);

                const link = document.createElement('a');
                link.download = 'zipfile.zip';
                link.href = objectUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                window.URL.revokeObjectURL(objectUrl);
            }
            showToast({message: "Download retrieved.", showSuccessIcon: true})
        } 
        catch (error) {
            console.error(error);
            showToast({message: "Failed to download. Please check your connection.", showFailIcon: true})
        }
    };

    return (
        <button className="DownloadBtn" onClick={fetchFileDownload}>
            <AiOutlineDownload className="tool-icon"/>
            Download
        </button>
    )
}

export default memo(DownloadBtn)
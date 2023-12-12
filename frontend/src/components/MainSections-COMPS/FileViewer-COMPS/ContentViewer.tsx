import { memo } from 'react'
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";

interface ContentViewerProps {
    fileContentUrl: string;
    fileType: string;
  }

function ContentViewer({ fileContentUrl, fileType }: ContentViewerProps) {
    const supportedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/mpeg', 'video/ogg'];

    return (
        supportedVideoTypes.includes(fileType) ?
            <video controls className="video-player">
                <source src={fileContentUrl} type={fileType}/>
            </video>
         : fileType == "image/x-icon" ? 
                <img src={fileContentUrl} alt="Icon" className="x-icon-img"/>
         : 
            <DocViewer
                className="doc-viewer"
                pluginRenderers={DocViewerRenderers}
                documents={[{ uri: fileContentUrl }]}
                config={{ header: { disableHeader: true } }}
            />
    );
}

export default memo(ContentViewer);
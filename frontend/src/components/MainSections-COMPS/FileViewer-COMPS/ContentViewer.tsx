import { memo, useRef } from 'react'
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";

interface ContentViewerProps {
    fileContentUrl: string;
    fileType: string;
  }

function ContentViewer({ fileContentUrl, fileType }: ContentViewerProps) {
    return (
        fileType.startsWith("video/") ? // For some reason trying to use CloudFlare presigned url causes CORS error with DocViewer
            <video controls className="video-player preview-element">
                <source src={fileContentUrl} type={fileType}/>
            </video>
         : fileType.startsWith("image/") ?
            <img src={fileContentUrl} className="img-preview preview-element"/>
         : fileType == "application/pdf" ? // DocViewer doesn't seem to work with some or all large files (multiple MB+)   
            <iframe
                title="PDF Viewer"
                width="870"
                height="530"
                className="iframe-preview"
                src={fileContentUrl}
            />
        : fileType == "audio/ogg" || fileType == "audio/mpeg" ?
            <audio src={fileContentUrl} controls className="audio-preview"/>
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
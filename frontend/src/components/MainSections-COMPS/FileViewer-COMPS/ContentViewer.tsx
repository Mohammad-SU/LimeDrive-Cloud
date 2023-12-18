import { memo } from 'react'
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

         : fileType == "application/pdf" || fileType.startsWith("text/htm") ? // starts with because files can be htm and html
            <iframe
                title="PDF viewer"
                width="900"
                height="540"
                className="iframe-preview"
                src={fileContentUrl}
                sandbox={fileType.startsWith("text/htm") ? "allow-popups-to-escape-sandbox allow-popups" : undefined}
            />

         : fileType == "audio/ogg" || fileType == "audio/mpeg" ?
            <audio src={fileContentUrl} controls className="audio-preview"/>
            
         :            
            <DocViewer // React DocViewer package doesn't seem to work very well with some file types
                className="doc-viewer"
                pluginRenderers={DocViewerRenderers}
                documents={[{ uri: fileContentUrl }]}
                config={{ header: { disableHeader: true } }}
            />
    );
}

export default memo(ContentViewer);
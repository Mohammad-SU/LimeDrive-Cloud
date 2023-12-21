import { memo } from 'react'

interface ContentViewerProps {
    fileContentUrl: string;
    fileType: string;
    fileTextContent: string;
}

function ContentViewer({ fileContentUrl, fileType, fileTextContent}: ContentViewerProps) { // React DocViewer package doesn't seem to work very well with some file types
    return (
        fileType.startsWith("video/") ?
            <video controls className="video-preview">
                <source src={fileContentUrl} type={fileType}/>
            </video>

         : fileType.startsWith("image/") ?
            <img src={fileContentUrl} className="img-preview"/>

         : fileType === "application/pdf" || fileType.startsWith("text/htm") ? // starts with because files can be htm and html
            <iframe
                title="PDF viewer"
                width="900"
                height="540"
                className="iframe-preview"
                src={fileContentUrl}
                sandbox={fileType.startsWith("text/htm") ? "allow-popups-to-escape-sandbox allow-popups" : undefined}
            />

         : fileType === "audio/ogg" || fileType === "audio/mpeg" ?
            <audio src={fileContentUrl} controls className="audio-preview"/>

         : fileType === "text/plain" ?
            <div className="text-preview">{fileTextContent}</div>

         : <p>Error.</p>
    );
}

export default memo(ContentViewer);
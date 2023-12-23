import { memo } from 'react'

interface ContentViewerProps {
    fileContentUrl: string;
    fileType: string;
    fileTextContent: string;
    setContentLoaded: React.Dispatch<React.SetStateAction<boolean>>
}
// Is separate component so that it can be memoised
function ContentViewer({ fileContentUrl, fileType, fileTextContent, setContentLoaded }: ContentViewerProps) { // React DocViewer package doesn't seem to work very well with some file types
    if (fileType === "text/plain" || fileType.startsWith("audio/")) {
        setContentLoaded(true)
    }

    return (
        fileType.startsWith("video/") ?
            <video controls className="video-preview" onLoadedData={() => setContentLoaded(true)}>
                <source src={fileContentUrl} type={fileType}/>
            </video>

         : fileType.startsWith("image/") ?
            <img 
                src={fileContentUrl} 
                className="img-preview"
                onLoad={() => setContentLoaded(true)}
                key="contentViewerImgPreviewKey"
            />

         : fileType === "application/pdf" || fileType.startsWith("text/htm") ? // starts with because files can be htm and html
            <iframe
                title="PDF viewer"
                width="900"
                height="540"
                className="iframe-preview"
                src={fileContentUrl}
                sandbox={fileType.startsWith("text/htm") ? "allow-popups-to-escape-sandbox allow-popups" : undefined}
                onLoad={() => setContentLoaded(true)}
            />

         : fileType.startsWith("audio/") ?
            <audio src={fileContentUrl} controls className="audio-preview" onLoad={() => setContentLoaded(true)}/>

         : fileType === "text/plain" ?
            <div className="text-preview">{fileTextContent}</div>

         : <p>Error.</p>
    );
}

export default memo(ContentViewer);
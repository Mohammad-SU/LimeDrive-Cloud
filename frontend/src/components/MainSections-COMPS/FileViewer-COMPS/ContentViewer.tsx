import { memo, forwardRef, useEffect } from 'react'

interface ContentViewerProps {
    fileContentUrl: string;
    fileType: string;
    fileTextContent: string;
    setContentLoaded: React.Dispatch<React.SetStateAction<boolean>>
}
// Leave as separate component
const ContentViewer = forwardRef<HTMLElement, ContentViewerProps>( // forwardRef used for react-to-print
    ({ fileContentUrl, fileType, fileTextContent, setContentLoaded }: ContentViewerProps, ref) => {
        useEffect(() => {
            if (fileType === "text/plain" || fileType.startsWith("audio/")) {
                setContentLoaded(true);
            }
        }, [fileType]); // Leave in useEffect to avoid bad setState call

        return ( // React DocViewer package doesn't seem to work very well with some file types
            fileType.startsWith("video/") ?
                <video
                    controls 
                    className="video-preview" 
                    onLoadedData={() => setContentLoaded(true)}
                    ref={ref as React.RefObject<HTMLVideoElement>}
                >
                    <source src={fileContentUrl} type={fileType}/>
                </video>

            : fileType.startsWith("image/") ?
                <img 
                    src={fileContentUrl} 
                    className="img-preview"
                    onLoad={() => setContentLoaded(true)}
                    key="contentViewerImgPreviewKey"
                    ref={ref as React.RefObject<HTMLImageElement>}
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
                    ref={ref as React.RefObject<HTMLIFrameElement>}
                />

            : fileType.startsWith("audio/") ?
                <audio 
                    src={fileContentUrl} 
                    controls 
                    className="audio-preview" 
                    onLoad={() => setContentLoaded(true)}
                    ref={ref as React.RefObject<HTMLAudioElement>}
                />

            : fileType === "text/plain" ?
                <pre className="text-preview" ref={ref as React.RefObject<HTMLPreElement>}>{fileTextContent}</pre>

            : <p>Error.</p>
        );
    }
)

export default memo(ContentViewer);
import { useEffect, useState } from 'react';

interface DelayedExitProps {
    shouldRender: boolean;
    delayMs: number;
    onExitCallback?: () => void;
}

function useDelayedExit({ shouldRender, delayMs, onExitCallback }: DelayedExitProps) { // This hook is used so that there is enough time for the reverse/closing DynamicClip animation to play, similar to AnimatePresence in framer motion
    const [isVisible, setIsVisible] = useState(shouldRender);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout | undefined;

        if (!shouldRender) {
            timeoutId = setTimeout(() => {
                setIsVisible(false);

                if (onExitCallback) { // Execute the callback function if provided
                    onExitCallback();
                }
            }, delayMs);
        } else {
            setIsVisible(true);
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [delayMs, shouldRender, onExitCallback]);

    return { isVisible };
}

export default useDelayedExit;
import { useEffect, useState } from 'react';

function useDelayedExit(shouldRender: boolean, delayMs: number, onExitCallback?: () => void) {
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
import { useEffect, useState } from 'react';

function useDelayedExit(shouldRender: boolean, delayMs: number) {
    const [isVisible, setIsVisible] = useState(shouldRender);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout | undefined;

        if (!shouldRender) {
            timeoutId = setTimeout(() => {
                setIsVisible(false);
            }, delayMs);
        } 
        else {
            setIsVisible(true);
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [delayMs, shouldRender]);

    return { isVisible };
}

export default useDelayedExit;
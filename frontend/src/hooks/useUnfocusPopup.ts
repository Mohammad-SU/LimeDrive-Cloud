import { useEffect } from 'react';

function useUnfocusPopup(ref: React.RefObject<HTMLElement>, callback: () => void) {
    function handleMousedownOutside(event: MouseEvent) {
        if (ref.current && !ref.current.contains(event.target as HTMLElement)) {
            callback();
        }
    }

    function handleEscapeKey(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            callback();
        }
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleMousedownOutside);
        document.addEventListener('keydown', handleEscapeKey);

        return () => {
            document.removeEventListener('mousedown', handleMousedownOutside);
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, []);
}

export default useUnfocusPopup;
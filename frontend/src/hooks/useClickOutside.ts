import { useEffect } from 'react';

function useClickOutside(ref: React.RefObject<HTMLElement>, callback: () => void) {
    function handleClickOutside(event: MouseEvent) {
        if (ref.current && !ref.current.contains(event.target as HTMLElement)) {
            callback();
        }
    }

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
}

export default useClickOutside;

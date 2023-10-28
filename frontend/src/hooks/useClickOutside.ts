import { useEffect } from 'react';

function useClickOutside(ref: React.RefObject<HTMLElement>, callback: () => void) {
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as HTMLElement)) {
                callback();
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [ref, callback]);
}

export default useClickOutside;

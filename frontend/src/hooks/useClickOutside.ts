import { useEffect } from 'react';

function useClickOutside(ref: React.RefObject<HTMLElement>, callback: () => void) {
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as HTMLElement)) {
                callback();
            }
        }

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [ref, callback]);
}

export default useClickOutside;

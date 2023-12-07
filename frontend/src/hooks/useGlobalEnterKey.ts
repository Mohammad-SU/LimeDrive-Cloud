import { useEffect } from 'react';

function useGlobalEnterKey() {    
    const handleKeyPress = (event: KeyboardEvent) => {
        if ((event.key === 'Enter' || event.key === ' ') && document.activeElement) {
            const activeElement = document.activeElement as HTMLElement;
            console.log(activeElement)

            if ('click' in activeElement) {
                activeElement.click();
            }

            const mousedownEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
            activeElement.dispatchEvent(mousedownEvent);
        }
    };

    useEffect(() => {
        document.body.addEventListener('keydown', handleKeyPress);

        return () => {
            document.body.removeEventListener('keydown', handleKeyPress);
        };
    }, []);
}

export default useGlobalEnterKey;
import { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Toast from '../components/Toast-comp/Toast';
import DynamicClip from '../components/DynamicClip';

interface ToastContextProps {
    showToast: (options: ToastOptions) => void;
    toastContainer: HTMLElement | null;
    setToastContainer: React.Dispatch<React.SetStateAction<HTMLElement | null>>;
}

export interface ToastOptions {
    message: string;
    duration?: number;
    loading?: boolean;
    showRetry?: boolean;
    showUndo?: boolean;
    showSuccessIcon?: boolean;
    showFailIcon?: boolean;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toast, setToast] = useState<ToastOptions | null>(null);
    const [isToastVisible, setIsToastVisible] = useState(false);
    const [toastContainer, setToastContainer] = useState<HTMLElement | null>(document.body);

    const showToast = (options: ToastOptions) => {
        setToast({ ...options });
        setIsToastVisible(true);
    };

    const closeToast = () => {
        setIsToastVisible(false);
        setTimeout(() => {
            setToast(null);
        }, 300);
    };

    const contextValue = useMemo(() => {
        return {
            showToast,
            toastContainer: toastContainer || document.body,
            setToastContainer,
        };
    }, [showToast, toastContainer]);

    return (
        <ToastContext.Provider value={contextValue}>
            {children}
            {toast && toastContainer && createPortal(<Toast {...toast} onClose={closeToast} />, toastContainer)}
            {<DynamicClip clipPathId={'toastClip'} animation={isToastVisible} numRects={1}/>}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}
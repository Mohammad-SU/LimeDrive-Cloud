import { createContext, useContext, useState, ReactNode } from 'react';
import Toast from '../components/Toast-comp/Toast';
import DynamicClip from '../components/DynamicClip';

interface ToastContextProps {
    showToast: (options: ToastOptions) => void;
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

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && <Toast {...toast} onClose={closeToast} />}
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
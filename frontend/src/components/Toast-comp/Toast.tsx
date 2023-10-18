import { useState, useEffect, memo } from 'react';
import './Toast.scss';
import { ToastOptions } from '../../contexts/ToastContext';
import { AiOutlineCheck, AiOutlineExclamation } from 'react-icons/ai';

interface ToastProps extends ToastOptions {
    onClose: () => void;
}

function Toast({
    message,
    duration = 3000,
    loading,
    showRetry,
    showUndo,
    showSuccessIcon,
    showFailIcon,
    onClose,
}: ToastProps) {    
    
    useEffect(() => {
        if (message && !loading) {
            const timeoutId = setTimeout(() => {
                onClose()
            }, duration);
            
            return () => clearTimeout(timeoutId);
        }
    }, [message, loading]);

    return (
        <div className="Toast">
            {loading ? 
                    <span className="spinner-before"></span>
                    : showFailIcon ?
                    <AiOutlineExclamation className="toast-icon fail"/>
                : showSuccessIcon ?
                    <AiOutlineCheck className="toast-icon" />
                : null
            }

            {message}

            {loading ?
                <span className="spinner-after"></span>
                :
                <div className="btn-wrapper">
                    {showRetry ?
                            <button className="text-btn">Retry</button>
                        : showUndo ?
                            <button className="undo-btn text-btn">Undo</button>
                        : null
                    }
                    <button 
                        className={`close-btn text-btn ${!showRetry && !showUndo ? 'decrease-gap' : ''}`}
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            }
        </div>
    );
}

export default memo(Toast)
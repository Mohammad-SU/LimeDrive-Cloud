import { useState, useEffect, memo } from 'react';
import './Toast.scss';
import { AiOutlineCheck, AiOutlineExclamation } from 'react-icons/ai';

interface ToastProps {
    message: string;
    duration?: number;
    loading?: boolean;
    showRetry?: boolean;
    showUndo?: boolean;
    showSuccessIcon?: boolean;
    showFailIcon?: boolean;
}

function Toast({
    message,
    duration = 3000,
    loading,
    showRetry,
    showUndo,
    showSuccessIcon,
    showFailIcon,
}: ToastProps) {    
    const [showToast, setShowToast] = useState(true)

    return (
        showToast && 
        <div className="Toast">
            {loading ? 
                    <span className="spinner-before"></span>
                : showSuccessIcon ?
                    <AiOutlineCheck className="toast-icon" />
                : showFailIcon ?
                    <AiOutlineExclamation className="toast-icon fail"/>
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
                    <button className={`close-btn text-btn ${!showRetry && !showUndo ? 'decrease-gap' : ''}`}>Close</button>
                </div>
            }
        </div>
    );
}

export default memo(Toast)
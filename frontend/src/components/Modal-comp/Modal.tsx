import { memo, useEffect, useState } from 'react';
import FocusTrap from 'focus-trap-react';
import useDelayedExit from '../../hooks/useDelayedExit';
import DynamicClip from '../DynamicClip';
import Backdrop from '../Backdrop-comp/Backdrop';
import "./Modal.scss";
import { AiOutlineClose } from 'react-icons/ai';

interface ModalProps {
    className: string;
    onSubmit?: () => void;
    render: boolean;
    renderDelay?: number;
    onExit?: () => void;
    onVisible?: () => void;
    onCloseClick: () => void;
    showCloseBtn?: boolean;
    closeBtnTabIndex?: number;
    clipPathId: string;
    numRects?: number;
    children?: React.ReactNode;
}

function Modal({
    className,
    onSubmit,
    render,
    renderDelay = 300,
    onExit,
    onVisible,
    onCloseClick,
    showCloseBtn = true,
    closeBtnTabIndex = 0,
    clipPathId,
    numRects = 10,
    children,
}: ModalProps) {
    const ModalType = onSubmit ? 'form' : 'div';

    const attributes = {
        className: `Modal ${className}`,
        ...(onSubmit ? {
            onSubmit: (event: React.FormEvent) => {
                event.preventDefault();
                onSubmit()
            } 
        } : {}),
    }

    const [newRender, setNewRender] = useState(false)
    useEffect(() => { // Handle multiple render issues
        render ?
            setNewRender(true)
            : setNewRender(false)
    }, [render])

    const { isVisible: isModalVisible } = useDelayedExit({
        shouldRender: newRender,
        delayMs: renderDelay,
        onExitCallback: onExit,
    })

    useEffect(() => {
        if (isModalVisible && onVisible) {
            onVisible()
        }
    }, [isModalVisible])

    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && onCloseClick) {
                onCloseClick();
            }
        };
        window.addEventListener('keydown', handleEscapeKey);
        return () => {
            window.removeEventListener('keydown', handleEscapeKey);
        };
    }, []);

    return (
        <>
            {isModalVisible &&
                <FocusTrap focusTrapOptions={{ clickOutsideDeactivates: true }}>
                    <ModalType {...attributes}>
                        {showCloseBtn && 
                            <button className="icon-btn-wrapper close-btn" type="button" onClick={onCloseClick} tabIndex={closeBtnTabIndex}>
                                <AiOutlineClose className="icon-btn" />
                            </button>
                        }
                        {children}
                        <DynamicClip
                            clipPathId={clipPathId}
                            animation={newRender}
                            numRects={numRects}
                        />
                    </ModalType>
                </FocusTrap>
            }
            <Backdrop render={newRender} onClick={onCloseClick}/> {/* Use render instead of isModalVisible as render condition since backdrop should be invisible faster*/}
        </>
    );
}

export default memo(Modal);
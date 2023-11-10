import { memo, useEffect } from 'react';
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

    const { isVisible: isModalVisible } = useDelayedExit({
        shouldRender: render,
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
    }, [onCloseClick]);

    return (
        <>
            {isModalVisible &&
                <FocusTrap focusTrapOptions={{ clickOutsideDeactivates: true }}>
                    <ModalType {...attributes}>
                        <button className="icon-btn-wrapper" type="button" onClick={onCloseClick} tabIndex={-1}>
                            <AiOutlineClose className="close-icon icon-btn" />
                        </button>
                        {children}
                        <DynamicClip
                            clipPathId={clipPathId}
                            animation={render}
                            numRects={numRects}
                        />
                    </ModalType>
                </FocusTrap>
            }
            <Backdrop render={render} onClick={onCloseClick}/> {/* Use render instead of isModalVisible as render condition since backdrop should be invisible faster*/}
        </>
    );
}

export default memo(Modal);
import { memo, useEffect } from 'react';
import useDelayedExit from '../../hooks/useDelayedExit';
import DynamicClip from '../DynamicClip';
import Backdrop from '../Backdrop-comp/Backdrop';
import "./Modal.scss";

interface ModalProps {
    className: string;
    onSubmit?: () => void;
    render: boolean;
    renderDelay?: number;
    onExit?: () => void;
    onVisible?: () => void;
    onBackdropClick?: () => void;
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
    onBackdropClick,
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

    return (
        <>
            {isModalVisible && 
                <ModalType {...attributes}>
                    {children}
                    <DynamicClip
                        clipPathId={clipPathId}
                        animation={render}
                        numRects={numRects}
                    />
                </ModalType>
            }
            <Backdrop render={render} onClick={onBackdropClick}/> {/* Use render instead of isModalVisible as render condition since backdrop should be invisible faster*/}
        </>
    );
}

export default memo(Modal);

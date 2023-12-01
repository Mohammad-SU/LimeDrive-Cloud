import './Backdrop.scss';
import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BackdropProps {
    render: boolean;
    onClick?: () => void;
    className?: string;
}

function Backdrop({ render, onClick, className }: BackdropProps) {
    return (
        <AnimatePresence>
            {render &&
                <motion.div
                    className={`Backdrop ${className ? className : ''}`}
                    onClick={onClick}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                />
            }
        </AnimatePresence>
    );
}

export default memo(Backdrop);
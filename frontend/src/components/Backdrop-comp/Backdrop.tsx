import './Backdrop.scss';
import { memo } from 'react';
import { motion } from 'framer-motion';

interface BackdropProps {
    onClick?: () => void;
}

function Backdrop({ onClick }: BackdropProps) {
    return (
        <motion.div
            className="Backdrop"
            onClick={onClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
        ></motion.div>
    );
}

export default memo(Backdrop);
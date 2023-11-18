import { memo } from "react";
import { AiOutlineCheck, AiOutlineMinus } from "react-icons/ai"
import "./Checkbox.scss"

interface CheckboxProps {
    className?: string
    checked: boolean
    showMinus?: boolean
    onClick?: () => void;
}

function Checkbox({ className, checked, showMinus, onClick }: CheckboxProps) {
    return (
        <div
            className={`Checkbox ${checked ? 'checked' : ''} ${className ? className : ''}`} 
            onClick={onClick}
            data-checkbox
        >
            {checked && <AiOutlineCheck className="checkbox-icon"/>}
            {showMinus && <AiOutlineMinus className="checkbox-icon"/>}
        </div>
    )
}

export default memo(Checkbox)
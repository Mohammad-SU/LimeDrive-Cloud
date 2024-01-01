import { memo } from "react";
import { AiOutlineCheck, AiOutlineMinus } from "react-icons/ai"
import "./Checkbox.scss"

interface CheckboxProps {
    className?: string
    checked: boolean
    showMinus?: boolean
    onClick?: () => void;
    tabIndex?: number;
    disabled?: boolean;
}

function Checkbox({ className, checked, showMinus, onClick, tabIndex = 0, disabled = false }: CheckboxProps) {

    return (
        <button
            className={`Checkbox ${checked ? 'checked' : ''} ${className ? className : ''}`}
            disabled={disabled}
            onClick={onClick}
            data-checkbox
            tabIndex={tabIndex}
            type="button"
        >
            {checked && <AiOutlineCheck className="checkbox-icon"/>}
            {showMinus && <AiOutlineMinus className="checkbox-icon"/>}
        </button>
    )
}

export default memo(Checkbox)
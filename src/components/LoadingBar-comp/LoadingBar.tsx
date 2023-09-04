import { memo } from "react"
import "./LoadingBar.scss"

interface LoadingBarProps {
    loading: boolean
    className?: string
}

function LoadingBar({ loading, className }: LoadingBarProps) {
    return (
        loading ?
            <span className={`LoadingBar ${className}`}>
                <span className="spinner-before"></span>
                <span className="bar"></span> 
                <span className="spinner-after"></span>
            </span>
        : null
    )
}

export default memo(LoadingBar)
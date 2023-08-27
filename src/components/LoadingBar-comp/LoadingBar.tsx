import { memo } from "react"
import "./LoadingBar.scss"

interface LoadingBarProps {
    loading: boolean
}

function LoadingBar({ loading }: LoadingBarProps) {
    return (
        loading ?
            <span className="LoadingBar">
                <span className="spinner-before"></span>
                <span className="bar"></span> 
                <span className="spinner-after"></span>
            </span>
        : null
    )
}

export default memo(LoadingBar)
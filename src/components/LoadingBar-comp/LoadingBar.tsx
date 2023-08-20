import { memo } from "react"
import "./LoadingBar.scss"

interface LoadingBarProps {
    loading: boolean
}

function LoadingBar({ loading }: LoadingBarProps) {
    return (
        loading ?
            <>
            <span className="LoadingBar-spinner-before"></span>
            <span className="LoadingBar"></span> 
            <span className="LoadingBar-spinner-after"></span>
            </>
        : null
    )
}

export default memo(LoadingBar)
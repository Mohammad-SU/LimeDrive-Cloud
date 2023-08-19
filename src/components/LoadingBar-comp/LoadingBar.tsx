import { memo } from "react"
import "./LoadingBar.scss"

interface LoadingBarProps {
    loading: boolean
}

function LoadingBar({ loading }: LoadingBarProps) {
    return (
        loading ? <span className="LoadingBar"></span> : null
    )
}

export default memo(LoadingBar)
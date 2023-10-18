import { useState, useEffect, memo } from "react"
import "./LoadingBar.scss"

interface LoadingBarProps {
    loading?: boolean
}

function LoadingBar({ loading = true }: LoadingBarProps) {
    return (
        loading &&
            <span className="LoadingBar">
                <span className="spinner-before"></span>
                <span className="loading-bar"></span>
                <span className="spinner-after"></span>
            </span>
    )
}

export default memo(LoadingBar)
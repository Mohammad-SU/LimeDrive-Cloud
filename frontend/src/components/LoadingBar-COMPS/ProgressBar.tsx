import { memo } from "react"
import "./LoadingBar.scss"

interface ProgressBarProps {
    progress: null | number
}

function ProgressBar({ progress }: ProgressBarProps) {
    let filled
    let empty

    if (progress != null) {
        const maxSteps = 18;
        const filledSteps = Math.round((progress / 100) * maxSteps);
        const emptySteps = maxSteps - filledSteps;

        filled = '#'.repeat(filledSteps);
        empty = '-'.repeat(emptySteps);
    }

    return (
        progress != null ?
            <span className="LoadingBar">
                <span className="spinner-before"></span>
                <span className="progress-bar">{`[${filled}${empty}]`}</span>
                <span className="spinner-after"></span>
            </span>
        : null
    )
}

export default memo(ProgressBar)
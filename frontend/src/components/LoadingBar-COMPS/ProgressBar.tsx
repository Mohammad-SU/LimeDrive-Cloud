import { memo, useState, useEffect } from "react"
import "./LoadingBar.scss"

interface ProgressBarProps {
    progress: null | number
}

function ProgressBar({ progress }: ProgressBarProps) {
    const [showFinalising, setShowFinalising] = useState<boolean>(false)

    let filled
    let empty

    if (progress != null) {
        useEffect(() => {
            if (progress != null) {
                if (progress === 100) {
                    const delay = 1000
                    setTimeout(() => {
                        setShowFinalising(true)
                    }, delay)
                } 
                else {
                    setShowFinalising(false)
                }
            }
        }, [progress])

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
                {showFinalising ? 
                    <span className="finalising-text">Finalising...</span> 
                    
                    : <span className="progress-bar">{`[${filled}${empty}]`}</span>
                }
                <span className="spinner-after"></span>
            </span>
        : null
    )
}

export default memo(ProgressBar)
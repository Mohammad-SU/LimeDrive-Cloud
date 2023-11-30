import { memo, useState, useEffect, useRef } from "react"
import "./LoadingBar.scss"

interface ProgressBarProps {
    progress: null | number
    enableFinalising?: boolean
}

function ProgressBar({ progress, enableFinalising = true }: ProgressBarProps) {
    const [showFinalising, setShowFinalising] = useState(false)
    const [filled, setFilled] = useState("")
    const [empty, setEmpty] = useState("") 

    useEffect(() => {
        if (progress != null) {
            const maxSteps = 18
            const filledSteps = Math.round((progress / 100) * maxSteps)
            const emptySteps = maxSteps - filledSteps
        
            setFilled("#".repeat(filledSteps))
            setEmpty("-".repeat(emptySteps))

            if (progress >= 100) {
                const timeout = setTimeout(() => {
                    setShowFinalising(true)
                }, 500)

                return () => clearTimeout(timeout);
            }
        }
    }, [progress])

    return (
        progress != null &&
            <span className="LoadingBar">
                <span className="spinner-before"></span>
                {showFinalising && enableFinalising ? 
                    <span className="finalising-text">Finalising...</span> 
                    : <span className="progress-bar">{`[${filled}${empty}]`}</span>
                }
                <span className="spinner-after"></span>
            </span>
    )
}

export default memo(ProgressBar)
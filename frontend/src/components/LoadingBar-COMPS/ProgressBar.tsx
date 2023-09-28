import { memo, useState, useEffect } from "react"
import "./LoadingBar.scss"

interface ProgressBarProps {
    progress: null | number
}

function ProgressBar({ progress }: ProgressBarProps) {
    const [showFinalising, setShowFinalising] = useState<boolean>(false)
    const [filled, setFilled] = useState("")
    const [empty, setEmpty] = useState("") 

    useEffect(() => {
        if (progress != null) {
            if (!showFinalising) {
                const maxSteps = 18
                const filledSteps = Math.round((progress / 100) * maxSteps)
                const emptySteps = maxSteps - filledSteps
            
                setFilled("#".repeat(filledSteps))
                setEmpty("-".repeat(emptySteps))
            }

            if (progress >= 100) {
                const delay = 1000
                const timer = setTimeout(() => {
                    setShowFinalising(true)
                }, delay)
        
                return () => clearTimeout(timer) // Clear the timer when the component unmounts or when progress changes.
            } 
            else {
                setShowFinalising(false)
            }
        }
    }, [progress])

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
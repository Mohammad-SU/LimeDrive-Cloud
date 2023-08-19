import { useState, memo } from 'react'
import "./HomePage.scss"

function HomePage() {
    return (
        <div className="HomePage">
            <div className="sidebar"></div>
            <p>this is the homepage</p>
        </div>
    )
}

export default memo(HomePage)
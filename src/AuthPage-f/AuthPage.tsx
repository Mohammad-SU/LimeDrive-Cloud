import { useState, memo } from 'react'
import "./AuthPage.scss"
import LimeDriveAscii from '../assets/images/ascii/LimeDrive-ascii.png';
import LoginForm from '../components/auth-COMPS/LoginForm';
import RegisterForm from '../components/auth-COMPS/RegisterForm';

function AuthPage() {
    const [showLoginForm, setShowLoginForm] = useState<boolean>(true);
    const [showRegisterForm, setShowRegisterForm] = useState<boolean>(false);

    const handleFormChange = () => {
        setShowLoginForm(!showLoginForm);
        setShowRegisterForm(!showRegisterForm);
    };

    return (
        <div className="AuthPage">
            <img 
                className={`AuthPage__heading ${showRegisterForm ? "active" : ""}`}
                src={LimeDriveAscii} 
            />

            <div className="AuthPage__main-cont">
                <div className="gen-cont"> 
                    <p>Don't want to register an account? Generate one! <br /> (You won't be informed of account deletion)</p>
                    <button className="gen-cont__button">Generate</button>
                </div>

                <div className="form-cont">
                    {showLoginForm && <LoginForm />}
                    {showRegisterForm && <RegisterForm />}
                    <button className="AuthPage__changeFormBtn" onClick={handleFormChange}>
                        {showLoginForm ? "Create an account" : "Login to LimeDrive"}
                    </button>
                </div>

                <p className="info">Very old accounts may be deleted for space. <br /> Don't upload any sensitve or important files!</p>
            </div>
        </div>
    )
}

export default memo(AuthPage)
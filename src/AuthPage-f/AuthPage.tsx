import { useState, memo } from 'react'
import axios from 'axios'
import "./AuthPage.scss"
import { adjectives } from '../data/adjectives.ts'
import { nouns } from '../data/nouns.ts'
import { handleBackendError } from "../functions/BackendErrorResponse.ts"
import LimeDriveAscii from '../assets/images/ascii/LimeDrive-ascii.png'
import LoginForm from '../components/auth-COMPS/LoginForm.tsx'
import RegisterForm from '../components/auth-COMPS/RegisterForm.tsx'
import LoadingBar from "../components/LoadingBar-comp/LoadingBar.tsx"

function AuthPage() {
    const [backendError, setBackendError] = useState<string | null>(null)
    const [errorMessage, setErrorMessage]  = useState<string | null>(null)
    const [generatedUsername, setGeneratedUsername] = useState<string | null>(null)
    const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(false)

    const generateAccount = async () => {
        setLoading(true)

        function generateRandomUsername() {
            let result = ''
            const crypto = window.crypto
            const randomAdjective = adjectives[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] % adjectives.length)]
            const randomNoun = nouns[Math.floor(crypto.getRandomValues(new Uint32Array(1))[0] % nouns.length)]
            const randomNumber = crypto.getRandomValues(new Uint32Array(1))[0] % 1001
            result += randomAdjective + "-" + randomNoun + randomNumber
            return result
        }
        function generateRandomPassword(length: number): string {
            const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
            const randomValues = new Uint32Array(length)
            window.crypto.getRandomValues(randomValues)
            let result = ''
            for (let i = 0; i < length; i++) {
              result += charset.charAt(randomValues[i] % charset.length)
            }
            return result
        }
        
        const attemptRegistration = async () => {
            const generatedUsername = generateRandomUsername()
            const generatedPassword = generateRandomPassword(15)
    
            try {
                const response = await axios.post('http://localhost:8000/api/register', {
                    usernameReg: generatedUsername,
                    passwordReg: generatedPassword,
                })
    
                if (response.data.message === 'Registration successful') {
                    setLoading(false)
                    return
                }
            } 
            catch (error) {
                if (axios.isAxiosError(error)) {
                    setBackendError(handleBackendError(error))
                    if (backendError === "The username has already been taken.") {
                        attemptRegistration()
                    } 
                    else {
                        setErrorMessage("Error. Please check your connection")
                        setLoading(false)
                    }
                }
            }
        }

        await attemptRegistration()
    }

    const [showLoginForm, setShowLoginForm] = useState<boolean>(true)
    const [showRegisterForm, setShowRegisterForm] = useState<boolean>(false)
    const handleFormChange = () => {
        setShowLoginForm(!showLoginForm)
        setShowRegisterForm(!showRegisterForm)
    }

    return (
        <div className="AuthPage">
            <img 
                className={`AuthPage__heading ${showRegisterForm ? "active" : ""}`}
                src={LimeDriveAscii} 
            />

            <div className="AuthPage__main-cont">
                <div className={`generator ${showRegisterForm ? "active" : ""}`}> 
                    <p>Don't want to register an account? Generate one! <br/> You can change the details later.</p>
                    <button className="generator__button" onClick={generateAccount}>Generate</button>
                    <p className="error-and-loading">
                        {errorMessage}
                        <LoadingBar loading={loading} />
                    </p>
                    <div className="generator__details">
                        {(!loading && generatedUsername) && 
                            <>
                                <p><strong>Username:</strong> {generatedUsername}</p>
                                <p><strong>Password:</strong> {generatedPassword}</p>
                            </>
                        }
                    </div>
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
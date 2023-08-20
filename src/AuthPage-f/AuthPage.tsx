import { useState, memo } from 'react'
import axios from 'axios'
import "./AuthPage.scss"
import { adjectives } from '../data/adjectives.ts'
import { nouns } from '../data/nouns.ts'
import { handleBackendError } from "../functions/BackendErrorResponse.ts"
import LimeDriveAscii from '../assets/images/ascii/LimeDrive-ascii.png'
import LoadingBar from "../components/LoadingBar-comp/LoadingBar.tsx"
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import LoginForm from '../components/auth-COMPS/LoginForm.tsx'
import RegisterForm from '../components/auth-COMPS/RegisterForm.tsx'

function AuthPage() {
    var backendError: string | null = null
    const [errorMessage, setErrorMessage]  = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [cooldown, setCooldown] = useState<number>(0)
    const [generatedUsername, setGeneratedUsername] = useState<string | null>(null)
    const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)

    function startCooldown() {
        setCooldown(60); // 60 seconds, or 1 minute
        const interval = setInterval(() => {
            setCooldown(prevCooldown => prevCooldown - 1);
        }, 1000);
    
        setTimeout(() => {
            clearInterval(interval);
            setCooldown(0);
        }, 60000); // Clear interval after 1 minute
    }
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
    async function attemptRegistration() {
        if (cooldown > 0) {
            return
        }
        startCooldown()
        setLoading(true)
        setErrorMessage(null)
        setGeneratedUsername(null)
        setGeneratedPassword(null)
        const randomUsername = generateRandomUsername();
        const randomPassword = generateRandomPassword(15);
        try {
            const response = await axios.post('http://localhost:8000/api/register', {
                usernameReg: randomUsername,
                passwordReg: randomPassword,
            })

            if (response.data.message == 'Registration successful') {
                setLoading(false)
                setGeneratedUsername(randomUsername)
                setGeneratedPassword(randomPassword)
                return
            }
        } 
        catch (error) {
            console.log(error)
            if (axios.isAxiosError(error)) {
                backendError = handleBackendError(error)
                if (backendError == "The username has already been taken.") {
                    attemptRegistration()
                } 
                else {
                    setErrorMessage("Error. Please check your connection.")
                    setLoading(false)
                }
            }
        }
    }

    const [showPassword, setShowPassword] = useState<boolean>(false)
    const togglePasswordVisibility = () => {setShowPassword(!showPassword)}

    const [showLoginForm, setShowLoginForm] = useState<boolean>(true)
    const [showRegisterForm, setShowRegisterForm] = useState<boolean>(false)
    function handleFormChange() {
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
                <div className="generator"> 
                    <p>Don't want to register an account? Generate one! <br/> You can change the details later.</p>
                    
                    <button className="generator__button" onClick={attemptRegistration}>
                        {cooldown ? `Wait (${cooldown})` : "Generate"}
                    </button>

                    {(loading || errorMessage) &&
                        <p className="error-and-loading">
                            {errorMessage}
                            <LoadingBar loading={loading} />
                        </p>
                    }

                    {(!loading && generatedUsername) && 
                        <div className="generator__details-cont">
                            <p><strong>Username:</strong> {generatedUsername}</p>
                            <p><strong>Password:</strong> 
                                {showPassword ? generatedPassword : generatedPassword!.replace(/./g, '•')}
                                {showPassword ? 
                                    (<BsEyeSlash className="eye-icon" onClick={togglePasswordVisibility} />)
                                    : 
                                    (<BsEye className="eye-icon" onClick={togglePasswordVisibility} />)
                                }
                            </p>
                        </div>
                    }
                    
                    <p>{(!loading && generatedUsername) &&
                            <>
                                <span>Save these details in a secure place.</span> 
                                <br /> 
                                <span>Use them to login with different devices.</span>
                            </>
                        }
                    </p>
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
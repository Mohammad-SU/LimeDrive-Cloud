import { memo, useState, useEffect } from 'react'
import axios, { AxiosError } from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'
import "./AuthPage.scss"
import { adjectives } from '../data/adjectives.ts'
import { nouns } from '../data/nouns.ts'
import { useUserContext } from '../contexts/UserContext.tsx'
import useLocalStorage from '../hooks/useLocalStorage.ts'
import LimeDriveAscii from '../assets/images/ascii/LimeDrive-ascii.png'
import LoadingBar from "../components/LoadingBar-COMPS/LoadingBar.tsx"
import { BsEye, BsEyeSlash } from 'react-icons/bs'
import LoginForm from '../components/auth-COMPS/LoginForm.tsx'
import RegisterForm from '../components/auth-COMPS/RegisterForm.tsx'

function AuthPage() {
    const navigate = useNavigate()
    const location = useLocation()
    const { api, token } = useUserContext()

    useEffect(() => {
        if (token && location.pathname == "/auth") {
            navigate('/LimeDrive');
        }
    }, [token]);

    if (token) {
        return null
    }

    var backendError: AxiosError | null = null
    const [errorMessage, setErrorMessage]  = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(false)

    const [cooldown, setCooldown] = useLocalStorage<number>('cooldown', 0)
    const [cooldownEndTimestamp, setCooldownEndTimestamp] = useLocalStorage<number>('cooldownEndTimestamp', 0)
    function startCooldown() {
        setCooldown(60) // 60 seconds
        const endTime = Date.now() + 60000 // Current timestamp + 60 seconds
        setCooldownEndTimestamp(endTime) // Store the timestamp when cooldown should end
    }
    useEffect(() => {
        if (cooldown > 0 && cooldownEndTimestamp > 0) {
            const remainingCooldown = Math.floor((cooldownEndTimestamp - Date.now()) / 1000)
            if (remainingCooldown <= 0) {
                setCooldown(0) // Reset cooldown if time has elapsed
                setCooldownEndTimestamp(0) // Reset timestamp as well
            } else {
                setCooldown(remainingCooldown) // Update the remaining cooldown
            }
        }
    }, [])
    useEffect(() => {
        let intervalId: number
        if (cooldown > 0) {
            intervalId = window.setInterval(() => {
                setCooldown(prevCooldown => (prevCooldown > 0 ? prevCooldown - 1 : 0))
            }, 1000)
        }
        return () => {
            if (intervalId) {
                clearInterval(intervalId)
            }
        }
    }, [cooldown])

    const [generatedUsername, setGeneratedUsername] = useState<string | null>(null)
    const [generatedPassword, setGeneratedPassword] = useState<string | null>(null)
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
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const randomValues = new Uint32Array(length);
        window.crypto.getRandomValues(randomValues);
        let result = '';
        for (let i = 0; i < length; i++) {
            if (i > 0 && i % 4 === 0) { // Insert dash after every 4 characters for UX
                result += '-';
            }
            result += charset.charAt(randomValues[i] % charset.length);
        }
        return result;
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
        const randomUsername = generateRandomUsername()
        const randomPassword = generateRandomPassword(16)
        try {
            const response = await api.post('/register', {
                usernameReg: randomUsername,
                passwordReg: randomPassword,
                skipTokenCreation: true,
            })

            if (response.data.message == 'Registration successful.') {
                setLoading(false)
                setGeneratedUsername(randomUsername)
                setGeneratedPassword(randomPassword)
                return
            }
        } 
        catch (error) {
            if (axios.isAxiosError(error)) {
                backendError = error
                if (backendError.message == "Username is taken.") {
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
                    
                    <button className="generator__btn text-btn" onClick={attemptRegistration}>
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
                                    (<BsEyeSlash className="eye-icon icon-btn" onClick={togglePasswordVisibility} />)
                                    : 
                                    (<BsEye className="eye-icon icon-btn" onClick={togglePasswordVisibility} />)
                                }
                            </p>
                        </div>
                    }
                    
                    <p>{(!loading && generatedUsername) &&
                            <>
                                <span>Save these details in a secure place.</span> 
                                <br /> 
                                <span>Use them to login on different devices.</span>
                            </>
                        }
                    </p>
                </div>

                <div className="form-cont">
                    {showLoginForm && <LoginForm />}
                    {showRegisterForm && <RegisterForm />}
                    <button className="AuthPage__change-form-btn text-btn" onClick={handleFormChange}>
                        {showLoginForm ? "Create an account" : "Login to LimeDrive"}
                    </button>
                </div>

                <p className="info">Very old accounts may be deleted for space. <br /> Don't upload any sensitve or important files!</p>
            </div>
        </div>
    )
}

export default memo(AuthPage)
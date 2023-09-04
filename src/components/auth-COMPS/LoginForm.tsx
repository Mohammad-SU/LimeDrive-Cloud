import { useState, memo } from 'react'
import axios from 'axios';
import "./Form.scss"
import { useUserContext } from '../../contexts/UserContext';
import { handleBackendError } from '../../functions/BackendErrorResponse.ts';
import { useNavigate } from "react-router-dom";
import { useFormLogic } from "../../hooks/useFormLogic.ts";
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import LoadingBar from "../LoadingBar-COMPS/LoadingBar.tsx"

function LoginForm() {
    const { formData, handleInputChange } = useFormLogic({
        usernameOrEmailLog: '',
        passwordLog: '',
    })
    const { setUser, token, setToken } = useUserContext();
    const navigate = useNavigate();
    var backendError: string | null = null
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const isPasswordValid = formData.passwordLog.length >= 8

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setErrorMessage(null)

        if (isPasswordValid) {
            setLoading(true)
            try {
                const response = await axios.post('http://localhost:8000/api/login', formData)

                if (response.data.message == "Login successful.") {
                    setErrorMessage(null)
                    const { user, token } = response.data;
                    setUser(user);
                    setToken(token);
                    navigate("/home");
                }
            } 
            catch (error) {
                if (axios.isAxiosError(error)) {
                    backendError = handleBackendError(error)
                    
                    backendError === "Invalid login details."
                    ? setErrorMessage(backendError)
                    : setErrorMessage("Error. Please check your connection.")
                }
            }
            finally {
                setLoading(false)
            }
        }
        else {
            setErrorMessage("Invalid login details.")
        }
    }

    const [showPassword, setShowPassword] = useState<boolean>(false)
    const togglePasswordVisibility = () => {setShowPassword(!showPassword)}

    return (
        <form className="form" name="login-form" method="POST" onSubmit={handleSubmit}>
            <h2 className="form__heading">Login</h2>

            <div className="form__input-cont">
                <div className="form__input-label usernameOrEmailLog-label">Username/email:</div>
                <input
                    className="form__usernameOrEmailLog"
                    name="usernameOrEmailLog"
                    value={formData.usernameOrEmailLog}
                    onChange={handleInputChange}
                    maxLength={255}
                    autoComplete="username email"
                    spellCheck="false"
                    required
                    disabled={loading}
                />
            </div>

            <div className="form__input-cont">
                <div className="form__input-label passwordLog-label">Password:</div>
                <input
                    className="form__passwordLog"
                    name="passwordLog"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.passwordLog}
                    onChange={handleInputChange}
                    maxLength={72}
                    autoComplete="current-password"
                    spellCheck="false"
                    required
                    disabled={loading}
                />
                {showPassword ? 
                    (<BsEyeSlash className="eye-icon" onClick={togglePasswordVisibility} />)
                    : 
                    (<BsEye className="eye-icon" onClick={togglePasswordVisibility} />)
                }
            </div>

            <p className="form__error-and-loading">
                {errorMessage}
                <LoadingBar loading={loading} />
            </p>

            <button className="form__submit" type="submit" disabled={loading}>
                Login
            </button>
        </form>
    )
}

export default memo(LoginForm)
import { useState, memo } from 'react'
import axios, { AxiosError } from 'axios';
import "./Form.scss"
import { useUserContext } from '../../contexts/UserContext';
import { useNavigate } from "react-router-dom";
import { useFormLogic } from "../../hooks/useFormLogic.ts";
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import LoadingBar from "../LoadingBar-COMPS/LoadingBar.tsx"

function LoginForm() {
    const { formData, handleInputChange } = useFormLogic({
        usernameOrEmailLog: '',
        passwordLog: '',
    })
    const { api, setToken } = useUserContext();
    const navigate = useNavigate();
    let backendError: AxiosError | null = null
    let backendErrorMsg: string | null = null
    const [formError, setFormError] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const isPasswordValid = formData.passwordLog.length >= 8

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setFormError(null)

        if (isPasswordValid) {
            setLoading(true)
            try {
                const response = await api.post('/login', formData)

                if (response.data.message == "Login successful.") {
                    setFormError(null)
                    const { token } = response.data
                    setToken(token)
                    navigate("/LimeDrive")
                }
            } 
            catch (error) {
                console.error(error)
                if (axios.isAxiosError(error)) {
                    backendError = error
                    backendErrorMsg = error?.response?.data.message

                    backendErrorMsg === "Invalid login details."
                    ? setFormError(backendErrorMsg)
                    : setFormError("Error. Please check your connection.")
                }
            }
            finally {
                setLoading(false)
            }
        }
        else {
            setFormError("Invalid login details.")
        }
    }

    const [showPassword, setShowPassword] = useState<boolean>(false)
    function togglePasswordVisibility() {setShowPassword(!showPassword)}

    return (
        <form className="form" name="login-form" method="POST" onSubmit={handleSubmit}>
            <h2 className="form__heading">Login</h2>

            <div className="form__input-cont">
                <label className="form__input-label usernameOrEmailLog-label" htmlFor="usernameOrEmail-login">Username/email:</label>
                <input
                    className="form__usernameOrEmailLog"
                    id="usernameOrEmail-login"
                    name="usernameOrEmailLog"
                    value={formData.usernameOrEmailLog}
                    onChange={(e) => handleInputChange(e, 255)}
                    maxLength={255}
                    autoComplete="username email"
                    spellCheck="false"
                    required
                    disabled={loading}
                    data-testid="usernameOrEmailInput"
                />
            </div>

            <div className="form__input-cont">
                <label className="form__input-label passwordLog-label" htmlFor="password-login">Password:</label>
                <input
                    className="form__passwordLog"
                    id="password-login"
                    name="passwordLog"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.passwordLog}
                    onChange={(e) => handleInputChange(e, 72)}
                    maxLength={72}
                    autoComplete="current-password"
                    spellCheck="false"
                    required
                    disabled={loading}
                    data-testid="passwordInput"
                />
                {showPassword ? 
                    (<BsEyeSlash className="eye-icon icon-btn" onClick={togglePasswordVisibility} />)
                    : 
                    (<BsEye className="eye-icon icon-btn" onClick={togglePasswordVisibility} />)
                }
            </div>
            <input type="hidden" name="_token" value="{{ csrf_token() }}" />

            <p className="form__error-and-loading" data-testid="domErrorText">
                {formError}
                <LoadingBar loading={loading} />
            </p>

            <button className="form__submit" type="submit" disabled={loading} data-testid="loginButton">
                Login
            </button>
        </form>
    )
}

export default memo(LoginForm)
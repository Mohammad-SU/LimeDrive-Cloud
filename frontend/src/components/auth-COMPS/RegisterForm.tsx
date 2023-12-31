import { useState, memo } from 'react'
import axios, { AxiosError } from 'axios'
import "./Form.scss"
import { useUserContext } from '../../contexts/UserContext';
import { useNavigate } from "react-router-dom";
import { useFormLogic } from "../../hooks/useFormLogic.ts"
import { BsEye, BsEyeSlash } from 'react-icons/bs'
import LoadingBar from "../LoadingBar-COMPS/LoadingBar.tsx"

function RegisterForm() {          
    const { formData, handleInputChange } = useFormLogic({
        emailReg:'',
        usernameReg: '',
        passwordReg: '',
        passwordReg_confirmation: '',
    })
    const [loading, setLoading] = useState<boolean>(false)
    const { api, setToken } = useUserContext();
    const navigate = useNavigate();
    const [formError, setFormError] = useState<string | null>(null)
    
    const isEmailValid = /^\S+@\S+\.\S+$/.test(formData.emailReg)
    const isUsernameValid = /^[a-zA-Z0-9_-]+$/.test(formData.usernameReg)
    const isPasswordValid = formData.passwordReg.length >= 8
    const isPasswordMatch = formData.passwordReg === formData.passwordReg_confirmation

    function renderError(backendErrorMsg: string) {
        setFormError( 
            !isEmailValid || backendErrorMsg.startsWith("Invalid email format.") ? 'Invalid email format.'
            : !isUsernameValid ? 'Invalid username format.'
            : formData.passwordReg.trim() === '' ? 'Password must not be empty.'
            : formData.passwordReg_confirmation.trim() === '' ? 'Password confirmation must not be empty.'
            : !isPasswordValid ? 'Password must have at least 8 characters.'
            : !isPasswordMatch ? 'Passwords do not match.' 
            : backendErrorMsg.startsWith("Email is taken.") ? "Email is taken."
            : backendErrorMsg.startsWith("Username is taken.") ? "Username is taken."
            : backendErrorMsg !== "" ? 'Error. Please check your connection.'
            : null
        )
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()
        if (loading) return
        if (!isEmailValid || !isUsernameValid || !isPasswordValid || !isPasswordMatch) {
            return renderError("")
        }

        setFormError(null)
        setLoading(true)
        try {
            const response = await api.post('/register', formData)

            if (response.data.message === "Registration successful.") {
                setFormError(null)
                const { token } = response.data;
                setToken(token);
                navigate("/LimeDrive")
            }
        }
        catch (error) {
            console.error(error)
            if (axios.isAxiosError(error)) {
                renderError(error?.response?.data.message)
            }
        } 
        finally {
            setLoading(false)
        }
    }

    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
    function togglePasswordVisibility() {setShowPassword(!showPassword)}
    function toggleConfirmPasswordVisibility() {setShowConfirmPassword(!showConfirmPassword)}
    
    return (
        <form className="form" name="register-form" method="POST" onSubmit={handleSubmit}>
            <h2 className="form__heading">Register</h2>

            <div className="form__input-cont">
                <label className="form__input-label emailReg-label" htmlFor="email-register">Email:</label>
                <input
                    className="form__emailReg"
                    id="email-register"
                    name="emailReg"
                    value={formData.emailReg}
                    onChange={(e) => handleInputChange(e, 255)}
                    maxLength={255}
                    autoComplete="email"
                    spellCheck="false"
                    required
                    disabled={loading}
                />
            </div>
            <div className="form__input-cont">
                <label className="form__input-label usernameReg-label" htmlFor="username-register">Username:</label>
                <input
                    className="form__usernameReg"
                    id="username-register"
                    name="usernameReg"
                    value={formData.usernameReg}
                    onChange={(e) => handleInputChange(e, 30)}
                    maxLength={30}
                    placeholder="Can contain a-z, A-Z, 0-9, -, _"
                    autoComplete="username"
                    spellCheck="false"
                    required
                    disabled={loading}
                    aria-label="Input for username for registration. Can contain alphanumeric characters, hyphens, and dashes."
                />
            </div>
            <div className="form__input-cont">
                <label className="form__input-label passwordReg-label" htmlFor="password-register">Password:</label>
                <input
                    className="form__passwordReg"
                    id="password-register"
                    name="passwordReg"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.passwordReg}
                    onChange={(e) => handleInputChange(e, 72)}
                    maxLength={72}
                    placeholder="Must contain at least 8 characters"
                    autoComplete="new-password"
                    spellCheck="false"
                    required
                    disabled={loading}
                />
                <button type="button" className="icon-btn-wrapper" onClick={togglePasswordVisibility}>
                    {showPassword ? 
                        (<BsEyeSlash className="eye-icon icon-btn" />)
                        : (<BsEye className="eye-icon icon-btn" />)
                    }
                </button>
            </div>
            <div className="form__input-cont">
                <label className="form__input-label passwordReg_confirmation-label" htmlFor="password-confirmation">Confirm password:</label>
                <input
                    className="form__passwordReg_confirmation"
                    id="password-confirmation"
                    name="passwordReg_confirmation"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.passwordReg_confirmation}
                    onChange={(e) => handleInputChange(e, 72)}
                    maxLength={72}
                    spellCheck="false"
                    required
                    disabled={loading}
                />
                <button type="button" className="icon-btn-wrapper" onClick={toggleConfirmPasswordVisibility}>
                    {showConfirmPassword ? 
                        (<BsEyeSlash className="eye-icon icon-btn" />)
                        : (<BsEye className="eye-icon icon-btn" />)
                    }
                </button>
            </div>
            <input type="hidden" name="_token" value="{{ csrf_token() }}" />

            <p className="form__error-and-loading">
                <span>{formError}</span>
                <LoadingBar loading={loading} />
            </p>

            <button className="form__submit" type="submit" disabled={loading}>
                Register
            </button>
        </form>
    )
}

export default memo(RegisterForm)
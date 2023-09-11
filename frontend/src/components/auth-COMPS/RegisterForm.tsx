import { useState, memo } from 'react'
import axios from 'axios'
import api from '../../axios-config.ts';
import "./Form.scss"
import { useUserContext } from '../../contexts/UserContext';
import { handleBackendError } from '../../functions/BackendErrorResponse.ts';
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
    const { setUser, setToken } = useUserContext();
    const navigate = useNavigate(); 
    var backendError: string | null = null
    const [errorMessage, setErrorMessage] = useState<string | null>(null)

    const isEmailValid = /^\S+@\S+\.\S+$/.test(formData.emailReg)
    const isUsernameValid = /^[a-zA-Z0-9_-]+$/.test(formData.usernameReg)
    const isPasswordValid = formData.passwordReg.length >= 8
    const isPasswordMatch = formData.passwordReg === formData.passwordReg_confirmation

    function renderError() {
        setErrorMessage( 
            !isEmailValid ? 'Invalid email format.'
            : !isUsernameValid ? 'Invalid username format.'
            : !isPasswordValid ? 'Password must have at least 8 characters.'
            : !isPasswordMatch ? 'Passwords do not match.' 
            : backendError === "Email is taken. (and 1 more error)" ? 'Email and username is taken.'
            : backendError === "Username is taken. (and 1 more error)" ? 'Email and username is taken.'
            : backendError === "Email is taken." ? backendError
            : backendError === "Username is taken." ? backendError
            : backendError != null ? 'Error. Please check your connection.'
            : null
        )
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault()
        setErrorMessage(null)
        
        if (isEmailValid && isUsernameValid && isPasswordValid && isPasswordMatch) {
            setLoading(true)
            try {
                const response = await api.post('/register', formData)

                if (response.data.message == "Registration successful.") {
                    setErrorMessage(null)
                    const { user, token } = response.data;
                    setUser(user);
                    setToken(token);
                    navigate("/home")
                }
            }
            catch (error) {
                if (axios.isAxiosError(error)) {
                    backendError = handleBackendError(error)
                }
                renderError()
            } 
            finally {
                setLoading(false)
            }
        }
        else {
            renderError()
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
                <div className="form__input-label emailReg-label">Email:</div>
                <input
                    className="form__emailReg"
                    name="emailReg"
                    value={formData.emailReg}
                    onChange={handleInputChange}
                    maxLength={255}
                    autoComplete="email"
                    spellCheck="false"
                    required
                    disabled={loading}
                />
            </div>
            <div className="form__input-cont">
                <div className="form__input-label usernameReg-label">Username:</div>
                <input
                    className="form__usernameReg"
                    name="usernameReg"
                    value={formData.usernameReg}
                    onChange={handleInputChange}
                    maxLength={30}
                    placeholder="Can contain a-z, A-Z, 0-9, -, _"
                    autoComplete="username"
                    spellCheck="false"
                    required
                    disabled={loading}
                />
            </div>
            <div className="form__input-cont">
                <div className="form__input-label passwordReg-label">Password:</div>
                <input
                    className="form__passwordReg"
                    name="passwordReg"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.passwordReg}
                    onChange={handleInputChange}
                    maxLength={72}
                    placeholder="Must contain at least 8 characters"
                    autoComplete="new-password"
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
            <div className="form__input-cont">
                <div className="form__input-label passwordReg_confirmation-label">Confirm password:</div>
                <input
                    className="form__passwordReg_confirmation"
                    name="passwordReg_confirmation"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.passwordReg_confirmation}
                    onChange={handleInputChange}
                    maxLength={72}
                    spellCheck="false"
                    required
                    disabled={loading}
                />
                {showConfirmPassword ? 
                    (<BsEyeSlash className="eye-icon" onClick={toggleConfirmPasswordVisibility} />)
                    : 
                    (<BsEye className="eye-icon" onClick={toggleConfirmPasswordVisibility} />)
                }
            </div>
            <input type="hidden" name="_token" value="{{ csrf_token() }}" />

                <p className="form__error-and-loading">
                    <span>{errorMessage}</span>
                    <LoadingBar loading={loading} />
                </p>

            <button className="form__submit" type="submit" disabled={loading}>
                Register
            </button>
        </form>
    )
}

export default memo(RegisterForm)
import { useState, memo } from 'react'
import axios from 'axios';
import "./Form.scss"
import { useFormLogic } from "../../hooks/useFormLogic.ts";
import { BsEye, BsEyeSlash } from 'react-icons/bs';

function RegisterForm() {
    const { formData, handleInputChange } = useFormLogic({
        emailReg:'',
        usernameReg: '',
        passwordReg: '',
        passwordConfirm: '',
    })
    const [invalidDetails, setInvalidDetails] = useState<boolean>(false)

    const isEmailValid = /^\S+@\S+\.\S+$/.test(formData.emailReg);
    const isUsernameValid = /^[a-zA-Z0-9_-]+$/.test(formData.usernameReg);
    const isPasswordValid = formData.passwordReg.length >= 8;
    const isPasswordMatch = formData.passwordReg === formData.passwordConfirm;

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()

        if (isEmailValid && isUsernameValid && isPasswordValid && isPasswordMatch) {
            setInvalidDetails(false)
            try {
                const response = await axios.post('/api/register', formData);
                console.log(response.data);
            } catch (error) {
                console.error(error);
            }
        } else {
            setInvalidDetails(true)
        }
    }

    const [showPassword, setShowPassword] = useState<boolean>(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
    const togglePasswordVisibility = () => {setShowPassword(!showPassword)}
    const toggleConfirmPasswordVisibility = () => {setShowConfirmPassword(!showConfirmPassword)}
    
    return (
        <form className="form" name="login-form" method="POST" onSubmit={handleSubmit}>
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
                    autoComplete="current-password"
                    spellCheck="false"
                    required
                />
                {showPassword ? 
                    (<BsEyeSlash className="eye-icon" onClick={togglePasswordVisibility} />)
                    : 
                    (<BsEye className="eye-icon" onClick={togglePasswordVisibility} />)
                }
            </div>
            <div className="form__input-cont">
                <div className="form__input-label passwordConfirm-label">Confirm password:</div>
                <input
                    className="form__passwordConfirm"
                    name="passwordConfirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.passwordConfirm}
                    onChange={handleInputChange}
                    maxLength={72}
                    autoComplete="current-password"
                    spellCheck="false"
                    required
                />
                {showConfirmPassword ? 
                    (<BsEyeSlash className="eye-icon" onClick={toggleConfirmPasswordVisibility} />)
                    : 
                    (<BsEye className="eye-icon" onClick={toggleConfirmPasswordVisibility} />)
                }
            </div>

            
                <p className="form__error">
                    {invalidDetails && (
                        <>
                            {!isEmailValid && <span>Invalid email format.</span>}
                            {isEmailValid && !isUsernameValid && <span>Invalid username format.</span>}
                            {isEmailValid && isUsernameValid && !isPasswordValid && <span>Password must have at least 8 characters.</span>}
                            {isEmailValid && isUsernameValid && isPasswordValid && !isPasswordMatch && <span>Passwords do not match.</span>}
                        </>
                    )}
                </p>
            <button className="form__submit" type="submit">
                Register
            </button>
        </form>
    )
}

export default memo(RegisterForm)
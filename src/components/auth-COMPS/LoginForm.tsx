import { useState, memo } from 'react'
import axios from 'axios';
import "./Form.scss"
import { useFormLogic } from "../../hooks/useFormLogic.ts";
import { BsEye, BsEyeSlash } from 'react-icons/bs';

function LoginForm() {
    const { formData, handleInputChange } = useFormLogic({
        usernameOrEmailLog: '',
        passwordLog: '',
    })
    const [invalidDetails, setInvalidDetails] = useState<boolean>(false)

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        if (formData.usernameOrEmailLog === 'validUsernameOrEmailLog' && formData.passwordLog === 'validPasswordLog') {
            setInvalidDetails(false)
            try {
                const response = await axios.post('/api/login', formData);
                console.log(response.data);
            } catch (error) {
                console.error(error);
            }
        } 
        else {
            setInvalidDetails(true)
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
                />
                {showPassword ? 
                    (<BsEyeSlash className="eye-icon" onClick={togglePasswordVisibility} />)
                    : 
                    (<BsEye className="eye-icon" onClick={togglePasswordVisibility} />)
                }
            </div>

            <p className="form__error">{invalidDetails && <span>Invalid login details, please try again.</span>}</p>

            <button className="form__submit" type="submit">Login</button>
        </form>
    )
}

export default memo(LoginForm)
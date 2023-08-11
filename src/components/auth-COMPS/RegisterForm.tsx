import { useState, memo } from 'react'
import "./Form.scss"
import { useFormLogic } from "../../hooks/useFormLogic.ts";

function RegisterForm() {
    const { formData, handleInputChange } = useFormLogic({
        emailReg:'',
        usernameReg: '',
        passwordReg: '',
        passwordConfirm: '',
    })
    const [invalidDetails, setInvalidDetails] = useState<boolean>(false);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()

        if (formData.emailReg === 'validEmailReg' && formData.usernameReg === 'validUsernameReg' && formData.passwordReg === 'validPasswordReg' && formData.passwordConfirm === 'validPasswordConfirm') {
            setInvalidDetails(false)
        } 
        else {
            setInvalidDetails(true)
        }
    }

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
                    required
                />
            </div>
            <div className="form__input-cont">
                <div className="form__input-label passwordReg-label">Password:</div>
                <input
                    className="form__passwordReg"
                    name="passwordReg"
                    type="password"
                    value={formData.passwordReg}
                    onChange={handleInputChange}
                    maxLength={72}
                    placeholder="Must contain at least 8 characters"
                    autoComplete="current-password"
                    required
                />
            </div>
            <div className="form__input-cont">
                <div className="form__input-label passwordConfirm-label">Confirm password:</div>
                <input
                    className="form__passwordConfirm"
                    name="passwordConfirm"
                    type="password"
                    value={formData.passwordConfirm}
                    onChange={handleInputChange}
                    maxLength={72}
                    autoComplete="current-password"
                    required
                />
            </div>

            {invalidDetails && <p className="form__error">Invalid login details, please try again.</p>}

            <button className="form__submit" type="submit">
                Register
            </button>
        </form>
    )
}

export default memo(RegisterForm)
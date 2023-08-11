import { useState, memo } from 'react'
import "./Form.scss"
import { useFormLogic } from "../../hooks/useFormLogic.ts";

function LoginForm() {
    const { formData, handleInputChange } = useFormLogic({
        usernameOrEmailLog: '',
        passwordLog: '',
    })
    const [invalidDetails, setInvalidDetails] = useState<boolean>(false);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()

        if (formData.usernameOrEmailLog === 'validUsernameOrEmailLog' && formData.passwordLog === 'validpasswordLog') {
            setInvalidDetails(false)
        } 
        else {
            setInvalidDetails(true)
        }
    }

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
                    required
                />
            </div>

            <div className="form__input-cont">
                <div className="form__input-label passwordLog-label">Password:</div>
                <input
                    className="form__passwordLog"
                    name="passwordLog"
                    type="password"
                    value={formData.passwordLog}
                    onChange={handleInputChange}
                    maxLength={72}
                    autoComplete="current-password"
                    required
                />
            </div>

            {invalidDetails && <p className="form__error">Invalid login details, please try again.</p>}

            <button className="form__submit" type="submit">
                Login
            </button>
        </form>
    )
}

export default memo(LoginForm)
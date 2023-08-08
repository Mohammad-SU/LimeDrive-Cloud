import { useState, memo } from 'react'
import "./LoginPage.scss"

function LoginPage() {
    const [formData, setFormData] = useState<{ usernameOrEmail: string; password: string }>({
        usernameOrEmail: '',
        password: '',
    })
    const [invalidDetails, setInvalidDetails] = useState<boolean>(false);
    
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }))
    }
    
    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()

        if (formData.usernameOrEmail === 'validUser' && formData.password === 'validPassword') {
            setInvalidDetails(false)
        } 
        else {
            setInvalidDetails(true)
        }
    }

    return (
        <form id="login-form" name="login-form" method="POST" onSubmit={handleSubmit}>
            <input
                id="login-form__usernameOrEmail"
                name="usernameOrEmail"
                placeholder="Username or email"
                value={formData.usernameOrEmail}
                onChange={handleInputChange}
                maxLength={320}
                autoComplete="username email"
                required
            />
            <input
                id="login-form__password"
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                maxLength={72}
                autoComplete="current-password"
                required
            />

            {invalidDetails && <p id="login-form__error">Invalid login details, please try again.</p>}

            <button id="login-form__submit" type="submit">
                Login
            </button>
        </form>
    )
}

export default memo(LoginPage)
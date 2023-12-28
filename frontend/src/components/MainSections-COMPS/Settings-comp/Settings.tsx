import { memo, useState, useRef } from 'react'
import "./Settings.scss"
import axios from 'axios'
import { useUserContext } from '../../../contexts/UserContext'
import { useFormLogic } from '../../../hooks/useFormLogic'
import { useToast } from '../../../contexts/ToastContext'
import Modal from '../../Modal-comp/Modal'
import { capitalize } from 'lodash';
import { BsEye, BsEyeSlash } from 'react-icons/bs'

function Settings() {
    const { user, setUser, apiSecure } = useUserContext()
    const { showToast } = useToast()
    const [processing, setProcessing] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [displayCurrentPassword, setDisplayCurrentPassword] = useState(false)
    const [displayNewPassword, setDisplayNewPassword] = useState(false)
    const [displayConfirmNewPassword, setDisplayConfirmNewPassword] = useState(false)
    const [changeUsernameModal, setChangeUsernameModal] = useState(false)
    const [changeEmailModal, setChangeEmailModal] = useState(false)
    const [changePasswordModal, setChangePasswordModal] = useState(false)
    const [formError, setFormError] = useState<string | null>(null)
    const firstInputRef = useRef<HTMLInputElement | null>(null)
    const { formData, handleInputChange, resetFormData } = useFormLogic({
        newUsername: '',
        newEmail: '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    }, (event) => {
        setFormError(null)
    })
    const isNewUsernameValid = /^[a-zA-Z0-9_-]+$/.test(formData.newUsername)
    const isNewEmailValid = /^\S+@\S+\.\S+$/.test(formData.newEmail)
    const isCurrentPasswordValid = formData.currentPassword.length >= 8
    const isNewPasswordValid = formData.newPassword.length >= 8
    const isConfirmNewPasswordValid = formData.newPassword === formData.confirmNewPassword

    const renderError = (backendErrorMsg: string | null) => {
        setFormError( 
            !changePasswordModal && (!isCurrentPasswordValid || backendErrorMsg === "Invalid current password.") ? 'Invalid password.'

            : changeUsernameModal && !isNewUsernameValid ? 'Invalid username format.'
            : changeUsernameModal && backendErrorMsg === "Username is taken." ? 'Username is taken.'
            
            : changeEmailModal && (!isNewEmailValid || backendErrorMsg === "Invalid email format.") ? 'Invalid email format.'
            : changeEmailModal && backendErrorMsg === "Email is taken." ? 'Email is taken.'

            : changePasswordModal && (!isCurrentPasswordValid || backendErrorMsg === "Invalid current password.") ? 'Invalid current password.'
            : changePasswordModal && (!isNewPasswordValid || backendErrorMsg === "Invalid new password format.") ? 'Invalid format for new password.'
            : changePasswordModal && (!isConfirmNewPasswordValid || backendErrorMsg === "Passwords do not match.") ? 'New password and confirm new password does not match.'
            
            : backendErrorMsg != null ? 'Error. Please check your connection.'
            : null
        )
    }

    const handleChangeAccountDetail = async (
        InvalidationCondition: boolean, 
        detailType: string,
        newDetailValue: string, 
    ) => {
        if (InvalidationCondition || !isCurrentPasswordValid) return renderError(null)
        
        try {
            setProcessing(true)
            showToast({message: `Processing new ${detailType}...`, loading: true})
            
            const payload = {
                currentPassword: formData.currentPassword,
                ["new"+capitalize(detailType)]: newDetailValue,
            };
            
            if (detailType === "password") {
                payload.confirmNewPassword = formData.confirmNewPassword;
            }

            const response = await apiSecure.post(`/update${capitalize(detailType)}`, payload);
            
            if (detailType === "username") {
                setUser(prevUser => ({ ...prevUser, username: response.data.newUsername }));
            } else if (detailType === "email") {
                setUser(prevUser => ({ ...prevUser, email: response.data.newEmail }));
            }
            
            showToast({message: `${capitalize(detailType)} changed successfully.`, showSuccessIcon: true})
            setShowModal(false)
        } 
        catch (error) {
            console.error(error);
            if (axios.isAxiosError(error)) {
                renderError(error?.response?.data.message)
                error?.response?.status === 500 ?
                    showToast({message: `Failed to change ${detailType}. Please check your connection.`, showFailIcon: true})
                    : showToast({message: `Failed to change ${detailType}.`, showFailIcon: true})
            }
        }
        finally {
            setProcessing(false)
        }
    }

    return (
        <div className="Settings">
            <h1 className="main-section-heading">Settings</h1>
            <div className="account-settings-cont">
                <div className="settings-section">
                    <h2>Account details</h2>
                    <div>
                        <p>Username</p>
                        <div className="detail-btn-cont">
                            <p>{user.username}</p>
                            <button className="text-btn" onClick={()=>{setShowModal(true), setChangeUsernameModal(true)}}>Edit</button>
                        </div>
                    </div>
                    <div>
                        <p>Email</p>
                        <div className="detail-btn-cont">
                            <p>{user.email ? user.email : "(No email registered)"}</p>
                            <button className="text-btn" onClick={()=>{setShowModal(true), setChangeEmailModal(true)}}>Edit</button>
                        </div>
                    </div>
                </div>
                
                <div className="settings-section">
                    <h2>Security</h2>
                    <div>
                        <p>Password</p>
                        <button className="text-btn" onClick={()=>{setShowModal(true), setChangePasswordModal(true)}}>Change password</button>
                    </div>
                    <div>
                        <p>Security checkup</p>
                        <button className="text-btn" onClick={()=>showToast({message: "Security checkup not yet featured.", showFailIcon: true})}>Start check-up</button>
                    </div>
                    <div>
                        <p>2-step authentication (2FA)</p>
                        <button className="text-btn" onClick={()=>showToast({message: "2-step authentication not yet featured.", showFailIcon: true})}>Off</button>
                    </div>
                </div>

                <div className="settings-section">
                    <h2>Delete account</h2>
                    <div>
                        <p>Delete my LimeDrive account</p>
                        <button className="text-btn">Delete</button>
                    </div>
                </div>
            </div>
            <Modal 
                className="user-settings-modal"
                onSubmit={() => {                    
                    changeUsernameModal ? handleChangeAccountDetail(!isNewUsernameValid, "username", formData.newUsername) // Don't use trim() for any of these
                    : changeEmailModal ? handleChangeAccountDetail(!isNewEmailValid, "email", formData.newEmail)
                    : handleChangeAccountDetail(!isNewPasswordValid || !isConfirmNewPasswordValid, "password", formData.newPassword)
                }}
                render={showModal}
                clipPathId="userSettingsModalClip"
                onCloseClick={() => setShowModal(false)}
                closeBtnTabIndex={!processing ? 0 : -1}
                onVisible={() => firstInputRef.current?.focus()}
                onExit={() => {
                    resetFormData()
                    setFormError(null)
                    setChangeUsernameModal(false)
                    setChangeEmailModal(false)
                    setChangePasswordModal(false)
                    setDisplayCurrentPassword(false)
                    setDisplayNewPassword(false)
                    setDisplayConfirmNewPassword(false)
                }}
            >
                <h1>Change {changeUsernameModal ? "username" : changeEmailModal ? "email" : "password"}</h1>
                <div className="all-inputs-cont">
                    <div className="input-cont">
                        <label htmlFor="current-password-input">Enter your {changePasswordModal ? 'current' : ''} password for verification</label>
                        <input
                            className='password-input'
                            type={displayCurrentPassword ? 'text' : 'password'}
                            id="current-password-input"
                            placeholder="Password"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={(e) => handleInputChange(e, 72)}
                            maxLength={72}
                            ref={firstInputRef}
                            required
                            disabled={processing}
                            aria-label="Input for your current password"
                            autoComplete='current-password'
                        />
                        <button type="button" className="icon-btn-wrapper" onClick={() => setDisplayCurrentPassword(current => !current)}>
                            {displayCurrentPassword ? 
                                (<BsEyeSlash className="eye-icon icon-btn" />)
                                : (<BsEye className="eye-icon icon-btn" />)
                            }
                        </button>
                    </div>

                    {changeUsernameModal ?
                        <div className="input-cont">
                            <label htmlFor="new-username-input">New username</label>
                            <input
                                type="text"
                                id="new-username-input"
                                placeholder="Can contain a-z, A-Z, 0-9, -, _"
                                name="newUsername"
                                value={formData.newUsername}
                                onChange={(e) => handleInputChange(e, 30)}
                                maxLength={30}
                                required
                                disabled={processing}
                                aria-label="Input for new username. Can contain alphanumeric characters, hyphens, and dashes."
                            />
                        </div>

                        : changeEmailModal ?
                            <div className="input-cont">
                                <label htmlFor="new-email-input">New email</label>
                                <input
                                    type="text"
                                    id="new-email-input"
                                    name="newEmail"
                                    value={formData.newEmail}
                                    onChange={(e) => handleInputChange(e, 255)}
                                    maxLength={255}
                                    required
                                    disabled={processing}
                                    aria-label="Input for new email"
                                    autoComplete="email"
                                />
                            </div>

                        : changePasswordModal ?
                            <>
                                <div className="input-cont">
                                    <label htmlFor="new-password-input">New password</label>
                                    <input
                                        className='password-input'
                                        type={displayNewPassword ? 'text' : 'password'}
                                        id="new-password-input"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={(e) => handleInputChange(e, 72)}
                                        maxLength={72}
                                        required
                                        disabled={processing}
                                        aria-label="Input for new password"
                                        autoComplete="new-password"
                                    />
                                    <button type="button" className="icon-btn-wrapper" onClick={() => setDisplayNewPassword(current => !current)}>
                                        {displayNewPassword ? 
                                            (<BsEyeSlash className="eye-icon icon-btn" />)
                                            : (<BsEye className="eye-icon icon-btn" />)
                                        }
                                    </button>
                                </div>
                                <div className="input-cont">
                                    <label htmlFor="confirm-new-password-input">Confirm new password</label>
                                    <input
                                        className='password-input'
                                        type={displayConfirmNewPassword ? 'text' : 'password'}
                                        id="confirm-new-password-input"
                                        name="confirmNewPassword"
                                        value={formData.confirmNewPassword}
                                        onChange={(e) => handleInputChange(e, 72)}
                                        maxLength={72}
                                        required
                                        disabled={processing}
                                        aria-label="Input for confirming new password"
                                    />
                                    <button type="button" className="icon-btn-wrapper" onClick={() => setDisplayConfirmNewPassword(current => !current)}>
                                        {displayConfirmNewPassword ? 
                                            (<BsEyeSlash className="eye-icon icon-btn" />)
                                            : (<BsEye className="eye-icon icon-btn" />)
                                        }
                                    </button>
                                </div>
                            </>

                        : null
                    }
                </div>
                <p className="error">{formError}</p>

                <div className="modal-btn-cont">
                    {/* {changePasswordModal && <p className='logout-warning'>You will be logged out of all sessions<br/>if you change your password.</p>} */}
                    <button 
                        className='modal-cancel-btn' 
                        type="button" 
                        onClick={() => setShowModal(false)} 
                        disabled={processing}
                    >
                        Cancel
                    </button>
                    <button 
                        className='modal-primary-btn'
                        type="submit"
                        disabled={processing || formError != null}
                    >
                        Change
                    </button>
                </div>
            </Modal>
        </div>
    )
}

export default memo(Settings)
import { useState, useRef, memo } from 'react';
import axios, { AxiosError } from 'axios';
import "./Header.scss";
import { useFileContext } from '../../contexts/FileContext';
import { useUserContext } from '../../contexts/UserContext';
import { useNavigate, Link } from 'react-router-dom'; 
import useUnfocusPopup from '../../hooks/useUnfocusPopup';
import useDelayedExit from '../../hooks/useDelayedExit';
import LimeDriveAscii_header from '../../assets/images/ascii/LimeDrive-ascii-header.png';
import { GiOrange } from "react-icons/gi";
import { BsPersonFillGear } from "react-icons/bs";
import { BsSearch } from "react-icons/bs";
import DynamicClip from '../DynamicClip';
import LoadingPage from '../LoadingBar-COMPS/LoadingPage-comp/LoadingPage';

function Header() {
    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownRef = useRef<HTMLDivElement | null>(null)
    const { isVisible: isDropdownVisible } = useDelayedExit({
        shouldRender: showDropdown,
    });
    useUnfocusPopup(dropdownRef, () => {
        setShowDropdown(false);
    });

    const { apiSecure, user, setUser, setToken } = useUserContext()
    const { setFiles, setFolders } = useFileContext()
    const [backendError, setBackendError] = useState<AxiosError | null>(null);
    const navigate = useNavigate();
    const [loadLogout, setLoadLogout] = useState(false);
    async function logout() {
        if (loadLogout) return
        try {
            setLoadLogout(true);
            await apiSecure.post('/logout')
            setFiles([])
            setFolders([])
            setUser({id: null, username: null, email: null})
            setToken(null)
            navigate("/auth")
        } 
        catch (error) {
            console.error(error)
            if (axios.isAxiosError(error)) {
                setBackendError(error)
            }
        }
        finally {
            setLoadLogout(false)
        }
    }

    return (
        <header className="Header">
            <Link to="/LimeDrive">
                <div className="main-heading">
                    <GiOrange className="lime-icon"/>
                    <img
                        className="image"
                        src={LimeDriveAscii_header}
                        alt="LimeDrive"
                    />
                </div>
            </Link>

            <div className="search-cont">
                <BsSearch className="search-icon" />
                <input
                    className="search-input"
                    type="text"
                    placeholder="Search..."
                    maxLength={40000}
                    name="search"
                />
            </div>

            <div className="user-cont">
                <h1 className="username">{user.username}</h1>
                <button onMouseDown={() => setShowDropdown(!showDropdown)} className="icon-btn-wrapper">
                    <BsPersonFillGear className="user-settings-icon icon-btn"/>
                </button>
                {isDropdownVisible &&
                    <div className="user-dropdown" ref={dropdownRef}>
                        <Link className="dropdown-btn-link" to="/settings" tabIndex={0}>
                            <button className="settings-btn" tabIndex={-1}>
                                Settings
                            </button>
                        </Link>
                        <button className="logout-btn" onClick={logout}>Logout</button>
                        <DynamicClip
                            clipPathId={"userDropdownClip"}
                            animation={showDropdown}
                            numRects={6}
                        />
                    </div>
                }
            </div>

            {loadLogout ? 
                <LoadingPage message="Logging out..." loading={loadLogout}/>
                : backendError ? <LoadingPage message="Error. Please check your connection and refresh the page." loading={loadLogout}/>
                : null
            }
        </header>
    );
}

export default memo(Header);
import { useState, useRef, memo } from 'react';
import axios, { AxiosError } from 'axios';
import "./Header.scss";
import { useToast } from '../../contexts/ToastContext';
import { useFileContext } from '../../contexts/FileContext';
import { useUserContext } from '../../contexts/UserContext';
import { useNavigate, Link } from 'react-router-dom'; 
import useUnfocusPopup from '../../hooks/useUnfocusPopup';
import useDelayedExit from '../../hooks/useDelayedExit';
import LimeDriveAscii_header from '../../assets/images/ascii/LimeDrive-ascii-header.png';
import { GiOrange } from "react-icons/gi";
import { BsPersonFillGear } from "react-icons/bs";
import { BsSearch } from "react-icons/bs";
import Search from './Search-comp/Search';
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

    const { showToast } = useToast()
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

            <Search />

            <div className="user-cont">
                <h1 className="username">{user.username}</h1>
                <button onMouseDown={() => setShowDropdown(!showDropdown)} className="icon-btn-wrapper">
                    <BsPersonFillGear className="user-settings-icon icon-btn"/>
                </button>
                {isDropdownVisible &&
                    <div className="user-dropdown" ref={dropdownRef}>
                        <Link className="dropdown-item dropdown-link" to="/settings" tabIndex={0}>Settings</Link>
                        <button 
                            className="dropdown-item" 
                            onClick={()=>showToast({message: "Upgrade not yet featured.", showFailIcon: true})}
                        >  {/* Change or wrap in Link btn if upgrade is implemented */}
                            Upgrade
                        </button>
                        <button className="dropdown-item" onClick={logout}>Logout</button>
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
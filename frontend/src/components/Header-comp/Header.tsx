import { useState, useEffect, useRef, memo } from 'react';
import axios, { AxiosError } from 'axios';
import "./Header.scss";
import { useFileContext } from '../../contexts/FileContext';
import { useUserContext } from '../../contexts/UserContext';
import { useNavigate, Link } from 'react-router-dom'; 
import LimeDriveAscii_header from '../../assets/images/ascii/LimeDrive-ascii-header.png';
import { GiOrange } from "react-icons/gi";
import { BsPersonFillGear } from "react-icons/bs";
import { BsSearch } from "react-icons/bs";
import LoadingPage from '../LoadingBar-COMPS/LoadingPage-comp/LoadingPage';


function Header() {
    const { apiSecure, user, setUser, setToken } = useUserContext()
    const { setFiles, setFolders } = useFileContext()
    const [dropdownVisible, setDropdownVisible] = useState(false)
    const dropdownRef = useRef<HTMLDivElement | null>(null)
    const [backendError, setBackendError] = useState<AxiosError | null>(null);

    const toggleDropdown = (event: React.MouseEvent) => {
        event.stopPropagation();
        setDropdownVisible(!dropdownVisible)
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as HTMLDivElement)) {
                setDropdownVisible(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const navigate = useNavigate();
    const [loadLogout, setLoadLogout] = useState(false);
    async function logout() {
        try {
            setLoadLogout(true);
            await apiSecure.post('/logout', null)
            setFiles([])
            setFolders([])
            setUser({id: null, username: null, email: null})
            setToken(null)
            navigate("/auth")
        } 
        catch (error) {
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
            <Link to="/home">
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
                <BsPersonFillGear 
                    className="user-settings-icon icon-btn" 
                    onClick={toggleDropdown}
                    onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                />
                {dropdownVisible &&
                    <div className="user-dropdown" ref={dropdownRef}>
                        <Link className="settings-link" to="/settings">Settings</Link>
                        <button className="logout-btn text-btn" onClick={logout}>Logout</button>
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
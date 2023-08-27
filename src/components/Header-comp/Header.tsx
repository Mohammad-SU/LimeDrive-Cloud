import { useState, useEffect, useRef, memo } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import "./Header.scss";
import { useUserContext } from '../../contexts/UserContext';
import { useNavigate, Link } from 'react-router-dom'; 
import LimeDriveAscii_header from '../../assets/images/ascii/LimeDrive-ascii-header.png';
import { GiOrange } from "react-icons/gi";
import { BsPersonFillGear } from "react-icons/bs";
import { BsSearch } from "react-icons/bs";
import { handleBackendError } from '../../functions/BackendErrorResponse';
import LoadingPage from '../LoadingPage-comp/LoadingPage';


function Header() {
    const { user, token } = useUserContext()
    const [dropdownVisible, setDropdownVisible] = useState(false)
    const dropdownRef = useRef<HTMLDivElement | null>(null)
    const [backendError, setBackendError] = useState<string | null>(null);

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
            await axios.post('http://localhost:8000/api/logout', null, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            Cookies.remove('auth_token');
            navigate("/auth")
        } 
        catch (error) {
            if (axios.isAxiosError(error)) {
                setBackendError(handleBackendError(error))
            }
        }
        finally {
            setLoadLogout(false) // Finish logging out
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
                />
            </div>

            <div className="user-cont">
                <h1 className="username">{user.username}</h1>
                <BsPersonFillGear 
                    className="user-settings-icon" 
                    onClick={toggleDropdown}
                    onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                />
                {dropdownVisible &&
                    <div className="user-dropdown" ref={dropdownRef}>
                        <button className="logout-btn" onClick={logout}>Logout</button>
                        <Link className="settings-link" to="/settings">Settings</Link>
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
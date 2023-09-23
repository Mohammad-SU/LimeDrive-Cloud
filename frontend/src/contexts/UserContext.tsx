import { useState, createContext, useContext, useEffect } from 'react';
import axios, { AxiosInstance, AxiosError } from 'axios';
import { UserType } from '../types';
import { useFileContext } from './FileContext';
import LoadingPage from '../components/LoadingBar-COMPS/LoadingPage-comp/LoadingPage';
import Cookies from 'js-cookie';

interface UserContextType {
    api: AxiosInstance;
    user: UserType;
    setUser: React.Dispatch<React.SetStateAction<UserType>>;
    token: string | null;
    setToken: (newToken: string | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUserContext() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUserContext must be used within a UserProvider');
    }
    return context;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
    const api: AxiosInstance = axios.create({
        baseURL: import.meta.env.VITE_API_URL,
    });

    const handleInvalidToken = (error: AxiosError) => {
        if (error?.response?.status === 401) {
            console.error('Invalid token. Logging out...');
            setToken(null);
            setUser({ id: null, username: null, email: null });
            window.location.href = "/auth"
            throw new Error("Invalid token.");
        }
        return Promise.reject(error);
    };

    api.interceptors.response.use(
        (response) => response,
        (error) => handleInvalidToken(error)
    );

    const initialToken = Cookies.get('auth_token') || null;
    const [token, setToken] = useState<string | null>(initialToken);
    const [user, setUser] = useState<UserType>({ id: null, username: null, email: null })
    const [loadUser, setLoadUser] = useState(true)
    const [backendError, setBackendError] = useState<AxiosError | null>(null);
    const { addFiles, addFolders } = useFileContext();
    
    async function fetchUserData() {
        setLoadUser(true)
        
        try {            
            const response = await api.get('/user', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const { user, files, folders } = response.data
            setUser(user)
            addFiles(files)
            addFolders(folders)
            setBackendError(null)
            if (window.location.pathname !== "/home") {
                window.location.href = "/home"
            }
        } 
        catch (error) {
            if (axios.isAxiosError(error)) {
                setBackendError(error)
                console.error(error)
                if (error.status == 401) setToken(null)
            }
        }
        finally {
            setLoadUser(false)
        }
    }

    useEffect(() => {
        if (token && backendError?.response?.status !== 401) {
            fetchUserData()
        }
        else {
            setLoadUser(false)
            setBackendError(null)
        }
    }, [token])

    const setTokenInCookie = (newToken: string | null) => {
        if (newToken) {
            Cookies.set('auth_token', newToken);
            setToken(newToken)
        } 
        else {
            Cookies.remove('auth_token');
            setToken(null)
        }
    };

    const contextValue: UserContextType = {
        api,
        user,
        setUser,
        token,
        setToken: setTokenInCookie
    }

    return (
        <UserContext.Provider value={contextValue}>
            {!loadUser && !backendError ? children
                : loadUser && token && !backendError ? <LoadingPage message="Fetching data..." loading={loadUser}/>
                : backendError?.status == 500 ? <LoadingPage message="Error. Please check your connection and refresh the page." loading={loadUser}/>
                : children
            }
        </UserContext.Provider>
    )
}
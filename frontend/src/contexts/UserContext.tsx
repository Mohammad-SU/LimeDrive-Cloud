import { useMemo, useState, createContext, useContext, useEffect } from 'react';
import axios, { AxiosInstance, AxiosError } from 'axios';
import { UserType } from '../types';
import { useFileContext } from './FileContext';
import LoadingPage from '../components/LoadingBar-COMPS/LoadingPage-comp/LoadingPage';
import Cookies from 'js-cookie';

interface UserContextType {
    api: AxiosInstance;
    apiSecure: AxiosInstance;
    user: UserType;
    setUser: React.Dispatch<React.SetStateAction<UserType>>;
    token: () => string | null;
    setToken: (newToken: string | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function useUserContext() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUserContext must be used within a UserProvider');
    }

    const token = context.token();

    return { ...context, token };
}

export function UserProvider({ children }: { children: React.ReactNode }) {
    const { setFiles, setFolders, addFiles, addFolders } = useFileContext();

    const initialToken = Cookies.get('auth_token') || null;
    const [token, setToken] = useState<string | null>(initialToken);
    const [invalidToken, setInvalidToken] = useState(false)

    const getTokenFromCookie = () => {
        return Cookies.get('auth_token') || null;
    };

    const setTokenInCookie = (newToken: string | null) => {
        if (newToken) {
            Cookies.set('auth_token', newToken, { secure: true, expires: 400 }); // 400 days so user is more likely to be informed that they need to login again if the token expires on the backend and they still want to use the app
            setToken(newToken)
        }
        else {
            Cookies.remove('auth_token');
            setToken(null)
        }
    };

    const handleInvalidToken = (error: AxiosError) => {
        if (error?.response?.status === 401) {
            console.error('Invalid/expired token. Logging out...');
            setInvalidToken(true)
            setUser({ id: null, username: null, email: null });
            setFiles([])
            setFolders([])
            setTimeout(() => {
                setTokenInCookie(null);
                if (window.location.pathname !== "/auth") {
                    window.location.href = "/auth";
                }
                setInvalidToken(false)
            }, 5000);
        }
        return Promise.reject(error);
    };

    const api = axios.create({
        baseURL: import.meta.env.VITE_API_URL,
    });

    const apiSecure = axios.create({
        baseURL: import.meta.env.VITE_API_URL,
        withCredentials: true,
    });

    api.interceptors.response.use (
        (response) => response,
        (error) => handleInvalidToken(error)
    );

    apiSecure.interceptors.request.use(
        (config) => {
            const token = getTokenFromCookie();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    apiSecure.interceptors.response.use (
        (response) => response,
        (error) => handleInvalidToken(error)
    );

    const [user, setUser] = useState<UserType>({ id: null, username: null, email: null })
    const [loadUser, setLoadUser] = useState(true)
    const [backendError, setBackendError] = useState<AxiosError | null>(null);
    
    async function fetchUserData() {
        setLoadUser(true)
        
        try {            
            const response = await apiSecure.get('/user');
            const { user, files, folders } = response.data
            setUser(user)
            addFiles(files)
            addFolders(folders)
            setBackendError(null)
        } 
        catch (error) {
            if (axios.isAxiosError(error)) {
                setBackendError(error)
                console.error(error)
            }
        }
        finally {
            setLoadUser(false)
        }
    }

    useEffect(() => {
        if (token && !user.username && backendError?.response?.status !== 401) {
            fetchUserData()
        }
        else {
            setLoadUser(false)
            setBackendError(null)
        }
    }, [token])

    const contextValue: UserContextType = useMemo(() => {
        return {
            api,
            apiSecure,
            user,
            setUser,
            token: getTokenFromCookie,
            setToken: setTokenInCookie
        };
    }, [api, apiSecure, user, setUser, token, setToken]);

    return (
        <UserContext.Provider value={contextValue}>
            {!loadUser && !backendError && !invalidToken ? children
                : invalidToken ? <LoadingPage message="Invalid/expired session. Redirecting in a few seconds..." loading={invalidToken}/>
                : loadUser && token && !backendError ? <LoadingPage message="Initializing LimeDrive..." loading={loadUser}/>
                : backendError?.response?.status == 500 ? <LoadingPage message="Error. Please check your connection and refresh the page." loading={loadUser}/>
                : null
            }
        </UserContext.Provider>
    )
}
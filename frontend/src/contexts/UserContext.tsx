import { useState, createContext, useContext, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import api from '../axios-config';
import { UserType } from '../types';
import { useFileContext } from './FileContext';
import LoadingPage from '../components/LoadingPage-comp/LoadingPage';
import Cookies from 'js-cookie';

interface UserContextType {
    user: UserType;
    setUser: React.Dispatch<React.SetStateAction<UserType>>;
    token: string | null;
    setToken: React.Dispatch<React.SetStateAction<string | null>>;
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
        if (token && backendError?.response?.status != 401) {
            fetchUserData()
        }
        else {
            setLoadUser(false)
        }
    }, [token])

    const contextValue: UserContextType = {
        user,
        setUser,
        token,
        setToken,
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
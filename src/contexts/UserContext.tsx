import { useState, createContext, useContext, useEffect } from 'react';
import axios from 'axios';
import { UserType } from '../types';
import { useCookies } from '../hooks/useCookies';
import { handleBackendError } from '../functions/BackendErrorResponse';
import LoadingPage from '../components/LoadingPage-comp/LoadingPage';

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
    const [token, setToken] = useCookies<string | null>('auth_token', null, {secure: true,})
    const [user, setUser] = useState<UserType>({ username: null, email: null })
    const [loadUser, setLoadUser] = useState(true)
    const [backendError, setBackendError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUser() {
            try {
                const response = await axios.get('http://localhost:8000/api/user', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const user = response.data
                setUser(user)
                setBackendError(null)
            } 
            catch (error) {
                if (axios.isAxiosError(error)) {
                    setBackendError(handleBackendError(error))
                }
            }
            finally {
                setLoadUser(false);
            }
        }

        if (token) {
            fetchUser()
        }
        else {
            setLoadUser(false)
        }
    }, [token]);

    const contextValue: UserContextType = {
        user,
        setUser,
        token,
        setToken,
    }

    return (
        <UserContext.Provider value={contextValue}>
            {!loadUser && !backendError ? children
                : loadUser && token && !backendError ? <LoadingPage message="Fetching user data..." loading={loadUser}/>
                : backendError ? <LoadingPage message="Error. Please check your connection and refresh the page." loading={loadUser}/>
                : children
            }
        </UserContext.Provider>
    )
}
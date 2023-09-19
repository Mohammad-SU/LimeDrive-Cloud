import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

type SetValue<T> = (newValue: T | ((prevValue: T) => T)) => void;

interface CookieOptions {
    expires?: number | Date;
    path?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
}

export function useCookies<T> (
    key: string,
    initialValue: T,
    options: CookieOptions = {}
): [T, SetValue<T>] {
    const [cookieValue, setCookieValue] = useState<T>(() => {
        try {
            const storedCookie = Cookies.get(key);
            return storedCookie !== undefined ? JSON.parse(storedCookie) : initialValue;
        } catch (error) {
            console.error(`Error parsing cookie for key "${key}":`, error);
            return initialValue; // Return the initialValue in case of an error
        }
    });

    useEffect(() => {
        try {
            Cookies.set(key, JSON.stringify(cookieValue), options);
        } catch (error) {
            console.error(`Error setting cookie for key "${key}":`, error);
        }
    }, [key, cookieValue, options]);

    return [cookieValue, setCookieValue];
}
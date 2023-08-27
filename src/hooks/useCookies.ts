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

export function useCookies<T>(
    key: string,
    initialValue: T,
    options: CookieOptions = {} // Provide default options if not specified
): [T, SetValue<T>] {
    const [cookieValue, setCookieValue] = useState<T>(() => {
        const storedCookie = Cookies.get(key);
        return storedCookie !== undefined ? JSON.parse(storedCookie) : initialValue;
    });

    useEffect(() => {
        Cookies.set(key, JSON.stringify(cookieValue), options);
    }, [key, cookieValue, options]);

    return [cookieValue, setCookieValue];
}
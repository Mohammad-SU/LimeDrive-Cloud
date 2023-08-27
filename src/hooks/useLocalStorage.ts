import { useState, useEffect } from "react"

function getSavedValue<T>(key: string, initialValue: T | (() => T)): T {
    const savedValue = localStorage.getItem(key);

    if (savedValue !== null) {
        return JSON.parse(savedValue);
    }

    if (initialValue instanceof Function) {
        return initialValue();
    }

    return initialValue;
}

export default function useLocalStorage<T>(key: string, initialValue: T | (() => T)) {
    const [value, setValue] = useState<T>(() => {
        return getSavedValue(key, initialValue)
    })

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value))
    }, [value])

    return [value, setValue] as const;
}
import { useState, ChangeEvent } from 'react'

export function useFormLogic<T>(initialState: T) {
    const [formData, setFormData] = useState<T>(initialState)

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target
        setFormData((prevData: T) => ({
            ...prevData,
            [name]: value,
        }))
    }

    return { formData, handleInputChange }
}
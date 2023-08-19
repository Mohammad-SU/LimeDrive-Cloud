import { AxiosError } from 'axios';

interface BackendErrorResponse {
    message: string
}

export const handleBackendError = (error: AxiosError<BackendErrorResponse>) => {
    if (error.response?.data?.message) {
        return error.response.data.message
    }
    return 'An error occurred while communicating with the server.'
}
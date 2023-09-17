import axios, { AxiosInstance, AxiosError } from 'axios';
import Cookies from 'js-cookie';

const api: AxiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
})

const handleInvalidToken = (error: AxiosError) => {
	if (error?.response?.status === 401) {
		console.error('Invalid token detected. Logging out...')
		Cookies.remove("auth_token")
		window.location.href = "/auth"
		throw new Error("Invalid token detected.");
	}
  	return Promise.reject(error)
}

api.interceptors.response.use(
	(response) => response,
	(error) => handleInvalidToken(error)
)

export default api
import axios from 'axios'

const API_BASE_URL =  import.meta.env.VITE_API_BASE_URL 

const authApi = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
})

authApi.interceptors.response.use(
    response => response.data,
    error => {
        if (error.response) {
            throw new Error(error.response.data?.error || 'Terjadi kesalahan')
        } else if (error.request) {
            throw new Error('Tidak ada respon dari server')
        } else {
            throw new Error('Kesalahan koneksi')
        }
    }
)

export const loginService = async (credentials) => {
    try {
        const response = await authApi.post('/auth/login', credentials)
        return {
            token: response.token,
            user: response.user
        }
    } catch (error) {
        throw new Error('Login gagal. Periksa kredensial anda.', error)
    }
}

export const logoutService = async () => {
    // 
    // 
};
import { useNavigate } from "react-router-dom"
import { useAuth } from "./useAuth"
import { useEffect } from "react"

export const useAutoLogout = () => {
    const { logout } = useAuth()
    const navigate = useNavigate()

    useEffect(() => {
        const checkTokenExpiry = () => {
            const token = localStorage.getItem('token')
            if (!token) return

            try {
                const payload = JSON.parse(atob(token.split('.')[1]))
                const expirationTime = payload.exp * 1000
                const currentTime = Date.now()

                if (currentTime > expirationTime) {
                    logout()
                    navigate('/login', {
                        state: {
                            message: "Your session has expired. Please login again"
                        }
                    })
                }
            } catch (error) {
                console.error('Error checking token expiry:', error)
            }
        }

        const interval = setInterval(checkTokenExpiry, 30000)
        checkTokenExpiry()

        return () => clearInterval(interval)
    }, [logout, navigate])
}
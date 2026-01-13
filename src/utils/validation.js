export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
}

export const validatePassword = (password) => {
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    return re.test(password)
}

export const sanitizeInput = (input) => {
    return input
        .replace(/[<>]/g, '')
        .trim()
}
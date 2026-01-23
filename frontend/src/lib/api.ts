const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token')

    const isFormData = options.body instanceof FormData

    const headers: Record<string, string> = {
        ...(token ? { Authorization: `Token ${token}` } : {}),
        ...(options.headers as Record<string, string>),
    }

    if (!isFormData && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json'
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
        console.error('API Error:', data)
        throw new Error(
            data.detail ||
            data.error ||
            data.message ||
            'API Request failed'
        )
    }

    return data
}

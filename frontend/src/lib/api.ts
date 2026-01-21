const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token')

    // Don't set Content-Type if we're sending FormData (browser will set it with boundary)
    const isFormData = options.body instanceof FormData

    const headers: Record<string, string> = {
        ...(token ? { 'Authorization': `Token ${token}` } : {}),
        ...options.headers as Record<string, string>,
    }

    if (!isFormData && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json'
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || errorData.error || 'API Request failed')
    }

    return response.json()
}

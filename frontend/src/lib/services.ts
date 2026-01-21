import { apiFetch } from './api'

export interface Profile {
  id: string
  user_id: string
  email: string
  full_name: string
  avatar_url?: string
  role: 'client' | 'agent' | 'landlord' | 'admin'
  user_type?: 'client' | 'agent' | 'landlord' | 'admin'
  phone?: string
  company?: string
  license_number?: string
  commission_rate?: number
  bio?: string
  website?: string
  social_links?: Record<string, any>
  total_properties_sold?: number
  total_properties_rented?: number
  average_rating?: number
  is_active?: boolean
  is_verified?: boolean
  created_at: string
  updated_at: string
}

export interface Property {
  id: string
  title: string
  description: string
  price: number
  price_type: 'month' | 'week' | 'day' | 'sale'
  location: string
  latitude?: number
  longitude?: number
  bedrooms: number
  bathrooms: number
  area: number
  category: 'apartment' | 'residential' | 'commercial' | 'corporate' | 'bnb' | 'land'
  owner_id?: string
  agent_id?: string
  is_featured: boolean
  is_verified: boolean
  is_available: boolean
  rating: number
  total_reviews: number
  total_views?: number
  amenities: string[]
  images: string[]
  video_url?: string
  virtual_tour_url?: string
  year_built?: number
  parking_spaces: number
  furnished: boolean
  pet_friendly: boolean
  created_at: string
  updated_at: string
  owner?: Partial<Profile>
  agent?: Partial<Profile>
}

export interface PropertyInquiry {
  id: string
  property_id: string
  name: string
  email: string
  phone: string
  message: string
  status: 'pending' | 'responded' | 'closed'
  created_at: string
  updated_at: string
  property?: Partial<Property>
}

export interface DashboardStats {
  id?: string
  total_properties?: number
  total_views?: number
  total_inquiries?: number
  active_listings?: number
}

export interface AuthUser {
  id: string
  email?: string
  full_name?: string
  avatar_url?: string
  role?: 'client' | 'agent' | 'landlord' | 'admin'
  token?: string
}

// Auth functions
export const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
  try {
    const data = await apiFetch('/users/', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        password2: password, // Simple alignment for now
        username: email.split('@')[0], // Default username
        ...metadata
      })
    })
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error }
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    const data = await apiFetch('/users/login/', {
      method: 'POST',
      body: JSON.stringify({
        username: email, // Assuming username is email for now
        password
      })
    })
    if (data.token) {
      localStorage.setItem('token', data.token)
    }
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error }
  }
}

export const signOut = async () => {
  try {
    await apiFetch('/users/logout/', { method: 'POST' })
    localStorage.removeItem('token')
    return { error: null }
  } catch (error: any) {
    return { error }
  }
}

export const getCurrentUser = async () => {
  try {
    const user = await apiFetch('/users/profile/')
    return { user, profile: user as Profile, error: null }
  } catch (error: any) {
    return { user: null, profile: null, error }
  }
}

export const getUserProfile = async (userId: string): Promise<{ profile: Profile | null, error: any }> => {
  try {
    const profile = await apiFetch(`/users/${userId}/`)
    return { profile, error: null }
  } catch (error: any) {
    return { profile: null, error }
  }
}

export const updateUserProfile = async (userId: string, updates: Partial<Profile>) => {
  try {
    const data = await apiFetch(`/users/${userId}/`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error }
  }
}

// Property functions
export const getProperties = async (filters?: any) => {
  try {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value))
      })
    }
    const data = await apiFetch(`/properties/?${params.toString()}`)
    // DRF returns results in a 'results' field if paginated
    return {
      properties: data.results || data,
      error: null,
      count: data.count || (Array.isArray(data) ? data.length : 0)
    }
  } catch (error: any) {
    return { properties: [], error, count: 0 }
  }
}

export const getProperty = async (id: string) => {
  try {
    const property = await apiFetch(`/properties/${id}/`)
    return { property, error: null }
  } catch (error: any) {
    return { property: null, error }
  }
}

export const createProperty = async (property: any) => {
  try {
    const data = await apiFetch('/properties/', {
      method: 'POST',
      body: JSON.stringify(property)
    })
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error }
  }
}

export const updateProperty = async (id: string, updates: Partial<Property>) => {
  try {
    const data = await apiFetch(`/properties/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    })
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error }
  }
}

export const deleteProperty = async (id: string) => {
  try {
    await apiFetch(`/properties/${id}/`, { method: 'DELETE' })
    return { error: null }
  } catch (error: any) {
    return { error }
  }
}

// User's properties
export const getUserProperties = async (userId: string) => {
  try {
    const data = await apiFetch(`/properties/?owner_id=${userId}`)
    return { properties: data.results || data, error: null }
  } catch (error: any) {
    return { properties: [], error }
  }
}

// Agent's properties
export const getAgentProperties = async (agentId: string) => {
  try {
    const data = await apiFetch(`/properties/?agent_id=${agentId}`)
    return { properties: data.results || data, error: null }
  } catch (error: any) {
    return { properties: [], error }
  }
}

// Property inquiries
export const createInquiry = async (inquiry: any) => {
  try {
    const data = await apiFetch('/inquiries/', {
      method: 'POST',
      body: JSON.stringify(inquiry)
    })
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error }
  }
}

export const getInquiries = async (userId?: string, role?: string) => {
  try {
    const params = new URLSearchParams()
    if (userId) params.append('user', userId)
    if (role) params.append('role', role)
    const data = await apiFetch(`/inquiries/?${params.toString()}`)
    return { inquiries: data.results || data, error: null }
  } catch (error: any) {
    return { inquiries: [], error }
  }
}

export const updateInquiryStatus = async (id: string, status: string) => {
  try {
    const data = await apiFetch(`/inquiries/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error }
  }
}

// Property views
export const trackPropertyView = async (propertyId: string, ipAddress: string, userAgent?: string) => {
  try {
    const data = await apiFetch(`/properties/${propertyId}/track_view/`, {
      method: 'POST',
      body: JSON.stringify({ ip_address: ipAddress, user_agent: userAgent })
    })
    return { data, error: null }
  } catch (error: any) {
    return { data: null, error }
  }
}

// Get dashboard stats
export const getDashboardStats = async (userId?: string, role?: string) => {
  try {
    const params = new URLSearchParams()
    if (userId) params.append('user_id', userId)
    if (role) params.append('role', role)
    const stats = await apiFetch(`/users/stats/?${params.toString()}`)
    return { stats, error: null }
  } catch (error: any) {
    return { stats: {}, error }
  }
}

// Real-time subscriptions (Stubs for now as Django doesn't have channels set up yet)
export const subscribeToProfileChanges = (userId: string, callback: (profile: Profile) => void) => {
  console.warn('Real-time subscriptions not available in Django backend yet')
  return { unsubscribe: () => { } }
}

export const subscribeToPropertyChanges = (callback: (property: Property) => void) => {
  console.warn('Real-time subscriptions not available in Django backend yet')
  return { unsubscribe: () => { } }
}

// --- Verification Services ---

export async function uploadVerificationDocument(file: File, documentType: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('document_type', documentType);

  try {
    const data = await apiFetch('/users/upload_verification/', {
      method: 'POST',
      body: formData,
    });
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

// --- Promotion Services ---

export async function promoteProperty(propertyId: string, days: number = 7) {
  try {
    const data = await apiFetch(`/properties/${propertyId}/promote/`, {
      method: 'POST',
      body: JSON.stringify({ days }),
    });
    return { data, error: null };
  } catch (error: any) {
    return { data: null, error };
  }
}

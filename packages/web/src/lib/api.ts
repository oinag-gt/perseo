const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }))
    throw new Error(error.message || 'API request failed')
  }
  
  return response.json()
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  const config: RequestInit = {
    headers: getAuthHeaders(),
    ...options,
  }

  try {
    const response = await fetch(url, config)
    return handleApiResponse<T>(response)
  } catch (error) {
    console.error('API Request failed:', error)
    throw error
  }
}

// Generic CRUD operations
export const api = {
  get: <T>(endpoint: string): Promise<T> =>
    apiRequest<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, data: unknown): Promise<T> =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data: unknown): Promise<T> =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  patch: <T>(endpoint: string, data: unknown): Promise<T> =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string): Promise<T> =>
    apiRequest<T>(endpoint, { method: 'DELETE' }),
}

// Specific API endpoints for People Module
export const peopleApi = {
  // Persons
  getPersons: (params?: Record<string, string | number>) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value))
      })
    }
    return api.get(`/people/persons?${searchParams}`)
  },
  
  getPerson: (id: string) => api.get(`/people/persons/${id}`),
  
  createPerson: (data: unknown) => api.post('/people/persons', data),
  
  updatePerson: (id: string, data: unknown) => api.patch(`/people/persons/${id}`, data),
  
  deletePerson: (id: string) => api.delete(`/people/persons/${id}`),
  
  restorePerson: (id: string) => api.post(`/people/persons/${id}/restore`, {}),

  // Groups
  getGroups: (params?: Record<string, string | number>) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value))
      })
    }
    return api.get(`/people/groups?${searchParams}`)
  },
  
  getGroup: (id: string) => api.get(`/people/groups/${id}`),
  
  createGroup: (data: unknown) => api.post('/people/groups', data),
  
  updateGroup: (id: string, data: unknown) => api.patch(`/people/groups/${id}`, data),
  
  deleteGroup: (id: string) => api.delete(`/people/groups/${id}`),
  
  getGroupHierarchy: (parentId?: string) => {
    const params = parentId ? `?parentId=${parentId}` : ''
    return api.get(`/people/groups/hierarchy${params}`)
  },

  // Group Members
  getGroupMembers: (groupId: string) => api.get(`/people/groups/${groupId}/members`),
  
  getActiveGroupMembers: (groupId: string) => api.get(`/people/groups/${groupId}/members/active`),
  
  addGroupMember: (groupId: string, data: unknown) => api.post(`/people/groups/${groupId}/members`, data),
  
  updateGroupMember: (groupId: string, personId: string, data: unknown) => 
    api.patch(`/people/groups/${groupId}/members/${personId}`, data),
  
  removeGroupMember: (groupId: string, personId: string) => 
    api.delete(`/people/groups/${groupId}/members/${personId}`),

  // Memberships
  getMemberships: (params?: Record<string, string | number>) => {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value))
      })
    }
    return api.get(`/people/memberships?${searchParams}`)
  },
  
  getMembership: (id: string) => api.get(`/people/memberships/${id}`),
  
  createMembership: (data: unknown) => api.post('/people/memberships', data),
  
  updateMembership: (id: string, data: unknown) => api.patch(`/people/memberships/${id}`, data),
  
  deleteMembership: (id: string) => api.delete(`/people/memberships/${id}`),
  
  endMembership: (id: string, data: { endDate: string; reason?: string }) => 
    api.post(`/people/memberships/${id}/end`, data),
  
  suspendMembership: (id: string, data: { reason: string }) => 
    api.post(`/people/memberships/${id}/suspend`, data),
  
  reactivateMembership: (id: string) => api.post(`/people/memberships/${id}/reactivate`, {}),
  
  getPersonMemberships: (personId: string) => api.get(`/people/memberships/person/${personId}`),
}

// Separate exports for better organization
export const groupsApi = {
  getGroups: peopleApi.getGroups,
  getGroup: peopleApi.getGroup,
  createGroup: peopleApi.createGroup,
  updateGroup: peopleApi.updateGroup,
  deleteGroup: peopleApi.deleteGroup,
  getGroupHierarchy: peopleApi.getGroupHierarchy,
  getGroupMembers: peopleApi.getGroupMembers,
  getActiveGroupMembers: peopleApi.getActiveGroupMembers,
  addGroupMember: peopleApi.addGroupMember,
  updateGroupMember: peopleApi.updateGroupMember,
  removeGroupMember: peopleApi.removeGroupMember,
}

export const membershipsApi = {
  getMemberships: peopleApi.getMemberships,
  getMembership: peopleApi.getMembership,
  createMembership: peopleApi.createMembership,
  updateMembership: peopleApi.updateMembership,
  deleteMembership: peopleApi.deleteMembership,
  endMembership: peopleApi.endMembership,
  suspendMembership: peopleApi.suspendMembership,
  reactivateMembership: peopleApi.reactivateMembership,
  getPersonMemberships: peopleApi.getPersonMemberships,
}
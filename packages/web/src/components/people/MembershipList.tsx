'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { membershipsApi } from '@/lib/api'
import { formatShortDate } from '@/lib/utils'
import { Users, User, Building, Calendar, Crown, AlertTriangle } from 'lucide-react'

interface GroupMembership {
  id: string
  personId: string
  groupId: string
  role: 'MEMBER' | 'LEADER' | 'COORDINATOR'
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  startDate: string
  endDate?: string
  notes?: string
  addedBy: string
  suspensionReason?: string
  createdAt: string
  updatedAt: string
  person: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  group: {
    id: string
    name: string
    type: 'ADMINISTRATIVE' | 'ACADEMIC' | 'SOCIAL' | 'OTHER'
  }
  addedByUser: {
    id: string
    firstName: string
    lastName: string
  }
}

interface MembershipListProps {
  onMembershipSelect?: (membership: GroupMembership) => void
  onCreateMembership?: () => void
  personId?: string
  groupId?: string
}

interface MembershipsResponse {
  data: GroupMembership[]
  totalPages: number
  currentPage: number
  totalItems: number
}

const ROLE_LABELS = {
  MEMBER: 'Member',
  LEADER: 'Leader',
  COORDINATOR: 'Coordinator'
}

const ROLE_COLORS = {
  MEMBER: 'bg-blue-100 text-blue-800',
  LEADER: 'bg-purple-100 text-purple-800',
  COORDINATOR: 'bg-green-100 text-green-800'
}

const STATUS_LABELS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended'
}

const STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  SUSPENDED: 'bg-red-100 text-red-800'
}

const GROUP_TYPE_LABELS = {
  ADMINISTRATIVE: 'Admin',
  ACADEMIC: 'Academic',
  SOCIAL: 'Social',
  OTHER: 'Other'
}

export default function MembershipList({ 
  onMembershipSelect, 
  onCreateMembership, 
  personId, 
  groupId 
}: MembershipListProps) {
  const [memberships, setMemberships] = useState<GroupMembership[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadMemberships = async (currentPage = 1, search = '') => {
    try {
      setLoading(true)
      setError(null)
      
      const params: Record<string, string | number> = {
        page: currentPage,
        limit: 20
      }
      
      if (search.trim()) {
        params.search = search.trim()
      }
      
      if (personId) {
        params.personId = personId
      }
      
      if (groupId) {
        params.groupId = groupId
      }

      const response = await membershipsApi.getMemberships(params) as MembershipsResponse
      setMemberships(response.data)
      setTotalPages(response.totalPages)
      setPage(currentPage)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load memberships')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMemberships()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personId, groupId])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadMemberships(1, searchTerm)
  }

  const handlePageChange = (newPage: number) => {
    loadMemberships(newPage, searchTerm)
  }

  const getTitle = () => {
    if (personId) return 'Person Memberships'
    if (groupId) return 'Group Members'
    return 'All Memberships'
  }

  const getCreateButtonText = () => {
    if (personId) return 'Add to Group'
    if (groupId) return 'Add Member'
    return 'Create Membership'
  }

  if (loading && memberships.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {getTitle()}
          </CardTitle>
          {onCreateMembership && (
            <Button onClick={onCreateMembership}>
              {getCreateButtonText()}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        {!personId && !groupId && (
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <Input
              placeholder="Search memberships..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              Search
            </Button>
          </form>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Membership List */}
        <div className="space-y-4">
          {memberships.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No memberships found matching your search.' : 'No memberships found.'}
            </div>
          ) : (
            memberships.map((membership) => (
              <Card 
                key={membership.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onMembershipSelect?.(membership)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">
                              {membership.person.firstName} {membership.person.lastName}
                            </h3>
                            <span>→</span>
                            <h4 className="font-medium text-muted-foreground">
                              {membership.group.name}
                            </h4>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className={`inline-block text-xs px-2 py-1 rounded ${ROLE_COLORS[membership.role]}`}>
                              {ROLE_LABELS[membership.role]}
                            </span>
                            <span className={`inline-block text-xs px-2 py-1 rounded ${STATUS_COLORS[membership.status]}`}>
                              {STATUS_LABELS[membership.status]}
                            </span>
                            <span className="inline-block text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                              {GROUP_TYPE_LABELS[membership.group.type]}
                            </span>
                            {membership.role === 'LEADER' && (
                              <Crown className="h-4 w-4 text-yellow-600" />
                            )}
                            {membership.status === 'SUSPENDED' && (
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{membership.person.email}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          <span>{membership.group.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Started {formatShortDate(membership.startDate)}
                            {membership.endDate && ` - ${formatShortDate(membership.endDate)}`}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>
                            Added by {membership.addedByUser.firstName} {membership.addedByUser.lastName}
                          </span>
                        </div>
                      </div>
                      
                      {membership.status === 'SUSPENDED' && membership.suspensionReason && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm">
                          <strong>Suspension reason:</strong> {membership.suspensionReason}
                        </div>
                      )}
                      
                      {membership.notes && (
                        <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-sm">
                          <strong>Notes:</strong> {membership.notes}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1 || loading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages || loading}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { groupsApi } from '@/lib/api'
import { formatShortDate } from '@/lib/utils'
import { Users, Building, Calendar, User, Hash } from 'lucide-react'

interface Group {
  id: string
  name: string
  description?: string
  type: 'ADMINISTRATIVE' | 'ACADEMIC' | 'SOCIAL' | 'OTHER'
  leaderId?: string
  parentGroupId?: string
  maxMembers?: number
  isActive: boolean
  tags?: string[]
  metadata?: Record<string, unknown>
  createdAt: string
  updatedAt: string
  leader?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  parentGroup?: {
    id: string
    name: string
  }
  _count?: {
    members: number
    subgroups: number
  }
}

interface GroupListProps {
  onGroupSelect?: (group: Group) => void
  onCreateGroup?: () => void
}

interface GroupsResponse {
  data: Group[]
  totalPages: number
  currentPage: number
  totalItems: number
}

const GROUP_TYPE_LABELS = {
  ADMINISTRATIVE: 'Administrative',
  ACADEMIC: 'Academic',
  SOCIAL: 'Social',
  OTHER: 'Other'
}

const GROUP_TYPE_COLORS = {
  ADMINISTRATIVE: 'bg-purple-100 text-purple-800',
  ACADEMIC: 'bg-blue-100 text-blue-800',
  SOCIAL: 'bg-green-100 text-green-800',
  OTHER: 'bg-gray-100 text-gray-800'
}

export default function GroupList({ onGroupSelect, onCreateGroup }: GroupListProps) {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadGroups = async (currentPage = 1, search = '') => {
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

      const response = await groupsApi.getGroups(params) as GroupsResponse
      setGroups(response.data)
      setTotalPages(response.totalPages)
      setPage(currentPage)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGroups()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadGroups(1, searchTerm)
  }

  const handlePageChange = (newPage: number) => {
    loadGroups(newPage, searchTerm)
  }

  if (loading && groups.length === 0) {
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
            <Building className="h-5 w-5" />
            Groups
          </CardTitle>
          {onCreateGroup && (
            <Button onClick={onCreateGroup}>
              Create Group
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <Input
            placeholder="Search groups by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            Search
          </Button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Group List */}
        <div className="space-y-4">
          {groups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No groups found matching your search.' : 'No groups found.'}
            </div>
          ) : (
            groups.map((group) => (
              <Card 
                key={group.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onGroupSelect?.(group)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Building className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">
                              {group.name}
                            </h3>
                            <span className={`inline-block text-xs px-2 py-1 rounded ${GROUP_TYPE_COLORS[group.type]}`}>
                              {GROUP_TYPE_LABELS[group.type]}
                            </span>
                            {!group.isActive && (
                              <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                                Inactive
                              </span>
                            )}
                          </div>
                          {group.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {group.description}
                            </p>
                          )}
                          {(() => {
                            const tags = Array.isArray(group.tags) ? group.tags : (Array.isArray(group.metadata?.tags) ? group.metadata.tags as string[] : [])
                            return tags.length > 0 && (
                              <div className="flex gap-1 mt-2">
                                {tags.slice(0, 3).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {tags.length > 3 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{tags.length - 3} more
                                  </span>
                                )}
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        {group.leader && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{group.leader.firstName} {group.leader.lastName}</span>
                          </div>
                        )}
                        
                        {group.parentGroup && (
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            <span>Parent: {group.parentGroup.name}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>
                            {group._count?.members || 0} members
                            {group.maxMembers && ` / ${group.maxMembers} max`}
                          </span>
                        </div>
                        
                        {group._count?.subgroups && group._count.subgroups > 0 && (
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4" />
                            <span>{group._count.subgroups} subgroups</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Created {formatShortDate(group.createdAt)}</span>
                        </div>
                      </div>
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
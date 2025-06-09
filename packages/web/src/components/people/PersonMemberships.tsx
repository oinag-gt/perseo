'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { membershipsApi } from '@/lib/api'
import { formatShortDate } from '@/lib/utils'
import { Users, Crown, AlertTriangle, Calendar, Building, Plus } from 'lucide-react'

interface GroupMembership {
  id: string
  personId: string
  groupId: string
  role: 'MEMBER' | 'LEADER' | 'COORDINATOR'
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  startDate: string
  endDate?: string
  notes?: string
  suspensionReason?: string
  group: {
    id: string
    name: string
    type: 'ADMINISTRATIVE' | 'ACADEMIC' | 'SOCIAL' | 'OTHER'
  }
}

interface PersonMembershipsProps {
  personId: string
  onAddMembership?: () => void
}

const ROLE_COLORS = {
  MEMBER: 'bg-blue-100 text-blue-800',
  LEADER: 'bg-purple-100 text-purple-800',
  COORDINATOR: 'bg-green-100 text-green-800'
}

const STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
  SUSPENDED: 'bg-red-100 text-red-800'
}

const GROUP_TYPE_COLORS = {
  ADMINISTRATIVE: 'bg-purple-50 text-purple-700 border-purple-200',
  ACADEMIC: 'bg-blue-50 text-blue-700 border-blue-200',
  SOCIAL: 'bg-green-50 text-green-700 border-green-200',
  OTHER: 'bg-gray-50 text-gray-700 border-gray-200'
}

export default function PersonMemberships({ personId, onAddMembership }: PersonMembershipsProps) {
  const [memberships, setMemberships] = useState<GroupMembership[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMemberships = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await membershipsApi.getPersonMemberships(personId) as GroupMembership[]
        setMemberships(response || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load memberships')
      } finally {
        setLoading(false)
      }
    }

    if (personId) {
      loadMemberships()
    }
  }, [personId])

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
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
            Group Memberships ({memberships.length})
          </CardTitle>
          {onAddMembership && (
            <Button size="sm" onClick={onAddMembership}>
              <Plus className="h-4 w-4 mr-1" />
              Add to Group
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {memberships.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No group memberships found.</p>
            {onAddMembership && (
              <Button variant="outline" size="sm" onClick={onAddMembership} className="mt-2">
                Add to Group
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {memberships.map((membership) => (
              <div
                key={membership.id}
                className={`p-4 rounded-lg border ${GROUP_TYPE_COLORS[membership.group.type]}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="h-4 w-4" />
                      <h4 className="font-medium">{membership.group.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {membership.group.type}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`inline-block text-xs px-2 py-1 rounded ${ROLE_COLORS[membership.role]}`}>
                        {membership.role}
                      </span>
                      <span className={`inline-block text-xs px-2 py-1 rounded ${STATUS_COLORS[membership.status]}`}>
                        {membership.status}
                      </span>
                      {membership.role === 'LEADER' && (
                        <Crown className="h-4 w-4 text-yellow-600" />
                      )}
                      {membership.status === 'SUSPENDED' && (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Started {formatShortDate(membership.startDate)}
                          {membership.endDate && ` - Ended ${formatShortDate(membership.endDate)}`}
                        </span>
                      </div>
                    </div>
                    
                    {membership.status === 'SUSPENDED' && membership.suspensionReason && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                        <strong>Suspension reason:</strong> {membership.suspensionReason}
                      </div>
                    )}
                    
                    {membership.notes && (
                      <div className="mt-2 p-2 bg-white border border-gray-200 rounded text-xs">
                        <strong>Notes:</strong> {membership.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
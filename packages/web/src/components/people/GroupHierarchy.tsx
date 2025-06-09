'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { groupsApi } from '@/lib/api'
import { Building, ChevronRight, ChevronDown, Users, User } from 'lucide-react'

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
  }
  _count?: {
    members: number
    subgroups: number
  }
  subgroups?: Group[]
}

interface GroupHierarchyProps {
  onGroupSelect?: (group: Group) => void
  onCreateGroup?: (parentId?: string) => void
}

const GROUP_TYPE_COLORS = {
  ADMINISTRATIVE: 'bg-purple-100 text-purple-800 border-purple-200',
  ACADEMIC: 'bg-blue-100 text-blue-800 border-blue-200',
  SOCIAL: 'bg-green-100 text-green-800 border-green-200',
  OTHER: 'bg-gray-100 text-gray-800 border-gray-200'
}

function GroupNode({ 
  group, 
  level = 0, 
  onGroupSelect, 
  onCreateGroup 
}: {
  group: Group
  level?: number
  onGroupSelect?: (group: Group) => void
  onCreateGroup?: (parentId?: string) => void
}) {
  const [isExpanded, setIsExpanded] = useState(level < 2) // Auto-expand first 2 levels
  const hasSubgroups = group.subgroups && group.subgroups.length > 0

  const marginLeft = level * 24

  return (
    <div style={{ marginLeft: `${marginLeft}px` }} className="border-l border-gray-200 pl-4">
      <div className="mb-2">
        <Card className={`cursor-pointer hover:shadow-md transition-shadow ${!group.isActive ? 'opacity-60' : ''}`}>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1" onClick={() => onGroupSelect?.(group)}>
                {hasSubgroups && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsExpanded(!isExpanded)
                    }}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>
                )}
                {!hasSubgroups && <div className="w-6"></div>}
                
                <Building className="h-4 w-4 text-muted-foreground" />
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{group.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded border ${GROUP_TYPE_COLORS[group.type]}`}>
                      {group.type}
                    </span>
                    {!group.isActive && (
                      <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-800 border border-red-200">
                        Inactive
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    {group.leader && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{group.leader.firstName} {group.leader.lastName}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>
                        {group._count?.members || 0} members
                        {group.maxMembers && ` / ${group.maxMembers}`}
                      </span>
                    </div>
                    
                    {hasSubgroups && (
                      <span>{group._count?.subgroups} subgroups</span>
                    )}
                  </div>
                  
                  {group.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {group.description}
                    </p>
                  )}
                </div>
              </div>
              
              {onCreateGroup && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onCreateGroup(group.id)
                  }}
                  className="ml-2"
                >
                  Add Subgroup
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {hasSubgroups && isExpanded && (
        <div className="ml-4 space-y-2">
          {group.subgroups?.map((subgroup) => (
            <GroupNode
              key={subgroup.id}
              group={subgroup}
              level={level + 1}
              onGroupSelect={onGroupSelect}
              onCreateGroup={onCreateGroup}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function GroupHierarchy({ onGroupSelect, onCreateGroup }: GroupHierarchyProps) {
  const [rootGroups, setRootGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadHierarchy = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load the complete hierarchy
      const response = await groupsApi.getGroupHierarchy() as { data: Group[] }
      setRootGroups(response.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load group hierarchy')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHierarchy()
  }, [])

  if (loading) {
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
            Group Hierarchy
          </CardTitle>
          {onCreateGroup && (
            <Button onClick={() => onCreateGroup()}>
              Create Root Group
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

        {rootGroups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No groups found. Create your first group to get started.</p>
            {onCreateGroup && (
              <Button onClick={() => onCreateGroup()} className="mt-4">
                Create First Group
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {rootGroups.map((group) => (
              <GroupNode
                key={group.id}
                group={group}
                level={0}
                onGroupSelect={onGroupSelect}
                onCreateGroup={onCreateGroup}
              />
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-purple-100 border border-purple-200"></div>
              <span>Administrative</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-blue-100 border border-blue-200"></div>
              <span>Academic</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-100 border border-green-200"></div>
              <span>Social</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gray-100 border border-gray-200"></div>
              <span>Other</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import GroupList from '@/components/people/GroupList'
import GroupForm from '@/components/people/GroupForm'
import GroupHierarchy from '@/components/people/GroupHierarchy'
import { groupsApi } from '@/lib/api'
import { Building, List, GitBranch, Plus } from 'lucide-react'

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
}

interface GroupFormData {
  name: string
  description?: string
  type: 'ADMINISTRATIVE' | 'ACADEMIC' | 'SOCIAL' | 'OTHER'
  leaderId?: string
  parentGroupId?: string
  maxMembers?: number
  isActive: boolean
  tags?: string[]
  metadata?: Record<string, unknown>
}

export default function GroupsPage() {
  const [activeTab, setActiveTab] = useState('list')
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [parentGroupForCreate, setParentGroupForCreate] = useState<string | undefined>()

  const handleGroupSelect = (group: Group) => {
    setSelectedGroup(group)
    setIsEditing(true)
    setIsCreating(false)
    setActiveTab('form')
  }

  const handleCreateGroup = (parentId?: string) => {
    setSelectedGroup(null)
    setParentGroupForCreate(parentId)
    setIsCreating(true)
    setIsEditing(false)
    setActiveTab('form')
  }

  const handleGroupSubmit = async (data: GroupFormData) => {
    try {
      setIsLoading(true)
      
      if (isEditing && selectedGroup) {
        await groupsApi.updateGroup(selectedGroup.id, data)
      } else {
        // Add parent group ID if creating from hierarchy
        const submitData = parentGroupForCreate 
          ? { ...data, parentGroupId: parentGroupForCreate }
          : data
        await groupsApi.createGroup(submitData)
      }
      
      // Reset form state
      setSelectedGroup(null)
      setIsCreating(false)
      setIsEditing(false)
      setParentGroupForCreate(undefined)
      setActiveTab('list')
      
      // Refresh the list/hierarchy
      window.location.reload()
    } catch (error) {
      console.error('Failed to save group:', error)
      throw error // Let the form handle the error display
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setSelectedGroup(null)
    setIsCreating(false)
    setIsEditing(false)
    setParentGroupForCreate(undefined)
    setActiveTab('list')
  }

  const getFormInitialData = () => {
    if (isEditing && selectedGroup) {
      return {
        name: selectedGroup.name,
        description: selectedGroup.description,
        type: selectedGroup.type,
        leaderId: selectedGroup.leaderId,
        parentGroupId: selectedGroup.parentGroupId,
        maxMembers: selectedGroup.maxMembers,
        isActive: selectedGroup.isActive,
        // Extract tags from metadata if they exist there
        tags: Array.isArray(selectedGroup.tags) ? selectedGroup.tags : (Array.isArray(selectedGroup.metadata?.tags) ? selectedGroup.metadata.tags : []),
        metadata: selectedGroup.metadata
      }
    }
    
    if (isCreating && parentGroupForCreate) {
      return {
        parentGroupId: parentGroupForCreate,
        type: 'OTHER' as const,
        isActive: true,
        tags: []
      }
    }
    
    return undefined
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
          <p className="text-muted-foreground">
            Manage organizational groups and hierarchies
          </p>
        </div>
        <Button onClick={() => handleCreateGroup()} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Group
        </Button>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            List View
          </TabsTrigger>
          <TabsTrigger value="hierarchy" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Hierarchy
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            {isEditing ? 'Edit Group' : 'Create Group'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <GroupList
            onGroupSelect={handleGroupSelect}
            onCreateGroup={() => handleCreateGroup()}
          />
        </TabsContent>

        <TabsContent value="hierarchy" className="space-y-4">
          <GroupHierarchy
            onGroupSelect={handleGroupSelect}
            onCreateGroup={handleCreateGroup}
          />
        </TabsContent>

        <TabsContent value="form" className="space-y-4">
          {(isCreating || isEditing) ? (
            <GroupForm
              initialData={getFormInitialData()}
              onSubmit={handleGroupSubmit}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8 text-muted-foreground">
                  <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a group to edit or create a new one.</p>
                  <Button onClick={() => handleCreateGroup()} className="mt-4">
                    Create New Group
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
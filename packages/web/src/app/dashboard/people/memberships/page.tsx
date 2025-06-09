'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import MembershipList from '@/components/people/MembershipList'
import MembershipForm from '@/components/people/MembershipForm'
import { membershipsApi } from '@/lib/api'
import { Users, List, UserPlus } from 'lucide-react'

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

interface MembershipFormData {
  personId: string
  groupId: string
  role: 'MEMBER' | 'LEADER' | 'COORDINATOR'
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  startDate: string
  endDate?: string
  notes?: string
}

export default function MembershipsPage() {
  const [activeTab, setActiveTab] = useState('list')
  const [selectedMembership, setSelectedMembership] = useState<GroupMembership | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleMembershipSelect = (membership: GroupMembership) => {
    setSelectedMembership(membership)
    setIsEditing(true)
    setIsCreating(false)
    setActiveTab('form')
  }

  const handleCreateMembership = () => {
    setSelectedMembership(null)
    setIsCreating(true)
    setIsEditing(false)
    setActiveTab('form')
  }

  const handleMembershipSubmit = async (data: MembershipFormData) => {
    try {
      setIsLoading(true)
      
      if (isEditing && selectedMembership) {
        await membershipsApi.updateMembership(selectedMembership.id, data)
      } else {
        await membershipsApi.createMembership(data)
      }
      
      // Reset form state
      setSelectedMembership(null)
      setIsCreating(false)
      setIsEditing(false)
      setActiveTab('list')
      
      // Refresh the list
      window.location.reload()
    } catch (error) {
      console.error('Failed to save membership:', error)
      throw error // Let the form handle the error display
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setSelectedMembership(null)
    setIsCreating(false)
    setIsEditing(false)
    setActiveTab('list')
  }

  const handleMembershipAction = async (membershipId: string, action: 'suspend' | 'reactivate' | 'end', data?: unknown) => {
    try {
      setIsLoading(true)
      
      switch (action) {
        case 'suspend':
          await membershipsApi.suspendMembership(membershipId, data as { reason: string })
          break
        case 'reactivate':
          await membershipsApi.reactivateMembership(membershipId)
          break
        case 'end':
          await membershipsApi.endMembership(membershipId, data as { endDate: string; reason?: string })
          break
      }
      
      // Refresh the list
      window.location.reload()
    } catch (error) {
      console.error(`Failed to ${action} membership:`, error)
    } finally {
      setIsLoading(false)
    }
  }

  const getFormInitialData = () => {
    if (isEditing && selectedMembership) {
      return {
        personId: selectedMembership.personId,
        groupId: selectedMembership.groupId,
        role: selectedMembership.role,
        status: selectedMembership.status,
        startDate: selectedMembership.startDate.split('T')[0], // Convert to YYYY-MM-DD format
        endDate: selectedMembership.endDate ? selectedMembership.endDate.split('T')[0] : undefined,
        notes: selectedMembership.notes
      }
    }
    
    return undefined
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Memberships</h1>
          <p className="text-muted-foreground">
            Manage group memberships and member roles
          </p>
        </div>
        <Button onClick={handleCreateMembership} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add Membership
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Active Memberships</p>
                <p className="text-2xl font-bold text-green-600">-</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Members</p>
                <p className="text-2xl font-bold text-blue-600">-</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Leaders</p>
                <p className="text-2xl font-bold text-purple-600">-</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-medium">Suspended</p>
                <p className="text-2xl font-bold text-red-600">-</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            All Memberships
          </TabsTrigger>
          <TabsTrigger value="form" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {isEditing ? 'Edit Membership' : 'Add Membership'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <MembershipList
            onMembershipSelect={handleMembershipSelect}
            onCreateMembership={handleCreateMembership}
          />
          
          {/* Quick Actions for Selected Membership */}
          {selectedMembership && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">
                      {selectedMembership.person.firstName} {selectedMembership.person.lastName} 
                      → {selectedMembership.group.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedMembership.role} • {selectedMembership.status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {selectedMembership.status === 'ACTIVE' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMembershipAction(selectedMembership.id, 'suspend', { reason: 'Suspended from admin panel' })}
                        disabled={isLoading}
                      >
                        Suspend
                      </Button>
                    )}
                    {selectedMembership.status === 'SUSPENDED' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMembershipAction(selectedMembership.id, 'reactivate')}
                        disabled={isLoading}
                      >
                        Reactivate
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMembershipAction(selectedMembership.id, 'end', { endDate: new Date().toISOString(), reason: 'Ended from admin panel' })}
                      disabled={isLoading}
                    >
                      End Membership
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="form" className="space-y-4">
          {(isCreating || isEditing) ? (
            <MembershipForm
              initialData={getFormInitialData()}
              onSubmit={handleMembershipSubmit}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a membership to edit or create a new one.</p>
                  <Button onClick={handleCreateMembership} className="mt-4">
                    Create New Membership
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
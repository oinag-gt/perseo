'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreateMembershipSchema } from '@perseo/shared'
import { Users, Calendar, Crown } from 'lucide-react'
import { groupsApi, peopleApi } from '@/lib/api'

interface MembershipFormData {
  personId: string
  groupId: string
  role: 'MEMBER' | 'LEADER' | 'COORDINATOR'
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  startDate: string
  endDate?: string
  notes?: string
}

interface MembershipFormProps {
  initialData?: Partial<MembershipFormData>
  onSubmit: (data: MembershipFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  preSelectedPersonId?: string
  preSelectedGroupId?: string
}

interface Person {
  id: string
  firstName: string
  lastName: string
  email: string
}

interface Group {
  id: string
  name: string
  type: 'ADMINISTRATIVE' | 'ACADEMIC' | 'SOCIAL' | 'OTHER'
  maxMembers?: number
  _count?: {
    members: number
  }
}

const ROLE_OPTIONS = [
  { value: 'MEMBER', label: 'Member', description: 'Regular group member' },
  { value: 'COORDINATOR', label: 'Coordinator', description: 'Helps coordinate group activities' },
  { value: 'LEADER', label: 'Leader', description: 'Group leader with full permissions' }
] as const

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active', description: 'Active membership' },
  { value: 'INACTIVE', label: 'Inactive', description: 'Inactive but not suspended' },
  { value: 'SUSPENDED', label: 'Suspended', description: 'Temporarily suspended' }
] as const

export default function MembershipForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  preSelectedPersonId,
  preSelectedGroupId
}: MembershipFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [people, setPeople] = useState<Person[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm<MembershipFormData>({
    resolver: zodResolver(CreateMembershipSchema),
    defaultValues: {
      role: 'MEMBER',
      status: 'ACTIVE',
      startDate: new Date().toISOString().split('T')[0],
      personId: preSelectedPersonId || '',
      groupId: preSelectedGroupId || '',
      ...initialData
    }
  })

  const watchedGroupId = watch('groupId')
  const selectedGroup = groups.find(g => g.id === watchedGroupId)

  // Load people and groups for selection
  useEffect(() => {
    const loadFormData = async () => {
      try {
        setLoadingData(true)
        
        // Load people
        const personsResponse = await peopleApi.getPersons({ limit: 100 }) as { data: Person[] }
        setPeople(personsResponse.data || [])
        
        // Load groups
        const groupsResponse = await groupsApi.getGroups({ limit: 100 }) as { data: Group[] }
        setGroups(groupsResponse.data || [])
        
      } catch (error) {
        console.error('Failed to load form data:', error)
      } finally {
        setLoadingData(false)
      }
    }

    loadFormData()
  }, [])

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        role: 'MEMBER',
        status: 'ACTIVE',
        startDate: new Date().toISOString().split('T')[0],
        personId: preSelectedPersonId || '',
        groupId: preSelectedGroupId || '',
        ...initialData
      })
    }
  }, [initialData, reset, preSelectedPersonId, preSelectedGroupId])

  const handleFormSubmit = async (data: MembershipFormData) => {
    try {
      setSubmitError(null)
      await onSubmit(data)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save membership')
    }
  }

  const isGroupAtCapacity = () => {
    if (!selectedGroup || !selectedGroup.maxMembers) return false
    return (selectedGroup._count?.members || 0) >= selectedGroup.maxMembers
  }

  if (loadingData) {
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
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {initialData?.personId ? 'Edit Membership' : 'Create New Membership'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {submitError}
            </div>
          )}

          {/* Person and Group Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4" />
              <h3 className="text-lg font-medium">Person & Group</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="personId">Person *</Label>
                <select
                  id="personId"
                  {...register('personId')}
                  disabled={!!preSelectedPersonId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select a person</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.firstName} {person.lastName} ({person.email})
                    </option>
                  ))}
                </select>
                {errors.personId && (
                  <p className="text-red-500 text-sm mt-1">{errors.personId.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="groupId">Group *</Label>
                <select
                  id="groupId"
                  {...register('groupId')}
                  disabled={!!preSelectedGroupId}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select a group</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.type}
                      {group.maxMembers && ` - ${group._count?.members || 0}/${group.maxMembers} members`})
                    </option>
                  ))}
                </select>
                {errors.groupId && (
                  <p className="text-red-500 text-sm mt-1">{errors.groupId.message}</p>
                )}
                {isGroupAtCapacity() && (
                  <p className="text-amber-600 text-sm mt-1">
                    ⚠️ This group is at capacity ({selectedGroup?.maxMembers} members)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Role and Status */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="h-4 w-4" />
              <h3 className="text-lg font-medium">Role & Status</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="role">Role *</Label>
                <select
                  id="role"
                  {...register('role')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label} - {role.description}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  {...register('status')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label} - {status.description}
                    </option>
                  ))}
                </select>
                {errors.status && (
                  <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4" />
              <h3 className="text-lg font-medium">Membership Period</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate')}
                />
                {errors.startDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register('endDate')}
                />
                {errors.endDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty for indefinite membership
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <textarea
                id="notes"
                {...register('notes')}
                placeholder="Additional notes about this membership..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              {errors.notes && (
                <p className="text-red-500 text-sm mt-1">{errors.notes.message}</p>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (initialData?.personId ? 'Update Membership' : 'Create Membership')}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
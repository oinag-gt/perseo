'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, Calendar, Crown, X } from 'lucide-react'
import { groupsApi, membershipsApi } from '@/lib/api'

interface MembershipFormData {
  personId: string
  groupId: string
  role: 'MEMBER' | 'LEADER' | 'COORDINATOR'
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  startDate: string
  endDate?: string
  notes?: string
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

interface AddMembershipModalProps {
  personId: string
  personName: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const ROLE_OPTIONS = [
  { value: 'MEMBER', label: 'Member', description: 'Regular group member' },
  { value: 'COORDINATOR', label: 'Coordinator', description: 'Helps coordinate group activities' },
  { value: 'LEADER', label: 'Leader', description: 'Group leader with full permissions' }
] as const

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active', description: 'Active membership' },
  { value: 'INACTIVE', label: 'Inactive', description: 'Inactive but not suspended' }
] as const

export default function AddMembershipModal({ 
  personId, 
  personName, 
  isOpen, 
  onClose, 
  onSuccess 
}: AddMembershipModalProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [groups, setGroups] = useState<Group[]>([])
  const [loadingGroups, setLoadingGroups] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<MembershipFormData>({
    defaultValues: {
      personId,
      role: 'MEMBER',
      status: 'ACTIVE',
      startDate: new Date().toISOString().split('T')[0],
    }
  })

  const watchedGroupId = watch('groupId')
  const selectedGroup = groups.find(g => g.id === watchedGroupId)

  // Load groups for selection
  useEffect(() => {
    const loadGroups = async () => {
      try {
        setLoadingGroups(true)
        const groupsResponse = await groupsApi.getGroups({ limit: 100 }) as { data: Group[] }
        setGroups(groupsResponse.data || [])
      } catch (error) {
        console.error('Failed to load groups:', error)
      } finally {
        setLoadingGroups(false)
      }
    }

    if (isOpen) {
      loadGroups()
    }
  }, [isOpen])

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      reset({
        personId,
        role: 'MEMBER',
        status: 'ACTIVE',
        startDate: new Date().toISOString().split('T')[0],
      })
      setSubmitError(null)
    }
  }, [isOpen, personId, reset])

  const handleFormSubmit = async (data: MembershipFormData) => {
    try {
      setIsSubmitting(true)
      setSubmitError(null)
      
      // Transform the data to handle optional fields
      const transformedData = {
        ...data,
        endDate: data.endDate || undefined,
        notes: data.notes || undefined,
      }
      
      await membershipsApi.createMembership(transformedData)
      onSuccess()
      onClose()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to add membership')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isGroupAtCapacity = () => {
    if (!selectedGroup || !selectedGroup.maxMembers) return false
    return (selectedGroup._count?.members || 0) >= selectedGroup.maxMembers
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Add {personName} to Group
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingGroups ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                {submitError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {submitError}
                  </div>
                )}

                {/* Group Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-4 w-4" />
                    <h3 className="text-lg font-medium">Group Selection</h3>
                  </div>

                  <div>
                    <Label htmlFor="groupId">Group *</Label>
                    <select
                      id="groupId"
                      {...register('groupId', { required: 'Please select a group' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        {...register('role', { required: 'Please select a role' })}
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
                        {...register('status', { required: 'Please select a status' })}
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
                        {...register('startDate', { required: 'Start date is required' })}
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
                <div className="flex gap-4 pt-6 border-t">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Adding...' : 'Add to Group'}
                  </Button>
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building, User, Users, Tag } from 'lucide-react'
import { groupsApi, peopleApi } from '@/lib/api'

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

interface GroupFormProps {
  initialData?: Partial<GroupFormData>
  onSubmit: (data: GroupFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
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
}

const GROUP_TYPES = [
  { value: 'ADMINISTRATIVE', label: 'Administrative' },
  { value: 'ACADEMIC', label: 'Academic' },
  { value: 'SOCIAL', label: 'Social' },
  { value: 'OTHER', label: 'Other' }
] as const

export default function GroupForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: GroupFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [tagInput, setTagInput] = useState('')
  const [leaders, setLeaders] = useState<Person[]>([])
  const [parentGroups, setParentGroups] = useState<Group[]>([])
  const [loadingData, setLoadingData] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<GroupFormData>({
    // Remove strict schema validation to allow optional fields
    mode: 'onBlur',
    defaultValues: {
      type: 'OTHER',
      isActive: true,
      tags: [],
      ...initialData
    }
  })

  const watchedTags = watch('tags', [])

  // Load people for leader selection and groups for parent selection
  useEffect(() => {
    const loadFormData = async () => {
      try {
        setLoadingData(true)
        
        // Load potential leaders (people)
        const personsResponse = await peopleApi.getPersons({ limit: 100 }) as { data: Person[] }
        setLeaders(personsResponse.data || [])
        
        // Load potential parent groups
        const groupsResponse = await groupsApi.getGroups({ limit: 100 }) as { data: Group[] }
        setParentGroups(groupsResponse.data || [])
        
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
        type: 'OTHER',
        isActive: true,
        tags: [],
        ...initialData
      })
    }
  }, [initialData, reset])

  const handleFormSubmit = async (data: GroupFormData) => {
    try {
      setSubmitError(null)
      
      // Transform the data to handle optional fields
      const transformedData = {
        ...data,
        // Convert empty strings to undefined for optional fields
        leaderId: data.leaderId || undefined,
        parentGroupId: data.parentGroupId || undefined,
        // Handle NaN from empty number inputs
        maxMembers: (data.maxMembers && !isNaN(data.maxMembers)) ? data.maxMembers : undefined,
        // Store tags in metadata since backend doesn't have a tags field
        metadata: {
          ...data.metadata,
          tags: data.tags || []
        },
        // Remove tags from top level as backend doesn't expect it
        tags: undefined,
      }
      
      await onSubmit(transformedData)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save group')
    }
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !watchedTags?.includes(tag)) {
      const newTags = [...(watchedTags || []), tag]
      setValue('tags', newTags)
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    const newTags = watchedTags?.filter(tag => tag !== tagToRemove) || []
    setValue('tags', newTags)
  }

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
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
          <Building className="h-5 w-5" />
          {initialData?.name ? 'Edit Group' : 'Create New Group'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {submitError}
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Building className="h-4 w-4" />
              <h3 className="text-lg font-medium">Basic Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Group Name *</Label>
                <Input
                  id="name"
                  {...register('name', { 
                    required: 'Group name is required',
                    minLength: { value: 2, message: 'Group name must be at least 2 characters' }
                  })}
                  placeholder="Enter group name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="type">Group Type *</Label>
                <select
                  id="type"
                  {...register('type', { required: 'Group type is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {GROUP_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                {...register('description')}
                placeholder="Brief description of the group"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Leadership & Hierarchy */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-4 w-4" />
              <h3 className="text-lg font-medium">Leadership & Hierarchy</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="leaderId">Group Leader</Label>
                <select
                  id="leaderId"
                  {...register('leaderId')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a leader (optional)</option>
                  {leaders.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.firstName} {person.lastName} ({person.email})
                    </option>
                  ))}
                </select>
                {errors.leaderId && (
                  <p className="text-red-500 text-sm mt-1">{errors.leaderId.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="parentGroupId">Parent Group</Label>
                <select
                  id="parentGroupId"
                  {...register('parentGroupId')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No parent group (root level)</option>
                  {parentGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
                {errors.parentGroupId && (
                  <p className="text-red-500 text-sm mt-1">{errors.parentGroupId.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-4 w-4" />
              <h3 className="text-lg font-medium">Group Settings</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxMembers">Maximum Members</Label>
                <Input
                  id="maxMembers"
                  type="number"
                  min="1"
                  {...register('maxMembers', { 
                    valueAsNumber: true,
                    validate: value => value === undefined || isNaN(value) || value > 0 || 'Maximum members must be greater than 0'
                  })}
                  placeholder="Optional member limit"
                />
                {errors.maxMembers && (
                  <p className="text-red-500 text-sm mt-1">{errors.maxMembers.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2 pt-6">
                <input
                  id="isActive"
                  type="checkbox"
                  {...register('isActive')}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <Label htmlFor="isActive">Group is active</Label>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="h-4 w-4" />
              <h3 className="text-lg font-medium">Tags</h3>
            </div>

            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="Add tags..."
                className="flex-1"
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add Tag
              </Button>
            </div>

            {watchedTags && watchedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {watchedTags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-6">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (initialData?.name ? 'Update Group' : 'Create Group')}
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
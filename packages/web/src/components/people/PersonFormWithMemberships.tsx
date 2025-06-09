'use client'

import { useState } from 'react'
import PersonForm from './PersonForm'
import PersonMemberships from './PersonMemberships'
import AddMembershipModal from './AddMembershipModal'

interface PersonFormData {
  firstName: string
  lastName: string
  email: string
  alternateEmails?: string[]
  phone: string
  alternatePhones?: string[]
  birthDate: string
  nationalId: string
  nationalIdType: 'DNI' | 'PASSPORT' | 'OTHER'
  gender?: 'M' | 'F' | 'OTHER' | 'PREFER_NOT_TO_SAY'
  address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  emergencyContact: {
    name: string
    relationship: string
    phone: string
    email?: string
  }
  preferredLanguage?: 'es' | 'en'
  communicationPreferences: {
    email: boolean
    sms: boolean
    whatsapp: boolean
  }
  photoUrl?: string
  notes?: string
  tags?: string[]
}

// interface PersonWithId extends PersonFormData {
//   id: string
//   createdAt: string
// }

interface PersonFormWithMembershipsProps {
  initialData?: Partial<PersonFormData> & { id?: string }
  onSubmit: (data: PersonFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function PersonFormWithMemberships({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading 
}: PersonFormWithMembershipsProps) {
  const [showAddMembership, setShowAddMembership] = useState(false)
  const [refreshMemberships, setRefreshMemberships] = useState(0)
  const isEditing = !!initialData?.id

  const handleAddMembership = () => {
    setShowAddMembership(true)
  }

  const handleMembershipSuccess = () => {
    // Refresh the memberships list by changing the key
    setRefreshMemberships(prev => prev + 1)
  }

  return (
    <div className="space-y-6">
      {/* Person Form */}
      <PersonForm
        initialData={initialData}
        onSubmit={onSubmit}
        onCancel={onCancel}
        isLoading={isLoading}
      />
      
      {/* Show Memberships only when editing existing person */}
      {isEditing && initialData?.id && (
        <PersonMemberships
          key={refreshMemberships}
          personId={initialData.id}
          onAddMembership={handleAddMembership}
        />
      )}

      {/* Add Membership Modal */}
      {isEditing && initialData?.id && (
        <AddMembershipModal
          personId={initialData.id}
          personName={`${initialData.firstName || ''} ${initialData.lastName || ''}`.trim()}
          isOpen={showAddMembership}
          onClose={() => setShowAddMembership(false)}
          onSuccess={handleMembershipSuccess}
        />
      )}
    </div>
  )
}
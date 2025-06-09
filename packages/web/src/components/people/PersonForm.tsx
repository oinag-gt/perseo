'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CreatePersonSchema } from '@perseo/shared'
import { User, MapPin, Heart, Settings } from 'lucide-react'

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

interface PersonFormProps {
  initialData?: Partial<PersonFormData>
  onSubmit: (data: PersonFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function PersonForm({ initialData, onSubmit, onCancel, isLoading }: PersonFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<PersonFormData>({
    resolver: zodResolver(CreatePersonSchema),
    defaultValues: {
      nationalIdType: 'DNI',
      gender: undefined,
      preferredLanguage: 'en',
      communicationPreferences: {
        email: true,
        sms: false,
        whatsapp: false,
      },
      address: {
        country: 'United States',
      },
      ...initialData,
    },
  })

  const handleFormSubmit = async (data: PersonFormData) => {
    try {
      setSubmitError(null)
      await onSubmit(data)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save person')
    }
  }

  const communicationPrefs = watch('communicationPreferences')

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {initialData ? 'Edit Person' : 'Add New Person'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {submitError}
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  {...register('firstName')}
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  {...register('lastName')}
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="birthDate">Birth Date *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  {...register('birthDate')}
                  className={errors.birthDate ? 'border-red-500' : ''}
                />
                {errors.birthDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.birthDate.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  {...register('gender')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>

          {/* National ID */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Identification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nationalId">National ID *</Label>
                <Input
                  id="nationalId"
                  {...register('nationalId')}
                  className={errors.nationalId ? 'border-red-500' : ''}
                />
                {errors.nationalId && (
                  <p className="text-red-500 text-sm mt-1">{errors.nationalId.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="nationalIdType">ID Type *</Label>
                <select
                  id="nationalIdType"
                  {...register('nationalIdType')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="DNI">DNI</option>
                  <option value="PASSPORT">Passport</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Address
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="address.street">Street Address *</Label>
                <Input
                  id="address.street"
                  {...register('address.street')}
                  className={errors.address?.street ? 'border-red-500' : ''}
                />
                {errors.address?.street && (
                  <p className="text-red-500 text-sm mt-1">{errors.address.street.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="address.city">City *</Label>
                  <Input
                    id="address.city"
                    {...register('address.city')}
                    className={errors.address?.city ? 'border-red-500' : ''}
                  />
                  {errors.address?.city && (
                    <p className="text-red-500 text-sm mt-1">{errors.address.city.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address.state">State *</Label>
                  <Input
                    id="address.state"
                    {...register('address.state')}
                    className={errors.address?.state ? 'border-red-500' : ''}
                  />
                  {errors.address?.state && (
                    <p className="text-red-500 text-sm mt-1">{errors.address.state.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address.postalCode">Postal Code *</Label>
                  <Input
                    id="address.postalCode"
                    {...register('address.postalCode')}
                    className={errors.address?.postalCode ? 'border-red-500' : ''}
                  />
                  {errors.address?.postalCode && (
                    <p className="text-red-500 text-sm mt-1">{errors.address.postalCode.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="address.country">Country *</Label>
                <Input
                  id="address.country"
                  {...register('address.country')}
                  className={errors.address?.country ? 'border-red-500' : ''}
                />
                {errors.address?.country && (
                  <p className="text-red-500 text-sm mt-1">{errors.address.country.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Emergency Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyContact.name">Contact Name *</Label>
                <Input
                  id="emergencyContact.name"
                  {...register('emergencyContact.name')}
                  className={errors.emergencyContact?.name ? 'border-red-500' : ''}
                />
                {errors.emergencyContact?.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.emergencyContact.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="emergencyContact.relationship">Relationship *</Label>
                <Input
                  id="emergencyContact.relationship"
                  {...register('emergencyContact.relationship')}
                  className={errors.emergencyContact?.relationship ? 'border-red-500' : ''}
                />
                {errors.emergencyContact?.relationship && (
                  <p className="text-red-500 text-sm mt-1">{errors.emergencyContact.relationship.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="emergencyContact.phone">Contact Phone *</Label>
                <Input
                  id="emergencyContact.phone"
                  {...register('emergencyContact.phone')}
                  className={errors.emergencyContact?.phone ? 'border-red-500' : ''}
                />
                {errors.emergencyContact?.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.emergencyContact.phone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="emergencyContact.email">Contact Email</Label>
                <Input
                  id="emergencyContact.email"
                  type="email"
                  {...register('emergencyContact.email')}
                  className={errors.emergencyContact?.email ? 'border-red-500' : ''}
                />
                {errors.emergencyContact?.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.emergencyContact.email.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Communication Preferences */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Communication Preferences
            </h3>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register('communicationPreferences.email')}
                  className="rounded border-gray-300"
                />
                <span>Email</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register('communicationPreferences.sms')}
                  className="rounded border-gray-300"
                />
                <span>SMS</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register('communicationPreferences.whatsapp')}
                  className="rounded border-gray-300"
                />
                <span>WhatsApp</span>
              </label>
            </div>
            {!communicationPrefs?.email && !communicationPrefs?.sms && !communicationPrefs?.whatsapp && (
              <p className="text-red-500 text-sm">At least one communication preference must be selected.</p>
            )}
          </div>

          {/* Optional Fields */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Information</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  {...register('notes')}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Additional notes about this person..."
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? 'Saving...' : initialData ? 'Update Person' : 'Create Person'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
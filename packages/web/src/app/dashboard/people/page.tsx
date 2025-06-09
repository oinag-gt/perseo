'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import PersonList from '@/components/people/PersonList'
import PersonFormWithMemberships from '@/components/people/PersonFormWithMemberships'
import { peopleApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Users, Building, UserPlus } from 'lucide-react'

interface Person {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  birthDate: string
  address: {
    street: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  gender?: 'M' | 'F' | 'OTHER' | 'PREFER_NOT_TO_SAY'
  tags?: string[]
  createdAt: string
}

type View = 'list' | 'create' | 'edit'

function PeoplePageContent() {
  const [currentView, setCurrentView] = useState<View>('list')
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCreatePerson = () => {
    setSelectedPerson(null)
    setCurrentView('create')
  }

  const handlePersonSelect = (person: Person) => {
    setSelectedPerson(person)
    setCurrentView('edit')
  }

  const handleFormSubmit = async (data: unknown) => {
    setLoading(true)
    try {
      if (currentView === 'create') {
        await peopleApi.createPerson(data)
      } else if (currentView === 'edit' && selectedPerson) {
        await peopleApi.updatePerson(selectedPerson.id, data)
      }
      setCurrentView('list')
    } catch (error) {
      console.error('Failed to save person:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setCurrentView('list')
    setSelectedPerson(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5" />
                People Management
              </h1>
            </div>
            {currentView !== 'list' && (
              <div className="flex items-center">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                >
                  Back to List
                </Button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {currentView === 'list' && (
            <div className="space-y-6">
              {/* Quick Navigation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-5 w-5 text-blue-600" />
                          <h3 className="font-semibold">People</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Manage individual people profiles
                        </p>
                        <Button 
                          onClick={handleCreatePerson}
                          size="sm" 
                          className="mt-3"
                        >
                          Add Person
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push('/dashboard/people/groups')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Building className="h-5 w-5 text-purple-600" />
                          <h3 className="font-semibold">Groups</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Create and manage organizational groups
                        </p>
                        <Button 
                          variant="outline"
                          size="sm" 
                          className="mt-3"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push('/dashboard/people/groups')
                          }}
                        >
                          Manage Groups
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push('/dashboard/people/memberships')}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <UserPlus className="h-5 w-5 text-green-600" />
                          <h3 className="font-semibold">Memberships</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Manage group memberships and roles
                        </p>
                        <Button 
                          variant="outline"
                          size="sm" 
                          className="mt-3"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push('/dashboard/people/memberships')
                          }}
                        >
                          Manage Memberships
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* People List */}
              <PersonList
                onPersonSelect={handlePersonSelect}
                onCreatePerson={handleCreatePerson}
              />
            </div>
          )}

          {(currentView === 'create' || currentView === 'edit') && (
            <PersonFormWithMemberships
              initialData={selectedPerson || undefined}
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
              isLoading={loading}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export default function PeoplePage() {
  return (
    <ProtectedRoute>
      <PeoplePageContent />
    </ProtectedRoute>
  )
}
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import PersonList from '@/components/people/PersonList'
import PersonForm from '@/components/people/PersonForm'
import { peopleApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users } from 'lucide-react'

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
            <PersonList
              onPersonSelect={handlePersonSelect}
              onCreatePerson={handleCreatePerson}
            />
          )}

          {(currentView === 'create' || currentView === 'edit') && (
            <PersonForm
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
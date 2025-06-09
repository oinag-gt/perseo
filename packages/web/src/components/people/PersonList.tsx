'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { peopleApi } from '@/lib/api'
import { formatShortDate, calculateAge } from '@/lib/utils'
import { User, Mail, Phone, Calendar, MapPin, Users } from 'lucide-react'

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

interface PersonListProps {
  onPersonSelect?: (person: Person) => void
  onCreatePerson?: () => void
}

interface PersonsResponse {
  data: Person[]
  totalPages: number
  currentPage: number
  totalItems: number
}

export default function PersonList({ onPersonSelect, onCreatePerson }: PersonListProps) {
  const [persons, setPersons] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const loadPersons = async (currentPage = 1, search = '') => {
    try {
      setLoading(true)
      setError(null)
      
      const params: Record<string, string | number> = {
        page: currentPage,
        limit: 20
      }
      
      if (search.trim()) {
        params.search = search.trim()
      }

      const response = await peopleApi.getPersons(params) as PersonsResponse
      setPersons(response.data)
      setTotalPages(response.totalPages)
      setPage(currentPage)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load persons')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPersons()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadPersons(1, searchTerm)
  }

  const handlePageChange = (newPage: number) => {
    loadPersons(newPage, searchTerm)
  }

  if (loading && persons.length === 0) {
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
            <Users className="h-5 w-5" />
            People
          </CardTitle>
          {onCreatePerson && (
            <Button onClick={onCreatePerson}>
              Add Person
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            Search
          </Button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Person List */}
        <div className="space-y-4">
          {persons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No persons found matching your search.' : 'No persons found.'}
            </div>
          ) : (
            persons.map((person) => (
              <Card 
                key={person.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onPersonSelect?.(person)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-semibold text-lg">
                            {person.firstName} {person.lastName}
                          </h3>
                          {person.tags && person.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {person.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                              {person.tags.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                  +{person.tags.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{person.email}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{person.phone}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Age {calculateAge(person.birthDate)} ({formatShortDate(person.birthDate)})
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {person.address.city}, {person.address.state}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1 || loading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages || loading}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
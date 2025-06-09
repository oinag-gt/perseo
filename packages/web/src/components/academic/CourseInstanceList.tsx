'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

interface CourseInstance {
  id: string;
  name: string;
  code: string;
  status: string;
  startDate: string;
  endDate: string;
  enrollmentStartDate: string;
  enrollmentEndDate: string;
  maxStudents?: number;
  location?: string;
  course?: {
    name: string;
    code: string;
  };
  enrolledStudents: number;
  availableSlots: number;
}

export function CourseInstanceList() {
  const [instances, setInstances] = useState<CourseInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInstances();
  }, []);

  const fetchInstances = async () => {
    try {
      setLoading(true);
      const response = await api.get<CourseInstance[]>('/academic/course-instances');
      setInstances(response);
    } catch (err) {
      setError('Failed to load course instances');
      console.error('Error fetching course instances:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrollment_open':
        return 'bg-green-100 text-green-800';
      case 'enrollment_closed':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="text-center py-8">Loading course instances...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={fetchInstances}>Try Again</Button>
      </div>
    );
  }

  if (instances.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground mb-4">No course instances found</div>
        <Button>Add New Course Instance</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {instances.length} course instance(s) found
        </div>
        <Button>Add New Course Instance</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {instances.map((instance) => (
          <div
            key={instance.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg">{instance.name}</h3>
                <p className="text-sm text-muted-foreground">{instance.code}</p>
                {instance.course && (
                  <p className="text-sm text-blue-600">
                    {instance.course.name} ({instance.course.code})
                  </p>
                )}
              </div>
              <Badge className={getStatusColor(instance.status)}>
                {instance.status.replace('_', ' ')}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div>
                <div className="text-muted-foreground">Start Date</div>
                <div className="font-medium">{formatDate(instance.startDate)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">End Date</div>
                <div className="font-medium">{formatDate(instance.endDate)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
              <div>
                <div className="text-muted-foreground">Enrollment Opens</div>
                <div className="font-medium">{formatDate(instance.enrollmentStartDate)}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Enrollment Closes</div>
                <div className="font-medium">{formatDate(instance.enrollmentEndDate)}</div>
              </div>
            </div>

            {instance.location && (
              <div className="text-sm mb-3">
                <div className="text-muted-foreground">Location</div>
                <div className="font-medium">{instance.location}</div>
              </div>
            )}

            <div className="flex justify-between items-center text-sm mb-4">
              <div>
                <div className="text-muted-foreground">Enrolled</div>
                <div className="font-medium">{instance.enrolledStudents}</div>
              </div>
              <div className="text-right">
                <div className="text-muted-foreground">Available Slots</div>
                <div className="font-medium">{instance.availableSlots}</div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                View Details
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Manage
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
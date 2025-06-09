'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  status: string;
  level: string;
  category: string;
  durationHours: number;
  maxStudents: number;
  price?: number;
  currency?: string;
}

export function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await api.get<Course[]>('/academic/courses');
      setCourses(response);
    } catch (err) {
      setError('Failed to load courses');
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-blue-100 text-blue-800';
      case 'intermediate':
        return 'bg-orange-100 text-orange-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading courses...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={fetchCourses}>Try Again</Button>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground mb-4">No courses found</div>
        <Button>Add New Course</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {courses.length} course(s) found
        </div>
        <Button>Add New Course</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold text-lg">{course.name}</h3>
                <p className="text-sm text-muted-foreground">{course.code}</p>
              </div>
              <div className="flex flex-col gap-1">
                <Badge className={getStatusColor(course.status)}>
                  {course.status}
                </Badge>
                <Badge className={getLevelColor(course.level)}>
                  {course.level}
                </Badge>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {course.description}
            </p>
            
            <div className="flex justify-between items-center text-sm">
              <div>
                <div className="text-muted-foreground">Category</div>
                <div className="font-medium">{course.category}</div>
              </div>
              <div className="text-right">
                <div className="text-muted-foreground">Duration</div>
                <div className="font-medium">{course.durationHours}h</div>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-sm mt-2">
              <div>
                <div className="text-muted-foreground">Max Students</div>
                <div className="font-medium">{course.maxStudents}</div>
              </div>
              {course.price && (
                <div className="text-right">
                  <div className="text-muted-foreground">Price</div>
                  <div className="font-medium">
                    {course.currency || '$'}{course.price}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" className="flex-1">
                View
              </Button>
              <Button variant="outline" size="sm" className="flex-1">
                Edit
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
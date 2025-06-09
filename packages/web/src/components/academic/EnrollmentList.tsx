'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

interface Enrollment {
  id: string;
  status: string;
  enrollmentDate: string;
  paymentStatus: string;
  amountPaid?: number;
  amountDue?: number;
  student?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  courseInstance?: {
    name: string;
    code: string;
    course?: {
      name: string;
    };
  };
  finalGrade: number | null;
  attendancePercentage: number;
}

export function EnrollmentList() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const response = await api.get<Enrollment[]>('/academic/enrollments');
      setEnrollments(response);
    } catch (err) {
      setError('Failed to load enrollments');
      console.error('Error fetching enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'waitlisted':
        return 'bg-yellow-100 text-yellow-800';
      case 'dropped':
        return 'bg-red-100 text-red-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="text-center py-8">Loading enrollments...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <Button onClick={fetchEnrollments}>Try Again</Button>
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-muted-foreground mb-4">No enrollments found</div>
        <Button>Enroll Student</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {enrollments.length} enrollment(s) found
        </div>
        <Button>New Enrollment</Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-4 py-2 text-left">Student</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Course</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Status</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Payment</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Enrolled</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Progress</th>
              <th className="border border-gray-200 px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enrollment) => (
              <tr key={enrollment.id} className="hover:bg-gray-50">
                <td className="border border-gray-200 px-4 py-2">
                  <div>
                    <div className="font-medium">
                      {enrollment.student ? 
                        `${enrollment.student.firstName} ${enrollment.student.lastName}` : 
                        'Unknown Student'
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {enrollment.student?.email}
                    </div>
                  </div>
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  <div>
                    <div className="font-medium">
                      {enrollment.courseInstance?.course?.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {enrollment.courseInstance?.name}
                    </div>
                  </div>
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  <Badge className={getStatusColor(enrollment.status)}>
                    {enrollment.status}
                  </Badge>
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  <div>
                    <Badge className={getPaymentStatusColor(enrollment.paymentStatus)}>
                      {enrollment.paymentStatus}
                    </Badge>
                    {enrollment.amountDue && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Due: ${enrollment.amountDue}
                      </div>
                    )}
                  </div>
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {formatDate(enrollment.enrollmentDate)}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  <div className="space-y-1">
                    {enrollment.finalGrade !== null && (
                      <div className="text-sm">
                        Grade: {enrollment.finalGrade.toFixed(1)}%
                      </div>
                    )}
                    <div className="text-sm text-muted-foreground">
                      Attendance: {enrollment.attendancePercentage.toFixed(1)}%
                    </div>
                  </div>
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
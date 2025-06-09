'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CourseList } from '@/components/academic/CourseList';
import { CourseInstanceList } from '@/components/academic/CourseInstanceList';
import { EnrollmentList } from '@/components/academic/EnrollmentList';

export default function AcademicPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Academic Management</h1>
        <p className="text-muted-foreground">
          Manage courses, enrollments, schedules, and academic records.
        </p>
      </div>

      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="instances">Course Instances</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Catalog</CardTitle>
              <CardDescription>
                Manage your course offerings and curriculum.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CourseList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Instances</CardTitle>
              <CardDescription>
                Manage specific instances of courses with schedules and enrollment periods.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CourseInstanceList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="enrollments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Enrollments</CardTitle>
              <CardDescription>
                Track student registrations and enrollment status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnrollmentList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Class Schedule</CardTitle>
              <CardDescription>
                View and manage class schedules, sessions, and calendar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Schedule management coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grades" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grade Management</CardTitle>
              <CardDescription>
                Record and manage student grades and assessments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Grade management coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="certificates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Certificates</CardTitle>
              <CardDescription>
                Generate and manage completion certificates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Certificate management coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
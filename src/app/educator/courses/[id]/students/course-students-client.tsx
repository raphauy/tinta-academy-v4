'use client'

import { Users, Mail } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StudentList, CourseCommunicationsHistory } from '@/components/educator'
import type { Course, Educator, EnrollmentStatus } from '@prisma/client'
import type { CommunicationHistoryItem } from '@/services/email-campaign-service'

type EnrollmentWithStudent = {
  id: string
  studentId: string
  courseId: string
  enrolledAt: Date
  status: EnrollmentStatus
  createdAt: Date
  updatedAt: Date
  courseSpentUSD: number
  courseSpentUYU: number
  student: {
    id: string
    firstName: string | null
    lastName: string | null
    identityDocument: string | null
    dateOfBirth: Date | null
    phone: string | null
    address: string | null
    city: string | null
    country: string | null
    user: {
      email: string
      name: string | null
      image: string | null
    }
  }
}

type CourseWithRelations = Course & {
  educator: Educator
}

interface CourseStudentsClientProps {
  course: CourseWithRelations
  enrollments: EnrollmentWithStudent[]
  communicationsHistory: CommunicationHistoryItem[]
}

export function CourseStudentsClient({
  course,
  enrollments,
  communicationsHistory,
}: CourseStudentsClientProps) {
  return (
    <Tabs defaultValue="students" className="space-y-6">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="students" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Estudiantes
          <span className="ml-1 px-2 py-0.5 text-xs bg-stone-200 dark:bg-stone-700 rounded-full">
            {enrollments.length}
          </span>
        </TabsTrigger>
        <TabsTrigger value="communications" className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Comunicaciones
          {communicationsHistory.length > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-stone-200 dark:bg-stone-700 rounded-full">
              {communicationsHistory.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="students">
        <StudentList course={course} enrollments={enrollments} />
      </TabsContent>

      <TabsContent value="communications">
        <CourseCommunicationsHistory history={communicationsHistory} />
      </TabsContent>
    </Tabs>
  )
}

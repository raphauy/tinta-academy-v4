import ExcelJS from 'exceljs'
import { format } from 'date-fns'
import { toZonedTime } from 'date-fns-tz'
import path from 'path'

const TIMEZONE = 'America/Montevideo'
const TEMPLATE_PATH = path.join(process.cwd(), 'templates', 'wset-crf-template.xlsx')
const DATA_START_ROW = 12

interface CrfCourse {
  examDate: Date | null
  examTime: string | null
}

interface CrfStudent {
  firstName: string | null
  lastName: string | null
  dateOfBirth: Date | null
  email: string
}

export async function generateWsetCrf(
  course: CrfCourse,
  students: CrfStudent[]
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.readFile(TEMPLATE_PATH)

  const ws = wb.getWorksheet('Candidate Registration Form')!

  // Fill exam date (G8, merged G8:H8)
  if (course.examDate) {
    const zoned = toZonedTime(course.examDate, TIMEZONE)
    ws.getCell('G8').value = format(zoned, 'd/M/yy')
  }

  // Fill exam time (I8, merged I8:K8)
  ws.getCell('I8').value = course.examTime || '19:00'

  // Fill student rows starting at row 12
  students.forEach((student, index) => {
    const row = ws.getRow(DATA_START_ROW + index)

    row.getCell('C').value = student.firstName || ''
    row.getCell('E').value = student.lastName || ''
    row.getCell('F').value = `${student.firstName || ''} ${student.lastName || ''}`.trim()
    row.getCell('G').value = student.email

    if (student.dateOfBirth) {
      const zoned = toZonedTime(student.dateOfBirth, TIMEZONE)
      row.getCell('H').value = format(zoned, 'd/M/yy')
    }
  })

  const buffer = await wb.xlsx.writeBuffer()
  return Buffer.from(buffer)
}

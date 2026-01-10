import { prisma } from '@/lib/prisma'

// ============================================
// TYPES
// ============================================

export interface DashboardTotals {
  users: number
  students: number
  educators: number
  courses: number
  coursesOnline: number
  coursesPresencial: number
  revenue: {
    thisMonth: number
    lastMonth: number
  }
  enrollments: {
    thisMonth: number
    lastMonth: number
  }
}

export interface ChartDataPoint {
  month: string
  value: number
}

export interface RecentActivity {
  id: string
  type:
    | 'enrollment'
    | 'payment'
    | 'course_completed'
    | 'new_user'
    | 'transfer_pending'
    | 'coupon_used'
  description: string
  timestamp: Date
}

export interface TopCourse {
  id: string
  title: string
  enrollments: number
  revenue: number
}

export interface DashboardMetrics {
  totals: DashboardTotals
  charts: {
    revenue: ChartDataPoint[]
    enrollments: ChartDataPoint[]
    userGrowth: ChartDataPoint[]
  }
  recentActivity: RecentActivity[]
  topCourses: TopCourse[]
}

// ============================================
// HELPERS
// ============================================

function getMonthStart(monthsAgo: number = 0): Date {
  const date = new Date()
  date.setMonth(date.getMonth() - monthsAgo)
  date.setDate(1)
  date.setHours(0, 0, 0, 0)
  return date
}

function getMonthEnd(monthsAgo: number = 0): Date {
  const date = new Date()
  date.setMonth(date.getMonth() - monthsAgo + 1)
  date.setDate(0) // Last day of previous month
  date.setHours(23, 59, 59, 999)
  return date
}

function formatMonth(date: Date): string {
  return date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })
}

// ============================================
// QUERIES
// ============================================

/**
 * Get all dashboard metrics aggregated
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [totals, revenueChart, enrollmentsChart, userGrowthChart, recentActivity, topCourses] =
    await Promise.all([
      getDashboardTotals(),
      getRevenueChart(6),
      getEnrollmentsChart(6),
      getUserGrowthChart(6),
      getRecentActivity(10),
      getTopCourses(5),
    ])

  return {
    totals,
    charts: {
      revenue: revenueChart,
      enrollments: enrollmentsChart,
      userGrowth: userGrowthChart,
    },
    recentActivity,
    topCourses,
  }
}

/**
 * Get aggregated totals for dashboard cards
 */
export async function getDashboardTotals(): Promise<DashboardTotals> {
  const thisMonthStart = getMonthStart(0)
  const lastMonthStart = getMonthStart(1)
  const lastMonthEnd = getMonthEnd(1)

  const [
    usersCount,
    studentsCount,
    educatorsCount,
    coursesCount,
    coursesOnlineCount,
    coursesPresencialCount,
    revenueThisMonth,
    revenueLastMonth,
    enrollmentsThisMonth,
    enrollmentsLastMonth,
  ] = await Promise.all([
    // Users count
    prisma.user.count({ where: { isActive: true } }),
    // Students count
    prisma.student.count(),
    // Educators count
    prisma.educator.count(),
    // Total courses count (not draft)
    prisma.course.count({ where: { status: { not: 'draft' } } }),
    // Online courses count
    prisma.course.count({ where: { modality: 'online', status: { not: 'draft' } } }),
    // Presencial courses count
    prisma.course.count({ where: { modality: 'presencial', status: { not: 'draft' } } }),
    // Revenue this month (paid orders)
    prisma.order.aggregate({
      _sum: { finalAmount: true },
      where: {
        status: 'paid',
        paidAt: { gte: thisMonthStart },
      },
    }),
    // Revenue last month
    prisma.order.aggregate({
      _sum: { finalAmount: true },
      where: {
        status: 'paid',
        paidAt: { gte: lastMonthStart, lte: lastMonthEnd },
      },
    }),
    // Enrollments this month
    prisma.enrollment.count({
      where: {
        status: 'confirmed',
        enrolledAt: { gte: thisMonthStart },
      },
    }),
    // Enrollments last month
    prisma.enrollment.count({
      where: {
        status: 'confirmed',
        enrolledAt: { gte: lastMonthStart, lte: lastMonthEnd },
      },
    }),
  ])

  return {
    users: usersCount,
    students: studentsCount,
    educators: educatorsCount,
    courses: coursesCount,
    coursesOnline: coursesOnlineCount,
    coursesPresencial: coursesPresencialCount,
    revenue: {
      thisMonth: revenueThisMonth._sum.finalAmount || 0,
      lastMonth: revenueLastMonth._sum.finalAmount || 0,
    },
    enrollments: {
      thisMonth: enrollmentsThisMonth,
      lastMonth: enrollmentsLastMonth,
    },
  }
}

/**
 * Get revenue per month for last N months
 */
export async function getRevenueChart(months: number): Promise<ChartDataPoint[]> {
  const result: ChartDataPoint[] = []

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = getMonthStart(i)
    const monthEnd = getMonthEnd(i)

    const revenue = await prisma.order.aggregate({
      _sum: { finalAmount: true },
      where: {
        status: 'paid',
        paidAt: { gte: monthStart, lte: monthEnd },
      },
    })

    result.push({
      month: formatMonth(monthStart),
      value: revenue._sum.finalAmount || 0,
    })
  }

  return result
}

/**
 * Get enrollments per month for last N months
 */
export async function getEnrollmentsChart(months: number): Promise<ChartDataPoint[]> {
  const result: ChartDataPoint[] = []

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = getMonthStart(i)
    const monthEnd = getMonthEnd(i)

    const count = await prisma.enrollment.count({
      where: {
        status: 'confirmed',
        enrolledAt: { gte: monthStart, lte: monthEnd },
      },
    })

    result.push({
      month: formatMonth(monthStart),
      value: count,
    })
  }

  return result
}

/**
 * Get cumulative user count per month for last N months
 */
export async function getUserGrowthChart(months: number): Promise<ChartDataPoint[]> {
  const result: ChartDataPoint[] = []

  for (let i = months - 1; i >= 0; i--) {
    const monthEnd = getMonthEnd(i)

    const count = await prisma.user.count({
      where: {
        createdAt: { lte: monthEnd },
        isActive: true,
      },
    })

    result.push({
      month: formatMonth(getMonthStart(i)),
      value: count,
    })
  }

  return result
}

/**
 * Get recent platform activity
 */
export async function getRecentActivity(limit: number): Promise<RecentActivity[]> {
  const activities: RecentActivity[] = []

  // Get recent enrollments
  const recentEnrollments = await prisma.enrollment.findMany({
    where: { status: 'confirmed' },
    include: {
      student: { include: { user: { select: { name: true, email: true } } } },
      course: { select: { title: true } },
    },
    orderBy: { enrolledAt: 'desc' },
    take: limit,
  })

  for (const enrollment of recentEnrollments) {
    const userName = enrollment.student.user.name || enrollment.student.user.email
    activities.push({
      id: `enrollment-${enrollment.id}`,
      type: 'enrollment',
      description: `${userName} se inscribió en ${enrollment.course.title}`,
      timestamp: enrollment.enrolledAt,
    })
  }

  // Get recent payments
  const recentPayments = await prisma.order.findMany({
    where: { status: 'paid' },
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true } },
    },
    orderBy: { paidAt: 'desc' },
    take: limit,
  })

  for (const payment of recentPayments) {
    const userName = payment.user.name || payment.user.email
    activities.push({
      id: `payment-${payment.id}`,
      type: 'payment',
      description: `${userName} pagó USD ${payment.finalAmount.toFixed(2)} por ${payment.course.title}`,
      timestamp: payment.paidAt || payment.updatedAt,
    })
  }

  // Get pending transfers
  const pendingTransfers = await prisma.order.findMany({
    where: {
      paymentMethod: 'bank_transfer',
      status: 'pending_payment',
    },
    include: {
      user: { select: { name: true, email: true } },
      course: { select: { title: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  for (const transfer of pendingTransfers) {
    const userName = transfer.user.name || transfer.user.email
    activities.push({
      id: `transfer-${transfer.id}`,
      type: 'transfer_pending',
      description: `${userName} envió transferencia pendiente de confirmar para ${transfer.course.title}`,
      timestamp: transfer.createdAt,
    })
  }

  // Get new users
  const newUsers = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  for (const user of newUsers) {
    const userName = user.name || user.email
    activities.push({
      id: `user-${user.id}`,
      type: 'new_user',
      description: `${userName} se registró en la plataforma`,
      timestamp: user.createdAt,
    })
  }

  // Get coupon usage
  const couponUsages = await prisma.order.findMany({
    where: {
      couponId: { not: null },
      status: 'paid',
    },
    include: {
      user: { select: { name: true, email: true } },
      coupon: { select: { code: true } },
    },
    orderBy: { paidAt: 'desc' },
    take: limit,
  })

  for (const usage of couponUsages) {
    const userName = usage.user.name || usage.user.email
    activities.push({
      id: `coupon-${usage.id}`,
      type: 'coupon_used',
      description: `${userName} usó el cupón ${usage.coupon?.code}`,
      timestamp: usage.paidAt || usage.updatedAt,
    })
  }

  // Sort all activities by timestamp and return top N
  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit)
}

/**
 * Get top performing courses by revenue and enrollments
 */
export async function getTopCourses(limit: number): Promise<TopCourse[]> {
  // Get courses with enrollment counts and revenue
  const courses = await prisma.course.findMany({
    where: { status: { not: 'draft' } },
    select: {
      id: true,
      title: true,
      enrolledCount: true,
      orders: {
        where: { status: 'paid' },
        select: { finalAmount: true },
      },
    },
  })

  // Calculate revenue for each course
  const coursesWithRevenue = courses.map((course) => ({
    id: course.id,
    title: course.title,
    enrollments: course.enrolledCount,
    revenue: course.orders.reduce((sum, order) => sum + order.finalAmount, 0),
  }))

  // Sort by revenue and return top N
  return coursesWithRevenue.sort((a, b) => b.revenue - a.revenue).slice(0, limit)
}

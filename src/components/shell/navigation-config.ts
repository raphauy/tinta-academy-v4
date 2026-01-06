import {
  LayoutDashboard,
  BookOpen,
  Users,
  GraduationCap,
  UserCog,
  UserX,
  ShoppingCart,
  Tag,
  Building,
  MessageSquare,
  Settings,
  PlusCircle,
  BarChart3,
  PlayCircle,
  Calendar,
  TrendingUp,
  User,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon?: LucideIcon
  children?: NavItem[]
}

// Admin navigation
export const adminNavItems: NavItem[] = [
  { label: 'Panel de Control', href: '/admin', icon: LayoutDashboard },
  { label: 'Cursos', href: '/admin/courses', icon: BookOpen },
  {
    label: 'Usuarios',
    href: '/admin/users',
    icon: Users,
    children: [
      { label: 'Estudiantes', href: '/admin/users/students', icon: GraduationCap },
      { label: 'Educadores', href: '/admin/users/educators', icon: UserCog },
      { label: 'Visitantes', href: '/admin/users/visitors', icon: UserX },
    ],
  },
  { label: 'Pedidos', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Cupones', href: '/admin/coupons', icon: Tag },
  { label: 'Datos Bancarios', href: '/admin/bank-data', icon: Building },
  { label: 'Comunicaciones', href: '/admin/communications', icon: MessageSquare },
  { label: 'Configuración', href: '/admin/settings', icon: Settings },
]

// Educator navigation
export const educatorNavItems: NavItem[] = [
  { label: 'Panel de Control', href: '/educator', icon: LayoutDashboard },
  { label: 'Mis Cursos', href: '/educator/courses', icon: BookOpen },
  { label: 'Crear Curso', href: '/educator/courses/create', icon: PlusCircle },
  { label: 'Estudiantes', href: '/educator/students', icon: Users },
  { label: 'Comunicaciones', href: '/educator/communications', icon: MessageSquare },
  { label: 'Estadísticas', href: '/educator/statistics', icon: BarChart3 },
]

// Student navigation
export const studentNavItems: NavItem[] = [
  { label: 'Mis Cursos', href: '/student', icon: BookOpen },
  { label: 'Continuar', href: '/student/continue', icon: PlayCircle },
  { label: 'Calendario', href: '/student/calendar', icon: Calendar },
  { label: 'Mi Progreso', href: '/student/progress', icon: TrendingUp },
  { label: 'Mis Datos', href: '/student/data', icon: User },
]

// Public navigation
export const publicNavItems: NavItem[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Cursos', href: '/courses' },
  { label: 'Nosotros', href: '/about' },
  { label: 'Contacto', href: '/contact' },
]

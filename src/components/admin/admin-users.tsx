'use client'

import { useState, useMemo } from 'react'
import {
  Users,
  UserPlus,
  Activity,
  Shield,
  GraduationCap,
  BookOpen,
  User as UserIcon,
  Search,
  X,
  ChevronDown,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { UserWithDetails, UserStats } from '@/services/user-service'
import { AdminMetricCard } from './admin-metric-card'
import { UserRow } from './user-row'

type SortField = 'name' | 'email' | 'role' | 'createdAt'
type SortDirection = 'asc' | 'desc'
type RoleFilter = 'all' | 'superadmin' | 'educator' | 'student' | 'user'

export interface AdminUsersProps {
  users: UserWithDetails[]
  stats: UserStats
  onEditRole?: (id: string) => void
  onDelete?: (id: string) => void
}

export function AdminUsers({
  users,
  stats,
  onEditRole,
  onDelete,
}: AdminUsersProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const filteredUsers = useMemo(() => {
    let result = [...users]

    if (roleFilter !== 'all') {
      const filterRole = roleFilter === 'user' ? null : roleFilter
      result = result.filter((user) => user.role === filterRole)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (user) =>
          (user.name?.toLowerCase() || '').includes(query) ||
          user.email.toLowerCase().includes(query)
      )
    }

    result.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '')
          break
        case 'email':
          comparison = a.email.localeCompare(b.email)
          break
        case 'role':
          comparison = (a.role || '').localeCompare(b.role || '')
          break
        case 'createdAt':
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [users, searchQuery, roleFilter, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const renderSortButton = (field: SortField, label: string) => (
    <button
      key={field}
      onClick={() => handleSort(field)}
      className={`inline-flex items-center gap-1 text-xs font-medium transition-colors ${
        sortField === field
          ? 'text-[#143F3B] dark:text-[#6B9B7A]'
          : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
      }`}
    >
      {label}
      {sortField === field && (
        <ChevronDown
          className={`w-3 h-3 transition-transform ${
            sortDirection === 'asc' ? 'rotate-180' : ''
          }`}
        />
      )}
    </button>
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mb-1">
          Usuarios
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          Gestion de todos los usuarios de la plataforma
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <AdminMetricCard
          label="Total Usuarios"
          value={stats.total.toLocaleString()}
          icon={<Users className="w-4 h-4" />}
          variant="primary"
        />
        <AdminMetricCard
          label="Nuevos este Mes"
          value={stats.newThisMonth}
          icon={<UserPlus className="w-4 h-4" />}
        />
        <AdminMetricCard
          label="Activos este Mes"
          value={stats.activeThisMonth}
          icon={<Activity className="w-4 h-4" />}
        />
        <AdminMetricCard
          label="Por Rol"
          value={`${stats.students} est.`}
          icon={<BookOpen className="w-4 h-4" />}
          subtitle={`${stats.educators} edu · ${stats.admins} admin · ${stats.regularUsers} otros`}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" />
          <Input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <Select
          value={roleFilter}
          onValueChange={(value) => setRoleFilter(value as RoleFilter)}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Filtrar por rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-stone-400" />
                Todos los roles
              </span>
            </SelectItem>
            <SelectItem value="superadmin">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-500" />
                Administradores
              </span>
            </SelectItem>
            <SelectItem value="educator">
              <span className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#143F3B]" />
                Educadores
              </span>
            </SelectItem>
            <SelectItem value="student">
              <span className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-500" />
                Estudiantes
              </span>
            </SelectItem>
            <SelectItem value="user">
              <span className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-stone-400" />
                Usuarios
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {filteredUsers.length === 0
            ? 'No se encontraron usuarios'
            : filteredUsers.length === 1
              ? '1 usuario'
              : `${filteredUsers.length} usuarios`}
          {(searchQuery || roleFilter !== 'all') &&
            users.length !== filteredUsers.length && (
              <span className="text-stone-400 dark:text-stone-500">
                {' '}de {users.length} totales
              </span>
            )}
        </p>

        <div className="flex items-center gap-4">
          <span className="text-xs text-stone-400 dark:text-stone-500">
            Ordenar por:
          </span>
          <div className="flex items-center gap-3">
            {renderSortButton('name', 'Nombre')}
            {renderSortButton('role', 'Rol')}
            {renderSortButton('createdAt', 'Registro')}
          </div>
        </div>
      </div>

      {filteredUsers.length > 0 ? (
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl overflow-hidden">
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-4 py-3 bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-700">
            <div className="col-span-4 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Usuario
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Rol
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Registro
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              Ultima actividad
            </div>
            <div className="col-span-2 text-xs font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider text-right">
              Acciones
            </div>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-700">
            {filteredUsers.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onEditRole={() => onEditRole?.(user.id)}
                onDelete={() => onDelete?.(user.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-stone-400 dark:text-stone-500" />
          </div>
          <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-1">
            Sin resultados
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 text-center max-w-sm">
            {searchQuery || roleFilter !== 'all'
              ? 'No se encontraron usuarios con los filtros aplicados'
              : 'No hay usuarios registrados en la plataforma'}
          </p>
          {(searchQuery || roleFilter !== 'all') && (
            <Button
              variant="ghost"
              className="mt-4"
              onClick={() => {
                setSearchQuery('')
                setRoleFilter('all')
              }}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

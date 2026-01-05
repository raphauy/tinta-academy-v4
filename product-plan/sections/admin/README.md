# Admin Panel

## Overview

Panel de administración para gestionar usuarios, visualizar cursos y analytics, procesar pagos y configurar cupones. Incluye dashboard con métricas completas, gráficos de tendencia y actividad reciente. Accesible solo para usuarios con rol admin/superadmin.

## User Flows

- Ver dashboard con métricas generales (usuarios, estudiantes, cursos, ingresos), gráficos de tendencia, actividad reciente y cursos destacados
- Ver lista de cursos con badge de tipo (presencial/online), seleccionar curso para ver detalles y analytics, abrir popup con emails de usuarios interesados
- Ver lista de estudiantes con cards de estadísticas, buscar/filtrar, ver y editar datos
- Ver lista de educadores con cards de estadísticas, CRUD completo (solo superadmin)
- Ver lista general de usuarios con filtro por rol, búsqueda, editar rol, eliminar
- Ver y gestionar cuentas bancarias de la academia para recibir transferencias
- Ver listado de órdenes de pago con filtros, ver detalles, marcar como pagado (transferencias manuales)
- Gestionar cupones con CRUD (código, % descuento, máx usos, fecha expiración, email específico, curso específico)

## Design Decisions

- **Dashboard completo:** Métricas de toda la plataforma, no solo del educador
- **Activity feed:** Actividad reciente para monitoreo en tiempo real
- **Observer emails:** Popup para ver emails de interesados en cada curso
- **Role management:** Admins pueden cambiar roles de usuarios
- **Order processing:** Workflow para confirmar transferencias bancarias
- **Coupon restrictions:** Soporte para cupones limitados por email o curso

## Data Used

**Entities:** DashboardMetrics, AdminCourse, CourseObserver, Student, Educator, User, BankData, Order, Coupon

**From global model:**
- All user types (Student, Educator, User)
- All financial entities (Order, Coupon, BankData)
- All course-related entities (AdminCourse, CourseObserver)
- Platform metrics (DashboardMetrics)

## Visual Reference

See `Dashboard.png`, `CourseList.png`, `StudentList.png`, `EducatorList.png`, `UserList.png`, `BankData.png`, `OrderList.png`, `CouponList.png` for target UI designs.

## Components Provided

- `AdminDashboard` — Main dashboard with all metrics
- `AdminMetricCard` — Metric display card
- `AdminMiniChart` — Trend chart
- `ActivityFeed` — Recent activity list
- `TopCoursesCard` — Best performing courses
- `AdminCourses` — Course list with analytics
- `AdminCourseCard` — Course card with metrics
- `CourseObserversModal` — Modal with interested users
- `AdminStudents` — Student management table
- `StudentRow` — Student table row
- `AdminEducators` — Educator management
- `EducatorCard` — Educator card
- `AdminUsers` — User management table
- `UserRow` — User table row
- `AdminBankData` — Bank account management
- `BankAccountCard` — Bank account card
- `AdminOrders` — Order management table
- `OrderRow` — Order table row
- `AdminCoupons` — Coupon management
- `CouponRow` — Coupon table row

## Callback Props

| Callback | Description |
|----------|-------------|
| `onViewDetails` | View entity details |
| `onViewObservers` | View course observers |
| `onEdit` | Edit entity |
| `onDelete` | Delete entity |
| `onCreate` | Create new entity |
| `onEditRole` | Change user role |
| `onMarkAsPaid` | Mark transfer as paid |
| `onViewStats` | View coupon statistics |

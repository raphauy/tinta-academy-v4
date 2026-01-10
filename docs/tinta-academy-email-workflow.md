# Flujo de Emails - Tinta Academy

Este documento describe todos los emails automáticos que envía la plataforma y en qué momento se disparan.

---

## Emails para Estudiantes

| Email | Momento de envío |
|-------|------------------|
| **Código de verificación (OTP)** | Cuando el usuario intenta iniciar sesión |
| **Confirmación de compra** | Inmediatamente después de un pago exitoso (MercadoPago o transferencia confirmada) |
| **Instrucciones de transferencia** | Cuando el usuario elige pagar por transferencia bancaria |
| **Pago rechazado** | Cuando MercadoPago rechaza el pago (fondos insuficientes, tarjeta inválida, etc.) |
| **Recordatorio datos WSET** | Si compró un curso WSET y no tiene completos sus datos personales (nombre legal, fecha nacimiento, documento) |

---

## Emails para Administradores

| Email | Momento de envío |
|-------|------------------|
| **Notificación de pago recibido** | Cuando se recibe un pago exitoso (MercadoPago o transferencia confirmada) |
| **Notificación de transferencia enviada** | Cuando un estudiante marca que realizó una transferencia (incluye comprobante si lo adjuntó) |

---

## Diagrama de Flujo - Checkout

```
CHECKOUT
    |
    +-- Pago con MercadoPago
    |       |
    |       +-- Pago exitoso
    |       |       +-- Estudiante: Confirmacion de compra
    |       |       +-- Estudiante: Recordatorio WSET (si aplica)
    |       |       +-- Admins: Notificacion de pago
    |       |
    |       +-- Pago rechazado
    |               +-- Estudiante: Pago rechazado
    |
    +-- Pago con Transferencia
            |
            +-- Estudiante: Instrucciones de transferencia
                    |
                    +-- Usuario marca "Transferencia enviada"
                            |
                            +-- Admins: Notificacion de transferencia
                                    |
                                    +-- Admin confirma en dashboard
                                            +-- Estudiante: Confirmacion de compra
                                            +-- Estudiante: Recordatorio WSET (si aplica)
                                            +-- Admins: Notificacion de pago
```

---

## Diagrama de Flujo - Login

```
Usuario ingresa email
    |
    +-- Codigo de verificacion (OTP)
            |
            +-- Usuario ingresa codigo -> Sesion iniciada
```

---

## Detalles de cada email

### 1. Código de verificación (OTP)
- **Destinatario:** Usuario que intenta iniciar sesión
- **Contenido:** Código de 6 dígitos válido por 10 minutos
- **Propósito:** Autenticación sin contraseña

### 2. Confirmación de compra
- **Destinatario:** Estudiante que realizó la compra
- **Contenido:**
  - Mensaje de bienvenida personalizado
  - Presentación de Gabi Zimmer (directora y educadora)
  - Información de contacto (WhatsApp, email, Instagram)
  - Detalles de la orden (curso, fecha, ubicación, monto)
  - Botón para acceder al curso
- **Propósito:** Dar la bienvenida y confirmar la inscripción

### 3. Instrucciones de transferencia
- **Destinatario:** Estudiante que eligió pagar por transferencia
- **Contenido:**
  - Monto a transferir
  - Datos bancarios (cuentas disponibles)
  - Pasos a seguir
  - Aviso de que el lugar está reservado por 72 horas
- **Propósito:** Facilitar el proceso de pago por transferencia

### 4. Pago rechazado
- **Destinatario:** Estudiante cuyo pago fue rechazado
- **Contenido:**
  - Motivo del rechazo
  - Sugerencias para resolver el problema
  - Botón para intentar nuevamente
- **Propósito:** Informar del problema y ofrecer soluciones

### 5. Recordatorio datos WSET
- **Destinatario:** Estudiante inscrito en curso WSET sin datos completos
- **Contenido:**
  - Explicación de por qué son necesarios los datos
  - Lista de datos requeridos
  - Botón para completar el perfil
- **Propósito:** Asegurar que el estudiante pueda ser registrado en WSET

### 6. Notificación de pago (Admin)
- **Destinatario:** Administradores (superadmin)
- **Contenido:**
  - Datos del comprador
  - Monto recibido
  - Detalles de la orden
  - Botón al dashboard
- **Propósito:** Mantener informados a los admins de las ventas

### 7. Notificación de transferencia (Admin)
- **Destinatario:** Administradores (superadmin)
- **Contenido:**
  - Datos del comprador
  - Monto a verificar
  - Referencia proporcionada por el cliente
  - Link al comprobante (si lo adjuntó)
  - Botón al dashboard de ventas
- **Propósito:** Alertar que hay una transferencia pendiente de verificar

---

## Configuración técnica

Los emails se envían a través de **Resend** desde la dirección configurada en las variables de entorno.

Los templates de email se encuentran en:
```
src/components/emails/
+-- email-header.tsx              (Componente reutilizable del header)
+-- email-theme.ts                (Colores y tipografias)
+-- otp-email.tsx
+-- order-confirmation.tsx
+-- transfer-instructions.tsx
+-- payment-rejected.tsx
+-- wset-data-reminder.tsx
+-- admin-payment-notification.tsx
+-- admin-transfer-notification.tsx
```

Para previsualizar los emails en desarrollo:
```bash
pnpm email
```

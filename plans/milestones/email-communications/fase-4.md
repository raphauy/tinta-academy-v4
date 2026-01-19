# Fase 4: Emails Programados y Cron

## Descripcion
Agregar la capacidad de programar emails para envio futuro, incluyendo el manejo de timezones y el cron job de Vercel para procesar envios programados.

## Incluye
- Componente selector de fecha/hora (`schedule-picker.tsx`)
- Manejo de timezone del navegador
- Opcion "Enviar ahora" vs "Programar para..."
- Guardado de campanas con scheduledAt
- Configuracion de Vercel Cron en `vercel.json`
- Endpoint `/api/cron/process-scheduled-emails`
- Logica de procesamiento de campanas programadas
- Cancelacion de campanas programadas pendientes
- Instalacion de `date-fns-tz`

## Secciones del PRD Relacionadas
- "2. Emails Manuales" - Paso 3 (Programacion)
- "Flujo de Procesamiento de Emails" - Envio Programado
- "Consideraciones Tecnicas" - Timezone Handling
- "Dependencias" - Configuraciones necesarias (Vercel Cron)

## Dependencias
- Fase 3 completada (envio inmediato funcionando)

## Criterios de Completitud
- [ ] date-fns-tz instalado
- [ ] DateTimePicker con selector de timezone
- [ ] Campanas se guardan con scheduledAt en UTC
- [ ] vercel.json configurado con cron cada 15 minutos
- [ ] Endpoint cron procesa campanas pendientes
- [ ] Campanas cambian status: scheduled -> sending -> sent
- [ ] Boton cancelar campana programada funciona
- [ ] Fechas se muestran en timezone local del usuario

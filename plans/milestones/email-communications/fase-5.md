# Fase 5: Tracking y Historial

## Descripcion
Implementar el webhook de Resend para tracking de eventos, el historial de campanas del educador y las estadisticas detalladas de cada envio.

## Incluye
- Endpoint webhook `/api/webhooks/resend`
- Procesamiento de eventos: delivered, opened, clicked, bounced
- Actualizacion de EmailRecipient con timestamps de tracking
- Actualizacion de contadores agregados en EmailCampaign
- Pagina historial de campanas (`/educator/communications/history`)
- Pagina detalle de campana (`/educator/communications/[campaignId]`)
- Componente estadisticas (`campaign-stats-card.tsx`)
- Componente tabla de destinatarios (`campaign-recipients-table.tsx`)
- Filtros por curso, estado, fecha

## Secciones del PRD Relacionadas
- "Flujo de Procesamiento de Emails" - Webhook de Tracking
- "2. Emails Manuales" - Historial de envios, Detalle de campana
- "API Routes" - POST /api/webhooks/resend
- "Componentes UI Principales" - campaign-stats-card, campaign-recipients-table

## Dependencias
- Fase 4 completada (envios funcionando)

## Criterios de Completitud
- [ ] Webhook de Resend configurado y funcionando
- [ ] Eventos delivered/opened/clicked/bounced procesados
- [ ] Timestamps de tracking actualizados en EmailRecipient
- [ ] Contadores agregados actualizados en EmailCampaign
- [ ] Historial de campanas con filtros funcionales
- [ ] Detalle de campana con estadisticas visuales
- [ ] Lista de destinatarios con estado individual
- [ ] Grafico de funnel o barras de estadisticas

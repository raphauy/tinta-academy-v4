# Comparativa de Servicios de Video Hosting/Streaming para Plataformas Educativas

**Fecha de investigacion:** Marzo 2026
**Contexto:** Next.js 16 + Vercel + PostgreSQL (Neon) — plataforma educativa con videos protegidos, multiples educadores, tracking de progreso de estudiantes.

---

## Resumen Ejecutivo

El mercado de video hosting como servicio (VaaS) ofrece soluciones maduras que eliminan la complejidad de manejar infraestructura propia. Para una startup educativa en etapa temprana, la eleccion se reduce principalmente a **Mux** (mejor DX y features completos, mas costoso a escala) vs **Bunny.net Stream** (la opcion mas economica con features suficientes) vs **Cloudflare Stream** (pricing simple, ideal si ya se usa Cloudflare).

Las opciones como **api.video** son solidas pero con pricing de delivery menos competitivo. **Vimeo Developer** esta orientado a creadores individuales, no a plataformas B2B. **AWS MediaConvert + CloudFront** es poderoso pero introduce alta complejidad operacional innecesaria para una startup.

La recomendacion principal es **Bunny.net Stream** para arrancar por su relacion costo/beneficio, con **Mux** como upgrade natural al crecer en volumen y necesidades de analytics avanzados.

---

## Problema a Resolver

La plataforma necesita:
1. Subir y almacenar videos de cursos (multiples educadores)
2. Servir esos videos solo a estudiantes con matricula activa (proteccion de contenido)
3. Tracking de progreso por estudiante (hasta que minuto llego)
4. Encoding automatico con calidad adaptativa (ABR/HLS)
5. Player embebible y personalizable
6. Integracion limpia con Next.js/Vercel

---

## Opciones Analizadas

### 1. Bunny.net Stream

**Descripcion:** CDN europeo que expandio a video streaming. Infraestructura propia global. Muy popular en el espacio indie/bootstrapped por su precio agresivo.

**Pricing:**

| Concepto | Costo |
|---|---|
| Almacenamiento (HDD) | $0.01/GB/mes |
| Encoding 1080p/720p | $0.05/minuto de video |
| Encoding 2160p/1440p | $0.15/minuto de video |
| Encoding 480p-240p | $0.025/minuto de video |
| Bandwidth Europa/NA | $0.01/GB entregado |
| Bandwidth Sudamerica | $0.045/GB entregado |
| Bandwidth Asia/Oceania | $0.03/GB entregado |
| DRM (MediaCage Enterprise) | $99/mes base + $0.003-0.005/licencia |
| Transcripcion automatica | $0.10/minuto de video |
| Tier gratuito | No hay |

**Ejemplo de costo para 100 videos de 45 minutos promedio (4,500 min totales, 1080p):**
- Encoding inicial: 4,500 min x $0.05 = **$225** (pago unico al subir)
- Almacenamiento: ~45 GB x $0.01 = **$0.45/mes**
- Delivery 10,000 horas de reproduccion/mes (300 GB aprox): 300 GB x $0.045 (SA) = **$13.50/mes**
- **Total recurrente estimado: ~$14/mes** para 10k horas de reproduccion

**Features:**

| Feature | Disponible |
|---|---|
| HLS adaptativo (ABR) | Si, automatico |
| DASH | Si |
| Thumbnails automaticos | Si |
| Captions/subtitulos | Si (upload manual, transcripcion AI de pago) |
| Signed URLs / Token auth | Si |
| Domain restrictions | Si |
| DRM | Si (MediaCage, addon $99/mes) |
| Player embebible | Si, personalizable con branding |
| Upload directo desde browser | Si via API REST |
| Resumable uploads | Limitado (no TUS nativo documentado) |
| Webhooks | Si |
| Analytics | Si (engagement, vistas, dispositivos) |
| SDK Node.js oficial | No oficial — API REST directa |
| Componente React/Next.js | No oficial — iframe o video.js custom |

**Fortalezas:**
- Precio mas bajo del mercado por amplio margen
- Encoding incluido en el precio base (no gratis, pero muy barato)
- CDN propio global con 130+ PoPs
- Panel de administracion simple y completo
- API REST bien documentada

**Debilidades:**
- Sin SDK oficial para JavaScript/Node — hay que usar la API directa o wrappers de comunidad
- Sin componente React/Next.js oficial
- Resumable upload no tiene implementacion TUS documentada
- DRM es costoso y complicado (addon separado)
- Soporte tecnico mas lento (no hay SLA en planes basicos)
- Encoding no es gratis (es el unico servicio que cobra por encoding)

---

### 2. Mux

**Descripcion:** Empresa de San Francisco fundada por ex-ingenieros de video de Twitch/YouTube. El servicio mas orientado a developers. Pricing por minuto de video (no por GB).

**Pricing:**

| Concepto | Costo |
|---|---|
| Encoding/Ingestion | **Gratis** |
| Almacenamiento | $0.0024/minuto/mes (a 720p equivalente) |
| Delivery (primeros 100k min/mes) | **Gratis** |
| Delivery (desde 100k min/mes) | $0.0008/minuto entregado |
| DRM | Solo en plan Enterprise (precio custom) |
| Tier gratuito | 100k min delivery + 10 videos almacenados |
| Plan Launch (prepago) | $20/mes por $100 en credito |

**Ejemplo de costo para 100 videos de 45 minutos promedio (4,500 min, despues de grabar):**
- Encoding: **$0** (gratis)
- Almacenamiento: 4,500 min x $0.0024 = **$10.80/mes**
- Delivery 10,000 horas = 600,000 minutos; (600k - 100k gratis) x $0.0008 = **$400/mes**

> **Atencion:** Mux cobra por minutos *entregados*, no por GB. A alto volumen de reproduccion, el costo puede escalar rapido. Para volumen bajo-medio (menos de 100k min/mes de reproduccion), es practicamente **gratis**.

**Features:**

| Feature | Disponible |
|---|---|
| HLS adaptativo (ABR) | Si, automatico |
| DASH | Si |
| Thumbnails automaticos | Si (con parametros de URL) |
| Captions/subtitulos | Si (auto-generados + manuales) |
| Signed URLs / JWT tokens | Si, nativo |
| Domain restrictions | Si |
| DRM | Si (Widevine + FairPlay) — solo Enterprise |
| Player embebible | Si — `<MuxPlayer />` React component oficial |
| Upload directo desde browser | Si — `MuxUploader` web component |
| Resumable uploads | Si (UpChunk, chunking de 5MB) |
| Webhooks | Si (video.asset.ready, video.upload.*, etc.) |
| Analytics (Mux Data) | Si — analytics de experiencia de usuario muy detallados |
| SDK Node.js oficial | Si — `@mux/mux-node` |
| Componente React/Next.js | Si — `@mux/mux-player-react`, guia oficial Next.js |
| Encoding time | Segundos a minutos (encoding JIT) |

**Fortalezas:**
- **Mejor DX del mercado**: SDK Node.js, React component, guias para Next.js, Remix, SvelteKit
- Encoding JIT (Just-In-Time): el video esta disponible casi inmediatamente
- `MuxPlayer` es un componente React de primera clase con analytics integrados
- Webhooks muy bien documentados (esenciales para plataformas educativas)
- Analytics de calidad de experiencia: buffering, startup time, errores — util para soporte
- 100k minutos de delivery gratis/mes es generoso para arrancar
- Mux Data incluido: tracking granular de reproduccion, muy util para progreso de estudiantes

**Debilidades:**
- DRM solo en Enterprise (costo no publicado, probablemente $500+/mes)
- A alto volumen de reproduccion, el costo puede ser 5-10x mas alto que Bunny
- Almacenamiento cobra por "minuto equivalente a 720p", modelo un poco confuso
- Sin tier permanentemente gratis para storage (solo 10 videos en free)

---

### 3. Cloudflare Stream

**Descripcion:** Parte del ecosistema Cloudflare. Pricing ultra-simple: pagas por minutos almacenados y minutos reproducidos. Sin costos de bandwidth separados.

**Pricing:**

| Concepto | Costo |
|---|---|
| Encoding | **Gratis** |
| Almacenamiento | **$5 por 1,000 minutos almacenados/mes** |
| Delivery | **$1 por 1,000 minutos reproducidos** |
| Bandwidth/Egress | **Incluido** (no se cobra separado) |
| Tier gratuito | No (minimo $5/mes aprox) |
| Bundle Starter | $5/mes (1,000 min storage + 5,000 min delivery) |

**Ejemplo de costo para 100 videos de 45 minutos promedio (4,500 min):**
- Encoding: **$0**
- Almacenamiento: 4,500 min / 1,000 x $5 = **$22.50/mes**
- Delivery 600,000 min/mes: 600,000 / 1,000 x $1 = **$600/mes**

**Features:**

| Feature | Disponible |
|---|---|
| HLS adaptativo (ABR) | Si, H.264 360p-1080p automatico |
| DASH | No documentado publicamente |
| Thumbnails automaticos | Si |
| Captions/subtitulos | Si (auto-generadas en 12 idiomas incl. Espanol) |
| Signed URLs / JWT tokens | Si, con clave RSA o via API |
| Domain restrictions (Allowed Origins) | Si |
| Restricciones por IP / pais | Si |
| DRM | **No** (no documentado como feature nativo) |
| Player embebible | Si — iframe o componente React/Angular |
| Upload directo desde browser | Si (one-time upload URLs) |
| Resumable uploads | Documentado hasta 30 GB por archivo |
| Webhooks | No claramente documentado |
| Analytics | Si (por video, por creador) |
| SDK Node.js oficial | Via Cloudflare SDK general |
| Componente React | Si — `@cloudflare/stream-react` |

**Fortalezas:**
- Pricing mas predecible del mercado (sin sorpresas de bandwidth)
- Captions auto-generadas en Espanol incluidas
- Restricciones geograficas y por IP
- Muy facil de integrar si ya se usa Cloudflare (Workers, R2, etc.)
- Infraestructura de Cloudflare: 330+ PoPs, muy baja latencia global
- Upload de hasta 30 GB por archivo

**Debilidades:**
- **Sin DRM nativo** — critico para plataformas educativas premium
- Storage mas caro que Mux y Bunny para grandes librerias
- Sin webhooks bien documentados (limitacion relevante para flujos de onboarding)
- Player menos personalizable que Mux Player
- No hay resolucion 4K (maximo 1080p)
- Sin SDK especifico para Node/Next.js mas alla del generico de Cloudflare

---

### 4. api.video

**Descripcion:** Startup francesa especializada en video API. Posicionamiento como "Stripe del video". Muy buena documentacion y SDK.

**Pricing:**

| Concepto | Costo |
|---|---|
| Encoding | **Gratis** (hasta 4K) |
| Almacenamiento | **$0.00285/minuto/mes** |
| Delivery | **$0.0017/minuto reproducido** |
| Transcripcion AI | $0.10/minuto de video |
| Custom domains | EUR60/mes por dominio adicional |
| Retention analytics (1 mes) | Gratis |
| Retention analytics (3 meses) | $12-99/mes |
| Tier gratuito (sandbox) | Videos de 30 seg, con marca de agua, se borran en 24h |

**Ejemplo de costo para 100 videos de 45 minutos promedio (4,500 min):**
- Encoding: **$0**
- Almacenamiento: 4,500 x $0.00285 = **$12.83/mes**
- Delivery 600,000 min/mes: 600,000 x $0.0017 = **$1,020/mes**

> El delivery es el mas caro de todos los servicios comparados. No competitivo para alto volumen.

**Features:**

| Feature | Disponible |
|---|---|
| HLS + MP4 | Si |
| Thumbnails automaticos | Si (imagen o timecode) |
| Captions/subtitulos | Si (auto-generadas + manual) |
| Videos privados con access tokens | Si (token por video o delegado) |
| Domain restrictions | Si |
| Restricciones geograficas | Si |
| AES encryption | Si |
| DRM | **No documentado publicamente** |
| Player embebible | Si — HTML5, React, Flutter, iOS, Android |
| Upload progresivo (resumable) | Si (progressive upload oficial) |
| Webhooks | Si |
| Analytics en tiempo real | Si (vistas, watch time, drop-off) |
| SDK Node.js oficial | Si — `@api.video/nodejs-client` |
| SDK React | Si — player React oficial |
| Video restore (papelera) | Si (90 dias) |

**Fortalezas:**
- Mejor sandbox para desarrollo (aunque con limitaciones)
- SDK JavaScript/Node.js muy completo y bien documentado
- Progressive upload oficial y bien implementado
- Analytics en tiempo real muy buenos para tracking de progreso de estudiantes
- Watermark integrado
- Video restore (recuperar videos borrados accidentalmente)
- AES encryption para proteccion adicional

**Debilidades:**
- **Delivery es el mas caro del mercado** comparado por minuto
- Sin DRM nativo (solo AES, que es menos robusto)
- Retention de analytics de pago despues del primer mes
- Custom domain cuesta EUR60/mes extra
- Empresa mas pequena, menos trayectoria que Mux o Cloudflare

---

### 5. Vimeo (Developer API / Showcase)

**Descripcion:** Vimeo es la plataforma de video mas conocida para creadores. Tiene API y opciones para desarrolladores, pero su modelo esta orientado a creadores individuales, no a plataformas SaaS.

**Pricing (planes generales):**

| Plan | Precio | Videos/ano | Ancho de banda |
|---|---|---|---|
| Free | $0 | 25 totales | 2 TB/mes |
| Starter | $12/mes | 60/asiento | 2 TB/mes |
| Standard | $25/mes | 120/asiento | 2 TB/mes |
| Advanced | $75/mes | 240/asiento | 2 TB/mes |
| Enterprise | Custom | Ilimitado | Custom |

**Limitaciones criticas para una plataforma educativa:**
- Modelo de precios por asiento/videos-por-ano no escala bien para una plataforma con muchos educadores subiendo contenido
- Control de acceso granular por estudiante es complicado de implementar
- ToS de Vimeo requiere que los videos sean accesibles en vimeo.com
- Los planes mas baratos tienen limites de videos por ano que se agotan rapidamente
- No esta disenado como una API-first platform

**Conclusion:** No recomendado para esta arquitectura.

---

### 6. AWS MediaConvert + CloudFront + S3

**Descripcion:** Solucion "DIY" usando servicios de AWS por separado. No hay un producto integrado — hay que orquestar S3 (storage), MediaConvert (encoding), CloudFront (CDN) y Lambda/API Gateway (logica de negocio).

**Pricing (estimado, muy variable por region y configuracion):**

| Componente | Costo aproximado |
|---|---|
| S3 storage | $0.023/GB/mes (US), ~$0.045/GB (SA) |
| MediaConvert (HD AVC, <=30fps) | ~$0.015/minuto output |
| CloudFront delivery | $0.085/GB (SA), $0.020/GB (Europa/NA) |
| Lambda (procesamiento) | Casi gratis a bajo volumen |

**Ejemplo para 4,500 min de video, 300 GB delivery/mes (SA):**
- Encoding: 4,500 min x ~$0.015 = **$67.50** (pago unico)
- Storage ~45 GB x $0.045 = **$2.03/mes**
- CloudFront 300 GB x $0.085 = **$25.50/mes**
- **Total recurrente: ~$28/mes** (mas barato que otros, pero con alta complejidad)

**Fortalezas:**
- Control total sobre la infraestructura
- DRM completo disponible (con AWS Elemental)
- Mejor opcion para compliance estricto
- Signed URLs de CloudFront son muy robustos

**Debilidades:**
- **Alta complejidad operacional** — no es un servicio integrado
- Hay que mantener lambdas, colas SQS, configurar MediaConvert jobs, etc.
- Sin analytics de reproduccion out-of-the-box
- Sin player propio
- El tiempo de desarrollo puede ser 4-8 semanas vs 1-2 dias con Mux/Bunny

---

## Tabla Comparativa de Precios

> Escenario base: **100 videos de 45 min** = 4,500 min almacenados. Delivery de **600,000 min/mes** (~10,000 horas, plataforma media).

| Servicio | Encoding (unico) | Storage /mes | Delivery /mes | Total /mes | Notas |
|---|---|---|---|---|---|
| **Bunny.net** | $225 (1080p) | ~$0.45 | ~$27 | **~$27.50** | Delivery SA a $0.045/GB, ~600GB |
| **Mux** | $0 | $10.80 | $400 | **$410.80** | 100k min gratis; resto a $0.0008/min |
| **Cloudflare Stream** | $0 | $22.50 | $600 | **$622.50** | $1/1,000 min delivery |
| **api.video** | $0 | $12.83 | $1,020 | **$1,032.83** | $0.0017/min delivery |
| **AWS** | $67.50 | $2.03 | $51 | **$53** | Alta complejidad operacional |
| **Vimeo Enterprise** | $0 | Incluido | Incluido | Custom | No escala bien como plataforma |

> **Aclaracion sobre Bunny:** El costo de encoding es unico (se paga al subir el video, no mensualmente). El costo mensual recurrente es muy bajo porque Bunny cobra por GB transferido (no por minuto).

> **Aclaracion sobre Mux:** A bajo volumen (menos de 100k min/mes de reproduccion), Mux es practicamente gratis. El pricing se vuelve caro cuando hay alto volumen de vistas.

---

## Tabla Comparativa de Features

| Feature | Bunny.net | Mux | CF Stream | api.video | AWS |
|---|---|---|---|---|---|
| Encoding gratis | No ($0.05/min) | **Si** | **Si** | **Si** | Parcial |
| HLS/ABR | Si | Si | Si | Si | Si (manual) |
| Thumbnails auto | Si | Si | Si | Si | Si (manual) |
| Captions auto | Pago ($0.10/min) | Si (incluido) | Si (incluido, ES) | Si (incluido) | No |
| DRM nativo | Addon $99+/mes | Enterprise only | **No** | **No** | Si (complejo) |
| Signed URLs | Si | Si (JWT) | Si (JWT) | Si (tokens) | Si (CloudFront) |
| Domain restrictions | Si | Si | Si | Si | Si |
| Player React/Next.js | No oficial | **Si (oficial)** | Si | Si | No (usar hls.js) |
| Resumable upload | Limitado | **Si (UpChunk)** | Si | **Si** | Si (S3 multipart) |
| Webhooks | Si | Si | Poco documentado | Si | Si (SNS) |
| Analytics reproduccion | Basico | **Excelente** | Medio | Bueno | Manual/DIY |
| SDK Node.js oficial | No | **Si** | Parcial | **Si** | Si (AWS SDK) |
| Guia oficial Next.js | No | **Si** | No | Parcial | No |
| Encoding time | Minutos | **Segundos** | Minutos | Minutos | Minutos-horas |
| DX (experiencia dev) | Media | **Excelente** | Buena | Buena | Compleja |

---

## Evaluacion por Criterio Clave

### Proteccion de contenido (videos solo para estudiantes inscritos)

**Implementacion tipica con Next.js:**
1. Al estudiante autenticado le das acceso al video -> tu API genera un **signed URL/token** con TTL corto (ej. 1 hora)
2. El player usa ese token para reproducir el video
3. El video nunca es accesible directamente sin el token

| Servicio | Facilidad de implementacion | Robustez |
|---|---|---|
| Mux | Muy facil (JWT, SDK oficial) | Alta |
| Cloudflare Stream | Facil (JWT con RSA key) | Alta |
| api.video | Facil (access tokens por video) | Alta |
| Bunny.net | Media (API REST, sin SDK) | Alta |
| AWS CloudFront | Media-alta (signed URLs bien documentados) | Muy Alta |

### Tracking de progreso de estudiante

Ninguno de los servicios provee tracking de progreso out-of-the-box a nivel de "el estudiante X vio hasta el minuto Y del video Z". Esto lo debes implementar en la app:

```typescript
// Patron recomendado con cualquier servicio
// 1. El player llama a tu API periodicamente con el tiempo actual
// 2. Tu guardas en PostgreSQL: {userId, lessonId, progressSeconds, completedAt}

// Ejemplo con Mux Player (el mas facil)
<MuxPlayer
  playbackId={signedPlaybackId}
  onTimeUpdate={(evt) => {
    const currentTime = evt.target.currentTime;
    debouncedSaveProgress(currentTime);
  }}
/>
```

**Ventaja de Mux:** Su analytics registra tiempos de reproduccion automaticamente, lo que podrias usar como respaldo.

### Integracion con Next.js 16

```typescript
// Mux — la integracion mas limpia
import MuxPlayer from '@mux/mux-player-react';
const token = await generateMuxSignedToken(playbackId, userId);
<MuxPlayer playbackId={playbackId} tokens={{ playback: token }} />

// Cloudflare Stream
import { Stream } from "@cloudflare/stream-react";
<Stream src={videoId} controls signedToken={token} />

// Bunny.net — requiere iframe o implementacion custom con hls.js
<iframe src={`https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?token=${token}`} />
```

---

## Recomendaciones

### Recomendacion Principal: Bunny.net Stream (startup, bajo presupuesto)

Para una plataforma educativa en etapa inicial con presupuesto ajustado, Bunny.net Stream ofrece la mejor relacion costo/beneficio:

- **Costo mensual mas bajo**: ~$27/mes para 10,000 horas de reproduccion vs $400+ de Mux
- Features suficientes: HLS/ABR, signed URLs, player embebible, analytics basicos
- Sin DRM inicial (no es critico en la etapa de startup; signed URLs con TTL corto son suficientes)
- La falta de SDK oficial se mitiga facilmente con un wrapper propio de 50-100 lineas

**Unico costo de entrada:** El encoding se paga una vez al subir cada video (~$0.05/min para 1080p). Para 100 videos de 45 min = $225 de inversion inicial.

### Recomendacion Alternativa: Mux (mejor DX, escalabilidad)

Si el presupuesto no es la restriccion principal o si se espera escalar rapidamente:

- **Mejor experiencia de desarrollo** del mercado
- `MuxPlayer` React component con analytics integrados facilita mucho el tracking de progreso
- SDK Node.js oficial, webhooks excelentes, guias para Next.js
- 100k minutos de delivery gratis/mes — para una plataforma nueva, puede ser gratis durante meses
- DRM disponible cuando se necesite (via Enterprise)
- Encoding en segundos (los videos estan disponibles casi inmediatamente)

**Cuando pasarse a Mux desde Bunny:** Cuando el volumen de reproduccion supere las 5,000 horas/mes y el ahorro en tiempo de desarrollo y analytics avanzados justifique el costo mayor.

### Recomendacion Terciaria: Cloudflare Stream

Si ya se usa Cloudflare o si se prioriza la simplicidad de pricing:

- Pricing completamente predecible sin sorpresas de bandwidth
- Captions en Espanol incluidas y auto-generadas
- Restricciones geograficas/IP out-of-the-box
- Downside: sin DRM, player menos personalizable, analytics basicos

**No recomendado:** api.video (delivery muy costoso a escala), Vimeo Developer (no disenado para plataformas multi-educador), AWS MediaConvert (complejidad operacional excesiva para una startup).

---

## Roadmap de Implementacion Recomendado

### Opcion A: Bunny.net Stream

**Semana 1 — Setup base**
1. Crear cuenta en bunny.net, crear un Video Library
2. Configurar `BUNNY_LIBRARY_ID`, `BUNNY_API_KEY`, `BUNNY_CDN_HOSTNAME` en env vars
3. Implementar `video-service.ts` con funciones: `createVideo`, `generateSignedUrl`, `deleteVideo`
4. Crear webhook endpoint (`/api/webhooks/bunny`) para eventos de encoding completado
5. Agregar campo `bunnyVideoId` al modelo `Lesson` en Prisma

**Semana 2 — Upload de educadores**
1. Implementar upload desde el dashboard del educador via presigned URL de Bunny
2. Mostrar estado de procesamiento del video (usando el webhook)
3. Guardar `videoId` en la lesson al completar el encoding

**Semana 3 — Reproduccion protegida de estudiantes**
1. Server action que verifica la matricula activa del estudiante
2. Genera signed URL con TTL de 4 horas
3. Componente de player con iframe de Bunny (o hls.js para mas control)
4. Tracking de progreso: `onTimeUpdate` -> debounce -> action -> upsert en tabla `VideoProgress`

**Semana 4 — Polish**
1. Thumbnails automaticos visibles en el curriculum del curso
2. Analytics basicos para educadores (vistas totales por video)
3. Tests de acceso para verificar que videos sin token son inaccesibles

### Opcion B: Mux

**Semana 1 — Setup base**
1. Crear cuenta en mux.com, obtener `MUX_TOKEN_ID` y `MUX_TOKEN_SECRET`
2. Instalar `@mux/mux-node` y `@mux/mux-player-react`
3. Implementar `video-service.ts` usando el SDK oficial
4. Webhook endpoint para `video.asset.ready`
5. Agregar `muxAssetId` y `muxPlaybackId` al modelo `Lesson`

**Semana 2 — Upload + reproduccion**
1. Upload directo con `@mux/mux-uploader-react` en el dashboard del educador
2. Signed playback tokens en el server action de estudiante autenticado
3. `<MuxPlayer tokens={{ playback: token }} />` en la pagina de la leccion
4. `onTimeUpdate` -> tracking de progreso en DB

**Semana 3 — Analytics y polish**
1. Dashboard de analytics para educadores via Mux Data API
2. Progreso visual del estudiante
3. Thumbnails automaticos en el curriculum

---

## Tabla de Decision Rapida

| Si tu prioridad es... | Elige |
|---|---|
| Minimo costo mensual operativo | **Bunny.net** |
| Mejor DX y velocidad de desarrollo | **Mux** |
| Pricing simple y predecible | **Cloudflare Stream** |
| SDK Node.js oficial + resumable upload | **Mux** o **api.video** |
| DRM real (Widevine/FairPlay) sin Enterprise pricing | **Bunny + MediaCage** |
| Ya estas en el ecosistema Cloudflare | **Cloudflare Stream** |
| Control total y compliance de datos | **AWS MediaConvert** |
| Startup bootstrap con bajo volumen inicial | **Mux** (free tier muy generoso) |

---

*Investigacion basada en documentacion oficial y paginas de pricing de cada servicio a marzo 2026. Los precios pueden variar; verificar siempre las paginas oficiales antes de tomar decisiones finales.*

import Link from 'next/link'
import {
  Mail,
  FileText,
  Filter,
  BarChart3,
  GitBranch,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Users,
  Lightbulb,
  ArrowRight,
  Eye,
  MousePointer,
  AlertTriangle,
} from 'lucide-react'

import { PageHeader } from '@/components/ui/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const metadata = {
  title: 'Documentación del Sistema de Comunicaciones | Tinta Academy',
}

export default function CommunicationsDocsPage() {
  return (
    <div className="container max-w-4xl py-6 space-y-8">
      <PageHeader
        title="Documentación del Sistema de Comunicaciones"
        description="Aprende a usar todas las funcionalidades para comunicarte con tus estudiantes"
      />

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Introducción</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            El sistema de comunicaciones te permite enviar emails personalizados a tus estudiantes
            de forma eficiente. Puedes crear campañas únicas o programarlas para el futuro,
            usar plantillas reutilizables con variables dinámicas, segmentar tu audiencia
            con filtros avanzados, y automatizar envíos con workflows.
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <Mail className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Campañas de Email</p>
                <p className="text-sm text-muted-foreground">Envía emails masivos o personalizados</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <FileText className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Plantillas</p>
                <p className="text-sm text-muted-foreground">Emails reutilizables con variables</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <Filter className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Filtros de Audiencia</p>
                <p className="text-sm text-muted-foreground">Segmenta estudiantes por criterios</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <GitBranch className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Workflows</p>
                <p className="text-sm text-muted-foreground">Automatiza emails por fechas de curso</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <BarChart3 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Seguimiento</p>
                <p className="text-sm text-muted-foreground">Métricas de aperturas y clicks</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campañas */}
      <Card id="campanias">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Campañas de Email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="crear">
              <AccordionTrigger>Cómo crear una campaña</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <p className="text-muted-foreground">
                  Crear una campaña es un proceso de 3 pasos simples:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>
                    <strong>Selecciona una plantilla</strong> - Elige una plantilla existente o
                    crea una nueva para tu email
                  </li>
                  <li>
                    <strong>Define los destinatarios</strong> - Selecciona quién recibirá el email
                    usando uno de los tres modos disponibles
                  </li>
                  <li>
                    <strong>Revisa y envía</strong> - Verifica los detalles y decide si enviar
                    ahora o programar para después
                  </li>
                </ol>
                <Button size="sm" asChild>
                  <Link href="/educator/communications/new">
                    <Send className="mr-2 h-4 w-4" />
                    Crear nueva campaña
                  </Link>
                </Button>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="destinatarios">
              <AccordionTrigger>Modos de selección de destinatarios</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">Curso</Badge>
                    <div>
                      <p className="font-medium">Por curso específico</p>
                      <p className="text-sm text-muted-foreground">
                        Envía a todos los estudiantes inscritos en un curso determinado.
                        Ideal para comunicaciones específicas de un curso.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">Filtro</Badge>
                    <div>
                      <p className="font-medium">Por filtro de audiencia</p>
                      <p className="text-sm text-muted-foreground">
                        Usa un filtro guardado para segmentar estudiantes por criterios
                        como tipo de curso, nivel WSET, fechas, etc.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-0.5">Manual</Badge>
                    <div>
                      <p className="font-medium">Selección personalizada</p>
                      <p className="text-sm text-muted-foreground">
                        Selecciona estudiantes individualmente de una lista.
                        Útil para comunicaciones muy específicas.
                      </p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="programacion">
              <AccordionTrigger>Envío inmediato vs programado</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Send className="h-4 w-4 text-primary" />
                      <span className="font-medium">Envío inmediato</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      El email se envía inmediatamente después de confirmar.
                      Ideal para comunicaciones urgentes.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-medium">Envío programado</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Programa el envío para una fecha y hora específica.
                      Puedes cancelar antes de que se envíe.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="estados">
              <AccordionTrigger>Estados de una campaña</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />
                      Borrador
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      La campaña está en preparación, aún no se ha enviado
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="gap-1">
                      <Clock className="h-3 w-3" />
                      Programado
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Programada para envío futuro, se puede cancelar
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="gap-1">
                      <Send className="h-3 w-3" />
                      Enviando
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      El envío está en progreso
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Enviado
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Todos los emails fueron enviados exitosamente
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="h-3 w-3" />
                      Parcial
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Algunos emails fallaron al enviarse
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="gap-1">
                      <XCircle className="h-3 w-3" />
                      Cancelado
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      La campaña fue cancelada antes de enviarse
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Plantillas */}
      <Card id="plantillas">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Plantillas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="crear-plantilla">
              <AccordionTrigger>Crear y editar plantillas</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <p className="text-muted-foreground">
                  Las plantillas te permiten crear emails reutilizables. Cada plantilla tiene:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li><strong>Nombre</strong> - Para identificarla en tu lista</li>
                  <li><strong>Asunto</strong> - El asunto del email (puede incluir variables)</li>
                  <li><strong>Contenido</strong> - El cuerpo del mensaje con formato HTML</li>
                </ul>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/educator/templates">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Ir a plantillas
                  </Link>
                </Button>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="variables">
              <AccordionTrigger>Variables disponibles</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <p className="text-muted-foreground">
                  Usa estas variables en el asunto o cuerpo de tus plantillas.
                  Se reemplazarán automáticamente con los datos reales al enviar:
                </p>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Variable</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Ejemplo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell><code className="text-xs bg-muted px-1 py-0.5 rounded">{'{{studentName}}'}</code></TableCell>
                        <TableCell>Nombre completo del estudiante</TableCell>
                        <TableCell className="text-muted-foreground">María García</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="text-xs bg-muted px-1 py-0.5 rounded">{'{{studentFirstName}}'}</code></TableCell>
                        <TableCell>Primer nombre del estudiante</TableCell>
                        <TableCell className="text-muted-foreground">María</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="text-xs bg-muted px-1 py-0.5 rounded">{'{{studentEmail}}'}</code></TableCell>
                        <TableCell>Email del estudiante</TableCell>
                        <TableCell className="text-muted-foreground">maria@example.com</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="text-xs bg-muted px-1 py-0.5 rounded">{'{{courseName}}'}</code></TableCell>
                        <TableCell>Nombre del curso</TableCell>
                        <TableCell className="text-muted-foreground">WSET Nivel 1</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="text-xs bg-muted px-1 py-0.5 rounded">{'{{courseStartDate}}'}</code></TableCell>
                        <TableCell>Fecha de inicio del curso</TableCell>
                        <TableCell className="text-muted-foreground">15 de marzo de 2025</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="text-xs bg-muted px-1 py-0.5 rounded">{'{{courseEndDate}}'}</code></TableCell>
                        <TableCell>Fecha de fin del curso</TableCell>
                        <TableCell className="text-muted-foreground">20 de marzo de 2025</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="text-xs bg-muted px-1 py-0.5 rounded">{'{{examDate}}'}</code></TableCell>
                        <TableCell>Fecha del examen</TableCell>
                        <TableCell className="text-muted-foreground">20 de marzo de 2025</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="text-xs bg-muted px-1 py-0.5 rounded">{'{{educatorName}}'}</code></TableCell>
                        <TableCell>Tu nombre como educador</TableCell>
                        <TableCell className="text-muted-foreground">Gabriela Zimmer</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell><code className="text-xs bg-muted px-1 py-0.5 rounded">{'{{courseUrl}}'}</code></TableCell>
                        <TableCell>Link a la página del curso</TableCell>
                        <TableCell className="text-muted-foreground">https://...</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    Las variables de curso (courseName, courseStartDate, etc.) solo están disponibles
                    cuando envías a estudiantes de un curso específico.
                  </AlertDescription>
                </Alert>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card id="filtros">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Audiencia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="que-son">
              <AccordionTrigger>Qué son los filtros</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <p className="text-muted-foreground">
                  Los filtros te permiten crear segmentos de audiencia basados en el
                  historial de cursos de tus estudiantes. Son útiles para enviar emails
                  a grupos específicos sin tener que seleccionar manualmente cada estudiante.
                </p>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/educator/filters">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Ir a filtros
                  </Link>
                </Button>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="constructor">
              <AccordionTrigger>Constructor de filtros</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <p className="text-muted-foreground">
                  El constructor visual te permite crear filtros complejos combinando condiciones:
                </p>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg border bg-muted/50">
                    <p className="font-medium text-sm mb-1">Grupos (OR)</p>
                    <p className="text-sm text-muted-foreground">
                      Los grupos se evalúan con lógica OR. Un estudiante coincide si cumple
                      las condiciones de <strong>al menos uno</strong> de los grupos.
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border bg-muted/50">
                    <p className="font-medium text-sm mb-1">Condiciones dentro de un grupo (AND)</p>
                    <p className="text-sm text-muted-foreground">
                      Las condiciones dentro de un grupo se evalúan con lógica AND.
                      El estudiante debe cumplir <strong>todas</strong> las condiciones del grupo.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="propiedades">
              <AccordionTrigger>Propiedades disponibles</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Tipo de curso</Badge>
                    <span className="text-muted-foreground">WSET, Taller, Cata, Curso</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Modalidad</Badge>
                    <span className="text-muted-foreground">Presencial, Online</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Nivel WSET</Badge>
                    <span className="text-muted-foreground">Nivel 1, 2, 3, etc.</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Tags</Badge>
                    <span className="text-muted-foreground">Etiquetas personalizadas de cursos</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Fecha del curso</Badge>
                    <span className="text-muted-foreground">Antes de, después de, entre fechas</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="operadores">
              <AccordionTrigger>Operadores: Cursó vs No cursó</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="p-4 rounded-lg border">
                    <p className="font-medium mb-1">Cursó</p>
                    <p className="text-sm text-muted-foreground">
                      Incluye estudiantes que tomaron cursos que cumplen la condición.
                    </p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <p className="font-medium mb-1">No cursó</p>
                    <p className="text-sm text-muted-foreground">
                      Incluye estudiantes que NO tomaron cursos que cumplen la condición.
                    </p>
                  </div>
                </div>
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Ejemplo:</strong> Para encontrar estudiantes que hicieron Nivel 1 pero no Nivel 2,
                    crea un grupo con: &quot;Cursó - Nivel WSET = 1&quot; Y &quot;No cursó - Nivel WSET = 2&quot;.
                  </AlertDescription>
                </Alert>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="publicos">
              <AccordionTrigger>Filtros públicos</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">
                  Puedes marcar un filtro como &quot;público&quot; para que otros educadores
                  de tu organización puedan usarlo. Los filtros públicos aparecen
                  disponibles para todos al crear campañas.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Seguimiento */}
      <Card id="seguimiento">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Seguimiento y Métricas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Cada campaña enviada incluye métricas detalladas para que puedas
            evaluar su efectividad:
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 rounded-lg border text-center">
              <Send className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">Enviados</p>
              <p className="text-sm text-muted-foreground">Emails enviados al servidor</p>
            </div>
            <div className="p-4 rounded-lg border text-center">
              <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="font-medium">Entregados</p>
              <p className="text-sm text-muted-foreground">Emails entregados al servidor del destinatario</p>
            </div>
            <div className="p-4 rounded-lg border text-center">
              <Eye className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="font-medium">Abiertos</p>
              <p className="text-sm text-muted-foreground">Emails que fueron abiertos</p>
            </div>
            <div className="p-4 rounded-lg border text-center">
              <MousePointer className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="font-medium">Clicks</p>
              <p className="text-sm text-muted-foreground">Clicks en links del email</p>
            </div>
            <div className="p-4 rounded-lg border text-center">
              <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <p className="font-medium">Rebotes</p>
              <p className="text-sm text-muted-foreground">Emails que no pudieron entregarse</p>
            </div>
            <div className="p-4 rounded-lg border text-center">
              <XCircle className="h-6 w-6 mx-auto mb-2 text-red-600" />
              <p className="font-medium">Fallidos</p>
              <p className="text-sm text-muted-foreground">Errores al enviar</p>
            </div>
          </div>

          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <strong>Tasas típicas:</strong> Una tasa de apertura del 20-30% y una tasa
              de clicks del 2-5% se consideran buenos valores para emails educativos.
              Tasas de rebote mayores al 5% pueden indicar problemas con tu lista de contactos.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Workflows */}
      <Card id="workflows">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Workflows Automatizados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="que-son-workflows">
              <AccordionTrigger>Qué son los workflows</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <p className="text-muted-foreground">
                  Los workflows te permiten automatizar el envío de emails a tus estudiantes
                  basándote en las fechas de tus cursos. Creas un workflow una vez y lo
                  asignas a cualquier curso para que los emails se envíen automáticamente.
                </p>
                <Button size="sm" asChild>
                  <Link href="/educator/workflows">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Ir a workflows
                  </Link>
                </Button>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="crear-workflow">
              <AccordionTrigger>Cómo crear un workflow</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <p className="text-muted-foreground">
                  Un workflow se compone de:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li><strong>Nombre y descripción</strong> - Para identificarlo fácilmente</li>
                  <li><strong>Hora de envío</strong> - A qué hora del día se enviarán los emails</li>
                  <li><strong>Pasos</strong> - Cada paso define qué email enviar y cuándo</li>
                </ul>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/educator/workflows/create">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Crear nuevo workflow
                  </Link>
                </Button>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="triggers">
              <AccordionTrigger>Tipos de triggers disponibles</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <p className="text-muted-foreground">
                  Cada paso del workflow se dispara basándose en una fecha del curso:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Inicio del curso</Badge>
                    <span className="text-muted-foreground">Relativo a la fecha de inicio</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Fin del curso</Badge>
                    <span className="text-muted-foreground">Relativo a la fecha de finalización</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Examen</Badge>
                    <span className="text-muted-foreground">Relativo a la fecha del examen</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Clase</Badge>
                    <span className="text-muted-foreground">Relativo a una clase específica (ej: Clase 1, Clase 2)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Cierre de inscripción</Badge>
                    <span className="text-muted-foreground">Relativo al deadline de inscripción</span>
                  </div>
                </div>
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Offset:</strong> Puedes configurar cada paso para ejecutarse X días antes
                    o después de la fecha. Por ejemplo: &quot;7 días antes del inicio&quot; o
                    &quot;1 día después del examen&quot;.
                  </AlertDescription>
                </Alert>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="asignar-workflow">
              <AccordionTrigger>Asignar workflows a cursos</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <p className="text-muted-foreground">
                  Una vez creado un workflow, debes asignarlo a los cursos donde quieres
                  que funcione. Puedes hacerlo desde:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>La página de edición de cada curso (sección &quot;Workflows automáticos&quot;)</li>
                </ul>
                <div className="p-4 rounded-lg border bg-muted/50">
                  <p className="font-medium text-sm mb-2">Qué sucede al asignar:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Se valida que el curso tenga las fechas necesarias para los triggers</li>
                    <li>Se calculan las fechas de envío para cada paso</li>
                    <li>Se crean ejecuciones programadas para cada estudiante inscrito</li>
                  </ol>
                </div>
                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    Los nuevos estudiantes que se inscriban después de asignar el workflow
                    también recibirán los emails programados automáticamente.
                  </AlertDescription>
                </Alert>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="estados-workflow">
              <AccordionTrigger>Estados de un workflow asignado</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Badge className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Activo
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Los emails se enviarán según lo programado
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />
                      Pausado
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Los envíos están en pausa, se pueden reanudar
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Completado
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Todos los emails fueron enviados
                    </span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="recalcular-fechas">
              <AccordionTrigger>Cambios de fechas del curso</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <p className="text-muted-foreground">
                  Si modificas las fechas de un curso que tiene workflows asignados,
                  puedes recalcular las fechas de envío de los emails pendientes.
                </p>
                <div className="p-4 rounded-lg border bg-muted/50">
                  <p className="font-medium text-sm mb-2">Al recalcular:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Las ejecuciones pendientes se ajustan a las nuevas fechas</li>
                    <li>Si la nueva fecha ya pasó, la ejecución se elimina</li>
                    <li>Los emails ya enviados no se ven afectados</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="ejemplo-workflow">
              <AccordionTrigger>Ejemplo de workflow</AccordionTrigger>
              <AccordionContent className="space-y-4">
                <p className="text-muted-foreground">
                  Un workflow típico para un curso WSET podría incluir:
                </p>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Paso</TableHead>
                        <TableHead>Plantilla</TableHead>
                        <TableHead>Cuándo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>1</TableCell>
                        <TableCell>Bienvenida al curso</TableCell>
                        <TableCell className="text-muted-foreground">7 días antes del inicio</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>2</TableCell>
                        <TableCell>Recordatorio de inicio</TableCell>
                        <TableCell className="text-muted-foreground">1 día antes del inicio</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>3</TableCell>
                        <TableCell>Material de estudio</TableCell>
                        <TableCell className="text-muted-foreground">El día de la Clase 1</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>4</TableCell>
                        <TableCell>Preparación para examen</TableCell>
                        <TableCell className="text-muted-foreground">3 días antes del examen</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>5</TableCell>
                        <TableCell>Feedback post-curso</TableCell>
                        <TableCell className="text-muted-foreground">2 días después del fin</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Accesos rápidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            <Button variant="outline" asChild className="justify-start">
              <Link href="/educator/communications/new">
                <Send className="mr-2 h-4 w-4" />
                Nueva campaña
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link href="/educator/templates">
                <FileText className="mr-2 h-4 w-4" />
                Plantillas
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link href="/educator/filters">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link href="/educator/workflows">
                <GitBranch className="mr-2 h-4 w-4" />
                Workflows
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link href="/educator/communications/history">
                <BarChart3 className="mr-2 h-4 w-4" />
                Historial
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

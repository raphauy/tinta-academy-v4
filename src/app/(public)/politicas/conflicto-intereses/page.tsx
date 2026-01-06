'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowLeft } from 'lucide-react'

export default function ConflictoIntereses() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <Link
          href="/politicas"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-4" />
          Volver a Políticas
        </Link>

        <Card className="w-full max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Política de Conflicto de Intereses – Tinta Academy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Como APP (Proveedor Aprobado de Programas), Tinta Academy tiene la obligación de identificar y asistir en la gestión o monitoreo de conflictos de interés reales, potenciales o percibidos (Conflictos de Interés) que involucren tanto al personal del APP como a los estudiantes. Esta política complementa la política de conflictos de interés del WSET y tiene como objetivo salvaguardar la integridad de las certificaciones del WSET y promover la confianza en los procesos y procedimientos tanto de WSET como de Tinta Academy.
            </p>

            <p className="text-sm font-medium">
              Esta política aplica a todo el personal y estudiantes de Tinta Academy y a cualquier individuo que actúe en nombre de Tinta Academy.
            </p>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Definición de Conflicto de Interés</h3>
              <p className="text-sm">
                Un Conflicto de Interés existe cuando un individuo tiene intereses o lealtades que podrían influir negativamente en su juicio, objetividad o lealtad hacia WSET o Tinta Academy al realizar actividades asociadas con las certificaciones del WSET.
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="ejemplos">
                <AccordionTrigger>Ejemplos de Conflictos de Interés</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 space-y-2 text-sm">
                    <li>La evaluación de candidatos por parte de un individuo que tiene un interés personal en el resultado de la evaluación para alguno o todos los individuos involucrados.</li>
                    <li>La moderación de la evaluación de candidatos por parte de un individuo que tiene un interés personal en el resultado de la evaluación para alguno o todos los individuos involucrados.</li>
                    <li>La realización de una certificación del WSET por parte de cualquier individuo empleado por un APP.</li>
                    <li>La supervisión de un examen del WSET por parte de cualquier individuo involucrado en la impartición de la formación que conduce al examen.</li>
                    <li>El entrenamiento de candidatos por parte de cualquier individuo involucrado en la evaluación de los exámenes de los candidatos.</li>
                    <li>La contratación por parte de un APP de individuos involucrados en la impartición de programas educativos o en el rol de Evaluador Interno en otro APP.</li>
                    <li>La investigación de un incidente de incumplimiento por parte de alguien que no puede actuar de manera imparcial.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="manejo">
                <AccordionTrigger>Manejo de Conflictos de Interés</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm mb-4">
                    Algunos de estos Conflictos de Interés son manejables y, por lo tanto, aceptables. Por ejemplo, si un miembro de la familia de uno de los educadores o personal de un APP de Tinta Academy toma una certificación y examen a través de Tinta Academy, o cuando un empleado de Tinta Academy, o del WSET, toma una certificación del WSET a través de Tinta Academy, podemos notificar al WSET con antelación y trabajar con ellos para implementar medidas que mantengan la integridad del examen.
                  </p>
                  <p className="text-sm">
                    Algunos Conflictos de Interés no son manejables y no son aceptables. Por ejemplo, ningún esfuerzo de mitigación supera el conflicto que se crea cuando un solo individuo actúa como educador y oficial de examen de un examen para un miembro de la familia en el que no se dispone de un supervisor externo.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Reporte de Conflictos de Interés</h3>
              <p className="text-sm">
                Cualquier miembro del personal o estudiante de Tinta Academy que sea consciente de un Conflicto de Interés debe informar a Gabi Zimmer (gabi@tinta.wine) lo antes posible. Gabi Zimmer informará al WSET sobre el posible conflicto de interés y trabajará con WSET para implementar cualquier medida de protección o mitigación necesaria para gestionar el conflicto caso por caso. Si WSET y Tinta Academy determinan que el conflicto no es manejable, Gabi Zimmer informará a cualquier personal o estudiantes de APP afectados.
              </p>
            </div>

            <p className="text-sm font-medium text-destructive">
              Por favor, ten en cuenta que la falta de declaración de un conflicto de interés puede tener consecuencias para el estudiante o Tinta Academy, ya que estamos obligados a reportar los conflictos al WSET.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

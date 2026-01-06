'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ArrowLeft } from 'lucide-react'

export default function AjusteRazonable() {
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
            <CardTitle className="text-2xl font-bold">Política de Ajustes Razonables – Tinta Academy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Tanto WSET como Tinta Academy desean hacer que las evaluaciones de WSET sean accesibles para todos los estudiantes, de modo que ninguno tenga una ventaja o desventaja basada en una discapacidad o capacidad diferente. Esta política y el proceso de ajustes razonables nos permiten a Tinta Academy trabajar contigo, nuestro estudiante, antes de una evaluación para reunir la información necesaria para enviar una solicitud a WSET y trabajar con ellos para hacer los arreglos que brinden acceso a las certificaciones de WSET.
            </p>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Definición de Ajuste Razonable</h3>
              <p className="text-sm">
                Un ajuste razonable es cualquier acomodación o arreglo que ayude a reducir el efecto de una discapacidad o dificultad conocida que desventaja sustancialmente la evaluación de un estudiante. Utilizar un ajuste razonable no afecta cómo WSET califica tu examen o tu resultado, pero WSET no puede aceptar ajustes razonables cuando la dificultad particular afecta directamente el desempeño necesario para completar los resultados de la evaluación (por ejemplo, la incapacidad de oler o saborear para un examen de Nivel 3).
              </p>
              <p className="text-sm">
                El objetivo de un ajuste razonable es darte igual acceso a una certificación de WSET, no otorgar ventajas injustas sobre otros estudiantes que realizan una evaluación sin el mismo ajuste, o afectar la confiabilidad general de los resultados de la evaluación que se explican en la Especificación del curso.
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="ejemplos">
                <AccordionTrigger>Ejemplos de Ajustes Razonables</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-6 space-y-2 text-sm">
                    <li>Cambiar los arreglos estándar de evaluación, por ejemplo, permitir a los candidatos tiempo adicional para completar la actividad de evaluación;</li>
                    <li>Adaptar los materiales de evaluación, como proporcionar materiales en formato de texto grande;</li>
                    <li>Proporcionar facilitadores de acceso durante la evaluación, como un intérprete de lenguaje de señas o un lector;</li>
                    <li>Reorganizar la sala de evaluación, como la eliminación de estímulos visuales para un candidato autista.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="proceso">
                <AccordionTrigger>Proceso de Solicitud de Ajustes Razonables</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm mb-4">
                    Tinta Academy reunirá la información necesaria de ti para enviar un formulario de Solicitud de Ajuste Razonable a WSET. WSET debe aprobar y organizar los ajustes razonables antes de que se lleve a cabo la actividad de evaluación.
                  </p>
                  <p className="text-sm mb-4">
                    Antes de completar la inscripción en Tinta Academy, brindaremos a todos los estudiantes acceso a esta política y la oportunidad de identificar cualquier necesidad especial que pueda requerir un ajuste razonable. Si un estudiante identifica una necesidad especial, Tinta Academy proporcionará el formulario de Solicitud de Ajuste Razonable lo antes posible y trabajará con el estudiante para reunir la información necesaria.
                  </p>
                  <p className="text-sm font-medium">
                    Para cualquier estudiante que busque un ajuste razonable, por favor contacta a Gabi Zimmer (gabi@tinta.wine) con:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-sm mt-2">
                    <li>Tu nombre completo;</li>
                    <li>Información de contacto;</li>
                    <li>Descripción de la necesidad especial, discapacidad o capacidad diferente que requiere un ajuste; y</li>
                    <li>Documentación de respaldo.</li>
                  </ul>
                  <p className="text-sm mt-4">
                    Debes enviar esta información al menos 20 días hábiles antes de la fecha del examen para las certificaciones de Niveles 1-3. La información que envíes se compartirá con WSET y se manejará bajo la Política de Privacidad y Protección de Datos de WSET.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <p className="text-sm font-medium">
              Tinta Academy mantendrá registros de todas las solicitudes de ajustes razonables.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

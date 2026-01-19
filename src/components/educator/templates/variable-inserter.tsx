"use client"

import { Braces } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AVAILABLE_VARIABLES } from "@/lib/email/template-variables"

interface VariableInserterProps {
  onInsert: (variable: string) => void
}

export function VariableInserter({ onInsert }: VariableInserterProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" type="button">
          <Braces className="mr-2 h-4 w-4" />
          Insertar variable
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        {AVAILABLE_VARIABLES.map((variable) => (
          <DropdownMenuItem
            key={variable.key}
            onClick={() => onInsert(`{{${variable.key}}}`)}
            className="flex flex-col items-start gap-1 py-2"
          >
            <span className="font-mono text-sm font-medium">
              {`{{${variable.key}}}`}
            </span>
            <span className="text-xs text-muted-foreground">
              {variable.description}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

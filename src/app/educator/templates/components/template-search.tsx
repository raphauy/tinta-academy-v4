"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import { Search, X, Loader2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function TemplateSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentSearch = searchParams.get("q") || ""

  const handleSearch = (value: string) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set("q", value)
      } else {
        params.delete("q")
      }
      router.push(`/educator/templates?${params.toString()}`)
    })
  }

  const handleClear = () => {
    startTransition(() => {
      router.push("/educator/templates")
    })
  }

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Buscar por nombre o contenido..."
        defaultValue={currentSearch}
        onChange={(e) => handleSearch(e.target.value)}
        className="pl-10 pr-10 bg-card"
      />
      {isPending ? (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
      ) : currentSearch ? (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  )
}

import Link from 'next/link'

export default function Politicas() {
  return (
    <div className="mt-10 px-2 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Políticas de Tinta Academy</h1>
      
      <ul className="space-y-4">
        <li>
          <Link href="/politicas/ajuste-razonable" className="text-primary hover:underline">
            Política de Ajustes Razonables
          </Link>
        </li>
        <li>
          <Link href="/politicas/conflicto-intereses" className="text-primary hover:underline">
            Política de Conflicto de Intereses
          </Link>
        </li>
      </ul>
    </div>
  )
}
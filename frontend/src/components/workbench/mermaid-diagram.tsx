import { useEffect, useRef } from "react"
import mermaid from "mermaid"

interface MermaidDiagramProps {
  diagram: string
}

export default function MermaidDiagram({ diagram }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      mermaid.contentLoaded()
    }
  }, [diagram])

  return (
    <div ref={containerRef} className="flex justify-center bg-background rounded-lg p-4 overflow-x-auto">
      <div className="mermaid">{diagram}</div>
    </div>
  )
}

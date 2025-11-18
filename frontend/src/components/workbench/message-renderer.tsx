import { useState } from "react"
import type { Message } from "@/types"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import MermaidDiagram from "@/components/workbench/mermaid-diagram"
import { Copy, Check } from "lucide-react"

function highlightCode(code: string, language: string): string {
  const keywords: Record<string, string[]> = {
    javascript: [
      "function",
      "const",
      "let",
      "var",
      "return",
      "if",
      "else",
      "for",
      "while",
      "class",
      "import",
      "export",
      "async",
      "await",
    ],
    typescript: [
      "function",
      "const",
      "let",
      "var",
      "return",
      "if",
      "else",
      "for",
      "while",
      "class",
      "interface",
      "type",
      "import",
      "export",
      "async",
      "await",
    ],
    python: ["def", "class", "return", "if", "else", "for", "while", "import", "from", "async", "await"],
    sql: ["SELECT", "FROM", "WHERE", "INSERT", "UPDATE", "DELETE", "CREATE", "ALTER", "DROP", "JOIN", "GROUP", "ORDER"],
    jsx: ["function", "const", "let", "var", "return", "if", "else", "for", "while", "class", "import", "export"],
  }

  let highlighted = code
  const langKeywords = keywords[language.toLowerCase()] || []

  // Highlight keywords
  langKeywords.forEach((keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, "g")
    highlighted = highlighted.replace(regex, `<span class="text-blue-400">${keyword}</span>`)
  })

  // Highlight strings
  highlighted = highlighted.replace(
    /(['"`])(?:(?=(\\?))\2.)*?\1/g,
    (match) => `<span class="text-green-400">${match}</span>`,
  )

  // Highlight comments
  highlighted = highlighted.replace(/\/\/.*$/gm, (match) => `<span class="text-gray-500">${match}</span>`)
  highlighted = highlighted.replace(/\/\*[\s\S]*?\*\//g, (match) => `<span class="text-gray-500">${match}</span>`)

  return highlighted
}

interface MessageRendererProps {
  message: Message
}

export default function MessageRenderer({ message }: MessageRendererProps) {
  const isUser = message.role === "user"
  const [copiedCodeBlock, setCopiedCodeBlock] = useState<string | null>(null)

  const formattedTime = new Date(message.timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCodeBlock(code)
    setTimeout(() => setCopiedCodeBlock(null), 2000)
  }

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} gap-2`}>
      <div
        className={`max-w-2xl ${
          isUser
            ? "bg-primary text-primary-foreground rounded-lg rounded-tr-none"
            : "bg-card border border-border rounded-lg rounded-tl-none"
        } p-4`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-invert max-w-none text-sm [&>*:first-child]:mt-0">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code: ({ inline, className, children, ...props }: any) => {
                  const match = /language-(\w+)/.exec(className || "")
                  const language = match ? match[1] : "text"
                  const codeString = String(children).replace(/\n$/, "")

                  // Handle mermaid diagrams
                  if (language === "mermaid") {
                    return (
                      <div className="my-4">
                        <MermaidDiagram diagram={codeString} />
                      </div>
                    )
                  }

                  return !inline ? (
                    <div className="relative group my-2 rounded-lg overflow-hidden bg-background border border-border">
                      <pre className="p-3 overflow-x-auto text-xs font-mono">
                        <code dangerouslySetInnerHTML={{ __html: highlightCode(codeString, language) }} />
                      </pre>
                      <button
                        onClick={() => handleCopyCode(codeString)}
                        className="absolute top-2 right-2 p-1.5 bg-background/80 hover:bg-background border border-border rounded transition opacity-0 group-hover:opacity-100 flex items-center gap-1.5"
                      >
                        {copiedCodeBlock === codeString ? (
                          <>
                            <Check size={14} className="text-green-500" />
                            <span className="text-xs text-foreground">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <code className="bg-background px-1.5 py-0.5 rounded text-accent font-mono text-xs">
                      {children}
                    </code>
                  )
                },
                a: ({ href, children }: any) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-all"
                  >
                    {children}
                  </a>
                ),
                table: ({ children }: any) => (
                  <div className="overflow-x-auto my-3">
                    <table className="border-collapse border border-border w-full text-xs">{children}</table>
                  </div>
                ),
                th: ({ children }: any) => (
                  <th className="border border-border bg-card/50 px-3 py-2 text-left font-semibold">{children}</th>
                ),
                td: ({ children }: any) => <td className="border border-border px-3 py-2">{children}</td>,
                ul: ({ children }: any) => <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>,
                ol: ({ children }: any) => <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>,
                h1: ({ children }: any) => <h1 className="text-xl font-bold my-3 mt-4 first:mt-0">{children}</h1>,
                h2: ({ children }: any) => <h2 className="text-lg font-bold my-2 mt-3">{children}</h2>,
                h3: ({ children }: any) => <h3 className="text-base font-bold my-2 mt-2">{children}</h3>,
                blockquote: ({ children }: any) => (
                  <blockquote className="border-l-4 border-primary/50 pl-3 my-2 italic text-muted-foreground">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        <div className={`text-xs mt-2 ${isUser ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
          {formattedTime}
        </div>
      </div>
    </div>
  )
}

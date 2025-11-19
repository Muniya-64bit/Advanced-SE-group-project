import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import mermaid from "mermaid";

// Initialize Mermaid
mermaid.initialize({
  startOnLoad: false,
  suppressErrorRendering: true,
  theme: "dark",
  securityLevel: "loose",
  themeVariables: {
    primaryColor: "#0ea5e9",
    primaryTextColor: "#fff",
    primaryBorderColor: "#0284c7",
    lineColor: "#64748b",
    secondaryColor: "#7c3aed",
    tertiaryColor: "#f59e0b",
    background: "#1e293b",
    mainBkg: "#1e293b",
    textColor: "#f1f5f9",
  },
});

const MessageRenderer = ({ content }) => {
  const mermaidRef = useRef(0);

  useEffect(() => {
    // Render all mermaid diagrams after component mounts
    const renderMermaid = async () => {
      const mermaidElements = document.querySelectorAll(".mermaid-diagram");

      for (const element of mermaidElements) {
        if (element.getAttribute("data-processed") !== "true") {
          try {
            const id = `mermaid-${mermaidRef.current++}`;
            const code = element.textContent;
            const { svg } = await mermaid.render(id, code);
            element.innerHTML = svg;
            element.setAttribute("data-processed", "true");
          } catch (error) {
            console.error("Mermaid rendering error:", error);
            element.innerHTML = `<div class="text-teal-400 text-sm p-4">Error rendering diagram</div>`;
          }
        }
      }
    };

    renderMermaid();
  }, [content]);

  // Custom component for code blocks to handle mermaid
  const CodeBlock = ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || "");
    const language = match ? match[1] : "";

    if (!inline && language === "mermaid") {
      return (
        <div className="mermaid-diagram my-4 p-4 bg-slate-900 rounded-lg overflow-x-auto">
          {String(children).replace(/\n$/, "")}
        </div>
      );
    }

    if (!inline) {
      return (
        <pre className="bg-slate-900 p-4 rounded-lg overflow-x-auto my-4">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      );
    }

    return (
      <code
        className="bg-slate-700 px-2 py-1 rounded text-sm font-mono text-teal-400"
        {...props}
      >
        {children}
      </code>
    );
  };

  return (
    <div>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: CodeBlock,
          // Custom styling for various markdown elements
          h1: ({ node, ...props }) => (
            <h1
              className="text-3xl font-bold mb-4 mt-6 text-theme-text"
              {...props}
            />
          ),
          h2: ({ node, ...props }) => (
            <h2
              className="text-2xl font-bold mb-3 mt-5 text-theme-text"
              {...props}
            />
          ),
          h3: ({ node, ...props }) => (
            <h3
              className="text-xl font-semibold mb-2 mt-4 text-theme-text"
              {...props}
            />
          ),
          h4: ({ node, ...props }) => (
            <h4
              className="text-lg font-semibold mb-2 mt-3 text-theme-text"
              {...props}
            />
          ),
          p: ({ node, ...props }) => (
            <p className="mb-4 text-theme-text" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul
              className="list-disc list-inside mb-4 space-y-2 text-theme-text"
              {...props}
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className="list-decimal list-inside mb-4 space-y-2 text-theme-text"
              {...props}
            />
          ),
          li: ({ node, ...props }) => (
            <li className="ml-4 text-theme-text" {...props} />
          ),
          strong: ({ node, ...props }) => (
            <strong className="font-bold text-theme-text" {...props} />
          ),
          em: ({ node, ...props }) => (
            <em className="italic text-gray-300" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-teal-500 pl-4 italic my-4 text-gray-400"
              {...props}
            />
          ),
          a: ({ node, ...props }) => (
            <a
              className="text-teal-400 hover:text-teal-300 underline"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="w-full border-collapse" {...props} />
            </div>
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-slate-700" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th
              className="border border-slate-600 px-4 py-2 text-left font-semibold text-theme-text"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              className="border border-slate-600 px-4 py-2 text-theme-text"
              {...props}
            />
          ),
          hr: ({ node, ...props }) => (
            <hr className="my-6 border-slate-600" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MessageRenderer;

import ReactMarkdown from "react-markdown";

export default function ChatMessages({ messages }) {
  if (!messages || messages.length === 0) {
    return (
      <div className="space-y-4 py-2">
        <div className="flex gap-2">
          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
          </div>
          <div className="bg-muted rounded-2xl px-4 py-3 text-sm text-foreground leading-relaxed">
            ¡Hola! 👋 Soy el asistente de <strong>micontrato</strong>. Te ayudo a crear tu contrato legal en minutos.
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
          </div>
          <div className="bg-muted rounded-2xl px-4 py-3 text-sm text-foreground space-y-2">
            <p className="font-medium">Así funciona:</p>
            <ol className="space-y-1.5 text-muted-foreground">
              <li>1️⃣ <strong className="text-foreground">Elegí la categoría</strong> (inmobiliario, laboral, comercial…)</li>
              <li>2️⃣ <strong className="text-foreground">Seleccioná el contrato</strong> que necesitás</li>
              <li>3️⃣ <strong className="text-foreground">Indicá tu provincia</strong> para adaptar el contrato</li>
              <li>4️⃣ <strong className="text-foreground">Completá los datos</strong> guiado paso a paso</li>
              <li>5️⃣ <strong className="text-foreground">Descargá en PDF o Word</strong> listo para firmar</li>
            </ol>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
          </div>
          <div className="bg-muted rounded-2xl px-4 py-3 text-sm text-foreground">
            ¿Tenés alguna duda? Preguntame qué contrato necesitás y te oriento. 😊
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map((msg, i) => {
        if (!msg.content) return null;
        const isUser = msg.role === "user";

        return (
          <div key={i} className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
            {!isUser && (
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                isUser
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              {isUser ? (
                <p className="text-sm leading-relaxed">{msg.content}</p>
              ) : (
                <div className="text-sm prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                      ul: ({ children }) => <ul className="my-1 ml-3 list-disc">{children}</ul>,
                      ol: ({ children }) => <ol className="my-1 ml-3 list-decimal">{children}</ol>,
                      li: ({ children }) => <li className="my-0.5 text-sm">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                      a: ({ children, ...props }) => (
                        <a {...props} className="text-accent underline" target="_blank" rel="noopener noreferrer">
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
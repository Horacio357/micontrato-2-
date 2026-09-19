import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessages from "./ChatMessages";

export default function ChatBubble() {
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const startConversation = async () => {
    if (conversation) return;
    const conv = await base44.agents.createConversation({
      agent_name: "contract_assistant",
      metadata: { name: "Asistencia" },
    });
    setConversation(conv);
    setMessages(conv.messages || []);
  };

  const handleToggle = async () => {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (!conversation) {
      await startConversation();
    }
  };

  const handleSend = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    const msg = input;
    setInput("");

    // Optimistic update
    setMessages((prev) => [...prev, { role: "user", content: msg }]);

    await base44.agents.addMessage(conversation, { role: "user", content: msg });

    // Subscribe if not already
    if (!subscribed) {
      setSubscribed(true);
      base44.agents.subscribeToConversation(conversation.id, (data) => {
        setMessages(data.messages || []);
        setSending(false);
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat bubble button - always visible */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        onClick={handleToggle}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-accent text-accent-foreground shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[520px] bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-primary text-primary-foreground rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Asistente micontrato</p>
                  <p className="text-xs opacity-70">Te ayudo a elegir tu contrato</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="hover:opacity-70 transition-opacity">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 px-4 py-4">
              <ChatMessages messages={messages} />
              {sending && messages[messages.length - 1]?.role === "user" && (
                <div className="flex gap-2 mt-3">
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>

            {/* Input */}
            <div className="px-4 pb-4 pt-2 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribí tu consulta..."
                  className="flex-1"
                  disabled={!conversation}
                />
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!input.trim() || sending || !conversation}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground shrink-0"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
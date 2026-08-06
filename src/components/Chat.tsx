import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, MessageSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import styles from "./Chat.module.css";
import { Mode } from "@/app/page";

interface Message {
  role: "user" | "model";
  content: string;
}

interface ChatProps {
  context: any;
  mode: Mode;
  language: string;
}

export default function Chat({ context, mode, language }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (context) {
      setMessages([
        {
          role: "model",
          content: `Hi! I've analyzed your ${mode === "notes" ? "notes" : "lecture"}. What questions do you have?`
        }
      ]);
    }
  }, [context, mode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !context || isLoading) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          context: context,
          history: messages,
          language
        })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessages(prev => [...prev, { role: "model", content: data.reply }]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, { role: "model", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${styles.chatContainer} glass-panel`}>
      <div className={styles.chatHeader}>
        <MessageSquare size={20} />
        <h3>AI Assistant</h3>
      </div>
      
      <div className={styles.messagesList}>
        {messages.length === 0 && (
          <div className={styles.emptyState}>
            Upload a document to start chatting!
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`${styles.messageWrapper} ${msg.role === "user" ? styles.userWrapper : styles.modelWrapper}`}>
            <div className={`${styles.avatar} ${msg.role === "user" ? styles.userAvatar : styles.modelAvatar}`}>
              {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`${styles.bubble} ${styles.markdownContent}`}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className={`${styles.messageWrapper} ${styles.modelWrapper}`}>
            <div className={`${styles.avatar} ${styles.modelAvatar}`}>
              <Bot size={16} />
            </div>
            <div className={styles.bubble}>
              <span className={styles.typingIndicator}>...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputArea}>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask me anything..."
          className={styles.input}
          disabled={!context || isLoading}
        />
        <button 
          onClick={sendMessage} 
          disabled={!context || !input.trim() || isLoading}
          className={styles.sendButton}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

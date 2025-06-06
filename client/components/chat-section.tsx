"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"

export default function ChatSection() {
  const [messages, setMessages] = useState([
    { sender: "admin", text: "Bonjour ! Comment puis-je vous aider aujourd’hui ?" },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement | null>(null)

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = input.trim()
    const messageDate = new Date().toISOString()

    setMessages((prev) => [...prev, { sender: "user", text: userMessage }])
    setInput("")
    setLoading(true)

    try {
      // Ask the Python chatbot
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: userMessage }),
      })

      if (!res.ok) {
        throw new Error("Erreur serveur")
      }

      const data = await res.json()
      const botReply = data.answer

      setMessages((prev) => [...prev, { sender: "admin", text: botReply }])

      // Save chat to MongoDB
      const saveRes = await fetch("http://localhost:5000/api/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: userMessage,
          answer: botReply,
          date: messageDate,
        }),
      })

      if (!saveRes.ok) {
        console.error("Erreur lors de la sauvegarde du chat:", await saveRes.text())
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi :", error)
      setMessages((prev) => [
        ...prev,
        { sender: "admin", text: "❌ Une erreur est survenue. Veuillez réessayer." },
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <section className="bg-muted py-10 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Chat en direct</h2>
        <div className="border rounded-lg bg-white p-4 h-96 overflow-y-auto space-y-3 shadow-sm">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`rounded-lg px-4 py-2 text-sm max-w-[70%] ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="mt-4 flex gap-2">
          <Input
            placeholder="Écrivez votre message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
          />
          <Button onClick={handleSend} disabled={loading}>
            <Send className="h-4 w-4 mr-1" />
            {loading ? "Envoi..." : "Envoyer"}
          </Button>
        </div>
      </div>
    </section>
  )
}

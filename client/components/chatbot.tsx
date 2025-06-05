import { useState } from "react";
import axios from "axios";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Bonjour, comment puis-je vous aider ?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setLoading(true);
    try {
      const res = await axios.post("/api/chatbot", { messages: newMessages });
      setMessages([...newMessages, { role: "assistant", content: res.data.reply }]);
    } catch (e) {
      setMessages([...newMessages, { role: "assistant", content: "Désolé, une erreur est survenue." }]);
    }
    setInput("");
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, width: 350, zIndex: 1000 }} className="bg-white border rounded-lg shadow-lg flex flex-col">
      <div className="p-2 border-b font-bold bg-primary text-white">Chatbot</div>
      <div className="flex-1 p-2 overflow-y-auto" style={{ maxHeight: 300 }}>
        {messages.map((msg, i) => (
          <div key={i} className={`mb-2 ${msg.role === "user" ? "text-right" : "text-left"}`}>
            <span className={msg.role === "user" ? "bg-blue-100 p-1 rounded" : "bg-gray-100 p-1 rounded"}>
              {msg.content}
            </span>
          </div>
        ))}
        {loading && <div className="text-gray-400">Le bot réfléchit...</div>}
      </div>
      <div className="p-2 border-t flex">
        <input
          className="flex-1 border rounded p-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Votre question..."
          disabled={loading}
        />
        <button className="ml-2 bg-primary text-white px-3 py-1 rounded" onClick={sendMessage} disabled={loading}>
          Envoyer
        </button>
      </div>
    </div>
  );
} 
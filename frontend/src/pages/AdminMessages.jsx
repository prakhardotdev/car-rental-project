import { useEffect, useState } from "react"

export default function AdminMessages() {
  const [messages, setMessages] = useState([])

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/contacts")
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(err => console.error(err))
  }, [])

  const markAsRead = async (id) => {
    await fetch(`http://localhost:5000/api/admin/contacts/${id}`, {
      method: "PUT",
    })

    // UI update instantly
    setMessages(prev =>
      prev.map(msg =>
        msg._id === id ? { ...msg, isRead: true } : msg
      )
    )
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">📩 Contact Messages</h1>

      {messages.length === 0 ? (
        <p>No messages</p>
      ) : (
        <div className="space-y-4">
          {messages.map(msg => (
            <div
              key={msg._id}
              className={`p-4 rounded-lg border ${
                msg.isRead ? "bg-gray-800" : "bg-yellow-900"
              }`}
            >
              <h2 className="font-semibold">{msg.name}</h2>
              <p className="text-sm text-gray-400">{msg.email}</p>
              <p className="mt-2">{msg.message}</p>

              {!msg.isRead && (
                <button
                  onClick={() => markAsRead(msg._id)}
                  className="mt-3 px-3 py-1 bg-green-600 rounded"
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
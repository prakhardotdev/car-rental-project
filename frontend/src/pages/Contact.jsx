
import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '../utils/api'

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post('/contact', form) // backend API
      toast.success('Message sent successfully 🚀')
      setForm({ name: '', email: '', message: '' })
    } catch (err) {
      toast.error('Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="pt-24 min-h-screen px-6 max-w-4xl mx-auto">
      <h1 className="text-3xl text-white font-bold mb-6">Contact Us 📩</h1>

      <form onSubmit={handleSubmit} className="space-y-5 card-dark p-6 rounded-xl">

        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
          className="input-dark w-full"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={form.email}
          onChange={handleChange}
          className="input-dark w-full"
          required
        />

        <textarea
          name="message"
          placeholder="Your Message..."
          value={form.message}
          onChange={handleChange}
          rows={4}
          className="input-dark w-full resize-none"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="btn-gold px-6 py-3"
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  )
} toast.success("Message sent successfully")
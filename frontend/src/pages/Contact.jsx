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

    if (!form.name || !form.email || !form.message) {
      return toast.error('All fields required')
    }

    try {
      setLoading(true)

      await api.post('/contact', form)

      toast.success('Message sent successfully 🚀')

      setForm({
        name: '',
        email: '',
        message: ''
      })

    } catch (err) {
      toast.error(err.response?.data?.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-3xl text-white mb-6">Contact Us 📩</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Your Name"
          className="input-dark w-full"
        />

        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Your Email"
          className="input-dark w-full"
        />

        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          placeholder="Your Message..."
          className="input-dark w-full h-32"
        />

        <button
          type="submit"
          className="btn-gold"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  )
}
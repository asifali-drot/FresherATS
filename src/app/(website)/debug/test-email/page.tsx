'use client'

import { useState } from 'react'
import { toast } from 'sonner'

export default function TestReminderEmailPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleTest = async () => {
    if (!email.trim()) {
      toast.error('Please enter an email address')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/debug/test-reminder-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toEmail: email }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(data.message)
      } else {
        toast.error(data.error)
        if (data.message) toast.info(data.message)
      }
    } catch (e: any) {
      toast.error('Network error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-6 py-20">
      <h1 className="text-3xl font-bold mb-6">Test Reminder Email</h1>
      <p className="text-gray-600 mb-4">
        Use this to test if Resend is configured correctly.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Test Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your-email@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleTest}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
        >
          {loading ? 'Sending...' : 'Send Test Email'}
        </button>
      </div>

      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h3 className="font-semibold text-amber-900 mb-2">Troubleshooting</h3>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>✓ Check your .env.local has RESEND_API_KEY set</li>
          <li>✓ If using onboarding@resend.dev: verify your email in Resend dashboard</li>
          <li>✓ Check server logs for detailed Resend error messages</li>
          <li>✓ Consider setting RESEND_FROM_EMAIL to a verified domain</li>
        </ul>
      </div>
    </div>
  )
}

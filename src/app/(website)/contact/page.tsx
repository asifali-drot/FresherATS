'use client'

//import Link from 'next/link'

export default function ContactPage() {
  const openTawkChat = () => {
    if (typeof window !== 'undefined' && (window as any).Tawk_API) {
      (window as any).Tawk_API.toggle()
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center">
      <h1 className="text-4xl font-extrabold text-zinc-900">Contact Us</h1>
      <p className="mt-6 text-lg text-zinc-600">
        Thanks for reaching out! Please use our live chat box to contact us. 
      </p>
      <p className="mt-4 text-base text-zinc-500">
        You will find the chat box on the bottom right corner of your screen.
      </p>
      <button
        onClick={openTawkChat}
        className="mt-8 inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
      >
        Open Chat
      </button>
    </div>
  )
}

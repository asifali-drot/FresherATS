export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="text-4xl font-extrabold text-zinc-900">Contact Us</h1>
      <p className="mt-4 text-lg text-zinc-600">
        Have questions? We&apos;d love to hear from you. Send us a message and we&apos;ll get back to you as soon as possible.
      </p>

      <form className="mt-10 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-sm font-bold text-zinc-900">Name</label>
          <input
            type="text"
            id="name"
            placeholder="Your name"
            className="rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-bold text-zinc-900">Email</label>
          <input
            type="email"
            id="email"
            placeholder="your@email.com"
            className="rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="message" className="text-sm font-bold text-zinc-900">Message</label>
          <textarea
            id="message"
            rows={5}
            placeholder="How can we help?"
            className="rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-blue-500 transition-colors resize-none"
          ></textarea>
        </div>

        <button
          type="submit"
          className="mt-2 rounded-xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}

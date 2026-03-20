import Link from "next/link";

export default function TipsPage() {
  const tips = [
    {
      id: "01",
      title: "Use Standard, ATS-Friendly Fonts",
      description: "Applicant Tracking Systems are essentially text parsers. They struggle with complex, ornate, or non-standard fonts that aren't built into their databases. Stick to the 'Safe Six' for maximum compatibility.",
      details: ["Arial", "Calibri", "Helvetica", "Georgia", "Tahoma", "Verdana"],
      color: "bg-purple-50 text-purple-600 group-hover:bg-purple-600"
    },
    {
      id: "02",
      title: "Mirror Job Description Keywords",
      description: "ATS algorithms look for specific matches between your resume and the job posting. Don't just list your skills—use the exact terminology found in the 'Requirements' and 'Responsibilities' sections.",
      details: ["Scan for hard skills (e.g., 'Python', 'CRM')", "Look for industry certifications", "Include specific software names"],
      color: "bg-blue-50 text-blue-600 group-hover:bg-blue-600"
    },
    {
      id: "03",
      title: "Avoid Complex Formatting",
      description: "While a beautiful graphic resume might look great to a human, it often becomes a scrambled mess in an ATS. Keep your structure linear and predictable.",
      details: ["Avoid multiple columns", "Don't put vital info in Headers/Footers", "Remove images, icons, and charts"],
      color: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600"
    },
    {
      id: "04",
      title: "The Right File Format Matters",
      description: "Most modern ATS can read PDFs, but some older systems still prefer .docx files. Always check the application instructions, but generally, a standard PDF is the best way to preserve formatting.",
      details: ["Standard PDF for modern systems", ".docx for older portals", "Never upload a JPG/PNG of your resume"],
      color: "bg-pink-50 text-pink-600 group-hover:bg-pink-600"
    },
    {
      id: "05",
      title: "Use Reverse-Chronological Order",
      description: "ATS systems are programmed to look for your most recent experience first. Using a functional or creative layout can confuse the parser and lead to your experience being dated incorrectly.",
      details: ["Recent experience at the top", "Clear 'Start' and 'End' dates", "Standard Section headings (Experience, Education)"],
      color: "bg-orange-50 text-orange-600 group-hover:bg-orange-600"
    }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-zinc-50 border-b border-zinc-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
              Master the ATS Algorithm
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-600">
              90% of large companies use Applicant Tracking Systems.
              Follow these expert tips to ensure your resume makes it to a human recruiter.
            </p>
          </div>
        </div>
      </section>

      {/* Tips Grid */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2">
            {tips.map((tip) => (
              <div key={tip.id} className="group relative flex flex-col items-start gap-6 p-8 rounded-3xl border border-zinc-100 bg-white hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-300">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl font-bold transition-all duration-300 group-hover:text-white ${tip.color}`}>
                  {tip.id}
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-zinc-900 mb-4">{tip.title}</h2>
                  <p className="text-zinc-600 leading-relaxed mb-6">
                    {tip.description}
                  </p>
                  <ul className="space-y-2">
                    {tip.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pb-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative isolate overflow-hidden bg-zinc-950 px-6 py-24 text-center shadow-2xl rounded-3xl sm:px-16">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Apply these tips now
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-zinc-300">
              Upload your resume and see how well it stacks up against our ATS analysis engine.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/analyze"
                className="rounded-xl bg-white px-8 py-4 text-sm font-bold text-zinc-900 shadow-sm hover:bg-zinc-100 transition-all active:scale-95"
              >
                Analyze My Resume
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

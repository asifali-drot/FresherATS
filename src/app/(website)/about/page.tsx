import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-6xl">
              About FresherATS
            </h1>
            <p className="mt-6 text-lg leading-8 text-zinc-600">
              We&apos;re on a mission to level the playing field for fresh graduates.
              Our AI-powered platform helps you navigate the complex world of Applicant Tracking Systems (ATS)
              and land your dream job.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Our Story</h2>
              <p className="mt-6 text-lg leading-7 text-zinc-600">
                FresherATS was born out of a simple observation: talented graduates were being rejected
                by companies not because of their skills, but because their resumes weren&apos;t ATS-friendly.
                We saw a gap between academic success and career entry, and we decided to bridge it.
              </p>
              <p className="mt-6 text-lg leading-7 text-zinc-600">
                Today, we use advanced AI models to analyze thousands of resume patterns,
                providing instant, actionable feedback that helps candidates stand out in a crowded market.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-1">
              <div className="flex flex-col gap-y-3 border-l-4 border-blue-600 pl-6">
                <dt className="text-sm leading-6 text-zinc-600">Resumes Analyzed</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-zinc-900">10,000+</dd>
              </div>
              <div className="flex flex-col gap-y-3 border-l-4 border-purple-600 pl-6">
                <dt className="text-sm leading-6 text-zinc-600">Success Rate Improvement</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-zinc-900">45%</dd>
              </div>
              <div className="flex flex-col gap-y-3 border-l-4 border-indigo-600 pl-6">
                <dt className="text-sm leading-6 text-zinc-600">Graduate Connections</dt>
                <dd className="order-first text-3xl font-semibold tracking-tight text-zinc-900">5,000+</dd>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="bg-zinc-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">Our Vision</h2>
            <p className="mt-6 text-lg leading-8 text-zinc-600">
              To be the definitive bridge between education and employment,
              empowering every graduate with the tools they need to showcase their true potential
              to the world&apos;s leading companies.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative isolate overflow-hidden bg-zinc-950 px-6 py-24 text-center shadow-2xl rounded-3xl sm:px-16">
            <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to fix your resume?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-zinc-300">
              Don&apos;t let a poorly formatted resume hold you back. Let FresherATS help you land your first role.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/analyze"
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-zinc-900 shadow-sm hover:bg-zinc-100 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Start Free Analysis
              </Link>
              <Link href="/blog" className="text-sm font-semibold leading-6 text-white">
                Read our blog <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function PrivacyPage() {
  const lastUpdated = "March 19, 2026";

  const sections = [
    {
      title: "1. Information We Collect",
      content: "We collect information you provide directly to us, such as when you upload your resume or create an account. This includes your name, email address, and any personal information contained within your resume."
    },
    {
      title: "2. How We Use Your Information",
      content: "We use the information we collect to provide, maintain, and improve our services, including the AI-driven analysis of your resume. We do not sell your personal data to third parties."
    },
    {
      title: "3. Data Retention",
      content: "We retain your resume data while your account is active or as needed to provide you with services. You can delete your data at any time through your account settings."
    },
    {
      title: "4. Security",
      content: "We take reasonable measures to protect your personal information from loss, theft, misuse, and unauthorized access. However, no internet transmission is ever completely secure."
    },
    {
      title: "5. Cookies",
      content: "We use cookies and similar technologies to track activity on our service and hold certain information to improve your user experience."
    },
    {
      title: "6. Your Rights",
      content: "Depending on your location, you may have rights regarding your personal data, including the right to access, correct, or delete the information we have about you."
    }
  ];

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="border-b border-zinc-200 pb-12">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-base text-zinc-500">
            Last Updated: {lastUpdated}
          </p>
        </div>

        <div className="mt-12 space-y-12">
          {sections.map((section, index) => (
            <section key={index}>
              <h2 className="text-xl font-semibold text-zinc-900">{section.title}</h2>
              <div className="mt-4 text-base leading-7 text-zinc-600">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 border-t border-zinc-200 pt-8">
          <p className="text-sm text-zinc-500 text-center">
            If you have any questions about this Privacy Policy, please contact us at privacy@fresherats.com
          </p>
        </div>
      </div>
    </div>
  );
}

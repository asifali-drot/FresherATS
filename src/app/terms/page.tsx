export default function TermsPage() {
  const lastUpdated = "March 19, 2026";

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing or using FresherATS, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, you should not use our services."
    },
    {
      title: "2. Description of Service",
      content: "FresherATS provides an AI-powered resume analysis tool designed to help users optimize their resumes for Applicant Tracking Systems. We provide scoring, suggestions, and formatting tools."
    },
    {
      title: "3. User Responsibilities",
      content: "You are responsible for the accuracy of the information you provide. You agree not to use the service for any illegal or unauthorized purpose. You must not upload any malicious code or content that violates third-party rights."
    },
    {
      title: "4. Intellectual Property",
      content: "The content, features, and functionality of FresherATS are owned by us and are protected by international copyright, trademark, and other intellectual property laws. Your resumes and data remain your property."
    },
    {
      title: "5. Limitation of Liability",
      content: "FresherATS is provided 'as is' without any warranties. We do not guarantee that our suggestions will result in a job offer. In no event shall we be liable for any indirect, incidental, or consequential damages."
    },
    {
      title: "6. Changes to Terms",
      content: "We reserve the right to modify these terms at any time. We will notify users of any significant changes by posting the new terms on this page."
    }
  ];

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="border-b border-zinc-200 pb-12">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
            Terms of Service
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
            If you have any questions about these Terms, please contact us at support@fresherats.com
          </p>
        </div>
      </div>
    </div>
  );
}

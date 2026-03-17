export interface ParsedSection {
  title: string;
  content: string[];
}

export const SECTION_PATTERNS = [
  { pattern: /^[#\*\s]*contact\b/i, title: "CONTACT" },
  { pattern: /^[#\*\s]*summary\b/i, title: "SUMMARY" },
  { pattern: /^[#\*\s]*objective\b/i, title: "OBJECTIVE" },
  { pattern: /^[#\*\s]*experience\b/i, title: "EXPERIENCE" },
  { pattern: /^[#\*\s]*work\s*experience\b/i, title: "EXPERIENCE" },
  { pattern: /^[#\*\s]*employment\b/i, title: "EMPLOYMENT" },
  { pattern: /^[#\*\s]*professional\s*experience\b/i, title: "EXPERIENCE" },
  { pattern: /^[#\*\s]*education\b/i, title: "EDUCATION" },
  { pattern: /^[#\*\s]*skills\b/i, title: "SKILLS" },
  { pattern: /^[#\*\s]*technical\s*skills\b/i, title: "SKILLS" },
  { pattern: /^[#\*\s]*certifications\b/i, title: "CERTIFICATIONS" },
  { pattern: /^[#\*\s]*certificates\b/i, title: "CERTIFICATIONS" },
  { pattern: /^[#\*\s]*projects\b/i, title: "PROJECTS" },
  { pattern: /^[#\*\s]*languages\b/i, title: "LANGUAGES" },
  { pattern: /^[#\*\s]*awards\b/i, title: "AWARDS" },
  { pattern: /^[#\*\s]*honors\b/i, title: "HONORS" },
  { pattern: /^[#\*\s]*publications\b/i, title: "PUBLICATIONS" },
  { pattern: /^[#\*\s]*volunteer\b/i, title: "VOLUNTEER" },
  { pattern: /^[#\*\s]*interests\b/i, title: "INTERESTS" },
  { pattern: /^[#\*\s]*references\b/i, title: "REFERENCES" },
];

export function detectSection(line: string): string | null {
  for (const { pattern, title } of SECTION_PATTERNS) {
    if (pattern.test(line.trim())) {
      return title;
    }
  }
  return null;
}

export function parseResumeText(text: string): {
  nameLines: string[];
  sections: ParsedSection[];
} {
  const lines = text.split("\n").filter((line) => line.trim());
  const sections: ParsedSection[] = [];
  let currentSection: ParsedSection | null = null;

  const nameLines: string[] = [];
  let startIdx = 0;

  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const trimmed = lines[i].trim();
    const section = detectSection(trimmed);
    if (section) break;

    if (
      trimmed.length > 0 &&
      trimmed.length < 100 &&
      !trimmed.startsWith("•") &&
      !trimmed.startsWith("-")
    ) {
      nameLines.push(trimmed);
      startIdx = i + 1;
    } else {
      break;
    }
  }

  for (let i = startIdx; i < lines.length; i++) {
    const trimmedLine = lines[i].trim();
    const sectionTitle = detectSection(trimmedLine);

    if (sectionTitle) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: sectionTitle,
        content: [],
      };
    } else if (currentSection) {
      currentSection.content.push(trimmedLine);
    } else {
      if (!sections.length) {
        currentSection = {
          title: "SUMMARY",
          content: [trimmedLine],
        };
      } else {
        sections[sections.length - 1].content.push(trimmedLine);
      }
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return { nameLines, sections };
}

export function generateResumeHtml(nameLines: string[], sections: ParsedSection[]): string {
  const nameHeader = nameLines.length > 0 ? `
    <header class="resume-header">
      <h1 class="resume-name">${nameLines[0]}</h1>
      <div class="resume-contact">
        ${nameLines.slice(1).map(line => `<span>${line}</span>`).join('<span class="separator">•</span>')}
      </div>
    </header>
  ` : '';

  const sectionHtml = sections.map(section => `
    <section class="resume-section">
      <h2 class="resume-section-title">${section.title}</h2>
      <div class="resume-section-content">
        ${section.content.map(line => {
          if (line.startsWith('*') || line.startsWith('•') || line.startsWith('-')) {
            const pureLine = line.replace(/^[\*•\-]\s*/, '');
            return `<div class="resume-bullet-item"><span class="bullet"></span><span class="text">${pureLine}</span></div>`;
          }
          return `<p class="resume-paragraph">${line}</p>`;
        }).join('')}
      </div>
    </section>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        :root {
          --primary-color: #0f172a;
          --secondary-color: #475569;
          --accent-color: #2563eb;
          --border-color: #e2e8f0;
          --text-color: #1e293b;
          --line-height: 1.5;
          --base-font-size: 10.5pt;
        }

        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          line-height: var(--line-height);
          color: var(--text-color);
          margin: 0;
          padding: 40px 50px;
          background: #fff;
          font-size: var(--base-font-size);
        }

        .resume-header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid var(--primary-color);
        }

        .resume-name {
          font-size: 28pt;
          font-weight: 800;
          color: var(--primary-color);
          margin: 0 0 10px 0;
          letter-spacing: -0.05em;
          line-height: 1;
          text-transform: uppercase;
        }

        .resume-contact {
          font-size: 9.5pt;
          color: var(--secondary-color);
          font-weight: 500;
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;
        }

        .resume-contact span {
          display: inline-block;
        }

        .resume-contact .separator {
          color: var(--border-color);
          font-weight: 800;
        }

        .resume-section {
          margin-bottom: 24px;
        }

        .resume-section-title {
          font-size: 12pt;
          font-weight: 700;
          color: var(--primary-color);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 4px;
          margin-bottom: 12px;
          position: relative;
        }

        .resume-section-title::after {
          content: "";
          position: absolute;
          bottom: -1px;
          left: 0;
          width: 50px;
          height: 1px;
          background-color: var(--accent-color);
        }

        .resume-section-content {
          padding-left: 0;
        }

        .resume-paragraph {
          margin: 0 0 10px 0;
          text-align: justify;
          color: var(--text-color);
        }

        .resume-bullet-item {
          display: flex;
          margin-bottom: 4px;
          align-items: flex-start;
          page-break-inside: avoid;
        }

        .resume-bullet-item .bullet {
          min-width: 14px;
          height: 1.5em;
          position: relative;
          margin-right: 2px;
        }

        .resume-bullet-item .bullet::before {
          content: "•";
          position: absolute;
          color: var(--accent-color);
          font-weight: 800;
          left: 0;
          top: 0;
        }

        .resume-bullet-item .text {
          flex: 1;
          color: var(--text-color);
        }

        @media print {
          body { 
            padding: 0;
            font-size: 10pt;
          }
          .resume-section { 
            page-break-inside: auto; 
          }
          .resume-section-title {
            page-break-after: avoid;
          }
          .resume-header {
            margin-bottom: 25px;
          }
          @page {
            margin: 0.75in;
          }
        }
      </style>
    </head>
    <body>
      <div class="resume-wrapper">
        ${nameHeader}
        ${sectionHtml}
      </div>
    </body>
    </html>
  `;
}

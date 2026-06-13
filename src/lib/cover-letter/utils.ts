import { getCoverLetterTemplateById, type CoverLetterTemplateId } from "./templates";

export interface ParsedCoverLetter {
  senderLines: string[];
  date: string;
  recipientLines: string[];
  salutation: string;
  bodyParagraphs: string[];
  signOff: string;
  signatureName: string;
}

export function parseCoverLetterText(text: string): ParsedCoverLetter {
  const normalized = text.replace(/\r\n/g, "\n");
  const blocks = normalized
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  const result: ParsedCoverLetter = {
    senderLines: [],
    date: "",
    recipientLines: [],
    salutation: "",
    bodyParagraphs: [],
    signOff: "",
    signatureName: "",
  };

  if (blocks.length >= 6) {
    result.senderLines = blocks[0].split("\n").map((l) => l.trim());
    result.date = blocks[1];
    result.recipientLines = blocks[2].split("\n").map((l) => l.trim());
    result.salutation = blocks[3];
    result.signatureName = blocks[blocks.length - 1];
    result.signOff = blocks[blocks.length - 2];
    result.bodyParagraphs = blocks.slice(4, blocks.length - 2);
  } else {
    // Graceful fallback for short/unstructured text
    if (blocks.length > 0) {
      result.bodyParagraphs = blocks;
    }
    result.senderLines = ["Your Name", "Email | Phone | Location"];
    result.date = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    result.recipientLines = ["Hiring Manager", "Company Name", "Company Address"];
    result.salutation = "Dear Hiring Manager,";
    result.signOff = "Sincerely,";
    result.signatureName = "Your Name";
  }

  return result;
}

export function serializeCoverLetter(data: ParsedCoverLetter): string {
  const parts = [
    data.senderLines.join("\n"),
    data.date,
    data.recipientLines.join("\n"),
    data.salutation,
    ...data.bodyParagraphs,
    data.signOff,
    data.signatureName,
  ];
  return parts.join("\n\n");
}

export function generateCoverLetterHtml(
  data: ParsedCoverLetter,
  templateId: CoverLetterTemplateId,
  avatarUrl?: string
): string {
  const template = getCoverLetterTemplateById(templateId);

  // Setup template-specific layout variables and CSS styles
  let templateStyles = "";
  let headerHtml = "";
  let bodyWrapperStart = "";
  let bodyWrapperEnd = "";

  if (templateId === "minimalist") {
    templateStyles = `
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        color: #18181b;
        background-color: #ffffff;
      }
      .letter-header {
        margin-bottom: 40px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-bottom: 1px solid #e4e4e7;
        padding-bottom: 20px;
      }
      .sender-info {
        text-align: left;
      }
      .sender-name {
        font-size: 20pt;
        font-weight: 700;
        color: #18181b;
        margin: 0 0 4px 0;
        letter-spacing: -0.03em;
      }
      .sender-contact {
        font-size: 9pt;
        color: #71717a;
      }
      .date-block {
        font-size: 9.5pt;
        color: #71717a;
        margin-bottom: 30px;
      }
      .recipient-info {
        font-size: 9.5pt;
        color: #27272a;
        margin-bottom: 30px;
        line-height: 1.4;
      }
      .salutation {
        font-size: 10pt;
        font-weight: 600;
        margin-bottom: 20px;
      }
      .letter-body p {
        margin-bottom: 16px;
        text-align: justify;
      }
      .sign-off-block {
        margin-top: 40px;
      }
    `;
    headerHtml = `
      <header class="letter-header">
        <div class="sender-info">
          <h1 class="sender-name">${data.senderLines[0] || ""}</h1>
          <div class="sender-contact">
            ${data.senderLines.slice(1).map(line => `<div>${line}</div>`).join("")}
          </div>
        </div>
      </header>
    `;
  } else if (templateId === "creative") {
    templateStyles = `
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        color: #1f2937;
        background-color: #ffffff;
      }
      .creative-container {
        border-left: 4px solid ${template.primaryColor};
        padding-left: 25px;
        min-height: 100%;
      }
      .letter-header {
        margin-bottom: 35px;
      }
      .sender-name {
        font-size: 22pt;
        font-weight: 800;
        color: ${template.primaryColor};
        margin: 0 0 6px 0;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .sender-contact {
        font-size: 9pt;
        color: #4b5563;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      .sender-contact-item {
        display: inline-block;
      }
      .sender-contact-item:not(:last-child)::after {
        content: "•";
        margin-left: 10px;
        color: ${template.accentColor};
      }
      .date-block {
        font-size: 9.5pt;
        font-weight: 600;
        color: ${template.accentColor};
        margin-bottom: 25px;
      }
      .recipient-info {
        font-size: 9.5pt;
        color: #374151;
        margin-bottom: 25px;
        line-height: 1.5;
        background-color: #f0fdfa;
        padding: 12px 16px;
        border-radius: 8px;
        display: inline-block;
        min-width: 280px;
      }
      .salutation {
        font-size: 10.5pt;
        font-weight: 700;
        color: ${template.primaryColor};
        margin-bottom: 20px;
      }
      .letter-body p {
        margin-bottom: 16px;
        line-height: 1.6;
      }
      .sign-off-block {
        margin-top: 35px;
      }
    `;
    bodyWrapperStart = `<div class="creative-container">`;
    bodyWrapperEnd = `</div>`;
    headerHtml = `
      <header class="letter-header">
        <h1 class="sender-name">${data.senderLines[0] || ""}</h1>
        <div class="sender-contact">
          ${data.senderLines.slice(1).map(line => `<span class="sender-contact-item">${line}</span>`).join("")}
        </div>
      </header>
    `;
  } else if (templateId === "modern-avatar") {
    templateStyles = `
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        color: #1e293b;
        background-color: #ffffff;
      }
      .letter-header {
        margin-bottom: 35px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid ${template.primaryColor};
        padding-bottom: 15px;
      }
      .sender-info {
        flex: 1;
        text-align: left;
      }
      .sender-name {
        font-size: 22pt;
        font-weight: 800;
        color: ${template.primaryColor};
        margin: 0 0 6px 0;
        letter-spacing: -0.02em;
      }
      .sender-contact {
        font-size: 9pt;
        color: #4b5563;
        line-height: 1.4;
      }
      .avatar-container {
        width: 65px;
        height: 65px;
        border-radius: 50%;
        overflow: hidden;
        border: 2px solid ${template.primaryColor};
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f3f4f6;
        margin-left: 20px;
        flex-shrink: 0;
      }
      .avatar-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .avatar-placeholder {
        font-size: 22px;
        font-weight: bold;
        color: ${template.primaryColor};
        line-height: 1;
      }
      .date-block {
        font-size: 9.5pt;
        color: #64748b;
        margin-bottom: 25px;
      }
      .recipient-info {
        font-size: 10pt;
        color: #334155;
        margin-bottom: 25px;
        line-height: 1.5;
      }
      .salutation {
        font-size: 10.5pt;
        font-weight: 700;
        margin-bottom: 18px;
      }
      .letter-body p {
        margin-bottom: 14px;
        text-align: justify;
      }
      .sign-off-block {
        margin-top: 35px;
      }
    `;
    headerHtml = `
      <header class="letter-header">
        <div class="sender-info">
          <h1 class="sender-name">${data.senderLines[0] || ""}</h1>
          <div class="sender-contact">
            ${data.senderLines.slice(1).map(line => `<div>${line}</div>`).join("")}
          </div>
        </div>
        <div class="avatar-container">
          ${avatarUrl ? `
            <img src="${avatarUrl}" alt="Profile" class="avatar-image" />
          ` : `
            <div class="avatar-placeholder">
              ${(data.senderLines[0] || "U").charAt(0).toUpperCase()}
            </div>
          `}
        </div>
      </header>
    `;
  } else {
    // Default: professional
    templateStyles = `
      body {
        font-family: 'Georgia', serif;
        color: #1e293b;
        background-color: #ffffff;
      }
      .letter-header {
        text-align: center;
        margin-bottom: 35px;
        border-bottom: 2px solid ${template.primaryColor};
        padding-bottom: 15px;
      }
      .sender-name {
        font-size: 24pt;
        font-weight: 700;
        color: ${template.primaryColor};
        margin: 0 0 8px 0;
        letter-spacing: -0.01em;
        text-transform: uppercase;
      }
      .sender-contact {
        font-size: 9.5pt;
        color: #475569;
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: 8px;
      }
      .sender-contact span {
        display: inline-block;
      }
      .sender-contact .separator {
        color: #cbd5e1;
        font-weight: bold;
      }
      .date-block {
        font-size: 10pt;
        margin-bottom: 25px;
      }
      .recipient-info {
        font-size: 10pt;
        margin-bottom: 25px;
        line-height: 1.5;
      }
      .salutation {
        font-size: 10.5pt;
        font-weight: bold;
        margin-bottom: 18px;
      }
      .letter-body p {
        margin-bottom: 14px;
        text-align: justify;
        text-indent: 0px;
      }
      .sign-off-block {
        margin-top: 35px;
      }
    `;
    headerHtml = `
      <header class="letter-header">
        <h1 class="sender-name">${data.senderLines[0] || ""}</h1>
        <div class="sender-contact">
          ${data.senderLines.slice(1).map((line, idx, arr) => `
            <span>${line}</span>
            ${idx < arr.length - 1 ? `<span class="separator">•</span>` : ""}
          `).join("")}
        </div>
      </header>
    `;
  }

  const paragraphsHtml = data.bodyParagraphs
    .map(
      (p) => `<p>${p.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/==(.*?)==/g, "<mark>$1</mark>")}</p>`
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact;
        }

        body {
          margin: 0;
          padding: ${template.bodyPadding};
          font-size: ${template.fontSize};
          line-height: 1.5;
        }

        mark {
          background-color: #fef9c3;
          color: inherit;
          padding: 0 2px;
          border-radius: 2px;
        }

        .letter-wrapper {
          width: 100%;
          min-height: 100%;
        }

        ${templateStyles}
      </style>
    </head>
    <body>
      <div class="letter-wrapper">
        ${bodyWrapperStart}
        ${headerHtml}
        
        <div class="date-block">
          ${data.date}
        </div>

        <div class="recipient-info">
          ${data.recipientLines.map(line => `<div>${line}</div>`).join("")}
        </div>

        <div class="salutation">
          ${data.salutation}
        </div>

        <div class="letter-body">
          ${paragraphsHtml}
        </div>

        <div class="sign-off-block">
          <div>${data.signOff}</div>
          <div style="margin-top: 40px; font-weight: bold; color: ${template.primaryColor};">
            ${data.signatureName}
          </div>
        </div>
        ${bodyWrapperEnd}
      </div>
    </body>
    </html>
  `;
}

import { Resend } from "resend";

let resendClient: Resend | null = null;
function getResend() {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

/**
 * Sender email for reminders.
 * Use a verified domain email from your Resend dashboard.
 * Default: onboarding@resend.dev (only works with verified recipients)
 * 
 * To use your own domain:
 * 1. Verify your domain at resend.com/domains
 * 2. Set RESEND_FROM_EMAIL=reminders@youromain.com
 */
//const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "reminders@notify.fresherats.com";


export interface ReminderEmailData {
  userEmail: string;
  userName?: string;
  jobTitle: string;
  companyName: string;
  reminderMessage: string;
  reminderType: "followup" | "interview" | "deadline";
  dueAt: string; // ISO string
}

const TYPE_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  followup: { label: "Follow-Up", emoji: "📬", color: "#3b82f6" },
  interview: { label: "Interview Deadline", emoji: "🎯", color: "#f59e0b" },
  deadline: { label: "Application Close", emoji: "⏰", color: "#ef4444" },
};

function buildEmailHtml(data: ReminderEmailData): string {
  const typeInfo = TYPE_LABELS[data.reminderType] || TYPE_LABELS.followup;
  const dueDate = new Date(data.dueAt).toLocaleString("en-US", {
    weekday: "long", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Job Tracker Reminder</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);padding:40px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;font-weight:800;letter-spacing:4px;color:#bfdbfe;text-transform:uppercase;">FresherATS</p>
              <h1 style="margin:0;font-size:28px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Job Tracker Reminder</h1>
              <p style="margin:12px 0 0;font-size:15px;color:#dbeafe;font-weight:500;">You have an upcoming task for your job application</p>
            </td>
          </tr>

          <!-- Reminder Type Badge -->
          <tr>
            <td style="padding:28px 40px 0;text-align:center;">
              <span style="display:inline-block;background:${typeInfo.color}15;border:1.5px solid ${typeInfo.color}40;color:${typeInfo.color};font-size:12px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;padding:6px 18px;border-radius:100px;">
                ${typeInfo.emoji} ${typeInfo.label}
              </span>
            </td>
          </tr>

          <!-- Job Card -->
          <tr>
            <td style="padding:24px 40px;">
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:1px;text-transform:uppercase;">Job Application</p>
                <p style="margin:0;font-size:18px;font-weight:900;color:#0f172a;">${data.jobTitle}</p>
                <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#64748b;">@ ${data.companyName}</p>
              </div>
            </td>
          </tr>

          <!-- Reminder Message -->
          <tr>
            <td style="padding:0 40px;">
              <div style="border-left:3px solid ${typeInfo.color};padding:12px 16px;background:${typeInfo.color}08;border-radius:0 8px 8px 0;">
                <p style="margin:0 0 4px;font-size:10px;font-weight:800;letter-spacing:1px;color:${typeInfo.color};text-transform:uppercase;">Task</p>
                <p style="margin:0;font-size:14px;font-weight:600;color:#1e293b;">${data.reminderMessage}</p>
              </div>
            </td>
          </tr>

          <!-- Due Date -->
          <tr>
            <td style="padding:20px 40px;">
              <div style="display:flex;align-items:center;gap:8px;background:#fef3c7;border:1px solid #fde68a;border-radius:10px;padding:12px 16px;">
                <span style="font-size:18px;">🗓</span>
                <div>
                  <p style="margin:0;font-size:10px;font-weight:800;color:#92400e;letter-spacing:1px;text-transform:uppercase;">Due</p>
                  <p style="margin:0;font-size:14px;font-weight:700;color:#78350f;">${dueDate}</p>
                </div>
              </div>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <a href="https://fresherats.com/job-tracker" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-size:13px;font-weight:800;letter-spacing:0.5px;padding:14px 32px;border-radius:12px;margin-top:8px;">
                Open Job Tracker →
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 40px;text-align:center;">
              <!-- Social Links -->
              <div style="margin-bottom:20px;">
                <a href="https://www.facebook.com/fresherats/" style="display:inline-block;margin:0 8px;color:#64748b;text-decoration:none;font-size:16px;text-transform:uppercase;" title="Follow us on Facebook">📘</a>
                <span style="color:#cbd5e1;">|</span>
                <a href="https://www.linkedin.com/company/fresherats" style="display:inline-block;margin:0 8px;color:#64748b;text-decoration:none;font-size:16px;text-transform:uppercase;" title="Follow us on LinkedIn">💼</a>
                <span style="color:#cbd5e1;">|</span>
              </div>
              <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.6;">
                You're receiving this because you set a reminder on <strong>FresherATS Job Tracker</strong>.<br/>
                <a href="https://fresherats.com/job-tracker" style="color:#64748b;text-decoration:underline;">Manage your reminders</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendReminderEmail(data: ReminderEmailData): Promise<boolean> {
  try {
    const typeInfo = TYPE_LABELS[data.reminderType] || TYPE_LABELS.followup;
    const subject = `${typeInfo.emoji} Reminder: ${data.reminderMessage} — ${data.jobTitle} @ ${data.companyName}`;

    console.log(`[Resend] Attempting to send reminder email to: ${data.userEmail}`);
    console.log(`[Resend] Using sender: ${RESEND_FROM_EMAIL}`);

    const resend = getResend();
    const { data: result, error } = await resend.emails.send({
      from: `FresherATS <${RESEND_FROM_EMAIL}>`,
      to: data.userEmail,
      subject,
      html: buildEmailHtml(data),
    });

    if (error) {
      console.error("[Resend] FAILED to send email:");
      console.error("  → recipient:", data.userEmail);
      console.error("  → sender:", RESEND_FROM_EMAIL);
      console.error("  → name:", (error as any).name);
      console.error("  → message:", (error as any).message);
      console.error("  → statusCode:", (error as any).statusCode);
      console.error("  → TROUBLESHOOTING: If using onboarding@resend.dev, verify recipient in Resend dashboard or set RESEND_FROM_EMAIL to a verified domain");
      console.error("  → full error:", JSON.stringify(error, null, 2));
      return false;
    }

    console.log(`[Resend] Email sent successfully! ID: ${result?.id}, to: ${data.userEmail}`);
    return true;
  } catch (err: any) {
    console.error("[Resend] Unexpected exception:", err?.message || err);
    return false;
  }
}

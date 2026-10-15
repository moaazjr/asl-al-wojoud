import "server-only";

export interface PendingCommentEmailData {
  id: string;
  name: string;
  email: string | null;
  text: string;
  sectionId: string;
  sectionTitle: string;
  bookTitle: string;
  createdAt: Date;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function emailNotificationsConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL);
}

function moderationUrl(): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/+$/, "");
  return `${base}/dashboard/comments`;
}

/**
 * Sends an email notification to the configured administrator about a comment
 * awaiting moderation. Never throws: a delivery failure must not affect the
 * already-saved comment.
 */
export async function sendPendingCommentNotification(
  data: PendingCommentEmailData,
): Promise<boolean> {
  if (!emailNotificationsConfigured()) {
    console.info(
      "[email] Notifications disabled. Set RESEND_API_KEY and ADMIN_EMAIL to enable.",
    );
    return false;
  }

  const apiKey = process.env.RESEND_API_KEY as string;
  const adminEmail = process.env.ADMIN_EMAIL as string;
  const from = process.env.EMAIL_FROM ?? "onboarding@resend.dev";
  const link = moderationUrl();

  const safe = {
    name: escapeHtml(data.name),
    email: data.email ? escapeHtml(data.email) : "—",
    section: escapeHtml(data.sectionTitle),
    book: escapeHtml(data.bookTitle),
    text: escapeHtml(data.text),
  };

  const html = `<!doctype html>
<html dir="rtl" lang="ar">
  <body style="font-family:system-ui,'Segoe UI',Tahoma,sans-serif;background:#f6f4ee;padding:24px;color:#1c1a16">
    <div style="max-width:640px;margin:0 auto;background:#fffdf8;border:1px solid #e7e0cf;border-radius:12px;padding:24px">
      <p style="display:inline-block;margin:0 0 12px;background:#f3e6c4;color:#8a6d1f;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:700">
        بانتظار المراجعة
      </p>
      <h1 style="margin:0 0 16px;font-size:20px">تعليق جديد بانتظار موافقتك</h1>
      <p style="margin:0 0 8px"><strong>الاسم:</strong> ${safe.name}</p>
      <p style="margin:0 0 8px"><strong>البريد الإلكتروني:</strong> ${safe.email}</p>
      <p style="margin:0 0 8px"><strong>المبحث:</strong> ${safe.book} — ${safe.section}</p>
      <p style="margin:0 0 8px"><strong>التاريخ:</strong> ${escapeHtml(data.createdAt.toISOString())}</p>
      <blockquote style="margin:12px 0;padding:12px 16px;border-inline-start:3px solid #c9a227;background:#faf7ef;white-space:pre-wrap">${safe.text}</blockquote>
      <p style="margin:16px 0 0">
        <a href="${link}" style="display:inline-block;background:#1c1a16;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-weight:600">
          مراجعة التعليق في لوحة التحكم
        </a>
      </p>
      <p style="margin:12px 0 0;font-size:12px;color:#6b6559">
        هذا التعليق لن يظهر للزوار حتى تتم الموافقة عليه.
      </p>
    </div>
  </body>
</html>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [adminEmail],
        subject: `تعليق جديد بانتظار المراجعة — ${data.sectionTitle}`,
        html,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error("[email] Resend request failed", res.status, detail);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] Failed to send notification", err);
    return false;
  }
}

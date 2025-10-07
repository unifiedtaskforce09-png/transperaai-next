export function feedbackTemplate({
  name,
  email,
  message,
}: {
  name: string;
  email: string;
  message: string;
}) {
  return `
  <div style="font-family:Inter,Arial,sans-serif;line-height:1.6;color:#0f172a">
    <h2 style="margin:0 0 12px;font-size:18px">New Feedback Received</h2>
    <p style="margin:0 0 8px">You received a new feedback submission from the website:</p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px">
      <p style="margin:0"><strong>Name:</strong> ${name}</p>
      <p style="margin:4px 0 0"><strong>Email:</strong> ${email}</p>
    </div>
    <p style="margin:12px 0 6px"><strong>Message:</strong></p>
    <div style="white-space:pre-wrap;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:12px">
      ${message.replace(/</g, "&lt;")}
    </div>
    <p style="margin-top:16px;color:#64748b;font-size:12px">Sent from Transpera AI</p>
  </div>`;
}



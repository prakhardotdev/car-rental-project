const nodemailer = require('nodemailer')

// ── Transporter (reused across calls) ─────────────────────────
const createTransporter = () =>
  nodemailer.createTransport({
    host:   process.env.EMAIL_HOST || 'smtp.gmail.com',
    port:   parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_PORT === '465',  // true for 465, false for others
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })

// ── Base HTML layout ──────────────────────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>LuxeDrive</title>
  <style>
    body { margin:0; padding:0; background:#04070f; font-family:'Segoe UI',Arial,sans-serif; color:#d1d5db; }
    .wrapper { max-width:600px; margin:0 auto; padding:32px 16px; }
    .card { background:#0f1a38; border-radius:16px; overflow:hidden; border:1px solid rgba(200,162,50,0.15); }
    .header { background:linear-gradient(135deg,#0f1a38,#1e2d4f); padding:32px; text-align:center; border-bottom:1px solid rgba(200,162,50,0.2); }
    .logo { font-size:28px; font-weight:bold; color:#fff; letter-spacing:-0.5px; }
    .logo span { background:linear-gradient(135deg,#e9c866,#c8a232); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
    .body { padding:32px; }
    h1 { color:#fff; font-size:22px; margin:0 0 16px; }
    p  { color:#9ca3af; font-size:14px; line-height:1.7; margin:0 0 14px; }
    .highlight { color:#e9c866; font-weight:600; }
    .detail-row { display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.05); }
    .detail-label { color:#6b7280; font-size:13px; }
    .detail-value { color:#fff; font-size:13px; font-weight:500; }
    .badge { display:inline-block; padding:4px 12px; border-radius:20px; font-size:12px; font-weight:600; background:rgba(200,162,50,0.15); color:#e9c866; border:1px solid rgba(200,162,50,0.3); }
    .btn { display:inline-block; margin:20px 0 0; padding:14px 32px; background:linear-gradient(135deg,#c8a232,#e9c866); color:#04070f; font-weight:700; font-size:15px; border-radius:12px; text-decoration:none; }
    .footer { padding:24px 32px; text-align:center; border-top:1px solid rgba(255,255,255,0.05); }
    .footer p { color:#4b5563; font-size:12px; margin:4px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="header">
        <div class="logo">Luxe<span>Drive</span></div>
        <p style="color:#6b7280;font-size:13px;margin:8px 0 0;">Premium Car Rental</p>
      </div>
      <div class="body">${content}</div>
      <div class="footer">
        <p>© 2024 LuxeDrive. All rights reserved.</p>
        <p>This is an automated email — please do not reply.</p>
      </div>
    </div>
  </div>
</body>
</html>
`

// ── Email templates ───────────────────────────────────────────

const templates = {

  bookingConfirmation: (data) => ({
    subject: `✅ Booking Confirmed — ${data.bookingRef} | LuxeDrive`,
    html: baseTemplate(`
      <h1>Booking Confirmed! 🎉</h1>
      <p>Hi <span class="highlight">${data.userName}</span>, your booking is confirmed. We're excited for your upcoming ride!</p>

      <div style="margin:20px 0;">
        <div class="detail-row"><span class="detail-label">Booking Ref</span><span class="detail-value"><span class="badge">${data.bookingRef}</span></span></div>
        <div class="detail-row"><span class="detail-label">Vehicle</span><span class="detail-value">${data.carName}</span></div>
        <div class="detail-row"><span class="detail-label">Pickup Date</span><span class="detail-value">${data.startDate}</span></div>
        <div class="detail-row"><span class="detail-label">Return Date</span><span class="detail-value">${data.endDate}</span></div>
        <div class="detail-row"><span class="detail-label">Duration</span><span class="detail-value">${data.days} day(s)</span></div>
        <div class="detail-row"><span class="detail-label">Pickup Location</span><span class="detail-value">${data.pickupLocation}</span></div>
        <div class="detail-row"><span class="detail-label">Total Amount</span><span class="detail-value" style="color:#e9c866;font-size:16px;">₹${Number(data.total).toLocaleString()}</span></div>
      </div>

      <p>You'll receive a reminder 24 hours before your pickup. If you have questions, reply to this email.</p>
      <a href="${process.env.FRONTEND_URL}/dashboard" class="btn">View Booking</a>
    `),
  }),

  bookingCancelled: (data) => ({
    subject: `❌ Booking Cancelled — ${data.bookingRef} | LuxeDrive`,
    html: baseTemplate(`
      <h1>Booking Cancelled</h1>
      <p>Hi <span class="highlight">${data.userName}</span>, your booking <span class="badge">${data.bookingRef}</span> for <strong style="color:#fff;">${data.carName}</strong> has been cancelled.</p>
      ${data.reason ? `<p><strong style="color:#fff;">Reason:</strong> ${data.reason}</p>` : ''}
      <p>If you paid online, your refund will be processed within 5–7 business days.</p>
      <a href="${process.env.FRONTEND_URL}/cars" class="btn">Browse Other Cars</a>
    `),
  }),

  paymentReceipt: (data) => ({
    subject: `🧾 Payment Receipt — ₹${Number(data.total).toLocaleString()} | LuxeDrive`,
    html: baseTemplate(`
      <h1>Payment Received</h1>
      <p>Hi <span class="highlight">${data.userName}</span>, we've received your payment. Here's your receipt.</p>

      <div style="margin:20px 0;">
        <div class="detail-row"><span class="detail-label">Transaction ID</span><span class="detail-value">${data.transactionId}</span></div>
        <div class="detail-row"><span class="detail-label">Booking Ref</span><span class="detail-value"><span class="badge">${data.bookingRef}</span></span></div>
        <div class="detail-row"><span class="detail-label">Vehicle</span><span class="detail-value">${data.carName}</span></div>
        <div class="detail-row"><span class="detail-label">Subtotal</span><span class="detail-value">₹${Number(data.subtotal).toLocaleString()}</span></div>
        <div class="detail-row"><span class="detail-label">Insurance</span><span class="detail-value">₹${Number(data.insurance).toLocaleString()}</span></div>
        <div class="detail-row" style="border-bottom:none;"><span class="detail-label" style="font-weight:700;color:#fff;">Total Paid</span><span class="detail-value" style="color:#e9c866;font-size:18px;font-weight:700;">₹${Number(data.total).toLocaleString()}</span></div>
      </div>
    `),
  }),

  welcomeEmail: (data) => ({
    subject: `🚗 Welcome to LuxeDrive, ${data.userName}!`,
    html: baseTemplate(`
      <h1>Welcome to LuxeDrive! 🎉</h1>
      <p>Hi <span class="highlight">${data.userName}</span>, your account is ready. You now have access to India's finest luxury car rental fleet.</p>
      <p>Browse hundreds of premium vehicles — from sports cars to luxury SUVs — and book in minutes.</p>
      <a href="${process.env.FRONTEND_URL}/cars" class="btn">Browse Cars Now</a>
    `),
  }),

  passwordReset: (data) => ({
    subject: '🔐 Reset Your LuxeDrive Password',
    html: baseTemplate(`
      <h1>Password Reset Request</h1>
      <p>Hi <span class="highlight">${data.userName}</span>, we received a request to reset your password.</p>
      <p>Click the button below to create a new password. This link expires in <strong style="color:#fff;">1 hour</strong>.</p>
      <a href="${data.resetUrl}" class="btn">Reset Password</a>
      <p style="margin-top:20px;font-size:12px;color:#4b5563;">If you did not request this, ignore this email. Your password will remain unchanged.</p>
    `),
  }),

}

// ── Send email function ────────────────────────────────────────
const sendEmail = async (to, templateName, data) => {
  // In development, skip sending if no email config
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log(`📧 [DEV] Email skipped (no SMTP config). Template: ${templateName}`, data)
    return
  }

  try {
    const transporter = createTransporter()
    const template    = templates[templateName]?.(data)

    if (!template) throw new Error(`Unknown email template: ${templateName}`)

    await transporter.sendMail({
      from:    process.env.EMAIL_FROM || 'LuxeDrive <noreply@luxedrive.com>',
      to,
      subject: template.subject,
      html:    template.html,
    })

    console.log(`📧 Email sent: ${templateName} → ${to}`)
  } catch (err) {
    // Non-fatal: log but don't crash the request
    console.error(`📧 Email send failed [${templateName}]:`, err.message)
  }
}

module.exports = { sendEmail }

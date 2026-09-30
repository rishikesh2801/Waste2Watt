// ─── Waste2Watt Branded Email Templates ──────────────────────────────────────

// Logo hosted on Cloudinary CDN — trusted by Gmail and all email clients
const LOGO_DATA_URL = 'https://res.cloudinary.com/dramctzi4/image/upload/v1781301681/waste2watt_logo.jpg';

const SITE_URL    = 'https://backpack-upload-enjoyer.ngrok-free.dev';
const BRAND_GREEN = '#16a34a';
const DARK_BLUE   = '#1a3a6b';
const ORANGE      = '#f97316';

// ─── Shared Header/Footer Wrapper ─────────────────────────────────────────────
const emailWrapper = (bodyHtml) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Waste2Watt — Municipal Corporation Roorkee</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap" rel="stylesheet"/>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0"
  style="max-width:600px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.10);">

  <!-- ── HEADER ── -->
  <tr>
    <td style="background:${DARK_BLUE};padding:28px 32px 20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center" style="padding-bottom:14px;">
            <!-- Logo embedded as base64 — always visible -->
            <img src="${LOGO_DATA_URL}" alt="Waste2Watt Logo" width="80" height="80"
              style="border-radius:50%;border:3px solid ${BRAND_GREEN};background:#fff;display:block;margin:0 auto 10px;"/>
            <!-- Brand Name with Montserrat font -->
            <span style="font-family:'Montserrat','Segoe UI',Arial,sans-serif;font-size:30px;font-weight:900;letter-spacing:-1px;line-height:1;">
              <span style="color:#ffffff;">Waste</span><span style="color:${ORANGE};">2</span><span style="color:#ffffff;">Watt</span>
            </span>
          </td>
        </tr>
        <tr>
          <td align="center">
            <span style="font-family:'Montserrat','Segoe UI',Arial,sans-serif;font-size:11px;font-weight:700;color:#93c5fd;letter-spacing:2px;text-transform:uppercase;">
              Waste2Watt by Municipal Corporation Roorkee
            </span>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-top:4px;">
            <span style="font-size:11px;color:#6b9fd4;font-style:italic;">Smart Segregation, Clean Generation</span>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- ── BODY ── -->
  <tr>
    <td style="padding:36px 40px;">
      ${bodyHtml}
    </td>
  </tr>

  <!-- ── FOOTER ── -->
  <tr>
    <td style="background:#f8fafc;border-top:1px solid #e5e7eb;padding:22px 40px;text-align:center;">
      <p style="margin:0 0 6px;font-family:'Montserrat','Segoe UI',Arial,sans-serif;font-size:13px;font-weight:700;color:#374151;">
        <span style="color:${DARK_BLUE};">Waste</span><span style="color:${ORANGE};">2</span><span style="color:${DARK_BLUE};">Watt</span>
        <span style="color:#6b7280;font-weight:400;font-size:11px;"> by Municipal Corporation Roorkee</span>
      </p>
      <p style="margin:0 0 4px;font-size:11px;color:#9ca3af;">
        Nagar Nigam Complex, Upper Ganga Canal Road, Civil Lines, Roorkee – 247667
      </p>
      <p style="margin:0 0 4px;font-size:11px;color:#9ca3af;">
        📞 1800-123-4567 &nbsp;|&nbsp; ✉️ help@roorkeew2w.in
      </p>
      <p style="margin:10px 0 0;font-size:10px;color:#d1d5db;">
        This is an automated message. Please do not reply to this email.
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;


// ─── 1. OTP Email ─────────────────────────────────────────────────────────────
const otpEmail = ({ name, otp }) => ({
  subject: '🔐 OTP Verification — Waste2Watt by Municipal Corporation Roorkee',
  html: emailWrapper(`
    <h2 style="margin:0 0 6px;font-family:'Montserrat','Segoe UI',Arial,sans-serif;font-size:22px;font-weight:900;color:${DARK_BLUE};">
      Email Verification
    </h2>
    <p style="margin:0 0 20px;color:#6b7280;font-size:13px;">
      Verify your identity to register a complaint on the Waste2Watt citizen portal.
    </p>

    <p style="color:#374151;font-size:15px;margin:0 0 6px;">Dear <strong>${name || 'Citizen'}</strong>,</p>
    <p style="color:#374151;font-size:14px;margin:0 0 24px;">
      Your One-Time Password (OTP) for complaint registration is:
    </p>

    <!-- OTP Box -->
    <div style="background:#f0fdf4;border:2px dashed ${BRAND_GREEN};border-radius:14px;padding:28px;text-align:center;margin:0 0 24px;">
      <div style="font-size:46px;font-weight:900;letter-spacing:14px;color:${DARK_BLUE};font-family:'Courier New',monospace;">
        ${otp}
      </div>
      <p style="margin:14px 0 0;font-size:12px;color:#6b7280;">
        Valid for <strong>10 minutes</strong> · Do not share with anyone
      </p>
    </div>

    <div style="background:#fef3c7;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:12px 16px;">
      <p style="margin:0;font-size:13px;color:#92400e;font-weight:600;">
        ⚠️ If you did not request this OTP, please ignore this email.
      </p>
    </div>
  `)
});


// ─── 2. Complaint Registered Email ───────────────────────────────────────────
const complaintRegisteredEmail = ({ name, trackingId, description, location, mobile, date }) => ({
  subject: `✅ Complaint Registered [${trackingId}] — Waste2Watt`,
  html: emailWrapper(`
    <!-- Success Banner -->
    <div style="background:${BRAND_GREEN};border-radius:12px;padding:22px;text-align:center;margin:0 0 28px;">
      <div style="font-size:36px;margin-bottom:8px;">✅</div>
      <h2 style="margin:0 0 6px;font-family:'Montserrat','Segoe UI',Arial,sans-serif;font-size:20px;font-weight:900;color:#fff;">
        Complaint Registered Successfully!
      </h2>
      <p style="margin:0;font-size:13px;color:#d1fae5;">
        Your complaint has been logged. Our team will act on it shortly.
      </p>
    </div>

    <p style="color:#374151;font-size:15px;margin:0 0 6px;">Dear <strong>${name}</strong>,</p>
    <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">
      Thank you for reaching out to Waste2Watt. Below are your complaint details:
    </p>

    <!-- Details Table -->
    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin:0 0 28px;border-collapse:collapse;">
      <tr style="background:#f1f5f9;">
        <td colspan="2" style="padding:11px 20px;font-size:11px;font-weight:700;color:#6b7280;letter-spacing:1.5px;text-transform:uppercase;">
          Complaint Details
        </td>
      </tr>
      <tr>
        <td style="padding:12px 20px;font-size:13px;font-weight:700;color:#374151;width:38%;border-bottom:1px solid #e5e7eb;">🎫 Tracking ID</td>
        <td style="padding:12px 20px;font-size:17px;font-weight:900;color:${DARK_BLUE};font-family:'Courier New',monospace;letter-spacing:2px;border-bottom:1px solid #e5e7eb;">${trackingId}</td>
      </tr>
      <tr style="background:#f9fafb;">
        <td style="padding:12px 20px;font-size:13px;font-weight:700;color:#374151;border-bottom:1px solid #e5e7eb;">👤 Name</td>
        <td style="padding:12px 20px;font-size:13px;color:#374151;border-bottom:1px solid #e5e7eb;">${name}</td>
      </tr>
      <tr>
        <td style="padding:12px 20px;font-size:13px;font-weight:700;color:#374151;border-bottom:1px solid #e5e7eb;">📞 Mobile</td>
        <td style="padding:12px 20px;font-size:13px;color:#374151;border-bottom:1px solid #e5e7eb;">${mobile}</td>
      </tr>
      <tr style="background:#f9fafb;">
        <td style="padding:12px 20px;font-size:13px;font-weight:700;color:#374151;border-bottom:1px solid #e5e7eb;">📍 Location</td>
        <td style="padding:12px 20px;font-size:13px;color:#374151;border-bottom:1px solid #e5e7eb;">${location}</td>
      </tr>
      <tr>
        <td style="padding:12px 20px;font-size:13px;font-weight:700;color:#374151;border-bottom:1px solid #e5e7eb;">📝 Issue</td>
        <td style="padding:12px 20px;font-size:13px;color:#374151;border-bottom:1px solid #e5e7eb;">${description}</td>
      </tr>
      <tr style="background:#f9fafb;">
        <td style="padding:12px 20px;font-size:13px;font-weight:700;color:#374151;">📅 Filed On</td>
        <td style="padding:12px 20px;font-size:13px;color:#374151;">${date}</td>
      </tr>
    </table>

    <!-- Tracking ID Highlight -->
    <div style="background:#eff6ff;border:2px solid ${DARK_BLUE};border-radius:12px;padding:18px 20px;text-align:center;margin:0 0 20px;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#6b7280;letter-spacing:1px;text-transform:uppercase;">
        Your Tracking ID — Save This!
      </p>
      <span style="font-size:28px;font-weight:900;color:${DARK_BLUE};font-family:'Courier New',monospace;letter-spacing:4px;">
        ${trackingId}
      </span>
    </div>

    <!-- Track Button -->
    <div style="text-align:center;margin:0 0 24px;">
      <p style="color:#6b7280;font-size:13px;margin:0 0 14px;">
        Click the button below to track your complaint status on our website:
      </p>
      <a href="${SITE_URL}"
        style="display:inline-block;background:${DARK_BLUE};color:#ffffff;font-family:'Montserrat','Segoe UI',Arial,sans-serif;font-weight:700;font-size:14px;padding:14px 32px;border-radius:10px;text-decoration:none;letter-spacing:0.5px;">
        🔍 Track My Complaint
      </a>
    </div>

    <!-- Info Box -->
    <div style="background:#eff6ff;border-left:4px solid #3b82f6;border-radius:0 8px 8px 0;padding:14px 18px;">
      <p style="margin:0;font-size:13px;color:#1d4ed8;font-weight:600;">
        ℹ️ Our team will resolve your issue within <strong>12–24 hours</strong>.
        You will receive another email once your complaint is resolved.
      </p>
    </div>
  `)
});


// ─── 3. Complaint Resolved Email ──────────────────────────────────────────────
const complaintResolvedEmail = ({ name, trackingId, description, location }) => ({
  subject: `🎉 Complaint Resolved [${trackingId}] — Waste2Watt`,
  html: emailWrapper(`
    <!-- Resolved Banner -->
    <div style="background:linear-gradient(135deg,${BRAND_GREEN},#15803d);border-radius:12px;padding:26px;text-align:center;margin:0 0 28px;">
      <div style="font-size:40px;margin-bottom:8px;">🎉</div>
      <h2 style="margin:0 0 6px;font-family:'Montserrat','Segoe UI',Arial,sans-serif;font-size:20px;font-weight:900;color:#fff;">
        Your Complaint Has Been Resolved!
      </h2>
      <p style="margin:0;font-size:13px;color:#d1fae5;">
        Thank you for helping us keep Roorkee clean and green. 🌿
      </p>
    </div>

    <p style="color:#374151;font-size:15px;margin:0 0 6px;">Dear <strong>${name}</strong>,</p>
    <p style="color:#6b7280;font-size:14px;margin:0 0 24px;">
      We are pleased to inform you that your complaint has been successfully
      resolved by our field team.
    </p>

    <!-- Resolution Summary -->
    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin:0 0 24px;border-collapse:collapse;">
      <tr style="background:#f1f5f9;">
        <td colspan="2" style="padding:11px 20px;font-size:11px;font-weight:700;color:#6b7280;letter-spacing:1.5px;text-transform:uppercase;">
          Resolution Summary
        </td>
      </tr>
      <tr>
        <td style="padding:12px 20px;font-size:13px;font-weight:700;color:#374151;width:38%;border-bottom:1px solid #e5e7eb;">🎫 Tracking ID</td>
        <td style="padding:12px 20px;font-size:16px;font-weight:900;color:${DARK_BLUE};font-family:'Courier New',monospace;letter-spacing:2px;border-bottom:1px solid #e5e7eb;">${trackingId}</td>
      </tr>
      <tr style="background:#f9fafb;">
        <td style="padding:12px 20px;font-size:13px;font-weight:700;color:#374151;border-bottom:1px solid #e5e7eb;">📝 Issue</td>
        <td style="padding:12px 20px;font-size:13px;color:#374151;border-bottom:1px solid #e5e7eb;">${description}</td>
      </tr>
      <tr>
        <td style="padding:12px 20px;font-size:13px;font-weight:700;color:#374151;">📍 Location</td>
        <td style="padding:12px 20px;font-size:13px;color:#374151;">${location}</td>
      </tr>
    </table>

    <!-- Status Badge -->
    <div style="background:#f0fdf4;border:2px solid #bbf7d0;border-radius:10px;padding:16px;text-align:center;margin:0 0 24px;">
      <p style="margin:0;font-size:15px;color:#15803d;font-weight:800;">
        ✅ Status: <span style="color:${BRAND_GREEN};">RESOLVED</span>
      </p>
    </div>

    <!-- Portal Link -->
    <div style="text-align:center;">
      <p style="color:#6b7280;font-size:13px;margin:0 0 14px;">
        Have another issue? Visit our portal to register a new complaint:
      </p>
      <a href="${SITE_URL}"
        style="display:inline-block;background:${DARK_BLUE};color:#ffffff;font-family:'Montserrat','Segoe UI',Arial,sans-serif;font-weight:700;font-size:14px;padding:14px 32px;border-radius:10px;text-decoration:none;letter-spacing:0.5px;">
        🌐 Visit Waste2Watt Portal
      </a>
    </div>
  `)
});


module.exports = { otpEmail, complaintRegisteredEmail, complaintResolvedEmail };

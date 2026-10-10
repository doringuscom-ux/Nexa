// config/emailConfig.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@nexainfotech.in";
const FROM_EMAIL = process.env.FROM_EMAIL || "Nexa Infotech <onboarding@resend.dev>";
const GOOGLE_SCRIPT_WEBAPP_URL = process.env.GOOGLE_SCRIPT_WEBAPP_URL;

/**
 * Send email notification to admin when a new contact form is submitted
 */
const sendAdminEmail = async ({ name, phone, email, message }) => {
  // 1. Agar Google Apps Script URL diya hai to usse direct bhejo (No domain verification needed, Free & Fast)
  if (GOOGLE_SCRIPT_WEBAPP_URL) {
    try {
      console.log("📤 Sending email via Google Apps Script Web App...");
      const response = await fetch(GOOGLE_SCRIPT_WEBAPP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, message }),
      });

      const text = await response.text();
      let result = {};
      try {
        result = JSON.parse(text);
      } catch (e) {
        result = { raw: text };
      }

      console.log("✅ Mail sent successfully via Google Apps Script:", result);
      return { success: true, via: "google_apps_script", result };
    } catch (err) {
      console.error("❌ Google Apps Script email failed:", err.message);
      // Agar fail hua toh niche Resend par fallback karega
    }
  }

  // 2. Resend Fallback
  if (!process.env.RESEND_API_KEY) {
    return { success: false, error: "Neither GOOGLE_SCRIPT_WEBAPP_URL nor RESEND_API_KEY is configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
              .header { background: #1a1a2e; color: #f5c518; padding: 24px; text-align: center; }
              .header h1 { margin: 0; font-size: 22px; }
              .body { padding: 24px; }
              .field { margin-bottom: 16px; }
              .label { font-weight: bold; color: #555; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
              .value { margin-top: 4px; color: #222; font-size: 15px; }
              .message-box { background: #f9f9f9; border-left: 4px solid #f5c518; padding: 12px 16px; border-radius: 4px; color: #333; }
              .footer { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; color: #999; font-size: 11px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>New Contact Form Submission</h1>
              </div>
              <div class="body">
                <div class="field">
                  <div class="label">Name</div>
                  <div class="value">${name}</div>
                </div>
                <div class="field">
                  <div class="label">Email</div>
                  <div class="value">${email}</div>
                </div>
                <div class="field">
                  <div class="label">Phone</div>
                  <div class="value">${phone || "Not provided"}</div>
                </div>
                <div class="field">
                  <div class="label">Message</div>
                  <div class="message-box">${message}</div>
                </div>
                <div class="field">
                  <div class="label">Submitted At</div>
                  <div class="value">${new Date().toLocaleString()}</div>
                </div>
              </div>
              <div class="footer">
                Nexa Infotech. All rights reserved.
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend API error:", error);
      return { success: false, error };
    }

    return { success: true, messageId: data && data.id };
  } catch (err) {
    console.error("sendAdminEmail exception:", err);
    return { success: false, error: err.message };
  }
};

module.exports = { sendAdminEmail };

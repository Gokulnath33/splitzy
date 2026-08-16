const nodemailer = require("nodemailer");

const ADMIN_EMAIL = "gokulnath2006mg@gmail.com";
let transporter;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify SMTP connection on first use
    try {
      await transporter.verify();
      console.log("[Email] SMTP connection verified successfully");
    } catch (err) {
      console.error("[Email] SMTP connection FAILED:", err.message);
      transporter = null;
      throw err;
    }
  } else {
    // Ethereal fallback for dev/testing
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`[Email] Using Ethereal test account: ${testAccount.user}`);
  }

  return transporter;
}

/**
 * Send Password Reset Verification Code Email
 */
async function sendPasswordResetCodeEmail({ toEmail, userName, code }) {
  if (!toEmail) return;
  try {
    const mailer = await getTransporter();
    const info = await mailer.sendMail({
      from: process.env.EMAIL_FROM || '"Splitzy Security" <security@splitzy.app>',
      to: toEmail,
      subject: `🔑 Password Reset Verification Code: ${code}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FBF9F1; padding: 30px; border-radius: 12px; color: #111827;">
          <h2 style="color: #0B4F4A; margin-top: 0;">Password Reset Request</h2>
          <p>Hi <strong>${userName}</strong>,</p>
          <p style="font-size: 15px;">
            We received a request to reset your password for your Splitzy account. Your 6-digit verification code is:
          </p>
          <div style="background-color: #0B4F4A; color: #FFFFFF; font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 18px; border-radius: 10px; margin: 20px 0; font-family: monospace;">
            ${code}
          </div>
          <p style="font-size: 13px; color: #6B7280;">
            This code will expire in <strong>15 minutes</strong>. If you did not request a password reset, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 25px 0;" />
          <p style="font-size: 12px; color: #9CA3AF;">Splitzy Security Alert</p>
        </div>
      `,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Password Reset Code Sent] Ethereal Preview URL: ${previewUrl}`);
    }
  } catch (err) {
    console.error("[Password Reset Email Failed]", err.message);
  }
}

/**
 * Send approval request email to Admin for new registration
 */
async function sendAdminApprovalRequestEmail({ newUser, approveUrl }) {
  try {
    const mailer = await getTransporter();
    const info = await mailer.sendMail({
      from: process.env.EMAIL_FROM || '"Splitzy Admin Security" <admin@splitzy.app>',
      to: ADMIN_EMAIL,
      subject: `🔔 Admin Action Required: New User Signup Request (${newUser.name})`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FBF9F1; padding: 30px; border-radius: 12px; color: #111827;">
          <h2 style="color: #0B4F4A; margin-top: 0;">New User Signup Request</h2>
          <p>Hello Admin,</p>
          <p style="font-size: 15px;">
            A new user has registered on Splitzy and is awaiting your approval before gaining access:
          </p>
          <div style="background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 4px 0;"><strong>Name:</strong> ${newUser.name}</p>
            <p style="margin: 4px 0;"><strong>Email:</strong> ${newUser.email}</p>
            <p style="margin: 4px 0;"><strong>Date:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p style="margin-top: 25px;">
            <a href="${approveUrl}" style="background-color: #0B4F4A; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Approve User & Enable Access
            </a>
          </p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 25px 0;" />
          <p style="font-size: 12px; color: #6B7280;">If the button above does not work, copy and paste this link into your browser:<br/><a href="${approveUrl}">${approveUrl}</a></p>
        </div>
      `,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Admin Approval Email Sent] Ethereal Preview URL: ${previewUrl}`);
    }
  } catch (err) {
    console.error("[Admin Approval Email Failed]", err.message);
  }
}

/**
 * Send user confirmation email once admin approves account
 */
async function sendUserApprovedEmail({ userEmail, userName }) {
  if (!userEmail) return;
  try {
    const mailer = await getTransporter();
    const info = await mailer.sendMail({
      from: process.env.EMAIL_FROM || '"Splitzy Team" <notifications@splitzy.app>',
      to: userEmail,
      subject: `🎉 Account Approved! Welcome to Splitzy`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FBF9F1; padding: 30px; border-radius: 12px; color: #111827;">
          <h2 style="color: #0B4F4A; margin-top: 0;">Account Approved!</h2>
          <p>Hi <strong>${userName}</strong>,</p>
          <p style="font-size: 16px;">
            Great news! Your Splitzy account has been approved by the administrator.
          </p>
          <p style="font-size: 15px;">
            You can now log in and start splitting expenses with your groups in real-time.
          </p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
          <p style="font-size: 12px; color: #6B7280;">Splitzy — Real-time expense sharing made simple.</p>
        </div>
      `,
    });

    console.log(`[Email] User approved email sent to ${userEmail} | MessageId: ${info.messageId} | Response: ${info.response}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[User Approved Email Sent] Ethereal Preview URL: ${previewUrl}`);
    }
    return true;
  } catch (err) {
    console.error(`[Email] FAILED to send approved email to ${userEmail}:`, err.message);
    return false;
  }
}

/**
 * Send payment received email notification
 */
async function sendPaymentReceivedEmail({ toEmail, recipientName, payerName, amount, groupName, currencySymbol = "₹" }) {
  if (!toEmail) return;
  try {
    const mailer = await getTransporter();
    await mailer.sendMail({
      from: process.env.EMAIL_FROM || '"Splitzy Alerts" <notifications@splitzy.app>',
      to: toEmail,
      subject: `💰 Payment Received: ${payerName} sent you ${currencySymbol}${amount.toFixed(2)} in ${groupName}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FBF9F1; padding: 30px; border-radius: 12px; color: #111827;">
          <h2 style="color: #0B4F4A; margin-top: 0;">Payment Notification</h2>
          <p>Hi <strong>${recipientName}</strong>,</p>
          <p style="font-size: 16px;">
            <strong>${payerName}</strong> has marked a payment of 
            <span style="color: #0B4F4A; font-weight: bold; font-size: 18px;">${currencySymbol}${amount.toFixed(2)}</span> 
            as paid in the group <strong>${groupName}</strong>.
          </p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
          <p style="font-size: 12px; color: #6B7280;">Log in to Splitzy to view your updated balance and group settlement status.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("[Email Alert Failed]", err.message);
  }
}

/**
 * Send new expense notification to group members
 */
async function sendExpenseAddedEmail({ memberEmails, payerName, description, amount, groupName, currencySymbol = "₹" }) {
  if (!memberEmails || !memberEmails.length) return;
  try {
    const mailer = await getTransporter();
    await mailer.sendMail({
      from: process.env.EMAIL_FROM || '"Splitzy Alerts" <notifications@splitzy.app>',
      to: memberEmails.join(", "),
      subject: `🧾 New Expense in ${groupName}: ${description}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FBF9F1; padding: 30px; border-radius: 12px; color: #111827;">
          <h2 style="color: #0B4F4A; margin-top: 0;">New Expense Added</h2>
          <p style="font-size: 16px;">
            <strong>${payerName}</strong> added <strong>"${description}"</strong> for 
            <span style="color: #0B4F4A; font-weight: bold;">${currencySymbol}${Number(amount).toFixed(2)}</span> 
            in <strong>${groupName}</strong>.
          </p>
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;" />
          <p style="font-size: 12px; color: #6B7280;">Log in to Splitzy to view your share and updated balances.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("[Expense Email Failed]", err.message);
  }
}

module.exports = {
  ADMIN_EMAIL,
  sendPasswordResetCodeEmail,
  sendAdminApprovalRequestEmail,
  sendUserApprovedEmail,
  sendPaymentReceivedEmail,
  sendExpenseAddedEmail,
};

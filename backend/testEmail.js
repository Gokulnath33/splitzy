const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  try {
    console.log('Testing email configuration...');
    console.log('SMTP Host:', process.env.SMTP_HOST);
    console.log('SMTP User:', process.env.SMTP_USER);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully');

    // Send test email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Splitzy Test" <test@splitzy.app>',
      to: 'gokulnath2006mg2@gmail.com',
      subject: '🧪 Test Email from Splitzy',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #10b981;">Test Email</h2>
          <p>This is a test email from Splitzy backend.</p>
          <p>If you receive this, email configuration is working correctly!</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        </div>
      `,
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);

    process.exit(0);
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testEmail();

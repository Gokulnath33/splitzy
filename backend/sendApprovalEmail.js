require('dotenv').config();
const { sendUserApprovedEmail } = require('./utils/email.js');

async function sendManualApprovalEmail() {
  try {
    console.log('Environment check:');
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_USER:', process.env.SMTP_USER);
    console.log('SMTP_PASS configured:', !!process.env.SMTP_PASS);

    console.log('\nSending manual approval email to gokulnath2006mg2@gmail.com...');

    const result = await sendUserApprovedEmail({
      userEmail: 'gokulnath2006mg2@gmail.com',
      userName: 'gokul2'
    });

    if (result) {
      console.log('✅ Approval email sent successfully!');
    } else {
      console.log('❌ Approval email failed to send');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

sendManualApprovalEmail();

require('dotenv').config({ path: '.env.development' });
const EmailService = require('./src/services/EmailService');

console.log('\n🔧 EMAIL CONFIGURATION TEST\n');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_APP_PASSWORD:', process.env.EMAIL_APP_PASSWORD ? '***SET***' : '❌ NOT SET');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

// Test sending OTP
async function testEmail() {
  try {
    console.log('\n📧 Testing email sending...\n');
    
    const result = await EmailService.sendOTPEmail('khaingmemekyaw5@gmail.com', '123456', 'test');
    console.log('Email result:', result);
  } catch (error) {
    console.error('Email test error:', error.message);
  }
}

testEmail();
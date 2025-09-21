const { runTest, sendEmail, generateTestReport } = require('./scheduled-tests');

async function testSchedule() {
  console.log('🧪 Testing scheduled system (ignoring time restrictions)...');
  
  const tests = ['nfl', 'football'];
  
  for (const testType of tests) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🏃 Testing ${testType.toUpperCase()}...`);
    
    try {
      // Run the test
      const success = await runTest(testType);
      
      // Generate and send report
      const report = generateTestReport(testType, success);
      
      // Send email
      const timestamp = new Date().toLocaleString('en-GB', {
        timeZone: 'Europe/London',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'davidjarrett001@gmail.com',
          pass: 'xbzn daxk fnpo xnuo'
        }
      });
      
      const mailOptions = {
        from: 'davidjarrett001@gmail.com',
        to: 'davidjarrett001@gmail.com',
        subject: `PSG ${testType.toUpperCase()} Test Report - ${timestamp} UK (Test Run)`,
        html: report
      };
      
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ ${testType.toUpperCase()} email sent! Message ID: ${info.messageId}`);
      
    } catch (error) {
      console.error(`❌ Error with ${testType.toUpperCase()}:`, error.message);
    }
  }
  
  console.log('\n🎉 Test schedule system verified!');
}

testSchedule().catch(console.error);

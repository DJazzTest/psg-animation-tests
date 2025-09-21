const { execSync } = require('child_process');
const fs = require('fs');

console.log('🏈 Running PSG NFL Test Only...');

try {
  // Run ONLY the NFL test
  execSync('npx playwright test tests/specs/planetsports/PSG.NFL.Animations.spec.ts --project=chromium', { 
    stdio: 'inherit',
    cwd: '/Users/davidjarrett/Documents/psg-animation-tests'
  });
  
  console.log('\n✅ NFL test completed!');
  
  // Read the NFL results file
  const nflResults = JSON.parse(fs.readFileSync('/Users/davidjarrett/Documents/psg-animation-tests/nfl-events-results.json', 'utf8'));
  
  console.log('\n📊 NFL Test Results:');
  console.log(`Sport: ${nflResults.sport}`);
  console.log(`Total Events Found: ${nflResults.totalEvents}`);
  console.log(`Events Passed: ${nflResults.passedEvents}`);
  console.log(`Events Failed: ${nflResults.failedEvents}`);
  console.log(`Success Rate: ${Math.round((nflResults.passedEvents / nflResults.totalEvents) * 100)}%`);
  
  // Generate simple HTML report for NFL only
  const htmlReport = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>PSG NFL Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f8f9fa; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; }
        .summary { display: flex; justify-content: space-around; margin: 20px 0; }
        .summary-item { text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px; margin: 0 10px; }
        .summary-number { font-size: 2em; font-weight: bold; }
        .summary-label { color: #6c757d; margin-top: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏈 PSG NFL Test Report</h1>
            <p>Automated Test Results - ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <div class="summary-item">
                <div class="summary-number" style="color: #28a745">✅</div>
                <div class="summary-label">Overall Status</div>
            </div>
            <div class="summary-item">
                <div class="summary-number">${nflResults.totalEvents}</div>
                <div class="summary-label">Total Events</div>
            </div>
            <div class="summary-item">
                <div class="summary-number" style="color: #28a745">${nflResults.passedEvents}</div>
                <div class="summary-label">Passed</div>
            </div>
            <div class="summary-item">
                <div class="summary-number" style="color: #dc3545">${nflResults.failedEvents}</div>
                <div class="summary-label">Failed</div>
            </div>
            <div class="summary-item">
                <div class="summary-number" style="color: #28a745">${Math.round((nflResults.passedEvents / nflResults.totalEvents) * 100)}%</div>
                <div class="summary-label">Success Rate</div>
            </div>
        </div>
        
        <h2>🏈 NFL Events Tested</h2>
        <p><strong>Sport:</strong> ${nflResults.sport}</p>
        <p><strong>Events Found:</strong> ${nflResults.totalEvents}</p>
        <p><strong>Events Passed:</strong> ${nflResults.passedEvents}</p>
        <p><strong>Events Failed:</strong> ${nflResults.failedEvents}</p>
        <p><strong>Success Rate:</strong> ${Math.round((nflResults.passedEvents / nflResults.totalEvents) * 100)}%</p>
        
        <h3>✅ Passed Events:</h3>
        <ul>
            ${nflResults.events.filter(e => e.result === 'PASS').map(e => `<li>${e.event} (${e.tab})</li>`).join('')}
        </ul>
        
        ${nflResults.failedEvents > 0 ? `
        <h3>❌ Failed Events:</h3>
        <ul>
            ${nflResults.events.filter(e => e.result === 'FAIL').map(e => `<li>${e.event} (${e.tab}) - ${e.failureReason}</li>`).join('')}
        </ul>
        ` : '<p>🎉 All events passed successfully!</p>'}
    </div>
</body>
</html>`;
  
  // Save the report
  fs.writeFileSync('/Users/davidjarrett/Documents/psg-animation-tests/nfl-only-report.html', htmlReport);
  console.log('\n📄 NFL-only report generated: nfl-only-report.html');
  
  // Send email
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
    subject: 'PSG NFL Test Report - NFL Only',
    html: htmlReport
  };
  
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('❌ Error sending email:', error);
    } else {
      console.log('✅ NFL-only email sent successfully!');
      console.log('📧 Message ID:', info.messageId);
    }
  });
  
} catch (error) {
  console.error('❌ Error:', error.message);
}

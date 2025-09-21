const { execSync } = require('child_process');
const fs = require('fs');

console.log('⚽ Running PSG Football Test Only...');

try {
  // Run ONLY the Football test
  execSync('npx playwright test tests/specs/planetsports/PSG.Football.Animations.spec.ts --project=chromium', { 
    stdio: 'inherit',
    cwd: '/Users/davidjarrett/Documents/psg-animation-tests'
  });
  
  console.log('\n✅ Football test completed!');
  
  // Read the Football results file
  const footballResults = JSON.parse(fs.readFileSync('/Users/davidjarrett/Documents/psg-animation-tests/football-events-results.json', 'utf8'));
  
  console.log('\n📊 Football Test Results:');
  console.log(`Sport: ${footballResults.sport}`);
  console.log(`Total Events Found: ${footballResults.totalEvents}`);
  console.log(`Events Passed: ${footballResults.passedEvents}`);
  console.log(`Events Failed: ${footballResults.failedEvents}`);
  console.log(`Success Rate: ${Math.round((footballResults.passedEvents / footballResults.totalEvents) * 100)}%`);
  
  // Generate simple HTML report for Football only
  const htmlReport = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>PSG Football Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f8f9fa; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; }
        .summary { display: flex; justify-content: space-around; margin: 20px 0; }
        .summary-item { text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px; margin: 0 10px; }
        .summary-number { font-size: 2em; font-weight: bold; }
        .summary-label { color: #6c757d; margin-top: 5px; }
        .league-section { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚽ PSG Football Test Report</h1>
            <p>Automated Test Results - ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <div class="summary-item">
                <div class="summary-number" style="color: ${footballResults.failedEvents > 0 ? '#dc3545' : '#28a745'}">${footballResults.failedEvents > 0 ? '❌' : '✅'}</div>
                <div class="summary-label">Overall Status</div>
            </div>
            <div class="summary-item">
                <div class="summary-number">${footballResults.totalEvents}</div>
                <div class="summary-label">Total Events</div>
            </div>
            <div class="summary-item">
                <div class="summary-number" style="color: #28a745">${footballResults.passedEvents}</div>
                <div class="summary-label">Passed</div>
            </div>
            <div class="summary-item">
                <div class="summary-number" style="color: #dc3545">${footballResults.failedEvents}</div>
                <div class="summary-label">Failed</div>
            </div>
            <div class="summary-item">
                <div class="summary-number" style="color: ${footballResults.failedEvents > 0 ? '#dc3545' : '#28a745'}">${Math.round((footballResults.passedEvents / footballResults.totalEvents) * 100)}%</div>
                <div class="summary-label">Success Rate</div>
            </div>
        </div>
        
        <h2>⚽ Football Events Tested</h2>
        <p><strong>Sport:</strong> ${footballResults.sport}</p>
        <p><strong>Events Found:</strong> ${footballResults.totalEvents}</p>
        <p><strong>Events Passed:</strong> ${footballResults.passedEvents}</p>
        <p><strong>Events Failed:</strong> ${footballResults.failedEvents}</p>
        <p><strong>Success Rate:</strong> ${Math.round((footballResults.passedEvents / footballResults.totalEvents) * 100)}%</p>
        
        <h3>✅ Passed Events:</h3>
        <ul>
            ${footballResults.events.filter(e => e.result === 'PASS').map(e => `<li>${e.event} (${e.timePeriod}, ${e.league})</li>`).join('')}
        </ul>
        
        ${footballResults.failedEvents > 0 ? `
        <h3>❌ Failed Events:</h3>
        <ul>
            ${footballResults.events.filter(e => e.result === 'FAIL').map(e => `<li>${e.event} (${e.timePeriod}, ${e.league}) - ${e.failureReason}</li>`).join('')}
        </ul>
        ` : '<p>🎉 All events passed successfully!</p>'}
        
        <h3>🏆 Results by League:</h3>
        ${Object.entries(footballResults.events.reduce((acc, event) => {
          const league = event.league || 'Unknown League';
          if (!acc[league]) acc[league] = { total: 0, passed: 0, failed: 0 };
          acc[league].total++;
          if (event.result === 'PASS') acc[league].passed++;
          else if (event.result === 'FAIL') acc[league].failed++;
          return acc;
        }, {})).map(([league, stats]) => `
        <div class="league-section">
          <h4>${league}</h4>
          <p>Total: ${stats.total} | Passed: ${stats.passed} | Failed: ${stats.failed} | Success Rate: ${Math.round((stats.passed / stats.total) * 100)}%</p>
        </div>
        `).join('')}
    </div>
</body>
</html>`;
  
  // Save the report
  fs.writeFileSync('/Users/davidjarrett/Documents/psg-animation-tests/football-only-report.html', htmlReport);
  console.log('\n📄 Football-only report generated: football-only-report.html');
  
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
    subject: 'PSG Football Test Report - Football Only',
    html: htmlReport
  };
  
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('❌ Error sending email:', error);
    } else {
      console.log('✅ Football-only email sent successfully!');
      console.log('📧 Message ID:', info.messageId);
    }
  });
  
} catch (error) {
  console.error('❌ Error:', error.message);
}

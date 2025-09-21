const { execSync } = require('child_process');
const fs = require('fs');
const nodemailer = require('nodemailer');

// Test schedule configuration
const TEST_SCHEDULE = [
  { time: '17:05', tests: ['nfl', 'football'], description: '5:05 PM UK - NFL & Football' },
  { time: '18:05', tests: ['nfl', 'football'], description: '6:05 PM UK - NFL & Football' },
  { time: '19:45', tests: ['nfl', 'football'], description: '7:45 PM UK - NFL & Football' },
  { time: '20:30', tests: ['nfl', 'football'], description: '8:30 PM UK - NFL & Football' }
];

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'davidjarrett001@gmail.com',
    pass: 'xbzn daxk fnpo xnuo'
  }
});

// Function to run a specific test
async function runTest(testType) {
  console.log(`\n🏃 Running ${testType.toUpperCase()} test...`);
  
  try {
    const testFile = testType === 'nfl' 
      ? 'tests/specs/planetsports/PSG.NFL.Animations.spec.ts'
      : 'tests/specs/planetsports/PSG.Football.Animations.spec.ts';
    
    execSync(`npx playwright test ${testFile} --project=chromium`, { 
      stdio: 'inherit',
      cwd: '/Users/davidjarrett/Documents/psg-animation-tests'
    });
    
    console.log(`✅ ${testType.toUpperCase()} test completed successfully!`);
    return true;
  } catch (error) {
    console.log(`⚠️ ${testType.toUpperCase()} test completed with issues: ${error.message}`);
    return false;
  }
}

// Function to generate test report
function generateTestReport(testType, success) {
  const resultsFile = testType === 'nfl' 
    ? 'nfl-events-results.json' 
    : 'football-events-results.json';
  
  let results = {
    testName: `${testType.toUpperCase()} Test`,
    sport: testType === 'nfl' ? 'NFL (PSG)' : 'Football (PSG)',
    totalEvents: 0,
    passedEvents: 0,
    failedEvents: 0,
    errorEvents: 0,
    events: []
  };
  
  try {
    if (fs.existsSync(resultsFile)) {
      results = JSON.parse(fs.readFileSync(resultsFile, 'utf8'));
    }
  } catch (error) {
    console.log(`⚠️ Could not read ${resultsFile}: ${error.message}`);
  }
  
  const timestamp = new Date().toLocaleString('en-GB', {
    timeZone: 'Europe/London',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  const successRate = results.totalEvents > 0 ? Math.round((results.passedEvents / results.totalEvents) * 100) : 0;
  const statusIcon = results.failedEvents === 0 && results.errorEvents === 0 ? '✅' : '⚠️';
  const statusColor = results.failedEvents === 0 && results.errorEvents === 0 ? '#28a745' : '#dc3545';
  
  const sportEmoji = testType === 'nfl' ? '🏈' : '⚽';
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>PSG ${testType.toUpperCase()} Scheduled Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f8f9fa; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; }
        .summary { display: flex; justify-content: space-around; margin: 20px 0; }
        .summary-item { text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px; margin: 0 10px; }
        .summary-number { font-size: 2em; font-weight: bold; }
        .summary-label { color: #6c757d; margin-top: 5px; }
        .schedule-info { background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${sportEmoji} PSG ${testType.toUpperCase()} Scheduled Test Report</h1>
            <p>Automated Test Results - ${timestamp} UK Time</p>
        </div>
        
        <div class="schedule-info">
            <h3>📅 Test Schedule Information</h3>
            <p><strong>Test Type:</strong> ${testType.toUpperCase()} Animation Check</p>
            <p><strong>Platform:</strong> PlanetSportBet (PSG)</p>
            <p><strong>Test Time:</strong> ${timestamp}</p>
            <p><strong>Test Status:</strong> ${success ? 'Completed Successfully' : 'Completed with Issues'}</p>
        </div>
        
        <div class="summary">
            <div class="summary-item">
                <div class="summary-number" style="color: ${statusColor}">${statusIcon}</div>
                <div class="summary-label">Overall Status</div>
            </div>
            <div class="summary-item">
                <div class="summary-number">${results.totalEvents}</div>
                <div class="summary-label">Total Events</div>
            </div>
            <div class="summary-item">
                <div class="summary-number" style="color: #28a745">${results.passedEvents}</div>
                <div class="summary-label">Passed</div>
            </div>
            <div class="summary-item">
                <div class="summary-number" style="color: #dc3545">${results.failedEvents + results.errorEvents}</div>
                <div class="summary-label">Failed/Error</div>
            </div>
            <div class="summary-item">
                <div class="summary-number" style="color: ${statusColor}">${successRate}%</div>
                <div class="summary-label">Success Rate</div>
            </div>
        </div>
        
        <h2>${sportEmoji} ${testType.toUpperCase()} Events Tested</h2>
        <p><strong>Sport:</strong> ${results.sport}</p>
        <p><strong>Events Found:</strong> ${results.totalEvents}</p>
        <p><strong>Events Passed:</strong> ${results.passedEvents}</p>
        <p><strong>Events Failed:</strong> ${results.failedEvents}</p>
        <p><strong>Events Error:</strong> ${results.errorEvents}</p>
        <p><strong>Success Rate:</strong> ${successRate}%</p>
        
        ${results.events.length > 0 ? `
        <h3>📋 Event Details:</h3>
        <ul>
            ${results.events.map(event => {
              const status = event.result === 'PASS' ? '✅' : event.result === 'FAIL' ? '❌' : '⚠️';
              const timeInfo = event.timePeriod || event.tab || 'N/A';
              const leagueInfo = event.league || event.competition || 'N/A';
              return `<li>${status} ${event.event} (${timeInfo}, ${leagueInfo})</li>`;
            }).join('')}
        </ul>
        ` : ''}
        
        <div class="schedule-info">
            <h3>🔄 Next Scheduled Tests</h3>
            <p>This test is part of a scheduled testing program running at:</p>
            <ul>
                <li>17:05 UK Time - NFL & Football</li>
                <li>18:05 UK Time - NFL & Football</li>
                <li>19:45 UK Time - NFL & Football</li>
                <li>20:30 UK Time - NFL & Football</li>
            </ul>
        </div>
    </div>
</body>
</html>`;
}

// Function to send email
async function sendEmail(testType, success) {
  const report = generateTestReport(testType, success);
  const timestamp = new Date().toLocaleString('en-GB', {
    timeZone: 'Europe/London',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const mailOptions = {
    from: 'davidjarrett001@gmail.com',
    to: 'davidjarrett001@gmail.com',
    subject: `PSG ${testType.toUpperCase()} Scheduled Test Report - ${timestamp} UK`,
    html: report
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ ${testType.toUpperCase()} email sent successfully!`);
    console.log(`📧 Message ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending ${testType.toUpperCase()} email:`, error);
    return false;
  }
}

// Function to run scheduled tests
async function runScheduledTests() {
  const now = new Date();
  const ukTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/London' }));
  const currentTime = ukTime.toTimeString().slice(0, 5); // HH:MM format
  
  console.log(`\n🕐 Current UK Time: ${currentTime}`);
  
  // Find matching schedule
  const schedule = TEST_SCHEDULE.find(s => s.time === currentTime);
  
  if (!schedule) {
    console.log(`ℹ️ No scheduled tests for ${currentTime} UK time`);
    return;
  }
  
  console.log(`\n📅 Running scheduled tests: ${schedule.description}`);
  
  // Run each test in the schedule
  for (const testType of schedule.tests) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🏃 Starting ${testType.toUpperCase()} test...`);
    
    const success = await runTest(testType);
    await sendEmail(testType, success);
    
    console.log(`✅ ${testType.toUpperCase()} test and email completed!`);
  }
  
  console.log(`\n🎉 All scheduled tests completed for ${currentTime} UK time!`);
}

// Main execution
if (require.main === module) {
  runScheduledTests().catch(console.error);
}

module.exports = { runScheduledTests, runTest, sendEmail, generateTestReport };

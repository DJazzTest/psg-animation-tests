const fs = require('fs');
const path = require('path');

// Read test results from JSON files
function readTestResults() {
  let allResults = {
    stats: { total: 0, passed: 0, failed: 0, skipped: 0 },
    tests: [],
    individualEvents: []
  };
  
  try {
    // Check for the main JSON output file
    const jsonFile = './test-results-json.json';
    if (!fs.existsSync(jsonFile)) {
      console.log('No test results JSON file found, creating empty report');
      return allResults;
    }
    
    const content = fs.readFileSync(jsonFile, 'utf8');
    const data = JSON.parse(content);
    
    // Handle the actual Playwright JSON format
    if (data.stats) {
      allResults.stats.total = data.stats.expected + data.stats.unexpected;
      allResults.stats.passed = data.stats.expected;
      allResults.stats.failed = data.stats.unexpected;
      allResults.stats.skipped = data.stats.skipped || 0;
    }
    
    if (data.suites) {
      data.suites.forEach(suite => {
        if (suite.specs) {
          suite.specs.forEach(spec => {
            if (spec.tests) {
              spec.tests.forEach(test => {
                const testResult = test.results?.[0];
                allResults.tests.push({
                  title: spec.title, // Use spec.title instead of test.title
                  status: testResult?.status || 'unknown',
                  duration: testResult?.duration || 0,
                  error: testResult?.error?.message || null,
                  sport: extractSportFromTitle(spec.title),
                  file: spec.file
                });
              });
            }
          });
        }
      });
    }
    
    // Read individual event results from separate JSON files
    const eventFiles = [
      'football-events-results.json',
      'tennis-events-results.json', 
      'cricket-events-results.json',
      'nfl-events-results.json'
    ];
    
    eventFiles.forEach(file => {
      if (fs.existsSync(file)) {
        try {
          const eventData = JSON.parse(fs.readFileSync(file, 'utf8'));
          allResults.individualEvents.push(eventData);
          console.log(`📊 Loaded ${eventData.totalEvents} events from ${file}`);
        } catch (error) {
          console.log(`⚠️ Could not read ${file}:`, error.message);
        }
      }
    });
    
  } catch (error) {
    console.error('Error reading test results:', error.message);
  }
  
  return allResults;
}

function extractSportFromTitle(title) {
  if (!title) return 'Unknown';
  
  console.log('Extracting sport from title:', title);
  
  // Check for specific test names first (most specific)
  if (title.includes('PlanetSportBet – Football Animation Check')) return 'Football (PSG)';
  if (title.includes('PlanetSportBet – Tennis Tab Animation Check')) return 'Tennis (PSG)';
  if (title.includes('PlanetSportBet – Cricket Tab Animation Check')) return 'Cricket (PSG)';
  if (title.includes('PlanetSportBet – American Football Live Tracker Check')) return 'NFL (PSG)';
  
  // Check for StarSports test names
  if (title.includes('StarSports – Football Animation Check')) return 'Football (StarSports)';
  if (title.includes('StarSports – Tennis Tab Animation Check')) return 'Tennis (StarSports)';
  if (title.includes('StarSports – Cricket Tab Animation Check')) return 'Cricket (StarSports)';
  if (title.includes('StarSports – American Football Live Tracker Check')) return 'NFL (StarSports)';
  
  // Check for general sport keywords
  if (title.includes('Football') || title.includes('football')) return 'Football';
  if (title.includes('Tennis') || title.includes('tennis')) return 'Tennis';
  if (title.includes('Cricket') || title.includes('cricket')) return 'Cricket';
  if (title.includes('NFL') || title.includes('American Football') || title.includes('American football')) return 'NFL';
  
  console.log('No sport match found for:', title);
  return 'Unknown';
}

function extractTeamFromTitle(title) {
  if (!title) return 'N/A';
  
  console.log('Extracting team from title:', title);
  
  // Extract team names from test titles
  // Look for patterns like "Team A vs Team B" or "Team A vs Team BIn Play"
  const vsMatch = title.match(/([^vs]+)\s+vs\s+([^vs]+)/i);
  if (vsMatch) {
    const team1 = vsMatch[1].trim()
      .replace(/In Play$/, '')
      .replace(/Today.*$/, '')
      .replace(/Tomorrow.*$/, '')
      .replace(/Weekend.*$/, '')
      .replace(/Current Week.*$/, '')
      .replace(/\d{2} Sep \d{2}:\d{2}$/, '')
      .replace(/\d{2}:\d{2}$/, '');
    const team2 = vsMatch[2].trim()
      .replace(/In Play$/, '')
      .replace(/Today.*$/, '')
      .replace(/Tomorrow.*$/, '')
      .replace(/Weekend.*$/, '')
      .replace(/Current Week.*$/, '')
      .replace(/\d{2} Sep \d{2}:\d{2}$/, '')
      .replace(/\d{2}:\d{2}$/, '');
    const result = `${team1} vs ${team2}`;
    console.log('Extracted teams:', result);
    return result;
  }
  
  // Look for single team names
  const singleTeamMatch = title.match(/([A-Za-z\s]+)(?:\s+\(Today\)|\s+\(Tomorrow\)|\s+In Play)/);
  if (singleTeamMatch) {
    const result = singleTeamMatch[1].trim();
    console.log('Extracted single team:', result);
    return result;
  }
  
  console.log('No team match found for:', title);
  return 'N/A';
}

function extractDetailedFailureInfo(test) {
  if (test.status !== 'failed' && test.status !== 'timedOut') return 'N/A';
  
  const sport = test.sport;
  const team = extractTeamFromTitle(test.title);
  const error = test.error || 'Unknown error';
  
  // Create detailed failure description based on sport
  let failureDescription = '';
  
  if (sport.includes('Football')) {
    failureDescription = `Football match "${team}" failed: ${error}`;
  } else if (sport.includes('Tennis')) {
    failureDescription = `Tennis match "${team}" failed: ${error}`;
  } else if (sport.includes('Cricket')) {
    failureDescription = `Cricket match "${team}" failed: ${error}`;
  } else if (sport.includes('NFL')) {
    failureDescription = `NFL team "${team}" failed: ${error}`;
  } else {
    failureDescription = `${sport} test "${team}" failed: ${error}`;
  }
  
  return failureDescription;
}

function generateEmailReport(results) {
  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  
  const passRate = results.stats.total > 0 ? ((results.stats.passed / results.stats.total) * 100).toFixed(1) : 0;
  const statusColor = results.stats.failed === 0 ? '#28a745' : '#dc3545';
  const statusIcon = results.stats.failed === 0 ? '✅' : '❌';
  
  // Group tests by sport (including individual events)
  const testsBySport = {};
  
  // First, add individual event data
  results.individualEvents.forEach(eventData => {
    if (!testsBySport[eventData.sport]) {
      testsBySport[eventData.sport] = { 
        passed: 0, 
        failed: 0, 
        total: 0, 
        tests: [],
        events: []
      };
    }
    testsBySport[eventData.sport].total += eventData.totalEvents;
    testsBySport[eventData.sport].passed += eventData.passedEvents;
    testsBySport[eventData.sport].failed += eventData.failedEvents;
    testsBySport[eventData.sport].events = eventData.events;
  });
  
  // Then add overall test data
  results.tests.forEach(test => {
    if (!testsBySport[test.sport]) {
      testsBySport[test.sport] = { 
        passed: 0, 
        failed: 0, 
        total: 0, 
        tests: [],
        events: []
      };
    }
    testsBySport[test.sport].total++;
    if (test.status === 'passed') {
      testsBySport[test.sport].passed++;
    } else if (test.status === 'failed' || test.status === 'timedOut') {
      testsBySport[test.sport].failed++;
    }
    testsBySport[test.sport].tests.push(test);
  });
  
  let sportSummary = '';
  Object.entries(testsBySport).forEach(([sport, data]) => {
    const sportPassRate = data.total > 0 ? ((data.passed / data.total) * 100).toFixed(1) : 0;
    const sportIcon = data.failed === 0 ? '✅' : '❌';
    
        // Get sport emoji and description
        let sportEmoji = '🏆';
        let sportDescription = sport;
        if (sport.includes('Football')) { sportEmoji = '⚽'; sportDescription = sport; }
        else if (sport.includes('Tennis')) { sportEmoji = '🎾'; sportDescription = sport; }
        else if (sport.includes('Cricket')) { sportEmoji = '🏏'; sportDescription = sport; }
        else if (sport.includes('NFL')) { sportEmoji = '🏈'; sportDescription = sport; }
    
    sportSummary += `
      <tr>
        <td><strong>${sportEmoji} ${sportDescription}</strong></td>
        <td>${data.total}</td>
        <td>${data.passed}</td>
        <td>${data.failed}</td>
        <td style="color: ${data.failed === 0 ? '#28a745' : '#dc3545'}">${sportPassRate}%</td>
        <td>${sportIcon}</td>
      </tr>`;
  });
  
  // Get failed tests details (including individual event failures)
  const failedTests = results.tests.filter(test => test.status === 'failed' || test.status === 'timedOut');
  const failedEvents = [];
  
  // Collect failed individual events
  results.individualEvents.forEach(eventData => {
    eventData.events.forEach(event => {
      if (event.result === 'FAIL' || event.result === 'ERROR') {
        failedEvents.push({
          sport: eventData.sport,
          event: event.event,
          result: event.result,
          failureReason: event.failureReason,
          additionalInfo: event.tournament || event.league || event.timePeriod || 'N/A'
        });
      }
    });
  });
  
  let failedTestsDetails = '';
  if (failedTests.length > 0 || failedEvents.length > 0) {
    failedTestsDetails = `
    <h3 style="color: #dc3545;">❌ Failed Tests & Events Details</h3>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr style="background: #f8f9fa;">
          <th style="padding: 8px; border: 1px solid #dee2e6; text-align: left;">Sport</th>
          <th style="padding: 8px; border: 1px solid #dee2e6; text-align: left;">Test/Event</th>
          <th style="padding: 8px; border: 1px solid #dee2e6; text-align: left;">Team/Match</th>
          <th style="padding: 8px; border: 1px solid #dee2e6; text-align: left;">Detailed Failure Description</th>
        </tr>
      </thead>
      <tbody>`;
    
    // Add failed individual events first
    failedEvents.forEach(event => {
      failedTestsDetails += `
        <tr>
          <td style="padding: 8px; border: 1px solid #dee2e6;"><strong>${event.sport}</strong></td>
          <td style="padding: 8px; border: 1px solid #dee2e6;"><strong>${event.event}</strong></td>
          <td style="padding: 8px; border: 1px solid #dee2e6;">${event.event}</td>
          <td style="padding: 8px; border: 1px solid #dee2e6; color: #dc3545;">${event.failureReason} (${event.additionalInfo})</td>
        </tr>`;
    });
    
    // Add failed overall tests
    failedTests.forEach(test => {
      const detailedFailure = extractDetailedFailureInfo(test);
      failedTestsDetails += `
        <tr>
          <td style="padding: 8px; border: 1px solid #dee2e6;"><strong>${test.sport}</strong></td>
          <td style="padding: 8px; border: 1px solid #dee2e6;"><strong>${test.title}</strong></td>
          <td style="padding: 8px; border: 1px solid #dee2e6;">N/A</td>
          <td style="padding: 8px; border: 1px solid #dee2e6; color: #dc3545;">${detailedFailure}</td>
        </tr>`;
    });
    
    failedTestsDetails += `
      </tbody>
    </table>`;
  }
  
  const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>PSG Animation Tests Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f8f9fa; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; }
        .summary { display: flex; justify-content: space-around; margin: 20px 0; }
        .summary-item { text-align: center; padding: 15px; background: #f8f9fa; border-radius: 8px; margin: 0 10px; }
        .summary-number { font-size: 2em; font-weight: bold; }
        .summary-label { color: #6c757d; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .status-pass { color: #28a745; font-weight: bold; }
        .status-fail { color: #dc3545; font-weight: bold; }
        .footer { margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; text-align: center; color: #6c757d; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏆 PSG Animation Tests Report</h1>
            <p>Automated Test Results - ${timestamp} UTC</p>
        </div>
        
        <div class="summary">
            <div class="summary-item">
                <div class="summary-number" style="color: ${statusColor}">${statusIcon}</div>
                <div class="summary-label">Overall Status</div>
            </div>
            <div class="summary-item">
                <div class="summary-number">${results.stats.total}</div>
                <div class="summary-label">Total Tests</div>
            </div>
            <div class="summary-item">
                <div class="summary-number" style="color: #28a745">${results.stats.passed}</div>
                <div class="summary-label">Passed</div>
            </div>
            <div class="summary-item">
                <div class="summary-number" style="color: #dc3545">${results.stats.failed}</div>
                <div class="summary-label">Failed</div>
            </div>
            <div class="summary-item">
                <div class="summary-number" style="color: ${statusColor}">${passRate}%</div>
                <div class="summary-label">Pass Rate</div>
            </div>
        </div>
        
        <h2>📊 Results by Sport</h2>
        <table>
            <thead>
                <tr>
                    <th>Sport</th>
                    <th>Total</th>
                    <th>Passed</th>
                    <th>Failed</th>
                    <th>Pass Rate</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${sportSummary}
            </tbody>
        </table>
        
        <h2>🧪 Tests Executed</h2>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3>Test Coverage Summary:</h3>
            <ul>
                ${Object.entries(testsBySport).map(([sport, data]) => {
                  let sportEmoji = '🏆';
                  if (sport === 'Football') sportEmoji = '⚽';
                  else if (sport === 'Tennis') sportEmoji = '🎾';
                  else if (sport === 'Cricket') sportEmoji = '🏏';
                  else if (sport === 'NFL') sportEmoji = '🏈';
                  
                  return `<li><strong>${sportEmoji} ${sport}</strong>: ${data.total} test(s) - ${data.passed} passed, ${data.failed} failed</li>`;
                }).join('')}
            </ul>
        </div>
        
        ${failedTestsDetails}
        
        <div class="footer">
            <p>This report was automatically generated by the PSG Animation Test Suite</p>
            <p>Next scheduled run: Check GitHub Actions for schedule</p>
        </div>
    </div>
</body>
</html>`;
  
  return html;
}

// Main execution
try {
  console.log('📊 Generating test report...');
  
  const results = readTestResults();
  console.log(`Found ${results.stats.total} total tests: ${results.stats.passed} passed, ${results.stats.failed} failed`);
  
  const emailHtml = generateEmailReport(results);
  
  // Write email HTML file
  fs.writeFileSync('./test-report-email.html', emailHtml);
  console.log('✅ Email report generated: test-report-email.html');
  
  // Also write a JSON summary for debugging
  fs.writeFileSync('./test-summary.json', JSON.stringify(results, null, 2));
  console.log('✅ Test summary written: test-summary.json');
  
} catch (error) {
  console.error('❌ Error generating report:', error);
  process.exit(1);
}

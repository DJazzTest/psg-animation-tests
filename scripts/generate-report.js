const fs = require('fs');
const path = require('path');

// Read test results from JSON files
function readTestResults() {
  let allResults = {
    stats: { total: 0, passed: 0, failed: 0, skipped: 0 },
    tests: []
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
                  title: test.title,
                  status: testResult?.status || 'unknown',
                  duration: testResult?.duration || 0,
                  error: testResult?.error?.message || null,
                  sport: extractSportFromTitle(test.title),
                  file: spec.file
                });
              });
            }
          });
        }
      });
    }
    
  } catch (error) {
    console.error('Error reading test results:', error.message);
  }
  
  return allResults;
}

function extractSportFromTitle(title) {
  if (!title) return 'Unknown';
  if (title.includes('Football')) return 'Football';
  if (title.includes('Tennis')) return 'Tennis';
  if (title.includes('Cricket')) return 'Cricket';
  if (title.includes('NFL') || title.includes('American Football')) return 'NFL';
  return 'Unknown';
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
  
  // Group tests by sport
  const testsBySport = results.tests.reduce((acc, test) => {
    if (!acc[test.sport]) {
      acc[test.sport] = { passed: 0, failed: 0, total: 0, tests: [] };
    }
    acc[test.sport].total++;
    if (test.status === 'passed') {
      acc[test.sport].passed++;
    } else if (test.status === 'failed') {
      acc[test.sport].failed++;
    }
    acc[test.sport].tests.push(test);
    return acc;
  }, {});
  
  let sportSummary = '';
  Object.entries(testsBySport).forEach(([sport, data]) => {
    const sportPassRate = data.total > 0 ? ((data.passed / data.total) * 100).toFixed(1) : 0;
    const sportIcon = data.failed === 0 ? '✅' : '❌';
    sportSummary += `
      <tr>
        <td><strong>${sport}</strong></td>
        <td>${data.total}</td>
        <td>${data.passed}</td>
        <td>${data.failed}</td>
        <td style="color: ${data.failed === 0 ? '#28a745' : '#dc3545'}">${sportPassRate}%</td>
        <td>${sportIcon}</td>
      </tr>`;
  });
  
  // Get failed tests details
  const failedTests = results.tests.filter(test => test.status === 'failed');
  let failedTestsDetails = '';
  if (failedTests.length > 0) {
    failedTestsDetails = `
    <h3 style="color: #dc3545;">❌ Failed Tests Details</h3>
    <ul>`;
    failedTests.forEach(test => {
      failedTestsDetails += `
      <li>
        <strong>${test.title}</strong><br>
        <em>Error:</em> ${test.error || 'Unknown error'}<br>
        <em>Duration:</em> ${(test.duration / 1000).toFixed(2)}s
      </li>`;
    });
    failedTestsDetails += `</ul>`;
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

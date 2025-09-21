const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting PSG Animation Tests with Enhanced Reporting...\n');

// Create results directory
if (!fs.existsSync('./test-results-json')) {
  fs.mkdirSync('./test-results-json', { recursive: true });
}

try {
  // Run all PSG tests and capture JSON output
  console.log('📋 Running all PSG Animation Tests...');
  const jsonOutput = execSync('npx playwright test tests/specs/planetsports/ --project=chromium --reporter=json', {
    encoding: 'utf8',
    cwd: process.cwd()
  });
  
  // Write JSON output to file
  fs.writeFileSync('./test-results-json.json', jsonOutput);
  console.log('\n✅ Tests completed successfully!');
  
} catch (error) {
  console.log('\n⚠️  Some tests failed, but continuing with report generation...');
  console.log('Error details:', error.message);
  
  // Try to capture any partial output
  try {
    const jsonOutput = error.stdout || '';
    if (jsonOutput) {
      fs.writeFileSync('./test-results-json.json', jsonOutput);
    }
  } catch (writeError) {
    console.log('Could not capture test output');
  }
}

// Generate the report
try {
  console.log('\n📊 Generating detailed report...');
  execSync('node scripts/generate-report.js', { stdio: 'inherit' });
  
  console.log('\n🎉 Report generation completed!');
  console.log('📧 Email report: test-report-email.html');
  console.log('📄 Test summary: test-summary.json');
  
} catch (error) {
  console.error('\n❌ Error generating report:', error.message);
  process.exit(1);
}

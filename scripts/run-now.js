const { runScheduledTests } = require('./scheduled-tests');

console.log('🚀 Running scheduled tests NOW (manual trigger)...');
console.log('📅 This will test both NFL and Football and send email reports');

runScheduledTests()
  .then(() => {
    console.log('\n✅ Manual test run completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error during manual test run:', error);
    process.exit(1);
  });

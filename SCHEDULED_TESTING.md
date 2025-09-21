# 🕐 Scheduled Testing System

## Overview
This system automatically runs PSG NFL and Football animation tests at specific UK times and sends email reports.

## Schedule
- **17:05 UK** - NFL & Football tests + email report
- **18:05 UK** - NFL & Football tests + email report  
- **19:45 UK** - NFL & Football tests + email report
- **20:30 UK** - NFL & Football tests + email report

## Files
- `scripts/scheduled-tests.js` - Main scheduled testing script
- `scripts/setup-cron.sh` - Sets up cron jobs
- `scripts/run-now.js` - Manual test runner
- `scripts/test-schedule.js` - Test the system
- `logs/scheduled-tests.log` - Test execution logs

## Commands

### Manual Testing
```bash
# Run tests now (ignoring schedule)
node scripts/run-now.js

# Test the system (both NFL and Football)
node scripts/test-schedule.js
```

### Cron Management
```bash
# View current cron jobs
crontab -l

# Remove all cron jobs
crontab -r

# Re-setup cron jobs
./scripts/setup-cron.sh
```

### Individual Tests
```bash
# NFL only
node scripts/nfl-only-test.js

# Football only  
node scripts/football-only-test.js
```

## Email Reports
- **To**: davidjarrett001@gmail.com
- **Subject**: PSG [SPORT] Scheduled Test Report - [TIME] UK
- **Content**: HTML report with test results, event details, and success rates

## Test Results
- **NFL**: Tests all NFL events across Today, Tomorrow, Weekend, Current Week tabs
- **Football**: Tests football events across Today, Tomorrow, Weekend, Current Week tabs
- **Success Rate**: Percentage of events with working animations
- **Event Details**: Individual event results with team names and failure reasons

## Logs
All test execution is logged to `logs/scheduled-tests.log` for debugging and monitoring.

## Troubleshooting
1. Check logs: `tail -f logs/scheduled-tests.log`
2. Verify cron jobs: `crontab -l`
3. Test manually: `node scripts/test-schedule.js`
4. Check email credentials in scripts if emails not sending

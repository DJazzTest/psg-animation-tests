#!/bin/bash

# Setup cron jobs for scheduled testing
echo "🕐 Setting up scheduled testing cron jobs..."

# Get the current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Create cron job entries
CRON_JOBS="
# PSG Animation Tests - Scheduled at UK times
5 17 * * * cd $PROJECT_DIR && node scripts/scheduled-tests.js >> logs/scheduled-tests.log 2>&1
5 18 * * * cd $PROJECT_DIR && node scripts/scheduled-tests.js >> logs/scheduled-tests.log 2>&1
45 19 * * * cd $PROJECT_DIR && node scripts/scheduled-tests.js >> logs/scheduled-tests.log 2>&1
30 20 * * * cd $PROJECT_DIR && node scripts/scheduled-tests.js >> logs/scheduled-tests.log 2>&1
"

# Create logs directory
mkdir -p "$PROJECT_DIR/logs"

# Add cron jobs (this will add to existing crontab)
(crontab -l 2>/dev/null; echo "$CRON_JOBS") | crontab -

echo "✅ Cron jobs set up successfully!"
echo "📅 Tests will run at:"
echo "   - 17:05 UK time (5:05 PM)"
echo "   - 18:05 UK time (6:05 PM)" 
echo "   - 19:45 UK time (7:45 PM)"
echo "   - 20:30 UK time (8:30 PM)"
echo ""
echo "📝 Logs will be saved to: $PROJECT_DIR/logs/scheduled-tests.log"
echo ""
echo "🔍 To view current cron jobs: crontab -l"
echo "🗑️ To remove cron jobs: crontab -r"

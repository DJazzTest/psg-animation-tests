# PSG Animation Tests

Automated testing suite for PlanetSportBet animation features across multiple sports.

## 🏆 Features

- **Multi-Sport Testing**: Football, Tennis, Cricket, and NFL
- **Scheduled Automation**: Run tests 3 times daily via GitHub Actions
- **Email Reports**: Automated HTML email reports with detailed results
- **Comprehensive Coverage**: Tests live tracker animations across all sports
- **Detailed Reporting**: Sport-specific pass/fail rates and failure details

## 🚀 Quick Start

### Local Testing

```bash
# Install dependencies
npm install

# Install Playwright browsers
npm run install:browsers

# Run all tests
npm run test:all

# Run specific sport tests
npm run test:football
npm run test:tennis
npm run test:cricket
npm run test:nfl

# Run with visual debugging
npm run test:headed

# Generate detailed report
npm run test:report
```

### Automated Testing

The tests are configured to run automatically 3 times per day:
- **9:00 AM UTC** - Morning check
- **2:00 PM UTC** - Afternoon check  
- **7:00 PM UTC** - Evening check

## 📧 Email Reports

### Setup Email Notifications

1. **Configure GitHub Secrets** in your repository settings:
   - `EMAIL_USERNAME`: Your Gmail address
   - `EMAIL_PASSWORD`: Your Gmail app password
   - `EMAIL_FROM`: Sender email address
   - `EMAIL_TO`: Recipient email address

2. **Gmail App Password Setup**:
   - Enable 2-factor authentication on your Gmail account
   - Generate an app password for this application
   - Use the app password (not your regular password) in `EMAIL_PASSWORD`

### Manual Email Testing

```bash
# Run tests and generate email report
npm run test:report

# The report will be saved as test-report-email.html
# You can preview it in your browser before sending
```

## 📊 Test Coverage

| Sport | Test File | Coverage |
|-------|-----------|----------|
| Football | `PSG.Football.Animations.spec.ts` | Live tracker animations |
| Tennis | `PSG.Tennis.Animations.Spec.ts` | Live tracker animations |
| Cricket | `PSG.cricket.Animations.spec.ts` | Live tracker animations |
| NFL | `PSG.NFL.Animations.spec.ts` | Live tracker animations |

## 🔧 Configuration

### Playwright Configuration

The tests are configured in `playwright.config.ts`:
- **Browser**: Chromium only (for consistency)
- **Timeout**: 60 seconds per test
- **Headless**: True (for CI), can be set to false for debugging
- **Base URL**: PlanetSportBet website

### GitHub Actions

The automation is configured in `.github/workflows/scheduled-tests.yml`:
- **Schedule**: 3 times daily via cron
- **Environment**: Ubuntu latest
- **Browsers**: Chromium with dependencies
- **Reporting**: JSON output + HTML email

## 📈 Report Features

### Email Report Includes:
- **Overall Status**: Pass/fail summary with visual indicators
- **Sport Breakdown**: Individual results for each sport
- **Detailed Failures**: Specific error messages and context
- **Timing Information**: Test duration and execution time
- **Visual Design**: Professional HTML formatting

### Sample Report Structure:
```
🏆 PSG Animation Tests Report
├── Overall Status: ✅ 40/40 tests passed (100%)
├── Football: ✅ 10/10 passed
├── Tennis: ❌ 8/10 passed (2 failures)
├── Cricket: ✅ 12/12 passed
└── NFL: ✅ 10/10 passed
```

## 🛠️ Troubleshooting

### Common Issues

1. **Tests Timing Out**:
   - Increase timeout in `playwright.config.ts`
   - Check network connectivity
   - Verify website availability

2. **Email Not Sending**:
   - Verify GitHub secrets are correctly set
   - Check Gmail app password is valid
   - Ensure 2FA is enabled on Gmail account

3. **Animation Detection Failing**:
   - Check if website structure has changed
   - Verify selectors in test files
   - Run tests in headed mode for debugging

### Debug Mode

```bash
# Run with visual debugging
npm run test:headed

# Run specific test with debugging
npx playwright test tests/specs/planetsports/PSG.Football.Animations.spec.ts --headed --project=chromium
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `npm run test:all`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section
2. Review GitHub Actions logs
3. Create an issue in the repository

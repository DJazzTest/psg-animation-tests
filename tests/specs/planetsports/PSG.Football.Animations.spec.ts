import { test, expect } from '@playwright/test';

test('PlanetSportBet – Football Animation Check', async ({ page }) => {
  // Allow extra time in CI, but also cap scope to avoid timeouts
  const isCI = !!process.env.CI;
  test.setTimeout(isCI ? 240_000 : 300_000);
  console.log('🚀 Starting Football Animation Test...');
  
  // 1) Land on PlanetSportBet and handle initial setup
  await page.goto('https://planetsportbet.com/');
  // Robust cookie consent handling (button may vary or be absent)
  try {
    const allowAll = page.getByRole('button', { name: /allow all|accept all|agree|ok/i });
    await allowAll.waitFor({ state: 'visible', timeout: 8000 });
    await allowAll.click({ timeout: 8000 });
    console.log('✅ Cookie consent accepted');
  } catch {
    try {
      // Fallback selectors
      const fallback = page.locator(
        'button:has-text("Allow All"), button:has-text("Accept all"), button:has-text("OK"), [data-test*="cookie"][data-test*="accept"]'
      );
      if (await fallback.first().isVisible({ timeout: 2000 }).catch(() => false)) {
        await fallback.first().click({ timeout: 5000 });
        console.log('✅ Cookie consent accepted (fallback)');
      } else {
        console.log('ℹ️ Cookie banner not present');
      }
    } catch {
      console.log('ℹ️ "Allow all" button not found, continuing...');
    }
  }
  
  // Handle close icon with error handling
  try {
    await page.locator('[data-test="landing-page"] [data-test="close-icon"] path').click({ timeout: 3000 });
    console.log('✅ Popup closed');
  } catch (error) {
    console.log('ℹ️ No popup to close');
  }
  
  // 2) Navigate to Football section
  console.log('🏈 Navigating to Football section...');
  await page.locator('[data-test="popular"]').getByRole('link', { name: 'Football' }).click();
  await page.waitForTimeout(2000);
  
  // Define time periods to test (reduced in CI to prevent timeouts)
  const timePeriods = isCI ? ['Today', 'Tomorrow'] : ['Today', 'Tomorrow', 'Weekend', 'Current Week'];
  const results: {event: string, result: string, timePeriod: string, league: string}[] = [];
  let totalEventsTested = 0;
  const maxTotalEvents = isCI ? 15 : 40; // Cap in CI to finish under job timeout
  
  for (const timePeriod of timePeriods) {
    if (totalEventsTested >= maxTotalEvents) break;
    
    console.log(`\n🔍 Testing ${timePeriod} tab...`);
    
    try {
      // Click on the time period tab
      await page.getByRole('button', { name: timePeriod }).click();
      await page.waitForTimeout(3000);
      
      // Get football events for this time period
      const eventWrappers = page.locator('a[href*="/event/"]');
      const count = await eventWrappers.count();
      console.log(`📊 ${timePeriod} football events found: ${count}`);
      
      if (count === 0) {
        console.log(`ℹ️ No events in ${timePeriod} tab, skipping...`);
        continue;
      }
      
      // Test events from this time period (up to 10 per period to avoid timeout)
      const maxEventsThisPeriod = Math.min(10, count, maxTotalEvents - totalEventsTested);
      
      for (let i = 0; i < maxEventsThisPeriod; i++) {
        if (totalEventsTested >= maxTotalEvents) break;
        
        const event = eventWrappers.nth(i);
        let title = `Football Event ${i + 1}`;
        let league = 'Unknown League';
        
        try {
          // Get text content from the link
          title = await event.textContent() || `Football Event ${i + 1}`;
          
          // Extract league information from the title
          if (title.includes('Premier League') || title.includes('EPL')) league = 'English Premier League';
          else if (title.includes('Championship')) league = 'English Championship';
          else if (title.includes('League One')) league = 'English League One';
          else if (title.includes('League Two')) league = 'English League Two';
          else if (title.includes('La Liga') || title.includes('Primera Division')) league = 'Spanish La Liga';
          else if (title.includes('Serie A')) league = 'Italian Serie A';
          else if (title.includes('Bundesliga')) league = 'German Bundesliga';
          else if (title.includes('Ligue 1')) league = 'French Ligue 1';
          else if (title.includes('Champions League')) league = 'UEFA Champions League';
          else if (title.includes('Europa League')) league = 'UEFA Europa League';
          else if (title.includes('FA Cup')) league = 'FA Cup';
          else if (title.includes('Carabao Cup')) league = 'Carabao Cup';
          else if (title.includes('EFL Cup')) league = 'EFL Cup';
          else if (title.includes('Community Shield')) league = 'Community Shield';
          else if (title.includes('Super Cup')) league = 'Super Cup';
          else if (title.includes('World Cup')) league = 'FIFA World Cup';
          else if (title.includes('Euro')) league = 'UEFA European Championship';
          else if (title.includes('Nations League')) league = 'UEFA Nations League';
          else if (title.includes('Friendly')) league = 'International Friendly';
          else league = 'Other Competition';
          
        } catch {}
        
        console.log(`\n🎯 Testing event ${totalEventsTested + 1}/${maxTotalEvents}: ${title} (${timePeriod})`);
        console.log(`🏆 League: ${league}`);
        
        await event.scrollIntoViewIfNeeded();
        
        // Click on the event
        try {
          await Promise.all([
            page.waitForURL(/\/event\//, { timeout: 10000 }),
            event.click()
          ]);
          console.log(`✅ Successfully clicked on: ${title}`);
          
          // Wait for page to load after clicking event
              console.log(`⏳ Waiting ${isCI ? 1500 : 3000} ms for page to load...`);
              await page.waitForTimeout(isCI ? 1500 : 3000);
          
          // Check if Live tracker is already open, if not click to open it
          console.log(`📊 Checking Live tracker status for ${title}...`);
          let liveTrackerOpen = false;
          let liveTrackerClicked = false;
          
          // First check if animated_widget is already visible (Live tracker already open)
          try {
            await page.waitForSelector('.animated_widget', {
              state: 'visible',
              timeout: 2000
            });
            liveTrackerOpen = true;
            console.log(`✅ Live tracker already open for ${title}`);
          } catch {
            console.log(`ℹ️ Live tracker not open, attempting to click...`);
            
            // If not open, try to click the Live tracker button
            try {
              await page.getByRole('heading', { name: 'Live tracker' }).click({ timeout: 5000 });
              console.log(`✅ Live tracker clicked for ${title}`);
              liveTrackerClicked = true;
                  await page.waitForTimeout(isCI ? 1000 : 2000);
            } catch (error) {
              console.log(`❌ FAIL: Could not find Live tracker button for — ${title}`);
              console.log(`   🔴 Description: Live tracker button not found or not clickable`);
              console.log(`   📝 Reason: Match may not have live tracking available or page not fully loaded`);
              console.log(`   ⚽ Match: ${title}`);
              console.log(`   🏆 Competition: ${league}`);
              console.log(`   📅 Time Period: ${timePeriod}`);
              console.log(`   🔧 Technical: ${error.message}`);
            }
          }
          
          // Wait for animated widget with longer delay to see animations
          let animPassed = false;
          
          if (liveTrackerOpen || liveTrackerClicked) {
            try {
              console.log(`🎬 Looking for animated_widget iframe for ${title}...`);
              
              // Wait for the specific animated widget div to appear
                  await page.waitForSelector('.animated_widget', { state: 'visible', timeout: isCI ? 8000 : 15000 });
              console.log(`✅ Found .animated_widget div`);
              
              // Wait for the iframe inside the animated_widget
                  await page.waitForSelector('.animated_widget iframe', { state: 'visible', timeout: isCI ? 6000 : 10000 });
              console.log(`✅ Found iframe inside .animated_widget`);
            
            // Verify the iframe has the correct src pattern with retry logic
            const iframe = page.locator('.animated_widget iframe');
            let iframeSrc = await iframe.getAttribute('src');
            let attempts = 0;
                const maxAttempts = isCI ? 5 : 8;
            
            // Retry getting the src attribute as it loads asynchronously
            while (attempts < maxAttempts && (!iframeSrc || !iframeSrc.includes('widgets.thesports01.com'))) {
              attempts++;
              console.log(`   Attempt ${attempts}/${maxAttempts}: src = ${iframeSrc || 'undefined'}`);
              await page.waitForTimeout(1000);
              iframeSrc = await iframe.getAttribute('src');
            }
            
            console.log(`🔗 Iframe src: ${iframeSrc}`);
            
            // Check if the iframe is actually visible and has content
            const isIframeVisible = await iframe.isVisible();
            const iframeContent = await iframe.contentFrame();
            
            if (iframeSrc && iframeSrc.includes('widgets.thesports01.com') && isIframeVisible) {
              animPassed = true;
              console.log(`✅ PASS: animated_widget iframe found with correct src and is visible for — ${title}`);
              
              // Additional verification - check if iframe has content
              if (iframeContent) {
                console.log(`✅ PASS: iframe content frame is accessible`);
              } else {
                console.log(`⚠️ WARNING: iframe content frame not accessible (may be cross-origin)`);
              }
            } else {
              console.log(`❌ FAIL: Live tracker expanded but no animation for — ${title}`);
              console.log(`   🔴 Description: Live tracker window expanded but animation iframe failed to load`);
              console.log(`   📝 Reason: iframe src is missing or incorrect (src: ${iframeSrc}, visible: ${isIframeVisible})`);
              console.log(`   ⚽ Match: ${title}`);
              console.log(`   🏆 Competition: ${league}`);
              console.log(`   📅 Time Period: ${timePeriod}`);
              console.log(`   🔧 Technical: Src contains widgets.thesports01.com: ${iframeSrc?.includes('widgets.thesports01.com')}`);
            }
            
            // Wait to see the animation load and play
                if (!isCI) {
                  console.log(`⏳ Waiting 5 seconds to observe 3D football animation...`);
                  await page.waitForTimeout(5000);
                }
            
            } catch (error) {
              console.log(`❌ FAIL: no animated_widget iframe found for — ${title}`);
              console.log(`   🔴 Description: Live tracker open but animated widget window not accessible`);
              console.log(`   📝 Reason: This typically indicates a suspended/inactive match or technical issue`);
              console.log(`   ⚽ Match: ${title}`);
              console.log(`   🏆 Competition: ${league}`);
              console.log(`   📅 Time Period: ${timePeriod}`);
              console.log(`   🔧 Technical: ${error.message}`);
            }
          } else {
            console.log(`❌ FAIL: Live tracker not accessible for — ${title}`);
            console.log(`   🔴 Description: Live tracker not found or not clickable`);
            console.log(`   📝 Reason: Match may not have live tracking available`);
            console.log(`   ⚽ Match: ${title}`);
            console.log(`   🏆 Competition: ${league}`);
            console.log(`   📅 Time Period: ${timePeriod}`);
          }
          
          results.push({ 
            event: title, 
            result: animPassed ? 'PASS' : 'FAIL', 
            timePeriod: timePeriod,
            league: league
          });
          
          totalEventsTested++;
          
          // Go back to football page
          console.log(`🔄 Going back to Football page...`);
          await page.locator('[data-test="popular"]').getByRole('link', { name: 'Football' }).click();
              await page.waitForTimeout(isCI ? 1500 : 3000);
          
          // Click the same time period tab again
          console.log(`📅 Clicking ${timePeriod} tab again...`);
          await page.getByRole('button', { name: timePeriod }).click();
              await page.waitForTimeout(isCI ? 1500 : 3000);
          
          // Ensure events are visible again
          await expect(eventWrappers.first()).toBeVisible({ timeout: 10000 });
          
        } catch (error) {
          console.log(`❌ Failed to test event: ${title} - ${error.message}`);
          results.push({ 
            event: title, 
            result: 'ERROR', 
            timePeriod: timePeriod,
            league: league
          });
          totalEventsTested++;
        }
      }
      
    } catch (error) {
      console.log(`❌ Error testing ${timePeriod} tab: ${error.message}`);
    }
  }
  
  // Generate comprehensive report
  console.log('\n🧪 === FOOTBALL ANIMATION TEST RESULTS ===');
  const passCount = results.filter(r => r.result === 'PASS').length;
  const failCount = results.filter(r => r.result === 'FAIL').length;
  const errorCount = results.filter(r => r.result === 'ERROR').length;
  const passRate = totalEventsTested > 0 ? Math.round((passCount / totalEventsTested) * 100) : 0;
  
  console.log(`📊 Total Football Events Tested: ${totalEventsTested}`);
  console.log(`✅ Events with Animations (PASS): ${passCount}`);
  console.log(`❌ Events without Animations (FAIL): ${failCount}`);
  console.log(`🚨 Events with Errors (ERROR): ${errorCount}`);
  console.log(`📈 Animation Success Rate: ${passRate}%`);
  
  // Report by time period
  console.log('\n📅 === RESULTS BY TIME PERIOD ===');
  timePeriods.forEach(period => {
    const periodResults = results.filter(r => r.timePeriod === period);
    const periodPass = periodResults.filter(r => r.result === 'PASS').length;
    const periodTotal = periodResults.length;
    const periodRate = periodTotal > 0 ? Math.round((periodPass / periodTotal) * 100) : 0;
    console.log(`${period}: ${periodPass}/${periodTotal} (${periodRate}%)`);
  });
  
  // Report by league
  console.log('\n🏆 === RESULTS BY LEAGUE ===');
  const leagues = [...new Set(results.map(r => r.league))];
  leagues.forEach(league => {
    const leagueResults = results.filter(r => r.league === league);
    const leaguePass = leagueResults.filter(r => r.result === 'PASS').length;
    const leagueTotal = leagueResults.length;
    const leagueRate = leagueTotal > 0 ? Math.round((leaguePass / leagueTotal) * 100) : 0;
    console.log(`${league}: ${leaguePass}/${leagueTotal} (${leagueRate}%)`);
  });
  
  console.log('\n📋 === DETAILED RESULTS ===');
  results.forEach(r => console.log(`${r.result}: ${r.event} (${r.timePeriod}, ${r.league})`));
  
      console.log('\n🏁 Football Animation Test completed!');
      
      // Output individual event results to a JSON file for report generation
      const fs = require('fs');
      const eventResults = {
        testName: 'PlanetSportBet – Football Animation Check',
        sport: 'Football (PSG)',
        totalEvents: totalEventsTested,
        passedEvents: results.filter(r => r.result === 'PASS').length,
        failedEvents: results.filter(r => r.result === 'FAIL').length,
        errorEvents: results.filter(r => r.result === 'ERROR').length,
        events: results.map(r => ({
          event: r.event,
          result: r.result,
          timePeriod: r.timePeriod,
          league: r.league,
          failureReason: r.result === 'FAIL' ? 'Animation iframe failed to load' : 
                        r.result === 'ERROR' ? 'Test execution error' : null
        }))
      };
      
      fs.writeFileSync('football-events-results.json', JSON.stringify(eventResults, null, 2));
      console.log('📄 Individual event results saved to football-events-results.json');
    });

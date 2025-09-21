import { test, expect } from '@playwright/test';

test('StarSports – Cricket Tab Animation Check', async ({ page }) => {
  test.setTimeout(180000); // 3 minutes for comprehensive testing
  console.log('🚀 Starting StarSports Cricket Animation Test...');
  
  // 1) Land on StarSports and handle initial setup
  await page.goto('https://starsports.bet/');
  
  // Handle cookie consent
  try {
    await page.getByRole('button', { name: 'Allow all' }).click({ timeout: 5000 });
    console.log('✅ Cookie consent handled');
  } catch {
    console.log('ℹ️ No cookie consent popup found');
  }
  
  // Handle close icon with error handling (if any, adapted from PSG)
  try {
    await page.locator('[data-test="landing-page"] [data-test="close-icon"] path').click({ timeout: 3000 });
    console.log('✅ Popup closed');
  } catch (error) {
    console.log('ℹ️ No popup to close');
  }
  
  // 2) Navigate to In Play section
  console.log('🏏 Navigating to In Play section...');
  await page.locator('[data-test="inplay-link"]').click();
  await page.waitForTimeout(2000);
  
  // 3) Confirm we're on the All Sports tab after clicking In Play
  console.log('🏆 Confirming we\'re on All Sports tab after clicking In Play...');
  await expect(page.locator('[data-test-filter-key="empty"]')).toBeVisible({ timeout: 5000 });
  console.log('✅ Confirmed on All Sports tab');

  async function locateAndClickCricketTab() {
    console.log('🔍 Looking for Cricket tab (may not be first in navigation bar)...');
    
    // Use the exact selector pattern for Cricket tab
    const cricketTab = page.locator('[data-test-filter-key="cricket"]');
    
    try {
      await expect(cricketTab).toBeVisible({ timeout: 5000 });
      console.log('✅ Found Cricket tab using data-test-filter-key="cricket"');
      await cricketTab.click();
      console.log('🏏 Clicked on Cricket tab');
      await page.waitForTimeout(2000);
      return true;
    } catch {
      console.log('❌ Could not locate Cricket tab with data-test-filter-key="cricket"');
      return false;
    }
  }

  // 4) Get cricket events and count them
  console.log('🔍 Looking for cricket events...');
  
  // Take a screenshot for debugging
  await page.screenshot({ path: 'cricket-debug.png' });
  console.log('📸 Screenshot saved as cricket-debug.png');
  
  // Try to locate and click Cricket tab
  const cricketTabFound = await locateAndClickCricketTab();
  
  if (!cricketTabFound) {
    console.log('❌ Could not find Cricket tab, test cannot continue');
    return;
  }
  
  // Get cricket events using the same selector as football
  const eventWrappers = page.locator('a[href*="/event/"]');
  const count = await eventWrappers.count();
  console.log(`📊 Cricket events found: ${count}`);
  
  if (count === 0) {
    console.log('❌ No cricket events found, test cannot continue');
    return;
  }
  
  // Test up to 5 cricket events
  const maxEvents = Math.min(5, count);
  const results: {event: string, result: string, competition: string}[] = [];
  
  for (let i = 0; i < maxEvents; i++) {
    const event = eventWrappers.nth(i);
    let title = `Cricket Event ${i + 1}`;
    let competition = 'Unknown Competition';
    
    try {
      // Get text content from the link
      title = await event.textContent() || `Cricket Event ${i + 1}`;
      
      // Extract competition information from the title
      if (title.includes('IPL') || title.includes('Indian Premier League')) competition = 'Indian Premier League';
      else if (title.includes('BBL') || title.includes('Big Bash League')) competition = 'Big Bash League';
      else if (title.includes('PSL') || title.includes('Pakistan Super League')) competition = 'Pakistan Super League';
      else if (title.includes('CPL') || title.includes('Caribbean Premier League')) competition = 'Caribbean Premier League';
      else if (title.includes('T20 World Cup')) competition = 'T20 World Cup';
      else if (title.includes('ODI World Cup')) competition = 'ODI World Cup';
      else if (title.includes('Test Match')) competition = 'Test Match';
      else if (title.includes('ODI')) competition = 'One Day International';
      else if (title.includes('T20')) competition = 'T20 International';
      else if (title.includes('County Championship')) competition = 'County Championship';
      else if (title.includes('The Hundred')) competition = 'The Hundred';
      else if (title.includes('Vitality Blast')) competition = 'Vitality Blast';
      else if (title.includes('Sheffield Shield')) competition = 'Sheffield Shield';
      else if (title.includes('Ranji Trophy')) competition = 'Ranji Trophy';
      else competition = 'Other Competition';
      
    } catch {}
    
    console.log(`\n🎯 Testing cricket event ${i + 1}/${maxEvents}: ${title}`);
    console.log(`🏆 Competition: ${competition}`);
    
    await event.scrollIntoViewIfNeeded();
    
    // Click on the event
    try {
      await Promise.all([
        page.waitForURL(/\/event\//, { timeout: 10000 }),
        event.click()
      ]);
      console.log(`✅ Successfully clicked on: ${title}`);
      
      // Wait for page to load after clicking event
      console.log(`⏳ Waiting 3 seconds for page to load...`);
      await page.waitForTimeout(3000);
      
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
          await page.waitForTimeout(2000);
        } catch (error) {
          console.log(`❌ FAIL: Could not find Live tracker button for — ${title}`);
          console.log(`   🔴 Description: Live tracker button not found or not clickable`);
          console.log(`   📝 Reason: Match may not have live tracking available or page not fully loaded`);
          console.log(`   🏏 Match: ${title}`);
          console.log(`   🏆 Competition: ${competition}`);
          console.log(`   🔧 Technical: ${error.message}`);
        }
      }
      
      // Wait for animated widget with longer delay to see animations
      let animPassed = false;
      
      if (liveTrackerOpen || liveTrackerClicked) {
        try {
          console.log(`🎬 Looking for animated_widget iframe for ${title}...`);
          
          // Wait for the specific animated widget div to appear
          await page.waitForSelector('.animated_widget', {
            state: 'visible',
            timeout: 15000
          });
          console.log(`✅ Found .animated_widget div`);
          
          // Wait for the iframe inside the animated_widget
          await page.waitForSelector('.animated_widget iframe', {
            state: 'visible',
            timeout: 10000
          });
          console.log(`✅ Found iframe inside .animated_widget`);
        
        // Verify the iframe has the correct src pattern with retry logic
        const iframe = page.locator('.animated_widget iframe');
        let iframeSrc = await iframe.getAttribute('src');
        let attempts = 0;
        const maxAttempts = 8;
        
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
          console.log(`   🏏 Match: ${title}`);
          console.log(`   🏆 Competition: ${competition}`);
          console.log(`   🔧 Technical: Src contains widgets.thesports01.com: ${iframeSrc?.includes('widgets.thesports01.com')}`);
        }
        
        // Wait to see the animation load and play
        console.log(`⏳ Waiting 5 seconds to observe 3D cricket animation...`);
        await page.waitForTimeout(5000);
        
        } catch (error) {
          console.log(`❌ FAIL: no animated_widget iframe found for — ${title}`);
          console.log(`   🔴 Description: Live tracker open but animated widget window not accessible`);
          console.log(`   📝 Reason: This typically indicates a suspended/inactive match or technical issue`);
          console.log(`   🏏 Match: ${title}`);
          console.log(`   🏆 Competition: ${competition}`);
          console.log(`   🔧 Technical: ${error.message}`);
        }
      } else {
        console.log(`❌ FAIL: Live tracker not accessible for — ${title}`);
        console.log(`   🔴 Description: Live tracker not found or not clickable`);
        console.log(`   📝 Reason: Match may not have live tracking available`);
        console.log(`   🏏 Match: ${title}`);
        console.log(`   🏆 Competition: ${competition}`);
      }
      
      results.push({ 
        event: title, 
        result: animPassed ? 'PASS' : 'FAIL', 
        competition: competition
      });
      
      // Go back to cricket page
      await page.locator('[data-test="inplay-link"]').click();
      await page.waitForTimeout(2000);
      
      // Click Cricket tab again
      await locateAndClickCricketTab();
      
      // Ensure events are visible again
      await expect(eventWrappers.first()).toBeVisible({ timeout: 10000 });
      
    } catch (error) {
      console.log(`❌ Failed to test event: ${title} - ${error.message}`);
      results.push({ 
        event: title, 
        result: 'ERROR', 
        competition: competition
      });
    }
  }
  
  // Generate comprehensive report
  console.log('\n🧪 === STARSPORTS CRICKET ANIMATION TEST RESULTS ===');
  const passCount = results.filter(r => r.result === 'PASS').length;
  const failCount = results.filter(r => r.result === 'FAIL').length;
  const errorCount = results.filter(r => r.result === 'ERROR').length;
  const passRate = results.length > 0 ? Math.round((passCount / results.length) * 100) : 0;
  
  console.log(`📊 Total StarSports Cricket Events Tested: ${results.length}`);
  console.log(`✅ Events with Animations (PASS): ${passCount}`);
  console.log(`❌ Events without Animations (FAIL): ${failCount}`);
  console.log(`🚨 Events with Errors (ERROR): ${errorCount}`);
  console.log(`📈 Animation Success Rate: ${passRate}%`);
  
  // Report by competition
  console.log('\n🏆 === RESULTS BY COMPETITION ===');
  const competitions = [...new Set(results.map(r => r.competition))];
  competitions.forEach(competition => {
    const competitionResults = results.filter(r => r.competition === competition);
    const competitionPass = competitionResults.filter(r => r.result === 'PASS').length;
    const competitionTotal = competitionResults.length;
    const competitionRate = competitionTotal > 0 ? Math.round((competitionPass / competitionTotal) * 100) : 0;
    console.log(`${competition}: ${competitionPass}/${competitionTotal} (${competitionRate}%)`);
  });
  
  console.log('\n📋 === DETAILED RESULTS ===');
  results.forEach(r => console.log(`${r.result}: ${r.event} (${r.competition})`));
  
  console.log('\n🏁 StarSports Cricket Animation Test completed!');
});

import { test, expect } from '@playwright/test';

test('PlanetSportBet – Football Animation Check', async ({ page }) => {
  console.log('🚀 Starting Football Animation Test...');
  
  // 1) Land on PlanetSportBet and handle initial setup
  await page.goto('https://planetsportbet.com/');
  await page.getByRole('button', { name: /Allow all/i }).click();
  
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
  
  // 3) Click on Today tab
  console.log('📅 Clicking Today tab...');
  await page.getByRole('button', { name: 'Today' }).click();
  await page.waitForTimeout(2000);
  
  // 4) Get football events and count them
  console.log('🔍 Looking for football events...');
  
  // Take a screenshot for debugging
  await page.screenshot({ path: 'football-page-debug.png' });
  console.log('📸 Screenshot saved as football-page-debug.png');
  
  // Use the working selector from tennis test
  const eventWrappers = page.locator('a[href*="/event/"]');
  const count = await eventWrappers.count();
  console.log(`⚽ Found ${count} football event links`);
  
  if (count === 0) {
    console.log('❌ No football events found on Today tab');
    return;
  }
  
  try {
    // Test first few events (max 3 to avoid timeout)
    const maxEvents = Math.min(3, count);
    const results: {event: string, result: string}[] = [];
    
    for (let i = 0; i < maxEvents; i++) {
      const event = eventWrappers.nth(i);
      let title = `Football Event ${i + 1}`;
      
      try {
        // Get text content from the link
        title = await event.textContent() || `Football Event ${i + 1}`;
      } catch {}
      
      console.log(`\n🎯 Testing event ${i + 1}/${maxEvents}: ${title}`);
      
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
        
        // Click on Live tracker to activate the animation
        console.log(`📊 Looking for Live tracker button...`);
        try {
          await page.getByRole('heading', { name: 'Live tracker' }).click({ timeout: 5000 });
          console.log(`✅ Live tracker clicked for ${title}`);
          await page.waitForTimeout(2000);
        } catch (error) {
          console.log(`⚠️ Could not find Live tracker button: ${error.message}`);
        }
        
        // Wait for animated widget with longer delay to see animations
        let animPassed = false;
        try {
          console.log(`🎬 Looking for animated_widget iframe for ${title}...`);
          
          // Wait for the specific animated widget with iframe
          await page.waitForSelector('.animated_widget iframe', {
            state: 'visible',
            timeout: 15000
          });
          
          // Verify the iframe has the correct src pattern
          const iframe = page.locator('.animated_widget iframe');
          const iframeSrc = await iframe.getAttribute('src');
          console.log(`🔗 Iframe src: ${iframeSrc}`);
          
          if (iframeSrc && iframeSrc.includes('widgets.thesports01.com')) {
            animPassed = true;
            console.log(`✅ PASS: animated_widget iframe found with correct src for — ${title}`);
          } else {
            console.log(`❌ FAIL: animated_widget iframe found but src is incorrect: ${iframeSrc}`);
          }
          
          // Wait longer to see the animation load and play
          console.log(`⏳ Waiting 10 seconds to observe 3D football animation...`);
          await page.waitForTimeout(10000);
          
        } catch (error) {
          console.log(`❌ FAIL: no animated_widget iframe found for — ${title}: ${error.message}`);
        }
        
        results.push({ event: title, result: animPassed ? 'PASS' : 'FAIL' });
        
        // Go back to football page
        console.log(`🔄 Going back to Football page...`);
        await page.locator('[data-test="popular"]').getByRole('link', { name: 'Football' }).click();
        await page.waitForTimeout(3000);
        
        // Click Today tab again
        console.log(`📅 Clicking Today tab again...`);
        await page.getByRole('button', { name: 'Today' }).click();
        await page.waitForTimeout(3000);
        
        // Ensure events are visible again
        await expect(eventWrappers.first()).toBeVisible({ timeout: 10000 });
        
      } catch (error) {
        console.log(`❌ Failed to test event: ${title} - ${error.message}`);
        results.push({ event: title, result: 'ERROR' });
      }
    }
    
    // Generate report
    console.log('\n🧪 === FOOTBALL ANIMATION TEST RESULTS ===');
    const passCount = results.filter(r => r.result === 'PASS').length;
    const failCount = results.filter(r => r.result === 'FAIL').length;
    const errorCount = results.filter(r => r.result === 'ERROR').length;
    const passRate = maxEvents > 0 ? Math.round((passCount / maxEvents) * 100) : 0;
    
    console.log(`📊 Total Football Events Tested: ${maxEvents}`);
    console.log(`✅ Events with Animations (PASS): ${passCount}`);
    console.log(`❌ Events without Animations (FAIL): ${failCount}`);
    console.log(`🚨 Events with Errors (ERROR): ${errorCount}`);
    console.log(`📈 Animation Success Rate: ${passRate}%`);
    
    console.log('\n📋 === DETAILED RESULTS ===');
    results.forEach(r => console.log(`${r.result}: ${r.event}`));
    
  } catch (error) {
    console.log('❌ Could not find football events or navigate properly');
    console.log('Error:', error.message);
  }
  
  console.log('\n🏁 Football Animation Test completed!');
});

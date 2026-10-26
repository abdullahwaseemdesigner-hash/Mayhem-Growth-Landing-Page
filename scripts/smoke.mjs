import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { preview } from 'vite';
import { chromium } from 'playwright';

const server=await preview({preview:{host:'127.0.0.1',port:4185,strictPort:true}});
const executablePath=process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined);
const browser=await chromium.launch({executablePath,headless:true,args:['--no-sandbox']});
const errors=[];
const submissions=[];
let checks=0;
const check=(condition,label)=>{assert.ok(condition,label);checks++;console.log(`PASS ${label}`);};
await mkdir('test-results',{recursive:true});
try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',request=>{if(request.method()==='POST')submissions.push(request.url());});
  page.on('response',response=>{if(response.status()>=400)errors.push(`${response.status()} ${response.url()}`);});
  await page.goto('http://127.0.0.1:4185',{waitUntil:'networkidle'});
  check(await page.locator('h1').count()===1,'one semantic page heading');
  check(await page.locator('.service-card').count()===6,'all six services rendered');
  check(await page.locator('main section').count()===8,'all eight preview sections rendered');
  check(await page.locator('#intro .video-card').count()===1,'video section included');
  for(const width of [320,360,390,600,768,1024,1440,1920]){
    await page.setViewportSize({width,height:900});
    await page.waitForTimeout(150);
    check(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),`no horizontal overflow at ${width}px`);
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.locator('#work').scrollIntoViewIfNeeded();
  for(let i=0;i<4;i++){
    await page.locator(`#project-tab-${i}`).click();
    check(await page.locator(`#project-tab-${i}`).getAttribute('aria-selected')==='true',`project ${i+1} selected`);
    check(await page.locator('.project-image-button').count()===2,`project ${i+1} renders two images`);
  }
  await page.locator('#next-project').click();
  check(await page.locator('#project-tab-0').getAttribute('aria-selected')==='true','next project wraps to first');
  await page.locator('#project-tab-0').focus();await page.keyboard.press('ArrowDown');
  check(await page.locator('#project-tab-1').getAttribute('aria-selected')==='true','project tabs support arrow keys');
  await page.locator('.project-image-button').first().click();
  check(await page.locator('dialog').evaluate(el=>el.open),'project detail dialog opens');
  await page.keyboard.press('Escape');
  check(!await page.locator('dialog').evaluate(el=>el.open),'Escape closes project dialog');
  check(await page.locator('.project-image-button').first().evaluate(el=>el===document.activeElement),'dialog restores trigger focus');
  await page.locator('.video-card').click();
  check((await page.locator('.dialog-content').textContent()).includes('Preview only'),'video opens the visual preview');
  await page.keyboard.press('Escape');
  await page.locator('#contact-form input[name=firstName]').fill('Test');
  await page.locator('#contact-form input[name=email]').fill('test@example.com');
  await page.locator('#contact-form input[name=phone]').fill('+1 555 0100');
  await page.locator('#contact-form input[name=company]').fill('Browser test');
  await page.locator('#contact-form button').click();
  check((await page.locator('#contact-form .form-status').textContent()).includes('not been sent'),'contact form never fakes a successful delivery');
  check(await page.locator('#contact-form input[name=firstName]').inputValue()==='Test','unsent form preserves entered details');
  await page.locator('#newsletter-form input').fill('test@example.com');await page.locator('#newsletter-form button').click();
  check((await page.locator('#newsletter-form .form-status').textContent()).includes('not been submitted'),'newsletter never fakes a subscription');
  check(submissions.length===0,'preview forms send no POST requests');
  for(const width of [390,768,1440]){
    await page.setViewportSize({width,height:900});
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
    for(let y=0;y<await page.evaluate(()=>document.body.scrollHeight);y+=650){await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),y);await page.waitForTimeout(90);}
    await page.waitForTimeout(1400);
    await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
    await page.waitForTimeout(900);
    await page.screenshot({path:`test-results/page-${width}.png`,fullPage:true});
  }
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  await page.locator('.menu-toggle').click();
  check(await page.locator('.menu-toggle').getAttribute('aria-expanded')==='true','mobile menu opens');
  await page.locator('#mobile-nav a[href="#services"]').click();
  check(await page.locator('.menu-toggle').getAttribute('aria-expanded')==='false','mobile navigation closes after selecting a section');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.reload({waitUntil:'networkidle'});
  check(await page.locator('.hero h1 .line>span').first().evaluate(el=>getComputedStyle(el).opacity)==='1','reduced motion keeps heading visible');
  check(await page.locator('.client-track').evaluate(el=>getComputedStyle(el).animationName)==='none','reduced motion stops automatic marquee');
  check(await page.locator('body').evaluate(el=>getComputedStyle(el).fontFamily).then(value=>value.startsWith('Inter')),'Inter is the body font');
  check(await page.evaluate(()=>document.fonts.check('14px Inter')),'self-hosted Inter has loaded');
  const kycron=await page.evaluate(async()=>{
    await document.fonts.ready;
    return [...document.fonts].filter(font=>font.family==='Kycron'&&font.status==='loaded').map(font=>font.weight);
  });
  check(kycron.includes('200')&&kycron.includes('400'),'both supplied Kycron web fonts loaded');
  for(const [selector,weight] of [['h1','200'],['.eyebrow','200'],['#services-title','400']]){
    check(await page.locator(selector).evaluate((el,weight)=>{const style=getComputedStyle(el);return style.fontFamily.startsWith('Kycron')&&style.fontWeight===weight;},weight),`${selector} uses Kycron weight ${weight}`);
  }
  check(errors.length===0,`no browser errors or failed resources: ${errors.join('; ')}`);
  console.log(`\n${checks} checks passed. Screenshots: test-results/page-{390,768,1440}.png`);
}finally{await browser.close();await new Promise(resolve=>server.httpServer.close(resolve));}

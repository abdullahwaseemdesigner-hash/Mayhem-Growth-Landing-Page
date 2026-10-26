import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from 'playwright';

const path=resolve('standalone/Mayhem-Growth-Preview.html');
const html=await readFile(path,'utf8');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
let count=0;
const check=(condition,label)=>{assert.ok(condition,label);count++;console.log(`PASS ${label}`);};
try{
  const context=await browser.newContext({offline:true,reducedMotion:'reduce',viewport:{width:1440,height:1000}});
  const page=await context.newPage();
  const errors=[],network=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',request=>{if(/^https?:/.test(request.url()))network.push(request.url());});
  for(const mode of ['standalone-document','sandboxed-preview']){
    // Managed Chromium disallows file:// navigation. Load the exact file contents
    // into an isolated document to verify that no base URL or server is needed.
    if(mode==='standalone-document')await page.setContent(html,{waitUntil:'load'});
    else{
      await page.goto('about:blank');
      await page.setContent('<iframe title="Website preview" sandbox="allow-scripts" style="position:fixed;inset:0;width:100%;height:100%;border:0"></iframe>');
      await page.locator('iframe').evaluate((frame,html)=>frame.srcdoc=html,html);
    }
    const target=mode==='standalone-document'?page:page.frameLocator('iframe');
    await target.locator('.service-card').first().waitFor();
    await target.locator('body').evaluate(async()=>{await document.fonts.ready;});
    check(await target.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor)==='rgb(241, 240, 236)',`${mode}: stylesheet loads offline`);
    check(await target.locator('.hero-portrait img').evaluate(async img=>{await img.decode();return img.naturalWidth>0;}),`${mode}: original portrait loads offline`);
    check(await target.locator('body').evaluate(()=>['200','400'].every(weight=>[...document.fonts].some(f=>f.family==='Kycron'&&f.weight===weight&&f.status==='loaded'))),`${mode}: both Kycron weights load offline`);
    check(await target.locator('.service-card').count()===6,`${mode}: JavaScript renders all services`);
    await target.locator('#project-tab-2').click();
    check((await target.locator('#project-title').textContent()).includes('Bold Vision'),`${mode}: project switching works`);
    await target.locator('.project-image-button').first().click();
    check(await target.locator('dialog').evaluate(el=>el.open),`${mode}: image dialog opens`);
    await target.locator('.close-dialog').click();
    await target.locator('.video-card').click();
    check((await target.locator('.dialog-content').textContent()).includes('Preview only'),`${mode}: video remains preview-only`);
    await target.locator('.close-dialog').click();
    for(const width of [390,1440]){
      await page.setViewportSize({width,height:1000});
      check(await target.locator('body').evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${mode}: no overflow at ${width}px`);
    }
  }
  check(network.length===0,`no HTTP requests needed: ${network.join(', ')}`);
  check(errors.length===0,`no preview JavaScript errors: ${errors.join(', ')}`);
  await mkdir('test-results',{recursive:true});
  await page.screenshot({path:'test-results/standalone-sandbox.png'});
  console.log(`\n${count} standalone preview checks passed offline.`);
}finally{await browser.close();}

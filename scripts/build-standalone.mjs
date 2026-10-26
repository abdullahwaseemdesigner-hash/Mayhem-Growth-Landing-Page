import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname, extname, basename, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const dist=resolve(root,'dist');
const mime={'.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff'};
function localPath(url,base=dist){
  const path=resolve(url.startsWith('/')?dist:base,url.replace(/^\//,''));
  if(!path.startsWith(dist+sep))throw new Error(`Asset outside build directory: ${url}`);
  return path;
}
async function dataUrl(path){
  const type=mime[extname(path)];
  if(!type)throw new Error(`Unsupported embedded asset: ${path}`);
  return `data:${type};base64,${(await readFile(path)).toString('base64')}`;
}
async function replaceAsync(text,regex,replace){
  const matches=[...text.matchAll(regex)];
  const values=await Promise.all(matches.map(replace));
  let i=0;
  return text.replace(regex,()=>values[i++]);
}

let html=await readFile(resolve(dist,'index.html'),'utf8');
// Preloads are unnecessary when every resource is already in the document.
html=html.replace(/<link\b[^>]*rel="(?:preload|modulepreload)"[^>]*>/g,'');
html=await replaceAsync(html,/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g,async match=>{
  const path=localPath(match[1]);
  let css=await readFile(path,'utf8');
  css=await replaceAsync(css,/url\(\s*["']?([^"')\s]+)["']?\s*\)/g,async match=>{
    if(match[1].startsWith('data:'))return match[0];
    return `url("${await dataUrl(localPath(match[1],dirname(path)))}")`;
  });
  return `<style>${css.replace(/<\/style/gi,'<\\/style')}</style>`;
});
html=await replaceAsync(html,/<link\b[^>]*rel="icon"[^>]*href="([^"]+)"[^>]*>/g,async match=>match[0].replace(match[1],await dataUrl(localPath(match[1]))));
html=await replaceAsync(html,/<img\b[^>]*src="([^"]+)"[^>]*>/g,async match=>match[0].replace(match[1],await dataUrl(localPath(match[1]))));

const embedded={};
for(const name of await readdir(resolve(dist,'assets'))){
  if(name.endsWith('.png'))embedded[basename(name,'.png')]=await dataUrl(resolve(dist,'assets',name));
}
const scripts=[];
for(const match of html.matchAll(/<script\b[^>]*src="([^"]+)"[^>]*><\/script>/g)){
  const js=await readFile(localPath(match[1]),'utf8');
  scripts.push(js);
}
if(scripts.length!==1)throw new Error('Expected one bundled application script');
html=html.replace(/<script\b[^>]*src="[^"]+"[^>]*><\/script>/g,'');
// A classic inline script works in file:// and sandboxed HTML previews.
// Run it after the document markup, just as a deferred module would run.
const payload=`globalThis.__MAYHEM_ASSETS__=${JSON.stringify(embedded)};\n(function(){\n${scripts.join('\n')}\n})();`;
html=html.replace('</body>',()=>`<script>${payload.replace(/<\/script/gi,'<\\/script')}</script>\n</body>`);
await mkdir(resolve(root,'standalone'),{recursive:true});
const destination=resolve(root,'standalone/Mayhem-Growth-Preview.html');
await writeFile(destination,html);
console.log(`Standalone preview: ${destination} (${(Buffer.byteLength(html)/1024/1024).toFixed(2)} MiB; images, fonts, CSS, and JavaScript embedded)`);

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '@fontsource/inter/latin-400.css';
import './fonts.css';
gsap.registerPlugin(ScrollTrigger);

document.fonts.ready.then(() => ScrollTrigger.refresh());

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const embeddedAssets = globalThis.__MAYHEM_ASSETS__ || {};

// The supplied PNGs are kept byte-for-byte intact. Responsive viewports reveal
// individual photographs/logos, while all page copy remains real HTML.
function mountAssets(root = document) {
  $$('[data-crop]', root).forEach(element => {
    if (element.firstElementChild) return;
    const [x, y, w, h, sourceWidth, sourceHeight] = element.dataset.crop.split(',').map(Number);
    const img = new Image();
    img.src = embeddedAssets[element.dataset.image] || `/assets/${element.dataset.image}.png`;
    img.alt = '';
    img.width = sourceWidth;
    img.height = sourceHeight;
    img.decoding = 'async';
    img.loading = element.dataset.image === 'hero-source' ? 'eager' : 'lazy';
    Object.assign(img.style, {width:`${sourceWidth/w*100}%`,height:`${sourceHeight/h*100}%`,left:`${-x/w*100}%`,top:`${-y/h*100}%`});
    element.append(img);
  });
}

const services = [
  ['Brand Strategy<br>& Positioning', 'Give customers a reason to choose you. Stand out with sharper positioning, competitive insights, compelling messaging, and a brand identity that reflects your value.', 490, 270],
  ['Websites & Digital<br>Experiences', 'Turn your website into a growth asset. Build better websites, ecommerce experiences, and landing pages that engage visitors, connect with your CRM, and convert traffic into customers.', 780, 270],
  ['Demand Generation & Growth', 'Get in front of the right people and turn interest into revenue. Drive growth through SEO, AI search optimization, paid media, targeted campaigns, lead nurturing, marketing automation, and conversion strategies.', 1070, 270],
  ['Product Marketing & Sales Enablement', 'Launch with impact and give your sales team what it needs to win. From go-to-market strategy and product positioning to compelling presentations, sales collateral, and campaigns that drive demand.', 490, 584],
  ['Content, Social & Communications', 'Stay visible, relevant, and top of mind. Build credibility and meaningful connections through content, social media, thought leadership, PR, email marketing, and creative campaigns.', 780, 584],
  ['Executive Leadership & Marketing Operations', 'Get the marketing leadership your business needs, without the overhead. Drive strategy, lead teams, align Sales and Marketing, and turn performance insights into measurable growth.', 1070, 584],
];
$('#services-grid').innerHTML = services.map(([title, description, x, y]) => `<article class="service-card"><span class="asset service-icon" data-image="services-source" data-crop="${x},${y},25,25,1440,1031" aria-hidden="true"></span><h3>${title}</h3><p>${description}</p></article>`).join('');

const projects = [
  {name:'Fello', image:'fello-source', logo:[119,237,110,24], title:'Repositioning a Brand. Transforming the Experience. Driving Growth.', description:"Reshaped Fello's market positioning, digital presence, and ecommerce experience, supported by demand generation, paid media, SEO, partner marketing, product launches, and sales enablement.", labels:['Website revamp','Mobile rental experience']},
  {name:"Brand’s", image:'brands-source', logo:[119,274,110,24], title:'Strengthening the Brand. Elevating the Experience. Supporting Growth.', description:"Elevated Brand's Payroll's positioning and digital presence through a new website, stronger brand communications, product marketing, and go-to-market initiatives.",labels:['Payroll website','Brand communications']},
  {name:'BlueSquare X', image:'bluesquare-source', logo:[119,355,110,24], title:'Bringing a Bold Vision to Market.', description:'Helped establish and launch Vision X through strategic positioning, product marketing, digital experiences, campaigns, and sales enablement, building visibility across luxury and commercial markets.',labels:['Digital experience','Vision X brand collateral']},
  {name:'Supreme Talent', image:'supreme-source', logo:[119,315,110,24], title:'Standing Out in a Crowded Recruiting Market.', description:"Sharpened Supreme Talent's positioning and market presence through brand messaging, digital marketing, content, thought leadership, and campaigns designed to engage employers and attract opportunities.",labels:['Recruitment website','Editorial and thought leadership']},
];
let currentProject = 0;
$('.project-tabs').innerHTML = projects.map((p,i)=>`<button class="project-tab" id="project-tab-${i}" role="tab" aria-controls="project-panel" aria-selected="${i===0}" tabindex="${i===0?0:-1}" aria-label="${p.name}" data-project="${i}"><span class="asset project-logo" data-image="${p.image}" data-crop="${p.logo.join(',')},1440,804" aria-hidden="true"></span></button>`).join('');

function renderProject(index, animate = true) {
  currentProject = (index + projects.length) % projects.length;
  const project = projects[currentProject];
  $$('.project-tab').forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===currentProject));tab.tabIndex=i===currentProject?0:-1;});
  $('#project-panel').setAttribute('aria-labelledby',`project-tab-${currentProject}`);
  $('#project-title').textContent=project.title;
  $('#project-description').textContent=project.description;
  $('.project-images').innerHTML=project.labels.map((label,i)=>`<button class="project-image-button" data-detail="${i}" aria-label="View ${project.name}: ${label}"><span class="asset" data-image="${project.image}" data-crop="${i===0?432:882},261,438,384,1440,804" role="img" aria-label="${project.name} — ${label}"></span><span class="project-open" aria-hidden="true">↗</span></button>`).join('');
  $('.project-counter').textContent=`0${currentProject+1} / 04`;
  mountAssets($('#work'));
  if(animate && !reducedMotion.matches){
    gsap.fromTo('.project-copy',{y:12,opacity:0},{y:0,opacity:1,duration:.55,overwrite:true,ease:'power3.out'});
    gsap.fromTo('.project-image-button',{y:25,opacity:0,clipPath:'inset(8% 0 0 0)'},{y:0,opacity:1,clipPath:'inset(0% 0 0 0)',duration:.8,stagger:.08,overwrite:true,ease:'power3.out'});
  }
}
renderProject(0,false);
$$('.project-tab').forEach((tab,i)=>{
  tab.addEventListener('click',()=>renderProject(i));
  tab.addEventListener('keydown',event=>{
    let next;
    if(['ArrowDown','ArrowRight'].includes(event.key))next=(i+1)%projects.length;
    if(['ArrowUp','ArrowLeft'].includes(event.key))next=(i+projects.length-1)%projects.length;
    if(event.key==='Home')next=0;
    if(event.key==='End')next=projects.length-1;
    if(next!==undefined){event.preventDefault();renderProject(next);$(`#project-tab-${next}`).focus();}
  });
});
$('#previous-project').addEventListener('click',()=>renderProject(currentProject-1));
$('#next-project').addEventListener('click',()=>renderProject(currentProject+1));
const tabLayout=matchMedia('(max-width: 600px)');
const setTabOrientation=()=>$('.project-tabs').setAttribute('aria-orientation',tabLayout.matches?'horizontal':'vertical');
tabLayout.addEventListener('change',setTabOrientation);setTabOrientation();

const menuButton=$('.menu-toggle'), mobileNav=$('#mobile-nav');
function setMenu(open){menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Close menu':'Open menu');mobileNav.classList.toggle('open',open);mobileNav.inert=!open;}
menuButton.addEventListener('click',()=>setMenu(menuButton.getAttribute('aria-expanded')!=='true'));
$$('a',mobileNav).forEach(link=>link.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menuButton.getAttribute('aria-expanded')==='true'){setMenu(false);menuButton.focus();}});
document.addEventListener('click',event=>{if(!$('.site-header').contains(event.target))setMenu(false);});
matchMedia('(min-width:801px)').addEventListener('change',event=>{if(event.matches)setMenu(false);});

const dialog=$('.media-dialog');
function openDialog(title,content){$('#dialog-title').textContent=title;$('.dialog-content').replaceChildren(content);mountAssets(dialog);dialog.showModal();document.body.classList.add('modal-open');if(!reducedMotion.matches)gsap.fromTo(dialog,{y:20,opacity:0},{y:0,opacity:1,duration:.4,ease:'power3.out'});}
$('.close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');});
$('.project-images').addEventListener('click',event=>{
  const button=event.target.closest('[data-detail]');if(!button)return;
  const index=Number(button.dataset.detail), project=projects[currentProject];
  const image=document.createElement('div');image.className='asset';image.dataset.image=project.image;image.dataset.crop=`${index===0?432:882},261,438,384,1440,804`;image.style.aspectRatio='438 / 384';image.setAttribute('role','img');image.setAttribute('aria-label',project.labels[index]);
  openDialog(`${project.name} — ${project.labels[index]}`,image);
});
$('.video-card').addEventListener('click',()=>{
  const content=document.createElement('div');
  content.className='dialog-placeholder';
  content.innerHTML='<div class="asset" data-image="intro-source" data-crop="460,220,860,584,1440,924" role="img" aria-label="Mayhem Growth introduction artwork"></div><p>Preview only — video playback is not included.</p>';
  openDialog('The vision. The execution. The results.',content);
});

function configurePreviewForm(selector){
  const form=$(selector);
  form.addEventListener('submit',event=>{
    event.preventDefault();
    if(!form.reportValidity())return;
    $('.form-status',form).textContent=selector==='#contact-form'
      ? 'Preview only — your message has not been sent.'
      : 'Preview only — your email has not been submitted.';
  });
}
configurePreviewForm('#contact-form');
configurePreviewForm('#newsletter-form');
mountAssets();

// Keep natural scrolling, native focus behavior, and a complete reduced-motion path.
const motion=gsap.matchMedia();
motion.add('(prefers-reduced-motion: no-preference)',()=>{
  gsap.from('.hero h1 .line>span',{yPercent:110,rotate:1.5,opacity:0,duration:1.25,stagger:.12,ease:'power4.out',delay:.15});
  gsap.from('.hero-portrait',{opacity:0,y:35,scale:1.035,duration:1.6,ease:'power3.out',delay:.1});
  if(matchMedia('(min-width: 801px)').matches){
    gsap.to('.hero-portrait .asset',{y:45,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
    gsap.fromTo('.video-card .asset',{scale:1.06,yPercent:-2},{yPercent:2,ease:'none',scrollTrigger:{trigger:'.video-card',start:'top bottom',end:'bottom top',scrub:1}});
  }
  $$('.reveal').forEach(el=>gsap.from(el,{y:25,opacity:0,duration:.9,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 94%',once:true}}));
  $$('.image-reveal').forEach(el=>gsap.from(el,{clipPath:'inset(12% 0% 0% 0% round 14px)',y:32,opacity:.2,duration:1.25,ease:'power4.out',scrollTrigger:{trigger:el,start:'top 92%',once:true}}));
  gsap.from('.service-card',{y:55,rotateX:7,opacity:0,duration:.95,stagger:.1,ease:'power3.out',scrollTrigger:{trigger:'.services-grid',start:'top 88%',once:true}});
  gsap.from('.process-grid li',{y:28,opacity:0,duration:.85,stagger:.13,ease:'power3.out',scrollTrigger:{trigger:'.process-grid',start:'top 88%',once:true}});
  const quote=$('.quote>p');
  const walker=document.createTreeWalker(quote,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(node=>{const fragment=document.createDocumentFragment();node.textContent.split(/(\s+)/).forEach(word=>{if(!word.trim())fragment.append(document.createTextNode(word));else{const span=document.createElement('span');span.className='quote-word';span.textContent=word;fragment.append(span);}});node.replaceWith(fragment);});
  gsap.from('.quote-word',{opacity:.18,stagger:.08,ease:'none',scrollTrigger:{trigger:quote,start:'top 85%',end:'bottom 50%',scrub:.6}});
  gsap.to('.scroll-progress',{scaleX:1,ease:'none',scrollTrigger:{trigger:document.documentElement,start:'top top',end:'bottom bottom',scrub:.2}});
  const hover=matchMedia('(hover:hover) and (pointer:fine)');
  const cleanups=[];
  if(hover.matches){
    $$('.service-card').forEach(card=>{
      const move=event=>{const r=card.getBoundingClientRect();gsap.to(card,{rotateY:(event.clientX-r.left-r.width/2)/r.width*3,rotateX:-(event.clientY-r.top-r.height/2)/r.height*3,y:-4,duration:.5,ease:'power2.out',overwrite:'auto'});};
      const leave=()=>gsap.to(card,{rotateX:0,rotateY:0,y:0,duration:.7,ease:'power3.out',overwrite:'auto'});
      card.addEventListener('pointermove',move);card.addEventListener('pointerleave',leave);cleanups.push(()=>{card.removeEventListener('pointermove',move);card.removeEventListener('pointerleave',leave);});
    });
  }
  return ()=>{cleanups.forEach(fn=>fn());$$('.quote-word').forEach(span=>span.replaceWith(document.createTextNode(span.textContent)));};
});
const navigationObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){$$('.desktop-nav a').forEach(a=>{if(a.hash===`#${entry.target.id}`)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}});},{rootMargin:'-15% 0px -50% 0px'});
['home','services','work','reviews'].forEach(id=>navigationObserver.observe(document.getElementById(id)));
window.addEventListener('load',()=>ScrollTrigger.refresh());

/* PELEX ARTCRAFT SPACE — interface-only preview.
   App names, descriptions and available icon assets are based on ArtCraft's official directory.
   ArtCraft Studio is separate from the 17 Crafting Apps. */
(function(){
 'use strict';
 var ROOT='https://raw.githubusercontent.com/craft-table/getartcraft-website/main/images';
 var APPS=[
  ['photocraft','PhotoCraft','Image editing, layers, masks, type and brushes'],
  ['vectorcraft','VectorCraft','Vector illustration and drawing'],
  ['filmcraft','FilmCraft','Professional video editing and timeline tools'],
  ['lightcraft','LightCraft','Photo library and RAW development'],
  ['pdfcraft','PdfCraft','Read, organize, combine and secure PDFs'],
  ['effectcraft','EffectCraft','Motion graphics and visual effects'],
  ['anicraft','AniCraft','2D vector animation'],
  ['designcraft','DesignCraft','Page layout and publishing'],
  ['figcraft','FigCraft','Interface design and prototyping'],
  ['texturecraft','TextureCraft','3D texture painting'],
  ['materialcraft','MaterialCraft','Node-based procedural materials'],
  ['soundcraft','SoundCraft','Audio recording, editing and mixing'],
  ['wordcraft','WordCraft','Word processing and documents'],
  ['deckcraft','DeckCraft','Presentations and slide shows'],
  ['cadcraft','CADCraft','Computer-aided design and drafting'],
  ['gridcraft','GridCraft','Spreadsheets and data analysis'],
  ['craft-anything','Craft Anything','Explore software and build your own projects']
 ];
 var VERIFIED_ICONS={photocraft:1,vectorcraft:1,filmcraft:1,lightcraft:1,pdfcraft:1,effectcraft:1,designcraft:1,soundcraft:1,wordcraft:1,deckcraft:1,cadcraft:1,gridcraft:1};
 function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
 function addStyles(){
  if(document.getElementById('pxArtSpaceCss'))return;
  var s=document.createElement('style');s.id='pxArtSpaceCss';
  s.textContent=
   '.px-art-space{max-width:1180px;margin:0 auto;padding-bottom:30px}'+
   '.px-art-head{display:flex;align-items:center;gap:18px;padding:8px 0 22px;border-bottom:1px solid var(--line,#e3e8f1);margin-bottom:20px}'+
   '.px-art-brand{width:76px;height:76px;object-fit:contain;flex:none;border-radius:15px;background:#fff}'+
   '.px-art-eyebrow{font-size:11px;letter-spacing:.12em;font-weight:800;color:var(--muted,#68758c)}'+
   '.px-art-head h1{margin:4px 0;font-size:clamp(24px,4vw,32px);line-height:1.12;color:var(--ink,#17243b)}'+
   '.px-art-head p,.px-art-section p{margin:0;color:var(--muted,#68758c);font-size:14px}'+
   '.px-art-studio{display:flex;justify-content:space-between;align-items:center;gap:18px;border:1px solid var(--line,#e3e8f1);border-radius:16px;padding:18px 20px;background:var(--panel,#fff);margin:0 0 26px}'+
   '.px-art-studio-copy{max-width:760px}.px-art-studio h2{margin:5px 0;font-size:20px;color:var(--ink,#17243b)}'+
   '.px-art-studio p{margin:0 0 12px;color:var(--muted,#68758c);font-size:14px;line-height:1.5}'+
   '.px-art-studio a{font-weight:700;color:var(--accent,#2765bd);text-decoration:none}.px-art-studio img{width:76px;height:76px;object-fit:contain;flex:none;background:#fff!important;border:1px solid #e6eaf0;border-radius:12px;padding:6px;box-sizing:border-box}'+
   '.px-art-launch{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:0 18px;border-radius:10px;background:#0b2a5b;color:#fff!important;text-decoration:none;font-weight:700;margin-top:4px}'+
   '.px-art-launch:hover{background:#123b78}.px-art-account-note{font-size:12px!important;margin:9px 0 0!important;max-width:560px}'+
   '.px-art-section{margin:0 0 14px}.px-art-section h2{display:flex;align-items:center;gap:10px;margin:0 0 4px;font-size:19px;color:var(--ink,#17243b)}'+
   '.px-art-section h2 span{font-size:11px;font-weight:700;color:var(--muted,#68758c);border:1px solid var(--line,#e3e8f1);padding:4px 8px;border-radius:20px}'+
   '.px-art-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,225px),1fr));gap:13px}'+
   '.px-art-card{min-width:0;border:1px solid var(--line,#e3e8f1);border-radius:15px;padding:14px;background:var(--panel,#fff);display:flex;flex-direction:column;gap:8px}'+
   '.px-art-cardtop{display:flex;align-items:center;gap:11px}.px-art-icon{width:48px;height:48px;object-fit:contain;border-radius:11px;background:#fff;flex:none}'+
   '.px-art-monogram{width:48px;height:48px;display:grid;place-items:center;border-radius:11px;background:var(--bg,#f2f5fa);border:1px solid var(--line,#e3e8f1);font-weight:800;color:var(--ink,#17243b);flex:none}'+
   '.px-art-card h3{font-size:15px;line-height:1.25;margin:0;color:var(--ink,#17243b)}.px-art-card p{font-size:12px;line-height:1.45;margin:0;color:var(--muted,#68758c);min-height:35px}'+
   '.px-art-status{font-size:10px;font-weight:700;color:var(--muted,#68758c);padding-top:8px;border-top:1px solid var(--line,#e3e8f1)}'+
   '.px-art-note{font-size:12px;color:var(--muted,#68758c);margin:16px 0 0}'+
   '@media(max-width:560px){.px-art-head{align-items:flex-start;gap:12px}.px-art-brand{width:62px;height:62px}.px-art-studio{padding:14px}.px-art-studio img{width:54px;height:54px}.px-art-card{padding:12px}}'+
   ':root[data-theme="dark"] .px-art-brand,:root[data-theme="dark"] .px-art-icon,:root[data-theme="dark"] .px-art-studio img{background:#fff}';
  document.head.appendChild(s);
 }
 function render(){
  var grid=document.getElementById('pxArtGrid');if(!grid||grid.dataset.ready==='1')return;
  grid.dataset.ready='1';
  grid.innerHTML=APPS.map(function(a){
   var slug=a[0],name=a[1],desc=a[2],icon=VERIFIED_ICONS[slug]?'<img class="px-art-icon" src="'+ROOT+'/apps/'+slug+'/icon.webp" alt="" loading="lazy">':'<span class="px-art-monogram" aria-hidden="true">'+esc(name.split(/\s+/).map(function(x){return x[0]}).join('').slice(0,2).toUpperCase())+'</span>';
   return '<article class="px-art-card"><div class="px-art-cardtop">'+icon+'<h3>'+esc(name)+'</h3></div><p>'+esc(desc)+'</p><div class="px-art-status">App launch and file connection: next integration stage</div></article>';
  }).join('');
 }

 function addStudioActions(){
  var copy=document.querySelector('.px-art-studio-copy');
  if(copy&&!document.getElementById('pxArtStudioLaunch')){
   var a=document.createElement('a');
   a.id='pxArtStudioLaunch';
   a.href='https://app.getartcraft.com/browser-studio';
   a.target='_blank';
   a.rel='noopener noreferrer';
   a.className='px-art-launch';
   a.textContent='Open ArtCraft Studio';
   copy.appendChild(a);
   var note=document.createElement('p');
   note.className='px-art-account-note';
   note.textContent='Sign in or create your ArtCraft account securely in the official Studio. Pelex does not collect your ArtCraft password.';
   copy.appendChild(note);
  }
 }
 function restoreExistingScheduleNavigation(){
  var nav=document.querySelector('button[data-go="groups"]');
  if(nav&&!document.querySelector('button[data-go="scheduled"]')){
   var b=document.createElement('button');
   b.className='nav';
   b.setAttribute('data-go','scheduled');
   b.innerHTML='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>Scheduled<span class="nbadge" id="schedBadge" hidden aria-label="New scheduled results"></span>';
   nav.parentNode.insertBefore(b,nav);
  }
  var bot=document.getElementById('sBot');
  if(bot&&!Array.from(bot.options).some(function(o){return o.value==='general'})){
   var option=document.createElement('option');
   option.value='general';
   option.textContent='General Agent';
   bot.insertBefore(option,bot.options[0]||null);
  }
 }

 function init(){addStyles();render();addStudioActions();restoreExistingScheduleNavigation()}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
 window.PelexArtCraftSpace={apps:APPS,studioUrl:'https://app.getartcraft.com/'};
})();
/* PELEX ARTCRAFT (add-on)
   Adds an ArtCraft item to the navigation and a screen with one card for each app.
   An app opens inside Pelex only when its web build is on the site (/artcraft/<app>/index.html).
   Until then the card says "Browser version coming soon". No download links are shown.
   Each app is the official web build, unmodified. ArtCraft and app names are ArtCraft trademarks. */
(function(){
 var APPS=[
  {slug:'photocraft',name:'PhotoCraft',does:'Image editing: layers, masks, type, PSD files'},
  {slug:'filmcraft',name:'FilmCraft',does:'Video editing, colour and sound'},
  {slug:'wordcraft',name:'WordCraft',does:'Word processing (.docx)'},
  {slug:'gridcraft',name:'GridCraft',does:'Spreadsheets and data (.xlsx)'},
  {slug:'deckcraft',name:'DeckCraft',does:'Presentations (.pptx)'},
  {slug:'pdfcraft',name:'PdfCraft',does:'PDF editing'},
  {slug:'designcraft',name:'DesignCraft',does:'Page layout and publishing'},
  {slug:'soundcraft',name:'SoundCraft',does:'Audio recording, editing and mixing'},
  {slug:'cadcraft',name:'CADCraft',does:'2D and 3D drawing'}
 ];
 var BASE='/artcraft/';
 var CSS_ID='pxArtCss';

 function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
 function injectCss(){
  if(document.getElementById(CSS_ID)) return;
  var s=document.createElement('style'); s.id=CSS_ID;
  s.textContent='.px-art-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}'+
   '.px-art-card{border:1px solid var(--line,#dfe4ee);border-radius:14px;padding:14px;background:var(--panel,#fff);display:flex;flex-direction:column;gap:6px}'+
   '.px-art-tile{width:36px;height:36px;border-radius:9px;background:var(--soft,#eef1f6);display:inline-grid;place-items:center;font-weight:700;color:var(--ink,#0b1b4a)}'+
   '.px-art-btn{margin-top:8px;padding:9px 12px;border-radius:999px;border:0;background:var(--btnink,#0b1b4a);color:#fff;font-weight:700;cursor:pointer}'+
   '.px-art-muted{font-size:12px;color:var(--muted,#55617f)}'+
   '.px-art-frame{width:100%;height:calc(100vh - 140px);border:0;border-radius:12px;background:#fff}';
  document.head.appendChild(s);
 }

 function addNav(){
  if(document.querySelector('[data-go="artcraft"]')) return true;
  var sp=document.querySelector('button.nav[data-go="spotlight"]');
  if(!sp) return false;
  var b=document.createElement('button'); b.className='nav'; b.setAttribute('data-go','artcraft');
  b.innerHTML='<svg viewBox="0 0 24 24"><rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><rect x="13" y="13" width="8" height="8" rx="2"/></svg>ArtCraft';
  sp.parentNode.insertBefore(b, sp.nextSibling);
  return true;
 }

 function addScreen(){
  if(document.getElementById('v-artcraft')) return true;
  var sp=document.getElementById('v-spotlight');
  if(!sp) return false;
  var sec=document.createElement('section'); sec.className='view'; sec.id='v-artcraft'; sec.hidden=true;
  sec.innerHTML='<div class="wrap"><h2 style="margin:0 0 4px">ArtCraft</h2>'+
   '<p class="px-art-muted" style="margin:0 0 14px">Free creative and office apps. Each one opens here. Your files stay on your device.</p>'+
   '<div class="px-art-grid" id="pxArtGrid"></div><div id="pxArtFrameWrap" hidden></div></div>';
  sp.parentNode.insertBefore(sec, sp.nextSibling);
  return true;
 }

 async function available(slug){
  try{ var r=await fetch(BASE+slug+'/index.html',{method:'HEAD',cache:'no-store'}); return r.ok; }
  catch(e){ return false; }
 }

 function openApp(slug,name){
  var wrap=document.getElementById('pxArtFrameWrap'), grid=document.getElementById('pxArtGrid');
  wrap.hidden=false; grid.hidden=true;
  wrap.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><b>'+esc(name)+'</b><button type="button" class="px-art-btn" id="pxArtBack" style="margin:0;padding:7px 14px">Back to ArtCraft</button></div>'+
   '<iframe class="px-art-frame" src="'+BASE+esc(slug)+'/" title="'+esc(name)+'"></iframe>';
  document.getElementById('pxArtBack').onclick=function(){ wrap.hidden=true; wrap.innerHTML=''; grid.hidden=false };
 }

 async function renderCards(){
  var grid=document.getElementById('pxArtGrid'); if(!grid || grid.getAttribute('data-px-done')) return;
  grid.setAttribute('data-px-done','1');
  var states=await Promise.all(APPS.map(function(a){ return available(a.slug) }));
  grid.innerHTML=APPS.map(function(a,i){
   var on=states[i];
   return '<div class="px-art-card"><span class="px-art-tile">'+esc(a.name.charAt(0))+'</span>'+
    '<b>'+esc(a.name)+'</b><span class="px-art-muted">'+esc(a.does)+'</span>'+
    (on
      ? '<button type="button" class="px-art-btn" data-art-open="'+esc(a.slug)+'" data-art-name="'+esc(a.name)+'">Open</button>'
      : '<span class="px-art-muted" style="margin-top:8px">Browser version coming soon</span>')+
    '</div>';
  }).join('');
  grid.querySelectorAll('[data-art-open]').forEach(function(b){
   b.onclick=function(){ openApp(b.getAttribute('data-art-open'), b.getAttribute('data-art-name')) };
  });
 }

 function run(){
  injectCss();
  var n=addNav(), s=addScreen();
  if(s) renderCards();
 }
 window.pxArtCraft={apps:APPS, run:run, available:available};
 setInterval(run, 1500);
 if(document.readyState==='complete') setTimeout(run,0); else window.addEventListener('load', run);
})();

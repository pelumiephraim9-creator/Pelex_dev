/* PELEX ARTCRAFT SPACE — interface-only stage.
   Original ArtCraft marks are loaded from the ArtCraft website source repository.
   App builds are intentionally not activated until their folders are uploaded and verified. */
(function(){
  'use strict';
  var APPS=[
    {slug:'photocraft',name:'PhotoCraft',does:'Image editing: layers, masks, type and PSD files'},
    {slug:'filmcraft',name:'FilmCraft',does:'Video editing, colour and sound'},
    {slug:'wordcraft',name:'WordCraft',does:'Word processing and DOCX documents'},
    {slug:'gridcraft',name:'GridCraft',does:'Spreadsheets and data analysis'},
    {slug:'pdfcraft',name:'PdfCraft',does:'PDF reading, editing and page tools'},
    {slug:'deckcraft',name:'DeckCraft',does:'Presentations and slide shows'},
    {slug:'designcraft',name:'DesignCraft',does:'Page layout and publishing'},
    {slug:'soundcraft',name:'SoundCraft',does:'Audio recording, editing and mixing'},
    {slug:'cadcraft',name:'CADCraft',does:'2D and 3D drawing and drafting'}
  ];
  var ROOT='https://raw.githubusercontent.com/craft-table/getartcraft-website/main/images';
  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function styles(){
    if(document.getElementById('pxArtSpaceCss'))return;
    var s=document.createElement('style');s.id='pxArtSpaceCss';
    s.textContent=
      '.px-art-space{max-width:1180px;margin:0 auto;padding-bottom:30px}'+
      '.px-art-head{display:flex;align-items:center;gap:18px;padding:8px 0 22px;border-bottom:1px solid var(--line,#e3e8f1);margin-bottom:22px}'+
      '.px-art-brand{width:82px;height:82px;object-fit:contain;flex:none;border-radius:16px;background:#fff}'+
      '.px-art-eyebrow{font-size:11px;letter-spacing:.12em;font-weight:800;color:var(--muted,#68758c)}'+
      '.px-art-head h1{margin:4px 0;font-size:clamp(24px,4vw,32px);line-height:1.12;color:var(--ink,#17243b)}'+
      '.px-art-head p{margin:0;color:var(--muted,#68758c);font-size:14px;max-width:660px}'+
      '.px-art-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,230px),1fr));gap:14px}'+
      '.px-art-card{min-width:0;border:1px solid var(--line,#e3e8f1);border-radius:16px;padding:16px;background:var(--panel,#fff);display:flex;flex-direction:column;gap:9px;box-shadow:0 2px 10px rgba(16,35,70,.035)}'+
      '.px-art-cardtop{display:flex;align-items:center;gap:12px}'+
      '.px-art-icon{width:56px;height:56px;object-fit:contain;border-radius:12px;background:#fff;flex:none}'+
      '.px-art-card h2{font-size:16px;line-height:1.25;margin:0;color:var(--ink,#17243b)}'+
      '.px-art-card p{font-size:13px;line-height:1.45;margin:0;color:var(--muted,#68758c);min-height:38px}'+
      '.px-art-status{font-size:11px;font-weight:700;color:var(--muted,#68758c);padding-top:9px;border-top:1px solid var(--line,#e3e8f1)}'+
      '.px-art-status:before{content:"";display:inline-block;width:7px;height:7px;border-radius:50%;background:#d59a36;margin:0 7px 1px 0}'+
      '.px-art-note{font-size:12px;color:var(--muted,#68758c);margin:18px 0 0}'+
      '@media(max-width:560px){.px-art-head{align-items:flex-start;gap:12px}.px-art-brand{width:64px;height:64px}.px-art-card{padding:13px}}'+
      ':root[data-theme="dark"] .px-art-brand,:root[data-theme="dark"] .px-art-icon{background:#fff}';
    document.head.appendChild(s);
  }
  function render(){
    var grid=document.getElementById('pxArtGrid');if(!grid||grid.dataset.ready==='1')return;
    grid.dataset.ready='1';
    grid.innerHTML=APPS.map(function(app){
      var icon=ROOT+'/apps/'+app.slug+'/icon.webp';
      return '<article class="px-art-card">'+
        '<div class="px-art-cardtop"><img class="px-art-icon" src="'+icon+'" alt="'+esc(app.name)+' official app icon" loading="lazy"><h2>'+esc(app.name)+'</h2></div>'+
        '<p>'+esc(app.does)+'</p>'+
        '<div class="px-art-status">App files will be connected in the next stage</div>'+
      '</article>';
    }).join('');
  }
  function init(){styles();render()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  window.PelexArtCraftSpace={apps:APPS};
})();
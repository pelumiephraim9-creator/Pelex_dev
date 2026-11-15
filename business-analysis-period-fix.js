/* PELEX REPORTING PERIOD LINK
   Keeps the Monthly Financial Overview month and Analysis reporting window aligned.
   Presentation/filter state only: never writes or modifies financial records. */
(function(){
 'use strict';
 var bound=false,observer=null;
 function byId(id){return document.getElementById(id)}
 function endOfMonth(value){
  var m=/^(\d{4})-(\d{2})$/.exec(value||'');
  if(!m)return '';
  var last=new Date(Number(m[1]),Number(m[2]),0).getDate();
  return m[1]+'-'+m[2]+'-'+String(last).padStart(2,'0');
 }
 function syncFromMonth(){
  var picker=byId('pxMonthPick'),gran=byId('lsGran'),date=byId('lsDate');
  if(!picker||!picker.value||!gran||!date)return false;
  var end=endOfMonth(picker.value);
  if(!end)return false;
  gran.value='month';
  date.value=end;
  if(window.__lsRender)window.__lsRender();
  return true;
 }
 function bind(){
  var picker=byId('pxMonthPick');
  if(picker&&!picker.dataset.pxPeriodLink){
   picker.dataset.pxPeriodLink='1';
   picker.addEventListener('change',syncFromMonth);
  }
  var gran=byId('lsGran'),date=byId('lsDate');
  if(gran&&!gran.dataset.pxPeriodLink){
   gran.dataset.pxPeriodLink='1';
   gran.addEventListener('change',function(){if(window.__lsRender)window.__lsRender()});
  }
  if(date&&!date.dataset.pxPeriodLink){
   date.dataset.pxPeriodLink='1';
   date.addEventListener('change',function(){if(window.__lsRender)window.__lsRender()});
  }
  if(picker&&gran&&date&&!bound){bound=true;syncFromMonth()}
 }
 function start(){
  bind();
  if(!observer&&document.body&&window.MutationObserver){
   observer=new MutationObserver(bind);
   observer.observe(document.body,{childList:true,subtree:true});
  }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
 else start();
 window.addEventListener('load',start);
 var tries=0,t=setInterval(function(){start();if(++tries>=40)clearInterval(t)},500);
})();
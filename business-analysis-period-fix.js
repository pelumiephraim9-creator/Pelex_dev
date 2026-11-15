/* PELEX MONTHLY / ANALYSIS PERIOD SYNCHRONISATION
   Keeps month selection, ledger analysis and transaction detail periods aligned. */
(function(){
 'use strict';
 function id(x){return document.getElementById(x)}
 function endOfMonth(v){var p=/^(\d{4})-(\d{2})$/.exec(v||'');if(!p)return '';var d=new Date(Number(p[1]),Number(p[2]),0);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
 function syncAnalysis(month){
  var gran=id('lsGran'),date=id('lsDate'),end=endOfMonth(month);
  if(gran)gran.value='month';
  if(date&&end)date.value=end;
  if(window.__lsRender)window.__lsRender();
 }
 function bind(){
  var picker=id('pxMonthPick');
  if(picker&&!picker.dataset.pxPeriodBound){
   picker.dataset.pxPeriodBound='1';
   picker.addEventListener('change',function(){syncAnalysis(picker.value)});
   syncAnalysis(picker.value);
  }
  var gran=id('lsGran'),date=id('lsDate');
  if(gran&&!gran.dataset.pxPeriodBound){gran.dataset.pxPeriodBound='1';gran.addEventListener('change',function(){if(window.__lsRender)window.__lsRender()})}
  if(date&&!date.dataset.pxPeriodBound){date.dataset.pxPeriodBound='1';date.addEventListener('change',function(){if(window.__lsRender)window.__lsRender()})}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);
 window.addEventListener('load',function(){setTimeout(bind,700);setTimeout(bind,1700)});
 var n=0,t=setInterval(function(){bind();if(++n>40)clearInterval(t)},500);
})();
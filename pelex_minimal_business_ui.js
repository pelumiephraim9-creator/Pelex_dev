/* PELEX BUSINESS ANALYSIS LAYOUT
   Responsive monthly financial overview card layout.
   Figures, charts and month picker remain driven by the existing application. */
(function(){
 'use strict';
 var CSS_ID='pxBizAnalysisLayoutCss';
 if(document.getElementById(CSS_ID))return;
 var css=
  '#pxFinancialSummary{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:14px;background:transparent;border:0;box-shadow:none;padding:0}'+
  '#pxFinancialSummary>.dhead,#pxFinancialSummary>.dnote,#pxFinancialSummary>h3,#pxFinancialSummary>#pxOpsDashboard,#pxFinancialSummary>.px-year-summary{grid-column:1/-1}'+
  '#pxFinancialSummary>.dhead{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}'+
  '#pxFinancialSummary>h3{margin:6px 0 0;font-size:15px}'+
  '#pxFinancialSummary #pxMonthCards{grid-column:1/-1;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,170px),1fr));gap:12px}'+
  '#pxFinancialSummary #pxMonthCards>*{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:14px;min-width:0;box-sizing:border-box}'+
  '#pxFinancialSummary .two{grid-column:1/-1;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:14px;margin-top:0!important}'+
  '#pxFinancialSummary .two>.an-card{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:14px;min-width:0;box-sizing:border-box;overflow:hidden}'+
  '#pxFinancialSummary .px-year-summary{margin-top:0!important;padding-top:14px!important;border-top:1px solid var(--line);background:transparent}'+
  '#pxFinancialSummary #pxMonthCards b,#pxFinancialSummary .ls-kpis b{white-space:nowrap;overflow-wrap:normal;font-size:clamp(14px,2.1vw,18px)}'+
  '#pxFinancialSummary .px-analysis-details{grid-column:1/-1;border:1px solid var(--line);border-radius:14px;padding:12px;background:var(--panel)}'+
  '#pxFinancialSummary .px-analysis-details>summary{cursor:pointer;font-weight:650;list-style:none}'+
  '#pxFinancialSummary .px-analysis-details>summary::-webkit-details-marker{display:none}'+
  '#pxFinancialSummary .px-analysis-details>summary:after{content:"+";float:right;color:var(--muted)}'+
  '#pxFinancialSummary .px-analysis-details[open]>summary:after{content:"−"}'+
  '#pxFinancialSummary .px-analysis-details>.dcard{margin:12px 0 0!important;border:0!important;padding:0!important;box-shadow:none!important}'+
  '@media(max-width:820px){#pxFinancialSummary #pxMonthCards{grid-template-columns:repeat(2,minmax(0,1fr))}#pxFinancialSummary .two{grid-template-columns:minmax(0,1fr)}}';
 var style=document.createElement('style');style.id=CSS_ID;style.textContent=css;document.head.appendChild(style);
 function id(x){return document.getElementById(x)}
 function arrange(){
  var financial=id('pxFinancialSummary'),wrap=id('lsWrap');if(!financial||!wrap)return;
  var analysis=Array.from(wrap.children).find(function(n){var h=n.querySelector&&n.querySelector('h2');return h&&h.textContent.trim()==='Analysis'});
  if(analysis){
   var details=financial.querySelector('.px-analysis-details');
   if(!details){details=document.createElement('details');details.className='px-analysis-details';var summary=document.createElement('summary');summary.textContent='View monthly details and analysis';details.appendChild(summary);financial.appendChild(details)}
   if(analysis.parentNode!==details)details.appendChild(analysis);
  }
  var yearly=financial.querySelector('.px-year-summary');
  if(yearly){var h=yearly.querySelector('h3');if(h)h.textContent='Annual project overview'}
  var pm=Array.from(wrap.children).find(function(n){var h=n.querySelector&&n.querySelector('h2');return h&&h.textContent.trim()==='Project management'});
  if(pm&&pm!==wrap.lastElementChild)wrap.appendChild(pm);
 }
 function start(){
  arrange();
  ['pxFinancialSummary','lsWrap'].forEach(function(k){var n=id(k);if(n&&!n.dataset.pxBizLayoutWatch){n.dataset.pxBizLayoutWatch='1';new MutationObserver(arrange).observe(n,{childList:true,subtree:true})}});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
 window.addEventListener('load',function(){setTimeout(start,500);setTimeout(start,1600)});
 var attempts=0,t=setInterval(function(){start();if(++attempts>40)clearInterval(t)},500);
})();
/* PELEX BUSINESS ANALYSIS LAYOUT (add-on)
   Arranges the Monthly financial overview as a grid of separate cards, on phones and on desktop.
   Only the layout changes. The figures, charts and month picker are unchanged. */
(function(){
 var CSS_ID='pxBizAnalysisLayoutCss';
 if(document.getElementById(CSS_ID)) return;
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
  '@media(max-width:820px){#pxFinancialSummary #pxMonthCards{grid-template-columns:repeat(2,minmax(0,1fr))}#pxFinancialSummary .two{grid-template-columns:minmax(0,1fr)}}';
 var s=document.createElement('style'); s.id=CSS_ID; s.textContent=css;
 document.head.appendChild(s);
})();
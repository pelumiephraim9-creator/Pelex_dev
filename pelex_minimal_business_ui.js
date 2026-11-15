/* Pelex minimal business workspaces — presentation only.
   Keeps the monthly landing summary concise; detailed records remain in their existing workspaces.
   No ledger writes, schema changes, accounting formula changes, or business setup changes. */
(function(){
'use strict';
if(window.__pxMinimalWorkspacesLoaded)return;
window.__pxMinimalWorkspacesLoaded=true;
var css=[
'#pxFinancialSummary{margin:0 0 14px!important;padding:16px!important;border-radius:14px!important}',
'#pxFinancialSummary>.dnote,#pxFinancialSummary>#pxMonthNote,#pxFinancialSummary>#pxOpsDashboard{display:none!important}',
'#pxMonthCards .px-min-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin:12px 0}',
'#pxMonthCards .px-min-card{min-width:0;min-height:84px;text-align:left;width:100%;padding:12px 13px;border:1px solid var(--line);border-radius:12px;background:var(--panel);color:var(--ink);display:flex;flex-direction:column;justify-content:center;gap:5px;cursor:pointer;box-shadow:none}',
'.px-min-card .px-min-label{font-size:11px;color:var(--muted);font-weight:500}',
'.px-min-card .px-min-value{font-size:clamp(17px,2.4vw,22px);font-weight:700;line-height:1.2;overflow-wrap:anywhere}',
'.px-min-card .px-min-hint{font-size:10px;color:var(--muted)}',
'#pxFinancialSummary .px-min-secondary{margin:4px 0 0;border:0;border-top:1px solid var(--line);padding:10px 0 0}',
'#pxFinancialSummary .px-min-secondary>summary{font-size:12px;color:var(--muted);cursor:pointer;list-style:none}',
'#pxFinancialSummary .px-min-secondary>summary::-webkit-details-marker{display:none}',
'#pxFinancialSummary .px-min-secondary>summary:after{content:"+";float:right}',
'#pxFinancialSummary .px-min-secondary[open]>summary:after{content:"−"}',
'.px-min-secondary-list{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding-top:10px}',
'.px-min-secondary-item{padding:9px 10px;border:1px solid var(--line);border-radius:9px;min-width:0}',
'.px-min-secondary-item span{display:block;color:var(--muted);font-size:10px}',
'.px-min-secondary-item b{display:block;font-size:13px;overflow-wrap:anywhere}',
'.px-min-shade{position:fixed;inset:0;z-index:99990;background:rgba(10,20,38,.38);opacity:0;visibility:hidden;transition:opacity .16s}',
'.px-min-drawer{position:fixed;z-index:99991;top:0;right:0;width:min(420px,100vw);height:100dvh;background:var(--panel);color:var(--ink);border-left:1px solid var(--line);box-shadow:-12px 0 32px rgba(0,0,0,.12);transform:translateX(102%);transition:transform .2s;display:flex;flex-direction:column}',
'.px-min-shade.open{opacity:1;visibility:visible}.px-min-drawer.open{transform:translateX(0)}',
'.px-min-head{display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid var(--line)}.px-min-head strong{flex:1}',
'.px-min-close{width:36px;height:36px;border:1px solid var(--line);border-radius:9px;background:var(--soft);color:var(--ink);font-size:20px}',
'.px-min-content{padding:16px;overflow:auto}.px-min-big{font-size:25px;font-weight:750;margin:0 0 8px;overflow-wrap:anywhere}',
'.px-min-copy{font-size:13px;line-height:1.55;color:var(--muted)}',
'.px-min-open-register{margin-top:12px;border:0;border-radius:9px;background:var(--btn);color:var(--btnink);padding:10px 14px;font-weight:650}',
'#pxProjectManager .px-year-summary{margin-top:16px!important;padding-top:14px!important;border-top:1px solid var(--line)!important}',
'#pxYearCards .ls-kpi{padding:10px!important;min-height:66px}',
'@media(max-width:600px){#pxMonthCards .px-min-grid{gap:7px}.px-min-card{min-height:76px;padding:10px!important}.px-min-secondary-list{grid-template-columns:1fr 1fr}.px-min-drawer{top:auto;right:0;left:0;bottom:0;width:100%;height:auto;max-height:88dvh;border:0;border-top:1px solid var(--line);border-radius:16px 16px 0 0;transform:translateY(102%)}.px-min-drawer.open{transform:translateY(0)}}'
].join('\n');
var style=document.createElement('style');style.id='px-minimal-workspaces-style';style.textContent=css;document.head.appendChild(style);
function byId(id){return document.getElementById(id)}
function el(tag,cls,txt){var n=document.createElement(tag);if(cls)n.className=cls;if(txt!=null)n.textContent=String(txt);return n}
var shade,drawer,heading,content;
function close(){if(!drawer)return;shade.classList.remove('open');drawer.classList.remove('open');document.body.style.overflow=''}
function open(title,amount,description){
 if(!drawer){
  shade=el('div','px-min-shade');shade.onclick=close;
  drawer=el('aside','px-min-drawer');drawer.setAttribute('role','dialog');drawer.setAttribute('aria-modal','true');
  var h=el('div','px-min-head');heading=el('strong','',title);var x=el('button','px-min-close','×');x.type='button';x.setAttribute('aria-label','Close details');x.onclick=close;
  h.append(heading,x);content=el('div','px-min-content');drawer.append(h,content);document.body.append(shade,drawer);
  document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
 }
 heading.textContent=title;content.replaceChildren();
 if(amount)content.append(el('div','px-min-big',amount));
 if(description)content.append(el('p','px-min-copy',description));
 var b=el('button','px-min-open-register','Open transaction records');b.type='button';
 b.onclick=function(){close();var r=byId('pxTransactionRegister');if(r)r.scrollIntoView({behavior:'smooth',block:'start'})};
 content.append(b);shade.classList.add('open');drawer.classList.add('open');document.body.style.overflow='hidden';
}
function readCard(node){var b=node.querySelector('b'),s=node.querySelector('span');return{value:b?b.textContent.trim():'',label:s?s.textContent.trim():''}}
function renderCards(host,isYear){
 if(!host)return;
 var raw=Array.from(host.querySelectorAll(':scope > .ls-kpi'));
 if(!raw.length)return;
 var sig=raw.map(function(x){return x.textContent.trim()}).join('|');
 if(host.dataset.pxMinimalSig===sig&&host.querySelector('.px-min-grid'))return;
 host.dataset.pxMinimalSig=sig;
 var data=raw.map(readCard);
 if(isYear){
  var yearRules=[[/^original yearly capital$/i,'Annual startup capital'],[/^cash in$/i,'Cash received this year'],[/^cash out$/i,'Cash paid this year'],[/^net operating result$/i,'Annual operating result']];
  var yearCards=data.map(function(x){var rule=yearRules.find(function(r){return r[0].test(x.label)});return rule?{label:rule[1],value:x.value}:null}).filter(Boolean);
  host.replaceChildren();var yearGrid=el('div','px-min-grid');yearGrid.style.cssText='display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px';
  yearCards.forEach(function(x){var c=el('div','ls-kpi');c.innerHTML='<b></b><span></span>';c.querySelector('b').textContent=x.value;c.querySelector('span').textContent=x.label;yearGrid.append(c)});
  host.append(yearGrid);return;
 }
 var primaryRules=[[/^cash received$/i,'Cash received'],[/^cash paid$/i,'Cash paid'],[/^operating revenue$/i,'Operating revenue'],[/^operating profit$/i,'Operating result']];
 var primary=primaryRules.map(function(rule){var x=data.find(function(d){return rule[0].test(d.label)});return x?{label:rule[1],value:x.value}:null}).filter(Boolean);
 var extras=data.filter(function(x){return !primaryRules.some(function(rule){return rule[0].test(x.label)}) && !/^original yearly capital$/i.test(x.label) && !/^(operational amount|operational cost)$/i.test(x.label)});
 host.replaceChildren();var grid=el('div','px-min-grid');
 primary.forEach(function(x){
  var c=el('button','px-min-card');c.type='button';
  c.append(el('span','px-min-label',x.label),el('span','px-min-value',x.value),el('span','px-min-hint','Tap for details'));
  c.onclick=function(){open(x.label,x.value,'This figure belongs to the selected reporting month. The full transaction-level breakdown remains in the transaction register.');};
  grid.append(c);
 });
 host.append(grid);
 if(extras.length){
  var d=el('details','px-min-secondary');d.append(el('summary','','Other monthly figures'));
  var list=el('div','px-min-secondary-list');
  extras.forEach(function(x){var item=el('div','px-min-secondary-item');item.append(el('span','',x.label),el('b','',x.value));list.append(item)});
  d.append(list);host.append(d);
 }
}
function placeYearlyManagement(){
 var yearly=document.querySelector('.px-year-summary');
 var wrap=byId('lsWrap');
 if(!yearly||!wrap)return;
 var project=Array.from(wrap.children).find(function(n){
  var h=n.querySelector&&n.querySelector('h2');return h&&/^Project management$/i.test(h.textContent.trim());
 });
 if(project&&yearly.parentNode!==project)project.appendChild(yearly);
 yearly.style.margin='12px 0 0';
 yearly.style.padding='12px 0 0';
 yearly.style.borderTop='1px solid var(--line)';
 var title=yearly.querySelector('h3');
 if(title)title.textContent='Yearly project overview';
}
function compactDashboard(){
 var root=byId('pxFinancialSummary');if(!root)return;
 /* Keep the supplied monthly layout's charts, month picker and notes visible. */
 var note=byId('pxMonthNote');if(note)note.hidden=false;
 var heading=root.querySelector('h3');if(heading&&heading.textContent.trim()==='Selected month')heading.hidden=false;
}
function arrangeBusinessCards(){
 var financial=byId('pxFinancialSummary'),wrap=byId('lsWrap');
 if(!financial)return;
 /* Keep the monthly overview compact. Analysis is nested inside its own
    collapsed detail area and is never displayed as a neighbouring card. */
 var analysis=null;
 if(wrap){
  analysis=Array.from(wrap.children).find(function(n){
   var h=n.querySelector&&n.querySelector('h2');return h&&h.textContent.trim()==='Analysis';
  });
 }
 var detail=financial.querySelector('.px-month-detail');
 if(!detail){
  detail=el('div','px-month-detail');
  detail.hidden=true;
  detail.style.cssText='margin-top:14px;padding-top:12px;border-top:1px solid var(--line)';
  var toggle=el('button','btn alt px-month-toggle','View monthly details');
  toggle.type='button';toggle.setAttribute('aria-expanded','false');
  toggle.style.cssText='margin-top:10px;width:100%;text-align:center';
  function toggleMonthly(){
   var opening=detail.hidden;
   detail.hidden=!opening;
   toggle.textContent=opening?'Close monthly details':'View monthly details';
   toggle.setAttribute('aria-expanded',opening?'true':'false');
  }
  toggle.onclick=toggleMonthly;
  financial.appendChild(toggle);
  financial.appendChild(detail);
  financial.style.cursor='pointer';
  financial.addEventListener('click',function(e){
   if(e.target.closest('button,input,select,a,label,summary,textarea'))return;
   toggleMonthly();
  });
 }
 if(analysis&&analysis.parentNode!==detail)detail.appendChild(analysis);
 if(analysis){
  analysis.style.margin='0';
  var ah=analysis.querySelector('h2');if(ah)ah.hidden=true;
 }
 /* Keep the single yearly overview inside the existing Project Management
    card. Do not delete its yearly or monthly project-management content. */
 placeYearlyManagement();
 /* Retain existing Project management and Data entry cards in their workspace. */
}
function apply(){
 arrangeBusinessCards();
 renderCards(byId('pxMonthCards'),false);
 renderCards(byId('pxYearCards'),true);
 compactDashboard();
}
function watch(id){var node=byId(id);if(!node||node.dataset.pxMinimalWatch)return;node.dataset.pxMinimalWatch='1';new MutationObserver(apply).observe(node,{childList:true,subtree:true})}
function start(){apply();['pxMonthCards','pxYearCards','pxProjectManager'].forEach(watch)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
window.addEventListener('load',function(){setTimeout(start,400);setTimeout(start,1500)});
var attempts=0,t=setInterval(function(){start();if(++attempts>30)clearInterval(t)},700);
})();

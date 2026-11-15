/* PELEX LIVE REFRESH (add-on)
   When a receipt, slip, upload, project or loan is saved, the business screens update at once, with no reload.
   Two ways are used together:
   1. Database changes for this business, through Supabase realtime (any device, any window).
   2. A signal between windows on this device (the slip window and the main page), through BroadcastChannel.
   Each business only receives its own changes, because the database rules apply to realtime too. */
(function(){
 var TABLES=['ledger_entries','uploads','business_projects','agreements'];
 var CHANNEL_NAME='pelex-business';
 var timer=null, bc=null, sub=null, lastWs=null;

 function wsId(){ try{ return localStorage.getItem('pelex_ws')||'' }catch(e){ return '' } }

 // Refresh every business screen that is open. Debounced, so a burst of saves causes one reload.
 function refreshNow(){
  try{ if(typeof window.__pxDashboardLoad==='function') window.__pxDashboardLoad() }catch(e){}
  try{ if(typeof window.__lsLoad==='function') window.__lsLoad() }catch(e){}
  try{ document.dispatchEvent(new CustomEvent('pelex:data-changed',{detail:{workspace:wsId()}})) }catch(e){}
 }
 function refresh(){
  clearTimeout(timer);
  timer=setTimeout(refreshNow,250);
 }

 // Call this after any successful save in another window, so the main page updates at once.
 function notify(){
  refresh();
  try{ if(bc) bc.postMessage({type:'changed',workspace:wsId(),at:Date.now()}) }catch(e){}
 }

 function openBroadcast(){
  if(bc || typeof BroadcastChannel==='undefined') return;
  bc=new BroadcastChannel(CHANNEL_NAME);
  bc.onmessage=function(e){ if(e && e.data && e.data.type==='changed' && e.data.workspace===wsId()) refresh() };
 }

 function subscribe(){
  var ws=wsId();
  if(!ws || !window.sb || typeof window.sb.channel!=='function') return;
  if(sub && lastWs===ws) return;
  if(sub){ try{ window.sb.removeChannel(sub) }catch(e){} sub=null }
  lastWs=ws;
  var ch=window.sb.channel('pelex-biz-'+ws);
  TABLES.forEach(function(t){
   ch.on('postgres_changes',{event:'*',schema:'public',table:t,filter:'workspace_id=eq.'+ws}, function(){ refresh() });
  });
  sub=ch.subscribe();
 }

 window.pxLiveRefresh={ notify:notify, refresh:refresh, subscribe:subscribe };
 openBroadcast();
 setInterval(function(){ openBroadcast(); subscribe() }, 3000);
})();
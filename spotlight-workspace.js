(function(){
'use strict';
var $=function(id){return document.getElementById(id)};
var state={started:false,active:'',providers:[],pages:{},busy:false,query:'',mini:null,placeholder:null,moved:null};
var names={youtube:'YouTube',vimeo:'Vimeo',pexels:'Pexels',pixabay:'Pixabay',internet_archive:'Internet Archive',peertube:'PeerTube'};
var logos={youtube:'youtube',vimeo:'vimeo',pexels:'pexels',pixabay:'pixabay',internet_archive:'internetarchive',peertube:'peertube'};
function esc(v){return String(v==null?'':v).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function parse(v){return JSON.parse(String(v||'').replace(/^```json\s*|\s*```$/g,'').trim())}
function signed(){return !!(window.sb&&window.curUser&&window.curUser.id)}
function call(action,provider,query,pageToken){
 if(typeof askPublicAgent!=='function'||typeof agentMeta!=='function')return Promise.reject(new Error('Spotlight service is not ready'));
 return askPublicAgent(action==='providers'?'List the video sources available in Spotlight':'Search '+provider+' videos for '+query,Object.assign({},agentMeta(),{intent:'spotlight_catalog',action:action,provider:provider||'',query:query||'',pageToken:pageToken||'',__sid:'spotlight-'+Date.now()}));
}
function sourceMarkup(){
 var all='<button class="px-spot-source" type="button" data-source="" aria-pressed="'+(!state.active)+'"><span class="px-spot-source-icon">✦</span><span class="px-spot-source-copy"><b>All sources</b><small>Explore everything</small></span></button>';
 return all+state.providers.map(function(p){var id=p.id||p.name||'',logo=logos[id];return '<button class="px-spot-source" type="button" data-source="'+esc(id)+'" aria-pressed="'+(state.active===id)+'"><span class="px-spot-source-icon">'+(logo?'<img src="https://cdn.simpleicons.org/'+logo+'" alt="">':'▶')+'</span><span class="px-spot-source-copy"><b>'+esc(names[id]||p.name||id)+'</b><small>Explore videos</small></span></button>'}).join('');
}
function renderSourceNav(){var root=$('pxSpotSources');if(root)root.innerHTML=sourceMarkup()}
function renderCard(v,provider){
 var title=esc(v.title||'Video'),channel=esc(v.channel||v.creator||names[provider]||provider),duration=esc(v.duration||v.length||''),url=(typeof v.url==='string'&&/^https:\/\//i.test(v.url))?v.url:'';
 if(provider==='youtube'&&(v.id||v.videoId))url='https://www.youtube.com/watch?v='+encodeURIComponent(v.id||v.videoId);
 var media='';
 if(provider==='youtube'&&window.PelexYouTubePlayer)media='<div class="px-spot-media">'+window.PelexYouTubePlayer.cardHtml(v)+'</div>';
 else if((provider==='pexels'||provider==='pixabay')&&v.embedUrl&&/^https:\/\//i.test(v.embedUrl))media='<video controls playsinline preload="metadata" src="'+esc(v.embedUrl)+'"></video>';
 else if(v.embedUrl&&/^https:\/\//i.test(v.embedUrl))media='<iframe src="'+esc(v.embedUrl)+'" title="'+title+'" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>';
 else media='<div class="px-spot-loading">Preview unavailable · open on source</div>';
 var player=provider==='youtube'?media:'<div class="px-spot-media">'+media+'</div>';
 var ref=String(v.id||v.videoId||url||'');
 return '<article class="px-spot-card" data-provider="'+esc(provider)+'" data-ref="'+esc(ref)+'" data-url="'+esc(url)+'" data-title="'+title+'" data-channel="'+channel+'">'+player+'<div class="px-spot-meta"><b>'+title+'</b><small>'+channel+(duration?' · '+duration:'')+'</small>'+(url?'<a href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">Watch on '+esc(names[provider]||provider)+' ↗</a>':'')+'</div><div class="px-spot-card-actions"><button type="button" data-save-video>☆ Save</button><button type="button" data-float-video>▣ Keep playing</button></div></article>';
}
function showMessage(message){var root=$('pxSpotResults');if(root)root.innerHTML='<div class="px-spot-loading">'+esc(message)+'</div>'}
function loadFeed(query,append){
 if(state.busy)return;state.busy=true;state.query=query||state.query||'popular technology education entertainment';
 var root=$('pxSpotResults');if(!root){state.busy=false;return}
 if(!append){state.pages={};showMessage('Finding videos for you…')}
 var providers=state.active?[state.active]:state.providers.map(function(p){return p.id}).filter(Boolean);
 if(!providers.length)providers=['youtube'];
 var tasks=providers.filter(function(p){return !append||state.pages[p]}).map(function(p){
  return call('search',p,state.query,append?state.pages[p]:null).then(function(raw){var data=parse(raw);return {provider:p,videos:data.videos||[],next:data.nextPageToken||null}}).catch(function(){return {provider:p,videos:[],next:null}});
 });
 Promise.all(tasks).then(function(rows){
  if(!append)root.innerHTML='';var count=0;
  rows.forEach(function(row){row.videos.forEach(function(v){root.insertAdjacentHTML('beforeend',renderCard(v,row.provider));count++});if(row.next)state.pages[row.provider]=row.next;else delete state.pages[row.provider]});
  if(!count&&!append)showMessage('No videos are available right now. Try another topic or source.');
  if(window.PelexYouTubePlayer)window.PelexYouTubePlayer.mount(root);
  var more=$('pxSpotMore');if(more)more.hidden=!Object.keys(state.pages).length;
 }).finally(function(){state.busy=false});
}
function initSources(){
 if(!signed()){showMessage('Sign in to explore videos in Spotlight.');return}
 showMessage('Checking connected video sources…');
 call('providers').then(function(raw){var data=parse(raw);state.providers=(data.providers||[]).filter(function(p){return p.ready!==false});renderSourceNav();var profile=window.curUser.user_metadata&&window.curUser.user_metadata.profile;var interests=profile&&profile.interests||[];loadFeed(interests[0]||'popular technology education entertainment',false)}).catch(function(){state.providers=[{id:'youtube',name:'YouTube'}];renderSourceNav();loadFeed('popular technology education entertainment',false)});
}
function ensureMini(){
 if(state.mini)return state.mini;
 var box=document.createElement('section');box.id='pxSpotMini';box.hidden=true;box.innerHTML='<header><b>Spotlight player</b><span><button type="button" data-mini-return>Return to video</button> <button type="button" data-mini-close>Close</button></span></header><div id="pxSpotMiniMedia"></div>';
 document.body.appendChild(box);state.mini=box;
 box.addEventListener('click',function(e){if(e.target.closest('[data-mini-close]'))restoreMedia(true);if(e.target.closest('[data-mini-return]')){restoreMedia(false);if(typeof go==='function')go('spotlight')}});
 return box;
}
function restoreMedia(close){
 if(state.placeholder&&state.placeholder.parentNode&&state.moved){state.placeholder.parentNode.insertBefore(state.moved,state.placeholder);state.placeholder.remove()}
 state.placeholder=null;state.moved=null;
 if(state.mini){var host=$('pxSpotMiniMedia');if(host)host.innerHTML='';if(close)state.mini.hidden=true}
}
function floatCard(card){
 var media=card.querySelector('.px-yt-shell,iframe,video');if(!media)return;
 ensureMini();restoreMedia(false);state.placeholder=document.createComment('Spotlight media return point');media.parentNode.insertBefore(state.placeholder,media);state.moved=media;
 $('pxSpotMiniMedia').appendChild(media);state.mini.hidden=false;
}
function savedPanel(){var p=$('pxSpotSavedPanel');if(!p)return;p.hidden=false;p.innerHTML='<b>Saved videos</b><div class="px-spot-loading">Loading your saved videos…</div>';if(!signed()){p.innerHTML='<b>Saved videos</b><p>Sign in to view saved videos.</p>';return}
 window.sb.from('spotlight_saved').select('id,source,video_ref,title,channel,page_url,saved_at').eq('owner_id',window.curUser.id).order('saved_at',{ascending:false}).limit(100).then(function(r){if(r.error){p.innerHTML='<b>Saved videos</b><p>Could not load saved videos.</p>';return}var rows=r.data||[];p.innerHTML='<b>Saved videos</b>'+(rows.length?rows.map(function(v){return '<div class="px-spot-saved-row"><span><b>'+esc(v.title)+'</b><br><small>'+esc(v.channel||v.source)+'</small><br><a href="'+esc(v.page_url)+'" target="_blank" rel="noopener noreferrer">Watch video</a></span><button type="button" data-remove-saved="'+esc(v.id)+'">Remove</button></div>'}).join(''):'<p>No saved videos yet.</p>')});
}
function saveCard(card,button){
 if(!signed()){button.textContent='Sign in to save';return}
 var provider=card.dataset.provider,ref=card.dataset.ref,url=card.dataset.url;if(!ref||!url){button.textContent='Unavailable';return}
 button.disabled=true;button.textContent='Saving…';
 window.sb.from('spotlight_saved').upsert({owner_id:window.curUser.id,source:provider,video_ref:ref,title:card.dataset.title||'Video',channel:card.dataset.channel||'',page_url:url},{onConflict:'owner_id,source,video_ref'}).then(function(r){button.textContent=r.error?'Try again':'✓ Saved';button.disabled=false});
}
function start(){
 if(state.started)return;state.started=true;
 document.addEventListener('click',function(e){
  var nav=e.target.closest('[data-go="spotlight"]');if(nav)setTimeout(function(){if(!$('v-spotlight').hidden&&!state.providers.length)initSources()},0);
  var source=e.target.closest('[data-source]');if(source){var id=source.dataset.source;state.active=id===state.active?'':id;renderSourceNav();$('pxSpotFeedTitle').textContent=state.active?(names[state.active]||state.active)+' videos':'Recommended for you';$('pxSpotFeedSub').textContent=state.active?'Videos from this source':'Fresh picks from connected platforms';var q=$('pxSpotQuery').value.trim();loadFeed(q||'popular technology education entertainment',false)}
  var search=e.target.closest('#pxSpotSearch');if(search){var q=$('pxSpotQuery').value.trim();if(q.length<2){showMessage('Enter at least two characters to search.');return}loadFeed(q,false)}
  var more=e.target.closest('#pxSpotMore');if(more){more.disabled=true;more.textContent='Loading…';loadFeed(state.query,true);setTimeout(function(){more.disabled=false;more.textContent='Load more videos'},1200)}
  var save=e.target.closest('[data-save-video]');if(save)saveCard(save.closest('.px-spot-card'),save);
  var fl=e.target.closest('[data-float-video]');if(fl)floatCard(fl.closest('.px-spot-card'));
  if(e.target.closest('#pxSpotSavedToggle')){var p=$('pxSpotSavedPanel');p.hidden=!p.hidden;e.target.closest('#pxSpotSavedToggle').setAttribute('aria-expanded',String(!p.hidden));if(!p.hidden)savedPanel()}
  var remove=e.target.closest('[data-remove-saved]');if(remove&&signed()){window.sb.from('spotlight_saved').delete().eq('id',Number(remove.dataset.removeSaved)).eq('owner_id',window.curUser.id).then(savedPanel)}
 });
 $('pxSpotQuery').addEventListener('keydown',function(e){if(e.key==='Enter')$('pxSpotSearch').click()});
 if(!$('v-spotlight').hidden)initSources();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();

/* PELEX REPLY FORMAT — shared renderer for all Pelex assistant chat surfaces.
   Only assistant reply content is rendered. User messages, inputs, controls and
   existing code-action UI are left untouched. */
(function(){
  'use strict';
  if(window.__pelexReplyFormatInstalled)return;
  window.__pelexReplyFormatInstalled=true;
  var styleId='pxReplyFmtCss';
  function css(){
    if(document.getElementById(styleId))return;
    var s=document.createElement('style');s.id=styleId;
    s.textContent=
      '.md.px-reply-format,.px-reply-format{display:block;width:100%;max-width:100%;box-sizing:border-box;text-align:left!important;line-height:1.62;overflow-wrap:anywhere}'+
      '.px-reply-format p{display:block;margin:0 0 10px;text-align:left!important;white-space:normal}'+
      '.px-reply-format p:last-child{margin-bottom:0}'+
      '.px-reply-format h3{display:block;font-size:16px;font-weight:700;line-height:1.35;margin:15px 0 7px;text-align:left!important}'+
      '.px-reply-format h4{display:block;font-size:15px;font-weight:700;line-height:1.4;margin:12px 0 5px;text-align:left!important}'+
      '.px-reply-format ul,.px-reply-format ol{display:block;margin:5px 0 12px;padding-left:22px;text-align:left!important}'+
      '.px-reply-format li{margin:0 0 5px;padding-left:2px;text-align:left!important}'+
      '.px-reply-format strong{font-weight:700}.px-reply-format em{font-style:italic}'+
      '.px-reply-format code{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:.92em}'+
      '.px-reply-format pre{display:block;max-width:100%;overflow:auto;text-align:left;white-space:pre;padding:12px;border:1px solid var(--line,#dfe4ee);border-radius:10px;background:var(--soft,#f5f7fb)}'+
      '.px-reply-format pre code{white-space:pre}'+
      '.px-reply-format a{overflow-wrap:anywhere}'+
      '.px-reply-format img{max-width:100%;height:auto}'+
      '.px-reply-format table{display:block;max-width:100%;overflow-x:auto;border-collapse:collapse;text-align:left}'+
      '.px-reply-format th,.px-reply-format td{padding:7px 9px;border:1px solid var(--line,#dfe4ee);text-align:left;vertical-align:top}'+
      '.px-reply-format hr{border:0;border-top:1px solid var(--line,#dfe4ee);margin:12px 0}'+
      '.msg:not(.me) .px-reply-format,.bm:not(.me) .px-reply-format{text-align:left!important}';
    document.head.appendChild(s);
  }
  function safeUrl(value){
    try{var u=new URL(value,location.href);return /^(https?:)$/.test(u.protocol)?u.href:null}catch(e){return null}
  }
  function inline(parent,text){
    var re=/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<)\]]+)|\*\*([^*\n]+)\*\*|__([^_\n]+)__|\*([^*\n]+)\*|_([^_\n]+)_|`([^`\n]+)`/g;
    var last=0,m,tail='';
    while((m=re.exec(text))){
      if(m.index>last)parent.appendChild(document.createTextNode(text.slice(last,m.index)));
      var node=null,url;
      if(m[2]&&(url=safeUrl(m[2]))){node=document.createElement('img');node.src=url;node.alt=m[1]||'Image';node.loading='lazy';node.referrerPolicy='no-referrer';node.onerror=function(){this.hidden=true}}
      else if(m[4]&&(url=safeUrl(m[4]))){node=document.createElement('a');node.href=url;node.textContent=m[3];node.target='_blank';node.rel='noopener noreferrer nofollow'}
      else if(m[5]&&(url=safeUrl(m[5]))){node=document.createElement('a');node.href=url;node.textContent=m[5].replace(/[.,;:!?]+$/,'');node.target='_blank';node.rel='noopener noreferrer nofollow';var tail=m[5].slice(node.textContent.length)}
      else if(m[6]||m[7]){node=document.createElement('strong');node.textContent=m[6]||m[7]}
      else if(m[8]||m[9]){node=document.createElement('em');node.textContent=m[8]||m[9]}
      else if(m[10]){node=document.createElement('code');node.textContent=m[10]}
      if(node)parent.appendChild(node);else parent.appendChild(document.createTextNode(m[0]));
      if(typeof tail==='string'&&tail){parent.appendChild(document.createTextNode(tail));tail=''}
      last=re.lastIndex;
    }
    if(last<text.length)parent.appendChild(document.createTextNode(text.slice(last)));
  }
  function cleanLine(line){
    return line.replace(/[\u200B-\u200D\uFEFF]/g,'')
      .replace(/\\([*_\x60~])/g,'$1')
      .replace(/^\s{0,3}(?:\*{1,3}|_{1,3})\s*$/,'')
      .replace(/\s+\*{1,3}\s*$/,'')
      .replace(/\s+_{1,3}\s*$/,'');
  }
  function render(source){
    var root=document.createElement('div');root.className='md px-reply-format';
    var lines=String(source==null?'':source).replace(/\r/g,'').split('\n').map(cleanLine),i=0;
    function isUl(s){return /^\s*[-*•]\s+/.test(s)}
    function isOl(s){return /^\s*\d+[.)]\s+/.test(s)}
    function isHead(s){return /^\s{0,3}#{1,4}\s+/.test(s)}
    function isRule(s){return /^\s*(?:-{3,}|_{3,}|\*{3,})\s*$/.test(s)}
    function isTableSep(s){return /^\s*\|?\s*:?-{2,}:?\s*(?:\|\s*:?-{2,}:?\s*)+\|?\s*$/.test(s)}
    while(i<lines.length){
      var line=lines[i];
      if(!line.trim()){i++;continue}
      if(/^\s*```/.test(line)){
        var lang=line.replace(/^\s*```/,'').trim(),buf=[];i++;
        while(i<lines.length&&!/^\s*```/.test(lines[i]))buf.push(lines[i++]);
        if(i<lines.length)i++;
        var pre=document.createElement('pre'),cd=document.createElement('code');if(lang)cd.setAttribute('data-language',lang);cd.textContent=buf.join('\n');pre.appendChild(cd);root.appendChild(pre);continue;
      }
      var h=line.match(/^\s{0,3}(#{1,4})\s+(.*)$/);
      if(h){var hd=document.createElement(h[1].length<=2?'h3':'h4');inline(hd,h[2].replace(/\s+#+\s*$/,'').trim());root.appendChild(hd);i++;continue}
      if(isRule(line)){root.appendChild(document.createElement('hr'));i++;continue}
      if(/^\s*\*\*[^*].*\*\*\s*$/.test(line)&&line.trim().length<100){
        var heading=document.createElement('h3');inline(heading,line.trim().replace(/^\*\*|\*\*$/g,''));root.appendChild(heading);i++;continue;
      }
      if((line.indexOf('|')>-1||line.indexOf('\t')>-1)&&i+1<lines.length&&(isTableSep(lines[i+1])||(line.indexOf('\t')>-1&&lines[i+1].indexOf('\t')>-1))){
        var rows=[];
        if(isTableSep(lines[i+1])){rows.push(line.replace(/^\s*\|/,'').replace(/\|\s*$/,'').split('|').map(function(x){return x.trim()}));i+=2;while(i<lines.length&&lines[i].trim()&&lines[i].indexOf('|')>-1){rows.push(lines[i++].replace(/^\s*\|/,'').replace(/\|\s*$/,'').split('|').map(function(x){return x.trim()}))}}
        else{while(i<lines.length&&lines[i].indexOf('\t')>-1)rows.push(lines[i++].split('\t').map(function(x){return x.trim()}))}
        var table=document.createElement('table'),tbody=document.createElement('tbody');rows.forEach(function(row,ri){var tr=document.createElement('tr');row.forEach(function(cell){var td=document.createElement(ri===0?'th':'td');inline(td,cell);tr.appendChild(td)});tbody.appendChild(tr)});table.appendChild(tbody);root.appendChild(table);continue;
      }
      if(isUl(line)||isOl(line)){
        var ordered=isOl(line),rx=ordered?/^\s*\d+[.)]\s+/:/^\s*[-*•]\s+/,list=document.createElement(ordered?'ol':'ul');
        while(i<lines.length&&rx.test(lines[i])){var li=document.createElement('li');inline(li,lines[i].replace(rx,''));list.appendChild(li);i++}
        root.appendChild(list);continue;
      }
      var p=document.createElement('p'),first=true;
      while(i<lines.length&&lines[i].trim()&&!isHead(lines[i])&&!isUl(lines[i])&&!isOl(lines[i])&&!isRule(lines[i])&&!/^\s*```/.test(lines[i])){
        if(!first)p.appendChild(document.createElement('br'));
        first=false;inline(p,lines[i].trim());i++;
      }
      root.appendChild(p);
    }
    return root;
  }
  css();
  window.mdRender=render;
  window.pxReplyFormat={render:render,scan:function(){return true}};
})();

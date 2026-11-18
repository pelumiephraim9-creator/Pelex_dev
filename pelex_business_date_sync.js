/* Keeps the approved Business Agent reporting date consistent across daily folders. */
(function(){
 'use strict';
 var original=window.__lsBuildDays;
 if(typeof original==='function'&&!original.__asOfBound){
  var wrapped=function(rows){
   var date=document.getElementById('lsDate');
   var asOf=date&&date.value;
   var visible=Array.isArray(rows)?rows.filter(function(row){
    var d=String(row&&row.entry_date||'');
    return !asOf||!d||d<=asOf;
   }):rows;
   return original.call(this,visible);
  };
  wrapped.__asOfBound=true;
  window.__lsBuildDays=wrapped;
 }
})();
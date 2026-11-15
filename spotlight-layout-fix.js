/* PELEX SPOTLIGHT LAYOUT (add-on)
   Fixes the three-panel Spotlight layout. The app's global aside rules (fixed 272px column, phone drawer)
   were applied to the Spotlight sources and search panels, which pushed them over the feed or off-screen.
   These rules apply only inside the Spotlight screen. Load after /spotlight-workspace.css. */
(function(){
 var id='pxSpotLayoutCss';
 if(document.getElementById(id)) return;
 var s=document.createElement('style'); s.id=id;
 s.textContent="/* Spotlight layout: the app's global aside rules (fixed 272px column, phone drawer) must not apply to the Spotlight panels. */\n#v-spotlight aside.px-spot-sidebar,\n#v-spotlight aside.px-spot-search-panel{\n  position:sticky;top:18px;left:auto;right:auto;bottom:auto;\n  width:auto;max-width:none;min-width:0;height:auto;max-height:none;\n  transform:none;margin:0;padding:14px;box-sizing:border-box;\n  background:var(--panel);border:1px solid var(--line);border-radius:17px;\n  box-shadow:none;display:block;overflow:visible;opacity:1;pointer-events:auto;z-index:auto\n}\n#v-spotlight .px-spot-workspace{grid-template-columns:218px minmax(0,1fr) 250px}\n#v-spotlight aside.px-spot-search-panel{grid-column:3;grid-row:1}\n#v-spotlight .px-spot-main{grid-column:2;grid-row:1}\n#v-spotlight aside.px-spot-sidebar{grid-column:1;grid-row:1}\n@media(max-width:1120px){\n  #v-spotlight .px-spot-workspace{grid-template-columns:190px minmax(0,1fr)}\n  #v-spotlight aside.px-spot-search-panel{grid-column:2;grid-row:1;position:static}\n  #v-spotlight .px-spot-main{grid-column:2;grid-row:2}\n  #v-spotlight aside.px-spot-sidebar{grid-column:1;grid-row:1/span 2}\n}\n@media(max-width:720px){\n  #v-spotlight .px-spot-workspace{display:flex;flex-direction:column;gap:12px}\n  #v-spotlight aside.px-spot-search-panel,#v-spotlight aside.px-spot-sidebar,#v-spotlight .px-spot-main{position:static;width:100%}\n}\n";
 document.head.appendChild(s);
})();

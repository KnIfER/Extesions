// ==UserScript==
// @name         色情引擎
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://av.xvideos-dl.top/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=xvideos-dl.top
// @grant        none
// ==/UserScript==


(function() {
    'use strict';
	window.addEventListener('contextmenu', (e)=>{
		debug(e);
		var lnk;
		for(var i=0,n;(n=e.path[i]) && i<8;i++) {
			if(n.tagName==='A') {
				lnk = n;
				e.preventDefault();
				e.stopPropagation();
				break;
			}
		}
		if(lnk) {
            var name = '色情引擎______'+lnk.innerText.trim();
			const event = new CustomEvent('bkmk', { detail: {url:lnk.href,name:name}});
			window.dispatchEvent(event);
		}
	});

})();
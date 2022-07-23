// ==UserScript==
// @name         ThePorn
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://theporn.cc/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=theporn.cc
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
	var fav, sniffed, btnBig;
	var TweakBookmarkAndCopy = function(e) {
		var url = sniffed && sniffed.url;
		console.log('bigBtn found, url parsed=', url, sniffed);
		var title = document.title;
		if(fav==0) title = 'd______'+title;
		else if(fav==1) title = 'lv______'+title;
		else if(fav==2) title = 'lv______'+title+' qq___qq___';

		var bkEvt = new CustomEvent('bkmk', { detail: {url:location.href,name:title,update:true}});
		window.dispatchEvent(bkEvt, function(data) { });

		if(btnBig) {
			btnBig.innerText = url+'\r\n'+document.title+'.flv\r\n';
			debug(btnBig.innerText);
			var range = document.createRange();
			range.selectNode(btnBig);
			getSelection().empty();
			getSelection().addRange(range);
			document.execCommand("Copy");
		}
	}
	
	var SniffedCB = function(e) {
		sniffed = e;
		TweakBookmarkAndCopy();
	};

	function bigFav(f) {
		debug('bigFav='+f)
		fav = f;
		if(sniffed) {
			TweakBookmarkAndCopy();
		} else {
			var sniffEvt = new CustomEvent('sniffurl', {detail : {cb:'SniffedCB'}});
			window.dispatchEvent(sniffEvt, function(data) { });
		}
	}

	window.addEventListener('SniffedCB', (e)=>{
		SniffedCB(e.detail)
	});

	window.addEventListener('click', (e)=>{
		debug(e);
		var bigBtn;
		for(var i=0,n;(n=e.path[i]) && i<8;i++) {
			if(n.className==='ui reply form') {
				btnBig = bigBtn = n;
				break;
			}
		}
		if(bigBtn) {
			if(e.button==0) {
				bigFav(0);
			}
			// else if(e.button==1) {
			// 	bigFav(2);
			// }
		}
	});

	window.addEventListener('contextmenu', (e)=>{
		debug(e);
		var all, lnk, bigBtn;
		for(var i=0,n;(n=e.path[i]) && i<8;i++) {
			if(n.classList.contains('avdata-outer')) {
				all = n;
			}
			else if(n.tagName==='A') {
				lnk = n;
			}
			else if(n.className==='ui reply form') {
				btnBig = bigBtn = n;
			}
			if(all && lnk || bigBtn) {
				e.preventDefault();
				e.stopPropagation();
				break;
			}
		}
		if(bigBtn) {
			bigFav(e.shiftKey?2:1); // 右键，中庸喜欢
		}
		else if(all && lnk) {
			var range = document.createRange();
			range.selectNode(all);
			getSelection().empty();
			getSelection().addRange(range);
			// document.execCommand("Copy");
			
			const event = new CustomEvent('bkmk', { detail: {url:lnk.href,name:all.innerText}});
			window.dispatchEvent(event);
		}
	});

})();
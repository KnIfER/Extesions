// ==UserScript==
// @name         抖yin视频下载
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://www.douyin.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        unsafeWindow
// ==/UserScript==

(function() {
    'use strict';

var log = console.log;

var url=location.href, pass=url.startsWith('p/', 26) && !url.startsWith('p/html/',26)
	|| url.startsWith('p/all', 26);
//log("小姐姐我来啦！", pass, url);
if(1)
{

    // 单机导航至视频中间而不是暂停
	window.addEventListener("click", function(e){
		//console.log("click::", e);
		var t=e.srcElement;
		if(t.tagName=="VIDEO") {
			t.currentTime = t.duration/2;
			e.preventDefault();
			e.stopPropagation();
		}
	}, true);

    
	// window.addEventListener("mousedown", function(e){
	// 	if(e.button===1) { // middle
	// 		var t=e.srcElement;
	// 		if(t.className==="video-interactive-area"||t.className==="backimg-warp") {
	// 			chrome.runtime.sendMessage({
	// 				type: 'gifdwn',
	// 				request: "noreq"
	// 			}, function(data) {
					
	// 			});
	// 			e.preventDefault();
	// 		}
	// 	}
	// });

    
	// 右击直接下载美妞视频
	window.addEventListener("contextmenu", function(e){
		var t=e.srcElement;
        log('contextmenu', t);
        var b1=t.className==='X0EtU0s6';
        if(b1)
            t = document.getElementsByTagName('VIDEO')[0];
        if(t && t.tagName=="VIDEO") {
            window._tvideo = t;
			window._largat = t.src;
			window._largat_dir = t.src;
			console.log(window.player_data);
			// chrome.runtime.sendMessage({
			// 	type: 'gifdwn',
			// 	request: "noreq"
			// }, function(data) {
				
			// });
            var u=t.firstChild.src;
			var n='';

			if(b1) {
				n = document.querySelector("#root > div > div.T_foQflM > div > div > div.leftContainer.w0R6mo9z > div:nth-child(1) > div.nIyi1iFP > div > div.UCT89JiM > div").innerText;
				n = document.querySelector("#root > div > div.T_foQflM > div > div > div.leftContainer.w0R6mo9z > div.bQEtX7d8 > div > div.mONd8Zeh > div.CjPRy13J > a > div").innerText+'_'+n;
			} else {
				n=document.querySelector("#root > div > div.T_foQflM > div > div > div.XM26psoY > div._1mISMfK2 > p.nLpBdOIE");
				if(n) n=n.innerText; else n='';
				var name=document.querySelector("#root > div > div._4c5KdUMD > div:nth-child(2) > div.Hk7Yo3Ed > div > div.KXURcZ2l.playerContainer.P8fJYYpG > div > div > xg-video-container > div > div.video-info-detail > div.account > div.account-name > span > span")
				||document.querySelector("#root > div > div.T_foQflM > div > div > div.ckqOrial > div.mwbaK9mv > div:nth-child(2) > div.Hk7Yo3Ed > div > div.KXURcZ2l.playerContainer.P8fJYYpG > div > div > xg-video-container > div > div.video-info-detail > div.account > div.account-name > span > span > span > span > span > span");
				if(name) name=name.innerText; else name='';
				n=name+'_'+n;
			}
			var vp = t;
			while(vp=vp.parentNode) {
				if(vp.classList.contains('xgplayer')) break;
			}
			if(vp) {
				var nameEl = vp.getElementsByClassName('Nu66P_ba Pz8t2meP')[0];
				if(nameEl) {
					n=nameEl.innerText+'_'+n;
				}
			}
			n=n+'.mp4';
            const event = new CustomEvent('dirdwn', { detail: {url:u,name:n}});
            window.dispatchEvent(event);
			e.preventDefault();
			e.stopPropagation();
        }
    }, true);
}

})();
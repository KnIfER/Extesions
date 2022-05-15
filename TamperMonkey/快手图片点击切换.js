// ==UserScript==
// @name         快手图片点击切换
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://live.kuaishou.com/*
// @icon         https://www.google.com/s2/favicons?domain=kuaishou.com
// @grant        unsafeWindow
// ==/UserScript==

(function() {
    'use strict';
    var lastEle = 0;
	var dnds=[]
    function fireKeyEvent(e, evtType, keyCode) {
        var mock = new KeyboardEvent('keydown', { ctrlKey: false });
        mock.key = String.fromCharCode(keyCode);
        mock.code = keyCode;


        e.dispatchEvent(mock);
    }

	function delayTop(){
		top=1;
		//debug('delayTop::', document.getElementsByClassName("long-mode viewing")[0].scrollTop)
	}
	var x,y,top;
	var initTitle=0;
	var rewindInterval=0;
	var rewindStopTm=0;
	var scrollEl;
	function rewindScroll() {
		//scrollEl.scrollTop+=5;
		var e=scrollEl.parentElement;
		e.scrollBy({
			top : 1.5
			,behavior: "instant"
		});
		if(e.scrollTop + e.offsetHeight + 10 >= e.scrollHeight) {
			e.scrollTop=0;
		}
	}
	function rewindStop() {
		debug('rewindStop!!!');
		clearInterval(rewindInterval);
		rewindInterval=0;
	}
	function init(){
		console.log("init!!!");
		var stopFunc = function(e1){
			//console.log("---------------------- stop!!!");
			e1.stopPropagation();
		};
		document.addEventListener("mousedown", function(e){
			var el = e.srcElement;
			if(!initTitle) {
				initTitle=1;
				try{
					var knickName = document.getElementsByClassName('user-info-name')[0].firstChild.textContent.trim();
					var id = document.getElementsByClassName('user-info-other')[0].firstChild.innerText;//.replace('快手ID：', '');
					document.title = knickName + '[' + id + ' ]';
				} catch(e){
					try{
						var knickName = document.getElementsByClassName('profile-user-name')[0].childNodes[1].textContent.trim();
						document.title = knickName + '[快手直播]';
					} catch(e){
						debug(e);
					}
				}
			}
			if(el.className==="mask") {
				unsafeWindow.rewind=false;
				if(rewindInterval)
					rewindStop();
			}
			if(el.className==="long-mode-item") {
				var src=el.src||el.href;
				if(src && dnds[src]) { // lastEle===el
					//console.log("ignore!!!", src);
					el.addEventListener("click", stopFunc);
					var e=document.getElementsByClassName('long-mode viewing')[0];
					if(e && e.scrollTop + e.offsetHeight + 10 >= e.scrollHeight) {
						delayTop();
						if(x==e.clientX && y==e.clientY) {
							unsafeWindow.rewind=true;
						}
					}
				} else {
					if(src)dnds[src]=1;
					el.removeEventListener("click", stopFunc);
				}
			}
			x=e.clientX;y=e.clientY;
		});

		document.addEventListener("mouseup", function(e){
			if(top) {
				document.getElementsByClassName("long-mode viewing")[0].scrollTop=0;
				top=0;
				return;
			}
			var el = e.srcElement;
			if(el.className==="viewer-container-img")
				document.getElementsByClassName("img-arrow-right")[0].click()
			if(el.className==="long-mode-item" && e.button===0) {
				//el.parentElement.scrollBy(0, el.parentElement.offsetHeight);
                if(unsafeWindow.rewind) {
					// 点击驱动的平滑滚动！！！
					scrollEl = el;
					if(rewindInterval==0) {
						debug('setInterval!!!');
						rewindInterval = setInterval(rewindScroll, 5);
					}
					//clearTimeout(rewindStopTm);
					//rewindStopTm=setTimeout(rewindStop, 500);
				} else {
					el.parentElement.scrollBy({
						//top:  el.parentElement.offsetHeight*0.8
						//top:document.documentElement.clientHeight
						//top:  document.body.offsetHeight
						top : (unsafeWindow.rewind?(25):(el.parentElement.offsetHeight/2))
						,behavior: unsafeWindow.rewind?"instant":"instant"
					});
					//fireKeyEvent(document, "keydown", 34);
				}
				lastEle=el;
			}
		});
		document.addEventListener("contextmenu", function(e){
			if(e.srcElement.className==="long-mode-item") {
				//e.srcElement.parentElement.scrollBy(0, e.srcElement.parentElement.offsetHeight);
                e.srcElement.parentElement.scrollBy({
                    top:  -e.srcElement.parentElement.offsetHeight/2,
                    behavior: "smooth"
                });
                //fireKeyEvent(document, "keydown", 34);
				e.preventDefault();
			}
		});

	}

	//setTimeout(init, 200);

	init();

    // Your code here...
})();
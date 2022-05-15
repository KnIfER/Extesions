// ==UserScript==
// @name         快手视频下载
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://live.kuaishou.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

	function doit(){
		var url = location.href;
		var name = "happy";

		var savek = document.createElement("a");
		savek.href = url;
		savek.download = name;

		var linKaget = document.getElementsByClassName("recommend-container-title")[0];
		if(linKaget) {
			savek.className = linKaget.className;
			savek.innerHTML = linKaget.innerText;
			linKaget.parentNode.replaceChild(savek, linKaget);
		} else {
			setTimeout(doit, 180);
		}
    }
	doit();
    // Your code here...
})();
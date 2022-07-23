	
	window.addEventListener("dirdwn", function(e){
		console.log("dirdwn!!!", e, e.detail);
		chrome.runtime.sendMessage({
			url:e.detail.url
			,name:e.detail.name
			,type:"dirdwn"
			,request:"noreq"
		}, function(data) { });
	});
	
	window.addEventListener("bkmk", function(e){
		console.log("bkmk!!!", e, e.detail);
		chrome.runtime.sendMessage({
			url:e.detail.url
			,name:e.detail.name
			,update:e.detail.update
			,data:e.detail
			,type:"bkmk"
		}, function(data) { });
	});

var href = location.href + '';
if(href.indexOf('kuaishou')
	|| href.indexOf('gif')
) {
	var isLiv=location.href.startsWith('https://live.kuaishou.com/my-follow/living');

	// 右击直接下载美妞视频
	window.addEventListener("contextmenu", function(e){
		if(isLiv) return;
		var t=e.srcElement;
		window._largat = 0;
		//console.log("contextmenu::", t);
		var doit=false;
		var forceDo=false;
		if(t.className=="backimg-warp") {
			var tag = "next";
			if(e.clientX<(document.body.clientWidth-document.getElementsByClassName("video-interactive-area")[0].clientWidth)/2){
				tag = "last";
			}
			document.getElementsByClassName("switch-item video-switch-"+tag)[0].click();
			e.preventDefault();
		}
		else if(t.className=="dplayer-video dplayer-video-current") {
			window._tvideo = t;
			window._largat = t.src;
			window._largat_dir = t.src;
			console.log(window.player_data);
			chrome.runtime.sendMessage({
				type: 'gifdwn',
				request: "noreq"
			}, function(data) {
				
			});
			e.preventDefault();
		}
		else if(t.className=="video-interactive-area") {
			chrome.runtime.sendMessage({
				type: 'gifdwn',
				request: "noreq"
			}, function(data) {
				
			});
			e.preventDefault();
		}
		else if(t.className==="center-state player-state"){
			forceDo = true;
		}
		else {
			doit = true;
		}
		while(t&&t.tagName!=="A") {
			//t = t.childNodes[0];
			t = t.parentNode;
		}
		if(t||forceDo){
			window._largat = t;
			console.log("1", window._largat);
			if(doit||forceDo) {
				chrome.runtime.sendMessage({
					type: 'gifdwn',
					request: "noreq"
				}, function(data) {
					
				});
				e.preventDefault();
			}
		}
		
	})
	
	window.addEventListener("mousedown", function(e){
		if(e.button===1) { // middle
			var t=e.srcElement;
			if(t.className==="video-interactive-area"||t.className==="backimg-warp") {
				chrome.runtime.sendMessage({
					type: 'gifdwn',
					request: "noreq"
				}, function(data) {
					
				});
				e.preventDefault();
			}
		}
	});
	
	// 单机导航至视频中间而不是暂停
	window.addEventListener("click", function(e){
		//console.log("click::", e);
		var t=e.srcElement;
		if(t.className=="video-interactive-area") {
			var H5Vid = document.getElementsByClassName("player-video")[0];
			H5Vid.currentTime = H5Vid.duration/2;
			e.preventDefault();
		}
		else if(t.className=="backimg-warp") {
			var tag = "next";
			if(e.clientX<(document.body.clientWidth-document.getElementsByClassName("video-interactive-area")[0].clientWidth)/2){
				tag = "last";
			}
			var H5Vid = document.getElementsByClassName("player-video")[0];
			H5Vid.currentTime = H5Vid.duration/2;
			e.preventDefault();
		}
	});
	
	// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code/code_values
	window.addEventListener("keydown", function(e){
		//console.log('keydown', e.keyCode);
		if(e.keyCode===34) { // pagedown
			document.getElementsByClassName("switch-item video-switch-next")[0].click();
			e.preventDefault();
		}
		if(e.keyCode===33) { // pageup
			document.getElementsByClassName("switch-item video-switch-last")[0].click();
			e.preventDefault();
		}
		if(e.keyCode===33) { // pageup
			document.getElementsByClassName("switch-item video-switch-last")[0].click();
			e.preventDefault();
		}
		if(e.keyCode===13||e.keyCode===111) { // enter  /
			var H5Vid = document.getElementsByClassName("player-video")[0];
			H5Vid.currentTime = H5Vid.duration/2;
			e.preventDefault();
		}
		if(e.keyCode===107||e.keyCode===106) { // + NumpadMultiply
			chrome.runtime.sendMessage({
				type: 'gifdwn',
				request: "noreq"
			}, function(data) {
				
			});
			e.preventDefault();
		}
	});
	
	
	var cssData = `.imageViewing{padding:100% 0 0!important} .header-placeholder{height:0px!important} 
	.detail{padding:0px!important}
	.kwai-player-plugin-bar-wrap{bottom: 0px!important}
	`;

	var doc=document,item = doc.createElement("style");
	item.id = "GFSS"
	doc.head.appendChild(item);
	item.innerHTML = cssData;
	
	var newImage;
	
	function delayTop(){
		document.getElementsByClassName("long-mode viewing")[0].scrollTop=0;
	}
	
	window.addEventListener("mouseup", function(e){
		//console.log("mouseup", e);
		var cl = e.srcElement.classList;
		if(cl.contains("lazyload-container")) {
			newImage=1;
			window.rewind=false;
		}
		else if(cl.contains("mask")) {
			if(newImage)
			{
				delayTop();
				newImage=false;
			}
			if(e.button==0)document.getElementsByClassName("mask-close")[0].click();
		}
		else if(cl.contains("see-all-pic")) {
			if(newImage)
			{
				setTimeout(delayTop, 150);
				newImage=false;
				window.rewind=false;
			}
		}
		if(e.button==0)
		{
			
		}
		
		//header-placeholder
	})
}
	//function Net_download(u, n) {
	//	const event = new CustomEvent('dirdwn', { detail: {url:u,name:n}});
	//	window.dispatchEvent(event);
	//}
	//
	//Net_download("https://www.asdsad.com/", "asdasd.flv");
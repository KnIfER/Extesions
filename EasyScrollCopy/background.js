function dataToClipboard(e) 
{
	function oncopy(event) {
		document.removeEventListener('copy', oncopy, true);
		event.stopImmediatePropagation();
		
		event.preventDefault();
		//event.clipboardData.setData('text/html', e);
		event.clipboardData.setData('text/plain', e);
	}

	document.addEventListener('copy', oncopy, true);

	document.execCommand('copy');
}

chrome.browserAction.onClicked.addListener(function(tab) {
	//console.log(tab);
	
	//document.body.style.backgroundColor='red';\
	//console.log(12312313213213);\

// 	chrome.tabs.executeScript(null,
// {code:"\
// function copy_tab_url(){\
// 	var streamerBadge = document.getElementsByClassName('room-owner-username live-skin-normal-a-text dp-i-block v-middle')[0];\
// 	var streamerName = streamerBadge?streamerBadge.innerText:'';\
// 	console.log(streamerName);\
// 	\
// };\
// copy_tab_url()"});

// chrome.permissions.request({
// 	permissions: ['debugger', "experimental"],
// 	origins: ['http://www.google.com/']
//   });


	chrome.storage.local.get(['opt_act'], function(result) {
		//alert('Value currently is ' + result.opt_act);
		var act = result.opt_act;
		if(!act) {
			act = "adv_cp_tu";
		}
		func(act);
	});
	
	//var buildUp = tab.url + '\r\nF:\\vide\\' + (tab.title +'\r\n\r\n');

	//var buildUpStr = JSON.stringify(buildUp);

	//dataToClipboard(buildUp);

////chrome.tabs.executeScript(tab.id, {code:"\
////var streamerBadge = document.getElementsByClassName('room-owner-username live-skin-normal-a-text dp-i-block v-middle')[0];\
////var streamerName = streamerBadge?streamerBadge.innerText:'Stream';\
////\
////function toClipBoard(text){\
////    console.log(text);\
////    var tmpText = window.document.getElementById('copit'); \
////    if(!tmpText){\
////		tmpText = document.createElement('p');\
////		document.body.appendChild(tmpText);\
////        tmpText.id = 'copit';\
////    }\
////    tmpText.focus();\
////    tmpText.innerText=text;\
////    const range = document.createRange();\
////    range.selectNode(tmpText);\
////    const selection = window.getSelection();\
////    if(selection.rangeCount > 0) selection.removeAllRanges();\
////    selection.addRange(range);\
////    document.execCommand('copy');\
////}\
////toClipBoard("+buildUpStr+")"});

// chrome.tabs.executeScript(tab.id, {file: "js/CopyUrl.js", code:""}, function (thereNameIs){
// 	var buildUpStr = JSON.stringify(tab.url + '\nF:\\vide\\' + (tab.title +'.flv'));

// 	chrome.tabs.executeScript(tab.id, {code: 'console.log('+buildUpStr+')'});

// 	//window.clipboardData.setData("Text", buildUp);

// 	if(window.copy != undefined){
// 		window.copy(buildUp);
// 	} else {
// 		copy(buildUp);
// 	}

// 	//fin
// });
});
var optr;

chrome.extension.onConnect.addListener(function(port) {
	console.log("Settings Connected .....");
	optr = port;
	//port.onMessage.addListener(function(msg) {
	//	console.log("message recieved" + msg);
	//	port.postMessage("Hi Popup.js");
	//});
})

var menu = chrome.contextMenus;

var fyi=function(e) 
{
	return chrome.i18n.getMessage(e);
};

// page menu
menu.create({
	id: 'auto_scroll_ctn',
	title: 'Auto Scroll'
}, () => {});


function buildMenu(d, t)
{
	menu.create({
		id: d,
		title: fyi(t),
		contexts: ['browser_action', 'page_action']
	}, () => {});
}

buildMenu('auto_scroll_ultra', 'ultra');
buildMenu('auto_scroll_fast', 'fast');
buildMenu('auto_scroll_slow', 'slow');
buildMenu('auto_scroll_top', 'top');

buildMenu('copy', 'c');

function buildGroup(d, t)
{
	menu.create({
		id: d,
		title: fyi(t),
		parentId: "copy",
		contexts: ['browser_action', 'page_action']
	}, () => {});
}

buildGroup('adv_cp_a', 'a');
buildGroup('adv_cp_s', 's');
buildGroup('adv_cp_atom', 'atom');
buildGroup('adv_cp_stom', 'stom');
buildGroup('adv_cp_t', 't');
buildGroup('adv_cp_u', 'u');
buildGroup('adv_cp_ut', 'ut');
buildGroup('adv_cp_tu', 'tu');

var lastMenuId='auto_scroll_fast';
var opt;
var w=window;

function toMarkdown(e) {
	if(!w.turndownService) {
		if(!w.TurndownService) {
			var url='turndown.js';
			let xhr = new XMLHttpRequest();
			xhr.open('GET', url, false);
			xhr.send();
			var item = document.createElement('script');
			item.innerHTML=xhr.responseText;
			item.async = false;
			document.head.append(item);
		}
		var opt={headingStyle:'atx'
		, hr:'***'
		, bulletListMarker:'-'
		, codeBlockStyle:'fenced'
		, emDelimiter:'*'
		};
		w.turndownService = new w.TurndownService(opt);
	}
	return turndownService.turndown(e);
}
	

function isSetting(url, act) 
{
	if(url.startsWith(chrome.runtime.getURL("settings.html"))) {
		chrome.storage.local.set({"opt_act": act}, function() { });
		optr.postMessage("WM_OPT");
		return true;
	}
	return false;
}

function sitVal(m, v, r) 
{
	opt.fflag&=~m;
	if(v^r) {
		opt.fflag|=m;
	}
}

function gitVal(m, r) 
{
	return (opt.fflag&m)^r;
}


function func(menuId) 
{
	if(menuId.startsWith('auto_scroll_')) {
		//console.log(menuId);
		chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
			var tab = tabs[0];
			if(isSetting(tab.url, menuId)) return;
			console.log(tab);
			var speed = 1;
			var interval = 35;
			var forceTog=0;
			if(menuId=='auto_scroll_ctn') {
				menuId = lastMenuId;
				forceTog=1;
			} else if(menuId=='auto_scroll_top'){
				chrome.tabs.executeScript(tab.id, {code:"document.body.scrollTop = document.documentElement.scrollTop = 0;"});
				forceTog=2;
			} else {
				lastMenuId = menuId;
			}
			if(menuId=='auto_scroll_ultra') {
				speed = 9;
				interval = 2;
			} else if(menuId=='auto_scroll_fast') {
				speed = 1;
				interval = 5;
			}
			chrome.tabs.executeScript(tab.id, {code:"\
				/*自动滚动*/\
				var scroll=1;\
				if("+(forceTog==2)+"||chrome.auto_scroll) {\
					clearInterval(chrome.auto_scroll);\
					chrome.auto_scroll=0;\
					if("+forceTog+"||chrome.auto_scroll_spd=='"+menuId+"') {\
						scroll=0;\
					}\
					chrome.auto_scroll_spd=0;\
				} \
				if(scroll) {\
					console.log('setInterval');\
					chrome.auto_scroll = setInterval(function () {\
						window.scrollTo(0, window.scrollY + "+speed+");\
					},"+interval+");\
					chrome.auto_scroll_spd='"+menuId+"';\
				}\
			"});
		});
	}
	else if(menuId.startsWith('adv_cp_')) {
		//console.log(menuId);
		chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
			var tab = tabs[0];
			if(isSetting(tab.url, menuId)) return;
			console.log(tab);
			if(menuId=='adv_cp_t') {
				dataToClipboard(tab.title);
			}
			if(menuId=='adv_cp_u' || menuId=='adv_cp_url') {

				dataToClipboard(tab.url);
			}
			else if(menuId=='adv_cp_tu') {
				chrome.storage.local.get(['sep_t','sep_u','fflag'], function(result) {
					//alert('Value currently is ', result);
					opt = result;
					var t=opt.sep_t,u=opt.sep_u;
					if(t==undefined) {
						t="\r\n"
					}
					if(u==undefined) {
						u="\r\n"
					}
					// hate javascript
					t = t.replace(/\\r/g, "\r").replace(/\\n/g, "\n");
					u = u.replace(/\\r/g, "\r").replace(/\\n/g, "\n");
					//console.log("标题在前：",gitVal(0x1,true));
					if(gitVal(0x1,true)) {
						t=tab.title+t+tab.url+u;
					} else {
						t=tab.url+u+tab.title+t;
					}
					w.t=t;
					dataToClipboard(t);
				});
			}
			else if(menuId=='adv_cp_ut') {
				var buildUp = '[' + tab.title + '](' + tab.url + ')\r\n\r\n';
				dataToClipboard(buildUp);
			}
			else if(menuId=='adv_cp_a') {
				chrome.tabs.executeScript(tab.id, {file: 'AParser/generic.js'}, function proc(e){
					dataToClipboard(e);
				});
			}
			else if(menuId=='adv_cp_atom') {
				chrome.tabs.executeScript(tab.id, {file: 'AParser/generic.js'}, function proc(e){
					//dataToClipboard(e);
					var mdoc=toMarkdown(e+'');
					if(true) {
						var buildUp = '# [' + tab.title + '](' + tab.url + ')\r\n\r\n';
						mdoc = buildUp+mdoc;
					}
					dataToClipboard(mdoc);
				});
			}
			else if(menuId=='adv_cp_s') {
				chrome.tabs.executeScript(tab.id, {file: 'AParser/generic_selection.js'}, function proc(e){
					e=e+'';
					if(e==="nosel") {
						func("adv_cp_a");
					} else {
						dataToClipboard(e);
					}
				});
			}
			else if(menuId=='adv_cp_stom') {
				chrome.tabs.executeScript(tab.id, {file: 'AParser/generic_selection.js'}, function proc(e){
					e=e+'';
					if(e==="nosel") {
						func("adv_cp_atom");
					} else {
						dataToClipboard(toMarkdown(e));
					}
				});
			}
		});
	}
}


menu.onClicked.addListener(payload => func(payload.menuItemId));



// function logURL(requestDetails) {
// 	console.log("Loading: ", requestDetails);
// }

// chrome.webRequest.onBeforeRequest.addListener(
// logURL,
// {urls: ["<all_urls>"]}
// );
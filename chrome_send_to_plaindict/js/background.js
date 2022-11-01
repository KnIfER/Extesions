var data = {}, fakePP=0;
class PLODBack {
	constructor() {
		this.options = {};
				chrome.tabs.onUpdated.addListener(this.onTabUpdated.bind(this));

		chrome.runtime.onMessage.addListener(this.onMessage.bind(this));
		
		const options = {
			type: 'normal',
			contexts: ['selection'],
			id: 'PLOD',
			title: 'Send To PlainDict',
			visible: true,
			onclick: this.sendText.bind(this)
		}

		chrome.contextMenus.create(options, null);
		
		//chrome.browserAction.onClicked.addListener(function(tab) { });
		
				chrome.storage.local.get(null, (options) => {
			this.opt_optionsChanged(sanitizeOptions(options), false);
				});
	}

		onTabUpdated(tabId) {
		//console.log("onUpdated..."+tabId);
		chrome.tabs.executeScript(tabId, {code:"window.pdFlag="+this.options.firstflag}, _=>checkLastError());
		}

	sendText(exp, source) {
		console.log(exp);
				if(!exp) return;
		if(exp.selectionText) {
			exp = exp.selectionText;
			source = 2;
		}
				var target = (this.options.firstflag>>4 + (source&3))&0x1;
		//console.log("send source : ", source, target);
		chrome.bookmarks.search("PD", (res) => {
			var host = "127.0.0.1"
			for(var bkmkI in res) {
				bkmkI = res[bkmkI];
				if(bkmkI.title=="PD") {
					host = bkmkI.url;
					break;
				}
			}
			var url = host+"PLOD/?f="+(target+1);
			console.log(exp);
			var xmlhttp=new XMLHttpRequest();
			xmlhttp.open("POST", url , true);
			//xmlhttp.setRequestHeader("Access-Control-Allow-Origin", "*");
			xmlhttp.send(exp);
		});
	}

	// Message Hub and Handler start from here ...
	onMessage(request, sender, callback) {
		const { action, params } = request;
		const method = this[action];

		if (typeof(method) === 'function') {
			params.callback = callback;
			method.call(this, params);
		}
		return true;
	}
		
	//APIs
	async sendToPD(params) {
		// Fix https://github.com/ninja33/ODH/issues/97
		//console.log("api_sendToPDapi_sendToPD");
		this.sendText(params.exp, params.extra);
	};
	
	async getFlag(params) {
		params.callback(this.options.firstflag);
	};

		setFrontendOptions(options) {
				this.tabInvokeAll('setFrontendOptions', {
						options
				});
		}
	
		tabInvokeAll(action, params) {
				chrome.tabs.query({}, (tabs) => {
						for (let tab of tabs) {
								this.tabInvoke(tab.id, action, params);
						}
				});
		}
	
	tabInvoke(tabId, action, params) {
				chrome.tabs.sendMessage(tabId, { action, params }, _=>checkLastError());
		}
	
		// Option page and Brower Action page requests handlers.
		async opt_optionsChanged(options, save) {
				this.options.firstflag = options.firstflag;
		this.setFrontendOptions(options);
		if(save){
			optionsSave(this.options);
		}
				return this.options;
		}
}
const prefs = {
	'enabled': true,
	'overwrite-origin': true,
	'methods': ['GET', 'PUT', 'POST', 'DELETE', 'HEAD', 'OPTIONS', 'PATCH', 'PROPFIND', 'PROPPATCH', 'MKCOL', 'COPY', 'MOVE', 'LOCK'],
	'remove-x-frame': true,
	'allow-credentials': true,
	'allow-headers-value': '*',
	'allow-origin-value': '*',
	'expose-headers-value': '*',
	'allow-headers': false,
	'unblock-initiator': true
};

const redirects = {};
chrome.tabs.onRemoved.addListener(tabId => delete redirects[tabId]);
const cors = {};

cors.onBeforeRedirect = d => {
	if (d.type === 'main_frame') {
		return;
	}
	redirects[d.tabId] = redirects[d.tabId] || {};
	redirects[d.tabId][d.requestId] = true;
};

cors.onHeadersReceived = d => {
	if (d.type === 'main_frame') {
		return;
	}
	const {initiator, originUrl, responseHeaders, requestId, tabId} = d;
	let origin = '';

	const redirect = redirects[tabId] ? redirects[tabId][requestId] : false;
	if (prefs['unblock-initiator'] && redirect !== true) {
		try {
			const o = new URL(initiator || originUrl);
			origin = o.origin;
		}
		catch (e) {
			console.warn('cannot extract origin for initiator', initiator);
		}
	}
	else {
		origin = '*';
	}
	if (redirects[tabId]) {
		delete redirects[tabId][requestId];
	}

	if (prefs['overwrite-origin'] === true) {
		const o = responseHeaders.find(({name}) => name.toLowerCase() === 'access-control-allow-origin');

		if (o) {
			if (o.value !== '*') {
				o.value = origin || prefs['allow-origin-value'];
			}
		}
		else {
			responseHeaders.push({
				'name': 'Access-Control-Allow-Origin',
				'value': origin || prefs['allow-origin-value']
			});
		}
	}
	if (prefs.methods.length > 3) { // GET, POST, HEAD are mandatory
		const o = responseHeaders.find(({name}) => name.toLowerCase() === 'access-control-allow-methods');
		if (o) {
			o.value = [...new Set([...prefs.methods, ...o.value.split(/\s*,\s*/)])].join(', ');
		}
		else {
			responseHeaders.push({
				'name': 'Access-Control-Allow-Methods',
				'value': prefs.methods.join(', ')
			});
		}
	}
	// The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*'
	// when the request's credentials mode is 'include'.
	if (prefs['allow-credentials'] === true) {
		const o = responseHeaders.find(({name}) => name.toLowerCase() === 'access-control-allow-origin');
		if (!o || o.value !== '*') {
			const o = responseHeaders.find(({name}) => name.toLowerCase() === 'access-control-allow-credentials');
			if (o) {
				o.value = 'true';
			}
			else {
				responseHeaders.push({
					'name': 'Access-Control-Allow-Credentials',
					'value': 'true'
				});
			}
		}
	}
	// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Headers
	if (prefs['allow-headers'] === true) {
		const o = responseHeaders.find(({name}) => name.toLowerCase() === 'access-control-allow-headers');
		if (o) {
			o.value = prefs['allow-headers-value'];
		}
		else {
			responseHeaders.push({
				'name': 'Access-Control-Allow-Headers',
				'value': prefs['allow-headers-value']
			});
		}
	}
	if (prefs['allow-headers'] === true) {
		const o = responseHeaders.find(({name}) => name.toLowerCase() === 'access-control-expose-headers');
		if (o) {
			o.value = prefs['expose-headers-value'];
		}
		else {
			responseHeaders.push({
				'name': 'Access-Control-Expose-Headers',
				'value': prefs['expose-headers-value']
			});
		}
	}
	if (prefs['remove-x-frame'] === true) {
		const i = responseHeaders.findIndex(({name}) => name.toLowerCase() === 'x-frame-options');
		if (i !== -1) {
			responseHeaders.splice(i, 1);
		}
	}
	return {responseHeaders};
};
cors.install = () => {
	cors.remove();
	const extra = ['blocking', 'responseHeaders'];
	if (/Firefox/.test(navigator.userAgent) === false) {
		extra.push('extraHeaders');
	}
	// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns
	chrome.webRequest.onHeadersReceived.addListener(cors.onHeadersReceived, {
		//urls: ['<all_urls>']
		urls: ['<all_urls>']
	}, extra);
	chrome.webRequest.onBeforeRedirect.addListener(cors.onBeforeRedirect, {
		//urls: ['<all_urls>']
		urls: ['<all_urls>']
	});
};
cors.remove = () => {
	chrome.webRequest.onHeadersReceived.removeListener(cors.onHeadersReceived);
	chrome.webRequest.onBeforeRedirect.removeListener(cors.onBeforeRedirect);
};

cors.install();



window.plodback = new PLODBack();
var log = console.log;
var debug = log;

(function(){
	function craft(t, p, c) {
		t = document.createElement(t);
		if(c)t.className=c;
		if(p)p.appendChild(t);
		return t;
	}
	function setHidden(e,h) {
		if(e.hidden!=h) {
			e.hidden = h;
			if(h ^ e.style.display==='none') {
				if(h) e.style.display = 'none'
				else e.style.removeProperty('display')
			}
		}
	}
	function initBlock(p, minPageHeight, blockPg) {
		p.init = 1;
		for(var i=0;i<blockPg;i++) {
			var rp = craft('DIV', p, 'page');
			rp.style.height=minPageHeight;
		}
	}
	function initRowPage(p, pageSz, minRowHeight) {
		p.init = 1;
		p.hide = 0;
		p.style.height='auto';
		for(var i=0;i<pageSz;i++) 
			makeItem(p, minRowHeight);
	}
	function makeItem(rowPage, minRowHeight){
		var rowItem = craft('DIV', rowPage, 'item');
		rowItem.style.minHeight=minRowHeight;
		return rowItem;
	}
	function getNextPage(n) {
		var a = n.nextElementSibling;
		if (a) {
			if(a.hidden)
				return getNextPage(a);
			return a;
		}
		var bk = n.parentNode.nextElementSibling;
		return bk && bk.firstElementChild;
	}
	function debug_tint(blocks) {
		blocks[0].style.background='#ff00d408'
		blocks[1].style.background='#00ff330f'
		blocks[2].style.background='#00f7ff08'
	}
	function initListView(el, adapter, minHeight, minHeightUnit, w) {
		if(w)debug = w.console.log;
		minHeight||=1.5;
		minHeightUnit||="em";
		(function(e){
			var el=e, ada=adapter;
			// 1区块 == 10页面 == 300行
			var pageSz = 30, blockPg=10, blockSz = pageSz*blockPg; 
			var minRowHeight=minHeight+minHeightUnit, minPageHeight=minHeight*pageSz+minHeightUnit
				, minBlockHeight, minPageHeightPx, minRowHeightPx;
			var topRow, maxRowDet, rpA, rpB;
			el.reset=function(adapter, percent) {
				if(adapter!==undefined) {
					ada = adapter;
					if(typeof adapter==='number'){
						ada = {
							size : adapter
							,bifun: function(lst,row,pos){
								row.innerText=pos+'';
							}
						}
					} 
				}
				//debug('minRowHeight=', minRowHeight, minPageHeight);
				var tmp = makeItem(el, minRowHeight);
				minRowHeightPx = tmp.offsetHeight;
				tmp.remove();
				var total = ada.size;
				var blocks = [];
				if(el.onsroll)el.removeEventListener('scroll', el.onsroll);
				el.innerHTML='';
				el.scrollTop = 0;
				topRow = maxRowDet = rpA = rpB = 0;
				for(var i=0;i<3;i++) {
					var block = craft('DIV', el, 'block');
					initBlock(block, minPageHeight, blockPg);
					blocks.push(block);
					var tmp=blockSz*i;
					//debug('init...', tmp, tmp+blockSz, total)
					if(tmp >= total) {
						setHidden(block,1);
					}
					else if(tmp+blockSz >= total) {
						block.size = total-blockSz*i;
						for(var j=0;j<blockPg;j++) {
							setHidden(block.children[j], j*pageSz>=block.size);
						}
					}
					else block.size = blockSz;
					maxRowDet += block.size;
				}
				minBlockHeight = blocks[0].offsetHeight;
				minPageHeightPx = minBlockHeight/blockPg;
				//debug_tint(blocks);
				if(percent>1) percent=0.99;
				var pos=Math.ceil(total*percent);
				if(percent > 0) {
					percent = 0;
					var d = pos;
					if(pos>3*blockSz) {
						d = blockSz;
						topRow = Math.ceil(pos/d)*d;
						d = pos - topRow;
						maxRowDet = topRow+blockSz*3;
					}
					percent = d;// * minRowHeightPx;
					percent *= minRowHeightPx;
					log('percent', topRow, pos, d, percent)
				}
				lstScroll();
				el.addEventListener('scroll', el.onsroll=lstScroll);
				if(topRow || percent) {
					el.scrollTop += percent;
					rpA = rpB = 0;
					lstScroll();
					select(pos);
				}
			}
			el.fvp=function() {
				var fp=rpA,y=el.scrollTop+el.offsetTop+5;
				while(fp&&!fp.hidden) {
					if(fp.offsetTop+fp.offsetHeight>y)
						break;
					fp = getNextPage(fp);
				}
				if(fp) {
					//log('fp=', fp)
					fp = fp.firstElementChild;
					while(fp) {
						if(fp.offsetTop+fp.offsetHeight>y)
							break;
						fp = fp.nextElementSibling;
					}
				}
				log('fvp=', fp&&fp.pos, fp);
				return fp;
			}
			function select(pos) {
				var fp=el.children[0].children[0], fPos=topRow;
				while(fp&&!fp.hidden) {
					if(fPos+pageSz>pos)
						break;
					fPos+=pageSz
					fp = getNextPage(fp);
				}
				if(fp) {
					el.scrollTop = fp.children[pos-fPos].offsetTop-el.offsetTop+5; // 
					log('select', pos-fPos, pos, fPos, el.scrollTop);
				}
			}
			function resizePage(p0, sz, rv) {
				if(rv) topRow-=sz;
				else maxRowDet+=sz;
				if(p0.size!==sz) {
					p0.size=sz;
					for(var i=0;i<blockPg;i++) {
						var page = p0.children[i],h=i*pageSz>=sz;
						setHidden(page,h);
						if(rv && !h && page.hide) {
							for(var j=0;j<pageSz;j++) 
								setHidden(page.children[j],0);
							page.hide=0;
						}
					}
				}
			}
			function lstScroll(e) {
				//debug(e);
				var y=el.scrollTop;
				if(ada.size>maxRowDet &&  y>= el.scrollHeight*0.9) {
					var p0=el.children[0];
					el.append(p0);
					topRow += p0.size;
					resizePage(p0, Math.min(blockSz, ada.size-maxRowDet))
				}
				else if(topRow>0 && y <= el.clientHeight*0.2) {
					var p0=el.children[2];
					maxRowDet -= p0.size||0;
					el.insertBefore(p0, el.children[0]);
					var size = Math.min(blockSz, topRow);
					resizePage(p0, size, 1)
					el.scrollTop = p0.offsetHeight+y;
				}
				y += el.offsetTop;
				if(!rpA || y<rpA.offsetTop
					|| rpB && y+el.clientHeight>rpB.offsetTop+rpB.offsetHeight) {
					repage();
				}
			}
			el.addEventListener('scroll', el.onsroll=lstScroll);
			addEventListener('resize', function(e){
				if(el.onsroll)
					lstScroll(e)
			});
			function repage() {
				var bk,pos = 0;
				var y=el.scrollTop+el.offsetTop, y1=y+el.offsetHeight;
				for(var i=0;i<3;i++) {
					bk = el.children[i];
					if(bk.offsetTop+bk.offsetHeight>y) {
						pos = i;
						break;
					}
				}
				debug('repage', pos)
				var minSt;// = pageSz - (bk.offsetTop+bk.offsetHeight-y)/minRowHeight;
				if(minSt<0) minSt=0;
				minSt=0;
				pos = topRow + pos*blockSz + minSt;
				var page = bk.children[minSt];
				rpA=rpB=0;
				var height=0;
				var ended=0;
				while(page) {
					if(page.hidden)
						break;
					if(!rpA) {
						//debug('finding...', page, off);
						if(page.offsetTop+page.offsetHeight > y) {
							height=page.offsetTop;
							rpA = page;
							debug('rpA', minSt)
						}
					}
					if(rpA) {
						if(ended) {
							setHidden(page, 1)
							page.parentNode.size -= pageSz;
						} else {
							ended|=bindRowPage(page, pos);
							debug('rpB', height+' > '+y1)
							height += Math.min(minPageHeightPx, page.offsetHeight);
							//height += page.offsetHeight;
							if(height>y1) {
								rpB = page;
								break;
							}
						}
					}
					pos+=pageSz;
					page = getNextPage(page);
					minSt++;
				}
			}
			function bindRowPage(page, pos) {
				if(!page.init)
					initRowPage(page, pageSz, minRowHeight);
				debug('bindRowPage', pos);
				page.hide=0;
				for(var i=0;i<pageSz;i++) 
				{
					var row = page.children[i];
					if(pos>=ada.size) {
						setHidden(row,1);
						page.hide = 1;
					} else {
						setHidden(row,0);
						row.pos=pos;
						ada.bifun(el, row, pos);
					}
					pos++
				}
				return page.hide;
			}
		})(el)
	}
	
	function LruMapSet(data, cap, key, value){
		data.delete(key);
		data.set(key, value);
		if (data.size > cap) {
			const delKey = data.keys().next().value
			data.delete(delKey);
		}
	}
	function LruMapGet(data, key){
		if (!data.has(key)) return null;
		var ret = data.get(key);
		data.delete(key);
		data.set(key, ret);
		return ret;
	}
	function newLru(sz) {
		if (sz < 1) throw new Error('长度不能小于1')
		var data = new Map(), ret=new Object, cap=sz;
		ret.set = function(k, v){
			LruMapSet(data, cap, k, v)
		}
		ret.get = function(k){
			return LruMapGet(data, cap, k)
		}
		return ret;
	}
	
	window.initListView = initListView;
	window.newLru = newLru;
	window.pullBkmk = function(id, cb){
		var ret = data.bkmks.get(id)
		if(!ret) {
            chrome.bookmarks.getChildren(id, function(e){
				//data.bkmks.put(id, cb)
                cb(e);
            });
		} else {
			cb(e);
		}
	};
})()


function d() {
	return data;
}

data.bkmks = newLru(5);
var tabs = [], tabsMap = {};
function newTab(path, type) {
	var ret=new Object;
	ret.type=type||0;
	ret.path=path;
	var id = 0
	while(tabsMap[id]) {
		id=Math.floor(Math.random() * 10000000000); 
	}
	tabsMap[ret.id=id] = ret;
	tabs.push(ret);
}

function initTabs() {
	if(tabs.length==0) {
		newTab('0');
		newTab('', 1);
	}
	var ret=tabs.concat();
	ret.current = tabs.current||0;
	return ret;
}

function saveTabs(that) {
	tabs = that.concat();
	tabs.current = that.current||0;
}

// chrome.contextMenus.create({
// 	id: "open-popup",
// 	title: "open popup",
// 	contexts: ["all"],
//   });
  
// chrome.contextMenus.onClicked.addListener(() => {
// 	chrome.browserAction.openPopup();
// });

// chrome.runtime.onInstalled.addListener(() => {
// 	console.log("Immediately");
// 	setTimeout(() => {
// 	  console.log("After 10s");
// 	  console.log(chrome.browserAction.openPopup); // undefined
// 	  chrome.browserAction.openPopup(function(e){debug(e)});
// 	}, 1000);
//   });
  

// chrome.runtime.onInstalled.addListener(() => {
// 	console.log("Immediately");
// 	setTimeout(() => {
// 	  console.log("After 10s");
// 	  console.log(chrome.browserAction.openPopup); // undefined
// 	  chrome.browserAction.openPopup(function(e){debug(e)});
// 	}, 1000);
//   });
  
function loadSortable(cb) {
	loadJs('popup/Sortable.js', function(){
		//loadJs('popup/gridtab.js', function(){
			cb();
		//});
	});
}


function loadJs(url,callback){
	var e=document.createElement('script');
	e.type="text/javascript";
	e.onload=callback;
	e.src=url;
	document.body.appendChild(e);
}


// chrome.storage.local.set({lastTab: 'fuck...', fucked: 'fuck1z...'}, function() {
// 	chrome.storage.local.get(['fucked', 'lastTab'], function(result) {
// 		log('Value currently is ', result);
// 	});
// });

chrome.storage.local.get(['fucked', 'lastTab'], function(result) {
	log('Value currently is ', JSON.stringify(result));
});

// window.onclose=window.onblur = function(){
// 	bg.log('onblur...');
// 	chrome.storage.local.set({lastTab: 'onblur...'}, function() {
// 	});
// }
// chrome.runtime.onSuspend.addListener(() => {
// 	console.log("onSuspend");
// 	chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
// 		var tab = tabs[0];
// 		if(tab) {
// 			debug(tab, tab.id)
// 			chrome.storage.local.set({lastTab: tab.url}, function() {
// 			});
		
// 		}
// 	})
// });


chrome.tabs.onActivated.addListener(function(e) {
	log('onActivated', e);
})

  
chrome.tabs.onUpdated.addListener(function(e, changeInfo, tab) {
	log('onUpdated', e, changeInfo, tab, data.favTabs[e]);
	if(e=data.favTabs[e]) {
		e.url = tab.url;
		e.title = tab.title;
		e.favIconUrl = tab.favIconUrl;
		debug('changed...', e);
	}
});
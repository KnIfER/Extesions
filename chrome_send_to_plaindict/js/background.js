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



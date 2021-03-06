﻿class PLODBack {
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


window.plodback = new PLODBack();



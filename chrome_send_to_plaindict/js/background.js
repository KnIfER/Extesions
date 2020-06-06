class PLODBack {
	constructor() {
        this.options = null;
		this.agent = new Agent(window.contentWindow);
		
        chrome.tabs.onCreated.addListener((tab) => this.onTabCreated(tab.id));
        chrome.tabs.onUpdated.addListener(this.onTabUpdated.bind(this));

		chrome.runtime.onMessage.addListener(this.onMessage.bind(this));
		window.addEventListener('message', e => this.onSandboxMessage(e));
		
		const options = {
			type: 'normal',
			contexts: ['selection'],
			id: 'PLOD',
			title: 'Send To PlainDict',
			visible: true,
			onclick: this.sendText.bind(this)
		}
		chrome.contextMenus.create(options, null);
		chrome.browserAction.setPopup(
			{
				popup:'js/popup/popup.html'
			}
		)
		
		chrome.browserAction.onClicked.addListener(function(tab) {

		});
	}

    onTabUpdated(tabId) {
		//console.log("onUpdated..."+tabId);
		chrome.tabs.executeScript(tabId, {code:"window.pdFlag="+this.options.firstflag});
        //this.tabInvoke(tabId, 'setFrontendOptions', { options: this.options });
    }
	
    onTabCreated(tabId) {
        this.tabInvoke(tabId, 'setFrontendOptions', { options: this.options });
    }

	sendText(exp, source) {
        if(!exp) return;
		if(exp.selectionText) {
			exp = exp.selectionText;
			source = 2;
		}
        if(exp.indexOf('&')>=0){
            exp = exp.replace('&', '%26');
        }
        if(exp.indexOf('?')>=0){
            exp = exp.replace('?', '%3F');
        }
        var target = (this.options.firstflag>>4 + (source&3))&0x1;
        if(!target) exp += '&t=1';
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
			var url = host+"PLOD/"+exp;
			console.log(exp);
			var xmlhttp=new XMLHttpRequest();
			xmlhttp.open("POST", url , true);
			//xmlhttp.setRequestHeader("Access-Control-Allow-Origin", "*");
			xmlhttp.send();
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
		
	onSandboxMessage(e) {
		const {
			action,
			params
		} = e.data;
		const method = this[action];
		if (typeof(method) === 'function')
			method.call(this, params);

	}
	
	//APIs
	async initBackend(params) {
		let options = await optionsLoad();
		this.opt_optionsChanged(options);
	}
		
	async sendToPD(params) {
		// Fix https://github.com/ninja33/ODH/issues/97
		//console.log("api_sendToPDapi_sendToPD");
		//console.log(expression);
		this.sendText(params.exp, params.extra);
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
        const callback = () => this.checkLastError(chrome.runtime.lastError);
        chrome.tabs.sendMessage(tabId, { action, params }, callback);
    }
	
    checkLastError(){
        // NOP
    }
	
    // Option page and Brower Action page requests handlers.
    async opt_optionsChanged(options) {
        this.setFrontendOptions(options);
        this.options = options;
        await this.setScriptsOptions(this.options);
        optionsSave(this.options);
        return this.options;
    }
	
	async setScriptsOptions(options) {
        return new Promise((resolve, reject) => {
            this.agent.postMessage('setScriptsOptions', { options }, result => resolve(result));
        });
    }
}


window.plodback = new PLODBack();



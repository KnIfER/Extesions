/* globals config, Parser */
'use strict';

const LINKS = /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#/%=~_|$?!:,.]*\)|[A-Z0-9+&@#/%=~_|$])/igm;
const GIT = 'github.com/belaviyo/native-client';
const ID = 'com.add0n.native_client';

const notify = e => chrome.notifications.create({
  type: 'basic',
  iconUrl: '/data/icons/48.png',
  title: chrome.i18n.getMessage('bg_msg_3'),
  message: e.message || e
});

function execute(d) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(config.command.guess, prefs => {
      if (!prefs.executable) {
        return notify(chrome.i18n.getMessage('bg_msg_4'));
      }
      const p = new Parser();
      p.escapeExpressions = {}; // do not escape expressions

      // remove args that are not provided
      if (!d.referrer) {
        prefs.args = prefs.args.replace(/\s[^\s]*\[REFERRER\][^\s]*\s/, ' ');
      }
      if (!d.filename) {
        prefs.args = prefs.args.replace(/\s[^\s]*\[FILENAME\][^\s]*\s/, ' ');
        prefs.args = prefs.args.replace(/\s[^\s]*\[DISK][^\s]*\s/, ' ');
      }

      let url = d.finalUrl || d.url;
      if (Array.isArray(url)) {
        url = url.join(config.mode.sep);
      }
      prefs.args = prefs.args.replace('--load-cookies=[COOKIES]', '');

      const termref = {
        lineBuffer: prefs.args
          .replace(/\[URL\]/g, url)
          .replace(/\[REFERRER\]/g, d.referrer)
          .replace(/\[USERAGENT\]/g, navigator.userAgent)
          .replace(/\[FILENAME\]/g, (d.filename || '').split(/[/\\]/).pop())
          .replace(/\[DISK\]/g, (d.filename || ''))
          //.replace(/\[SOURCE\]/g, (d.filename || ''))
          .replace(/\\/g, '\\\\')
      };

      p.parseLine(termref);

      window.setTimeout(resolve, config.delay || 5000);
      chrome.runtime.sendNativeMessage(ID, {
        permissions: ['child_process', 'path', 'os', 'crypto', 'fs'],
        args: [false, prefs.executable, ...termref.argv],
        script: String.raw`
          const cookies = args[0];
          const command = args[1].replace(/%([^%]+)%/g, (_, n) => {
            if (n === 'ProgramFiles(x86)' && !env[n]) {
              return env['ProgramFiles'];
            }
            return env[n];
          });
          const exe = require('child_process').spawn(command, args.slice(2), {
            detached: true,
            windowsVerbatimArguments: ${Boolean(config.windowsVerbatimArguments)}
          });
          let stdout = '', stderr = '';
          exe.stdout.on('data', data => stdout += data);
          exe.stderr.on('data', data => stderr += data);

          stdout += command;
          exe.on('close', code => {
            push({code, stdout, stderr});
            done();
          });
          if (${config.detached}) {
            setTimeout(() => {
              push({code: 0});
              done();
              process.exit();
            }, 5000);
          }
        `
      }, res => {
        if (!res) {
          chrome.tabs.create({
            url: '/data/guide/index.html'
          });
          return reject(Error('empty response'));
        }
        else if (res.code !== 0) {
          const msg = res.stderr || res.error || res.err;
          console.warn(msg);
          if (msg && msg.indexOf('ENOENT') !== -1) {
            return reject(Error(chrome.i18n.getMessage('bg_msg_5')));
          }
          return reject(Error(msg));
        }
        else {
          resolve();
        }
      });
    });
  });
}

function sendTo(d) {
  console.log('sendTo', d);
  var x = new XMLHttpRequest();
  x.open('POST', 'http://127.0.0.1:8080/DB.jsp', true);
  x.responseType = 'json';
  x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
  d.dwnld=true;
  x.send("data="+encodeURIComponent(JSON.stringify(d)));
  //console.log('sendTo', "data="+JSON.stringify(d));
  // Promise.resolve(false).then(running => !running && execute(d)).then(() => {
  //   if (d.id) {
  //     chrome.downloads.erase({
  //       id: d.id
  //     });
  //   }
  // }).catch(e => e && notify(e));
}

let id;
function observe(d, response = () => {}) {
  const mimes = localStorage.getItem('mimes') || '';
  if (mimes.indexOf(d.mime) !== -1) {
    return false;
  }

  response();
  const url = d.finalUrl || d.url;
  if (url.startsWith('http') || url.startsWith('ftp')) {
    // prefer d.url over d.finalUrl as it might be closer to the actual page url
    const {hostname} = new URL(d.url || d.finalUrl);
    const whitelist = localStorage.getItem('whitelist') || '';
    if (whitelist) {
      const hs = whitelist.split('|');
      if (hs.some(s => !s.endsWith(hostname) && !hostname.endsWith(s))) {
        return false;
      }
    }
    if (d.url.indexOf(GIT) !== -1) {
      return false;
    }
    if (id === d.id || d.error) {
      return false;
    }

    chrome.downloads.pause(d.id, () => chrome.tabs.query({
      active: true,
      currentWindow: true
    }, tabs => {
      sendTo(d, tabs && tabs.length ? tabs[0] : {});
    }));
  }
}

function changeState(enabled) {
  const diSupport = Boolean(chrome.downloads.onDeterminingFilename);
  const download = diSupport ? chrome.downloads.onDeterminingFilename : chrome.downloads.onCreated;
  if (enabled) {
   // download.addListener(observe);
  }
  else {
  //  download.removeListener(observe);
  }
  chrome.browserAction.setIcon({
    path: {
      '16': 'data/icons/' + (enabled ? '' : 'disabled/') + '16.png',
      '19': 'data/icons/' + (enabled ? '' : 'disabled/') + '19.png',
      '32': 'data/icons/' + (enabled ? '' : 'disabled/') + '32.png',
      '38': 'data/icons/' + (enabled ? '' : 'disabled/') + '38.png',
      '48': 'data/icons/' + (enabled ? '' : 'disabled/') + '48.png',
      '64': 'data/icons/' + (enabled ? '' : 'disabled/') + '64.png'
    }
  });
  chrome.browserAction.setTitle({
    title: `Download with IDM (Integration is "${enabled ? 'enabled' : 'disabled'}")`
  });
}

function onCommand(toggle = true) {
  chrome.storage.local.get({
    enabled: false
  }, prefs => {
    const enabled = toggle ? !prefs.enabled : prefs.enabled;
    chrome.storage.local.set({
      enabled
    });
    changeState(enabled);
  });
}

chrome.browserAction.onClicked.addListener(onCommand);
onCommand(false);

// contextMenus
const buildContexts = () => chrome.storage.local.get({
  'context.open-link': true,
  'context.open-video': true,
  'context.grab': true,
  'context.extract': true
}, prefs => {
  chrome.contextMenus.removeAll(() => {
    if (prefs['context.open-link']) {
      chrome.contextMenus.create({
        id: 'open-link',
        title: chrome.i18n.getMessage('bg_msg_6'),
        contexts: ['link'],
        documentUrlPatterns: ['*://*/*']
      });
    }
    if (prefs['context.open-video']) {
      chrome.contextMenus.create({
        id: 'open-video',
        title: chrome.i18n.getMessage('bg_msg_7'),
        contexts: ['video', 'audio', 'image'],
        documentUrlPatterns: ['*://*/*']
      });
    }
    if (prefs['context.grab']) {
      chrome.contextMenus.create({
        id: 'grab',
        title: chrome.i18n.getMessage('bg_msg_8'),
        contexts: ['page', 'browser_action'],
        documentUrlPatterns: ['*://*/*']
      });
    }
    if (prefs['context.extract']) {
      chrome.contextMenus.create({
        id: 'extract',
        title: chrome.i18n.getMessage('bg_msg_9'),
        contexts: ['selection'],
        documentUrlPatterns: ['*://*/*']
      });
    }
    // chrome.contextMenus.create({
      // id: 'test',
      // title: chrome.i18n.getMessage('bg_msg_10'),
      // contexts: ['page', 'browser_action']
    // });
  });
});
chrome.runtime.onInstalled.addListener(buildContexts);
chrome.runtime.onStartup.addListener(buildContexts);
chrome.storage.onChanged.addListener(prefs => {
  if (Object.keys(prefs).some(s => s.startsWith('context.'))) {
    buildContexts();
  }
});

const links = {};
chrome.tabs.onRemoved.addListener(id => delete links[id]);

const grab = mode => chrome.tabs.executeScript({
  runAt: 'document_start',
  code: `window.mode = "${mode}"`
}, () => {
  const lastError = chrome.runtime.lastError;
  if (lastError) {
    notify(lastError.message);
  }
  else {
    chrome.tabs.executeScript({
      runAt: 'document_start',
      file: '/data/grab/inject.js'
    });
  }
});

function extractDediVid(tab, info){
	var url = info.pageUrl;
	if(url.startsWith("https://live.bilibili.com/")) return;
	var filejs = url.startsWith("https://video.kuaishou.com/")||url.startsWith("https://www.kuaishou.com")?"ParseVid_gif_mobile.js":"ParseVid.js";
	chrome.tabs.executeScript(tab.id, {file: filejs}, function (thereDataIs){
		// console.log("thereDataIs", thereDataIs);
		// console.log("thereDataIs", thereDataIs[0]);
		var fileName = thereDataIs[0][0];
		fileName = fileName.replaceAll(/[\r\n*\\<\\>\\/|"\\:]/g, "");
		fileName = fileName.replaceAll("?", "？");
		fileName = fileName.replaceAll("!", "！");
		fileName = fileName.replaceAll("“", "'");
		fileName = fileName.replaceAll("”", "'");
		sendTo({
		  finalUrl: thereDataIs[0][1]
		  ,referrer: url
		  ,filename: fileName
		});
		
		// sendTo({
		  // finalUrl: "https://txmov2.a.yximgs.com/upic/2020/12/05/10/BMjAyMDEyMDUxMDIxMzFfMTQ4NTkyNTMzNF80MDIzMzY0OTE0MF8xXzM=_b_B154e1e1780048336551cd9e79472d719.mp4?clientCacheKey=3x3z388ajhkmpqm_b.mp4&tt=b&di=705649c9&bp=13380",
		  // referrer: info.pageUrl,
		  // filename: "Love.mp4"
		// }, tab);
	});
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'grab') {
	  if(info.pageUrl.indexOf("kuaishou.com")>0) {
		extractDediVid(tab, info);
		return;
	  }
    chrome.permissions.request({
      origins: ['*://*/*']
    }, granted => {
      if (granted) {
        grab('none');
      }
      else {
        notify(chrome.i18n.getMessage('bg_msg_11'));
      }
    });
  }
  else if (info.menuItemId === 'test') {
    chrome.tabs.create({
      url: 'https://webbrowsertools.com/test-download-with/'
    });
  }
  else if (info.menuItemId === 'extract') {
    const es = info.selectionText.match(LINKS) || [];
    chrome.permissions.request({
      origins: ['*://*/*']
    }, granted => {
      if (granted) {
        chrome.tabs.executeScript(tab.id, {
          frameId: info.frameId,
          code: `window.extraLinks = ${JSON.stringify(es)};`
        }, () => {
          const lastError = chrome.runtime.lastError;
          if (lastError) {
            notify(lastError.message);
          }
          else {
            chrome.tabs.executeScript(tab.is, {
              frameId: info.frameId,
              file: 'data/grab/selection.js'
            }, a => {
              if (a && a[0]) {
                const es = a[0].filter((s, i, l) => s && l.indexOf(s) === i);
                if (es.length) {
                  links[tab.id] = es;
                  grab('serve');
                }
                else {
                  notify(chrome.i18n.getMessage('bg_msg_2'));
                }
              }
            });
          }
        });
      }
      else {
        notify(chrome.i18n.getMessage('bg_msg_1'));
      }
    });
  }
  else {
	  //console.log(info);
	  if(info.linkUrl.indexOf("kuaishou.com")>0) {
		extractDediVid(tab, info);
		return;
	  }
    sendTo({
      finalUrl: info.menuItemId === 'open-video' ? info.srcUrl : info.linkUrl,
      referrer: info.pageUrl
    });
  }
});

//
chrome.runtime.onMessage.addListener((request, sender, response) => {
  if (request.method === 'notify') {
    notify(request.message);
  }
  else if (request.method === 'exec') {
    chrome.tabs.executeScript({
      runAt: 'document_start',
      code: request.code,
      allFrames: true
    }, r => {
      const lastError = chrome.runtime.lastError;
      if (lastError) {
        notify(lastError.message);
      }
      else {
        response(r);
      }
    });
    return true;
  }
  else if (request.method === 'download') {
    sendTo(Object.assign({
      referrer: sender.tab.url
    }, request.job), sender.tab);
  }
  else if (request.method === 'download-links') {
    if (config.mode.method === 'batch') {
      sendTo({
        ...request.job,
        referrer: sender.tab.url
      }, sender.tab);
    }
    else {
      (async () => {
        const delay = () => new Promise(resolve => window.setTimeout(resolve, Number(localStorage.getItem('delay') || 1000)));

        for (const finalUrl of request.job.url) {
          sendTo({
            finalUrl,
            referrer: sender.tab.url
          }, sender.tab);

          await delay();
        }
      })();
    }
    chrome.tabs.sendMessage(sender.tab.id, {
      cmd: 'close-me'
    });
  }
  else if (request.method === 'head') {
    const req = new XMLHttpRequest();
    req.open('GET', request.link);
    req.timeout = 10000;
    req.ontimeout = req.onerror = () => response('');
    req.onreadystatechange = () => {
      if (req.readyState === req.HEADERS_RECEIVED) {
        response(req.getResponseHeader('content-type') || '');
        req.abort();
      }
    };
    req.send();
    return true;
  }
  else if (request.method === 'extracted-links') {
    response(links[sender.tab.id] || []);
  }
});

// one time; we used to use chrome.storage for storing mime-types
{
  const callback = () => chrome.storage.local.get({
    mimes: ['application/pdf'],
    ported: false
  }, prefs => {
    if (prefs.ported === false) {
      if (prefs.mimes.length) {
        localStorage.setItem('mimes', prefs.mimes.join('|'));
        chrome.storage.local.remove('mimes');
        chrome.storage.local.set({
          ported: true
        });
      }
    }
  });
  chrome.runtime.onInstalled.addListener(callback);
}

/* FAQs & Feedback */
{
  const {management, runtime: {onInstalled, setUninstallURL, getManifest}, storage, tabs} = chrome;
  if (navigator.webdriver !== true) {
    const page = getManifest().homepage_url;
    const {name, version} = getManifest();
    onInstalled.addListener(({reason, previousVersion}) => {
      management.getSelf(({installType}) => installType === 'normal' && storage.local.get({
        'faqs': true,
        'last-update': 0
      }, prefs => {
        if (reason === 'install' || (prefs.faqs && reason === 'update')) {
          const doUpdate = (Date.now() - prefs['last-update']) / 1000 / 60 / 60 / 24 > 45;
          if (doUpdate && previousVersion !== version) {
            tabs.query({active: true, currentWindow: true}, tbs => tabs.create({
              url: page + '&version=' + version + (previousVersion ? '&p=' + previousVersion : '') + '&type=' + reason,
              active: reason === 'install',
              ...(tbs && tbs.length && {index: tbs[0].index + 1})
            }));
            storage.local.set({'last-update': Date.now()});
          }
        }
      }));
    });
    setUninstallURL(page + '&rd=feedback&name=' + encodeURIComponent(name) + '&version=' + version);
  }
}



function setHeader(h, n, v){
    var kv = h.find(({name}) => name === n);
    if (kv) {
      kv.value = v;
    }
    else {
      h.push({
        'name': n,
        'value': v
      });
    }
}

function removeHeader(h, n){
    var kv = h.find(({name}) => name === n);
    if (kv) {
      h.splice(h.indexOf(kv));
    }
}

// hack request 
// 增加安卓的UA
chrome.webRequest.onBeforeSendHeaders.addListener(
    function(info) {
        // Replace the User-Agent header
        const headers = info.requestHeaders;
		var reqAIUA=1,header;
		console.log(info);
		if(0)
		for(var i=0,len=headers.length;i<len;i++){
			header = headers[i];
			if (header.name === 'Req-Ai') { 
                reqAIUA=1;
            }
			else if (header.name === 'Sec-Fetch-Mode') { 
                //header.value = 'no-cors';
            }
			else if (header.name === 'Sec-Fetch-Site') { 
                //header.value = 'cross-site';
            }
		}
		//removeHeader(headers, 'Access-Control-Request-Headers');
		//removeHeader(headers, 'Access-Control-Request-Method');
		//const url = info.url;
		//if(url.indexof('.kuaishou.')>0||url.indexof('.gifshow.'))
		if(reqAIUA){
			var value = 'Mozilla/5.0 (Linux; Android 5.1.1; vivo X9 Plus Build/LMY48Z) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/39.0.0.0 Mobile Safari/537.36';
			value = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Mobile Safari/537.36 Edg/88.0.705.53';
			value = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Mobile Safari/537.36';
			setHeader(headers, "User-Agent", value);
			//setHeader(headers, "Origin", "https://m.kuaishou.com");
			// setHeader(headers, "Sec-Fetch-Mode", "no-cors");
			// setHeader(headers, "Sec-Fetch-Site", "cross-site");
			// setHeader(headers, "Sec-Fetch-Dest", "empty");
			console.log('modified!!!');
			console.log(info);
		}
        return {requestHeaders: headers};
    },
    // Request filter
    {
        // Modify the headers for these pages
        urls: [
            "*://m.gifshow.com/*"
            ,"*://www.gifshow.com/*"
            ,"*://live.kuaishou.com/*"
            ,"*://video.kuaishou.com/*"
            ,"*://m.kuaishou.com/*"
            //,"*://*/*"
        ],
        // In the main window and frames
        types: ["xmlhttprequest"]
    },
    ["blocking", "requestHeaders"]
);

// hack response
// 允许跨域
const extra = ['blocking', 'responseHeaders'];
chrome.webRequest.onHeadersReceived.addListener(d => {
	var responseHeaders = d.responseHeaders;
	//const {initiator, originUrl, responseHeaders, method, requestId, tabId} = d;
  //if(d.statusCode===200) 
  //if(0) 
  {
	console.log(d);
	setHeader(responseHeaders, 'Access-Control-Allow-Methods', '*');
	setHeader(responseHeaders, 'Access-Control-Allow-Origin', '*');
	setHeader(responseHeaders, 'Access-Control-Allow-Credentials', 'true');
	setHeader(responseHeaders, 'Access-Control-Allow-Headers', '*');
  }
  return {responseHeaders};
}, { 
urls: [
	"*://m.gifshow.com/*"
	,"*://www.gifshow.com/*"
	,"*://live.kuaishou.com/*"
	,"*://video.kuaishou.com/*"
	,"*://m.kuaishou.com/*"
	//,['<all_urls>']
],
types: ["xmlhttprequest"]
}, extra);

chrome.runtime.onMessageExternal.addListener( function(request, sender, sendResponse) {
	if (message) {
		console.log("ext - ???", message, sender);
		sender.pageUrl = sender.url;
		if(message.type == 'gifdwn') {
			// 处理右击直接下载美妞视频
			extractDediVid(sender.tab, sender);
		} else if(message.type == 'dirdwn'){
			console.log("ext - dirdwn~");
			sendTo({
			  finalUrl: sender.url
			  ,referrer: sender.url
			  ,filename: sender.name
			});
		}
		sendResponse("nores");
    }
});
  
// 后台消息处理
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message && message.type) {
		console.log("???", message, sender);
		sender.pageUrl = sender.url;
		if(message.type == 'gifdwn') {
			// 处理右击直接下载美妞视频
			extractDediVid(sender.tab, sender);
		} else if(message.type == 'dirdwn'){
			console.log("dirdwn~");
			sendTo({
			  finalUrl: message.url
			  ,referrer: message.url
			  ,filename: message.name
			});
		} else if(message.type == 'bkmk'){
      if(message.update) {
        chrome.bookmarks.search({'url':message.url},
          function(e) {
            console.log("bkmk🔍", e);
            if(e && e.length) {
              chrome.bookmarks.update(e[0].id, {'title': message.name });
            } else {
              chrome.bookmarks.create({
                'title': message.name,
                'url': message.url
              }, function(e){
                console.log("bkmk+", e);
              });
            }
          });
      } else {
        chrome.bookmarks.create({
          'title': message.name,
          'url': message.url
        }, function(e){
          console.log("bkmk+", e);
        });
      }
		}
		sendResponse("nores");
    }
});


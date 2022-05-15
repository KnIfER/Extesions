// ==UserScript==
// @name         快手直播间重新排序
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://live.kuaishou.com/my-follow/living
// @icon         https://www.google.com/s2/favicons?domain=kuaishou.com
// @grant        unsafeWindow 
// @grant        GM_xmlhttpRequest 
// ==/UserScript==


(function() {
    'use strict';

	var TopCName='live-card-main live-card-item';
	var LnkCName='preview-video'; // https://live.kuaishou.com/u/...
	var NamCName='user-info';

	function FindRoomTopElement(p) {
		while(p) {
			if(p.className===TopCName){
				return p;
			}
			p=p.parentElement;
		}
		return 0;
	}


	function GetRoomID(p) {
		var lnk = p.getElementsByClassName(LnkCName)[0];
		lnk=lnk.href;
		return lnk.substring(28);
	}

	function GetRoomName(p) {
		var nam = p.getElementsByClassName(NamCName)[0];
		return nam.innerText;
	}

	var roomLst;
	var win=window;
	var doc=document;
	var PinIdx=0;
	var FavPinIdx=0;

	function PinRoom(p, moreLove) {
		if(!roomLst)
			roomLst = doc.getElementsByClassName('live-card-list')[0];
		var idx = Array.prototype.indexOf.call(roomLst.children,p);
		var already = p.getAttribute('fav')!=undefined;
		p.setAttribute('fav', moreLove);
		if(idx>=0&&idx<=(moreLove?FavPinIdx:PinIdx)) return;
		p.remove();
		roomLst.insertBefore(p, roomLst.childNodes[moreLove?FavPinIdx:PinIdx]);
		if(moreLove){
			FavPinIdx++;
			if(!already) {
				PinIdx++;
			}
		}
		else PinIdx++;
	}

	function FFDBC(data, cb){
		// var x = new GM_xmlhttpRequest();
		// x.open('POST', 'http://127.0.0.1:8080/DB.jsp', true);
		// x.responseType = 'json';
		// if(cb)x.onload = function(e) {
		// 	debug(e);
		// 	cb(e);
		// };
		// x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
		// //x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
		// //x.send("table=TEST1&json={rowId:0,rid:'',fav:0}&indexed=['rid']");
		// x.send("data="+JSON.stringify(data));
		// //x.send("data={table:TEST1,json:{rowId:0,rid:'',fav:0}, indexed:{rid:1}}");
		// //x.send("data={table:TEST1,json:{rid:'123',fav:456}}");
		
		GM_xmlhttpRequest({
			method: "POST"
			, url: 'http://127.0.0.1:8080/DB.jsp'
			, data:"data="+JSON.stringify(data)
			, onload: function(e) {
				//debug(e);
				if(cb)cb(e);
			}
			, headers : {
				'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8'
			}
		});
	}

	var FFDB = true;
	function openDB (dao) {
		if(FFDB) {
			FFDBC({table:dao.name, json:{rowId:0,rid:'',fav:0,name:''}, indexed:{rid:1}}
			, function(e){
				dao.ffdbc(true);
				furtherLoading();
			});
		}
		else {
			var request=win.indexedDB.open(dao.name, dao.version || 1);
			request.onerror=function(e){
				log('Open Error!');
			};
			request.onsuccess=function(e){
				dao.db=e.target.result;
				//log(dao.db.version);
				furtherLoading();
			};
			request.onupgradeneeded=function(e){
				var db=e.target.result;
				if(!db.objectStoreNames.contains('rid')){
					db.createObjectStore('rid',{keyPath:"id"});
				}
				console.log('DB version changed to '+dao.version);
			};
		}
	}

	var mdb={
		name:'FavLst'
		,version:2
		,db:null
		,onsuccess:null
		,ffdb : false
		,ffdbc : function(e) {
			if(e) mdb.ffdb = true;
			else return mdb.ffdb;
		}
		, transact:function(e,v) {
			debug('transact', this);
			if(mdb.ffdb) {
				return {
					objectStore : function() {
						return {
							get : function(d, w) {
								FFDBC({table:mdb.name, json:d, where:w}, this.onsuccess);
							}
							, add : function(d) {
								FFDBC({table:mdb.name, json:d}, this.onsuccess)
							}
							, onsuccess : null
						};
					}
				};
			}
			try {
				return this.db.transaction(e,v);
			} catch(err){
				log(err);
				openDB(mdb);
			}
			return 0;
		}
	};
	openDB(mdb);

	function furtherLoading()
	{
		setTimeout(restore, 1800);
	}

	win.addEventListener('contextmenu', (e)=>{
		var p=FindRoomTopElement(e.srcElement);
		if(p) {
			var rid=GetRoomID(p);
			PinRoom(p, e.shiftKey);
			var transaction=mdb.transact('rid','readwrite');
			var dbo=transaction.objectStore('rid');
			dbo.add({rid:rid, fav:(e.shiftKey?1:0)});
			log("美丽天堂！", rid);
			e.preventDefault();
			var nam = p.getElementsByClassName(NamCName)[0];
			if(nam) {
				var range = document.createRange();
				range.selectNode(nam);
				getSelection().empty();
				getSelection().addRange(range);
				document.execCommand("Copy");
			}
		}
	});

	win.addEventListener('keydown', (e)=>{
		if(e.code==='KeyR'){
			restore();
		}
		else if(e.code==='KeyB'){
			if(e.shiftKey)backup();
		}
	});

	function restore(){
		var transaction=mdb.transact('rid');
		var dbo=transaction.objectStore('rid');
		let rooms = Array.prototype.slice.call(doc.getElementsByClassName(TopCName));
		for(var i=0;i<rooms.length;i++) {
			let p = rooms[i];
			if(p.style.display!=='none') {
				var rid = GetRoomID(p);
				if(mdb.ffdbc()) {
					dbo.onsuccess=function(e){
						var ret=JSON.parse(e.response);
						//debug('onsuccess!!!', ret);
						if(ret.fav>=0) {
							PinRoom(p, ret.fav>0);
							log("Beautiful Girl！", GetRoomID(p));
						}
					}
					dbo.get({fav:-1}, {rid:rid});
				}
				 else {
					var request=dbo.get(rid+'');
					request.onsuccess=function(e){
						var ret=e.target.result;
						if(ret) {
							//p.style.display='none';
							PinRoom(p);
							log("Beautiful Girl！", GetRoomID(p));
						}
					};
				}
			}
		}
	}
	
	if(!window.unsafeWindow) window.unsafeWindow=window;
	unsafeWindow.mdb = mdb;
	unsafeWindow.portFav = function(e) {
		e=e.split('\n');
		var transaction=mdb.transact('rid','readwrite');
		var dbo=transaction.objectStore('rid');
		for(var i=0;i<e.length;i++){
			var rid = /(?<=")(?!i)[0-9a-zA-Z-]+/.exec(e[i]);
			if(rid) rid=rid[0];
			if(rid) {
				log(rid);
				dbo.add({rid:rid});
			}
		}
	}
	
	function dumpBackup(data) {
		data = JSON.stringify(data);
		var urlObject = window.URL || window.webkitURL || window
		var export_blob = new Blob([data])
		var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a')
		save_link.href = urlObject.createObjectURL(export_blob)
		save_link.download = "FavLst.txt"
		fakeClick(save_link)
	}
	function fakeClick(obj) {
	  var ev = document.createEvent('MouseEvents')
	  ev.initMouseEvent('click', true, false, unsafeWindow, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
	  obj.dispatchEvent(ev)
	}

	function backup() {
		let vals=[];
		var transaction=mdb.transact('rid','readonly');
		var dbo=transaction.objectStore('rid');
		var requsor = dbo.openCursor();
		requsor.onsuccess = function (event){
			if (event.target.result){
				vals.push(event.target.result.value);
				event.target.result['continue']();
			}
		};
		transaction.oncomplete = function (event) {
			//log(vals);
			dumpBackup(vals);
		};
	}
})();
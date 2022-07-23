// ==UserScript==
// @name         花瓣批量上传
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://huaban.com/boards/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=huaban.com
// @grant        none
// ==/UserScript==

(function() {
   'use strict';

    function ge(e,p){return (p||document).getElementById(e)};
    function gc(e,p){return (p||document).getElementsByClassName(e)[0]};
    function _gn(e,p){if(!p || p.name===e)return p;return _gn(e,p.nextElementSibling)||_gn(e,p.firstElementChild)};
    function gn(e,p){return _gn(e, p.firstElementChild);};
    function _gAlt(e,p){if(!p || p.alt===e)return p;return _gAlt(e,p.nextElementSibling)||_gAlt(e,p.firstElementChild)};
    function gAlt(e,p){return _gAlt(e, (p||document).firstElementChild)};
    function _gt(e,p){if(!p || p.innerText===e)return p;return _gt(e,p.nextElementSibling)||_gt(e,p.firstElementChild)};
    function gt(e,p){return _gt(e, (p||document).firstElementChild)};
    function ga(e,p){return (p||document).getElementsByTagName(e)[0]};


    document.documentElement.ondragover=allowDrop;
    document.documentElement.ondrop=drop;
    // document.documentElement.ondragover=0;
    // document.documentElement.ondrop=0;
    var initDone;
    var dropEvt;
    var upload; 
    var dropFk; 
    var files, fkFiles
    var length, idx, tryCnt;
    var maps = {};

    // invoke -> uploadOne -> fakeDrop -> Wait & Collect -> uploadOne -> ...

    function tryUpload(){
        var pinDlg = ge('create_pin');
        if(pinDlg && pinDlg.style.display!='none') {
            var scroll = gc('scrollable', pinDlg);
            if(scroll) {
                scroll = gc('recent', pinDlg);
                if(scroll) {
                    scroll = gc('selected', pinDlg);
                    var ta = ga('TEXTAREA', pinDlg);
                    if(scroll && ta) {
                        if(ta) {
                            if(ta.value=='') {
                                console.log('上传过了？', idx+'/'+length, files[idx]?.name);
                                return 1000;
                            }
                            if(maps[ta.value]) {
                                return 1;
                            }
                            maps[ta.value]=1;
                        }
                        var btn = gc('btn-selected', scroll);
                        if(btn) {
                            btn.click();
                            return 1;
                        }
                    }
                }
            }
        }
        return 0;
    }

    function next(){
        idx++;
        if(idx<length) {
            var all = document.getElementsByClassName('close-btn');
            for(var i=0,btn;btn=all[i];i++){
                btn.firstChild?.click();
                btn.click();
            }
            document.getElementsByClassName('close-btn')[3]?.click()
            setTimeout(uploadOne, Math.max(75, Math.random()*150));
        }
    }

    function doUpload(){
        var ret = tryUpload();
        if(ret==0 && tryCnt>0) {
            next();
        } else {
            tryCnt += ret;
            //console.log('doUpload...', tryCnt, ret);
            if(tryCnt<=125) { // retry
                setTimeout(doUpload, Math.max(75, Math.random()*150));
            } else {
                next();
            }
        }
    }

    function fakeDrop(){
        upload = gc('dropzone dz-clickable')
        || gc('zD1JyYvi pxOouvU7')
        
        if(!upload) {
            setTimeout(fakeDrop, Math.max(800, Math.random()*1500));
        } else {
            //console.log("拖到这里", upload);
            //console.log("ev::2", dropFk, dropFk.dataTransfer.files);

            upload.dispatchEvent(dropFk);

            tryCnt = 0;
            // time2
            setTimeout(doUpload, Math.max(1500, Math.random()*3000));
        }
    }

    
    function init(){
        if(!initDone) {
            initDone=1;
            Object.defineProperty(dropFk.dataTransfer, "files", {
                get: function () { return fkFiles; }
            });
        }
    }

    function uploadOne(){
        var addPin = gc('add-pin')||gc('zjSSb8O3')||gt('添加采集');
        addPin.click(); //add-pin
        var f = files[idx];
        debug('uploadOne…', idx+'/'+length, f.name);

		fkFiles = Object.create(files);
		fkFiles[0] = f;
        //fkFiles.length=1;
        Object.defineProperty(fkFiles, "length", {
            get: function () { return 1; }
        });
		//console.log(fkFiles, fkItems);
        dropFk = new dropEvt.constructor(dropEvt.type, dropEvt);
        dropFk.fk=1;
        init();
        //console.log("ev::???::", dropFk.dataTransfer.files, fkFiles);
        // 等待“上传采集”对话框，模拟文件拖拽至其中！  time1
        setTimeout(fakeDrop, Math.max(800, Math.random()*1500));
    }

    function invoke(){
		var dt = dropEvt.dataTransfer;
		files = dt.files;
        length = files.length;
        idx = 0;
        uploadOne();
    }
    
	function allowDrop(ev) {
	  ev.preventDefault();
	}
	function drop(ev) {
        if(upload && upload.style.display!='none'
            || ev.fk)
            return;
        ev.preventDefault();
		console.log("recv::2");
		console.log(ev);
        dropEvt = ev;

        invoke();

		//console.log(files, items, files.length);
	}


})();
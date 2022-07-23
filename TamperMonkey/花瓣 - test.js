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

//(function() {
//    'use strict';

    function ge(e,p){return document.getElementById(e)};
    function gc(e,p){return document.getElementsByClassName(e)[0]};
    function _gn(e,p){if(!p || p.name===e)return p;return _gn(e,p.nextElementSibling)||_gn(e,p.firstElementChild)};
    function gn(e,p){return _gn(e, p.firstElementChild);};
    function _gAlt(e,p){if(!p || p.alt===e)return p;return _gAlt(e,p.nextElementSibling)||_gAlt(e,p.firstElementChild)};
    function gAlt(e,p){return _gAlt(e, document.firstElementChild)};
    function _gt(e,p){if(!p || p.innerText===e)return p;return _gt(e,p.nextElementSibling)||_gt(e,p.firstElementChild)};
    function gt(e,p){return _gt(e, document.firstElementChild)};


    document.documentElement.ondragover=allowDrop;
    document.documentElement.ondrop=drop;
    // document.documentElement.ondragover=0;
    // document.documentElement.ondrop=0;
    var initDone;
    var dropEvt;
    
    // const obzDlg=new MutationObserver(function(mutationsList, observer) {
    //     for(var i=0;i<mutationsList.length;i++) {
    //         var mutation = mutationsList[i];
    //         if (mutation.type==='attributes' && mutation.attributeName==='style') {
    //             //console.log('The ' + mutation.attributeName + ' attribute was modified.');
    //             if(listPane.style.display=='') { 
    //                 listPane.style.display='none';
    //             }
    //         }
    //     }
    // });
    function init(){
        if(!initDone) {
            initDone=1;
            //ge('image_upload')


        }
    }


    var upload; var dropFk; var fkFiles, fkItems;

    function fakeDrop(){
        upload = gc('dropzone dz-clickable')
        || gc('zD1JyYvi pxOouvU7')
        || gAlt('拖到这里').parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode; //
        
        console.log("拖到这里", upload);
        console.log("ev::2", dropFk, dropFk.dataTransfer.files);

        upload.dispatchEvent(dropFk);

        // setTimeout(function(){
        //     document.documentElement.ondragover=allowDrop;
        //     document.documentElement.ondrop=drop;
        // }, 1000);
    }

    function invoke(){
        //document.documentElement.ondragover=0;
        //document.documentElement.ondrop=0;

        var addPin = gc('add-pin')||gc('zjSSb8O3')||gt('添加采集');
        addPin.click(); //add-pin
        init();
 
        
		var dt = dropEvt.dataTransfer;
		var files = dt.files;
		var items = dt.items;

		// fkFiles = {};
		// fkItems = {};
        var idx=1;
		fkFiles = Object.create(files);
		fkItems = Object.create(items);
		fkFiles[0] = files[idx];
		fkItems[0] = items[idx];
        fkFiles.length=1;
        fkItems.length=1;
        Object.defineProperty(fkFiles, "length", {
            get: function () { return 1; }
        });
        Object.defineProperty(fkItems, "length", {
            get: function () { return 1; }
        });
		//console.log(fkFiles, fkItems);
        dropFk = new dropEvt.constructor(dropEvt.type, dropEvt);
        dropFk.fk=1;
        Object.defineProperty(dropFk.dataTransfer, "files", {
            get: function () { return fkFiles; }
        });
        // Object.defineProperty(dropFk.dataTransfer, "items", {
        //     get: function () { return fkItems; }
        // });


        // Object.defineProperty(dropFk.dataTransfer.files, "length", {
        //     get: function () { return 1; }
        // });
        // Object.defineProperty(dropFk.dataTransfer.items, "length", {
        //     get: function () { return 1; }
        // });


        console.log("ev::???::", dropFk.dataTransfer.files, fkFiles);
        //dropFk.dataTransfer.items = fkItems;
        //ev.dataTransfer.items[0] = items[0];
		// ev.dataTransfer.files = fkFiles;
		// ev.dataTransfer.items = fkItems;


        // document.documentElement.ondragover=0;
        // document.documentElement.ondrop=0;

        setTimeout(fakeDrop, 200);

		//var file = fkFiles[0];
		//var fReader = new FileReader();
		//fReader.readAsDataURL(file);//将file读为url
		//fReader.onload = function (ev) {
		//	var img = document.getElementById("img");
		//	img.src = fReader.result;
		//}
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


//})();
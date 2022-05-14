// ==UserScript==
// @name         Gifshow Trim Down
// @namespace    https://github.com/gildas-lormeau/SingleFile
// @version      1.0
// @author       Gildas Lormeau
// @match        https://live.kuaishou.com/*
// @noframes
// @grant        unsafeWindow
// ==/UserScript==


(() => {

    var deleted=[], scrollY;
    dispatchEvent(new CustomEvent("single-file-user-script-init"));
  
    addEventListener("single-file-on-before-capture-request", () => {
        var el=document.getElementsByClassName('profile')[0];
        deleted.length=0;
        scrollY = document.documentElement.scrollTop;
        if(el.childElementCount==4) {
            for(var i=0;i<3;i++) {
                var child=el.children[i];
                deleted[i]=child;
                //child.remove();
                //debug('拆散', child);
                deleted[i]=child.style.display;
                child.style.display='none';
            }
        }
    });
	
	function restoreGif(){
		var el=document.getElementsByClassName('profile')[0];
        for(var i=0;i<deleted.length;i++) {
            //el.prepend(deleted[deleted.length-1-i]);
            //debug('装回去！！！');
            var sty=deleted[i];
            el.children[i].style.display=sty;
        }
        deleted.length=0;
        document.documentElement.scrollTop = scrollY;
	}
  
    addEventListener("single-file-on-after-capture-request", () => {
        restoreGif();
    });
	
	unsafeWindow.restoreGif = restoreGif;
  
  })();
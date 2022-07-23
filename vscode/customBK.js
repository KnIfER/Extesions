
var d=document;
function debug(...e){console.log(e)};
function ge(e){return d.getElementById(e)};
function gc(e,n){return (n||d).getElementsByClassName(e)};

debug('custom_run!');

(function(){
setTimeout(init,800)

var sb,sbw,sbP,sps,lpw,mgs;
var lp, ep, lps, eps, x = y = 0;

function init(){
    var main=gc('monaco-split-view2 horizontal')[0];
    if(main) {
        debug(main);
        //main.style.top='30px';
        sb = ge('workbench.parts.activitybar');
        sbP = sb.parentElement;
        lp = sbP.nextElementSibling;
        ep = lp.nextElementSibling;
        lps = lp.style;
        eps = ep.style;
        sps=gc('monaco-sash vertical')[1].style;
    }
}

function isMg(e) {
    var ret=e && e.className==='margin';
    if(ret) mgs=e.nextElementSibling;
    return ret;
}

window.addEventListener('mousedown', wrappedDownd);
function wrappedDownd(e){
    debug("wrappedDownd", e, e.path[3], e.path[2]);
    
    //if(e.srcElement.parentElement===sb) {// 左栏 
    if(e.button===2 && (isMg(e.path[3])||isMg(e.path[2]))) {
        document.addEventListener('mousemove', mouseMove);
        document.addEventListener('mouseup', mouseUp);
        x = e.clientX;// - lvP.offsetWidth;
        lpw = parseInt(lps.width);
        sbw = parseInt(sb.offsetWidth);
    }
}
var E;
var T;
function mouseMove(e){
    E=e;
    requestAnimationFrame(mouseMove1);
  //  requestAnimationFrame(mouseMoveT);
   // mouseMove1();
    //clearTimeout(T);
   // mouseMoveT();
}

function mouseMoveT(e){
   clearTimeout(T);
   T= setTimeout(mouseMove1, 5);
}

function mouseMove1(){
    var e=E;
    //debug(e);
    var dx=e.clientX-x, w=lpw+dx;
    if(w<0) {
        dx=-lpw;
        w=0;
    }
    var wd=w+'px';
    
    e=gc('content',lp)[0]?.style;
    if(e)e.width = wd;

    lps.width = wd;

    sps.left = wd;

    dx = parseInt(eps.left)-sbw-w;
    eps.left = w+sbw+'px';
    //e=gc('split-view-view',eps)[0]?.style;
    e=mgs;
    // while(e) {
    //     var s=e.style;
    //     if(s.width.length)
    //         s.width = (dx+parseInt(s.width))+'px';
    //     e=e===ep?0:e.parentElement;
    // }

    //debug(sps.left)
}

function mouseUp(){
    document.removeEventListener('mousemove', mouseMove);
    document.removeEventListener('mouseup', mouseUp);
}




})()
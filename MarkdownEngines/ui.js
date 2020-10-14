console.log('UI loaded!!!');
var w=window;
w.llock=0;
var ind=0;
w.onscroll=wrappedOnScroll;
w.addEventListener('mouseover', function(ev){
    //console.log('MIN!');
    if(ind) llock=1;
});
w.addEventListener('mouseout', function(ev){
    llock=0;
});
var lns=[];
w.MDAP = function() {
    lns=[];
    var cs = document.body.childNodes;
    for(var i in cs){
        var cI = cs[i];
        if(cI.tagName=='SPAN'&&cI.hasAttribute('ln'))
            lns.push(cI);
    }
    //console.log('MDAP', lns);
    ind=1;
    llock=1;
}

var lastLn=0;

var lReq=0;
var lTm=0;

function reduce(ot, start, end){
    var len = end-start;
    if (len > 1) {
        len = len >> 1;
        return ot > lns[start + len - 1].offsetTop
                    ? this.reduce(ot,start+len,end)
                    : this.reduce(ot,start,start+len);
    } else {
        return start;
    }
}

function reduln(ln, start, end){
    var len = end-start;
    if (len > 1) {
        len = len >> 1;
        return ln > parseInt(lns[start + len - 1].getAttribute('ln'))
                    ? this.reduln(ln,start+len,end)
                    : this.reduln(ln,start,start+len);
    } else {
        return start;
    }
}

function doScintillo(bf) {
    var top = parseInt(document.documentElement.scrollTop||document.body.scrollTop);
    var i=reduce(top, 0, lns.length);
    var dt=0, dl=0, lnc=0;
    lnc = parseInt(lns[i].getAttribute('ln'));
    if(lns[i].offsetTop!=top) {
        if(i>0) {
            dt=lns[i-1].offsetTop;
            dl=parseInt(lns[i-1].getAttribute('ln'));
        }
        lnc = dl+(lnc-dl)*1.0*(top-dt)/(lns[i].offsetTop-dt);
        lnc = Math.round(lnc);
    }
    if(lastLn!=lnc||bf) {
        lastLn=lnc;
        //console.log('doScintillo', lastLn, lnc);
        if(w.Scinllo) {
            bf?Scinllo(lnc,1):Scinllo(lnc);
        }
        else if(w.chrome&&w.chrome.webview) {
            w.chrome.webview.postMessage('scinllo'+(bf?'_':'')+lnc);
        }
        else if(window.mbQuery) {
            w.mbQuery(0x996,'scinllo'+(bf?'_':'')+lnc,onNative);
        }
    }
}

function wrappedOnScroll(ev) {
    if(lTm) {
        if(new Date()-lTm<200)
        {
            return;
        } else {
            lTm=0;
        }
    }
    if(llock&&lns.length>0) {
        //console.log('scroll', ev);
        doScintillo(false);
    }
    if(lReq) {
        llock=1;
    }
}

function syncLn(ln) {
    var i=reduln(ln, 0, lns.length);
    var dt=0, dl=0, lnc=0;
    var lnc = parseInt(lns[i].getAttribute('ln'));
    var tc = lns[i].offsetTop;
    if(lnc!=ln) {
        if(i>0) {
            dt=lns[i-1].offsetTop;
            dl=parseInt(lns[i-1].getAttribute('ln'));
        }
        tc=dt+(lns[i].offsetTop-dt)*1.0*(ln-dl)/(lnc-dl);
    }
    //console.log('syncLn', ln, lnc);
    llock=0;
    document.body.scrollTop=tc;
    document.documentElement.scrollTop=tc;
    lTm=new Date().getTime();
    lReq=1;
}

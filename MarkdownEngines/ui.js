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
var tbd = [];
var tocti;
w.MDAP = function() {
    lns=[];
    tbd=[];
    var cs = document.body.childNodes;
    if(cs.length==1&&cs[0].tagName=='DIV') {
        cs=cs[0].childNodes;
    }
    var tp, tn, tc, cI;
    for(var i in cs){
        cI = cs[i];
        tn=cI.tagName;
        if(tn && tn.length==2 && tn[0]=='H')
        {
            tc = tn.charAt(1);
            if(tc>='1'&&tc<='9') {
                tbd.push(cI);
            }
            else if(tc==='T') {
                tp=cI;
            }
            // <hl ln="0"></hl>
            else if(tc==='L'&&cI.hasAttribute('ln')) {
                lns.push(cI);
            }
        }
    }
    //console.log('MDAP', lns);
    ind=1;
    llock=1;
    console.log(cs[0].tagName==='P', cs[0].childNodes);
    if(!tp) {
        if(cs[0].tagName==='P'&&(cs=cs[0].childNodes).length==1&&cs[0].tagName==='HT')
            tp=cs[0];
    }
    if(tp) {
        parseToc(tp, true);
    }
}

function parseToc(tp, dp){
    if(dp) {
        tocti=tp.innerHTML;
    }
    if(tocti) {
        tp.innerHTML='<h3>'+tocti+'</h3>';
    }
    var tocid=[];
    tocid.push(0);
    tocid.push(0);
    var tidit=2;
    for(var i in tbd) {
        var hI=tbd[i];
        var tn=hI.tagName[1];
        var itI=parseInt(tn);// 1~9
        var l=document.createElement('LI');
        var a=document.createElement('A');
        a.id=i;
        a.href='#'+hI.id;
        a.innerHTML=hI.innerHTML;
        l.appendChild(a);
        if(itI>=tidit) {
            for(var it=tidit;it<=itI;it++){
                var u=document.createElement('UL');
                tocid.push(u);
                if(tocid[it-1]) tocid[it-1].appendChild(u);
                else if(it==2) tp.appendChild(u);
            }
        }
        if(tocid[itI]) tocid[itI].appendChild(l);
        else if(itI==1) tp.appendChild(l);
        tocid.length=tidit=itI+1;
        //var cn = 'item_h'+tn;
        //tp.innerHTML+='<li><a id="'+i+'" class="nav_item '+cn+'" href="#'+hI.id+'">'+hI.innerText+'</a></li>';
    }
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

//sync web to editor
function doScintillo(bf) {
    var lnc=0, top = parseInt(document.documentElement.scrollTop||document.body.scrollTop);
    if(lns.length==0) {
        var H=document.body.scrollHeight; 
        if(H>0) {
            // map percent to -1000~0
            lnc = -Math.floor(top*1000.0/H);
        }
    } else {
        var i=reduce(top, 0, lns.length);
        var dt=0, dl=0;
        lnc = parseInt(lns[i].getAttribute('ln'));
        if(lns[i].offsetTop!=top) {
            if(i>0) {
                dt=lns[i-1].offsetTop;
                dl=parseInt(lns[i-1].getAttribute('ln'));
            }
            lnc = dl+(lnc-dl)*1.0*(top-dt)/(lns[i].offsetTop-dt);
            lnc = Math.round(lnc);
        }
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
    if(llock) {
        //console.log('scroll', ev);
        doScintillo(false);
    }
    if(lReq) {
        llock=1;
    }
}

//sync editor to web
function syncLn(ln, pct) {
    if(lns.length==0) {
        if(pct>=0) {
            // simple percentage mapping. see SubratThakur/remark-preview
            const nxtPos = document.body.scrollHeight * pct;
            window.scroll(0, Math.ceil(nxtPos));
        }
        return;
    }
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
    console.log('syncLn', ln, lnc);
    llock=0;
    document.body.scrollTop=tc;
    document.documentElement.scrollTop=tc;
    lTm=new Date().getTime();
    lReq=1;
}

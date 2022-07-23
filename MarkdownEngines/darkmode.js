(function(){
var w=window;

var msgCsmr=[];
var b1=w.chrome&&w.chrome.webview;
if(b1) {
    w.chrome.webview.addEventListener('message', arg => {
        //console.log("w2.getDarkBG::", arg);
        var fun = msgCsmr.pop();
        if(fun)fun(arg.data);
    });
}

w.chrome&&w.chrome.webview

w._RDM = function(bg)
{
    console.log("_RDM::", bg);
    var e = w._dkStl;
    if(!e) {
        e = document.createElement('style');
        e.setAttribute('rel','stylesheet');
        e.setAttribute('type','text/css');	
        e.id="_dkStl";
        w._dkStl = e;
        document.head.append(e);
    }
    if(w.getDarkBG) { // libcef-browser-widget and miniblink-wke
        bg = bg||w.getDarkBG();
    }
    else if(b1) { // webview2
        w.chrome.webview.postMessage('getDarkBG');
        msgCsmr.push(function m(rsp){furtherSetBG(rsp)});
        return;
    }
    else if(w.mbQuery) { // miniblink
        function onNative(msg,rsp) {
            //console.log("w.mbQuery::", rsp);
            if(msg==0x997)furtherSetBG(rsp);
        };
        bg = w.mbQuery(0x997,'getDarkBG',onNative);
        return;
    }
    furtherSetBG(bg)
}

function furtherSetBG(bg)
{
    //if(w._RDMBG!=bg)
    if(bg) {
        //function getHexColor(number){
        //    return "#"+((number)>>>0).toString(16).slice(-6);
        //}
        //console.log(getHexColor(bg), bg);
        //bg = getHexColor(bg);
        bg = "#000"; // force to dark is OK.
        _dkStl.innerHTML = `body {
            background:${bg}!important;
            background-color:${bg}!important;
            -webkit-filter: invert(1);
            filter: invert(1);
            -moz-filter:invert(1);
            -o-filter:invert(1);
            -ms-filter:invert(1);
        }
        body::-webkit-scrollbar {
            width: 10px;
            height: 1px;
        }

        body::-webkit-scrollbar-thumb {
            border-radius: 10px;
            -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
            background: #535353;
            }

        body::-webkit-scrollbar-track {
            -webkit-box-shadow: inset 0 0 5px rgba(0,0,0,0.2);
            border-radius: 10px;
            background: #EDEDED00;
        }
`;
    } else {
        _dkStl.innerHTML = "body{background:#fff}";
    }
    w._RDMBG=bg;
}

})()
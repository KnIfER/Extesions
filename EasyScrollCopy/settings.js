
var fyi=function(e) 
{
	return chrome.i18n.getMessage(e);
};

function unwrap(e) 
{
	return e.replace(/\(&.\)/g, "").replace("&", "");
};

var port = chrome.extension.connect({name: "OPTR"});

//port.postMessage("Hi BackGround");
function readAct() 
{
	chrome.storage.local.get(['opt_act'], function(result) {
		//alert('Value currently is ' + result.opt_act);
		var act = result.opt_act;
		if(!act) {
			act = "adv_cp_tu";
		}
		var pfx = "";
		if(act.startsWith('auto_scroll_')) {
			act = act.substring(12);
		} else if(act.startsWith('adv_cp_')) {
			pfx = fyi("c");
			act = act.substring(7);
		}
		act = pfx+fyi(act);
		act = unwrap(act);
		document.getElementById("opt_act").innerText=act;
	});
}

var opt;
var fldIds={}
var _saveflds_id;

var t4 = document.getElementById("config.tfore");

function setVal(d, t) 
{
	if(t!=undefined) {
		document.getElementById(d).value=t;
	}
}

function sitVal(m, v, r) 
{
	opt.fflag&=~m;
	if(v^r) {
		opt.fflag|=m;
	}
}

function gitVal(m, r) 
{
	return (opt.fflag&m)^r;
}

function readOpts() 
{
	chrome.storage.local.get(['sep_t','sep_u','fflag'], function(result) {
		//alert('Value currently is ', result);
		opt = result;
		setVal("sep_t", opt.sep_t);
		setVal("sep_u", opt.sep_u);
		if(!gitVal(0x1,true)) {
			t4.className="ant-switch";
		}
	});
}

port.onMessage.addListener(function(msg) {
  console.log("msg::", msg);
  
  if(msg==="WM_OPT") {
	readAct();
  }
});

function saveFlds() 
{
	var opt={};
	var flds=fldIds;
	fldIds={};
	for(var key in flds){
		var e=flds[key].value;
		if(e===undefined) {
			e=flds[key];
		}
		opt[key]=e;
	}
	chrome.storage.local.set(opt, function() { });
	clearTimeout(_saveflds_id);
	_saveflds_id=0;
}

function startSaving() 
{
	if(_saveflds_id) {
		clearTimeout(_saveflds_id);
	}
	_saveflds_id = setTimeout(saveFlds, 600);
}

function startSavingFF() 
{
	fldIds["fflag"]=opt.fflag;
	startSaving();
}

function fldLis(e) 
{
	var t=e.srcElement;
	fldIds[t.id]=t;
	startSaving();
}

document.querySelectorAll('input').forEach(elem => {
	elem.oninput = fldLis;
})


document.querySelectorAll('[data-msg]').forEach(elem => {
	var data=fyi(elem.dataset.msg);
	if(data) {
		var pfx=elem.dataset.pfx;
		if(pfx && (pfx=fyi(pfx))) {
			data = pfx+data;
		}
		elem.innerText = unwrap(data);
	}
})

t4.onclick=function(e)
{
	var val=!gitVal(0x1,true) ;
	sitVal(0x1,val,true) 
	if(val) {
		t4.className="ant-switch ant-switch-checked";
	} else {
		t4.className="ant-switch";
	}
	startSavingFF();
}

if(chrome.i18n.getUILanguage()==="zh-CN") {
	document.getElementById("fb").href="https://gitee.com/knziha/Extesions/issues";
}

readAct();
readOpts();
;(function(){
	var w=window;

	function toMarkdown(e) {
		if(!w.turndownService) {
			if(!w.TurndownService) {
				var url='http://mdbr/Turndown/dist/turndown.js';
				//var url='https://unpkg.com/turndown/dist/turndown.js';
				let xhr = new XMLHttpRequest();
				xhr.open('GET', url, false);
				xhr.send();
				var item = document.createElement('script');
				item.innerHTML=xhr.responseText;
				item.async = false;
				document.head.append(item);
			}
			var opt={headingStyle:'atx', hr:'***', bulletListMarker:'-', codeBlockStyle:'fenced'};
			w.turndownService = new w.TurndownService(opt);
		}
		return turndownService.turndown(e);
	}

	function copyTextV1(text) {
		var tmpText = window.document.getElementById('copit'); 
		if(!tmpText) {
			tmpText = document.createElement('p');
			document.body.appendChild(tmpText);
			tmpText.id = 'copit';
		}
		tmpText.focus();
		tmpText.innerText=text;
		const range = document.createRange();
		range.selectNode(tmpText);
		const selection = window.getSelection();
		if(selection.rangeCount > 0) selection.removeAllRanges();
		selection.addRange(range);
		document.execCommand('copy');
	}

	function toPasteMdoc(e) {
		copyTextV1(toMarkdown(e));
	}

	console.log('html -> md doc');

	//toPasteMdoc('<h1>Turndown Demo</h1>');
	function fuy(msg,rsp){
	}
	function turn(e){
		//toPasteMdoc(e);
		e = toMarkdown(e);
		if(w.NewDoc) {
			NewDoc(e);
		}
		else if(w.mbQuery) {
			mbQuery(0x999,e,fuy);
		}
	}
	function onNative(msg,rsp){
		if(msg==0x666)turn(rsp);
	}
	if(w.GetDocText) {
		turn(GetDocText(""));
		//NewDoc("ASD")
		//var e = toMarkdown("ASD");
	}
	else if(w.mbQuery) {
		mbQuery(0x666,"",onNative);
	}
	else {
		var R=new XMLHttpRequest();
		R.open('POST','text',true);
		R.onreadystatechange=function(){
			turn(rsp);
		};
		R.send();
	}
})()







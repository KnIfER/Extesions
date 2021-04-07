(function(document) {

    function makeHtml(data) {
		var renderer = new Asciidoctor();
		document.body.innerHTML = renderer.convert(data);
	}
	/* 引擎初始化 */
	function loadJs(name,up){
		var item = document.createElement('script');
		item.src=name;
		item.async = false;
		if(up)
		{
			item.onload=function(){window.update();}
		}
		document.head.append(item);
	}
	function loadCss(name){
		var item = document.createElement('link');
		item.setAttribute('rel','stylesheet');
		item.setAttribute('href', name);
		item.setAttribute('type','text/css');
		document.head.append(item);
	}
	function init(name){
		console.log(name.src);
		var src_url=name.src+"/../";
		var jss=["asciidoctor.css"];
		for(var j in jss){
			loadCss(src_url+jss[j]);
		}
		jss=["asciidoctor.min.js"];
		for(var j in jss){
			loadJs(src_url+jss[j], j==jss.length-1);
		}
		//window.update();
	}
	
	window.APMD = makeHtml;
	window.init = init;
}(document));
	
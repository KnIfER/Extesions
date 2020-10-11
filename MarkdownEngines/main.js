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
		var jss=["jquery.js"
		, "marked.js"
		, "highlight.js"
		, "config.js"
		, "markdownify.js"
		, "webfont.js"
		, "snap.svg.js"
		, "underscore.js"
		, "sequence-diagram.js"
		, "raphael.js"
		, "flowchart.js"
		, "diagramflowseq.js"
		, "katex.js"
		, "rawdeflate.js"
		, "platumlencode.js"
		, "mermaid.js" ];
		for(var j in jss){
			loadJs(src_url+jss[j], j==jss.length-1);
		}
		jss=["Clearness.css", "katex.css"];
		for(var j in jss){
			loadCss(src_url+"theme/"+jss[j]);
		}

		//window.update();

	}
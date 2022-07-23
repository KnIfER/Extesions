(function(document) {
    function resolveImg(img) {
        var src = $(img).attr("src");
        if (src[0] == "/") {
            $(img).attr("src", src.substring(1));
        }
    }

    function makeHtml(data) {
		var items={};
		//items.supportMath=1;
		items.katex=1;
		items.html=1;
		items.toc=1;
		// Convert MarkDown to HTML
		var preHtml = data;
		if (items.html) {
			config.markedOptions.sanitize = false;
		}
		if (items.katex) {
			config.markedOptions.katex = true;
			preHtml = diagramFlowSeq.prepareDiagram(data);
		}
		marked.setOptions(config.markedOptions);
		var html = marked(preHtml);
		$(document.body).html(html);

		$('img').on("error", function() {
			resolveImg(this);
		});

		diagramFlowSeq.drawAllFlow();
		diagramFlowSeq.drawAllSeq();
		diagramFlowSeq.drawAllMermaid();

		if(window.MDAP)
			window.MDAP();

		refreshDarkMode();	
	}

	function refreshDarkMode(bg)
	{
		if(!window._RDM) {
			loadJs("http://mdbr/darkmode.js", function(){window._RDM(bg)});
		} else {
			window._RDM(bg);
		}
	}

	/* 引擎初始化 */
	function loadJs(name,up){
		var item = document.createElement('script');
		item.src=name;
		item.async = false;
		if(up)
		{
			item.onload=up;
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
		, "raphael.min.js"
		, "flowchart.min.js"
		, "diagramflowseq.js"
		, "katex.min.js"
		, "rawdeflate.js"
		, "platumlencode.js"
		, "mermaid.min.js" ];
		var up=function(){window.update()};
		for(var j in jss){
			loadJs(src_url+jss[j], j==jss.length-1?up:null);
		}
		jss=["style.css", "katex.min.css"];
		for(var j in jss){
			loadCss(src_url+"theme/"+jss[j]);
		}
		//window.update();
	}
	window.APMD = makeHtml;
	window.init = init;
}(document));
	
(function(document) {
    function resolveImg(img) {
        var src = $(img).attr("src");
        if (src[0] == "/") {
            $(img).attr("src", src.substring(1));
        }
    }

    // Onload, take the DOM of the page, get the markdown formatted text out and
    // apply the converter.
    function makeHtml(data) {
        //storage.get(['supportMath', 'katex', 'html', 'toc'], function(items) {
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
        //});
    }
	window.APMD = makeHtml;
}(document));
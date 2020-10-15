(function(document) {

    var mpp = {},
        interval,
        defaultReloadFreq = 3,
        previousText;
        //storage = chrome.storage.local;

    mpp.ajax = (options) => {
        if (options.url.protocol == "file:") {
            chrome.runtime.sendMessage({message: "autoreload", url: options.url}, (response) => {
                options.complete(response);
            })
        } else {
            var finish = options.complete;
            options.complete = null;
            $.ajax(options).done((data, textStatus, xhr) => {
                finish({
                    data: data,
                    textStatus: textStatus,
                    contentType: xhr.getResponseHeader('Content-Type')
                });
            });
        }
    };

    function getExtension(url) {
        url = url.substr(1 + url.lastIndexOf("/"))
            .split('?')[0]
            .split('#')[0];
        var ext = url.substr(1 + url.lastIndexOf("."));
        return ext.toLowerCase();
    }

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

            addTOC();

            diagramFlowSeq.drawAllFlow();
            diagramFlowSeq.drawAllSeq();
            diagramFlowSeq.drawAllMermaid();

            if(window.MDAP)
                window.MDAP();
        //});
    }
	window.APMD = makeHtml;

    function getThemeCss(theme) {
        return chrome.extension.getURL('theme/' + theme + '.css');
    }

    function setTheme(theme) {
        var defaultThemes = ['Clearness', 'ClearnessDark', 'Github', 'TopMarks', 'YetAnotherGithub'];

        if($.inArray(theme, defaultThemes) != -1) {
            var link = $('#theme');
            $('#custom-theme').remove();
            if(!link.length) {
                var ss = document.createElement('link');
                ss.rel = 'stylesheet';
                ss.id = 'theme';
                //ss.media = "print";
                ss.href = getThemeCss(theme);
                document.head.appendChild(ss);
            } else {
                link.attr('href', getThemeCss(theme));
            }
        } else {
            var themePrefix = 'theme_',
                key = themePrefix + theme;
            //storage.get(key, function(items) {
				var items={};
                if(items[key]) {
                    $('#theme').remove();
                    var theme = $('#custom-theme');
                    if(!theme.length) {
                        var style = $('<style/>').attr('id', 'custom-theme')
                                        .html(items[key]);
                        $(document.head).append(style);
                    } else {
                        theme.html(items[key]);
                    }
                }
            //});
        }
    }

    function stopAutoReload() {
        clearInterval(interval);
    }

    function render() {
        mpp.ajax({
            url: location,
            cache: false,
            complete: function(response) {
                var contentType = response.contentType;
                if(contentType && (contentType.indexOf('html') > -1)) {
                    return;
                }

                previousText = document.body.innerText;
                makeHtml(document.body.innerText);
                var specialThemePrefix = 'special_',
                    pageKey = specialThemePrefix + location.href;
					
                //storage.get(['theme', pageKey], function(items) {
                //    theme = items.theme ? items.theme : 'Clearness';
                //    if(items[pageKey]) {
                //        theme = items[pageKey];
                //    }
                //    setTheme(theme);
                //});

                //storage.get('auto_reload', function(items) {
                //    if(items.auto_reload) {
                //        startAutoReload();
                //    }
                //});
            }
        });
    }

    //storage.get(['exclude_exts', 'disable_markdown', 'katex', 'html'], function(items) {
    //    if (items.disable_markdown) {
    //        return;
    //    }
	//
    //    if (items.katex) {
    //        var mjc = document.createElement('link');
    //        mjc.rel = 'stylesheet';
    //        mjc.href = chrome.extension.getURL('theme/katex.min.css');
    //        $(document.head).append(mjc);
    //    }
	//
    //    var allExtentions = ["md", "text", "markdown", "mdown", "txt", "mkd", "rst", "rmd"];
    //    var exts = items.exclude_exts;
    //    if(!exts) {
    //        render();
    //        return;
    //    }
	//
    //    var fileExt = getExtension(location.href);
    //    if (($.inArray(fileExt, allExtentions) != -1) &&
    //        (typeof exts[fileExt] == "undefined")) {
    //        render();
    //    }
    //});

    // {{{ Start of TOC code
    var vH1Tag = null, vH2Tag = null, vH3Tag = null,
        vH4Tag = null, vH5Tag = null, vH6Tag = null;

        
    var tbd = [];

    window.hc=function(e){
        if(!e.uc) {
            e.href='#'+tbd[parseInt(e.id)].id;
            e.uc=1;
        }
        return false;
    }

    function addTOC(){
        if($(".BlogAnchor").length == 0) {
            var clientheight = document.compatMode=="CSS1Compat"?document.documentElement.clientHeight : document.body.clientHeight;
            $("body").prepend('<div class="AnchorContent" id="AnchorContent"></div>');
            $("#AnchorContent").css('max-height', (clientheight - 160) + 'px');
        }
        
        var cs = document.body.childNodes;

        for(var i in cs){
            var cI = cs[i];
            if(cI.tagName && cI.tagName[0]=='H')
            {
                var tn=cI.tagName;
                if(tn.length==2 && tn[1]>='0'&&tn[1]<='9') {
                    console.log(cI);
                    tbd.push(cI);
                }
            }
        }

        //if(0)
        for(var i in tbd){
            var hI=tbd[i];
            var cn = 'item_h'+hI.tagName[1];
            $("#AnchorContent").append('<li><a id="'+i+'" class="nav_item '+cn+'" onclick=hc(this)>'+hI.innerText+'</a></li>');

        }

        if(0)
        $("body").find("h1,h2,h3,h4,h5,h6").each(function(i,item){
            var tag = $(item).get(0).tagName.toLowerCase();
            var className = '';

            if (tag == vH1Tag){
                id = name = ++vH1Index;
                name = id;
                vH2Index = 0;
                className = 'item_h1';
            } else if(tag == vH2Tag){
                id = vH1Index + '_' + ++vH2Index;
                name = vH1Index + '.' + vH2Index;
                vH3Index = 0;
                className = 'item_h2';
            } else if(tag == vH3Tag){
                id = vH1Index + '_' + vH2Index + '_' + ++vH3Index;
                name = vH1Index + '.' + vH2Index + '.' + vH3Index;
                vH4Index = 0;
                className = 'item_h3';
            } else if(tag == vH4Tag){
                id = vH1Index + '_' + vH2Index + '_' + vH3Index + '_' + ++vH4Index;
                name = vH1Index + '.' + vH2Index + '.' + vH3Index + '.' + vH4Index;
                className = 'item_h4';
            } else if(tag == vH5Tag){
                id = [vH1Index, vH2Index, vH3Index, vH4Index, ++vH5Index].join('_');
                name = [vH1Index, vH2Index, vH3Index, vH4Index, vH5Index].join('.');
                vH5Index = 0;
                className = 'item_h5';
            } else if(tag == vH6Tag){
                id = [vH1Index, vH2Index, vH3Index, vH4Index, vH5Index, ++vH6Index].join('_');
                name = [vH1Index, vH2Index, vH3Index, vH4Index, vH5Index, vH6Index].join('.');
                vH6Index = 0;
                className = 'item_h6';
            }

        });

        if(0)
        $(".anchor-link").click(function(){
            $(".BlogAnchor li .nav_item.current").removeClass('current');
            $(this).addClass('current');
            $("html,body").animate({scrollTop: $($(this).attr("link")).offset().top}, 100,
                function(){  });
        });
    }

    // }}} End of TOC code

}(document));